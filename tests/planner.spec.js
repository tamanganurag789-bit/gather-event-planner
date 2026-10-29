import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('shows the saved event dashboard', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Maya & Arjun’s Wedding' })).toBeVisible();
  await expect(page.locator('#guestCount')).toHaveText('120');
  await expect(page.locator('#spentAmount')).toHaveText('$12,450');
  await expect(page.locator('#timelineList .timeline-row')).toHaveCount(3);
});

test('edits event details and keeps them after reload', async ({ page }) => {
  await page.getByRole('button', { name: 'Edit details' }).click();
  await page.getByLabel('Event name').fill('Sam’s birthday');
  await page.getByLabel('Expected guests').fill('42');
  await page.getByLabel('Total budget').fill('3500');
  await page.getByRole('button', { name: 'Save the details' }).click();

  await expect(page.locator('#eventTitle')).toHaveText('Sam’s birthday');
  await expect(page.locator('#guestCount')).toHaveText('42');
  await expect(page.locator('#totalAmount')).toHaveText('$3,500');

  await page.reload();
  await expect(page.locator('#eventTitle')).toHaveText('Sam’s birthday');
  await expect(page.locator('#guestCount')).toHaveText('42');
});

test('marks a milestone complete and updates the task count', async ({ page }) => {
  await page.getByRole('button', {
    name: 'Complete milestone: Book your dream photographer',
  }).click();

  await expect(page.locator('#timelineList .timeline-status').first()).toHaveText('DONE');
  await expect(page.locator('#taskCount')).toHaveText('9');

  await page.reload();
  await expect(page.locator('#timelineList .timeline-status').first()).toHaveText('DONE');
});

test('accepts a zero budget without displaying invalid values', async ({ page }) => {
  await page.getByRole('button', { name: 'Edit details' }).click();
  await page.getByLabel('Total budget').fill('0');
  await page.getByRole('button', { name: 'Save the details' }).click();

  await expect(page.locator('#totalAmount')).toHaveText('$0');
  await expect(page.locator('.stat-foot')).toContainText('$0 left');
  await expect(page.locator('#budgetProgress')).toHaveCSS('width', /\d+px/);
  await expect(page.locator('body')).not.toContainText('NaN');
});

test('downloads a JSON backup containing the current plan', async ({ page }) => {
  const downloadReady = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download a backup of your plan' }).click();
  const download = await downloadReady;
  const stream = await download.createReadStream();
  const chunks = [];

  for await (const chunk of stream) chunks.push(chunk);

  const backup = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  expect(download.suggestedFilename()).toMatch(/^gather-plan-\d{4}-\d{2}-\d{2}\.json$/);
  expect(backup.plan.title).toBe('Maya & Arjun’s Wedding');
});

test('imports a plan backup and refreshes the dashboard', async ({ page }) => {
  const backup = {
    app: 'Gather',
    version: 1,
    plan: {
      title: 'Imported birthday',
      type: 'Birthday',
      place: 'Community garden',
      date: '2027-08-14',
      guests: 35,
      total: 1800,
      spent: 250,
      done: 0,
      timeline: [],
      vendors: [],
    },
  };

  await page.locator('#importPlanInput').setInputFiles({
    name: 'gather-backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(backup)),
  });

  await expect(page.locator('#eventTitle')).toHaveText('Imported birthday');
  await expect(page.locator('#guestCount')).toHaveText('35');
  await expect(page.locator('#spentAmount')).toHaveText('$250');
});

test('rejects a malformed backup without replacing the current plan', async ({ page }) => {
  await page.locator('#importPlanInput').setInputFiles({
    name: 'not-a-plan.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ title: 'Incomplete plan' })),
  });

  await expect(page.getByRole('status')).toContainText('does not look like a Gather plan backup');
  await expect(page.locator('#eventTitle')).toHaveText('Maya & Arjun’s Wedding');
});

test('renders event names as text instead of executable markup', async ({ page }) => {
  const eventName = '<img src=x onerror=alert(1)> Birthday';
  await page.getByRole('button', { name: /Plan a new event/ }).click();
  await page.getByLabel('Give it a name').fill(eventName);
  await page.getByLabel('Expected guests').fill('12');
  await page.getByRole('button', { name: 'Save the details' }).click();

  await expect(page.locator('#eventTitle')).toHaveText(eventName);
  await expect(page.locator('#eventTitle img')).toHaveCount(0);
});
