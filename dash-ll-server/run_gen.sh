#!/bin/bash
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parent_path"

bash ./gen_live_ingest.sh localhost 9001 ./ffmpeg ${1}