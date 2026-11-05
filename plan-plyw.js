// ===== Generator planu pływackiego =====
// Zasady:
//  • objętość rośnie ok. 10% na tydzień, co 4. tydzień lżejszy (ok. 75%) i ze sprawdzianem,
//  • każdy trening: rozgrzewka → technika → część główna → wyciszenie,
//  • ok. 80% spokojnie / umiarkowanie, ok. 20% mocno (akcent w jednym treningu tygodnia),
//  • odcinki się wydłużają, przerwy skracają (np. 8×50 → 4×100 → 3×200 → 2×400 → 800),
//  • ostatni tydzień planu kończy się sprawdzianem celu.
// Profil: p.plywCel, p.plywBasen {dlugosc, jednostka}, p.plywTest (długości kraulem bez zatrzymania),
//         p.plywStyle (znane style), p.plywNowy (styl do nauki), p.plywDni, p.plywCzas, p.tygodni, p.blokNr, p.plywPrzes.

const PG_PLYW_CELE = [
  { id: "start", nazwa: "Zacznij pływać regularnie", opis: "Spokojne treningi, technika, oswojenie z wodą", tygodni: 8, cel: null },
  { id: "bez400", nazwa: "400 m bez zatrzymania", opis: "Pierwszy dłuższy dystans w jednym kawałku", tygodni: 8, cel: 400 },
  { id: "bez800", nazwa: "800 m bez zatrzymania", opis: "Pływasz już kilka długości i chcesz dłużej", tygodni: 12, cel: 800 },
  { id: "bez1000", nazwa: "1 km bez zatrzymania", opis: "Kilometr w jednym kawałku", tygodni: 12, cel: 1000 },
  { id: "bez1500", nazwa: "1500 m bez zatrzymania", opis: "Dystans olimpijskiego triathlonu", tygodni: 12, cel: 1500 },
  { id: "kondycja", nazwa: "Kondycja", opis: "Regularne, coraz dłuższe treningi dla zdrowia i formy", tygodni: 8, cel: null },
  { id: "szybciej100", nazwa: "Szybciej na 100 m", opis: "Krótkie, szybkie odcinki i technika", tygodni: 8, cel: 100, szybkosc: true },
  { id: "szybciej400", nazwa: "Szybciej na 400 m", opis: "Tempo na średnim dystansie", tygodni: 8, cel: 400, szybkosc: true },
  { id: "szybciej1500", nazwa: "Szybciej na 1500 m", opis: "Tempo na długim dystansie", tygodni: 12, cel: 1500, szybkosc: true },
  { id: "styl", nazwa: "Nauczyć się nowego stylu", opis: "Technika nowego stylu krok po kroku", tygodni: 8, cel: null }
];

// Ćwiczenia techniczne: [styl, opis, pomoce]
const PG_PLYW_TECHNIKA = {
  Kraul: [
    ["Nogi z deską", "Same nogi kraulem z deską. Ruch z bioder, kolana prawie proste, stopy luźne.", ["deska"]],
    ["Ręce z ósemką", "Same ręce, ósemka między udami. Długi ruch do biodra, wydech do wody.", ["osemka"]],
    ["Pływanie na boku", "Na boku, dolna ręka wyciągnięta, nogi kraulowe. Obrót głowy do wdechu bez podnoszenia.", ["pletwy"]],
    ["Doganianie", "Ręka czeka z przodu, aż druga ją „dogoni”. Uczy długiego, spokojnego ruchu.", []],
    ["Oddech co 3 ruchy", "Wdech raz z lewej, raz z prawej strony. Wydech cały czas do wody.", []]
  ],
  Grzbietowy: [
    ["Nogi na plecach", "Same nogi, ręce przy biodrach. Biodra wysoko, kolana pod wodą.", []],
    ["Jedna ręka", "Jedna ręka pracuje, druga przy biodrze. Ręka wchodzi do wody za głową, mały palec pierwszy.", []]
  ],
  Klasyczny: [
    ["Nogi z deską", "Same nogi żabką z deską. Pięty do pośladków, stopy na zewnątrz, mocne zamknięcie.", ["deska"]],
    ["Ręce z ósemką", "Same ręce żabką z ósemką. Mały ruch przed sobą, łokcie nie za plecy.", ["osemka"]],
    ["Poślizg", "Po każdym ruchu nóg 2 sekundy poślizgu w linii. Jeden ruch = jak najdalej.", []]
  ],
  Motylkowy: [
    ["Delfin na boku", "Fala ciała z bioder, na boku z płetwami. Krótko, bez zmęczenia.", ["pletwy"]],
    ["Jedna ręka", "Motylek jedną ręką, oddech w bok. Dwa uderzenia nóg na jeden ruch ręki.", ["pletwy"]]
  ]
};

