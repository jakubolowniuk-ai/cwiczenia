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
  // Pierwszy Start: najpierw pytamy, czy mierzyć GPS (zgodę systemową przeglądarka poprosi przy włączeniu pomiaru)
  if (dane.ustawienia.biegGps === undefined && gpsDostepny()) {
    gpsZapytajOZgode(function () { biegStart(plan, sesja); });
    return;
  }
  if (typeof cwSygnal === "function") {
    cwSygnal(0);
  }
  biegStan = biegStoperNowy(sesja.id, plan.id, Date.now());
  if (gpsWlaczony()) {
    biegStan.gps = true;
    biegStan.trasaId = gpsNowyId();
    biegStan.gpsSeg = 0;
  }
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
  const kDystWart = tekstElement("span", "bieg-ekran-wart", "—");
  const kDystEtyk = tekstElement("span", "bieg-ekran-etyk", "dystans (bez GPS)");
  kDyst.appendChild(kDystWart);
  kDyst.appendChild(kDystEtyk);
  const kTempo = document.createElement("div");
  const kTempoWart = tekstElement("span", "bieg-ekran-wart", "—");
  const kTempoEtyk = tekstElement("span", "bieg-ekran-etyk", "tempo");
  kTempo.appendChild(kTempoWart);
  kTempo.appendChild(kTempoEtyk);
  kafle.appendChild(kDyst);
  kafle.appendChild(kTempo);
  biegEkran.appendChild(kafle);
  const gpsEl = gpsZbudujEkran(biegEkran, { dystWart: kDystWart, dystEtyk: kDystEtyk, tempoWart: kTempoWart, tempoEtyk: kTempoEtyk });

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
    if (biegStan.stan !== "trwa") {
      gpsNowySegment();
    }
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
      gpsNowySegment();
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
  biegEkran._el = { czas: czas, cel: cel, stan: stanTekst, pauza: pauza, sesja: z.sesja, odcNazwa: odcNazwa, odcCzas: odcCzas, odcNast: odcNast, odcDalej: odcDalej, gps: gpsEl };
  document.body.appendChild(biegEkran);
  biegZajmijEkran();
  if (biegStan.gps && gpsNasluch === null) {
    gpsStartPomiaru();
  }
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
  biegRysujGps();
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
  const g = gpsDoSzkicu(st0);
  z.sesja.wynikSzkic = {
    odcinkiWyniki: odcinkiWyniki,
    czas: w.czasS > 0 ? { wartosc: w.czasS, jednostka: "s" } : null,
    dystans: g && g.dystans ? g.dystans : null,
    pauzy: w.pauzy,
    czasPauzS: w.czasPauzS,
    zrodlo: g && g.dystans ? "gps" : "stoper",
    data: dzisISO()
  };
  if (g && g.trasaId) {
    z.sesja.wynikSzkic.trasaId = g.trasaId;
    z.sesja.wynikSzkic.gps = g.gps;
  } else if (g && g.brak) {
    z.sesja.wynikSzkic.gps = { brak: true };
  }
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

// ===== Poziom szczegółów i statystyki biegania =====

function biegPoziomUst() {
  return dane.ustawienia.biegPoziom === "zaawansowany" ? "zaawansowany" : "poczatkujacy";
}

function biegSerieWlaczone() {
  return dane.ustawienia.biegSerie !== false;
}

// Wszystkie zapisane biegi ze wszystkich planów
function biegZbierzBiegi() {
  const lista = [];
  dane.plany.forEach(function (plan) {
    plan.sesje.forEach(function (s) {
      const a = plan.aktywnosci.find(function (x) { return x.id === s.aktywnoscId; });
      if (!a || a.rodzajId !== "rodzaj-bieganie" || !s.wynik) {
        return;
      }
      lista.push({
        data: s.dataWykonania || dataPlanu(plan, s.dzien).toISOString().slice(0, 10),
        czasS: biegSekundy(s.wynik.czas),
        dystansM: biegMetry(s.wynik.dystans),
        rodzajBiegu: s.rodzajBiegu || "spokojny",
        wysilek: typeof s.wynik.wysilek === "number" ? s.wynik.wysilek : null,
        pauzy: s.wynik.pauzy || 0,
        zrodlo: s.wynik.zrodlo || "reczny",
        obciazenie: s.wynik.obciazenie || null,
        odcinkiWyniki: s.wynik.odcinkiWyniki || null,
        trasaId: s.wynik.trasaId || null,
        gps: s.wynik.gps || null,
        sesja: s,
        plan: nazwaPlanu(plan)
      });
    });
  });
  return lista.sort(function (a, b) { return a.data < b.data ? 1 : a.data > b.data ? -1 : 0; });
}

