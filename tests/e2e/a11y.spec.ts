import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { waitReady, generateQr, generateWifiQr } from './_helpers';

// axe inspects the rendered DOM; one engine is representative.
test.describe('accessibility', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'axe runs on one engine');
  });

  for (const path of ['/qr-generator/', '/qr-generator/ja/']) {
    test(`has no serious or critical axe violations on ${path} (#6)`, async ({ page }) => {
      // Disable the decorative fade-in so axe samples the settled (fully-opaque)
      // state, not a mid-animation frame.
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      const blocking = violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical'
      );
      expect(blocking.map((v) => `${v.id} (${v.impact})`)).toEqual([]);
    });

    test(`has no serious or critical axe violations on ${path} with a generated QR code (#6)`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      await waitReady(page);
      await generateQr(page);
      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      const blocking = violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical'
      );
      expect(blocking.map((v) => `${v.id} (${v.impact})`)).toEqual([]);
    });

    test(`has no serious or critical axe violations on ${path} in Wi-Fi mode with a generated code`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      await waitReady(page);
      await generateWifiQr(page);
      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      const blocking = violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical'
      );
      expect(blocking.map((v) => `${v.id} (${v.impact})`)).toEqual([]);
    });
  }
});
