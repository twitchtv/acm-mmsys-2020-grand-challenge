# Assets for Twitch's ACM MMSys 2020 Grand Challenge

This repo contains assets for Twitch's ACM MMSys 2020 Grand Challenge, [Adaptation Algorithm for Near-Second Latency](https://2020.acmmmsys.org/lll_challenge.php). It contains everything you need to build and test low-latency ABR algorithms locally.

## What's in the Box

- A fork of [Dash.js v3.0.1](https://github.com/Dash-Industry-Forum/dash.js), modified to pre-request low-latency segments
- A low-latency [DASH server](https://gitlab.com/fflabs/dash_server), setup and configured for ease of use
- ffmpeg for MacOS built from the dashll branch (https://gitlab.com/fflabs/ffmpeg/tree/dashll) at commit 0fe5e13b9b76e7fac0c2dac1f4fdc8b37c007d13


#### Network Profiles

We're still working on network profiles to exercise our representative conditions, but the above assets will get you started until then.

## Requirements
- MacOS
    - If you're using another operating system, don't worry. You'll just have to build ffmpeg from source. See that README in dash-ll-server/ for instructions.
- python3

## How to use
- Install and start each project locally by following their enclosed README
   - The DASH server should be running and available at http://localhost:9001/live/live.mpd
   - Dash.js should be running
- Once each is running, navigate to http://localhost:3000/samples/low-latency/index.html to see the stream play out

To verify everything is working correctly, check that playback of Big Buck Bunny is functioning at the above link. The player should be able to stream smoothly configured down to 0.5s of latency.

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
