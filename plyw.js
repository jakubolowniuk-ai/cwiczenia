// ===== Pływanie: długość basenu, bloki treningu w długościach, wynik, statystyki =====
// Model danych sesji basenu (plan i wynik):
//   s.basen      = { dlugosc: 25, jednostka: "m" | "yd" }  (brak = basen domyślny z ustawień)
//   s.bloki      = [{ powt, dl, styl, tryb: "przerwa"|"odjazd", przerwaS, odjazdS, pomoce: [], intensywnosc, typ, notatka }]
//   s.trybProsty = true – w planie widać tylko „długości + styl”
//   s.czasSesji  = sekundy całego treningu (opcjonalnie)
//   wynik.czas   = czas samego pływania { wartosc, jednostka: "s" } (opcjonalnie, do tempa i rekordów)
//   wynik.najdluzszy = najdłuższy odcinek bez zatrzymania, w długościach

const PLYW_STYLE = ["Kraul", "Grzbietowy", "Klasyczny", "Motylkowy", "Zmienny", "Dowolnie wybrany"];
const PLYW_POMOCE = [["deska", "Deska"], ["osemka", "Ósemka"], ["pletwy", "Płetwy"], ["lapki", "Łapki"], ["fajka", "Fajka"]];
const PLYW_INTENS = [["spokojnie", "Spokojnie"], ["umiarkowanie", "Umiarkowanie"], ["mocno", "Mocno"], ["sprint", "Sprint"]];
const PLYW_TYPY = [["rozgrzewka", "Rozgrzewka"], ["technika", "Technika"], ["glowna", "Część główna"], ["wyciszenie", "Wyciszenie"]];
const PLYW_BASENY = [["25m", 25, "m", "25 m"], ["50m", 50, "m", "50 m"], ["25yd", 25, "yd", "25 jardów"]];

function plywEl(tag, klasa, tekst) {
  const el = document.createElement(tag);
  if (klasa) {
    el.className = klasa;
  }
  if (tekst !== undefined && tekst !== null) {
    el.textContent = tekst;
  }
  return el;
}

// ----- Basen -----

function plywBasenDomyslny() {
  const b = dane.ustawienia && dane.ustawienia.basen;
  return b && b.dlugosc > 0 ? { dlugosc: b.dlugosc, jednostka: b.jednostka === "yd" ? "yd" : "m" } : { dlugosc: 25, jednostka: "m" };
}

function plywBasen(s) {
  return s && s.basen && s.basen.dlugosc > 0 ? s.basen : plywBasenDomyslny();
}

// Długość basenu w metrach (jardy przeliczone)
function plywBasenM(b) {
  return b.jednostka === "yd" ? b.dlugosc * 0.9144 : b.dlugosc;
}

function plywOpisBasenu(b) {
  return String(b.dlugosc).replace(".", ",") + (b.jednostka === "yd" ? " jardów" : " m");
}

function plywMetry(dlugosci, b) {
  return Math.round(dlugosci * plywBasenM(b));
}

// „25m”, „50m”, „25yd” albo „inny” – do wyboru w polach
function plywKluczBasenu(b) {
  const k = PLYW_BASENY.find(function (x) { return x[1] === b.dlugosc && x[2] === b.jednostka; });
  return k ? k[0] : "inny";
}

// ----- Bloki -----

function plywBlokNowy(o) {
  return Object.assign({
    powt: 1,
    dl: 4,
    styl: "Kraul",
    tryb: "przerwa",
    przerwaS: 20,
    odjazdS: 0,
    pomoce: [],
    intensywnosc: "spokojnie",
    typ: "glowna",
    notatka: ""
  }, o || {});
}

// Bloki sesji. Starsze zapisy (etapy w metrach) zamieniamy na bloki po jednej „długości” basenu sesji.
function plywBlokiSesji(s) {
  if (Array.isArray(s.bloki) && s.bloki.length) {
    return s.bloki;
  }
  const bm = plywBasenM(plywBasen(s));
  return etapySesji(s).map(function (e) {
    return plywBlokNowy({ powt: 1, dl: Math.round(e.metry / bm * 100) / 100, styl: plywStyl(e.styl), intensywnosc: "umiarkowanie", przerwaS: 0 });
  });
}

function plywStyl(styl) {
  return !styl || styl === "Dowolny" ? "Kraul" : styl;
}

function plywDlugosci(bloki) {
  return bloki.reduce(function (suma, b) {
    return suma + (Number(b.powt) || 0) * (Number(b.dl) || 0);
  }, 0);
}

// Etapy [{ styl, metry }] z bloków – dla starszego kodu (opisy, rekordy, cele)
function plywEtapyZBlokow(s) {
  const b = plywBasen(s);
  const suma = {};
  const kolejnosc = [];
  s.bloki.forEach(function (x) {
    const st = x.styl || "Kraul";
    if (!(st in suma)) {
      suma[st] = 0;
      kolejnosc.push(st);
    }
    suma[st] += (Number(x.powt) || 0) * (Number(x.dl) || 0);
  });
  return kolejnosc.map(function (st) {
    return { styl: st, metry: plywMetry(suma[st], b) };
  }).filter(function (e) { return e.metry > 0; });
}

function plywNazwa(lista, id) {
  const x = lista.find(function (p) { return p[0] === id; });
  return x ? x[1] : id;
}

// Krótki opis bloku: „4 × 2 dł. kraul (4 × 50 m) · przerwa 20 s”
function plywOpisBloku(blok, b) {
  const m = plywMetry(blok.dl, b);
  let t = (blok.powt > 1 ? blok.powt + " × " : "") + plywLiczba(blok.dl) + " dł. " + (blok.styl || "").toLowerCase() + " (" + (blok.powt > 1 ? blok.powt + " × " : "") + m + " m)";
  if (blok.tryb === "odjazd" && blok.odjazdS > 0) {
    t += " · start co " + plywFormat(blok.odjazdS);
  } else if (blok.przerwaS > 0 && blok.powt > 1) {
    t += " · przerwa " + plywFormat(blok.przerwaS);
  }
  return t;
}

function plywLiczba(n) {
  return String(Math.round(n * 100) / 100).replace(".", ",");
}

// 75 → „1:15”, 20 → „20 s”
function plywFormat(s) {
  s = Math.round(s);
  if (s < 60) {
    return s + " s";
  }
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}

// Tempo na 100 m: „2:05 /100 m”
function plywTempo(czasS, metry) {
  if (!(czasS > 0) || !(metry > 0)) {
    return null;
  }
  return czasS / (metry / 100);
}

function plywOpisTempa(t) {
  const s = Math.round(t);
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0") + " /100 m";
}

// „40 dł. × 25 m = 1000 m · kraul” (plan albo wynik)
function plywOpisKrotki(s) {
  const b = plywBasen(s);
  const bl = plywBlokiSesji(s);
  const dl = plywDlugosci(bl);
  const style = [];
  bl.forEach(function (x) {
    if (style.indexOf(x.styl) === -1) {
      style.push(x.styl);
    }
  });
  let t = plywLiczba(dl) + " dł. × " + plywOpisBasenu(b) + " = " + plywMetry(dl, b) + " m";
  if (style.length === 1) {
    t += " · " + style[0].toLowerCase();
  } else if (bl.length > 1) {
    t += " · " + bl.length + (bl.length % 10 >= 2 && bl.length % 10 <= 4 && (bl.length % 100 < 12 || bl.length % 100 > 14) ? " bloki" : " bloków");
  }
  return t;
}

