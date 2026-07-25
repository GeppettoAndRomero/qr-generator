# Third-party notices

The source code in this repository is licensed under the [MIT License](./LICENSE).
It depends on the following third-party component, distributed under its own
permissive license. That component keeps its own license; only its attribution
and the rights it grants you are recorded here.

## qrcode — MIT

Copyright (c) 2012 Ryan Day

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

- **Package:** [`qrcode`](https://www.npmjs.com/package/qrcode) (by soldair)
- **What it does here:** `toCanvas` renders the live preview and `toString({ type:
  'svg' })` produces the SVG export, in `src/widgets/QrGeneratorTool.tsx`. QR
  encoding involves Reed–Solomon error correction, which this project does not
  reimplement.
- **Modifications:** none. Used unmodified, as an npm dependency.

---

Other dependencies — Astro, Preact, and @astrojs/preact — are distributed under the MIT License.