function pgPlywCel(id) {
  return PG_PLYW_CELE.find(function (c) { return c.id === id; }) || PG_PLYW_CELE[0];
}

// Ładne długości odcinków (w metrach)
const PG_PLYW_ODCINKI = [25, 50, 75, 100, 150, 200, 300, 400, 500, 600, 800, 1000, 1200, 1500];

// Metry → długości basenu (co najmniej 1). Na nietypowym basenie wychodzi najbliższa liczba całych długości.
function pgPlywDl(m, b) {
  return Math.max(1, Math.round(m / plywBasenM(b)));
}

function pgPlywZaokr(m, b) {
  const bm = plywBasenM(b);
  let naj = PG_PLYW_ODCINKI[0];
  PG_PLYW_ODCINKI.forEach(function (x) {
    if (Math.abs(x - m) < Math.abs(naj - m)) {
      naj = x;
    }
  });
  return Math.max(bm, naj);
}

// Najdłuższy odcinek bez zatrzymania (m) na start
function pgPlywZdolnosc(p) {
  const b = p.plywBasen || plywBasenDomyslny();
  return Math.max(0, (p.plywTest || 0) * plywBasenM(b));
}

// Tempo pracy: ile metrów mieści się w minucie treningu (z przerwami)
function pgPlywMetryNaMin(c) {
  return c < 100 ? 18 : c < 400 ? 26 : c < 1000 ? 34 : 42;
}

function pgPlywTydzien(p, tydz) {
  return Math.max(1, ((p.blokNr || 1) - 1) * 4 + tydz + 1 + (p.plywPrzes || 0));
}

function pgPlywTygodniLaczne(p) {
  return Math.max(4, p.tygodni || 8) - (p.plywPrzes || 0);
}

// Objętość jednego treningu w tygodniu w planu (m)
function pgPlywObjetosc(p, w, b) {
  const c = pgPlywZdolnosc(p);
  const naMin = pgPlywMetryNaMin(c);
  const sufit = p.plywCzas * naMin * 1.15;
  const start = Math.min(p.plywCzas * naMin * 0.7, Math.max(300, c * 8));
  let v = start;
  let wzrost = 0;
  for (let i = 1; i < w; i++) {
    if (i % 4 !== 0) {
      wzrost++;
    }
  }
  v = start * Math.pow(1.1, wzrost);
  v = Math.min(v, sufit);
  if (w % 4 === 0) {
    v *= 0.75;
  }
  return Math.max(4 * plywBasenM(b), v);
}

// Długość odcinka w części głównej: rośnie od ok. 60% możliwości do celu na końcu planu
function pgPlywOdcinek(p, w, b) {
  const cel = pgPlywCel(p.plywCel);
  const c = Math.max(plywBasenM(b), pgPlywZdolnosc(p));
  const T = pgPlywTygodniLaczne(p);
  let docel = cel.cel && !cel.szybkosc ? cel.cel : Math.min(Math.max(c * 1.6, 200), 800);
  if (cel.szybkosc) {
    docel = cel.cel <= 100 ? 200 : cel.cel <= 400 ? 400 : 800;
  }
  if (cel.id === "start") {
    docel = Math.max(c * 2, 100);
  }
  if (cel.id === "styl") {
    docel = Math.max(c, 100);
  }
  const baza = Math.max(plywBasenM(b), Math.min(c * 0.6, docel));
  const f = T > 1 ? Math.min(1, (w - 1) / (T - 1)) : 1;
  return Math.min(docel, baza * Math.pow(docel / baza, f));
}

