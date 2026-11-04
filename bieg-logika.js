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

// ===== Odcinki =====
// sesja.odcinki = lista elementów: odcinek { rodzaj, czasS?, dystansM?, tempoS? (s/km, opcjonalnie) }
// albo grupa { powtorz: N, odcinki: [odcinki] } – grupa to jeden element listy.

const RODZAJE_ODCINKA = [
  { id: "rozgrzewka", nazwa: "Rozgrzewka" },
  { id: "bieg", nazwa: "Bieg" },
  { id: "szybko", nazwa: "Szybko" },
  { id: "wolno", nazwa: "Wolno" },
  { id: "marsz", nazwa: "Marsz" },
  { id: "schlodzenie", nazwa: "Schłodzenie" }
];

function biegNazwaOdcinka(id) {
  const r = RODZAJE_ODCINKA.find(function (x) { return x.id === id; });
  return r ? r.nazwa : "Odcinek";
}

// "1 min", "90 s", "400 m", "1,5 km"
function biegOpisWartosci(o) {
  if (o.czasS) {
    return o.czasS % 60 === 0 ? o.czasS / 60 + " min" : o.czasS > 60 ? biegFormatCzasu(o.czasS) + " min" : o.czasS + " s";
  }
  if (o.dystansM) {
    return o.dystansM >= 1000 ? String(Math.round(o.dystansM / 10) / 100).replace(".", ",") + " km" : o.dystansM + " m";
  }
  return "";
}

function biegOpisOdcinka(o) {
  return biegNazwaOdcinka(o.rodzaj) + " " + biegOpisWartosci(o) + (o.tempoS ? " (" + biegOpisTempa(o.tempoS) + ")" : "");
}

// Krótki opis listy: "Rozgrzewka 5 min, 8 × (Bieg 1 min + Marsz 2 min), Schłodzenie 5 min"
function biegOpisOdcinkow(odcinki) {
  return (odcinki || []).map(function (e) {
    if (e.powtorz) {
      return e.powtorz + " × (" + e.odcinki.map(biegOpisOdcinka).join(" + ") + ")";
    }
    return biegOpisOdcinka(e);
  }).join(", ");
}

// Płaska lista do stopera: [{ rodzaj, czasS, dystansM, tempoS, powt: numer powtórzenia, zPowt: ile powtórzeń }]
function biegOdcinkiPlaskie(odcinki) {
  const wynik = [];
  (odcinki || []).forEach(function (e) {
    if (e.powtorz) {
      for (let i = 1; i <= e.powtorz; i++) {
        e.odcinki.forEach(function (o) {
          wynik.push({ rodzaj: o.rodzaj, czasS: o.czasS || null, dystansM: o.dystansM || null, tempoS: o.tempoS || null, powt: i, zPowt: e.powtorz });
        });
      }
    } else {
      wynik.push({ rodzaj: e.rodzaj, czasS: e.czasS || null, dystansM: e.dystansM || null, tempoS: e.tempoS || null, powt: null, zPowt: null });
    }
  });
  return wynik;
}

// Suma odcinków: czas (z odcinków na czas), dystans (z odcinków na dystans)
function biegSumaOdcinkow(odcinki) {
  let czasS = 0;
  let dystansM = 0;
  biegOdcinkiPlaskie(odcinki).forEach(function (o) {
    czasS += o.czasS || 0;
    dystansM += o.dystansM || 0;
  });
  return { czasS: czasS || null, dystansM: dystansM || null };
}

// Stoper z odcinkami: przesuwa bieżący odcinek, gdy minął jego czas.
// st.odc = { nr, startMs (czas aktywny na początku odcinka), wyniki: [{ czasS }] }. Zwraca liczbę zmian odcinka.
function biegOdcinkiAktualizuj(st, plaskie, teraz) {
  if (!st.odc || !plaskie.length) {
    return 0;
  }
  let zmiany = 0;
  const aktywne = biegStoperCzas(st, teraz);
  while (st.odc.nr < plaskie.length) {
    const o = plaskie[st.odc.nr];
    if (!o.czasS) {
      break; // odcinek na dystans: bez GPS kończy go użytkownik
    }
    const koniec = st.odc.startMs + o.czasS * 1000;
    if (aktywne < koniec) {
      break;
    }
    st.odc.wyniki.push({ czasS: o.czasS });
    st.odc.startMs = koniec;
    st.odc.nr++;
    zmiany++;
  }
  return zmiany;
}

