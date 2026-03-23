import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  let whiteScreen = false;
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('BROWSER ERROR:', msg.text());
  });
  page.on('pageerror', error => {
      console.log('PAGE ERROR:', error.message);
      whiteScreen = true;
  });
  
  try {
    // Go to admin
    await page.goto('http://localhost:3002/admin');
    await new Promise(r => setTimeout(r, 2000));
    
    // Login
    const passwordInput = await page.$('input[type="password"]');
    if (passwordInput) {
        await passwordInput.type('admin123'); // Assume this is the password
        await page.click('button:has-text("Entrar")');
        await new Promise(r => setTimeout(r, 2000));
    }
    
    // Click Edit and change payment
    const editBtns = await page.$$('button:has(svg.lucide-pencil)');
    if (editBtns.length > 0) {
        console.log('Editing...');
        await editBtns[0].click();
        await new Promise(r => setTimeout(r, 1000));
        
        // Select payment
        const selects = await page.$$('[role="combobox"]');
        if (selects.length > 0) {
            await selects[0].click(); // payment is one of them
            await new Promise(r => setTimeout(r, 1000));
            const opts = await page.$$('[role="option"]');
            if (opts.length > 0) await opts[0].click();
            await new Promise(r => setTimeout(r, 1000));
        }
        
        // Save
        const saveBtns = await page.$$('button:has(svg.lucide-check)');
        if (saveBtns.length > 0) await saveBtns[0].click();
        await new Promise(r => setTimeout(r, 2000));
    } else {
        console.log('No edit buttons found.');
    }
    
    // Try to delete
    const delBtns = await page.$$('button:has(svg.lucide-trash-2)');
    if (delBtns.length > 0) {
        console.log('Deleting...');
        await delBtns[0].click();
        await new Promise(r => setTimeout(r, 1000));
        
        const confirmBtn = await page.$('button:has-text("Sim, Excluir Reserva")');
        if (confirmBtn) await confirmBtn.click();
        await new Promise(r => setTimeout(r, 2000));
    } else {
        console.log('No delete buttons found.');
    }
    
    if (whiteScreen) {
        console.log('Detected a React crash!');
    } else {
        console.log('No React crash detected in Admin script.');
    }
    
  } finally {
    await browser.close();
  }
})();
