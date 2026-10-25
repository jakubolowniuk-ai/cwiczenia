# Funkcjonalność aplikacji

## Cel
Pomagać codziennie wykonywać wybrane ćwiczenia i aktywności, planować je i przypominać o nich. Prosto i intuicyjnie.

## Nawigacja
Dolny pasek z głównymi ekranami: **Dziś**, **Ćwiczenia**, **Postęp**. Ustawienia otwiera ikona zębatki na ekranie „Dziś”. Na górze formularzy i okien jest strzałka wstecz.

## Rodzaje aktywności (dane, lista otwarta)
| Rodzaj | Miara w formularzu ćwiczenia | Pola w kreatorze planu |
|---|---|---|
| Siłownia | serie i powtórzenia albo czas | partia |
| Kalistenika | serie i powtórzenia albo czas | partia |
| Trening statyczny | powtórzenia i czas | brak |
| Rozciąganie | serie i powtórzenia albo czas | brak |
| Bieganie | dystans i czas | dystans, czas |
| Basen | style, długości | styl, długości |
| Rower | dystans i czas | dystans, czas |
| Spacer | kroki, dystans i czas (co najmniej jedno) | kroki, dystans, czas |
| Joga / mobilność | powtórzenia i czas (pozycje trzymane) | brak |

Zawsze dochodzi pole „ile razy w okresie”.

## Partie i mięśnie
- **Partie** (8): Plecy, Brzuch, Klatka piersiowa, Nogi, Barki, Ramiona, Pośladki, Szyja. Można dodawać własne.
- **Mięśnie** (43), każdy przypisany do partii. Zestaw pochodzi z dokumentu „Mapa mięśni – baza wiedzy dla czatbota” (41 mięśni) plus **równoległoboczny** i **pośladkowy mały**, których tam brakowało, a używa ich wiele ćwiczeń.
  - Klatka: piersiowy większy, zębaty przedni
  - Barki: naramienny przedni, środkowy, tylny, podgrzebieniowy
  - Ramiona: biceps, ramienny, triceps (głowa boczna, głowa długa), ramienno-promieniowy, zginacze i prostowniki przedramienia
  - Plecy: czworoboczny (część górna, środkowa, dolna), najszerszy grzbietu, obły większy, równoległoboczny, prostowniki grzbietu, wielodzielny, czworoboczny lędźwi
  - Brzuch: prosty, skośny zewnętrzny, skośny wewnętrzny, poprzeczny, biodrowo-lędźwiowy
  - Pośladki: pośladkowy wielki, średni, mały, napinacz powięzi szerokiej
  - Nogi: prosty uda, obszerny boczny, obszerny przyśrodkowy, dwugłowy uda, półścięgnisty i półbłoniasty, przywodziciele, brzuchaty łydki (dwie głowy), płaszczkowaty, strzałkowe, piszczelowy przedni
  - Szyja: mostkowo-obojczykowo-sutkowy
- **Jedna grafika**: sylwetka z przodu i z tyłu (bez widoku z boku). W formularzu ćwiczenia jest zawsze na wierzchu: dotknięcie mięśnia zaznacza go, a wybrane mięśnie przeskakują na górę listy w sekcji „Wybrane”. Ta sama sylwetka służy w oknie mięśni ćwiczenia i w Postępie.
- Wybranie mięśnia dopisuje też jego partię do partii ćwiczenia.

## Zakładka Ćwiczenia
- Przełącznik **Baza** / **Moje treningi**.
- **Baza ćwiczeń**: lista z wyszukiwaniem, filtrami (rodzaj, partia, **mięsień**) i zwijaniem grup. Filtr mięśnia to lista pogrupowana według partii, z liczbą ćwiczeń przy każdym mięśniu. Długie listy dopisują się porcjami.
- Formularz ćwiczenia: nazwa, rodzaj, partie, mięśnie (sylwetka do dotykania i lista), link do filmu. Dla basenu: kilka stylów.
- **Moje treningi**: trening to nazwa i lista ćwiczeń z bazy. Wybór ćwiczeń ma wyszukiwanie i filtry.

