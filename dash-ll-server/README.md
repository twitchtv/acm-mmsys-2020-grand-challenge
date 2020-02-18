A local server to generate and serve a low-latency DASH stream

### Usage
1. Download the test stream located [here](http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_30fps_normal.mp4).
2. Move the test stream to this folder. Rename the stream to "bbb.mp4".
3. Start the server in a terminal with `bash run_server.sh`
4. In a separate terminal, start ffmpeg with `bash run_gen.sh`
5. The DASH manifest will be located at http://localhost:9001/live/live.mpd

If you're not using MacOS, please remove the included "ffmpeg" binary and follow the instructions for building ffmpeg from source below. Some builds for other operating systems have been included; if you find a match you can use it by renaming it to "ffmpeg".

### Requirements
- python3

### Included ffmpeg builds
- MacOS Mojave (10.14.6)
- Debian Bullseye
- Ubuntu 18.04

### Building ffmpeg
The included ffmpeg asset is built for MacOS. If you're on different OS, you'll need to replace that binary with one you build yourself. Pull down the "dashll" branch here https://gitlab.com/fflabs/ffmpeg/tree/dashll and follow this guide: https://trac.ffmpeg.org/wiki/CompilationGuide/Generic. Once finished, **copy and replace the included ffmpeg binary with your built one. It must have the same name (ffmeg)**. Please open an issue if you're having trouble getting this running.


### Credits
All credit to FFLabs for the ffmpeg script and python server

- https://gitlab.com/fflabs/dash_server
- https://gitlab.com/fflabs/originjs/blob/master/extras/gen_live_ingest.sh
