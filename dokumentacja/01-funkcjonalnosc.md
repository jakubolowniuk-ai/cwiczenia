# Funkcjonalność aplikacji

Stan: **wersja 98** (listopad 2026). Ten plik opisuje, co aplikacja robi dziś, ekran po ekranie. Jak do tego doszliśmy, wersja po wersji, jest w `04-historia-zmian.md`. Kierunek rozwoju i odłożone pomysły są w dokumencie „Strategia platformy aktywności”.

## Cel i zasady

- Aplikacja prowadzi przez treningi różnych aktywności (siłownia, kalistenika, bieganie, pływanie i inne) według planu, zapisuje wyniki i pokazuje postęp.
- **Funkcjonalna, prosta i intuicyjna**: mało głównych ekranów, jedna główna akcja na ekran, tryb prosty domyślnie, szczegóły jednym dotknięciem.
- **Bez konta i serwera**: dane są tylko w telefonie (kopia zapasowa do pliku). Bez reklam. Bez zaleceń dietetycznych.
- Plany mają faktycznie działać: zasady treningowe oparte na wiedzy (progresja, objętość, odciążenie, regeneracja), z wyjaśnieniem „Dlaczego ten plan?”.
- Aplikacja nie zastępuje lekarza, trenera ani instruktora pływania – mówi o tym w kreatorze i w planie pływackim.

## Nawigacja

- Dolny pasek: **Dziś**, **Ćwiczenia**, **Postęp**.
- **Ustawienia** – zębatka na ekranie Dziś.
- **Pomoc „?”** – okrągły przycisk na każdym głównym ekranie i w trybach pełnoekranowych (kreator, Moje możliwości, Ćwicz, bieg, plan ręczny). Okno: 3–5 wskazówek do ekranu, słowniczek pojęć, link do przewodnika.
- **Przewodnik „Jak to działa?”** – 19 kart ze zrzutami ekranu; otwiera się sam przy pierwszym uruchomieniu, potem z ekranu Dziś (bez planu), z pomocy „?” i z Ustawień.

**Słownictwo w aplikacji**: *plan* (np. 4 tygodnie), *blok* (4 tygodnie planu), *trening* (to, co robisz danego dnia), *zestaw ćwiczeń* (lista ćwiczeń treningu siłowego), *rodzaj treningu* (Siłownia, Bieganie, Basen…), *ścieżka* (kroki do umiejętności), *cel*. Pływanie: *długość* (basen od ściany do ściany), *blok* (część treningu na basenie), *start co* (odjazd), *najdłuższy odcinek*.

## Rodzaje treningów

| Rodzaj | Co się planuje | Jak się zalicza |
|---|---|---|
| Siłownia | zestaw ćwiczeń: serie, powtórzenia, ciężar | wszystkie ćwiczenia zrobione |
| Kalistenika | zestaw ćwiczeń (masa ciała, opcjonalnie dodatkowy ciężar) | jw. |
| Trening statyczny | czasy serii (deska, zwisy, L-sit) | jw. |
| Rozgrzewka, Rozciąganie, Joga / mobilność | zestaw ćwiczeń (czas lub powtórzenia) | jw. |
| Bieganie | rodzaj biegu, dystans i/lub czas, odcinki | wpisany wynik (stoper, GPS, ręcznie, GPX) |
| Basen | długości basenu w blokach lub w trybie prostym | wpisany wynik |
| Rower | dystans, czas | wpisany wynik (ręcznie) |
| Spacer | kroki, dystans, czas | wpisany wynik (ręcznie) |

Rodzaje, partie (8) i mięśnie (43) to dane, nie kod. Każdy plan może łączyć kilka rodzajów.

## Ćwiczenia

Zakładka **Ćwiczenia** ma trzy części: **Baza**, **Moje zestawy**, **Ścieżki**.

