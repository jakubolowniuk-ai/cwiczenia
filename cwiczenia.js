// ===== Ekran Ćwiczenia: dodawanie, edycja i lista ćwiczeń =====

// Znajdujemy elementy strony, z którymi będziemy pracować
const przyciskNowe = document.getElementById("przycisk-nowe");
const formularz = document.getElementById("formularz-cwiczenia");
const tytulFormularza = document.getElementById("tytul-formularza");
const poleNazwa = document.getElementById("pole-nazwa");
const poleRodzaj = document.getElementById("pole-rodzaj");

// Partie mięśni
const poleCzyPartie = document.getElementById("pole-czy-partie");
const panelPartii = document.getElementById("panel-partii");
const polePartie = document.getElementById("pole-partie");
const przyciskGotowe = document.getElementById("przycisk-gotowe");
const podsumowaniePartii = document.getElementById("podsumowanie-partii");
const tekstPartii = document.getElementById("tekst-partii");
const przyciskZmienPartie = document.getElementById("przycisk-zmien-partie");

const poleLink = document.getElementById("pole-link");
const komunikatBledu = document.getElementById("komunikat-bledu");
const przyciskZapisz = document.getElementById("przycisk-zapisz");
const przyciskAnuluj = document.getElementById("przycisk-anuluj");
const listaCwiczen = document.getElementById("lista-cwiczen");
const pustaLista = document.getElementById("pusta-lista");
const brakWynikow = document.getElementById("brak-wynikow");

// Wyszukiwarka i filtry
const blokFiltrow = document.getElementById("blok-filtrow");
const poleSzukaj = document.getElementById("pole-szukaj");
const chipyPartie = document.getElementById("chipy-partie");
const chipyRodzaje = document.getElementById("chipy-rodzaje");
const przyciskWyczysc = document.getElementById("przycisk-wyczysc");

// Aktualnie wybrane filtry (tekst zapisujemy małymi literami)
const filtr = { tekst: "", partiaId: null, rodzajId: null };

// Id ćwiczenia, które właśnie edytujemy (null, gdy dodajemy nowe)
let edytowaneId = null;

// ===== Pomocnicze funkcje o kategoriach =====

// Zwraca kategorie danego typu: "rodzaj" albo "partia"
function kategorieTypu(typ) {
  return dane.kategorie.filter(function (kategoria) {
    return kategoria.typ === typ;
  });
}

// Znajduje kategorię po id (albo zwraca undefined)
function znajdzKategorie(id) {
  return dane.kategorie.find(function (k) {
    return k.id === id;
  });
}

// Zamienia id kategorii na jej nazwę (np. "partia-plecy" na "Plecy")
function nazwaKategorii(id) {
  const kategoria = znajdzKategorie(id);
  return kategoria ? kategoria.nazwa : "?";
}

// Zamienia zapisaną ilość na krótki tekst, np. "3 × 12", "30 s", "3 × 30 s"
function opisIlosci(ilosc) {
  if (!ilosc) {
    return "";
  }
  if (ilosc.typ === "powtorzenia") {
    return ilosc.serie + " × " + ilosc.powtorzenia;
  }
  if (ilosc.typ === "czas-powtorzenia") {
    return ilosc.powtorzenia + " × " + ilosc.czas.wartosc + " " + ilosc.czas.jednostka;
  }
  if (ilosc.typ === "sesja") {
    const czesci = [];
    if (ilosc.dystans) {
      czesci.push(ilosc.dystans.wartosc + " " + ilosc.dystans.jednostka);
    }
    if (ilosc.czas) {
      czesci.push(ilosc.czas.wartosc + " " + ilosc.czas.jednostka);
    }
    return czesci.join(" · ");
  }
  return ilosc.wartosc + " " + ilosc.jednostka;
}

// Zwraca id zaznaczonych partii
function zaznaczonePartie() {
  const zaznaczone = polePartie.querySelectorAll("input:checked");
  return Array.from(zaznaczone).map(function (pole) {
    return pole.value;
  });
}

