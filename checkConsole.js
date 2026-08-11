import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  page.on('error', err => console.log('ERROR:', err.toString()));
  
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\b3ae98e5-d30c-4e55-a12f-9b586b441716\\puppeteer_screenshot.png' });
    console.log('Screenshot saved!');
  } catch(e) {
    console.error('Navigation error:', e);
  }
  
  await browser.close();
})();
