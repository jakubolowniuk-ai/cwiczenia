// ===== Tryb "Ćwicz": prowadzi przez sesję serię po serii, z przerwami =====
// sesja.przebieg = { wyniki: { idĆwiczenia: [ {p: powtórzenia, kg: ciężar, t: czas w sekundach} ] }, extra: { id: liczba dodatkowych serii }, pominiete: { id: true } }
// Pozycję (które ćwiczenie i która seria) zawsze wyliczamy z tych danych, więc po zamknięciu aplikacji wracasz w to samo miejsce.

const cwTlo = document.getElementById("cwicz");
const cwTresc = document.getElementById("cwicz-tresc");
const cwTytul = document.getElementById("cwicz-tytul");
const cwPasek = document.getElementById("cwicz-pasek");
const cwZamknij = document.getElementById("cwicz-zamknij");

let cwSesja = null;
let cwFaza = "seria"; // "seria" | "przerwa" | "koniec"
let cwPrzerwaDo = 0; // moment (ms) końca przerwy
let cwPrzerwaGotowa = false;
let cwStoperStart = 0; // moment (ms) startu stopera; 0 = stoper nie chodzi
let cwStoperSygnal = false;
let cwInterwal = null;
let cwBlokada = null;
let cwAudio = null;
let cwOstatnieId = null; // ćwiczenie, w którym zrobiono ostatnią serię (od niego zależy długość przerwy)
let cwPrzerwaCalosc = 0; // długość bieżącej przerwy w sekundach (do pierścienia)
let cwKorektaOceny = 0; // o ile ocena serii zmieniła bieżącą przerwę (s)
let cwFazaZnana = null; // faza, której czas teraz liczymy ("seria" albo "przerwa")
let cwFazaOd = 0; // od kiedy (ms) trwa ta faza

// Czas treningu: ile spędzono na pracy (ekran serii), a ile na przerwach. Zapis w sesja.przebieg.czasy.
const CW_OBWOD = 2 * Math.PI * 100; // obwód pierścienia o promieniu 100
const CW_KOREKTA_OCENY = { latwo: -20, wsam: 0, ciezko: 30 };

function cwCzasy() {
  const p = cwPrzebieg();
  if (!p.czasy) {
    p.czasy = { praca: 0, przerwa: 0 };
  }
  return p.czasy;
}

// Dolicza czas ostatniej fazy; nowa to faza, w którą wchodzimy (null = koniec liczenia)
function cwLiczCzas(nowa) {
  const teraz = Date.now();
  if (cwFazaZnana && cwFazaOd) {
    const s = Math.min(1800, Math.max(0, Math.round((teraz - cwFazaOd) / 1000)));
    const c = cwCzasy();
    if (cwFazaZnana === "przerwa") {
      c.przerwa += s;
    } else {
      c.praca += s;
    }
    zapiszDane();
  }
  cwFazaOd = teraz;
  cwFazaZnana = nowa === "seria" || nowa === "przerwa" ? nowa : null;
}

// ===== Dźwięk, wibracja, ekran =====

function cwDzwiekWlaczony() {
  return dane.ustawienia.dzwiek !== false;
}

function cwWibracjaWlaczona() {
  return dane.ustawienia.wibracja !== false;
}

function cwSygnal(ile) {
  if (ile === 0) {
    // tylko "odblokowanie" dźwięku po dotknięciu (przeglądarka wymaga gestu użytkownika)
    try {
      cwAudio = cwAudio || new (window.AudioContext || window.webkitAudioContext)();
      if (cwAudio.state === "suspended") {
        cwAudio.resume();
      }
    } catch (e) {
      // brak dźwięku nie przerywa treningu
    }
    return;
  }
  if (cwWibracjaWlaczona() && navigator.vibrate) {
    navigator.vibrate(ile > 1 ? [250, 120, 250, 120, 250] : [300]);
  }
  if (!cwDzwiekWlaczony()) {
    return;
  }
  try {
    if (!cwAudio) {
      cwAudio = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (cwAudio.state === "suspended") {
      cwAudio.resume();
    }
    for (let i = 0; i < ile; i++) {
      const o = cwAudio.createOscillator();
      const g = cwAudio.createGain();
      o.type = "sine";
      o.frequency.value = i === ile - 1 ? 1175 : 880;
      const t0 = cwAudio.currentTime + i * 0.35;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.4, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.25);
      o.connect(g);
      g.connect(cwAudio.destination);
      o.start(t0);
      o.stop(t0 + 0.3);
    }
  } catch (e) {
    // brak dźwięku nie przerywa treningu
  }
}

function cwZajmijEkran() {
  if (!navigator.wakeLock || cwBlokada) {
    return;
  }
  navigator.wakeLock.request("screen").then(function (blokada) {
    cwBlokada = blokada;
    blokada.addEventListener("release", function () {
      cwBlokada = null;
    });
  }).catch(function () {
    cwBlokada = null;
  });
}

function cwZwolnijEkran() {
  if (cwBlokada) {
    cwBlokada.release();
    cwBlokada = null;
  }
}

document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "visible" && !cwTlo.hidden) {
    cwZajmijEkran();
  }
});

// ===== Dane serii =====

function cwPrzebieg() {
  if (!cwSesja.przebieg) {
    cwSesja.przebieg = { wyniki: {}, extra: {}, pominiete: {} };
  }
  return cwSesja.przebieg;
}

function cwDoJednostki(sekundy, jednostka) {
  return jednostka === "min" ? Math.round(sekundy / 6) / 10 : Math.round(sekundy * 10) / 10;
}

