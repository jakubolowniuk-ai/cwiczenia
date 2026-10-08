// ===== Ekran Ćwiczenia: dodawanie i lista ćwiczeń =====

// Znajdujemy elementy strony, z którymi będziemy pracować
const przyciskNowe = document.getElementById("przycisk-nowe");
const formularz = document.getElementById("formularz-cwiczenia");
const poleNazwa = document.getElementById("pole-nazwa");
const poleRodzaj = document.getElementById("pole-rodzaj");
const poleIloscTyp = document.getElementById("pole-ilosc-typ");
const iloscPowtorzenia = document.getElementById("ilosc-powtorzenia");
const iloscCzas = document.getElementById("ilosc-czas");
const iloscDystans = document.getElementById("ilosc-dystans");
const poleSerie = document.getElementById("pole-serie");
const polePowtorzenia = document.getElementById("pole-powtorzenia");
const poleCzas = document.getElementById("pole-czas");
const poleCzasJednostka = document.getElementById("pole-czas-jednostka");
const poleDystans = document.getElementById("pole-dystans");
const poleDystansJednostka = document.getElementById("pole-dystans-jednostka");
const polePartie = document.getElementById("pole-partie");
const poleLink = document.getElementById("pole-link");
const komunikatBledu = document.getElementById("komunikat-bledu");
const przyciskZapisz = document.getElementById("przycisk-zapisz");
const przyciskAnuluj = document.getElementById("przycisk-anuluj");
const listaCwiczen = document.getElementById("lista-cwiczen");
const pustaLista = document.getElementById("pusta-lista");

// Zwraca kategorie danego typu: "rodzaj" albo "partia"
function kategorieTypu(typ) {
  return dane.kategorie.filter(function (kategoria) {
    return kategoria.typ === typ;
  });
}

// Zamienia id kategorii na jej nazwę (np. "partia-plecy" na "Plecy")
function nazwaKategorii(id) {
  const kategoria = dane.kategorie.find(function (k) {
    return k.id === id;
  });
  return kategoria ? kategoria.nazwa : "?";
}

// Zamienia zapisaną ilość na krótki tekst, np. "3 × 12" albo "30 s"
function opisIlosci(ilosc) {
  if (!ilosc) {
    return "";
  }
  if (ilosc.typ === "powtorzenia") {
    return ilosc.serie + " × " + ilosc.powtorzenia;
  }
  return ilosc.wartosc + " " + ilosc.jednostka;
}

// Pokazuje pola pasujące do wybranej miary (serie, czas albo dystans)
function ustawPolaIlosci() {
  const typ = poleIloscTyp.value;
  iloscPowtorzenia.hidden = typ !== "powtorzenia";
  iloscCzas.hidden = typ !== "czas";
  iloscDystans.hidden = typ !== "dystans";
}

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

function pokazFormularz() {
  przygotujFormularz();
  poleNazwa.value = "";
  poleLink.value = "";
  poleIloscTyp.value = "powtorzenia";
  poleSerie.value = "";
  polePowtorzenia.value = "";
  poleCzas.value = "";
  poleDystans.value = "";
  ustawPolaIlosci();
  pokazBlad("");
  formularz.hidden = false;
  przyciskNowe.hidden = true;
}

function ukryjFormularz() {
  formularz.hidden = true;
  przyciskNowe.hidden = false;
}

// Odczytuje ilość z pól. Zwraca null i pokazuje błąd, gdy coś jest nie tak
function odczytajIlosc() {
  const typ = poleIloscTyp.value;

  if (typ === "powtorzenia") {
    const serie = Number(poleSerie.value);
    const powtorzenia = Number(polePowtorzenia.value);
    if (!(serie >= 1) || !(powtorzenia >= 1)) {
      pokazBlad("Wpisz liczbę serii i powtórzeń (co najmniej 1).");
      return null;
    }
    return { typ: "powtorzenia", serie: serie, powtorzenia: powtorzenia };
  }

  if (typ === "czas") {
    const wartosc = Number(poleCzas.value);
    if (!(wartosc > 0)) {
      pokazBlad("Wpisz czas większy od zera.");
      return null;
    }
    return { typ: "czas", wartosc: wartosc, jednostka: poleCzasJednostka.value };
  }

  const wartosc = Number(poleDystans.value);
  if (!(wartosc > 0)) {
    pokazBlad("Wpisz dystans większy od zera.");
    return null;
  }
  return { typ: "dystans", wartosc: wartosc, jednostka: poleDystansJednostka.value };
}

// Sprawdza pola i zapisuje nowe ćwiczenie
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

  const zaznaczone = polePartie.querySelectorAll("input:checked");
  const partie = Array.from(zaznaczone).map(function (pole) {
    return pole.value;
  });

  const link = poleLink.value.trim();
  if (link !== "" && !/^https?:\/\//i.test(link)) {
    pokazBlad("Link musi zaczynać się od http:// lub https://");
    return;
  }

  dane.cwiczenia.push({
    id: "cw-" + Date.now(),
    nazwa: nazwa,
    rodzajId: poleRodzaj.value,
    ilosc: ilosc,
    partieIds: partie,
    link: link
  });

  zapiszDane();
  ukryjFormularz();
  rysujListe();
}

// Rysuje listę ćwiczeń na ekranie
function rysujListe() {
  listaCwiczen.innerHTML = "";
  pustaLista.hidden = dane.cwiczenia.length > 0;

  dane.cwiczenia.forEach(function (cwiczenie) {
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

    const usun = document.createElement("button");
    usun.className = "akcja usun";
    usun.textContent = "Usuń";
    usun.addEventListener("click", function () {
      if (confirm("Usunąć ćwiczenie „" + cwiczenie.nazwa + "”?")) {
        dane.cwiczenia = dane.cwiczenia.filter(function (inne) {
          return inne.id !== cwiczenie.id;
        });
        zapiszDane();
        rysujListe();
      }
    });
    karta.appendChild(usun);

    listaCwiczen.appendChild(karta);
  });
}

przyciskNowe.addEventListener("click", pokazFormularz);
przyciskAnuluj.addEventListener("click", ukryjFormularz);
przyciskZapisz.addEventListener("click", zapiszCwiczenie);
poleIloscTyp.addEventListener("change", ustawPolaIlosci);

rysujListe();
