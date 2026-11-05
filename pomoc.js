// ===== Pomoc kontekstowa „?” =====
// Przycisk „?” w nagłówku ekranu otwiera krótką pomoc do tego ekranu, słowniczek pojęć i link do przewodnika ze zdjęciami.

const POMOC = {
  dzis: {
    tytul: "Ekran Dziś",
    punkty: [
      "Tu są treningi zaplanowane na dziś. Kwadracik przy ćwiczeniu zalicza je tak, jak w planie.",
      "„Ćwicz” prowadzi przez trening seria po serii, z odliczaniem przerwy i sygnałem.",
      "Zrobiłeś(aś) inaczej niż w planie? Popraw wartości – postęp i kolejne propozycje liczą się z tego, co wpiszesz.",
      "Bieg: „Start” włącza stoper (i GPS, jeśli go włączysz). Bieg z zegarka dodasz przyciskiem „Wczytaj bieg z pliku GPX”.",
      "Na górze mogą pojawić się karty: przerwany trening do wznowienia i przypomnienie o kopii zapasowej."
    ]
  },
  baza: {
    tytul: "Baza ćwiczeń",
    punkty: [
      "Filtruj po partii mięśni, rodzaju treningu i trudności. Kolor kropki to trudność: od zielonego (na start) do czerwonego.",
      "Dotknij ćwiczenia, żeby zobaczyć opis wykonania.",
      "„+ Dodaj ćwiczenie” tworzy Twoje własne ćwiczenie. Własne ćwiczenia (też dodane z pliku) są osobno – przełącznik „Baza / Moje ćwiczenia” nad wyszukiwarką.",
      "Ćwiczenia, których nie robisz, możesz ukryć – kreator planu nie będzie ich wstawiał."
    ]
  },
  zestawy: {
    tytul: "Moje zestawy",
    punkty: [
      "Zestaw ćwiczeń to lista ćwiczeń, z której składa się trening siłowy (np. „Trening A”). Plan przypisuje zestaw do treningu w danym dniu.",
      "Zestawy z ułożonego planu zapisują się tu same. Możesz je edytować i używać w kolejnych planach.",
      "Blok rozgrzewki dołącza się przed treningiem, blok rozciągania po nim."
    ]
  },
  sciezki: {
    tytul: "Ścieżki",
    punkty: [
      "Ścieżki są w trzech grupach: Kalistenika, Siłownia i Bieganie. Dotknij grupy, żeby rozwinąć jej listę.",
      "Ścieżka to kolejne kroki do umiejętności, np. od podciągania z gumą do 10 podciągnięć.",
      "„Tu jesteś” pokazuje Twój krok. Krok zalicza się sam, gdy w treningu zrobisz wymagany wynik.",
      "Ścieżkę możesz dodać jako cel planu (najwyżej 3 cele) – generator wstawi jej ćwiczenia do treningów."
    ]
  },
  postep: {
    tytul: "Postęp",
    punkty: [
      "Tydzień i kalendarz pokazują, co zrobiłeś(aś). Dotknij dnia, żeby zobaczyć szczegóły.",
      "Rekordy, cele i bieganie (dystans, tempo, serie tygodni) liczą się same z zapisanych wyników.",
      "Tu są też Twoje plany: włączanie, edycja, usuwanie i „Nowy plan”."
    ]
  },
  ustawienia: {
    tytul: "Ustawienia",
    punkty: [
      "Moje możliwości: krótki test sprawności. Bez niego kreator nie ułoży planu.",
      "Przypomnienia, dźwięk i wibracja, bieganie (ilość szczegółów, GPS, odcinki), wygląd.",
      "Kopia zapasowa: dane są tylko w tym telefonie. Zapisuj plik kopii regularnie, np. na Dysku Google.",
      "„Usuń wszystkie dane…” jest na dole, z podwójnym potwierdzeniem i automatyczną kopią."
    ]
  },
  kreator: {
    tytul: "Kreator planu",
    punkty: [
      "Odpowiadasz na kilka pytań, a aplikacja układa plan na 4 tygodnie (jeden blok).",
      "Potrzebny jest test „Moje możliwości” – na jego podstawie dobieram trudność ćwiczeń i ciężary.",
      "Na końcu zobaczysz pierwszy tydzień i „Dlaczego ten plan?”. Po 4 tygodniach podsumowanie i kolejny blok dopasowany do Twoich wyników.",
      "To plan ogólny. Aplikacja nie zastępuje lekarza ani trenera."
    ]
  },
  recznie: {
    tytul: "Plan ręcznie",
    punkty: [
      "Krok 1: wybierz okres i rodzaje treningów, przy każdym wpisz, ile razy chcesz go zrobić.",
      "Krok 2: rozłóż treningi w kalendarzu (albo „Zaproponuj rozkład”) i uzupełnij każdy o zestaw ćwiczeń i parametry.",
      "Przy każdym ćwiczeniu jest „Zamień na inne” – podpowie odpowiedniki (te same mięśnie, podobna trudność). Zmiana zapisze się po „Zapisz plan”.",
      "Pusty znacznik w kalendarzu = trening jeszcze nieuzupełniony."
    ]
  },
  mozliwosci: {
    tytul: "Moje możliwości",
    punkty: [
      "Zrób rozgrzewkę, potem każde ćwiczenie do momentu, gdy technika zaczyna się psuć (nie do upadku).",
      "Czego nie robisz albo nie wiesz – zostaw puste. 0 też jest wynikiem.",
      "Powtarzaj test co 4–8 tygodni (w tygodniu testowym planu). Kolejny blok użyje nowego wyniku."
    ]
  },
  cwicz: {
    tytul: "Ćwiczenie krok po kroku",
    punkty: [
      "Popraw powtórzenia i ciężar przyciskami − i +, jeśli zrobiłeś(aś) inaczej, i dotknij „Zrobione ✓”.",
      "Przerwę wydłużysz lub skrócisz o 15 s – aplikacja zapamięta to dla ćwiczenia.",
      "Ekran nie gaśnie. ✕ zamyka tryb, a zrobione serie zostają zapisane. Po zamknięciu aplikacji na „Dziś” pojawi się „Wznów trening”."
    ]
  },
  bieg: {
    tytul: "Bieg",
    punkty: [
      "Pauza zatrzymuje czas, Stop kończy bieg (z potwierdzeniem).",
      "GPS liczy dystans i tempo tylko przy włączonym ekranie i aplikacji na wierzchu. Na bieżni wyłącz GPS.",
      "Odcinki na czas i (z GPS) na dystans przełączają się same z sygnałem. „Odcinek zrobiony” działa zawsze."
    ]
  }
};

