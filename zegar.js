// ===== Zegar: stoper, minutnik, interwały, alarm =====
// Korzysta z pomocników z cwicz.js (cwEl, cwPrzycisk, cwPierscien, cwFormatCzasu, cwSygnal).
// Ustawienia zapamiętane w dane.ustawienia.zegar = { tryb, minutnik, int: {...}, alarm: {...} }.
// Stoper i minutnik liczą od znacznika czasu, więc nie "gubią" sekund, gdy ekran na chwilę zgaśnie.

const zgTresc = document.getElementById("zegar-tresc");
const zgEkran = document.getElementById("ekran-zegar");
const zgBieg = document.getElementById("zegar-bieg");
const zgBiegTresc = document.getElementById("zegar-bieg-tresc");
const zgBiegTytul = document.getElementById("zegar-bieg-tytul");
const zgBiegPasek = document.getElementById("zegar-bieg-pasek");
const zgBiegZamknij = document.getElementById("zegar-bieg-zamknij");

const ZG_TRYBY = [["stoper", "Stoper"], ["minutnik", "Minutnik"], ["interwaly", "Interwały"], ["alarm", "Alarm"]];

const ZG_SZABLONY = [
  { id: "start", nazwa: "Start 1 + 1", praca: 60, przerwa: 60, rundy: 8, opis: "8 × (1 min szybciej + 1 min wolno). Na początek interwałów." },
  { id: "30-30", nazwa: "30 / 30", praca: 30, przerwa: 30, rundy: 10, opis: "10 × (30 s mocno + 30 s lekko). Krótko i intensywnie." },
  { id: "4x4", nazwa: "4 × 4", praca: 240, przerwa: 180, rundy: 4, opis: "4 × (4 min mocno + 3 min lekko). Najlepiej udokumentowany sposób na poprawę wydolności." },
  { id: "tabata", nazwa: "Tabata", praca: 20, przerwa: 10, rundy: 8, opis: "8 × (20 s maksymalnie + 10 s odpoczynku). Bardzo ciężkie, tylko dla zaawansowanych." },
  { id: "emom", nazwa: "EMOM", praca: 60, przerwa: 0, rundy: 10, opis: "Co minutę zaczynasz nową rundę: robisz zadanie, a resztę minuty odpoczywasz." },
  { id: "wlasny", nazwa: "Własny", opis: "Ustaw czas pracy, przerwy i liczbę rund." }
];

const ZG_ROZGRZEWKA_S = 180;
const ZG_SCHLODZENIE_S = 120;
const ZG_PRZYGOTUJ_S = 5;

let zgStoper = { start: 0, zebrane: 0, kola: [] }; // start > 0: stoper chodzi
let zgMinutnik = { stan: "stop", koniec: 0, pozostalo: 0, dlugosc: 0 }; // stan: stop | idzie | pauza | koniec
let zgBieganie = null; // trwający trening interwałowy
let zgBlokada = null;
let zgAlarmDzwoni = null; // interwał powtarzanego dźwięku alarmu

// ===== Ustawienia =====

function zgUst() {
  if (!dane.ustawienia.zegar) {
    dane.ustawienia.zegar = {};
  }
  return dane.ustawienia.zegar;
}

function zgInt() {
  const u = zgUst();
  if (!u.int) {
    u.int = { szablon: "wlasny", praca: 40, przerwa: 20, rundy: 8, rozgrzewka: true, schlodzenie: false };
  }
  return u.int;
}

function zgAlarmUst() {
  const u = zgUst();
  if (!u.alarm) {
    u.alarm = { czas: "07:00", etykieta: "", wlaczony: false, cel: 0 };
  }
  return u.alarm;
}

function zgDlugoscMinutnika() {
  const u = zgUst();
  return u.minutnik > 0 ? u.minutnik : 60;
}

// ===== Ekran ekranu blokady =====

function zgZajmij() {
  if (!navigator.wakeLock || zgBlokada) {
    return;
  }
  navigator.wakeLock.request("screen").then(function (b) {
    zgBlokada = b;
    b.addEventListener("release", function () {
      zgBlokada = null;
    });
  }).catch(function () {
    zgBlokada = null;
  });
}

function zgZwolnij() {
  if (zgBlokada) {
    zgBlokada.release();
    zgBlokada = null;
  }
}

document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "visible" && (zgMinutnik.stan === "idzie" || (zgBieganie && zgBieganie.pauza === null))) {
    zgZajmij();
  }
});

// ===== Pomocnicze =====

function zgFormatStopera(ms) {
  const dz = Math.floor(ms / 100);
  const s = Math.floor(dz / 10);
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0") + "." + (dz % 10);
}

function zgKrok(etykieta, wartoscTekst, mniej, wiecej) {
  const rzad = cwEl("div", "zg-krok-rzad");
  rzad.appendChild(cwEl("span", "zg-krok-nazwa", etykieta));
  const mn = cwPrzycisk("−", "zg-krok-przycisk", mniej);
  mn.setAttribute("aria-label", etykieta + ": mniej");
  const wartosc = cwEl("span", "zg-krok-wartosc", wartoscTekst);
  const wi = cwPrzycisk("+", "zg-krok-przycisk", wiecej);
  wi.setAttribute("aria-label", etykieta + ": więcej");
  rzad.appendChild(mn);
  rzad.appendChild(wartosc);
  rzad.appendChild(wi);
  return rzad;
}

