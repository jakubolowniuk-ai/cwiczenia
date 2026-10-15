// ===== Kreator planu, krok 2: wybór treningu dla każdej aktywności =====
// Dla aktywności opartych na ćwiczeniach (trening ciała, rozciąganie, trening statyczny)
// wybieramy gotowy trening z "Moje treningi" albo budujemy nowy z sugerowanych ćwiczeń.
// Potem dla każdego ćwiczenia treningu ustawiamy parametry (serie, powtórzenia, czas).
// Parametry zapisujemy w aktywności planu: aktywnosc.parametry[idĆwiczenia].
// Bieganie i basen to sesje z własnym celem: nie mają treningu, ale ich parametry
// (dystans, czas, styl, długości) ustawiamy tu, w tym samym kroku co parametry ćwiczeń.

// Widoki kroku 2
const kr2WidokLista = document.getElementById("kr2-widok-lista");
const kr2WidokWybor = document.getElementById("kr2-widok-wybor");
const kr2WidokBudowa = document.getElementById("kr2-widok-budowa");
const kr2WidokParametry = document.getElementById("kr2-widok-parametry");

// Parametry ćwiczeń
const kr2ParametryTytul = document.getElementById("kr2-parametry-tytul");
const kr2ParametryLista = document.getElementById("kr2-parametry-lista");
const kr2BladParametrow = document.getElementById("kr2-blad-parametrow");
const kr2ParametryGotowe = document.getElementById("kr2-parametry-gotowe");
const kr2ParametryWroc = document.getElementById("kr2-parametry-wroc");

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
// Dla każdego ćwiczenia w widoku parametrów: funkcja odczytująca jego pola
let kr2Odczyty = [];

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

// Czy cel sesji (bieganie, basen) jest ustawiony
function celSesjiUstawiony(aktywnosc) {
  const rodzaj = znajdzKategorie(aktywnosc.rodzajId);
  const pola = rodzaj && rodzaj.polaPlanu ? rodzaj.polaPlanu : [];
  if (pola.indexOf("styl") !== -1 && !aktywnosc.styl) {
    return false;
  }
  if (pola.indexOf("dlugosci") !== -1 && !(aktywnosc.dlugosci >= 1)) {
    return false;
  }
  if (pola.indexOf("dystans") !== -1 || pola.indexOf("czas") !== -1) {
    if (!aktywnosc.dystans && !aktywnosc.czas) {
      return false;
    }
  }
  return true;
}

// Ćwiczenia, których parametry nie są jeszcze ustawione
function cwiczeniaBezParametrow(aktywnosc) {
  const trening = znajdzTrening(aktywnosc.treningId);
  if (!trening) {
    return [];
  }
  const parametry = aktywnosc.parametry || {};
  return cwiczeniaTreningu(trening).filter(function (cwiczenie) {
    return !parametry[cwiczenie.id];
  });
}

// Pokazuje jeden z widoków kroku 2: "lista", "wybor", "parametry" albo "budowa"
function pokazWidokKroku2(nazwa) {
  kr2Widok = nazwa;
  kr2WidokLista.hidden = nazwa !== "lista";
  kr2WidokWybor.hidden = nazwa !== "wybor";
  kr2WidokBudowa.hidden = nazwa !== "budowa";
  kr2WidokParametry.hidden = nazwa !== "parametry";
  kreator.querySelector(".kreator-tresc").scrollTop = 0;
}

// Cofanie w kroku 2: zamyka widok wyboru lub budowy. Zwraca true, gdy coś zamknęło.
function krok2Wstecz() {
  if (kr2Widok === "budowa") {
    pokazWidokKroku2("wybor");
    return true;
  }
  if (kr2Widok === "parametry") {
    rysujKrok2();
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
      const ustawiony = celSesjiUstawiony(aktywnosc);
      dodajLinie(karta, ustawiony ? "Parametry ustawione ✓" : "Parametry: do ustawienia");
      karta.appendChild(
        przyciskAkcji("Parametry", ustawiony ? "" : "wybrane", function () {
          otworzParametry(aktywnosc);
        })
      );
    } else {
      const trening = znajdzTrening(aktywnosc.treningId);
      if (trening) {
        const liczba = cwiczeniaTreningu(trening).length;
        dodajLinie(karta, "Trening: " + trening.nazwa + " · " + liczba + " " + slowoCwiczen(liczba));
        const brakuje = cwiczeniaBezParametrow(aktywnosc).length;
        dodajLinie(karta, brakuje === 0 ? "Parametry ustawione ✓" : "Parametry: do ustawienia (" + brakuje + ")");
        karta.appendChild(
          przyciskAkcji("Parametry", brakuje === 0 ? "" : "wybrane", function () {
            otworzParametry(aktywnosc);
          })
        );
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
        wybierzTrening(kr2Aktywnosc, trening.id);
      })
    );
    kr2Treningi.appendChild(karta);
  });
}

