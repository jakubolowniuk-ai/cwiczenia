// ===== Ekran Dziś: sesje na dzisiaj, odhaczanie ćwiczeń, wynik biegania i basenu =====
// Aktywny plan to ostatni zapisany plan, którego nie zamknięto (dane.plany).
// Postęp sesji trzymamy w samej sesji planu:
//   sesja.zrobione = { idĆwiczenia: true }   (trening ciała, rozciąganie, trening statyczny)
//   sesja.wynik    = { dystans, czas, styl, dlugosci }   (bieganie, basen; wpisany po sesji)
// Sesja jest zaliczona dopiero, gdy zrobiono WSZYSTKIE ćwiczenia treningu albo wpisano wynik.

// ===== Elementy strony =====

const dzisBrakPlanu = document.getElementById("dzis-brak-planu");
const dzisPlan = document.getElementById("dzis-plan");
const dzisData = document.getElementById("dzis-data");
const dzisSesje = document.getElementById("dzis-sesje");
const dzisPodsumowanie = document.getElementById("dzis-podsumowanie");

const wynikTlo = document.getElementById("wynik-tlo");
const wynikTytul = document.getElementById("wynik-tytul");
const wynikPola = document.getElementById("wynik-pola");
const wynikBlad = document.getElementById("wynik-blad");
const wynikZapisz = document.getElementById("wynik-zapisz");
const wynikAnuluj = document.getElementById("wynik-anuluj");

const MIESIACE_DOPELNIACZ = [
  "stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca",
  "lipca", "sierpnia", "września", "października", "listopada", "grudnia"
];

// Sesja, której wynik teraz wpisujemy, i odczyt pól formularza wyniku
let wynikSesja = null;
let wynikOdczyt = null;

// ===== Pomocnicze =====

// Aktywny plan: ostatni niezamknięty
function aktywnyPlan() {
  for (let i = dane.plany.length - 1; i >= 0; i--) {
    if (!dane.plany[i].zamkniety) {
      return dane.plany[i];
    }
  }
  return null;
}

function aktywnoscPlanu(plan, id) {
  return plan.aktywnosci.find(function (a) {
    return a.id === id;
  });
}

function dataPlanu(plan, indeks) {
  const d = new Date(plan.start + "T12:00:00");
  d.setDate(d.getDate() + indeks);
  return d;
}

// Który dzień planu to dzisiaj (0 = pierwszy dzień; ujemny = plan jeszcze się nie zaczął)
function dzisiejszyDzienPlanu(plan) {
  const dzis = new Date(dzisISO() + "T12:00:00");
  const start = new Date(plan.start + "T12:00:00");
  return Math.round((dzis - start) / 86400000);
}

function numerSesjiWPlanie(plan, sesja) {
  const wszystkie = plan.sesje.filter(function (s) {
    return s.aktywnoscId === sesja.aktywnoscId;
  }).sort(function (a, b) {
    return a.dzien - b.dzien || (a.id < b.id ? -1 : 1);
  });
  return wszystkie.indexOf(sesja) + 1;
}

// Id ćwiczeń sesji, w kolejności treningu (tylko te, które mają parametry i nadal istnieją w bazie)
function cwiczeniaSesjiIds(sesja) {
  const parametry = sesja.parametry || {};
  const trening = znajdzTrening(sesja.treningId);
  const ids = trening ? trening.cwiczeniaIds.slice() : [];
  Object.keys(parametry).forEach(function (id) {
    if (ids.indexOf(id) === -1) {
      ids.push(id);
    }
  });
  return ids.filter(function (id) {
    return parametry[id] && znajdzCwiczenie(id);
  });
}

function liczbaZrobionych(sesja) {
  const zrobione = sesja.zrobione || {};
  return cwiczeniaSesjiIds(sesja).filter(function (id) {
    return zrobione[id];
  }).length;
}

// Czy sesja jest zaliczona
function sesjaZaliczona(plan, sesja) {
  const aktywnosc = aktywnoscPlanu(plan, sesja.aktywnoscId);
  if (!aktywnosc) {
    return false;
  }
  if (!wymagaTreningu(aktywnosc)) {
    return !!sesja.wynik;
  }
  const wszystkie = cwiczeniaSesjiIds(sesja).length;
  return wszystkie > 0 && liczbaZrobionych(sesja) === wszystkie;
}

