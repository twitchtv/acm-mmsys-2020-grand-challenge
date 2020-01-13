# acm-grand-challenge-2020

This repo contains assets for Twitch's 2020 ACM Grand Challenge, [Adaptation Algorithm for Near-Second Latency](https://2020.acmmmsys.org/lll_challenge.php). It contains everything you need to build and test low-latency ABR algorithms locally.

## What's in the Box

- A fork of [Dash.js v3.0.1](https://github.com/Dash-Industry-Forum/dash.js), modified to pre-request low-latency segments
- A low-latency [DASH server](https://gitlab.com/fflabs/dash_server), setup and configured for ease of use

## Requirements
- MacOS
    - If you're using another operating system, don't worry. All you need to change is the input source for the local dash server. See that README on what to change.
- python3

## How to use
- Install and start each project locally by following their enclosed README
- Once each is running, navigate to http://localhost:3000/samples/low-latency/index.html to see the stream play out

### Important links
- Local Dash.js low-latency page: http://localhost:3000/samples/low-latency/index.html
- Local stream URL http://localhost:9001/live/live.mpd

### Kudos
Big thanks to Will Law, the Dash.js team, and the video-dev slack for their help in setting up this low-latency development environment. Kudos to FFLabs for creating the dash server and ffmpeg script.