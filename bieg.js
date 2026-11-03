// ===== Bieganie: stoper i ekran biegu =====
// Trwający bieg jest w localStorage (osobny klucz), więc przeżywa odświeżenie i zamknięcie karty.

const KLUCZ_BIEGU = "cwiczenia-bieg-trwa";
let biegStan = null;
let biegOdswiez = null;
let biegEkran = null;
let biegBlokada = null;
let biegSygnalCelu = false;

function biegZapiszStan() {
  try {
    if (biegStan) {
      localStorage.setItem(KLUCZ_BIEGU, JSON.stringify(biegStan));
    } else {
      localStorage.removeItem(KLUCZ_BIEGU);
    }
  } catch (e) {
    // brak zapisu nie przerywa biegu
  }
}

function biegZnajdz(st) {
  const plan = dane.plany.find(function (p) { return p.id === st.planId; });
  const sesja = plan ? plan.sesje.find(function (s) { return s.id === st.sesjaId; }) : null;
  return plan && sesja ? { plan: plan, sesja: sesja } : null;
}

function biegEkranWlaczony() {
  return dane.ustawienia.biegEkran !== false;
}

function biegZajmijEkran() {
  if (!biegEkranWlaczony() || !navigator.wakeLock || biegBlokada) {
    return;
  }
  navigator.wakeLock.request("screen").then(function (b) {
    biegBlokada = b;
    b.addEventListener("release", function () { biegBlokada = null; });
  }).catch(function () { biegBlokada = null; });
}

function biegZwolnijEkran() {
  if (biegBlokada) {
    biegBlokada.release();
    biegBlokada = null;
  }
}

document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "visible" && biegStan) {
    biegZajmijEkran();
    biegRysujCzas();
  }
});

// Start biegu z karty Dziś
function biegStart(plan, sesja) {
  if (typeof cwSygnal === "function") {
    cwSygnal(0);
  }
  biegStan = biegStoperNowy(sesja.id, plan.id, Date.now());
  if (sesja.odcinki && sesja.odcinki.length) {
    biegStan.odc = { nr: 0, startMs: 0, wyniki: [] };
  }
  biegSygnalCelu = false;
  biegZapiszStan();
  biegOtworzEkran();
}

