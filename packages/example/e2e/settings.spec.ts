import { test, expect } from '@ui-llm/playwright';

test.use({
  llmConfig: {
    provider: 'openrouter',
    model: 'anthropic/claude-sonnet-4-20250514',
    temperature: 0,
    verbose: true,
  },
});

// ============================================================
// Discovery & Manifest
// ============================================================

test('manifest is exposed on window', async ({ page }) => {
  await page.goto('/');
  const manifest = await page.evaluate(() => window.__ui_llm__?.getManifest());

  expect(manifest).toBeDefined();
  expect(manifest!.version).toBe('1.0.0');
  expect(manifest!.entries.length).toBeGreaterThan(0);
});

test('meta tag is injected for discovery', async ({ page, llm }) => {
  await page.goto('/');
  const support = await llm.detectSupport();
  expect(support.supported).toBe(true);
  expect(support.version).toBe('1.0.0');
});

test('manifest includes routes and capabilities', async ({ page }) => {
  await page.goto('/');
  const manifest = await page.evaluate(() => window.__ui_llm__?.getManifest());

  expect(manifest!.routes).toBeDefined();
  expect(manifest!.routes!.length).toBe(4);
  expect(manifest!.routes!.map(r => r.name)).toEqual(['Home', 'Dashboard', 'Contacts', 'Settings']);
  expect(manifest!.currentRoute).toBeDefined();
  expect(manifest!.currentRoute!.name).toBe('Home');
  expect(manifest!.summary.capabilities).toBeDefined();
  expect(manifest!.summary.capabilities!.dangerZone).toBe(false);
});

// ============================================================
// Navigation
// ============================================================

test('navigate via navbar', async ({ page, llm }) => {
  await page.goto('/');
  await llm.do('click the Dashboard button in the navigation');
  await expect(page.locator('h1')).toHaveText('Dashboard');
});

test('navigate via home page feature cards', async ({ page, llm }) => {
  await page.goto('/');
  await llm.do('click the button that takes me to contacts');
  await expect(page.locator('h1')).toContainText('Contacts');
});

// ============================================================
// Search overlay
// ============================================================

test('open and use search', async ({ page, llm }) => {
  await page.goto('/');
  await llm.do('open the search overlay');
  await llm.expect('the search overlay is visible');
  await llm.do('click the Settings search result');
  await expect(page.locator('h1')).toHaveText('Settings');
});

// ============================================================
// Dashboard
// ============================================================

test('dashboard time range selection', async ({ page, llm }) => {
  await page.goto('/');
  await llm.do('click Dashboard in the navigation');

  await llm.do('click the 7 Days time range button');
  await llm.expect('the 7 Days time range is active');

  await llm.do('click the 90 Days time range button');
  await llm.expect('the 90 Days time range is active');
});

test('dashboard export via invoke', async ({ page, llm }) => {
  await page.goto('/');
  await llm.do('click Dashboard in the navigation');

  const result = await llm.invoke('Export Report', { format: 'pdf' });
  expect(result.status).toBe('success');
});

// ============================================================
// Contacts
// ============================================================

test('add a new contact', async ({ page, llm }) => {
  await page.goto('/');
  await llm.do('click Contacts in the navigation');
  await llm.do('click Add New Contact');

  await llm.sequence([
    'type "Eve Taylor" into the new contact name field',
    'type "eve@example.com" into the new contact email field',
    'type "Marketing" into the new contact role field',
    'click Submit New Contact',
  ]);

  await llm.expect('the contact list contains Eve Taylor');
});

test('filter contacts by status', async ({ page, llm }) => {
  await page.goto('/');
  await llm.do('click Contacts in the navigation');

  await llm.do('click Show Inactive Contacts');
  await llm.expect('only inactive contacts are shown');

  await llm.do('click Show All Contacts');
  await llm.expect('all contacts are visible');
});

test('search contacts', async ({ page, llm }) => {
  await page.goto('/');
  await llm.do('click Contacts in the navigation');

  await llm.do('type "alice" into the contact search field');
  await llm.expect('only Alice Johnson is visible in the contact list');
});

// ============================================================
// Settings
// ============================================================

test('toggle dark mode via invoke', async ({ page, llm }) => {
  await page.goto('/');
  await llm.do('click Settings in the navigation');

  const result = await llm.invoke('Set Dark Mode', { enabled: true });
  expect(result.status).toBe('success');
  await llm.expect('dark mode is toggled on');
});

test('save button disabled when fields empty', async ({ page, llm }) => {
  await page.goto('/');
  await llm.do('click Settings in the navigation');

  await llm.do('clear the display name field');
  await llm.expect('the save settings button is disabled');

  await llm.do('type "Bob" into the display name field');
  await llm.expect('the save settings button is enabled');
});

test('manifest includes params, relations, permissions', async ({ page, llm }) => {
  await page.goto('/');
  await llm.do('click Settings in the navigation');

  const manifest = await llm.getManifest();

  const darkMode = manifest.entries.find(e => e.descriptor.name === 'Set Dark Mode');
  expect(darkMode).toBeDefined();
  if (darkMode!.kind === 'action') {
    expect(darkMode!.descriptor.params?.enabled).toBeDefined();
    expect(darkMode!.descriptor.params?.enabled.type).toBe('boolean');
  }

  const save = manifest.entries.find(e => e.descriptor.name === 'Save Settings');
  expect(save).toBeDefined();
  if (save!.kind === 'action') {
    expect(save!.descriptor.relations).toBeDefined();
    expect(save!.descriptor.relations!.length).toBe(2);
    expect(save!.descriptor.relations![0].type).toBe('submits');
  }

  const del = manifest.entries.find(e => e.descriptor.name === 'Delete Account');
  expect(del).toBeDefined();
  expect(del!.permission).toBe('dangerZone');
});

// ============================================================
// Find locator
// ============================================================

test('find returns a Playwright locator', async ({ page, llm }) => {
  await page.goto('/');
  const settingsBtn = await llm.find('the settings button in the navigation');
  await expect(settingsBtn).toBeVisible();
  await settingsBtn.click();
  await expect(page.locator('h1')).toHaveText('Settings');
});

// ============================================================
// Delete account flow
// ============================================================

test('delete account shows confirmation', async ({ page, llm }) => {
  await page.goto('/');
  await llm.do('click Settings in the navigation');

  await llm.do('click Delete Account');
  await llm.expect('a confirmation prompt is visible');

  await llm.do('click Cancel Delete');
  await llm.expect('the delete account button is visible');
});