// Opis celu albo wyniku biegania i basenu, np. "Kraul · 20 długości" albo "5 km · 30 min"
function opisCeluSesji(dane_) {
  const czesci = [];
  if (dane_.styl) {
    czesci.push(dane_.styl);
  }
  if (dane_.dlugosci) {
    czesci.push(dane_.dlugosci + " " + (dane_.dlugosci === 1 ? "długość" : "długości"));
  }
  if (dane_.dystans) {
    czesci.push(dane_.dystans.wartosc + " " + dane_.dystans.jednostka);
  }
  if (dane_.czas) {
    czesci.push(dane_.czas.wartosc + " " + dane_.czas.jednostka);
  }
  return czesci.join(" · ");
}

function tekstElement(tag, klasa, tekst) {
  const el = document.createElement(tag);
  if (klasa) {
    el.className = klasa;
  }
  el.textContent = tekst;
  return el;
}

// ===== Rysowanie ekranu =====

function rysujDzis() {
  const plan = aktywnyPlan();
  dzisBrakPlanu.hidden = !!plan;
  dzisPlan.hidden = !plan;
  if (!plan) {
    return;
  }

  const dzis = new Date();
  const nazwyDni = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];
  dzisData.textContent = nazwyDni[dzis.getDay()] + ", " + dzis.getDate() + " " + MIESIACE_DOPELNIACZ[dzis.getMonth()];

  dzisSesje.innerHTML = "";
  dzisPodsumowanie.textContent = "";

  const indeks = dzisiejszyDzienPlanu(plan);
  const liczbaDni = DNI_W_OKRESIE[plan.okres];

  if (indeks < 0) {
    dzisSesje.appendChild(zrobPustyKomunikat("Plan jeszcze się nie zaczął", "Zaczyna się " + dataPlanu(plan, 0).getDate() + " " + MIESIACE_DOPELNIACZ[dataPlanu(plan, 0).getMonth()] + "."));
    return;
  }

  if (indeks >= liczbaDni) {
    rysujKoniecPlanu(plan);
    return;
  }

  const sesjeDzis = plan.sesje.filter(function (s) {
    return s.dzien === indeks;
  });

  if (sesjeDzis.length === 0) {
    const nastepna = plan.sesje.filter(function (s) {
      return s.dzien > indeks;
    }).sort(function (a, b) {
      return a.dzien - b.dzien;
    })[0];

    let opis = "To dzień odpoczynku. Alarm dzisiaj nie zadzwoni.";
    if (nastepna) {
      const data = dataPlanu(plan, nastepna.dzien);
      const aktywnosc = aktywnoscPlanu(plan, nastepna.aktywnoscId);
      opis += " Następna sesja: " + nazwyDni[data.getDay()] + " " + data.getDate() + "." + (data.getMonth() + 1) + ", " + opisAktywnosci(aktywnosc).tytul + ".";
    }
    dzisSesje.appendChild(zrobPustyKomunikat("Dziś odpoczywasz", opis));
  } else {
    sesjeDzis.forEach(function (sesja) {
      dzisSesje.appendChild(zrobKarteDzis(plan, sesja));
    });
  }

  // Podsumowanie całego planu
  const zaliczone = plan.sesje.filter(function (s) {
    return sesjaZaliczona(plan, s);
  }).length;
  dzisPodsumowanie.textContent = "Plan: zaliczone sesje " + zaliczone + " z " + plan.sesje.length + ". Dzień " + (indeks + 1) + " z " + liczbaDni + ".";
}

function zrobPustyKomunikat(tytul, opis) {
  const blok = document.createElement("div");
  blok.className = "pusty-stan";
  blok.appendChild(tekstElement("div", "pusty-tytul", tytul));
  blok.appendChild(tekstElement("p", "opis", opis));
  return blok;
}

