# Instrukcja projektu: aplikacja do aktywności

Stan na listopad 2026 (wersja 98). Ten plik opisuje kontekst, zasady pracy, technologię i ustalone decyzje.

## Kontekst
- Autor: Jakub. Komunikuje się po polsku, uczy się programowania od podstaw, pracuje głównie na telefonie z Androidem.
- Aplikacja zaczęła się jako osobista; teraz korzystają z niej też testerzy (znajomi). Docelowo ma być **platformą wspierającą różne aktywności** ze społecznością osób o tych samych zainteresowaniach (szczegóły: dokument „Strategia platformy aktywności”).
- Priorytety: **funkcjonalna, przyjemna, intuicyjna**; plany oparte na wiedzy (skuteczność ważniejsza niż efektowność). Bez rekomendacji dietetycznych, bez reklam.

## Zasady pracy
- Powoli, krok po kroku; każda wersja działa, jest przetestowana i opisana.
- Odpowiedzi po polsku, zwięźle. Gotowy kod z krótkim omówieniem.
- Większe zmiany wyglądu: najpierw 2–3 makiety do wyboru, potem kod.
- Claude wypycha zmiany bezpośrednio na `main`; autor odświeża aplikację banerem „Jest nowa wersja – Odśwież”. Po każdym wypchnięciu sprawdzamy, czy wdrożenie GitHub Pages się udało.
- Gdy autor mówi „sprawdzę całość”, budujemy cały etap i dopiero wtedy wypychamy.
- Rodzaje treningów, partie, mięśnie, ćwiczenia, zestawy i ścieżki to **dane, nie kod**.

## Pliki dokumentacji
- `00-instrukcja-projektu.md` – ten plik (kontekst, zasady, technologia, decyzje)
- `01-funkcjonalnosc.md` – co aplikacja robi dziś, ekran po ekranie
- `02-model-danych.md` – format danych zapisanych w telefonie
- `03-wdrazanie-i-testy.md` – pliki kodu, wgrywanie, wersje, testy
- `04-historia-zmian.md` – zmiany wersja po wersji
- Poza repozytorium: dokument „Strategia platformy aktywności” (wizja, etapy, odłożone pomysły) – aktualizowany przy każdej decyzji kierunkowej.

## Technologia
- Aplikacja webowa (**PWA**) instalowana na ekranie głównym telefonu. Zwykły HTML, CSS i JavaScript, bez frameworków i bez budowania.
- Dane: `localStorage`, klucz `cwiczenia-dane-v1` (JSON); trasy GPS w IndexedDB (`cwiczenia-gps`). Bez konta i serwera.
- **Hosting**: GitHub Pages, https://jakubolowniuk-ai.github.io/cwiczenia/ (repozytorium `jakubolowniuk-ai/cwiczenia`, gałąź `main`).
- **Offline**: service worker (`sw.js`) – najpierw sieć, potem pamięć podręczna.
- Motyw jasny, ciemny albo jak telefon (zmienne kolorów w CSS), kontrast WCAG AA.
- **Przypomnienia**: plik kalendarza `.ics` (strona nie może ustawić budzika).
- Ograniczenia przeglądarki: GPS tylko przy włączonym ekranie, brak krokomierza, brak prawdziwego alarmu. Rozwiązanie: wersja APK z tego samego kodu (Capacitor) – etap 3 strategii.

## Ustalone decyzje
- **Plany**: kreator „Ułóż mi plan” (siłownia, kalistenika, zdrowie, bieganie, pływanie) i plan ręczny. Bloki po 4 tygodnie, 4. tydzień lżejszy; kolejny blok dopasowuje się do wyników. Kilka planów naraz.
- **Moje możliwości** (test) są obowiązkowe dla planów siłowych i kalistenicznych.
- **Zaliczanie**: trening siłowy – wszystkie ćwiczenia; bieg, basen, rower, spacer – wpisany wynik. Wartości inne niż w planie są zapisywane.
- **Nic nie zmienia się bez zgody**: propozycje progresji, stagnacji, odciążenia – „Przyjmij” / „Zostaw”.
- **Słownictwo**: trening (dzień), zestaw ćwiczeń (szablon), rodzaj treningu, blok, ścieżka, cel.
- **Ćwiczenia**: wbudowana baza (ok. 500), ćwiczeń z bazy nie usuwa się, tylko ukrywa; własne osobno („Moje ćwiczenia”). Import z pliku JSON usunięty (v95).
- **„Dodaj do zestawu”** dopisuje ćwiczenie też do przyszłych treningów planów z tym zestawem (v98).
- **Pływanie**: wpis w długościach basenu, metry liczone; tryb prosty (wiersze stylów) i bloki; bez ekranu treningu w wodzie, dopóki nie będzie integracji z zegarkiem.
- **Bieganie**: GPS z własnym filtrem, odcinki, GPX; tempo zawsze widoczne.
- **Rower**: moduł w tej aplikacji (nie osobna aplikacja), razem ze spacerem na wspólnym ekranie aktywności z GPS; joga / mobilność później, osobno.
- Zrezygnowano z: dyktowania głosem, wyboru treningu przy dodawaniu sesji, ANT+ i iPhone’a (na razie).

## Gdzie są otwarte kwestie
Lista odłożonych pomysłów, etapy i warunki przejścia są w dokumencie „Strategia platformy aktywności”. Znane ograniczenia – na końcu `01-funkcjonalnosc.md`.
