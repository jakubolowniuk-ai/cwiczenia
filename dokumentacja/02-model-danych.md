# Model danych

Stan: wersja 99. Wszystko jest w jednym obiekcie `dane` pod kluczem `localStorage` **`cwiczenia-dane-v1`** (JSON). Kopia zapasowa to ten sam obiekt w pliku `.json`.

- `dane.wersjaUstawien` (obecnie **5**) – przy zmianie ustawień startowych `uzupelnijDane` w `dane.js` aktualizuje starsze dane. Tę samą liczbę sprawdzają `app.js` i `WYMAGANA_WERSJA_DANYCH` w `kreator.js`.
- `dane.wersjaBazy` – wersja wbudowanej bazy ćwiczeń (`WERSJA_BAZY = 15` w `kopia.js`); nowa wersja dopisuje brakujące ćwiczenia, opisy i zestawy.
- Jednorazowe migracje mają własne znaczniki, np. `plywMigracja = 1` (pływanie w długościach, v97), `rekordyPrzeliczone`.

```
dane = {
  wersjaUstawien, wersjaBazy, plywMigracja, przewodnikWidziany, rekordyPrzeliczone,
  kategorie[], stylePlywania[], cwiczenia[], treningi[],
  szkicPlanu, plany[], historia[],
  rekordyDystans[], mozliwosci, cele[], sciezkiPostep{}, samopoczucie[],
  ustawienia{}
}
```

Poza tym obiektem:
- `localStorage` `cwiczenia-trening-trwa` – otwarty tryb „Ćwicz” (do wznowienia, 12 h), `cwiczenia-bieg-trwa` – trwający bieg (stoper, odcinki, potwierdzenie Stop).
- IndexedDB `cwiczenia-gps`, sklep `trasy` – surowe punkty tras GPS (`[lat, lon, czas ms, dokładność, wysokość, odcinek]`). Nie wchodzą do kopii; każdą trasę można pobrać jako GPX.

## kategorie
Jedna lista, trzy typy:
- **rodzaj**: `{ id, nazwa, typ: "rodzaj", miara: "serie"|"statyczna"|"sesja", polaPlanu: [...] }`. Id: `rodzaj-cialo` (Siłownia), `rodzaj-kalistenika`, `rodzaj-statyczny`, `rodzaj-rozciaganie`, `rodzaj-rozgrzewka`, `rodzaj-joga`, `rodzaj-bieganie`, `rodzaj-basen` (`polaPlanu: ["styl","czas"]` – pola basenu rysuje `plyw.js`), `rodzaj-rower`, `rodzaj-spacer`.
- **partia**: `{ id, nazwa, typ: "partia" }` – `partia-plecy`, `-brzuch`, `-klatka`, `-nogi`, `-barki`, `-ramiona`, `-posladki`, `-szyja`.
- **miesien**: `{ id, nazwa, typ: "miesien", partiaId }` – 43 mięśnie (`MIESNIE_STARTOWE` w `dane.js`), kształty w `ANATOMIA_KSZTALTY` (`anatomia.js`); id muszą się zgadzać.

## stylePlywania
`["Kraul", "Grzbietowy", "Klasyczny", "Motylkowy", "Zmienny", "Dowolnie wybrany"]` (+ ewentualne własne). Dawny „Dowolny” = Kraul (migracja v97).

## cwiczenia
```
{ id, nazwa, rodzajId, partieIds[], miesnieIds[], link,
  poziom (1–5), zCiezarem, opis: { start, ruch, uwaga }, opisZBazy,
  zBazy, ukryte, rekord: { typ, ciezar, powtorzenia, serie, czas, data },
  przerwa (s, zapamiętana w trybie Ćwicz), style[] (basen), ilosc (stare dane) }
```
`zBazy: true` – z wbudowanej bazy (można ukryć, nie usunąć); brak – własne („Moje ćwiczenia”).

**Ilość** (parametry ćwiczenia w treningu):
- `{ typ: "powtorzenia", serie, powtorzenia, zakres?: [od, do], ciezary?: [kg…], wzor?: "opadajace" }`
- `{ typ: "serie-lista", powtorzenia: [..], ciezary? }`
- `{ typ: "czas", wartosc, jednostka }`
- `{ typ: "czas-powtorzenia", powtorzenia, czas: { wartosc, jednostka } }`
- `{ typ: "czas-serie", czasy: [..], jednostka, ciezary? }`

## treningi (zestawy ćwiczeń)
`{ id, nazwa, cwiczeniaIds[], parametry?{ idĆw: ilosc }, blok?: "rozgrzewka"|"rozciaganie", zBazy?, roboczy?, ukryte? }`
- `roboczy: true` – zestaw utworzony w planie, niewidoczny w „Moje zestawy”, dopóki nie zostanie zapisany.

## plany
```
plan = { id, nazwa, okres: "tydzien"|"miesiac", start (RRRR-MM-DD), aktywnosci[], sesje[],
         utworzono, zmieniono?, wylaczony?, zamkniety?, zamknieto?,
         kreator?: { profil }, progresja?{}, tydzienTestu?, celeOpisy?{} }

aktywnosc = { id, rodzajId, partiaId, partieIds[], ogolny, razy, kolor }
```