function zrobKarteDzis(plan, sesja) {
  const aktywnosc = aktywnoscPlanu(plan, sesja.aktywnoscId);
  const karta = document.createElement("div");
  karta.className = "dzis-karta";
  if (!aktywnosc) {
    return karta;
  }
  karta.style.borderLeftColor = aktywnosc.kolor || "#0B6B5F";

  const zaliczona = sesjaZaliczona(plan, sesja);
  const naglowek = document.createElement("div");
  naglowek.className = "dzis-naglowek";
  naglowek.appendChild(tekstElement("div", "dzis-tytul", opisAktywnosci(aktywnosc).tytul + " " + numerSesjiWPlanie(plan, sesja) + " z " + aktywnosc.razy));
  naglowek.appendChild(tekstElement("div", "dzis-status" + (zaliczona ? " zaliczona" : ""), zaliczona ? "Zaliczone ✓" : ""));
  karta.appendChild(naglowek);

  if (wymagaTreningu(aktywnosc)) {
    const trening = znajdzTrening(sesja.treningId);
    if (trening) {
      karta.appendChild(tekstElement("div", "karta-opis", "Trening: " + trening.nazwa));
    }

    const ids = cwiczeniaSesjiIds(sesja);
    const zrobione = liczbaZrobionych(sesja);
    const procent = ids.length === 0 ? 0 : Math.round(zrobione * 100 / ids.length);

    const postep = document.createElement("div");
    postep.className = "dzis-postep";
    postep.appendChild(tekstElement("span", "", zrobione + " z " + ids.length + " " + slowoCwiczen(ids.length)));
    postep.appendChild(tekstElement("span", "dzis-procent", procent + "%"));
    karta.appendChild(postep);

    const pasek = document.createElement("div");
    pasek.className = "pasek-postepu";
    const wypelnienie = document.createElement("div");
    wypelnienie.style.width = procent + "%";
    pasek.appendChild(wypelnienie);
    karta.appendChild(pasek);

    ids.forEach(function (id) {
      karta.appendChild(zrobWierszCwiczenia(sesja, id));
    });

    if (ids.length === 0) {
      karta.appendChild(tekstElement("p", "opis", "Ta sesja nie ma ćwiczeń z parametrami."));
    }
  } else {
    const cel = opisCeluSesji(sesja);
    if (sesja.wynik) {
      karta.appendChild(tekstElement("div", "karta-opis", "Cel: " + cel));
      karta.appendChild(tekstElement("div", "dzis-wynik", "Wynik: " + opisCeluSesji(sesja.wynik)));
    } else {
      karta.appendChild(tekstElement("div", "karta-opis", "Cel: " + cel));
    }
    const przycisk = document.createElement("button");
    przycisk.className = "przycisk wielki" + (sesja.wynik ? " drugi" : "");
    przycisk.textContent = sesja.wynik ? "Zmień wynik" : "Wpisz wynik";
    przycisk.addEventListener("click", function () {
      otworzWynik(plan, sesja);
    });
    karta.appendChild(przycisk);
  }

  return karta;
}

function zrobWierszCwiczenia(sesja, id) {
  const cwiczenie = znajdzCwiczenie(id);
  const zrobione = !!(sesja.zrobione || {})[id];

  const wiersz = document.createElement("div");
  wiersz.className = "cw-wiersz";

  const odhacz = document.createElement("button");
  odhacz.className = "odhacz" + (zrobione ? " zrobione" : "");
  odhacz.textContent = zrobione ? "✓" : "";
  odhacz.setAttribute("aria-pressed", zrobione ? "true" : "false");
  odhacz.setAttribute("aria-label", (zrobione ? "Cofnij: " : "Zrobione: ") + cwiczenie.nazwa);
  odhacz.addEventListener("click", function () {
    if (!sesja.zrobione) {
      sesja.zrobione = {};
    }
    sesja.zrobione[id] = !sesja.zrobione[id];
    zapiszDane();
    rysujDzis();
  });
  wiersz.appendChild(odhacz);

  const tekst = document.createElement("div");
  tekst.className = "karta-tekst";
  tekst.appendChild(tekstElement("div", "karta-nazwa", cwiczenie.nazwa));
  tekst.appendChild(tekstElement("div", "karta-opis", opisIlosci(sesja.parametry[id])));
  wiersz.appendChild(tekst);

  dodajFilm(wiersz, cwiczenie);
  return wiersz;
}