// Przypisuje trening do aktywności i od razu przechodzi do ustawiania parametrów
function wybierzTrening(aktywnosc, treningId) {
  if (aktywnosc.treningId !== treningId) {
    aktywnosc.treningId = treningId;
    // Zostawiamy tylko parametry ćwiczeń, które są w nowym treningu
    const trening = znajdzTrening(treningId);
    const stare = aktywnosc.parametry || {};
    const nowe = {};
    cwiczeniaTreningu(trening).forEach(function (cwiczenie) {
      if (stare[cwiczenie.id]) {
        nowe[cwiczenie.id] = stare[cwiczenie.id];
      }
    });
    aktywnosc.parametry = nowe;
  }
  zapiszSzkic();
  otworzParametry(aktywnosc);
}

// ===== Widok: parametry ćwiczeń =====

// Tworzy pole liczbowe z etykietą. Zwraca { blok, pole }
function zrobPoleLiczbowe(etykieta, wartosc, ulamki) {
  const blok = document.createElement("div");
  const opis = document.createElement("label");
  opis.textContent = etykieta;
  const pole = document.createElement("input");
  pole.type = "number";
  pole.min = "0";
  pole.value = String(wartosc);
  pole.setAttribute("inputmode", ulamki ? "decimal" : "numeric");
  if (ulamki) {
    pole.step = "any";
  }
  pole.addEventListener("focus", function () {
    pole.select();
  });
  blok.appendChild(opis);
  blok.appendChild(pole);
  return { blok: blok, pole: pole };
}

// Tworzy listę wyboru jednostki czasu. Zwraca { blok, wybor }
function zrobWyborJednostki(etykieta, wartosc) {
  const blok = document.createElement("div");
  const opis = document.createElement("label");
  opis.textContent = etykieta;
  const wybor = document.createElement("select");
  [["s", "sekundy"], ["min", "minuty"]].forEach(function (para) {
    const opcja = document.createElement("option");
    opcja.value = para[0];
    opcja.textContent = para[1];
    wybor.appendChild(opcja);
  });
  wybor.value = wartosc;
  blok.appendChild(opis);
  blok.appendChild(wybor);
  return { blok: blok, wybor: wybor };
}

// Lista wyboru jednostki z podanych opcji [[wartość, nazwa], ...]
function zrobWyborJednostkiZ(etykieta, opcje, wartosc) {
  const blok = document.createElement("div");
  const opis = document.createElement("label");
  opis.textContent = etykieta;
  const wybor = document.createElement("select");
  opcje.forEach(function (para) {
    const opcja = document.createElement("option");
    opcja.value = para[0];
    opcja.textContent = para[1];
    wybor.appendChild(opcja);
  });
  wybor.value = wartosc;
  blok.appendChild(opis);
  blok.appendChild(wybor);
  return { blok: blok, wybor: wybor };
}

function zrobRzad() {
  const rzad = document.createElement("div");
  rzad.className = "rzad";
  return rzad;
}

// Podpowiedź startowa dla ćwiczenia: zapisane w planie, albo stara ilość z bazy, albo zera
function ilosciStartowa(aktywnosc, cwiczenie, miara) {
  const zapisane = (aktywnosc.parametry || {})[cwiczenie.id];
  if (zapisane) {
    return zapisane;
  }
  const stara = cwiczenie.ilosc;
  if (stara) {
    if (miara === "statyczna" && stara.typ === "czas-powtorzenia") {
      return stara;
    }
    if (miara === "serie" && (stara.typ === "powtorzenia" || stara.typ === "czas")) {
      return stara;
    }
  }
  return null;
}