// Rozwijana lista bloków treningu (ekran Dziś)
function plywListaBlokow(s) {
  const b = plywBasen(s);
  const det = plywEl("details", "plyw-dzis-bloki");
  det.appendChild(plywEl("summary", "", "Plan treningu: " + plywBlokiSesji(s).length + " " + (plywBlokiSesji(s).length < 5 ? "bloki" : "bloków")));
  const ol = plywEl("ol", "plyw-dzis-lista");
  plywBlokiSesji(s).forEach(function (x) {
    const li = plywEl("li", "plyw-typ-" + x.typ);
    li.appendChild(plywEl("b", "", plywNazwa(PLYW_TYPY, x.typ) + ": "));
    li.appendChild(document.createTextNode(plywOpisBloku(x, b) + " · " + plywNazwa(PLYW_INTENS, x.intensywnosc).toLowerCase()));
    if ((x.pomoce || []).length) {
      li.appendChild(document.createTextNode(" · " + x.pomoce.map(function (p) { return plywNazwa(PLYW_POMOCE, p).toLowerCase(); }).join(", ")));
    }
    if (x.notatka) {
      li.appendChild(plywEl("div", "opis", x.notatka));
    }
    ol.appendChild(li);
  });
  det.appendChild(ol);
  det.appendChild(plywEl("p", "opis", plywPodsumowanie(plywBlokiSesji(s), b)));
  return det;
}

// ----- Szacowanie czasu treningu -----

const PLYW_MNOZNIK_INT = { spokojnie: 1.1, umiarkowanie: 1, mocno: 0.92, sprint: 0.85 };

// Typowe tempo użytkownika (s/100 m) z ostatnich wyników, inaczej 3:00 (spokojne tempo rekreacyjne)
function plywTempoBazowe() {
  const lista = plywZbierz().filter(function (p) { return p.tempo; }).slice(0, 8).map(function (p) { return p.tempo; }).sort(function (a, b) { return a - b; });
  return lista.length ? lista[Math.floor(lista.length / 2)] : 180;
}

function plywSzacujCzasS(bloki, b) {
  const t = plywTempoBazowe();
  const bm = plywBasenM(b);
  let suma = 0;
  bloki.forEach(function (x, i) {
    let mn = PLYW_MNOZNIK_INT[x.intensywnosc] || 1;
    if ((x.pomoce || []).indexOf("deska") !== -1) {
      mn *= 1.3;
    }
    if ((x.pomoce || []).indexOf("pletwy") !== -1) {
      mn *= 0.85;
    }
    const powt = Number(x.powt) || 0;
    const jeden = (Number(x.dl) || 0) * bm / 100 * t * mn;
    if (x.tryb === "odjazd" && x.odjazdS > 0) {
      suma += powt * Math.max(x.odjazdS, jeden);
    } else {
      suma += powt * jeden + Math.max(0, powt - 1) * (Number(x.przerwaS) || 0);
    }
    if (i > 0) {
      suma += 30;
    }
  });
  return suma;
}

function plywPodsumowanie(bloki, b) {
  const dl = plywDlugosci(bloki);
  const czas = plywSzacujCzasS(bloki, b);
  return "Razem: " + plywLiczba(dl) + " " + plywOdmianaDl(dl) + " = " + plywMetry(dl, b) + " m" + (czas > 0 ? " · ok. " + Math.max(1, Math.round(czas / 60)) + " min" : "");
}

function plywOdmianaDl(n) {
  if (Math.floor(n) !== n) {
    return "długości";
  }
  const r10 = n % 10;
  const r100 = n % 100;
  if (n === 1) {
    return "długość";
  }
  return r10 >= 2 && r10 <= 4 && (r100 < 12 || r100 > 14) ? "długości" : "długości";
}

// ----- Szablony -----
// Odcinki w metrach; na basenie zamieniamy je na długości (co najmniej 1)

const PLYW_SZABLONY = {
  technika: {
    nazwa: "Technika",
    opis: "ok. 1500 m · ćwiczenia techniczne i spokojne pływanie",
    bloki: [
      { m: 200, powt: 1, styl: "Kraul", typ: "rozgrzewka", intensywnosc: "spokojnie", przerwaS: 0 },
      { m: 50, powt: 8, styl: "Kraul", typ: "technika", intensywnosc: "spokojnie", przerwaS: 20, pomoce: ["deska"], notatka: "Same nogi z deską, długie ruchy z bioder" },
      { m: 100, powt: 4, styl: "Kraul", typ: "glowna", intensywnosc: "umiarkowanie", przerwaS: 20, notatka: "Wydech do wody, oddech co 3 ruchy" },
      { m: 50, powt: 4, styl: "Grzbietowy", typ: "technika", intensywnosc: "spokojnie", przerwaS: 15 },
      { m: 200, powt: 1, styl: "Kraul", typ: "glowna", intensywnosc: "spokojnie", przerwaS: 0, pomoce: ["osemka"], notatka: "Same ręce, ósemka między udami" },
      { m: 100, powt: 1, styl: "Dowolnie wybrany", typ: "wyciszenie", intensywnosc: "spokojnie", przerwaS: 0 }
    ]
  },
  wytrzymalosc: {
    nazwa: "Wytrzymałość",
    opis: "ok. 2000 m · dłuższe odcinki, krótkie przerwy",
    bloki: [
      { m: 300, powt: 1, styl: "Dowolnie wybrany", typ: "rozgrzewka", intensywnosc: "spokojnie", przerwaS: 0 },
      { m: 50, powt: 2, styl: "Kraul", typ: "technika", intensywnosc: "spokojnie", przerwaS: 15, pomoce: ["deska"] },
      { m: 200, powt: 4, styl: "Kraul", typ: "glowna", intensywnosc: "umiarkowanie", przerwaS: 30 },
      { m: 400, powt: 1, styl: "Kraul", typ: "glowna", intensywnosc: "spokojnie", przerwaS: 0, notatka: "Równo, bez zatrzymania" },
      { m: 50, powt: 4, styl: "Kraul", typ: "glowna", intensywnosc: "mocno", przerwaS: 30 },
      { m: 200, powt: 1, styl: "Dowolnie wybrany", typ: "wyciszenie", intensywnosc: "spokojnie", przerwaS: 0 }
    ]
  },
  sprint: {
    nazwa: "Sprint",
    opis: "ok. 1200 m · krótkie, szybkie odcinki z długim odpoczynkiem",
    bloki: [
      { m: 300, powt: 1, styl: "Dowolnie wybrany", typ: "rozgrzewka", intensywnosc: "spokojnie", przerwaS: 0 },
      { m: 50, powt: 4, styl: "Kraul", typ: "technika", intensywnosc: "umiarkowanie", przerwaS: 20, notatka: "Ostatnie 10 m każdej długości szybciej" },
      { m: 25, powt: 8, styl: "Kraul", typ: "glowna", intensywnosc: "sprint", tryb: "odjazd", odjazdS: 60, przerwaS: 0, notatka: "Maksymalnie szybko, pełny odpoczynek" },
      { m: 50, powt: 4, styl: "Kraul", typ: "glowna", intensywnosc: "mocno", przerwaS: 45 },
      { m: 200, powt: 1, styl: "Kraul", typ: "glowna", intensywnosc: "spokojnie", przerwaS: 0 },
      { m: 100, powt: 1, styl: "Dowolnie wybrany", typ: "wyciszenie", intensywnosc: "spokojnie", przerwaS: 0 }
    ]
  }
};

// Odcinek w metrach → bloki w długościach basenu
function plywBlokZMetrow(o, b) {
  const bm = plywBasenM(b);
  const dl = Math.max(1, Math.round(o.m / bm));
  const x = Object.assign({}, o);
  delete x.m;
  x.dl = dl;
  return plywBlokNowy(x);
}

