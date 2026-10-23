// ===== Kreator planu =====
// Krok 1: okres (tydzień lub miesiąc) i aktywności z liczbą razy (bez parametrów).
// Krok 2: kalendarz, w którym rozkładamy sesje na dni (kreator2.js).
// Rozpoczęty plan zapisujemy jako szkic w dane.szkicPlanu.

// Elementy kreatora
const kreator = document.getElementById("kreator");
const krWstecz = document.getElementById("kr-wstecz");
const krEtykietaKroku = document.getElementById("kr-etykieta-kroku");
const krPostep = [
  document.getElementById("kr-postep-1"),
  document.getElementById("kr-postep-2")
];
const krKrok1 = document.getElementById("kr-krok1");
const krKrok2 = document.getElementById("kr-krok2");

// Krok 1
const krOkresTydzien = document.getElementById("kr-okres-tydzien");
const krOkresMiesiac = document.getElementById("kr-okres-miesiac");
const krPusta = document.getElementById("kr-pusta");
const krLista = document.getElementById("kr-lista");
const krDodaj = document.getElementById("kr-dodaj");
const krPodpowiedz = document.getElementById("kr-podpowiedz");
const krBladKroku = document.getElementById("kr-blad-kroku");
const krDalej = document.getElementById("kr-dalej");
const krOdNowa = document.getElementById("kr-od-nowa");
const krTytul = document.getElementById("kr-tytul");

// Formularz aktywności
const krFormularz = document.getElementById("kr-formularz");
const krTytulFormularza = document.getElementById("kr-tytul-formularza");
const krRodzaj = document.getElementById("kr-rodzaj");
const krPolePartia = document.getElementById("kr-pole-partia");
const krPartia = document.getElementById("kr-partia");
const krRazy = document.getElementById("kr-razy");
const krBlad = document.getElementById("kr-blad");
const krZapiszAktywnosc = document.getElementById("kr-zapisz-aktywnosc");
const krAnulujAktywnosc = document.getElementById("kr-anuluj-aktywnosc");
const krUsunAktywnosc = document.getElementById("kr-usun-aktywnosc");

// Wejścia do kreatora
const dzisUtworzPlan = document.getElementById("dzis-utworz-plan");
const postepNowyPlan = document.getElementById("postep-nowy-plan");

// Liczba dni w okresie (uproszczenie: miesiąc = 30 dni)
const DNI_W_OKRESIE = { tydzien: 7, miesiac: 30 };

// Aktualny szkic planu, krok kreatora i edytowana aktywność
let szkic = { okres: "tydzien", aktywnosci: [], sesje: [] };

// Kolory aktywności w kalendarzu (różne też jasnością, nie tylko barwą)
const KOLORY_AKTYWNOSCI = ["#0B6B5F", "#D97706", "#7B3FA0", "#2563EB", "#B3261E", "#6B7A00"];
let krokKreatora = 1;
let edytowanaAktywnoscId = null;

// ===== Pomocnicze =====

// Poprawna forma słowa zależnie od liczby, np. 1 sesja, 2 sesje, 5 sesji
// Tekst kroków, np. "8 000 kroków"
function opisKrokow(kroki) {
  const n = Number(kroki);
  const koncowka = n === 1 ? "krok" : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? "kroki" : "kroków");
  return n.toLocaleString("pl-PL") + " " + koncowka;
}

function odmiana(liczba, jeden, kilka, wiele) {
  if (liczba === 1) {
    return jeden;
  }
  const reszta10 = liczba % 10;
  const reszta100 = liczba % 100;
  if (reszta10 >= 2 && reszta10 <= 4 && !(reszta100 >= 12 && reszta100 <= 14)) {
    return kilka;
  }
  return wiele;
}

function zapiszSzkic() {
  // Przy edycji zapisanego planu zmiany czekają w pamięci do "Zapisz plan"
  if (szkic.edytowanyPlanId) {
    return;
  }
  dane.szkicPlanu = szkic;
  zapiszDane();
}

// ===== Pomocnicze o sesjach =====

// Basen: etapy sesji [{ styl, dlugosci }]. Starsze sesje miały jeden styl i jedną liczbę długości.
function etapySesji(s) {
  if (Array.isArray(s.etapy) && s.etapy.length > 0) {
    return s.etapy;
  }
  if (s.dlugosci) {
    return [{ styl: s.styl || "", dlugosci: s.dlugosci }];
  }
  return [];
}

function sumaDlugosci(s) {
  return etapySesji(s).reduce(function (suma, e) {
    return suma + e.dlugosci;
  }, 0);
}

