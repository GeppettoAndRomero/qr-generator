import type { ToolContent } from './types';

// Español. Transcreación basada en el vocabulario que usan los generadores de códigos
// QR en español, no traducción literal. Sin palabras publicitarias (fácil / rápido /
// perfecto…); la privacidad se explica de forma estructural, no como promesa. Español
// pan-regional (España y Latinoamérica), registro «tú». htmlLang 'es'.

export const es: ToolContent = {
  htmlLang: 'es',

  meta: {
    title: 'Generar un código QR — sin seguimiento, exporta a PNG/SVG | runlocally',
    description:
      'Convierte texto, una URL o los datos de una red Wi-Fi en un código QR directamente en tu navegador. Un código estático sin redirección ni capa de seguimiento. Descárgalo como PNG o SVG. Código abierto, funciona sin conexión.',
    ogTitle: 'Generar un código QR — sin seguimiento, exporta a PNG/SVG',
    ogDescription:
      'Convierte texto, una URL o una red Wi-Fi en un código QR en tu navegador. Sin redirección, sin seguimiento. Descárgalo como PNG o SVG.',
  },

  hero: {
    h1: 'Generar un código QR',
    tagline:
      'Convierte texto, una URL o los datos de una red Wi-Fi en un código QR, directamente en tu navegador — sin redirección, sin seguimiento, descárgalo como PNG o SVG.',
  },

  intro: {
    h2: 'Un código QR con exactamente lo que escribes',
    paras: [
      'Escribe o pega texto —una dirección web, una nota, lo que sea— y se codifica directamente en un código QR mientras escribes. Elige un nivel de corrección de errores y un tamaño, y descarga el resultado como PNG para compartirlo rápido o como SVG para imprimir y escalar.',
      'Esta herramienta hace una sola cosa: codificar el texto literal en un código QR y dejar que lo descargues. No hay acortador de enlaces, ni estadísticas de escaneo integradas, ni forma de convertir un código ya escaneado de vuelta en datos editables: entra texto, sale una imagen.',
      '¿Necesitas un código QR de Wi-Fi en su lugar? Cambia a la pestaña "Red Wi-Fi" y rellena el nombre de la red, el tipo de seguridad y la contraseña. La misma codificación en tu dispositivo genera el formato estándar de QR de Wi-Fi que las cámaras de los teléfonos reconocen automáticamente, así que escanearlo ofrece unirse a la red directamente.',
    ],
  },

  privacy: {
    h2: 'Por qué este código QR no tiene una capa de seguimiento',
    lead:
      'Aquí la privacidad es estructural, no una promesa. No hay un paso de subida porque no hay ningún servidor al que subir nada:',
    points: [
      'El código QR codifica el texto literal que escribiste; no se reescribe antes en un enlace corto ni en una URL de redirección.',
      'Muchos sitios de generación de códigos QR "gratuitos" sustituyen en secreto tu contenido por un enlace a su propio servidor, de modo que cada escaneo queda registrado antes de que la persona llegue al destino real. Esta herramienta no tiene esa capa: no hay nada por donde hacer pasar un escaneo, porque la generación ocurre por completo en tu dispositivo.',
      'La codificación se hace por completo en tu navegador mediante una biblioteca de código abierto; la página no envía ninguna petición con tu texto.',
      'Lo mismo ocurre en el modo Wi-Fi: la contraseña de la red se integra en el código QR por completo en tu dispositivo y nunca se envía a ningún sitio. Escribir una contraseña de Wi-Fi en un generador basado en subida significa que esa contraseña existió brevemente en el servidor de otra persona; esta herramienta no tiene ningún servidor al que pueda llegar.',
      'El código es abierto y cualquiera puede leerlo (MIT).',
      'Funciona sin conexión, algo que solo es posible porque nada sale del dispositivo.',
    ],
    note:
      'Si quieres comprobarlo tú mismo, abre el panel de Red de tu navegador mientras escribes: ninguna petición lleva tu texto.',
    sourceLinkText: 'Leer el código fuente.',
  },

  howto: {
    h2: 'Cómo se usa',
    steps: [
      {
        h3: 'Escribe tu texto o URL, o cambia a Wi-Fi',
        p: 'Escribe lo que quieras en el cuadro de texto: una dirección web, una nota, texto simple; o haz clic en la pestaña "Red Wi-Fi" para crear en su lugar un código de conexión a partir del nombre de la red, el tipo de seguridad y la contraseña. Haz clic en "Cargar ejemplo" para probar cualquiera de los dos modos con valores de muestra.',
      },
      {
        h3: 'Elige un nivel de corrección de errores',
        p: 'Los niveles más altos (Q, H) mantienen el código legible aunque parte de él esté dañado o cubierto, pero dejan menos espacio para los datos. M es un valor razonable para la mayoría de los casos.',
      },
      {
        h3: 'Elige un tamaño',
        p: 'Pequeño, mediano o grande: elige el que se ajuste a dónde vas a usar el código, desde una pantalla hasta un cartel impreso.',
      },
      {
        h3: 'Descarga el resultado',
        p: 'PNG es ideal para compartir rápido y para pantallas; SVG es un archivo vectorial escalable que se mantiene nítido en cualquier tamaño de impresión.',
      },
    ],
  },

  faqHeading: 'Preguntas frecuentes',
  faq: [
    {
      q: '¿Este código QR rastrea a quien lo escanea?',
      a: 'No. Codifica tu texto directamente; no hay ninguna redirección a través de un servidor que pudiera registrar escaneos, ubicaciones o marcas de tiempo. Algunos otros generadores de códigos QR sustituyen tu contenido por un enlace a su propio servicio de seguimiento; esta herramienta no tiene ningún servicio de ese tipo por el que hacer pasar nada.',
    },
    {
      q: '¿Se sube mi texto a algún sitio?',
      a: 'No. El código QR se genera por completo en tu navegador. No hay ningún componente de servidor, así que tu texto nunca sale de tu dispositivo.',
    },
    {
      q: '¿Puedo generar un código QR para una red Wi-Fi?',
      a: 'Sí — cambia a la pestaña "Red Wi-Fi" e introduce el nombre de la red (SSID), el tipo de seguridad (WPA/WPA2/WPA3, WEP o ninguna) y la contraseña, si la tiene. Al escanear el código resultante con la cámara del teléfono se ofrece unirse a la red directamente, igual que al escanear un código impreso en un router.',
    },
    {
      q: '¿Es seguro escribir mi contraseña de Wi-Fi en esta herramienta?',
      a: 'La contraseña se codifica en el código QR por completo en tu dispositivo, igual que en el modo de texto: no se sube nada, así que la contraseña solo existe en tu navegador y en la imagen resultante. Marca primero "Red oculta" si tu router no difunde su SSID.',
    },
    {
      q: '¿Qué pasa si mi texto es demasiado largo?',
      a: 'Los códigos QR tienen una capacidad limitada que depende del nivel de corrección de errores y del tipo de datos que introduzcas. Si tu contenido es demasiado largo para el nivel elegido, la herramienta muestra un error que indica exactamente cuánto escribiste y cuál es el límite; nunca recorta tu texto en silencio.',
    },
    {
      q: '¿Para qué sirve el nivel de corrección de errores?',
      a: 'Controla cuánta parte del código puede estar dañada, sucia o parcialmente cubierta y aun así poder escanearse correctamente, a costa de cuántos datos caben. L deja espacio para más datos; H es el más resistente a los daños.',
    },
    {
      q: '¿PNG o SVG? ¿Cuál debería usar?',
      a: 'PNG es una imagen rasterizada de resolución fija, buena para pantallas y para compartir rápido. SVG es un archivo vectorial escalable que se mantiene nítido a cualquier tamaño, ideal para imprimir en grande o editar en herramientas vectoriales.',
    },
    {
      q: '¿Funciona sin conexión?',
      a: 'Sí. Es una PWA. Tras la primera visita queda guardada en la caché, por lo que funciona sin conexión a la red. También puedes instalarla en tu pantalla de inicio.',
    },
  ],

  footer: {
    openSourceLabel: 'Código abierto (MIT)',
    partOf: 'parte de',
    brandTail: '— pequeñas herramientas que funcionan localmente en tu dispositivo.',
    colophon:
      'Creado y mantenido por Geppetto. Parte del código se escribe con ayuda de IA; la revisión y las decisiones son del responsable del proyecto.',
    securityText: 'Seguridad',
  },
};
