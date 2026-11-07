# Wdrażanie, wersje i testy

## Struktura repozytorium
- `index.html`, `style.css`, `manifest.webmanifest`, `ikona-*.png`, `sw.js` (service worker)
- Skrypty – kolejność w `index.html` jest ważna (wspólna przestrzeń nazw: dwie funkcje o tej samej nazwie nadpisują się):
  1. `dane.js` (dane startowe, migracje), `anatomia.js` (grafika mięśni)
  2. `cwiczenia.js` (Baza, filtry, szczegóły, formularz, „Dodaj do zestawu”), `treningi.js` (Moje zestawy)
  3. `bieg-logika.js`, `gps-logika.js` (logika bez interfejsu), `gps.js` (GPS, IndexedDB, GPX)
  4. `kreator.js`, `kreator2.js` (plan ręczny: krok 1, kalendarz, edycja treningu, zapis)
  5. `dzis.js` (Dziś, zaliczanie, okno wyniku), `postep.js`, `rekordy.js`
  6. `plyw.js` (pływanie: basen, bloki, wynik, statystyki, ustawienia)
  7. `cwicz.js` (tryb Ćwicz), `bieg.js` (ekran biegu, Postęp biegu), `mozliwosci.js`
  8. `ustawienia.js`, `kopia.js` (kopia, wbudowana baza), `bezpieczenstwo.js` (usuwanie danych, walidacja, przypomnienie o kopii)
  9. `plan-generator.js`, `plan-bieg.js`, `plan-plyw.js` (generatory), `plan-kreator.js` („Ułóż mi plan”), `plan-progresja.js`, `plan-adaptacja.js` (kolejny blok), `plan-zamiana.js`
  10. `sciezki.js`, `cele.js`, `przewodnik.js`, `pomoc.js` (pomoc „?”, słowniczek, rozwijane sekcje, dostępność), `analiza.js` (1RM, wykres, talerze, stagnacja), `dzien.js` (skróć trening, słabszy dzień, odciążenie, podsumowanie tygodnia), `app.js` (start, kontrola wersji, baner aktualizacji)
- Dane: `przyklady-kalistenika.json`, `przyklady-silownia.json`, `przyklady-zdrowie.json`, `przyklady-mobilnosc.json` (ok. 500 ćwiczeń), `przyklady-zestawy.json` (10 zestawów), `sciezki.json` (56 ścieżek)
- `przewodnik/*.webp` – zrzuty przewodnika; `narzedzia/zrzuty-przewodnika.js` – generuje je z działającej aplikacji
- `dokumentacja/` – te pliki

## Wgrywanie zmian
1. Zmiana w plikach, sprawdzenie składni (`node --check` / `new Function`).
2. **Podbić wersję w dwóch miejscach**: `?v=N` przy każdym pliku w `index.html` i `WERSJA = "cwiczenia-vN"` w `sw.js`.
3. Nowy plik (skrypt, obrazek) dopisać do `index.html` i do listy `PLIKI` w `sw.js`.
4. Testy (niżej), dokumentacja (`01` – stan, `04` – wpis wersji).
5. Commit i push na `main`. Wiadomość commita kończy się linijkami `Co-Authored-By` i `Claude-Session`.
6. **Sprawdzić wdrożenie**: `gh api repos/jakubolowniuk-ai/cwiczenia/commits/<sha>/check-runs --jq '.check_runs[]|[.name,.status,.conclusion]|@tsv'`. Gdy `deploy` ma `failure` – pusty commit i ponowny push.
7. Na telefonie baner „Jest nowa wersja – Odśwież”.

Czerwony baner „Pliki aplikacji są w różnych wersjach” – niespójne pliki; pomaga ponowne wgranie całości. `wersjaUstawien` zmienia się razem w `dane.js`, `app.js` i `kreator.js`.

## Przewodnik
Po zmianach wyglądu: `node narzedzia/zrzuty-przewodnika.js` (Playwright + Chromium + Pillow), sprawdzić zrzuty, podnieść wersję. Teksty kart są w `przewodnik.js`, teksty pomocy „?” w `pomoc.js` (`POMOC`, `POMOC_SLOWNICZEK`).

## Czego nie robić
- Nie czyścić danych witryny w przeglądarce bez kopii – kasuje wszystko.
- Nie wczytywać kopii w oknie incognito.
- Nie używać w `cwiczenia.js` funkcji z `dzis.js` przy wczytywaniu (lista rysuje się wcześniej).

## Testy
Playwright (Chromium, `--allow-file-access-from-files`) na `index.html` przez `file://`, telefon 390 × 844, jasny i ciemny motyw:
- zestaw regresji (ok. 30 skryptów): kreator i generatory (tysiące profili bez błędów), plan ręczny i edycja, Dziś (zaliczanie, okno wartości, Ćwicz, wznowienie, skróć trening, słabszy dzień, odciążenie), bieganie (stoper, odcinki, GPS symulowany, GPX), pływanie (migracja, edytor, wynik, generator, ścieżka, Postęp), ścieżki i cele, Postęp, Ustawienia, kopia i usuwanie danych, Baza i filtry;
- skaner kontrastu i etykiet (WCAG AA) na kilkunastu ekranach, oba motywy;
- zrzuty ekranu do przejrzenia po każdej zmianie wyglądu.
Testy ustawiają `window.sekcjeWszystkieOtwarte = true` (rozwinięte sekcje) i `dane.ustawienia.biegGps = false` tam, gdzie GPS nie jest testowany.
