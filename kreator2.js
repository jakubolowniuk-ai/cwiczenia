// ===== Kreator planu, krok 2: wybór treningu dla każdej aktywności =====
// Dla aktywności opartych na ćwiczeniach (trening ciała, rozciąganie, trening statyczny)
// wybieramy gotowy trening z "Moje treningi" albo budujemy nowy z sugerowanych ćwiczeń.
// Bieganie i basen to sesje z własnym celem, więc nie wymagają treningu.

// Widoki kroku 2
const kr2WidokLista = document.getElementById("kr2-widok-lista");
const kr2WidokWybor = document.getElementById("kr2-widok-wybor");
const kr2WidokBudowa = document.getElementById("kr2-widok-budowa");

// Lista aktywności
const kr2Lista = document.getElementById("kr2-lista");
const kr2Blad = document.getElementById("kr2-blad");
const kr2Dalej = document.getElementById("kr2-dalej");

// Wybór gotowego treningu
const kr2WyborTytul = document.getElementById("kr2-wybor-tytul");
const kr2WszystkieTreningi = document.getElementById("kr2-wszystkie-treningi");
const kr2BrakTreningow = document.getElementById("kr2-brak-treningow");
const kr2Treningi = document.getElementById("kr2-treningi");
const kr2Nowy = document.getElementById("kr2-nowy");
const kr2WyborWstecz = document.getElementById("kr2-wybor-wstecz");

// Budowa nowego treningu
const kr2BudowaTytul = document.getElementById("kr2-budowa-tytul");
const kr2Nazwa = document.getElementById("kr2-nazwa");
const kr2Wszystkie = document.getElementById("kr2-wszystkie");
const kr2Cwiczenia = document.getElementById("kr2-cwiczenia");
const kr2Wybrano = document.getElementById("kr2-wybrano");
const kr2BladBudowy = document.getElementById("kr2-blad-budowy");
const kr2Zapisz = document.getElementById("kr2-zapisz");
const kr2Anuluj = document.getElementById("kr2-anuluj");

// Krok 3 (na razie podgląd)
const kr3Podglad = document.getElementById("kr3-podglad");
const kr3Wroc = document.getElementById("kr3-wroc");

// Aktywność, dla której teraz wybieramy trening, aktywny widok i ćwiczenia budowanego treningu
let kr2Aktywnosc = null;
let kr2Widok = "lista";
let kr2BudowaIds = [];

// ===== Pomocnicze =====

// Czy aktywność jest oparta na ćwiczeniach (czyli wymaga treningu)
function wymagaTreningu(aktywnosc) {
  const rodzaj = znajdzKategorie(aktywnosc.rodzajId);
  return !!rodzaj && rodzaj.miara !== "sesja";
}

function znajdzTrening(id) {
  return dane.treningi.find(function (trening) {
    return trening.id === id;
  });
}

// Ćwiczenia treningu (bez tych, których już nie ma w bazie)
function cwiczeniaTreningu(trening) {
  return trening.cwiczeniaIds.map(znajdzCwiczenie).filter(function (c) {
    return c !== undefined;
  });
}

// Czy ćwiczenie pasuje do aktywności: po partii (np. Plecy) albo po rodzaju (np. Rozciąganie)
function pasujeDoAktywnosci(cwiczenie, aktywnosc) {
  if (aktywnosc.partiaId) {
    return (cwiczenie.partieIds || []).indexOf(aktywnosc.partiaId) !== -1;
  }
  return cwiczenie.rodzajId === aktywnosc.rodzajId;
}

// Czy trening zawiera choć jedno ćwiczenie pasujące do aktywności
function treningPasuje(trening, aktywnosc) {
  return cwiczeniaTreningu(trening).some(function (cwiczenie) {
    return pasujeDoAktywnosci(cwiczenie, aktywnosc);
  });
}

// Opis treningu: liczba ćwiczeń, partie i nazwy ćwiczeń
function opisTreningu(trening) {
  const cwiczenia = cwiczeniaTreningu(trening);
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
  const nazwy = cwiczenia.map(function (c) {
    return c.nazwa;
  }).join(", ");
  return { opis: opis, nazwy: nazwy };
}

// Dodaje do karty dodatkową linię tekstu pod nazwą
function dodajLinie(karta, tekst) {
  const linia = document.createElement("div");
  linia.className = "karta-opis";
  linia.textContent = tekst;
  karta.firstChild.appendChild(linia);
}

