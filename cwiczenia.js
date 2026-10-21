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

// Mięśnie i rysunek anatomiczny
const rysunekFormularza = document.getElementById("an-formularz");
const tekstMiesni = document.getElementById("tekst-miesni");
const przyciskMiesnie = document.getElementById("przycisk-miesnie");
const panelMiesni = document.getElementById("panel-miesni");
const poleMiesnie = document.getElementById("pole-miesnie");
const przyciskGotoweMiesnie = document.getElementById("przycisk-gotowe-miesnie");
const anTlo = document.getElementById("an-tlo");
const anTytul = document.getElementById("an-tytul");
const anOknoRysunek = document.getElementById("an-okno-rysunek");
const anOknoLista = document.getElementById("an-okno-lista");
const anZamknij = document.getElementById("an-zamknij");

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
  if (ilosc.typ === "serie-lista") {
    return ilosc.powtorzenia.join(" / ") + " powt.";
  }
  if (ilosc.typ === "czas-serie") {
    return ilosc.czasy.join(" / ") + " " + ilosc.jednostka;
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

// ===== Style pływania (rodzaj Basen) =====

const poleStyle = document.getElementById("pole-style");
const styleWybory = document.getElementById("style-wybory");

// Czy wybrany rodzaj aktywności ma wybór stylu
function rodzajMaStyl(rodzajId) {
  const rodzaj = znajdzKategorie(rodzajId);
  return !!rodzaj && Array.isArray(rodzaj.polaPlanu) && rodzaj.polaPlanu.indexOf("styl") !== -1;
}

// Buduje listę stylów z zaznaczonymi wybranymi
function zbudujStyle(wybrane) {
  styleWybory.innerHTML = "";
  dane.stylePlywania.forEach(function (nazwa) {
    const etykieta = document.createElement("label");
    etykieta.className = "wybor";
    const pole = document.createElement("input");
    pole.type = "checkbox";
    pole.value = nazwa;
    pole.checked = wybrane.indexOf(nazwa) !== -1;
    etykieta.appendChild(pole);
    etykieta.appendChild(document.createTextNode(" " + nazwa));
    styleWybory.appendChild(etykieta);
  });
}

function zaznaczoneStyle() {
  return Array.from(styleWybory.querySelectorAll("input:checked")).map(function (pole) {
    return pole.value;
  });
}

// Pokazuje wybór stylów tylko dla basenu
function odswiezPoleStyli() {
  poleStyle.hidden = !rodzajMaStyl(poleRodzaj.value);
}

// ===== Mięśnie i rysunek =====

// Zwraca id zaznaczonych mięśni
function zaznaczoneMiesnie() {
  return Array.from(poleMiesnie.querySelectorAll("input:checked")).map(function (pole) {
    return pole.value;
  });
}

// Rysuje rysunek w podanym miejscu, mięśnie z listy na czerwono
function wstawRysunek(miejsce, miesnieIds) {
  miejsce.innerHTML = "";
  miejsce.appendChild(zrobAnatomie(miesnieIds));
}

// Odświeża rysunek i opis w formularzu
function odswiezMiesnieFormularza() {
  const ids = zaznaczoneMiesnie();
  wstawRysunek(rysunekFormularza, ids);
  tekstMiesni.textContent = ids.length === 0 ? "Nie wybrano mięśni." : ids.map(nazwaKategorii).join(", ");
}

// Panel wyboru: mięśnie pogrupowane według partii
function zbudujPanelMiesni(wybrane) {
  poleMiesnie.innerHTML = "";
  kategorieTypu("partia").forEach(function (partia) {
    const miesnie = kategorieTypu("miesien").filter(function (m) {
      return m.partiaId === partia.id;
    });
    if (miesnie.length === 0) {
      return;
    }
    const naglowek = document.createElement("div");
    naglowek.className = "miesnie-grupa";
    naglowek.textContent = partia.nazwa;
    poleMiesnie.appendChild(naglowek);

    const wybory = document.createElement("div");
    wybory.className = "wybory";
    miesnie.forEach(function (m) {
      const etykieta = document.createElement("label");
      etykieta.className = "wybor";
      const pole = document.createElement("input");
      pole.type = "checkbox";
      pole.value = m.id;
      pole.checked = wybrane.indexOf(m.id) !== -1;
      pole.addEventListener("change", odswiezMiesnieFormularza);
      etykieta.appendChild(pole);
      etykieta.appendChild(document.createTextNode(" " + m.nazwa));
      wybory.appendChild(etykieta);
    });
    poleMiesnie.appendChild(wybory);
  });
}

// "Gotowe" w panelu mięśni: dopisuje też partie wybranych mięśni
function zatwierdzMiesnie() {
  const ids = zaznaczoneMiesnie();
  const partie = [];
  ids.forEach(function (id) {
    const m = znajdzKategorie(id);
    if (m && partie.indexOf(m.partiaId) === -1) {
      partie.push(m.partiaId);
    }
  });
  if (partie.length > 0) {
    poleCzyPartie.checked = true;
    polePartie.querySelectorAll("input").forEach(function (pole) {
      if (partie.indexOf(pole.value) !== -1) {
        pole.checked = true;
      }
    });
    pokazPodsumowaniePartii();
  }
  panelMiesni.hidden = true;
  przyciskMiesnie.hidden = false;
}

// Okno z rysunkiem mięśni ćwiczenia (z karty na liście)
function otworzOknoMiesni(cwiczenie) {
  const ids = cwiczenie.miesnieIds || [];
  anTytul.textContent = cwiczenie.nazwa;
  wstawRysunek(anOknoRysunek, ids);
  anOknoLista.textContent = ids.map(nazwaKategorii).join(", ");
  anTlo.hidden = false;
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
  panelMiesni.hidden = true;
  przyciskMiesnie.hidden = false;
  zbudujPanelMiesni(cwiczenie ? cwiczenie.miesnieIds || [] : []);
  odswiezMiesnieFormularza();
  zbudujStyle(cwiczenie ? cwiczenie.style || [] : []);

  if (cwiczenie) {
    edytowaneId = cwiczenie.id;
    tytulFormularza.textContent = "Edycja ćwiczenia";
    poleNazwa.value = cwiczenie.nazwa;
    poleLink.value = cwiczenie.link || "";
    poleRodzaj.value = cwiczenie.rodzajId;
    odswiezPoleStyli();

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
    odswiezPoleStyli();
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

  // Styl pływania: przy basenie trzeba zaznaczyć co najmniej jeden
  let style = [];
  if (rodzajMaStyl(poleRodzaj.value)) {
    style = zaznaczoneStyle();
    if (style.length === 0) {
      pokazBlad("Zaznacz co najmniej jeden styl pływania.");
      return;
    }
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
    miesnieIds: zaznaczoneMiesnie(),
    link: link
  };
  if (style.length > 0) {
    wpis.style = style;
  }

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

// ===== Długie listy: porcje po 15 i przycisk "Pokaż więcej" =====

const PORCJA_LISTY = 15;

// Dopisuje do kontenera karty z listy, ale tylko pierwszą porcję.
// "klucz" opisuje filtry: gdy się zmieni, lista wraca do pierwszej porcji.
function dopiszPorcjami(kontener, lista, zrobKarteElementu, klucz) {
  if (kontener._klucz !== klucz) {
    kontener._klucz = klucz;
    kontener._ile = PORCJA_LISTY;
  }
  let pokazane = 0;
  const wiecej = document.createElement("button");
  wiecej.className = "przycisk-przerywany";

  function dodajDo(limit) {
    lista.slice(pokazane, limit).forEach(function (element) {
      kontener.insertBefore(zrobKarteElementu(element), wiecej.parentNode === kontener ? wiecej : null);
    });
    pokazane = Math.min(limit, lista.length);
    kontener._ile = Math.max(kontener._ile, pokazane);
    if (pokazane < lista.length) {
      wiecej.textContent = "Pokaż więcej (jeszcze " + (lista.length - pokazane) + ")";
      kontener.appendChild(wiecej);
    } else if (wiecej.parentNode === kontener) {
      kontener.removeChild(wiecej);
    }
  }

  wiecej.addEventListener("click", function () {
    dodajDo(pokazane + PORCJA_LISTY);
  });
  dodajDo(kontener._ile);
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

  dopiszPorcjami(listaCwiczen, widoczne, function (cwiczenie) {
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
      .concat(cwiczenie.style || [])
      .filter(function (czesc) {
        return czesc !== "";
      });

    const opis = document.createElement("div");
    opis.className = "karta-opis";
    opis.textContent = czesci.join(" · ");

    tekst.appendChild(nazwa);
    tekst.appendChild(opis);
    karta.appendChild(tekst);

    if ((cwiczenie.miesnieIds || []).length > 0) {
      karta.appendChild(
        przyciskAkcji("Mięśnie", "", function () {
          otworzOknoMiesni(cwiczenie);
        })
      );
    }

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

    return karta;
  }, [filtr.tekst, filtr.partiaId, filtr.rodzajId].join("|"));
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
przyciskMiesnie.addEventListener("click", function () {
  panelMiesni.hidden = false;
  przyciskMiesnie.hidden = true;
});
przyciskGotoweMiesnie.addEventListener("click", zatwierdzMiesnie);
poleRodzaj.addEventListener("change", odswiezPoleStyli);
anZamknij.addEventListener("click", function () {
  anTlo.hidden = true;
});
anTlo.addEventListener("click", function (zdarzenie) {
  if (zdarzenie.target === anTlo) {
    anTlo.hidden = true;
  }
});
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