// Tworzy kartę z polami parametrów jednego ćwiczenia.
// Zwraca funkcję odczytującą pola: zwraca ilość albo null (i wtedy ustawia błąd w karcie)
function zrobKarteParametrow(aktywnosc, cwiczenie) {
  const rodzaj = znajdzKategorie(cwiczenie.rodzajId);
  const miara = rodzaj ? rodzaj.miara : "serie";
  const start = ilosciStartowa(aktywnosc, cwiczenie, miara);

  const karta = document.createElement("div");
  karta.className = "formularz parametry-karta";

  const naglowek = document.createElement("div");
  naglowek.className = "parametry-naglowek";
  const nazwa = document.createElement("div");
  nazwa.className = "karta-nazwa";
  nazwa.textContent = cwiczenie.nazwa;
  naglowek.appendChild(nazwa);
  dodajFilm(naglowek, cwiczenie);
  karta.appendChild(naglowek);

  const blad = document.createElement("p");
  blad.className = "blad";

  let odczytaj;

  if (miara === "statyczna") {
    // Powtórzenia i czas jednego powtórzenia
    const pow = zrobPoleLiczbowe("Powtórzenia", start ? start.powtorzenia : 0, false);
    const czas = zrobPoleLiczbowe("Czas jednego powtórzenia", start && start.czas ? start.czas.wartosc : 0, true);
    const jedn = zrobWyborJednostki("Jednostka czasu", start && start.czas ? start.czas.jednostka : "s");
    const rzad1 = zrobRzad();
    rzad1.appendChild(pow.blok);
    rzad1.appendChild(czas.blok);
    const rzad2 = zrobRzad();
    rzad2.appendChild(jedn.blok);
    karta.appendChild(rzad1);
    karta.appendChild(rzad2);

    odczytaj = function () {
      const p = Number(pow.pole.value);
      const c = Number(czas.pole.value);
      if (!(p >= 1) || Math.floor(p) !== p || !(c > 0)) {
        return "Wpisz liczbę powtórzeń i czas, większe od zera.";
      }
      return { typ: "czas-powtorzenia", powtorzenia: p, czas: { wartosc: c, jednostka: jedn.wybor.value } };
    };
  } else {
    // Serie i powtórzenia albo czas
    const typBlok = document.createElement("div");
    const typOpis = document.createElement("label");
    typOpis.textContent = "Miara ćwiczenia";
    const typ = document.createElement("select");
    [["powtorzenia", "Serie i powtórzenia"], ["czas", "Czas"]].forEach(function (para) {
      const opcja = document.createElement("option");
      opcja.value = para[0];
      opcja.textContent = para[1];
      typ.appendChild(opcja);
    });
    typ.value = start && start.typ === "czas" ? "czas" : "powtorzenia";
    typBlok.appendChild(typOpis);
    typBlok.appendChild(typ);
    karta.appendChild(typBlok);

    const serie = zrobPoleLiczbowe("Serie", start && start.typ === "powtorzenia" ? start.serie : 0, false);
    const pow = zrobPoleLiczbowe("Powtórzenia", start && start.typ === "powtorzenia" ? start.powtorzenia : 0, false);
    const rzadSerie = zrobRzad();
    rzadSerie.appendChild(serie.blok);
    rzadSerie.appendChild(pow.blok);

    const czas = zrobPoleLiczbowe("Czas", start && start.typ === "czas" ? start.wartosc : 0, true);
    const jedn = zrobWyborJednostki("Jednostka", start && start.typ === "czas" ? start.jednostka : "s");
    const rzadCzas = zrobRzad();
    rzadCzas.appendChild(czas.blok);
    rzadCzas.appendChild(jedn.blok);

    karta.appendChild(rzadSerie);
    karta.appendChild(rzadCzas);

    const pokazPola = function () {
      rzadSerie.hidden = typ.value !== "powtorzenia";
      rzadCzas.hidden = typ.value !== "czas";
    };
    typ.addEventListener("change", pokazPola);
    pokazPola();

    odczytaj = function () {
      if (typ.value === "powtorzenia") {
        const s = Number(serie.pole.value);
        const p = Number(pow.pole.value);
        if (!(s >= 1) || !(p >= 1) || Math.floor(s) !== s || Math.floor(p) !== p) {
          return "Wpisz liczbę serii i powtórzeń większą od zera.";
        }
        return { typ: "powtorzenia", serie: s, powtorzenia: p };
      }
      const c = Number(czas.pole.value);
      if (!(c > 0)) {
        return "Wpisz czas większy od zera.";
      }
      return { typ: "czas", wartosc: c, jednostka: jedn.wybor.value };
    };
  }

  karta.appendChild(blad);

  return {
    cwiczenie: cwiczenie,
    odczytaj: function () {
      const wynik = odczytaj();
      if (typeof wynik === "string") {
        blad.textContent = wynik;
        return null;
      }
      blad.textContent = "";
      return wynik;
    },
    karta: karta
  };
}