// Serie z planu ćwiczenia: [{p, t, kg}], plus dodatkowe serie dodane w trakcie
function cwSerie(id) {
  const plan = cwSesja.parametry[id];
  let serie = [];
  const kg = ciezaryIlosci(plan);
  const kgNa = function (i) {
    return kg.length === 0 ? 0 : (i < kg.length ? kg[i] : kg[kg.length - 1]);
  };
  if (czyPowtorzenia(plan)) {
    serie = listaPowtorzen(plan).map(function (p, i) {
      return { p: p, kg: kgNa(i) };
    });
  } else if (plan.typ === "czas") {
    serie = [{ t: sekundyZ(plan.wartosc, plan.jednostka), kg: 0 }];
  } else {
    const jednostka = jednostkaCzasu(plan);
    serie = listaCzasow(plan).map(function (c, i) {
      return { t: sekundyZ(c, jednostka), kg: kgNa(i) };
    });
  }
  const dodatkowe = cwPrzebieg().extra[id] || 0;
  for (let i = 0; i < dodatkowe; i++) {
    serie.push(Object.assign({}, serie[serie.length - 1]));
  }
  return serie;
}

function cwIds() {
  return wszystkieIdSesji(cwSesja);
}

// Czy ćwiczenie jest z bloku rozgrzewki albo rozciągania (krótsze przerwy, bez oceny)
function cwBlokowe(id) {
  return idyBloku(cwSesja, "przed").concat(idyBloku(cwSesja, "po")).indexOf(id) !== -1;
}

function cwWykonane(id) {
  return !!(cwSesja.zrobione && cwSesja.zrobione[id]);
}

// Pierwsze ćwiczenie, które nie jest zrobione ani pominięte; null, gdy wszystko załatwione
function cwBiezace() {
  const p = cwPrzebieg();
  const ids = cwIds();
  for (let i = 0; i < ids.length; i++) {
    if (!cwWykonane(ids[i]) && !p.pominiete[ids[i]]) {
      return { id: ids[i], indeks: i, nr: (p.wyniki[ids[i]] || []).length };
    }
  }
  return null;
}

function cwPrzerwaDla(id) {
  if (cwBlokowe(id)) {
    return 5;
  }
  const cw = znajdzCwiczenie(id);
  // Skrócony trening ma krótsze przerwy (cwSesja.przerwaMnoznik), ale nie krótsze niż 15 s
  const mnoznik = cwSesja && cwSesja.przerwaMnoznik ? cwSesja.przerwaMnoznik : 1;
  return Math.max(15, Math.round(((cw && cw.przerwa) || dane.ustawienia.przerwa || 60) * mnoznik));
}

// Wynik ćwiczenia (w formacie jak w planie) z zapisanych serii
function cwZbudujWynik(id) {
  const plan = cwSesja.parametry[id];
  const r = cwPrzebieg().wyniki[id] || [];
  const cw = znajdzCwiczenie(id);
  const kg = r.map(function (x) { return x.kg || 0; });
  const zCiezarem = cw.zCiezarem && kg.some(function (x) { return x > 0; });
  if (czyPowtorzenia(plan)) {
    const p = r.map(function (x) { return x.p; });
    const jednakowe = p.every(function (x) { return x === p[0]; }) && kg.every(function (x) { return x === kg[0]; });
    const wynik = jednakowe ? { typ: "powtorzenia", serie: p.length, powtorzenia: p[0] } : { typ: "serie-lista", powtorzenia: p };
    if (zCiezarem) {
      wynik.ciezary = kg;
    }
    return wynik;
  }
  if (plan.typ === "czas") {
    return { typ: "czas", wartosc: cwDoJednostki(r[0].t, plan.jednostka), jednostka: plan.jednostka };
  }
  const jednostka = jednostkaCzasu(plan);
  const wynik = { typ: "czas-serie", czasy: r.map(function (x) { return cwDoJednostki(x.t, jednostka); }), jednostka: jednostka };
  if (zCiezarem) {
    wynik.ciezary = kg;
  }
  return wynik;
}

function cwZakonczCwiczenie(id) {
  if (!cwSesja.zrobione) {
    cwSesja.zrobione = {};
  }
  if (!cwSesja.wykonane) {
    cwSesja.wykonane = {};
  }
  const wynik = cwZbudujWynik(id);
  const plan = cwSesja.parametry[id];
  cwSesja.zrobione[id] = true;
  if (miaraIlosci(wynik) === miaraIlosci(plan) && JSON.stringify(wynik) === JSON.stringify(plan)) {
    delete cwSesja.wykonane[id];
  } else {
    cwSesja.wykonane[id] = wynik;
  }
  zapiszDane();
  sprawdzRekord(cwSesja, id);
}

// ===== Przejścia =====

function cwZapiszSerie(wynik) {
  if (!bzPotwierdz(bzUwagiSerii(wynik))) {
    return;
  }
  const b = cwBiezace();
  const p = cwPrzebieg();
  if (!p.wyniki[b.id]) {
    p.wyniki[b.id] = [];
  }
  p.wyniki[b.id].push(wynik);
  const koniecCwiczenia = p.wyniki[b.id].length >= cwSerie(b.id).length;
  if (koniecCwiczenia) {
    cwZakonczCwiczenie(b.id);
  } else {
    zapiszDane();
  }
  cwPoSerii(b.id);
}

function cwPoSerii(id) {
  cwOstatnieId = id;
  if (cwBiezace()) {
    cwStartPrzerwy(cwPrzerwaDla(id));
  } else {
    cwFaza = "koniec";
    cwRysuj();
  }
}