function biegOtworzEkran() {
  const z = biegZnajdz(biegStan);
  if (!z) {
    biegStan = null;
    biegZapiszStan();
    return;
  }
  biegZamknijEkran();
  biegEkran = document.createElement("div");
  biegEkran.className = "bieg-ekran";
  biegEkran.setAttribute("role", "dialog");
  biegEkran.setAttribute("aria-label", "Bieg");
  const rodzaj = biegRodzaj(z.sesja.rodzajBiegu).nazwa;
  biegEkran.appendChild(tekstElement("div", "bieg-ekran-gora", "Bieganie · " + rodzaj.toLowerCase()));
  const cel = tekstElement("div", "bieg-ekran-cel", "");
  biegEkran.appendChild(cel);
  // Bieżący odcinek (sesja z odcinkami)
  const odcBox = document.createElement("div");
  odcBox.className = "bieg-odc";
  odcBox.hidden = !biegStan.odc;
  const odcNazwa = tekstElement("div", "bieg-odc-nazwa", "");
  const odcCzas = tekstElement("div", "bieg-odc-czas", "");
  const odcNast = tekstElement("div", "bieg-odc-nast", "");
  const odcDalej = tekstElement("button", "przycisk wielki", "Odcinek zrobiony →");
  odcDalej.type = "button";
  odcDalej.hidden = true;
  odcDalej.addEventListener("click", function () {
    const z2 = biegZnajdz(biegStan);
    biegOdcinekZakoncz(biegStan, biegOdcinkiPlaskie(z2.sesja.odcinki), Date.now());
    biegZapiszStan();
    if (typeof cwSygnal === "function") {
      cwSygnal(2);
    }
    biegRysujCzas();
  });
  odcBox.appendChild(odcNazwa);
  odcBox.appendChild(odcCzas);
  odcBox.appendChild(odcNast);
  odcBox.appendChild(odcDalej);
  const czas = tekstElement("div", "bieg-ekran-czas", "0:00");
  czas.setAttribute("aria-live", "off");
  biegEkran.appendChild(czas);
  const stanTekst = tekstElement("div", "bieg-ekran-stan", "");
  biegEkran.appendChild(stanTekst);
  biegEkran.appendChild(odcBox);
  if (biegStan.odc) {
    biegEkran.classList.add("z-odcinkami");
  }
  const kafle = document.createElement("div");
  kafle.className = "bieg-ekran-kafle";
  const kDyst = document.createElement("div");
  kDyst.appendChild(tekstElement("span", "bieg-ekran-wart", "—"));
  kDyst.appendChild(tekstElement("span", "bieg-ekran-etyk", "dystans (bez GPS)"));
  const kTempo = document.createElement("div");
  kTempo.appendChild(tekstElement("span", "bieg-ekran-wart", "—"));
  kTempo.appendChild(tekstElement("span", "bieg-ekran-etyk", "tempo"));
  kafle.appendChild(kDyst);
  kafle.appendChild(kTempo);
  biegEkran.appendChild(kafle);

  const dol = document.createElement("div");
  dol.className = "bieg-ekran-dol";
  const pauza = tekstElement("button", "bieg-przycisk bieg-pauza", "Pauza");
  pauza.type = "button";
  const stop = tekstElement("button", "bieg-przycisk bieg-stop", "Stop");
  stop.type = "button";
  dol.appendChild(pauza);
  dol.appendChild(stop);
  biegEkran.appendChild(dol);

  // Potwierdzenie Stop (żeby przypadkowe dotknięcie nie kończyło biegu)
  const potw = document.createElement("div");
  potw.className = "bieg-ekran-dol";
  potw.hidden = true;
  const zakoncz = tekstElement("button", "bieg-przycisk bieg-stop", "Zakończ bieg");
  zakoncz.type = "button";
  const wroc = tekstElement("button", "bieg-przycisk bieg-pauza", "Biegnę dalej");
  wroc.type = "button";
  potw.appendChild(wroc);
  potw.appendChild(zakoncz);
  biegEkran.appendChild(potw);

  pauza.addEventListener("click", function () {
    const teraz = Date.now();
    biegStan = biegStan.stan === "trwa" ? biegStoperPauza(biegStan, teraz) : biegStoperWznow(biegStan, teraz);
    biegZapiszStan();
    biegRysujCzas();
  });
  // Stop od razu zatrzymuje czas; potwierdzenie decyduje, czy koniec, czy biegniemy dalej
  stop.addEventListener("click", function () {
    const teraz = Date.now();
    if (biegStan.stan === "trwa") {
      biegStan = biegStoperPauza(biegStan, teraz);
      biegStan.pauzaZeStopu = true;
    }
    biegStan.stopOd = teraz;
    biegZapiszStan();
    biegRysujCzas();
    dol.hidden = true;
    potw.hidden = false;
  });
  wroc.addEventListener("click", function () {
    const teraz = Date.now();
    if (biegStan.pauzaZeStopu) {
      // To nie była pauza biegacza: nie liczymy jej jako zatrzymania
      const przerwa = Math.max(0, teraz - biegStan.pauzaOd);
      biegStan = biegStoperWznow(biegStan, teraz);
      biegStan.pauzy = Math.max(0, biegStan.pauzy - 1);
      biegStan.czasPauz = Math.max(0, biegStan.czasPauz - przerwa);
    }
    delete biegStan.pauzaZeStopu;
    delete biegStan.stopOd;
    biegZapiszStan();
    biegRysujCzas();
    potw.hidden = true;
    dol.hidden = false;
  });
  zakoncz.addEventListener("click", biegStop);

  if (biegStan.stopOd) {
    dol.hidden = true;
    potw.hidden = false;
  }
  biegEkran._el = { czas: czas, cel: cel, stan: stanTekst, pauza: pauza, sesja: z.sesja, odcNazwa: odcNazwa, odcCzas: odcCzas, odcNast: odcNast, odcDalej: odcDalej };
  document.body.appendChild(biegEkran);
  biegZajmijEkran();
  biegRysujCzas();
  biegOdswiez = setInterval(biegRysujCzas, 250);
}

