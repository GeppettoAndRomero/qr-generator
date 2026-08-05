/**
 * QrGeneratorTool — the tool's only non-frozen widget.
 *
 * Two input modes, one output pipeline. "Text or URL" (the original mode) encodes
 * whatever is typed exactly as typed. "Wi-Fi network" builds the standard
 * `WIFI:T:...;S:...;P:...;;` payload (see `utils/wifiPayload.ts`) from a network
 * name, security type, password, and hidden-network flag, then feeds that string
 * through the exact same generation path as plain text — from the encoder's point of
 * view a Wi-Fi QR code is just a specific string, nothing more. Typing (or filling in
 * a form) debounce-generates a live preview ~250ms after the last change, using the
 * `qrcode` npm package (MIT, by soldair) — QR encoding involves Reed-Solomon error
 * correction, which is genuinely easy to get subtly wrong by hand, so this tool does
 * not implement its own encoder. `QRCode.toCanvas` draws the live preview; the SVG
 * download is produced separately via `QRCode.toString({ type: 'svg' })` (see
 * downloadSvg below) so the exported file is real vector markup, not a canvas
 * rasterization.
 *
 * The input is encoded exactly as typed/entered: no shortener, no redirect, no
 * rewriting. That is also why there is no "settings" persistence here (see issue
 * #20's "no history/analytics" decision) — the current draft (in either mode) lives
 * in plain useState and disappears on reload, same as password-generator (issue #21).
 * This matters more in Wi-Fi mode than in text mode: the password field is never
 * written anywhere but this in-memory state and the resulting QR image.
 *
 * Capacity: `qrcode` itself is the source of truth for whether an input fits (it does
 * real multi-segment mode optimization). This widget always attempts the real encode
 * first; only if that throws does it consult `qrCapacity.ts` to build a specific
 * "N characters/bytes entered, limit is M" message — never a silent truncation. This
 * applies identically to the assembled Wi-Fi payload string.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'preact/hooks';
import { toCanvas, toString as qrToString } from 'qrcode';
import { AppCard } from './AppCard';
import { ui } from '@/i18n/ui';
import { checkCapacity, type EcLevel } from '@/utils/qrCapacity';
import { buildWifiPayload, type WifiAuthType } from '@/utils/wifiPayload';

const DEBOUNCE_MS = 250;
const EXAMPLE_TEXT = 'https://runlocally.app/';
const EXAMPLE_WIFI = { ssid: 'MyHomeWiFi', authType: 'WPA' as WifiAuthType, password: 'correct-horse-battery', hidden: false };

type SizeKey = 'small' | 'medium' | 'large';
const SIZE_PX: Record<SizeKey, number> = { small: 256, medium: 512, large: 1024 };

type Status = 'idle' | 'generating' | 'done' | 'error';
type Mode = 'text' | 'wifi';

interface QrGeneratorToolProps {
  locale?: string;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function QrGeneratorTool({ locale = 'en' }: QrGeneratorToolProps) {
  const t = (ui as any)[locale] ?? ui.en;

  const [mode, setMode] = useState<Mode>('text');
  const [text, setText] = useState('');

  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiAuthType, setWifiAuthType] = useState<WifiAuthType>('WPA');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiHidden, setWifiHidden] = useState(false);
  const [revealWifiPassword, setRevealWifiPassword] = useState(false);

  const [ecLevel, setEcLevel] = useState<EcLevel>('M');
  const [sizeKey, setSizeKey] = useState<SizeKey>('medium');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Bumped whenever an input that affects generation changes; async generation
  // callbacks compare against it to discard results for input that is no longer
  // current (race guard against out-of-order debounced encodes).
  const tokenRef = useRef(0);

  useEffect(() => {
    (globalThis as Record<string, unknown>).__toolReady = true;
  }, []);

  // The single string actually handed to the encoder, regardless of which mode built
  // it. In wifi mode this is '' whenever the form is not yet complete enough to mean
  // anything (no SSID yet, or a secured network with no password yet) — treated
  // exactly like empty text-mode input: idle, not an error, because an unfinished
  // form is not a mistake.
  const payload = useMemo(() => {
    if (mode === 'text') return text;
    return (
      buildWifiPayload({ ssid: wifiSsid, authType: wifiAuthType, password: wifiPassword, hidden: wifiHidden }) ?? ''
    );
  }, [mode, text, wifiSsid, wifiAuthType, wifiPassword, wifiHidden]);

  const buildCapacityMessage = useCallback(
    (input: string, ec: EcLevel): string => {
      const info = checkCapacity(input, ec);
      const template = info.mode === 'byte' ? t.capacityErrorBytes : t.capacityErrorChars;
      return template
        .replace('{ec}', ec)
        .replace('{count}', String(info.length))
        .replace('{limit}', String(info.limit));
    },
    [t]
  );

  // Debounced live preview: ~250ms after the last keystroke or setting change,
  // (re)generate. Empty payload just clears the preview — it is not an error.
  useEffect(() => {
    const myToken = ++tokenRef.current;

    if (payload.length === 0) {
      setStatus('idle');
      setErrorMessage(null);
      setSvgMarkup(null);
      setDownloadError(null);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    setStatus('generating');
    const timer = setTimeout(async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const width = SIZE_PX[sizeKey];
      try {
        // margin is left at the library default (4 modules) — the QR spec's
        // recommended quiet zone, needed for reliable scanning; shrinking it is not
        // worth the scan-reliability risk for a purely cosmetic size gain.
        await toCanvas(canvas, payload, { errorCorrectionLevel: ecLevel, width });
        const svg = await qrToString(payload, { type: 'svg', errorCorrectionLevel: ecLevel, width });
        if (tokenRef.current !== myToken) return; // superseded by newer input
        setSvgMarkup(svg);
        setStatus('done');
        setErrorMessage(null);
      } catch {
        if (tokenRef.current !== myToken) return;
        setSvgMarkup(null);
        setStatus('error');
        setErrorMessage(buildCapacityMessage(payload, ecLevel) || t.errGenerateFailed);
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [payload, ecLevel, sizeKey, buildCapacityMessage, t]);

  const downloadFilenamePrefix = mode === 'wifi' ? 'wifi-qr-code' : 'qr-code';

  const downloadPng = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDownloadError(null);
    canvas.toBlob((blob) => {
      if (!blob) {
        setDownloadError(t.downloadError);
        return;
      }
      triggerDownload(blob, `${downloadFilenamePrefix}.png`);
    }, 'image/png');
  }, [t, downloadFilenamePrefix]);

  const downloadSvg = useCallback(() => {
    if (!svgMarkup) return;
    setDownloadError(null);
    try {
      const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
      triggerDownload(blob, `${downloadFilenamePrefix}.svg`);
    } catch {
      setDownloadError(t.downloadError);
    }
  }, [svgMarkup, t, downloadFilenamePrefix]);

  const loadExample = () => {
    if (mode === 'wifi') {
      setWifiSsid(EXAMPLE_WIFI.ssid);
      setWifiAuthType(EXAMPLE_WIFI.authType);
      setWifiPassword(EXAMPLE_WIFI.password);
      setWifiHidden(EXAMPLE_WIFI.hidden);
    } else {
      setText(EXAMPLE_TEXT);
    }
  };

  const clearText = () => {
    if (mode === 'wifi') {
      setWifiSsid('');
      setWifiAuthType('WPA');
      setWifiPassword('');
      setWifiHidden(false);
      setRevealWifiPassword(false);
    } else {
      setText('');
    }
    setDownloadError(null);
  };

  const canDownload = status === 'done';
  const wifiPasswordRequired = wifiAuthType !== 'nopass';
  const clearDisabled = mode === 'wifi' ? wifiSsid === '' && wifiPassword === '' : text === '';
  const passwordInputType = revealWifiPassword ? 'text' : 'password';

  return (
    <div>
      <AppCard>
        <div style="margin-bottom: var(--space-4);">
          <h2 style="margin: 0 0 var(--space-1) 0; font-size: var(--fs-4); font-weight: 600;">
            {mode === 'wifi' ? t.inputHeadingWifi : t.inputHeading}
          </h2>
          <p style="margin: 0; font-size: var(--fs-2); color: var(--color-subtle);">
            {mode === 'wifi' ? t.inputSubtitleWifi : t.inputSubtitle}
          </p>
        </div>

        <div role="tablist" aria-label={t.modeTablistLabel} class="qr-mode-tabs">
          <button
            type="button"
            role="tab"
            id="mode-tab-text"
            data-testid="mode-tab-text"
            aria-selected={mode === 'text'}
            class={`app-button app-button--${mode === 'text' ? 'primary' : 'secondary'}`}
            onClick={() => setMode('text')}
          >
            {t.tabText}
          </button>
          <button
            type="button"
            role="tab"
            id="mode-tab-wifi"
            data-testid="mode-tab-wifi"
            aria-selected={mode === 'wifi'}
            class={`app-button app-button--${mode === 'wifi' ? 'primary' : 'secondary'}`}
            onClick={() => setMode('wifi')}
          >
            {t.tabWifi}
          </button>
        </div>

        {mode === 'text' && (
          <div>
            <label class="visually-hidden" for="qr-text">
              {t.textLabel}
            </label>
            <textarea
              id="qr-text"
              data-testid="qr-text"
              class="app-field__textarea"
              style="width: 100%; min-height: 140px; font-size: var(--fs-2);"
              value={text}
              placeholder={t.textPlaceholder}
              spellcheck={false}
              onInput={(e) => setText((e.currentTarget as HTMLTextAreaElement).value)}
            />
          </div>
        )}

        {mode === 'wifi' && (
          <div class="qr-wifi-fields">
            <div class="qr-field">
              <label class="app-field__label" for="wifi-ssid">
                {t.wifiSsidLabel}
                <span class="app-field__required">{t.required}</span>
              </label>
              <input
                id="wifi-ssid"
                data-testid="wifi-ssid"
                type="text"
                class="app-field__input"
                style="width: 100%;"
                value={wifiSsid}
                placeholder={t.wifiSsidPlaceholder}
                autocomplete="off"
                spellcheck={false}
                onInput={(e) => setWifiSsid((e.currentTarget as HTMLInputElement).value)}
              />
            </div>

            <div class="qr-field">
              <label class="app-field__label" for="wifi-security">
                {t.wifiSecurityLabel}
              </label>
              <select
                id="wifi-security"
                data-testid="wifi-security"
                class="app-field__input"
                value={wifiAuthType}
                onChange={(e) => {
                  const next = (e.currentTarget as HTMLSelectElement).value as WifiAuthType;
                  setWifiAuthType(next);
                  if (next === 'nopass') {
                    setWifiPassword('');
                    setRevealWifiPassword(false);
                  }
                }}
              >
                <option value="WPA">{t.wifiSecurityWpaLabel}</option>
                <option value="WEP">{t.wifiSecurityWepLabel}</option>
                <option value="nopass">{t.wifiSecurityNopassLabel}</option>
              </select>
            </div>

            {wifiPasswordRequired && (
              <div class="qr-field">
                <label class="app-field__label" for="wifi-password">
                  {t.wifiPasswordLabel}
                  <span class="app-field__required">{t.required}</span>
                </label>
                <div class="qr-wifi-password-row">
                  <input
                    id="wifi-password"
                    data-testid="wifi-password"
                    type={passwordInputType}
                    class="app-field__input"
                    style="flex: 1;"
                    value={wifiPassword}
                    placeholder={t.wifiPasswordPlaceholder}
                    autocomplete="off"
                    spellcheck={false}
                    onInput={(e) => setWifiPassword((e.currentTarget as HTMLInputElement).value)}
                  />
                  <button
                    type="button"
                    id="wifi-password-reveal-action"
                    data-testid="wifi-password-reveal"
                    aria-label={revealWifiPassword ? t.hidePassword : t.showPassword}
                    aria-pressed={revealWifiPassword}
                    class="app-button app-button--secondary"
                    onClick={() => setRevealWifiPassword((v) => !v)}
                  >
                    {revealWifiPassword ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
            )}

            <label class="checkbox-field" for="wifi-hidden">
              <input
                id="wifi-hidden"
                data-testid="wifi-hidden"
                type="checkbox"
                checked={wifiHidden}
                onChange={(e) => setWifiHidden((e.currentTarget as HTMLInputElement).checked)}
              />
              <span>{t.wifiHiddenLabel}</span>
            </label>
          </div>
        )}

        {/* EC level and size apply identically in both modes — one shared control
            block regardless of which mode is active. */}
        <div class="qr-controls">
          <div class="qr-field">
            <label class="app-field__label" for="qr-ec-level">
              {t.ecLabel}
            </label>
            <select
              id="qr-ec-level"
              data-testid="qr-ec-level"
              class="app-field__input"
              value={ecLevel}
              onChange={(e) => setEcLevel((e.currentTarget as HTMLSelectElement).value as EcLevel)}
            >
              <option value="L">{t.ecLLabel}</option>
              <option value="M">{t.ecMLabel}</option>
              <option value="Q">{t.ecQLabel}</option>
              <option value="H">{t.ecHLabel}</option>
            </select>
            <div class="app-field__help">{t.ecHelp}</div>
          </div>

          <div class="qr-field">
            <label class="app-field__label" for="qr-size">
              {t.sizeLabel}
            </label>
            <select
              id="qr-size"
              data-testid="qr-size"
              class="app-field__input"
              value={sizeKey}
              onChange={(e) => setSizeKey((e.currentTarget as HTMLSelectElement).value as SizeKey)}
            >
              <option value="small">{t.sizeSmallLabel}</option>
              <option value="medium">{t.sizeMediumLabel}</option>
              <option value="large">{t.sizeLargeLabel}</option>
            </select>
          </div>
        </div>

        <div
          style="display: flex; justify-content: flex-end; gap: var(--space-2); flex-wrap: wrap; margin-top: var(--space-3);"
        >
          <button
            id="load-example-action"
            type="button"
            class="app-button app-button--secondary"
            onClick={loadExample}
          >
            {t.loadExample}
          </button>
          <button
            id="clear-action"
            type="button"
            class="app-button app-button--ghost"
            onClick={clearText}
            disabled={clearDisabled}
          >
            {t.clear}
          </button>
        </div>
      </AppCard>

      <AppCard className="mt-6">
        <div style="margin-bottom: var(--space-4);">
          <h2 style="margin: 0 0 var(--space-1) 0; font-size: var(--fs-4); font-weight: 600;">
            {t.previewHeading}
          </h2>
        </div>

        {status === 'idle' && (
          <p role="status" data-testid="qr-status" style="margin: 0 0 var(--space-3) 0; font-size: var(--fs-2); color: var(--color-subtle);">
            {mode === 'wifi' ? t.previewEmptyWifi : t.previewEmpty}
          </p>
        )}
        {status === 'generating' && (
          <p role="status" data-testid="qr-status" style="margin: 0 0 var(--space-3) 0; font-size: var(--fs-2); color: var(--color-subtle);">
            {t.statusGenerating}
          </p>
        )}
        {status === 'error' && errorMessage && (
          <p role="alert" data-testid="capacity-error" style="margin: 0 0 var(--space-3) 0; font-size: var(--fs-2); color: var(--color-danger);">
            {errorMessage}
          </p>
        )}

        {/* The canvas stays mounted at all times (never conditionally unmounted) so
            canvasRef is always available the instant a generation completes — only
            its visibility toggles with status. */}
        <div
          class="qr-canvas-wrap"
          data-testid="qr-canvas-wrap"
          style={{ display: status === 'done' ? 'inline-block' : 'none' }}
        >
          <canvas ref={canvasRef} data-testid="qr-canvas" aria-label={mode === 'wifi' ? t.wifiPreviewAria : t.previewAria} />
        </div>

        <div style="display: flex; gap: var(--space-2); margin-top: var(--space-4); flex-wrap: wrap;">
          <button
            id="download-png-action"
            type="button"
            class="app-button app-button--primary"
            onClick={downloadPng}
            disabled={!canDownload}
          >
            {t.downloadPng}
          </button>
          <button
            id="download-svg-action"
            type="button"
            class="app-button app-button--secondary"
            onClick={downloadSvg}
            disabled={!canDownload}
          >
            {t.downloadSvg}
          </button>
        </div>

        {downloadError && (
          <p role="alert" data-testid="download-error" style="color: var(--color-danger); font-size: var(--fs-1); margin: var(--space-2) 0 0 0;">
            {downloadError}
          </p>
        )}
      </AppCard>

      <style>{`
        .qr-mode-tabs {
          display: flex;
          gap: var(--space-2);
          margin-bottom: var(--space-4);
          flex-wrap: wrap;
        }
        .qr-controls {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
          margin-top: var(--space-4);
        }
        @media (max-width: 640px) {
          .qr-controls {
            grid-template-columns: 1fr;
          }
        }
        .qr-field {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        .qr-wifi-fields {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        .qr-wifi-password-row {
          display: flex;
          gap: var(--space-2);
        }
        .checkbox-field {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          cursor: pointer;
          user-select: none;
          font-size: var(--fs-2);
          color: var(--color-text);
        }
        .checkbox-field input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: var(--color-primary);
        }
        .checkbox-field:hover {
          color: var(--color-primary);
        }
        .qr-canvas-wrap {
          background: #ffffff;
          padding: var(--space-4);
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border);
          line-height: 0;
        }
        .qr-canvas-wrap canvas {
          max-width: 100%;
          height: auto;
          display: block;
        }
        .visually-hidden {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      `}</style>
    </div>
  );
}
