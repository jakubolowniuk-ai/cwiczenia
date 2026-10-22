# Wdrażanie, wersje i testy

## Struktura repozytorium
- `index.html`, `style.css`, `manifest.webmanifest`, `ikona-*.png`
- `sw.js`: service worker
- Skrypty (kolejność ładowania w `index.html` jest ważna):
  `dane.js` (dane startowe, migracje) → `anatomia.js` (grafika mięśni) → `cwiczenia.js` (baza, formularz, wybór mięśni) → `treningi.js` → `kreator.js` (krok 1 planu) → `kreator2.js` (kalendarz, sesje, zapis planu) → `dzis.js` (Dziś, zaliczanie) → `postep.js` → `ustawienia.js` (alarm, motyw, .ics) → `kopia.js` (kopia, import) → `app.js` (start, kontrola wersji, instalacja)
- `przyklady-kalistenika.json`, `przyklady-silownia.json`: przykładowe ćwiczenia
- `dokumentacja/`: te pliki

## Wgrywanie zmian
1. Zmiana w plikach, `node --check` na skryptach.
2. **Podbić numer wersji w dwóch miejscach**: `?v=N` przy każdym pliku w `index.html` oraz `WERSJA = "cwiczenia-vN"` w `sw.js`. Inaczej telefon może trzymać stare pliki.
3. Nowy plik używany offline dopisać do listy `PLIKI` w `sw.js`.
4. Commit i push na `main`. GitHub Pages publikuje po kilku minutach.
5. Na telefonie pojawia się baner „Jest nowa wersja – Odśwież”.

Gdy aplikacja pokazuje czerwony baner „Pliki aplikacji są w różnych wersjach”, kontrola w `app.js` wykryła niespójne pliki; pomaga ponowne wgranie wszystkich plików razem. Wersja ustawień jest sprawdzana w dwóch miejscach, które trzeba zmieniać razem z `wersjaUstawien` w `dane.js`: `app.js` i `WYMAGANA_WERSJA_DANYCH` w `kreator.js` (przy złej wartości kreator planu się nie otwiera).

## Czego nie robić
- Nie czyścić danych witryny w przeglądarce: kasuje wszystkie ćwiczenia i plany. Przed ryzykownymi krokami zapisać kopię zapasową w Ustawieniach.
- Nie wczytywać kopii w oknie incognito (jest tam pusta baza).

## Testy
Testy w Playwright (Chromium) odpalane na komputerze na pliku `index.html` (`file://`):
- pełny kreator planu od zera, edycja planu, przenoszenie i usuwanie sesji,
- ekran Dziś: zaliczanie, okno wartości, serie z różnymi powtórzeniami, czasy statyczne,
- baza ćwiczeń i mięśnie, import z pliku i przycisk przykładów,
- Postęp i sylwetka mięśni.

Uwaga z doświadczeń: funkcje w osobnych plikach współdzielą jedną przestrzeń nazw. Dwie funkcje o tej samej nazwie w różnych plikach nadpisują się (tak zepsuło się okno mięśni, nazwa jednej funkcji została zmieniona na `otworzOknoMiesniPlanu`).

## Dodawanie nowych przykładowych ćwiczeń
Dopisać pozycje do pliku `przyklady-*.json` (format w `01-funkcjonalnosc.md`), podbić wersję, wypchnąć. Przycisk w Ustawieniach doda tylko brakujące.
