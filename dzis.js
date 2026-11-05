// ===== Ekran Dziś: sesje na dzisiaj, odhaczanie ćwiczeń, wynik biegania i basenu =====
// Aktywny plan to ostatni zapisany plan, którego nie zamknięto (dane.plany).
// Postęp sesji trzymamy w samej sesji planu:
//   sesja.zrobione = { idĆwiczenia: true }   (trening ciała, rozciąganie, trening statyczny)
//   sesja.wynik    = { dystans, kroki, czas, styl, dlugosci }   (bieganie, basen; wpisany po sesji)
// Sesja jest zaliczona dopiero, gdy zrobiono WSZYSTKIE ćwiczenia treningu albo wpisano wynik.

// ===== Elementy strony =====

const dzisBrakPlanu = document.getElementById("dzis-brak-planu");
const dzisPlan = document.getElementById("dzis-plan");
const dzisData = document.getElementById("dzis-data");
const dzisSesje = document.getElementById("dzis-sesje");
const dzisEdytujPlan = document.getElementById("dzis-edytuj-plan");
const dzisPodsumowanie = document.getElementById("dzis-podsumowanie");

const wynikTlo = document.getElementById("wynik-tlo");
const wynikTytul = document.getElementById("wynik-tytul");
const wynikPola = document.getElementById("wynik-pola");
const wynikBlad = document.getElementById("wynik-blad");
const wynikZapisz = document.getElementById("wynik-zapisz");
const wynikAnuluj = document.getElementById("wynik-anuluj");

const MIESIACE_DOPELNIACZ = [
  "stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca",
  "lipca", "sierpnia", "września", "października", "listopada", "grudnia"
];

// Sesja, której wynik teraz wpisujemy, i odczyt pól formularza wyniku
let wynikSesja = null;
let wynikRodzajId = null;
let wynikOdczyt = null;

// ===== Pomocnicze =====

// Plany otwarte (niezamknięte) i włączone; plan można wyłączyć (plan.wylaczony), wtedy znika z ekranu Dziś
function planyOtwarte() {
  return dane.plany.filter(function (p) { return !p.zamkniety; });
}

function planyWlaczone() {
  return planyOtwarte().filter(function (p) { return !p.wylaczony; });
}

// Główny plan: ostatni włączony
function aktywnyPlan() {
  const w = planyWlaczone();
  return w.length > 0 ? w[w.length - 1] : null;
}

function nazwaPlanu(plan) {
  if (plan.nazwa) {
    return plan.nazwa;
  }
  return plan.okres === "tydzien" ? "Plan tygodniowy" : "Plan miesięczny";
}

function aktywnoscPlanu(plan, id) {
  return plan.aktywnosci.find(function (a) {
    return a.id === id;
  });
}

function dataPlanu(plan, indeks) {
  const d = new Date(plan.start + "T12:00:00");
  d.setDate(d.getDate() + indeks);
  return d;
}

// Który dzień planu to dzisiaj (0 = pierwszy dzień; ujemny = plan jeszcze się nie zaczął)
function dzisiejszyDzienPlanu(plan) {
  const dzis = new Date(dzisISO() + "T12:00:00");
  const start = new Date(plan.start + "T12:00:00");
  return Math.round((dzis - start) / 86400000);
}

function numerSesjiWPlanie(plan, sesja) {
  const wszystkie = plan.sesje.filter(function (s) {
    return s.aktywnoscId === sesja.aktywnoscId;
  }).sort(function (a, b) {
    return a.dzien - b.dzien || (a.id < b.id ? -1 : 1);
  });
  return wszystkie.indexOf(sesja) + 1;
}

// Bloki przy sesji: rozgrzewka przed treningiem (sesja.blokPrzedId) i rozciąganie po nim (sesja.blokPoId).
// To zestawy z oznaczeniem trening.blok; ich ćwiczenia mają parametry w sesja.parametry, ale nie wchodzą
// do statystyk ćwiczeń głównych (zaliczenie sesji, mięśnie, rekordy).
function idyBloku(sesja, miejsce) {
  const idTreningu = miejsce === "przed" ? sesja.blokPrzedId : sesja.blokPoId;
  const blok = idTreningu ? znajdzTrening(idTreningu) : null;
  if (!blok) {
    return [];
  }
  const parametry = sesja.parametry || {};
  const glowny = znajdzTrening(sesja.treningId);
  const glowne = glowny ? glowny.cwiczeniaIds : [];
  const wynik = blok.cwiczeniaIds.filter(function (id) {
    return parametry[id] && znajdzCwiczenie(id) && glowne.indexOf(id) === -1;
  });
  if (miejsce === "po") {
    const przed = idyBloku(sesja, "przed");
    return wynik.filter(function (id) { return przed.indexOf(id) === -1; });
  }
  return wynik;
}

// Wszystkie ćwiczenia sesji w kolejności wykonywania: rozgrzewka, ćwiczenia główne, rozciąganie
function wszystkieIdSesji(sesja) {
  return idyBloku(sesja, "przed").concat(cwiczeniaSesjiIds(sesja), idyBloku(sesja, "po"));
}

// Id ćwiczeń sesji, w kolejności treningu (tylko te, które mają parametry i nadal istnieją w bazie)
function cwiczeniaSesjiIds(sesja) {
  const parametry = sesja.parametry || {};
  const trening = znajdzTrening(sesja.treningId);
  const ids = trening ? trening.cwiczeniaIds.slice() : [];
  const blokowe = idyBloku(sesja, "przed").concat(idyBloku(sesja, "po"));
  Object.keys(parametry).forEach(function (id) {
    if (ids.indexOf(id) === -1 && blokowe.indexOf(id) === -1) {
      ids.push(id);
    }
  });
  const wazne = ids.filter(function (id) {
    return parametry[id] && znajdzCwiczenie(id);
  });
  // Własna kolejność ustawiona przeciąganiem na ekranie Dziś
  const wlasna = sesja.kolejnosc || [];
  if (wlasna.length === 0) {
    return wazne;
  }
  return wazne.slice().sort(function (a, b) {
    const ia = wlasna.indexOf(a);
    const ib = wlasna.indexOf(b);
    return (ia === -1 ? 1000 + wazne.indexOf(a) : ia) - (ib === -1 ? 1000 + wazne.indexOf(b) : ib);
  });
}

function liczbaZrobionych(sesja) {
  const zrobione = sesja.zrobione || {};
  return cwiczeniaSesjiIds(sesja).filter(function (id) {
    return zrobione[id];
  }).length;
}

// Czy sesja jest zaliczona
function sesjaZaliczona(plan, sesja) {
  const aktywnosc = aktywnoscPlanu(plan, sesja.aktywnoscId);
  if (!aktywnosc) {
    return false;
  }
  if (!wymagaTreningu(aktywnosc)) {
    return !!sesja.wynik;
  }
  const wszystkie = cwiczeniaSesjiIds(sesja).length;
  return wszystkie > 0 && liczbaZrobionych(sesja) === wszystkie;
}

