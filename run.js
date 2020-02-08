const puppeteer = require("puppeteer-core");
const CHROME_PATH =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

run()
  .then(() => console.log("Done"))
  .catch(error => console.log(error));

async function run() {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: CHROME_PATH,
    defaultViewport: null,
    devtools: true,
  });

  const page = await browser.newPage();
  await page.goto("http://localhost:3000/samples/low-latency/index.html");

  const cdpClient = await page.target().createCDPSession();

  await page.evaluate(() => {
    return new Promise(resolve => {
      if (player.isReady()) {
        resolve();
      } else {
        player.on(dashjs.MediaPlayer.events.PLAYBACK_INITIALIZED, (e) => {
          resolve();
      });
      }
    });
  });

  console.log("Waiting for 10 seconds of uninterrupted max-quality playback before starting.");

  const stabilized = await awaitStabilization(page);

  if (!stabilized) {
    console.error(
      "Timed out after 30 seconds. The player must be stable at the max rendition before emulation begins. Make sure you're on a stable connection of at least 3mbps, and try again."
    );
    return;
  }
  console.log("Player is stable at the max quality, beginning network emulation");
  page.evaluate(() => {
    window.startRecording();
  });

  /*
    Encoding ladder
  -b:v:1 200K -s:v:1 640x360 \
  -b:v:2 600K -s:v:2 852x480 \
  -b:v:3 1000K -s:v:3 1280x720 \
    */

  await runNetworkPattern(cdpClient, [
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
      speed: 1000,
      duration: 30
    },
  ]);

  const result = await page.evaluate(() => {
    window.stopRecording();
    return {
      endVideoTime: document.querySelector("video").currentTime,
      abrHistory: window.abrHistory
    };
  });
  console.log("Run complete");
  console.log(result);
}

async function awaitStabilization (page) {
  return await page.evaluate(() => {
    return new Promise(resolve => {
      const maxQuality = player.getBitrateInfoListFor("video").length - 1;
      let timer = -1;

      const failTimer = setTimeout(() => {
        resolve(false);
      }, 30000)

      if (player.getQualityFor("video") === maxQuality) {
        timer = setTimeout(() => {
          clearTimeout(failTimer);
          resolve(true);
        }, 10000);
      }

      player.on(dashjs.MediaPlayer.events.QUALITY_CHANGE_REQUESTED, e => {
        console.warn("Quality changed requested", e);
        if (e.newQuality !== maxQuality) {
          console.log('Clearing timer...', e.newQuality, maxQuality)
          clearTimeout(timer);
          timer = -1;
        } else if (timer === -1) {
          console.log('Starting timer...')
          timer = setTimeout(() => {
            clearTimeout(failTimer);
            resolve(true);
          }, 10000);
        }
      });
    });
  });
}

async function runNetworkPattern(client, pattern) {
  for await (const profile of pattern) {
    console.log(
      `Setting network speed to ${profile.speed}kbps for ${profile.duration} seconds`
    );
    setNetworkSpeedInMbps(client, profile.speed);
    await new Promise(resolve => setTimeout(resolve, profile.duration * 1000));
  }
}

function setNetworkSpeedInMbps(client, mbps) {
  client.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 0,
    uploadThroughput: (mbps * 1024) / 8,
    downloadThroughput: (mbps * 1024) / 8
  });
}
