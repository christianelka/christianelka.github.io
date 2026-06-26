const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:8080/surat-terakhir-codenames/';

// Helper: wait for Alpine to finish compiling
async function waitForAlpine(page) {
  await page.waitForFunction(() => {
    const el = document.querySelector('[x-data]');
    if (!el) return false;
    // Alpine v3 stores data on _x_dataStack
    const stack = el._x_dataStack;
    return !!(stack && stack[0] && stack[0].phase);
  }, { timeout: 10000 });
}

// Helper: get game state from Alpine (v3 API)
async function getGameState(page) {
  return await page.evaluate(() => {
    const el = document.querySelector('[x-data]');
    if (!el || !el._x_dataStack) return null;
    return el._x_dataStack[0];
  });
}

// Helper: run full setup flow (4 players) → game phase
async function setupGame(page, opts = {}) {
  const playerCount = opts.playerCount || 4;
  await page.goto(BASE);
  await page.waitForLoadState('networkidle');
  await waitForAlpine(page);
  await page.waitForTimeout(500);

  // Phase: setup → click "LANJUTKAN" (setup button, NOT resume)
  const lanjutkanBtn = page.locator('button:has-text("LANJUTKAN")').last();
  await expect(lanjutkanBtn).toBeVisible({ timeout: 5000 });
  await lanjutkanBtn.click();
  await page.waitForTimeout(300);

  // Phase: names → input player names
  const names = ['Alice', 'Bob', 'Charlie', 'Diana'].slice(0, playerCount);
  for (const name of names) {
    const input = page.locator('input[placeholder="Nama pemain"]').first();
    await expect(input).toBeVisible({ timeout: 3000 });
    await input.fill(name);
    // Click the add button (has a + icon, no visible text)
    const addBtn = page.locator('button').filter({ has: page.locator('svg path[d="M12 5v14M5 12h14"]') });
    await addBtn.click();
    await page.waitForTimeout(150);
  }

  // Click "LANJUT KE VOTING"
  const votingBtn = page.locator('button:has-text("LANJUT KE VOTING")');
  await expect(votingBtn).toBeVisible({ timeout: 3000 });
  await votingBtn.click();
  await page.waitForTimeout(300);

  // Phase: voting → each player picks captains
  for (let i = 0; i < playerCount; i++) {
    const select1 = page.locator('select').nth(0);
    const select2 = page.locator('select').nth(1);
    await expect(select1).toBeVisible({ timeout: 3000 });

    // Pick first 2 available names
    const options1 = await select1.locator('option:not([value=""])').allTextContents();
    if (options1.length >= 1) {
      await select1.selectOption(options1[0]);
    }
    await page.waitForTimeout(50);

    const options2 = await select2.locator('option:not([value=""])').allTextContents();
    if (options2.length >= 1) {
      await select2.selectOption(options2[0]);
    }

    // Submit vote
    await page.locator('button:has-text("SUBMIT VOTE")').click();
    await page.waitForTimeout(200);
  }

  await page.waitForTimeout(300);
  await page.waitForLoadState('networkidle');

  // Phase: teams → click "MULAI GAME"
  const mulaiGame = page.locator('button:has-text("MULAI GAME")');
  if (await mulaiGame.isVisible({ timeout: 3000 }).catch(() => false)) {
    await mulaiGame.click();
    await page.waitForTimeout(500);
    await waitForAlpine(page);
  }

  return { names };
}

// ========================================================
// TEST 1: Page loads with setup screen
// ========================================================
test('Page loads with setup screen', async ({ page }) => {
  await page.goto(BASE);
  await page.waitForLoadState('networkidle');
  await waitForAlpine(page);

  // Title in the header (always visible after Alpine compiles)
  await expect(page.locator('header')).toContainText('Bible Codenames');

  // The setup panel should be visible — has "SETUP GAME" label
  await expect(page.locator('text=SETUP GAME').first()).toBeVisible({ timeout: 5000 });
});

