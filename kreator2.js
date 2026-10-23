// ===== Kreator planu, krok 2: kalendarz =====
// Siatka dni z kolorowymi znacznikami sesji. Po dotknięciu dnia otwiera się panel,
// w którym dodajesz sesje, wybierasz trening i ustawiasz parametry każdej sesji osobno.
// Sesje zapisujemy w szkicu: szkic.sesje = [{ id, aktywnoscId, dzien, treningId, parametry, ... }].
// Bieganie i basen nie mają treningu: ich cel (dystans, czas, styl, długości) leży w samej sesji.

// ===== Elementy strony =====

// Kalendarz
const kalLegenda = document.getElementById("kal-legenda");
const kalSiatka = document.getElementById("kal-siatka");
const kalPodsumowanie = document.getElementById("kal-podsumowanie");
const kalBlad = document.getElementById("kal-blad");
const kalPropozycja = document.getElementById("kal-propozycja");
const kalZapisz = document.getElementById("kal-zapisz");

// Panel dnia
const arkuszTlo = document.getElementById("arkusz-tlo");
const arkuszTresc = document.getElementById("arkusz-tresc");
const pdTytul = document.getElementById("pd-tytul");
const pdPodtytul = document.getElementById("pd-podtytul");
const pdSesje = document.getElementById("pd-sesje");
const pdDodaj = document.getElementById("pd-dodaj");
const pdZamknij = document.getElementById("pd-zamknij");
const pdWybor = document.getElementById("pd-wybor-aktywnosci");
const pdDodajAnuluj = document.getElementById("pd-dodaj-anuluj");
const pdSesjaTytul = document.getElementById("pd-sesja-tytul");
const pdSesjaTrening = document.getElementById("pd-sesja-trening");
const pdSesjaParametry = document.getElementById("pd-sesja-parametry");
const pdSesjaBlad = document.getElementById("pd-sesja-blad");
const pdSesjaInfo = document.getElementById("pd-sesja-info");
const pdSesjaZapisz = document.getElementById("pd-sesja-zapisz");
const pdSesjaKopiuj = document.getElementById("pd-sesja-kopiuj");
const pdSesjaWroc = document.getElementById("pd-sesja-wroc");
const pdSesjaUsun = document.getElementById("pd-sesja-usun");
const pdSesjaPrzenies = document.getElementById("pd-sesja-przenies");
const pdPrzeniesOpis = document.getElementById("pd-przenies-opis");
const pdPrzeniesLista = document.getElementById("pd-przenies-lista");
const pdPrzeniesWstecz = document.getElementById("pd-przenies-wstecz");

// Widoki panelu
const pdWidoki = {
  dzien: document.getElementById("pd-widok-dzien"),
  dodaj: document.getElementById("pd-widok-dodaj"),
  sesja: document.getElementById("pd-widok-sesja"),
  przenies: document.getElementById("pd-widok-przenies"),
  wybor: document.getElementById("pd-widok-wybor"),
  budowa: document.getElementById("pd-widok-budowa")
};

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
const kr2Szukaj = document.getElementById("kr2-szukaj");
const kr2SzukajTreningow = document.getElementById("kr2-szukaj-treningow");
const kr2Wybrano = document.getElementById("kr2-wybrano");
const kr2BladBudowy = document.getElementById("kr2-blad-budowy");
const kr2Zapisz = document.getElementById("kr2-zapisz");
const kr2Anuluj = document.getElementById("kr2-anuluj");

// Okno zmiany liczby sesji
const oknoLiczbyTlo = document.getElementById("okno-liczby-tlo");
const olKwadrat = document.getElementById("ol-kwadrat");
const olTytul = document.getElementById("ol-tytul");
const olLiczba = document.getElementById("ol-liczba");
const olMniej = document.getElementById("ol-mniej");
const olWiecej = document.getElementById("ol-wiecej");
const olInfo = document.getElementById("ol-info");
const olAnuluj = document.getElementById("ol-anuluj");
const olZapisz = document.getElementById("ol-zapisz");
const olUsun = document.getElementById("ol-usun");

// ===== Stan =====

const NAZWY_DNI = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];
const MAX_SESJI = 60;

let pdDzien = null;          // indeks dnia, którego panel jest otwarty
let pdWidok = "dzien";       // aktywny widok panelu
let pdSesja = null;          // sesja, którą teraz edytujemy
let kr2Aktywnosc = null;     // aktywność, dla której wybieramy trening
let kr2BudowaIds = [];       // ćwiczenia budowanego treningu
let kr2Odczyty = [];         // odczyty pól parametrów edytowanej sesji
let olAktywnosc = null;      // aktywność w oknie liczby sesji
let olWartosc = 0;

// ===== Pomocnicze: aktywności, sesje, daty =====

function znajdzAktywnosc(id) {
  return szkic.aktywnosci.find(function (a) {
    return a.id === id;
  });
}

function sesjeAktywnosci(aktywnosc) {
  return szkic.sesje.filter(function (s) {
    return s.aktywnoscId === aktywnosc.id;
  });
}

function kolorAktywnosci(aktywnosc) {
  if (aktywnosc.kolor) {
    return aktywnosc.kolor;
  }
  const indeks = Math.max(0, szkic.aktywnosci.indexOf(aktywnosc));
  return KOLORY_AKTYWNOSCI[indeks % KOLORY_AKTYWNOSCI.length];
}

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

// Czy cel sesji (bieganie, basen) jest ustawiony
function celUstawiony(sesja, aktywnosc) {
  const rodzaj = znajdzKategorie(aktywnosc.rodzajId);
  const pola = rodzaj && rodzaj.polaPlanu ? rodzaj.polaPlanu : [];
  if ((pola.indexOf("styl") !== -1 || pola.indexOf("dlugosci") !== -1) && !(sumaDlugosci(sesja) >= 1)) {
    return false;
  }
  if (pola.indexOf("dystans") !== -1 || pola.indexOf("czas") !== -1 || pola.indexOf("kroki") !== -1) {
    if (!sesja.dystans && !sesja.czas && !sesja.kroki) {
      return false;
    }
  }
  return true;
}

// Czy sesja ma trening i parametry wszystkich ćwiczeń (albo cel, dla biegania i basenu)
function sesjaGotowa(sesja) {
  const aktywnosc = znajdzAktywnosc(sesja.aktywnoscId);
  if (!aktywnosc) {
    return false;
  }
  if (!wymagaTreningu(aktywnosc)) {
    return celUstawiony(sesja, aktywnosc);
  }
  const trening = znajdzTrening(sesja.treningId);
  if (!trening) {
    return false;
  }
  const cwiczenia = cwiczeniaTreningu(trening);
  if (cwiczenia.length === 0) {
    return false;
  }
  const parametry = sesja.parametry || {};
  return cwiczenia.every(function (cwiczenie) {
    return !!parametry[cwiczenie.id];
  });
}

// Numer sesji wśród sesji tej samej aktywności, według dni (1, 2, 3...)
function numerSesji(sesja) {
  const aktywnosc = znajdzAktywnosc(sesja.aktywnoscId);
  const wszystkie = sesjeAktywnosci(aktywnosc).slice().sort(function (a, b) {
    return a.dzien - b.dzien || (a.id < b.id ? -1 : 1);
  });
  return wszystkie.indexOf(sesja) + 1;
}

function dzisISO() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function dataDnia(indeks) {
  const d = new Date(szkic.start + "T12:00:00");
  d.setDate(d.getDate() + indeks);
  return d;
}

function etykietaDaty(d) {
  return d.getDate() + "." + (d.getMonth() + 1);
}

