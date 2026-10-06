import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const debugPort = 9222;

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${debugPort}`,
    '--headless=new',
    '--disable-gpu',
    '--window-size=1440,1150',
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:4173'
  ]);

  await sleep(2000);

  const targetsRes = await fetch(`http://127.0.0.1:${debugPort}/json`);
  const targets = await targetsRes.json();
  const pageTarget = targets.find(t => t.type === 'page' || t.url.includes('localhost:4173'));

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

  await new Promise(res => { ws.onopen = res; });

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

  await sleep(1000);

  // Load sample pack and auto match
  await evalJs(`document.querySelector('[data-testid="load-sample-pack-btn"]')?.click();`);
  await sleep(2500);
  await evalJs(`document.querySelector('[data-testid="auto-match-btn"]')?.click();`);
  await sleep(1500);

  // Scroll down to show table & generator
  await evalJs(`window.scrollTo(0, 520);`);
  await sleep(600);
  await saveScreenshot('04_checklist_table_and_generator_ready.png');

  ws.close();
  chromeProc.kill();
}

main().catch(console.error);
