// Captures the screenshots and GIFs used in the README from the running demo.
//
//   make dev                       # in one terminal (serves http://localhost:3000)
//   node scripts/capture-media.mjs # in another; writes to assets/
//
// Options: BASE_URL (default http://localhost:3000), OUT_DIR (default assets),
// CHROMIUM_PATH (a Chromium binary to use instead of Playwright's own).
// GIFs need ffmpeg on the PATH and Playwright's video recorder (`npx playwright install ffmpeg`).
import { chromium, devices } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const OUT_DIR = process.env.OUT_DIR || 'assets';
const CHROMIUM = process.env.CHROMIUM_PATH || undefined;

// The calendar switches to its phone layout below 1280px wide, so desktop captures use exactly that
const DESKTOP = { viewport: { width: 1280, height: 860 }, deviceScaleFactor: 2 };
const DESKTOP_WEEK_HEIGHT = 660;
const DESKTOP_GIF = { viewport: { width: 1280, height: 800 } };
const PHONE = { ...devices['Pixel 5'], deviceScaleFactor: 2 };

mkdirSync(OUT_DIR, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROMIUM });

async function open(context) {
  const page = await context.newPage();
  await page.goto(BASE_URL);
  await page.locator('.vue-calendarium').waitFor();
  await page.waitForTimeout(800);
  return page;
}

async function openSidebar(page) {
  await page.getByTestId('mobile-menu-button').click();
  await page.locator('.mobile-sidebar.v-navigation-drawer--active').waitFor();
  await page.waitForTimeout(400);
}

async function chooseView(page, name) {
  await page.getByTestId('view-toggle').click();
  await page.getByRole('option', { name }).click();
  await page.mouse.move(2, 2); // keep the hover highlight off the grid
  await page.waitForTimeout(600);
}

const showWeek = async (page) => {
  await page.evaluate(() => window.calendarApp.setView('week'));
  await page.locator('.week-view').waitFor();
  await page.waitForTimeout(500);
};

const shot = (page, name) => page.locator('.vue-calendarium').screenshot({ path: join(OUT_DIR, `${name}.png`) });

// The week grid opens at the current time of day; scroll it so the working day fills the picture
async function scrollGridToHour(page, hour) {
  await page.locator('.hour-slot').first().evaluate((slot, targetHour) => {
    let el = slot.parentElement;
    while (el && el.scrollHeight <= el.clientHeight) el = el.parentElement;
    if (el) el.scrollTop = targetHour * slot.getBoundingClientRect().height;
  }, hour);
  await page.waitForTimeout(300);
}

// A real finger swipe (touch events), so no click follows it
async function swipe(page, from, to) {
  const box = await page.locator('.calendar-body').boundingBox();
  const y = box.y + box.height / 2;
  const startX = box.x + box.width * from;
  const endX = box.x + box.width * to;
  const client = await page.context().newCDPSession(page);
  const touch = (type, x) => client.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
  await touch('touchStart', startX);
  const steps = 16;
  for (let i = 1; i <= steps; i++) {
    await touch('touchMove', startX + ((endX - startX) * i) / steps);
    await page.waitForTimeout(16);
  }
  await touch('touchEnd', endX);
  await page.waitForTimeout(800);
}

// Records the page while `script` runs, then crops the video to the calendar and converts it to a GIF.
// `prepare` runs first and is left out of the GIF, so it starts on the view the script needs.
async function recordGif(name, contextOptions, width, prepare, script) {
  const videoDir = mkdtempSync(join(tmpdir(), 'calendarium-video-'));
  const context = await browser.newContext({ ...contextOptions, deviceScaleFactor: 1, recordVideo: { dir: videoDir, size: contextOptions.viewport } });
  const started = Date.now();
  const page = await open(context);
  await prepare(page);
  const box = await page.locator('.vue-calendarium').boundingBox();
  const skip = (Date.now() - started) / 1000;
  await script(page);
  await page.waitForTimeout(800);
  await context.close();

  const even = (n) => Math.floor(n / 2) * 2; // rounding down keeps the crop inside the video
  const crop = `crop=${even(box.width)}:${even(box.height)}:${even(box.x)}:${even(box.y)}`;
  const video = join(videoDir, readdirSync(videoDir).find(file => file.endsWith('.webm')));
  const gif = join(OUT_DIR, `${name}.gif`);
  const filter = `${crop},fps=10,scale=${width}:-1:flags=lanczos`;
  const palette = join(videoDir, 'palette.png');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(skip), '-i', video, '-vf', `${filter},palettegen=max_colors=128:stats_mode=diff`, palette]);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(skip), '-i', video, '-i', palette, '-lavfi', `${filter}[x];[x][1:v]paletteuse=dither=none:diff_mode=rectangle`, '-loop', '0', gif]);
  rmSync(videoDir, { recursive: true, force: true });
}