// Opis celu albo wyniku biegania i basenu, np. "Kraul 400 m" albo "5 km · 30 min"
function opisCeluSesji(dane_) {
  const czesci = [];
  if (etapySesji(dane_).length > 0) {
    czesci.push(opisEtapow(dane_));
  }
  if (dane_.kroki) {
    czesci.push(opisKrokow(dane_.kroki));
  }
  if (dane_.rodzajBiegu) {
    czesci.push(biegRodzaj(dane_.rodzajBiegu).nazwa);
  }
  if (dane_.odcinki && dane_.odcinki.length) {
    czesci.push(biegOpisOdcinkow(dane_.odcinki));
  }
  if (dane_.odcinkiWyniki && dane_.odcinkiWyniki.length) {
    czesci.push(dane_.odcinkiWyniki.length + " odcinków");
  }
  if (dane_.dystans) {
    czesci.push(dane_.dystans.wartosc + " " + dane_.dystans.jednostka);
  }
  if (dane_.czas) {
    czesci.push(opisCzasuSesji(dane_.czas));
  }
  const tempo = biegTempo(dane_.dystans, dane_.czas);
  if (tempo && (dane_.rodzajBiegu || dane_.zrodlo)) {
    czesci.push(biegOpisTempa(tempo));
  }
  if (typeof dane_.wysilek === "number") {
    czesci.push("wysiłek " + dane_.wysilek + "/10");
  }
  if (dane_.obciazenie) {
    czesci.push("z obciążeniem " + dane_.obciazenie + " kg");
  }
  return czesci.join(" · ");
}

function tekstElement(tag, klasa, tekst) {
  const el = document.createElement(tag);
  if (klasa) {
    el.className = klasa;
  }
  el.textContent = tekst;
  return el;
}

// ===== Rysowanie ekranu =====

function rysujDzis() {
  const otwarte = planyOtwarte();
  const wlaczone = planyWlaczone();
  dzisBrakPlanu.hidden = otwarte.length > 0;
  dzisPlan.hidden = otwarte.length === 0;
  if (otwarte.length === 0) {
    return;
  }
  dzisEdytujPlan.hidden = true;

  const dzis = new Date();
  dzisData.textContent = NAZWY_DNI[dzis.getDay()] + ", " + dzis.getDate() + " " + MIESIACE_DOPELNIACZ[dzis.getMonth()];

  dzisSesje.innerHTML = "";
  dzisPodsumowanie.textContent = "";
  const kartaWznow = typeof cwKartaWznowienia === "function" ? cwKartaWznowienia() : null;
  if (kartaWznow) {
    dzisSesje.appendChild(kartaWznow);
  }
  const kartaKopii = typeof bzKartaKopii === "function" ? bzKartaKopii() : null;
  if (kartaKopii) {
    dzisSesje.appendChild(kartaKopii);
  }
  if (typeof dnKartyDzis === "function") {
    dnKartyDzis().forEach(function (k) { dzisSesje.appendChild(k); });
  }
  if (wlaczone.length === 0) {
    dzisSesje.appendChild(zrobPustyKomunikat("Wszystkie plany są wyłączone", "Włącz plan w zakładce Postęp (sekcja „Moje plany”), a jego treningi pojawią się tutaj."));
    return;
  }
  wlaczone.forEach(function (plan) {
    const blok = document.createElement("div");
    blok.className = "dzis-plan-blok";
    if (otwarte.length > 1) {
      const gora = document.createElement("div");
      gora.className = "dzis-plan-gora";
      gora.appendChild(tekstElement("h2", "dzis-plan-nazwa", nazwaPlanu(plan)));
      const edytuj = tekstElement("button", "akcja", "Edytuj");
      edytuj.addEventListener("click", function () {
        otworzKreator(plan);
      });
      gora.appendChild(edytuj);
      blok.appendChild(gora);
    } else {
      const edytuj = tekstElement("button", "akcja", "Edytuj plan");
      edytuj.addEventListener("click", function () {
        otworzKreator(plan);
      });
      blok.appendChild(edytuj);
    }
    rysujPlanDzis(plan, blok);
    dzisSesje.appendChild(blok);
  });
}

function rysujPlanDzis(plan, kontener) {
  const indeks = dzisiejszyDzienPlanu(plan);
  const liczbaDni = DNI_W_OKRESIE[plan.okres];

  if (indeks < 0) {
    kontener.appendChild(zrobPustyKomunikat("Plan jeszcze się nie zaczął", "Zaczyna się " + dataPlanu(plan, 0).getDate() + " " + MIESIACE_DOPELNIACZ[dataPlanu(plan, 0).getMonth()] + "."));
    return;
  }

  if (indeks >= liczbaDni) {
    rysujKoniecPlanu(plan, kontener);
    return;
  }

  if (typeof celeKartaTestu === "function") {
    celeKartaTestu(plan, kontener);
  }
  const sesjeDzis = plan.sesje.filter(function (s) {
    return s.dzien === indeks;
  });

  if (sesjeDzis.length === 0) {
    const nastepna = plan.sesje.filter(function (s) {
      return s.dzien > indeks;
    }).sort(function (a, b) {
      return a.dzien - b.dzien;
    })[0];

    let opis = "To dzień odpoczynku. Alarm dzisiaj nie zadzwoni.";
    if (nastepna) {
      const data = dataPlanu(plan, nastepna.dzien);
      const aktywnosc = aktywnoscPlanu(plan, nastepna.aktywnoscId);
      opis += " Następny trening: " + NAZWY_DNI[data.getDay()] + " " + data.getDate() + "." + (data.getMonth() + 1) + ", " + opisAktywnosci(aktywnosc).tytul + ".";
    }
    kontener.appendChild(zrobPustyKomunikat("Dziś odpoczywasz", opis));
  } else {
    if (typeof prDodajKarte === "function") {
      prDodajKarte(plan, sesjeDzis, kontener);
    }
    sesjeDzis.forEach(function (sesja) {
      kontener.appendChild(zrobKarteDzis(plan, sesja));
    });
  }

  // Podsumowanie całego planu
  const zaliczone = plan.sesje.filter(function (s) {
    return sesjaZaliczona(plan, s);
  }).length;
  kontener.appendChild(tekstElement("p", "opis", "Plan: zaliczone treningi " + zaliczone + " z " + plan.sesje.length + ". Dzień " + (indeks + 1) + " z " + liczbaDni + "."));
}

function zrobPustyKomunikat(tytul, opis) {
  const blok = document.createElement("div");
  blok.className = "pusty-stan";
  blok.appendChild(tekstElement("div", "pusty-tytul", tytul));
  blok.appendChild(tekstElement("p", "opis", opis));
  return blok;
}

