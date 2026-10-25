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
  return cwiczeniaSesjiIds(cwSesja);
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
  const cw = znajdzCwiczenie(id);
  return (cw && cw.przerwa) || dane.ustawienia.przerwa || 60;
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

function cwNaglowekCwiczenia(b, serie) {
  const cw = znajdzCwiczenie(b.id);
  const ids = cwIds();
  cwTytul.textContent = "Ćwiczenie " + (b.indeks + 1) + " z " + ids.length;
  const zrobione = ids.filter(function (id) {
    return cwWykonane(id) || cwPrzebieg().pominiete[id];
  }).length;
  cwPasek.style.width = Math.round(zrobione * 100 / ids.length) + "%";

  cwTresc.appendChild(cwEl("h2", "cw-nazwa", cw.nazwa));
  if (cw.link) {
    const film = cwEl("a", "akcja film", "▶ Film");
    film.href = cw.link;
    film.target = "_blank";
    film.rel = "noopener";
    cwTresc.appendChild(film);
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
    poleKg = cwStepper("Ciężar (kg)", s.kg || 0, 2.5, true);
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
    const stoper = cwEl("div", "cw-stoper", "0:00");
    stoper.id = "cw-stoper";
    cwTresc.appendChild(stoper);
    cwTresc.appendChild(cwEl("div", "cw-cel", "Cel: " + opisCzasuSekund(s.t) + " (liczę dalej po celu)"));
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

  cwTresc.appendChild(cwEl("div", "cw-seria", "Odpoczywaj"));
  const licznik = cwEl("div", "cw-stoper", "0:00");
  licznik.id = "cw-licznik";
  cwTresc.appendChild(licznik);

  const nastepne = cwEl("div", "cw-cel");
  const serie = cwSerie(b.id);
  const cw = znajdzCwiczenie(b.id);
  nastepne.textContent = "Następnie: " + cw.nazwa + " · seria " + (b.nr + 1) + " z " + serie.length + " (" + cwOpisSerii(serie[Math.min(b.nr, serie.length - 1)], cw) + ")";
  cwTresc.appendChild(nastepne);

  const rzad = cwEl("div", "cw-dol");
  const zmien = function (ile) {
    cwPrzerwaDo += ile * 1000;
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
}

function cwRysujKoniec() {
  cwTytul.textContent = "Koniec sesji";
  cwPasek.style.width = "100%";
  const ids = cwIds();
  const zrobione = ids.filter(cwWykonane);
  cwTresc.appendChild(cwEl("h2", "cw-nazwa", "Sesja zakończona 🎉"));
  cwTresc.appendChild(cwEl("div", "cw-plan", "Zrobione ćwiczenia: " + zrobione.length + " z " + ids.length));
  zrobione.forEach(function (id) {
    const cw = znajdzCwiczenie(id);
    const wiersz = cwEl("div", "cw-podsumowanie");
    wiersz.appendChild(cwEl("div", "karta-nazwa", cw.nazwa));
    wiersz.appendChild(cwEl("div", "ostatnio-info", opisIlosci(cwSesja.wykonane && cwSesja.wykonane[id] ? cwSesja.wykonane[id] : cwSesja.parametry[id])));
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
  if (cwFaza === "przerwa") {
    cwRysujPrzerwe();
  } else if (cwFaza === "koniec") {
    cwRysujKoniec();
  } else {
    cwRysujSerie();
  }
  cwOdswiezLicznik();
}

// Odświeża liczniki (przerwa albo stoper); uruchamiane co ułamek sekundy z zegara, nie z licznika kroków
function cwOdswiezLicznik() {
  if (cwFaza === "przerwa") {
    const licznik = document.getElementById("cw-licznik");
    if (!licznik) {
      return;
    }
    const zostalo = Math.ceil((cwPrzerwaDo - Date.now()) / 1000);
    if (zostalo > 0) {
      licznik.textContent = cwFormatCzasu(zostalo);
      licznik.classList.remove("gotowe");
    } else {
      licznik.textContent = "Zaczynaj!";
      licznik.classList.add("gotowe");
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
    stoper.textContent = cwFormatCzasu(uplynelo);
    stoper.classList.toggle("gotowe", uplynelo >= cel);
    if (uplynelo >= cel && !cwStoperSygnal) {
      cwStoperSygnal = true;
      cwSygnal(2);
    }
  }
}

// ===== Otwieranie i zamykanie =====

function otworzCwicz(sesja) {
  cwSesja = sesja;
  cwStoperStart = 0;
  cwFaza = cwBiezace() ? "seria" : "koniec";
  cwTlo.hidden = false;
  cwSygnal(0);
  cwZajmijEkran();
  clearInterval(cwInterwal);
  cwInterwal = setInterval(cwOdswiezLicznik, 250);
  cwRysuj();
}

function cwZamknijTryb() {
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
}

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
