#!/bin/bash
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parent_path"

bash clean.sh && python3 dash_server.py -l 'DEBUG' -p 9001 media