function pgPlywBlok(o, b) {
  const x = Object.assign({}, o);
  if (x.m !== undefined) {
    x.dl = pgPlywDl(x.m, b);
    delete x.m;
  }
  return plywBlokNowy(x);
}

// Jeden trening: rozgrzewka, technika, główna, wyciszenie
function pgPlywTrening(p, w, nr, ileWTyg, b) {
  const cel = pgPlywCel(p.plywCel);
  const znaKraul = (p.plywTest || 0) >= 1 && (p.plywStyle || []).indexOf("Kraul") !== -1;
  const stylGl = znaKraul ? "Kraul" : "Dowolnie wybrany";
  const v = pgPlywObjetosc(p, w, b) * (nr === ileWTyg - 1 && ileWTyg > 2 ? 1.1 : 1);
  const lekki = w % 4 === 0;
  const T = pgPlywTygodniLaczne(p);
  const sprawdzian = (lekki || w === T) && nr === ileWTyg - 1;
  const akcent = !lekki && ileWTyg >= 2 && nr === 1 && (p.plywTest || 0) >= 4 && cel.id !== "styl" && cel.id !== "start";
  const bloki = [];
  const c = pgPlywZdolnosc(p);
  const bm = plywBasenM(b);
  const odcinek = pgPlywZaokr(pgPlywOdcinek(p, w, b), b);

  // Rozgrzewka ok. 15%
  const rozg = pgPlywZaokr(Math.max(bm * 2, v * 0.15), b);
  bloki.push(pgPlywBlok({ m: rozg, powt: 1, styl: "Dowolnie wybrany", typ: "rozgrzewka", intensywnosc: "spokojnie", przerwaS: 0, notatka: c < 2 * bm ? "Spokojnie, z przerwami przy ścianie, ile trzeba" : "Spokojnie, rozluźnienie" }, b));

  // Technika ok. 15–25%
  const stylT = cel.id === "styl" && p.plywNowy ? p.plywNowy : "Kraul";
  const cwiczenia = PG_PLYW_TECHNIKA[stylT] || PG_PLYW_TECHNIKA.Kraul;
  const cw = cwiczenia[(w + nr) % cwiczenia.length];
  const udzT = cel.id === "styl" || cel.id === "start" || c < 100 ? 0.25 : 0.15;
  const odcT = Math.max(bm, Math.min(50, bm * 2));
  const ileT = Math.max(2, Math.round(v * udzT / odcT));
  bloki.push(pgPlywBlok({ m: odcT, powt: Math.min(12, ileT), styl: stylT, typ: "technika", intensywnosc: "spokojnie", przerwaS: 20, pomoce: cw[2].slice(), notatka: cw[0] + ": " + cw[1] }, b));

  // Część główna
  const zostaje = Math.max(bm * 2, v - plywMetry(bloki[0].dl, b) - plywMetry(bloki[1].dl * bloki[1].powt, b) - Math.max(bm * 2, v * 0.1));
  const f = T > 1 ? Math.min(1, (w - 1) / (T - 1)) : 1;
  if (sprawdzian) {
    let dystans;
    let opis;
    if (cel.szybkosc) {
      dystans = cel.cel;
      opis = "Sprawdzian: " + cel.cel + " m na czas. Równo, mocno od połowy. Wpisz czas pływania w wyniku.";
    } else if (w === T && cel.cel) {
      dystans = cel.cel;
      opis = "Sprawdzian celu: " + cel.cel + " m bez zatrzymania. Spokojne, równe tempo. Wpisz najdłuższy odcinek w wyniku.";
    } else {
      dystans = pgPlywZaokr(Math.max(odcinek * 1.25, bm * 2), b);
      opis = "Sprawdzian: jak najdalej bez zatrzymania, maksymalnie " + dystans + " m. Wpisz najdłuższy odcinek w wyniku – kolejny blok go użyje.";
    }
    bloki.push(pgPlywBlok({ m: dystans, powt: 1, styl: cel.id === "styl" && p.plywNowy && w === T ? p.plywNowy : stylGl, typ: "glowna", intensywnosc: cel.szybkosc ? "mocno" : "umiarkowanie", przerwaS: 0, notatka: opis }, b));
  } else if (akcent && cel.szybkosc) {
    // Akcent szybkościowy: krótkie odcinki, pełny odpoczynek
    const krotki = cel.cel <= 100 ? 50 : cel.cel <= 400 ? 100 : 200;
    const dl = pgPlywZaokr(krotki, b);
    const ile = Math.max(3, Math.min(10, Math.round(zostaje * 0.45 / dl)));
    bloki.push(pgPlywBlok({ m: dl, powt: ile, styl: stylGl, typ: "glowna", intensywnosc: cel.cel <= 100 ? "sprint" : "mocno", przerwaS: cel.cel <= 100 ? 60 : 30, notatka: "Szybko, ale technicznie. Każde powtórzenie w podobnym czasie." }, b));
    const reszta = Math.max(bm * 2, zostaje - dl * ile);
    bloki.push(pgPlywBlok({ m: pgPlywZaokr(reszta, b), powt: 1, styl: stylGl, typ: "glowna", intensywnosc: "spokojnie", przerwaS: 0, notatka: "Spokojnie, na rozluźnienie" }, b));
  } else if (akcent) {
    // Akcent: ok. 20% mocniej, potem spokojnie
    const dl = pgPlywZaokr(Math.max(bm, Math.min(100, odcinek / 2)), b);
    const ile = Math.max(2, Math.min(8, Math.round(zostaje * 0.3 / dl)));
    const glowna = Math.max(bm, zostaje - dl * ile);
    const odc = Math.min(odcinek, pgPlywZaokr(glowna, b));
    const powt = Math.max(1, Math.round(glowna / odc));
    bloki.push(pgPlywBlok({ m: odc, powt: powt, styl: stylGl, typ: "glowna", intensywnosc: "umiarkowanie", przerwaS: Math.round(30 - 15 * f), notatka: powt > 1 ? "Równo, bez zatrzymania w trakcie odcinka" : "Równo, bez zatrzymania" }, b));
    bloki.push(pgPlywBlok({ m: dl, powt: ile, styl: stylGl, typ: "glowna", intensywnosc: "mocno", przerwaS: 30, notatka: "Mocniej, ok. 7–8/10" }, b));
  } else {
    // Wytrzymałość: odcinki coraz dłuższe, przerwy coraz krótsze
    // Co najmniej 2 powtórzenia, dopiero pod koniec planu „bez zatrzymania” – jeden długi odcinek
    const minPowt = cel.cel && !cel.szybkosc && f >= 0.75 ? 1 : 2;
    const odc = Math.max(bm, Math.min(odcinek, pgPlywZaokr(zostaje / minPowt, b)));
    const powt = Math.max(1, Math.round(zostaje / odc));
    const przerwa = c < 2 * bm ? 45 : odc >= 400 ? 40 : Math.round(30 - 15 * f);
    const st = cel.id === "styl" && p.plywNowy && nr % 2 === 1 ? p.plywNowy : stylGl;
    bloki.push(pgPlywBlok({ m: st === p.plywNowy ? Math.min(odc, 50) : odc, powt: st === p.plywNowy ? Math.max(2, Math.round(zostaje / Math.min(odc, 50))) : powt, styl: st, typ: "glowna", intensywnosc: lekki ? "spokojnie" : "umiarkowanie", przerwaS: przerwa, notatka: c < 2 * bm ? "Odpocznij przy ścianie, aż oddech się uspokoi" : "Równo, tempo, w którym da się utrzymać oddech" }, b));
  }

  // Wyciszenie ok. 10%
  bloki.push(pgPlywBlok({ m: pgPlywZaokr(Math.max(bm * 2, v * 0.1), b), powt: 1, styl: "Dowolnie wybrany", typ: "wyciszenie", intensywnosc: "spokojnie", przerwaS: 0, notatka: "Bardzo spokojnie" }, b));
  return { bloki: bloki, sprawdzian: sprawdzian, akcent: akcent };
}

