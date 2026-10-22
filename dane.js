// Klucz, pod którym dane leżą w pamięci przeglądarki
const KLUCZ_DANYCH = "cwiczenia-dane-v1";

// Mięśnie: [id, nazwa, id partii]. Id musi zgadzać się z kształtami w anatomia.js
const MIESNIE_STARTOWE = [
  ["mi-piersiowy", "Piersiowy większy", "partia-klatka"],
  ["mi-zebaty", "Zębaty przedni", "partia-klatka"],
  ["mi-naramienny-przedni", "Naramienny przedni", "partia-barki"],
  ["mi-naramienny-srodkowy", "Naramienny środkowy", "partia-barki"],
  ["mi-naramienny-tylny", "Naramienny tylny", "partia-barki"],
  ["mi-podgrzebieniowy", "Podgrzebieniowy", "partia-barki"],
  ["mi-biceps", "Biceps", "partia-ramiona"],
  ["mi-ramienny", "Ramienny", "partia-ramiona"],
  ["mi-triceps-boczny", "Triceps – głowa boczna", "partia-ramiona"],
  ["mi-triceps-dlugi", "Triceps – głowa długa", "partia-ramiona"],
  ["mi-ramienno-promieniowy", "Ramienno-promieniowy", "partia-ramiona"],
  ["mi-zginacze-przedramienia", "Zginacze przedramienia", "partia-ramiona"],
  ["mi-prostowniki-przedramienia", "Prostowniki przedramienia", "partia-ramiona"],
  ["mi-czworoboczny-gorny", "Czworoboczny – część górna", "partia-plecy"],
  ["mi-czworoboczny-srodkowy", "Czworoboczny – część środkowa", "partia-plecy"],
  ["mi-czworoboczny-dolny", "Czworoboczny – część dolna", "partia-plecy"],
  ["mi-najszerszy", "Najszerszy grzbietu", "partia-plecy"],
  ["mi-obly", "Obły większy", "partia-plecy"],
  ["mi-rownolegloboczny", "Równoległoboczny", "partia-plecy"],
  ["mi-prostowniki", "Prostowniki grzbietu", "partia-plecy"],
  ["mi-wielodzielny", "Wielodzielny", "partia-plecy"],
  ["mi-czworoboczny-ledzwi", "Czworoboczny lędźwi", "partia-plecy"],
  ["mi-prosty", "Prosty brzucha", "partia-brzuch"],
  ["mi-skosny-zewnetrzny", "Skośny zewnętrzny brzucha", "partia-brzuch"],
  ["mi-skosny-wewnetrzny", "Skośny wewnętrzny brzucha", "partia-brzuch"],
  ["mi-poprzeczny", "Poprzeczny brzucha", "partia-brzuch"],
  ["mi-biodrowo-ledzwiowy", "Biodrowo-lędźwiowy", "partia-brzuch"],
  ["mi-posladkowy-wielki", "Pośladkowy wielki", "partia-posladki"],
  ["mi-posladkowy-sredni", "Pośladkowy średni", "partia-posladki"],
  ["mi-posladkowy-maly", "Pośladkowy mały", "partia-posladki"],
  ["mi-napinacz-powiezi", "Napinacz powięzi szerokiej", "partia-posladki"],
  ["mi-prosty-uda", "Prosty uda", "partia-nogi"],
  ["mi-obszerny-boczny", "Obszerny boczny", "partia-nogi"],
  ["mi-obszerny-przysrodkowy", "Obszerny przyśrodkowy", "partia-nogi"],
  ["mi-dwuglowy-uda", "Dwugłowy uda", "partia-nogi"],
  ["mi-polsciegnisty", "Półścięgnisty i półbłoniasty", "partia-nogi"],
  ["mi-przywodziciele", "Przywodziciele uda", "partia-nogi"],
  ["mi-brzuchaty-przysrodkowy", "Brzuchaty łydki – głowa przyśrodkowa", "partia-nogi"],
  ["mi-brzuchaty-boczny", "Brzuchaty łydki – głowa boczna", "partia-nogi"],
  ["mi-plaszczkowaty", "Płaszczkowaty", "partia-nogi"],
  ["mi-strzalkowe", "Strzałkowe", "partia-nogi"],
  ["mi-piszczelowy", "Piszczelowy przedni", "partia-nogi"],
  ["mi-mostkowo-obojczykowy", "Mostkowo-obojczykowo-sutkowy", "partia-szyja"]
];

// Wersja 5: mięśnie rozdzielone na części. Dla starych ćwiczeń: id dawnego mięśnia -> nowe id
const MIESNIE_PODZIAL = {
  "mi-triceps": ["mi-triceps-boczny", "mi-triceps-dlugi"],
  "mi-skosne": ["mi-skosny-zewnetrzny", "mi-skosny-wewnetrzny"],
  "mi-czworoglowy": ["mi-prosty-uda", "mi-obszerny-boczny", "mi-obszerny-przysrodkowy"],
  "mi-kulszowo-goleniowe": ["mi-dwuglowy-uda", "mi-polsciegnisty"],
  "mi-brzuchaty-lydki": ["mi-brzuchaty-przysrodkowy", "mi-brzuchaty-boczny"]
};

