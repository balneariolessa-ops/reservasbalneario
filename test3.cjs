const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:3002');
  await new Promise(r => setTimeout(r, 2000));
  console.log('Page loaded!');
  
  // Click all select triggers
  const triggers = await page.$$('[role="combobox"]');
  for (const t of triggers) {
      console.log('Clicking combobox');
      await t.click();
      await new Promise(r => setTimeout(r, 1000));
      
      const options = await page.$$('[role="option"]');
      if (options.length > 0) {
          console.log('Clicking option');
          await options[1].click();
      }
      await new Promise(r => setTimeout(r, 1000));
  }
  
  await browser.close();
})();