function plywSzablon(id, b) {
  return PLYW_SZABLONY[id].bloki.map(function (o) { return plywBlokZMetrow(o, b); });
}

// ----- Pola pomocnicze -----

function plywPoleLiczby(etykieta, wartosc, opcje) {
  opcje = opcje || {};
  const blok = plywEl("div", "plyw-pole");
  const opis = plywEl("label", "", etykieta);
  const pole = document.createElement("input");
  pole.type = "number";
  pole.min = "0";
  pole.inputMode = opcje.ulamki ? "decimal" : "numeric";
  if (opcje.ulamki) {
    pole.step = "any";
  }
  pole.value = wartosc === null || wartosc === undefined ? "" : String(wartosc);
  if (opcje.placeholder) {
    pole.placeholder = opcje.placeholder;
  }
  pole.addEventListener("focus", function () { pole.select(); });
  if (typeof dostepnoscPowiaz === "function") {
    dostepnoscPowiaz(opis, pole);
  }
  blok.appendChild(opis);
  blok.appendChild(pole);
  return { blok: blok, pole: pole };
}

function plywWybor(etykieta, opcje, wartosc) {
  const blok = plywEl("div", "plyw-pole");
  const opis = plywEl("label", "", etykieta);
  const wybor = document.createElement("select");
  opcje.forEach(function (o) {
    const op = document.createElement("option");
    op.value = o[0];
    op.textContent = o[1];
    wybor.appendChild(op);
  });
  wybor.value = wartosc;
  if (typeof dostepnoscPowiaz === "function") {
    dostepnoscPowiaz(opis, wybor);
  }
  blok.appendChild(opis);
  blok.appendChild(wybor);
  return { blok: blok, wybor: wybor };
}

function plywListaStylow(dodatkowy) {
  const lista = PLYW_STYLE.slice();
  (dane.stylePlywania || []).forEach(function (s) {
    if (s !== "Dowolny" && lista.indexOf(s) === -1) {
      lista.push(s);
    }
  });
  if (dodatkowy && lista.indexOf(dodatkowy) === -1) {
    lista.push(dodatkowy);
  }
  return lista.map(function (s) { return [s, s]; });
}

// Wybór basenu: domyślny / 25 m / 50 m / 25 jardów / inny (z polem na długość)
function plywWyborBasenu(start, zDomyslnym, przyZmianie) {
  const blok = plywEl("div", "plyw-basen");
  const opcje = [];
  const dom = plywBasenDomyslny();
  if (zDomyslnym) {
    opcje.push(["dom", "Mój basen (" + plywOpisBasenu(dom) + ")"]);
  }
  PLYW_BASENY.forEach(function (x) { opcje.push([x[0], x[3]]); });
  opcje.push(["inny", "Inna długość…"]);
  const w = plywWybor("Basen", opcje, start ? plywKluczBasenu(start) : "dom");
  blok.appendChild(w.blok);
  const rzad = plywEl("div", "rzad plyw-basen-inny");
  const dl = plywPoleLiczby("Długość basenu", start && plywKluczBasenu(start) === "inny" ? start.dlugosc : 33, { ulamki: true });
  const jedn = plywWybor("Jednostka", [["m", "metry"], ["yd", "jardy"]], start && start.jednostka === "yd" ? "yd" : "m");
  rzad.appendChild(dl.blok);
  rzad.appendChild(jedn.blok);
  blok.appendChild(rzad);
  function odczyt() {
    const k = w.wybor.value;
    if (k === "dom") {
      return null;
    }
    if (k === "inny") {
      const d = Number(dl.pole.value);
      return d > 0 ? { dlugosc: Math.round(d * 100) / 100, jednostka: jedn.wybor.value } : undefined;
    }
    const x = PLYW_BASENY.find(function (p) { return p[0] === k; });
    return { dlugosc: x[1], jednostka: x[2] };
  }
  function pokaz() {
    rzad.hidden = w.wybor.value !== "inny";
  }
  pokaz();
  [w.wybor, dl.pole, jedn.wybor].forEach(function (el) {
    el.addEventListener(el.tagName === "SELECT" ? "change" : "input", function () {
      pokaz();
      przyZmianie();
    });
  });
  return { blok: blok, odczyt: odczyt };
}

// Czas „minuty + sekundy”
function plywPoleCzasu(etykieta, sekundy) {
  const blok = plywEl("div", "plyw-czas");
  blok.appendChild(plywEl("div", "plyw-etyk", etykieta));
  const rzad = plywEl("div", "rzad");
  const m = plywPoleLiczby("minuty", sekundy ? Math.floor(sekundy / 60) : "", { placeholder: "brak" });
  const s = plywPoleLiczby("sekundy", sekundy ? Math.round(sekundy % 60) : "", { placeholder: "0" });
  rzad.appendChild(m.blok);
  rzad.appendChild(s.blok);
  blok.appendChild(rzad);
  return {
    blok: blok,
    pola: [m.pole, s.pole],
    odczyt: function () {
      const a = Number(m.pole.value) || 0;
      const b = Number(s.pole.value) || 0;
      return a < 0 || b < 0 ? NaN : a * 60 + b;
    }
  };
}

// ----- Karta planu i wyniku basenu -----

function plywKarta(sesja, aktywnosc, opcje) {
  opcje = opcje || {};
  return opcje.wynik ? plywKartaWyniku(sesja, opcje) : plywKartaPlanu(sesja);
}