// ===== Koniec planu =====

function rysujKoniecPlanu(plan) {
  const blok = document.createElement("div");
  blok.className = "dzis-karta koniec";
  blok.appendChild(tekstElement("div", "dzis-tytul", "Plan zakończony"));
  blok.appendChild(tekstElement("p", "opis", "Podsumowanie planu. Po zamknięciu licznik się resetuje."));

  plan.aktywnosci.forEach(function (aktywnosc) {
    const sesje = plan.sesje.filter(function (s) {
      return s.aktywnoscId === aktywnosc.id;
    });
    const zaliczone = sesje.filter(function (s) {
      return sesjaZaliczona(plan, s);
    }).length;
    const wiersz = document.createElement("div");
    wiersz.className = "dzis-postep";
    wiersz.appendChild(tekstElement("span", "", opisAktywnosci(aktywnosc).tytul));
    wiersz.appendChild(tekstElement("span", "dzis-procent", zaliczone + "/" + aktywnosc.razy));
    blok.appendChild(wiersz);
    const pasek = document.createElement("div");
    pasek.className = "pasek-postepu";
    const wypelnienie = document.createElement("div");
    wypelnienie.style.width = (aktywnosc.razy === 0 ? 0 : Math.round(zaliczone * 100 / aktywnosc.razy)) + "%";
    pasek.appendChild(wypelnienie);
    blok.appendChild(pasek);
  });

  const nowy = document.createElement("button");
  nowy.className = "przycisk wielki";
  nowy.textContent = "Nowy plan";
  nowy.addEventListener("click", function () {
    zamknijPlan(plan);
    otworzKreator();
  });
  blok.appendChild(nowy);

  const zamknij = document.createElement("button");
  zamknij.className = "przycisk drugi wielki";
  zamknij.textContent = "Zamknij";
  zamknij.addEventListener("click", function () {
    zamknijPlan(plan);
  });
  blok.appendChild(zamknij);

  dzisSesje.appendChild(blok);
}

// Zamyka plan: zostaje w danych (historia), ale przestaje być aktywny
function zamknijPlan(plan) {
  plan.zamkniety = true;
  plan.zamknieto = new Date().toISOString();
  zapiszDane();
  rysujDzis();
}

// ===== Wynik biegania i basenu =====

function otworzWynik(plan, sesja) {
  const aktywnosc = aktywnoscPlanu(plan, sesja.aktywnoscId);
  wynikSesja = sesja;
  wynikTytul.textContent = "Wynik: " + opisAktywnosci(aktywnosc).tytul;
  wynikBlad.textContent = "";
  wynikPola.innerHTML = "";

  // Pola są wstępnie wypełnione wynikiem (jeśli już był) albo celem z planu
  const start = sesja.wynik || sesja;
  const kopia = {
    styl: start.styl,
    dlugosci: start.dlugosci,
    dystans: start.dystans,
    czas: start.czas
  };
  const wpis = zrobKarteSesji(kopia, aktywnosc);
  wynikOdczyt = wpis.odczytaj;
  wynikPola.appendChild(wpis.karta);
  wynikTlo.hidden = false;
}

function zamknijWynik() {
  wynikTlo.hidden = true;
  wynikSesja = null;
  wynikOdczyt = null;
}

function zapiszWynik() {
  const wynik = wynikOdczyt();
  if (wynik === null) {
    wynikBlad.textContent = "Popraw zaznaczone pole.";
    return;
  }
  wynikSesja.wynik = wynik;
  wynikSesja.dataWykonania = dzisISO();
  zapiszDane();
  zamknijWynik();
  rysujDzis();
}

wynikZapisz.addEventListener("click", zapiszWynik);
wynikAnuluj.addEventListener("click", zamknijWynik);
wynikTlo.addEventListener("click", function (zdarzenie) {
  if (zdarzenie.target === wynikTlo) {
    zamknijWynik();
  }
});