## Tworzenie planu (kreator)
1. **Okres i aktywności**: tydzień lub miesiąc, data startu. „+ Dodaj aktywność”: rodzaj, pola zależne od rodzaju, ile razy w okresie. Kilka partii to osobne wpisy. Miękkie ostrzeżenie, gdy sesji jest wyraźnie więcej niż dni.
2. **Kalendarz**: sesje dodaje się do dni ręcznie (jeden dzień może mieć kilka sesji). Można też zlecić automatyczny rozkład. Licznik „do rozłożenia” maleje.
3. **Edycja sesji** w panelu: trening (dla aktywności treningowych), parametry ćwiczeń, a dla sesji biegania i basenu cel.
   - **Parametry ćwiczenia**: serie z listą powtórzeń (każda seria może mieć inną liczbę), czas, czas z powtórzeniami, lista czasów serii (ćwiczenia statyczne).
   - **Basen**: etapy, każdy z własnym stylem i liczbą długości. Suma długości jest celem sesji.
4. **Przenoszenie sesji** na inny dzień (z podglądem, co jest w danym dniu) i usuwanie sesji.
5. **Zapis planu**: wymaga rozłożenia wszystkich sesji i uzupełnienia treningów.

Rozpoczęty szkic planu zapisuje się sam i można do niego wrócić.

## Edycja zapisanego planu
Przycisk edycji na ekranie „Dziś” i w „Postępie”. Zmienia się aktywności i sesje. Sesje, w których zaczęto zaliczanie, są zablokowane.

## Ekran Dziś
- Podsumowanie planu: zaliczone sesje, który to dzień.
- Karty sesji na dany dzień. Dla treningu: odhaczanie ćwiczeń. Dla biegania i basenu: przycisk „Wpisz wynik”.
- **Okno wartości** po odhaczeniu ćwiczenia: pola z faktycznie wykonanymi powtórzeniami lub czasami, wstępnie wypełnione celem. Plus i minus zmieniają wartość; widać aktualną.
- Sesja jest zaliczona, gdy zrobiono wszystkie ćwiczenia albo wpisano wynik. Znacznik „◐”, gdy któreś ćwiczenie zrobiono poniżej planu.
- Stany specjalne: brak planu (przycisk „Utwórz plan”), dzień odpoczynku (z informacją o następnej sesji), koniec planu (podsumowanie).
- Usuwanie planu z potwierdzeniem.

## Ekran Postęp
- Postęp w celach planu (np. „bieganie 3/8”) i pasek procentowy.
- Zaangażowane mięśnie w planie: sylwetka z poziomami (więcej / mniej obciążenia), z obrysem mięśni z planu.
- Porównanie wyników sesji z rekordami (rodziny wartości liczone po typie ilości).
- Wejście do edycji planu.

## Ustawienia
- **Przypomnienia**: przełącznik, godzina, plik kalendarza `.ics` dla sesji od dziś.
- **Motyw**: jasny, ciemny albo jak w telefonie.
- **Dane**:
  - *Zapisz kopię zapasową*: cały stan do pliku `.json` na telefonie.
  - *Wczytaj kopię*: zastępuje wszystkie dane danymi z pliku.
  - *Wczytaj przykładowe ćwiczenia*: dodaje 219 gotowych ćwiczeń. Istniejące o tej samej nazwie są pomijane (zostaje im tylko uzupełnienie brakujących mięśni).
  - *Dodaj ćwiczenia z pliku*: własna lista w formacie JSON (patrz niżej).
  - *Pobierz wzór pliku z ćwiczeniami*.

### Format pliku z ćwiczeniami
```json
{ "cwiczenia": [
  { "nazwa": "Podciąganie nachwytem", "rodzaj": "Kalistenika",
    "partie": ["Plecy"], "miesnie": ["Najszerszy grzbietu", "Biceps"], "link": "" }
] }
```
Rodzaj i mięśnie dopasowuje się po nazwie (bez względu na wielkość liter). Nieznana partia jest tworzona automatycznie, nieznany rodzaj lub mięsień jest zgłaszany jako błąd i ćwiczenia nie dodaje.

## Przykładowe ćwiczenia (w aplikacji)
- `przyklady-kalistenika.json`: 99 pozycji (kalistenika i trening statyczny).
- `przyklady-silownia.json`: 95 pozycji (94 siłownia, 1 trening statyczny: deska z talerzem).
- `przyklady-mobilnosc.json`: 25 pozycji jogi i mobilności (rodzaj „Joga / mobilność”).
- Zasady: nazwy po polsku w spójnym stylu; ćwiczenia izometryczne w „Trening statyczny”; warianty z ciężarem i na maszynach osobno od wersji z masą ciała.