function plywKartaPlanu(sesja) {
  const karta = plywEl("div", "formularz parametry-karta plyw-karta");
  const blad = plywEl("p", "blad");
  let basenSesji = sesja.basen && sesja.basen.dlugosc > 0 ? Object.assign({}, sesja.basen) : null;
  const stare = Array.isArray(sesja.bloki) && sesja.bloki.length ? null : etapySesji(sesja);
  let bloki = plywBlokiSesji(sesja).map(function (b) { return Object.assign({}, b, { pomoce: (b.pomoce || []).slice() }); });
  const daSieProsto = bloki.length <= 1 && (!bloki.length || (bloki[0].powt || 1) === 1);
  let prosty = !daSieProsto ? false : typeof sesja.trybProsty === "boolean" ? sesja.trybProsty : dane.ustawienia.plywTryb !== "zaawansowany";

  const basen = function () { return basenSesji || plywBasenDomyslny(); };
  let otwartyBlok = -1;

  // Basen
  const wybBasenu = plywWyborBasenu(basenSesji, true, function () {
    const b = wybBasenu.odczyt();
    if (b === undefined) {
      return;
    }
    basenSesji = b;
    odswiez();
  });
  karta.appendChild(wybBasenu.blok);

  // Tryb
  const tryb = plywEl("div", "przelacznik plyw-tryb");
  tryb.setAttribute("role", "group");
  tryb.setAttribute("aria-label", "Rodzaj zapisu");
  const bProsty = plywEl("button", "segment", "Prosty");
  const bZaaw = plywEl("button", "segment", "Bloki");
  [bProsty, bZaaw].forEach(function (b) { b.type = "button"; tryb.appendChild(b); });
  karta.appendChild(tryb);
  const opisTrybu = plywEl("p", "opis plyw-opis-trybu");
  karta.appendChild(opisTrybu);

  const strefa = plywEl("div", "plyw-strefa");
  karta.appendChild(strefa);
  const podsum = plywEl("p", "plyw-podsum");
  podsum.setAttribute("aria-live", "polite");
  karta.appendChild(podsum);

  // Czas treningu
  const czasT = plywPoleLiczby("Czas treningu w minutach (opcjonalnie)", sesja.czasSesji ? Math.round(sesja.czasSesji / 60) : "", { placeholder: "brak" });
  czasT.blok.classList.add("plyw-czas-treningu");
  karta.appendChild(czasT.blok);
  karta.appendChild(blad);

  function przelacz(naProsty) {
    if (naProsty === prosty) {
      return;
    }
    if (naProsty && (bloki.length > 1 || (bloki[0] && bloki[0].powt > 1))) {
      const dl = plywDlugosci(bloki);
      if (!confirm("Tryb prosty zapisze trening jako jeden blok: " + plywLiczba(dl) + " " + plywOdmianaDl(dl) + ". Podział na bloki zniknie. Przełączyć?")) {
        return;
      }
      const glowny = plywStylDominujacy(bloki);
      bloki = [plywBlokNowy({ powt: 1, dl: dl, styl: glowny, przerwaS: 0, intensywnosc: "umiarkowanie" })];
    }
    prosty = naProsty;
    rysuj();
  }
  bProsty.addEventListener("click", function () { przelacz(true); });
  bZaaw.addEventListener("click", function () { przelacz(false); });

  function odswiez() {
    strefa.querySelectorAll("[data-skrot]").forEach(function (el) {
      const b = bloki[Number(el.dataset.skrot)];
      if (b) {
        el.textContent = "";
        el.appendChild(plywEl("b", "", plywNazwa(PLYW_TYPY, b.typ)));
        el.appendChild(document.createTextNode(" " + plywOpisBloku(b, basen()) + " · " + plywNazwa(PLYW_INTENS, b.intensywnosc).toLowerCase()));
      }
    });
    podsum.textContent = bloki.length ? plywPodsumowanie(bloki, basen()) : "Dodaj co najmniej jeden blok.";
    strefa.querySelectorAll("[data-metry]").forEach(function (el) {
      const b = bloki[Number(el.dataset.metry)];
      if (b) {
        el.textContent = "= " + (b.powt > 1 ? b.powt + " × " : "") + plywMetry(Number(b.dl) || 0, basen()) + " m";
      }
    });
  }

  function rysuj() {
    bProsty.classList.toggle("aktywny", prosty);
    bZaaw.classList.toggle("aktywny", !prosty);
    bProsty.setAttribute("aria-pressed", prosty ? "true" : "false");
    bZaaw.setAttribute("aria-pressed", prosty ? "false" : "true");
    opisTrybu.textContent = prosty ? "Wpisz, ile długości basenu chcesz przepłynąć. Metry policzę sam." : "Rozgrzewka, technika, część główna i wyciszenie. Każdy blok: powtórzenia × długości.";
    strefa.innerHTML = "";
    if (prosty) {
      if (!bloki.length) {
        bloki = [plywBlokNowy({ dl: 20, przerwaS: 0, intensywnosc: "umiarkowanie" })];
      }
      const b = bloki[0];
      b.powt = 1;
      const rzad = plywEl("div", "rzad");
      const dl = plywPoleLiczby("Długości", b.dl || "", { ulamki: true });
      dl.pole.classList.add("plyw-dl-prosty");
      dl.pole.addEventListener("input", function () { b.dl = Number(dl.pole.value) || 0; odswiez(); });
      const st = plywWybor("Styl", plywListaStylow(b.styl), b.styl);
      st.wybor.addEventListener("change", function () { b.styl = st.wybor.value; odswiez(); });
      rzad.appendChild(dl.blok);
      rzad.appendChild(st.blok);
      strefa.appendChild(rzad);
      const m = plywEl("p", "opis plyw-metry");
      m.dataset.metry = "0";
      strefa.appendChild(m);
    } else {
      // Szablony
      const szab = plywEl("div", "plyw-szablony");
      szab.appendChild(plywEl("div", "plyw-etyk", "Gotowy trening (zastąpi bloki poniżej)"));
      const rz = plywEl("div", "chipy");
      Object.keys(PLYW_SZABLONY).forEach(function (id) {
        const s = PLYW_SZABLONY[id];
        const c = plywEl("button", "chip", s.nazwa);
        c.type = "button";
        c.title = s.opis;
        c.setAttribute("aria-label", s.nazwa + ", " + s.opis);
        c.addEventListener("click", function () {
          if (plywDlugosci(bloki) > 0 && bloki.length > 1 && !confirm("Zastąpić obecne bloki treningiem „" + s.nazwa + "” (" + s.opis + ")?")) {
            return;
          }
          bloki = plywSzablon(id, basen());
          otwartyBlok = -1;
          rysuj();
        });
        rz.appendChild(c);
      });
      szab.appendChild(rz);
      strefa.appendChild(szab);

      const lista = plywEl("div", "plyw-bloki");
      if (bloki.length) {
        strefa.appendChild(plywEl("p", "opis plyw-wskazowka", "Dotknij blok, żeby go zmienić."));
      }
      bloki.forEach(function (b, i) {
        lista.appendChild(plywEdytorBloku(b, i));
      });
      strefa.appendChild(lista);
      const dodaj = plywEl("button", "przycisk drugi plyw-dodaj", "+ Dodaj blok");
      dodaj.type = "button";
      dodaj.addEventListener("click", function () {
        const ost = bloki[bloki.length - 1];
        bloki.push(plywBlokNowy(ost ? { styl: ost.styl, typ: ost.typ === "wyciszenie" ? "glowna" : ost.typ } : {}));
        otwartyBlok = bloki.length - 1;
        rysuj();
        const nowe = strefa.querySelectorAll(".plyw-blok");
        if (nowe.length) {
          const pole = nowe[nowe.length - 1].querySelector("input");
          if (pole) { pole.focus(); }
        }
      });
      strefa.appendChild(dodaj);
    }
    odswiez();
  }

  function plywEdytorBloku(b, i) {
    const el = plywEl("div", "plyw-blok plyw-typ-" + b.typ);
    const gora = plywEl("div", "plyw-blok-gora");
    const naglowek = plywEl("button", "plyw-blok-nagl");
    naglowek.type = "button";
    naglowek.setAttribute("aria-expanded", otwartyBlok === i ? "true" : "false");
    naglowek.appendChild(plywEl("span", "plyw-nr", (i + 1) + "."));
    const skrot = plywEl("span", "plyw-skrot");
    skrot.dataset.skrot = String(i);
    naglowek.appendChild(skrot);
    naglowek.appendChild(plywEl("span", "plyw-strzalka", otwartyBlok === i ? "▾" : "▸"));
    naglowek.addEventListener("click", function () {
      otwartyBlok = otwartyBlok === i ? -1 : i;
      rysuj();
    });
    gora.appendChild(naglowek);
    const akcje = plywEl("div", "plyw-akcje");
    [["↑", "Przesuń w górę", function () { if (i > 0) { bloki.splice(i - 1, 0, bloki.splice(i, 1)[0]); otwartyBlok = otwartyBlok === i ? i - 1 : otwartyBlok; rysuj(); } }, i === 0],
      ["↓", "Przesuń w dół", function () { if (i < bloki.length - 1) { bloki.splice(i + 1, 0, bloki.splice(i, 1)[0]); otwartyBlok = otwartyBlok === i ? i + 1 : otwartyBlok; rysuj(); } }, i === bloki.length - 1],
      ["⧉", "Kopiuj blok", function () { bloki.splice(i + 1, 0, Object.assign({}, b, { pomoce: (b.pomoce || []).slice() })); otwartyBlok = i + 1; rysuj(); }, false],
      ["✕", "Usuń blok", function () { bloki.splice(i, 1); otwartyBlok = -1; rysuj(); }, false]
    ].forEach(function (a) {
      const p = plywEl("button", "plyw-akcja", a[0]);
      p.type = "button";
      p.setAttribute("aria-label", a[1] + " " + (i + 1));
      p.disabled = a[3];
      p.addEventListener("click", a[2]);
      akcje.appendChild(p);
    });
    el.appendChild(gora);
    if (otwartyBlok !== i) {
      return el;
    }
    el.appendChild(akcje);

    const typ = plywWybor("Część treningu", PLYW_TYPY, b.typ);
    typ.wybor.addEventListener("change", function () {
      b.typ = typ.wybor.value;
      el.className = "plyw-blok plyw-typ-" + b.typ;
      odswiez();
    });
    el.appendChild(typ.blok);

    const r1 = plywEl("div", "rzad plyw-rzad-ilosc");
    const powt = plywPoleLiczby("Powtórzenia", b.powt);
    powt.pole.addEventListener("input", function () { b.powt = Number(powt.pole.value) || 0; odswiez(); });
    r1.appendChild(powt.blok);
    r1.appendChild(plywEl("span", "plyw-razy", "×"));
    const dl = plywPoleLiczby("Długości", b.dl, { ulamki: true });
    dl.pole.addEventListener("input", function () { b.dl = Number(dl.pole.value) || 0; odswiez(); });
    r1.appendChild(dl.blok);
    const m = plywEl("span", "plyw-metry-bloku");
    m.dataset.metry = String(i);
    r1.appendChild(m);
    el.appendChild(r1);

    const r2 = plywEl("div", "rzad");
    const st = plywWybor("Styl", plywListaStylow(b.styl), b.styl);
    st.wybor.addEventListener("change", function () { b.styl = st.wybor.value; odswiez(); });
    const int = plywWybor("Intensywność", PLYW_INTENS, b.intensywnosc);
    int.wybor.addEventListener("change", function () { b.intensywnosc = int.wybor.value; odswiez(); });
    r2.appendChild(st.blok);
    r2.appendChild(int.blok);
    el.appendChild(r2);

    const r3 = plywEl("div", "rzad");
    const tr = plywWybor("Odpoczynek", [["przerwa", "Przerwa"], ["odjazd", "Start co"]], b.tryb || "przerwa");
    const sek = plywPoleLiczby("Sekundy", b.tryb === "odjazd" ? b.odjazdS || "" : b.przerwaS || "", { placeholder: "0" });
    tr.wybor.addEventListener("change", function () {
      b.tryb = tr.wybor.value;
      sek.pole.value = b.tryb === "odjazd" ? b.odjazdS || "" : b.przerwaS || "";
      odswiez();
    });
    sek.pole.addEventListener("input", function () {
      const v = Number(sek.pole.value) || 0;
      if (b.tryb === "odjazd") { b.odjazdS = v; } else { b.przerwaS = v; }
      odswiez();
    });
    r3.appendChild(tr.blok);
    r3.appendChild(sek.blok);
    el.appendChild(r3);

    const pom = plywEl("div", "plyw-pomoce");
    pom.appendChild(plywEl("div", "plyw-etyk", "Sprzęt (opcjonalnie)"));
    const chipy = plywEl("div", "chipy");
    PLYW_POMOCE.forEach(function (p) {
      const wl = (b.pomoce || []).indexOf(p[0]) !== -1;
      const c = plywEl("button", "chip" + (wl ? " aktywny" : ""), p[1]);
      c.type = "button";
      c.setAttribute("aria-pressed", wl ? "true" : "false");
      c.addEventListener("click", function () {
        b.pomoce = b.pomoce || [];
        const k = b.pomoce.indexOf(p[0]);
        if (k === -1) { b.pomoce.push(p[0]); } else { b.pomoce.splice(k, 1); }
        c.classList.toggle("aktywny", k === -1);
        c.setAttribute("aria-pressed", k === -1 ? "true" : "false");
        odswiez();
      });
      chipy.appendChild(c);
    });
    pom.appendChild(chipy);
    el.appendChild(pom);

    const nt = plywEl("div", "plyw-pole");
    const nl = plywEl("label", "", "Notatka (opcjonalnie)");
    const ni = document.createElement("input");
    ni.type = "text";
    ni.value = b.notatka || "";
    ni.placeholder = "np. oddech co 3 ruchy";
    ni.addEventListener("input", function () { b.notatka = ni.value; });
    if (typeof dostepnoscPowiaz === "function") { dostepnoscPowiaz(nl, ni); }
    nt.appendChild(nl);
    nt.appendChild(ni);
    el.appendChild(nt);
    return el;
  }

  rysuj();
  if (stare && stare.length && basenSesji === null) {
    // Starszy zapis bez basenu: metry są pewne, długości zależą od basenu
    karta.insertBefore(plywEl("p", "opis", "Ten trening był zapisany w metrach. Sprawdź długość basenu."), karta.firstChild);
  }

  return {
    sesja: true,
    karta: karta,
    odczytaj: function () {
      if (wybBasenu.odczyt() === undefined) {
        blad.textContent = "Wpisz długość basenu większą od zera.";
        return null;
      }
      for (let i = 0; i < bloki.length; i++) {
        const x = bloki[i];
        if (!(x.powt >= 1) || Math.floor(x.powt) !== x.powt) {
          blad.textContent = (prosty ? "" : "Blok " + (i + 1) + ": ") + "powtórzenia wpisz jako liczbę całą od 1.";
          return null;
        }
        if (!(x.dl > 0)) {
          blad.textContent = (prosty ? "Wpisz" : "Blok " + (i + 1) + ": wpisz") + " liczbę długości większą od zera.";
          return null;
        }
      }
      if (!bloki.length) {
        blad.textContent = "Dodaj co najmniej jeden blok.";
        return null;
      }
      const ct = Number(czasT.pole.value) || 0;
      if (ct < 0) {
        blad.textContent = "Czas treningu nie może być ujemny.";
        return null;
      }
      blad.textContent = "";
      return {
        bloki: bloki.map(function (x) { return Object.assign({}, x, { pomoce: (x.pomoce || []).slice() }); }),
        basen: basenSesji ? Object.assign({}, basenSesji) : null,
        trybProsty: prosty,
        czasSesji: ct > 0 ? ct * 60 : null,
        etapy: null,
        styl: null,
        dlugosci: null,
        cwiczenieId: sesja.cwiczenieId || null,
        czas: sesja.czas || null
      };
    }
  };
}

