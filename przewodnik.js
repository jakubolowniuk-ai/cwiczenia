// ===== Przewodnik: krótkie karty ze zrzutami ekranu =====
// Pokazuje się sam przy pierwszym uruchomieniu (dane.przewodnikWidziany) i pod przyciskiem "Jak to działa?".
// Zrzuty generuje narzedzia/zrzuty-przewodnika.js z działającej aplikacji (po zmianach w wyglądzie uruchom go ponownie).

const KARTY_PRZEWODNIKA = [
  { obraz: "przewodnik/01-start.webp", tytul: "Witaj w aplikacji do ćwiczeń", tekst: "Aplikacja ma trzy zakładki: Dziś (co ćwiczysz dzisiaj), Ćwiczenia (baza ćwiczeń i Twoje zestawy) oraz Postęp. Najprościej zacząć od „Ułóż mi plan”." },
  { obraz: "przewodnik/02-kreator.webp", tytul: "Ułóż mi plan", tekst: "Odpowiedz na kilka pytań: cel, doświadczenie, ile dni w tygodniu i ile czasu masz, gdzie ćwiczysz i czy coś Cię boli. Ćwiczenia, serie i ciężary aplikacja dobierze sama." },
  { obraz: "przewodnik/03-gotowy-plan.webp", tytul: "Gotowy plan na 4 tygodnie", tekst: "Zobaczysz pierwszy tydzień i wyjaśnienie „Dlaczego ten plan?”. Treningi możesz zapisać jako swoje zestawy. „Zacznij” zapisuje plan, a „Zmień odpowiedzi” wraca do pytań." },
  { obraz: "przewodnik/04-dzis.webp", tytul: "Ekran Dziś", tekst: "Tu są dzisiejsze sesje: rozgrzewka, ćwiczenia i rozciąganie. Dotknij kwadracika, aby zaliczyć ćwiczenie tak, jak w planie. „Opis” pokazuje, jak je wykonać." },
  { obraz: "przewodnik/05-cwicz.webp", tytul: "Ćwicz krok po kroku", tekst: "Przycisk „Ćwicz” prowadzi przez sesję seria po serii. Popraw powtórzenia i ciężar przyciskami − i +, jeśli zrobiłeś inaczej, i dotknij „Zrobione ✓”." },
  { obraz: "przewodnik/06-przerwa.webp", tytul: "Przerwa między seriami", tekst: "Po serii startuje odliczanie przerwy (telefon da znać, gdy minie). Możesz ją wydłużyć lub skrócić o 15 s. Widzisz, co będzie dalej, i możesz otworzyć opis następnego ćwiczenia." },
  { obraz: "przewodnik/07-ocena.webp", tytul: "Oceń ćwiczenia", tekst: "Na koniec sesji oceń każde ćwiczenie: Łatwo, W sam raz albo Ciężko. Na tej podstawie aplikacja zaproponuje, kiedy dołożyć ciężar, a kiedy odpuścić." },
  { obraz: "przewodnik/08-propozycje.webp", tytul: "Propozycje na dziś", tekst: "Przed kolejnym treningiem zobaczysz propozycje, np. 60 → 65 kg albo jedno powtórzenie więcej, z wyjaśnieniem dlaczego. Bez Twojej zgody nic się nie zmieni: „Przyjmij” albo „Zostaw”." },
  { obraz: "przewodnik/09-inne-wartosci.webp", tytul: "Zrobiłeś inaczej niż w planie?", tekst: "Na ekranie Dziś dotknij podkreślonej wartości (np. 3 × 8), zmień serie, powtórzenia albo ciężar i wybierz „Zapisz i zalicz”. Aplikacja zapamięta, ile zrobiłeś naprawdę." },
  { obraz: "przewodnik/10-recznie.webp", tytul: "Plan ręcznie", tekst: "Wolisz sam? „Utwórz plan ręcznie”: wybierz aktywności i ile razy chcesz je zrobić, rozłóż sesje w kalendarzu (albo „Zaproponuj rozkład”), a potem dodaj ćwiczenia do każdej sesji." },
  { obraz: "przewodnik/11-postep.webp", tytul: "Postęp", tekst: "Realizacja planu, ćwiczone mięśnie i seria dni. Tu przełączasz i edytujesz plany, a poprzednie zostają w historii. Możesz też wpisać rekordy na dystansie, np. 5 km." },
  { obraz: "przewodnik/12-baza.webp", tytul: "Baza ćwiczeń", tekst: "Wybierz partię i mięśnie, aby znaleźć ćwiczenie. Każde ma opis wykonania. Możesz dodać własne, ukryć niepotrzebne i wpisać swój rekord, a aplikacja zapyta, gdy go pobijesz." },
  { obraz: "przewodnik/12b-ukryte.webp", tytul: "Ukryte ćwiczenia a plan", tekst: "Nie lubisz jakiegoś ćwiczenia? Ukryj je w bazie. Gdy coś jest ukryte, „Ułóż mi plan” zapyta, czy może go użyć. Jeśli nie, wstawi zamiennik i powie, co pominął." },
  { obraz: "przewodnik/13-moje-zestawy.webp", tytul: "Moje treningi", tekst: "Zapisane zestawy ćwiczeń, w tym treningi z ułożonego planu, rozgrzewki i rozciągania. Użyjesz ich w kolejnych planach. Możesz je podejrzeć, edytować albo usunąć." },
  { obraz: "przewodnik/14-kolejny-blok.webp", tytul: "Po 4 tygodniach: kolejny blok", tekst: "Gdy plan się skończy, „Ułóż kolejny blok” przygotuje następne 4 tygodnie. Ciężary weźmie z Twoich ostatnich treningów, a ćwiczenia dodatkowe zmieni na inne warianty." }
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