function cwStartPrzerwy(sekundy) {
  cwFaza = "przerwa";
  cwPrzerwaDo = Date.now() + sekundy * 1000;
  cwPrzerwaCalosc = sekundy;
  cwKorektaOceny = 0;
  cwPrzerwaGotowa = false;
  cwRysuj();
}

function cwNastepna() {
  cwFaza = cwBiezace() ? "seria" : "koniec";
  cwStoperStart = 0;
  cwRysuj();
}

function cwPoprzednia() {
  const p = cwPrzebieg();
  const b = cwBiezace();
  if (b && b.nr > 0) {
    p.wyniki[b.id].pop();
  } else {
    // wracamy do ostatniego zrobionego (nie pominiętego) ćwiczenia przed bieżącym
    const ids = cwIds();
    const granica = b ? b.indeks : ids.length;
    let cel = null;
    for (let i = granica - 1; i >= 0; i--) {
      if (p.pominiete[ids[i]]) {
        delete p.pominiete[ids[i]];
        cel = ids[i];
        break;
      }
      if (cwWykonane(ids[i])) {
        cel = ids[i];
        break;
      }
    }
    if (!cel) {
      return;
    }
    if (cwWykonane(cel)) {
      cwSesja.zrobione[cel] = false;
      if (cwSesja.wykonane) {
        delete cwSesja.wykonane[cel];
      }
      if (p.wyniki[cel] && p.wyniki[cel].length > 0) {
        p.wyniki[cel].pop();
      }
    }
  }
  zapiszDane();
  cwStoperStart = 0;
  cwFaza = "seria";
  cwRysuj();
}

function cwPomin() {
  const b = cwBiezace();
  cwPrzebieg().pominiete[b.id] = true;
  zapiszDane();
  cwStoperStart = 0;
  cwNastepna();
}

function cwDodajSerie() {
  const b = cwBiezace();
  const p = cwPrzebieg();
  p.extra[b.id] = (p.extra[b.id] || 0) + 1;
  zapiszDane();
  cwRysuj();
}

// ===== Rysowanie =====

function cwEl(tag, klasa, tekst) {
  const e = document.createElement(tag);
  if (klasa) {
    e.className = klasa;
  }
  if (tekst !== undefined) {
    e.textContent = tekst;
  }
  return e;
}

function cwPrzycisk(tekst, klasa, akcja) {
  const b = cwEl("button", klasa, tekst);
  b.type = "button";
  b.addEventListener("click", akcja);
  return b;
}

function cwFormatCzasu(s) {
  s = Math.max(0, Math.floor(s));
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}

// Pole liczbowe z przyciskami − i +
function cwStepper(etykieta, wartosc, krok, ulamki) {
  const blok = cwEl("div", "cw-stepper");
  blok.appendChild(cwEl("div", "etykieta", etykieta));
  const rzad = cwEl("div", "cw-stepper-rzad");
  const pole = document.createElement("input");
  pole.type = "number";
  pole.inputMode = ulamki ? "decimal" : "numeric";
  pole.min = "0";
  pole.step = String(krok);
  pole.value = String(wartosc);
  pole.addEventListener("focus", function () {
    pole.select();
  });
  const zmien = function (kierunek) {
    const nowa = Math.max(0, Math.round(((Number(pole.value) || 0) + kierunek * krok) * 100) / 100);
    pole.value = String(nowa);
  };
  rzad.appendChild(cwPrzycisk("−", "cw-krok", function () { zmien(-1); }));
  rzad.appendChild(pole);
  rzad.appendChild(cwPrzycisk("+", "cw-krok", function () { zmien(1); }));
  blok.appendChild(rzad);
  return { blok: blok, pole: pole };
}

// Etykieta fazy: PRACA albo PRZERWA (kolor i napis, nie sam kolor)
function cwEtykietaFazy(praca) {
  return cwEl("span", "cw-faza " + (praca ? "praca" : "przerwa"), praca ? "PRACA" : "PRZERWA");
}

// Czas w formacie m:ss albo g:mm:ss
function cwFormatDlugi(s) {
  s = Math.max(0, Math.round(s));
  const g = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return g > 0 ? g + ":" + String(m).padStart(2, "0") + ":" + String(r).padStart(2, "0") : m + ":" + String(r).padStart(2, "0");
}

// Pierścień z odliczaniem; w środku czas (tekst) i podpis. Zwraca elementy do uzupełnienia.
function cwPierscien(klasa, idPostepu) {
  const NS = "http://www.w3.org/2000/svg";
  const obudowa = cwEl("div", "cw-pierscien " + klasa);
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 240 240");
  svg.setAttribute("aria-hidden", "true");
  const tor = document.createElementNS(NS, "circle");
  tor.setAttribute("cx", "120");
  tor.setAttribute("cy", "120");
  tor.setAttribute("r", "100");
  tor.setAttribute("class", "cw-pierscien-tor");
  const postep = document.createElementNS(NS, "circle");
  postep.setAttribute("cx", "120");
  postep.setAttribute("cy", "120");
  postep.setAttribute("r", "100");
  postep.setAttribute("class", "cw-pierscien-postep");
  postep.setAttribute("transform", "rotate(-90 120 120)");
  postep.style.strokeDasharray = String(CW_OBWOD);
  postep.style.strokeDashoffset = "0";
  if (idPostepu) {
    postep.id = idPostepu;
  }
  svg.appendChild(tor);
  svg.appendChild(postep);
  obudowa.appendChild(svg);
  const srodek = cwEl("div", "cw-pierscien-srodek");
  const tekst = cwEl("div", "cw-pierscien-czas", "0:00");
  const podpis = cwEl("div", "cw-pierscien-podpis", "");
  srodek.appendChild(tekst);
  srodek.appendChild(podpis);
  obudowa.appendChild(srodek);
  return { el: obudowa, tekst: tekst, podpis: podpis, postep: postep };
}

