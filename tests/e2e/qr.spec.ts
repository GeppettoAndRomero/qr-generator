import { test, expect, type Page } from '@playwright/test';
import { createRequire } from 'node:module';
import { waitReady, generateQr, SAMPLE_URL } from './_helpers';

// This package.json is "type": "module", so there is no ambient CJS `require` here —
// synthesize one just to resolve jsqr's bundle file path for page.addScriptTag below.
const require = createRequire(import.meta.url);

const isPng = (b: Buffer) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
const isSvg = (text: string) => text.trim().startsWith('<svg') || text.includes('<svg ');

async function goto(page: Page) {
  await page.goto('/qr-generator/');
  await waitReady(page);
}

test.describe('generate a QR code', () => {
  test('renders a typed URL live as a QR code with no upload', async ({ page }) => {
    const external: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (!url.startsWith('http://localhost:4321') && !url.startsWith('data:') && !url.startsWith('blob:')) {
        external.push(url);
      }
    });

    await goto(page);
    await generateQr(page, SAMPLE_URL);

    await expect(page.locator('[data-testid="qr-canvas-wrap"]')).toBeVisible();
    expect(external, `unexpected cross-origin requests: ${external.join(', ')}`).toHaveLength(0);
  });

  test('the "Load example" button loads a renderable URL', async ({ page }) => {
    await goto(page);
    await page.locator('#load-example-action').click();
    await expect(page.locator('[data-testid="qr-canvas-wrap"]')).toBeVisible({ timeout: 10_000 });
  });

  test('the "Clear" button empties the input and the preview', async ({ page }) => {
    await goto(page);
    await generateQr(page);
    await page.locator('#clear-action').click();
    await expect(page.locator('[data-testid="qr-text"]')).toHaveValue('');
    await expect(page.locator('[data-testid="qr-canvas-wrap"]')).toBeHidden();
  });

  test('shows the empty-state message before anything is typed', async ({ page }) => {
    await goto(page);
    await expect(page.locator('[data-testid="qr-status"]')).toBeVisible();
    await expect(page.locator('#download-png-action')).toBeDisabled();
    await expect(page.locator('#download-svg-action')).toBeDisabled();
  });

  test('changing the error correction level or size re-generates the code', async ({ page }) => {
    await goto(page);
    await generateQr(page);

    await page.locator('[data-testid="qr-ec-level"]').selectOption('H');
    await expect(page.locator('[data-testid="qr-canvas-wrap"]')).toBeVisible({ timeout: 10_000 });

    await page.locator('[data-testid="qr-size"]').selectOption('large');
    await expect(page.locator('[data-testid="qr-canvas-wrap"]')).toBeVisible({ timeout: 10_000 });
    const width = await page.locator('[data-testid="qr-canvas"]').evaluate((el) => (el as HTMLCanvasElement).width);
    expect(width).toBe(1024);
  });

  test('downloads a valid, openable PNG file', async ({ page }) => {
    await goto(page);
    await generateQr(page);

    const downloadPromise = page.waitForEvent('download', { timeout: 30_000 });
    await page.locator('#download-png-action').click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe('qr-code.png');
    const path = await download.path();
    expect(path).toBeTruthy();
    const { readFileSync } = await import('node:fs');
    const buf = readFileSync(path as string);
    expect(buf.length).toBeGreaterThan(100);
    expect(isPng(buf)).toBe(true);
  });

  test('downloads a valid, openable SVG file', async ({ page }) => {
    await goto(page);
    await generateQr(page);

    const downloadPromise = page.waitForEvent('download', { timeout: 30_000 });
    await page.locator('#download-svg-action').click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe('qr-code.svg');
    const path = await download.path();
    expect(path).toBeTruthy();
    const { readFileSync } = await import('node:fs');
    const text = readFileSync(path as string, 'utf-8');
    expect(isSvg(text)).toBe(true);
    expect(text).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  test.describe('round-trip correctness (chromium only, one engine is enough to prove the encoder is correct)', () => {
    test.beforeEach(({}, testInfo) => {
      test.skip(testInfo.project.name !== 'chromium', 'decoding library injection, single engine');
    });

    test('a generated QR code decodes back to exactly the URL that was typed', async ({ page }) => {
      await goto(page);
      await generateQr(page, SAMPLE_URL);

      // Independent verification, not just "trust the encoder": decode the rendered
      // canvas with jsQR (Apache-2.0, a separate decoder implementation from the
      // `qrcode` encoder this tool uses) and assert the decoded text is byte-for-byte
      // the input — proof the tool encodes exactly what was typed, nothing more.
      await page.addScriptTag({ path: require.resolve('jsqr/dist/jsQR.js') });
      const decoded = await page.evaluate(() => {
        const canvas = document.querySelector('[data-testid="qr-canvas"]') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d')!;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const result = (window as any).jsQR(imageData.data, imageData.width, imageData.height);
        return result ? result.data : null;
      });
      expect(decoded).toBe(SAMPLE_URL);
    });

    test('a generated QR code for arbitrary (non-URL) text decodes back exactly, including at a small size', async ({
      page,
    }) => {
      const text = 'runlocally — small tools that run locally. 日本語テストも含む!';
      await goto(page);
      await page.locator('[data-testid="qr-size"]').selectOption('small');
      await generateQr(page, text);

      await page.addScriptTag({ path: require.resolve('jsqr/dist/jsQR.js') });
      const decoded = await page.evaluate(() => {
        const canvas = document.querySelector('[data-testid="qr-canvas"]') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d')!;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const result = (window as any).jsQR(imageData.data, imageData.width, imageData.height);
        return result ? result.data : null;
      });
      expect(decoded).toBe(text);
    });
  });

  test.describe('capacity handling (chromium only, pure UI/logic check)', () => {
    test.beforeEach(({}, testInfo) => {
      test.skip(testInfo.project.name !== 'chromium', 'pure UI check, single engine');
    });

    test('shows a clear error with the exact character count and limit instead of truncating or crashing', async ({
      page,
    }) => {
      await goto(page);
      await page.locator('[data-testid="qr-ec-level"]').selectOption('H');
      // 2000 lowercase letters: byte mode at level H caps at 1273 bytes (see
      // qrCapacity.ts / qrCapacity.test.ts), so this deliberately overflows it.
      const overLong = 'a'.repeat(2000);
      await page.locator('[data-testid="qr-text"]').fill(overLong);

      const error = page.locator('[data-testid="capacity-error"]');
      await expect(error).toBeVisible({ timeout: 10_000 });
      await expect(error).toContainText('2000');
      await expect(error).toContainText('1273');

      // No silent truncation or crash: no QR code is shown, downloads stay disabled,
      // and the full (untruncated) input is still sitting in the textarea.
      await expect(page.locator('[data-testid="qr-canvas-wrap"]')).toBeHidden();
      await expect(page.locator('#download-png-action')).toBeDisabled();
      await expect(page.locator('#download-svg-action')).toBeDisabled();
      await expect(page.locator('[data-testid="qr-text"]')).toHaveValue(overLong);

      // Raising the input back under the limit recovers cleanly (no crash/stuck state).
      await page.locator('[data-testid="qr-text"]').fill('a'.repeat(100));
      await expect(page.locator('[data-testid="qr-canvas-wrap"]')).toBeVisible({ timeout: 10_000 });
    });

    test('the same length fits at a lower error correction level', async ({ page }) => {
      await goto(page);
      // 2000 bytes overflows H (1273) but fits comfortably under L (2953).
      await page.locator('[data-testid="qr-ec-level"]').selectOption('L');
      await page.locator('[data-testid="qr-text"]').fill('a'.repeat(2000));
      await expect(page.locator('[data-testid="qr-canvas-wrap"]')).toBeVisible({ timeout: 10_000 });
      await expect(page.locator('[data-testid="capacity-error"]')).toHaveCount(0);
    });
  });
});