## Zasady prostoty
- Mało głównych ekranów, jedna główna akcja na ekran.
- Bez konta i logowania, dane tylko w telefonie.
- Zmiana zbędna albo myląca jest cofana (patrz decyzje w `00-instrukcja-projektu.md`).

## Ciężary (kg)
- Ćwiczenie ma pole `zCiezarem` (włączane osobno przy każdym ćwiczeniu; domyślnie włączone dla Siłowni).
- W planie przy takim ćwiczeniu jest blok ciężaru: jedna wartość albo osobny ciężar w każdej serii.
- W oknie wartości na ekranie Dziś są kroki po 2,5 kg; „Różne powtórzenia i ciężary w seriach" rozpisuje je na serie.
- Adnotacja „Ostatnio (dd.mm): …" pokazuje ostatnie wykonanie (w planie i po jego zakończeniu).
- Sugerowany plan: jeszcze nie zrobiony (do omówienia).

## Partie w aktywności planu
- W kreatorze (krok 1) można wybrać kilka partii naraz albo „Ogólnorozwojowy (całe ciało)" (Siłownia, Kalistenika).
- Ćwiczenie pasuje do aktywności, gdy ma choć jedną z wybranych partii; ogólnorozwojowa pasuje do każdego ćwiczenia tego rodzaju.

## Filtr mięśni w bazie ćwiczeń
- Po wybraniu partii pod nią pojawiają się chipy jej mięśni z licznikami; można zaznaczyć kilka (pasuje ćwiczenie z którymkolwiek). Zmiana partii czyści wybór mięśni.
- Bez wybranej partii działa lista rozwijana „Wybierz mięsień" (ustawia też partię).

## Historia
- Postęp → „Poprzednie plany": zamknięte plany z procentem realizacji; dotknięcie otwiera szczegóły okresu.
- Ćwiczenia → „Historia" przy ćwiczeniu: lista wykonań (data, serie × powt., ciężar, plan) i największy ciężar.
- „Usuń plan" ostrzega, że kasuje historię, i proponuje „Zamknij plan (zachowaj historię)".