// Ocena serii na przerwie; wpływa na długość tej przerwy (ciężko +30 s, łatwo −20 s)
function cwOcenaPrzerwy(id) {
  const sesja = cwSesja;
  const blok = cwEl("div", "cw-ocena");
  const rzad = cwEl("div", "ocena-pasek");
  rzad.appendChild(cwEl("span", "ocena-pytanie", "Jak poszła ta seria?"));
  const odswiezPrzyciski = [];
  OCENY.forEach(function (o) {
    const p = cwPrzycisk(o[1], "ocena-przycisk", function () {
      if (!sesja.ocena) {
        sesja.ocena = {};
      }
      if (sesja.ocena[id] === o[0]) {
        delete sesja.ocena[id];
      } else {
        sesja.ocena[id] = o[0];
      }
      const nowa = sesja.ocena[id] ? CW_KOREKTA_OCENY[sesja.ocena[id]] : 0;
      const roznica = nowa - cwKorektaOceny;
      cwKorektaOceny = nowa;
      cwPrzerwaDo += roznica * 1000;
      cwPrzerwaCalosc = Math.max(1, cwPrzerwaCalosc + roznica);
      cwPrzerwaGotowa = false;
      zapiszDane();
      odswiezPrzyciski.forEach(function (f) { f(); });
      cwOdswiezLicznik();
    });
    p.setAttribute("data-ocena", o[0]);
    const odswiez = function () {
      const wybrana = !!(sesja.ocena && sesja.ocena[id] === o[0]);
      p.classList.toggle("wybrana", wybrana);
      p.setAttribute("aria-pressed", wybrana ? "true" : "false");
    };
    odswiezPrzyciski.push(odswiez);
    odswiez();
    rzad.appendChild(p);
  });
  blok.appendChild(rzad);
  blok.appendChild(cwEl("div", "cw-cel", "Ciężko: przerwa dłuższa o 30 s. Łatwo: krótsza o 20 s."));
  return blok;
}

// Cały trening: co zrobione, co teraz, co zostało
function cwListaTreningu(aktualneId) {
  const karta = cwEl("div", "cw-lista");
  karta.appendChild(cwEl("div", "cw-lista-tytul", "Cały trening"));
  const p = cwPrzebieg();
  cwIds().forEach(function (id) {
    const cw = znajdzCwiczenie(id);
    if (!cw) {
      return;
    }
    const zrobione = cwWykonane(id);
    const pominiete = !!p.pominiete[id];
    const biezace = id === aktualneId;
    const w = cwEl("div", "cw-lista-wiersz" + (zrobione ? " zrobione" : "") + (biezace ? " biezace" : "") + (pominiete ? " pominiete" : ""));
    const znak = cwEl("span", "cw-lista-znak", zrobione ? "✓" : pominiete ? "–" : biezace ? "●" : "○");
    znak.setAttribute("aria-hidden", "true");
    w.appendChild(znak);
    const nazwa = cwEl("span", "cw-lista-nazwa", cw.nazwa);
    const stan = zrobione ? "zrobione" : pominiete ? "pominięte" : biezace ? "teraz" : "";
    if (stan) {
      nazwa.appendChild(cwEl("span", "cw-ukryte", " (" + stan + ")"));
    }
    w.appendChild(nazwa);
    const ilosc = cwSesja.wykonane && cwSesja.wykonane[id] ? cwSesja.wykonane[id] : cwSesja.parametry[id];
    w.appendChild(cwEl("span", "cw-lista-ilosc", ilosc ? opisIlosci(ilosc, cw) : ""));
    karta.appendChild(w);
  });
  return karta;
}

function cwNaglowekCwiczenia(b, serie) {
  const cw = znajdzCwiczenie(b.id);
  const ids = cwIds();
  const etykietaBloku = idyBloku(cwSesja, "przed").indexOf(b.id) !== -1 ? "Rozgrzewka · " : idyBloku(cwSesja, "po").indexOf(b.id) !== -1 ? "Rozciąganie · " : "";
  cwTytul.textContent = etykietaBloku + "Ćwiczenie " + (b.indeks + 1) + " z " + ids.length;
  const zrobione = ids.filter(function (id) {
    return cwWykonane(id) || cwPrzebieg().pominiete[id];
  }).length;
  cwPasek.style.width = Math.round(zrobione * 100 / ids.length) + "%";

  const gora = cwEl("div", "cw-faza-wiersz");
  gora.appendChild(cwEtykietaFazy(true));
  cwTresc.appendChild(gora);
  cwTresc.appendChild(cwEl("h2", "cw-nazwa", cw.nazwa));
  if (maOpis(cw)) {
    const opis = cwPrzycisk("Opis ćwiczenia", "akcja film cw-opis", function () {
      otworzOpis(cw);
    });
    cwTresc.appendChild(opis);
  }
  cwTresc.appendChild(cwEl("div", "cw-seria", "Seria " + (b.nr + 1) + " z " + serie.length));
}

function cwOpisSerii(s, cw) {
  const czesci = [];
  if (s.p !== undefined) {
    czesci.push(s.p + " powt.");
  } else {
    czesci.push(opisCzasuSekund(s.t));
  }
  if (cw.zCiezarem && s.kg > 0) {
    czesci.push(s.kg + " kg");
  }
  return czesci.join(" · ");
}

