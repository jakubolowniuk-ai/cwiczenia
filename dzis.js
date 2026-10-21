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
const dzisEdytujPlan = document.getElementById("dzis-edytuj-plan");
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
  if (etapySesji(dane_).length > 0) {
    czesci.push(opisEtapow(dane_));
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
  dzisEdytujPlan.hidden = false;

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
    dzisEdytujPlan.hidden = true;
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
  naglowek.appendChild(tekstElement("div", "dzis-status" + (zaliczona ? " zaliczona" : ""), zaliczona ? (wymagaTreningu(aktywnosc) && sesjaPonizejPlanu(sesja) ? "Zaliczone ◐" : "Zaliczone ✓") : ""));
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
  const plan = sesja.parametry[id];
  const wykonane = zrobione && sesja.wykonane ? sesja.wykonane[id] : null;

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
    if (!sesja.zrobione[id] && sesja.wykonane) {
      delete sesja.wykonane[id];
    }
    zapiszDane();
    rysujDzis();
  });
  wiersz.appendChild(odhacz);

  const tekst = document.createElement("div");
  tekst.className = "karta-tekst";
  tekst.appendChild(tekstElement("div", "karta-nazwa", cwiczenie.nazwa));
  const opis = tekstElement("button", "wartosc-przycisk", opisIlosci(wykonane || plan));
  opis.setAttribute("aria-label", "Wpisz inną wartość: " + cwiczenie.nazwa);
  opis.addEventListener("click", function () {
    otworzWartosc(sesja, id);
  });
  tekst.appendChild(opis);

  if (wykonane) {
    const roznica = opisRoznicy(plan, wykonane);
    if (roznica) {
      tekst.appendChild(tekstElement("div", "etykieta " + (roznica.wiecej ? "ponad" : "ponizej"), roznica.wiecej ? roznica.tekst : "plan " + opisIlosci(plan) + " · " + roznica.tekst));
    }
  }
  wiersz.appendChild(tekst);

  dodajFilm(wiersz, cwiczenie);
  return wiersz;
}

// ===== Porównanie wykonanej wartości z planem =====

function sekundyZ(wartosc, jednostka) {
  return jednostka === "min" ? wartosc * 60 : wartosc;
}

// Powtórzenia w kolejnych seriach, np. [12, 10, 8]; dla zwykłego "3 × 10" to [10, 10, 10]
function listaPowtorzen(ilosc) {
  if (ilosc.typ === "serie-lista") {
    return ilosc.powtorzenia;
  }
  const lista = [];
  for (let i = 0; i < ilosc.serie; i++) {
    lista.push(ilosc.powtorzenia);
  }
  return lista;
}

// Czy ilość to serie z powtórzeniami (zwykłe albo różne w seriach)
function czyPowtorzenia(ilosc) {
  return ilosc.typ === "powtorzenia" || ilosc.typ === "serie-lista";
}

// Trening statyczny: czasy w kolejnych seriach i ich jednostka
function listaCzasow(ilosc) {
  if (ilosc.typ === "czas-serie") {
    return ilosc.czasy;
  }
  const lista = [];
  for (let i = 0; i < ilosc.powtorzenia; i++) {
    lista.push(ilosc.czas.wartosc);
  }
  return lista;
}

function jednostkaCzasu(ilosc) {
  return ilosc.typ === "czas-serie" ? ilosc.jednostka : ilosc.czas.jednostka;
}

function czyStatyczne(ilosc) {
  return ilosc.typ === "czas-powtorzenia" || ilosc.typ === "czas-serie";
}

// Rodzaj miary: "powt", "czas" albo "stat" (do porównywania rekordów)
function rodzinaIlosci(ilosc) {
  if (czyPowtorzenia(ilosc)) {
    return "powt";
  }
  return czyStatyczne(ilosc) ? "stat" : "czas";
}

