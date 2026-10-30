// Service worker: aplikacja działa bez internetu, ale zawsze najpierw próbuje pobrać nowe pliki.
// Przy każdej wgranej paczce zmień numer wersji poniżej.
const WERSJA = "cwiczenia-v64";

const PLIKI = [
  "./", "index.html", "style.css", "manifest.webmanifest",
  "dane.js", "anatomia.js", "cwiczenia.js", "treningi.js", "kreator.js", "kreator2.js",
  "dzis.js", "postep.js", "rekordy.js", "cwicz.js", "ustawienia.js", "kopia.js", "plan-generator.js", "plan-kreator.js", "plan-progresja.js", "przewodnik.js", "app.js",
  "przewodnik/01-start.webp", "przewodnik/02-kreator.webp", "przewodnik/03-gotowy-plan.webp", "przewodnik/04-dzis.webp", "przewodnik/05-cwicz.webp", "przewodnik/06-przerwa.webp", "przewodnik/07-ocena.webp", "przewodnik/08-propozycje.webp", "przewodnik/09-inne-wartosci.webp", "przewodnik/10-recznie.webp", "przewodnik/11-postep.webp", "przewodnik/12-baza.webp", "przewodnik/12b-ukryte.webp", "przewodnik/13-moje-zestawy.webp", "przewodnik/14-kolejny-blok.webp",
  "przyklady-kalistenika.json", "przyklady-silownia.json", "przyklady-mobilnosc.json", "przyklady-zdrowie.json", "przyklady-zestawy.json",
  "ikona-192.png", "ikona-512.png"
];

self.addEventListener("install", function (zdarzenie) {
  self.skipWaiting();
  zdarzenie.waitUntil(
    caches.open(WERSJA).then(function (schowek) {
      return Promise.all(PLIKI.map(function (adres) {
        return fetch(adres, { cache: "reload" }).then(function (odpowiedz) {
          if (odpowiedz.ok) {
            return schowek.put(adres, odpowiedz);
          }
        }).catch(function () {});
      }));
    })
  );
});

self.addEventListener("activate", function (zdarzenie) {
  zdarzenie.waitUntil(
    caches.keys().then(function (nazwy) {
      return Promise.all(nazwy.filter(function (n) { return n !== WERSJA; }).map(function (n) { return caches.delete(n); }));
    }).then(function () { return self.clients.claim(); })
  );
});

// Najpierw internet (świeże pliki), a gdy go nie ma - zapisana kopia
self.addEventListener("fetch", function (zdarzenie) {
  const zadanie = zdarzenie.request;
  if (zadanie.method !== "GET" || new URL(zadanie.url).origin !== self.location.origin) {
    return;
  }
  zdarzenie.respondWith(
    fetch(zadanie, { cache: "no-cache" }).then(function (odpowiedz) {
      if (odpowiedz.ok) {
        const kopia = odpowiedz.clone();
        caches.open(WERSJA).then(function (schowek) { schowek.put(zadanie, kopia); });
      }
      return odpowiedz;
    }).catch(function () {
      return caches.match(zadanie, { ignoreSearch: true }).then(function (zapisana) {
        return zapisana || caches.match("index.html");
      });
    })
  );
});
