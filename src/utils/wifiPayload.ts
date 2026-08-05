/**
 * Wi-Fi network QR code payload builder — a pure, dependency-free helper that turns
 * SSID / auth type / password / hidden-network form inputs into the payload string
 * the `qrcode` encoder is given (see QrGeneratorTool.tsx). This module never touches
 * the QR encoder itself; it only builds the text to encode, exactly like typing a URL
 * directly into the plain text/URL mode does.
 *
 * Format — the de-facto standard originated by ZXing and used by Android's/iOS's own
 * "share Wi-Fi" QR feature and virtually every Wi-Fi QR generator:
 *
 *   WIFI:T:<WPA|WEP|nopass>;S:<SSID>;P:<password>;H:<true>;;
 *
 * - T: authentication type. WPA covers WPA/WPA2/WPA3 (readers don't distinguish
 *   further, and neither does this form). WEP for legacy networks. nopass for an
 *   open network with no password.
 * - S: the SSID (network name). Required — there is nothing meaningful to encode
 *   without it.
 * - P: the password. Omitted entirely (not just left empty) when T is nopass — an
 *   empty `P:;` field is ambiguous about whether the network is actually open or
 *   just has a blank password, so open networks carry no P field at all.
 * - H: present as `H:true` only for a hidden (non-broadcasting) network; omitted
 *   otherwise. This matches how readers/generators special-case the hidden flag
 *   only when it is actually set, rather than always emitting `H:false`.
 * - The payload always ends in `;;` (an explicit empty final field), per spec.
 *
 * Escaping: the field delimiters `\ ; , :` and the double quote `"` are meaningful
 * inside S/P and must be backslash-escaped if they occur literally in the SSID or
 * password. The backslash itself must be escaped *first*, before the other four
 * characters — escaping it last would re-escape the backslashes just introduced by
 * escaping `;`/`,`/`:`/`"`, doubling them incorrectly.
 *
 * Hex-only quoting: if the SSID or password consists entirely of hex digits
 * (0-9, A-F/a-f), some readers would otherwise try to interpret it as a literal hex
 * byte string rather than ASCII text. Wrapping the (already-escaped) value in double
 * quotes disambiguates it as text — applied after escaping, so it composes correctly
 * with a value that also happens to contain an escaped character.
 */

export type WifiAuthType = 'WPA' | 'WEP' | 'nopass';

export interface WifiQrInput {
  ssid: string;
  authType: WifiAuthType;
  /** Ignored when authType is 'nopass'. */
  password: string;
  hidden: boolean;
}

// All-hex-digit values (and only those) get quoted, per the format's disambiguation
// rule. An empty string never matches (nothing to disambiguate).
const HEX_ONLY_RE = /^[0-9A-Fa-f]+$/;

/**
 * Escapes `\ ; , : "` for use inside a Wi-Fi QR field (S or P). Exported separately
 * from `buildWifiPayload` so the escaping rule itself can be unit-tested in
 * isolation from the rest of the payload assembly.
 */
export function escapeWifiField(value: string): string {
  // Backslash first — see module docstring on ordering.
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/:/g, '\\:')
    .replace(/"/g, '\\"');
}

function encodeField(value: string): string {
  const escaped = escapeWifiField(value);
  return HEX_ONLY_RE.test(value) ? `"${escaped}"` : escaped;
}

/**
 * Builds the `WIFI:...;;` payload, or returns `null` if the input is not yet
 * complete enough to encode: an empty SSID, or a WPA/WEP network with no password
 * entered. Callers treat `null` the same as an empty text-mode input — show the
 * idle/empty state, never an error, since an incomplete form is not a mistake, just
 * not finished yet.
 */
export function buildWifiPayload({ ssid, authType, password, hidden }: WifiQrInput): string | null {
  if (ssid.length === 0) return null;
  if (authType !== 'nopass' && password.length === 0) return null;

  const fields = [`T:${authType}`, `S:${encodeField(ssid)}`];
  if (authType !== 'nopass') {
    fields.push(`P:${encodeField(password)}`);
  }
  if (hidden) {
    fields.push('H:true');
  }
  return `WIFI:${fields.join(';')};;`;
}