// Jedna liczba opisująca "ile pracy": powtórzenia razem albo sekundy
function miaraIlosci(ilosc) {
  if (ilosc.typ === "serie-lista") {
    return ilosc.powtorzenia.reduce(function (suma, p) {
      return suma + p;
    }, 0);
  }
  if (ilosc.typ === "powtorzenia") {
    return ilosc.serie * ilosc.powtorzenia;
  }
  if (ilosc.typ === "czas") {
    return sekundyZ(ilosc.wartosc, ilosc.jednostka);
  }
  if (ilosc.typ === "czas-serie") {
    return ilosc.czasy.reduce(function (suma, c) {
      return suma + sekundyZ(c, ilosc.jednostka);
    }, 0);
  }
  return ilosc.powtorzenia * sekundyZ(ilosc.czas.wartosc, ilosc.czas.jednostka);
}

// Stosunek wykonania do planu (1 = zgodnie z planem)
function stosunekIlosci(plan, wykonane) {
  const m = miaraIlosci(plan);
  return m > 0 ? miaraIlosci(wykonane) / m : 1;
}

// Krótki opis różnicy, np. "−2 powt." albo "+10 s"; null, gdy bez różnicy
function opisRoznicy(plan, wykonane) {
  const roznica = miaraIlosci(wykonane) - miaraIlosci(plan);
  if (roznica === 0) {
    return null;
  }
  const znak = roznica > 0 ? "+" : "−";
  const ile = Math.abs(roznica);
  let tekst;
  if (czyPowtorzenia(plan)) {
    if (plan.typ === "powtorzenia" && wykonane.typ === "powtorzenia" && wykonane.serie === plan.serie) {
      tekst = znak + Math.abs(wykonane.powtorzenia - plan.powtorzenia) + " powt.";
    } else {
      tekst = znak + ile + " powt. łącznie";
    }
  } else if (plan.typ === "czas") {
    tekst = znak + (Math.round(ile * 10) / 10) + " s";
  } else {
    tekst = znak + (Math.round(ile * 10) / 10) + " s łącznie";
  }
  if (roznica > 0) {
    return { wiecej: true, tekst: tekst + " ponad plan" };
  }
  return { wiecej: false, tekst: tekst };
}

// Czy w zaliczonej sesji treningowej jakieś ćwiczenie zrobiono poniżej planu
function sesjaPonizejPlanu(sesja) {
  const wykonane = sesja.wykonane || {};
  return Object.keys(wykonane).some(function (id) {
    return sesja.parametry[id] && stosunekIlosci(sesja.parametry[id], wykonane[id]) < 1;
  });
}

// ===== Okno wartości ćwiczenia =====

const wartTlo = document.getElementById("wart-tlo");
const wartTytul = document.getElementById("wart-tytul");
const wartPlan = document.getElementById("wart-plan");
const wartPola = document.getElementById("wart-pola");
const wartInfo = document.getElementById("wart-info");
const wartZapisz = document.getElementById("wart-zapisz");
const wartAnuluj = document.getElementById("wart-anuluj");
const wartCofnij = document.getElementById("wart-cofnij");

let wartSesja = null;
let wartId = null;
let wartPolaDane = [];
let wartTryb = "jednolite"; // "lista": powtórzenia osobno dla każdej serii

// Jedno pole z przyciskami − i +
function zrobStepper(etykieta, wartosc, krok) {
  const blok = document.createElement("div");
  blok.className = "wart-blok";
  blok.appendChild(tekstElement("div", "wart-etykieta", etykieta));
  const rzad = document.createElement("div");
  rzad.className = "wart-stepper";
  const mniej = tekstElement("button", "", "−");
  mniej.setAttribute("aria-label", "Mniej: " + etykieta);
  const pole = document.createElement("input");
  pole.type = "number";
  pole.inputMode = "decimal";
  pole.min = "0";
  pole.step = String(krok);
  pole.value = String(wartosc);
  const wiecej = tekstElement("button", "", "+");
  wiecej.setAttribute("aria-label", "Więcej: " + etykieta);
  mniej.addEventListener("click", function () {
    pole.value = String(Math.max(0, Math.round((Number(pole.value) - krok) * 10) / 10));
    odswiezWartInfo();
  });
  wiecej.addEventListener("click", function () {
    pole.value = String(Math.round((Number(pole.value) + krok) * 10) / 10);
    odswiezWartInfo();
  });
  pole.addEventListener("input", odswiezWartInfo);
  rzad.appendChild(mniej);
  rzad.appendChild(pole);
  rzad.appendChild(wiecej);
  blok.appendChild(rzad);
  return { blok: blok, pole: pole };
}