function zgPrzelacznik(etykieta, opis, wlaczony, przy) {
  const rzad = cwEl("div", "zg-krok-rzad");
  const tekst = cwEl("div", "zg-krok-nazwa");
  tekst.textContent = etykieta;
  rzad.appendChild(tekst);
  rzad.appendChild(cwEl("span", "zg-krok-opis", opis));
  const p = document.createElement("button");
  p.type = "button";
  p.className = "przelacznik-wl" + (wlaczony ? " wlaczony" : "");
  p.setAttribute("role", "switch");
  p.setAttribute("aria-checked", wlaczony ? "true" : "false");
  p.setAttribute("aria-label", etykieta);
  p.appendChild(document.createElement("span"));
  p.addEventListener("click", przy);
  rzad.appendChild(p);
  return rzad;
}

function zgSekundyTekst(s) {
  return cwFormatCzasu(s);
}

// ===== Rysowanie ekranu Zegar =====

function rysujZegar() {
  if (!zgTresc) {
    return;
  }
  zgTresc.innerHTML = "";
  const tryb = zgUst().tryb || "interwaly";
  const zakladki = cwEl("div", "zg-zakladki");
  zakladki.setAttribute("role", "group");
  zakladki.setAttribute("aria-label", "Narzędzie zegara");
  ZG_TRYBY.forEach(function (t) {
    const p = cwPrzycisk(t[1], "zg-zakladka" + (t[0] === tryb ? " aktywna" : ""), function () {
      zgUst().tryb = t[0];
      zapiszDane();
      rysujZegar();
    });
    p.setAttribute("aria-pressed", t[0] === tryb ? "true" : "false");
    zakladki.appendChild(p);
  });
  zgTresc.appendChild(zakladki);
  if (tryb === "stoper") {
    zgRysujStoper();
  } else if (tryb === "minutnik") {
    zgRysujMinutnik();
  } else if (tryb === "alarm") {
    zgRysujAlarm();
  } else {
    zgRysujInterwaly();
  }
}

// ----- Stoper -----

function zgCzasStopera() {
  return zgStoper.zebrane + (zgStoper.start ? Date.now() - zgStoper.start : 0);
}

function zgRysujStoper() {
  const czas = cwEl("div", "zg-stoper-czas", zgFormatStopera(zgCzasStopera()));
  czas.id = "zg-stoper-czas";
  czas.setAttribute("role", "timer");
  zgTresc.appendChild(czas);
  const rzad = cwEl("div", "zg-rzad");
  const idzie = zgStoper.start > 0;
  const lewy = cwPrzycisk(idzie ? "Okrążenie" : "Wyzeruj", "przycisk drugi zg-duzy", function () {
    if (zgStoper.start) {
      const teraz = zgCzasStopera();
      const poprz = zgStoper.kola.length ? zgStoper.kola[zgStoper.kola.length - 1].lacznie : 0;
      zgStoper.kola.push({ kolo: teraz - poprz, lacznie: teraz });
    } else {
      zgStoper = { start: 0, zebrane: 0, kola: [] };
    }
    rysujZegar();
  });
  lewy.id = "zg-stoper-lewy";
  lewy.disabled = !idzie && zgStoper.zebrane === 0;
  rzad.appendChild(lewy);
  const prawy = cwPrzycisk(idzie ? "Stop" : (zgStoper.zebrane > 0 ? "Dalej" : "Start"), "przycisk zg-duzy", function () {
    if (zgStoper.start) {
      zgStoper.zebrane += Date.now() - zgStoper.start;
      zgStoper.start = 0;
    } else {
      cwSygnal(0);
      zgStoper.start = Date.now();
    }
    rysujZegar();
  });
  prawy.id = "zg-stoper-start";
  rzad.appendChild(prawy);
  zgTresc.appendChild(rzad);
  if (zgStoper.kola.length > 0) {
    const lista = cwEl("div", "cw-lista zg-kola");
    lista.appendChild(cwEl("div", "cw-lista-tytul", "Okrążenia"));
    const najkrotsze = Math.min.apply(null, zgStoper.kola.map(function (k) { return k.kolo; }));
    const najdluzsze = Math.max.apply(null, zgStoper.kola.map(function (k) { return k.kolo; }));
    for (let i = zgStoper.kola.length - 1; i >= 0; i--) {
      const k = zgStoper.kola[i];
      const w = cwEl("div", "cw-lista-wiersz");
      w.appendChild(cwEl("span", "cw-lista-nazwa", "Okrążenie " + (i + 1)));
      let znacznik = "";
      if (zgStoper.kola.length > 2 && k.kolo === najkrotsze) {
        znacznik = " (najszybsze)";
      } else if (zgStoper.kola.length > 2 && k.kolo === najdluzsze) {
        znacznik = " (najwolniejsze)";
      }
      w.appendChild(cwEl("span", "zg-kolo-czas", zgFormatStopera(k.kolo) + znacznik));
      w.appendChild(cwEl("span", "cw-lista-ilosc", zgFormatStopera(k.lacznie)));
      lista.appendChild(w);
    }
    zgTresc.appendChild(lista);
  }
}