function cwDolneAkcje(b) {
  const rzad = cwEl("div", "cw-dol");
  const poprzednia = cwPrzycisk("← Poprzednia", "akcja", cwPoprzednia);
  const ids = cwIds();
  poprzednia.disabled = b.nr === 0 && !ids.slice(0, b.indeks).some(function (id) {
    return cwWykonane(id) || cwPrzebieg().pominiete[id];
  });
  rzad.appendChild(poprzednia);
  rzad.appendChild(cwPrzycisk("+ seria", "akcja", cwDodajSerie));
  rzad.appendChild(cwPrzycisk("Pomiń ćwiczenie", "akcja usun", cwPomin));
  cwTresc.appendChild(rzad);
}

function cwRysujSerie() {
  const b = cwBiezace();
  const serie = cwSerie(b.id);
  const s = serie[Math.min(b.nr, serie.length - 1)];
  const cw = znajdzCwiczenie(b.id);
  cwNaglowekCwiczenia(b, serie);
  cwTresc.appendChild(cwEl("div", "cw-plan", "Plan: " + cwOpisSerii(s, cw)));
  const ostatnio = tekstOstatnio(b.id, cwSesja.id);
  if (ostatnio) {
    cwTresc.appendChild(cwEl("div", "ostatnio-info", ostatnio));
  }
  if (cw.rekord) {
    cwTresc.appendChild(cwEl("div", "ostatnio-info", "★ Rekord: " + opisRekordu(cw.rekord)));
  }

  const pola = cwEl("div", "cw-pola");
  let poleKg = null;
  if (cw.zCiezarem) {
    poleKg = cwStepper(etykietaCiezaru(cw), s.kg || 0, 2.5, true);
    if (typeof anProcent1RM === "function") {
      const info = cwEl("div", "ostatnio-info an-rm", "");
      const odswiez = function () {
        info.textContent = anProcent1RM(b.id, Number(poleKg.pole.value) || 0);
      };
      poleKg.pole.addEventListener("input", odswiez);
      poleKg.blok.addEventListener("click", function () { setTimeout(odswiez, 0); });
      odswiez();
      poleKg.blok.appendChild(info);
      if (anZeSztanga(cw)) {
        poleKg.blok.appendChild(cwPrzycisk("Talerze na sztangę", "akcja an-talerze-przycisk", function () {
          anOtworzKalkulator(Number(poleKg.pole.value) || 0, function (kg) {
            poleKg.pole.value = String(kg);
            odswiez();
          });
        }));
      }
    }
  }

  if (s.p !== undefined) {
    const poleP = cwStepper("Powtórzenia", s.p, 1, false);
    pola.appendChild(poleP.blok);
    if (poleKg) {
      pola.appendChild(poleKg.blok);
    }
    cwTresc.appendChild(pola);
    cwTresc.appendChild(cwPrzycisk("Zrobione ✓", "przycisk wielki cw-glowny", function () {
      const wynik = { p: Math.max(1, Math.round(Number(poleP.pole.value) || 0)), kg: poleKg ? Number(poleKg.pole.value) || 0 : 0 };
      cwZapiszSerie(wynik);
    }));
  } else {
    // ćwiczenie na czas: stoper liczy w górę, także po osiągnięciu celu (rekordy!)
    if (poleKg) {
      pola.appendChild(poleKg.blok);
      cwTresc.appendChild(pola);
    }
    const pier = cwPierscien("praca", "cw-pierscien-postep");
    pier.tekst.id = "cw-stoper";
    pier.tekst.textContent = cwFormatCzasu(s.t);
    pier.podpis.textContent = "z " + cwFormatCzasu(s.t);
    const polePier = cwEl("div", "cw-pierscien-pole");
    polePier.appendChild(pier.el);
    cwTresc.appendChild(polePier);
    cwTresc.appendChild(cwEl("div", "cw-cel cw-srodek", "Cel: " + opisCzasuSekund(s.t) + " (po celu liczę dalej)"));
    const przycisk = cwPrzycisk(cwStoperStart ? "Stop" : "Start", "przycisk wielki cw-glowny", function () {
      if (!cwStoperStart) {
        if (cwDzwiekWlaczony()) {
          cwSygnal(0);
        }
        cwStoperStart = Date.now();
        cwStoperSygnal = false;
        cwRysuj();
      } else {
        const t = Math.max(1, Math.round((Date.now() - cwStoperStart) / 1000));
        cwStoperStart = 0;
        cwZapiszSerie({ t: t, kg: poleKg ? Number(poleKg.pole.value) || 0 : 0 });
      }
    });
    przycisk.id = "cw-start-stop";
    cwTresc.appendChild(przycisk);
  }
  cwDolneAkcje(b);
  cwTresc.appendChild(cwListaTreningu(b.id));
}