const POMOC_SLOWNICZEK = [
  ["Plan", "rozkład treningów na kolejne tygodnie, dzielony na bloki po 4 tygodnie."],
  ["Blok", "4 tygodnie planu. Po bloku widzisz podsumowanie, a kolejny blok dopasowuje się do Twoich wyników."],
  ["Trening", "to, co robisz danego dnia, np. siła we wtorek albo bieg w czwartek."],
  ["Zestaw ćwiczeń", "lista ćwiczeń, z której składa się trening siłowy. Twoje zestawy są w „Moje zestawy”."],
  ["Ćwiczenie", "pojedynczy ruch, np. pompki albo przysiad."],
  ["Rodzaj treningu", "siłownia, kalistenika, bieganie, rower, basen itd."],
  ["Ścieżka", "kolejne kroki do umiejętności, np. do pierwszego podciągnięcia."],
  ["Cel", "ścieżka albo liczba (np. 30 podciągnięć), do której plan Cię prowadzi."]
];

function pomocOtworz(klucz) {
  const p = POMOC[klucz] || POMOC.dzis;
  const tlo = document.createElement("div");
  tlo.className = "gps-zgoda-tlo";
  tlo.setAttribute("role", "dialog");
  tlo.setAttribute("aria-label", "Pomoc: " + p.tytul);
  const okno = document.createElement("div");
  okno.className = "gps-zgoda pomoc-okno";
  okno.appendChild(tekstElement("h2", "", p.tytul));
  const lista = document.createElement("ul");
  lista.className = "pa-lista";
  p.punkty.forEach(function (t) { lista.appendChild(tekstElement("li", "", t)); });
  okno.appendChild(lista);

  const slownik = document.createElement("details");
  slownik.className = "pomoc-slownik";
  slownik.appendChild(tekstElement("summary", "", "Słowniczek pojęć"));
  POMOC_SLOWNICZEK.forEach(function (s) {
    const w = document.createElement("p");
    w.appendChild(tekstElement("b", "", s[0] + " – "));
    w.appendChild(document.createTextNode(s[1]));
    slownik.appendChild(w);
  });
  okno.appendChild(slownik);

  const zamknij = function () {
    tlo.remove();
    document.removeEventListener("keydown", klawisz);
  };
  const klawisz = function (e) {
    if (e.key === "Escape") {
      zamknij();
    }
  };
  document.addEventListener("keydown", klawisz);
  if (typeof otworzPrzewodnik === "function") {
    const przew = tekstElement("button", "przycisk wielki drugi", "Przewodnik ze zdjęciami");
    przew.type = "button";
    przew.addEventListener("click", function () {
      zamknij();
      otworzPrzewodnik();
    });
    okno.appendChild(przew);
  }
  const ok = tekstElement("button", "przycisk wielki", "Rozumiem");
  ok.type = "button";
  ok.addEventListener("click", zamknij);
  okno.appendChild(ok);
  tlo.addEventListener("click", function (e) {
    if (e.target === tlo) {
      zamknij();
    }
  });
  tlo.appendChild(okno);
  document.body.appendChild(tlo);
  ok.focus();
}

