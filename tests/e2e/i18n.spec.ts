import { test, expect } from '@playwright/test';
import { waitReady, generateQr } from './_helpers';

// Content routing is engine-independent; one browser is enough.
test.describe('i18n', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'content routing (one engine)');
  });

  for (const loc of [
    { path: '/qr-generator/', lang: 'en' },
    { path: '/qr-generator/ja/', lang: 'ja' },
  ]) {
    test(`generates a QR code on the ${loc.lang} route (#5)`, async ({ page }) => {
      await page.goto(loc.path);
      await waitReady(page);
      await generateQr(page);
    });
  }

  test('serves every locale with the correct <html lang>', async ({ page }) => {
    const expected: Array<[string, string]> = [
      ['/qr-generator/', 'en'],
      ['/qr-generator/ja/', 'ja'],
      ['/qr-generator/zh/', 'zh-Hans'],
      ['/qr-generator/de/', 'de'],
      ['/qr-generator/es/', 'es'],
    ];
    for (const [path, lang] of expected) {
      await page.goto(path);
      expect(await page.getAttribute('html', 'lang'), `lang on ${path}`).toBe(lang);
    }
  });
});