// ----- Minutnik -----

function zgPozostaloMinutnika() {
  if (zgMinutnik.stan === "idzie") {
    return Math.max(0, Math.ceil((zgMinutnik.koniec - Date.now()) / 1000));
  }
  if (zgMinutnik.stan === "pauza") {
    return Math.ceil(zgMinutnik.pozostalo / 1000);
  }
  if (zgMinutnik.stan === "koniec") {
    return 0;
  }
  return zgDlugoscMinutnika();
}

function zgRysujMinutnik() {
  const stan = zgMinutnik.stan;
  const dlugosc = stan === "stop" ? zgDlugoscMinutnika() : zgMinutnik.dlugosc;
  const pier = cwPierscien("przerwa", "zg-pierscien-postep");
  pier.tekst.id = "zg-min-czas";
  pier.tekst.setAttribute("role", "timer");
  pier.podpis.id = "zg-min-podpis";
  const pole = cwEl("div", "cw-pierscien-pole");
  pole.appendChild(pier.el);
  zgTresc.appendChild(pole);

  if (stan === "stop") {
    const chipy = cwEl("div", "zg-chipy");
    [30, 60, 120, 180, 300, 600].forEach(function (s) {
      const p = cwPrzycisk(cwFormatCzasu(s), "zg-chip" + (s === dlugosc ? " aktywny" : ""), function () {
        zgUst().minutnik = s;
        zapiszDane();
        rysujZegar();
      });
      p.setAttribute("aria-pressed", s === dlugosc ? "true" : "false");
      chipy.appendChild(p);
    });
    zgTresc.appendChild(chipy);
    const karta = cwEl("div", "zg-karta");
    karta.appendChild(zgKrok("Minuty", String(Math.floor(dlugosc / 60)), function () {
      zgUst().minutnik = Math.max(5, dlugosc - 60);
      zapiszDane();
      rysujZegar();
    }, function () {
      zgUst().minutnik = Math.min(5999, dlugosc + 60);
      zapiszDane();
      rysujZegar();
    }));
    karta.appendChild(zgKrok("Sekundy", String(dlugosc % 60).padStart(2, "0"), function () {
      zgUst().minutnik = Math.max(5, dlugosc - 5);
      zapiszDane();
      rysujZegar();
    }, function () {
      zgUst().minutnik = Math.min(5999, dlugosc + 5);
      zapiszDane();
      rysujZegar();
    }));
    zgTresc.appendChild(karta);
  }

  const rzad = cwEl("div", "zg-rzad");
  if (stan === "stop") {
    const start = cwPrzycisk("Start", "przycisk zg-duzy zg-pelny", function () {
      cwSygnal(0);
      zgMinutnik = { stan: "idzie", dlugosc: zgDlugoscMinutnika(), koniec: Date.now() + zgDlugoscMinutnika() * 1000, pozostalo: 0 };
      zgZajmij();
      rysujZegar();
    });
    start.id = "zg-min-start";
    rzad.appendChild(start);
  } else {
    const wyzeruj = cwPrzycisk("Wyzeruj", "przycisk drugi zg-duzy", function () {
      zgMinutnik = { stan: "stop", koniec: 0, pozostalo: 0, dlugosc: 0 };
      zgZwolnij();
      rysujZegar();
    });
    wyzeruj.id = "zg-min-wyzeruj";
    rzad.appendChild(wyzeruj);
    if (stan !== "koniec") {
      const pauza = cwPrzycisk(stan === "idzie" ? "Pauza" : "Wznów", "przycisk zg-duzy", function () {
        if (zgMinutnik.stan === "idzie") {
          zgMinutnik.pozostalo = Math.max(0, zgMinutnik.koniec - Date.now());
          zgMinutnik.stan = "pauza";
          zgZwolnij();
        } else {
          zgMinutnik.koniec = Date.now() + zgMinutnik.pozostalo;
          zgMinutnik.stan = "idzie";
          zgZajmij();
        }
        rysujZegar();
      });
      pauza.id = "zg-min-pauza";
      rzad.appendChild(pauza);
    }
  }
  zgTresc.appendChild(rzad);
  zgTresc.appendChild(cwEl("div", "cw-cel cw-srodek", "Sygnał i wibracja działają przy włączonym ekranie. Gdy minutnik chodzi, ekran nie gaśnie."));
  zgOdswiezMinutnik();
}