// Składa wykonaną ilość z pól okna; null, gdy wartości są błędne
function odczytajWartosc(plan) {
  const v = wartPolaDane.map(function (p) {
    return Number(p.pole.value);
  });
  if (czyPowtorzenia(plan) && wartTryb === "lista") {
    const poprawne = v.length >= 1 && v.every(function (x) {
      return x >= 1 && Math.floor(x) === x;
    });
    if (!poprawne) {
      return null;
    }
    const takie = v.every(function (x) {
      return x === v[0];
    });
    return takie ? { typ: "powtorzenia", serie: v.length, powtorzenia: v[0] } : { typ: "serie-lista", powtorzenia: v };
  }
  if (plan.typ === "powtorzenia") {
    if (!(v[0] >= 1) || !(v[1] >= 1) || Math.floor(v[0]) !== v[0] || Math.floor(v[1]) !== v[1]) {
      return null;
    }
    return { typ: "powtorzenia", serie: v[0], powtorzenia: v[1] };
  }
  if (plan.typ === "czas") {
    if (!(v[0] > 0)) {
      return null;
    }
    return { typ: "czas", wartosc: v[0], jednostka: plan.jednostka };
  }
  const jednostka = jednostkaCzasu(plan);
  if (wartTryb === "lista") {
    if (v.length < 1 || !v.every(function (x) { return x > 0; })) {
      return null;
    }
    const jednakowe = v.every(function (x) { return x === v[0]; });
    return jednakowe
      ? { typ: "czas-powtorzenia", powtorzenia: v.length, czas: { wartosc: v[0], jednostka: jednostka } }
      : { typ: "czas-serie", czasy: v, jednostka: jednostka };
  }
  if (!(v[0] >= 1) || Math.floor(v[0]) !== v[0] || !(v[1] > 0)) {
    return null;
  }
  return { typ: "czas-powtorzenia", powtorzenia: v[0], czas: { wartosc: v[1], jednostka: jednostka } };
}

function odswiezWartInfo() {
  const plan = wartSesja.parametry[wartId];
  const wynik = odczytajWartosc(plan);
  wartZapisz.disabled = wynik === null;
  wartInfo.className = "wart-info";
  if (wynik === null) {
    wartInfo.textContent = "Wpisz wartości większe od zera.";
    return;
  }
  const roznica = opisRoznicy(plan, wynik);
  if (!roznica) {
    wartInfo.textContent = "Zgodnie z planem.";
  } else if (roznica.wiecej) {
    wartInfo.className = "wart-info ponad";
    wartInfo.textContent = "To " + roznica.tekst + ". Brawo!";
  } else {
    wartInfo.className = "wart-info ponizej";
    wartInfo.textContent = "To " + roznica.tekst.replace("−", "") + " mniej niż w planie. Ćwiczenie i tak się zalicza. Wynik zobaczysz w Postępie.";
  }
}

