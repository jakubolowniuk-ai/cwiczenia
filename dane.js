// Klucz, pod którym dane leżą w pamięci przeglądarki
const KLUCZ_DANYCH = "cwiczenia-dane-v1";

// Mięśnie: [id, nazwa, id partii]. Id musi zgadzać się z kształtami w anatomia.js
const MIESNIE_STARTOWE = [
  ["mi-piersiowy", "Piersiowy większy", "partia-klatka"],
  ["mi-zebaty", "Zębaty przedni", "partia-klatka"],
  ["mi-naramienny-przedni", "Naramienny przedni", "partia-barki"],
  ["mi-naramienny-srodkowy", "Naramienny środkowy", "partia-barki"],
  ["mi-naramienny-tylny", "Naramienny tylny", "partia-barki"],
  ["mi-biceps", "Biceps", "partia-ramiona"],
  ["mi-triceps", "Triceps", "partia-ramiona"],
  ["mi-ramienny", "Ramienny", "partia-ramiona"],
  ["mi-przedramiona", "Przedramiona", "partia-ramiona"],
  ["mi-najszerszy", "Najszerszy grzbietu", "partia-plecy"],
  ["mi-obly", "Obły większy", "partia-plecy"],
  ["mi-czworoboczny", "Czworoboczny", "partia-plecy"],
  ["mi-rownolegloboczny", "Równoległoboczny", "partia-plecy"],
  ["mi-prostowniki", "Prostowniki grzbietu", "partia-plecy"],
  ["mi-czworoboczny-ledzwi", "Czworoboczny lędźwi", "partia-plecy"],
  ["mi-prosty", "Prosty brzucha", "partia-brzuch"],
  ["mi-skosne", "Skośne brzucha", "partia-brzuch"],
  ["mi-poprzeczny", "Poprzeczny brzucha", "partia-brzuch"],
  ["mi-biodrowo-ledzwiowy", "Biodrowo-lędźwiowy", "partia-brzuch"],
  ["mi-posladkowy-wielki", "Pośladkowy wielki", "partia-posladki"],
  ["mi-posladkowy-sredni", "Pośladkowy średni", "partia-posladki"],
  ["mi-posladkowy-maly", "Pośladkowy mały", "partia-posladki"],
  ["mi-czworoglowy", "Czworogłowy uda", "partia-nogi"],
  ["mi-kulszowo-goleniowe", "Kulszowo-goleniowe", "partia-nogi"],
  ["mi-przywodziciele", "Przywodziciele uda", "partia-nogi"],
  ["mi-brzuchaty-lydki", "Brzuchaty łydki", "partia-nogi"],
  ["mi-plaszczkowaty", "Płaszczkowaty", "partia-nogi"],
  ["mi-piszczelowy", "Piszczelowy przedni", "partia-nogi"]
];

// Dane na start, gdy aplikacja uruchamia się pierwszy raz.
// Każdy rodzaj aktywności ma ustawienie miary w formularzu ćwiczenia:
//   "serie"     = serie i powtórzenia albo czas
//   "sesja"     = dystans i czas
//   "statyczna" = powtórzenia i czas
// "polaPlanu" mówi, jakie pola pokazać przy dodawaniu aktywności w kreatorze planu
// (zawsze dochodzi jeszcze "ile razy w okresie")
// "wersjaUstawien" rośnie, gdy zmieniamy te ustawienia, żeby starsze dane też się zaktualizowały
function domyslneDane() {
  return {
    wersjaUstawien: 4,
    kategorie: [
      { id: "rodzaj-cialo", nazwa: "Siłownia", typ: "rodzaj", miara: "serie", polaPlanu: ["partia"] },
      { id: "rodzaj-kalistenika", nazwa: "Kalistenika", typ: "rodzaj", miara: "serie", polaPlanu: ["partia"] },
      { id: "rodzaj-statyczny", nazwa: "Trening statyczny", typ: "rodzaj", miara: "statyczna", polaPlanu: [] },
      { id: "rodzaj-rozciaganie", nazwa: "Rozciąganie", typ: "rodzaj", miara: "serie", polaPlanu: [] },
      { id: "rodzaj-bieganie", nazwa: "Bieganie", typ: "rodzaj", miara: "sesja", polaPlanu: ["dystans", "czas"] },
      { id: "rodzaj-basen", nazwa: "Basen", typ: "rodzaj", miara: "sesja", polaPlanu: ["styl", "dlugosci"] },
      { id: "partia-plecy", nazwa: "Plecy", typ: "partia" },
      { id: "partia-brzuch", nazwa: "Brzuch", typ: "partia" },
      { id: "partia-klatka", nazwa: "Klatka piersiowa", typ: "partia" },
      { id: "partia-nogi", nazwa: "Nogi", typ: "partia" },
      { id: "partia-barki", nazwa: "Barki", typ: "partia" },
      { id: "partia-ramiona", nazwa: "Ramiona", typ: "partia" },
      { id: "partia-posladki", nazwa: "Pośladki", typ: "partia" }
    ].concat(MIESNIE_STARTOWE.map(function (m) {
      return { id: m[0], nazwa: m[1], typ: "miesien", partiaId: m[2] };
    })),
    stylePlywania: ["Kraul", "Grzbietowy", "Klasyczny", "Motylkowy", "Dowolny"],
    cwiczenia: [],
    treningi: [],
    szkicPlanu: null,
    plany: [],
    historia: [],
    ustawienia: { godzinaAlarmu: "18:30" }
  };
}

