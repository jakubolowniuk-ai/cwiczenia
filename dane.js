// Klucz, pod którym dane leżą w pamięci przeglądarki
const KLUCZ_DANYCH = "cwiczenia-dane-v1";

// Dane na start, gdy aplikacja uruchamia się pierwszy raz
function domyslneDane() {
  return {
    kategorie: [
      { id: "rodzaj-cialo", nazwa: "Trening ciała", typ: "rodzaj" },
      { id: "rodzaj-statyczny", nazwa: "Trening statyczny", typ: "rodzaj" },
      { id: "rodzaj-rozciaganie", nazwa: "Rozciąganie", typ: "rodzaj" },
      { id: "rodzaj-bieganie", nazwa: "Bieganie", typ: "rodzaj" },
      { id: "rodzaj-basen", nazwa: "Basen", typ: "rodzaj" },
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

// Wczytuje dane z pamięci telefonu (albo tworzy dane startowe)
function wczytajDane() {
  try {
    const tekst = localStorage.getItem(KLUCZ_DANYCH);
    if (tekst) {
      return JSON.parse(tekst);
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
