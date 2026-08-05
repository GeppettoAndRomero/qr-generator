import { describe, it, expect } from 'vitest';
import { escapeWifiField, buildWifiPayload } from '@/utils/wifiPayload';

describe('escapeWifiField', () => {
  it('leaves plain text untouched', () => {
    expect(escapeWifiField('MyHomeWiFi')).toBe('MyHomeWiFi');
    expect(escapeWifiField('hello world 123')).toBe('hello world 123');
  });

  it('escapes each special character with a backslash', () => {
    expect(escapeWifiField('a;b')).toBe('a\\;b');
    expect(escapeWifiField('a,b')).toBe('a\\,b');
    expect(escapeWifiField('a:b')).toBe('a\\:b');
    expect(escapeWifiField('a"b')).toBe('a\\"b');
    expect(escapeWifiField('a\\b')).toBe('a\\\\b');
  });

  it('escapes backslash first so it is not re-escaped by later passes', () => {
    // A literal backslash immediately followed by a semicolon: naive escaping in the
    // wrong order (semicolon first, then backslash) would turn `\;` into `\\\\;`
    // instead of the correct `\\\;`.
    expect(escapeWifiField('a\\;b')).toBe('a\\\\\\;b');
  });

  it('escapes multiple special characters in one value', () => {
    expect(escapeWifiField('My WiFi;2')).toBe('My WiFi\\;2');
    expect(escapeWifiField('p@ss,word')).toBe('p@ss\\,word');
  });
});

describe('buildWifiPayload', () => {
  it('builds a WPA payload with password', () => {
    const payload = buildWifiPayload({ ssid: 'MyNetwork', authType: 'WPA', password: 'secret123', hidden: false });
    expect(payload).toBe('WIFI:T:WPA;S:MyNetwork;P:secret123;;');
  });

  it('builds a WEP payload with password', () => {
    // 'wifi-pass' is not all-hex (has 'w','i','f','-' etc.), so it is not quoted —
    // unlike the hex-only-password case covered separately below.
    const payload = buildWifiPayload({ ssid: 'OldRouter', authType: 'WEP', password: 'wifi-pass', hidden: false });
    expect(payload).toBe('WIFI:T:WEP;S:OldRouter;P:wifi-pass;;');
  });

  it('omits the P field entirely for an open (nopass) network', () => {
    const payload = buildWifiPayload({ ssid: 'CoffeeShop', authType: 'nopass', password: '', hidden: false });
    expect(payload).toBe('WIFI:T:nopass;S:CoffeeShop;;');
    expect(payload).not.toContain('P:');
  });

  it('ignores a typed password when authType is nopass', () => {
    // The UI clears the password field on switching to "None", but the payload
    // builder itself must not leak a stale password either, defense in depth.
    const payload = buildWifiPayload({ ssid: 'CoffeeShop', authType: 'nopass', password: 'leftover', hidden: false });
    expect(payload).toBe('WIFI:T:nopass;S:CoffeeShop;;');
  });

  it('adds H:true only when hidden is set', () => {
    const visible = buildWifiPayload({ ssid: 'Net', authType: 'WPA', password: 'pw', hidden: false });
    expect(visible).not.toContain('H:');

    const hidden = buildWifiPayload({ ssid: 'Net', authType: 'WPA', password: 'pw', hidden: true });
    expect(hidden).toBe('WIFI:T:WPA;S:Net;P:pw;H:true;;');
  });

  it('returns null for an empty SSID', () => {
    expect(buildWifiPayload({ ssid: '', authType: 'nopass', password: '', hidden: false })).toBeNull();
    expect(buildWifiPayload({ ssid: '', authType: 'WPA', password: 'pw', hidden: false })).toBeNull();
  });

  it('returns null when a secured network has no password yet', () => {
    expect(buildWifiPayload({ ssid: 'Net', authType: 'WPA', password: '', hidden: false })).toBeNull();
    expect(buildWifiPayload({ ssid: 'Net', authType: 'WEP', password: '', hidden: false })).toBeNull();
  });

  it('escapes special characters in SSID and password within the assembled payload', () => {
    // The exact example from the Wi-Fi QR format's escaping rule: a semicolon in the
    // SSID and a comma in the password.
    const payload = buildWifiPayload({ ssid: 'My WiFi;2', authType: 'WPA', password: 'p@ss,word', hidden: false });
    expect(payload).toBe('WIFI:T:WPA;S:My WiFi\\;2;P:p@ss\\,word;;');
  });

  it('quotes an SSID that consists entirely of hex digits, to disambiguate from a hex byte string', () => {
    const payload = buildWifiPayload({ ssid: 'ABCDEF', authType: 'nopass', password: '', hidden: false });
    expect(payload).toBe('WIFI:T:nopass;S:"ABCDEF";;');
  });

  it('quotes an all-numeric SSID too, since digits are valid hex characters', () => {
    const payload = buildWifiPayload({ ssid: '123456', authType: 'nopass', password: '', hidden: false });
    expect(payload).toBe('WIFI:T:nopass;S:"123456";;');
  });

  it('does not quote an SSID that mixes hex-looking characters with a non-hex letter', () => {
    const payload = buildWifiPayload({ ssid: 'ABCDEFG', authType: 'nopass', password: '', hidden: false });
    expect(payload).toBe('WIFI:T:nopass;S:ABCDEFG;;');
  });

  it('quotes a hex-only password too', () => {
    const payload = buildWifiPayload({ ssid: 'Net', authType: 'WPA', password: 'deadbeef', hidden: false });
    expect(payload).toBe('WIFI:T:WPA;S:Net;P:"deadbeef";;');
  });

  it('produces a payload that round-trips through a hand-rolled WIFI: parser', () => {
    // Minimal reference parser mirroring the escaping rule, independent of the
    // implementation above — proves the escaping is actually reversible, not just
    // "looks right".
    function parseWifi(payload: string): { ssid: string; password: string } {
      // Strip the `WIFI:` prefix and only the very last `;` of the trailing `;;` —
      // the other one is left in place so it terminates the final field exactly
      // like every other field's separator, instead of needing special-cased
      // "flush the last field after the loop" logic.
      const body = payload.slice('WIFI:'.length, -1);
      const fields: Record<string, string> = {};
      let key = '';
      let value = '';
      let inKey = true;
      let quoted = false;
      for (let i = 0; i < body.length; i++) {
        const c = body[i];
        if (c === '\\' && i + 1 < body.length) {
          value += body[++i];
        } else if (inKey && c === ':') {
          inKey = false;
        } else if (!inKey && c === '"' && value === '') {
          quoted = true;
        } else if (!inKey && c === ';' && !quoted) {
          fields[key] = value;
          key = '';
          value = '';
          inKey = true;
        } else if (!inKey && c === '"' && quoted) {
          quoted = false;
        } else if (inKey) {
          key += c;
        } else {
          value += c;
        }
      }
      return { ssid: fields.S ?? '', password: fields.P ?? '' };
    }

    const ssid = 'Weird "SSID"; with, chars: \\here';
    const password = 'p@\\ss:word,here';
    const payload = buildWifiPayload({ ssid, authType: 'WPA', password, hidden: false })!;
    const parsed = parseWifi(payload);
    expect(parsed.ssid).toBe(ssid);
    expect(parsed.password).toBe(password);
  });
});