function plywStylDominujacy(bloki) {
  const s = {};
  bloki.forEach(function (b) { s[b.styl] = (s[b.styl] || 0) + (b.powt || 0) * (b.dl || 0); });
  return Object.keys(s).sort(function (a, b) { return s[b] - s[a]; })[0] || "Kraul";
}

// Wynik: „Zrobione wg planu” jednym dotknięciem albo „Poprawiam” z polami
function plywKartaWyniku(start, opcje) {
  const plan = opcje.plan || start;
  const planBloki = plywBlokiSesji(plan);
  const planDl = plywDlugosci(planBloki);
  const basenW = plywBasen(start.bloki ? start : plan);
  const style = {};
  planBloki.forEach(function (b) { style[b.styl] = true; });
  const mieszane = Object.keys(style).length > 1;
  const startBloki = plywBlokiSesji(start);
  const startDl = plywDlugosci(startBloki);
  const karta = plywEl("div", "formularz parametry-karta plyw-karta plyw-wynik");
  const blad = plywEl("p", "blad");

  if (planDl > 0) {
    karta.appendChild(plywEl("p", "plyw-plan-info", "Plan: " + plywLiczba(planDl) + " " + plywOdmianaDl(planDl) + " · " + plywMetry(planDl, basenW) + " m · basen " + plywOpisBasenu(basenW)));
  }
  const pola = plywEl("div", "plyw-wynik-pola");
  if (!opcje.popraw && planDl > 0) {
    const rz = plywEl("div", "plyw-wynik-wybor");
    const wg = plywEl("button", "przycisk plyw-wg-planu", "Zrobione wg planu");
    wg.type = "button";
    const pop = plywEl("button", "przycisk drugi plyw-poprawiam", "Poprawiam");
    pop.type = "button";
    rz.appendChild(wg);
    rz.appendChild(pop);
    karta.appendChild(rz);
    pola.hidden = true;
    if (opcje.przyciskZapisz) {
      opcje.przyciskZapisz.hidden = true;
    }
    wg.addEventListener("click", function () {
      if (typeof opcje.zapisz === "function") {
        opcje.zapisz();
      }
    });
    pop.addEventListener("click", function () {
      pola.hidden = false;
      rz.hidden = true;
      if (opcje.przyciskZapisz) {
        opcje.przyciskZapisz.hidden = false;
      }
      const p = pola.querySelector("input");
      if (p) { p.focus(); }
    });
  }
  karta.appendChild(pola);

  const rz1 = plywEl("div", "rzad");
  const dl = plywPoleLiczby("Przepłynięte długości", startDl || "", { ulamki: true });
  dl.pole.classList.add("plyw-wynik-dl");
  rz1.appendChild(dl.blok);
  const opcjeStylu = (mieszane ? [["plan", "Jak w planie"]] : []).concat(plywListaStylow(plywStylDominujacy(startBloki)));
  const startStyl = mieszane && startDl === planDl ? "plan" : plywStylDominujacy(startBloki);
  const st = plywWybor("Styl", opcjeStylu, startStyl);
  rz1.appendChild(st.blok);
  pola.appendChild(rz1);

  const czasP = plywPoleCzasu("Czas pływania (opcjonalnie – do tempa i rekordów)", start.czas ? sekundyZ(start.czas.wartosc, start.czas.jednostka) : 0);
  pola.appendChild(czasP.blok);
  const czasT = plywPoleLiczby("Czas całego treningu w minutach (opcjonalnie)", start.czasSesji ? Math.round(start.czasSesji / 60) : "", { placeholder: "brak" });
  pola.appendChild(czasT.blok);
  // „Wg planu”: najdłuższy odcinek to najdłuższe pojedyncze powtórzenie z bloków (tryb prosty nie mówi, czy były przerwy)
  const najStart = typeof start.najdluzszy === "number" ? start.najdluzszy
    : plan.trybProsty ? null
    : planBloki.reduce(function (m, b) { return Math.max(m, Number(b.dl) || 0); }, 0);
  const naj = plywPoleLiczby("Najdłuższy odcinek bez zatrzymania (długości)", najStart || "", { ulamki: true });
  naj.blok.classList.add("plyw-najdluzszy");
  pola.appendChild(naj.blok);

  const info = plywEl("p", "plyw-podsum");
  info.setAttribute("aria-live", "polite");
  pola.appendChild(info);

  // Wysiłek 1–10
  let wysilek = typeof start.wysilek === "number" ? start.wysilek : null;
  const blokW = plywEl("div", "bieg-wysilek");
  blokW.appendChild(plywEl("label", "", "Wysiłek 1–10 (opcjonalnie)"));
  const rzadW = plywEl("div", "bieg-wysilek-rzad");
  const opisW = plywEl("p", "opis", "");
  const opisWys = function () {
    opisW.textContent = wysilek ? wysilek + " – " + OPISY_WYSILKU[wysilek] : "Dotknij liczbę. Dotknij ponownie, żeby usunąć.";
  };
  for (let n = 1; n <= 10; n++) {
    const b = plywEl("button", "bieg-wysilek-p" + (wysilek === n ? " aktywny" : ""), String(n));
    b.type = "button";
    b.setAttribute("aria-label", "Wysiłek " + n + ": " + OPISY_WYSILKU[n]);
    b.addEventListener("click", function () {
      wysilek = wysilek === n ? null : n;
      rzadW.querySelectorAll("button").forEach(function (x, i) { x.classList.toggle("aktywny", wysilek === i + 1); });
      opisWys();
    });
    rzadW.appendChild(b);
  }
  opisWys();
  blokW.appendChild(rzadW);
  blokW.appendChild(opisW);
  pola.appendChild(blokW);
  karta.appendChild(blad);

  function licz() {
    const d = Number(dl.pole.value) || 0;
    const m = plywMetry(d, basenW);
    const cz = czasP.odczyt();
    const t = plywTempo(cz, m);
    info.textContent = d > 0 ? plywLiczba(d) + " " + plywOdmianaDl(d) + " = " + m + " m" + (t ? " · tempo " + plywOpisTempa(t) : "") : "";
  }
  [dl.pole].concat(czasP.pola).forEach(function (p) { p.addEventListener("input", licz); });
  licz();

  return {
    sesja: true,
    karta: karta,
    odczytaj: function () {
      const d = Number(dl.pole.value);
      if (!(d > 0)) {
        pola.hidden = false;
        if (opcje.przyciskZapisz) {
          opcje.przyciskZapisz.hidden = false;
        }
        blad.textContent = "Wpisz liczbę przepłyniętych długości.";
        return null;
      }
      const cz = czasP.odczyt();
      if (!(cz >= 0)) {
        pola.hidden = false;
        blad.textContent = "Czas wpisz jako minuty i sekundy (albo zostaw puste).";
        return null;
      }
      const ct = Number(czasT.pole.value) || 0;
      const n = naj.pole.value === "" ? null : Number(naj.pole.value);
      if (n !== null && (!(n >= 0) || n > d)) {
        pola.hidden = false;
        blad.textContent = "Najdłuższy odcinek nie może być dłuższy niż cały trening (" + plywLiczba(d) + " dł.).";
        return null;
      }
      let bloki;
      if (Math.abs(d - planDl) < 0.001 && (st.wybor.value === "plan" || (!mieszane && st.wybor.value === plywStylDominujacy(planBloki)))) {
        bloki = planBloki.map(function (x) { return Object.assign({}, x, { pomoce: (x.pomoce || []).slice() }); });
      } else if (Math.abs(d - startDl) < 0.001 && st.wybor.value === startStyl && start.bloki) {
        bloki = startBloki.map(function (x) { return Object.assign({}, x); });
      } else {
        bloki = [plywBlokNowy({ powt: 1, dl: d, styl: st.wybor.value === "plan" ? plywStylDominujacy(planBloki) : st.wybor.value, przerwaS: 0, intensywnosc: "umiarkowanie" })];
      }
      blad.textContent = "";
      return {
        bloki: bloki,
        basen: Object.assign({}, basenW),
        etapy: null,
        styl: null,
        dlugosci: null,
        cwiczenieId: plan.cwiczenieId || null,
        czas: cz > 0 ? { wartosc: cz, jednostka: "s" } : null,
        czasSesji: ct > 0 ? ct * 60 : null,
        najdluzszy: n,
        wysilek: wysilek
      };
    }
  };
}

