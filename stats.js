function computeAverageBitrate(switchHistory) {
    const bitratesPlayed = {};
    let totalDuration = 0;
    let average = 0;
    switchHistory.forEach(s => {
      const { start, end, quality: { bitrate } } = s;
      const durationPlayed = end - start;
      const prevTotal = totalDuration;
      totalDuration += durationPlayed;
      average = ((average * (prevTotal / totalDuration) + (bitrate * (durationPlayed / totalDuration))));
    });

    return average;
}

module.exports = { computeAverageBitrate };




  const data = {
    "switchHistory": [
      {
        "start": 16.238865,
        "end": 17.67047,
        "quality": {
          "mediaType": "video",
          "bitrate": 1000000,
          "width": 1280,
          "height": 720,
          "scanType": null,
          "qualityIndex": 2
        }
      },
      {
        "start": 17.67047,
        "end": 41.155665,
        "quality": {
          "mediaType": "video",
          "bitrate": 200000,
          "width": 640,
          "height": 360,
          "scanType": null,
          "qualityIndex": 0
        }
      }
    ],
    "stallDuration": 7306.010000029346,
    "avgLatency": 1.0841599999999998,
    "avgBufferLength": 0.49329600000000023
  }

  const testData = [
      {
          start: 0,
          end: 10,
          quality: {
              bitrate: 100
          }
      },
      {
        start: 10,
        end: 20,
        quality: {
            bitrate: 200
        }
      },
      {
        start: 20,
        end: 30,
        quality: {
            bitrate: 100
        }
    },
  ]


//   console.log(computeAverageBitrate(testData));