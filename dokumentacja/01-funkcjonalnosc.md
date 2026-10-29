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

## Zestawy i formularz ćwiczenia (v36)
- Zestawy (Moje treningi i budowa zestawu w planie) obejmują tylko aktywności z ćwiczeniami; bieganie, rower, spacer i basen nie są dostępne w wyborze ćwiczeń do zestawu (mają własne cele: dystans, czas).
- „+ Utwórz nowe ćwiczenie" w formularzu zestawu i w budowie zestawu w kreatorze: otwiera formularz ćwiczenia (okno na cały ekran, `poZapisieCwiczenia`), a zapisane ćwiczenie od razu trafia do zestawu. W kreatorze rodzaj i partie są podpowiedziane z aktywności.
- Formularz ćwiczenia: lista mięśni schowana („Pokaż listę mięśni"), przycisk „Zapisz" także na górze; w formularzu zestawu „Zapisz", w budowie zestawu „Gotowe" także na górze.

## Rekordy automatyczne i kolejność ćwiczeń (v38)
- Rekord ćwiczenia zapisuje się sam po zaliczeniu w planie: pierwszy wynik (albo najlepszy z historii), gdy rekordu nie ma, i każdy kolejny, który go poprawia. Bez pytania; wynik widać w wierszu „★ Rekord". Rekord to rekordowa seria: największy ciężar (z powtórzeniami), a bez ciężaru najwięcej powtórzeń w serii.
- Dziś: uchwyt „⋮⋮" przy ćwiczeniu pozwala przeciągnąć je palcem w inne miejsce; kolejność zapisuje się w sesji (`sesja.kolejnosc`).

## Tryb „Ćwicz" (v39, plik cwicz.js)
- Przycisk „Ćwicz" (albo „Kontynuuj ćwiczenie") na karcie sesji na ekranie Dziś otwiera pełny ekran treningu: jedno ćwiczenie, seria po serii, w kolejności z ekranu Dziś.
- Seria z powtórzeniami: pola powtórzeń i ciężaru (kg) wypełnione planem z przyciskami − i +; „Zrobione ✓" zapisuje wynik serii i włącza przerwę.
- Ćwiczenia na czas (statyczne): stoper liczy w górę; po osiągnięciu celu daje sygnał, ale liczy dalej; „Stop" zapisuje czas serii i włącza przerwę (żeby można było bić rekordy).
- Przerwa: odliczanie, −15 s / +15 s (zmiana zapamiętuje się w `cwiczenie.przerwa`), „Pomiń przerwę"; po czasie dźwięk i wibracja, napis „Zaczynaj!". Domyślna przerwa: `ustawienia.przerwa` (60 s).
- Dodatkowe: „← Poprzednia", „+ seria", „Pomiń ćwiczenie", podsumowanie na końcu. Ekran nie wygasza się (Wake Lock).
- Dane: `sesja.przebieg = {wyniki: {id: [{p, kg, t}]}, extra: {id: n}, pominiete: {id: true}}` (pozycja wyliczana, więc po zamknięciu aplikacji wracasz w to samo miejsce). Po ostatniej serii ćwiczenie jest odhaczane (`zrobione`, `wykonane`) i sprawdzany jest rekord.
- Ustawienia → Trening: dźwięk, wibracja (`ustawienia.dzwiek`, `ustawienia.wibracja`), domyślna przerwa.

## Opis ćwiczenia (v40)
- `cwiczenie.opis = {start, ruch, uwaga}` (opcjonalne, edytowalne w formularzu ćwiczenia). Przycisk „▶ Film" zastąpiony kafelkiem „Opis" (karta ćwiczenia, wiersz na Dziś, lista w zestawach, tryb Ćwicz), widocznym, gdy jest opis albo link.
- Okno opisu: miniatura filmu YouTube (po dotknięciu odtwarza się w oknie, youtube-nocookie), trzy pola opisu, adnotacja o technice, „Otwórz film w przeglądarce" (inne serwisy tylko jako link).
- Naprawa: edycja ćwiczenia zachowuje `zBazy`, `ukryte`, `rekord`, `przerwa`.

## Pierwsze opisy (v41)
- Opisy (`opis: {start, ruch, uwaga}`) w `przyklady-kalistenika.json` dla 10 ćwiczeń: pompki klasyczne, przysiad klasyczny, wykroki w tył, podciąganie nachwytem, podciąganie australijskie, dipy na poręczach, deska przodem, most biodrowy, dead bug, spięcia brzucha. Język bez terminów anatomicznych, nacisk na technikę.
- `WERSJA_BAZY = 2`: starsze dane dostają opisy z bazy przy starcie, ale tylko tam, gdzie ćwiczenie nie ma własnego opisu.

## Opisy dla 50 ćwiczeń (v42)
- Opisy (start/ruch/uwaga) dla 50 najpopularniejszych ćwiczeń: kalistenika (25), siłownia (20), joga/mobilność (5) w plikach `przyklady-*.json`. Pierwsze 10 z v41 przejrzane i uzupełnione (kąt łokci w pompkach, nieblokowanie oddechu w desce, krok w wykrokach itd.).
- `WERSJA_BAZY = 3`. Opis z bazy ma znacznik `opisZBazy`: baza może go później zaktualizować; własny opis (zapisany w formularzu) nigdy nie jest nadpisywany. Opisy z v41 bez znacznika są aktualizowane, jeśli ich początek zgadza się z `STARE_OPISY_START`.