function zrobKarteDzis(plan, sesja) {
  const aktywnosc = aktywnoscPlanu(plan, sesja.aktywnoscId);
  const karta = document.createElement("div");
  karta.className = "dzis-karta";
  if (!aktywnosc) {
    return karta;
  }
  karta.style.borderLeftColor = aktywnosc.kolor || "#0B6B5F";

  const zaliczona = sesjaZaliczona(plan, sesja);
  const naglowek = document.createElement("div");
  naglowek.className = "dzis-naglowek";
  naglowek.appendChild(tekstElement("div", "dzis-tytul", opisAktywnosci(aktywnosc).tytul + " " + numerSesjiWPlanie(plan, sesja) + " z " + aktywnosc.razy));
  naglowek.appendChild(tekstElement("div", "dzis-status" + (zaliczona ? " zaliczona" : ""), zaliczona ? (wymagaTreningu(aktywnosc) && sesjaPonizejPlanu(sesja) ? "Zaliczone ◐" : "Zaliczone ✓") : ""));
  karta.appendChild(naglowek);

  if (wymagaTreningu(aktywnosc)) {
    const trening = znajdzTrening(sesja.treningId);
    if (trening) {
      karta.appendChild(tekstElement("div", "karta-opis", "Zestaw: " + trening.nazwa));
    }

    const ids = cwiczeniaSesjiIds(sesja);
    const zrobione = liczbaZrobionych(sesja);
    const procent = ids.length === 0 ? 0 : Math.round(zrobione * 100 / ids.length);
    const przed = idyBloku(sesja, "przed");
    const po = idyBloku(sesja, "po");
    const wszystkie = przed.concat(ids, po);
    const zrobioneWszystkie = wszystkie.filter(function (id) { return sesja.zrobione && sesja.zrobione[id]; }).length;

    const postep = document.createElement("div");
    postep.className = "dzis-postep";
    postep.appendChild(tekstElement("span", "", zrobione + " z " + ids.length + " " + slowoCwiczen(ids.length)));
    postep.appendChild(tekstElement("span", "dzis-procent", procent + "%"));
    karta.appendChild(postep);

    const pasek = document.createElement("div");
    pasek.className = "pasek-postepu";
    const wypelnienie = document.createElement("div");
    wypelnienie.style.width = procent + "%";
    pasek.appendChild(wypelnienie);
    karta.appendChild(pasek);

    if (wszystkie.length > 0 && zrobioneWszystkie < wszystkie.length && typeof otworzCwicz === "function") {
      const rozpoczete = zrobioneWszystkie > 0 || (sesja.przebieg && Object.keys(sesja.przebieg.wyniki || {}).length > 0);
      const cwicz = document.createElement("button");
      cwicz.className = "przycisk wielki";
      cwicz.textContent = rozpoczete ? "Kontynuuj ćwiczenie" : "Ćwicz";
      cwicz.addEventListener("click", function () {
        otworzCwicz(sesja);
      });
      karta.appendChild(cwicz);
    }
    if (typeof dnPrzyciskiTreningu === "function" && zrobioneWszystkie < wszystkie.length) {
      const nogi = dnOstrzezenieNogi(plan, sesja);
      if (nogi) {
        karta.appendChild(nogi);
      }
      const dodatki = dnPrzyciskiTreningu(plan, sesja);
      if (dodatki) {
        karta.appendChild(dodatki);
      }
    }

    const dodajBlok = function (tytul, idBloku, lista) {
      if (lista.length === 0) {
        return;
      }
      const blok = znajdzTrening(idBloku);
      const zr = lista.filter(function (id) { return sesja.zrobione && sesja.zrobione[id]; }).length;
      const naglowekBloku = document.createElement("div");
      naglowekBloku.className = "dzis-blok-naglowek";
      naglowekBloku.appendChild(tekstElement("b", "", blok ? blok.nazwa.replace(/\s*\(.*\)\s*$/, "") : tytul));
      naglowekBloku.appendChild(tekstElement("span", "opis", zr + " z " + lista.length));
      karta.appendChild(naglowekBloku);
      const pojemnik = document.createElement("div");
      pojemnik.className = "dzis-blok";
      lista.forEach(function (id) {
        pojemnik.appendChild(zrobWierszCwiczenia(sesja, id, true));
      });
      karta.appendChild(pojemnik);
    };

    dodajBlok("Rozgrzewka", sesja.blokPrzedId, przed);

    const glowne = document.createElement("div");
    glowne.className = "dzis-glowne";
    ids.forEach(function (id) {
      glowne.appendChild(zrobWierszCwiczenia(sesja, id, false, plan));
    });
    karta.appendChild(glowne);

    if (ids.length === 0) {
      karta.appendChild(tekstElement("p", "opis", "Ten trening nie ma ćwiczeń z parametrami."));
    }

    dodajBlok("Rozciąganie po treningu", sesja.blokPoId, po);
  } else {
    const cel = opisCeluSesji(sesja);
    if (sesja.wynik) {
      karta.appendChild(tekstElement("div", "karta-opis", "Cel: " + cel));
      karta.appendChild(tekstElement("div", "dzis-wynik", "Wynik: " + opisCeluSesji(sesja.wynik)));
    } else {
      karta.appendChild(tekstElement("div", "karta-opis", "Cel: " + cel));
    }
    if (sesja.notatka) {
      karta.appendChild(tekstElement("div", "karta-opis", sesja.notatka));
    }
    const bieg = aktywnosc && aktywnosc.rodzajId === "rodzaj-bieganie";
    if (bieg && sesja.wynikSzkic && !sesja.wynik) {
      karta.appendChild(tekstElement("div", "dzis-wynik", "Niezapisany bieg: " + opisCeluSesji(sesja.wynikSzkic)));
    }
    if (bieg && sesja.wynikSzkic && !sesja.wynik) {
      const odrzuc = tekstElement("button", "akcja usun", "Odrzuć pomiar");
      odrzuc.type = "button";
      odrzuc.addEventListener("click", function () {
        if (confirm("Odrzucić zmierzony bieg? Tego nie da się cofnąć.")) {
          if (sesja.wynikSzkic && sesja.wynikSzkic.trasaId) {
            gpsUsunTrase(sesja.wynikSzkic.trasaId);
          }
          delete sesja.wynikSzkic;
          zapiszDane();
          rysujDzis();
        }
      });
      karta.appendChild(odrzuc);
    }
    if (bieg && !sesja.wynik && !sesja.wynikSzkic) {
      const start = tekstElement("button", "przycisk wielki bieg-start", "▶ Start");
      start.type = "button";
      start.addEventListener("click", function () {
        biegStart(plan, sesja);
      });
      karta.appendChild(start);
      const import_ = tekstElement("button", "akcja bieg-import", "Wczytaj bieg z pliku GPX (zegarek, inna aplikacja)");
      import_.type = "button";
      import_.addEventListener("click", function () { gpsImportuj(plan, sesja); });
      karta.appendChild(import_);
    }
    const przycisk = document.createElement("button");
    przycisk.className = "przycisk wielki" + (sesja.wynik || (bieg && !sesja.wynikSzkic) ? " drugi" : "");
    przycisk.textContent = sesja.wynik ? "Zmień wynik" : bieg && sesja.wynikSzkic ? "Zapisz wynik biegu" : bieg ? "Wpisz wynik ręcznie" : "Wpisz wynik";
    przycisk.addEventListener("click", function () {
      otworzWynik(plan, sesja);
    });
    karta.appendChild(przycisk);
  }

  return karta;
}