// Uzupełnia zapisane dane o nowe ustawienia, żeby starsze dane nadal działały
function uzupelnijDane(zapisane) {
  const startowe = domyslneDane();

  startowe.kategorie.forEach(function (domyslna) {
    const istniejaca = zapisane.kategorie.find(function (k) {
      return k.id === domyslna.id;
    });

    if (!istniejaca) {
      zapisane.kategorie.push(domyslna);
      return;
    }

    for (const klucz in domyslna) {
      if (!(klucz in istniejaca)) {
        istniejaca[klucz] = domyslna[klucz];
      }
    }

    // Starsza wersja ustawień: nadpisujemy ustawienia formularzy nowymi
    if (zapisane.wersjaUstawien !== startowe.wersjaUstawien) {
      ["miara", "polaPlanu"].forEach(function (klucz) {
        if (domyslna[klucz] !== undefined) {
          istniejaca[klucz] = domyslna[klucz];
        }
      });
    }
  });

  // Wersja 4: "Trening ciała" zmienił nazwę na "Siłownia"
  if (zapisane.wersjaUstawien < 4) {
    const cialo = zapisane.kategorie.find(function (k) {
      return k.id === "rodzaj-cialo";
    });
    if (cialo && cialo.nazwa === "Trening ciała") {
      cialo.nazwa = "Siłownia";
    }
  }

  // Partie dodane wcześniej z pliku (np. "Barki") łączymy z partiami startowymi o tej samej nazwie
  if (Array.isArray(zapisane.cwiczenia)) {
    startowe.kategorie.forEach(function (stara) {
      if (stara.typ !== "partia") {
        return;
      }
      zapisane.kategorie.filter(function (k) {
        return k.typ === "partia" && k.id !== stara.id && k.nazwa.trim().toLowerCase() === stara.nazwa.toLowerCase();
      }).forEach(function (duplikat) {
        zapisane.cwiczenia.forEach(function (c) {
          if (Array.isArray(c.partieIds)) {
            c.partieIds = c.partieIds.map(function (id) {
              return id === duplikat.id ? stara.id : id;
            }).filter(function (id, i, tab) {
              return tab.indexOf(id) === i;
            });
          }
        });
        zapisane.kategorie.splice(zapisane.kategorie.indexOf(duplikat), 1);
      });
    });
  }

  zapisane.wersjaUstawien = startowe.wersjaUstawien;

  ["cwiczenia", "treningi", "plany", "historia"].forEach(function (nazwa) {
    if (!Array.isArray(zapisane[nazwa])) {
      zapisane[nazwa] = [];
    }
  });

  if (!Array.isArray(zapisane.stylePlywania)) {
    zapisane.stylePlywania = startowe.stylePlywania;
  }

  if (!("szkicPlanu" in zapisane)) {
    zapisane.szkicPlanu = null;
  }

  if (!zapisane.ustawienia) {
    zapisane.ustawienia = startowe.ustawienia;
  }

  return zapisane;
}

// Wczytuje dane z pamięci telefonu (albo tworzy dane startowe)
function wczytajDane() {
  try {
    const tekst = localStorage.getItem(KLUCZ_DANYCH);
    if (tekst) {
      const zapisane = JSON.parse(tekst);
      if (zapisane && Array.isArray(zapisane.kategorie)) {
        return uzupelnijDane(zapisane);
      }
    }
  } catch (blad) {
    console.error("Nie udało się wczytać danych", blad);
  }
  return domyslneDane();
}

// Zapisuje aktualne dane w pamięci telefonu
function zapiszDane() {
  try {
    localStorage.setItem(KLUCZ_DANYCH, JSON.stringify(dane));
  } catch (blad) {
    console.error("Nie udało się zapisać danych", blad);
  }
}

// Wszystkie dane aplikacji trzymamy w jednym obiekcie "dane"
const dane = wczytajDane();
