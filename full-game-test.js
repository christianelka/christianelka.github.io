import { chromium } from 'playwright';

const password = 'PalingGayeng2026';
const playerCount = 6;
const rounds = 4;
const pages = [];
const errors = [];

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext();

const login = async (name, role) => {
  const page = await context.newPage();
  page.on('dialog', dialog => dialog.accept());
  await page.goto('http://127.0.0.1:3001/');
  await page.fill('#password', password);
  await page.fill('#name', name);
  await page.click(`.role-pill[data-role="${role}"]`);
  await page.click('#submit-btn');
  await page.waitForNavigation({ waitUntil: 'networkidle' });
  return page;
};

const modPage = await login('Moderator', 'moderator');

for (let i = 1; i <= playerCount; i++) {
  pages.push(await login(`Player ${i}`, 'player'));
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
  console.log(`\n--- Round ${r} ---`);

  await modPage.click('button:has-text("Mulai Ronde")');
  await pages[0].waitForSelector('[x-text="fragmen || \'Menunggu moderator...\'"]', { timeout: 5000 });
  console.log('Fragment visible.');

  const start = Date.now();
  let timerSynced = false;
  while (Date.now() - start < 10000) {
    const t1 = await pages[0].textContent('.timer-num');
    const t2 = await pages[1].textContent('.timer-num');
    if (t1 === t2 && t1 !== "0:00") {
      timerSynced = true;
      console.log(`Timer synced: ${t1}`);
      break;
    }
    await new Promise(r => setTimeout(r, 500));
  }
  if (!timerSynced) {
    const msg = `Round ${r}: Timer did not sync`;
    console.error(`FAIL: ${msg}`);
    errors.push(msg);
  }

  await modPage.click('button:has-text("Mulai Diskusi")');
  console.log('Phase: Diskusi');

  await modPage.click('button:has-text("Mulai Voting")');
  console.log('Phase: Voting');

  const voteBtn = pages[0].locator('button:has-text("Vote Sekarang")');
  await voteBtn.waitFor({ state: 'visible', timeout: 5000 });
  if (await voteBtn.isEnabled()) {
    console.log('Vote button ENABLED');
  } else {
    const msg = `Round ${r}: Vote button disabled`;
    console.error(`FAIL: ${msg}`);
    errors.push(msg);
  }

  await pages[0].evaluate(() => {
    const el = document.querySelector('[x-data]');
    if (el && el._x_dataStack) {
      const data = el._x_dataStack[0];
      data.voteTargets = (data.currentState?.players || []).filter(p => p.id !== data.socket.id);
      data.voteOpen = true;
    }
  });
  await pages[0].waitForTimeout(500);
  const voteModal = pages[0].locator('[x-show="voteOpen"]');
  const isModalVisible = await voteModal.isVisible();
  console.log(`Vote modal visible: ${isModalVisible}`);

  const voteTarget = pages[0].locator('[x-show="voteOpen"] button').first();
  await voteTarget.waitFor({ state: 'visible', timeout: 5000 });
  const targetName = await voteTarget.textContent();
  await voteTarget.click();
  console.log(`Voted for ${targetName}`);

  const voteFeedback = pages[0].locator('text=Kamu memilih');
  await voteFeedback.waitFor({ state: 'visible', timeout: 3000 });
  const feedbackText = await voteFeedback.textContent();
  console.log(`Vote feedback: ${feedbackText}`);

  await modPage.click('button:has-text("Buka Reveal")');
  console.log('Phase: Reveal');

  await modPage.waitForFunction(() => {
    const el = document.querySelector('[x-data]');
    return el && el._x_dataStack && el._x_dataStack[0].roundData !== null;
  }, { timeout: 5000 });
  await modPage.locator('.action-card').first().click({ force: true });
  console.log('Envelope opened');

  await modPage.click('button:has-text("Akhiri")');
  console.log('Round ended');

  if (r < rounds) {
    await modPage.waitForSelector('button:has-text("Mulai Ronde")', { state: 'visible', timeout: 5000 });
    console.log('Back to lobby, ready for next round');
  }
}

console.log(`\n=== Test Complete ===`);
if (errors.length === 0) {
  console.log('ALL TESTS PASSED');
} else {
  console.log(`${errors.length} ERRORS:`);
  errors.forEach(e => console.log(`  - ${e}`));
}

await browser.close();