// Pokazuje jeden z widoków kroku 2: "lista", "wybor" albo "budowa"
function pokazWidokKroku2(nazwa) {
  kr2Widok = nazwa;
  kr2WidokLista.hidden = nazwa !== "lista";
  kr2WidokWybor.hidden = nazwa !== "wybor";
  kr2WidokBudowa.hidden = nazwa !== "budowa";
  kreator.querySelector(".kreator-tresc").scrollTop = 0;
}

// Cofanie w kroku 2: zamyka widok wyboru lub budowy. Zwraca true, gdy coś zamknęło.
function krok2Wstecz() {
  if (kr2Widok === "budowa") {
    pokazWidokKroku2("wybor");
    return true;
  }
  if (kr2Widok === "wybor") {
    pokazWidokKroku2("lista");
    return true;
  }
  return false;
}

// ===== Widok: lista aktywności =====

function rysujKrok2() {
  pokazWidokKroku2("lista");
  kr2Blad.textContent = "";
  kr2Lista.innerHTML = "";

  szkic.aktywnosci.forEach(function (aktywnosc) {
    const opis = opisAktywnosci(aktywnosc);
    const karta = zrobKarte(opis.tytul, opis.podtytul);

    if (!wymagaTreningu(aktywnosc)) {
      dodajLinie(karta, "Sesja z własnym celem, bez ćwiczeń.");
    } else {
      const trening = znajdzTrening(aktywnosc.treningId);
      if (trening) {
        const liczba = cwiczeniaTreningu(trening).length;
        dodajLinie(karta, "Trening: " + trening.nazwa + " · " + liczba + " " + slowoCwiczen(liczba));
      } else {
        dodajLinie(karta, "Nie wybrano treningu");
      }
      karta.appendChild(
        przyciskAkcji(trening ? "Zmień" : "Wybierz", "", function () {
          otworzWybor(aktywnosc);
        })
      );
    }

    kr2Lista.appendChild(karta);
  });
}

// ===== Widok: wybór gotowego treningu =====

function otworzWybor(aktywnosc) {
  kr2Aktywnosc = aktywnosc;
  kr2WyborTytul.textContent = "Trening dla: " + opisAktywnosci(aktywnosc).tytul;
  kr2WszystkieTreningi.checked = false;
  rysujTreningiWyboru();
  pokazWidokKroku2("wybor");
}

function rysujTreningiWyboru() {
  kr2Treningi.innerHTML = "";
  const wszystkie = kr2WszystkieTreningi.checked;

  const lista = dane.treningi.filter(function (trening) {
    return wszystkie || treningPasuje(trening, kr2Aktywnosc);
  });

  kr2BrakTreningow.hidden = lista.length > 0;
  if (dane.treningi.length === 0) {
    kr2BrakTreningow.textContent = "Nie masz jeszcze żadnych treningów. Zbuduj pierwszy poniżej.";
  } else {
    kr2BrakTreningow.textContent = "Nie masz jeszcze pasującego treningu. Zbuduj nowy albo pokaż wszystkie treningi.";
  }

  lista.forEach(function (trening) {
    const opis = opisTreningu(trening);
    const karta = zrobKarte(trening.nazwa, opis.opis);
    dodajLinie(karta, opis.nazwy);

    const wybrany = kr2Aktywnosc.treningId === trening.id;
    karta.appendChild(
      przyciskAkcji(wybrany ? "Wybrano ✓" : "Wybierz", wybrany ? "wybrane" : "", function () {
        kr2Aktywnosc.treningId = trening.id;
        zapiszSzkic();
        rysujKrok2();
      })
    );
    kr2Treningi.appendChild(karta);
  });
}

// ===== Widok: budowa nowego treningu =====

function otworzBudowe() {
  kr2BudowaIds = [];
  kr2Nazwa.value = "";
  kr2Wszystkie.checked = false;
  kr2BladBudowy.textContent = "";
  kr2BudowaTytul.textContent = "Nowy trening dla: " + opisAktywnosci(kr2Aktywnosc).tytul;
  rysujBudowe();
  pokazWidokKroku2("budowa");
}

