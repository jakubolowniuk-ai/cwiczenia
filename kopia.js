// ===== Kopia zapasowa i wczytywanie ćwiczeń z pliku (w Ustawieniach) =====
// 1) Zapisz kopię: cały stan aplikacji do pliku .json (pobierany na telefon).
// 2) Wczytaj kopię: zastępuje wszystkie dane danymi z pliku kopii.
// 3) Dodaj ćwiczenia z pliku: dopisuje ćwiczenia do bazy (rodzaje i partie po nazwach).

const kopiaZapisz = document.getElementById("kopia-zapisz");
const kopiaWczytaj = document.getElementById("kopia-wczytaj");
const kopiaWczytajPlik = document.getElementById("kopia-wczytaj-plik");
const kopiaCwiczenia = document.getElementById("kopia-cwiczenia");
const kopiaCwiczeniaPlik = document.getElementById("kopia-cwiczenia-plik");
const kopiaWzor = document.getElementById("kopia-wzor");
const kopiaInfo = document.getElementById("kopia-info");

const FORMAT_KOPII = "cwiczenia-kopia";

function dataDzisTekst() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function pobierzPlik(nazwa, tekst) {
  const plik = new Blob([tekst], { type: "application/json" });
  const adres = URL.createObjectURL(plik);
  const link = document.createElement("a");
  link.href = adres;
  link.download = nazwa;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(function () {
    URL.revokeObjectURL(adres);
  }, 2000);
}

function pokazInfoKopii(tekst, blad) {
  kopiaInfo.textContent = tekst;
  kopiaInfo.classList.toggle("blad", !!blad);
}

// Odczytuje wybrany plik jako tekst i przekazuje go dalej
function odczytajPlik(wejscie, dalej) {
  const plik = wejscie.files && wejscie.files[0];
  wejscie.value = "";
  if (!plik) {
    return;
  }
  const czytnik = new FileReader();
  czytnik.onload = function () {
    dalej(String(czytnik.result));
  };
  czytnik.onerror = function () {
    pokazInfoKopii("Nie udało się odczytać pliku.", true);
  };
  czytnik.readAsText(plik);
}

// ===== 1) Zapis kopii =====

kopiaZapisz.addEventListener("click", function () {
  const paczka = { format: FORMAT_KOPII, wersja: 1, zapisano: new Date().toISOString(), dane: dane };
  pobierzPlik("cwiczenia-kopia-" + dataDzisTekst() + ".json", JSON.stringify(paczka, null, 1));
  pokazInfoKopii("Kopia pobrana: " + dane.cwiczenia.length + " ćwiczeń, " + dane.treningi.length + " treningów, " + dane.plany.length + " planów. Trzymaj plik w bezpiecznym miejscu (np. na Dysku Google).", false);
});

// ===== 2) Wczytanie kopii =====

kopiaWczytaj.addEventListener("click", function () {
  kopiaWczytajPlik.click();
});

kopiaWczytajPlik.addEventListener("change", function () {
  odczytajPlik(kopiaWczytajPlik, function (tekst) {
    let paczka;
    try {
      paczka = JSON.parse(tekst);
    } catch (blad) {
      pokazInfoKopii("To nie jest poprawny plik kopii (nie da się go odczytać).", true);
      return;
    }
    if (!paczka || paczka.format !== FORMAT_KOPII || !paczka.dane || !Array.isArray(paczka.dane.kategorie)) {
      pokazInfoKopii("To nie jest plik kopii z tej aplikacji.", true);
      return;
    }
    const d = paczka.dane;
    const liczba = function (lista) {
      return Array.isArray(lista) ? lista.length : 0;
    };
    const pytanie = "Zastąpić wszystkie dane z telefonu kopią z pliku? W kopii: " + liczba(d.cwiczenia) + " ćwiczeń, " + liczba(d.treningi) + " treningów, " + liczba(d.plany) + " planów. Obecnych danych nie da się odzyskać.";
    if (!confirm(pytanie)) {
      return;
    }
    try {
      localStorage.setItem(KLUCZ_DANYCH, JSON.stringify(uzupelnijDane(d)));
    } catch (blad) {
      pokazInfoKopii("Nie udało się zapisać danych w telefonie.", true);
      return;
    }
    location.reload();
  });
});

// ===== 3) Ćwiczenia z pliku =====

