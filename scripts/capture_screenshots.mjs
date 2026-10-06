import puppeteer from 'puppeteer-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1200 });

  console.log('Navigating to app...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });

  // 1. Initial State (Missing documents, blocked generation)
  console.log('Capturing 01_initial_status_blocking.png...');
  await page.screenshot({ path: 'screenshots/01_initial_status_blocking.png', fullPage: true });

  // 2. Bangla Language Mode
  console.log('Switching to Bangla...');
  const langBtn = await page.waitForSelector('button:has-text("বাংলা")', { timeout: 5000 });
  await langBtn.click();
  await new Promise(r => setTimeout(r, 600));
  console.log('Capturing 02_bilingual_bangla_interface.png...');
  await page.screenshot({ path: 'screenshots/02_bilingual_bangla_interface.png', fullPage: true });

  // Switch back to English
  const enBtn = await page.waitForSelector('button:has-text("English")', { timeout: 5000 });
  await enBtn.click();
  await new Promise(r => setTimeout(r, 600));

  // 3. Load Sample Pack (Traps triggered: Rejection of PNG, duplicate detection, etc.)
  console.log('Clicking Load Sample Pack...');
  const loadSampleBtn = await page.waitForSelector('button:has-text("Load Sample Pack")', { timeout: 5000 });
  await loadSampleBtn.click();
  await new Promise(r => setTimeout(r, 2000));
  console.log('Capturing 03_sample_pack_traps_detected.png...');
  await page.screenshot({ path: 'screenshots/03_sample_pack_traps_detected.png', fullPage: true });

  // 4. Auto Match Files to solve all requirements cleanly
  console.log('Clicking Auto-Match Files...');
  const autoMatchBtn = await page.waitForSelector('button:has-text("Auto-Match Files")', { timeout: 5000 });
  await autoMatchBtn.click();
  await new Promise(r => setTimeout(r, 1200));
  console.log('Capturing 04_all_verified_ok_package_ready.png...');
  await page.screenshot({ path: 'screenshots/04_all_verified_ok_package_ready.png', fullPage: true });

  await browser.close();
  console.log('All screenshots captured successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
