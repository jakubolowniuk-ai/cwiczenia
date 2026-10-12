// ===== Zakładka "Moje treningi": tworzenie, edycja i lista treningów =====
// Trening to nazwa i lista ćwiczeń z bazy (zapisujemy tylko ich id).

// Przełącznik Baza / Moje treningi
const przelacznikBaza = document.getElementById("przelacznik-baza");
const przelacznikTreningi = document.getElementById("przelacznik-treningi");
const widokBaza = document.getElementById("widok-baza");
const widokTreningi = document.getElementById("widok-treningi");

// Formularz treningu
const przyciskNowyTrening = document.getElementById("przycisk-nowy-trening");
const formularzTreningu = document.getElementById("formularz-treningu");
const tytulTreningu = document.getElementById("tytul-treningu");
const poleNazwaTreningu = document.getElementById("pole-nazwa-treningu");
const pusteWybrane = document.getElementById("puste-wybrane");
const wybraneCwiczenia = document.getElementById("wybrane-cwiczenia");
const przyciskDodajCwiczenia = document.getElementById("przycisk-dodaj-cwiczenia");
const bladTreningu = document.getElementById("blad-treningu");
const przyciskZapiszTrening = document.getElementById("przycisk-zapisz-trening");
const przyciskAnulujTrening = document.getElementById("przycisk-anuluj-trening");

// Panel wyboru ćwiczeń z bazy
const panelWyboru = document.getElementById("panel-wyboru");
const poleSzukajWyboru = document.getElementById("pole-szukaj-wyboru");
const chipyPartieWyboru = document.getElementById("chipy-partie-wyboru");
const chipyRodzajeWyboru = document.getElementById("chipy-rodzaje-wyboru");
const listaWyboru = document.getElementById("lista-wyboru");
const przyciskGotoweWyboru = document.getElementById("przycisk-gotowe-wyboru");

// Lista treningów
const pusteTreningi = document.getElementById("puste-treningi");
const listaTreningow = document.getElementById("lista-treningow");

// Id edytowanego treningu (null, gdy tworzymy nowy) i ćwiczenia wybrane do treningu, po kolei
let edytowanyTreningId = null;
let wybraneIds = [];

// Filtry w panelu wyboru ćwiczeń
const filtrWyboru = { tekst: "", partiaId: null, rodzajId: null };

// ===== Pomocnicze =====

function znajdzCwiczenie(id) {
  return dane.cwiczenia.find(function (cwiczenie) {
    return cwiczenie.id === id;
  });
}

// Poprawna forma słowa: 1 ćwiczenie, 2 ćwiczenia, 5 ćwiczeń
function slowoCwiczen(liczba) {
  if (liczba === 1) {
    return "ćwiczenie";
  }
  const reszta10 = liczba % 10;
  const reszta100 = liczba % 100;
  if (reszta10 >= 2 && reszta10 <= 4 && !(reszta100 >= 12 && reszta100 <= 14)) {
    return "ćwiczenia";
  }
  return "ćwiczeń";
}

// Krótki opis ćwiczenia: ilość, rodzaj i partie
function opisCwiczenia(cwiczenie) {
  const nazwyPartii = (cwiczenie.partieIds || []).map(nazwaKategorii);
  return [opisIlosci(cwiczenie.ilosc), nazwaKategorii(cwiczenie.rodzajId)]
    .concat(nazwyPartii)
    .filter(function (czesc) {
      return czesc !== "";
    })
    .join(" · ");
}

// Tworzy kartę z nazwą i opisem (bez przycisków)
function zrobKarte(nazwa, opis) {
  const karta = document.createElement("div");
  karta.className = "karta";

  const tekst = document.createElement("div");
  tekst.className = "karta-tekst";

  const naglowek = document.createElement("div");
  naglowek.className = "karta-nazwa";
  naglowek.textContent = nazwa;
  tekst.appendChild(naglowek);

  if (opis) {
    const opisElement = document.createElement("div");
    opisElement.className = "karta-opis";
    opisElement.textContent = opis;
    tekst.appendChild(opisElement);
  }

  karta.appendChild(tekst);
  return karta;
}

// ===== Przełącznik Baza / Moje treningi =====

function pokazWidok(nazwa) {
  const treningi = nazwa === "treningi";
  widokBaza.hidden = treningi;
  widokTreningi.hidden = !treningi;
  przelacznikBaza.classList.toggle("aktywny", !treningi);
  przelacznikTreningi.classList.toggle("aktywny", treningi);
}

// ===== Ćwiczenia wybrane do treningu =====

function przesunWybrane(indeks, kierunek) {
  const nowy = indeks + kierunek;
  if (nowy < 0 || nowy >= wybraneIds.length) {
    return;
  }
  const pomocnicza = wybraneIds[indeks];
  wybraneIds[indeks] = wybraneIds[nowy];
  wybraneIds[nowy] = pomocnicza;
  rysujWybrane();
}