// Tekst, np. "Kraul 10 dł. · Grzbietowy 6 dł. (razem 16)"
function opisEtapow(s) {
  const etapy = etapySesji(s);
  const czesci = etapy.map(function (e) {
    return (e.styl ? e.styl + " " : "") + e.dlugosci + " dł.";
  });
  let tekst = czesci.join(" · ");
  if (etapy.length > 1) {
    tekst += " (razem " + sumaDlugosci(s) + ")";
  }
  return tekst;
}

// Czy sesja ma już zapisany postęp (odhaczone ćwiczenia, wykonane wartości albo wynik)
function sesjaMaPostep(s) {
  return !!s.wynik ||
    Object.keys(s.zrobione || {}).some(function (id) {
      return s.zrobione[id];
    }) ||
    Object.keys(s.wykonane || {}).length > 0;
}

// Czy w szkicu coś już jest (żeby pokazać "Zacznij od nowa")
function szkicNiepusty() {
  return szkic.aktywnosci.length > 0;
}

// Tytuł i podtytuł karty aktywności, np. "Plecy" i "Trening ciała · 3×"
function opisAktywnosci(aktywnosc) {
  const rodzaj = znajdzKategorie(aktywnosc.rodzajId);
  const nazwaRodzaju = rodzaj ? rodzaj.nazwa : "?";
  const czesci = [];
  let tytul = nazwaRodzaju;

  if (aktywnosc.ogolny) {
    tytul = "Ogólnorozwojowy";
    czesci.push(nazwaRodzaju);
  } else if (partieAktywnosci(aktywnosc).length > 0) {
    tytul = partieAktywnosci(aktywnosc).map(nazwaKategorii).join(", ");
    czesci.push(nazwaRodzaju);
  }
  if (aktywnosc.styl) {
    czesci.push(aktywnosc.styl);
  }
  if (aktywnosc.dlugosci) {
    czesci.push(aktywnosc.dlugosci + " " + (aktywnosc.dlugosci === 1 ? "długość" : "długości"));
  }
  if (aktywnosc.kroki) {
    czesci.push(opisKrokow(aktywnosc.kroki));
  }
  if (aktywnosc.dystans) {
    czesci.push(aktywnosc.dystans.wartosc + " " + aktywnosc.dystans.jednostka);
  }
  if (aktywnosc.czas) {
    czesci.push(aktywnosc.czas.wartosc + " " + aktywnosc.czas.jednostka);
  }
  czesci.push(aktywnosc.razy + "×");

  return { tytul: tytul, podtytul: czesci.join(" · ") };
}

// ===== Otwieranie i zamykanie kreatora =====

// Wersja ustawień w dane.js, której wymaga kreator
const WYMAGANA_WERSJA_DANYCH = 5;

function otworzKreator(planDoEdycji) {
  // Jeśli plik dane.js jest w starej wersji, kreator nie ma ustawień i nie zadziała.
  // Zamiast milczeć, mówimy o tym wprost.
  if (dane.wersjaUstawien !== WYMAGANA_WERSJA_DANYCH || !Array.isArray(dane.stylePlywania)) {
    alert(
      "Kreator nie może się otworzyć, bo plik dane.js na GitHubie jest w starej wersji.\n\n" +
      "Wgraj go ponownie (razem z kreator.js, index.html i style.css), odśwież stronę i spróbuj jeszcze raz."
    );
    return;
  }

  // Edycja zapisanego planu: pracujemy na kopii, a "Zapisz plan" podmieni oryginał
  if (planDoEdycji) {
    szkic = {
      okres: planDoEdycji.okres,
      start: planDoEdycji.start,
      aktywnosci: JSON.parse(JSON.stringify(planDoEdycji.aktywnosci)),
      sesje: JSON.parse(JSON.stringify(planDoEdycji.sesje)),
      edytowanyPlanId: planDoEdycji.id
    };
  } else {
    // Wznawiamy rozpoczęty szkic albo zaczynamy nowy
    szkic = dane.szkicPlanu
      ? JSON.parse(JSON.stringify(dane.szkicPlanu))
      : { okres: "tydzien", aktywnosci: [], sesje: [] };
    if (!Array.isArray(szkic.sesje)) {
      szkic.sesje = [];
    }
  }
  krTytul.textContent = planDoEdycji ? "Edycja planu" : "Nowy plan";

  edytowanaAktywnoscId = null;
  krFormularz.hidden = true;
  krBladKroku.textContent = "";
  przygotujSelectyAktywnosci();
  pokazKrok(1);
  rysujKrok1();
  if (planDoEdycji) {
    // Najczęściej poprawiamy kalendarz, więc od razu go pokazujemy
    rysujKalendarz();
    pokazKrok(2);
  }
  kreator.hidden = false;
  kreator.querySelector(".kreator-tresc").scrollTop = 0;
}