function otworzWartosc(sesja, id) {
  const plan = sesja.parametry[id];
  const start = (sesja.zrobione && sesja.zrobione[id] && sesja.wykonane && sesja.wykonane[id]) || plan;
  wartSesja = sesja;
  wartId = id;
  wartTytul.textContent = znajdzCwiczenie(id).nazwa;
  wartPlan.textContent = "Zaplanowano: " + opisIlosci(plan);
  wartPola.innerHTML = "";
  wartPolaDane = [];
  wartTryb = plan.typ === "serie-lista" || start.typ === "serie-lista" ? "lista" : "jednolite";
  if (czyPowtorzenia(plan)) {
    wartStart = start;
    narysujPolaPowtorzen(listaPowtorzen(start));
    return koniecOtwarciaWartosci(sesja, id);
  } else if (plan.typ === "czas") {
    wartPolaDane.push(zrobStepper("Czas (" + plan.jednostka + ")", start.wartosc, plan.jednostka === "min" ? 1 : 5));
  } else {
    wartTryb = plan.typ === "czas-serie" || start.typ === "czas-serie" ? "lista" : "jednolite";
    narysujPolaCzasow(listaCzasow(start), jednostkaCzasu(plan));
    return koniecOtwarciaWartosci(sesja, id);
  }
  wartPolaDane.forEach(function (p) {
    wartPola.appendChild(p.blok);
  });
  koniecOtwarciaWartosci(sesja, id);
}

function koniecOtwarciaWartosci(sesja, id) {
  wartCofnij.hidden = !(sesja.zrobione && sesja.zrobione[id]);
  odswiezWartInfo();
  wartTlo.hidden = false;
}

let wartStart = null;

// Trening statyczny: dwa pola (powtórzenia i czas jednego) albo osobny czas dla każdej serii
function narysujPolaCzasow(czasy, jednostka) {
  const krok = jednostka === "min" ? 1 : 5;
  wartPola.innerHTML = "";
  wartPolaDane = [];
  if (wartTryb === "jednolite") {
    wartPolaDane.push(zrobStepper("Powtórzenia", czasy.length, 1));
    wartPolaDane.push(zrobStepper("Czas jednego (" + jednostka + ")", czasy[0], krok));
    wartPolaDane.forEach(function (p) {
      wartPola.appendChild(p.blok);
    });
    const rozpisz = tekstElement("button", "akcja", "Różne czasy w seriach");
    rozpisz.type = "button";
    rozpisz.addEventListener("click", function () {
      const serie = Math.max(1, Number(wartPolaDane[0].pole.value) || 1);
      const czas = Number(wartPolaDane[1].pole.value) || krok;
      wartTryb = "lista";
      narysujPolaCzasow(new Array(serie).fill(czas), jednostka);
      odswiezWartInfo();
    });
    wartPola.appendChild(rozpisz);
    return;
  }
  czasy.forEach(function (ile, i) {
    const p = zrobStepper("Seria " + (i + 1) + " (" + jednostka + ")", ile, krok);
    wartPolaDane.push(p);
    wartPola.appendChild(p.blok);
  });
  const rzad = document.createElement("div");
  rzad.className = "wart-serie-akcje";
  const odczytaj = function () {
    return wartPolaDane.map(function (p) {
      return Number(p.pole.value) || 0;
    });
  };
  const dodaj = tekstElement("button", "akcja", "+ seria");
  dodaj.type = "button";
  dodaj.addEventListener("click", function () {
    const lista = odczytaj();
    lista.push(lista.length > 0 ? lista[lista.length - 1] || krok : krok);
    narysujPolaCzasow(lista, jednostka);
    odswiezWartInfo();
  });
  const usun = tekstElement("button", "akcja usun", "− seria");
  usun.type = "button";
  usun.disabled = czasy.length <= 1;
  usun.addEventListener("click", function () {
    const lista = odczytaj();
    lista.pop();
    narysujPolaCzasow(lista, jednostka);
    odswiezWartInfo();
  });
  rzad.appendChild(dodaj);
  rzad.appendChild(usun);
  wartPola.appendChild(rzad);
}

