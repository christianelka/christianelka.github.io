const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();

  const modPage = await context.newPage();
  await modPage.goto('http://localhost:3000/moderator');
  await modPage.fill('input[name="name"]', 'Mod');
  await modPage.click('button:has-text("Masuk")');

  const playerPage = await context.newPage();
  await playerPage.goto('http://localhost:3000/player');
  await playerPage.fill('input[name="name"]', 'Player 1');
  await playerPage.click('button:has-text("Masuk")');

  await modPage.click('button:has-text("Buat Sesi")');
  await modPage.waitForSelector('.room-code');

  const roomCode = await modPage.textContent('.room-code');
  await playerPage.fill('input[name="roomCode"]', roomCode);
  await playerPage.click('button:has-text("Join")');

  await modPage.click('button:has-text("Mulai Ronde 1")');

  await playerPage.waitForSelector('.game-view');

  console.log('Game started successfully');

  await browser.close();
})();
