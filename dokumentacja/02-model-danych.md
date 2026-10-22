# Model danych

Wszystko jest zapisane w jednym obiekcie `dane` pod kluczem `localStorage` **`cwiczenia-dane-v1`** (JSON). Wartość `dane.wersjaUstawien` (obecnie **5**) pozwala przy zmianach ustawień zaktualizować starsze dane (`uzupelnijDane` w `dane.js`).

```
dane = {
  wersjaUstawien, kategorie[], stylePlywania[],
  cwiczenia[], treningi[], szkicPlanu, plany[], historia[], ustawienia
}
```

## kategorie
Jedna lista, trzy typy:
- **rodzaj**: `{ id, nazwa, typ: "rodzaj", miara: "serie"|"sesja"|"statyczna", polaPlanu: [...] }`. `polaPlanu` to pola w kreatorze: `partia`, `dystans`, `czas`, `styl`, `dlugosci`.
- **partia**: `{ id, nazwa, typ: "partia" }`
- **miesien**: `{ id, nazwa, typ: "miesien", partiaId }`. Id musi zgadzać się z kształtem w `anatomia.js`.

Id rodzajów: `rodzaj-cialo` (nazwa „Siłownia”), `rodzaj-kalistenika`, `rodzaj-statyczny`, `rodzaj-rozciaganie`, `rodzaj-bieganie`, `rodzaj-basen`.
Id partii: `partia-plecy`, `-brzuch`, `-klatka`, `-nogi`, `-barki`, `-ramiona`, `-posladki`, `-szyja`.

**Mięśnie (43)** są zdefiniowane w `MIESNIE_STARTOWE` (`dane.js`), a ich kształty w `ANATOMIA_KSZTALTY` (`anatomia.js`); id w obu miejscach muszą się zgadzać.
**Wersja 5** rozdzieliła dawne mięśnie: triceps (2 głowy), skośne brzucha (2), czworogłowy uda (3), kulszowo-goleniowe (2), brzuchaty łydki (2), czworoboczny (3 części, dobór po nazwie ćwiczenia) i przedramiona (3, dobór po nazwie). Migracja przepisuje `miesnieIds` w ćwiczeniach i usuwa stare mięśnie. Import z pliku rozumie też dawne nazwy.

## stylePlywania
Lista nazw: Kraul, Grzbietowy, Klasyczny, Motylkowy, Dowolny.

## cwiczenia
```
{ id, nazwa, rodzajId, partieIds[], miesnieIds[], link,
  style[]  // tylko basen
}
```
Dawne pole `ilosc` (stare dane) jest nadal rozumiane.

**Kształty ilości** (parametry ćwiczenia w sesji):
- `{ typ: "powtorzenia", serie, powtorzenia }`
- `{ typ: "serie-lista", powtorzenia: [..] }`: osobna liczba powtórzeń w każdej serii
- `{ typ: "czas", wartosc, jednostka }`
- `{ typ: "czas-powtorzenia", powtorzenia, czas: { wartosc, jednostka } }`
- `{ typ: "czas-serie", czasy: [..], jednostka }`: ćwiczenia statyczne z różnymi czasami serii

## treningi
`{ id, nazwa, cwiczeniaIds[] }` (kolejność ma znaczenie).

## plany
```
plan = { id, okres: "tydzien"|"miesiac", start, aktywnosci[], sesje[],
         utworzono, zmieniono?, zamkniety?, zamknieto? }

aktywnosc = { id, rodzajId, partiaId|null, razy, kolor, ... pola zależne od rodzaju }

sesja = { id, aktywnoscId, dzien, treningId|null, parametry{ idĆwiczenia: ilosc },
          styl, etapy: [{ styl, dlugosci }], dlugosci, dystans, czas,   // bieganie, basen
          zrobione{ idĆwiczenia: true },         // zaliczane ćwiczenia treningu
          wykonane{ idĆwiczenia: ilosc },        // faktycznie wykonane wartości
          wynik{ dystans, czas, styl, dlugosci } // bieganie i basen, wpisany po sesji
        }
```
- Dawne sesje basenu miały pojedyncze `styl` i `dlugosci`; nowe mają `etapy`.
- Sesja jest **zaliczona**, gdy zrobiono wszystkie ćwiczenia treningu albo wpisano `wynik`.
- Sesja z postępem jest zablokowana przy edycji planu.
- Aktywny plan to ten bez `zamkniety`. Nowy plan zamyka poprzedni, a zamknięte plany zostają w danych jako historia.
- Licznik celu = liczba zaliczonych sesji danej aktywności w planie.

## szkicPlanu
Rozpoczęty, niezapisany plan (`okres`, `start`, `aktywnosci`, `sesje`). W trybie edycji zapisanego planu szkic ma pole `edytowanyPlanId` i nie jest zapisywany na stałe.

## historia
Zarezerwowane pole (obecnie nieużywane). Historię tworzą zamknięte i zakończone plany z sesjami.

## ustawienia
`{ godzinaAlarmu: "18:30", alarmWlaczony, motyw: "jasny"|"ciemny" (brak = jak telefon) }`
