/**
 * QR Code capacity checking — a pure, dependency-free helper used only to build a
 * clear, specific error message once the `qrcode` encoder has already rejected an
 * input as too large. It is deliberately NOT the gate that decides whether to call
 * the encoder: the encoder (which does real multi-mode segment optimization) is the
 * single source of truth for whether an input actually fits. See QrGeneratorTool.tsx.
 *
 * Background (ISO/IEC 18004): a QR symbol encodes data in one of a few modes —
 * numeric, alphanumeric (a small uppercase charset), or byte (arbitrary UTF-8) — and
 * capacity depends on both the mode and the error-correction level (L/M/Q/H: higher
 * correction means more redundancy, so less room for data). This module estimates the
 * best-fitting *single* mode for a whole input and reports the version-40 (the largest
 * symbol size) capacity ceiling for that mode/level pair — the same numbers the
 * `qrcode` library itself enforces (cross-checked in qrCapacity.test.ts and in the
 * library's own behavior).
 */

export type EcLevel = 'L' | 'M' | 'Q' | 'H';
export type QrMode = 'numeric' | 'alphanumeric' | 'byte';

// QR "Alphanumeric" mode charset (ISO/IEC 18004 Table 5): 0-9, A-Z (uppercase only),
// space, and $ % * + - . / :
const NUMERIC_RE = /^[0-9]*$/;
const ALPHANUMERIC_RE = /^[0-9A-Z $%*+\-./:]*$/;

/** Best-fitting single QR encoding mode for the whole input. */
export function detectMode(text: string): QrMode {
  if (NUMERIC_RE.test(text)) return 'numeric';
  if (ALPHANUMERIC_RE.test(text)) return 'alphanumeric';
  return 'byte';
}

/**
 * The length unit the QR encoder actually counts against capacity for `mode`:
 * a character for numeric/alphanumeric (both are ASCII-only subsets, so one
 * character costs exactly one unit), or a UTF-8 byte for byte mode (arbitrary
 * Unicode text — e.g. one accented letter, kanji character, or emoji — costs
 * more than one byte).
 */
export function encodedLength(text: string, mode: QrMode): number {
  if (mode === 'byte') return new TextEncoder().encode(text).length;
  return text.length;
}

/**
 * Maximum single-segment capacity at QR version 40 (the largest symbol), the most
 * generous case for each mode/error-correction-level pair. A real input may span
 * multiple mode segments and in rare mixed-content cases fit slightly more than this;
 * these numbers are a conservative ceiling used only for the error message, never to
 * silently allow or reject an input by themselves.
 */
export const CAPACITY: Record<QrMode, Record<EcLevel, number>> = {
  numeric: { L: 7089, M: 5596, Q: 3993, H: 3057 },
  alphanumeric: { L: 4296, M: 3391, Q: 2420, H: 1852 },
  byte: { L: 2953, M: 2331, Q: 1663, H: 1273 },
};

export interface CapacityInfo {
  mode: QrMode;
  /** Character count (numeric/alphanumeric) or UTF-8 byte count (byte mode). */
  length: number;
  limit: number;
  fits: boolean;
}

export function checkCapacity(text: string, ec: EcLevel): CapacityInfo {
  const mode = detectMode(text);
  const length = encodedLength(text, mode);
  const limit = CAPACITY[mode][ec];
  return { mode, length, limit, fits: length <= limit };
}