function zgOdswiezMinutnik() {
  const tekst = document.getElementById("zg-min-czas");
  if (!tekst) {
    return;
  }
  const stan = zgMinutnik.stan;
  const calosc = stan === "stop" ? zgDlugoscMinutnika() : zgMinutnik.dlugosc;
  const zostalo = zgPozostaloMinutnika();
  const podpis = document.getElementById("zg-min-podpis");
  if (stan === "koniec") {
    tekst.textContent = "Koniec!";
    tekst.classList.add("gotowe");
  } else {
    tekst.textContent = cwFormatCzasu(zostalo);
    tekst.classList.remove("gotowe");
  }
  if (podpis) {
    podpis.textContent = stan === "stop" ? "" : "z " + cwFormatCzasu(calosc);
  }
  const postep = document.getElementById("zg-pierscien-postep");
  if (postep) {
    const uplynelo = stan === "stop" ? 0 : 1 - zostalo / Math.max(1, calosc);
    postep.style.strokeDashoffset = String(CW_OBWOD * Math.min(1, Math.max(0, uplynelo)));
  }
}

// ----- Interwały: ustawienia -----

function zgBudujFazy(c) {
  const fazy = [{ typ: "przygotuj", s: ZG_PRZYGOTUJ_S, nazwa: "PRZYGOTUJ SIĘ" }];
  if (c.rozgrzewka) {
    fazy.push({ typ: "rozgrzewka", s: ZG_ROZGRZEWKA_S, nazwa: "ROZGRZEWKA" });
  }
  for (let r = 1; r <= c.rundy; r++) {
    fazy.push({ typ: "praca", s: c.praca, nazwa: "PRACA", runda: r });
    if (c.przerwa > 0 && r < c.rundy) {
      fazy.push({ typ: "przerwa", s: c.przerwa, nazwa: "PRZERWA", runda: r });
    }
  }
  if (c.schlodzenie) {
    fazy.push({ typ: "schlodzenie", s: ZG_SCHLODZENIE_S, nazwa: "SCHŁODZENIE" });
  }
  return fazy;
}

// Czas samego treningu (bez 5 s przygotowania)
function zgCzasInterwalow(c) {
  return zgBudujFazy(c).reduce(function (suma, f) {
    return suma + (f.typ === "przygotuj" ? 0 : f.s);
  }, 0);
}

function zgZmienInt(zmiana) {
  const c = zgInt();
  zmiana(c);
  c.szablon = "wlasny";
  zapiszDane();
  rysujZegar();
}

function zgRysujInterwaly() {
  const c = zgInt();
  zgTresc.appendChild(cwEl("div", "zg-etykieta", "Gotowe szablony"));
  const chipy = cwEl("div", "zg-chipy");
  ZG_SZABLONY.forEach(function (sz) {
    const p = cwPrzycisk(sz.nazwa, "zg-chip" + (sz.id === c.szablon ? " aktywny" : ""), function () {
      const ust = zgInt();
      ust.szablon = sz.id;
      if (sz.praca) {
        ust.praca = sz.praca;
        ust.przerwa = sz.przerwa;
        ust.rundy = sz.rundy;
      }
      zapiszDane();
      rysujZegar();
    });
    p.setAttribute("aria-pressed", sz.id === c.szablon ? "true" : "false");
    p.setAttribute("data-szablon", sz.id);
    chipy.appendChild(p);
  });
  zgTresc.appendChild(chipy);
  const wybrany = ZG_SZABLONY.filter(function (s) { return s.id === c.szablon; })[0];
  if (wybrany && wybrany.opis) {
    zgTresc.appendChild(cwEl("p", "zg-opis-szablonu", wybrany.opis));
  }

  const karta = cwEl("div", "zg-karta");
  karta.appendChild(zgKrok("Praca", zgSekundyTekst(c.praca), function () {
    zgZmienInt(function (x) { x.praca = Math.max(5, x.praca - 5); });
  }, function () {
    zgZmienInt(function (x) { x.praca = Math.min(1800, x.praca + 5); });
  }));
  karta.appendChild(zgKrok("Przerwa", zgSekundyTekst(c.przerwa), function () {
    zgZmienInt(function (x) { x.przerwa = Math.max(0, x.przerwa - 5); });
  }, function () {
    zgZmienInt(function (x) { x.przerwa = Math.min(1800, x.przerwa + 5); });
  }));
  karta.appendChild(zgKrok("Rundy", String(c.rundy), function () {
    zgZmienInt(function (x) { x.rundy = Math.max(1, x.rundy - 1); });
  }, function () {
    zgZmienInt(function (x) { x.rundy = Math.min(99, x.rundy + 1); });
  }));
  karta.appendChild(zgPrzelacznik("Rozgrzewka", cwFormatCzasu(ZG_ROZGRZEWKA_S), c.rozgrzewka, function () {
    zgInt().rozgrzewka = !zgInt().rozgrzewka;
    zapiszDane();
    rysujZegar();
  }));
  karta.appendChild(zgPrzelacznik("Schłodzenie", cwFormatCzasu(ZG_SCHLODZENIE_S), c.schlodzenie, function () {
    zgInt().schlodzenie = !zgInt().schlodzenie;
    zapiszDane();
    rysujZegar();
  }));
  zgTresc.appendChild(karta);

  const razem = cwEl("div", "zg-razem");
  razem.appendChild(cwEl("span", "", "Razem"));
  const suma = cwEl("b", "", cwFormatDlugi(zgCzasInterwalow(c)));
  suma.id = "zg-razem";
  razem.appendChild(suma);
  zgTresc.appendChild(razem);
  zgTresc.appendChild(cwEl("div", "cw-cel cw-srodek", "Sygnał, wibracja i odliczanie 3-2-1 działają przy włączonym ekranie. Ekran nie gaśnie w trakcie."));
  const start = cwPrzycisk("Start", "przycisk wielki cw-glowny", function () {
    zgStartBiegu();
  });
  start.id = "zg-int-start";
  zgTresc.appendChild(start);
}