// Rysuje sugerowane ćwiczenia (pasujące do aktywności albo wszystkie z bazy)
function rysujBudowe() {
  kr2Cwiczenia.innerHTML = "";

  const lista = dane.cwiczenia.filter(function (cwiczenie) {
    return kr2Wszystkie.checked || pasujeDoAktywnosci(cwiczenie, kr2Aktywnosc);
  });

  if (lista.length === 0) {
    const komunikat = document.createElement("p");
    komunikat.className = "opis";
    komunikat.textContent = dane.cwiczenia.length === 0
      ? "Baza ćwiczeń jest pusta. Najpierw dodaj ćwiczenia w zakładce Ćwiczenia."
      : "Brak ćwiczeń pasujących do tej aktywności. Zaznacz „Pokaż wszystkie ćwiczenia z bazy”.";
    kr2Cwiczenia.appendChild(komunikat);
  }

  lista.forEach(function (cwiczenie) {
    const dodane = kr2BudowaIds.indexOf(cwiczenie.id) !== -1;
    const karta = zrobKarte(cwiczenie.nazwa, opisCwiczenia(cwiczenie));
    dodajFilm(karta, cwiczenie);
    karta.appendChild(
      przyciskAkcji(dodane ? "Dodano ✓" : "Dodaj", dodane ? "wybrane" : "", function () {
        if (dodane) {
          kr2BudowaIds = kr2BudowaIds.filter(function (id) {
            return id !== cwiczenie.id;
          });
        } else {
          kr2BudowaIds.push(cwiczenie.id);
        }
        rysujBudowe();
      })
    );
    kr2Cwiczenia.appendChild(karta);
  });

  kr2Wybrano.textContent = "Wybrano: " + kr2BudowaIds.length + " " + slowoCwiczen(kr2BudowaIds.length);
}

// Zapisuje nowy trening w "Moje treningi" i od razu wybiera go dla aktywności
function zapiszNowyTrening() {
  const nazwa = kr2Nazwa.value.trim();
  if (nazwa === "") {
    kr2BladBudowy.textContent = "Wpisz nazwę treningu.";
    return;
  }
  if (kr2BudowaIds.length === 0) {
    kr2BladBudowy.textContent = "Dodaj do treningu co najmniej jedno ćwiczenie.";
    return;
  }

  const trening = {
    id: "tr-" + Date.now(),
    nazwa: nazwa,
    cwiczeniaIds: kr2BudowaIds.slice()
  };
  dane.treningi.push(trening);
  kr2Aktywnosc.treningId = trening.id;
  zapiszSzkic();

  if (typeof rysujTreningi === "function") {
    rysujTreningi();
  }
  rysujKrok2();
}

// ===== Przejście do kroku 3 =====

function dalejZKroku2() {
  const braki = szkic.aktywnosci.filter(function (aktywnosc) {
    return wymagaTreningu(aktywnosc) && !znajdzTrening(aktywnosc.treningId);
  });

  if (braki.length > 0) {
    const nazwy = braki.map(function (aktywnosc) {
      return opisAktywnosci(aktywnosc).tytul;
    });
    kr2Blad.textContent = "Wybierz trening dla: " + nazwy.join(", ") + ".";
    return;
  }

  kr2Blad.textContent = "";
  rysujKrok3();
  pokazKrok(3);
  kreator.querySelector(".kreator-tresc").scrollTop = 0;
}

// Podgląd kroku 3: aktywności z wybranymi treningami
function rysujKrok3() {
  kr3Podglad.innerHTML = "";
  szkic.aktywnosci.forEach(function (aktywnosc) {
    const opis = opisAktywnosci(aktywnosc);
    const karta = zrobKarte(opis.tytul, opis.podtytul);
    const trening = znajdzTrening(aktywnosc.treningId);
    if (wymagaTreningu(aktywnosc) && trening) {
      dodajLinie(karta, "Trening: " + trening.nazwa);
    }
    kr3Podglad.appendChild(karta);
  });
}

// ===== Podpięcie przycisków =====

kr2Nowy.addEventListener("click", otworzBudowe);
kr2WyborWstecz.addEventListener("click", function () {
  pokazWidokKroku2("lista");
});
kr2WszystkieTreningi.addEventListener("change", rysujTreningiWyboru);
kr2Wszystkie.addEventListener("change", rysujBudowe);
kr2Zapisz.addEventListener("click", zapiszNowyTrening);
kr2Anuluj.addEventListener("click", function () {
  pokazWidokKroku2("wybor");
});
kr2Dalej.addEventListener("click", dalejZKroku2);
kr3Wroc.addEventListener("click", function () {
  pokazKrok(2);
});
