// Service worker: aplikacja działa bez internetu, ale zawsze najpierw próbuje pobrać nowe pliki.
// Przy każdej wgranej paczce zmień numer wersji poniżej.
const WERSJA = "cwiczenia-v50";

const PLIKI = [
  "./", "index.html", "style.css", "manifest.webmanifest",
  "dane.js", "anatomia.js", "cwiczenia.js", "treningi.js", "kreator.js", "kreator2.js",
  "dzis.js", "postep.js", "rekordy.js", "cwicz.js", "ustawienia.js", "kopia.js", "przewodnik.js", "app.js",
  "przewodnik/1-start.webp", "przewodnik/2-aktywnosci.webp", "przewodnik/3-kalendarz.webp", "przewodnik/4-cwiczenia-w-sesji.webp", "przewodnik/5-parametry.webp", "przewodnik/6-dzis.webp", "przewodnik/7-inne-wartosci.webp", "przewodnik/8-postep.webp", "przewodnik/9-baza.webp", "przewodnik/10-moje-treningi.webp",
  "przyklady-kalistenika.json", "przyklady-silownia.json", "przyklady-mobilnosc.json",
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