// Czworoboczny i przedramiona zależą od ćwiczenia, więc dobieramy części po nazwie
function podzielCzworoboczny(nazwa) {
  const n = String(nazwa || "").toLowerCase();
  if (/szrugs|wzdłuż tułowia|żołnierskie|ohp|martwy ciąg klasyczny|spacer farmera/.test(n)) {
    return ["mi-czworoboczny-gorny"];
  }
  if (/face pull/.test(n)) {
    return ["mi-czworoboczny-srodkowy"];
  }
  return ["mi-czworoboczny-srodkowy", "mi-czworoboczny-dolny"];
}

function podzielPrzedramiona(nazwa) {
  const n = String(nazwa || "").toLowerCase();
  if (/młotk|hammer|reverse|nadchwytem ze sztangą/.test(n) && !/nadgarstk/.test(n)) {
    return ["mi-ramienno-promieniowy", "mi-prostowniki-przedramienia"];
  }
  if (/nadgarstk/.test(n)) {
    return /podchwyt/.test(n) ? ["mi-zginacze-przedramienia"] : ["mi-prostowniki-przedramienia"];
  }
  return ["mi-zginacze-przedramienia", "mi-prostowniki-przedramienia"];
}

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
    wersjaUstawien: 5,
    kategorie: [
      { id: "rodzaj-cialo", nazwa: "Siłownia", typ: "rodzaj", miara: "serie", polaPlanu: ["partia"] },
      { id: "rodzaj-kalistenika", nazwa: "Kalistenika", typ: "rodzaj", miara: "serie", polaPlanu: ["partia"] },
      { id: "rodzaj-statyczny", nazwa: "Trening statyczny", typ: "rodzaj", miara: "statyczna", polaPlanu: [] },
      { id: "rodzaj-rozciaganie", nazwa: "Rozciąganie", typ: "rodzaj", miara: "serie", polaPlanu: [] },
      { id: "rodzaj-bieganie", nazwa: "Bieganie", typ: "rodzaj", miara: "sesja", polaPlanu: ["dystans", "czas"] },
      { id: "rodzaj-basen", nazwa: "Basen", typ: "rodzaj", miara: "sesja", polaPlanu: ["styl", "dlugosci"] },
      { id: "rodzaj-rower", nazwa: "Rower", typ: "rodzaj", miara: "sesja", polaPlanu: ["dystans", "czas"] },
      { id: "rodzaj-spacer", nazwa: "Spacer", typ: "rodzaj", miara: "sesja", polaPlanu: ["dystans", "czas"] },
      { id: "rodzaj-joga", nazwa: "Joga / mobilność", typ: "rodzaj", miara: "statyczna", polaPlanu: [] },
      { id: "partia-plecy", nazwa: "Plecy", typ: "partia" },
      { id: "partia-brzuch", nazwa: "Brzuch", typ: "partia" },
      { id: "partia-klatka", nazwa: "Klatka piersiowa", typ: "partia" },
      { id: "partia-nogi", nazwa: "Nogi", typ: "partia" },
      { id: "partia-barki", nazwa: "Barki", typ: "partia" },
      { id: "partia-ramiona", nazwa: "Ramiona", typ: "partia" },
      { id: "partia-posladki", nazwa: "Pośladki", typ: "partia" },
      { id: "partia-szyja", nazwa: "Szyja", typ: "partia" }
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

  // Wersja 5: mięśnie rozdzielone na części (np. triceps na dwie głowy). Przepisujemy ćwiczenia i usuwamy stare mięśnie
  if (zapisane.wersjaUstawien < 5) {
    const stare = ["mi-triceps", "mi-skosne", "mi-czworoglowy", "mi-kulszowo-goleniowe", "mi-brzuchaty-lydki", "mi-czworoboczny", "mi-przedramiona"];
    (zapisane.cwiczenia || []).forEach(function (c) {
      if (!Array.isArray(c.miesnieIds)) {
        return;
      }
      const nowe = [];
      c.miesnieIds.forEach(function (id) {
        let zamiana = [id];
        if (MIESNIE_PODZIAL[id]) {
          zamiana = MIESNIE_PODZIAL[id];
        } else if (id === "mi-czworoboczny") {
          zamiana = podzielCzworoboczny(c.nazwa);
        } else if (id === "mi-przedramiona") {
          zamiana = podzielPrzedramiona(c.nazwa);
        }
        zamiana.forEach(function (n) {
          if (nowe.indexOf(n) === -1) {
            nowe.push(n);
          }
        });
      });
      c.miesnieIds = nowe;
    });
    zapisane.kategorie = zapisane.kategorie.filter(function (k) {
      return stare.indexOf(k.id) === -1;
    });
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
