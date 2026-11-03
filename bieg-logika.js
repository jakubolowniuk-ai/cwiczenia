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

// ===== Stoper: czas liczony z zegara, nie z tyknięć =====
// stan = { sesjaId, planId, start, startedAt, accumulated (ms), pauzy, czasPauz (ms), pauzaOd, stan: "trwa" | "pauza" }

function biegStoperNowy(sesjaId, planId, teraz) {
  return { sesjaId: sesjaId, planId: planId, start: teraz, startedAt: teraz, accumulated: 0, pauzy: 0, czasPauz: 0, pauzaOd: null, stan: "trwa" };
}

// Czas aktywny w milisekundach
function biegStoperCzas(st, teraz) {
  return st.accumulated + (st.stan === "trwa" ? Math.max(0, teraz - st.startedAt) : 0);
}

function biegStoperPauza(st, teraz) {
  if (st.stan !== "trwa") {
    return st;
  }
  st.accumulated = biegStoperCzas(st, teraz);
  st.stan = "pauza";
  st.pauzaOd = teraz;
  st.pauzy++;
  return st;
}

function biegStoperWznow(st, teraz) {
  if (st.stan !== "pauza") {
    return st;
  }
  st.czasPauz += Math.max(0, teraz - st.pauzaOd);
  st.pauzaOd = null;
  st.startedAt = teraz;
  st.stan = "trwa";
  return st;
}

// Wynik ze stopera: czas aktywny w sekundach, liczba i czas pauz
function biegStoperWynik(st, teraz) {
  const czasPauz = st.czasPauz + (st.stan === "pauza" && st.pauzaOd ? Math.max(0, teraz - st.pauzaOd) : 0);
  return {
    czasS: Math.round(biegStoperCzas(st, teraz) / 1000),
    pauzy: st.pauzy,
    czasPauzS: Math.round(czasPauz / 1000)
  };
}

// "4:07" albo "1:02:07"
function biegFormatCzasu(sek) {
  sek = Math.max(0, Math.floor(sek));
  const h = Math.floor(sek / 3600);
  const m = Math.floor((sek % 3600) / 60);
  const s = sek % 60;
  return (h > 0 ? h + ":" + String(m).padStart(2, "0") : String(m)) + ":" + String(s).padStart(2, "0");
}
