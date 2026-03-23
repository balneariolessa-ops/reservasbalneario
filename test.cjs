const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:3002');
  await page.waitForSelector('text=Nova Reserva');
  console.log('Page loaded!');
  
  await page.click('button:has-text("Selecione")');
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Clicked Select! Going to click on first Select item...');
  const items = await page.$$('[role="option"]');
  if (items.length > 0) {
      await items[0].click();
      console.log('Clicked option!');
  }
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