// ========================================================
// TEST 2: Player name input flow
// ========================================================
test('Player name input flow', async ({ page }) => {
  await page.goto(BASE);
  await page.waitForLoadState('networkidle');
  await waitForAlpine(page);
  await page.waitForTimeout(300);

  // Click "LANJUTKAN" button
  await page.locator('button:has-text("LANJUTKAN")').last().click();
  await page.waitForTimeout(300);

  // Check input appears
  const input = page.locator('input[placeholder="Nama pemain"]').first();
  await expect(input).toBeVisible({ timeout: 5000 });

  // Add players
  for (const name of ['Alice', 'Bob', 'Charlie', 'Diana']) {
    const inp = page.locator('input[placeholder="Nama pemain"]').first();
    await inp.fill(name);
    await inp.press('Enter');
    await page.waitForTimeout(150);
  }

  // Should see voting button
  await expect(page.locator('button:has-text("LANJUT KE VOTING")')).toBeVisible({ timeout: 3000 });
});

// ========================================================
// TEST 3: Full game setup → game phase with 5x5 grid
// ========================================================
test('Full setup leads to game phase with 5x5 grid', async ({ page }) => {
  await setupGame(page);

  // Should be in game phase — look for the 5-column grid
  const grid = page.locator('.grid.grid-cols-5');
  await expect(grid).toBeVisible({ timeout: 5000 });

  // Should have exactly 25 word cards
  const cards = await grid.locator(':scope > div').count();
  expect(cards).toBe(25);
});

// ========================================================
// TEST 4: Two separate grids — no opponent words
// ========================================================
test('Two separate grids — Team A has only red/neutral/assassin, Team B has only blue/neutral/assassin', async ({ page }) => {
  await setupGame(page);

  const gridColors = await page.evaluate(() => {
    const el = document.querySelector('[x-data]');
    if (!el || !el._x_dataStack[0]) return null;
    const data = el._x_dataStack[0];
    const gridA = data.gridA || [];
    const gridB = data.gridB || [];
    return {
      gridALength: gridA.length,
      gridBLength: gridB.length,
      gridAColors: gridA.map(c => c.color),
      gridBColors: gridB.map(c => c.color),
      currentGrid: data.grid ? data.grid.length : 0,
      currentTeam: data.currentTeam
    };
  });

  expect(gridColors).not.toBeNull();
  expect(gridColors.gridALength).toBe(25);
  expect(gridColors.gridBLength).toBe(25);

  // Grid A should have NO blue
  expect(gridColors.gridAColors.filter(c => c === 'blue').length).toBe(0);
  // Grid A should have 15 red, 8 neutral, 2 assassin
  expect(gridColors.gridAColors.filter(c => c === 'red').length).toBe(15);
  expect(gridColors.gridAColors.filter(c => c === 'neutral').length).toBe(8);
  expect(gridColors.gridAColors.filter(c => c === 'assassin').length).toBe(2);

  // Grid B should have NO red
  expect(gridColors.gridBColors.filter(c => c === 'red').length).toBe(0);
  // Grid B should have 15 blue, 8 neutral, 2 assassin
  expect(gridColors.gridBColors.filter(c => c === 'blue').length).toBe(15);
  expect(gridColors.gridBColors.filter(c => c === 'neutral').length).toBe(8);
  expect(gridColors.gridBColors.filter(c => c === 'assassin').length).toBe(2);
});

// ========================================================
// TEST 5: switchTeam() swaps the grid
// ========================================================
test('switchTeam swaps grid from gridA to gridB', async ({ page }) => {
  await setupGame(page);

  // Current team should be 'A', grid should be gridA
  let state = await page.evaluate(() => {
    const el = document.querySelector('[x-data]');
    const data = el._x_dataStack[0];
    return {
      team: data.currentTeam,
      gridLength: data.grid.length
    };
  });
  expect(state.team).toBe('A');

  // Click PASS to trigger switchTeam
  const passBtn = page.locator('button:has-text("PASS")').first();
  if (await passBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await passBtn.click();
    await page.waitForTimeout(500);
  }

  // Now should be team B with gridB
  state = await page.evaluate(() => {
    const el = document.querySelector('[x-data]');
    const data = el._x_dataStack[0];
    return {
      team: data.currentTeam,
      currentGridColors: data.grid.map(c => c.color),
      gridALength: data.gridA.length,
      gridBLength: data.gridB.length
    };
  });
  expect(state.team).toBe('B');
  // Team B's grid should have blue words (not red)
  expect(state.currentGridColors.filter(c => c === 'red').length).toBe(0);
  expect(state.currentGridColors.filter(c => c === 'blue').length).toBe(15);
});

