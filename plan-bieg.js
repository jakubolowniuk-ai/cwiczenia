// ===== Generator planu biegowego =====
// Bez interfejsu. Plan powstaje blokami po 4 tygodnie (jak reszta aplikacji), ale tydzień liczony jest
// w całym planie: tydzień = (blok - 1) * 4 + tydzień w bloku. Dzięki temu objętość rośnie przez cały plan,
// co 4. tydzień jest lżejszy, a ostatni tydzień to zmniejszenie objętości i sprawdzian.
// Profil: p.biegCel, p.biegDni (biegi w tygodniu), p.silaDni (0–2), p.silaRodzaj ("biegacz" | "cale"),
// p.tygodni (długość planu), p.bieg20 (czy przebiegnie 20 min bez przerwy).

const PG_BIEG_CELE = [
  { id: "pierwsze5", nazwa: "Pierwsze 5 km", opis: "Od marszobiegu do 30 minut biegu bez przerwy", tygodni: 8, metry: 5000 },
  { id: "5km", nazwa: "5 km szybciej", opis: "Biegasz już 20–30 minut i chcesz poprawić czas na 5 km", tygodni: 8, metry: 5000 },
  { id: "10km", nazwa: "10 km", opis: "Przygotowanie do przebiegnięcia 10 km", tygodni: 12, metry: 10000 },
  { id: "polmaraton", nazwa: "Półmaraton", opis: "21,1 km – dla osób, które biegają regularnie", tygodni: 16, metry: 21097 },
  { id: "forma", nazwa: "Utrzymanie formy", opis: "Regularne bieganie bez konkretnego startu", tygodni: 8, metry: null }
];

function pgBiegCel(id) {
  return PG_BIEG_CELE.find(function (c) { return c.id === id; }) || PG_BIEG_CELE[0];
}

// Poziom podpowiadany z celu: pierwsze 5 km i osoby bez 20 minut biegu → początkujący
function pgBiegPoziom(p) {
  if (p.biegPoziom) {
    return p.biegPoziom;
  }
  return p.biegCel === "pierwsze5" || !p.bieg20 || (p.dosw || 0) <= 1 ? "poczatkujacy" : "zaawansowany";
}

// Marszobieg: kolejne poziomy [ile powtórzeń, minuty biegu, minuty marszu]
const PG_MB_POZIOMY = [[8, 1, 2], [6, 2, 2], [5, 3, 2], [4, 5, 2], [3, 8, 2], [3, 10, 1], [2, 15, 1], [1, 25, 0]];

function pgOdcinkiMarszobiegu(poz) {
  const p = PG_MB_POZIOMY[Math.max(0, Math.min(PG_MB_POZIOMY.length - 1, poz))];
  if (p[2] === 0) {
    return [{ rodzaj: "marsz", czasS: 300 }, { rodzaj: "bieg", czasS: p[1] * 60 }, { rodzaj: "marsz", czasS: 300 }];
  }
  return [
    { rodzaj: "marsz", czasS: 300 },
    { powtorz: p[0], odcinki: [{ rodzaj: "bieg", czasS: p[1] * 60 }, { rodzaj: "marsz", czasS: p[2] * 60 }] },
    { rodzaj: "marsz", czasS: 300 }
  ];
}

// Dni tygodnia (przesunięcia od pierwszego dnia planu): biegi z przerwą, długi bieg na końcu
const PG_DNI_BIEGOW = { 2: [1, 4], 3: [0, 2, 5], 4: [0, 2, 4, 6], 5: [0, 1, 3, 4, 6] };

function pgBiegDni(nBieg, nSila) {
  const b = PG_DNI_BIEGOW[Math.max(2, Math.min(5, nBieg))].slice();
  const wolne = [0, 1, 2, 3, 4, 5, 6].filter(function (d) { return b.indexOf(d) === -1; });
  // Siła: w dni bez biegu, nie dzień przed długim biegiem (ostatni bieg tygodnia); gdy brak wolnych – w dzień spokojnego biegu
  const dlugi = b[b.length - 1];
  const s = [];
  const kandydaci = wolne.filter(function (d) { return d !== dlugi - 1; }).concat(wolne.filter(function (d) { return d === dlugi - 1; }));
  for (let i = 0; i < nSila && i < kandydaci.length; i++) {
    s.push(kandydaci[Math.round(i * (kandydaci.length - 1) / Math.max(1, nSila - 1))]);
  }
  while (s.length < nSila) {
    s.push(b[s.length % b.length]);
  }
  return { b: b, s: s.filter(function (d, i, t) { return t.indexOf(d) === i; }).sort() };
}

