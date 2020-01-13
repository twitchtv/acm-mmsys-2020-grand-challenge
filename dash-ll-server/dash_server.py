#!/usr/bin/python3

# Copyright 2019 Anton Khirnov <anton@fflabs.eu>
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of
# this software and associated documentation files (the "Software"), to deal in
# the Software without restriction, including without limitation the rights to
# use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
# the Software, and to permit persons to whom the Software is furnished to do so,
# subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
# FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
# COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
# IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
# CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


import argparse
import contextlib
import os
import os.path
from  http import HTTPStatus
import http.server as hs
import logging
import shutil
import socket
import sys
import threading

# monkey-patch in ThreadingHTTPServer for older python versions
if sys.version_info.minor < 7:
    import socketserver
    class ThreadingHTTPServer(socketserver.ThreadingMixIn, hs.HTTPServer):
        daemon_threads = True
    hs.ThreadingHTTPServer = ThreadingHTTPServer

class HTTPChunkedRequestReader:

    _stream = None
    _eof    = False

    _logger = None

    def __init__(self, stream, logger):
        self._stream = stream
        self._logger = logger

    def read(self):
        if self._eof:
            return bytes()

        l = self._stream.readline().decode('ascii', errors = 'replace')
        self._logger.debug('reading chunk: chunksize %s', l)

        try:
            chunk_size = int(l.split(';')[0], 16)
        except ValueError:
            raise IOError('Invalid chunksize line: %s' % l)
        if chunk_size < 0:
            raise IOError('Invalid negative chunksize: %d' % chunk_size)
        if chunk_size == 0:
            self._eof = True
            return bytes()

        data      = bytes()
        remainder = chunk_size
        while remainder > 0:
            read = self._stream.read(remainder)
            if len(read) == 0:
                raise IOError('Premature EOF')

            data      += read
            remainder -= len(read)

        term_line = self._stream.readline().decode('ascii', errors = 'replace')
        if term_line != '\r\n':
            raise IOError('Invalid chunk terminator: %s' % term_line)

        return data

class HTTPRequestReader:

    _stream    = None
    _remainder = 0
    _eof       = False

    def __init__(self, stream, request_size):
        self._stream    = stream
        self._remainder = request_size
        self._eof       = request_size == 0

    def read(self):
        if self._eof:
            return bytes()

        read = self._stream.read1(self._remainder)
        if len(read) == 0:
            raise IOError('Premature EOF')

        self._remainder -= len(read)
        self._eof        = self._remainder <= 0

        return read

class DataStream:

    _data      = None
    _data_cond = None
    _eof       = False

    def __init__(self):
        self._data      = []
        self._data_cond = threading.Condition()

    def close(self):
        with self._data_cond:
            self._eof = True
            self._data_cond.notify_all()

    def write(self, data):
        with self._data_cond:
            if len(data) == 0:
                self._eof = True
            else:
                if self._eof:
                    raise ValueError('Tried to write data after EOF')

                self._data.append(data)

            self._data_cond.notify_all()

    def read(self, chunk):
        with self._data_cond:
            while self._eof is False and chunk >= len(self._data):
                self._data_cond.wait()

            if chunk < len(self._data):
                return self._data[chunk]

            return bytes()

class StreamCache:

    _streams = None
    _lock    = None
    _logger  = None

    def __init__(self, logger):
        self._streams = {}
        self._lock    = threading.Lock()
        self._logger  = logger

    def __getitem__(self, key):
        self._logger.debug('reading from cache: %s', key)
        with self._lock:
            return self._streams[key]

    @contextlib.contextmanager
    def add_entry(self, key, val):
        # XXX handle key already present
        self._logger.debug('cache add: %s', key)
        try:
            with self._lock:
                self._streams[key] = val
            yield val
        finally:
            with self._lock:
                del self._streams[key]
            self._logger.debug('cache delete: %s', key)