// Dostępność: łączy etykietę z polem (czytnik ekranu odczyta nazwę pola, a dotknięcie etykiety ustawi kursor w polu)
let dostepnoscLicznik = 0;
function dostepnoscPowiaz(etykieta, pole) {
  if (!pole.id) {
    dostepnoscLicznik++;
    pole.id = "pole-auto-" + dostepnoscLicznik;
  }
  etykieta.htmlFor = pole.id;
}

// Przycisk „?”. klucz może być funkcją (np. zależnie od wybranej zakładki).
function pomocPrzycisk(klucz, nazwaEkranu) {
  const b = tekstElement("button", "pomoc-przycisk", "?");
  b.type = "button";
  b.setAttribute("aria-label", "Pomoc" + (nazwaEkranu ? ": " + nazwaEkranu : ""));
  b.addEventListener("click", function (e) {
    e.stopPropagation();
    pomocOtworz(typeof klucz === "function" ? klucz() : klucz);
  });
  return b;
}

// Wstawia „?” obok tytułu h1 (owija go w rząd z przyciskiem po prawej)
function pomocPrzyNaglowku(h1, klucz, nazwa) {
  if (!h1 || h1.dataset.pomoc) {
    return;
  }
  h1.dataset.pomoc = "1";
  const rzad = document.createElement("div");
  rzad.className = "naglowek-rzad";
  h1.parentNode.insertBefore(rzad, h1);
  rzad.appendChild(h1);
  rzad.appendChild(pomocPrzycisk(klucz, nazwa));
}

(function () {
  // Dziś: „?” obok zębatki
  const zebatka = document.getElementById("otworz-ustawienia");
  if (zebatka) {
    const ikony = document.createElement("div");
    ikony.className = "naglowek-ikony";
    zebatka.parentNode.insertBefore(ikony, zebatka);
    ikony.appendChild(pomocPrzycisk("dzis", "Dziś"));
    ikony.appendChild(zebatka);
  }
  pomocPrzyNaglowku(document.querySelector("#ekran-cwiczenia > h1"), function () {
    const t = document.getElementById("przelacznik-treningi");
    const s = document.getElementById("przelacznik-sciezki");
    if (s && s.classList.contains("aktywny")) {
      return "sciezki";
    }
    return t && t.classList.contains("aktywny") ? "zestawy" : "baza";
  }, "Ćwiczenia");
  pomocPrzyNaglowku(document.querySelector("#ekran-postep > h1"), "postep", "Postęp");
  const ust = document.getElementById("ustawienia-wstecz");
  if (ust && ust.parentNode) {
    const b = pomocPrzycisk("ustawienia", "Ustawienia");
    b.classList.add("na-prawo");
    ust.parentNode.appendChild(b);
  }
  const krNagl = document.querySelector(".kreator-naglowek");
  if (krNagl) {
    const b = pomocPrzycisk("recznie", "Plan ręcznie");
    b.classList.add("na-prawo");
    krNagl.appendChild(b);
  }
  const cwGora = document.querySelector(".cwicz-gora");
  if (cwGora) {
    const b = pomocPrzycisk("cwicz", "Ćwiczenie krok po kroku");
    b.classList.add("na-prawo");
    cwGora.appendChild(b);
  }
})();