function zamknijKreator() {
  kreator.hidden = true;
}

// Zamknięcie kreatora z wyjścia (strzałka): przy edycji pytamy o porzucenie zmian
function wyjdzZKreatora() {
  if (szkic.edytowanyPlanId && !confirm("Zamknąć bez zapisywania zmian w planie?")) {
    return;
  }
  zamknijKreator();
}

function pokazKrok(numer) {
  krokKreatora = numer;
  krKrok1.hidden = numer !== 1;
  krKrok2.hidden = numer !== 2;
  krEtykietaKroku.textContent = "Krok " + numer + " z 2";
  krPostep.forEach(function (pasek, indeks) {
    pasek.classList.toggle("aktywny", indeks < numer);
  });
}

// ===== Krok 1: okres i lista aktywności =====

function ustawOkres(okres) {
  szkic.okres = okres;
  zapiszSzkic();
  rysujKrok1();
}

function rysujKrok1() {
  krOkresTydzien.classList.toggle("aktywny", szkic.okres === "tydzien");
  krOkresMiesiac.classList.toggle("aktywny", szkic.okres === "miesiac");

  krLista.innerHTML = "";
  krPusta.hidden = szkic.aktywnosci.length > 0;

  szkic.aktywnosci.forEach(function (aktywnosc) {
    const opis = opisAktywnosci(aktywnosc);
    const karta = zrobKarte(opis.tytul, opis.podtytul);
    karta.appendChild(
      przyciskAkcji("Edytuj", "", function () {
        otworzFormularzAktywnosci(aktywnosc);
      })
    );
    krLista.appendChild(karta);
  });

  // Podpowiedź: ile sesji w ilu dniach (miękkie ostrzeżenie, bez blokady)
  const razem = szkic.aktywnosci.reduce(function (suma, a) {
    return suma + a.razy;
  }, 0);
  const dni = DNI_W_OKRESIE[szkic.okres];
  if (razem === 0) {
    krPodpowiedz.textContent = "";
  } else {
    let tekst = "Razem " + razem + " " + odmiana(razem, "sesja", "sesje", "sesji") + " w " + dni + " dniach.";
    if (razem > dni) {
      tekst += " To więcej niż dni w okresie, więc w niektóre dni będzie kilka sesji.";
    }
    krPodpowiedz.textContent = tekst;
  }

  // Przy edycji planu nie zmieniamy okresu i nie zaczynamy od nowa
  krOkresTydzien.parentElement.hidden = !!szkic.edytowanyPlanId;
  krOdNowa.hidden = !szkicNiepusty() || !!szkic.edytowanyPlanId;
  krDalej.hidden = !krFormularz.hidden;
  krDodaj.hidden = !krFormularz.hidden;
}

// ===== Formularz aktywności =====

// Wypełnia listy wyboru: rodzaje, partie i style pływania
function przygotujSelectyAktywnosci() {
  krRodzaj.innerHTML = "";
  const pustaOpcja = document.createElement("option");
  pustaOpcja.value = "";
  pustaOpcja.textContent = "Wybierz rodzaj";
  krRodzaj.appendChild(pustaOpcja);
  kategorieTypu("rodzaj").forEach(function (kategoria) {
    const opcja = document.createElement("option");
    opcja.value = kategoria.id;
    opcja.textContent = kategoria.nazwa;
    krRodzaj.appendChild(opcja);
  });

  rysujWyborPartii();

}

// Wybór partii w formularzu aktywności: kilka partii albo "Ogólnorozwojowy"
let krPartieWybor = [];
let krOgolny = false;

function rysujWyborPartii() {
  krPartia.innerHTML = "";
  const dodajChip = function (tekst, aktywny, akcja) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip" + (aktywny ? " aktywny" : "");
    chip.textContent = tekst;
    chip.addEventListener("click", akcja);
    krPartia.appendChild(chip);
  };
  dodajChip("Ogólnorozwojowy (całe ciało)", krOgolny, function () {
    krOgolny = !krOgolny;
    if (krOgolny) {
      krPartieWybor = [];
    }
    rysujWyborPartii();
  });
  kategorieTypu("partia").forEach(function (kategoria) {
    dodajChip(kategoria.nazwa, krPartieWybor.indexOf(kategoria.id) !== -1, function () {
      krOgolny = false;
      const i = krPartieWybor.indexOf(kategoria.id);
      if (i === -1) {
        krPartieWybor.push(kategoria.id);
      } else {
        krPartieWybor.splice(i, 1);
      }
      rysujWyborPartii();
    });
  });
}