function biegKm(m) {
  return String(Math.round(m / 10) / 100).replace(".", ",") + " km";
}

function biegCzasDlugi(s) {
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return h > 0 ? h + " h " + m + " min" : m + " min";
}

function biegDataPL(iso) {
  const c = iso.split("-");
  return Number(c[2]) + "." + c[1];
}

// Wykres słupkowy ostatnich tygodni (SVG): czas w minutach albo dystans w km
function biegWykres(tygodnie, miara) {
  const sz = 320;
  const wys = 150;
  const n = tygodnie.length;
  const wart = tygodnie.map(function (t) { return miara === "dystans" ? t.dystansM / 1000 : t.czasS / 60; });
  const max = Math.max.apply(null, wart.concat([miara === "dystans" ? 5 : 30]));
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 " + sz + " " + (wys + 34));
  svg.setAttribute("class", "bieg-wykres");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", (miara === "dystans" ? "Dystans" : "Czas biegu") + " w ostatnich " + n + " tygodniach");
  const szer = sz / n;
  wart.forEach(function (v, i) {
    const h = v > 0 ? Math.max(3, Math.round(v / max * (wys - 18))) : 0;
    const x = i * szer + szer * 0.18;
    const r = document.createElementNS(ns, "rect");
    r.setAttribute("x", x);
    r.setAttribute("y", wys - h);
    r.setAttribute("width", szer * 0.64);
    r.setAttribute("height", h);
    r.setAttribute("rx", 3);
    r.setAttribute("class", i === n - 1 ? "slupek teraz" : "slupek");
    svg.appendChild(r);
    if (v > 0) {
      const t = document.createElementNS(ns, "text");
      t.setAttribute("x", x + szer * 0.32);
      t.setAttribute("y", wys - h - 4);
      t.setAttribute("class", "wartosc");
      t.textContent = miara === "dystans" ? String(Math.round(v * 10) / 10).replace(".", ",") : Math.round(v);
      svg.appendChild(t);
    }
    const e = document.createElementNS(ns, "text");
    e.setAttribute("x", x + szer * 0.32);
    e.setAttribute("y", wys + 16);
    e.setAttribute("class", "etykieta");
    e.textContent = biegDataPL(tygodnie[i].tydzien);
    svg.appendChild(e);
  });
  return svg;
}

let biegMiaraWykresu = "czas";