class DashRequestHandler(hs.BaseHTTPRequestHandler):
    # required for chunked transfer
    protocol_version = "HTTP/1.1"

    _logger = None

    def __init__(self, *args, **kwargs):
        server = args[2]
        self._logger = server._logger.getChild('requesthandler')

        super().__init__(*args, **kwargs)

    def _decode_path(self, encoded_path):
        # FIXME implement unquoting
        return encoded_path

    def _serve_local(self, path):
        with open(path, 'rb') as infile:
            stat = os.fstat(infile.fileno())

            self.send_response(HTTPStatus.OK)
            self.send_header('Content-Length', str(stat.st_size))
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            shutil.copyfileobj(infile, self.wfile)

    def _log_request(self):
        self._logger.info('%s: %s', str(self.client_address), self.requestline)
        self._logger.debug('headers:\n%s', self.headers)

    def do_GET(self):
        self._log_request()

        local_path = self._decode_path(self.path)
        outpath = '%s/%s' % (self.server.serve_dir, local_path)
        try:
            ds = self.server._streams[local_path]
        except KeyError:
            if os.path.exists(outpath):
                self._logger.info('serve local: %s', local_path)
                return self._serve_local(outpath)
            else:
                self.send_error(HTTPStatus.NOT_FOUND)

            return

        self.send_response(HTTPStatus.OK)
        self.send_header('Transfer-Encoding', 'chunked')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

        chunk = 0
        while True:
            data = ds.read(chunk)
            if len(data) == 0:
                self.wfile.write(b'0\r\n\r\n')
                break

            chunk += 1

            self.wfile.write(hex(len(data))[2:].encode('ascii') + b'\r\n')
            self.wfile.write(data)
            self.wfile.write(b'\r\n')

    def do_POST(self):
        self._log_request()

        with contextlib.ExitStack() as stack:
            local_path = self._decode_path(self.path)

            ds = stack.enter_context(contextlib.closing(DataStream()))
            stack.enter_context(self.server._streams.add_entry(local_path, ds))

            if 'Transfer-Encoding' in self.headers:
                if self.headers['Transfer-Encoding'] != 'chunked':
                    return self.send_error(HTTPStatus.NOT_IMPLEMENTED,
                                            'Unsupported Transfer-Encoding: %s' %
                                            self.headers['Transfer-Encoding'])
                infile = HTTPChunkedRequestReader(self.rfile, self._logger.getChild('chreader'))
            elif 'Content-Length' in self.headers:
                infile = HTTPRequestReader(self.rfile, int(self.headers['Content-Length']))
            else:
                return self.send_error(HTTPStatus.BAD_REQUEST)

            outpath    = '%s%s' % (self.server.serve_dir, local_path)
            write_path = outpath + '.tmp'
            outfile    = stack.enter_context(open(write_path, 'wb'))
            while True:
                data = infile.read()

                ds.write(data)
                if len(data) == 0:
                    self._logger.debug('Finished reading')
                    break

                written = outfile.write(data)
                if written < len(data):
                    raise IOError('partial write: %d < %d' % (written, len(data)))

                self._logger.debug('streamed %d bytes', len(data))

            retcode = HTTPStatus.NO_CONTENT if os.path.exists(outpath) else HTTPStatus.CREATED
            os.replace(write_path, outpath)

        self.send_response(retcode)
        self.send_header('Content-Length', '0')
        self.end_headers()

    def do_PUT(self):
        return self.do_POST()

class DashServer(hs.ThreadingHTTPServer):

    serve_dir = None

    # files currently being uploaded, indexed by their URL
    # should only be accessed by the request instances spawned by this server
    _streams = None

    _logger  = None

    def __init__(self, address, force_v4, force_v6, serve_dir, logger):
        self.serve_dir     = serve_dir
        self._streams      = StreamCache(logger.getChild('streamcache'))
        self._logger       = logger

        family = None
        if force_v4:
            family = socket.AF_INET
        elif force_v6:
            family = socket.AF_INET6

        if family is None and len(address[0]):
            try:
                family, _, _, _, _ = socket.getaddrinfo(*address)[0]
            except IndexError:
                pass

        if family is None:
            family = socket.AF_INET6

        self.address_family = family

        super().__init__(address, DashRequestHandler)

def main(argv):
    parser = argparse.ArgumentParser('DASH server')

    parser.add_argument('-a', '--address', default = '')
    parser.add_argument('-p', '--port',    type = int, default = 8000)

    group = parser.add_mutually_exclusive_group()
    group.add_argument('-4', '--ipv4',    action = 'store_true')
    group.add_argument('-6', '--ipv6',    action = 'store_true')

    parser.add_argument('-l', '--loglevel', default = 'WARNING')

    parser.add_argument('directory')

    args = parser.parse_args(argv[1:])

    logging.basicConfig(stream = sys.stderr, level = args.loglevel)
    logger = logging.getLogger('DashServer')

    server = DashServer((args.address, args.port), args.ipv4, args.ipv6,
                        args.directory, logger)
    server.serve_forever()

if __name__ == '__main__':
    main(sys.argv)
