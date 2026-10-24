// ===== Przewodnik: krótkie karty ze zrzutami ekranu =====
// Pokazuje się sam przy pierwszym uruchomieniu (dane.przewodnikWidziany) i pod przyciskiem "Jak to działa?".
// Zrzuty generuje narzedzia/zrzuty-przewodnika.js z działającej aplikacji.

const KARTY_PRZEWODNIKA = [
  { obraz: "przewodnik/1-start.webp", tytul: "Witaj w aplikacji do ćwiczeń", tekst: "Układasz plan na tydzień lub miesiąc, a na ekranie Dziś odhaczasz ćwiczenia. Aplikacja ma trzy zakładki: Dziś, Ćwiczenia (baza ćwiczeń i Moje treningi) oraz Postęp. Zacznij od „Utwórz plan”." },
  { obraz: "przewodnik/2-aktywnosci.webp", tytul: "1. Wybierz aktywności", tekst: "Dodaj aktywności (siłownia, kalistenika, spacer, bieganie…) i wpisz, ile razy w okresie chcesz je zrobić. Przy siłowni i kalistenice wybierz partie mięśni (można kilka) albo „Ogólnorozwojowy”." },
  { obraz: "przewodnik/3-kalendarz.webp", tytul: "2. Rozłóż sesje na dni", tekst: "Dotknij dnia w kalendarzu i dodaj sesję albo użyj „Zaproponuj rozkład”. Puste kwadraciki to sesje do uzupełnienia." },
  { obraz: "przewodnik/4-cwiczenia-w-sesji.webp", tytul: "3. Dodaj ćwiczenia do sesji", tekst: "Dotknij sesji i wybierz „Dodaj ćwiczenia”. Aplikacja podpowiada ćwiczenia pasujące do aktywności, a „Pokaż wszystkie” otwiera całą bazę. Zaznacz „Zapisz w Moich zestawach”, jeśli chcesz użyć tego zestawu ponownie." },
  { obraz: "przewodnik/5-parametry.webp", tytul: "4. Ustaw serie, powtórzenia i ciężary", tekst: "Dla każdego ćwiczenia wybierz miarę (serie i powtórzenia, czas…) i wpisz ile razy. Przy ćwiczeniach z ciężarem ustaw kilogramy: ten sam w każdej serii albo różny w seriach. To jest plan, który zobaczysz na ekranie Dziś." },
  { obraz: "przewodnik/6-dzis.webp", tytul: "Odhaczaj na ekranie Dziś", tekst: "Dotknij kwadracika, aby zaliczyć ćwiczenie dokładnie tak, jak w planie. Pod ćwiczeniem widzisz zaplanowane serie i powtórzenia, a po zaliczeniu pasek postępu rośnie." },
  { obraz: "przewodnik/7-inne-wartosci.webp", tytul: "Zrobiłeś inaczej niż w planie?", tekst: "Dotknij podkreślonej wartości (np. 8 × 8), a pojawią się pola serii, powtórzeń i ciężaru. Zmień je tak, jak było naprawdę, a aplikacja policzy różnicę („+16 powt. ponad plan” albo mniej). „Zapisz i zalicz” zapisuje wynik." },
  { obraz: "przewodnik/8-postep.webp", tytul: "Śledź postęp", tekst: "Zakładka Postęp pokazuje realizację planu, ćwiczone mięśnie i serię dni. Poprzednie plany zostają w historii, a przy każdym ćwiczeniu jest przycisk „Historia”. Tu też ustawisz własne rekordy na dystansie, np. 5 km albo 100 m kraulem." },
  { obraz: "przewodnik/9-baza.webp", tytul: "Baza ćwiczeń", tekst: "Wybierz partię i mięśnie, aby znaleźć ćwiczenie. Niepotrzebne ćwiczenia możesz ukryć i przywrócić przyciskiem „Pokaż ukryte”. Możesz też dodać własne. Przyciskiem „Rekord” wpiszesz swój rekord ćwiczenia, a aplikacja zapyta, gdy go pobijesz." },
  { obraz: "przewodnik/10-moje-treningi.webp", tytul: "Moje treningi", tekst: "To zestawy ćwiczeń, które zapisałeś, żeby używać ich w kolejnych planach, np. „Klatka i plecy A”. Dodasz je w sesji przyciskiem „Z moich zestawów”. Tutaj możesz je też pokazać, edytować albo usunąć." }
];

const przewodnikTlo = document.getElementById("przewodnik");
const przewodnikObraz = document.getElementById("prz-obraz");
const przewodnikTytul = document.getElementById("prz-tytul");
const przewodnikTekst = document.getElementById("prz-tekst");
const przewodnikKropki = document.getElementById("prz-kropki");
const przewodnikWstecz = document.getElementById("prz-wstecz");
const przewodnikDalej = document.getElementById("prz-dalej");
let przewodnikNumer = 0;

function pokazKartePrzewodnika(numer) {
  przewodnikNumer = Math.max(0, Math.min(KARTY_PRZEWODNIKA.length - 1, numer));
  const karta = KARTY_PRZEWODNIKA[przewodnikNumer];
  przewodnikObraz.src = karta.obraz;
  przewodnikTytul.textContent = karta.tytul;
  przewodnikTekst.textContent = karta.tekst;
  przewodnikKropki.innerHTML = "";
  KARTY_PRZEWODNIKA.forEach(function (_, i) {
    const kropka = document.createElement("span");
    kropka.className = i === przewodnikNumer ? "aktywna" : "";
    przewodnikKropki.appendChild(kropka);
  });
  przewodnikWstecz.style.visibility = przewodnikNumer === 0 ? "hidden" : "visible";
  przewodnikDalej.textContent = przewodnikNumer === KARTY_PRZEWODNIKA.length - 1 ? "Zaczynamy" : "Dalej";
}

function otworzPrzewodnik() {
  pokazKartePrzewodnika(0);
  przewodnikTlo.hidden = false;
}

function zamknijPrzewodnik() {
  przewodnikTlo.hidden = true;
  if (!dane.przewodnikWidziany) {
    dane.przewodnikWidziany = true;
    zapiszDane();
  }
}

przewodnikDalej.addEventListener("click", function () {
  if (przewodnikNumer >= KARTY_PRZEWODNIKA.length - 1) {
    zamknijPrzewodnik();
  } else {
    pokazKartePrzewodnika(przewodnikNumer + 1);
  }
});
przewodnikWstecz.addEventListener("click", function () {
  pokazKartePrzewodnika(przewodnikNumer - 1);
});
document.getElementById("prz-pomin").addEventListener("click", zamknijPrzewodnik);
document.getElementById("dzis-jak-to-dziala").addEventListener("click", otworzPrzewodnik);
document.getElementById("ust-przewodnik").addEventListener("click", otworzPrzewodnik);

// Przesunięcie palcem w lewo/prawo
(function () {
  let startX = null;
  przewodnikTlo.addEventListener("touchstart", function (z) {
    startX = z.touches[0].clientX;
  }, { passive: true });
  przewodnikTlo.addEventListener("touchend", function (z) {
    if (startX === null) {
      return;
    }
    const roznica = z.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(roznica) > 60) {
      pokazKartePrzewodnika(przewodnikNumer + (roznica < 0 ? 1 : -1));
    }
  }, { passive: true });
})();

// Pierwsze uruchomienie (nie w automatycznych testach)
if (!dane.przewodnikWidziany && !navigator.webdriver) {
  otworzPrzewodnik();
}
