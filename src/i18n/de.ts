import type { ToolContent } from './types';

// Deutsch. Keine Wort-für-Wort-Übersetzung, sondern Transkreation auf Basis der
// Begriffe und Wendungen, die deutsche QR-Code-Generatoren tatsächlich verwenden.
// Keine Werbefloskeln (einfach / schnell / kinderleicht / perfekt) — Datenschutz
// wird strukturell begründet, nicht versprochen (BRAND-OPERATING-MODEL /
// I18N-SEO-GUIDELINE). Register: informelles „du", wie bei kostenlosen Browser-Tools üblich.

export const de: ToolContent = {
  htmlLang: 'de',

  meta: {
    title: 'QR-Code erzeugen — ohne Tracking, Export als PNG/SVG | runlocally',
    description:
      'Verwandle Text, eine URL oder WLAN-Zugangsdaten in deinem Browser in einen QR-Code. Ein statischer Code ohne Weiterleitung oder Tracking-Ebene. Als PNG oder SVG herunterladen. Open Source, funktioniert offline.',
    ogTitle: 'QR-Code erzeugen — ohne Tracking, Export als PNG/SVG',
    ogDescription:
      'Verwandle Text, eine URL oder ein WLAN-Netzwerk im Browser in einen QR-Code. Keine Weiterleitung, kein Tracking. Als PNG oder SVG herunterladen.',
  },

  hero: {
    h1: 'QR-Code erzeugen',
    tagline:
      'Verwandle Text, eine URL oder WLAN-Zugangsdaten in deinem Browser in einen QR-Code — ohne Weiterleitung, ohne Tracking, als PNG oder SVG herunterladen.',
  },

  intro: {
    h2: 'Ein QR-Code für genau das, was du eingibst',
    paras: [
      'Gib Text ein oder füge ihn ein — eine Webadresse, eine Notiz, was auch immer — und er wird direkt beim Tippen in einen QR-Code codiert. Wähle eine Fehlerkorrekturstufe und eine Größe, dann lade das Ergebnis als PNG für schnelles Teilen oder als SVG für Druck und Skalierung herunter.',
      'Dieses Tool erledigt genau eine Aufgabe: eingegebenen Text in einen QR-Code codieren und zum Download anbieten. Es gibt keinen Link-Verkürzer, keine eingebaute Scan-Statistik und keine Möglichkeit, einen gescannten Code zurück in bearbeitbare Daten zu verwandeln — Text rein, Bild raus.',
      'Brauchst du stattdessen einen WLAN-QR-Code? Wechsle zum Tab „WLAN-Netzwerk" und trage Netzwerkname, Verschlüsselung und Passwort ein. Dieselbe Codierung auf deinem Gerät erzeugt das gängige WLAN-QR-Format, das Handykameras automatisch erkennen und direkt einen Beitritt zum Netzwerk anbieten.',
    ],
  },

  privacy: {
    h2: 'Warum dieser QR-Code keine Tracking-Ebene hat',
    lead:
      'Datenschutz ist hier strukturell, kein Versprechen. Es gibt keinen Upload-Schritt, weil es keinen Server gibt, zu dem etwas hochgeladen werden könnte:',
    points: [
      'Der QR-Code codiert genau den Text, den du eingegeben hast — er wird nicht vorher in einen Kurzlink oder eine Weiterleitungs-URL umgeschrieben.',
      'Viele „kostenlose" QR-Generator-Websites ersetzen deinen Inhalt heimlich durch einen Link zu ihrem eigenen Server, sodass jeder Scan protokolliert wird, bevor die Besucherin oder der Besucher überhaupt beim eigentlichen Ziel ankommt. Dieses Tool hat keine solche Ebene: Es gibt nichts, worüber ein Scan geleitet werden könnte, weil die Erzeugung vollständig auf deinem Gerät stattfindet.',
      'Die Codierung läuft vollständig in deinem Browser über eine Open-Source-Bibliothek; die Seite sendet keine Anfrage mit deinem Text.',
      'Im WLAN-Modus gilt dasselbe: Das Netzwerkpasswort wird vollständig auf deinem Gerät in den QR-Code eingebaut und nirgendwohin gesendet. Ein WLAN-Passwort in einen Upload-basierten Generator einzugeben bedeutet, dass dieses Passwort kurzzeitig auf einem fremden Server lag — dieses Tool hat gar keinen Server, den es erreichen könnte.',
      'Der Quellcode ist offen und kann von allen eingesehen werden (MIT).',
      'Die Seite funktioniert offline – was nur möglich ist, weil nichts das Gerät verlässt.',
    ],
    note:
      'Wenn du es selbst prüfen willst, öffne beim Tippen das Netzwerk-Panel deines Browsers – keine Anfrage trägt deinen Text.',
    sourceLinkText: 'Quellcode ansehen.',
  },

  howto: {
    h2: 'So funktioniert es',
    steps: [
      {
        h3: 'Text oder URL eingeben — oder zu WLAN wechseln',
        p: 'Gib etwas in das Textfeld ein — eine Webadresse, eine Notiz, einfachen Text — oder klicke auf den Tab „WLAN-Netzwerk", um stattdessen aus Netzwerkname, Verschlüsselung und Passwort einen Verbindungscode zu erstellen. Mit „Beispiel laden" kannst du beide Modi mit Beispielwerten ausprobieren.',
      },
      {
        h3: 'Fehlerkorrekturstufe wählen',
        p: 'Höhere Stufen (Q, H) halten den Code auch dann scanbar, wenn ein Teil beschädigt oder verdeckt ist, lassen aber weniger Platz für Daten. M ist für die meisten Fälle eine sinnvolle Voreinstellung.',
      },
      {
        h3: 'Größe wählen',
        p: 'Klein, mittel oder groß — je nachdem, wo der Code eingesetzt wird, vom Bildschirm bis zum gedruckten Plakat.',
      },
      {
        h3: 'Ergebnis herunterladen',
        p: 'PNG eignet sich für schnelles Teilen und Bildschirme; SVG ist eine skalierbare Vektordatei, die in jeder Druckgröße scharf bleibt.',
      },
    ],
  },

  faqHeading: 'Häufige Fragen',
  faq: [
    {
      q: 'Verfolgt dieser QR-Code, wer ihn scannt?',
      a: 'Nein. Er codiert deinen Text direkt — es gibt keine Weiterleitung über einen Server, der Scans, Standorte oder Zeitstempel protokollieren könnte. Manche anderen QR-Generatoren ersetzen deinen Inhalt durch einen Link zu ihrem eigenen Tracking-Dienst; dieses Tool hat keinen solchen Dienst, über den etwas laufen könnte.',
    },
    {
      q: 'Wird mein Text irgendwohin hochgeladen?',
      a: 'Nein. Der QR-Code wird vollständig in deinem Browser erzeugt. Es gibt keine Serverkomponente, dein Text verlässt dein Gerät also nie.',
    },
    {
      q: 'Kann ich einen QR-Code für ein WLAN-Netzwerk erzeugen?',
      a: 'Ja — wechsle zum Tab „WLAN-Netzwerk" und gib den Netzwerknamen (SSID), die Verschlüsselung (WPA/WPA2/WPA3, WEP oder keine) und, falls vorhanden, das Passwort ein. Scannt man den entstandenen Code mit der Handykamera, wird direkt ein Beitritt zum Netzwerk angeboten — genau wie bei einem auf dem Router aufgedruckten Code.',
    },
    {
      q: 'Ist es sicher, mein WLAN-Passwort in dieses Tool einzugeben?',
      a: 'Das Passwort wird genau wie im Textmodus vollständig auf deinem Gerät in den QR-Code eingebaut — nichts wird hochgeladen, das Passwort existiert also nur in deinem Browser und im erzeugten Bild. Setze zuerst das Häkchen bei „Verstecktes Netzwerk", wenn dein Router die SSID nicht sendet.',
    },
    {
      q: 'Was passiert, wenn mein Text zu lang ist?',
      a: 'QR-Codes haben eine begrenzte Kapazität, die von der Fehlerkorrekturstufe und der Art der eingegebenen Daten abhängt. Ist deine Eingabe für die gewählte Stufe zu lang, zeigt das Tool eine Fehlermeldung mit der genauen Zeichen-/Byte-Zahl und dem Limit — dein Text wird nie stillschweigend abgeschnitten.',
    },
    {
      q: 'Wofür ist die Fehlerkorrekturstufe?',
      a: 'Sie bestimmt, wie viel vom Code beschädigt, verschmutzt oder teilweise verdeckt sein kann und trotzdem korrekt scannt — auf Kosten des Platzes für Daten. L bietet den meisten Platz, H ist am widerstandsfähigsten.',
    },
    {
      q: 'PNG oder SVG — was soll ich nehmen?',
      a: 'PNG ist ein Rasterbild mit fester Auflösung, gut für Bildschirme und schnelles Teilen. SVG ist eine skalierbare Vektordatei, die in jeder Größe scharf bleibt — geeignet zum großformatigen Drucken oder Bearbeiten in Vektorprogrammen.',
    },
    {
      q: 'Funktioniert es offline?',
      a: 'Ja. Das Tool ist eine PWA. Nach dem ersten Besuch wird es zwischengespeichert, sodass es ohne Netzwerkverbindung funktioniert. Du kannst es auch zum Startbildschirm hinzufügen.',
    },
  ],

  footer: {
    openSourceLabel: 'Open Source (MIT)',
    partOf: 'Teil von',
    brandTail: '— kleine Tools, die lokal auf deinem Gerät laufen.',
    colophon:
      'Erstellt und gepflegt von Geppetto. Ein Teil des Codes entsteht mit KI-Unterstützung; Prüfung und Entscheidungen liegen beim Maintainer.',
    securityText: 'Sicherheit',
  },
};