// Ręczne zakończenie odcinka (np. na dystans bez GPS)
function biegOdcinekZakoncz(st, plaskie, teraz) {
  if (!st.odc || st.odc.nr >= plaskie.length) {
    return;
  }
  const aktywne = biegStoperCzas(st, teraz);
  st.odc.wyniki.push({ czasS: Math.round((aktywne - st.odc.startMs) / 1000) });
  st.odc.startMs = aktywne;
  st.odc.nr++;
}

// Gotowe szablony
const SZABLONY_ODCINKOW = [
  { id: "marszobieg", nazwa: "Marsz-bieg 8 × (1 + 2)", rodzajBiegu: "marszobieg", odcinki: [
    { rodzaj: "marsz", czasS: 300 },
    { powtorz: 8, odcinki: [{ rodzaj: "bieg", czasS: 60 }, { rodzaj: "marsz", czasS: 120 }] },
    { rodzaj: "marsz", czasS: 300 }
  ] },
  { id: "int11", nazwa: "Interwały 6 × (1 min + 1 min)", rodzajBiegu: "interwaly", odcinki: [
    { rodzaj: "rozgrzewka", czasS: 600 },
    { powtorz: 6, odcinki: [{ rodzaj: "szybko", czasS: 60 }, { rodzaj: "wolno", czasS: 60 }] },
    { rodzaj: "schlodzenie", czasS: 300 }
  ] },
  { id: "int400", nazwa: "Interwały 6 × 400 m", rodzajBiegu: "interwaly", odcinki: [
    { rodzaj: "rozgrzewka", czasS: 600 },
    { powtorz: 6, odcinki: [{ rodzaj: "szybko", dystansM: 400 }, { rodzaj: "wolno", czasS: 120 }] },
    { rodzaj: "schlodzenie", czasS: 600 }
  ] },
  { id: "tempo102010", nazwa: "Bieg tempowy 10-20-10", rodzajBiegu: "tempowy", odcinki: [
    { rodzaj: "rozgrzewka", czasS: 600 },
    { rodzaj: "szybko", czasS: 1200 },
    { rodzaj: "schlodzenie", czasS: 600 }
  ] }
];

// ===== Warunki kroków ścieżki „Bieganie” =====
// warunek = { minCzasS, minDystansM, maxCzasS, maxPauz, nieRodzaj, biegowWTygodniu, tygodniZRzedu }
// bieg = { czasS, dystansM (albo null), pauzy, rodzajBiegu }
// Zwraca "tak", "nie" albo "brak-dystansu" (warunek wymaga dystansu, a bieg go nie ma).
function biegWarunek(w, bieg) {
  if (w.biegowWTygodniu) {
    return "nie"; // warunki tygodniowe liczy osobna funkcja
  }
  if (w.nieRodzaj && bieg.rodzajBiegu === w.nieRodzaj) {
    return "nie";
  }
  if (w.maxPauz != null && (bieg.pauzy || 0) > w.maxPauz) {
    return "nie";
  }
  if (w.minCzasS && !(bieg.czasS >= w.minCzasS)) {
    return "nie";
  }
  if (w.minDystansM) {
    if (!bieg.dystansM) {
      return "brak-dystansu";
    }
    if (bieg.dystansM < w.minDystansM) {
      return "nie";
    }
  }
  if (w.maxCzasS) {
    if (!bieg.czasS) {
      return "nie";
    }
    // Czas przeliczony na dystans warunku (dłuższy bieg w tym samym tempie też się liczy)
    const naDystansie = w.minDystansM && bieg.dystansM ? bieg.czasS * w.minDystansM / bieg.dystansM : bieg.czasS;
    if (naDystansie >= w.maxCzasS) {
      return "nie";
    }
  }
  return "tak";
}

// Poniedziałek tygodnia dla daty "RRRR-MM-DD" → "RRRR-MM-DD"
function biegPoczatekTygodnia(data) {
  const d = new Date(data + "T12:00:00");
  const dzien = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dzien);
  return d.toISOString().slice(0, 10);
}

// Warunek tygodniowy: daty zapisanych biegów, data bieżącego biegu
function biegWarunekTygodnia(w, daty, data) {
  const ile = {};
  daty.forEach(function (x) {
    const t = biegPoczatekTygodnia(x);
    ile[t] = (ile[t] || 0) + 1;
  });
  let t = biegPoczatekTygodnia(data);
  const potrzeba = w.tygodniZRzedu || 1;
  for (let i = 0; i < potrzeba; i++) {
    if ((ile[t] || 0) < w.biegowWTygodniu) {
      return false;
    }
    const d = new Date(t + "T12:00:00");
    d.setDate(d.getDate() - 7);
    t = d.toISOString().slice(0, 10);
  }
  return true;
}

