# Instrukcja projektu: aplikacja do codziennej aktywności

Stan na październik 2026. Aplikacja działa i jest używana; ten plik opisuje zasady pracy, technologię i ustalone decyzje.

## Kontekst
- Aplikacja jest wyłącznie dla jednej osoby (autora projektu).
- Autor komunikuje się po polsku i nie ma doświadczenia w programowaniu.
- Autor pracuje wyłącznie na telefonie z Androidem.
- Aplikacja ma być **prosta i intuicyjna**.

## Zasady pracy
- Powoli, krok po kroku; każdy krok daje coś, co działa.
- **Sposób prowadzenia: gotowy kod z krótkim omówieniem.** Odpowiedzi po polsku.
- Rodzaje aktywności, partie i mięśnie to **dane, nie kod**. Można je dodawać w aplikacji.
- Drobne uwagi autora z używania aplikacji są wprowadzane na bieżąco.
- Zmiany idą bezpośrednio na GitHub (Claude ma dostęp przez Claude GitHub App); autor tylko odświeża aplikację.
- Większe zmiany wyglądu lub zachowania: najpierw pokazać propozycję do akceptacji (tak było z listą ćwiczeń). Gdy zmiana okaże się zbędna, autor prosi o cofnięcie (tak było z przypisywaniem treningu przy dodawaniu sesji).

## Pliki projektu
- `00-instrukcja-projektu.md`: ten plik (zasady, technologia, decyzje)
- `01-funkcjonalnosc.md`: co aplikacja robi, ekran po ekranie
- `02-model-danych.md`: format danych zapisanych w telefonie
- `03-wdrazanie-i-testy.md`: struktura plików kodu, wgrywanie na GitHub, wersje, testy

## Technologia
- Aplikacja webowa (**PWA**) na telefon z Androidem, instalowana na ekranie głównym.
- Zwykły **HTML, CSS i JavaScript**, bez frameworków i bez budowania.
- Dane w telefonie: `localStorage`, klucz `cwiczenia-dane-v1`, format JSON. Bez konta i serwera.
- **Hosting**: GitHub Pages, https://jakubolowniuk-ai.github.io/cwiczenia/ (repozytorium `jakubolowniuk-ai/cwiczenia`, gałąź `main`).
- **Offline**: service worker (`sw.js`). Najpierw próbuje pobrać nowe pliki z sieci, a gdy jej nie ma, używa zapisanych. Filmy z linków wymagają internetu.
- Tryb jasny, ciemny albo zgodny z telefonem (zmienne kolorów w CSS).
- **Przypomnienia**: strona internetowa nie może sama ustawić budzika, więc aplikacja generuje plik kalendarza `.ics` z wydarzeniami w dni sesji i powiadomieniem o ustawionej godzinie.
- **Kopia zapasowa** i wczytywanie ćwiczeń z pliku: patrz `01-funkcjonalnosc.md`.

## Ustalone decyzje
- **Okres planu**: tydzień lub miesiąc, wybierany przy tworzeniu. Cele dotyczą tego okresu.
- **Przepływ tworzenia planu**: okres i aktywności, potem rozłożenie sesji w kalendarzu, w każdej sesji trening i parametry.
- **Zapisany plan można edytować** (aktywności i sesje). Sesje z wpisanym postępem są zablokowane przed zmianą.
- **Sesję można przenieść** na inny dzień. Przy przenoszeniu widać, jakie sesje są w danym dniu.
- **Po zakończeniu planu** licznik się resetuje. Plan można usunąć. Nowy plan zamyka poprzedni aktywny (zostaje w danych).
- **Ćwiczenie** może należeć do kilku partii i może mieć wiele mięśni (43 do wyboru, jedna grafika sylwetki do dotykania).
- **Rodzaj „Siłownia”** to dawny „Trening ciała” (nazwa zmieniona w wersji ustawień 4).
- **Treningi** użytkownik tworzy sam. Sesja zalicza się dopiero po zrobieniu wszystkich ćwiczeń treningu albo po wpisaniu wyniku (bieganie, basen).
- **Powtórzenia w seriach mogą się różnić** w jednym treningu (lista serii), podobnie czasy w ćwiczeniach statycznych.
- **Basen**: jedno ćwiczenie może mieć kilka stylów, a w sesji każdy styl ma własną liczbę długości.
- **Przykładowe ćwiczenia** są dołączone do aplikacji (219 sztuk: kalistenika, trening statyczny, siłownia, joga / mobilność) i wczytuje się je jednym przyciskiem w Ustawieniach. Mięśnie przy nich sprawdzono anatomicznie.
- **Mięśnie (wersja 5)**: zestaw z dokumentu „Mapa mięśni” (41) plus równoległoboczny i pośladkowy mały, razem 43. Bez widoku z boku.
- Zrezygnowano z: wybierania treningu od razu przy dodawaniu sesji (komplikowało formularz).

## Otwarte kwestie
1. **Sugerowany plan**: gotowy plan do edycji, zasady układania ćwiczeń na dni. Nie zbudowany.
2. **Wygląd**: dopracowywany na bieżąco.
3. **Filtr ćwiczeń po mięśniu** w bazie: pomysł, nie zbudowany.
4. **Kolejne mięśnie** (np. reszta stożka rotatorów): do dodania, jeśli będą potrzebne.
5. **Natywna aplikacja / prawdziwy alarm**: ewentualnie później, jeśli plik kalendarza przestanie wystarczać.
6. **Wersja komercyjna** (rozważana jako pomysł): wymagałaby innej technologii i konta użytkowników, na razie nie planowana.