// Karta celu sesji: bieganie (dystans, czas) albo basen (styl, długości).
// Pola pokazujemy zależnie od rodzaju aktywności (polaPlanu).
function zrobKarteSesji(aktywnosc) {
  const rodzaj = znajdzKategorie(aktywnosc.rodzajId);
  const pola = rodzaj && rodzaj.polaPlanu ? rodzaj.polaPlanu : [];

  const karta = document.createElement("div");
  karta.className = "formularz parametry-karta";
  const blad = document.createElement("p");
  blad.className = "blad";

  let styl = null;
  let dlugosci = null;
  let dystans = null;
  let dystansJedn = null;
  let czas = null;
  let czasJedn = null;

  if (pola.indexOf("styl") !== -1) {
    const blok = document.createElement("div");
    const opis = document.createElement("label");
    opis.textContent = "Styl";
    styl = document.createElement("select");
    const pusta = document.createElement("option");
    pusta.value = "";
    pusta.textContent = "Wybierz styl";
    styl.appendChild(pusta);
    dane.stylePlywania.forEach(function (nazwa) {
      const opcja = document.createElement("option");
      opcja.value = nazwa;
      opcja.textContent = nazwa;
      styl.appendChild(opcja);
    });
    styl.value = aktywnosc.styl || "";
    blok.appendChild(opis);
    blok.appendChild(styl);
    karta.appendChild(blok);
  }

  if (pola.indexOf("dlugosci") !== -1) {
    dlugosci = zrobPoleLiczbowe("Liczba długości basenu", aktywnosc.dlugosci || 0, false);
    const rzad = zrobRzad();
    rzad.appendChild(dlugosci.blok);
    karta.appendChild(rzad);
  }

  if (pola.indexOf("dystans") !== -1) {
    dystans = zrobPoleLiczbowe("Dystans", aktywnosc.dystans ? aktywnosc.dystans.wartosc : 0, true);
    dystansJedn = zrobWyborJednostkiZ("Jednostka", [["km", "kilometry"], ["m", "metry"]], aktywnosc.dystans ? aktywnosc.dystans.jednostka : "km");
    const rzad = zrobRzad();
    rzad.appendChild(dystans.blok);
    rzad.appendChild(dystansJedn.blok);
    karta.appendChild(rzad);
  }

  if (pola.indexOf("czas") !== -1) {
    czas = zrobPoleLiczbowe("Czas", aktywnosc.czas ? aktywnosc.czas.wartosc : 0, true);
    czasJedn = zrobWyborJednostkiZ("Jednostka", [["min", "minuty"], ["s", "sekundy"]], aktywnosc.czas ? aktywnosc.czas.jednostka : "min");
    const rzad = zrobRzad();
    rzad.appendChild(czas.blok);
    rzad.appendChild(czasJedn.blok);
    karta.appendChild(rzad);
  }

  karta.appendChild(blad);

  return {
    sesja: true,
    karta: karta,
    cwiczenie: { nazwa: opisAktywnosci(aktywnosc).tytul },
    odczytaj: function () {
      const wynik = {};
      if (styl) {
        if (styl.value === "") {
          blad.textContent = "Wybierz styl.";
          return null;
        }
        wynik.styl = styl.value;
      }
      if (dlugosci) {
        const d = Number(dlugosci.pole.value);
        if (!(d >= 1) || Math.floor(d) !== d) {
          blad.textContent = "Wpisz liczbę długości basenu (co najmniej 1).";
          return null;
        }
        wynik.dlugosci = d;
      }
      if (dystans || czas) {
        const dyst = dystans ? Number(dystans.pole.value) : 0;
        const cz = czas ? Number(czas.pole.value) : 0;
        if (!(dyst >= 0) || !(cz >= 0) || (!(dyst > 0) && !(cz > 0))) {
          blad.textContent = "Wpisz dystans lub czas (albo oba), większe od zera.";
          return null;
        }
        wynik.dystans = dyst > 0 ? { wartosc: dyst, jednostka: dystansJedn.wybor.value } : null;
        wynik.czas = cz > 0 ? { wartosc: cz, jednostka: czasJedn.wybor.value } : null;
      }
      blad.textContent = "";
      return wynik;
    }
  };
}