**sesja** (w interfejsie „trening”):
```
{ id, aktywnoscId, dzien (od startu planu), treningId, parametry{ idĆw: ilosc },
  blokPrzedId?, blokPoId?, kolejnosc?[], notatka?,
  zrobione{ idĆw: true }, wykonane{ idĆw: ilosc }, ocena{ idĆw: "latwo"|"wsam"|"ciezko" },
  przebieg{ wyniki, extra, pominiete, czasy{ praca, przerwa } (s) }, przerwaMnoznik?, zmianaDnia?{ typy, opis, oryginal },
  dataWykonania?, wynik?, wynikSzkic?,
  // bieganie, rower, spacer
  rodzajBiegu?, dystans?, czas?, kroki?, obciazenie?, odcinki?[],
  // basen
  basen?{ dlugosc, jednostka: "m"|"yd" }, bloki?[], trybProsty?, czasSesji? (s), sprawdzian? }
```
- **Blok basenu**: `{ powt, dl (długości), styl, tryb: "przerwa"|"odjazd", przerwaS, odjazdS, pomoce[], intensywnosc, typ: "rozgrzewka"|"technika"|"glowna"|"wyciszenie", notatka }`. Tryb prosty = bloki z `powt: 1`, po jednym na styl. Metry = długości × długość basenu (jardy × 0,9144); `etapySesji()` liczy z bloków etapy `{ styl, metry }` dla starszego kodu.
- **Wynik biegu**: `{ dystans, czas, wysilek, zrodlo: "reczny"|"stoper"|"gps"|"gpx", pauzy, czasPauzS, odcinkiWyniki?, trasaId?, gps? }`.
- **Wynik basenu**: `{ bloki, basen, czas (sam czas pływania), czasSesji, najdluzszy (długości bez zatrzymania), wysilek }`.
- Dawne pola basenu (`etapy`, `dlugosci`, `styl`) zamienia migracja v97 na bloki na basenie 25 m (metry bez zmian).
- Trening jest **zaliczony**, gdy zrobiono wszystkie ćwiczenia albo jest `wynik`.

## szkicPlanu
Rozpoczęty, niezapisany plan ręczny (`okres`, `start`, `aktywnosci`, `sesje`). W edycji zapisanego planu ma `edytowanyPlanId`.

## Profil kreatora (`plan.kreator.profil`)
Odpowiedzi z „Ułóż mi plan” i stan bloków: `cel`, `dosw`, `dni`, `czas`, `sprzet`, `bol[]`, `tygodni`, `blokNr`, `kotwice`, `cele[]`, bieganie (`biegCel`, `biegPoziom`, `biegDni`, `silaDni`, `biegPrzes`), pływanie (`plywCel`, `plywBasen`, `plywTest`, `plywStyle[]`, `plywNowy`, `plywDni`, `plywCzas`, `plywPrzes`), adaptacja (`dniOryg`, `ocenyCw`, `ostatnie`, `adaptZmiany`).

## Cele, ścieżki, możliwości
- `dane.cele = [ { typ: "sciezka", id } | { typ: "liczba", k, cel } ]` (najwyżej 3 cele siłowe; ścieżki biegu i basenu dochodzą z planów).
- `dane.sciezkiPostep = { idŚcieżki: { krok, data } }` – `krok` = indeks bieżącego kroku; równy liczbie kroków = cel osiągnięty.
- `dane.mozliwosci = { data, wartosci: { pompki, podciagniecia, dipy, przysiady, plank, zwis, s_pch, s_wio, s_prz, d_pch, d_wio, d_prz } }` (`null` = nie wiem).
- Ścieżki są w pliku `sciezki.json` (kroki z ćwiczeniem lub `warunek`: bieg – `minCzasS`, `minDystansM`, `maxPauz`…; basen – `minDlugosci`, `minCiaglyM`).

## Pozostałe
- `dane.rekordyDystans = [ { id, rodzajId, dystansM, styl?, czas (s), data } ]` – ręczne rekordy na dystansie.
- `dane.samopoczucie = [ { data, stan, bol[] } ]` – odpowiedzi „Jak się dziś czujesz?” (90 ostatnich).
- `dane.historia` – zarezerwowane (historię tworzą zamknięte plany).

## ustawienia
`godzinaAlarmu`, `alarmWlaczony`, `motyw`; Zegar: `zegar { tryb, minutnik (s), int { szablon, praca, przerwa, rundy, rozgrzewka, schlodzenie }, alarm { czas, etykieta, wlaczony, cel (ms) }, alarmCodziennie }`; trening: `dzwiek`, `wibracja`, `przerwa`, `sztanga { gryf, talerze }`; bieganie: `biegPoziom`, `biegSerie`, `biegEkran`, `biegGps`, `biegOdcDyst`; pływanie: `basen { dlugosc, jednostka }`, `plywTryb` („prosty” | „zaawansowany”); kopia: `ostatniaKopia`, `kopiaOdlozona`; karty Dziś: `deloadDo`, `deloadOdrzucony`, `stagnacjaKarta`, `stagnacjaPomin`, `tydzienPodsumowany`.
