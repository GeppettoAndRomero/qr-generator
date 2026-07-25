import type { ToolContent } from './types';

export const en: ToolContent = {
  htmlLang: 'en',

  meta: {
    title: 'Generate a QR Code — No Tracking, PNG/SVG Export | runlocally',
    description:
      'Turn text or a URL into a QR code entirely in your browser. A static code with no redirect or tracking layer. Download as PNG or SVG. Open source, works offline.',
    ogTitle: 'Generate a QR Code — No Tracking, PNG/SVG Export',
    ogDescription:
      'Turn text or a URL into a QR code in your browser. No redirect, no tracking layer. Download as PNG or SVG.',
  },

  hero: {
    h1: 'Generate a QR Code',
    tagline:
      'Turn text or a URL into a QR code, entirely in your browser — no redirect, no tracking, download as PNG or SVG.',
  },

  intro: {
    h2: 'A QR code for exactly what you type',
    paras: [
      'Type or paste text — a web address, a note, anything — and it is encoded directly into a QR code as you type. Choose an error correction level and a size, then download the result as a PNG for quick sharing or an SVG for print and scaling.',
      'This tool is scoped to one job: encode literal text into a QR code and let you download it. There is no link shortener, no built-in scan analytics, and no way to turn a scanned code back into editable data — text in, image out.',
    ],
  },

  privacy: {
    h2: 'Why this QR code has no tracking layer',
    lead:
      'Privacy here is structural, not a promise. There is no upload step because there is no server to upload to:',
    points: [
      'The QR code encodes the literal text you typed — it is not rewritten into a short link or a redirect URL first.',
      "Many \"free\" QR generator websites quietly replace your content with a link to their own server, so every scan is logged before the visitor ever reaches the real destination. This tool has no such layer: there is nothing to route a scan through, because generation happens entirely on your device.",
      'Encoding happens entirely in your browser using an open-source library; the page makes no request carrying your text.',
      'The source is open and anyone can read it (MIT).',
      'It works offline, which is only possible because nothing leaves the device.',
    ],
    note:
      "If you want to check for yourself, open your browser's Network panel while typing — no request carries your text.",
    sourceLinkText: 'Read the source.',
  },

  howto: {
    h2: 'How to use it',
    steps: [
      {
        h3: 'Type or paste your text or URL',
        p: 'Enter anything in the text box — a web address, a note, plain text. Click "Load example" to try it with a sample URL.',
      },
      {
        h3: 'Pick an error correction level',
        p: 'Higher levels (Q, H) keep the code scannable even if part of it is damaged or covered, but leave less room for text. M is a reasonable default for most uses.',
      },
      {
        h3: 'Choose a size',
        p: 'Small, medium, or large — pick whichever fits where the code will be used, from a screen to a printed poster.',
      },
      {
        h3: 'Download the result',
        p: 'PNG suits quick sharing and screens; SVG is a scalable vector file that stays sharp at any print size.',
      },
    ],
  },

  faqHeading: 'FAQ',
  faq: [
    {
      q: 'Does this QR code track who scans it?',
      a: 'No. It encodes your text directly — there is no redirect through a server that could log scans, locations, or timestamps. Some other QR generators replace your content with a link to their own tracking service; this tool has no such service to route through.',
    },
    {
      q: 'Is my text uploaded anywhere?',
      a: 'No. The QR code is generated entirely in your browser. There is no server component, so your text never leaves your device.',
    },
    {
      q: 'What happens if my text is too long?',
      a: 'QR codes have a finite capacity that depends on the error correction level and the kind of text you enter. If your input is too long for the level you picked, the tool shows an error stating exactly how much you entered and the limit — it never silently cuts off your text.',
    },
    {
      q: 'What is the error correction level for?',
      a: 'It controls how much of the code can be damaged, dirty, or partly covered and still scan correctly, at the cost of how much text fits. L holds the most text; H is the most damage-resistant.',
    },
    {
      q: 'PNG or SVG — which should I use?',
      a: 'PNG is a fixed-resolution raster image, good for screens and quick sharing. SVG is a scalable vector file that stays crisp at any size, which suits printing at large sizes or editing in vector tools.',
    },
    {
      q: 'Does it work offline?',
      a: 'Yes. It is a PWA. After the first visit it is cached, so it works without a network connection. You can also install it to your home screen.',
    },
  ],

  footer: {
    openSourceLabel: 'Open source (MIT)',
    partOf: 'part of',
    brandTail: '— small tools that run locally on your device.',
    colophon:
      "Built and maintained by Geppetto. Some code is written with AI assistance; all review and decisions are the maintainer's.",
    securityText: 'Security',
  },
};
