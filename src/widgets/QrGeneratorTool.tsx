/**
 * QrGeneratorTool — the tool's only non-frozen widget.
 *
 * One direction only: text/URL in, QR code image out. Typing (or pasting) into the
 * textarea debounce-generates a live preview ~250ms after the last keystroke, using
 * the `qrcode` npm package (MIT, by soldair) — QR encoding involves Reed-Solomon error
 * correction, which is genuinely easy to get subtly wrong by hand, so this tool does
 * not implement its own encoder. `QRCode.toCanvas` draws the live preview; the SVG
 * download is produced separately via `QRCode.toString({ type: 'svg' })` (see
 * downloadSvg below) so the exported file is real vector markup, not a canvas
 * rasterization.
 *
 * The input is encoded exactly as typed: no shortener, no redirect, no rewriting.
 * That is also why there is no "settings" persistence here (see issue #20's "no
 * history/analytics" decision) — the current draft lives in plain useState and
 * disappears on reload, same as password-generator (issue #21).
 *
 * Capacity: `qrcode` itself is the source of truth for whether an input fits (it does
 * real multi-segment mode optimization). This widget always attempts the real encode
 * first; only if that throws does it consult `qrCapacity.ts` to build a specific
 * "N characters/bytes entered, limit is M" message — never a silent truncation.
 */

import { useState, useEffect, useRef, useCallback } from 'preact/hooks';
import { toCanvas, toString as qrToString } from 'qrcode';
import { AppCard } from './AppCard';
import { ui } from '@/i18n/ui';
import { checkCapacity, type EcLevel } from '@/utils/qrCapacity';

const DEBOUNCE_MS = 250;
const EXAMPLE_TEXT = 'https://runlocally.app/';

type SizeKey = 'small' | 'medium' | 'large';
const SIZE_PX: Record<SizeKey, number> = { small: 256, medium: 512, large: 1024 };

type Status = 'idle' | 'generating' | 'done' | 'error';

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

  const [text, setText] = useState('');
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
  // (re)generate. Empty input just clears the preview — it is not an error.
  useEffect(() => {
    const myToken = ++tokenRef.current;

    if (text.length === 0) {
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
        await toCanvas(canvas, text, { errorCorrectionLevel: ecLevel, width });
        const svg = await qrToString(text, { type: 'svg', errorCorrectionLevel: ecLevel, width });
        if (tokenRef.current !== myToken) return; // superseded by newer input
        setSvgMarkup(svg);
        setStatus('done');
        setErrorMessage(null);
      } catch {
        if (tokenRef.current !== myToken) return;
        setSvgMarkup(null);
        setStatus('error');
        setErrorMessage(buildCapacityMessage(text, ecLevel) || t.errGenerateFailed);
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [text, ecLevel, sizeKey, buildCapacityMessage, t]);

  const downloadPng = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDownloadError(null);
    canvas.toBlob((blob) => {
      if (!blob) {
        setDownloadError(t.downloadError);
        return;
      }
      triggerDownload(blob, 'qr-code.png');
    }, 'image/png');
  }, [t]);

  const downloadSvg = useCallback(() => {
    if (!svgMarkup) return;
    setDownloadError(null);
    try {
      const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
      triggerDownload(blob, 'qr-code.svg');
    } catch {
      setDownloadError(t.downloadError);
    }
  }, [svgMarkup, t]);

  const loadExample = () => {
    setText(EXAMPLE_TEXT);
  };

  const clearText = () => {
    setText('');
    setDownloadError(null);
  };

  const canDownload = status === 'done';

  return (
    <div>
      <AppCard>
        <div style="margin-bottom: var(--space-4);">
          <h2 style="margin: 0 0 var(--space-1) 0; font-size: var(--fs-4); font-weight: 600;">
            {t.inputHeading}
          </h2>
          <p style="margin: 0; font-size: var(--fs-2); color: var(--color-subtle);">{t.inputSubtitle}</p>
        </div>

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
            disabled={text === ''}
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
            {t.previewEmpty}
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
          <canvas ref={canvasRef} data-testid="qr-canvas" aria-label={t.previewAria} />
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