// Pokazuje wybrane partie jako podsumowanie w formularzu
function pokazPodsumowaniePartii() {
  const nazwy = zaznaczonePartie().map(nazwaKategorii);
  tekstPartii.textContent = nazwy.join(", ");
  panelPartii.hidden = true;
  podsumowaniePartii.hidden = false;
}

// Reaguje na ptaszek "Ćwiczenie uwzględnia partię mięśni"
function zmianaPolaPartii() {
  if (poleCzyPartie.checked) {
    panelPartii.hidden = false;
    podsumowaniePartii.hidden = true;
  } else {
    polePartie.querySelectorAll("input").forEach(function (pole) {
      pole.checked = false;
    });
    panelPartii.hidden = true;
    podsumowaniePartii.hidden = true;
  }
}

// Przycisk "Gotowe" w panelu partii
function zatwierdzPartie() {
  if (zaznaczonePartie().length === 0) {
    pokazBlad("Zaznacz co najmniej jedną partię albo odznacz pole.");
    return;
  }
  pokazBlad("");
  pokazPodsumowaniePartii();
}

// Przycisk "Zmień" przy podsumowaniu partii
function zmienPartie() {
  podsumowaniePartii.hidden = true;
  panelPartii.hidden = false;
}

// ===== Formularz =====

// Wypełnia listę rodzajów i pola wyboru partii na podstawie kategorii z danych
function przygotujFormularz() {
  poleRodzaj.innerHTML = "";
  const pustaOpcja = document.createElement("option");
  pustaOpcja.value = "";
  pustaOpcja.textContent = "Wybierz rodzaj";
  poleRodzaj.appendChild(pustaOpcja);

  kategorieTypu("rodzaj").forEach(function (kategoria) {
    const opcja = document.createElement("option");
    opcja.value = kategoria.id;
    opcja.textContent = kategoria.nazwa;
    poleRodzaj.appendChild(opcja);
  });

  polePartie.innerHTML = "";
  kategorieTypu("partia").forEach(function (kategoria) {
    const etykieta = document.createElement("label");
    etykieta.className = "wybor";
    const pole = document.createElement("input");
    pole.type = "checkbox";
    pole.value = kategoria.id;
    etykieta.appendChild(pole);
    etykieta.appendChild(document.createTextNode(" " + kategoria.nazwa));
    polePartie.appendChild(etykieta);
  });
}

function pokazBlad(tekst) {
  komunikatBledu.textContent = tekst;
}

// Otwiera formularz: pusty (nowe ćwiczenie) albo wypełniony (edycja)
function otworzFormularz(cwiczenie) {
  przygotujFormularz();
  pokazBlad("");

  poleNazwa.value = "";
  poleLink.value = "";
  poleCzyPartie.checked = false;
  panelPartii.hidden = true;
  podsumowaniePartii.hidden = true;

  if (cwiczenie) {
    edytowaneId = cwiczenie.id;
    tytulFormularza.textContent = "Edycja ćwiczenia";
    poleNazwa.value = cwiczenie.nazwa;
    poleLink.value = cwiczenie.link || "";
    poleRodzaj.value = cwiczenie.rodzajId;

    const partie = cwiczenie.partieIds || [];
    if (partie.length > 0) {
      poleCzyPartie.checked = true;
      polePartie.querySelectorAll("input").forEach(function (pole) {
        pole.checked = partie.indexOf(pole.value) !== -1;
      });
      pokazPodsumowaniePartii();
    }
  } else {
    edytowaneId = null;
    tytulFormularza.textContent = "Nowe ćwiczenie";
  }

  formularz.hidden = false;
  przyciskNowe.hidden = true;
  blokFiltrow.hidden = true;
  formularz.scrollIntoView({ behavior: "smooth", block: "start" });
}

function ukryjFormularz() {
  formularz.hidden = true;
  przyciskNowe.hidden = false;
  edytowaneId = null;
  rysujListe();
}

// ===== Odczyt i sprawdzanie pól =====

