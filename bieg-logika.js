// ===== Bieganie: logika bez interfejsu =====
// Ten plik nie dotyka ekranu, żeby dało się go przenieść do wersji natywnej.
// Format danych sesji biegowej (zgodny z resztą aplikacji):
//   sesja.rodzajBiegu = "spokojny" | "tempowy" | "interwaly" | "dlugi" | "marszobieg" (brak = spokojny)
//   sesja.dystans = { wartosc, jednostka: "km" | "m" } albo null (brak celu – nie 0)
//   sesja.czas    = { wartosc, jednostka: "s" | "min" } albo null
//   sesja.wynik   = { dystans, czas, obciazenie, wysilek (1–10 albo null), zrodlo: "reczny" | "stoper" | "gps" }
// Tempo nie jest zapisywane – liczy się je z dystansu i czasu.

const RODZAJE_BIEGU = [
  { id: "spokojny", nazwa: "Spokojny", opis: "Tempo rozmowy. Buduje wytrzymałość – większość biegów." },
  { id: "tempowy", nazwa: "Tempowy", opis: "Komfortowo ciężko, przez 15–30 minut. Podnosi tempo, które utrzymasz." },
  { id: "interwaly", nazwa: "Interwały", opis: "Szybkie odcinki na przemian z wolnymi. Szybkość i wydolność." },
  { id: "dlugi", nazwa: "Długi", opis: "Najdłuższy bieg tygodnia, spokojnie. Przygotowuje do dystansu." },
  { id: "marszobieg", nazwa: "Marsz-bieg", opis: "Bieg przeplatany marszem. Najlepszy start od zera." }
];

const OPISY_WYSILKU = ["", "bardzo lekko", "lekko", "lekko", "umiarkowanie", "umiarkowanie", "dość ciężko", "ciężko", "ciężko", "bardzo ciężko", "maksymalnie"];

function biegRodzaj(id) {
  return RODZAJE_BIEGU.find(function (r) { return r.id === id; }) || RODZAJE_BIEGU[0];
}

// Dystans w metrach albo null
function biegMetry(d) {
  if (!d || !(d.wartosc > 0)) {
    return null;
  }
  return d.jednostka === "km" ? d.wartosc * 1000 : d.wartosc;
}

// Czas w sekundach albo null
function biegSekundy(c) {
  if (!c || !(c.wartosc > 0)) {
    return null;
  }
  return c.jednostka === "min" ? c.wartosc * 60 : c.wartosc;
}

// Tempo w sekundach na kilometr albo null (gdy brak dystansu lub czasu)
function biegTempo(dystans, czas) {
  const m = biegMetry(dystans);
  const s = biegSekundy(czas);
  if (!m || !s) {
    return null;
  }
  return s / (m / 1000);
}

// "5:30 min/km"
function biegOpisTempa(sekNaKm) {
  if (!(sekNaKm > 0) || !isFinite(sekNaKm)) {
    return "";
  }
  let min = Math.floor(sekNaKm / 60);
  let sek = Math.round(sekNaKm - min * 60);
  if (sek === 60) {
    min++;
    sek = 0;
  }
  return min + ":" + String(sek).padStart(2, "0") + " min/km";
}

// Migracja: dystans lub czas równe 0 znaczą „brak” (null), a nie zero. Zwraca liczbę poprawionych pól.
function biegMigruj(d) {
  let zmiany = 0;
  const popraw = function (obiekt) {
    if (!obiekt) {
      return;
    }
    ["dystans", "czas"].forEach(function (k) {
      if (obiekt[k] && !(obiekt[k].wartosc > 0)) {
        obiekt[k] = null;
        zmiany++;
      }
    });
  };
  (d.plany || []).forEach(function (plan) {
    (plan.sesje || []).forEach(function (s) {
      popraw(s);
      popraw(s.wynik);
    });
  });
  return zmiany;
}
