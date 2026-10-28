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
const poleBlokTreningu = document.getElementById("pole-blok-treningu");
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
const poleSzukajTreningow = document.getElementById("szukaj-treningow");
let szukajTreningow = "";
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

// Krótki opis ćwiczenia: rodzaj i partie
function opisCwiczenia(cwiczenie) {
  const nazwyPartii = (cwiczenie.partieIds || []).map(nazwaKategorii);
  return [nazwaKategorii(cwiczenie.rodzajId)]
    .concat(nazwyPartii)
    .concat(cwiczenie.style || [])
    .filter(function (czesc) {
      return czesc !== "";
    })
    .join(" · ");
}

// Dodaje do karty przycisk "Opis" (opis wykonania i film), jeśli ćwiczenie ma opis albo link
function dodajFilm(karta, cwiczenie) {
  if (!maOpis(cwiczenie)) {
    return;
  }
  const przycisk = document.createElement("button");
  przycisk.type = "button";
  przycisk.className = "akcja film";
  przycisk.textContent = "Opis";
  przycisk.setAttribute("aria-label", "Opis ćwiczenia: " + cwiczenie.nazwa);
  przycisk.addEventListener("click", function () {
    otworzOpis(cwiczenie);
  });
  karta.appendChild(przycisk);
}

// Zestawy zapisane przez użytkownika (bez roboczych, które powstają przy układaniu planu)
function treningiZapisane() {
  return dane.treningi.filter(function (t) {
    return !t.roboczy;
  });
}

// Pokazuje w przełączniku liczbę ćwiczeń i treningów
function odswiezPrzelacznik() {
  przelacznikBaza.textContent = "Baza ćwiczeń (" + dane.cwiczenia.filter(function (c) {
    return !c.ukryte;
  }).length + ")";
  przelacznikTreningi.textContent = "Moje treningi (" + treningiZapisane().length + ")";
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
    const karta = zrobKarte((indeks + 1) + ". " + cwiczenie.nazwa + (cwiczenie.ukryte ? " (ukryte)" : ""), opisCwiczenia(cwiczenie));

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

    dodajFilm(karta, cwiczenie);
    karta.appendChild(wyzej);
    karta.appendChild(nizej);
    karta.appendChild(usun);
    wybraneCwiczenia.appendChild(karta);
  });
}

// ===== Panel wyboru ćwiczeń z bazy =====

// Zestawy są tylko dla aktywności z ćwiczeniami (bez biegania, roweru, spaceru, basenu)
function rodzajZCwiczeniami(rodzajId) {
  const rodzaj = znajdzKategorie(rodzajId);
  return !rodzaj || rodzaj.miara !== "sesja";
}

