// ===== Ekran Ćwiczenia: dodawanie, edycja i lista ćwiczeń =====

// Znajdujemy elementy strony, z którymi będziemy pracować
const przyciskNowe = document.getElementById("przycisk-nowe");
const formularz = document.getElementById("formularz-cwiczenia");
const tytulFormularza = document.getElementById("tytul-formularza");
const poleNazwa = document.getElementById("pole-nazwa");
const poleRodzaj = document.getElementById("pole-rodzaj");

// Miara "serie": serie i powtórzenia albo czas
const blokMiarySerie = document.getElementById("blok-miary-serie");
const poleIloscTyp = document.getElementById("pole-ilosc-typ");
const iloscPowtorzenia = document.getElementById("ilosc-powtorzenia");
const iloscCzas = document.getElementById("ilosc-czas");
const poleSerie = document.getElementById("pole-serie");
const polePowtorzenia = document.getElementById("pole-powtorzenia");
const poleCzas = document.getElementById("pole-czas");
const poleCzasJednostka = document.getElementById("pole-czas-jednostka");

// Miara "sesja": dystans i czas
const blokSesja = document.getElementById("blok-sesja");
const poleSesjaDystans = document.getElementById("pole-sesja-dystans");
const poleSesjaDystansJednostka = document.getElementById("pole-sesja-dystans-jednostka");
const poleSesjaCzas = document.getElementById("pole-sesja-czas");
const poleSesjaCzasJednostka = document.getElementById("pole-sesja-czas-jednostka");

// Miara "statyczna": powtórzenia i czas
const blokStatyczna = document.getElementById("blok-statyczna");
const poleStatPowtorzenia = document.getElementById("pole-stat-powtorzenia");
const poleStatCzas = document.getElementById("pole-stat-czas");
const poleStatCzasJednostka = document.getElementById("pole-stat-czas-jednostka");

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

// ===== Pokazywanie i ukrywanie pól formularza =====

// Pokazuje pola serii albo czasu, zależnie od wybranej miary
function ustawPolaIlosci() {
  const typ = poleIloscTyp.value;
  iloscPowtorzenia.hidden = typ !== "powtorzenia";
  iloscCzas.hidden = typ !== "czas";
}

