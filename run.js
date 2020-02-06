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
    defaultViewport: null
  });

  const page = await browser.newPage();
  await page.goto("http://localhost:3000/samples/low-latency/index.html");

  const cdpClient = await page.target().createCDPSession();

  console.log("Waiting 10 seconds to stabilize playback");

  const stabilized = await page.evaluate(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(player.getQualityFor("video") === 3);
      }, 10000);
    });
  });

  if (!stabilized) {
    console.error(
      "The player must be stable at the max rendition before emulation begins. Make sure you're on a stable connection of at least 3mbps, and try again."
    );
    return;
  }
  console.log("Player is stable, beginning network emulation");
  page.evaluate(() => {
    window.startRecording();
  });

  /*
    Encoding ladder
    -b:v:0 230K -s:v:0 284x160 \
    -b:v:1 630K -s:v:1 640x360 \
    -b:v:2 1461K -s:v:2 852x480 \
    -b:v:3 2406K -s:v:3 1280x720 \
    */

  await runNetworkPattern(cdpClient, [
    {
      speed: 2,
      duration: 10
    },
    {
      speed: 1,
      duration: 10
    },
    {
      speed: 0.5,
      duration: 10
    },
    {
      speed: 1,
      duration: 10
    },
    {
      speed: 2,
      duration: 10
    },
    {
      speed: 3,
      duration: 10
    }
  ]);
  const result = await page.evaluate(() => {
    return {
      endVideoTime: document.querySelector("video").currentTime,
      abrHistory: window.abrHistory
    };
  });
  console.log("Run complete");
  console.log(result);
}

async function runNetworkPattern(client, pattern) {
  for await (const profile of pattern) {
    console.log(
      `Setting network speed to ${profile.speed}mbps for ${profile.duration} seconds`
    );
    setNetworkSpeedInMbps(client, profile.speed);
    await new Promise(resolve => setTimeout(resolve, profile.duration * 1000));
  }
}

function setNetworkSpeedInMbps(client, mbps) {
  client.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 0,
    uploadThroughput: (mbps * 1024 * 1024) / 8,
    downloadThroughput: (mbps * 1024 * 1024) / 8
  });
}