function zrobWierszCwiczenia(sesja, id, wBloku, plan_) {
  const cwiczenie = znajdzCwiczenie(id);
  const zrobione = !!(sesja.zrobione || {})[id];
  const plan = sesja.parametry[id];
  const wykonane = zrobione && sesja.wykonane ? sesja.wykonane[id] : null;

  const wiersz = document.createElement("div");
  wiersz.className = "cw-wiersz";
  wiersz.setAttribute("data-id", id);

  const odhacz = document.createElement("button");
  odhacz.className = "odhacz" + (zrobione ? " zrobione" : "");
  odhacz.textContent = zrobione ? "✓" : "";
  odhacz.setAttribute("aria-pressed", zrobione ? "true" : "false");
  odhacz.setAttribute("aria-label", (zrobione ? "Cofnij: " : "Zrobione: ") + cwiczenie.nazwa);
  odhacz.addEventListener("click", function () {
    if (!sesja.zrobione) {
      sesja.zrobione = {};
    }
    sesja.zrobione[id] = !sesja.zrobione[id];
    if (!sesja.zrobione[id] && sesja.wykonane) {
      delete sesja.wykonane[id];
    }
    zapiszDane();
    rysujDzis();
    if (sesja.zrobione[id]) {
      setTimeout(function () {
        sprawdzRekord(sesja, id);
      }, 50);
    }
  });
  wiersz.appendChild(odhacz);

  const tekst = document.createElement("div");
  tekst.className = "karta-tekst";
  tekst.appendChild(tekstElement("div", "karta-nazwa", cwiczenie.nazwa));
  if (plan_ && plan_.celeOpisy && plan_.celeOpisy[id] && !wBloku) {
    tekst.appendChild(tekstElement("div", "cel-opis-dzis", "★ " + plan_.celeOpisy[id]));
  }
  const opis = tekstElement("button", "wartosc-przycisk", opisIlosci(wykonane || plan, znajdzCwiczenie(id)));
  opis.setAttribute("aria-label", "Wpisz inną wartość: " + cwiczenie.nazwa);
  opis.addEventListener("click", function () {
    otworzWartosc(sesja, id);
  });
  tekst.appendChild(opis);

  const ostatnio = tekstOstatnio(id, sesja.id);
  if (ostatnio) {
    tekst.appendChild(tekstElement("div", "ostatnio-info", ostatnio));
  }
  if (zrobione && !wBloku) {
    tekst.appendChild(ocenaPasek(sesja, id));
  }

  if (cwiczenie.rekord) {
    tekst.appendChild(tekstElement("div", "ostatnio-info", "★ Rekord: " + opisRekordu(cwiczenie.rekord)));
  }

  if (wykonane) {
    const roznica = opisRoznicy(plan, wykonane);
    if (roznica) {
      tekst.appendChild(tekstElement("div", "etykieta " + (roznica.wiecej ? "ponad" : "ponizej"), roznica.wiecej ? roznica.tekst : "plan " + opisIlosci(plan, cwiczenie) + " · " + roznica.tekst));
    }
  }
  wiersz.appendChild(tekst);

  dodajFilm(wiersz, cwiczenie);
  if (!wBloku && plan_ && !zrobione && typeof otworzZamiane === "function" && !(sesja.przebieg && sesja.przebieg.wyniki && sesja.przebieg.wyniki[id])) {
    const zamien = document.createElement("button");
    zamien.className = "zamien";
    zamien.textContent = "⇄";
    zamien.setAttribute("aria-label", "Zamień ćwiczenie: " + cwiczenie.nazwa);
    zamien.addEventListener("click", function () {
      otworzZamiane(plan_, sesja, id);
    });
    wiersz.appendChild(zamien);
  }
  if (!wBloku) {
    wiersz.appendChild(zrobUchwyt(sesja, wiersz));
  }
  return wiersz;
}

// Uchwyt "⋮⋮": przytrzymaj i przeciągnij palcem, żeby zmienić kolejność ćwiczeń w sesji
function zrobUchwyt(sesja, wiersz) {
  const uchwyt = document.createElement("button");
  uchwyt.className = "uchwyt";
  uchwyt.textContent = "⋮⋮";
  uchwyt.setAttribute("aria-label", "Przeciągnij, aby zmienić kolejność");

  // Zdarzenia śledzimy na całym dokumencie: przesunięcie wiersza w DOM zrywa przechwycenie wskaźnika
  const ruch = function (zdarzenie) {
    const cel = document.elementFromPoint(zdarzenie.clientX, zdarzenie.clientY);
    const inny = cel ? cel.closest(".cw-wiersz") : null;
    if (!inny || inny === wiersz || inny.parentNode !== wiersz.parentNode) {
      return;
    }
    const ramka = inny.getBoundingClientRect();
    const wGorze = zdarzenie.clientY < ramka.top + ramka.height / 2;
    wiersz.parentNode.insertBefore(wiersz, wGorze ? inny : inny.nextSibling);
  };
  const koniec = function () {
    document.removeEventListener("pointermove", ruch);
    document.removeEventListener("pointerup", koniec);
    document.removeEventListener("pointercancel", koniec);
    sesja.kolejnosc = Array.from(wiersz.parentNode.querySelectorAll(".cw-wiersz")).map(function (w) {
      return w.getAttribute("data-id");
    });
    zapiszDane();
    rysujDzis();
  };
  uchwyt.addEventListener("pointerdown", function (zdarzenie) {
    wiersz.classList.add("przeciagany");
    document.addEventListener("pointermove", ruch);
    document.addEventListener("pointerup", koniec);
    document.addEventListener("pointercancel", koniec);
    zdarzenie.preventDefault();
  });
  return uchwyt;
}

// Adnotacja "Ostatnio (22.10): 4 × 8 · 60 kg" z najnowszego wcześniejszego wykonania ćwiczenia
// (szukamy we wszystkich planach, także zakończonych); pusty tekst, gdy go jeszcze nie robiono
function tekstOstatnio(id, pomijanaSesjaId) {
  let najnowsza = null;
  dane.plany.forEach(function (plan) {
    plan.sesje.forEach(function (s) {
      if (s.id === pomijanaSesjaId || !s.zrobione || !s.zrobione[id] || !s.parametry || !s.parametry[id]) {
        return;
      }
      const data = dataPlanu(plan, s.dzien);
      if (!najnowsza || data > najnowsza.data) {
        najnowsza = { data: data, ilosc: (s.wykonane && s.wykonane[id]) || s.parametry[id] };
      }
    });
  });
  if (!najnowsza) {
    return "";
  }
  const d = najnowsza.data;
  const dzien = String(d.getDate()).padStart(2, "0") + "." + String(d.getMonth() + 1).padStart(2, "0");
  return "Ostatnio (" + dzien + "): " + opisIlosci(najnowsza.ilosc);
}

// ===== Porównanie wykonanej wartości z planem =====

function sekundyZ(wartosc, jednostka) {
  return jednostka === "min" ? wartosc * 60 : wartosc;
}

// Powtórzenia w kolejnych seriach, np. [12, 10, 8]; dla zwykłego "3 × 10" to [10, 10, 10]
function listaPowtorzen(ilosc) {
  if (ilosc.typ === "serie-lista") {
    return ilosc.powtorzenia;
  }
  return powtorzeniaSerii(ilosc);
}

// Czy ilość to serie z powtórzeniami (zwykłe albo różne w seriach)
function czyPowtorzenia(ilosc) {
  return ilosc.typ === "powtorzenia" || ilosc.typ === "serie-lista";
}

// Trening statyczny: czasy w kolejnych seriach i ich jednostka
function listaCzasow(ilosc) {
  if (ilosc.typ === "czas-serie") {
    return ilosc.czasy;
  }
  const lista = [];
  for (let i = 0; i < ilosc.powtorzenia; i++) {
    lista.push(ilosc.czas.wartosc);
  }
  return lista;
}

function jednostkaCzasu(ilosc) {
  return ilosc.typ === "czas-serie" ? ilosc.jednostka : ilosc.czas.jednostka;
}

function czyStatyczne(ilosc) {
  return ilosc.typ === "czas-powtorzenia" || ilosc.typ === "czas-serie";
}

// Rodzaj miary: "powt", "czas" albo "stat" (do porównywania rekordów)
function rodzinaIlosci(ilosc) {
  if (czyPowtorzenia(ilosc)) {
    return "powt";
  }
  return czyStatyczne(ilosc) ? "stat" : "czas";
}

// Jedna liczba opisująca "ile pracy": powtórzenia razem albo sekundy
function miaraIlosci(ilosc) {
  if (ilosc.typ === "serie-lista") {
    return ilosc.powtorzenia.reduce(function (suma, p) {
      return suma + p;
    }, 0);
  }
  if (ilosc.typ === "powtorzenia") {
    return powtorzeniaSerii(ilosc).reduce(function (suma, p) { return suma + p; }, 0);
  }
  if (ilosc.typ === "czas") {
    return sekundyZ(ilosc.wartosc, ilosc.jednostka);
  }
  if (ilosc.typ === "czas-serie") {
    return ilosc.czasy.reduce(function (suma, c) {
      return suma + sekundyZ(c, ilosc.jednostka);
    }, 0);
  }
  return ilosc.powtorzenia * sekundyZ(ilosc.czas.wartosc, ilosc.czas.jednostka);
}