const PG_PLYW_DNI = { 1: [0], 2: [0, 3], 3: [0, 2, 4], 4: [0, 1, 3, 5] };

function pgPlywBudujPlan(p) {
  const b = p.plywBasen || plywBasenDomyslny();
  p.plywBasen = b;
  const cel = pgPlywCel(p.plywCel);
  const T = pgPlywTygodniLaczne(p);
  const dni = PG_PLYW_DNI[Math.max(1, Math.min(4, p.plywDni || 2))];
  const wynik = { treningi: {}, sesje: [], powody: [], uwagi: [], profil: p, kotwice: {}, czasBlokow: { rozgrzewka: 0, rozciaganie: 0 } };

  for (let tydz = 0; tydz < 4; tydz++) {
    const w = pgPlywTydzien(p, tydz);
    if (w > T) {
      break;
    }
    dni.forEach(function (d, nr) {
      const t = pgPlywTrening(p, w, nr, dni.length, b);
      wynik.sesje.push({
        dzien: tydz * 7 + d,
        kardio: "rodzaj-basen",
        bloki: t.bloki,
        basen: Object.assign({}, b),
        czasSesji: p.plywCzas * 60,
        sprawdzian: t.sprawdzian,
        notatka: (t.sprawdzian ? "Sprawdzian. " : t.akcent ? "Trening z akcentem (ok. 20% mocniej). " : "") + (w % 4 === 0 ? "Lżejszy tydzień – ciało nadrabia regenerację." : "")
      });
    });
  }

  const c = pgPlywZdolnosc(p);
  wynik.nazwa = "Pływanie – " + cel.nazwa + " (" + dni.length + "× w tygodniu)";
  if (T > 4) {
    wynik.nazwa += " (blok " + (p.blokNr || 1) + "/" + Math.max(p.blokNr || 1, Math.ceil(T / 4)) + ")";
  } else if ((p.blokNr || 1) > 1) {
    wynik.nazwa += " (blok " + p.blokNr + ")";
  }

  // Bezpieczeństwo
  if ((p.plywTest || 0) < 2) {
    wynik.uwagi.push("Jeśli nie przepłyniesz jeszcze 2 długości, najlepiej zacznij od kilku lekcji z instruktorem. Pływaj tylko na strzeżonym basenie, w części, gdzie dosięgasz dna, i nigdy sam(a).");
  } else {
    wynik.uwagi.push("Plan nie zastępuje instruktora. Pływaj na strzeżonym basenie. Gdy poczujesz zawroty głowy, ból w klatce piersiowej albo skurcz – przerwij i wyjdź z wody.");
  }
  if (cel.cel && !cel.szybkosc && c >= cel.cel) {
    wynik.uwagi.push("Już dziś przepływasz " + cel.cel + " m bez zatrzymania. Plan utrzyma ten dystans i doda objętości. Możesz też wybrać ambitniejszy cel.");
  }
  if (cel.szybkosc && c < cel.cel) {
    wynik.uwagi.push("Na razie nie przepływasz " + cel.cel + " m bez zatrzymania, więc w pierwszych tygodniach plan buduje wytrzymałość, a szybkość dochodzi stopniowo.");
  }

  // Dlaczego ten plan?
  wynik.powody.push("Treningi wpisane w długościach Twojego basenu (" + plywOpisBasenu(b) + "). Metry liczą się same.");
  wynik.powody.push("Każdy trening ma rozgrzewkę, technikę, część główną i wyciszenie. Technika na świeżo, zanim przyjdzie zmęczenie.");
  wynik.powody.push("Objętość rośnie o ok. 10% na tydzień, a co 4. tydzień jest lżejszy, żeby ciało nadrobiło regenerację.");
  if (cel.cel && !cel.szybkosc) {
    wynik.powody.push("Odcinki w części głównej się wydłużają, a przerwy skracają – tak ciało uczy się pływać dłużej bez zatrzymania (np. 8×50 → 4×100 → 3×200 → 2×400 → 800).");
  } else if (cel.szybkosc) {
    wynik.powody.push("Większość pływania jest spokojna (ok. 80%), a raz w tygodniu jest akcent szybkości (ok. 20%). Taki podział daje najlepszy postęp.");
  } else if (cel.id === "styl") {
    wynik.powody.push("Nowy styl ćwiczysz krótkimi odcinkami i ćwiczeniami technicznymi – technika psuje się ze zmęczeniem, więc lepiej krócej, a dobrze.");
  }
  wynik.powody.push("Na koniec każdego bloku (lżejszy tydzień) jest sprawdzian. Wpisz w wyniku najdłuższy odcinek bez zatrzymania – kolejny blok dobierze się do niego i ścieżka „Pływanie” zaliczy kroki sama.");
  return wynik;
}