// ----- Desktop screenshots -----
{
  const context = await browser.newContext(DESKTOP);
  const page = await open(context);
  await shot(page, 'month');

  await chooseView(page, 'Week');
  await page.locator('.week-view').waitFor();
  await scrollGridToHour(page, 7.5);

  // Event dialog with the repeat menu open
  await page.getByRole('button', { name: /Create event on .* at 14:00/ }).first().click();
  await page.getByTestId('event-modal').waitFor();
  await page.getByPlaceholder(/Event title|Add title/i).fill('Design review');
  await page.getByTestId('event-modal').getByTestId('repeat-select').click();
  await page.getByTestId('repeat-menu').waitFor();
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(OUT_DIR, 'event-dialog.png'), clip: await page.locator('.vue-calendarium').boundingBox() });
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /cancel/i }).click();
  await page.mouse.move(2, 2);

  // A shorter window ends the week before the demo's crowded late afternoon
  await page.setViewportSize({ width: 1280, height: DESKTOP_WEEK_HEIGHT });
  await page.waitForTimeout(400);
  await scrollGridToHour(page, 7.5);
  await shot(page, 'week');
  await context.close();
}

// ----- Phone screenshots -----
{
  const context = await browser.newContext(PHONE);
  const page = await open(context);
  await shot(page, 'mobile-month');
  await showWeek(page); // not through the menu: the tap would leave a hover highlight on the grid
  await scrollGridToHour(page, 7.5);
  await shot(page, 'mobile-week');
  await openSidebar(page);
  await shot(page, 'mobile-menu');
  await context.close();
}

// ----- GIFs -----
await recordGif('create-event', DESKTOP_GIF, 900, async (page) => {
  await showWeek(page);
  await scrollGridToHour(page, 7.5);
}, async (page) => {
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: /Create event on .* at 15:00/ }).first().click();
  await page.getByTestId('event-modal').waitFor();
  await page.waitForTimeout(500);
  await page.getByPlaceholder(/Event title|Add title/i).pressSequentially('Coffee with Sam', { delay: 70 });
  await page.waitForTimeout(500);
  await page.getByTestId('event-modal').getByTestId('repeat-select').click();
  await page.getByTestId('repeat-menu').getByText(/^Weekly/).click();
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.mouse.move(2, 2);
  await page.waitForTimeout(1200);
});

await recordGif('drag-and-drop', DESKTOP_GIF, 900, async (page) => {
  await showWeek(page);
  await scrollGridToHour(page, 7.5);
}, async (page) => {
  await page.waitForTimeout(400);
  const event = page.locator('.week-event').filter({ hasText: 'Project Review' }).first();
  const box = await event.boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + 12;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.waitForTimeout(700); // a long press starts the drag
  await page.mouse.move(x + 130, y + 110, { steps: 25 });
  await page.waitForTimeout(500);
  await page.mouse.up();
  await page.mouse.move(2, 2);
  await page.waitForTimeout(1200);
});

await recordGif('mobile-swipe', PHONE, 300, async (page) => {
  await showWeek(page);
  await scrollGridToHour(page, 7.5);
}, async (page) => {
  await page.waitForTimeout(400);
  await swipe(page, 0.8, 0.2);
  await swipe(page, 0.8, 0.2);
  await swipe(page, 0.2, 0.8);
});

await browser.close();
console.log(`Wrote ${readdirSync(OUT_DIR).join(', ')} to ${OUT_DIR}`);