// Mnożnik objętości tygodnia: wzrost ok. 8% w zwykłych tygodniach, co 4. tydzień ok. 75%, ostatni tydzień 60%
function pgBiegMnoznik(w, n) {
  let normalne = 0;
  for (let i = 1; i < w; i++) {
    if (i % 4 !== 0) {
      normalne++;
    }
  }
  return Math.pow(1.08, normalne);
}

// Lżejszy tydzień (co 4.) i ostatni tydzień (przed sprawdzianem): część objętości
function pgBiegCzynnik(w, n) {
  if (w === n && n >= 4) {
    return 0.6;
  }
  return w % 4 === 0 ? 0.75 : 1;
}

function pgZaokr5(min) {
  return Math.max(10, Math.round(min / 5) * 5);
}

// Biegi tygodnia w: [{ rodzajBiegu, czas (min) | dystans, odcinki, notatka }]
function pgBiegTydzien(p, w, n) {
  const cel = pgBiegCel(p.biegCel);
  const poziom = pgBiegPoziom(p);
  const ile = Math.max(2, Math.min(5, p.biegDni || 3));
  const ostatni = w === n;
  const lzejszy = w % 4 === 0 && !ostatni;
  const biegi = [];

  // Pierwsze 5 km (albo brak 20 minut biegu): marszobieg z rosnącym biegiem
  if (cel.id === "pierwsze5" || !p.bieg20) {
    const poz = Math.round((w - 1) * (PG_MB_POZIOMY.length - 1) / Math.max(1, n - 1)) - (lzejszy ? 1 : 0);
    for (let i = 0; i < Math.min(ile, 3); i++) {
      if (ostatni && i === Math.min(ile, 3) - 1 && cel.id === "pierwsze5") {
        biegi.push({ rodzajBiegu: "spokojny", czas: 30, notatka: "Sprawdzian: 30 minut (albo 5 km) spokojnego biegu bez zatrzymania. Tempo rozmowy – nie ścigaj się." });
      } else {
        biegi.push({ rodzajBiegu: "marszobieg", odcinki: pgOdcinkiMarszobiegu(poz), notatka: "Bieg spokojny, tak żeby dało się rozmawiać. Stoper poprowadzi Cię przez odcinki." + (lzejszy ? " Tydzień lżejszy – powtarzamy łatwiejszy poziom." : "") });
      }
    }
    return biegi;
  }

  const m = pgBiegMnoznik(w, n);
  const cz = pgBiegCzynnik(w, n);
  const zaaw = poziom === "zaawansowany";
  const bazaSpokojny = zaaw ? 35 : 25;
  const bazaDlugi = { "5km": zaaw ? 50 : 35, "10km": zaaw ? 60 : 40, "polmaraton": zaaw ? 75 : 50, "forma": zaaw ? 55 : 40 }[cel.id] || 40;
  const maxDlugi = { "5km": 70, "10km": 100, "polmaraton": 140, "forma": 75 }[cel.id] || 90;
  const maxSpokojny = zaaw ? 60 : 45;
  // Akcenty (tempowy / interwały): od 2. tygodnia, 1 w tygodniu, przy 4+ biegach zaawansowani 2
  const akcentow = w === 1 || lzejszy || ostatni || cel.id === "forma" && !zaaw ? 0 : (zaaw && ile >= 4 ? 2 : 1);
  const spokojnych = ile - 1 - akcentow;
  for (let i = 0; i < spokojnych; i++) {
    biegi.push({ rodzajBiegu: "spokojny", czas: pgZaokr5(Math.min(maxSpokojny, bazaSpokojny * m) * cz), notatka: "Tempo rozmowy. Większość biegania ma być właśnie taka." });
  }
  for (let i = 0; i < akcentow; i++) {
    const interwaly = (w + i) % 2 === 0;
    if (interwaly) {
      const powt = Math.min(zaaw ? 10 : 8, 4 + Math.floor(w / 2));
      biegi.push({
        rodzajBiegu: "interwaly",
        odcinki: zaaw && cel.id !== "polmaraton"
          ? [{ rodzaj: "rozgrzewka", czasS: 600 }, { powtorz: Math.min(8, 4 + Math.floor(w / 3)), odcinki: [{ rodzaj: "szybko", dystansM: 400 }, { rodzaj: "wolno", czasS: 90 }] }, { rodzaj: "schlodzenie", czasS: 600 }]
          : [{ rodzaj: "rozgrzewka", czasS: 600 }, { powtorz: powt, odcinki: [{ rodzaj: "szybko", czasS: 60 }, { rodzaj: "wolno", czasS: 90 }] }, { rodzaj: "schlodzenie", czasS: 300 }],
        notatka: "Szybkie odcinki mocno, ale równo – ostatni ma być tak szybki jak pierwszy. Wolne odcinki truchtem."
      });
    } else {
      const tempoMin = Math.min(zaaw ? 30 : 20, 8 + 2 * Math.floor(w / 2));
      biegi.push({
        rodzajBiegu: "tempowy",
        odcinki: [{ rodzaj: "rozgrzewka", czasS: 600 }, { rodzaj: "szybko", czasS: tempoMin * 60 }, { rodzaj: "schlodzenie", czasS: 600 }],
        notatka: "Środkowa część „komfortowo ciężko”: da się powiedzieć kilka słów, ale nie rozmawiać."
      });
    }
  }
  // Długi bieg (ostatni w tygodniu); w ostatnim tygodniu sprawdzian na dystansie celu
  if (ostatni && cel.metry) {
    biegi.push({ rodzajBiegu: "tempowy", dystans: { wartosc: cel.metry / 1000, jednostka: "km" }, notatka: "Sprawdzian: " + cel.nazwa.toLowerCase() + ". Zacznij spokojnie, przyspiesz w drugiej połowie. Po biegu wpisz dystans i czas – zobaczysz tempo." });
  } else {
    biegi.push({ rodzajBiegu: "dlugi", czas: pgZaokr5(Math.min(maxDlugi, bazaDlugi * m) * cz), notatka: "Najdłuższy bieg tygodnia, spokojnie. Możesz zrobić krótkie przejścia do marszu przy piciu." + (lzejszy ? " Tydzień lżejszy." : "") });
  }
  return biegi;
}

