import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('BROWSER ERROR CONSOLE:', msg.text());
  });
  page.on('pageerror', error => console.log('PAGE ERROR (UNCAUGHT EXCEPTION):', error.message));
  
  try {
    await page.goto('http://localhost:3002');
    await new Promise(r => setTimeout(r, 2000));
    
    // Choose date
    const dateInput = await page.$('.rdp-day:not(.rdp-day_disabled)');
    if (dateInput) {
       await dateInput.click();
       await new Promise(r => setTimeout(r, 1000));
    }

    // Try clicking comboboxes
    const selects = await page.$$('[role="combobox"]');
    for (const s of selects) {
      await s.click();
      await new Promise(r => setTimeout(r, 1000));
      const opts = await page.$$('[role="option"]');
      if (opts.length > 0) {
        await opts[0].click();
      }
      await new Promise(r => setTimeout(r, 1000));
    }

    // Click trash buttons
    const trash = await page.$$('button:has(svg.lucide-trash-2)');
    page.on('dialog', async d => await d.accept());
    for (const t of trash) {
      await t.click();
      await new Promise(r => setTimeout(r, 1000));
    }
    
    console.log('Script finished execution without unexpected termination.');
  } finally {
    await browser.close();
  }
})();