// Stosunek wykonania do planu (1 = zgodnie z planem)
function stosunekIlosci(plan, wykonane) {
  const m = miaraIlosci(plan);
  return m > 0 ? miaraIlosci(wykonane) / m : 1;
}

// Krótki opis różnicy, np. "−2 powt." albo "+10 s"; null, gdy bez różnicy
function opisRoznicy(plan, wykonane) {
  const roznica = miaraIlosci(wykonane) - miaraIlosci(plan);
  if (roznica === 0) {
    return null;
  }
  const znak = roznica > 0 ? "+" : "−";
  const ile = Math.abs(roznica);
  let tekst;
  let dopisek = "";
  if (czyPowtorzenia(plan)) {
    tekst = znak + ile + " powt. łącznie";
    if (plan.typ === "powtorzenia" && wykonane.typ === "powtorzenia") {
      dopisek = " (" + wykonane.serie + " × " + wykonane.powtorzenia + " zamiast " + plan.serie + " × " + plan.powtorzenia + ")";
    }
  } else if (plan.typ === "czas") {
    tekst = znak + (Math.round(ile * 10) / 10) + " s";
  } else {
    tekst = znak + (Math.round(ile * 10) / 10) + " s łącznie";
  }
  if (roznica > 0) {
    return { wiecej: true, tekst: tekst + " ponad plan" + dopisek };
  }
  return { wiecej: false, tekst: tekst + dopisek };
}

// Czy w zaliczonej sesji treningowej jakieś ćwiczenie zrobiono poniżej planu
function sesjaPonizejPlanu(sesja) {
  const wykonane = sesja.wykonane || {};
  return Object.keys(wykonane).some(function (id) {
    return sesja.parametry[id] && stosunekIlosci(sesja.parametry[id], wykonane[id]) < 1;
  });
}

// ===== Okno wartości ćwiczenia =====

const wartTlo = document.getElementById("wart-tlo");
const wartTytul = document.getElementById("wart-tytul");
const wartPlan = document.getElementById("wart-plan");
const wartPola = document.getElementById("wart-pola");
const wartInfo = document.getElementById("wart-info");
const wartZapisz = document.getElementById("wart-zapisz");
const wartAnuluj = document.getElementById("wart-anuluj");
const wartCofnij = document.getElementById("wart-cofnij");

let wartSesja = null;
let wartId = null;
let wartPolaDane = [];
let wartTryb = "jednolite"; // "lista": powtórzenia osobno dla każdej serii
let wartZCiezarem = false; // czy ćwiczenie ma pola ciężaru
let wartCiezary = []; // pola ciężaru: jedno (tryb jednolity) albo po jednym na serię

// Jedno pole z przyciskami − i +
function zrobStepper(etykieta, wartosc, krok) {
  const blok = document.createElement("div");
  blok.className = "wart-blok";
  blok.appendChild(tekstElement("div", "wart-etykieta", etykieta));
  const rzad = document.createElement("div");
  rzad.className = "wart-stepper";
  const mniej = tekstElement("button", "", "−");
  mniej.setAttribute("aria-label", "Mniej: " + etykieta);
  const pole = document.createElement("input");
  pole.type = "number";
  pole.inputMode = "decimal";
  pole.min = "0";
  pole.step = String(krok);
  pole.value = String(wartosc);
  const wiecej = tekstElement("button", "", "+");
  wiecej.setAttribute("aria-label", "Więcej: " + etykieta);
  mniej.addEventListener("click", function () {
    pole.value = String(Math.max(0, Math.round((Number(pole.value) - krok) * 10) / 10));
    odswiezWartInfo();
  });
  wiecej.addEventListener("click", function () {
    pole.value = String(Math.round((Number(pole.value) + krok) * 10) / 10);
    odswiezWartInfo();
  });
  pole.addEventListener("input", odswiezWartInfo);
  rzad.appendChild(mniej);
  rzad.appendChild(pole);
  rzad.appendChild(wiecej);
  blok.appendChild(rzad);
  return { blok: blok, pole: pole };
}

// Składa wykonaną ilość z pól okna; null, gdy wartości są błędne
function odczytajWartosc(plan) {
  const wynik = odczytajWartoscBaza(plan);
  if (wynik === null || !wartZCiezarem || liczbaSerii(wynik) < 1) {
    return wynik;
  }
  const n = liczbaSerii(wynik);
  const c = wartCiezary.map(function (p) {
    return Number(p.pole.value);
  });
  if (c.some(function (x) { return !(x >= 0); })) {
    return null;
  }
  const lista = wartTryb === "lista" ? c.slice(0, n) : new Array(n).fill(c[0] || 0);
  while (lista.length < n) {
    lista.push(lista.length > 0 ? lista[lista.length - 1] : 0);
  }
  if (lista.some(function (x) { return x > 0; })) {
    wynik.ciezary = lista;
  }
  return wynik;
}

function odczytajWartoscBaza(plan) {
  const v = wartPolaDane.map(function (p) {
    return Number(p.pole.value);
  });
  if (czyPowtorzenia(plan) && wartTryb === "lista") {
    const poprawne = v.length >= 1 && v.every(function (x) {
      return x >= 1 && Math.floor(x) === x;
    });
    if (!poprawne) {
      return null;
    }
    const takie = v.every(function (x) {
      return x === v[0];
    });
    return takie ? { typ: "powtorzenia", serie: v.length, powtorzenia: v[0] } : { typ: "serie-lista", powtorzenia: v };
  }
  if (plan.typ === "powtorzenia") {
    if (!(v[0] >= 1) || !(v[1] >= 1) || Math.floor(v[0]) !== v[0] || Math.floor(v[1]) !== v[1]) {
      return null;
    }
    return { typ: "powtorzenia", serie: v[0], powtorzenia: v[1] };
  }
  if (plan.typ === "czas") {
    if (!(v[0] > 0)) {
      return null;
    }
    return { typ: "czas", wartosc: v[0], jednostka: plan.jednostka };
  }
  const jednostka = jednostkaCzasu(plan);
  if (wartTryb === "lista") {
    if (v.length < 1 || !v.every(function (x) { return x > 0; })) {
      return null;
    }
    const jednakowe = v.every(function (x) { return x === v[0]; });
    return jednakowe
      ? { typ: "czas-powtorzenia", powtorzenia: v.length, czas: { wartosc: v[0], jednostka: jednostka } }
      : { typ: "czas-serie", czasy: v, jednostka: jednostka };
  }
  if (!(v[0] >= 1) || Math.floor(v[0]) !== v[0] || !(v[1] > 0)) {
    return null;
  }
  return { typ: "czas-powtorzenia", powtorzenia: v[0], czas: { wartosc: v[1], jednostka: jednostka } };
}

function odswiezWartInfo() {
  const plan = wartSesja.parametry[wartId];
  const wynik = odczytajWartosc(plan);
  wartZapisz.disabled = wynik === null;
  wartInfo.className = "wart-info";
  if (wynik === null) {
    wartInfo.textContent = "Wpisz wartości większe od zera.";
    return;
  }
  const roznica = opisRoznicy(plan, wynik);
  if (!roznica) {
    const innyCiezar = JSON.stringify(ciezaryIlosci(plan)) !== JSON.stringify(ciezaryIlosci(wynik));
    wartInfo.textContent = innyCiezar ? "Ciężar inny niż w planie." : "Zgodnie z planem.";
  } else if (roznica.wiecej) {
    wartInfo.className = "wart-info ponad";
    wartInfo.textContent = "To " + roznica.tekst + ". Brawo!";
  } else {
    wartInfo.className = "wart-info ponizej";
    wartInfo.textContent = "To " + roznica.tekst.replace("−", "") + " mniej niż w planie. Ćwiczenie i tak się zalicza. Wynik zobaczysz w Postępie.";
  }
}

