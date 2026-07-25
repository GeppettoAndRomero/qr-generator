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