## Opisy dla całej bazy (v43)
- Wszystkie 219 ćwiczeń bazowych mają opis (start/ruch/uwaga), średnio ok. 55 słów. `WERSJA_BAZY = 4`: starsze dane dostają brakujące opisy; opisy zapisane w formularzu (bez znacznika `opisZBazy`) nie są nadpisywane.

## v44: własna ocena ćwiczenia i 32 nowe ćwiczenia w bazie
- Po skończeniu ćwiczenia (ekran przerwy i podsumowanie w trybie Ćwicz oraz wiersz zaliczonego ćwiczenia na Dziś) są trzy przyciski: Łatwo / W sam raz / Ciężko. Ponowne dotknięcie zdejmuje ocenę. Zapis: `sesja.ocena[idĆwiczenia]` = "latwo" | "wsam" | "ciezko". Ocena posłuży później do podpowiedzi progresji.
- Baza ma 251 ćwiczeń (+32, każde z opisem): 11 na brzuch, 10 na maszynach i wyciągach, 11 podstawowych. `WERSJA_BAZY = 5`.
- Osoby, które już mają bazę (wersja ≥ 1), dostają brakujące ćwiczenia z bazy automatycznie; kto miał własne ćwiczenia przed bazą, nadal dostaje tylko oznaczenia.

## v45: Moje rekordy
- Postęp: przycisk „★ Moje rekordy (N)" otwiera listę ćwiczeń, które mają rekord (pogrupowaną wg rodzaju), plus rekordy aktywności; dotknięcie ćwiczenia otwiera jego historię. Ćwiczenia bez rekordu się nie wyświetlają.
- Jednorazowe przeliczenie rekordów z całej historii planów (`dane.rekordyPrzeliczone`) uzupełnia rekordy ćwiczeń zaliczonych wcześniej oraz podnosi te słabsze od historii.

