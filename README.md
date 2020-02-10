If you have any questions, or would like help setting up the test env, please file an issue or reach out to 2020-lll-challenge@acmmmsys.org

# Assets for Twitch's ACM MMSys 2020 Grand Challenge

This repo contains assets for Twitch's ACM MMSys 2020 Grand Challenge, [Adaptation Algorithm for Near-Second Latency](https://2020.acmmmsys.org/lll_challenge.php). It contains everything you need to build and test low-latency ABR algorithms locally.

## What's in the Box

- A fork of [Dash.js v3.0.1](https://github.com/Dash-Industry-Forum/dash.js), modified to pre-request low-latency segments
- A low-latency [DASH server](https://gitlab.com/fflabs/dash_server), setup and configured for ease of use
- ffmpeg for MacOS built from the dashll branch (https://gitlab.com/fflabs/ffmpeg/tree/dashll) at commit 0fe5e13b9b76e7fac0c2dac1f4fdc8b37c007d13


## Requirements
- MacOS
    - If you're using another operating system, don't worry. You'll just have to build ffmpeg from source. See that README in dash-ll-server/ for instructions.
- python3
- node.js v12+


## How to use

- Install each project locally by following their enclosed README
- Start Dash.js by running `grunt dev` in the `dash.js` folder
- In a separate terminal window, start the ingest server by running `bash run_server.sh` in the `dash-ll-server` folder

From here you have a few options:
#### Executing test runs
This option should be used for validating your solution against our network patterns.

- Execute the following command: `npm run test`
    - If your computer isn't fast enough (see the "Help!" section below), try running the fast profile: `env PROFILE=PROFILE_FAST npm run test`

Note: The python server (`bash run_server.sh` step above) and the dash server (`grunt dev` step above) must be running to execute these tests!

This will kick off an automated test, during which network conditions will be emulated. At the end of the run the statistics will be logged. We'll be adding new test runs throughout the challenge.

#### Local development
This option should be used for developing a solution.

- In a new terminal, naviagte into the `dash-ll-server` folder
- Execute `bash run_gen.sh`
- The DASH server should be running and available at http://localhost:9001/live/live.mpd
    - If your computer isn't fast enough to run the default profile, try `bash run_gen.sh PROFILE_FAST`
    - Note! If you've reached the end of the stream (~10 minutes), you'll have to restart `run_gen.sh`
- Once each is running, navigate to http://localhost:3000/samples/low-latency/index.html to see the stream play out

To verify everything is working correctly, check that playback of Big Buck Bunny is functioning at the above link. The player should be able to stream smoothly configured down to 0.5s of latency

#### Local Network Emulation
See https://developers.google.com/web/tools/chrome-devtools/network#throttle on how to simulate network conditions in Chrome. This will be useful for testing your work.

### Network Profiles
- There are currently two network profiles available, one for the `PROFILE_FAST` environment and one for `PROFILE_NORMAL`.

## Help! Things aren't working
Below is a compilation of common issues & how to fix them. If you don't see your problem here, please file an issue and we'll do our best to help.

```
Access to fetch at 'http://localhost:9001/live/chunk-stream2-00167.m4s' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.
```

If you see an error like this, it means that ffmpeg is struggling to encode quickly enough. Try the following:
- Allow ffmpeg to warm up for a few seconds. You can monitor the speed by checking the logs of `run_gen.sh`:
`frame=  202 fps= 28 q=30.0 q=25.0 q=26.0 size=N/A time=00:00:06.70 bitrate=N/A dup=6 drop=0 speed=0.943x`
Wait until the speed is above .9 before attempting to test.
- Close other programs to reduce the CPU load
- Run this setup on a faster computer
- If you're still having the above issue, please open an issue.
- Try running with the `PROFILE_FAST` option. See the "How to use" section above for more instruction.


## Important Notes

For the purpose of this challenge, the following cannot be changed:

- The segment duration
- The segment chunk size
- The prerequest behavior

If you'd like to discuss changing any of the above, please open an issue.

### Important links
- Local Dash.js low-latency page: http://localhost:3000/samples/low-latency/index.html
- Local stream URL http://localhost:9001/live/live.mpd


### Kudos
Big thanks to Will Law, the Dash.js team, and the video-dev slack for their help in setting up this low-latency development environment. Kudos to FFLabs for creating the dash server and ffmpeg script.