function biegRysujCzas() {
  if (!biegEkran || !biegStan) {
    return;
  }
  const el = biegEkran._el;
  const sek = Math.floor(biegStoperCzas(biegStan, Date.now()) / 1000);
  el.czas.textContent = biegFormatCzasu(sek);
  const pauza = biegStan.stan === "pauza";
  el.pauza.textContent = pauza ? "Wznów" : "Pauza";
  el.pauza.classList.toggle("wznow", pauza);
  el.stan.textContent = biegStan.stopOd ? "Zatrzymano – zakończyć bieg?" : pauza ? "Pauza" : "";
  biegEkran.classList.toggle("pauza", pauza);
  // Odcinki: przejście do następnego, gdy minął czas bieżącego; sygnał tylko przy zmianie
  if (biegStan.odc && el.sesja.odcinki) {
    const plaskie = biegOdcinkiPlaskie(el.sesja.odcinki);
    const zmiany = biegOdcinkiAktualizuj(biegStan, plaskie, Date.now());
    if (zmiany > 0) {
      biegZapiszStan();
      if (typeof cwSygnal === "function") {
        cwSygnal(biegStan.odc.nr >= plaskie.length ? 3 : 2);
      }
    }
    biegRysujOdcinek(el, plaskie);
    const suma = biegSumaOdcinkow(el.sesja.odcinki);
    el.cel.textContent = "Plan: " + [suma.czasS ? "≈ " + Math.round(suma.czasS / 60) + " min" : "", suma.dystansM ? biegOpisWartosci({ dystansM: suma.dystansM }) : ""].filter(Boolean).join(" + ");
    return;
  }
  const celS = biegSekundy(el.sesja.czas);
  const celM = biegMetry(el.sesja.dystans);
  if (celS) {
    const zostalo = celS - sek;
    el.cel.textContent = zostalo > 0 ? "Cel: " + biegFormatCzasu(celS) + " · zostało " + biegFormatCzasu(zostalo) : "Cel osiągnięty ✓ (" + biegFormatCzasu(celS) + ")";
    if (zostalo <= 0 && !biegSygnalCelu) {
      biegSygnalCelu = true;
      if (typeof cwSygnal === "function") {
        cwSygnal(3);
      }
    }
  } else if (celM) {
    el.cel.textContent = "Cel: " + (celM >= 1000 ? Math.round(celM / 10) / 100 + " km" : celM + " m");
  } else {
    el.cel.textContent = "";
  }
}

function biegRysujOdcinek(el, plaskie) {
  const nr = biegStan.odc.nr;
  if (nr >= plaskie.length) {
    el.odcNazwa.textContent = "Wszystkie odcinki zrobione ✓";
    el.odcCzas.textContent = "";
    el.odcNast.textContent = "Naciśnij Stop, żeby zapisać bieg.";
    el.odcDalej.hidden = true;
    return;
  }
  const o = plaskie[nr];
  const aktywne = biegStoperCzas(biegStan, Date.now());
  const wOdcinku = Math.floor((aktywne - biegStan.odc.startMs) / 1000);
  el.odcNazwa.textContent = "Odcinek " + (nr + 1) + " z " + plaskie.length + ": " + biegOpisOdcinka(o);
  if (o.czasS) {
    el.odcCzas.textContent = biegFormatCzasu(o.czasS - wOdcinku);
    el.odcDalej.hidden = true;
  } else {
    el.odcCzas.textContent = biegFormatCzasu(wOdcinku);
    el.odcDalej.hidden = false;
  }
  const nast = plaskie[nr + 1];
  let tekst = nast ? "Następnie: " + biegOpisOdcinka(nast) : "To ostatni odcinek";
  if (o.zPowt) {
    const zostalo = o.zPowt - o.powt;
    tekst += " · " + (zostalo > 0 ? "jeszcze " + zostalo + " " + (zostalo === 1 ? "powtórzenie" : zostalo < 5 ? "powtórzenia" : "powtórzeń") : "ostatnie powtórzenie");
  }
  el.odcNast.textContent = tekst;
}

function biegZamknijEkran() {
  if (biegOdswiez) {
    clearInterval(biegOdswiez);
    biegOdswiez = null;
  }
  if (biegEkran) {
    biegEkran.remove();
    biegEkran = null;
  }
  biegZwolnijEkran();
}