// Rysuje listę ćwiczeń dodanych do treningu (z przyciskami ↑ ↓ i Usuń)
function rysujWybrane() {
  wybraneCwiczenia.innerHTML = "";

  // Pomijamy ćwiczenia, których już nie ma w bazie
  wybraneIds = wybraneIds.filter(function (id) {
    return znajdzCwiczenie(id) !== undefined;
  });
  pusteWybrane.hidden = wybraneIds.length > 0;

  wybraneIds.forEach(function (id, indeks) {
    const cwiczenie = znajdzCwiczenie(id);
    const karta = zrobKarte((indeks + 1) + ". " + cwiczenie.nazwa, opisCwiczenia(cwiczenie));

    const wyzej = przyciskAkcji("↑", "strzalka", function () {
      przesunWybrane(indeks, -1);
    });
    wyzej.disabled = indeks === 0;
    wyzej.setAttribute("aria-label", "Przesuń wyżej");

    const nizej = przyciskAkcji("↓", "strzalka", function () {
      przesunWybrane(indeks, 1);
    });
    nizej.disabled = indeks === wybraneIds.length - 1;
    nizej.setAttribute("aria-label", "Przesuń niżej");

    const usun = przyciskAkcji("Usuń", "usun", function () {
      wybraneIds.splice(indeks, 1);
      rysujWybrane();
      rysujWybor();
    });

    karta.appendChild(wyzej);
    karta.appendChild(nizej);
    karta.appendChild(usun);
    wybraneCwiczenia.appendChild(karta);
  });
}

// ===== Panel wyboru ćwiczeń z bazy =====

function pasujeDoWyboru(cwiczenie) {
  if (filtrWyboru.tekst !== "" && cwiczenie.nazwa.toLowerCase().indexOf(filtrWyboru.tekst) === -1) {
    return false;
  }
  if (filtrWyboru.rodzajId && cwiczenie.rodzajId !== filtrWyboru.rodzajId) {
    return false;
  }
  if (filtrWyboru.partiaId && (cwiczenie.partieIds || []).indexOf(filtrWyboru.partiaId) === -1) {
    return false;
  }
  return true;
}

// Przycisk filtra w panelu wyboru; ponowne dotknięcie wyłącza filtr
function zrobChipWyboru(kategoria, klucz) {
  const chip = document.createElement("button");
  chip.className = "chip" + (filtrWyboru[klucz] === kategoria.id ? " aktywny" : "");
  chip.textContent = kategoria.nazwa;
  chip.addEventListener("click", function () {
    filtrWyboru[klucz] = filtrWyboru[klucz] === kategoria.id ? null : kategoria.id;
    rysujFiltryWyboru();
    rysujWybor();
  });
  return chip;
}

function rysujFiltryWyboru() {
  chipyPartieWyboru.innerHTML = "";
  kategorieTypu("partia").forEach(function (kategoria) {
    chipyPartieWyboru.appendChild(zrobChipWyboru(kategoria, "partiaId"));
  });

  chipyRodzajeWyboru.innerHTML = "";
  kategorieTypu("rodzaj").forEach(function (kategoria) {
    chipyRodzajeWyboru.appendChild(zrobChipWyboru(kategoria, "rodzajId"));
  });
}

// Rysuje ćwiczenia z bazy, które można dodać do treningu lub z niego zdjąć
function rysujWybor() {
  listaWyboru.innerHTML = "";
  const widoczne = dane.cwiczenia.filter(pasujeDoWyboru);

  if (dane.cwiczenia.length === 0 || widoczne.length === 0) {
    const komunikat = document.createElement("p");
    komunikat.className = "opis";
    komunikat.textContent = dane.cwiczenia.length === 0
      ? "Baza ćwiczeń jest pusta. Najpierw dodaj ćwiczenia w zakładce Baza."
      : "Brak ćwiczeń dla wybranych filtrów.";
    listaWyboru.appendChild(komunikat);
    return;
  }

  widoczne.forEach(function (cwiczenie) {
    const dodane = wybraneIds.indexOf(cwiczenie.id) !== -1;
    const karta = zrobKarte(cwiczenie.nazwa, opisCwiczenia(cwiczenie));

    const przycisk = przyciskAkcji(dodane ? "Dodano ✓" : "Dodaj", dodane ? "wybrane" : "", function () {
      if (dodane) {
        wybraneIds = wybraneIds.filter(function (id) {
          return id !== cwiczenie.id;
        });
      } else {
        wybraneIds.push(cwiczenie.id);
      }
      rysujWybrane();
      rysujWybor();
    });

    karta.appendChild(przycisk);
    listaWyboru.appendChild(karta);
  });
}

function otworzPanelWyboru() {
  filtrWyboru.tekst = "";
  filtrWyboru.partiaId = null;
  filtrWyboru.rodzajId = null;
  poleSzukajWyboru.value = "";
  rysujFiltryWyboru();
  rysujWybor();
  panelWyboru.hidden = false;
  przyciskDodajCwiczenia.hidden = true;
}