### Baza ćwiczeń
- Wbudowana baza ok. **500 ćwiczeń** z opisem wykonania (pozycja startowa, ruch, uwagi), mięśniami i poziomem trudności 1–5 (kolorowe półksiężyce: zielony → czerwony). Wczytuje się sama przy pierwszym starcie, po usunięciu danych i przy nowej wersji bazy. Ćwiczeń z bazy nie da się usunąć, można je ukryć.
- Na górze: **wyszukiwarka** i przycisk **„Filtry · n”**. Arkusz filtrów od dołu: Pokaż (Baza / Moje ćwiczenia / Wszystkie), partia i jej mięśnie, rodzaj treningu, trudność, mięsień, kolejność, ukryte ćwiczenia; „Pokaż N ćwiczeń”. Włączone filtry widać jako chipy z ✕, plus szybki chip „Moje ćwiczenia (n)”.
- **Szczegóły ćwiczenia** (dotknięcie karty): początek opisu, rekord, szacowany 1RM, ostatni trening oraz:
  - *Opis i wyniki* – pełny opis, film (YouTube w oknie), wykres postępu (ciężar / 1RM / objętość albo powtórzenia), tabela, informacja o stagnacji;
  - *Mięśnie* – sylwetka z zaznaczonymi mięśniami;
  - *Rekord* – ręczny wpis; *Historia* – lista wykonań i największy ciężar;
  - *Edytuj*, *Ukryj*, *Usuń* (tylko własne);
  - **„Dodaj do zestawu…”** – dopisuje ćwiczenie do wybranego zestawu, a także do przyszłych, niezaliczonych treningów planów, które używają tego zestawu (ilość startowa: zapisana przy ćwiczeniu albo 3 × 10 / 3 × 30 s; zmienisz ją w edycji planu).
- **„+ Dodaj ćwiczenie”** (pływający przycisk): własne ćwiczenie – nazwa, rodzaj, partie, mięśnie (sylwetka do dotykania), poziom, możliwość ciężaru, opis, link do filmu.
- Ćwiczenia jednostronne pokazują „na stronę” i wyjaśnienie liczenia serii.

### Moje zestawy
- Zestaw ćwiczeń = nazwa i lista ćwiczeń (kolejność ma znaczenie), opcjonalnie domyślne ilości. Może być blokiem rozgrzewki albo rozciągania.
- Zestawy z ułożonego planu zapisują się tu same; 10 gotowych zestawów (rozgrzewki, rozciągania, mobilność, postawa, dno miednicy).
- Pokaż / Edytuj / Ukryj / Usuń; wyszukiwarka.

### Ścieżki
- **56 ścieżek** w czterech rozwijanych grupach: Kalistenika (37), Siłownia (16), Bieganie (2), Pływanie (1). Każda ścieżka to kroki od łatwych do trudnych z kryterium przejścia dalej, ostrzeżeniami i ćwiczeniami wspierającymi.
- „Ustal, gdzie jestem” → znacznik „Tu jesteś”, pasek postępu, „Twój cel”.
- **Kroki zaliczają się same**: ćwiczenia – gdy w treningu spełnisz kryterium kroku; bieganie – z czasu, dystansu i pauz biegu; pływanie – z najdłuższego odcinka bez zatrzymania (2 / 4 / 8 długości → 400 m → 800 m → 1 km → 1500 m).

## Moje możliwości (test sprawności)
- Masa ciała: pompki, podciągnięcia, dipy, przysiady, deska, zwis; opcjonalnie ciężary na 10 powtórzeń (sztanga, hantle). Puste = nie wiem / nie robię.
- Obowiązkowy przed planem siłowym i kalistenicznym; dobiera trudność wariantów i ciężary startowe. Przypomnienie po 8 tygodniach, propozycja testu w tygodniu testowym i przed kolejnym blokiem. Lepsza seria w treningu sama podnosi wynik.

## Plany

### „Ułóż mi plan” (kreator)
Nakładka z pytaniami krok po kroku, na końcu podsumowanie: pierwszy tydzień, „Dlaczego ten plan?”, uwagi i „Zacznij”. Plan to blok 4 tygodni; przy 8–16 tygodniach kolejne bloki powstają po drodze.

