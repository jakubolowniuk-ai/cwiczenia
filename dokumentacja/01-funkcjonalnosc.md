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

Zawsze dochodzi pole „ile razy w okresie”.

## Partie i mięśnie
- **Partie** (7): Plecy, Brzuch, Klatka piersiowa, Nogi, Barki, Ramiona, Pośladki. Można dodawać własne.
- **Mięśnie** (28), każdy przypisany do partii: Klatka (piersiowy większy, zębaty przedni); Barki (naramienny przedni, środkowy, tylny); Ramiona (biceps, triceps, ramienny, przedramiona); Plecy (najszerszy grzbietu, obły większy, czworoboczny, równoległoboczny, prostowniki grzbietu, czworoboczny lędźwi); Brzuch (prosty, skośne, poprzeczny, biodrowo-lędźwiowy); Pośladki (wielki, średni, mały); Nogi (czworogłowy uda, kulszowo-goleniowe, przywodziciele, brzuchaty łydki, płaszczkowaty, piszczelowy przedni).
- Mięśnie wybiera się w formularzu ćwiczenia z listy lub z grafiki sylwetki (przód i tył). W oknie ćwiczenia widać zaznaczone mięśnie na sylwetce.

## Zakładka Ćwiczenia
- Przełącznik **Baza** / **Moje treningi**.
- **Baza ćwiczeń**: lista z wyszukiwaniem, filtrami (rodzaj, partia) i zwijaniem grup. Długie listy dopisują się porcjami.
- Formularz ćwiczenia: nazwa, rodzaj, partie, mięśnie, link do filmu. Dla basenu: kilka stylów.
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
  - *Wczytaj przykładowe ćwiczenia*: dodaje 194 gotowe ćwiczenia. Istniejące o tej samej nazwie są pomijane (zostaje im tylko uzupełnienie brakujących mięśni).
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
- Zasady: nazwy po polsku w spójnym stylu; ćwiczenia izometryczne w „Trening statyczny”; warianty z ciężarem i na maszynach osobno od wersji z masą ciała.

## Zasady prostoty
- Mało głównych ekranów, jedna główna akcja na ekran.
- Bez konta i logowania, dane tylko w telefonie.
- Zmiana zbędna albo myląca jest cofana (patrz decyzje w `00-instrukcja-projektu.md`).