function cwRysujPrzerwe() {
  const b = cwBiezace();
  const poprzednieId = cwOstatnieId || b.id;
  const ids = cwIds();
  cwTytul.textContent = "Przerwa";
  const zrobione = ids.filter(function (id) {
    return cwWykonane(id) || cwPrzebieg().pominiete[id];
  }).length;
  cwPasek.style.width = Math.round(zrobione * 100 / ids.length) + "%";

  const poprzCw = znajdzCwiczenie(poprzednieId);
  const gora = cwEl("div", "cw-faza-wiersz");
  gora.appendChild(cwEtykietaFazy(false));
  if (poprzCw && cwSesja.parametry[poprzednieId]) {
    const zrobioneSerie = (cwPrzebieg().wyniki[poprzednieId] || []).length;
    const wszystkie = cwSerie(poprzednieId).length;
    gora.appendChild(cwEl("span", "cw-seria-mala", "Po serii " + Math.min(zrobioneSerie, wszystkie) + " z " + wszystkie + " · " + poprzCw.nazwa));
  }
  cwTresc.appendChild(gora);

  const pier = cwPierscien("przerwa", "cw-pierscien-postep");
  pier.tekst.id = "cw-licznik";
  pier.podpis.id = "cw-podpis";
  const polePier = cwEl("div", "cw-pierscien-pole");
  polePier.appendChild(pier.el);
  cwTresc.appendChild(polePier);

  if (poprzCw && !cwBlokowe(poprzednieId)) {
    cwTresc.appendChild(cwOcenaPrzerwy(poprzednieId));
  }

  const serie = cwSerie(b.id);
  const cw = znajdzCwiczenie(b.id);
  const nastepne = cwEl("div", "cw-nastepne");
  nastepne.appendChild(cwEl("div", "cw-nastepne-etykieta", "NASTĘPNE"));
  nastepne.appendChild(cwEl("div", "cw-nastepne-tytul", cw.nazwa + ", seria " + (b.nr + 1) + " z " + serie.length));
  nastepne.appendChild(cwEl("div", "cw-nastepne-opis", cwOpisSerii(serie[Math.min(b.nr, serie.length - 1)], cw)));
  cwTresc.appendChild(nastepne);
  if (maOpis(cw)) {
    cwTresc.appendChild(cwPrzycisk("Opis następnego ćwiczenia", "akcja film cw-opis", function () {
      otworzOpis(cw);
    }));
  }

  const rzad = cwEl("div", "cw-dol");
  const zmien = function (ile) {
    cwPrzerwaDo += ile * 1000;
    cwPrzerwaCalosc = Math.max(1, cwPrzerwaCalosc + ile);
    const cwPrz = znajdzCwiczenie(poprzednieId);
    if (cwPrz) {
      cwPrz.przerwa = Math.max(15, cwPrzerwaDla(poprzednieId) + ile);
      zapiszDane();
    }
    cwPrzerwaGotowa = false;
    cwOdswiezLicznik();
  };
  rzad.appendChild(cwPrzycisk("−15 s", "akcja", function () { zmien(-15); }));
  rzad.appendChild(cwPrzycisk("+15 s", "akcja", function () { zmien(15); }));
  cwTresc.appendChild(rzad);
  const dalej = cwPrzycisk("Pomiń przerwę", "przycisk wielki cw-glowny", cwNastepna);
  dalej.id = "cw-dalej";
  cwTresc.appendChild(dalej);
  cwTresc.appendChild(cwListaTreningu(b.id));
}

function cwRysujKoniec() {
  cwTytul.textContent = "Koniec treningu";
  cwPasek.style.width = "100%";
  const ids = cwIds();
  const zrobione = ids.filter(cwWykonane);
  const tr = cwSesja.treningId ? znajdzTrening(cwSesja.treningId) : null;
  cwTresc.appendChild(cwEl("div", "cw-cel", "Trening zakończony"));
  cwTresc.appendChild(cwEl("h2", "cw-nazwa", tr ? tr.nazwa : "Trening"));

  const c = cwPrzebieg().czasy;
  const praca = c ? c.praca : 0;
  const przerwy = c ? c.przerwa : 0;
  if (praca + przerwy >= 5) {
    const hero = cwEl("div", "cw-hero");
    const gora = cwEl("div", "cw-hero-gora");
    gora.appendChild(cwEl("span", "cw-hero-etykieta", "Czas treningu"));
    gora.appendChild(cwEl("span", "cw-hero-czas", cwFormatDlugi(praca + przerwy)));
    hero.appendChild(gora);
    const pasek = cwEl("div", "cw-hero-pasek");
    pasek.setAttribute("aria-hidden", "true");
    const wypelnienie = cwEl("div", "");
    wypelnienie.style.width = Math.round(praca * 100 / (praca + przerwy)) + "%";
    pasek.appendChild(wypelnienie);
    hero.appendChild(pasek);
    const dol = cwEl("div", "cw-hero-dol");
    const poz = function (wartosc, podpis) {
      const e = cwEl("span", "");
      e.appendChild(cwEl("b", "", wartosc));
      e.appendChild(document.createTextNode(" " + podpis));
      return e;
    };
    dol.appendChild(poz(cwFormatDlugi(praca), "praca"));
    dol.appendChild(poz(cwFormatDlugi(przerwy), "przerwy"));
    if (praca >= 5) {
      dol.appendChild(poz("1 : " + (Math.round(przerwy / praca * 10) / 10).toString().replace(".", ","), "praca do przerw"));
    }
    hero.appendChild(dol);
    cwTresc.appendChild(hero);
  }

  cwTresc.appendChild(cwEl("div", "cw-plan", "Zrobione ćwiczenia: " + zrobione.length + " z " + ids.length));
  zrobione.forEach(function (id) {
    const cw = znajdzCwiczenie(id);
    const wiersz = cwEl("div", "cw-podsumowanie");
    wiersz.appendChild(cwEl("div", "karta-nazwa", cw.nazwa));
    wiersz.appendChild(cwEl("div", "ostatnio-info", opisIlosci(cwSesja.wykonane && cwSesja.wykonane[id] ? cwSesja.wykonane[id] : cwSesja.parametry[id], znajdzCwiczenie(id))));
    if (!cwBlokowe(id)) {
      wiersz.appendChild(ocenaPasek(cwSesja, id));
    }
    cwTresc.appendChild(wiersz);
  });
  const pominiete = ids.filter(function (id) { return !cwWykonane(id); });
  if (pominiete.length > 0) {
    cwTresc.appendChild(cwEl("p", "opis", "Niezrobione: " + pominiete.map(function (id) { return znajdzCwiczenie(id).nazwa; }).join(", ")));
  }
  const rzad = cwEl("div", "cw-dol");
  rzad.appendChild(cwPrzycisk("← Cofnij ostatnią", "akcja", cwPoprzednia));
  cwTresc.appendChild(rzad);
  cwTresc.appendChild(cwPrzycisk("Zamknij", "przycisk wielki cw-glowny", cwZamknijTryb));
}