// Sprawdza pola i zapisuje ćwiczenie (nowe albo edytowane)
function zapiszCwiczenie() {
  const nazwa = poleNazwa.value.trim();
  if (nazwa === "") {
    pokazBlad("Wpisz nazwę ćwiczenia.");
    return;
  }

  if (poleRodzaj.value === "") {
    pokazBlad("Wybierz rodzaj aktywności.");
    return;
  }

  // Partie zapisujemy tylko wtedy, gdy pole "uwzględnia partię" jest zaznaczone
  let partie = [];
  if (poleCzyPartie.checked) {
    partie = zaznaczonePartie();
    if (partie.length === 0) {
      pokazBlad("Zaznacz co najmniej jedną partię albo odznacz pole.");
      return;
    }
  }

  const link = poleLink.value.trim();
  if (link !== "" && !/^https?:\/\//i.test(link)) {
    pokazBlad("Link musi zaczynać się od http:// lub https://");
    return;
  }

  // Parametry (serie, powtórzenia, czas) ustawiamy w kreatorze planu.
  // Stara ilość edytowanego ćwiczenia zostaje jako podpowiedź w kreatorze.
  let staraIlosc = null;
  if (edytowaneId) {
    const stare = dane.cwiczenia.find(function (inne) {
      return inne.id === edytowaneId;
    });
    staraIlosc = stare && stare.ilosc ? stare.ilosc : null;
  }

  const wpis = {
    id: edytowaneId || "cw-" + Date.now(),
    nazwa: nazwa,
    rodzajId: poleRodzaj.value,
    ilosc: staraIlosc,
    partieIds: partie,
    link: link
  };

  if (edytowaneId) {
    dane.cwiczenia = dane.cwiczenia.map(function (inne) {
      return inne.id === edytowaneId ? wpis : inne;
    });
  } else {
    dane.cwiczenia.push(wpis);
  }

  zapiszDane();
  ukryjFormularz();
  rysujListe();
}

// ===== Przyciski na karcie ćwiczenia =====

// Tworzy przycisk akcji na karcie ćwiczenia
function przyciskAkcji(tekst, dodatkowaKlasa, poKliknieciu) {
  const przycisk = document.createElement("button");
  przycisk.className = "akcja " + dodatkowaKlasa;
  przycisk.textContent = tekst;
  przycisk.addEventListener("click", poKliknieciu);
  return przycisk;
}

// ===== Wyszukiwarka i filtry =====

// Sprawdza, czy ćwiczenie pasuje do wpisanego tekstu i wybranych filtrów
function pasujeDoFiltrow(cwiczenie) {
  if (filtr.tekst !== "" && cwiczenie.nazwa.toLowerCase().indexOf(filtr.tekst) === -1) {
    return false;
  }
  if (filtr.rodzajId && cwiczenie.rodzajId !== filtr.rodzajId) {
    return false;
  }
  if (filtr.partiaId && (cwiczenie.partieIds || []).indexOf(filtr.partiaId) === -1) {
    return false;
  }
  return true;
}

// Tworzy przycisk filtra; ponowne dotknięcie wyłącza filtr
function zrobChip(kategoria, klucz) {
  const chip = document.createElement("button");
  chip.className = "chip" + (filtr[klucz] === kategoria.id ? " aktywny" : "");
  chip.textContent = kategoria.nazwa;
  chip.addEventListener("click", function () {
    filtr[klucz] = filtr[klucz] === kategoria.id ? null : kategoria.id;
    rysujFiltry();
    rysujListe();
  });
  return chip;
}

// Rysuje przyciski filtrów na podstawie kategorii z danych
function rysujFiltry() {
  chipyPartie.innerHTML = "";
  kategorieTypu("partia").forEach(function (kategoria) {
    chipyPartie.appendChild(zrobChip(kategoria, "partiaId"));
  });

  chipyRodzaje.innerHTML = "";
  kategorieTypu("rodzaj").forEach(function (kategoria) {
    chipyRodzaje.appendChild(zrobChip(kategoria, "rodzajId"));
  });

  przyciskWyczysc.hidden = !(filtr.tekst !== "" || filtr.partiaId || filtr.rodzajId);
}

// Czyści wyszukiwarkę i wszystkie filtry
function wyczyscFiltry() {
  filtr.tekst = "";
  filtr.partiaId = null;
  filtr.rodzajId = null;
  poleSzukaj.value = "";
  rysujFiltry();
  rysujListe();
}

