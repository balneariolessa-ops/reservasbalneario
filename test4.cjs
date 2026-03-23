const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:3002');
  await new Promise(r => setTimeout(r, 2000));
  console.log('Page loaded!');
  
  const trashBtns = await page.$$('button:has(svg.lucide-trash-2)');
  if (trashBtns.length > 0) {
      console.log('Clicking trash button:', trashBtns.length);
      
      // Override confirm
      page.on('dialog', async dialog => {
          console.log('Dialog:', dialog.message());
          await dialog.accept();
      });
      
      await trashBtns[0].click();
      await new Promise(r => setTimeout(r, 2000));
  } else {
      console.log('No trash buttons found on main page');
  }
  
  await browser.close();
})();