function nazwaKlucz(tekst) {
  return String(tekst || "").trim().toLowerCase();
}

// Dopisuje ćwiczenia z listy; zwraca podsumowanie
function dodajCwiczeniaZListy(lista, opcje) {
  opcje = opcje || {};
  const wynik = { dodane: 0, duplikaty: 0, bledy: [], nowePartie: [] };
  const zajete = {};
  dane.cwiczenia.forEach(function (c) {
    zajete[nazwaKlucz(c.nazwa)] = true;
  });

  lista.forEach(function (wpis, i) {
    const numer = i + 1;
    const nazwa = wpis && typeof wpis.nazwa === "string" ? wpis.nazwa.trim() : "";
    if (nazwa === "") {
      wynik.bledy.push("pozycja " + numer + ": brak nazwy");
      return;
    }
    const rodzaj = dane.kategorie.find(function (k) {
      return k.typ === "rodzaj" && nazwaKlucz(k.nazwa) === nazwaKlucz(wpis.rodzaj);
    });
    if (!rodzaj) {
      wynik.bledy.push(nazwa + ": nieznany rodzaj „" + (wpis.rodzaj || "") + "”");
      return;
    }
    const partieIds = [];
    (Array.isArray(wpis.partie) ? wpis.partie : []).forEach(function (nazwaPartii) {
      const tekst = String(nazwaPartii || "").trim();
      if (tekst === "") {
        return;
      }
      let partia = dane.kategorie.find(function (k) {
        return k.typ === "partia" && nazwaKlucz(k.nazwa) === nazwaKlucz(tekst);
      });
      if (!partia) {
        partia = { id: "partia-" + Date.now() + "-" + dane.kategorie.length, nazwa: tekst, typ: "partia" };
        dane.kategorie.push(partia);
        wynik.nowePartie.push(tekst);
      }
      if (partieIds.indexOf(partia.id) === -1) {
        partieIds.push(partia.id);
      }
    });

    // Mięśnie po nazwach; partie mięśni dopisują się automatycznie
    const miesnieIds = [];
    (Array.isArray(wpis.miesnie) ? wpis.miesnie : []).forEach(function (nazwaMiesnia) {
      const klucz = nazwaKlucz(nazwaMiesnia);
      let miesien = dane.kategorie.find(function (k) {
        return k.typ === "miesien" && nazwaKlucz(k.nazwa) === klucz;
      });
      let idy = miesien ? [miesien.id] : [];
      // Dawne nazwy z plików sprzed podziału mięśni
      if (!miesien) {
        if (klucz === "triceps") {
          idy = MIESNIE_PODZIAL["mi-triceps"];
        } else if (klucz === "skośne brzucha") {
          idy = MIESNIE_PODZIAL["mi-skosne"];
        } else if (klucz === "czworogłowy uda") {
          idy = MIESNIE_PODZIAL["mi-czworoglowy"];
        } else if (klucz === "kulszowo-goleniowe") {
          idy = MIESNIE_PODZIAL["mi-kulszowo-goleniowe"];
        } else if (klucz === "brzuchaty łydki") {
          idy = MIESNIE_PODZIAL["mi-brzuchaty-lydki"];
        } else if (klucz === "czworoboczny") {
          idy = podzielCzworoboczny(nazwa);
        } else if (klucz === "przedramiona") {
          idy = podzielPrzedramiona(nazwa);
        }
      }
      if (idy.length === 0) {
        wynik.bledy.push(nazwa + ": nieznany mięsień „" + nazwaMiesnia + "”");
        return;
      }
      idy.forEach(function (id) {
        if (miesnieIds.indexOf(id) === -1) {
          miesnieIds.push(id);
        }
      });
    });

    // Ćwiczenie już jest w bazie: uzupełniamy tylko brakujące mięśnie
    if (zajete[nazwaKlucz(nazwa)]) {
      const istniejace = dane.cwiczenia.find(function (c) {
        return nazwaKlucz(c.nazwa) === nazwaKlucz(nazwa);
      });
      if (istniejace && opcje.zBazy) {
        istniejace.zBazy = true;
      }
      // Opis z bazy: uzupełnia brakujący i aktualizuje wcześniejszy opis z bazy, ale nigdy nie nadpisuje własnego
      if (istniejace && opcje.zBazy && wpis.opis &&
          (!istniejace.opis || istniejace.opisZBazy || STARE_OPISY_START.indexOf(istniejace.opis.start) !== -1)) {
        istniejace.opis = wpis.opis;
        istniejace.opisZBazy = true;
      }
      if (istniejace && miesnieIds.length > 0 && !(istniejace.miesnieIds || []).length) {
        istniejace.miesnieIds = miesnieIds;
        istniejace.partieIds = istniejace.partieIds || [];
        partieIds.forEach(function (id) {
          if (istniejace.partieIds.indexOf(id) === -1) {
            istniejace.partieIds.push(id);
          }
        });
        wynik.uzupelnione = (wynik.uzupelnione || 0) + 1;
      } else {
        wynik.duplikaty++;
      }
      return;
    }

    if (opcje.tylkoOznacz) {
      return;
    }
    dane.cwiczenia.push({
      id: "cw-" + Date.now() + "-" + dane.cwiczenia.length,
      nazwa: nazwa,
      rodzajId: rodzaj.id,
      ilosc: null,
      partieIds: partieIds,
      miesnieIds: miesnieIds,
      link: typeof wpis.link === "string" ? wpis.link.trim() : "",
      zBazy: !!opcje.zBazy,
      opis: wpis.opis && typeof wpis.opis === "object" ? wpis.opis : undefined,
      opisZBazy: wpis.opis && opcje.zBazy ? true : undefined,
      zCiezarem: wpis.ciezar === true || (wpis.ciezar !== false && rodzaj.id === "rodzaj-cialo")
    });
    zajete[nazwaKlucz(nazwa)] = true;
    wynik.dodane++;
  });

  return wynik;
}

