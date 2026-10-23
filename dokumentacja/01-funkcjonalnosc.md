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
