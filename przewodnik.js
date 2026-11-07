// ===== Przewodnik: krótkie karty ze zrzutami ekranu =====
// Pokazuje się sam przy pierwszym uruchomieniu (dane.przewodnikWidziany) i pod przyciskiem "Jak to działa?".
// Zrzuty generuje narzedzia/zrzuty-przewodnika.js z działającej aplikacji (po zmianach w wyglądzie uruchom go ponownie).

const KARTY_PRZEWODNIKA = [
  { obraz: "przewodnik/01-start.webp", tytul: "Witaj w aplikacji do ćwiczeń", tekst: "Trzy zakładki: Dziś (co robisz dzisiaj), Ćwiczenia (baza, Twoje zestawy i ścieżki) oraz Postęp. Zębatka na Dziś otwiera Ustawienia, a „?” na każdym ekranie – krótką pomoc. Najprościej zacząć od „Ułóż mi plan”." },
  { obraz: "przewodnik/02-kreator.webp", tytul: "Ułóż mi plan", tekst: "Wybierz cel: siłownia, kalistenika, bieganie albo pływanie. Odpowiedz na kilka pytań (dni, czas, sprzęt, co boli), a aplikacja dobierze treningi, serie, ciężary albo dystanse." },
  { obraz: "przewodnik/02b-mozliwosci.webp", tytul: "Moje możliwości", tekst: "Przed planem siłowym zrób krótki test: pompki, podciągnięcia, przysiady, deska i opcjonalnie ciężary. Na tej podstawie plan dobierze trudność. Powtarzaj go co 4–8 tygodni." },
  { obraz: "przewodnik/03-gotowy-plan.webp", tytul: "Gotowy plan na 4 tygodnie", tekst: "Zobaczysz pierwszy tydzień i „Dlaczego ten plan?”. Treningi możesz zapisać jako swoje zestawy ćwiczeń. „Zacznij” zapisuje plan, a „Zmień odpowiedzi” wraca do pytań." },
  { obraz: "przewodnik/04-dzis.webp", tytul: "Ekran Dziś", tekst: "Dzisiejsze treningi: rozgrzewka, ćwiczenia i rozciąganie. Kwadracik zalicza ćwiczenie tak, jak w planie. Masz mniej czasu albo słabszy dzień? „Skróć trening” i „Jak się dziś czujesz?” dopasują trening." },
  { obraz: "przewodnik/05-cwicz.webp", tytul: "Ćwicz krok po kroku", tekst: "„Ćwicz” prowadzi przez trening seria po serii. Popraw powtórzenia i ciężar przyciskami − i +, jeśli zrobiłeś(aś) inaczej, i dotknij „Zrobione ✓”. Przy sztandze podpowie talerze." },
  { obraz: "przewodnik/06-przerwa.webp", tytul: "Przerwa między seriami", tekst: "Po serii startuje odliczanie przerwy (telefon da znać, gdy minie). Możesz ją wydłużyć lub skrócić o 15 s. Widzisz, co będzie dalej. Zamknięty trening wznowisz z ekranu Dziś." },
  { obraz: "przewodnik/07-ocena.webp", tytul: "Oceń ćwiczenia", tekst: "Na koniec oceń każde ćwiczenie: Łatwo, W sam raz albo Ciężko. Na tej podstawie aplikacja zaproponuje, kiedy dołożyć ciężar, a kiedy odpuścić." },
  { obraz: "przewodnik/08-propozycje.webp", tytul: "Propozycje na dziś", tekst: "Przed kolejnym treningiem zobaczysz propozycje, np. 60 → 65 kg albo jedno powtórzenie więcej, z wyjaśnieniem. Bez Twojej zgody nic się nie zmieni: „Przyjmij” albo „Zostaw”." },
  { obraz: "przewodnik/09-inne-wartosci.webp", tytul: "Zrobiłeś(aś) inaczej niż w planie?", tekst: "Dotknij podkreślonej wartości (np. 3 × 8), zmień serie, powtórzenia albo ciężar i wybierz „Zapisz i zalicz”. Aplikacja zapamięta, ile zrobiłeś(aś) naprawdę." },
  { obraz: "przewodnik/15-bieg.webp", tytul: "Bieganie", tekst: "„Start” włącza stoper i (jeśli chcesz) GPS: dystans, tempo, odcinki interwałowe z sygnałem. GPS działa przy włączonym ekranie. Bieg z zegarka wczytasz z pliku GPX." },
  { obraz: "przewodnik/16-basen.webp", tytul: "Pływanie", tekst: "Treningi wpisujesz w długościach basenu – metry liczą się same. Plan ma bloki: rozgrzewka, technika, część główna, wyciszenie. Po treningu „Zrobione wg planu” albo „Poprawiam” (kilka stylów: „+ Dodaj styl”)." },
  { obraz: "przewodnik/17-sciezki.webp", tytul: "Ścieżki i cele", tekst: "Ścieżka to kolejne kroki do umiejętności: od pierwszej pompki do stania na rękach, od 20 minut biegu do półmaratonu, od 2 długości do 1500 m. Kroki zaliczają się same z Twoich wyników." },
  { obraz: "przewodnik/10-recznie.webp", tytul: "Plan ręcznie", tekst: "Wolisz sam? „Utwórz plan ręcznie”: wybierz rodzaje treningów i ile razy je zrobisz, rozłóż je w kalendarzu (albo „Zaproponuj rozkład”) i dodaj ćwiczenia do każdego treningu." },
  { obraz: "przewodnik/11-postep.webp", tytul: "Postęp", tekst: "Ćwiczone mięśnie na górze, niżej rozwijane sekcje: Twój plan, cele, bieganie, pływanie, rekordy i poprzednie plany. Tu włączasz, edytujesz i usuwasz plany." },
  { obraz: "przewodnik/12-baza.webp", tytul: "Baza ćwiczeń", tekst: "Ok. 500 ćwiczeń z opisem. Szukaj po nazwie albo dotknij „Filtry” (partia, mięsień, rodzaj, trudność 1–5). Dotknij ćwiczenia: opis, wykres wyników, rekord, historia, „Dodaj do zestawu”." },
  { obraz: "przewodnik/12b-ukryte.webp", tytul: "Ukryte ćwiczenia a plan", tekst: "Nie lubisz jakiegoś ćwiczenia? Ukryj je w bazie. Gdy coś jest ukryte, „Ułóż mi plan” zapyta, czy może go użyć. Jeśli nie, wstawi zamiennik i powie, co pominął." },
  { obraz: "przewodnik/13-moje-zestawy.webp", tytul: "Moje zestawy", tekst: "Zapisane zestawy ćwiczeń: treningi z planu, rozgrzewki i rozciągania. Ćwiczenie dodane do zestawu trafia też do przyszłych treningów planu z tym zestawem." },
  { obraz: "przewodnik/14-kolejny-blok.webp", tytul: "Po 4 tygodniach: kolejny blok", tekst: "Gdy blok się skończy, zobaczysz podsumowanie (treningi, oceny, dystanse) i „Ułóż kolejny blok”. Kolejne 4 tygodnie dopasują się do Twoich wyników i nowego testu." }
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