function otworzWartosc(sesja, id) {
  const plan = sesja.parametry[id];
  const start = (sesja.zrobione && sesja.zrobione[id] && sesja.wykonane && sesja.wykonane[id]) || plan;
  wartSesja = sesja;
  wartId = id;
  wartTytul.textContent = znajdzCwiczenie(id).nazwa;
  wartPlan.textContent = "Zaplanowano: " + opisIlosci(plan, znajdzCwiczenie(id)) + (jednostronne(znajdzCwiczenie(id)) ? " (powtórzenia robisz na każdą stronę osobno)" : "");
  wartPola.innerHTML = "";
  wartPolaDane = [];
  wartCiezary = [];
  wartZCiezarem = !!znajdzCwiczenie(id).zCiezarem && liczbaSerii(plan) > 0;
  const ciezaryStart = ciezaryIlosci(start).length > 0 ? ciezaryIlosci(start) : ciezaryIlosci(plan);
  const rozneCiezary = ciezaryStart.some(function (c) { return c !== ciezaryStart[0]; });
  wartTryb = plan.typ === "serie-lista" || start.typ === "serie-lista" || (czyPowtorzenia(start) && listaPowtorzen(start).some(function (x, i, l) { return x !== l[0]; })) || (wartZCiezarem && rozneCiezary) ? "lista" : "jednolite";
  if (czyPowtorzenia(plan)) {
    wartStart = start;
    narysujPolaPowtorzen(listaPowtorzen(start), ciezaryStart);
    return koniecOtwarciaWartosci(sesja, id);
  } else if (plan.typ === "czas") {
    wartPolaDane.push(zrobStepper("Czas (" + plan.jednostka + ")", start.wartosc, plan.jednostka === "min" ? 1 : 5));
  } else {
    wartTryb = plan.typ === "czas-serie" || start.typ === "czas-serie" || (wartZCiezarem && rozneCiezary) ? "lista" : "jednolite";
    narysujPolaCzasow(listaCzasow(start), jednostkaCzasu(plan), ciezaryStart);
    return koniecOtwarciaWartosci(sesja, id);
  }
  wartPolaDane.forEach(function (p) {
    wartPola.appendChild(p.blok);
  });
  koniecOtwarciaWartosci(sesja, id);
}

function koniecOtwarciaWartosci(sesja, id) {
  wartCofnij.hidden = !(sesja.zrobione && sesja.zrobione[id]);
  odswiezWartInfo();
  wartTlo.hidden = false;
}

let wartStart = null;

// Trening statyczny: dwa pola (powtórzenia i czas jednego) albo osobny czas dla każdej serii
function narysujPolaCzasow(czasy, jednostka, ciezary) {
  ciezary = ciezary || [];
  const krok = jednostka === "min" ? 1 : 5;
  wartPola.innerHTML = "";
  wartPolaDane = [];
  wartCiezary = [];
  if (wartTryb === "jednolite") {
    wartPolaDane.push(zrobStepper("Powtórzenia", czasy.length, 1));
    wartPolaDane.push(zrobStepper("Czas jednego (" + jednostka + ")", czasy[0], krok));
    wartPolaDane.forEach(function (p) {
      wartPola.appendChild(p.blok);
    });
    if (wartZCiezarem) {
      wartCiezary.push(zrobStepper(etykietaCiezaru(znajdzCwiczenie(wartId)), ciezary[0] || 0, 2.5));
      wartPola.appendChild(wartCiezary[0].blok);
    }
    const rozpisz = tekstElement("button", "akcja", wartZCiezarem ? "Różne czasy i ciężary w seriach" : "Różne czasy w seriach");
    rozpisz.type = "button";
    rozpisz.addEventListener("click", function () {
      const serie = Math.max(1, Number(wartPolaDane[0].pole.value) || 1);
      const czas = Number(wartPolaDane[1].pole.value) || krok;
      const kg = wartCiezary.length > 0 ? Number(wartCiezary[0].pole.value) || 0 : 0;
      wartTryb = "lista";
      narysujPolaCzasow(new Array(serie).fill(czas), jednostka, new Array(serie).fill(kg));
      odswiezWartInfo();
    });
    wartPola.appendChild(rozpisz);
    return;
  }
  czasy.forEach(function (ile, i) {
    const p = zrobStepper("Seria " + (i + 1) + " (" + jednostka + ")", ile, krok);
    wartPolaDane.push(p);
    if (wartZCiezarem) {
      const kg = zrobStepper("Ciężar serii " + (i + 1) + " (kg)", i < ciezary.length ? ciezary[i] : (ciezary.length > 0 ? ciezary[ciezary.length - 1] : 0), 2.5);
      wartCiezary.push(kg);
      const rzadSerii = document.createElement("div");
      rzadSerii.className = "wart-seria-rzad";
      rzadSerii.appendChild(p.blok);
      rzadSerii.appendChild(kg.blok);
      wartPola.appendChild(rzadSerii);
    } else {
      wartPola.appendChild(p.blok);
    }
  });
  const rzad = document.createElement("div");
  rzad.className = "wart-serie-akcje";
  const odczytaj = function () {
    return wartPolaDane.map(function (p) {
      return Number(p.pole.value) || 0;
    });
  };
  const odczytajKg = function () {
    return wartCiezary.map(function (p) {
      return Number(p.pole.value) || 0;
    });
  };
  const dodaj = tekstElement("button", "akcja", "+ seria");
  dodaj.type = "button";
  dodaj.addEventListener("click", function () {
    const lista = odczytaj();
    const kgLista = odczytajKg();
    lista.push(lista.length > 0 ? lista[lista.length - 1] || krok : krok);
    kgLista.push(kgLista.length > 0 ? kgLista[kgLista.length - 1] : 0);
    narysujPolaCzasow(lista, jednostka, kgLista);
    odswiezWartInfo();
  });
  const usun = tekstElement("button", "akcja usun", "− seria");
  usun.type = "button";
  usun.disabled = czasy.length <= 1;
  usun.addEventListener("click", function () {
    const lista = odczytaj();
    const kgLista = odczytajKg();
    lista.pop();
    kgLista.pop();
    narysujPolaCzasow(lista, jednostka, kgLista);
    odswiezWartInfo();
  });
  rzad.appendChild(dodaj);
  rzad.appendChild(usun);
  wartPola.appendChild(rzad);
}

