import { chromium } from 'playwright';

const password = 'PalingGayeng2026';
const playerCount = 6;
const rounds = 4;

const pages = [];

const login = async (name, role) => {
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:3001/');
  
  await page.fill('#password', password);
  await page.fill('#name', name);
  
  await page.click(`.role-pill[data-role="${role}"]`);
  
  await page.click('#submit-btn');
  await page.waitForNavigation({ waitUntil: 'networkidle' });
  
  return page;
};

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext();

const modPage = await login('Moderator', 'moderator');

for (let i = 1; i <= playerCount; i++) {
  const pPage = await login(`Player ${i}`, 'player');
  pages.push(pPage);
}

  await modPage.click('button:has-text("Buat Sesi")');
  await modPage.waitForSelector('[x-text="roomCode"]:not(:empty)');
  const roomCode = await modPage.textContent('[x-text="roomCode"]:not(:empty)');
console.log(`Room Code: ${roomCode}`);

  for (const p of pages) {
    await p.fill('input[x-model="roomCode"]', roomCode);
    await p.click('button:has-text("Masuk")');
  }

  for (let r = 1; r <= rounds; r++) {
    console.log(`Starting Round ${r}`);
    await modPage.click('button:has-text("Mulai Ronde")');

    await pages[0].waitForSelector('[x-text="fragmen || \'Menunggu moderator...\'"]', { timeout: 5000 });

    console.log('Waiting for fragment visibility to confirm round start.');
    
    const start = Date.now();
    const timeout = 1000 * 60;
    let timerSynced = false;

    while (Date.now() - start < timeout) {
        const t1 = await pages[0].textContent('.timer-num');
        const t2 = await pages[1].textContent('.timer-num');

        if (t1 === t2 && t1 !== "0:00") {
            timerSynced = true;
            console.log(`Timer synced: ${t1}`);
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (!timerSynced) {
        console.error(`Error: Timer did not sync for Round ${r}`);
    }

    await modPage.click('button:has-text("Mulai Diskusi")');
    
    await modPage.click('button:has-text("Mulai Voting")');

    const voteButton = await pages[0].waitForSelector('button:has-text("Vote")', { state: 'visible' });
    
    if (await voteButton.isEnabled()) {
        console.log('Vote button is enabled as expected.');
    } else {
        console.error('Error: Vote button is disabled.');
    }

    await pages[0].click('button:has-text("Vote")');

    await modPage.click('button:has-text("Buka Reveal")');
    
    console.log(`Round ${r} complete.`);
  }

console.log('Test run complete.');
await browser.close();