function dodajIPokaz(lista, opcje) {
  const w = dodajCwiczeniaZListy(lista, opcje);
  zapiszDane();
  if (typeof rysujListe === "function") {
    rysujFiltry();
    rysujListe();
  }
  if (typeof odswiezPrzelacznik === "function") {
    odswiezPrzelacznik();
  }
  let opis = "Dodano ćwiczeń: " + w.dodane + ".";
  if (w.uzupelnione > 0) {
    opis += " Uzupełniono mięśnie w istniejących ćwiczeniach: " + w.uzupelnione + ".";
  }
  if (w.duplikaty > 0) {
    opis += " Pominięto (już są w bazie): " + w.duplikaty + ".";
  }
  if (w.nowePartie.length > 0) {
    opis += " Nowe partie: " + w.nowePartie.join(", ") + ".";
  }
  if (w.bledy.length > 0) {
    opis += " Nie dodano " + w.bledy.length + ": " + w.bledy.slice(0, 3).join("; ") + (w.bledy.length > 3 ? "…" : "") + ".";
  }
  pokazInfoKopii(opis, w.dodane === 0 && w.bledy.length > 0);
}

kopiaCwiczenia.addEventListener("click", function () {
  kopiaCwiczeniaPlik.click();
});

kopiaCwiczeniaPlik.addEventListener("change", function () {
  odczytajPlik(kopiaCwiczeniaPlik, function (tekst) {
    let dane_;
    try {
      dane_ = JSON.parse(tekst);
    } catch (blad) {
      pokazInfoKopii("Nie da się odczytać pliku. Sprawdź, czy ma format jak we wzorze.", true);
      return;
    }
    const lista = Array.isArray(dane_) ? dane_ : dane_ && dane_.cwiczenia;
    if (!Array.isArray(lista)) {
      pokazInfoKopii("W pliku nie znalazłem listy ćwiczeń. Pobierz wzór i porównaj.", true);
      return;
    }
    dodajIPokaz(lista);
  });
});

kopiaWzor.addEventListener("click", function () {
  const rodzaje = dane.kategorie.filter(function (k) {
    return k.typ === "rodzaj";
  }).map(function (k) {
    return k.nazwa;
  });
  const wzor = {
    cwiczenia: [
      { nazwa: "Podciąganie nachwytem", rodzaj: "Kalistenika", partie: ["Plecy"], miesnie: ["Najszerszy grzbietu", "Biceps"], link: "https://x.com/..." },
      { nazwa: "Deska przodem", rodzaj: "Trening statyczny", partie: ["Brzuch"], miesnie: ["Prosty brzucha", "Poprzeczny brzucha"], link: "" }
    ],
    dostepneRodzaje: rodzaje
  };
  pobierzPlik("cwiczenia-wzor.json", JSON.stringify(wzor, null, 1));
  pokazInfoKopii("Pobrano wzór. Rodzaj musi nazywać się tak jak w aplikacji, a nieznane partie zostaną dodane automatycznie.", false);
});

