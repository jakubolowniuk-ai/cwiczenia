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
  const czas = tekstElement("div", "bieg-ekran-czas", "0:00");
  czas.setAttribute("aria-live", "off");
  biegEkran.appendChild(czas);
  const stanTekst = tekstElement("div", "bieg-ekran-stan", "");
  biegEkran.appendChild(stanTekst);
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
  biegEkran._el = { czas: czas, cel: cel, stan: stanTekst, pauza: pauza, sesja: z.sesja };
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
  biegStan = null;
  biegZapiszStan();
  biegZamknijEkran();
  if (!z) {
    return;
  }
  z.sesja.wynikSzkic = {
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
