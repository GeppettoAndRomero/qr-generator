import { test, expect, type Page } from '@playwright/test';
import { createRequire } from 'node:module';
import { waitReady, generateWifiQr, SAMPLE_WIFI } from './_helpers';

// This package.json is "type": "module", so there is no ambient CJS `require` here —
// synthesize one just to resolve jsqr's bundle file path for page.addScriptTag below.
const require = createRequire(import.meta.url);

async function goto(page: Page) {
  await page.goto('/qr-generator/');
  await waitReady(page);
}

/** Decode the rendered canvas with jsQR — proves what actually got encoded. */
async function decodeCanvas(page: Page): Promise<string | null> {
  await page.addScriptTag({ path: require.resolve('jsqr/dist/jsQR.js') });
  return page.evaluate(() => {
    const canvas = document.querySelector('[data-testid="qr-canvas"]') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const result = (window as any).jsQR(imageData.data, imageData.width, imageData.height);
    return result ? result.data : null;
  });
}

test.describe('generate a Wi-Fi QR code', () => {
  test('switching to the Wi-Fi tab shows the network form and hides the text box', async ({ page }) => {
    await goto(page);
    await page.locator('[data-testid="mode-tab-wifi"]').click();
    await expect(page.locator('[data-testid="wifi-ssid"]')).toBeVisible();
    await expect(page.locator('[data-testid="qr-text"]')).toBeHidden();
    await expect(page.locator('[data-testid="mode-tab-wifi"]')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('[data-testid="mode-tab-text"]')).toHaveAttribute('aria-selected', 'false');
  });

  test('shows the empty state until a network name is entered, no upload happens', async ({ page }) => {
    const external: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (!url.startsWith('http://localhost:4321') && !url.startsWith('data:') && !url.startsWith('blob:')) {
        external.push(url);
      }
    });

    await goto(page);
    await page.locator('[data-testid="mode-tab-wifi"]').click();
    await expect(page.locator('[data-testid="qr-canvas-wrap"]')).toBeHidden();
    await expect(page.locator('#download-png-action')).toBeDisabled();

    await generateWifiQr(page);
    expect(external, `unexpected cross-origin requests: ${external.join(', ')}`).toHaveLength(0);
  });

  test('does not generate until a WPA/WEP network also has a password', async ({ page }) => {
    await goto(page);
    await page.locator('[data-testid="mode-tab-wifi"]').click();
    await page.locator('[data-testid="wifi-ssid"]').fill(SAMPLE_WIFI.ssid);
    // Password left empty — WPA is the default security type.
    await expect(page.locator('[data-testid="qr-canvas-wrap"]')).toBeHidden();
    await expect(page.locator('#download-png-action')).toBeDisabled();

    await page.locator('[data-testid="wifi-password"]').fill(SAMPLE_WIFI.password);
    await expect(page.locator('[data-testid="qr-canvas-wrap"]')).toBeVisible({ timeout: 10_000 });
  });

  test('encodes a standard WIFI: payload for a WPA network (round-trip decoded)', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'decoding library injection, single engine');
    await goto(page);
    await generateWifiQr(page);
    const decoded = await decodeCanvas(page);
    expect(decoded).toBe(`WIFI:T:WPA;S:${SAMPLE_WIFI.ssid};P:${SAMPLE_WIFI.password};;`);
  });

  test('selecting "None" hides the password field and omits P from the payload', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'decoding library injection, single engine');
    await goto(page);
    await page.locator('[data-testid="mode-tab-wifi"]').click();
    await page.locator('[data-testid="wifi-security"]').selectOption('nopass');
    await expect(page.locator('[data-testid="wifi-password"]')).toBeHidden();

    await generateWifiQr(page, { ssid: 'OpenCafeWiFi', security: 'nopass' });
    const decoded = await decodeCanvas(page);
    expect(decoded).toBe('WIFI:T:nopass;S:OpenCafeWiFi;;');
    expect(decoded).not.toContain('P:');
  });

  test('clears a previously entered password when switching security to "None"', async ({ page }) => {
    await goto(page);
    await page.locator('[data-testid="mode-tab-wifi"]').click();
    await page.locator('[data-testid="wifi-ssid"]').fill(SAMPLE_WIFI.ssid);
    await page.locator('[data-testid="wifi-password"]').fill(SAMPLE_WIFI.password);
    await page.locator('[data-testid="wifi-security"]').selectOption('nopass');
    await expect(page.locator('[data-testid="wifi-password"]')).toBeHidden();

    // Switching back to WPA shows an empty password field, not the stale value.
    await page.locator('[data-testid="wifi-security"]').selectOption('WPA');
    await expect(page.locator('[data-testid="wifi-password"]')).toHaveValue('');
  });

  test('checking "Hidden network" adds H:true to the payload', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'decoding library injection, single engine');
    await goto(page);
    await generateWifiQr(page, { hidden: true });
    const decoded = await decodeCanvas(page);
    expect(decoded).toBe(`WIFI:T:WPA;S:${SAMPLE_WIFI.ssid};P:${SAMPLE_WIFI.password};H:true;;`);
  });

  test('escapes special characters (; , : \\) in the SSID and password', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'decoding library injection, single engine');
    await goto(page);
    await generateWifiQr(page, { ssid: 'My WiFi;2', password: 'p@ss,word' });
    const decoded = await decodeCanvas(page);
    expect(decoded).toBe('WIFI:T:WPA;S:My WiFi\\;2;P:p@ss\\,word;;');
  });

  test('the "Load example" button loads a renderable Wi-Fi network', async ({ page }) => {
    await goto(page);
    await page.locator('[data-testid="mode-tab-wifi"]').click();
    await page.locator('#load-example-action').click();
    await expect(page.locator('[data-testid="wifi-ssid"]')).not.toHaveValue('');
    await expect(page.locator('[data-testid="qr-canvas-wrap"]')).toBeVisible({ timeout: 10_000 });
  });

  test('the "Clear" button empties the Wi-Fi form and the preview, without touching the text mode draft', async ({
    page,
  }) => {
    await goto(page);
    await page.locator('[data-testid="qr-text"]').fill('kept across tabs');
    await page.locator('[data-testid="mode-tab-wifi"]').click();
    await generateWifiQr(page);

    await page.locator('#clear-action').click();
    await expect(page.locator('[data-testid="wifi-ssid"]')).toHaveValue('');
    await expect(page.locator('[data-testid="qr-canvas-wrap"]')).toBeHidden();

    await page.locator('[data-testid="mode-tab-text"]').click();
    await expect(page.locator('[data-testid="qr-text"]')).toHaveValue('kept across tabs');
  });

  test('the password reveal toggle switches the field between masked and plain text', async ({ page }) => {
    await goto(page);
    await page.locator('[data-testid="mode-tab-wifi"]').click();
    await page.locator('[data-testid="wifi-password"]').fill(SAMPLE_WIFI.password);
    await expect(page.locator('[data-testid="wifi-password"]')).toHaveAttribute('type', 'password');

    await page.locator('[data-testid="wifi-password-reveal"]').click();
    await expect(page.locator('[data-testid="wifi-password"]')).toHaveAttribute('type', 'text');
    await expect(page.locator('[data-testid="wifi-password"]')).toHaveValue(SAMPLE_WIFI.password);
  });

  test('downloads a Wi-Fi-specific PNG filename', async ({ page }) => {
    await goto(page);
    await generateWifiQr(page);

    const downloadPromise = page.waitForEvent('download', { timeout: 30_000 });
    await page.locator('#download-png-action').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('wifi-qr-code.png');
  });

  test('downloads a Wi-Fi-specific SVG filename', async ({ page }) => {
    await goto(page);
    await generateWifiQr(page);

    const downloadPromise = page.waitForEvent('download', { timeout: 30_000 });
    await page.locator('#download-svg-action').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('wifi-qr-code.svg');
  });
});
