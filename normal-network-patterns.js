// This profile represents smooth, long-term changes which lie comfortably between renditions.
const PROFILE_CASCADE = [
    {
      speed: 1200,
      duration: 30
    },
    {
      speed: 800,
      duration: 30
    },
    {
      speed: 400,
      duration: 30
    },
    {
      speed: 800,
      duration: 30
    },
    {
      speed: 1200,
      duration: 30
    },
  ];

  // This profile represents a network cascade where there is an intermediate step between renditions
  const PROFILE_INTRA_CASCADE = [
    {
      speed: 1000,
      duration: 15,
    },
    {
      speed: 800,
      duration: 15,
    },
    {
      speed: 600,
      duration: 15,
    },
    {
      speed: 400,
      duration: 15,
    },
    {
      speed: 200,
      duration: 15,
    },
    {
      speed: 400,
      duration: 15,
    },
    {
      speed: 600,
      duration: 15,
    },
    {
      speed: 800,
      duration: 15,
    },
    {
      speed: 1000,
      duration: 15,
    },
];


// This profile represents a sharp downward and upward spike in bandwidth
const PROFILE_SPIKE = [
  {
    speed: 1200,
    duration: 10
  },
  {
    speed: 300,
    duration: 10
  },
  {
    speed: 800,
    duration: 10
  },
];

// This profile represents a jittery network, whose jitter durations are much longer than the average buffer length
const PROFILE_SLOW_JITTERS = [
  {
    speed: 500,
    duration: 5,
  },
  {
    speed: 1200,
    duration: 5,
  },
  {
    speed: 500,
    duration: 5,
  },
  {
    speed: 1200,
    duration: 5,
  },
  {
    speed: 500,
    duration: 5,
  },
  {
    speed: 1200,
    duration: 5,
  },
];

// This profile represents a jittery network, whose jitter durations should be less than the average buffer length
const PROFILE_FAST_JITTERS = [
  {
    speed: 500,
    duration: 0.250,
  },
  {
    speed: 1200,
    duration: 5,
  },
  {
    speed: 500,
    duration: 0.1,
  },
  {
    speed: 1200,
    duration: 1,
  },
  {
    speed: 500,
    duration: 0.250,
  },
  {
    speed: 1200,
    duration: 5,
  },
];

// Profiles for the PROFILE_NORMAL ffmpeg transcode
module.exports = { PROFILE_CASCADE, PROFILE_INTRA_CASCADE, PROFILE_SPIKE, PROFILE_SLOW_JITTERS, PROFILE_FAST_JITTERS };