// Stop: pomiar trafia do szkicu wyniku w sesji (nie ginie), potem okno wyniku
function biegStop() {
  const z = biegZnajdz(biegStan);
  const koniec = biegStan.stopOd || Date.now();
  if (biegStan.pauzaZeStopu) {
    // Czas oczekiwania na potwierdzenie to nie pauza w biegu
    biegStan.pauzy = Math.max(0, biegStan.pauzy - 1);
    biegStan.pauzaOd = koniec;
  }
  const w = biegStoperWynik(biegStan, koniec);
  const st0 = biegStan;
  biegStan = null;
  biegZapiszStan();
  biegZamknijEkran();
  if (!z) {
    return;
  }
  let odcinkiWyniki = null;
  if (st0.odc && z && z.sesja.odcinki) {
    const plaskie = biegOdcinkiPlaskie(z.sesja.odcinki);
    biegOdcinkiAktualizuj(st0, plaskie, koniec);
    odcinkiWyniki = st0.odc.wyniki.map(function (r, i) {
      return Object.assign({}, plaskie[i], { czasS: r.czasS, planS: plaskie[i].czasS });
    });
    // Odcinek przerwany Stopem: zapisujemy przebiegnięty kawałek
    if (st0.odc.nr < plaskie.length) {
      const reszta = Math.round((biegStoperCzas(st0, koniec) - st0.odc.startMs) / 1000);
      if (reszta > 0) {
        odcinkiWyniki.push(Object.assign({}, plaskie[st0.odc.nr], { czasS: reszta, planS: plaskie[st0.odc.nr].czasS, przerwany: true }));
      }
    }
  }
  z.sesja.wynikSzkic = {
    odcinkiWyniki: odcinkiWyniki,
    czas: w.czasS > 0 ? { wartosc: w.czasS, jednostka: "s" } : null,
    dystans: null,
    pauzy: w.pauzy,
    czasPauzS: w.czasPauzS,
    zrodlo: "stoper",
    data: dzisISO()
  };
  zapiszDane();
  rysujDzis();
  otworzWynik(z.plan, z.sesja);
}

// Przywracanie biegu po odświeżeniu strony
(function () {
  try {
    const t = localStorage.getItem(KLUCZ_BIEGU);
    if (t) {
      biegStan = JSON.parse(t);
      if (biegStan && biegZnajdz(biegStan)) {
        setTimeout(biegOtworzEkran, 0);
      } else {
        biegStan = null;
        biegZapiszStan();
      }
    }
  } catch (e) {
    biegStan = null;
  }
})();

// ===== Edytor odcinków (edycja sesji biegowej) =====

