import { type Page, expect } from '@playwright/test';

export const SAMPLE_URL = 'https://runlocally.app/';

/** Wait until the island has hydrated and is ready to drive from a test. */
export async function waitReady(page: Page) {
  await page.waitForFunction(() => (window as Record<string, unknown>).__toolReady === true);
}

/**
 * Type `text` into the input and wait for the (debounced) live preview to render a
 * QR code — i.e. for the canvas to become visible (see QrGeneratorTool.tsx: the
 * `qr-canvas-wrap` div is only shown once `status === 'done'`).
 */
export async function generateQr(page: Page, text: string = SAMPLE_URL) {
  await page.locator('[data-testid="qr-text"]').fill(text);
  await expect(page.locator('[data-testid="qr-canvas-wrap"]')).toBeVisible({ timeout: 10_000 });
}

export const SAMPLE_WIFI = {
  ssid: 'MyHomeWiFi',
  password: 'correct-horse-battery',
};

/**
 * Switches to the "Wi-Fi network" tab, fills the SSID and (unless `security` is
 * 'nopass') the password, and waits for the live preview to render. Leaves the
 * security dropdown at its default (WPA) unless `security` is given.
 */
export async function generateWifiQr(
  page: Page,
  opts: { ssid?: string; password?: string; security?: 'WPA' | 'WEP' | 'nopass'; hidden?: boolean } = {}
) {
  const { ssid = SAMPLE_WIFI.ssid, password = SAMPLE_WIFI.password, security, hidden } = opts;
  await page.locator('[data-testid="mode-tab-wifi"]').click();
  if (security) {
    await page.locator('[data-testid="wifi-security"]').selectOption(security);
  }
  await page.locator('[data-testid="wifi-ssid"]').fill(ssid);
  if (security !== 'nopass') {
    await page.locator('[data-testid="wifi-password"]').fill(password);
  }
  if (hidden) {
    await page.locator('[data-testid="wifi-hidden"]').check();
  }
  await expect(page.locator('[data-testid="qr-canvas-wrap"]')).toBeVisible({ timeout: 10_000 });
}