function pasujeDoWyboru(cwiczenie) {
  if (cwiczenie.ukryte) {
    return false;
  }
  if (filtrWyboru.tekst !== "" && cwiczenie.nazwa.toLowerCase().indexOf(filtrWyboru.tekst) === -1) {
    return false;
  }
  if (!rodzajZCwiczeniami(cwiczenie.rodzajId)) {
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
  kategorieTypu("rodzaj").filter(function (k) {
    return k.miara !== "sesja";
  }).forEach(function (kategoria) {
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

  dopiszPorcjami(listaWyboru, widoczne, function (cwiczenie) {
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

    dodajFilm(karta, cwiczenie);
    karta.appendChild(przycisk);
    return karta;
  }, [filtrWyboru.tekst, filtrWyboru.partiaId, filtrWyboru.rodzajId].join("|"));
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
    poleBlokTreningu.value = trening.blok || "";
    wybraneIds = trening.cwiczeniaIds.slice();
  } else {
    edytowanyTreningId = null;
    tytulTreningu.textContent = "Nowy trening";
    poleNazwaTreningu.value = "";
    poleBlokTreningu.value = "";
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

  if (poleBlokTreningu.value) {
    wpis.blok = poleBlokTreningu.value;
  }

  if (edytowanyTreningId) {
    // Zachowujemy dane, których formularz nie zmienia (blok, domyślne wartości, oznaczenie z bazy)
    const stary = dane.treningi.find(function (t) { return t.id === edytowanyTreningId; });
    if (stary) {
      ["parametry", "zBazy", "opis"].forEach(function (klucz) {
        if (stary[klucz] !== undefined) {
          wpis[klucz] = stary[klucz];
        }
      });
    }
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
  odswiezPrzelacznik();
  listaTreningow.innerHTML = "";
  pusteTreningi.hidden = treningiZapisane().length > 0;

  const widoczneTreningi = treningiZapisane().filter(function (trening) {
    if (szukajTreningow === "") {
      return true;
    }
    return trening.nazwa.toLowerCase().indexOf(szukajTreningow) !== -1 ||
      trening.cwiczeniaIds.some(function (id) {
        const cw = znajdzCwiczenie(id);
        return cw && cw.nazwa.toLowerCase().indexOf(szukajTreningow) !== -1;
      });
  });
  poleSzukajTreningow.hidden = treningiZapisane().length < 6;
  if (treningiZapisane().length > 0 && widoczneTreningi.length === 0) {
    const brak = document.createElement("p");
    brak.className = "opis";
    brak.textContent = "Nie znaleziono treningu o takiej nazwie.";
    listaTreningow.appendChild(brak);
  }

  dopiszPorcjami(listaTreningow, widoczneTreningi, function (trening) {
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

    let opis = (trening.blok === "rozgrzewka" ? "Blok rozgrzewki · " : trening.blok === "rozciaganie" ? "Blok rozciągania · " : "") +
      cwiczenia.length + " " + slowoCwiczen(cwiczenia.length);
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

    // Rozwijana lista ćwiczeń treningu, każde z przyciskiem do filmu
    karta.classList.add("zwijana");
    const szczegoly = document.createElement("div");
    szczegoly.className = "szczegoly";
    szczegoly.hidden = true;

    cwiczenia.forEach(function (cwiczenie, indeks) {
      const wiersz = document.createElement("div");
      wiersz.className = "szczegol-wiersz";

      const tekst = document.createElement("div");
      tekst.className = "karta-tekst";

      const nazwaCw = document.createElement("div");
      nazwaCw.className = "karta-nazwa";
      nazwaCw.textContent = (indeks + 1) + ". " + cwiczenie.nazwa;

      const opisCw = document.createElement("div");
      opisCw.className = "karta-opis";
      opisCw.textContent = opisCwiczenia(cwiczenie);

      tekst.appendChild(nazwaCw);
      tekst.appendChild(opisCw);
      wiersz.appendChild(tekst);
      dodajFilm(wiersz, cwiczenie);
      szczegoly.appendChild(wiersz);
    });

    const pokaz = przyciskAkcji("Pokaż", "", function () {
      szczegoly.hidden = !szczegoly.hidden;
      pokaz.textContent = szczegoly.hidden ? "Pokaż" : "Ukryj";
    });
    karta.appendChild(pokaz);

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

    karta.appendChild(szczegoly);
    return karta;
  }, "t|" + szukajTreningow);
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

poleSzukajTreningow.addEventListener("input", function () {
  szukajTreningow = poleSzukajTreningow.value.trim().toLowerCase();
  rysujTreningi();
});

rysujTreningi();

// Nowe ćwiczenie utworzone prosto z formularza treningu: od razu trafia do treningu
document.getElementById("przycisk-nowe-w-treningu").addEventListener("click", function () {
  otworzFormularz(null, {
    poZapisie: function (wpis) {
      wybraneIds.push(wpis.id);
      rysujWybrane();
      rysujWybor();
    }
  });
});
document.getElementById("przycisk-zapisz-trening-gora").addEventListener("click", zapiszTrening);