// Partie aktywności (stare plany mają jedno pole partiaId)
function partieAktywnosci(aktywnosc) {
  if (Array.isArray(aktywnosc.partieIds)) {
    return aktywnosc.partieIds;
  }
  return aktywnosc.partiaId ? [aktywnosc.partiaId] : [];
}

// Pokazuje tylko te pola, których wymaga wybrany rodzaj aktywności
function ustawPolaAktywnosci() {
  const rodzaj = znajdzKategorie(krRodzaj.value);
  const pola = rodzaj && rodzaj.polaPlanu ? rodzaj.polaPlanu : [];

  // W kroku 1 wybieramy tylko partię. Pozostałe parametry (dystans, czas, styl, długości)
  // ustawiamy w kroku 2, razem z parametrami ćwiczeń.
  krPolePartia.hidden = pola.indexOf("partia") === -1;
}

function pokazBladAktywnosci(tekst) {
  krBlad.textContent = tekst;
}

// Otwiera formularz: pusty (nowa aktywność) albo wypełniony (edycja)
function otworzFormularzAktywnosci(aktywnosc) {
  pokazBladAktywnosci("");
  krBladKroku.textContent = "";

  // Zerujemy pola
  krRodzaj.value = "";
  krPartieWybor = [];
  krOgolny = false;
  krRazy.value = "0";

  if (aktywnosc) {
    edytowanaAktywnoscId = aktywnosc.id;
    krTytulFormularza.textContent = "Edycja aktywności";
    krRodzaj.value = aktywnosc.rodzajId;
    krPartieWybor = partieAktywnosci(aktywnosc).slice();
    krOgolny = !!aktywnosc.ogolny;
    krRazy.value = aktywnosc.razy;
    krUsunAktywnosc.hidden = false;
  } else {
    edytowanaAktywnoscId = null;
    krTytulFormularza.textContent = "Nowa aktywność";
    krUsunAktywnosc.hidden = true;
  }

  rysujWyborPartii();
  ustawPolaAktywnosci();
  krFormularz.hidden = false;
  rysujKrok1();
  krFormularz.scrollIntoView({ behavior: "smooth", block: "start" });
}

function zamknijFormularzAktywnosci() {
  krFormularz.hidden = true;
  edytowanaAktywnoscId = null;
  rysujKrok1();
}

// Pierwszy kolor z palety, którego nie używa jeszcze żadna aktywność
function kolejnyKolor() {
  const uzyte = szkic.aktywnosci.map(function (a) {
    return a.kolor;
  });
  const wolny = KOLORY_AKTYWNOSCI.find(function (kolor) {
    return uzyte.indexOf(kolor) === -1;
  });
  return wolny || KOLORY_AKTYWNOSCI[szkic.aktywnosci.length % KOLORY_AKTYWNOSCI.length];
}

// Sprawdza pola formularza i zapisuje aktywność w szkicu
function zapiszAktywnosc() {
  const rodzaj = znajdzKategorie(krRodzaj.value);
  if (!rodzaj) {
    pokazBladAktywnosci("Wybierz rodzaj aktywności.");
    return;
  }

  const pola = rodzaj.polaPlanu || [];
  const stara = szkic.aktywnosci.find(function (a) {
    return a.id === edytowanaAktywnoscId;
  });
  const wpis = {
    id: edytowanaAktywnoscId || "ak-" + Date.now(),
    rodzajId: rodzaj.id,
    partiaId: null,
    partieIds: [],
    ogolny: false,
    razy: 0,
    kolor: stara && stara.kolor ? stara.kolor : kolejnyKolor()
  };

  if (pola.indexOf("partia") !== -1) {
    if (!krOgolny && krPartieWybor.length === 0) {
      pokazBladAktywnosci("Wybierz partię mięśni albo „Ogólnorozwojowy”.");
      return;
    }
    wpis.ogolny = krOgolny;
    wpis.partieIds = krOgolny ? [] : krPartieWybor.slice();
    wpis.partiaId = wpis.partieIds[0] || null;
  }

  const razy = Number(krRazy.value);
  if (!(razy >= 1) || Math.floor(razy) !== razy) {
    pokazBladAktywnosci("Wpisz, ile razy w okresie (liczba całkowita, co najmniej 1).");
    return;
  }
  wpis.razy = razy;

  // Edycja aktywności, która ma już sesje w kalendarzu
  if (stara) {
    const rozlozone = szkic.sesje.filter(function (s) {
      return s.aktywnoscId === stara.id;
    }).length;
    const zmienionaTresc = stara.rodzajId !== wpis.rodzajId || (stara.ogolny !== wpis.ogolny || partieAktywnosci(stara).join() !== wpis.partieIds.join());

    if (zmienionaTresc && rozlozone > 0) {
      if (!confirm("Ta aktywność ma już " + rozlozone + " sesji w kalendarzu. Zmiana rodzaju lub partii usunie je z kalendarza. Kontynuować?")) {
        return;
      }
      szkic.sesje = szkic.sesje.filter(function (s) {
        return s.aktywnoscId !== stara.id;
      });
    } else if (wpis.razy < rozlozone) {
      pokazBladAktywnosci("W kalendarzu jest już " + rozlozone + " sesji tej aktywności. Wpisz co najmniej " + rozlozone + ".");
      return;
    }
  }

  if (edytowanaAktywnoscId) {
    szkic.aktywnosci = szkic.aktywnosci.map(function (inna) {
      return inna.id === edytowanaAktywnoscId ? wpis : inna;
    });
  } else {
    szkic.aktywnosci.push(wpis);
  }

  zapiszSzkic();
  zamknijFormularzAktywnosci();
}