// Pola powtórzeń: dwa pola (serie i powtórzenia) albo osobne pole dla każdej serii
function narysujPolaPowtorzen(powtorzenia) {
  wartPola.innerHTML = "";
  wartPolaDane = [];
  if (wartTryb === "jednolite") {
    wartPolaDane.push(zrobStepper("Serie", powtorzenia.length, 1));
    wartPolaDane.push(zrobStepper("Powtórzenia", powtorzenia[0], 1));
    wartPolaDane.forEach(function (p) {
      wartPola.appendChild(p.blok);
    });
    const rozpisz = tekstElement("button", "akcja", "Różne powtórzenia w seriach");
    rozpisz.type = "button";
    rozpisz.addEventListener("click", function () {
      const serie = Math.max(1, Number(wartPolaDane[0].pole.value) || 1);
      const powt = Math.max(1, Number(wartPolaDane[1].pole.value) || 1);
      const lista = [];
      for (let i = 0; i < serie; i++) {
        lista.push(powt);
      }
      wartTryb = "lista";
      narysujPolaPowtorzen(lista);
      odswiezWartInfo();
    });
    wartPola.appendChild(rozpisz);
    return;
  }
  powtorzenia.forEach(function (ile, i) {
    const p = zrobStepper("Seria " + (i + 1), ile, 1);
    wartPolaDane.push(p);
    wartPola.appendChild(p.blok);
  });
  const rzad = document.createElement("div");
  rzad.className = "wart-serie-akcje";
  const dodaj = tekstElement("button", "akcja", "+ seria");
  dodaj.type = "button";
  dodaj.addEventListener("click", function () {
    const lista = wartPolaDane.map(function (p) {
      return Number(p.pole.value) || 0;
    });
    lista.push(lista.length > 0 ? lista[lista.length - 1] || 1 : 1);
    narysujPolaPowtorzen(lista);
    odswiezWartInfo();
  });
  const usun = tekstElement("button", "akcja usun", "− seria");
  usun.type = "button";
  usun.disabled = powtorzenia.length <= 1;
  usun.addEventListener("click", function () {
    const lista = wartPolaDane.map(function (p) {
      return Number(p.pole.value) || 0;
    });
    lista.pop();
    narysujPolaPowtorzen(lista);
    odswiezWartInfo();
  });
  rzad.appendChild(dodaj);
  rzad.appendChild(usun);
  wartPola.appendChild(rzad);
}

function zamknijWartosc() {
  wartTlo.hidden = true;
  wartSesja = null;
  wartId = null;
}

wartZapisz.addEventListener("click", function () {
  const plan = wartSesja.parametry[wartId];
  const wynik = odczytajWartosc(plan);
  if (wynik === null) {
    return;
  }
  if (!wartSesja.zrobione) {
    wartSesja.zrobione = {};
  }
  if (!wartSesja.wykonane) {
    wartSesja.wykonane = {};
  }
  wartSesja.zrobione[wartId] = true;
  if (miaraIlosci(wynik) === miaraIlosci(plan) && JSON.stringify(wynik) === JSON.stringify(plan)) {
    delete wartSesja.wykonane[wartId];
  } else {
    wartSesja.wykonane[wartId] = wynik;
  }
  zapiszDane();
  zamknijWartosc();
  rysujDzis();
});

wartCofnij.addEventListener("click", function () {
  wartSesja.zrobione[wartId] = false;
  if (wartSesja.wykonane) {
    delete wartSesja.wykonane[wartId];
  }
  zapiszDane();
  zamknijWartosc();
  rysujDzis();
});

wartAnuluj.addEventListener("click", zamknijWartosc);
wartTlo.addEventListener("click", function (zdarzenie) {
  if (zdarzenie.target === wartTlo) {
    zamknijWartosc();
  }
});

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
    etapy: start.etapy,
    cwiczenieId: start.cwiczenieId,
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

dzisEdytujPlan.addEventListener("click", function () {
  const plan = aktywnyPlan();
  if (plan) {
    otworzKreator(plan);
  }
});