- **Siłownia / dom / kalistenika / zdrowie**: cel (masa, rzeźba, siła, zdrowie, kalistenika), doświadczenie, dni 2–6, czas treningu, rozgrzewka i rozciąganie, sprzęt, drążek i poręcze, bolące miejsca, priorytet partii, kardio, ukryte ćwiczenia, cele umiejętności (do 3 ścieżek lub liczb), Moje możliwości, długość. Generator dobiera podział (całe ciało, góra/dół, push/pull/legs), ćwiczenia według poziomu i sprzętu, omija kolizje z bólem, liczy serie tygodniowo, dopasowuje do czasu, zawsze zostawia brzuch. 4. tydzień bloku jest lżejszy, z testem.
- **Bieganie**: cel (pierwsze 5 km, 5 km szybciej, 10 km, półmaraton, forma), czy biegasz 20 minut, poziom, biegi w tygodniu, siła dla biegacza lub całe ciało, długość. Objętość +8% na tydzień, co 4. tydzień lżej, akcenty (tempowy, interwały), marszobieg z odcinkami, sprawdzian na końcu. Ścieżka „Bieganie” trafia do celów.
- **Pływanie**: cel (zacznij pływać regularnie; 400 / 800 / 1000 / 1500 m bez zatrzymania; kondycja; szybciej na 100 / 400 / 1500 m; nowy styl), basen, test „ile długości kraulem bez zatrzymania”, znane style, 1–4 razy w tygodniu, 30–90 min, długość. Każdy trening: rozgrzewka, technika (ćwiczenie techniczne z opisem i sprzętem), część główna, wyciszenie. Objętość +~10% na tydzień, co 4. tydzień lżej i sprawdzian, odcinki rosną, przerwy maleją (8×50 → 4×100 → 3×200 → 2×400 → 800), ~80/20 intensywności, sprawdzian celu na końcu. Ścieżka „Pływanie” jako cel, start z testu. Uwaga bezpieczeństwa.
- Plan siłowy może zapisać treningi jako Moje zestawy.

### Plan ręczny
1. Okres (tydzień / miesiąc), nazwa, rodzaje treningów (z partiami lub „Ogólnorozwojowy”) i ile razy.
2. Kalendarz: rozłóż treningi w dni (albo „Zaproponuj rozkład”); w każdym treningu zestaw ćwiczeń z parametrami albo cel biegu / basenu / roweru / spaceru; przenoszenie, kopiowanie do innych, usuwanie; „Zamień na inne” przy ćwiczeniu.
3. „Zapisz plan”. Szkic zapisuje się sam.

### Edycja i wiele planów
- „Edytuj plan” z ekranu Dziś i Postępu; treningi z postępem są zablokowane.
- Kilka planów naraz (np. siła + bieg), każdy można wyłączyć. Plan zamyka się ręcznie; zamknięte zostają w historii.

### Między treningami i blokami
- **Propozycje na dziś**: więcej ciężaru albo powtórzeń, trudniejszy wariant, krok ścieżki dalej albo niżej – z powodem; „Przyjmij” / „Zostaw”.
- **Ocena ćwiczeń** (Łatwo / W sam raz / Ciężko) po treningu.
- **Kolejny blok**: podsumowanie (treningi, oceny, dystanse, basen, wysiłek), zmiany w kolejnym bloku (dni, ciężary, powtórzenie tygodni biegu lub basenu, nowy punkt startu pływania), propozycja testu. Ciężary z ostatnich treningów, dodatkowe ćwiczenia w nowych wariantach.

## Ekran Dziś

