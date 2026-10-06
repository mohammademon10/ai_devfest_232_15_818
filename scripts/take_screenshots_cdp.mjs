import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const debugPort = 9222;

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('Launching Chrome with remote debugging...');
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${debugPort}`,
    '--headless=new',
    '--disable-gpu',
    '--window-size=1440,1150',
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:4173'
  ]);

  await sleep(2500);

  // Discover targets
  console.log('Fetching targets from /json...');
  const targetsRes = await fetch(`http://127.0.0.1:${debugPort}/json`);
  const targets = await targetsRes.json();
  const pageTarget = targets.find(t => t.type === 'page' || t.url.includes('localhost:4173'));

  if (!pageTarget || !pageTarget.webSocketDebuggerUrl) {
    throw new Error('No debugger WebSocket found: ' + JSON.stringify(targets));
  }

  console.log('Connecting to WebSocket:', pageTarget.webSocketDebuggerUrl);
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  let idCounter = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });

  function sendCommand(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evalJs(expr) {
    const res = await sendCommand('Runtime.evaluate', { expression: expr, awaitPromise: true });
    return res.result?.value;
  }

  async function saveScreenshot(fileName) {
    const res = await sendCommand('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const outPath = path.join(process.cwd(), 'screenshots', fileName);
    fs.writeFileSync(outPath, buffer);
    console.log(`Saved screenshot: ${outPath} (${buffer.length} bytes)`);
  }

  await sendCommand('Page.enable');
  await sendCommand('Runtime.enable');

  await sleep(1500);

  // 1. Initial State
  console.log('Capturing initial state...');
  await saveScreenshot('01_initial_status_blocking.png');

  // 2. Toggle Bangla
  console.log('Toggling language to Bangla...');
  await evalJs(`document.querySelector('[data-testid="lang-toggle-btn"]')?.click();`);
  await sleep(800);
  await saveScreenshot('02_bilingual_bangla_interface.png');

  // Switch back to English
  console.log('Toggling back to English...');
  await evalJs(`document.querySelector('[data-testid="lang-toggle-btn"]')?.click();`);
  await sleep(800);

  // 3. Click Load Sample Pack
  console.log('Clicking Load Sample Pack...');
  await evalJs(`document.querySelector('[data-testid="load-sample-pack-btn"]')?.click();`);
  await sleep(3500);
  await saveScreenshot('03_sample_pack_traps_detected.png');

  // 4. Click Auto-Match Files to resolve all requirements cleanly
  console.log('Clicking Auto-Match Files...');
  await evalJs(`document.querySelector('[data-testid="auto-match-btn"]')?.click();`);
  await sleep(1500);
  await saveScreenshot('04_all_verified_ok_package_ready.png');

  ws.close();
  chromeProc.kill();
  console.log('All screenshots captured successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