function otworzParametry(aktywnosc) {
  kr2Aktywnosc = aktywnosc;
  const trening = znajdzTrening(aktywnosc.treningId);
  kr2ParametryTytul.textContent = "Parametry: " + opisAktywnosci(aktywnosc).tytul;
  kr2BladParametrow.textContent = "";
  kr2ParametryLista.innerHTML = "";
  kr2Odczyty = [];

  // Sesja (bieganie, basen): jedna karta z celem, bez ćwiczeń
  if (!wymagaTreningu(aktywnosc)) {
    const wpis = zrobKarteSesji(aktywnosc);
    kr2Odczyty.push(wpis);
    kr2ParametryLista.appendChild(wpis.karta);
    kr2ParametryGotowe.hidden = false;
    pokazWidokKroku2("parametry");
    return;
  }

  const cwiczenia = trening ? cwiczeniaTreningu(trening) : [];
  if (cwiczenia.length === 0) {
    const komunikat = document.createElement("p");
    komunikat.className = "opis";
    komunikat.textContent = "Ten trening nie ma już żadnych ćwiczeń. Wróć i wybierz inny trening.";
    kr2ParametryLista.appendChild(komunikat);
  }

  cwiczenia.forEach(function (cwiczenie) {
    const wpis = zrobKarteParametrow(aktywnosc, cwiczenie);
    kr2Odczyty.push(wpis);
    kr2ParametryLista.appendChild(wpis.karta);
  });

  kr2ParametryGotowe.hidden = cwiczenia.length === 0;
  pokazWidokKroku2("parametry");
}

// Sprawdza wszystkie karty i zapisuje parametry w aktywności
function zapiszParametry() {
  const wyniki = {};
  let pierwszyBlad = null;

  if (kr2Odczyty.length === 1 && kr2Odczyty[0].sesja) {
    const cel = kr2Odczyty[0].odczytaj();
    if (cel === null) {
      kr2BladParametrow.textContent = "Popraw zaznaczone pole.";
      return;
    }
    Object.keys(cel).forEach(function (klucz) {
      kr2Aktywnosc[klucz] = cel[klucz];
    });
    zapiszSzkic();
    rysujKrok2();
    return;
  }

  kr2Odczyty.forEach(function (wpis) {
    const ilosc = wpis.odczytaj();
    if (ilosc === null) {
      if (pierwszyBlad === null) {
        pierwszyBlad = wpis;
      }
    } else {
      wyniki[wpis.cwiczenie.id] = ilosc;
    }
  });

  if (pierwszyBlad) {
    kr2BladParametrow.textContent = "Popraw ćwiczenie: " + pierwszyBlad.cwiczenie.nazwa + ".";
    pierwszyBlad.karta.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  kr2Aktywnosc.parametry = wyniki;
  zapiszSzkic();
  rysujKrok2();
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

  if (typeof rysujTreningi === "function") {
    rysujTreningi();
  }
  wybierzTrening(kr2Aktywnosc, trening.id);
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

  const bezParametrow = szkic.aktywnosci.filter(function (aktywnosc) {
    if (!wymagaTreningu(aktywnosc)) {
      return !celSesjiUstawiony(aktywnosc);
    }
    return cwiczeniaBezParametrow(aktywnosc).length > 0;
  });
  if (bezParametrow.length > 0) {
    const nazwy = bezParametrow.map(function (aktywnosc) {
      return opisAktywnosci(aktywnosc).tytul;
    });
    kr2Blad.textContent = "Ustaw parametry dla: " + nazwy.join(", ") + ".";
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
      cwiczeniaTreningu(trening).forEach(function (cwiczenie) {
        const ilosc = (aktywnosc.parametry || {})[cwiczenie.id];
        dodajLinie(karta, "• " + cwiczenie.nazwa + (ilosc ? " — " + opisIlosci(ilosc) : ""));
      });
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
kr2ParametryGotowe.addEventListener("click", zapiszParametry);
kr2ParametryWroc.addEventListener("click", rysujKrok2);
kr2Dalej.addEventListener("click", dalejZKroku2);
kr3Wroc.addEventListener("click", function () {
  pokazKrok(2);
});
