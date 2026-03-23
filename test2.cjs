const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:3002');
  await new Promise(r => setTimeout(r, 2000));
  console.log('Page loaded!');
  
  const btns = await page.$$('button');
  for (const b of btns) {
      const text = await b.evaluate(node => node.innerText);
      if (text && (text.includes('Selecione') || text.includes('Trilha'))) {
          console.log('Clicking button containing text:', text);
          await b.click();
          await new Promise(r => setTimeout(r, 1000));
      }
  }

  // Also try clicking delete buttons (trash icon buttons)
  const trashBtns = await page.$$('button:has(svg.lucide-trash-2)');
  for (const b of trashBtns) {
      console.log('Clicking trash button');
      await b.click();
      await new Promise(r => setTimeout(r, 500));
      
      const confirmOk = await page.$('text="Sim, Excluir Reserva"');
      if (confirmOk) await confirmOk.click();
  }
  
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