// ----- Interwały: trening na pełnym ekranie -----

function zgStartBiegu() {
  const c = zgInt();
  const fazy = zgBudujFazy(c);
  cwSygnal(0);
  zgBieganie = {
    fazy: fazy,
    cfg: { praca: c.praca, przerwa: c.przerwa, rundy: c.rundy },
    i: 0,
    start: Date.now(),
    koniec: Date.now() + fazy[0].s * 1000,
    pauza: null,
    ostatniaSek: null,
    zakonczony: false,
    laczniePauzaMs: 0
  };
  zgBieg.hidden = false;
  zgBiegZamknij.setAttribute("aria-label", "Zakończ trening interwałowy");
  zgZajmij();
  zgRysujBieg();
}

function zgFazaBiegu() {
  return zgBieganie.fazy[zgBieganie.i];
}

function zgNastepnaFaza(odKiedy) {
  const b = zgBieganie;
  b.i++;
  b.ostatniaSek = null;
  if (b.i >= b.fazy.length) {
    b.zakonczony = true;
    b.czasKoniec = Date.now();
    return;
  }
  b.koniec = odKiedy + b.fazy[b.i].s * 1000;
}

function zgSygnalFazy() {
  const f = zgFazaBiegu();
  cwSygnal(f.typ === "praca" ? 2 : 1);
}

function zgOpisNastepnej(b) {
  const nast = b.fazy[b.i + 1];
  if (!nast) {
    return "Koniec treningu";
  }
  const nazwy = { przygotuj: "Przygotuj się", rozgrzewka: "Rozgrzewka", praca: "Praca", przerwa: "Przerwa", schlodzenie: "Schłodzenie" };
  return nazwy[nast.typ] + " " + cwFormatCzasu(nast.s) + (nast.runda ? " (runda " + nast.runda + " z " + b.cfg.rundy + ")" : "");
}

function zgRysujBieg() {
  const b = zgBieganie;
  zgBiegTresc.innerHTML = "";
  if (!b) {
    return;
  }
  if (b.zakonczony) {
    zgRysujKoniecBiegu();
    return;
  }
  const f = zgFazaBiegu();
  zgBiegTytul.textContent = "Interwały";
  const gora = cwEl("div", "cw-faza-wiersz");
  const praca = f.typ === "praca";
  const pill = cwEl("span", "cw-faza " + (praca ? "praca" : (f.typ === "przerwa" ? "przerwa" : "neutralna")), f.nazwa);
  pill.id = "zg-bieg-faza";
  gora.appendChild(pill);
  if (f.runda) {
    gora.appendChild(cwEl("span", "cw-seria-mala", "Runda " + f.runda + " z " + b.cfg.rundy));
  }
  zgBiegTresc.appendChild(gora);

  const pier = cwPierscien(praca ? "praca" : "przerwa", "zg-pierscien-postep");
  pier.tekst.id = "zg-bieg-czas";
  pier.tekst.setAttribute("role", "timer");
  pier.podpis.textContent = "z " + cwFormatCzasu(f.s);
  const pole = cwEl("div", "cw-pierscien-pole");
  pole.appendChild(pier.el);
  zgBiegTresc.appendChild(pole);

  const nast = cwEl("div", "cw-nastepne");
  nast.appendChild(cwEl("div", "cw-nastepne-etykieta", "NASTĘPNE"));
  nast.appendChild(cwEl("div", "cw-nastepne-tytul", zgOpisNastepnej(b)));
  zgBiegTresc.appendChild(nast);

  const rzad = cwEl("div", "zg-rzad");
  const pauza = cwPrzycisk(b.pauza === null ? "Pauza" : "Wznów", "przycisk zg-duzy", function () {
    if (zgBieganie.pauza === null) {
      zgBieganie.pauza = Math.max(0, zgBieganie.koniec - Date.now());
      zgBieganie.pauzaOd = Date.now();
      zgZwolnij();
    } else {
      zgBieganie.laczniePauzaMs += Date.now() - zgBieganie.pauzaOd;
      zgBieganie.koniec = Date.now() + zgBieganie.pauza;
      zgBieganie.pauza = null;
      zgZajmij();
    }
    zgRysujBieg();
  });
  pauza.id = "zg-bieg-pauza";
  rzad.appendChild(pauza);
  const pomin = cwPrzycisk("Pomiń", "przycisk drugi zg-duzy", function () {
    if (zgBieganie.pauza !== null) {
      zgBieganie.laczniePauzaMs += Date.now() - zgBieganie.pauzaOd;
      zgBieganie.pauza = null;
      zgZajmij();
    }
    zgNastepnaFaza(Date.now());
    if (!zgBieganie.zakonczony) {
      zgSygnalFazy();
    }
    zgRysujBieg();
  });
  pomin.id = "zg-bieg-pomin";
  rzad.appendChild(pomin);
  zgBiegTresc.appendChild(rzad);
  zgTikBiegu();
}