function biegKartaPostepu() {
  const biegi = biegZbierzBiegi();
  if (!biegi.length) {
    return null;
  }
  const zaaw = biegPoziomUst() === "zaawansowany";
  const dzis = dzisISO();
  const karta = document.createElement("div");
  karta.className = "pp-karta bieg-karta";
  karta.appendChild(tekstElement("div", "pp-naglowek", "Bieganie"));

  const tyg = biegOstatnieTygodnie(biegi, dzis, 8);
  const ten = tyg[tyg.length - 1];
  const czesci = [ten.biegow + " " + (ten.biegow === 1 ? "bieg" : ten.biegow > 1 && ten.biegow < 5 ? "biegi" : "biegów"), biegCzasDlugi(ten.czasS)];
  if (ten.dystansM) {
    czesci.push(biegKm(ten.dystansM));
  }
  if (zaaw && ten.dystansM && ten.czasZDystansemS) {
    czesci.push("śr. " + biegOpisTempa(ten.czasZDystansemS / (ten.dystansM / 1000)));
  }
  karta.appendChild(tekstElement("div", "bieg-tydzien", "Ten tydzień: " + czesci.join(" · ")));

  // Wykres: początkujący – minuty; zaawansowany – przełącznik czas / dystans
  const miara = zaaw ? biegMiaraWykresu : "czas";
  if (zaaw) {
    const chipy = document.createElement("div");
    chipy.className = "chipy bieg-chipy";
    [["czas", "Czas"], ["dystans", "Dystans"]].forEach(function (m) {
      const c = tekstElement("button", "chip" + (miara === m[0] ? " aktywny" : ""), m[1]);
      c.type = "button";
      c.addEventListener("click", function () {
        biegMiaraWykresu = m[0];
        rysujPostep();
      });
      chipy.appendChild(c);
    });
    karta.appendChild(chipy);
  }
  karta.appendChild(tekstElement("div", "opis", miara === "dystans" ? "Kilometry w tygodniu (tylko biegi z dystansem)" : "Minuty biegu w tygodniu"));
  karta.appendChild(biegWykres(tyg, miara));

  if (biegSerieWlaczone()) {
    const seria = biegSeriaTygodni(biegi, dzis);
    if (seria.najdluzsza > 0) {
      karta.appendChild(tekstElement("div", "bieg-seria", "Seria: " + seria.biezaca + " " + (seria.biezaca === 1 ? "tydzień" : "tyg.") + " z biegiem z rzędu" + (seria.najdluzsza > seria.biezaca ? " (najdłuższa: " + seria.najdluzsza + ")" : "")));
    }
    if (zaaw) {
      const r = biegRekordy(biegi);
      const lista = [];
      if (r.najdluzszyDystans) {
        lista.push(["Najdłuższy dystans", biegKm(r.najdluzszyDystans.dystansM) + " · " + biegDataPL(r.najdluzszyDystans.data)]);
      }
      if (r.najdluzszyCzas) {
        lista.push(["Najdłuższy bieg", biegCzasDlugi(r.najdluzszyCzas.czasS) + " · " + biegDataPL(r.najdluzszyCzas.data)]);
      }
      BIEG_DYSTANSE_REKORDOW.forEach(function (d) {
        const x = r.najszybsze[d[0]];
        if (x) {
          lista.push(["Najszybsze " + d[1], biegFormatCzasu(x.czasS) + " · " + biegDataPL(x.data)]);
        }
      });
      if (lista.length) {
        karta.appendChild(tekstElement("div", "pp-naglowek bieg-rek-nagl", "Rekordy"));
        lista.forEach(function (x) {
          const w = document.createElement("div");
          w.className = "bieg-rek";
          w.appendChild(tekstElement("span", "", x[0]));
          w.appendChild(tekstElement("b", "", x[1]));
          karta.appendChild(w);
        });
        karta.appendChild(tekstElement("p", "opis", "Najszybsze czasy liczą się z biegów o tym dystansie (±3%)."));
      }
    }
  }

  const hist = tekstElement("button", "przycisk drugi", "Historia biegów (" + biegi.length + ")");
  hist.type = "button";
  hist.addEventListener("click", function () { biegOtworzHistorie(); });
  karta.appendChild(hist);
  return karta;
}

function biegOpisBiegu(b, zaaw) {
  const c = [];
  if (b.dystansM) { c.push(biegKm(b.dystansM)); }
  if (b.czasS) { c.push(biegFormatCzasu(b.czasS)); }
  if (zaaw && b.dystansM && b.czasS) { c.push(biegOpisTempa(b.czasS / (b.dystansM / 1000))); }
  if (b.wysilek) { c.push("wysiłek " + b.wysilek + "/10"); }
  return c.join(" · ");
}

function biegOtworzHistorie() {
  const biegi = biegZbierzBiegi();
  const zaaw = biegPoziomUst() === "zaawansowany";
  pokazOkno("Historia biegów", biegi.length + " " + (biegi.length === 1 ? "bieg" : "biegów"));
  biegi.forEach(function (b) {
    const w = document.createElement("button");
    w.type = "button";
    w.className = "bieg-hist-wiersz";
    w.appendChild(tekstElement("div", "bieg-hist-gora", biegDataPL(b.data) + "." + b.data.slice(0, 4) + " · " + biegRodzaj(b.rodzajBiegu).nazwa));
    w.appendChild(tekstElement("div", "opis", biegOpisBiegu(b, zaaw) || "bez czasu i dystansu"));
    w.addEventListener("click", function () { biegOtworzSzczegoly(b); });
    postepOknoTresc.appendChild(w);
  });
}