// Tekst o sesji do kart w panelu dnia
function opisSesji(sesja) {
  const aktywnosc = znajdzAktywnosc(sesja.aktywnoscId);
  if (wymagaTreningu(aktywnosc)) {
    const trening = znajdzTrening(sesja.treningId);
    return trening ? "Trening: " + trening.nazwa : "Nie wybrano treningu";
  }
  const czesci = [];
  if (etapySesji(sesja).length > 0) {
    czesci.push(opisEtapow(sesja));
  }
  if (sesja.kroki) {
    czesci.push(opisKrokow(sesja.kroki));
  }
  if (sesja.dystans) {
    czesci.push(sesja.dystans.wartosc + " " + sesja.dystans.jednostka);
  }
  if (sesja.czas) {
    czesci.push(sesja.czas.wartosc + " " + sesja.czas.jednostka);
  }
  return czesci.length > 0 ? czesci.join(" · ") : "Cel: do ustawienia";
}

// Dodaje do karty dodatkową linię tekstu pod nazwą
function dodajLinie(karta, tekst) {
  const linia = document.createElement("div");
  linia.className = "karta-opis";
  linia.textContent = tekst;
  karta.firstChild.appendChild(linia);
}

// Czy ćwiczenie pasuje do aktywności: po partii (np. Plecy) albo po rodzaju (np. Rozciąganie)
function pasujeDoAktywnosci(cwiczenie, aktywnosc) {
  if (aktywnosc.ogolny) {
    return cwiczenie.rodzajId === aktywnosc.rodzajId;
  }
  const partie = partieAktywnosci(aktywnosc);
  if (partie.length > 0) {
    return partie.some(function (id) {
      return (cwiczenie.partieIds || []).indexOf(id) !== -1;
    });
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

// Mały kolorowy kwadracik (znacznik sesji)
function zrobZnacznik(kolor, pelny) {
  const znacznik = document.createElement("i");
  znacznik.className = "znacznik" + (pelny ? "" : " pusty");
  if (pelny) {
    znacznik.style.background = kolor;
  } else {
    znacznik.style.borderColor = kolor;
  }
  return znacznik;
}

// ===== Kalendarz =====

function rysujKalendarz() {
  kalBlad.textContent = "";
  // Jeśli nic jeszcze nie rozłożono, plan zaczyna się dzisiaj
  if (!szkic.start || (szkic.sesje.length === 0 && !szkic.edytowanyPlanId)) {
    szkic.start = dzisISO();
    zapiszSzkic();
  }

  // Legenda: aktywności z licznikami "rozłożone / wszystkie"
  kalLegenda.innerHTML = "";
  szkic.aktywnosci.forEach(function (aktywnosc) {
    const rozlozone = sesjeAktywnosci(aktywnosc).length;
    const chip = document.createElement("button");
    chip.className = "legenda-chip";
    chip.appendChild(zrobZnacznik(kolorAktywnosci(aktywnosc), true));
    const opis = opisAktywnosci(aktywnosc);
    const tekst = document.createElement("span");
    tekst.textContent = opis.tytul + " " + rozlozone + "/" + aktywnosc.razy + (rozlozone >= aktywnosc.razy ? " ✓" : "");
    chip.appendChild(tekst);
    chip.setAttribute("aria-label", "Zmień liczbę sesji: " + opis.tytul);
    chip.addEventListener("click", function () {
      otworzOknoLiczby(aktywnosc);
    });
    kalLegenda.appendChild(chip);
  });

  // Siatka: puste pola przed pierwszym dniem (tydzień zaczyna się w poniedziałek)
  kalSiatka.innerHTML = "";
  const liczbaDni = DNI_W_OKRESIE[szkic.okres];
  const przesuniecie = (dataDnia(0).getDay() + 6) % 7;
  for (let i = 0; i < przesuniecie; i++) {
    kalSiatka.appendChild(document.createElement("div"));
  }

  for (let dzien = 0; dzien < liczbaDni; dzien++) {
    const data = dataDnia(dzien);
    const kafelek = document.createElement("button");
    kafelek.className = "kafelek" + (pdDzien === dzien && !arkuszTlo.hidden ? " wybrany" : "");
    kafelek.setAttribute("aria-label", NAZWY_DNI[data.getDay()] + " " + etykietaDaty(data));

    const numer = document.createElement("span");
    numer.className = "kafelek-numer";
    numer.textContent = (dzien === 0 || data.getDate() === 1) ? etykietaDaty(data) : String(data.getDate());
    kafelek.appendChild(numer);

    const znaczniki = document.createElement("span");
    znaczniki.className = "kafelek-znaczniki";
    const sesjeDnia = szkic.sesje.filter(function (s) {
      return s.dzien === dzien;
    });
    sesjeDnia.slice(0, 3).forEach(function (sesja, indeks) {
      if (indeks === 2 && sesjeDnia.length > 3) {
        const plus = document.createElement("b");
        plus.textContent = "+";
        znaczniki.appendChild(plus);
        return;
      }
      const aktywnosc = znajdzAktywnosc(sesja.aktywnoscId);
      znaczniki.appendChild(zrobZnacznik(aktywnosc ? kolorAktywnosci(aktywnosc) : "#888", sesjaGotowa(sesja)));
    });
    kafelek.appendChild(znaczniki);

    kafelek.addEventListener("click", function () {
      otworzPanel(dzien);
    });
    kalSiatka.appendChild(kafelek);
  }

  // Podsumowanie braków
  const doRozlozenia = szkic.aktywnosci.reduce(function (suma, a) {
    return suma + Math.max(0, a.razy - sesjeAktywnosci(a).length);
  }, 0);
  const doUzupelnienia = szkic.sesje.filter(function (s) {
    return !sesjaGotowa(s);
  }).length;

  const braki = [];
  if (doRozlozenia > 0) {
    braki.push(doRozlozenia + " do rozłożenia");
  }
  if (doUzupelnienia > 0) {
    braki.push(doUzupelnienia + " do uzupełnienia");
  }
  kalPodsumowanie.textContent = braki.length > 0
    ? "Do zapisania brakuje: " + braki.join(", ") + "."
    : "Wszystko gotowe. Możesz zapisać plan.";
  kalZapisz.classList.toggle("wylaczony", braki.length > 0);
  kalPropozycja.hidden = doRozlozenia === 0;
}

// ===== Panel dnia =====

function pokazWidokPanelu(nazwa) {
  pdWidok = nazwa;
  Object.keys(pdWidoki).forEach(function (klucz) {
    pdWidoki[klucz].hidden = klucz !== nazwa;
  });
  arkuszTresc.scrollTop = 0;
}

function otworzPanel(dzien) {
  pdDzien = dzien;
  arkuszTlo.hidden = false;
  rysujPanelDnia();
  pokazWidokPanelu("dzien");
  rysujKalendarz();
}

function zamknijPanel() {
  arkuszTlo.hidden = true;
  pdSesja = null;
  rysujKalendarz();
}

// Nagłówek panelu: data i liczba sesji w tym dniu
function odswiezNaglowekPanelu() {
  const data = dataDnia(pdDzien);
  pdTytul.textContent = NAZWY_DNI[data.getDay()] + " " + etykietaDaty(data);
  const liczba = szkic.sesje.filter(function (s) {
    return s.dzien === pdDzien;
  }).length;
  pdPodtytul.textContent = liczba === 0
    ? "Odpoczynek"
    : liczba + " " + odmiana(liczba, "sesja", "sesje", "sesji");
}

function rysujPanelDnia() {
  odswiezNaglowekPanelu();
  const sesjeDnia = szkic.sesje.filter(function (s) {
    return s.dzien === pdDzien;
  });

  pdSesje.innerHTML = "";
  sesjeDnia.forEach(function (sesja) {
    const aktywnosc = znajdzAktywnosc(sesja.aktywnoscId);
    if (!aktywnosc) {
      return;
    }
    const tytul = opisAktywnosci(aktywnosc).tytul + " " + numerSesji(sesja) + " z " + aktywnosc.razy;
    const karta = zrobKarte(tytul, opisSesji(sesja));
    const gotowa = sesjaGotowa(sesja);
    dodajLinie(karta, gotowa ? "Gotowe ✓" : "Do uzupełnienia");
    karta.classList.add("karta-sesji");
    karta.style.borderLeftColor = kolorAktywnosci(aktywnosc);
    if (sesjaMaPostep(sesja)) {
      // Sesja z zapisanym postępem zostaje bez zmian, żeby nie zepsuć historii
      dodajLinie(karta, "Ma zapisany postęp, nie można jej zmienić");
    } else {
      karta.appendChild(
        przyciskAkcji("Edytuj", "", function () {
          otworzSesje(sesja);
        })
      );
      karta.appendChild(
        przyciskAkcji("Przenieś", "", function () {
          otworzPrzenoszenie(sesja);
        })
      );
      karta.appendChild(
        przyciskAkcji("Usuń", "usun", function () {
          pdSesja = sesja;
          usunSesje();
        })
      );
    }
    pdSesje.appendChild(karta);
  });
}

// ===== Panel: przenoszenie sesji na inny dzień =====

function otworzPrzenoszenie(sesja) {
  pdSesja = sesja;
  const aktywnosc = znajdzAktywnosc(sesja.aktywnoscId);
  pdPrzeniesOpis.textContent = "Sesja: " + opisAktywnosci(aktywnosc).tytul + ". Wybierz dzień, na który ją przenosisz.";
  pdPrzeniesLista.innerHTML = "";
  const liczbaDni = DNI_W_OKRESIE[szkic.okres];
  for (let dzien = 0; dzien < liczbaDni; dzien++) {
    const data = dataDnia(dzien);
    const tamSesje = szkic.sesje.filter(function (s) {
      return s.dzien === dzien && s !== sesja;
    });
    const opis = tamSesje.length === 0
      ? "wolny dzień"
      : tamSesje.map(function (s) {
        const akt = znajdzAktywnosc(s.aktywnoscId);
        return akt ? opisAktywnosci(akt).tytul + " " + numerSesji(s) + "/" + akt.razy : "?";
      }).join(" · ");
    const karta = zrobKarte(NAZWY_DNI[data.getDay()] + " " + etykietaDaty(data), opis);
    if (dzien === sesja.dzien) {
      karta.classList.add("przygaszona");
      dodajLinie(karta, "Tu jest teraz");
    } else {
      karta.appendChild(
        przyciskAkcji("Przenieś", "", function () {
          przeniesSesje(sesja, dzien);
        })
      );
    }
    pdPrzeniesLista.appendChild(karta);
  }
  pokazWidokPanelu("przenies");
}

function przeniesSesje(sesja, dzien) {
  sesja.dzien = dzien;
  pdDzien = dzien;
  pdSesja = null;
  zapiszSzkic();
  rysujPanelDnia();
  pokazWidokPanelu("dzien");
  rysujKalendarz();
}

// ===== Panel: dodawanie sesji =====

function otworzDodawanie() {
  pdWybor.innerHTML = "";
  szkic.aktywnosci.forEach(function (aktywnosc) {
    const zostalo = aktywnosc.razy - sesjeAktywnosci(aktywnosc).length;
    const opis = opisAktywnosci(aktywnosc);
    const karta = zrobKarte(
      opis.tytul,
      zostalo > 0 ? "Zostało " + zostalo + " z " + aktywnosc.razy : "Wszystkie sesje rozłożone ✓"
    );
    karta.style.borderLeftColor = kolorAktywnosci(aktywnosc);
    karta.classList.add("karta-sesji");
    if (zostalo > 0) {
      karta.appendChild(
        przyciskAkcji("Dodaj", "", function () {
          const sesja = nowaSesja(aktywnosc, pdDzien);
          szkic.sesje.push(sesja);
          zapiszSzkic();
          otworzSesje(sesja);
          rysujKalendarz();
        })
      );
    } else {
      karta.classList.add("przygaszona");
    }
    pdWybor.appendChild(karta);
  });

  if (szkic.aktywnosci.length === 0) {
    const info = document.createElement("p");
    info.className = "opis";
    info.textContent = "Nie ma jeszcze aktywności. Dodaj je w kroku 1.";
    pdWybor.appendChild(info);
  }
  pokazWidokPanelu("dodaj");
}

function nowaSesja(aktywnosc, dzien) {
  return {
    id: "se-" + Date.now() + "-" + Math.floor(Math.random() * 100000),
    aktywnoscId: aktywnosc.id,
    dzien: dzien,
    treningId: null,
    parametry: {},
    styl: null,
    etapy: null,
    dlugosci: null,
    dystans: null,
    kroki: null,
    czas: null
  };
}

// ===== Panel: edycja jednej sesji =====

// Lista wyboru jednostki z opcji [[wartość, nazwa], ...]
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

function zrobRzad() {
  const rzad = document.createElement("div");
  rzad.className = "rzad";
  return rzad;
}

// Podpowiedź startowa dla ćwiczenia: zapisane w sesji, albo stara ilość z bazy, albo zera
function ilosciStartowa(sesja, cwiczenie, miara) {
  const zapisane = (sesja.parametry || {})[cwiczenie.id];
  if (zapisane) {
    return zapisane;
  }
  const stara = cwiczenie.ilosc;
  if (stara) {
    if (miara === "statyczna" && (stara.typ === "czas-powtorzenia" || stara.typ === "czas-serie")) {
      return stara;
    }
    if (miara === "serie" && (stara.typ === "powtorzenia" || stara.typ === "serie-lista" || stara.typ === "czas")) {
      return stara;
    }
  }
  return null;
}

// Karta z polami parametrów jednego ćwiczenia. Zwraca { cwiczenie, karta, odczytaj }.
// odczytaj() zwraca ilość albo null (i pokazuje błąd w karcie).
function zrobKarteParametrow(sesja, cwiczenie) {
  const rodzaj = znajdzKategorie(cwiczenie.rodzajId);
  const miara = rodzaj ? rodzaj.miara : "serie";
  const start = ilosciStartowa(sesja, cwiczenie, miara);

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

  // Adnotacja o poprzednim wykonaniu tego ćwiczenia (też z zakończonych planów)
  const ostatnio = typeof tekstOstatnio === "function" ? tekstOstatnio(cwiczenie.id, sesja.id) : "";
  if (ostatnio) {
    karta.appendChild(tekstElement("div", "ostatnio-info", ostatnio));
  }

  const blad = document.createElement("p");
  blad.className = "blad";

  let odczytaj;

  if (miara === "statyczna") {
    // Startowe czasy: z zapisanej ilości (jeden czas albo lista)
    const czasyStart = start ? listaCzasow(start) : [];
    const jednStart = start ? jednostkaCzasu(start) : "s";

    const trybBlok = document.createElement("div");
    const trybOpis = document.createElement("label");
    trybOpis.textContent = "Normy czasowe";
    const tryb = document.createElement("select");
    [["jedna", "Taki sam czas w każdej serii"], ["lista", "Różne czasy w seriach"]].forEach(function (para) {
      const opcja = document.createElement("option");
      opcja.value = para[0];
      opcja.textContent = para[1];
      tryb.appendChild(opcja);
    });
    tryb.value = start && start.typ === "czas-serie" ? "lista" : "jedna";
    trybBlok.appendChild(trybOpis);
    trybBlok.appendChild(tryb);
    karta.appendChild(trybBlok);

    const pow = zrobPoleLiczbowe("Powtórzenia", start && start.typ === "czas-powtorzenia" ? start.powtorzenia : 0, false);
    const czas = zrobPoleLiczbowe("Czas jednego powtórzenia", start && start.typ === "czas-powtorzenia" ? start.czas.wartosc : 0, true);
    const jedn = zrobWyborJednostkiZ("Jednostka czasu", [["s", "sekundy"], ["min", "minuty"]], jednStart);
    const rzad1 = zrobRzad();
    rzad1.appendChild(pow.blok);
    rzad1.appendChild(czas.blok);

    // Czasy osobno dla każdej serii
    const rzadLista = document.createElement("div");
    let polaCzasow = [];
    const odczytajCzasy = function () {
      return polaCzasow.map(function (p) {
        return Number(p.pole.value) || 0;
      });
    };
    const rysujCzasy = function (czasy) {
      rzadLista.innerHTML = "";
      polaCzasow = [];
      czasy.forEach(function (ile, i) {
        const pole = zrobPoleLiczbowe("Seria " + (i + 1), ile, true);
        polaCzasow.push(pole);
        rzadLista.appendChild(pole.blok);
      });
      const przyciski = document.createElement("div");
      const dodaj = document.createElement("button");
      dodaj.type = "button";
      dodaj.className = "akcja";
      dodaj.textContent = "+ seria";
      dodaj.addEventListener("click", function () {
        const l = odczytajCzasy();
        l.push(l.length > 0 ? l[l.length - 1] || 0 : 0);
        rysujCzasy(l);
      });
      const usun = document.createElement("button");
      usun.type = "button";
      usun.className = "akcja usun";
      usun.textContent = "− seria";
      usun.disabled = czasy.length <= 1;
      usun.addEventListener("click", function () {
        const l = odczytajCzasy();
        l.pop();
        rysujCzasy(l);
      });
      przyciski.appendChild(dodaj);
      przyciski.appendChild(usun);
      rzadLista.appendChild(przyciski);
    };
    rysujCzasy(czasyStart.length > 0 ? czasyStart.slice() : [0, 0, 0]);

    const rzad2 = zrobRzad();
    rzad2.appendChild(jedn.blok);
    karta.appendChild(rzad1);
    karta.appendChild(rzadLista);
    karta.appendChild(rzad2);

    let poprzedniTryb = tryb.value;
    const pokazTryb = function () {
      // Przy przełączeniu przepisujemy wartości między polami
      if (tryb.value === "lista" && poprzedniTryb === "jedna") {
        const s = Math.max(1, Number(pow.pole.value) || 1);
        rysujCzasy(new Array(s).fill(Number(czas.pole.value) || 0));
      }
      if (tryb.value === "jedna" && poprzedniTryb === "lista") {
        const l = odczytajCzasy();
        pow.pole.value = String(l.length);
        czas.pole.value = String(l[0] || 0);
      }
      poprzedniTryb = tryb.value;
      rzad1.hidden = tryb.value !== "jedna";
      rzadLista.hidden = tryb.value !== "lista";
    };
    tryb.addEventListener("change", pokazTryb);
    pokazTryb();

    odczytaj = function () {
      if (tryb.value === "lista") {
        const l = odczytajCzasy();
        if (l.length < 1 || !l.every(function (x) { return x > 0; })) {
          return "Wpisz czas większy od zera w każdej serii.";
        }
        return { typ: "czas-serie", czasy: l, jednostka: jedn.wybor.value };
      }
      const p = Number(pow.pole.value);
      const c = Number(czas.pole.value);
      if (!(p >= 1) || Math.floor(p) !== p || !(c > 0)) {
        return "Wpisz liczbę powtórzeń i czas, większe od zera.";
      }
      return { typ: "czas-powtorzenia", powtorzenia: p, czas: { wartosc: c, jednostka: jedn.wybor.value } };
    };
  } else {
    const typBlok = document.createElement("div");
    const typOpis = document.createElement("label");
    typOpis.textContent = "Miara ćwiczenia";
    const typ = document.createElement("select");
    [["powtorzenia", "Serie i powtórzenia"], ["lista", "Różne powtórzenia w seriach"], ["czas", "Czas"]].forEach(function (para) {
      const opcja = document.createElement("option");
      opcja.value = para[0];
      opcja.textContent = para[1];
      typ.appendChild(opcja);
    });
    typ.value = start && start.typ === "czas" ? "czas" : start && start.typ === "serie-lista" ? "lista" : "powtorzenia";
    typBlok.appendChild(typOpis);
    typBlok.appendChild(typ);
    karta.appendChild(typBlok);

    const serie = zrobPoleLiczbowe("Serie", start && start.typ === "powtorzenia" ? start.serie : 0, false);
    const pow = zrobPoleLiczbowe("Powtórzenia", start && start.typ === "powtorzenia" ? start.powtorzenia : 0, false);
    const rzadSerie = zrobRzad();
    rzadSerie.appendChild(serie.blok);
    rzadSerie.appendChild(pow.blok);

    const czas = zrobPoleLiczbowe("Czas", start && start.typ === "czas" ? start.wartosc : 0, true);
    const jedn = zrobWyborJednostkiZ("Jednostka", [["s", "sekundy"], ["min", "minuty"]], start && start.typ === "czas" ? start.jednostka : "s");
    const rzadCzas = zrobRzad();
    rzadCzas.appendChild(czas.blok);
    rzadCzas.appendChild(jedn.blok);

    // Powtórzenia osobno dla każdej serii
    const rzadLista = document.createElement("div");
    let polaSerii = [];
    const rysujListeSerii = function (powtorzenia) {
      rzadLista.innerHTML = "";
      polaSerii = [];
      powtorzenia.forEach(function (ile, i) {
        const pole = zrobPoleLiczbowe("Seria " + (i + 1), ile, false);
        polaSerii.push(pole);
        rzadLista.appendChild(pole.blok);
      });
      const przyciski = document.createElement("div");
      const dodaj = document.createElement("button");
      dodaj.type = "button";
      dodaj.className = "akcja";
      dodaj.textContent = "+ seria";
      dodaj.addEventListener("click", function () {
        const lista = odczytajPolaSerii();
        lista.push(lista.length > 0 ? lista[lista.length - 1] || 0 : 0);
        rysujListeSerii(lista);
      });
      const usun = document.createElement("button");
      usun.type = "button";
      usun.className = "akcja usun";
      usun.textContent = "− seria";
      usun.disabled = powtorzenia.length <= 1;
      usun.addEventListener("click", function () {
        const lista = odczytajPolaSerii();
        lista.pop();
        rysujListeSerii(lista);
      });
      przyciski.appendChild(dodaj);
      przyciski.appendChild(usun);
      rzadLista.appendChild(przyciski);
    };
    const odczytajPolaSerii = function () {
      return polaSerii.map(function (p) {
        return Number(p.pole.value) || 0;
      });
    };
    // Lista startowa: zapisana, albo z pól "serie × powtórzenia"
    const listaStartowa = function () {
      if (start && start.typ === "serie-lista") {
        return start.powtorzenia.slice();
      }
      const s = Math.max(1, Number(serie.pole.value) || 3);
      const p = Number(pow.pole.value) || 0;
      return new Array(s).fill(p);
    };
    rysujListeSerii(listaStartowa());

    karta.appendChild(rzadSerie);
    karta.appendChild(rzadLista);
    karta.appendChild(rzadCzas);

    let poprzedniTyp = typ.value;
    const pokazPola = function () {
      // Przejście ze "zwykłych" serii na listę: przepisz wartości z pól
      if (typ.value === "lista" && poprzedniTyp === "powtorzenia") {
        const s = Math.max(1, Number(serie.pole.value) || 1);
        rysujListeSerii(new Array(s).fill(Number(pow.pole.value) || 0));
      }
      if (typ.value === "powtorzenia" && poprzedniTyp === "lista") {
        const l = odczytajPolaSerii();
        serie.pole.value = String(l.length);
        pow.pole.value = String(l[0] || 0);
      }
      poprzedniTyp = typ.value;
      rzadSerie.hidden = typ.value !== "powtorzenia";
      rzadLista.hidden = typ.value !== "lista";
      rzadCzas.hidden = typ.value !== "czas";
    };
    typ.addEventListener("change", pokazPola);
    pokazPola();

    odczytaj = function () {
      if (typ.value === "lista") {
        const l = odczytajPolaSerii();
        if (l.length < 1 || !l.every(function (x) { return x >= 1 && Math.floor(x) === x; })) {
          return "Wpisz powtórzenia większe od zera w każdej serii.";
        }
        return { typ: "serie-lista", powtorzenia: l };
      }
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

  // Ciężar w seriach: tylko dla ćwiczeń oznaczonych jako "z ciężarem"
  if (cwiczenie.zCiezarem) {
    const odczytajBaza = odczytaj;
    const startCiezary = start && Array.isArray(start.ciezary) ? start.ciezary.slice() : [];
    const maCiezar = startCiezary.some(function (c) { return c > 0; });
    const jednakowe = startCiezary.every(function (c) { return c === startCiezary[0]; });

    const blokC = document.createElement("div");
    blokC.className = "ciezar-blok";
    const opisC = document.createElement("label");
    opisC.textContent = "Ciężar";
    const trybC = document.createElement("select");
    [["brak", "Bez ciężaru"], ["jeden", "Taki sam w każdej serii"], ["lista", "Różny w seriach"]].forEach(function (para) {
      const opcja = document.createElement("option");
      opcja.value = para[0];
      opcja.textContent = para[1];
      trybC.appendChild(opcja);
    });
    trybC.value = !maCiezar ? "brak" : jednakowe ? "jeden" : "lista";
    const jedenC = zrobPoleLiczbowe("Ciężar (kg)", maCiezar ? startCiezary[0] : 0, true);
    const listaC = document.createElement("div");
    let polaC = [];

    const ileSerii = function () {
      const o = odczytajBaza();
      return o && typeof o === "object" ? liczbaSerii(o) : (polaC.length || 1);
    };
    const wartosciC = function () {
      return polaC.map(function (p) {
        return Number(p.pole.value) || 0;
      });
    };
    const rysujC = function (n, wartosci) {
      listaC.innerHTML = "";
      polaC = [];
      for (let i = 0; i < n; i++) {
        const w = i < wartosci.length ? wartosci[i] : (wartosci.length > 0 ? wartosci[wartosci.length - 1] : 0);
        const pole = zrobPoleLiczbowe("Seria " + (i + 1) + " (kg)", w, true);
        polaC.push(pole);
        listaC.appendChild(pole.blok);
      }
    };
    const odswiezC = function () {
      const n = ileSerii();
      blokC.hidden = n < 1;
      if (trybC.value === "lista" && polaC.length !== n) {
        rysujC(n, wartosciC());
      }
      jedenC.blok.hidden = trybC.value !== "jeden";
      listaC.hidden = trybC.value !== "lista";
    };
    trybC.addEventListener("change", function () {
      if (trybC.value === "lista" && polaC.length === 0) {
        rysujC(ileSerii(), new Array(1).fill(Number(jedenC.pole.value) || 0));
      }
      odswiezC();
    });
    // Liczba serii mogła się zmienić: odświeżamy pola ciężarów, zanim ktoś ich dotknie
    blokC.addEventListener("pointerdown", odswiezC, true);
    blokC.addEventListener("focusin", odswiezC);

    blokC.appendChild(opisC);
    blokC.appendChild(trybC);
    blokC.appendChild(jedenC.blok);
    blokC.appendChild(listaC);
    karta.appendChild(blokC);
    if (trybC.value === "lista") {
      rysujC(Math.max(1, liczbaSerii(start) || startCiezary.length), startCiezary);
    }
    odswiezC();

    odczytaj = function () {
      const w = odczytajBaza();
      if (typeof w === "string") {
        return w;
      }
      const n = liczbaSerii(w);
      delete w.ciezary;
      if (n < 1 || trybC.value === "brak") {
        return w;
      }
      let c;
      if (trybC.value === "jeden") {
        const v = Number(jedenC.pole.value);
        if (!(v >= 0)) {
          return "Wpisz ciężar w kg (0 albo więcej).";
        }
        c = new Array(n).fill(v);
      } else {
        const v = wartosciC();
        if (polaC.some(function (p) { return !(Number(p.pole.value) >= 0); })) {
          return "Wpisz ciężar w kg (0 albo więcej) w każdej serii.";
        }
        c = [];
        for (let i = 0; i < n; i++) {
          c.push(i < v.length ? v[i] : (v.length > 0 ? v[v.length - 1] : 0));
        }
      }
      if (c.some(function (x) { return x > 0; })) {
        w.ciezary = c;
      }
      return w;
    };
  }

  karta.appendChild(blad);

  return {
    cwiczenie: cwiczenie,
    karta: karta,
    odczytaj: function () {
      const wynik = odczytaj();
      if (typeof wynik === "string") {
        blad.textContent = wynik;
        return null;
      }
      blad.textContent = "";
      return wynik;
    }
  };
}

// Karta celu sesji: bieganie (dystans, czas) albo basen (styl, długości)
function zrobKarteSesji(sesja, aktywnosc) {
  const rodzaj = znajdzKategorie(aktywnosc.rodzajId);
  const pola = rodzaj && rodzaj.polaPlanu ? rodzaj.polaPlanu : [];

  const karta = document.createElement("div");
  karta.className = "formularz parametry-karta";
  const blad = document.createElement("p");
  blad.className = "blad";

  let styl = null;
  let dlugosci = null;
  let kroki = null;
  let dystans = null;
  let dystansJedn = null;
  let czas = null;
  let czasJedn = null;

  let wyborCwiczenia = null;
  let polaEtapow = [];
  if (pola.indexOf("styl") !== -1) {
    // Ćwiczenia basenowe z bazy, które mają zapisane style
    const basenowe = dane.cwiczenia.filter(function (c) {
      return c.rodzajId === aktywnosc.rodzajId && Array.isArray(c.style) && c.style.length > 0;
    });

    if (basenowe.length > 0) {
      const blokC = document.createElement("div");
      const opisC = document.createElement("label");
      opisC.textContent = "Ćwiczenie";
      wyborCwiczenia = document.createElement("select");
      const dowolne = document.createElement("option");
      dowolne.value = "";
      dowolne.textContent = "Dowolne (wszystkie style)";
      wyborCwiczenia.appendChild(dowolne);
      basenowe.forEach(function (c) {
        const opcja = document.createElement("option");
        opcja.value = c.id;
        opcja.textContent = c.nazwa;
        wyborCwiczenia.appendChild(opcja);
      });
      wyborCwiczenia.value = sesja.cwiczenieId && basenowe.some(function (c) { return c.id === sesja.cwiczenieId; })
        ? sesja.cwiczenieId
        : "";
      blokC.appendChild(opisC);
      blokC.appendChild(wyborCwiczenia);
      karta.appendChild(blokC);
    }

    // Długości osobno dla każdego stylu (0 = ten styl nie jest pływany)
    const blokE = document.createElement("div");
    const opisE = document.createElement("label");
    opisE.textContent = "Liczba długości basenu w każdym stylu";
    const listaE = document.createElement("div");
    blokE.appendChild(opisE);
    blokE.appendChild(listaE);
    karta.appendChild(blokE);

    const wartosci = {};
    etapySesji(sesja).forEach(function (e) {
      wartosci[e.styl] = e.dlugosci;
    });

    const rysujEtapy = function () {
      polaEtapow.forEach(function (p) {
        wartosci[p.styl] = Number(p.pole.value) || 0;
      });
      let dostepne = dane.stylePlywania;
      if (wyborCwiczenia && wyborCwiczenia.value !== "") {
        const c = basenowe.find(function (x) { return x.id === wyborCwiczenia.value; });
        if (c) {
          dostepne = c.style;
        }
      }
      listaE.innerHTML = "";
      polaEtapow = [];
      dostepne.forEach(function (nazwaStylu) {
        const pole = zrobPoleLiczbowe(nazwaStylu, wartosci[nazwaStylu] || 0, false);
        polaEtapow.push({ styl: nazwaStylu, pole: pole.pole });
        listaE.appendChild(pole.blok);
      });
    };
    rysujEtapy();
    if (wyborCwiczenia) {
      wyborCwiczenia.addEventListener("change", rysujEtapy);
    }
  }

  if (pola.indexOf("dlugosci") !== -1 && pola.indexOf("styl") === -1) {
    dlugosci = zrobPoleLiczbowe("Liczba długości basenu", sesja.dlugosci || 0, false);
    const rzad = zrobRzad();
    rzad.appendChild(dlugosci.blok);
    karta.appendChild(rzad);
  }

  if (pola.indexOf("kroki") !== -1) {
    kroki = zrobPoleLiczbowe("Kroki", sesja.kroki || 0, false);
    const rzad = zrobRzad();
    rzad.appendChild(kroki.blok);
    karta.appendChild(rzad);
  }

  if (pola.indexOf("dystans") !== -1) {
    dystans = zrobPoleLiczbowe("Dystans", sesja.dystans ? sesja.dystans.wartosc : 0, true);
    dystansJedn = zrobWyborJednostkiZ("Jednostka", [["km", "kilometry"], ["m", "metry"]], sesja.dystans ? sesja.dystans.jednostka : "km");
    const rzad = zrobRzad();
    rzad.appendChild(dystans.blok);
    rzad.appendChild(dystansJedn.blok);
    karta.appendChild(rzad);
  }

  if (pola.indexOf("czas") !== -1) {
    czas = zrobPoleLiczbowe("Czas", sesja.czas ? sesja.czas.wartosc : 0, true);
    czasJedn = zrobWyborJednostkiZ("Jednostka", [["min", "minuty"], ["s", "sekundy"]], sesja.czas ? sesja.czas.jednostka : "min");
    const rzad = zrobRzad();
    rzad.appendChild(czas.blok);
    rzad.appendChild(czasJedn.blok);
    karta.appendChild(rzad);
  }

  karta.appendChild(blad);

  return {
    sesja: true,
    karta: karta,
    odczytaj: function () {
      const wynik = {};
      if (pola.indexOf("styl") !== -1) {
        const etapy = [];
        for (let n = 0; n < polaEtapow.length; n++) {
          const d = Number(polaEtapow[n].pole.value);
          if (!(d >= 0) || Math.floor(d) !== d) {
            blad.textContent = "Długości wpisz jako liczby całe (0 = bez tego stylu).";
            return null;
          }
          if (d > 0) {
            etapy.push({ styl: polaEtapow[n].styl, dlugosci: d });
          }
        }
        if (etapy.length === 0) {
          blad.textContent = "Wpisz liczbę długości w co najmniej jednym stylu.";
          return null;
        }
        wynik.etapy = etapy;
        wynik.styl = null;
        wynik.dlugosci = null;
        wynik.cwiczenieId = wyborCwiczenia && wyborCwiczenia.value !== "" ? wyborCwiczenia.value : null;
      }
      if (dlugosci) {
        const d = Number(dlugosci.pole.value);
        if (!(d >= 1) || Math.floor(d) !== d) {
          blad.textContent = "Wpisz liczbę długości basenu (co najmniej 1).";
          return null;
        }
        wynik.dlugosci = d;
      }
      if (dystans || czas || kroki) {
        const dyst = dystans ? Number(dystans.pole.value) : 0;
        const cz = czas ? Number(czas.pole.value) : 0;
        const kr = kroki ? Number(kroki.pole.value) : 0;
        if (!(dyst >= 0) || !(cz >= 0) || !(kr >= 0) || (kr > 0 && Math.floor(kr) !== kr) || (!(dyst > 0) && !(cz > 0) && !(kr > 0))) {
          blad.textContent = kroki ? "Wpisz kroki (liczba całkowita), dystans lub czas, większe od zera." : "Wpisz dystans lub czas (albo oba), większe od zera.";
          return null;
        }
        wynik.kroki = kr > 0 ? kr : null;
        wynik.dystans = dyst > 0 ? { wartosc: dyst, jednostka: dystansJedn.wybor.value } : null;
        wynik.czas = cz > 0 ? { wartosc: cz, jednostka: czasJedn.wybor.value } : null;
      }
      blad.textContent = "";
      return wynik;
    }
  };
}

function otworzSesje(sesja) {
  pdSesja = sesja;
  odswiezNaglowekPanelu();
  const aktywnosc = znajdzAktywnosc(sesja.aktywnoscId);
  pdSesjaTytul.textContent = opisAktywnosci(aktywnosc).tytul + " " + numerSesji(sesja) + " z " + aktywnosc.razy;
  pdSesjaBlad.textContent = "";
  pdSesjaInfo.textContent = "";
  pdSesjaTrening.innerHTML = "";
  pdSesjaParametry.innerHTML = "";
  kr2Odczyty = [];

  if (wymagaTreningu(aktywnosc)) {
    const trening = znajdzTrening(sesja.treningId);
    const karta = zrobKarte(
      trening ? trening.nazwa : "Nie wybrano treningu",
      trening ? opisTreningu(trening).opis : "Wybierz gotowy trening albo zbuduj nowy."
    );
    karta.appendChild(
      przyciskAkcji(trening ? "Zmień" : "Wybierz", "", function () {
        otworzWybor(aktywnosc);
      })
    );
    pdSesjaTrening.appendChild(karta);

    if (trening) {
      const cwiczenia = cwiczeniaTreningu(trening);
      if (cwiczenia.length === 0) {
        const info = document.createElement("p");
        info.className = "opis";
        info.textContent = "Ten trening nie ma już żadnych ćwiczeń. Wybierz inny.";
        pdSesjaParametry.appendChild(info);
      }
      cwiczenia.forEach(function (cwiczenie) {
        const wpis = zrobKarteParametrow(sesja, cwiczenie);
        kr2Odczyty.push(wpis);
        pdSesjaParametry.appendChild(wpis.karta);
      });
    }
    pdSesjaZapisz.hidden = !trening || kr2Odczyty.length === 0;
  } else {
    const wpis = zrobKarteSesji(sesja, aktywnosc);
    kr2Odczyty.push(wpis);
    pdSesjaParametry.appendChild(wpis.karta);
    pdSesjaZapisz.hidden = false;
  }

  const inne = sesjeAktywnosci(aktywnosc).length - 1;
  pdSesjaKopiuj.hidden = inne < 1 || pdSesjaZapisz.hidden;
  pdSesjaKopiuj.textContent = "Kopiuj do innych sesji: " + opisAktywnosci(aktywnosc).tytul;
  pokazWidokPanelu("sesja");
}

// Sprawdza pola i zapisuje je w sesji. Zwraca true, gdy się udało.
function zapiszSesjeZPol() {
  const aktywnosc = znajdzAktywnosc(pdSesja.aktywnoscId);

  if (!wymagaTreningu(aktywnosc)) {
    const cel = kr2Odczyty[0].odczytaj();
    if (cel === null) {
      pdSesjaBlad.textContent = "Popraw zaznaczone pole.";
      return false;
    }
    Object.keys(cel).forEach(function (klucz) {
      pdSesja[klucz] = cel[klucz];
    });
    zapiszSzkic();
    return true;
  }

  const wyniki = {};
  let pierwszyBlad = null;
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
    pdSesjaBlad.textContent = "Popraw ćwiczenie: " + pierwszyBlad.cwiczenie.nazwa + ".";
    pierwszyBlad.karta.scrollIntoView({ behavior: "smooth", block: "center" });
    return false;
  }

  pdSesja.parametry = wyniki;
  zapiszSzkic();
  return true;
}

function zapiszSesje() {
  pdSesjaBlad.textContent = "";
  if (zapiszSesjeZPol()) {
    rysujPanelDnia();
    pokazWidokPanelu("dzien");
    rysujKalendarz();
  }
}

// Kopiuje trening i parametry (albo cel) tej sesji do pozostałych sesji tej samej aktywności
function kopiujDoInnych() {
  pdSesjaBlad.textContent = "";
  pdSesjaInfo.textContent = "";
  if (!zapiszSesjeZPol()) {
    return;
  }
  const aktywnosc = znajdzAktywnosc(pdSesja.aktywnoscId);
  const inne = sesjeAktywnosci(aktywnosc).filter(function (s) {
    return s !== pdSesja;
  });
  if (inne.length === 0) {
    return;
  }
  if (!confirm("Skopiować do pozostałych sesji tej aktywności (" + inne.length + ")? Ich trening i parametry zostaną nadpisane.")) {
    return;
  }
  inne.forEach(function (s) {
    if (wymagaTreningu(aktywnosc)) {
      s.treningId = pdSesja.treningId;
      s.parametry = JSON.parse(JSON.stringify(pdSesja.parametry));
    } else {
      ["styl", "etapy", "cwiczenieId", "dlugosci", "dystans", "kroki", "czas"].forEach(function (klucz) {
        s[klucz] = pdSesja[klucz] ? JSON.parse(JSON.stringify(pdSesja[klucz])) : null;
      });
    }
  });
  zapiszSzkic();
  pdSesjaInfo.textContent = "Skopiowano do pozostałych sesji (" + inne.length + ").";
  rysujKalendarz();
}

function usunSesje() {
  if (!confirm("Usunąć tę sesję z dnia?")) {
    return;
  }
  szkic.sesje = szkic.sesje.filter(function (s) {
    return s !== pdSesja;
  });
  pdSesja = null;
  zapiszSzkic();
  rysujPanelDnia();
  pokazWidokPanelu("dzien");
  rysujKalendarz();
}

// ===== Panel: wybór gotowego treningu =====

function otworzWybor(aktywnosc) {
  kr2Aktywnosc = aktywnosc;
  kr2WyborTytul.textContent = "Trening dla: " + opisAktywnosci(aktywnosc).tytul;
  kr2WszystkieTreningi.checked = false;
  kr2SzukajTreningow.value = "";
  rysujTreningiWyboru();
  pokazWidokPanelu("wybor");
}

// Przypisuje trening sesji. Parametry zostają tylko dla ćwiczeń, które są też w nowym treningu.
function wybierzTrening(treningId) {
  if (pdSesja.treningId !== treningId) {
    const trening = znajdzTrening(treningId);
    const stare = pdSesja.parametry || {};
    const nowe = {};
    cwiczeniaTreningu(trening).forEach(function (cwiczenie) {
      if (stare[cwiczenie.id]) {
        nowe[cwiczenie.id] = stare[cwiczenie.id];
      }
    });
    pdSesja.treningId = treningId;
    pdSesja.parametry = nowe;
  }
  zapiszSzkic();
  otworzSesje(pdSesja);
  rysujKalendarz();
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

  const tekstT = kr2SzukajTreningow.value.trim().toLowerCase();
  const pasujace = lista.filter(function (trening) {
    return tekstT === "" || trening.nazwa.toLowerCase().indexOf(tekstT) !== -1;
  });

  dopiszPorcjami(kr2Treningi, pasujace, function (trening) {
    const opis = opisTreningu(trening);
    const karta = zrobKarte(trening.nazwa, opis.opis);
    dodajLinie(karta, opis.nazwy);

    const wybrany = pdSesja.treningId === trening.id;
    karta.appendChild(
      przyciskAkcji(wybrany ? "Wybrano ✓" : "Wybierz", wybrany ? "wybrane" : "", function () {
        wybierzTrening(trening.id);
      })
    );
    return karta;
  }, "t|" + tekstT + "|" + wszystkie);
}

// ===== Panel: budowa nowego treningu =====

function otworzBudowe() {
  kr2BudowaIds = [];
  kr2Nazwa.value = "";
  kr2Wszystkie.checked = false;
  kr2Szukaj.value = "";
  kr2BladBudowy.textContent = "";
  kr2BudowaTytul.textContent = "Nowy trening dla: " + opisAktywnosci(kr2Aktywnosc).tytul;
  rysujBudowe();
  pokazWidokPanelu("budowa");
}

// Rysuje sugerowane ćwiczenia (pasujące do aktywności albo wszystkie z bazy)
function rysujBudowe() {
  kr2Cwiczenia.innerHTML = "";

  const tekstC = kr2Szukaj.value.trim().toLowerCase();
  const lista = dane.cwiczenia.filter(function (cwiczenie) {
    return (kr2Wszystkie.checked || pasujeDoAktywnosci(cwiczenie, kr2Aktywnosc)) &&
      (tekstC === "" || cwiczenie.nazwa.toLowerCase().indexOf(tekstC) !== -1);
  });

  if (lista.length === 0) {
    const komunikat = document.createElement("p");
    komunikat.className = "opis";
    komunikat.textContent = dane.cwiczenia.length === 0
      ? "Baza ćwiczeń jest pusta. Najpierw dodaj ćwiczenia w zakładce Ćwiczenia."
      : "Brak ćwiczeń pasujących do tej aktywności. Zaznacz „Pokaż wszystkie ćwiczenia z bazy”.";
    kr2Cwiczenia.appendChild(komunikat);
  }

  dopiszPorcjami(kr2Cwiczenia, lista, function (cwiczenie) {
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
    return karta;
  }, "c|" + tekstC + "|" + kr2Wszystkie.checked + "|" + (kr2Aktywnosc ? kr2Aktywnosc.id : ""));

  kr2Wybrano.textContent = "Wybrano: " + kr2BudowaIds.length + " " + slowoCwiczen(kr2BudowaIds.length);
}

// Zapisuje nowy trening w "Moje treningi" i od razu wybiera go dla sesji
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
  zapiszDane();

  if (typeof rysujTreningi === "function") {
    rysujTreningi();
  }
  wybierzTrening(trening.id);
}

// ===== Okno: liczba sesji aktywności =====

function otworzOknoLiczby(aktywnosc) {
  olAktywnosc = aktywnosc;
  olWartosc = aktywnosc.razy;
  olKwadrat.style.background = kolorAktywnosci(aktywnosc);
  olTytul.textContent = opisAktywnosci(aktywnosc).tytul;
  odswiezOknoLiczby();
  oknoLiczbyTlo.hidden = false;
}

function odswiezOknoLiczby() {
  const rozlozone = sesjeAktywnosci(olAktywnosc).length;
  const minimum = Math.max(1, rozlozone);
  olLiczba.textContent = String(olWartosc);
  olMniej.disabled = olWartosc <= minimum;
  olWiecej.disabled = olWartosc >= MAX_SESJI;
  olInfo.textContent = rozlozone > 0
    ? "Rozłożone w kalendarzu: " + rozlozone + " z " + olAktywnosc.razy + ". Nie możesz ustawić mniej niż " + minimum + "."
    : "Żadna sesja nie jest jeszcze rozłożona w kalendarzu.";
}

function zamknijOknoLiczby() {
  oknoLiczbyTlo.hidden = true;
  olAktywnosc = null;
}

function zapiszLiczbeSesji() {
  olAktywnosc.razy = olWartosc;
  zapiszSzkic();
  zamknijOknoLiczby();
  rysujKalendarz();
}

function usunAktywnoscZPlanu() {
  if (szkic.sesje.some(function (s) {
    return s.aktywnoscId === olAktywnosc.id && sesjaMaPostep(s);
  })) {
    alert("Ta aktywność ma już zaliczone sesje, więc nie można jej usunąć z planu.");
    return;
  }
  const rozlozone = sesjeAktywnosci(olAktywnosc).length;
  let pytanie = "Usunąć aktywność „" + opisAktywnosci(olAktywnosc).tytul + "” z planu?";
  if (rozlozone > 0) {
    pytanie += "\n\nZostaną też usunięte jej rozłożone sesje (" + rozlozone + ") z kalendarza.";
  }
  if (!confirm(pytanie)) {
    return;
  }
  const id = olAktywnosc.id;
  szkic.aktywnosci = szkic.aktywnosci.filter(function (a) {
    return a.id !== id;
  });
  szkic.sesje = szkic.sesje.filter(function (s) {
    return s.aktywnoscId !== id;
  });
  zapiszSzkic();
  zamknijOknoLiczby();
  rysujKalendarz();
}

// ===== Zaproponuj rozkład =====

// Rozkłada brakujące sesje równomiernie po okresie, możliwie w różne dni
function zaproponujRozklad() {
  kalBlad.textContent = "";
  const liczbaDni = DNI_W_OKRESIE[szkic.okres];

  const doRozlozenia = szkic.aktywnosci.map(function (a) {
    return { aktywnosc: a, ile: a.razy - sesjeAktywnosci(a).length };
  }).filter(function (x) {
    return x.ile > 0;
  });

  if (doRozlozenia.length === 0) {
    kalBlad.textContent = "Wszystkie sesje są już rozłożone.";
    return;
  }

  const lacznie = doRozlozenia.reduce(function (suma, x) {
    return suma + x.ile;
  }, 0);
  if (!confirm("Rozłożyć automatycznie brakujące sesje (" + lacznie + ")? Możesz je potem zmienić w kalendarzu.")) {
    return;
  }

  const obciazenie = [];
  for (let d = 0; d < liczbaDni; d++) {
    obciazenie.push(0);
  }
  szkic.sesje.forEach(function (s) {
    obciazenie[s.dzien] += 1;
  });

  // Najpierw aktywności z największą liczbą sesji
  doRozlozenia.sort(function (a, b) {
    return b.ile - a.ile;
  });

  doRozlozenia.forEach(function (x) {
    const aktywnosc = x.aktywnosc;
    for (let k = 0; k < x.ile; k++) {
      const numer = aktywnosc.razy - x.ile + k;
      const cel = Math.floor((numer + 0.5) * liczbaDni / aktywnosc.razy);

      let najlepszy = -1;
      let najlepszyWynik = Infinity;
      for (let d = 0; d < liczbaDni; d++) {
        const juzTa = szkic.sesje.some(function (s) {
          return s.dzien === d && s.aktywnoscId === aktywnosc.id;
        });
        // Dzień z tą samą aktywnością jest ostatecznością; puste dni mają pierwszeństwo
        const wynik = (juzTa ? 10000 : 0) + obciazenie[d] * 100 + Math.abs(d - cel);
        if (wynik < najlepszyWynik) {
          najlepszyWynik = wynik;
          najlepszy = d;
        }
      }

      szkic.sesje.push(nowaSesja(aktywnosc, najlepszy));
      obciazenie[najlepszy] += 1;
    }
  });

  zapiszSzkic();
  rysujKalendarz();
}

// ===== Zapis planu =====

function zapiszPlan() {
  kalBlad.textContent = "";
  const doRozlozenia = szkic.aktywnosci.reduce(function (suma, a) {
    return suma + Math.max(0, a.razy - sesjeAktywnosci(a).length);
  }, 0);
  const doUzupelnienia = szkic.sesje.filter(function (s) {
    return !sesjaGotowa(s);
  }).length;

  if (szkic.aktywnosci.length === 0) {
    kalBlad.textContent = "Plan nie ma żadnych aktywności. Wróć do kroku 1.";
    return;
  }
  if (doRozlozenia > 0) {
    kalBlad.textContent = "Rozłóż jeszcze sesje w kalendarzu: " + doRozlozenia + ".";
    return;
  }
  if (doUzupelnienia > 0) {
    kalBlad.textContent = "Uzupełnij trening i parametry sesji z pustymi znacznikami: " + doUzupelnienia + ".";
    return;
  }

  // Edycja zapisanego planu: podmieniamy aktywności i sesje, reszta planu zostaje
  if (szkic.edytowanyPlanId) {
    const edytowany = dane.plany.find(function (p) {
      return p.id === szkic.edytowanyPlanId;
    });
    if (edytowany) {
      edytowany.aktywnosci = JSON.parse(JSON.stringify(szkic.aktywnosci));
      edytowany.sesje = JSON.parse(JSON.stringify(szkic.sesje));
      edytowany.zmieniono = new Date().toISOString();
    }
    szkic = { okres: "tydzien", aktywnosci: [], sesje: [] };
    zapiszDane();
    zamknijKreator();
    pokazEkran("ekran-dzis");
    return;
  }

  const plan = {
    id: "pl-" + Date.now(),
    okres: szkic.okres,
    start: szkic.start,
    aktywnosci: JSON.parse(JSON.stringify(szkic.aktywnosci)),
    sesje: JSON.parse(JSON.stringify(szkic.sesje)),
    utworzono: new Date().toISOString()
  };
  // Poprzedni aktywny plan zostaje zamknięty (zostaje w historii), nowy staje się aktywny
  dane.plany.forEach(function (stary) {
    if (!stary.zamkniety) {
      stary.zamkniety = true;
      stary.zamknieto = new Date().toISOString();
    }
  });
  dane.plany.push(plan);
  dane.szkicPlanu = null;
  szkic = { okres: "tydzien", aktywnosci: [], sesje: [] };
  zapiszDane();
  zamknijKreator();
  pokazEkran("ekran-dzis");
}

// ===== Cofanie w kroku 2 =====

// Zamyka okno albo cofa o jeden widok panelu. Zwraca true, gdy coś zamknęło.
function krok2Wstecz() {
  if (!oknoLiczbyTlo.hidden) {
    zamknijOknoLiczby();
    return true;
  }
  if (arkuszTlo.hidden) {
    return false;
  }
  if (pdWidok === "budowa") {
    pokazWidokPanelu("wybor");
  } else if (pdWidok === "wybor") {
    otworzSesje(pdSesja);
  } else if (pdWidok === "sesja") {
    rysujPanelDnia();
    pokazWidokPanelu("dzien");
  } else if (pdWidok === "dodaj" || pdWidok === "przenies") {
    pokazWidokPanelu("dzien");
  } else {
    zamknijPanel();
  }
  return true;
}

// ===== Podpięcie przycisków =====

pdDodaj.addEventListener("click", otworzDodawanie);
pdDodajAnuluj.addEventListener("click", function () {
  pokazWidokPanelu("dzien");
});
pdZamknij.addEventListener("click", zamknijPanel);
arkuszTlo.addEventListener("click", function (zdarzenie) {
  if (zdarzenie.target === arkuszTlo) {
    zamknijPanel();
  }
});
pdSesjaZapisz.addEventListener("click", zapiszSesje);
pdSesjaKopiuj.addEventListener("click", kopiujDoInnych);
pdSesjaWroc.addEventListener("click", function () {
  rysujPanelDnia();
  pokazWidokPanelu("dzien");
  rysujKalendarz();
});
pdSesjaUsun.addEventListener("click", usunSesje);
pdSesjaPrzenies.addEventListener("click", function () {
  otworzPrzenoszenie(pdSesja);
});
pdPrzeniesWstecz.addEventListener("click", function () {
  pokazWidokPanelu("dzien");
});
kr2Szukaj.addEventListener("input", rysujBudowe);
kr2SzukajTreningow.addEventListener("input", rysujTreningiWyboru);

kr2Nowy.addEventListener("click", otworzBudowe);
kr2WyborWstecz.addEventListener("click", function () {
  otworzSesje(pdSesja);
});
kr2WszystkieTreningi.addEventListener("change", rysujTreningiWyboru);
kr2Wszystkie.addEventListener("change", rysujBudowe);
kr2Zapisz.addEventListener("click", zapiszNowyTrening);
kr2Anuluj.addEventListener("click", function () {
  pokazWidokPanelu("wybor");
});

olMniej.addEventListener("click", function () {
  olWartosc -= 1;
  odswiezOknoLiczby();
});
olWiecej.addEventListener("click", function () {
  olWartosc += 1;
  odswiezOknoLiczby();
});
olAnuluj.addEventListener("click", zamknijOknoLiczby);
olZapisz.addEventListener("click", zapiszLiczbeSesji);
olUsun.addEventListener("click", usunAktywnoscZPlanu);

kalPropozycja.addEventListener("click", zaproponujRozklad);
kalZapisz.addEventListener("click", zapiszPlan);