// ----- Zbieranie wyników i statystyki -----

function plywCiagly(w) {
  // Odcinek bez zatrzymania obejmuje cały trening (rekordy liczymy tylko z takich)
  const bl = plywBlokiSesji(w);
  const dl = plywDlugosci(bl);
  if (w.najdluzszy !== undefined) {
    return typeof w.najdluzszy === "number" && dl > 0 && Math.abs(w.najdluzszy - dl) < 0.001;
  }
  return bl.length === 1 && (bl[0].powt || 1) === 1;
}

function plywZbierz() {
  const lista = [];
  (dane.plany || []).forEach(function (plan) {
    (plan.sesje || []).forEach(function (s) {
      const a = (plan.aktywnosci || []).find(function (x) { return x.id === s.aktywnoscId; });
      if (!a || a.rodzajId !== "rodzaj-basen" || !s.wynik) {
        return;
      }
      const w = s.wynik;
      const b = plywBasen(w.bloki ? w : s);
      const bl = plywBlokiSesji(Object.assign({}, w, { basen: b }));
      const dl = plywDlugosci(bl);
      const m = sumaMetrow(Object.assign({}, w, { basen: b }));
      const czasS = w.czas ? sekundyZ(w.czas.wartosc, w.czas.jednostka) : 0;
      const stylePl = {};
      bl.forEach(function (x) { stylePl[x.styl] = true; });
      lista.push({
        data: s.dataWykonania || (typeof dataPlanu === "function" ? dataSesjiISO(plan, s) : ""),
        metry: m,
        dlugosci: dl,
        basen: b,
        czasS: czasS,
        czasSesji: w.czasSesji || 0,
        tempo: plywTempo(czasS, m),
        najdluzszyM: typeof w.najdluzszy === "number" ? plywMetry(w.najdluzszy, b) : (plywCiagly(w) ? m : 0),
        ciagly: plywCiagly(w),
        styl: Object.keys(stylePl).length === 1 ? Object.keys(stylePl)[0] : "",
        wysilek: typeof w.wysilek === "number" ? w.wysilek : null,
        sesja: s,
        plan: plan
      });
    });
  });
  return lista.sort(function (a, b) { return a.data < b.data ? 1 : a.data > b.data ? -1 : 0; });
}