## Baza startowa i ukrywanie ćwiczeń
- Przy pierwszym starcie aplikacja sama wczytuje bazę (3 pliki `przyklady-*.json`, 219 ćwiczeń); `dane.wersjaBazy` zapamiętuje, że to zrobiono. Brak internetu: ponowna próba przy następnym starcie. Kto ma już ćwiczenia, dostaje tylko oznaczenie `zBazy` na pasujących nazwach.
- Ćwiczenia z bazy (`zBazy: true`) można tylko ukryć; własne można ukryć lub usunąć.
- „Ukryj" ustawia `ukryte: true`: ćwiczenie znika z listy, wyboru do treningów i planu oraz z liczników. „Pokaż ukryte (n)" na liście pokazuje ukryte z przyciskiem „Przywróć".
- Ukryte ćwiczenie w istniejącym treningu zostaje (z dopiskiem „(ukryte)"); historia jest bez zmian.
- Przycisk „Uzupełnij bazę ćwiczeń przykładowych" w Ustawieniach dopisuje brakujące ćwiczenia z bazy.

## Prowadzenie przy tworzeniu planu
- Ekran Dziś bez planu pokazuje 3 kroki (aktywności → rozkład na dni → ćwiczenia).
- Każdy krok kreatora ma krótki wstęp u góry; puste sesje podpowiadają, co dotknąć („Dotknij, aby wybrać trening lub ćwiczenia").

## Ćwiczenia w sesji planu (bez pojęcia „trening")
- W sesji przycisk „Dodaj ćwiczenia" od razu otwiera listę ćwiczeń z bazy (sugerowane dla aktywności, albo wszystkie). „Zmień ćwiczenia" wczytuje obecny zestaw do edycji.
- Zestaw powstaje automatycznie z flagą `roboczy: true` i nazwą „<aktywność> d.m"; nie pokazuje się w „Moje treningi". Pole „Zapisz w Moich zestawach" (z nazwą) zapisuje go na stałe.
- „Z moich zestawów" (tylko gdy są zapisane zestawy) pozwala wybrać gotowy.

## Przewodnik „Jak to działa?"
- 10 kart ze zrzutami ekranu (`przewodnik/*.webp`), tekst w `przewodnik.js`. Otwiera się sam przy pierwszym uruchomieniu (`dane.przewodnikWidziany`), potem pod przyciskami „Jak to działa?" (ekran Dziś bez planu) i w Ustawieniach → Pomoc.
- Nie pokazuje się w automatycznych testach (`navigator.webdriver`).
- Zrzuty odświeża skrypt `narzedzia/zrzuty-przewodnika.js` (dane demonstracyjne z działającej aplikacji); po zmianach wyglądu uruchomić go ponownie i podnieść wersję.
- Podpowiedzi ćwiczeń w sesji dla aktywności z partiami dopasowują też rodzaj (Siłownia → tylko ćwiczenia siłowni); reszta pod „Pokaż wszystkie ćwiczenia z bazy".

## Rekordy
- Przycisk „Rekord" przy ćwiczeniu: ręczny wpis (ciężar × powtórzenia + liczba serii; albo powtórzenia; albo czas) i opcjonalna data. Zapis w `cwiczenie.rekord = {typ, ciezar, powtorzenia, serie, czas(s), data}`.
- Definicja: siłownia (ćwiczenia z ciężarem) = najcięższa seria (przy równym ciężarze więcej powtórzeń); bez ciężaru = najwięcej powtórzeń w serii; na czas = najdłuższy czas.
- Po zaliczeniu ćwiczenia lepiej niż rekord (a gdy go nie ma: lepiej niż najlepszy wynik z historii) aplikacja pyta „Nowy rekord! Zapisać?". Ręczny rekord zmienia się tylko za zgodą.
- Rekord widać na karcie ćwiczenia, na ekranie Dziś i w oknie Historia.
- Postęp → „Rekordy aktywności": najdłuższy dystans, najwięcej kroków i najdłuższy czas dla biegania, roweru, spaceru itd. (liczone automatycznie z wyników).
- Kod: `rekordy.js`.

## Rekordy na dystansie i basen w metrach
- Basen: dystans w metrach osobno dla każdego stylu (`etapy: [{styl, metry}]`), opcjonalny czas sesji. Stare sesje z długościami basenu są liczone jako 25 m na długość (`etapySesji`). Pole rodzaju: `polaPlanu: ["styl","czas"]` (migracja w dane.js).
- Postęp → „Moje rekordy na dystansie": użytkownik sam dodaje dystans (podpowiedzi: bieganie 1/3/5/10 km, półmaraton, maraton; rower 10/20/40/50/100 km; basen 50–1500 m + styl; własny dystans w km lub m) i opcjonalnie rekord (czas). Zapis: `dane.rekordyDystans = [{id, rodzajId, dystansM, styl, czas(s), data}]`.
- Po wpisaniu wyniku sesji (bieganie/rower z dystansem i czasem; basen z jednym stylem i czasem) dystans w tolerancji 2% i krótszy czas → „Nowy rekord! Zapisać?".
- „Najdłuższe wyniki" (automatycznie): najdłuższy dystans i najwięcej kroków; bez „najdłuższego czasu" (dłuższy czas to nie postęp przy biegu, rowerze, spacerze i pływaniu). Dłuższy czas zostaje rekordem tylko w ćwiczeniach (statyka, joga).

## Poprawki interfejsu (v35)
- Okna rekordów (ćwiczenie i dystans) mają taki sam wygląd pól jak formularze kart (etykieta nad polem, wysokie pola); pole „własny dystans" jest szersze od wyboru jednostki.
- Przyciski na karcie ćwiczenia (Mięśnie, Rekord, Historia, Film, Edytuj, Ukryj, Usuń) ułożone w siatce 3 kolumn pod nazwą, zamiast w jednym wąskim rzędzie.
- Ciężar przy planowaniu: pole „Ciężar (kg)" obok „Serie" i „Powtórzenia"; przy różnych powtórzeniach w seriach każda seria ma parę „powtórzenia + ciężar". Ćwiczenia statyczne: jedno pole ciężaru obok jednostki.
- Czas aktywności w formularzu sesji wpisuje się jako minuty i sekundy (mm:ss); zapis w danych w sekundach, wyświetlany jako „24 min 30 s".