- Treningi zaplanowane na dziś ze wszystkich włączonych planów, z postępem planu.
- **Trening siłowy**: rozgrzewka, ćwiczenia, rozciąganie. Kwadracik zalicza ćwiczenie jak w planie; dotknięcie wartości otwiera okno „inne wartości” (serie, powtórzenia, ciężar, + / − seria). Przeciąganie zmienia kolejność. ⇄ zamienia ćwiczenie na odpowiednik. Opis przy każdym ćwiczeniu.
- **„Ćwicz”** – tryb pełnoekranowy: seria po serii, − / + dla powtórzeń i ciężaru, stoper dla ćwiczeń na czas, przerwa z odliczaniem (± 15 s, zapamiętuje się), dźwięk i wibracja, opis następnego ćwiczenia, kalkulator talerzy przy sztandze, % szacowanego 1RM, ocena na końcu. Ekran nie gaśnie. Po zamknięciu – karta „Przerwany trening → Wznów”.
- **Skróć trening** (15–45 min) z podglądem, „Przywróć pełny trening”.
- **Jak się dziś czujesz?** – słabszy dzień (−15% ciężaru, seria mniej), ból (pomiń / zamień / zostaw ćwiczenia obciążające to miejsce); trzeci słaby dzień w tygodniu → propozycja **tygodnia lżej**.
- Karty: propozycje, stagnacja ćwiczenia (zmiana zakresu, tydzień lżej, inny wariant), tydzień testowy, podsumowanie tygodnia (niedziela wieczór / poniedziałek, z „Udostępnij”), ciężkie nogi przed mocnym biegiem (zamiana dni), przypomnienie o kopii, przerwany trening, niezapisany bieg.
- **Bieg**: „▶ Start”, „Wpisz wynik ręcznie”, „Wczytaj bieg z pliku GPX”.
- **Basen**: cel w jednej linii („31 dł. × 25 m = 775 m · kraul 24, dowolnie wybrany 7 · trening 45 min”), rozwijany „Plan treningu” z blokami, notatkami i sprzętem, „Wpisz wynik”.
- Rower, spacer: „Wpisz wynik”.
- Stany: brak planu (Ułóż mi plan / plan ręcznie / Jak to działa?), odpoczynek (następny trening), koniec planu (podsumowanie, kolejny blok).

## Bieganie

- **Edycja treningu biegowego**: rodzaj (spokojny, tempowy, interwały, długi, marszobieg), dystans i/lub czas, obciążenie, odcinki (rozgrzewka, bieg, szybko, wolno, marsz, schłodzenie; powtórzenia; tempo docelowe; szablony).
- **Ekran biegu**: duży czas, cel, kafle dystansu i tempa, bieżący odcinek z odliczaniem i sygnałem, Pauza, Stop z potwierdzeniem. Odcinki na dystans przełączają się same z GPS. Ekran nie gaśnie. Stan przeżywa odświeżenie.
- **GPS**: zgoda przy pierwszym starcie, filtr błędów (dokładność, skoki, wygładzanie, stanie w miejscu), sygnał szukam / dobry / słaby / brak, trasa w pamięci telefonu, eksport GPX, przeliczenie dystansu. Działa tylko przy włączonym ekranie.
- **Wynik**: dystans, czas, tempo na żywo, wysiłek 1–10, odcinki; niezapisany pomiar nie ginie.
- Postęp → **Bieganie**: tydzień, wykres 8 tygodni (czas / dystans), seria tygodni, rekordy 1 / 5 / 10 km i półmaraton, historia biegów ze szczegółami.
- Poziom szczegółów: Podstawowe / Wszystkie.

## Pływanie

- **Basen**: w Ustawieniach „Mój basen” (25 m / 50 m / 25 jardów / inny); w każdym treningu można wybrać inny. Wpisujesz **długości**, metry liczą się same.
- **Tryb prosty**: wiersze „długości + styl”, **„+ Dodaj styl”** dla kilku stylów w jednym treningu (np. kraul 16 + grzbietowy 4), ✕ usuwa wiersz.
- **Tryb „Bloki”**: każdy blok – część treningu (rozgrzewka, technika, część główna, wyciszenie), powtórzenia × długości, styl, intensywność, przerwa albo „start co”, sprzęt (deska, ósemka, płetwy, łapki, fajka), notatka. Bloki zwinięte do jednej linii, dotknięcie rozwija; ↑ ↓ kopiuj usuń. Gotowe treningi: Technika (~1500 m), Wytrzymałość (~2000 m), Sprint (~1200 m). Podsumowanie: długości, metry, szacowany czas.
- **Style**: Kraul (dawny „Dowolny”), Grzbietowy, Klasyczny, Motylkowy, Zmienny, Dowolnie wybrany.
- **Wynik**: „Zrobione wg planu” – jedno dotknięcie. „Poprawiam”: długości według stylów (wiersze z planu, „+ Dodaj styl”), czas pływania (do tempa i rekordów), czas całego treningu, najdłuższy odcinek bez zatrzymania, wysiłek; na żywo metry i tempo /100 m.
- Postęp → **Pływanie**: ten tydzień, tempo (ostatnie i średnie), metry według stylów w tym miesiącu, wykres metrów (tygodnie / miesiące), najdłużej bez zatrzymania, rekordy 50–1500 m osobno dla basenów i stylów (tylko pływanie bez zatrzymania jednym stylem z czasem), historia pływania.