function zgRysujKoniecBiegu() {
  const b = zgBieganie;
  zgBiegTytul.textContent = "Koniec";
  zgBiegPasek.style.width = "100%";
  zgZwolnij();
  cwSygnal(3);
  zgBiegTresc.appendChild(cwEl("div", "cw-cel", "Interwały zakończone"));
  zgBiegTresc.appendChild(cwEl("h2", "cw-nazwa", b.cfg.rundy + " × " + cwFormatCzasu(b.cfg.praca) + (b.cfg.przerwa > 0 ? " + " + cwFormatCzasu(b.cfg.przerwa) : "")));
  const razem = Math.round((b.czasKoniec - b.start - b.laczniePauzaMs) / 1000);
  const hero = cwEl("div", "cw-hero");
  const gora = cwEl("div", "cw-hero-gora");
  gora.appendChild(cwEl("span", "cw-hero-etykieta", "Czas treningu"));
  gora.appendChild(cwEl("span", "cw-hero-czas", cwFormatDlugi(razem)));
  hero.appendChild(gora);
  const dol = cwEl("div", "cw-hero-dol");
  const poz = function (wartosc, podpis) {
    const e = cwEl("span", "");
    e.appendChild(cwEl("b", "", wartosc));
    e.appendChild(document.createTextNode(" " + podpis));
    return e;
  };
  dol.appendChild(poz(String(b.cfg.rundy), "rund"));
  dol.appendChild(poz(cwFormatDlugi(b.cfg.praca * b.cfg.rundy), "w pracy"));
  hero.appendChild(dol);
  zgBiegTresc.appendChild(hero);
  zgBiegTresc.appendChild(cwEl("div", "cw-cel cw-srodek", "To narzędzie nie zapisuje treningu w historii. Wynik biegu albo ćwiczeń wpisz w planie."));
  const zamknij = cwPrzycisk("Zamknij", "przycisk wielki cw-glowny", zgZamknijBieg);
  zamknij.id = "zg-bieg-koniec";
  zgBiegTresc.appendChild(zamknij);
}

function zgZamknijBieg() {
  zgBieganie = null;
  zgBieg.hidden = true;
  zgBiegTresc.innerHTML = "";
  zgZwolnij();
  rysujZegar();
}

// Odświeża pierścień i licznik; przechodzi do następnej fazy, gdy czas minął
function zgTikBiegu() {
  const b = zgBieganie;
  if (!b || b.zakonczony || b.pauza !== null) {
    return;
  }
  const teraz = Date.now();
  let zmiana = false;
  while (!b.zakonczony && teraz >= b.koniec) {
    zgNastepnaFaza(b.koniec);
    zmiana = true;
  }
  if (zmiana) {
    if (!b.zakonczony) {
      zgSygnalFazy();
    }
    zgRysujBieg();
    return;
  }
  const f = zgFazaBiegu();
  const zostalo = Math.ceil((b.koniec - teraz) / 1000);
  const tekst = document.getElementById("zg-bieg-czas");
  if (tekst) {
    tekst.textContent = cwFormatCzasu(zostalo);
  }
  const postep = document.getElementById("zg-pierscien-postep");
  if (postep) {
    postep.style.strokeDashoffset = String(CW_OBWOD * Math.min(1, Math.max(0, 1 - zostalo / Math.max(1, f.s))));
  }
  // Pasek: ile z całego treningu za nami
  let przed = 0;
  for (let i = 0; i < b.i; i++) {
    przed += b.fazy[i].s;
  }
  let calosc = 0;
  b.fazy.forEach(function (x) { calosc += x.s; });
  const zrobione = przed + (f.s - zostalo);
  zgBiegPasek.style.width = Math.round(Math.min(1, zrobione / calosc) * 100) + "%";
  // Odliczanie 3-2-1 przed zmianą fazy
  if (zostalo >= 1 && zostalo <= 3 && f.s > 4 && b.ostatniaSek !== zostalo) {
    b.ostatniaSek = zostalo;
    cwSygnal(1);
  }
}

zgBiegZamknij.addEventListener("click", function () {
  if (zgAlarmDzwoni) {
    zgWylaczAlarm();
    return;
  }
  if (zgBieganie && !zgBieganie.zakonczony && !confirm("Zakończyć trening interwałowy?")) {
    return;
  }
  zgZamknijBieg();
});

// ----- Alarm -----