const PLYW_DYSTANSE = [50, 100, 200, 400, 800, 1500];

// Rekordy z pływania bez zatrzymania, osobno dla basenu 25 m i 50 m (jardy i inne – osobno)
function plywRekordy(lista) {
  const r = {};
  lista.forEach(function (p) {
    if (!p.ciagly || !p.czasS || !p.styl) {
      return;
    }
    const d = PLYW_DYSTANSE.find(function (x) { return Math.abs(p.metry - x) / x <= 0.03; });
    if (!d) {
      return;
    }
    const kl = plywOpisBasenu(p.basen) + "|" + p.styl + "|" + d;
    if (!r[kl] || p.czasS < r[kl].czasS) {
      r[kl] = { basen: plywOpisBasenu(p.basen), styl: p.styl, dystans: d, czasS: p.czasS, data: p.data };
    }
  });
  return Object.keys(r).map(function (k) { return r[k]; }).sort(function (a, b) {
    return a.basen !== b.basen ? (a.basen < b.basen ? -1 : 1) : a.styl !== b.styl ? (a.styl < b.styl ? -1 : 1) : a.dystans - b.dystans;
  });
}

function plywPoczatekTygodnia(iso) {
  const d = new Date(iso + "T12:00:00");
  const dz = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dz);
  return d.toISOString().slice(0, 10);
}

function plywTygodnie(lista, dzis, n) {
  const t = {};
  lista.forEach(function (p) {
    if (!p.data) { return; }
    const k = plywPoczatekTygodnia(p.data);
    t[k] = (t[k] || 0) + p.metry;
  });
  const wynik = [];
  const d = new Date(plywPoczatekTygodnia(dzis) + "T12:00:00");
  d.setDate(d.getDate() - 7 * (n - 1));
  for (let i = 0; i < n; i++) {
    const k = d.toISOString().slice(0, 10);
    wynik.push({ tydzien: k, metry: t[k] || 0 });
    d.setDate(d.getDate() + 7);
  }
  return wynik;
}

function plywMiesiace(lista, dzis, n) {
  const t = {};
  lista.forEach(function (p) {
    if (!p.data) { return; }
    const k = p.data.slice(0, 7);
    t[k] = (t[k] || 0) + p.metry;
  });
  const wynik = [];
  const d = new Date(dzis.slice(0, 7) + "-15T12:00:00");
  d.setMonth(d.getMonth() - (n - 1));
  for (let i = 0; i < n; i++) {
    const k = d.toISOString().slice(0, 7);
    wynik.push({ miesiac: k, metry: t[k] || 0 });
    d.setMonth(d.getMonth() + 1);
  }
  return wynik;
}

const PLYW_MIESIACE = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"];

function plywWykres(dane_, etykieta, opisAria) {
  const sz = 320;
  const wys = 140;
  const n = dane_.length;
  const max = Math.max.apply(null, dane_.map(function (x) { return x.metry; }).concat([1000]));
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 " + sz + " " + (wys + 34));
  svg.setAttribute("class", "bieg-wykres");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", opisAria + ": " + dane_.map(function (x) { return etykieta(x) + " " + x.metry + " m"; }).join(", "));
  const szer = sz / n;
  dane_.forEach(function (x, i) {
    const v = x.metry;
    const h = v > 0 ? Math.max(3, Math.round(v / max * (wys - 18))) : 0;
    const xx = i * szer + szer * 0.18;
    const r = document.createElementNS(ns, "rect");
    r.setAttribute("x", xx);
    r.setAttribute("y", wys - h);
    r.setAttribute("width", szer * 0.64);
    r.setAttribute("height", h);
    r.setAttribute("rx", 3);
    r.setAttribute("class", i === n - 1 ? "slupek teraz" : "slupek");
    svg.appendChild(r);
    if (v > 0) {
      const t = document.createElementNS(ns, "text");
      t.setAttribute("x", xx + szer * 0.32);
      t.setAttribute("y", wys - h - 4);
      t.setAttribute("class", "wartosc");
      t.textContent = v >= 1000 ? String(Math.round(v / 100) / 10).replace(".", ",") + "k" : String(v);
      svg.appendChild(t);
    }
    const e = document.createElementNS(ns, "text");
    e.setAttribute("x", xx + szer * 0.32);
    e.setAttribute("y", wys + 16);
    e.setAttribute("class", "etykieta");
    e.textContent = etykieta(x);
    svg.appendChild(e);
  });
  return svg;
}

let plywMiaraWykresu = "tydzien";

function plywKm(m) {
  return m >= 1000 ? String(Math.round(m / 100) / 10).replace(".", ",") + " km" : m + " m";
}

function plywDataPL(iso) {
  const c = iso.split("-");
  return Number(c[2]) + "." + c[1];
}