document.getElementById("kopia-przyklady").addEventListener("click", function () {
  const adresy = ["przyklady-kalistenika.json", "przyklady-silownia.json", "przyklady-mobilnosc.json"];
  Promise.all(adresy.map(function (a) {
    return fetch(a).then(function (o) { return o.json(); });
  })).then(function (wyniki) {
    let lista = [];
    wyniki.forEach(function (w) { lista = lista.concat(w.cwiczenia || []); });
    dodajIPokaz(lista, { zBazy: true });
  }).catch(function () {
    pokazInfoKopii("Nie udało się pobrać przykładów. Sprawdź internet i spróbuj ponownie.", true);
  });
});

// ===== Baza ćwiczeń wczytywana przy starcie =====
// Nowa osoba dostaje gotową bazę. Kto ma już ćwiczenia, dostaje tylko oznaczenie, które z nich
// pochodzą z bazy (takie można ukryć, ale nie usunąć). Brak internetu: spróbujemy przy następnym starcie.

// Początki opisów z wersji 41 (bez znacznika): dopóki ich nie zmieniono, baza może je zaktualizować
const STARE_OPISY_START = [
 "Dłonie na podłodze nieco szerzej niż barki, ciało w jednej prostej linii od głowy do pięt. Brzuch i pośladki napięte.",
 "Chwyć poręcze, wyprostuj ręce i unieś ciało. Barki daleko od uszu, nogi ugięte lub skrzyżowane, tułów lekko pochylony do przodu.",
 "Chwyć drążek dłońmi skierowanymi od siebie, nieco szerzej niż barki. Zwis na prostych rękach, brzuch napięty, łopatki ściągnięte w dół (barki nie przy uszach).",
 "Niski drążek na wysokości bioder. Połóż się pod nim i chwyć go dłońmi skierowanymi od siebie, na szerokość barków. Ciało w prostej linii od głowy do pięt, pięty na podłodze, ręce proste.",
 "Oprzyj się na przedramionach (łokcie pod barkami) i palcach stóp. Ciało w jednej prostej linii od głowy do pięt.",
 "Połóż się na plecach, kolana ugięte, stopy na podłodze. Dłonie przy skroniach albo skrzyżowane na klatce.",
 "Połóż się na plecach. Ręce wyprostowane w górę, kolana ugięte nad biodrami (łydki równolegle do podłogi). Dolna część pleców dociśnięta do podłogi.",
 "Połóż się na plecach, kolana ugięte, stopy płasko przy pośladkach na szerokość bioder. Ręce wzdłuż ciała.",
 "Stopy na szerokość barków, palce lekko na zewnątrz. Plecy proste, wzrok przed siebie, ręce złączone przed sobą.",
 "Stań prosto, stopy na szerokość bioder, ręce na biodrach, brzuch napięty."
];

const WERSJA_BAZY = 5;
const PLIKI_BAZY = ["przyklady-kalistenika.json", "przyklady-silownia.json", "przyklady-mobilnosc.json"];

function wczytajBazeStartowa() {
  if ((dane.wersjaBazy || 0) >= WERSJA_BAZY) {
    return;
  }
  const mialaCwiczenia = dane.cwiczenia.length > 0;
  Promise.all(PLIKI_BAZY.map(function (a) {
    return fetch(a).then(function (o) { return o.json(); });
  })).then(function (wyniki) {
    let lista = [];
    wyniki.forEach(function (w) { lista = lista.concat(w.cwiczenia || []); });
    dodajCwiczeniaZListy(lista, { zBazy: true, tylkoOznacz: mialaCwiczenia && !((dane.wersjaBazy || 0) > 0) });
    dane.wersjaBazy = WERSJA_BAZY;
    zapiszDane();
    if (typeof rysujListe === "function") {
      rysujFiltry();
      rysujListe();
    }
    if (typeof odswiezPrzelacznik === "function") {
      odswiezPrzelacznik();
    }
  }).catch(function () {});
}

wczytajBazeStartowa();