// Po wyborze rodzaju aktywności pokazuje tylko pasujące pola miary
function ustawPolaRodzaju() {
  const rodzaj = znajdzKategorie(poleRodzaj.value);
  const miara = rodzaj ? rodzaj.miara : "";

  blokMiarySerie.hidden = !rodzaj || miara === "sesja" || miara === "statyczna";
  blokSesja.hidden = miara !== "sesja";
  blokStatyczna.hidden = miara !== "statyczna";
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

// Ustawia wszystkie pola liczbowe miary na 0
function wyzerujPola() {
  [
    poleSerie, polePowtorzenia, poleCzas,
    poleSesjaDystans, poleSesjaCzas,
    poleStatPowtorzenia, poleStatCzas
  ].forEach(function (pole) {
    pole.value = "0";
  });
  poleIloscTyp.value = "powtorzenia";
}

// Wpisuje zapisaną ilość z powrotem do pól (przy edycji)
function wypelnijIlosc(ilosc) {
  if (!ilosc) {
    return;
  }

  if (ilosc.typ === "powtorzenia") {
    poleIloscTyp.value = "powtorzenia";
    poleSerie.value = ilosc.serie;
    polePowtorzenia.value = ilosc.powtorzenia;
  } else if (ilosc.typ === "czas") {
    poleIloscTyp.value = "czas";
    poleCzas.value = ilosc.wartosc;
    poleCzasJednostka.value = ilosc.jednostka;
  } else if (ilosc.typ === "czas-powtorzenia") {
    poleStatPowtorzenia.value = ilosc.powtorzenia;
    poleStatCzas.value = ilosc.czas.wartosc;
    poleStatCzasJednostka.value = ilosc.czas.jednostka;
  } else if (ilosc.typ === "sesja") {
    if (ilosc.dystans) {
      poleSesjaDystans.value = ilosc.dystans.wartosc;
      poleSesjaDystansJednostka.value = ilosc.dystans.jednostka;
    }
    if (ilosc.czas) {
      poleSesjaCzas.value = ilosc.czas.wartosc;
      poleSesjaCzasJednostka.value = ilosc.czas.jednostka;
    }
  } else if (ilosc.typ === "dystans") {
    // Stary format zapisu
    poleSesjaDystans.value = ilosc.wartosc;
    poleSesjaDystansJednostka.value = ilosc.jednostka;
  }

  ustawPolaIlosci();
}

// Otwiera formularz: pusty (nowe ćwiczenie) albo wypełniony (edycja)
function otworzFormularz(cwiczenie) {
  przygotujFormularz();
  wyzerujPola();
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
    ustawPolaRodzaju();
    wypelnijIlosc(cwiczenie.ilosc);

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
    ustawPolaIlosci();
    ustawPolaRodzaju();
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

// Odczytuje pole liczbowe z jednostką.
// Zwraca null (puste albo 0), false (błędna wartość) albo obiekt z wartością.
function odczytajPoleZJednostka(pole, jednostka) {
  const tekst = pole.value.trim();
  if (tekst === "") {
    return null;
  }
  const wartosc = Number(tekst);
  if (isNaN(wartosc) || wartosc < 0) {
    return false;
  }
  if (wartosc === 0) {
    return null;
  }
  return { wartosc: wartosc, jednostka: jednostka.value };
}

// Odczytuje ilość z pól. Zwraca null i pokazuje błąd, gdy coś jest nie tak
function odczytajIlosc() {
  // Dystans i czas (basen, bieganie)
  if (!blokSesja.hidden) {
    const dystans = odczytajPoleZJednostka(poleSesjaDystans, poleSesjaDystansJednostka);
    const czas = odczytajPoleZJednostka(poleSesjaCzas, poleSesjaCzasJednostka);

    if (dystans === false || czas === false) {
      pokazBlad("Dystans i czas nie mogą być ujemne.");
      return null;
    }
    if (dystans === null && czas === null) {
      pokazBlad("Wpisz dystans lub czas (albo oba), większe od zera.");
      return null;
    }
    return { typ: "sesja", dystans: dystans, czas: czas };
  }

  // Powtórzenia i czas (trening statyczny)
  if (!blokStatyczna.hidden) {
    const powtorzenia = Number(poleStatPowtorzenia.value);
    const czas = odczytajPoleZJednostka(poleStatCzas, poleStatCzasJednostka);
    if (!(powtorzenia >= 1) || !czas) {
      pokazBlad("Wpisz liczbę powtórzeń i czas, większe od zera.");
      return null;
    }
    return { typ: "czas-powtorzenia", powtorzenia: powtorzenia, czas: czas };
  }

  // Serie i powtórzenia
  if (poleIloscTyp.value === "powtorzenia") {
    const serie = Number(poleSerie.value);
    const powtorzenia = Number(polePowtorzenia.value);
    if (!(serie >= 1) || !(powtorzenia >= 1)) {
      pokazBlad("Wpisz liczbę serii i powtórzeń większą od zera.");
      return null;
    }
    return { typ: "powtorzenia", serie: serie, powtorzenia: powtorzenia };
  }

  // Czas
  const czas = odczytajPoleZJednostka(poleCzas, poleCzasJednostka);
  if (!czas) {
    pokazBlad("Wpisz czas większy od zera.");
    return null;
  }
  return { typ: "czas", wartosc: czas.wartosc, jednostka: czas.jednostka };
}

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

  const ilosc = odczytajIlosc();
  if (ilosc === null) {
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

  const wpis = {
    id: edytowaneId || "cw-" + Date.now(),
    nazwa: nazwa,
    rodzajId: poleRodzaj.value,
    ilosc: ilosc,
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

    // Opis: ilość, rodzaj aktywności i partie, rozdzielone kropkami
    const nazwyPartii = (cwiczenie.partieIds || []).map(nazwaKategorii);
    const czesci = [opisIlosci(cwiczenie.ilosc), nazwaKategorii(cwiczenie.rodzajId)]
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
      film.className = "akcja";
      film.href = cwiczenie.link;
      film.target = "_blank";
      film.rel = "noopener";
      film.textContent = "Film";
      karta.appendChild(film);
    }

    karta.appendChild(
      przyciskAkcji("Edytuj", "", function () {
        otworzFormularz(cwiczenie);
      })
    );

    karta.appendChild(
      przyciskAkcji("Usuń", "usun", function () {
        if (confirm("Usunąć ćwiczenie „" + cwiczenie.nazwa + "”?")) {
          dane.cwiczenia = dane.cwiczenia.filter(function (inne) {
            return inne.id !== cwiczenie.id;
          });
          zapiszDane();
          rysujListe();
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
poleRodzaj.addEventListener("change", ustawPolaRodzaju);
poleIloscTyp.addEventListener("change", ustawPolaIlosci);
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