// ===== Lista ćwiczeń =====

// Rysuje listę ćwiczeń na ekranie (tylko te, które pasują do filtrów)
function rysujListe() {
  listaCwiczen.innerHTML = "";
  if (typeof odswiezPrzelacznik === "function") {
    odswiezPrzelacznik();
  }

  const widoczne = dane.cwiczenia.filter(pasujeDoFiltrow);
  const brakCwiczen = dane.cwiczenia.length === 0;

  pustaLista.hidden = !brakCwiczen;
  brakWynikow.hidden = brakCwiczen || widoczne.length > 0;
  blokFiltrow.hidden = brakCwiczen || !formularz.hidden;

  widoczne.forEach(function (cwiczenie) {
    const karta = document.createElement("div");
    karta.className = "karta";

    const tekst = document.createElement("div");
    tekst.className = "karta-tekst";

    const nazwa = document.createElement("div");
    nazwa.className = "karta-nazwa";
    nazwa.textContent = cwiczenie.nazwa;

    // Opis: rodzaj aktywności i partie, rozdzielone kropkami
    const nazwyPartii = (cwiczenie.partieIds || []).map(nazwaKategorii);
    const czesci = [nazwaKategorii(cwiczenie.rodzajId)]
      .concat(nazwyPartii)
      .filter(function (czesc) {
        return czesc !== "";
      });

    const opis = document.createElement("div");
    opis.className = "karta-opis";
    opis.textContent = czesci.join(" · ");

    tekst.appendChild(nazwa);
    tekst.appendChild(opis);
    karta.appendChild(tekst);

    if (cwiczenie.link) {
      const film = document.createElement("a");
      film.className = "akcja film";
      film.href = cwiczenie.link;
      film.target = "_blank";
      film.rel = "noopener";
      film.textContent = "▶ Film";
      karta.appendChild(film);
    }

    karta.appendChild(
      przyciskAkcji("Edytuj", "", function () {
        otworzFormularz(cwiczenie);
      })
    );

    karta.appendChild(
      przyciskAkcji("Usuń", "usun", function () {
        // Sprawdzamy, w ilu treningach jest to ćwiczenie
        const uzycia = dane.treningi.filter(function (trening) {
          return trening.cwiczeniaIds.indexOf(cwiczenie.id) !== -1;
        }).length;

        let pytanie = "Usunąć ćwiczenie „" + cwiczenie.nazwa + "”?";
        if (uzycia > 0) {
          pytanie += "\n\nZostanie też usunięte z treningów (" + uzycia + ").";
        }

        if (confirm(pytanie)) {
          dane.cwiczenia = dane.cwiczenia.filter(function (inne) {
            return inne.id !== cwiczenie.id;
          });
          dane.treningi.forEach(function (trening) {
            trening.cwiczeniaIds = trening.cwiczeniaIds.filter(function (id) {
              return id !== cwiczenie.id;
            });
          });
          zapiszDane();
          rysujListe();
          if (typeof rysujTreningi === "function") {
            rysujTreningi();
          }
        }
      })
    );

    listaCwiczen.appendChild(karta);
  });
}

// ===== Podpięcie przycisków =====

przyciskNowe.addEventListener("click", function () {
  otworzFormularz(null);
});
przyciskAnuluj.addEventListener("click", ukryjFormularz);
przyciskZapisz.addEventListener("click", zapiszCwiczenie);
poleCzyPartie.addEventListener("change", zmianaPolaPartii);
przyciskGotowe.addEventListener("click", zatwierdzPartie);
przyciskZmienPartie.addEventListener("click", zmienPartie);
przyciskWyczysc.addEventListener("click", wyczyscFiltry);
poleSzukaj.addEventListener("input", function () {
  filtr.tekst = poleSzukaj.value.trim().toLowerCase();
  rysujFiltry();
  rysujListe();
});

// Po dotknięciu pola liczbowego zaznaczamy jego zawartość (np. 0), żeby łatwo ją zastąpić
formularz.querySelectorAll('input[type="number"]').forEach(function (pole) {
  pole.addEventListener("focus", function () {
    pole.select();
  });
});

rysujFiltry();
rysujListe();
