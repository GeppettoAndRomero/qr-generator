import { describe, it, expect } from 'vitest';
import { detectMode, encodedLength, checkCapacity, CAPACITY } from '@/utils/qrCapacity';

describe('detectMode', () => {
  it('detects numeric-only input', () => {
    expect(detectMode('0123456789')).toBe('numeric');
    expect(detectMode('')).toBe('numeric'); // empty string trivially matches every mode's regex
  });

  it('detects alphanumeric input (QR charset: 0-9, A-Z, space, $%*+-./:)', () => {
    expect(detectMode('HELLO WORLD')).toBe('alphanumeric');
    expect(detectMode('ABC123 $%*+-./:')).toBe('alphanumeric');
  });

  it('falls back to byte mode for lowercase letters', () => {
    expect(detectMode('Hello World')).toBe('byte');
  });

  it('falls back to byte mode for a URL (lowercase + punctuation outside the alphanumeric set)', () => {
    expect(detectMode('https://example.com')).toBe('byte');
  });

  it('falls back to byte mode for non-Latin text', () => {
    expect(detectMode('日本語のテキスト')).toBe('byte');
    expect(detectMode('café')).toBe('byte');
  });
});

describe('encodedLength', () => {
  it('counts one unit per character for numeric mode', () => {
    expect(encodedLength('12345', 'numeric')).toBe(5);
  });

  it('counts one unit per character for alphanumeric mode', () => {
    expect(encodedLength('HELLO', 'alphanumeric')).toBe(5);
  });

  it('counts UTF-8 bytes, not characters, for byte mode', () => {
    expect(encodedLength('hello', 'byte')).toBe(5); // ASCII: 1 byte per char
    expect(encodedLength('café', 'byte')).toBe(5); // 'é' is 2 bytes in UTF-8
    expect(encodedLength('日本語', 'byte')).toBe(9); // each kanji is 3 bytes in UTF-8
  });
});

describe('CAPACITY table', () => {
  // These are the QR Code version-40 (largest symbol) single-segment capacity
  // ceilings per ISO/IEC 18004, cross-checked directly against the `qrcode` library's
  // own encoder (binary search over QRCode.create at each level — see the qr-generator
  // implementation notes). Regression-guard the exact numbers so a future edit can't
  // silently drift from what the encoder actually enforces.
  it('matches the known version-40 capacity figures', () => {
    expect(CAPACITY.numeric).toEqual({ L: 7089, M: 5596, Q: 3993, H: 3057 });
    expect(CAPACITY.alphanumeric).toEqual({ L: 4296, M: 3391, Q: 2420, H: 1852 });
    expect(CAPACITY.byte).toEqual({ L: 2953, M: 2331, Q: 1663, H: 1273 });
  });

  it('orders levels from most to least capacity (L > M > Q > H) for every mode', () => {
    for (const mode of ['numeric', 'alphanumeric', 'byte'] as const) {
      const c = CAPACITY[mode];
      expect(c.L).toBeGreaterThan(c.M);
      expect(c.M).toBeGreaterThan(c.Q);
      expect(c.Q).toBeGreaterThan(c.H);
    }
  });
});

describe('checkCapacity', () => {
  it('fits ordinary short text comfortably at every level', () => {
    for (const ec of ['L', 'M', 'Q', 'H'] as const) {
      const info = checkCapacity('https://runlocally.app/', ec);
      expect(info.fits).toBe(true);
      expect(info.mode).toBe('byte');
    }
  });

  it('reports the exact character count and limit for numeric input at the boundary', () => {
    const atLimit = checkCapacity('1'.repeat(3057), 'H');
    expect(atLimit.fits).toBe(true);
    expect(atLimit.length).toBe(3057);
    expect(atLimit.limit).toBe(3057);

    const overLimit = checkCapacity('1'.repeat(3058), 'H');
    expect(overLimit.fits).toBe(false);
    expect(overLimit.length).toBe(3058);
    expect(overLimit.limit).toBe(3057);
  });

  it('reports byte length (not character count) once text falls back to byte mode', () => {
    // 1600 'é' characters = 3200 UTF-8 bytes, comfortably over the byte/H limit (1273)
    // even though the character count (1600) looks small next to it.
    const info = checkCapacity('é'.repeat(1600), 'H');
    expect(info.mode).toBe('byte');
    expect(info.length).toBe(3200);
    expect(info.fits).toBe(false);
  });

  it('does not fit an input far beyond capacity at the strictest level', () => {
    const info = checkCapacity('a'.repeat(5000), 'H');
    expect(info.fits).toBe(false);
    expect(info.mode).toBe('byte');
    expect(info.limit).toBe(1273);
  });
});