// Uwagi i powody do planu biegowego
function pgBiegPowody(p, n) {
  const cel = pgBiegCel(p.biegCel);
  const powody = [];
  if (cel.id === "pierwsze5" || !p.bieg20) {
    powody.push("Zaczynasz od marszobiegu: krótkie odcinki biegu przeplatane marszem. Co tydzień biegu jest więcej, a marszu mniej, co oszczędza stawy i ścięgna.");
  } else {
    powody.push("Większość biegów jest spokojna (tempo rozmowy) – to buduje wytrzymałość najbezpieczniej. Raz w tygodniu jest akcent: bieg tempowy albo interwały, a na końcu tygodnia dłuższy bieg.");
  }
  powody.push("Plan ma " + n + " tygodni. Objętość rośnie stopniowo (ok. 8% na tydzień), co 4. tydzień jest lżejszy, a ostatni tydzień to mniej biegania i sprawdzian.");
  if (p.silaDni > 0) {
    powody.push(p.silaRodzaj === "cale"
      ? "Trening siłowy całego ciała " + p.silaDni + "× w tygodniu, w dni bez biegu i nie dzień przed długim biegiem."
      : "Siła dla biegacza (nogi, pośladki, brzuch) " + p.silaDni + "× w tygodniu – mocniejsze mięśnie i ścięgna to mniej kontuzji.");
  }
  return powody;
}

// Starsze profile (sprzed celów biegowych) i brakujące pola: wartości domyślne
function pgBiegNormalizuj(p) {
  if (!p.biegCel) {
    p.biegCel = p.bieg20 ? "forma" : "pierwsze5";
  }
  if (!p.biegDni) {
    p.biegDni = Math.min(5, Math.max(2, p.dni >= 6 ? 4 : 3));
  }
  if (p.silaDni == null) {
    p.silaDni = p.dni >= 5 ? 2 : p.dni >= 4 ? 1 : 0;
  }
  if (!p.silaRodzaj) {
    p.silaRodzaj = "biegacz";
  }
  if (!(p.tygodni >= 4)) {
    p.tygodni = pgBiegCel(p.biegCel).tygodni;
  }
  if (p.biegCel === "pierwsze5") {
    p.bieg20 = false;
  }
  return p;
}
