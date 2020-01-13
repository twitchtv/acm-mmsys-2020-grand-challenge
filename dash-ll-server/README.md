A local server to generate and serve a low-latency DASH stream

### Usage
1. Start the server in a terminal with `bash run_server.sh`
2. In a separate terminal, start ffmpeg with `bash run_gen.sh`
3. The DASH manifest will be located at http://localhost:9001/live/live.mpd

- Run `bash clean.sh` to wipe out the media directory

### Requirements
- python3
- MacOS (if not using MacOS, please follow the instructions below to change the input source)

### Changing the input source
By default, `gen_live_ingest.sh` will use AVFoundation's screen capture source as the input to ffmpeg. However, this input won't work on other operating systems. You'll need to replace [this line](./gen_live_ingest/#L49) with whatever source is appropriate for your OS, listed [here](https://trac.ffmpeg.org/wiki/Capture/Desktop).


### Credits
All credit to FFLabs for the ffmpeg script and python server

- https://gitlab.com/fflabs/dash_server
- https://gitlab.com/fflabs/originjs/blob/master/extras/gen_live_ingest.sh