// Pola powtórzeń: dwa pola (serie i powtórzenia) albo osobne pole dla każdej serii
function narysujPolaPowtorzen(powtorzenia, ciezary) {
  ciezary = ciezary || [];
  wartPola.innerHTML = "";
  wartPolaDane = [];
  wartCiezary = [];
  if (wartTryb === "jednolite") {
    wartPolaDane.push(zrobStepper("Serie", powtorzenia.length, 1));
    wartPolaDane.push(zrobStepper("Powtórzenia", powtorzenia[0], 1));
    wartPolaDane.forEach(function (p) {
      wartPola.appendChild(p.blok);
    });
    if (wartZCiezarem) {
      wartCiezary.push(zrobStepper(etykietaCiezaru(znajdzCwiczenie(wartId)), ciezary[0] || 0, 2.5));
      wartPola.appendChild(wartCiezary[0].blok);
    }
    const rozpisz = tekstElement("button", "akcja", wartZCiezarem ? "Różne powtórzenia i ciężary w seriach" : "Różne powtórzenia w seriach");
    rozpisz.type = "button";
    rozpisz.addEventListener("click", function () {
      const serie = Math.max(1, Number(wartPolaDane[0].pole.value) || 1);
      const powt = Math.max(1, Number(wartPolaDane[1].pole.value) || 1);
      const kg = wartCiezary.length > 0 ? Number(wartCiezary[0].pole.value) || 0 : 0;
      const lista = [];
      const kgLista = [];
      for (let i = 0; i < serie; i++) {
        lista.push(powt);
        kgLista.push(kg);
      }
      wartTryb = "lista";
      narysujPolaPowtorzen(lista, kgLista);
      odswiezWartInfo();
    });
    wartPola.appendChild(rozpisz);
    return;
  }
  powtorzenia.forEach(function (ile, i) {
    const p = zrobStepper("Seria " + (i + 1), ile, 1);
    wartPolaDane.push(p);
    if (wartZCiezarem) {
      const kg = zrobStepper("Ciężar serii " + (i + 1) + " (kg)", i < ciezary.length ? ciezary[i] : (ciezary.length > 0 ? ciezary[ciezary.length - 1] : 0), 2.5);
      wartCiezary.push(kg);
      const rzadSerii = document.createElement("div");
      rzadSerii.className = "wart-seria-rzad";
      rzadSerii.appendChild(p.blok);
      rzadSerii.appendChild(kg.blok);
      wartPola.appendChild(rzadSerii);
    } else {
      wartPola.appendChild(p.blok);
    }
  });
  const rzad = document.createElement("div");
  rzad.className = "wart-serie-akcje";
  const dodaj = tekstElement("button", "akcja", "+ seria");
  dodaj.type = "button";
  const odczytajKgP = function () {
    return wartCiezary.map(function (p) {
      return Number(p.pole.value) || 0;
    });
  };
  dodaj.addEventListener("click", function () {
    const lista = wartPolaDane.map(function (p) {
      return Number(p.pole.value) || 0;
    });
    const kgLista = odczytajKgP();
    lista.push(lista.length > 0 ? lista[lista.length - 1] || 1 : 1);
    kgLista.push(kgLista.length > 0 ? kgLista[kgLista.length - 1] : 0);
    narysujPolaPowtorzen(lista, kgLista);
    odswiezWartInfo();
  });
  const usun = tekstElement("button", "akcja usun", "− seria");
  usun.type = "button";
  usun.disabled = powtorzenia.length <= 1;
  usun.addEventListener("click", function () {
    const lista = wartPolaDane.map(function (p) {
      return Number(p.pole.value) || 0;
    });
    const kgLista = odczytajKgP();
    lista.pop();
    kgLista.pop();
    narysujPolaPowtorzen(lista, kgLista);
    odswiezWartInfo();
  });
  rzad.appendChild(dodaj);
  rzad.appendChild(usun);
  wartPola.appendChild(rzad);
}

function zamknijWartosc() {
  wartTlo.hidden = true;
  wartSesja = null;
  wartId = null;
}

wartZapisz.addEventListener("click", function () {
  const plan = wartSesja.parametry[wartId];
  const wynik = odczytajWartosc(plan);
  if (wynik === null) {
    return;
  }
  if (!bzPotwierdz(bzUwagiIlosci(wynik))) {
    return;
  }
  if (!wartSesja.zrobione) {
    wartSesja.zrobione = {};
  }
  if (!wartSesja.wykonane) {
    wartSesja.wykonane = {};
  }
  wartSesja.zrobione[wartId] = true;
  if (miaraIlosci(wynik) === miaraIlosci(plan) && JSON.stringify(wynik) === JSON.stringify(plan)) {
    delete wartSesja.wykonane[wartId];
  } else {
    wartSesja.wykonane[wartId] = wynik;
  }
  zapiszDane();
  const sesjaRekordu = wartSesja;
  const idRekordu = wartId;
  zamknijWartosc();
  rysujDzis();
  setTimeout(function () {
    sprawdzRekord(sesjaRekordu, idRekordu);
  }, 50);
});

wartCofnij.addEventListener("click", function () {
  wartSesja.zrobione[wartId] = false;
  if (wartSesja.wykonane) {
    delete wartSesja.wykonane[wartId];
  }
  zapiszDane();
  zamknijWartosc();
  rysujDzis();
});

wartAnuluj.addEventListener("click", zamknijWartosc);
wartTlo.addEventListener("click", function (zdarzenie) {
  if (zdarzenie.target === wartTlo) {
    zamknijWartosc();
  }
});

// ===== Koniec planu =====

function rysujKoniecPlanu(plan, kontener) {
  const blok = document.createElement("div");
  blok.className = "dzis-karta koniec";
  blok.appendChild(tekstElement("div", "dzis-tytul", "Plan zakończony"));
  blok.appendChild(tekstElement("p", "opis", "Podsumowanie planu. Po zamknięciu licznik się resetuje."));

  plan.aktywnosci.forEach(function (aktywnosc) {
    const sesje = plan.sesje.filter(function (s) {
      return s.aktywnoscId === aktywnosc.id;
    });
    const zaliczone = sesje.filter(function (s) {
      return sesjaZaliczona(plan, s);
    }).length;
    const wiersz = document.createElement("div");
    wiersz.className = "dzis-postep";
    wiersz.appendChild(tekstElement("span", "", opisAktywnosci(aktywnosc).tytul));
    wiersz.appendChild(tekstElement("span", "dzis-procent", zaliczone + "/" + aktywnosc.razy));
    blok.appendChild(wiersz);
    const pasek = document.createElement("div");
    pasek.className = "pasek-postepu";
    const wypelnienie = document.createElement("div");
    wypelnienie.style.width = (aktywnosc.razy === 0 ? 0 : Math.round(zaliczone * 100 / aktywnosc.razy)) + "%";
    pasek.appendChild(wypelnienie);
    blok.appendChild(pasek);
  });

  if (plan.kreator && plan.kreator.profil && typeof pkNastepnyBlok === "function") {
    blok.appendChild(tekstElement("p", "opis", "Pokażę podsumowanie bloku i ułożę kolejny na podstawie Twoich wyników, ocen i testu możliwości. Główne ćwiczenia zostają, dodatkowe zmienią się na inne warianty."));
    const dalej = document.createElement("button");
    dalej.className = "przycisk wielki";
    dalej.textContent = "Ułóż kolejny blok";
    dalej.addEventListener("click", function () {
      if (typeof paOtworzPodsumowanie === "function") {
        paOtworzPodsumowanie(plan, function () { pkNastepnyBlok(plan); });
      } else {
        pkNastepnyBlok(plan);
      }
    });
    blok.appendChild(dalej);
  }

  const nowy = document.createElement("button");
  nowy.className = "przycisk wielki";
  nowy.textContent = "Nowy plan";
  nowy.addEventListener("click", function () {
    zamknijPlan(plan);
    otworzKreator();
  });
  blok.appendChild(nowy);

  const zamknij = document.createElement("button");
  zamknij.className = "przycisk drugi wielki";
  zamknij.textContent = "Zamknij";
  zamknij.addEventListener("click", function () {
    zamknijPlan(plan);
  });
  blok.appendChild(zamknij);

  (kontener || dzisSesje).appendChild(blok);
}

// Zamyka plan: zostaje w danych (historia), ale przestaje być aktywny
function zamknijPlan(plan) {
  plan.zamkniety = true;
  plan.zamknieto = new Date().toISOString();
  zapiszDane();
  rysujDzis();
}

// ===== Wynik biegania i basenu =====