## v46: wiele planów naraz
- Plan ma nazwę (`plan.nazwa`, pole „Nazwa planu" w kroku 1 kreatora; bez nazwy: „Plan N"; starsze plany: „Plan tygodniowy/miesięczny") i może być wyłączony (`plan.wylaczony`).
- Nowy plan nie zamyka już poprzedniego. Plan zamyka się ręcznie (po zakończeniu okresu albo „Zamknij").
- Dziś pokazuje sesje wszystkich włączonych planów, każdy w bloku z nazwą i „Edytuj". Gdy wszystkie są wyłączone, jest komunikat.
- Postęp: sekcja „Moje plany" z przełącznikiem włącz/wyłącz; dotknięcie planu wybiera, którego dotyczą statystyki.

## v47: „Jak wyżej" w seriach
- W kreatorze, w serii z różnymi powtórzeniami/ciężarem, od drugiej serii pod każdym polem (powtórzenia, ciężar) jest przycisk „↑ Jak wyżej", który kopiuje wartość z poprzedniej serii.

## v48: ciężar w kalistenice i bieganiu
- 52 ćwiczenia kalisteniki i treningu statycznego, które można obciążyć (pompki, dipy, podciąganie, przysiady, wykroki, mosty, deska, unoszenie nóg i in.), mają włączone pole ciężaru (`ciezar: true` w plikach bazy, `WERSJA_BAZY = 6`). Istniejącym użytkownikom włącza się raz przy aktualizacji bazy; w formularzu ćwiczenia można je wyłączyć.
- Ciężar 0 kg nie zmienia typu rekordu (rekord powtórzeń zostaje rekordem powtórzeń).
- Bieganie i spacer: opcjonalne „Obciążenie (kg)" (plecak, kamizelka) w parametrach sesji i w wyniku (`sesja.obciazenie`); widoczne w opisie celu i wyniku.

## v49: dodatkowy ciężar
- W kalistenice i ćwiczeniach statycznych pole ciężaru nazywa się „Dodatkowy ciężar (kg), opcjonalnie" (kreator, wpis wartości, tryb Ćwicz); w siłowni zostaje „Ciężar (kg)". Pole w formularzu ćwiczenia: „Można dodać ciężar (kg)".

## v51–v53: rozgrzewka, rozciąganie, postawa, dno miednicy, bloki
- Baza ma 307 ćwiczeń (+56 w `przyklady-zdrowie.json`, każde z opisem): 18 rozgrzewkowych (nowy rodzaj „Rozgrzewka"), 24 rozciągające (rodzaj „Rozciąganie"), 8 na postawę (Kalistenika: wall angels, Y-T-W, face pull z gumą, band pull-apart…), 5 na dno miednicy (Joga / mobilność, nowy mięsień „Mięśnie dna miednicy" w partii Brzuch). Szyja pominięta. `WERSJA_BAZY = 7`.
- Gotowe zestawy w `przyklady-zestawy.json` (10): 4 bloki rozgrzewki, 3 bloki rozciągania po treningu, „Mobilność: biodra i plecy", „Postawa: plecy i barki", „Dno miednicy". Dodawane po nazwie (`dodajZestawyBazy`), z domyślnymi wartościami (`trening.parametry`), oznaczone `zBazy`.
- Zestaw może być blokiem: `trening.blok` = "rozgrzewka" | "rozciaganie" (wybór w formularzu zestawu).
- Sesja ma opcjonalne `blokPrzedId` (rozgrzewka) i `blokPoId` (rozciąganie po treningu); wybór w panelu sesji w kreatorze. Parametry ćwiczeń bloku trafiają do `sesja.parametry`.
- Dziś: bloki jako osobne sekcje nad i pod ćwiczeniami głównymi; w trybie Ćwicz sesja idzie: rozgrzewka → ćwiczenia → rozciąganie, z krótką przerwą (5 s) w blokach i bez oceny.
- Ćwiczenia z bloków nie wliczają się do zaliczenia sesji, statystyk mięśni ani rekordów; rodzaje Rozgrzewka, Rozciąganie i Joga nie mają rekordów.
- Rozciąganie na osobny dzień: zwykła aktywność „Rozciąganie" z zestawem (np. „Mobilność: biodra i plecy").

## v54: kreator „Ułóż mi plan" (generator planów)
- Przycisk „Ułóż mi plan" na pustym ekranie Dziś i w Postępie (ręczne tworzenie planu zostaje jako „Utwórz plan ręcznie"). Nakładka z pytaniami krok po kroku (`plan-kreator.js`): cel, doświadczenie, dni (2–6), czas treningu, sprzęt (siłownia / dom z hantlami / masa ciała z drążkiem), bolące miejsca, priorytet partii, kardio, długość (4/8/12 tyg.), ciężary startowe, podsumowanie z „Dlaczego ten plan?" i przyciskiem „Zacznij".
- Generator (`plan-generator.js`): podział zależny od dni i doświadczenia (całe ciało A/B, góra/dół, push/pull/legs), ćwiczenia wybierane z bazy z listą zamienników (pomijane są kolidujące z bólem: kolana, plecy, barki, nadgarstki), serie i zakresy powtórzeń wg celu (masa/rzeźba 6–12, siła 4–6, zdrowie 10–15), przerwy, dopasowanie liczby ćwiczeń do czasu. Rozgrzewka i rozciąganie dołączane domyślnie.
- Ciężary startowe: z trzech „kotwic" (10 powtórzeń z zapasem) przez proporcje (np. suwnica ≈ 1,4 × przysiad); brak odpowiedzi = łagodne wartości domyślne. Kalistenika: stopień trudności z maksa pompek i podciągnięć (drabinki wariantów). Bieganie: marszobieg albo biegi ciągłe + krótki trening siłowy nóg.
- Plan zapisuje się jako zwykły, edytowalny plan na 28 dni (`plan.kreator` trzyma profil). Ilość w sesji ma opcjonalne `zakres: [od, do]` (np. „3 × 8–10"), sesja może mieć `notatka` (np. opis marszobiegu).
- Jeszcze nie ma: propozycji progresji na Dziś i generowania kolejnych 4-tygodniowych bloków (dla 8 i 12 tygodni powstaje na razie pierwszy blok).

## v55: propozycje progresji (`plan-progresja.js`)
- Na ekranie Dziś, nad dzisiejszymi niezaliczonymi sesjami planu, karta „Propozycje na dziś": ćwiczenie, zmiana (np. „40 → 42,5 kg"), jedno zdanie powodu, przyciski „Przyjmij" / „Zostaw" (+ „Przyjmij wszystkie"). Nic nie zmienia się bez zgody.
- Dotyczy ćwiczeń z zakresem powtórzeń (`ilosc.zakres`, z kreatora „Ułóż mi plan"). Źródło: ostatnie wykonanie tego ćwiczenia w planie (`wykonane`) i ocena (`ocena`).
- Zasady: wszystkie serie na górze zakresu → +ciężar (hantle +1/2 kg, sztanga +2,5 kg góra / +5 kg nogi, maszyny +2,5/5 kg), powtórzenia wracają na początek zakresu; ocena „Łatwo" → +ciężar od razu; w zakresie, ale nie na górze → +1 powtórzenie; dwa razy z rzędu „Ciężko" → ok. −7,5% ciężaru; „Ciężko" raz → bez propozycji. Kalistenika: po osiągnięciu góry zakresu trudniejszy wariant z drabinki `PR_DRABINKA` (zestaw dla przyszłych sesji jest klonowany, historia zostaje). Ćwiczenia statyczne: +5 s w każdej serii.
- Przyjęcie zmienia parametry wszystkich przyszłych niewykonanych sesji z tym ćwiczeniem w planie. Rozstrzygnięcie zapisane w `plan.progresja[idĆwiczenia] = {sesjaId, stan}`, więc ta sama propozycja nie wraca.
- Powtórzenia w planie z zakresem pokazują się jako „3 × 9 (zakres 8–10)" (cel i zakres).