function biegOtworzSzczegoly(b) {
  const zaaw = biegPoziomUst() === "zaawansowany";
  pokazOkno(biegRodzaj(b.rodzajBiegu).nazwa + " · " + biegDataPL(b.data) + "." + b.data.slice(0, 4), b.plan);
  const wstecz = tekstElement("button", "akcja", "← Historia biegów");
  wstecz.type = "button";
  wstecz.addEventListener("click", biegOtworzHistorie);
  postepOknoTresc.appendChild(wstecz);
  const pola = [
    ["Czas", b.czasS ? biegFormatCzasu(b.czasS) : "—"],
    ["Dystans", b.dystansM ? biegKm(b.dystansM) : "nie wpisano"],
    ["Tempo", b.dystansM && b.czasS ? biegOpisTempa(b.czasS / (b.dystansM / 1000)) : "—"],
    ["Wysiłek", b.wysilek ? b.wysilek + "/10 – " + OPISY_WYSILKU[b.wysilek] : "—"],
    ["Pauzy", String(b.pauzy || 0)],
    ["Źródło", { reczny: "wpis ręczny", stoper: "stoper", gps: "GPS" }[b.zrodlo] || b.zrodlo]
  ];
  if (zaaw && b.obciazenie) {
    pola.push(["Obciążenie", b.obciazenie + " kg"]);
  }
  const karta = document.createElement("div");
  karta.className = "pp-karta";
  pola.forEach(function (x) {
    const w = document.createElement("div");
    w.className = "bieg-rek";
    w.appendChild(tekstElement("span", "", x[0]));
    w.appendChild(tekstElement("b", "", x[1]));
    karta.appendChild(w);
  });
  postepOknoTresc.appendChild(karta);
  if (b.trasaId) {
    const info = tekstElement("p", "opis", b.gps && b.gps.slaby ? "Sygnał GPS był słaby na części trasy, dystans mógł wyjść za mały." : "");
    postepOknoTresc.appendChild(info);
    const gpx = tekstElement("button", "przycisk", "Pobierz trasę (GPX)");
    gpx.type = "button";
    gpx.addEventListener("click", function () { gpsPobierzGpx(b); });
    postepOknoTresc.appendChild(gpx);
    const przelicz = tekstElement("button", "przycisk drugi", "Przelicz dystans z zapisanej trasy");
    przelicz.type = "button";
    przelicz.addEventListener("click", function () {
      gpsPrzeliczBieg(b.sesja).then(function (r) {
        if (!r) {
          info.textContent = "Nie znalazłem zapisanej trasy w tym telefonie.";
          return;
        }
        info.textContent = r.stare === null ? "Dystans: " + biegKm(r.nowe) + "." : "Było " + biegKm(r.stare) + ", jest " + biegKm(r.nowe) + ".";
        b.dystansM = r.nowe;
      });
    });
    postepOknoTresc.appendChild(przelicz);
  }
  if (b.odcinkiWyniki && b.odcinkiWyniki.length) {
    const k2 = document.createElement("div");
    k2.className = "pp-karta";
    k2.appendChild(tekstElement("div", "pp-naglowek", "Odcinki"));
    b.odcinkiWyniki.forEach(function (o) {
      const w = document.createElement("div");
      w.className = "bieg-rek";
      w.appendChild(tekstElement("span", "", (o.powt ? o.powt + "/" + o.zPowt + " " : "") + biegNazwaOdcinka(o.rodzaj) + (o.dystansM ? " " + biegOpisWartosci({ dystansM: o.dystansM }) : "") + (o.przerwany ? " (przerwany)" : "")));
      w.appendChild(tekstElement("b", "", biegFormatCzasu(o.czasS || 0)));
      k2.appendChild(w);
    });
    postepOknoTresc.appendChild(k2);
  }
}

// ===== Ustawienia: poziom biegania, serie i rekordy =====

function biegRysujUstawienia() {
  const p = document.getElementById("ust-bieg-poziom");
  if (!p) {
    return;
  }
  p.querySelectorAll("button").forEach(function (b) {
    b.classList.toggle("aktywny", b.dataset.poziom === biegPoziomUst());
  });
  const s = document.getElementById("ust-bieg-serie");
  s.setAttribute("aria-checked", biegSerieWlaczone() ? "true" : "false");
  s.classList.toggle("wlaczony", biegSerieWlaczone());
  const g = document.getElementById("ust-bieg-gps");
  if (g) {
    const wl = dane.ustawienia.biegGps === true;
    g.setAttribute("aria-checked", wl ? "true" : "false");
    g.classList.toggle("wlaczony", wl);
  }
}

(function () {
  const p = document.getElementById("ust-bieg-poziom");
  if (p) {
    p.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () {
        dane.ustawienia.biegPoziom = b.dataset.poziom;
        zapiszDane();
        biegRysujUstawienia();
      });
    });
  }
  const s = document.getElementById("ust-bieg-serie");
  if (s) {
    s.addEventListener("click", function () {
      dane.ustawienia.biegSerie = dane.ustawienia.biegSerie === false;
      zapiszDane();
      biegRysujUstawienia();
    });
  }
})();