## Rower i spacer
- Na razie wpis ręczny: rower – dystans i czas; spacer – kroki, dystans, czas; opcjonalne obciążenie przy spacerze. Rekordy dystansu i najdłuższe wyniki w Postępie.
- Moduł rowerowy z GPS i spacer z tego samego ekranu są w planie (etap 2 strategii).

## Postęp

- Na górze **grafika mięśni**: które mięśnie ćwiczysz i jak mocno.
- Rozwijane sekcje (stan zostaje do zamknięcia aplikacji):
  - **Twój plan** – realizacja %, kafelki Dziś i okres, seria, edycja i usuwanie (z „Zamknij plan, zachowaj historię”); przy kilku planach wybór chipami;
  - **Moje cele** – ścieżki (krok N z M, pasek) i liczby;
  - **Bieganie**, **Pływanie** – gdy są wyniki;
  - **Rekordy** – w ćwiczeniach (automatyczne i ręczne), na dystansie (bieg, rower, basen; ręcznie z podpowiedziami), najdłuższe wyniki;
  - **Moje plany** – włączanie / wyłączanie; **Poprzednie plany** – historia z procentem realizacji.
- Na dole „Ułóż mi plan” i „Nowy plan ręcznie”.

## Rekordy
- Ćwiczenia: rekordowa seria (największy ciężar z powtórzeniami; bez ciężaru – najwięcej powtórzeń; na czas – najdłużej), zapisuje się sama po zaliczeniu. Szacowany 1RM (Epley) z ostatnich 120 dni.
- Dystans: bieganie automatycznie (±3%), basen automatycznie w karcie Pływanie; ręczne rekordy na dystansie z pytaniem „Nowy rekord! Zapisać?” po pasującym wyniku.

## Ustawienia

Rozwijane sekcje:
- **Moje możliwości** – wyniki testu, data, „Zrób test / Zmień”.
- **Trening siłowy** – dźwięk, wibracja, domyślna przerwa (gryf i talerze ustawia się w kalkulatorze talerzy w trybie Ćwicz).
- **Bieganie** – ilość szczegółów, serie i rekordy, ekran nie gaśnie, GPS, odcinki na dystans, przeliczenie tras.
- **Pływanie** – Mój basen, nowy trening: Prosty / Bloki.
- **Przypomnienie** – alarm, godzina, plik kalendarza (.ics).
- **Wygląd** – jasny / ciemny / jak telefon.
- **Kopia zapasowa** – zapis do pliku, wczytanie, data ostatniej kopii (przypomnienie co 7 dni na Dziś).
- **Pomoc** – przewodnik.
- **Usuwanie danych** – „Usuń wszystkie dane…” z dwoma potwierdzeniami (wpisz USUŃ) i automatyczną kopią.

## Bezpieczeństwo danych i jakość
- Ostrzeżenia przed nierealnymi wartościami (literówki): ciężar, powtórzenia, serie, czasy, dystanse, tempo, kroki, wyniki testu.
- Trwający trening i bieg przeżywają zamknięcie aplikacji; trasy GPS zapisują się co 5 s.
- Dostępność: kontrast WCAG AA (jasny i ciemny motyw), etykiety dla czytnika ekranu, duże pola dotyku, widoczny fokus.
- Działa offline (service worker); filmy wymagają internetu.

## Ograniczenia (znane)
- GPS tylko przy włączonym ekranie i aplikacji na wierzchu – rozwiązanie w wersji APK (etap 3 strategii).
- Przypomnienia przez plik kalendarza, bez prawdziwego alarmu – też APK.
- Kroków nie da się liczyć w przeglądarce (krokomierz telefonu niedostępny).
- Brak mapy trasy, ekranu treningu w wodzie (czeka na integrację z zegarkiem), kont i synchronizacji między telefonami.
- Dane giną z telefonem lub przy czyszczeniu danych przeglądarki, jeśli nie ma kopii.
