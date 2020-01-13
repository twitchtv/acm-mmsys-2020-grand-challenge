#!/bin/bash

SERVER="${1}"
PORT="${2}"
FF="${3}"
#TLS_KEY="/home/borgmann/dash/certs/ingest_client_thilo.key"
#TLS_CRT="/home/borgmann/dash/certs/ingest_client_thilo.crt"
#TLS_CA="/home/borgmann/dash/certs/ca.crt"
#TS_OUT="/home/borgmann/dash/ts"
INPUT="/dev/video0"
INPUT_FPS="24"
ID=live
VCODEC=h264_vaapi
VCODEC=libx264
COLOR=bt709

if [ "$SERVER" == "" -o "$PORT" == "" ]
then
    echo "Usage: $0 <SERVER> <PORT> [<FFMPEG>]"
    exit
else
    if [ "$FF" == "" ]
    then
        FF=ffmpeg
    fi

    if [ "${TLS_KEY}" != "" -a "${TLS_CRT}" != "" -a "${TLS_CA}" != "" ]
    then
        PROTO=https
        HTTP_OPTS="-http_opts key_file=${TLS_KEY},cert_file=${TLS_CRT},ca_file=${TLS_CA},tls_verify=1"
    else
        PROTO=http
        HTTP_OPTS=""
    fi

    echo "Ingesting to: ${PROTO}://${SERVER}:${PORT}/${ID}/${ID}.mpd"

    if [ "${TS_OUT}" != "" ]
    then
        TS_OUT_FILE="${TS_OUT}/${ID}.ts"
        TS_OUT_CMD="-map 0:v:0 -y ${TS_OUT_FILE}"
        echo "Storing input TS to: ${TS_OUT_FILE}"
    fi
fi

echo ${FF} -h all | grep ldash

${FF} \
-f avfoundation -i "1" -pix_fmt yuv420p -r 30 \
-c:v ${VCODEC} -b:v:0 500K -b:v:1 200K -s:v:0 960x400 -s:v:1 720x300 \
-map 0:v:0 -map 0:v:0 \
-use_timeline 0 \
-use_template 1 \
-frag_type every_frame \
-adaptation_sets "id=0,seg_duration=0.5,streams=0,1" \
-g:v 15 -keyint_min:v 15 -sc_threshold:v 0 -streaming 1 -ldash 1 -tune zerolatency \
-color_primaries ${COLOR} -color_trc ${COLOR} -colorspace ${COLOR} \
-f dash \
${HTTP_OPTS} \
${PROTO}://${SERVER}:${PORT}/${ID}/${ID}.mpd \
${TS_OUT_CMD}

#-re -i bbb_720_30.mp4 \ # Stream the mp4 as live
#-f avfoundation -i "0" -pix_fmt yuv420p -r 30 # Stream the webcam