function zgNajblizszyAlarm(czas) {
  const c = czas.split(":");
  const d = new Date();
  d.setHours(Number(c[0]) || 0, Number(c[1]) || 0, 0, 0);
  if (d.getTime() <= Date.now()) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

function zgOpisOdliczania(cel) {
  const min = Math.max(0, Math.round((cel - Date.now()) / 60000));
  const g = Math.floor(min / 60);
  const m = min % 60;
  if (g === 0) {
    return "za " + m + " min";
  }
  return "za " + g + " godz. " + m + " min";
}

function zgRysujAlarm() {
  const a = zgAlarmUst();
  const karta = cwEl("div", "zg-karta");
  const wierszCzasu = cwEl("div", "zg-krok-rzad");
  const etykietaCzasu = document.createElement("label");
  etykietaCzasu.className = "zg-krok-nazwa";
  etykietaCzasu.htmlFor = "zg-alarm-czas";
  etykietaCzasu.textContent = "Godzina";
  wierszCzasu.appendChild(etykietaCzasu);
  const poleCzasu = document.createElement("input");
  poleCzasu.type = "time";
  poleCzasu.id = "zg-alarm-czas";
  poleCzasu.className = "zg-pole-czasu";
  poleCzasu.value = a.czas;
  poleCzasu.addEventListener("change", function () {
    if (!poleCzasu.value) {
      return;
    }
    a.czas = poleCzasu.value;
    if (a.wlaczony) {
      a.cel = zgNajblizszyAlarm(a.czas).getTime();
    }
    zapiszDane();
    rysujZegar();
  });
  wierszCzasu.appendChild(poleCzasu);
  karta.appendChild(wierszCzasu);
  const wierszNazwy = cwEl("div", "zg-krok-rzad");
  const etykietaNazwy = document.createElement("label");
  etykietaNazwy.className = "zg-krok-nazwa";
  etykietaNazwy.htmlFor = "zg-alarm-nazwa";
  etykietaNazwy.textContent = "Opis";
  wierszNazwy.appendChild(etykietaNazwy);
  const poleNazwy = document.createElement("input");
  poleNazwy.type = "text";
  poleNazwy.id = "zg-alarm-nazwa";
  poleNazwy.className = "zg-pole-tekst";
  poleNazwy.placeholder = "np. Czas na trening";
  poleNazwy.maxLength = 60;
  poleNazwy.value = a.etykieta || "";
  poleNazwy.addEventListener("change", function () {
    a.etykieta = poleNazwy.value.trim();
    zapiszDane();
  });
  wierszNazwy.appendChild(poleNazwy);
  karta.appendChild(wierszNazwy);
  karta.appendChild(zgPrzelacznik("Alarm w aplikacji", a.wlaczony ? zgOpisOdliczania(a.cel) : "wyłączony", a.wlaczony, function () {
    a.wlaczony = !a.wlaczony;
    a.cel = a.wlaczony ? zgNajblizszyAlarm(a.czas).getTime() : 0;
    if (a.wlaczony) {
      cwSygnal(0);
    }
    zapiszDane();
    rysujZegar();
  }));
  zgTresc.appendChild(karta);

  const wiersz = cwEl("div", "zg-karta zg-karta-ics");
  wiersz.appendChild(cwEl("div", "zg-krok-nazwa", "Alarm, który zadzwoni zawsze"));
  wiersz.appendChild(cwEl("p", "zg-opis-szablonu", "Przeglądarka nie może ustawić prawdziwego budzika. Plik kalendarza doda wydarzenie z powiadomieniem, które zadzwoni nawet przy zamkniętej aplikacji."));
  const codziennie = document.createElement("label");
  codziennie.className = "zg-zaznacz";
  const pole = document.createElement("input");
  pole.type = "checkbox";
  pole.id = "zg-alarm-codziennie";
  pole.checked = !!zgUst().alarmCodziennie;
  pole.addEventListener("change", function () {
    zgUst().alarmCodziennie = pole.checked;
    zapiszDane();
  });
  codziennie.appendChild(pole);
  codziennie.appendChild(document.createTextNode(" Powtarzaj codziennie"));
  wiersz.appendChild(codziennie);
  const info = cwEl("div", "cw-cel", "");
  info.id = "zg-ics-info";
  wiersz.appendChild(cwPrzycisk("Dodaj do kalendarza (.ics)", "przycisk drugi", function () {
    zgPobierzAlarmIcs(info);
  }));
  wiersz.appendChild(info);
  zgTresc.appendChild(wiersz);
}

function zgTekstIcsAlarmu(czas, etykieta, codziennie) {
  const d = zgNajblizszyAlarm(czas);
  const koniec = new Date(d.getTime() + 5 * 60000);
  const teraz = new Date();
  const utc = function (x) {
    return x.getUTCFullYear() + dwie(x.getUTCMonth() + 1) + dwie(x.getUTCDate()) + "T" + dwie(x.getUTCHours()) + dwie(x.getUTCMinutes()) + dwie(x.getUTCSeconds()) + "Z";
  };
  const lokalnie = function (x) {
    return x.getFullYear() + dwie(x.getMonth() + 1) + dwie(x.getDate()) + "T" + dwie(x.getHours()) + dwie(x.getMinutes()) + "00";
  };
  const nazwa = (etykieta || "Alarm").replace(/[\r\n,;]/g, " ");
  const linie = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Cwiczenia//Zegar//PL", "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:alarm-" + teraz.getTime() + "@cwiczenia",
    "DTSTAMP:" + utc(teraz),
    "DTSTART:" + lokalnie(d),
    "DTEND:" + lokalnie(koniec),
    "SUMMARY:" + nazwa
  ];
  if (codziennie) {
    linie.push("RRULE:FREQ=DAILY");
  }
  linie.push("BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + nazwa, "TRIGGER:PT0M", "END:VALARM", "END:VEVENT", "END:VCALENDAR");
  return linie.join("\r\n");
}

function zgPobierzAlarmIcs(info) {
  const a = zgAlarmUst();
  const tekst = zgTekstIcsAlarmu(a.czas, a.etykieta, !!zgUst().alarmCodziennie);
  const plik = new Blob([tekst], { type: "text/calendar" });
  const adres = URL.createObjectURL(plik);
  const link = document.createElement("a");
  link.href = adres;
  link.download = "cwiczenia-alarm.ics";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(function () {
    URL.revokeObjectURL(adres);
  }, 2000);
  info.textContent = "Pobrano. Otwórz plik, a Kalendarz doda alarm na " + a.czas + ".";
}

// Alarm w aplikacji dzwoni na pełnym ekranie, aż go wyłączysz albo odłożysz
function zgZadzwonAlarm() {
  const a = zgAlarmUst();
  a.wlaczony = false;
  a.cel = 0;
  zapiszDane();
  zgBieganie = null;
  zgBieg.hidden = false;
  zgBiegTytul.textContent = "Alarm";
  zgBiegPasek.style.width = "100%";
  zgBiegZamknij.setAttribute("aria-label", "Wyłącz alarm");
  zgZajmij();
  zgBiegTresc.innerHTML = "";
  zgBiegTresc.appendChild(cwEl("div", "cw-cel cw-srodek", "Alarm"));
  const czas = cwEl("div", "zg-alarm-czas", a.czas);
  zgBiegTresc.appendChild(czas);
  zgBiegTresc.appendChild(cwEl("h2", "cw-nazwa cw-srodek", a.etykieta || "Czas na ruch"));
  const wylacz = cwPrzycisk("Wyłącz", "przycisk wielki cw-glowny", zgWylaczAlarm);
  wylacz.id = "zg-alarm-wylacz";
  zgBiegTresc.appendChild(wylacz);
  zgBiegTresc.appendChild(cwPrzycisk("Drzemka 5 minut", "przycisk drugi wielki", function () {
    const ust = zgAlarmUst();
    ust.wlaczony = true;
    ust.cel = Date.now() + 5 * 60000;
    zapiszDane();
    zgWylaczAlarm();
  }));
  cwSygnal(3);
  clearInterval(zgAlarmDzwoni);
  zgAlarmDzwoni = setInterval(function () {
    cwSygnal(3);
  }, 3000);
}

function zgWylaczAlarm() {
  clearInterval(zgAlarmDzwoni);
  zgAlarmDzwoni = null;
  zgBieg.hidden = true;
  zgBiegTresc.innerHTML = "";
  zgZwolnij();
  zgBiegZamknij.setAttribute("aria-label", "Zakończ trening interwałowy");
  rysujZegar();
}

// ===== Zegar tyka (co 200 ms): odświeża liczniki i pilnuje końca minutnika oraz alarmu =====

function zgTik() {
  const naEkranie = zgEkran.classList.contains("aktywny");
  if (zgStoper.start && naEkranie && (zgUst().tryb || "interwaly") === "stoper") {
    const el = document.getElementById("zg-stoper-czas");
    if (el) {
      el.textContent = zgFormatStopera(zgCzasStopera());
    }
  }
  if (zgMinutnik.stan === "idzie" && Date.now() >= zgMinutnik.koniec) {
    zgMinutnik.stan = "koniec";
    zgZwolnij();
    cwSygnal(3);
    if (naEkranie && (zgUst().tryb || "interwaly") === "minutnik") {
      rysujZegar();
    }
  }
  if (zgMinutnik.stan === "idzie" && naEkranie) {
    zgOdswiezMinutnik();
  }
  if (zgBieganie && !zgBieg.hidden) {
    zgTikBiegu();
  }
  const a = dane.ustawienia.zegar && dane.ustawienia.zegar.alarm;
  if (a && a.wlaczony && a.cel && Date.now() >= a.cel && !zgAlarmDzwoni) {
    if (Date.now() - a.cel > 120000) {
      // alarm minął, gdy aplikacja była zamknięta: nie dzwonimy po fakcie
      a.wlaczony = false;
      a.cel = 0;
      zapiszDane();
      if (naEkranie && (zgUst().tryb || "interwaly") === "alarm") {
        rysujZegar();
      }
    } else {
      zgZadzwonAlarm();
    }
  }
}

setInterval(zgTik, 200);
