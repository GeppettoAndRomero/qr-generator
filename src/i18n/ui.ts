/**
 * Preact island (client UI) copy, per locale.
 *
 * Separate from the page-level content (`en.ts` / `ja.ts` / …), which is the SEO/body
 * copy rendered by Astro. This file is the strings the interactive island itself
 * shows.
 *
 * Important: the island receives `locale` as a PROP (present at SSR time) and never
 * reads it from `document`/`navigator`, so the server and the first client render
 * produce identical markup (no hydration mismatch).
 *
 * Interpolated strings use a `{name}` template; the island does
 * `.replace('{name}', value)`.
 */
export const ui = {
  en: {
    // QrGeneratorTool
    inputHeading: 'Enter text or a URL',
    inputSubtitle:
      'Type or paste anything — a web address, a note, plain text. It is encoded exactly as typed, with nothing added.',
    textLabel: 'Text or URL',
    textPlaceholder: 'https://example.com or any text…',
    ecLabel: 'Error correction level',
    ecLLabel: 'L — Low (~7% recovery)',
    ecMLabel: 'M — Medium (~15% recovery)',
    ecQLabel: 'Q — Quartile (~25% recovery)',
    ecHLabel: 'H — High (~30% recovery)',
    ecHelp:
      'Higher levels stay scannable even if part of the code is damaged or covered, at the cost of some capacity for text.',
    sizeLabel: 'Size',
    sizeSmallLabel: 'Small (256 px)',
    sizeMediumLabel: 'Medium (512 px)',
    sizeLargeLabel: 'Large (1024 px)',
    loadExample: 'Load example',
    clear: 'Clear',
    previewHeading: 'QR code',
    previewEmpty: 'Type something above to generate a QR code.',
    statusGenerating: 'Generating…',
    previewAria: 'Generated QR code',
    downloadPng: 'Download PNG',
    downloadSvg: 'Download SVG',
    downloadError: 'Download failed. Please try again.',
    errGenerateFailed: 'Could not generate a QR code for this input.',
    capacityErrorChars:
      'Too much text for error correction level {ec}: {count} characters entered, the limit is {limit}. Choose a lower error correction level or shorten the text.',
    capacityErrorBytes:
      'Too much text for error correction level {ec}: {count} bytes entered (letters outside basic Latin use more than one byte each), the limit is {limit} bytes. Choose a lower error correction level or shorten the text.',

    // InstallPrompt
    installHeading: 'Install app',
    installBody: 'Add to your home screen for quick access.',
    install: 'Install',
    later: 'Later',

    // ThemeToggle
    themeToLight: 'Switch to light mode',
    themeToDark: 'Switch to dark mode',
    themeLabel: 'Theme',

    // shared
    close: 'Close',
    required: 'Required',
  },
  ja: {
    // QrGeneratorTool
    inputHeading: 'テキストまたは URL を入力',
    inputSubtitle:
      '好きな文字列を入力・貼り付けしてください — URL、メモ、任意のテキスト。入力した内容がそのままエンコードされ、余計な変換は加えられません。',
    textLabel: 'テキストまたは URL',
    textPlaceholder: 'https://example.com または任意のテキスト…',
    ecLabel: '誤り訂正レベル',
    ecLLabel: 'L — 低（復元率 約7%）',
    ecMLabel: 'M — 標準（復元率 約15%）',
    ecQLabel: 'Q — 中高（復元率 約25%）',
    ecHLabel: 'H — 高（復元率 約30%）',
    ecHelp:
      'レベルを上げるほど、コードの一部が汚れたり隠れたりしても読み取りやすくなりますが、その分テキストに使える容量は減ります。',
    sizeLabel: 'サイズ',
    sizeSmallLabel: '小（256px）',
    sizeMediumLabel: '中（512px）',
    sizeLargeLabel: '大（1024px）',
    loadExample: '例を読み込む',
    clear: 'クリア',
    previewHeading: 'QR コード',
    previewEmpty: '上に何か入力すると QR コードが生成されます。',
    statusGenerating: '生成中…',
    previewAria: '生成された QR コード',
    downloadPng: 'PNG をダウンロード',
    downloadSvg: 'SVG をダウンロード',
    downloadError: 'ダウンロードに失敗しました。もう一度お試しください。',
    errGenerateFailed: 'この入力内容から QR コードを生成できませんでした。',
    capacityErrorChars:
      '誤り訂正レベル {ec} には文字数が多すぎます: 入力は {count} 文字、上限は {limit} 文字です。誤り訂正レベルを下げるか、テキストを短くしてください。',
    capacityErrorBytes:
      '誤り訂正レベル {ec} にはデータ量が多すぎます: 入力は {count} バイト（英数字以外の文字は1文字あたり複数バイトになります）、上限は {limit} バイトです。誤り訂正レベルを下げるか、テキストを短くしてください。',

    // InstallPrompt
    installHeading: 'アプリを追加',
    installBody: 'ホーム画面に追加すると、すぐに開けます。',
    install: '追加',
    later: 'あとで',

    // ThemeToggle
    themeToLight: 'ライトモードに切り替え',
    themeToDark: 'ダークモードに切り替え',
    themeLabel: 'テーマ',

    // shared
    close: '閉じる',
    required: '必須',
  },
  zh: {
    // QrGeneratorTool
    inputHeading: '输入文本或网址',
    inputSubtitle: '输入或粘贴任意内容——网址、备忘、纯文本。系统会原样编码你输入的内容，不做任何改动。',
    textLabel: '文本或网址',
    textPlaceholder: 'https://example.com 或任意文本…',
    ecLabel: '纠错等级',
    ecLLabel: 'L — 低（约 7% 可恢复）',
    ecMLabel: 'M — 中（约 15% 可恢复）',
    ecQLabel: 'Q — 较高（约 25% 可恢复）',
    ecHLabel: 'H — 高（约 30% 可恢复）',
    ecHelp: '等级越高，二维码部分受损或被遮挡时也越容易扫描成功，但可容纳的文本量会相应减少。',
    sizeLabel: '尺寸',
    sizeSmallLabel: '小（256px）',
    sizeMediumLabel: '中（512px）',
    sizeLargeLabel: '大（1024px）',
    loadExample: '加载示例',
    clear: '清除',
    previewHeading: '二维码',
    previewEmpty: '在上方输入内容即可生成二维码。',
    statusGenerating: '生成中…',
    previewAria: '生成的二维码',
    downloadPng: '下载 PNG',
    downloadSvg: '下载 SVG',
    downloadError: '下载失败，请重试。',
    errGenerateFailed: '无法为此内容生成二维码。',
    capacityErrorChars:
      '纠错等级 {ec} 下文本过多：已输入 {count} 个字符，上限为 {limit} 个字符。请降低纠错等级或缩短文本。',
    capacityErrorBytes:
      '纠错等级 {ec} 下数据量过多：已输入 {count} 字节（非基本拉丁字母的字符每个占用多个字节），上限为 {limit} 字节。请降低纠错等级或缩短文本。',

    // InstallPrompt
    installHeading: '安装应用',
    installBody: '添加到主屏幕，方便随时打开。',
    install: '安装',
    later: '以后再说',

    // ThemeToggle
    themeToLight: '切换到浅色模式',
    themeToDark: '切换到深色模式',
    themeLabel: '主题',

    // shared
    close: '关闭',
    required: '必填',
  },
  de: {
    // QrGeneratorTool
    inputHeading: 'Text oder URL eingeben',
    inputSubtitle:
      'Gib etwas ein oder füge es ein — eine Webadresse, eine Notiz, einfachen Text. Er wird genau so codiert, wie du ihn eingegeben hast, ohne etwas hinzuzufügen.',
    textLabel: 'Text oder URL',
    textPlaceholder: 'https://example.com oder ein beliebiger Text…',
    ecLabel: 'Fehlerkorrekturstufe',
    ecLLabel: 'L — Niedrig (~7% Wiederherstellung)',
    ecMLabel: 'M — Mittel (~15% Wiederherstellung)',
    ecQLabel: 'Q — Hoch-mittel (~25% Wiederherstellung)',
    ecHLabel: 'H — Hoch (~30% Wiederherstellung)',
    ecHelp:
      'Höhere Stufen bleiben auch dann scanbar, wenn ein Teil des Codes beschädigt oder verdeckt ist — dafür bleibt etwas weniger Platz für Text.',
    sizeLabel: 'Größe',
    sizeSmallLabel: 'Klein (256 px)',
    sizeMediumLabel: 'Mittel (512 px)',
    sizeLargeLabel: 'Groß (1024 px)',
    loadExample: 'Beispiel laden',
    clear: 'Leeren',
    previewHeading: 'QR-Code',
    previewEmpty: 'Gib oben etwas ein, um einen QR-Code zu erzeugen.',
    statusGenerating: 'Wird erzeugt …',
    previewAria: 'Erzeugter QR-Code',
    downloadPng: 'PNG herunterladen',
    downloadSvg: 'SVG herunterladen',
    downloadError: 'Download fehlgeschlagen. Bitte versuche es erneut.',
    errGenerateFailed: 'Für diese Eingabe konnte kein QR-Code erzeugt werden.',
    capacityErrorChars:
      'Zu viel Text für Fehlerkorrekturstufe {ec}: {count} Zeichen eingegeben, das Limit liegt bei {limit}. Wähle eine niedrigere Fehlerkorrekturstufe oder kürze den Text.',
    capacityErrorBytes:
      'Zu viele Daten für Fehlerkorrekturstufe {ec}: {count} Bytes eingegeben (Zeichen außerhalb des einfachen lateinischen Alphabets belegen jeweils mehr als ein Byte), das Limit liegt bei {limit} Bytes. Wähle eine niedrigere Fehlerkorrekturstufe oder kürze den Text.',

    // InstallPrompt
    installHeading: 'App installieren',
    installBody: 'Zum Startbildschirm hinzufügen, um es direkt zu öffnen.',
    install: 'Installieren',
    later: 'Später',

    // ThemeToggle
    themeToLight: 'Zum hellen Modus wechseln',
    themeToDark: 'Zum dunklen Modus wechseln',
    themeLabel: 'Design',

    // shared
    close: 'Schließen',
    required: 'Erforderlich',
  },
  es: {
    // QrGeneratorTool
    inputHeading: 'Escribe un texto o una URL',
    inputSubtitle:
      'Escribe o pega lo que quieras: una dirección web, una nota, texto simple. Se codifica tal cual lo escribiste, sin añadir nada.',
    textLabel: 'Texto o URL',
    textPlaceholder: 'https://example.com o cualquier texto…',
    ecLabel: 'Nivel de corrección de errores',
    ecLLabel: 'L — Bajo (~7% de recuperación)',
    ecMLabel: 'M — Medio (~15% de recuperación)',
    ecQLabel: 'Q — Cuartil (~25% de recuperación)',
    ecHLabel: 'H — Alto (~30% de recuperación)',
    ecHelp:
      'Los niveles más altos siguen siendo legibles aunque parte del código esté dañado o cubierto, a costa de algo menos de espacio para el texto.',
    sizeLabel: 'Tamaño',
    sizeSmallLabel: 'Pequeño (256 px)',
    sizeMediumLabel: 'Mediano (512 px)',
    sizeLargeLabel: 'Grande (1024 px)',
    loadExample: 'Cargar ejemplo',
    clear: 'Borrar',
    previewHeading: 'Código QR',
    previewEmpty: 'Escribe algo arriba para generar un código QR.',
    statusGenerating: 'Generando…',
    previewAria: 'Código QR generado',
    downloadPng: 'Descargar PNG',
    downloadSvg: 'Descargar SVG',
    downloadError: 'La descarga falló. Inténtalo de nuevo.',
    errGenerateFailed: 'No se pudo generar un código QR para este contenido.',
    capacityErrorChars:
      'Demasiado texto para el nivel de corrección {ec}: se introdujeron {count} caracteres, el límite es {limit}. Elige un nivel de corrección más bajo o acorta el texto.',
    capacityErrorBytes:
      'Demasiados datos para el nivel de corrección {ec}: se introdujeron {count} bytes (los caracteres fuera del latín básico ocupan más de un byte cada uno), el límite es {limit} bytes. Elige un nivel de corrección más bajo o acorta el texto.',

    // InstallPrompt
    installHeading: 'Instalar la app',
    installBody: 'Añádela a tu pantalla de inicio para tenerla siempre a mano.',
    install: 'Instalar',
    later: 'Más tarde',

    // ThemeToggle
    themeToLight: 'Cambiar al modo claro',
    themeToDark: 'Cambiar al modo oscuro',
    themeLabel: 'Tema',

    // shared
    close: 'Cerrar',
    required: 'Obligatorio',
  },
} as const;

export type UiStrings = (typeof ui)['en'];