// Kolejny blok: realizacja, wysiłek i nowy najdłuższy odcinek
function pgPlywAdaptuj(plan, p, zmiany) {
  let planowane = 0;
  let zrobione = 0;
  let wys = 0;
  let wysN = 0;
  let najM = 0;
  plan.sesje.forEach(function (s) {
    const a = plan.aktywnosci.find(function (x) { return x.id === s.aktywnoscId; });
    if (!a || a.rodzajId !== "rodzaj-basen") {
      return;
    }
    planowane++;
    if (!s.wynik) {
      return;
    }
    zrobione++;
    if (typeof s.wynik.wysilek === "number") {
      wys += s.wynik.wysilek;
      wysN++;
    }
    const bw = plywBasen(s.wynik.bloki ? s.wynik : s);
    if (typeof s.wynik.najdluzszy === "number") {
      najM = Math.max(najM, s.wynik.najdluzszy * plywBasenM(bw));
    }
  });
  if (planowane >= 3) {
    const czesc = zrobione / planowane;
    const sredni = wysN ? wys / wysN : null;
    if (czesc < PA_PROG_REALIZACJI) {
      p.plywPrzes = (p.plywPrzes || 0) - 2;
      zmiany.push("Zrobiłeś(aś) " + zrobione + " z " + planowane + " treningów na basenie, więc powtórzę dwa ostatnie tygodnie zamiast zwiększać objętość. Plan będzie o 2 tygodnie dłuższy.");
    } else if (sredni !== null && sredni >= 8) {
      p.plywPrzes = (p.plywPrzes || 0) - 1;
      zmiany.push("Treningi na basenie oceniałeś(aś) średnio na " + (Math.round(sredni * 10) / 10) + "/10, więc powtórzę ostatni tydzień, żeby ciało się przyzwyczaiło.");
    }
  }
  const b = p.plywBasen || plywBasenDomyslny();
  const teraz = (p.plywTest || 0) * plywBasenM(b);
  if (najM > teraz + 1) {
    p.plywTest = Math.round(najM / plywBasenM(b) * 10) / 10;
    zmiany.push("Najdłużej bez zatrzymania: " + Math.round(najM) + " m (wcześniej " + Math.round(teraz) + " m). Kolejny blok startuje od tego wyniku.");
  }
  return { planowane: planowane, zrobione: zrobione, wysilek: wysN ? wys / wysN : null, najM: najM };
}
