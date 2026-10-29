import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createTestServer } from '../tests/serve.mjs';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const outputDirectory = resolve(projectRoot, 'demo-output');
const videoPath = resolve(outputDirectory, 'gather-walkthrough.webm');
const server = createTestServer();

await mkdir(outputDirectory, { recursive: true });
await new Promise((resolveReady, reject) => {
  server.once('error', reject);
  server.listen(4174, '127.0.0.1', resolveReady);
});

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: outputDirectory, size: { width: 1440, height: 900 } },
});

try {
  const page = await context.newPage();
  const video = page.video();
  await page.goto('http://127.0.0.1:4174/');
  await page.addStyleTag({
    content: `
      #walkthrough-caption {
        position: fixed; z-index: 9999; left: 50%; bottom: 22px;
        transform: translateX(-50%); width: min(780px, calc(100% - 48px));
        padding: 15px 20px; border: 1px solid #ffffff55; border-radius: 12px;
        background: #24332bea; color: #fff; box-shadow: 0 12px 36px #16201844;
        font: 500 16px/1.4 'DM Sans', Arial, sans-serif; text-align: left;
      }
      #walkthrough-caption strong { display: block; margin-bottom: 3px; color: #d9e49d; font-size: 18px; }
      #walkthrough-cursor {
        position: fixed; z-index: 10000; width: 20px; height: 20px; margin: -10px 0 0 -10px;
        border: 2px solid #fff; border-radius: 50%; background: #688b51aa;
        box-shadow: 0 1px 8px #17211699; pointer-events: none; display: none;
      }
    `,
  });
  await page.evaluate(() => {
    const cursor = document.createElement('div');
    cursor.id = 'walkthrough-cursor';
    document.body.append(cursor);
    document.addEventListener('pointermove', (event) => {
      cursor.style.display = 'block';
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
    });
  });

  async function caption(title, detail, pause = 1400) {
    await page.evaluate(
      ({ heading, text }) => {
        let box = document.querySelector('#walkthrough-caption');
        if (!box) {
          box = document.createElement('div');
          box.id = 'walkthrough-caption';
          document.body.append(box);
        }
        box.replaceChildren();
        const strong = document.createElement('strong');
        strong.textContent = heading;
        const description = document.createElement('span');
        description.textContent = text;
        box.append(strong, description);
      },
      { heading: title, text: detail },
    );
    await page.waitForTimeout(pause);
  }

  await caption('Gather | Plan a celebration, your way', 'A simple planner for the details that make a day yours.', 2200);
  await page.getByRole('button', { name: /Plan a new event/ }).click();
  await page.getByLabel('What are we celebrating?').selectOption('Birthday');
  await page.getByLabel('Give it a name').fill('Avery’s Garden Birthday');
  await page.getByLabel('When’s the big day?').fill('2026-12-12');
  await page.getByLabel('Where will it be?').fill('City Garden');
  await page.getByLabel('Expected guests').fill('35');
  await page.getByLabel('What’s your budget?').fill('1800');
  await caption('1 | Set the event basics', 'Add the date, location, guest count, and a budget.');
  await page.getByRole('button', { name: 'Save the details' }).click();
  await page.waitForTimeout(1300);

  await page.getByRole('button', { name: /Add a milestone/ }).click();
  await page.getByLabel('What needs doing?').fill('Confirm dietary requests');
  await page.getByLabel('A little note').fill('Check guest responses before ordering food.');
  await page.getByLabel('When?').fill('2026-12-01');
  await caption('2 | Keep the next steps visible', 'Add a dated milestone and check it off when it is done.');
  await page.getByRole('button', { name: 'Save the details' }).click();
  await page.getByRole('button', { name: 'Complete milestone: Confirm dietary requests' }).click();
  await page.waitForTimeout(1100);

  await page.getByRole('button', { name: 'Photos & memories: mark booked' }).click();
  await caption('3 | Keep vendors and tasks together', 'Mark a vendor booked and see the task count update.');
  await page.waitForTimeout(1100);

  await page.locator('#assistantPrompt').fill('Give me budget-friendly ideas for a birthday party');
  await page.getByRole('button', { name: 'Send message' }).click();
  await caption('4 | Get a useful planning nudge', 'Ideas are local, event-aware suggestions; no AI service is connected.');
  await page.waitForTimeout(1800);

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(600);
  const downloadReady = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download a backup of your plan' }).click();
  const download = await downloadReady;
  const backupPath = resolve(outputDirectory, download.suggestedFilename());
  await download.saveAs(backupPath);
  await caption('5 | Keep a portable backup', 'Export the plan as JSON and restore it in another browser.');
  await page.locator('#importPlanInput').setInputFiles(backupPath);
  await page.waitForLoadState('domcontentloaded');
  await caption('Your plan is saved and ready to keep going', 'Gather stores plans in this browser and offers JSON backups for moving them.', 2200);

  await context.close();
  await video.saveAs(videoPath);
  console.log(`Recorded walkthrough: ${videoPath}`);
} finally {
  await browser.close();
  await new Promise((resolveClosed) => server.close(resolveClosed));
}
