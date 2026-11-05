// ===== Bezpieczeństwo danych =====
// 1) Usuwanie wszystkich danych: tylko w Ustawieniach, dwa kroki potwierdzenia, przed usunięciem pobiera się kopia.
// 2) Przypomnienie o kopii zapasowej co 7 dni (karta w „Dziś”), gdy w aplikacji są już jakieś wyniki.
// 3) Sprawdzanie nierealnych wartości (literówki typu 1000 kg) – zapis po potwierdzeniu.

// ----- Kopia -----

function bzPaczkaKopii() {
  return { format: FORMAT_KOPII, wersja: 1, zapisano: new Date().toISOString(), dane: dane };
}

// Pobiera kopię i zapamiętuje datę (od niej liczy się przypomnienie)
function bzPobierzKopie(dopisek) {
  pobierzPlik("cwiczenia-kopia-" + dataDzisTekst() + (dopisek ? "-" + dopisek : "") + ".json", JSON.stringify(bzPaczkaKopii(), null, 1));
  dane.ustawienia.ostatniaKopia = dataDzisTekst();
  zapiszDane();
}

function bzDniOd(dataISO) {
  if (!dataISO) {
    return null;
  }
  const d = new Date(dataISO + "T12:00:00");
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

// Czy w aplikacji są wyniki, których szkoda by było stracić
function bzSaWyniki() {
  return (dane.plany || []).some(function (p) {
    return (p.sesje || []).some(function (s) {
      return !!s.wynik || (s.zrobione && Object.keys(s.zrobione).some(function (k) { return s.zrobione[k]; })) ||
        !!(s.przebieg && s.przebieg.wyniki && Object.keys(s.przebieg.wyniki).length);
    });
  });
}

// Karta przypomnienia w „Dziś” albo null
function bzKartaKopii() {
  if (!bzSaWyniki()) {
    return null;
  }
  const odKopii = bzDniOd(dane.ustawienia.ostatniaKopia);
  const odOdlozenia = bzDniOd(dane.ustawienia.kopiaOdlozona);
  if ((odKopii !== null && odKopii < 7) || (odOdlozenia !== null && odOdlozenia < 7)) {
    return null;
  }
  const karta = document.createElement("div");
  karta.className = "bz-karta";
  karta.appendChild(tekstElement("div", "bz-tytul", "Zrób kopię zapasową"));
  karta.appendChild(tekstElement("p", "opis", (odKopii === null ? "Nie masz jeszcze kopii." : "Ostatnia kopia: " + odKopii + " dni temu.") +
    " Twoje treningi są tylko w tym telefonie – wyczyszczenie przeglądarki usunie je na zawsze. Zapisz plik kopii, np. na Dysku Google."));
  const rzad = document.createElement("div");
  rzad.className = "bz-rzad";
  const tak = tekstElement("button", "przycisk", "Zapisz kopię");
  tak.type = "button";
  tak.addEventListener("click", function () {
    bzPobierzKopie();
    karta.remove();
  });
  const pozniej = tekstElement("button", "akcja", "Przypomnij za tydzień");
  pozniej.type = "button";
  pozniej.addEventListener("click", function () {
    dane.ustawienia.kopiaOdlozona = dataDzisTekst();
    zapiszDane();
    karta.remove();
  });
  rzad.appendChild(tak);
  rzad.appendChild(pozniej);
  karta.appendChild(rzad);
  return karta;
}

// ----- Okno dialogowe -----

// opcje: { tytul, akapity[], tak, nie, wpisz (słowo do przepisania), niebezpieczne }
function bzOkno(opcje, poTak) {
  const tlo = document.createElement("div");
  tlo.className = "gps-zgoda-tlo";
  tlo.setAttribute("role", "dialog");
  tlo.setAttribute("aria-label", opcje.tytul);
  const okno = document.createElement("div");
  okno.className = "gps-zgoda";
  okno.appendChild(tekstElement("h2", "", opcje.tytul));
  (opcje.akapity || []).forEach(function (a) {
    okno.appendChild(tekstElement("p", "opis", a));
  });
  const tak = tekstElement("button", "przycisk wielki" + (opcje.niebezpieczne ? " niebezpieczny" : ""), opcje.tak);
  tak.type = "button";
  if (opcje.wpisz) {
    const pole = document.createElement("input");
    pole.type = "text";
    pole.className = "bz-pole";
    pole.autocomplete = "off";
    pole.setAttribute("aria-label", "Wpisz słowo " + opcje.wpisz);
    pole.placeholder = opcje.wpisz;
    tak.disabled = true;
    pole.addEventListener("input", function () {
      tak.disabled = pole.value.trim().toUpperCase() !== opcje.wpisz;
    });
    okno.appendChild(pole);
  }
  const nie = tekstElement("button", "przycisk wielki drugi", opcje.nie || "Anuluj");
  nie.type = "button";
  tak.addEventListener("click", function () {
    tlo.remove();
    poTak();
  });
  nie.addEventListener("click", function () { tlo.remove(); });
  okno.appendChild(tak);
  okno.appendChild(nie);
  tlo.appendChild(okno);
  document.body.appendChild(tlo);
  nie.focus();
}

// ----- Usuwanie wszystkich danych -----

function bzUsunWszystko() {
  bzOkno({
    tytul: "Usunąć wszystkie dane?",
    akapity: [
      "Znikną plany, wyniki, rekordy, ścieżki, trasy biegów i Twoje ćwiczenia. Tego nie da się cofnąć.",
      "Zanim cokolwiek usunę, telefon pobierze plik kopii zapasowej. Z niego przywrócisz dane (Ustawienia → Wczytaj kopię)."
    ],
    tak: "Dalej",
    niebezpieczne: true
  }, function () {
    bzOkno({
      tytul: "Na pewno?",
      akapity: ["Żeby potwierdzić, wpisz słowo USUŃ."],
      tak: "Pobierz kopię i usuń",
      wpisz: "USUŃ",
      niebezpieczne: true
    }, function () {
      bzPobierzKopie("przed-usunieciem");
      // Chwila na rozpoczęcie pobierania pliku, potem czyszczenie
      setTimeout(function () {
        try {
          localStorage.removeItem(KLUCZ_DANYCH);
          localStorage.removeItem("cwiczenia-bieg-trwa");
          localStorage.removeItem("cwiczenia-trening-trwa");
        } catch (e) {}
        try {
          if (window.indexedDB && typeof GPS_BAZA === "string") {
            indexedDB.deleteDatabase(GPS_BAZA);
          }
        } catch (e) {}
        location.reload();
      }, 1200);
    });
  });
}

(function () {
  const p = document.getElementById("ust-usun-dane");
  if (p) {
    p.addEventListener("click", bzUsunWszystko);
  }
})();

// ----- Nierealne wartości -----

const BZ_LIMITY = {
  kg: 500,            // ciężar w jednej serii
  powtorzenia: 200,   // powtórzeń w serii
  serie: 20,          // serii w ćwiczeniu
  czasSerii: 3600     // s
};

function bzUwagiIlosci(ilosc, nazwa) {
  const uwagi = [];
  if (!ilosc) {
    return uwagi;
  }
  const przed = nazwa ? nazwa + ": " : "";
  try {
    bzSprawdzIlosc(ilosc, przed, uwagi);
  } catch (e) {
    // nieznany format ilości – nie blokujemy zapisu
  }
  return uwagi;
}

function bzSprawdzIlosc(ilosc, przed, uwagi) {
  const kg = ciezaryIlosci(ilosc);
  if (kg.some(function (x) { return x > BZ_LIMITY.kg; })) {
    uwagi.push(przed + "ciężar ponad " + BZ_LIMITY.kg + " kg");
  }
  if (czyPowtorzenia(ilosc)) {
    const p = listaPowtorzen(ilosc);
    if (p.some(function (x) { return x > BZ_LIMITY.powtorzenia; })) {
      uwagi.push(przed + "ponad " + BZ_LIMITY.powtorzenia + " powtórzeń w serii");
    }
    if (p.length > BZ_LIMITY.serie) {
      uwagi.push(przed + p.length + " serii");
    }
  } else if (ilosc.typ === "czas") {
    if (sekundyZ(ilosc.wartosc, ilosc.jednostka) > BZ_LIMITY.czasSerii) {
      uwagi.push(przed + "ponad godzina w jednej serii");
    }
  } else if (ilosc.typ === "czas-serie" || ilosc.typ === "czas-powtorzenia") {
    const j = jednostkaCzasu(ilosc);
    const czasy = listaCzasow(ilosc);
    if (czasy.some(function (c) { return sekundyZ(c, j) > BZ_LIMITY.czasSerii; })) {
      uwagi.push(przed + "ponad godzina w jednej serii");
    }
    if (czasy.length > BZ_LIMITY.serie) {
      uwagi.push(przed + czasy.length + " serii");
    }
  }
}

// Pojedyncza seria z trybu „Ćwicz”: { p, t, kg }
function bzUwagiSerii(seria) {
  const uwagi = [];
  if (seria.kg > BZ_LIMITY.kg) {
    uwagi.push("ciężar " + seria.kg + " kg");
  }
  if (seria.p > BZ_LIMITY.powtorzenia) {
    uwagi.push(seria.p + " powtórzeń");
  }
  if (seria.t > BZ_LIMITY.czasSerii) {
    uwagi.push("ponad godzina w jednej serii");
  }
  return uwagi;
}

// Wynik sesji z dystansem i czasem (bieg, rower, spacer, basen)
function bzUwagiWyniku(wynik, rodzajId) {
  const uwagi = [];
  if (!wynik) {
    return uwagi;
  }
  const m = wynik.dystans && typeof biegMetry === "function" ? biegMetry(wynik.dystans) : null;
  const maxKm = rodzajId === "rodzaj-rower" ? 400 : rodzajId === "rodzaj-basen" ? 20 : rodzajId === "rodzaj-spacer" ? 60 : 120;
  if (m && m > maxKm * 1000) {
    uwagi.push("dystans ponad " + maxKm + " km");
  }
  const s = wynik.czas ? sekundyZ(wynik.czas.wartosc, wynik.czas.jednostka) : null;
  if (s && s > 24 * 3600) {
    uwagi.push("czas ponad 24 godziny");
  }
  if (rodzajId === "rodzaj-bieganie" && m && s && m >= 400 && s / (m / 1000) < 150) {
    uwagi.push("tempo szybsze niż 2:30 min/km (szybciej niż rekord świata)");
  }
  if (wynik.kroki && wynik.kroki > 100000) {
    uwagi.push("ponad 100 000 kroków");
  }
  return uwagi;
}

// Pyta o potwierdzenie, gdy są uwagi. Zwraca true, gdy można zapisać.
function bzPotwierdz(uwagi) {
  if (!uwagi || !uwagi.length) {
    return true;
  }
  return confirm("Te wartości wyglądają nietypowo – może to literówka?\n\n• " + uwagi.slice(0, 6).join("\n• ") + "\n\nZapisać mimo to?");
}