function cwRysuj() {
  cwTresc.innerHTML = "";
  if (cwFaza !== "koniec" && !cwBiezace()) {
    cwFaza = "koniec";
  }
  if (cwFaza !== cwFazaZnana) {
    cwLiczCzas(cwFaza);
  }
  if (cwFaza === "przerwa") {
    cwRysujPrzerwe();
  } else if (cwFaza === "koniec") {
    cwRysujKoniec();
  } else {
    cwRysujSerie();
  }
  cwOdswiezLicznik();
  cwZapamietajStan();
}

// Odświeża liczniki (przerwa albo stoper); uruchamiane co ułamek sekundy z zegara, nie z licznika kroków
function cwUstawPierscien(ulamekUplyniety) {
  const postep = document.getElementById("cw-pierscien-postep");
  if (postep) {
    postep.style.strokeDashoffset = String(CW_OBWOD * Math.min(1, Math.max(0, ulamekUplyniety)));
  }
}

function cwOdswiezLicznik() {
  if (cwFaza === "przerwa") {
    const licznik = document.getElementById("cw-licznik");
    if (!licznik) {
      return;
    }
    const zostalo = Math.ceil((cwPrzerwaDo - Date.now()) / 1000);
    const podpis = document.getElementById("cw-podpis");
    if (podpis) {
      podpis.textContent = "z " + cwFormatCzasu(cwPrzerwaCalosc);
    }
    if (zostalo > 0) {
      licznik.textContent = cwFormatCzasu(zostalo);
      licznik.classList.remove("gotowe");
      cwUstawPierscien(1 - zostalo / Math.max(1, cwPrzerwaCalosc));
    } else {
      licznik.textContent = "Zaczynaj!";
      licznik.classList.add("gotowe");
      cwUstawPierscien(1);
      const dalej = document.getElementById("cw-dalej");
      if (dalej && dalej.textContent !== "Dalej") {
        dalej.textContent = "Dalej";
      }
      if (!cwPrzerwaGotowa) {
        cwPrzerwaGotowa = true;
        cwSygnal(3);
      }
    }
  } else if (cwFaza === "seria" && cwStoperStart) {
    const stoper = document.getElementById("cw-stoper");
    if (!stoper) {
      return;
    }
    const b = cwBiezace();
    const serie = cwSerie(b.id);
    const cel = serie[Math.min(b.nr, serie.length - 1)].t;
    const uplynelo = (Date.now() - cwStoperStart) / 1000;
    const zostalo = cel - uplynelo;
    // Do celu odliczamy w dół; po celu pokazujemy, ile ponad (+0:05) – ważne dla rekordów
    stoper.textContent = zostalo > 0 ? cwFormatCzasu(Math.ceil(zostalo)) : "+" + cwFormatCzasu(-zostalo);
    stoper.classList.toggle("gotowe", uplynelo >= cel);
    cwUstawPierscien(uplynelo / cel);
    if (uplynelo >= cel && !cwStoperSygnal) {
      cwStoperSygnal = true;
      cwSygnal(2);
    }
  }
}

// ===== Wznawianie przerwanego treningu =====
// Serie zapisują się w sesji na bieżąco (przebieg.wyniki). Tutaj pamiętamy tylko, który trening był otwarty
// i czy trwała przerwa – żeby po zamknięciu aplikacji albo restarcie telefonu wrócić w to samo miejsce.

const CW_TRWA = "cwiczenia-trening-trwa";
const CW_WAZNOSC_H = 12;

function cwZapamietajStan() {
  if (!cwSesja) {
    return;
  }
  try {
    if (cwFaza === "koniec") {
      localStorage.removeItem(CW_TRWA);
      return;
    }
    localStorage.setItem(CW_TRWA, JSON.stringify({
      sesjaId: cwSesja.id,
      faza: cwFaza,
      przerwaDo: cwPrzerwaDo,
      przerwaCalosc: cwPrzerwaCalosc,
      ostatnieId: cwOstatnieId,
      zapisano: Date.now()
    }));
  } catch (e) {}
}

function cwZapomnijStan() {
  try {
    localStorage.removeItem(CW_TRWA);
  } catch (e) {}
}

// Zwraca { plan, sesja, stan } albo null (nic nie trwało, trening skończony, minęło ponad 12 h)
function cwStanDoWznowienia() {
  let stan = null;
  try {
    stan = JSON.parse(localStorage.getItem(CW_TRWA) || "null");
  } catch (e) {
    stan = null;
  }
  if (!stan || !stan.sesjaId) {
    return null;
  }
  let znalezione = null;
  (dane.plany || []).forEach(function (plan) {
    (plan.sesje || []).forEach(function (s) {
      if (s.id === stan.sesjaId) {
        znalezione = { plan: plan, sesja: s, stan: stan };
      }
    });
  });
  const stary = Date.now() - (stan.zapisano || 0) > CW_WAZNOSC_H * 3600000;
  if (!znalezione || stary) {
    cwZapomnijStan();
    return null;
  }
  // Czy coś zostało do zrobienia
  const poprz = cwSesja;
  cwSesja = znalezione.sesja;
  const zostalo = !!cwBiezace();
  cwSesja = poprz;
  if (!zostalo) {
    cwZapomnijStan();
    return null;
  }
  return znalezione;
}

