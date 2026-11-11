// ===== Pomoc kontekstowa „?” =====
// Przycisk „?” w nagłówku ekranu otwiera krótką pomoc do tego ekranu, słowniczek pojęć i link do przewodnika ze zdjęciami.

const POMOC = {
  dzis: {
    tytul: "Ekran Dziś",
    punkty: [
      "Tu są treningi zaplanowane na dziś. Kwadracik przy ćwiczeniu zalicza je tak, jak w planie.",
      "„Ćwicz” prowadzi przez trening seria po serii: PRACA, potem PRZERWA z pierścieniem odliczania i sygnałem. Na końcu zobaczysz, ile trwała praca, a ile przerwy.",
      "Zrobiłeś(aś) inaczej niż w planie? Popraw wartości – postęp i kolejne propozycje liczą się z tego, co wpiszesz.",
      "Bieg: „Start” włącza stoper (i GPS, jeśli go włączysz). Bieg z zegarka dodasz przyciskiem „Wczytaj bieg z pliku GPX”.",
      "Basen: „Wpisz wynik” → „Zrobione wg planu” zapisuje trening jednym dotknięciem. Było inaczej? „Poprawiam”: długości dla każdego stylu (+ Dodaj styl), czas i najdłuższy odcinek bez zatrzymania.",
      "„Skróć trening” i „Jak się dziś czujesz?” dopasują dzisiejszy trening, gdy masz mniej czasu albo słabszy dzień.",
      "Na górze mogą pojawić się karty: przerwany trening do wznowienia, propozycje zmian, podsumowanie tygodnia i przypomnienie o kopii zapasowej."
    ]
  },
  baza: {
    tytul: "Baza ćwiczeń",
    punkty: [
      "Wpisz nazwę w wyszukiwarkę albo dotknij „Filtry”: partia mięśni, rodzaj treningu, trudność 1–5 (kolor od zielonego do czerwonego), mięsień i kolejność. Włączone filtry widać pod wyszukiwarką – ✕ wyłącza filtr.",
      "Dotknij ćwiczenia, żeby zobaczyć opis, wyniki z wykresem, mięśnie, rekord i historię. Tam też edytujesz, ukrywasz albo dodajesz ćwiczenie do swojego zestawu.",
      "„+ Dodaj ćwiczenie” (w prawym dolnym rogu) tworzy Twoje własne ćwiczenie. Własne są osobno – chip „Moje ćwiczenia” pod wyszukiwarką.",
      "Ćwiczenia, których nie robisz, możesz ukryć – kreator planu nie będzie ich wstawiał."
    ]
  },
  zestawy: {
    tytul: "Moje zestawy",
    punkty: [
      "Zestaw ćwiczeń to lista ćwiczeń, z której składa się trening siłowy (np. „Trening A”). Plan przypisuje zestaw do treningu w danym dniu.",
      "Zestawy z ułożonego planu zapisują się tu same. Możesz je edytować i używać w kolejnych planach.",
      "Ćwiczenie dodane do zestawu (w Bazie: ćwiczenie → „Dodaj do zestawu…”) trafia też do przyszłych treningów planów, które używają tego zestawu.",
      "Blok rozgrzewki dołącza się przed treningiem, blok rozciągania po nim."
    ]
  },
  sciezki: {
    tytul: "Ścieżki",
    punkty: [
      "Ścieżki są w czterech grupach: Kalistenika, Siłownia, Bieganie i Pływanie. Dotknij grupy, żeby rozwinąć jej listę.",
      "Ścieżka to kolejne kroki do umiejętności, np. od podciągania z gumą do 10 podciągnięć.",
      "„Tu jesteś” pokazuje Twój krok. Krok zalicza się sam, gdy w treningu zrobisz wymagany wynik (bieg: czas lub dystans, basen: najdłuższy odcinek bez zatrzymania).",
      "Ścieżkę możesz dodać jako cel planu (najwyżej 3 cele) – generator wstawi jej ćwiczenia do treningów."
    ]
  },
  postep: {
    tytul: "Postęp",
    punkty: [
      "Na górze grafika mięśni: które partie ćwiczysz najwięcej. Niżej sekcje – dotknij nagłówka, żeby rozwinąć.",
      "„Twój plan”: realizacja, dzisiejsze i okresowe treningi, edycja i usuwanie planu.",
      "Moje cele, Bieganie, Pływanie i Rekordy liczą się same z zapisanych wyników (dystans, tempo, rekordy, serie tygodni).",
      "„Moje plany” – włączanie i wyłączanie planów, „Poprzednie plany” – historia. Na dole „Ułóż mi plan” i „Nowy plan ręcznie”."
    ]
  },
  ustawienia: {
    tytul: "Ustawienia",
    punkty: [
      "Moje możliwości: krótki test sprawności. Bez niego kreator nie ułoży planu siłowego ani kalistenicznego.",
      "Dźwięk, wibracja i przerwa, bieganie (ilość szczegółów, GPS, odcinki), pływanie (Twój basen, tryb prosty lub bloki), przypomnienia, wygląd.",
      "Kopia zapasowa: dane są tylko w tym telefonie. Zapisuj plik kopii regularnie, np. na Dysku Google.",
      "„Usuń wszystkie dane…” jest na dole, z podwójnym potwierdzeniem i automatyczną kopią."
    ]
  },
  kreator: {
    tytul: "Kreator planu",
    punkty: [
      "Wybierasz cel: siłownia, kalistenika, bieganie albo pływanie. Odpowiadasz na kilka pytań, a aplikacja układa plan na 4 tygodnie (jeden blok).",
      "Plan siłowy i kalisteniczny potrzebuje testu „Moje możliwości” – na jego podstawie dobieram trudność ćwiczeń i ciężary. Bieg i basen mają własny krótki test w pytaniach.",
      "Na końcu zobaczysz pierwszy tydzień i „Dlaczego ten plan?”. Po 4 tygodniach podsumowanie i kolejny blok dopasowany do Twoich wyników.",
      "To plan ogólny. Aplikacja nie zastępuje lekarza ani trenera."
    ]
  },
  recznie: {
    tytul: "Plan ręcznie",
    punkty: [
      "Krok 1: wybierz okres i rodzaje treningów, przy każdym wpisz, ile razy chcesz go zrobić.",
      "Krok 2: rozłóż treningi w kalendarzu (albo „Zaproponuj rozkład”) i uzupełnij każdy o zestaw ćwiczeń i parametry.",
      "Basen: wpisujesz długości basenu, metry liczą się same. „Prosty” – długości i styl (+ Dodaj styl), „Bloki” – rozgrzewka, technika, część główna, wyciszenie albo gotowy trening.",
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
      "PRACA: popraw powtórzenia i ciężar przyciskami − i +, jeśli zrobiłeś(aś) inaczej, i dotknij „Zrobione ✓”. Ćwiczenie na czas ma pierścień: Start, odliczanie do celu, po celu zegar liczy dalej (+0:05), a Stop zapisuje czas.",
      "PRZERWA: pierścień pokazuje, ile zostało. Oceń serię: „Ciężko” wydłuża tę przerwę o 30 s, „Łatwo” skraca o 20 s. Przyciskami −15 s i +15 s zmienisz ją ręcznie – aplikacja zapamięta to dla ćwiczenia.",
      "Na dole jest lista całego treningu: co zrobione, co teraz, co zostało.",
      "Ekran nie gaśnie. ✕ zamyka tryb, a zrobione serie zostają zapisane. Po zamknięciu aplikacji na „Dziś” pojawi się „Wznów trening”."
    ]
  },
  zegar: {
    tytul: "Zegar",
    punkty: [
      "Stoper z okrążeniami, minutnik, interwały i alarm – bez planu, od razu.",
      "Interwały: wybierz szablon (Start 1 + 1, 30 / 30, 4 × 4, Tabata, EMOM) albo ustaw własny czas pracy, przerwy i liczbę rund. Rozgrzewka i schłodzenie są opcjonalne.",
      "W trakcie widzisz fazę (PRACA / PRZERWA), rundę i pierścień odliczania. Ostatnie 3 sekundy odliczają sygnał i wibracja. Pauza zatrzymuje czas, Pomiń przechodzi do następnej fazy.",
      "Sygnał i wibracja działają przy włączonym ekranie (minutnik i interwały go nie gaszą). Prawdziwy alarm przy zamkniętej aplikacji da plik kalendarza („Dodaj do kalendarza”).",
      "Zegar nie zapisuje treningu w historii. Wynik biegu albo ćwiczeń wpisz w planie."
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
  ["Cel", "ścieżka albo liczba (np. 30 podciągnięć), do której plan Cię prowadzi."],
  ["Długość (basen)", "jeden przepłynięty basen od ściany do ściany. Na basenie 25 m 4 długości to 100 m."],
  ["Blok (basen)", "część treningu na basenie, np. 4 × 2 długości kraulem z przerwą 20 s."],
  ["Start co (odjazd)", "każde powtórzenie zaczynasz co określony czas, np. co 1:00. Im szybciej płyniesz, tym dłużej odpoczywasz."],
  ["Najdłuższy odcinek", "ile długości przepłynąłeś(aś) bez zatrzymania. Z niego zaliczają się kroki ścieżki „Pływanie”."],
  ["Interwały", "szybkie odcinki (praca) na przemian z wolnymi albo odpoczynkiem (przerwa), powtarzane w rundach."],
  ["EMOM", "co minutę zaczynasz nową rundę: robisz zadanie, a resztę minuty odpoczywasz."],
  ["Tabata", "8 rund po 20 s maksymalnego wysiłku i 10 s przerwy. Bardzo ciężkie."]
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
  pomocPrzyNaglowku(document.querySelector("#ekran-zegar > h1"), "zegar", "Zegar");
  const zgGora = document.querySelector("#zegar-bieg .cwicz-gora");
  if (zgGora) {
    const bz = pomocPrzycisk("zegar", "Zegar");
    bz.classList.add("na-prawo");
    zgGora.appendChild(bz);
  }
  const cwGora = document.querySelector("#cwicz .cwicz-gora");
  if (cwGora) {
    const b = pomocPrzycisk("cwicz", "Ćwiczenie krok po kroku");
    b.classList.add("na-prawo");
    cwGora.appendChild(b);
  }
})();

// ===== Rozwijane sekcje (Ustawienia, Postęp) =====
// Nagłówek sekcji zamienia się w przycisk, a wszystko do następnego nagłówka trafia do zwijanej treści.
// Na starcie sekcje są zwinięte; to, co użytkownik rozwinął, zostaje rozwinięte do zamknięcia aplikacji.
const sekcjeRozwiniete = {};

function rozwijaneSekcje(kontener, selektor, prefiks) {
  if (!kontener) {
    return;
  }
  const naglowki = Array.prototype.filter.call(kontener.children, function (el) { return el.matches(selektor); });
  naglowki.forEach(function (n, i) {
    const tytul = n.textContent.trim();
    const klucz = prefiks + ":" + tytul;
    const tresc = document.createElement("div");
    tresc.className = "sekcja-tresc";
    tresc.id = "sekcja-" + prefiks + "-" + i;
    let el = n.nextElementSibling;
    while (el && !el.matches(selektor)) {
      const nast = el.nextElementSibling;
      tresc.appendChild(el);
      el = nast;
    }
    // window.sekcjeWszystkieOtwarte – tylko do testów automatycznych
    const otwarta = !!sekcjeRozwiniete[klucz] || window.sekcjeWszystkieOtwarte === true;
    const przycisk = document.createElement("button");
    przycisk.type = "button";
    przycisk.className = "sekcja-przycisk";
    przycisk.setAttribute("aria-expanded", otwarta ? "true" : "false");
    przycisk.setAttribute("aria-controls", tresc.id);
    przycisk.appendChild(tekstElement("span", "sekcja-tytul", tytul));
    if (n.dataset.podsumowanie) {
      przycisk.appendChild(tekstElement("span", "sekcja-podsumowanie", n.dataset.podsumowanie));
    }
    const strzalka = tekstElement("span", "sekcja-strzalka", "▾");
    strzalka.setAttribute("aria-hidden", "true");
    przycisk.appendChild(strzalka);
    tresc.hidden = !otwarta;
    przycisk.addEventListener("click", function () {
      const teraz = tresc.hidden;
      tresc.hidden = !teraz;
      sekcjeRozwiniete[klucz] = teraz;
      przycisk.setAttribute("aria-expanded", teraz ? "true" : "false");
    });
    n.replaceWith(przycisk);
    przycisk.after(tresc);
  });
}

function rozwinSekcje(prefiks, tytul) {
  sekcjeRozwiniete[prefiks + ":" + tytul] = true;
}

// Ustawienia: statyczny HTML – zwijamy raz, przy starcie
rozwijaneSekcje(document.querySelector("#ustawienia-okno .postep-okno-tresc"), ".ust-naglowek", "ust");