// ========================================================
// TEST 6: 50 unique words across both grids
// ========================================================
test('50 unique words across both grids', async ({ page }) => {
  await setupGame(page);

  const words = await page.evaluate(() => {
    const el = document.querySelector('[x-data]');
    const data = el._x_dataStack[0];
    const gridAWords = data.gridA.map(c => c.word);
    const gridBWords = data.gridB.map(c => c.word);
    const all = [...gridAWords, ...gridBWords];
    const unique = new Set(all);
    return { total: all.length, unique: unique.size, duplicates: all.length - unique.size };
  });

  expect(words.total).toBe(50);
  expect(words.unique).toBe(50);
  expect(words.duplicates).toBe(0);
});

// ========================================================
// TEST 7: Remaining counts are 15 each
// ========================================================
test('Remaining counts are 15 for each team', async ({ page }) => {
  await setupGame(page);

  const remaining = await page.evaluate(() => {
    const el = document.querySelector('[x-data]');
    const data = el._x_dataStack[0];
    return { a: data.remainingA, b: data.remainingB };
  });

  expect(remaining.a).toBe(15);
  expect(remaining.b).toBe(15);
});

// ========================================================
// TEST 8: Spymaster view toggle
// ========================================================
test('Spymaster view toggle works', async ({ page }) => {
  await setupGame(page);

  // Find spymaster toggle button (starts as SPY default)
  const spymasterBtn = page.locator('button:has-text("SPY")').first();
  if (await spymasterBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await spymasterBtn.click();
    await page.waitForTimeout(200);
  }

  const spymasterOn = await page.evaluate(() => {
    const el = document.querySelector('[x-data]');
    const data = el._x_dataStack[0];
    return data.spymasterView;
  });

  // Started as true, after toggle it's false
  expect(spymasterOn).toBe(false);
});

// ========================================================
// TEST 9: Next round preserves dual-grid structure
// ========================================================
test('Next round preserves dual-grid structure', async ({ page }) => {
  await setupGame(page);

  // Force game end via internal state
  await page.evaluate(() => {
    const el = document.querySelector('[x-data]');
    const data = el._x_dataStack[0];
    data.remainingA = 0;
    data.endGame('A', 'Test win');
  });
  await page.waitForTimeout(300);

  // Click "LANGSUNG RONDE BERIKUTNYA" button
  const nextBtn = page.locator('button:has-text("LANGSUNG RONDE BERIKUTNYA")').first();
  if (await nextBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await nextBtn.click();
    await page.waitForTimeout(500);
  }

  // Verify new grids generated
  const gridInfo = await page.evaluate(() => {
    const el = document.querySelector('[x-data]');
    const data = el._x_dataStack[0];
    return {
      gridALength: data.gridA.length,
      gridBLength: data.gridB.length,
      gridAHasRed: data.gridA.some(c => c.color === 'red'),
      gridBHasBlue: data.gridB.some(c => c.color === 'blue'),
      gridAHasBlue: data.gridA.some(c => c.color === 'blue'),
      gridBHasRed: data.gridB.some(c => c.color === 'red'),
      remainingA: data.remainingA,
      remainingB: data.remainingB
    };
  });

  expect(gridInfo.gridALength).toBe(25);
  expect(gridInfo.gridBLength).toBe(25);
  expect(gridInfo.gridAHasRed).toBe(true);
  expect(gridInfo.gridBHasBlue).toBe(true);
  expect(gridInfo.gridAHasBlue).toBe(false);
  expect(gridInfo.gridBHasRed).toBe(false);
  expect(gridInfo.remainingA).toBe(15);
  expect(gridInfo.remainingB).toBe(15);
});

