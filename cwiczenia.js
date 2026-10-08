// ===== Ekran Ćwiczenia: dodawanie i lista ćwiczeń =====

// Znajdujemy elementy strony, z którymi będziemy pracować
const przyciskNowe = document.getElementById("przycisk-nowe");
const formularz = document.getElementById("formularz-cwiczenia");
const poleNazwa = document.getElementById("pole-nazwa");
const poleRodzaj = document.getElementById("pole-rodzaj");
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
  pokazBlad("");
  formularz.hidden = false;
  przyciskNowe.hidden = true;
}

function ukryjFormularz() {
  formularz.hidden = true;
  przyciskNowe.hidden = false;
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

    const nazwyPartii = cwiczenie.partieIds.map(nazwaKategorii);
    const opis = document.createElement("div");
    opis.className = "karta-opis";
    opis.textContent = [nazwaKategorii(cwiczenie.rodzajId)]
      .concat(nazwyPartii)
      .join(" · ");

    tekst.appendChild(nazwa);
    tekst.appendChild(opis);
    karta.appendChild(tekst);

    if (cwiczenie.link !== "") {
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

rysujListe();