function otworzWynik(plan, sesja) {
  const aktywnosc = aktywnoscPlanu(plan, sesja.aktywnoscId);
  wynikSesja = sesja;
  wynikRodzajId = aktywnosc.rodzajId;
  wynikProsbaODystans = false;
  wynikTytul.textContent = "Wynik: " + opisAktywnosci(aktywnosc).tytul;
  wynikBlad.textContent = "";
  wynikPola.innerHTML = "";
  const podpis = document.getElementById("wynik-podpis");
  if (podpis) {
    const sz = sesja.wynikSzkic;
    podpis.textContent = sz && sz.gps && sz.gps.import ? "Dane z pliku GPX. Popraw je, jeśli trzeba." :
      sz && sz.zrodlo === "gps" ? "Dystans policzony z GPS." + (sz.gps && sz.gps.slaby ? " Sygnał był słaby na części trasy, więc dystans mógł wyjść za mały – popraw go, jeśli znasz właściwy." : " Popraw go, jeśli trzeba.") :
      sz && sz.gps && sz.gps.brak ? "GPS nie zmierzył dystansu (za krótka trasa albo brak sygnału). Wpisz go, jeśli znasz (np. z bieżni)." :
      sz ? "Pola są wypełnione pomiarem ze stopera. Popraw je, jeśli trzeba (np. dopisz dystans z bieżni)." : sesja.wynik ? "Popraw wynik, jeśli trzeba." : "Pola są wypełnione celem z planu. Popraw je, jeśli wynik był inny.";
  }

  // Pola są wstępnie wypełnione pomiarem (stoper), wynikiem (jeśli już był) albo celem z planu
  const start = sesja.wynikSzkic || sesja.wynik || sesja;
  const kopia = {
    styl: start.styl,
    etapy: start.etapy,
    cwiczenieId: start.cwiczenieId,
    dlugosci: start.dlugosci,
    dystans: start.dystans,
    kroki: start.kroki,
    obciazenie: start.obciazenie,
    czas: start.czas,
    wysilek: sesja.wynik ? sesja.wynik.wysilek : null,
    zrodlo: sesja.wynikSzkic ? sesja.wynikSzkic.zrodlo : sesja.wynik ? sesja.wynik.zrodlo : null
  };
  if (!sesja.wynikSzkic && !sesja.wynik && sesja.odcinki && sesja.odcinki.length) {
    // Wynik ręczny sesji z odcinkami: podpowiadamy sumę odcinków
    const suma = biegSumaOdcinkow(sesja.odcinki);
    kopia.czas = suma.czasS ? { wartosc: suma.czasS, jednostka: "s" } : null;
    kopia.dystans = suma.dystansM ? { wartosc: suma.dystansM / 1000, jednostka: "km" } : null;
  }
  if (sesja.wynikSzkic) {
    kopia.dystans = sesja.wynikSzkic.dystans;
    kopia.odcinkiWyniki = sesja.wynikSzkic.odcinkiWyniki;
  } else if (sesja.wynik && sesja.wynik.odcinkiWyniki) {
    kopia.odcinkiWyniki = sesja.wynik.odcinkiWyniki;
  }
  if (aktywnosc.rodzajId === "rodzaj-bieganie" && sesja.rodzajBiegu) {
    wynikTytul.textContent += " · " + biegRodzaj(sesja.rodzajBiegu).nazwa.toLowerCase();
  }
  const wpis = zrobKarteSesji(kopia, aktywnosc, { wynik: true });
  wynikOdczyt = wpis.odczytaj;
  wynikPola.appendChild(wpis.karta);
  wynikTlo.hidden = false;
}

function zamknijWynik() {
  wynikTlo.hidden = true;
  wynikSesja = null;
  wynikOdczyt = null;
}

let wynikProsbaODystans = false;

function zapiszWynik() {
  const wynik = wynikOdczyt();
  if (wynik === null) {
    wynikBlad.textContent = "Popraw zaznaczone pole.";
    return;
  }
  if (!bzPotwierdz(bzUwagiWyniku(wynik, wynikRodzajId))) {
    return;
  }
  // Bieg bez dystansu, a krok ścieżki go wymaga: raz prosimy o dystans (drugie „Zapisz” zapisuje bez niego)
  if (wynikRodzajId === "rodzaj-bieganie" && !wynik.dystans && !wynikProsbaODystans && typeof celeBiegBrakDystansu === "function") {
    const krok = celeBiegBrakDystansu(wynikSesja, Object.assign({}, wynik, { pauzy: wynikSesja.wynikSzkic ? wynikSesja.wynikSzkic.pauzy : 0 }));
    if (krok) {
      wynikProsbaODystans = true;
      wynikBlad.textContent = "Wpisz dystans, a ten bieg może zaliczyć krok „" + krok.nazwa + "”. Bez dystansu naciśnij „Zapisz” jeszcze raz.";
      return;
    }
  }
  const szkic = wynikSesja.wynikSzkic || null;
  if (szkic) {
    wynik.pauzy = szkic.pauzy;
    wynik.czasPauzS = szkic.czasPauzS;
    if (szkic.trasaId) {
      wynik.trasaId = szkic.trasaId;
      wynik.gps = szkic.gps;
    }
    delete wynikSesja.wynikSzkic;
  }
  wynikSesja.wynik = wynik;
  wynikSesja.dataWykonania = szkic && szkic.dataBiegu ? szkic.dataBiegu : dzisISO();
  zapiszDane();
  const rodzajWyniku = wynikRodzajId;
  if (rodzajWyniku === "rodzaj-bieganie" && typeof celeSprawdzBieg === "function") {
    try { celeSprawdzBieg(wynikSesja, wynik); } catch (blad) { console.error(blad); }
  }
  zamknijWynik();
  rysujDzis();
  setTimeout(function () {
    sprawdzRekordDystansu(rodzajWyniku, wynik);
  }, 50);
}

wynikZapisz.addEventListener("click", zapiszWynik);
wynikAnuluj.addEventListener("click", zamknijWynik);
wynikTlo.addEventListener("click", function (zdarzenie) {
  if (zdarzenie.target === wynikTlo) {
    zamknijWynik();
  }
});

dzisEdytujPlan.addEventListener("click", function () {
  const plan = aktywnyPlan();
  if (plan) {
    otworzKreator(plan);
  }
});


// ===== Własna ocena ćwiczenia: łatwo / w sam raz / ciężko (sesja.ocena[id]) =====
const OCENY = [["latwo", "Łatwo"], ["wsam", "W sam raz"], ["ciezko", "Ciężko"]];

function ocenaPasek(sesja, id) {
  const rzad = document.createElement("div");
  rzad.className = "ocena-pasek";
  const pytanie = document.createElement("span");
  pytanie.className = "ocena-pytanie";
  pytanie.textContent = "Jak poszło?";
  rzad.appendChild(pytanie);
  const przyciski = [];
  OCENY.forEach(function (o) {
    const p = document.createElement("button");
    p.type = "button";
    p.className = "ocena-przycisk";
    p.setAttribute("data-ocena", o[0]);
    p.textContent = o[1];
    const odswiez = function () {
      const wybrana = sesja.ocena && sesja.ocena[id] === o[0];
      p.classList.toggle("wybrana", !!wybrana);
      p.setAttribute("aria-pressed", wybrana ? "true" : "false");
    };
    przyciski.push(odswiez);
    odswiez();
    p.addEventListener("click", function () {
      if (!sesja.ocena) {
        sesja.ocena = {};
      }
      if (sesja.ocena[id] === o[0]) {
        delete sesja.ocena[id];
      } else {
        sesja.ocena[id] = o[0];
      }
      zapiszDane();
      przyciski.forEach(function (f) { f(); });
    });
    rzad.appendChild(p);
  });
  return rzad;
}