// "5:30" → 330 s/km; puste → null
function biegCzytajTempo(t) {
  const m = /^\s*(\d{1,2})[:.,](\d{2})\s*$/.exec(t || "");
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

function biegTempoTekst(s) {
  return s ? Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0") : "";
}

// Edytor listy odcinków. Zwraca { blok, odczytaj(), ustaw(odcinki) }. poZmianie(lista) przy każdej zmianie.
function biegEdytorOdcinkow(poczatkowe, poZmianie, przySzablonie) {
  let lista = JSON.parse(JSON.stringify(poczatkowe || []));
  const blok = document.createElement("div");
  blok.className = "odc-edytor";

  function wartoscPola(o) {
    if (o.czasS) {
      return o.czasS % 60 === 0 ? { v: o.czasS / 60, j: "min" } : { v: o.czasS, j: "s" };
    }
    if (o.dystansM) {
      return o.dystansM >= 1000 && o.dystansM % 100 === 0 ? { v: o.dystansM / 1000, j: "km" } : { v: o.dystansM, j: "m" };
    }
    return { v: "", j: "min" };
  }

  function ustawWartosc(o, v, j) {
    o.czasS = null;
    o.dystansM = null;
    if (!(v > 0)) {
      return;
    }
    if (j === "min") { o.czasS = Math.round(v * 60); }
    if (j === "s") { o.czasS = Math.round(v); }
    if (j === "km") { o.dystansM = Math.round(v * 1000); }
    if (j === "m") { o.dystansM = Math.round(v); }
  }

  function przycisk(tekst, etykieta, akcja) {
    const b = tekstElement("button", "odc-maly", tekst);
    b.type = "button";
    b.setAttribute("aria-label", etykieta);
    b.addEventListener("click", akcja);
    return b;
  }

  function przesun(tab, i, k) {
    const j = i + k;
    if (j < 0 || j >= tab.length) {
      return;
    }
    const t = tab[i];
    tab[i] = tab[j];
    tab[j] = t;
    rysuj();
  }

  function wierszOdcinka(o, tab, i, wGrupie) {
    const w = document.createElement("div");
    w.className = "odc-wiersz";
    const gora = document.createElement("div");
    gora.className = "odc-gora";
    const rodz = document.createElement("select");
    rodz.setAttribute("aria-label", "Rodzaj odcinka");
    RODZAJE_ODCINKA.forEach(function (r) {
      const op = document.createElement("option");
      op.value = r.id;
      op.textContent = r.nazwa;
      rodz.appendChild(op);
    });
    rodz.value = o.rodzaj || "bieg";
    const wp = wartoscPola(o);
    const pole = document.createElement("input");
    pole.type = "number";
    pole.min = "0";
    pole.step = "any";
    pole.inputMode = "decimal";
    pole.value = wp.v;
    pole.placeholder = "ile";
    pole.setAttribute("aria-label", "Wartość odcinka");
    const jedn = document.createElement("select");
    jedn.setAttribute("aria-label", "Jednostka");
    [["min", "min"], ["s", "s"], ["km", "km"], ["m", "m"]].forEach(function (x) {
      const op = document.createElement("option");
      op.value = x[0];
      op.textContent = x[1];
      jedn.appendChild(op);
    });
    jedn.value = wp.j;
    const zmien = function () {
      o.rodzaj = rodz.value;
      ustawWartosc(o, Number(pole.value), jedn.value);
      zmiana();
    };
    rodz.addEventListener("change", zmien);
    pole.addEventListener("input", zmien);
    jedn.addEventListener("change", zmien);
    gora.appendChild(rodz);
    gora.appendChild(pole);
    gora.appendChild(jedn);
    w.appendChild(gora);
    const dolny = document.createElement("div");
    dolny.className = "odc-dol";
    const tempo = document.createElement("input");
    tempo.type = "text";
    tempo.className = "odc-tempo";
    tempo.inputMode = "decimal";
    tempo.placeholder = "tempo np. 5:30 (opcj.)";
    tempo.value = biegTempoTekst(o.tempoS);
    tempo.addEventListener("input", function () {
      o.tempoS = biegCzytajTempo(tempo.value);
      zmiana();
    });
    dolny.appendChild(tempo);
    if (!wGrupie) {
      dolny.appendChild(przycisk("↑", "Wyżej", function () { przesun(tab, i, -1); }));
      dolny.appendChild(przycisk("↓", "Niżej", function () { przesun(tab, i, 1); }));
    }
    dolny.appendChild(przycisk("✕", "Usuń odcinek", function () { tab.splice(i, 1); rysuj(); }));
    w.appendChild(dolny);
    return w;
  }

  function rysuj() {
    blok.innerHTML = "";
    const naglowek = tekstElement("label", "", "Odcinki (opcjonalnie)");
    blok.appendChild(naglowek);
    if (lista.length) {
      blok.appendChild(tekstElement("p", "opis", "Łączny czas i dystans liczą się z odcinków. Odcinki na dystans kończysz na ekranie biegu przyciskiem (do czasu GPS)."));
    }
    lista.forEach(function (e, i) {
      if (e.powtorz) {
        const g = document.createElement("div");
        g.className = "odc-grupa";
        const gg = document.createElement("div");
        gg.className = "odc-gora";
        gg.appendChild(tekstElement("span", "", "Powtórz"));
        const ile = document.createElement("input");
        ile.type = "number";
        ile.min = "1";
        ile.inputMode = "numeric";
        ile.value = e.powtorz;
        ile.className = "odc-ile";
        ile.setAttribute("aria-label", "Ile powtórzeń");
        ile.addEventListener("input", function () {
          e.powtorz = Math.max(1, Math.round(Number(ile.value) || 1));
          zmiana();
        });
        gg.appendChild(ile);
        gg.appendChild(tekstElement("span", "", "razy"));
        gg.appendChild(przycisk("↑", "Wyżej", function () { przesun(lista, i, -1); }));
        gg.appendChild(przycisk("↓", "Niżej", function () { przesun(lista, i, 1); }));
        gg.appendChild(przycisk("✕", "Usuń powtórzenie", function () { lista.splice(i, 1); rysuj(); }));
        g.appendChild(gg);
        e.odcinki.forEach(function (o, j) {
          g.appendChild(wierszOdcinka(o, e.odcinki, j, true));
        });
        const dod = tekstElement("button", "akcja", "+ odcinek w powtórzeniu");
        dod.type = "button";
        dod.addEventListener("click", function () {
          e.odcinki.push({ rodzaj: "wolno", czasS: 60 });
          rysuj();
        });
        g.appendChild(dod);
        blok.appendChild(g);
      } else {
        blok.appendChild(wierszOdcinka(e, lista, i, false));
      }
    });
    const akcje = document.createElement("div");
    akcje.className = "odc-akcje";
    const dodaj = tekstElement("button", "akcja", "+ Dodaj odcinek");
    dodaj.type = "button";
    dodaj.addEventListener("click", function () {
      lista.push({ rodzaj: lista.length ? "bieg" : "rozgrzewka", czasS: lista.length ? 300 : 600 });
      rysuj();
    });
    const powt = tekstElement("button", "akcja", "+ Powtórzenie");
    powt.type = "button";
    powt.addEventListener("click", function () {
      lista.push({ powtorz: 6, odcinki: [{ rodzaj: "szybko", czasS: 60 }, { rodzaj: "wolno", czasS: 60 }] });
      rysuj();
    });
    akcje.appendChild(dodaj);
    akcje.appendChild(powt);
    const szablon = document.createElement("select");
    szablon.setAttribute("aria-label", "Gotowy szablon");
    const pierwsza = document.createElement("option");
    pierwsza.value = "";
    pierwsza.textContent = "Gotowy szablon…";
    szablon.appendChild(pierwsza);
    SZABLONY_ODCINKOW.forEach(function (s) {
      const op = document.createElement("option");
      op.value = s.id;
      op.textContent = s.nazwa;
      szablon.appendChild(op);
    });
    szablon.addEventListener("change", function () {
      const s = SZABLONY_ODCINKOW.find(function (x) { return x.id === szablon.value; });
      if (!s) {
        return;
      }
      if (lista.length && !confirm("Zastąpić obecne odcinki szablonem „" + s.nazwa + "”?")) {
        szablon.value = "";
        return;
      }
      lista = JSON.parse(JSON.stringify(s.odcinki));
      if (przySzablonie) {
        przySzablonie(s);
      }
      rysuj();
    });
    akcje.appendChild(szablon);
    blok.appendChild(akcje);
    const suma = biegSumaOdcinkow(lista);
    if (lista.length) {
      blok.appendChild(tekstElement("p", "bieg-tempo", "Łącznie: " + [suma.czasS ? "≈ " + Math.round(suma.czasS / 60) + " min" : "", suma.dystansM ? biegOpisWartosci({ dystansM: suma.dystansM }) : ""].filter(Boolean).join(" + ")));
    }
    if (poZmianie) {
      poZmianie(lista);
    }
  }

  function zmiana() {
    const s = blok.querySelector(":scope > .bieg-tempo");
    if (s) {
      const suma = biegSumaOdcinkow(lista);
      s.textContent = "Łącznie: " + [suma.czasS ? "≈ " + Math.round(suma.czasS / 60) + " min" : "", suma.dystansM ? biegOpisWartosci({ dystansM: suma.dystansM }) : ""].filter(Boolean).join(" + ");
    }
  }

  rysuj();
  return {
    blok: blok,
    odczytaj: function () {
      // Puste odcinki (bez czasu i dystansu) i puste grupy odpadają
      return lista.map(function (e) {
        if (e.powtorz) {
          const w = e.odcinki.filter(function (o) { return o.czasS || o.dystansM; });
          return w.length ? { powtorz: e.powtorz, odcinki: w } : null;
        }
        return e.czasS || e.dystansM ? e : null;
      }).filter(Boolean);
    }
  };
}