// Karta „Pływanie” w Postępie
function plywKartaPostepu() {
  const lista = plywZbierz();
  if (!lista.length) {
    return null;
  }
  const dzis = dzisISO();
  const karta = plywEl("div", "pp-karta plyw-postep");
  karta.appendChild(plywEl("div", "pp-naglowek", "Pływanie"));

  const tyg = plywTygodnie(lista, dzis, 8);
  const ten = tyg[tyg.length - 1];
  const tenLista = lista.filter(function (p) { return p.data && plywPoczatekTygodnia(p.data) === ten.tydzien; });
  const zTempem = lista.filter(function (p) { return p.tempo; });
  const czesci = [tenLista.length + " " + (tenLista.length === 1 ? "trening" : tenLista.length > 1 && tenLista.length < 5 ? "treningi" : "treningów"), plywKm(ten.metry)];
  karta.appendChild(plywEl("div", "bieg-tydzien", "Ten tydzień: " + czesci.join(" · ")));
  if (zTempem.length) {
    const ost = zTempem[0];
    const sr = zTempem.slice(0, 5).reduce(function (s, p) { return s + p.tempo; }, 0) / Math.min(5, zTempem.length);
    karta.appendChild(plywEl("div", "plyw-tempo", "Tempo: ostatnio " + plywOpisTempa(ost.tempo) + (zTempem.length > 1 ? " · średnio z " + Math.min(5, zTempem.length) + " ostatnich " + plywOpisTempa(sr) : "")));
  }

  const chipy = plywEl("div", "chipy bieg-chipy");
  [["tydzien", "Tygodnie"], ["miesiac", "Miesiące"]].forEach(function (m) {
    const c = plywEl("button", "chip" + (plywMiaraWykresu === m[0] ? " aktywny" : ""), m[1]);
    c.type = "button";
    c.setAttribute("aria-pressed", plywMiaraWykresu === m[0] ? "true" : "false");
    c.addEventListener("click", function () {
      plywMiaraWykresu = m[0];
      rysujPostep();
    });
    chipy.appendChild(c);
  });
  karta.appendChild(chipy);
  if (plywMiaraWykresu === "miesiac") {
    karta.appendChild(plywEl("div", "opis", "Metry w miesiącu"));
    karta.appendChild(plywWykres(plywMiesiace(lista, dzis, 6), function (x) { return PLYW_MIESIACE[Number(x.miesiac.slice(5)) - 1]; }, "Metry w ostatnich 6 miesiącach"));
  } else {
    karta.appendChild(plywWykres(tyg, function (x) { return plywDataPL(x.tydzien); }, "Metry w ostatnich 8 tygodniach"));
    karta.lastChild.insertAdjacentElement("beforebegin", plywEl("div", "opis", "Metry w tygodniu"));
  }

  const naj = lista.reduce(function (m, p) { return p.najdluzszyM > (m ? m.najdluzszyM : 0) ? p : m; }, null);
  const rek = plywRekordy(lista);
  if (naj || rek.length) {
    karta.appendChild(plywEl("div", "pp-naglowek bieg-rek-nagl", "Rekordy"));
    const wiersz = function (a, b) {
      const w = plywEl("div", "bieg-rek");
      w.appendChild(plywEl("span", "", a));
      w.appendChild(plywEl("b", "", b));
      karta.appendChild(w);
    };
    if (naj && naj.najdluzszyM > 0) {
      wiersz("Najdłużej bez zatrzymania", plywKm(naj.najdluzszyM) + " · " + plywDataPL(naj.data));
    }
    const baseny = {};
    rek.forEach(function (r) { baseny[r.basen] = true; });
    const kilka = Object.keys(baseny).length > 1;
    rek.forEach(function (r) {
      wiersz(r.styl + " " + r.dystans + " m" + (kilka || r.basen !== "25 m" ? " · basen " + r.basen : ""), biegFormatCzasu(r.czasS) + " · " + plywDataPL(r.data));
    });
    karta.appendChild(plywEl("p", "opis", "Rekordy liczą się z pływania bez zatrzymania jednym stylem, gdy wpiszesz czas pływania (dystans ±3%). Baseny 25 m i 50 m mają osobne rekordy."));
  }

  const hist = plywEl("button", "przycisk drugi", "Historia pływania (" + lista.length + ")");
  hist.type = "button";
  hist.addEventListener("click", function () { plywOtworzHistorie(); });
  karta.appendChild(hist);
  return karta;
}

function plywOtworzHistorie() {
  const lista = plywZbierz();
  const tlo = plywEl("div", "gps-zgoda-tlo");
  const okno = plywEl("div", "gps-zgoda arkusz-dol plyw-historia");
  okno.setAttribute("role", "dialog");
  okno.setAttribute("aria-modal", "true");
  okno.setAttribute("aria-label", "Historia pływania");
  okno.appendChild(plywEl("h2", "", "Historia pływania"));
  const ul = plywEl("div", "plyw-hist-lista");
  lista.forEach(function (p) {
    const w = plywEl("div", "plyw-hist");
    const c = [plywKm(p.metry), plywLiczba(p.dlugosci) + " dł. × " + plywOpisBasenu(p.basen)];
    if (p.czasS) { c.push(biegFormatCzasu(p.czasS)); }
    if (p.tempo) { c.push(plywOpisTempa(p.tempo)); }
    if (p.najdluzszyM) { c.push("bez zatrzymania " + plywKm(p.najdluzszyM)); }
    if (p.wysilek) { c.push("wysiłek " + p.wysilek + "/10"); }
    w.appendChild(plywEl("b", "", p.data ? p.data.split("-").reverse().join(".") : ""));
    w.appendChild(plywEl("span", "", (p.styl ? p.styl + " · " : "") + c.join(" · ")));
    ul.appendChild(w);
  });
  okno.appendChild(ul);
  const zamknij = plywEl("button", "przycisk", "Zamknij");
  zamknij.type = "button";
  zamknij.addEventListener("click", function () { tlo.remove(); });
  okno.appendChild(zamknij);
  tlo.appendChild(okno);
  tlo.addEventListener("click", function (e) { if (e.target === tlo) { tlo.remove(); } });
  document.body.appendChild(tlo);
  zamknij.focus();
}

// ----- Ustawienia: basen i tryb -----

function plywRysujUstawienia() {
  const b = plywBasenDomyslny();
  const k = plywKluczBasenu(b);
  document.querySelectorAll("#ust-plyw-basen button").forEach(function (x) {
    const wl = x.dataset.basen === k;
    x.classList.toggle("aktywny", wl);
    x.setAttribute("aria-pressed", wl ? "true" : "false");
  });
  const inny = document.getElementById("ust-plyw-inny");
  if (inny) {
    inny.hidden = k !== "inny";
    document.getElementById("ust-plyw-dl").value = k === "inny" ? b.dlugosc : "";
    document.getElementById("ust-plyw-jedn").value = b.jednostka;
  }
  const tr = dane.ustawienia.plywTryb === "zaawansowany" ? "zaawansowany" : "prosty";
  document.querySelectorAll("#ust-plyw-tryb button").forEach(function (x) {
    const wl = x.dataset.tryb === tr;
    x.classList.toggle("aktywny", wl);
    x.setAttribute("aria-pressed", wl ? "true" : "false");
  });
}

(function () {
  const pb = document.getElementById("ust-plyw-basen");
  if (!pb) {
    return;
  }
  pb.querySelectorAll("button").forEach(function (x) {
    x.addEventListener("click", function () {
      const k = x.dataset.basen;
      if (k === "inny") {
        document.getElementById("ust-plyw-inny").hidden = false;
        pb.querySelectorAll("button").forEach(function (y) { y.classList.toggle("aktywny", y === x); });
        document.getElementById("ust-plyw-dl").focus();
        return;
      }
      const p = PLYW_BASENY.find(function (z) { return z[0] === k; });
      dane.ustawienia.basen = { dlugosc: p[1], jednostka: p[2] };
      zapiszDane();
      plywRysujUstawienia();
    });
  });
  const zapiszInny = function () {
    const d = Number(document.getElementById("ust-plyw-dl").value);
    if (d > 0) {
      dane.ustawienia.basen = { dlugosc: Math.round(d * 100) / 100, jednostka: document.getElementById("ust-plyw-jedn").value === "yd" ? "yd" : "m" };
      zapiszDane();
    }
  };
  document.getElementById("ust-plyw-dl").addEventListener("change", zapiszInny);
  document.getElementById("ust-plyw-jedn").addEventListener("change", zapiszInny);
  document.querySelectorAll("#ust-plyw-tryb button").forEach(function (x) {
    x.addEventListener("click", function () {
      dane.ustawienia.plywTryb = x.dataset.tryb;
      zapiszDane();
      plywRysujUstawienia();
    });
  });
})();