function usunAktywnosc() {
  if (!edytowanaAktywnoscId) {
    return;
  }
  if (szkic.sesje.some(function (s) {
    return s.aktywnoscId === edytowanaAktywnoscId && sesjaMaPostep(s);
  })) {
    alert("Ta aktywność ma już zaliczone sesje, więc nie można jej usunąć z planu.");
    return;
  }
  if (confirm("Usunąć tę aktywność z planu (razem z jej sesjami w kalendarzu)?")) {
    szkic.aktywnosci = szkic.aktywnosci.filter(function (inna) {
      return inna.id !== edytowanaAktywnoscId;
    });
    szkic.sesje = szkic.sesje.filter(function (s) {
      return s.aktywnoscId !== edytowanaAktywnoscId;
    });
    zapiszSzkic();
    zamknijFormularzAktywnosci();
  }
}

// ===== Przejścia między krokami =====

function dalejZKroku1() {
  if (szkic.aktywnosci.length === 0) {
    krBladKroku.textContent = "Dodaj co najmniej jedną aktywność.";
    return;
  }
  krBladKroku.textContent = "";
  zapiszSzkic();

  // Krok 2: kalendarz (kreator2.js)
  rysujKalendarz();
  pokazKrok(2);
  kreator.querySelector(".kreator-tresc").scrollTop = 0;
}

function wstecz() {
  if (krokKreatora === 2) {
    // Najpierw zamykamy ewentualne okno albo panel dnia
    if (!krok2Wstecz()) {
      pokazKrok(1);
      rysujKrok1();
    }
  } else if (!krFormularz.hidden) {
    zamknijFormularzAktywnosci();
  } else {
    wyjdzZKreatora();
  }
}

function zacznijOdNowa() {
  if (confirm("Usunąć rozpoczęty plan i zacząć od nowa?")) {
    szkic = { okres: "tydzien", aktywnosci: [], sesje: [] };
    dane.szkicPlanu = null;
    zapiszDane();
    krFormularz.hidden = true;
    rysujKrok1();
  }
}

// ===== Podpięcie przycisków =====

dzisUtworzPlan.addEventListener("click", function () {
  otworzKreator();
});
postepNowyPlan.addEventListener("click", function () {
  otworzKreator();
});

krWstecz.addEventListener("click", wstecz);
krOkresTydzien.addEventListener("click", function () {
  ustawOkres("tydzien");
});
krOkresMiesiac.addEventListener("click", function () {
  ustawOkres("miesiac");
});
krDodaj.addEventListener("click", function () {
  otworzFormularzAktywnosci(null);
});
krRodzaj.addEventListener("change", ustawPolaAktywnosci);
krZapiszAktywnosc.addEventListener("click", zapiszAktywnosc);
krAnulujAktywnosc.addEventListener("click", zamknijFormularzAktywnosci);
krUsunAktywnosc.addEventListener("click", usunAktywnosc);
krDalej.addEventListener("click", dalejZKroku1);
krOdNowa.addEventListener("click", zacznijOdNowa);

// Po dotknięciu pola liczbowego zaznaczamy jego zawartość (np. 0)
krFormularz.querySelectorAll('input[type="number"]').forEach(function (pole) {
  pole.addEventListener("focus", function () {
    pole.select();
  });
});
