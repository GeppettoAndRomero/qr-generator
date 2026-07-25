# qr-generator

Turn text or a URL into a QR code, entirely in your browser. Text is processed on
your device and never uploaded. Open source, works offline (PWA).

Part of [runlocally](https://runlocally.app) — small tools that run locally on your device.

## How it works

Whatever you type is encoded directly into a QR code using [qrcode](https://www.npmjs.com/package/qrcode)
(MIT, by soldair) — the live preview is drawn with its `toCanvas` API, and the SVG
download comes from its `toString({ type: 'svg' })` API, so the exported file is
real vector markup rather than a rasterized canvas. There is no shortener and no
redirect step: the code encodes the literal text you typed, unlike some "free" QR
generator sites that quietly route scans through their own server first.

## Features

- Text or URL input, live preview as you type
- Error correction level selector (L / M / Q / H)
- Size selector (small / medium / large)
- Download as PNG (from the canvas) or SVG (real vector markup)
- A clear error — stating the character/byte count and the limit — if the input is
  too large for the chosen error correction level; input is never silently truncated
- No history or persistence: the current draft lives only in memory and is gone on reload
- Works offline (PWA), installable

## Develop

```bash
npm install
npm run dev      # dev server
npm run build    # type-check + production build to dist/
```

Stack: Astro + Preact + TypeScript. Encoding runs on the main thread — QR generation
for ordinary text/URL sizes is fast enough that no Web Worker is needed.

## Browser support

Works in current Chrome, Edge, Firefox and Safari. No WebAssembly and no Web Worker;
the only browser API used beyond `<canvas>` is `Blob`/`URL.createObjectURL` for the
PNG and SVG downloads.

## License

[MIT](./LICENSE). Built and maintained by Geppetto. Some code is written with AI
assistance; all review and decisions are the maintainer's.