// ========================================================
// TEST 10: Two assassins per grid
// ========================================================
test('Two assassins per grid', async ({ page }) => {
  await setupGame(page);

  const assassinCount = await page.evaluate(() => {
    const el = document.querySelector('[x-data]');
    const data = el._x_dataStack[0];
    return {
      gridA: data.gridA.filter(c => c.color === 'assassin').length,
      gridB: data.gridB.filter(c => c.color === 'assassin').length
    };
  });

  expect(assassinCount.gridA).toBe(2);
  expect(assassinCount.gridB).toBe(2);
});

// ========================================================
// TEST 11: Punishment roulette flow
// ========================================================
test('Punishment roulette appears after game end', async ({ page }) => {
  await setupGame(page);

  // Force game end
  await page.evaluate(() => {
    const el = document.querySelector('[x-data]');
    const data = el._x_dataStack[0];
    data.remainingA = 0;
    data.endGame('A', 'Test win');
  });
  await page.waitForTimeout(300);

  // Should see punishment button
  const punishmentBtn = page.locator('button:has-text("LIHAT HUKUMAN")').first();
  await expect(punishmentBtn).toBeVisible({ timeout: 3000 });

  // Click to go to punishment phase
  await punishmentBtn.click();
  await page.waitForTimeout(300);

  // Verify wheel is visible
  const wheel = page.locator('.wheel-wrapper').first();
  await expect(wheel).toBeVisible({ timeout: 3000 });

  // Verify spin button visible
  const spinBtn = page.locator('button:has-text("PUTAR RODA HUKUMAN")').first();
  await expect(spinBtn).toBeVisible({ timeout: 3000 });

  // Click spin
  await spinBtn.click();
  await page.waitForTimeout(4500); // wait for spin animation to finish

  // Verify punishment result card is shown
  const punishmentCard = page.locator('.punishment-card').first();
  await expect(punishmentCard).toBeVisible({ timeout: 3000 });
  // Verify it shows the loser team
  await expect(page.locator('text=Dilaksanakan oleh').first()).toBeVisible({ timeout: 2000 });
});

// ========================================================
// TEST 12: Round history tracking
// ========================================================
test('Round history tracked correctly', async ({ page }) => {
  await setupGame(page);

  // Force game end for round 1
  await page.evaluate(() => {
    const el = document.querySelector('[x-data]');
    const data = el._x_dataStack[0];
    data.remainingA = 0;
    data.endGame('A', 'Test win');
  });
  await page.waitForTimeout(300);

  // Verify round history has 1 entry
  const history1 = await page.evaluate(() => {
    const el = document.querySelector('[x-data]');
    const data = el._x_dataStack[0];
    return data.roundHistory.length;
  });
  expect(history1).toBe(1);

  // Go to next round
  const nextBtn = page.locator('button:has-text("LANGSUNG RONDE BERIKUTNYA")').first();
  if (await nextBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await nextBtn.click();
    await page.waitForTimeout(500);
  }

  // End round 2
  await page.evaluate(() => {
    const el = document.querySelector('[x-data]');
    const data = el._x_dataStack[0];
    data.remainingA = 0;
    data.endGame('A', 'Win again');
  });
  await page.waitForTimeout(300);

  // Verify round history has 2 entries
  const history2 = await page.evaluate(() => {
    const el = document.querySelector('[x-data]');
    const data = el._x_dataStack[0];
    return data.roundHistory.length;
  });
  expect(history2).toBe(2);

  // Verify history content
  const historyContent = await page.evaluate(() => {
    const el = document.querySelector('[x-data]');
    const data = el._x_dataStack[0];
    return data.roundHistory.map(r => ({ ronde: r.round, winner: r.winner }));
  });
  expect(historyContent[0].ronde).toBe(1);
  expect(historyContent[0].winner).toBe('A');
  expect(historyContent[1].ronde).toBe(2);
  expect(historyContent[1].winner).toBe('A');
});
