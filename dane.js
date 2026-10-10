// Klucz, pod którym dane leżą w pamięci przeglądarki
const KLUCZ_DANYCH = "cwiczenia-dane-v1";

// Dane na start, gdy aplikacja uruchamia się pierwszy raz.
// Każdy rodzaj aktywności ma ustawienie miary w formularzu ćwiczenia:
//   "serie"     = serie i powtórzenia albo czas
//   "sesja"     = dystans i czas
//   "statyczna" = powtórzenia i czas
// "wersjaUstawien" rośnie, gdy zmieniamy te ustawienia, żeby starsze dane też się zaktualizowały
function domyslneDane() {
  return {
    wersjaUstawien: 2,
    kategorie: [
      { id: "rodzaj-cialo", nazwa: "Trening ciała", typ: "rodzaj", miara: "serie" },
      { id: "rodzaj-statyczny", nazwa: "Trening statyczny", typ: "rodzaj", miara: "statyczna" },
      { id: "rodzaj-rozciaganie", nazwa: "Rozciąganie", typ: "rodzaj", miara: "serie" },
      { id: "rodzaj-bieganie", nazwa: "Bieganie", typ: "rodzaj", miara: "sesja" },
      { id: "rodzaj-basen", nazwa: "Basen", typ: "rodzaj", miara: "sesja" },
      { id: "partia-plecy", nazwa: "Plecy", typ: "partia" },
      { id: "partia-brzuch", nazwa: "Brzuch", typ: "partia" },
      { id: "partia-klatka", nazwa: "Klatka piersiowa", typ: "partia" },
      { id: "partia-nogi", nazwa: "Nogi", typ: "partia" }
    ],
    cwiczenia: [],
    treningi: [],
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

    // Starsza wersja ustawień: nadpisujemy miarę nowym ustawieniem
    if (zapisane.wersjaUstawien !== startowe.wersjaUstawien && domyslna.miara) {
      istniejaca.miara = domyslna.miara;
    }
  });

  zapisane.wersjaUstawien = startowe.wersjaUstawien;

  ["cwiczenia", "treningi", "plany", "historia"].forEach(function (nazwa) {
    if (!Array.isArray(zapisane[nazwa])) {
      zapisane[nazwa] = [];
    }
  });

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