function zamknijPanelWyboru() {
  panelWyboru.hidden = true;
  przyciskDodajCwiczenia.hidden = false;
}

// ===== Formularz treningu =====

function pokazBladTreningu(tekst) {
  bladTreningu.textContent = tekst;
}

// Otwiera formularz: pusty (nowy trening) albo wypełniony (edycja)
function otworzFormularzTreningu(trening) {
  pokazBladTreningu("");
  zamknijPanelWyboru();

  if (trening) {
    edytowanyTreningId = trening.id;
    tytulTreningu.textContent = "Edycja treningu";
    poleNazwaTreningu.value = trening.nazwa;
    wybraneIds = trening.cwiczeniaIds.slice();
  } else {
    edytowanyTreningId = null;
    tytulTreningu.textContent = "Nowy trening";
    poleNazwaTreningu.value = "";
    wybraneIds = [];
  }

  rysujWybrane();
  formularzTreningu.hidden = false;
  przyciskNowyTrening.hidden = true;
  formularzTreningu.scrollIntoView({ behavior: "smooth", block: "start" });
}

function zamknijFormularzTreningu() {
  formularzTreningu.hidden = true;
  przyciskNowyTrening.hidden = false;
  edytowanyTreningId = null;
  wybraneIds = [];
}

function zapiszTrening() {
  const nazwa = poleNazwaTreningu.value.trim();
  if (nazwa === "") {
    pokazBladTreningu("Wpisz nazwę treningu.");
    return;
  }
  if (wybraneIds.length === 0) {
    pokazBladTreningu("Dodaj do treningu co najmniej jedno ćwiczenie.");
    return;
  }

  const wpis = {
    id: edytowanyTreningId || "tr-" + Date.now(),
    nazwa: nazwa,
    cwiczeniaIds: wybraneIds.slice()
  };

  if (edytowanyTreningId) {
    dane.treningi = dane.treningi.map(function (inny) {
      return inny.id === edytowanyTreningId ? wpis : inny;
    });
  } else {
    dane.treningi.push(wpis);
  }

  zapiszDane();
  zamknijFormularzTreningu();
  rysujTreningi();
}

// ===== Lista treningów =====

function rysujTreningi() {
  listaTreningow.innerHTML = "";
  pusteTreningi.hidden = dane.treningi.length > 0;

  dane.treningi.forEach(function (trening) {
    const cwiczenia = trening.cwiczeniaIds.map(znajdzCwiczenie).filter(function (c) {
      return c !== undefined;
    });

    // Partie występujące w ćwiczeniach treningu (bez powtórzeń)
    const partie = [];
    cwiczenia.forEach(function (cwiczenie) {
      (cwiczenie.partieIds || []).forEach(function (id) {
        const nazwa = nazwaKategorii(id);
        if (partie.indexOf(nazwa) === -1) {
          partie.push(nazwa);
        }
      });
    });

    let opis = cwiczenia.length + " " + slowoCwiczen(cwiczenia.length);
    if (partie.length > 0) {
      opis += " · " + partie.join(", ");
    }

    const karta = zrobKarte(trening.nazwa, opis);

    // Druga linia: nazwy ćwiczeń po kolei
    const nazwyCwiczen = document.createElement("div");
    nazwyCwiczen.className = "karta-opis";
    nazwyCwiczen.textContent = cwiczenia.map(function (c) {
      return c.nazwa;
    }).join(", ");
    karta.firstChild.appendChild(nazwyCwiczen);

    karta.appendChild(
      przyciskAkcji("Edytuj", "", function () {
        otworzFormularzTreningu(trening);
      })
    );

    karta.appendChild(
      przyciskAkcji("Usuń", "usun", function () {
        if (confirm("Usunąć trening „" + trening.nazwa + "”?")) {
          dane.treningi = dane.treningi.filter(function (inny) {
            return inny.id !== trening.id;
          });
          zapiszDane();
          rysujTreningi();
        }
      })
    );

    listaTreningow.appendChild(karta);
  });
}

// ===== Podpięcie przycisków =====

przelacznikBaza.addEventListener("click", function () {
  pokazWidok("baza");
});
przelacznikTreningi.addEventListener("click", function () {
  pokazWidok("treningi");
});

przyciskNowyTrening.addEventListener("click", function () {
  otworzFormularzTreningu(null);
});
przyciskAnulujTrening.addEventListener("click", zamknijFormularzTreningu);
przyciskZapiszTrening.addEventListener("click", zapiszTrening);
przyciskDodajCwiczenia.addEventListener("click", otworzPanelWyboru);
przyciskGotoweWyboru.addEventListener("click", zamknijPanelWyboru);

poleSzukajWyboru.addEventListener("input", function () {
  filtrWyboru.tekst = poleSzukajWyboru.value.trim().toLowerCase();
  rysujWybor();
});

rysujTreningi();