function cwWznow(w) {
  otworzCwicz(w.sesja);
  if (w.stan.faza === "przerwa" && w.stan.przerwaDo > Date.now()) {
    cwFaza = "przerwa";
    cwPrzerwaDo = w.stan.przerwaDo;
    cwPrzerwaCalosc = Math.max(w.stan.przerwaCalosc || 0, Math.ceil((w.stan.przerwaDo - Date.now()) / 1000), 1);
    cwKorektaOceny = 0;
    cwPrzerwaGotowa = false;
    cwOstatnieId = w.stan.ostatnieId || null;
    cwRysuj();
  }
}

// Karta „Wznów trening” na górze „Dziś” albo null
function cwKartaWznowienia() {
  if (!cwTlo.hidden) {
    return null;
  }
  const w = cwStanDoWznowienia();
  if (!w) {
    return null;
  }
  const poprz = cwSesja;
  cwSesja = w.sesja;
  const ids = cwIds();
  const b = cwBiezace();
  const cw = znajdzCwiczenie(b.id);
  const serie = cwSerie(b.id).length;
  cwSesja = poprz;
  const tr = w.sesja.treningId ? znajdzTrening(w.sesja.treningId) : null;
  const karta = document.createElement("div");
  karta.className = "bz-karta wznow";
  karta.appendChild(tekstElement("div", "bz-tytul", "Przerwany trening" + (tr ? ": " + tr.nazwa : "")));
  karta.appendChild(tekstElement("p", "opis", "Zatrzymałeś(aś) się na: " + (cw ? cw.nazwa : "ćwiczenie") + " – seria " + Math.min(b.nr + 1, serie) + " z " + serie +
    " (ćwiczenie " + (b.indeks + 1) + " z " + ids.length + "). Zrobione serie są zapisane."));
  const rzad = document.createElement("div");
  rzad.className = "bz-rzad";
  const tak = tekstElement("button", "przycisk", "Wznów trening");
  tak.type = "button";
  tak.addEventListener("click", function () { cwWznow(w); });
  const nie = tekstElement("button", "akcja", "Nie teraz");
  nie.type = "button";
  nie.addEventListener("click", function () {
    cwZapomnijStan();
    karta.remove();
  });
  rzad.appendChild(tak);
  rzad.appendChild(nie);
  karta.appendChild(rzad);
  return karta;
}

// ===== Otwieranie i zamykanie =====

function otworzCwicz(sesja) {
  cwSesja = sesja;
  cwStoperStart = 0;
  cwFazaZnana = null;
  cwFazaOd = 0;
  cwKorektaOceny = 0;
  cwPrzerwaCalosc = 0;
  cwFaza = cwBiezace() ? "seria" : "koniec";
  cwTlo.hidden = false;
  cwSygnal(0);
  cwZajmijEkran();
  clearInterval(cwInterwal);
  cwInterwal = setInterval(cwOdswiezLicznik, 250);
  cwRysuj();
}

function cwZamknijTryb() {
  // Świadome zamknięcie: nie proponujemy wznowienia (zrobione serie i tak zostają w sesji)
  cwLiczCzas(null);
  cwZapomnijStan();
  clearInterval(cwInterwal);
  cwInterwal = null;
  cwStoperStart = 0;
  cwZwolnijEkran();
  cwTlo.hidden = true;
  // sesja z kompletem odhaczonych ćwiczeń nie wymaga dalszych danych o przebiegu
  zapiszDane();
  rysujDzis();
}

cwZamknij.addEventListener("click", function () {
  if (cwStoperStart && !confirm("Stoper chodzi. Zamknąć tryb ćwiczenia bez zapisania tej serii?")) {
    return;
  }
  cwZamknijTryb();
});

// ===== Ustawienia: dźwięk, wibracja, domyślna przerwa =====

const ustDzwiek = document.getElementById("ust-dzwiek");
const ustWibracja = document.getElementById("ust-wibracja");
const ustPrzerwa = document.getElementById("ust-przerwa");

function rysujUstawieniaTreningu() {
  const dz = dane.ustawienia.dzwiek !== false;
  const wi = dane.ustawienia.wibracja !== false;
  ustDzwiek.setAttribute("aria-checked", dz ? "true" : "false");
  ustDzwiek.classList.toggle("wlaczony", dz);
  ustWibracja.setAttribute("aria-checked", wi ? "true" : "false");
  ustWibracja.classList.toggle("wlaczony", wi);
  ustPrzerwa.value = String(dane.ustawienia.przerwa || 60);
  const be = dane.ustawienia.biegEkran !== false;
  const ustBiegEkran = document.getElementById("ust-bieg-ekran");
  ustBiegEkran.setAttribute("aria-checked", be ? "true" : "false");
  ustBiegEkran.classList.toggle("wlaczony", be);
}

document.getElementById("ust-bieg-ekran").addEventListener("click", function () {
  dane.ustawienia.biegEkran = dane.ustawienia.biegEkran === false;
  zapiszDane();
  rysujUstawieniaTreningu();
});

document.getElementById("otworz-ustawienia").addEventListener("click", rysujUstawieniaTreningu);
ustDzwiek.addEventListener("click", function () {
  dane.ustawienia.dzwiek = dane.ustawienia.dzwiek === false;
  zapiszDane();
  rysujUstawieniaTreningu();
});
ustWibracja.addEventListener("click", function () {
  dane.ustawienia.wibracja = dane.ustawienia.wibracja === false;
  zapiszDane();
  rysujUstawieniaTreningu();
});
ustPrzerwa.addEventListener("change", function () {
  const s = Math.round(Number(ustPrzerwa.value));
  dane.ustawienia.przerwa = s >= 5 && s <= 900 ? s : 60;
  zapiszDane();
  rysujUstawieniaTreningu();
});