// ===== Statystyki biegania (Postęp) =====
// biegi = [{ data: "RRRR-MM-DD", czasS, dystansM (albo null), rodzajBiegu, wysilek, ... }]
// Puste wartości nie są liczone jako 0: dystans tygodnia i tempo liczą się tylko z biegów, które mają dystans.

function biegTygodnie(biegi) {
  const t = {};
  biegi.forEach(function (b) {
    const k = biegPoczatekTygodnia(b.data);
    if (!t[k]) {
      t[k] = { tydzien: k, biegow: 0, czasS: 0, dystansM: 0, czasZDystansemS: 0 };
    }
    t[k].biegow++;
    t[k].czasS += b.czasS || 0;
    if (b.dystansM) {
      t[k].dystansM += b.dystansM;
      t[k].czasZDystansemS += b.czasS || 0;
    }
  });
  return t;
}

// Ostatnie n tygodni (od najstarszego), także puste
function biegOstatnieTygodnie(biegi, dzis, n) {
  const t = biegTygodnie(biegi);
  const wynik = [];
  const d = new Date(biegPoczatekTygodnia(dzis) + "T12:00:00");
  d.setDate(d.getDate() - 7 * (n - 1));
  for (let i = 0; i < n; i++) {
    const k = d.toISOString().slice(0, 10);
    wynik.push(t[k] || { tydzien: k, biegow: 0, czasS: 0, dystansM: 0, czasZDystansemS: 0 });
    d.setDate(d.getDate() + 7);
  }
  return wynik;
}

// Najdłuższa seria kolejnych tygodni z co najmniej jednym biegiem (i bieżąca seria)
function biegSeriaTygodni(biegi, dzis) {
  const t = biegTygodnie(biegi);
  const klucze = Object.keys(t).sort();
  let naj = 0;
  let akt = 0;
  let poprz = null;
  klucze.forEach(function (k) {
    const d = new Date(k + "T12:00:00");
    if (poprz) {
      const p = new Date(poprz + "T12:00:00");
      p.setDate(p.getDate() + 7);
      akt = p.toISOString().slice(0, 10) === k ? akt + 1 : 1;
    } else {
      akt = 1;
    }
    naj = Math.max(naj, akt);
    poprz = k;
    return d;
  });
  // Bieżąca seria: liczona tylko, gdy ostatni tydzień z biegiem to ten albo poprzedni
  const ten = biegPoczatekTygodnia(dzis);
  const d = new Date(ten + "T12:00:00");
  d.setDate(d.getDate() - 7);
  const poprzedni = d.toISOString().slice(0, 10);
  const biezaca = poprz === ten || poprz === poprzedni ? akt : 0;
  return { najdluzsza: naj, biezaca: biezaca };
}

// Rekordy: najdłuższy dystans i czas, najszybsze 1 / 5 / 10 km (bez GPS: tylko biegi o tym dystansie ±3%)
const BIEG_DYSTANSE_REKORDOW = [[1000, "1 km"], [5000, "5 km"], [10000, "10 km"], [21097, "półmaraton"]];

function biegRekordy(biegi) {
  const r = { najdluzszyDystans: null, najdluzszyCzas: null, najszybsze: {} };
  biegi.forEach(function (b) {
    if (b.dystansM && (!r.najdluzszyDystans || b.dystansM > r.najdluzszyDystans.dystansM)) {
      r.najdluzszyDystans = b;
    }
    if (b.czasS && (!r.najdluzszyCzas || b.czasS > r.najdluzszyCzas.czasS)) {
      r.najdluzszyCzas = b;
    }
    if (b.dystansM && b.czasS) {
      BIEG_DYSTANSE_REKORDOW.forEach(function (d) {
        if (Math.abs(b.dystansM - d[0]) <= d[0] * 0.03) {
          const naDystansie = b.czasS * d[0] / b.dystansM;
          const obecny = r.najszybsze[d[0]];
          if (!obecny || naDystansie < obecny.czasS) {
            r.najszybsze[d[0]] = { czasS: Math.round(naDystansie), data: b.data };
          }
        }
      });
    }
  });
  return r;
}
