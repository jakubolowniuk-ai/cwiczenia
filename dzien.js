// ===== Dopasowanie dzisiejszego treningu i karty na „Dziś” =====
// Skróć trening, słabszy dzień, tydzień lżej, stagnacja, podsumowanie tygodnia, ostrzeżenie „ciężkie nogi przed długim biegiem”.
// Zmiana dotyczy tylko jednego treningu (dnia): oryginał zapisuje się w sesja.zmianaDnia.oryginal i „Przywróć” go odtwarza.
// Zestaw ćwiczeń ani inne dni planu się nie zmieniają. Każdą propozycję można odrzucić jednym dotknięciem.

// ----- Daty i plany -----

function dnISO(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function dnPlusDni(iso, n) {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + n);
  return dnISO(d);
}

function dnAktywnePlany() {
  return (dane.plany || []).filter(function (p) { return !p.wylaczony; });
}

// Sesje wszystkich aktywnych planów z datą: [{ plan, sesja, data }]
function dnSesje() {
  const wynik = [];
  dnAktywnePlany().forEach(function (plan) {
    plan.sesje.forEach(function (s) {
      wynik.push({ plan: plan, sesja: s, data: dataSesjiISO(plan, s) });
    });
  });
  return wynik;
}

function dnRozpoczeta(s) {
  const zrobione = s.zrobione && Object.keys(s.zrobione).some(function (k) { return s.zrobione[k]; });
  const serie = s.przebieg && s.przebieg.wyniki && Object.keys(s.przebieg.wyniki).length > 0;
  return !!(zrobione || serie);
}

// ----- Zmiana jednego treningu (z możliwością przywrócenia) -----

function dnZapamietajOryginal(sesja) {
  if (!sesja.zmianaDnia) {
    sesja.zmianaDnia = {
      typy: [],
      opis: [],
      oryginal: {
        parametry: JSON.parse(JSON.stringify(sesja.parametry || {})),
        treningId: sesja.treningId,
        kolejnosc: sesja.kolejnosc ? sesja.kolejnosc.slice() : null,
        przerwaMnoznik: sesja.przerwaMnoznik || null
      }
    };
  }
  return sesja.zmianaDnia;
}

function dnDopiszZmiane(sesja, typ, opis) {
  const z = dnZapamietajOryginal(sesja);
  if (z.typy.indexOf(typ) === -1) {
    z.typy.push(typ);
  }
  z.opis = z.opis.concat(opis);
}

function dnPrzywroc(sesja) {
  const z = sesja.zmianaDnia;
  if (!z) {
    return;
  }
  sesja.parametry = z.oryginal.parametry;
  sesja.treningId = z.oryginal.treningId;
  if (z.oryginal.kolejnosc) {
    sesja.kolejnosc = z.oryginal.kolejnosc;
  } else {
    delete sesja.kolejnosc;
  }
  if (z.oryginal.przerwaMnoznik) {
    sesja.przerwaMnoznik = z.oryginal.przerwaMnoznik;
  } else {
    delete sesja.przerwaMnoznik;
  }
  delete sesja.zmianaDnia;
}

// ----- Przeróbki ilości -----

function dnKopia(x) {
  return JSON.parse(JSON.stringify(x));
}

// Ilość z jedną serią mniej albo null, gdy już tylko jedna seria
function dnMniejSerii(il) {
  const k = dnKopia(il);
  if (k.typ === "powtorzenia") {
    if (!(k.serie > 1)) {
      return null;
    }
    k.serie--;
    if (Array.isArray(k.ciezary) && k.ciezary.length > k.serie) {
      k.ciezary = k.ciezary.slice(0, k.serie);
    }
    return k;
  }
  if (k.typ === "serie-lista") {
    if (!(k.powtorzenia.length > 1)) {
      return null;
    }
    k.powtorzenia.pop();
    if (Array.isArray(k.ciezary) && k.ciezary.length > k.powtorzenia.length) {
      k.ciezary = k.ciezary.slice(0, k.powtorzenia.length);
    }
    return k;
  }
  if (k.typ === "czas-serie") {
    if (!(k.czasy.length > 1)) {
      return null;
    }
    k.czasy.pop();
    return k;
  }
  if (k.typ === "czas-powtorzenia") {
    if (!(k.powtorzenia > 1)) {
      return null;
    }
    k.powtorzenia--;
    return k;
  }
  return null;
}

function dnSerie(il) {
  return il ? liczbaSerii(il) : 0;
}

// Ciężar mniejszy o ułamek (np. 0,15); sztangi i maszyny z krokiem 2,5 kg, lżejsze z krokiem 0,5 kg
function dnLzejszyKg(kg, ulamek) {
  if (!(kg > 0)) {
    return kg;
  }
  const krok = kg >= 20 ? 2.5 : 0.5;
  let nowe = Math.round(kg * (1 - ulamek) / krok) * krok;
  if (nowe >= kg) {
    nowe = kg - krok;
  }
  return Math.max(krok, nowe);
}

function dnLzejsze(il, ulamek) {
  const k = dnKopia(il);
  if (Array.isArray(k.ciezary)) {
    k.ciezary = k.ciezary.map(function (x) { return dnLzejszyKg(x, ulamek); });
  }
  return k;
}

// ----- Szacowany czas treningu -----

function dnPrzerwa(sesja, id, blokowe) {
  if (blokowe) {
    return 5;
  }
  const cw = znajdzCwiczenie(id);
  return ((cw && cw.przerwa) || dane.ustawienia.przerwa || 60) * (sesja.przerwaMnoznik || 1);
}

function dnSekundyCwiczenia(sesja, id, blokowe) {
  const il = sesja.parametry[id];
  if (!il) {
    return 0;
  }
  const serie = Math.max(1, dnSerie(il));
  let praca = 30;
  if (il.typ === "powtorzenia" || il.typ === "serie-lista") {
    const p = listaPowtorzen(il);
    praca = Math.max(15, (p.reduce(function (a, b) { return a + b; }, 0) / Math.max(1, p.length)) * 3);
    if (jednostronne(znajdzCwiczenie(id) || {})) {
      praca *= 2;
    }
  } else if (il.typ === "czas") {
    return sekundyZ(il.wartosc, il.jednostka) + 15;
  } else if (il.typ === "czas-serie") {
    const j = jednostkaCzasu(il);
    praca = listaCzasow(il).reduce(function (a, c) { return a + sekundyZ(c, j); }, 0) / serie;
  } else if (il.typ === "czas-powtorzenia") {
    praca = sekundyZ(il.czas.wartosc, il.czas.jednostka);
  }
  return serie * (praca + dnPrzerwa(sesja, id, blokowe)) + (blokowe ? 5 : 30);
}

function dnMinuty(sesja) {
  let sek = 0;
  cwiczeniaSesjiIds(sesja).forEach(function (id) { sek += dnSekundyCwiczenia(sesja, id, false); });
  idyBloku(sesja, "przed").concat(idyBloku(sesja, "po")).forEach(function (id) { sek += dnSekundyCwiczenia(sesja, id, true); });
  return Math.round(sek / 60);
}

// ----- Skróć trening -----

function dnZlozone(cw) {
  return (cw.miesnieIds || []).length >= 3 || (cw.partieIds || []).length >= 2;
}

// Zwraca { sesja (kopia do podglądu), zmiany[], minuty } – oryginał nietknięty
function dnSkroc(sesja, cel) {
  const s = dnKopia(sesja);
  s.parametry = s.parametry || {};
  const zmiany = [];
  const za_dlugo = function () { return dnMinuty(s) > cel; };
  // 1. Bez rozciągania po treningu
  const po = idyBloku(s, "po");
  if (za_dlugo() && po.length) {
    po.forEach(function (id) { delete s.parametry[id]; });
    zmiany.push("Bez rozciągania po treningu (zrób je później, jeśli znajdziesz chwilę).");
  }
  // 2. Krótka rozgrzewka: pierwsze 2 ćwiczenia
  const przed = idyBloku(s, "przed");
  if (za_dlugo() && przed.length > 2) {
    przed.slice(2).forEach(function (id) { delete s.parametry[id]; });
    zmiany.push("Krótka rozgrzewka: 2 pierwsze ćwiczenia zamiast " + przed.length + ".");
  }
  // 3. Przerwy krótsze o 25%
  if (za_dlugo()) {
    s.przerwaMnoznik = 0.75;
    zmiany.push("Przerwy krótsze o 25%.");
  }
  // 4. Bez ćwiczeń dodatkowych (od końca); ćwiczenia główne (wielostawowe) zostają
  const ids = cwiczeniaSesjiIds(s);
  let glowne = ids.filter(function (id) { return dnZlozone(znajdzCwiczenie(id)); });
  if (glowne.length < 2) {
    glowne = ids.slice(0, 2);
  }
  const pominiete = [];
  ids.slice().reverse().forEach(function (id) {
    if (za_dlugo() && glowne.indexOf(id) === -1) {
      delete s.parametry[id];
      pominiete.push(znajdzCwiczenie(id).nazwa);
    }
  });
  // 5. Po jednej serii mniej, aż się zmieści (min. 2 serie)
  const mniej = {};
  let zmiana = true;
  while (za_dlugo() && zmiana) {
    zmiana = false;
    cwiczeniaSesjiIds(s).forEach(function (id) {
      if (!za_dlugo()) {
        return;
      }
      const il = s.parametry[id];
      if (dnSerie(il) > 2) {
        const nowa = dnMniejSerii(il);
        if (nowa) {
          mniej[id] = mniej[id] || dnSerie(il);
          s.parametry[id] = nowa;
          zmiana = true;
        }
      }
    });
  }
  // 6. W ostateczności bez ostatnich ćwiczeń głównych (zostaje co najmniej jedno)
  let reszta = cwiczeniaSesjiIds(s);
  while (za_dlugo() && reszta.length > 1) {
    const id = reszta[reszta.length - 1];
    pominiete.push(znajdzCwiczenie(id).nazwa);
    delete s.parametry[id];
    reszta = cwiczeniaSesjiIds(s);
  }
  if (pominiete.length) {
    zmiany.push("Pominięte: " + pominiete.reverse().join(", ") + ".");
  }
  const opisMniej = Object.keys(mniej).filter(function (id) { return s.parametry[id]; }).map(function (id) {
    return znajdzCwiczenie(id).nazwa + " " + mniej[id] + " → " + dnSerie(s.parametry[id]);
  });
  if (opisMniej.length) {
    zmiany.push("Mniej serii: " + opisMniej.join("; ") + ".");
  }
  return { sesja: s, zmiany: zmiany, minuty: dnMinuty(s) };
}

function dnOkno(tytul) {
  const tlo = document.createElement("div");
  tlo.className = "gps-zgoda-tlo";
  tlo.setAttribute("role", "dialog");
  tlo.setAttribute("aria-label", tytul);
  const okno = document.createElement("div");
  okno.className = "gps-zgoda dn-okno";
  tlo.appendChild(okno);
  document.body.appendChild(tlo);
  return { tlo: tlo, okno: okno, zamknij: function () { tlo.remove(); } };
}

function dnPrzycisk(tekst, klasa, akcja) {
  const b = tekstElement("button", klasa, tekst);
  b.type = "button";
  b.addEventListener("click", akcja);
  return b;
}

function dnLista(teksty) {
  const ul = document.createElement("ul");
  ul.className = "pa-lista";
  teksty.forEach(function (t) { ul.appendChild(tekstElement("li", "", t)); });
  return ul;
}

function dnOtworzSkracanie(plan, sesja) {
  const o = dnOkno("Skróć trening");
  const teraz = dnMinuty(sesja);
  const rysujWybor = function () {
    o.okno.innerHTML = "";
    o.okno.appendChild(tekstElement("h2", "", "Ile masz czasu?"));
    o.okno.appendChild(tekstElement("p", "opis", "Trening trwa teraz ok. " + teraz + " min. Zostawię ćwiczenia główne (wielostawowe), a skrócę resztę. Plan się nie zmieni – tylko dzisiejszy trening."));
    const rzad = document.createElement("div");
    rzad.className = "dn-czasy";
    [15, 20, 30, 45].forEach(function (m) {
      const b = dnPrzycisk(m + " min", "przycisk wielki" + (m >= teraz ? " drugi" : ""), function () { rysujPodglad(m); });
      b.disabled = m >= teraz;
      rzad.appendChild(b);
    });
    o.okno.appendChild(rzad);
    o.okno.appendChild(dnPrzycisk("Anuluj", "przycisk wielki drugi", o.zamknij));
  };
  const rysujPodglad = function (m) {
    const w = dnSkroc(sesja, m);
    o.okno.innerHTML = "";
    o.okno.appendChild(tekstElement("h2", "", "Trening na ok. " + w.minuty + " min"));
    if (w.minuty > m) {
      o.okno.appendChild(tekstElement("p", "an-uwaga", "Krócej się nie da bez rezygnowania z najważniejszego ćwiczenia."));
    }
    o.okno.appendChild(dnLista(w.zmiany.length ? w.zmiany : ["Bez zmian – trening już się mieści."]));
    o.okno.appendChild(tekstElement("p", "pp-naglowek", "Zostaje:"));
    o.okno.appendChild(dnLista(cwiczeniaSesjiIds(w.sesja).map(function (id) {
      return znajdzCwiczenie(id).nazwa + " – " + opisIlosci(w.sesja.parametry[id], znajdzCwiczenie(id));
    })));
    o.okno.appendChild(dnPrzycisk("Ćwiczę skrócony", "przycisk wielki", function () {
      dnDopiszZmiane(sesja, "skrot", ["Skrócony do ok. " + w.minuty + " min."].concat(w.zmiany));
      sesja.parametry = w.sesja.parametry;
      if (w.sesja.przerwaMnoznik) {
        sesja.przerwaMnoznik = w.sesja.przerwaMnoznik;
      }
      zapiszDane();
      o.zamknij();
      rysujDzis();
    }));
    o.okno.appendChild(dnPrzycisk("Wróć", "przycisk wielki drugi", rysujWybor));
  };
  rysujWybor();
}

// ----- Słabszy dzień -----

const DN_BOLE = [["kolano", "Kolano"], ["bark", "Bark"], ["plecy", "Dół pleców"], ["nadgarstek", "Nadgarstek"]];

function dnSamopoczucie(data, ocena, bole) {
  dane.samopoczucie = (dane.samopoczucie || []).filter(function (x) { return x.data !== data; });
  dane.samopoczucie.push({ data: data, ocena: ocena, bole: bole });
  dane.samopoczucie = dane.samopoczucie.slice(-90);
}

function dnSlabychWTygodniu() {
  const od = dnPlusDni(dzisISO(), -6);
  return (dane.samopoczucie || []).filter(function (x) { return x.data >= od && x.ocena === "slabo"; }).length;
}

// Propozycje na słabszy dzień: { lzej: bool, bole: [{ id, nazwa, zamiennik: {id, nazwa} | null }] }
function dnPropozycjaSlabszego(plan, sesja, ocena, bole) {
  const profil = (plan.kreator && plan.kreator.profil) || {};
  const kolizje = [];
  if (bole.length && typeof pgKoliduje === "function") {
    cwiczeniaSesjiIds(sesja).forEach(function (id) {
      const cw = znajdzCwiczenie(id);
      if (!cw || !pgKoliduje(cw.nazwa, bole, profil.sprzet)) {
        return;
      }
      let zam = null;
      if (typeof zamKandydaci === "function") {
        const k = zamKandydaci(plan, sesja, id).find(function (x) { return !pgKoliduje(x.cw.nazwa, bole, profil.sprzet); });
        zam = k ? { id: k.cw.id, nazwa: k.cw.nazwa } : null;
      }
      kolizje.push({ id: id, nazwa: cw.nazwa, zamiennik: zam });
    });
  }
  return { lzej: ocena === "slabo", bole: kolizje };
}

function dnZastosujSlabszy(plan, sesja, prop, wybory) {
  const opis = [];
  dnZapamietajOryginal(sesja);
  if (prop.lzej) {
    cwiczeniaSesjiIds(sesja).forEach(function (id) {
      const il = sesja.parametry[id];
      const mniej = dnMniejSerii(il);
      sesja.parametry[id] = dnLzejsze(mniej || il, 0.15);
    });
    opis.push("Lżej: ciężary ok. 15% mniejsze i jedna seria mniej w każdym ćwiczeniu.");
  }
  prop.bole.forEach(function (k) {
    const wybor = wybory[k.id];
    if (wybor === "zamien" && k.zamiennik && typeof zamZastosuj === "function") {
      zamZastosuj(plan, sesja, k.id, k.zamiennik.id, false);
      opis.push(k.nazwa + " → " + k.zamiennik.nazwa + " (ból).");
    } else if (wybor === "pomin") {
      delete sesja.parametry[k.id];
      opis.push("Pominięte dziś: " + k.nazwa + " (ból).");
    }
  });
  if (opis.length) {
    dnDopiszZmiane(sesja, "slabszy", opis);
  }
  zapiszDane();
}

function dnOtworzSlabszyDzien(plan, sesja) {
  const o = dnOkno("Słabszy dzień");
  let ocena = null;
  const bole = [];
  const rysujPytanie = function () {
    o.okno.innerHTML = "";
    o.okno.appendChild(tekstElement("h2", "", "Jak się dziś czujesz?"));
    const rzad = document.createElement("div");
    rzad.className = "dn-oceny";
    [["swietnie", "Świetnie"], ["normalnie", "Normalnie"], ["slabo", "Słabo"]].forEach(function (x) {
      const b = dnPrzycisk(x[1], "chip dn-ocena" + (ocena === x[0] ? " aktywny" : ""), function () {
        ocena = x[0];
        rysujPytanie();
      });
      b.setAttribute("aria-pressed", ocena === x[0] ? "true" : "false");
      rzad.appendChild(b);
    });
    o.okno.appendChild(rzad);
    o.okno.appendChild(tekstElement("p", "pp-naglowek", "Coś boli? (opcjonalnie)"));
    const chipy = document.createElement("div");
    chipy.className = "chipy";
    DN_BOLE.forEach(function (x) {
      const wl = bole.indexOf(x[0]) !== -1;
      const c = dnPrzycisk(x[1], "chip" + (wl ? " aktywny" : ""), function () {
        if (wl) {
          bole.splice(bole.indexOf(x[0]), 1);
        } else {
          bole.push(x[0]);
        }
        rysujPytanie();
      });
      c.setAttribute("aria-pressed", wl ? "true" : "false");
      chipy.appendChild(c);
    });
    o.okno.appendChild(chipy);
    const dalej = dnPrzycisk("Dalej", "przycisk wielki", rysujPropozycje);
    dalej.disabled = !ocena;
    o.okno.appendChild(dalej);
    o.okno.appendChild(dnPrzycisk("Anuluj", "przycisk wielki drugi", o.zamknij));
  };
  const rysujPropozycje = function () {
    dnSamopoczucie(dzisISO(), ocena, bole.slice());
    zapiszDane();
    const prop = dnPropozycjaSlabszego(plan, sesja, ocena, bole);
    o.okno.innerHTML = "";
    if (!prop.lzej && !prop.bole.length) {
      o.okno.appendChild(tekstElement("h2", "", ocena === "slabo" ? "Trening bez zmian" : "Dobrze!"));
      o.okno.appendChild(tekstElement("p", "opis", bole.length ? "Żadne dzisiejsze ćwiczenie nie obciąża mocno tego miejsca. Jeśli coś zaboli w trakcie – przerwij ćwiczenie." : "Trening zostaje taki, jak w planie."));
      o.okno.appendChild(dnPrzycisk("Zamknij", "przycisk wielki", function () { o.zamknij(); dnPoSamopoczuciu(); }));
      return;
    }
    o.okno.appendChild(tekstElement("h2", "", "Propozycja na dziś"));
    if (prop.lzej) {
      o.okno.appendChild(dnLista(["Ciężary ok. 15% mniejsze i jedna seria mniej w każdym ćwiczeniu. Lepiej zrobić lżej niż wcale – to też się liczy do serii."]));
    }
    const wybory = {};
    prop.bole.forEach(function (k) {
      // Przy bólu bezpieczniej domyślnie pominąć; zamiennik jest do wyboru
      wybory[k.id] = "pomin";
      const blok = document.createElement("div");
      blok.className = "dn-kolizja";
      blok.appendChild(tekstElement("div", "dn-kolizja-nazwa", k.nazwa + " – obciąża bolące miejsce"));
      const rzad = document.createElement("div");
      rzad.className = "chipy";
      const opcje = [];
      if (k.zamiennik) {
        opcje.push(["zamien", "Zamień na: " + k.zamiennik.nazwa]);
      }
      opcje.push(["pomin", "Pomiń dziś"], ["zostaw", "Zostaw"]);
      const przyciski = [];
      opcje.forEach(function (op) {
        const c = dnPrzycisk(op[1], "chip", function () {
          wybory[k.id] = op[0];
          przyciski.forEach(function (p) {
            p.b.classList.toggle("aktywny", p.op === op[0]);
            p.b.setAttribute("aria-pressed", p.op === op[0] ? "true" : "false");
          });
        });
        przyciski.push({ b: c, op: op[0] });
        rzad.appendChild(c);
      });
      przyciski.forEach(function (p) {
        p.b.classList.toggle("aktywny", p.op === wybory[k.id]);
        p.b.setAttribute("aria-pressed", p.op === wybory[k.id] ? "true" : "false");
      });
      blok.appendChild(rzad);
      o.okno.appendChild(blok);
    });
    if (prop.bole.length) {
      o.okno.appendChild(tekstElement("p", "opis", "Ból, który nie mija albo się nasila, skonsultuj z lekarzem lub fizjoterapeutą. Aplikacja nie zastępuje lekarza ani trenera."));
    }
    o.okno.appendChild(dnPrzycisk("Zastosuj na dziś", "przycisk wielki", function () {
      dnZastosujSlabszy(plan, sesja, prop, wybory);
      o.zamknij();
      rysujDzis();
      dnPoSamopoczuciu();
    }));
    o.okno.appendChild(dnPrzycisk("Bez zmian", "przycisk wielki drugi", function () { o.zamknij(); dnPoSamopoczuciu(); }));
  };
  rysujPytanie();
}

// Po trzecim „słabo” w tygodniu – propozycja tygodnia lżej (raz na tydzień)
function dnPoSamopoczuciu() {
  if (dnSlabychWTygodniu() < 3 || dnDeloadTrwa()) {
    return;
  }
  const odrz = dane.ustawienia.deloadOdrzucony;
  if (odrz && odrz >= dnPlusDni(dzisISO(), -6)) {
    return;
  }
  dnProponujDeload("Trzy słabsze dni w ciągu tygodnia to sygnał, że ciało potrzebuje odpoczynku.");
}

// ----- Tydzień lżej (odciążenie) -----

function dnDeloadTrwa() {
  const d = dane.ustawienia.deloadDo;
  return !!d && d >= dzisISO();
}

function dnZastosujDeload() {
  const dzis = dzisISO();
  const koniec = dnPlusDni(dzis, 6);
  let ile = 0;
  dnSesje().forEach(function (x) {
    const s = x.sesja;
    // Pomijamy treningi już rozpoczęte i już odciążone (tydzień lżej albo słabszy dzień), żeby nie odejmować dwa razy
    if (!s.treningId || x.data < dzis || x.data > koniec || dnRozpoczeta(s) ||
        (s.zmianaDnia && (s.zmianaDnia.typy.indexOf("deload") !== -1 || s.zmianaDnia.typy.indexOf("slabszy") !== -1))) {
      return;
    }
    dnZapamietajOryginal(s);
    cwiczeniaSesjiIds(s).forEach(function (id) {
      const il = s.parametry[id];
      const mniej = dnMniejSerii(il);
      s.parametry[id] = dnLzejsze(mniej || il, 0.1);
    });
    dnDopiszZmiane(s, "deload", ["Tydzień lżej: ciężary ok. 10% mniejsze i jedna seria mniej."]);
    ile++;
  });
  dane.ustawienia.deloadDo = koniec;
  zapiszDane();
  return ile;
}

function dnProponujDeload(powod) {
  const o = dnOkno("Tydzień lżej");
  o.okno.appendChild(tekstElement("h2", "", "Może tydzień lżej?"));
  o.okno.appendChild(tekstElement("p", "opis", powod + " Przez 7 dni treningi będą lżejsze: ciężary ok. 10% mniejsze i jedna seria mniej. Po takim tygodniu zwykle wraca siła i chęć do treningu."));
  o.okno.appendChild(tekstElement("p", "opis", "Każdy dzień możesz przywrócić do pełnej wersji na karcie treningu."));
  o.okno.appendChild(dnPrzycisk("Tak, tydzień lżej", "przycisk wielki", function () {
    const ile = dnZastosujDeload();
    o.zamknij();
    rysujDzis();
    if (!ile) {
      alert("W najbliższych 7 dniach nie ma treningów siłowych do zmiany.");
    }
  }));
  o.okno.appendChild(dnPrzycisk("Nie, dziękuję", "przycisk wielki drugi", function () {
    dane.ustawienia.deloadOdrzucony = dzisISO();
    zapiszDane();
    o.zamknij();
  }));
}

// ----- Przyciski pod „Ćwicz” na karcie treningu -----

function dnPrzyciskiTreningu(plan, sesja) {
  const blok = document.createElement("div");
  blok.className = "dn-przyciski";
  if (sesja.zmianaDnia) {
    const info = document.createElement("div");
    info.className = "dn-zmiana";
    info.appendChild(tekstElement("div", "dn-zmiana-tytul", sesja.zmianaDnia.typy.indexOf("deload") !== -1 ? "Tydzień lżej" : sesja.zmianaDnia.typy.indexOf("skrot") !== -1 ? "Trening skrócony" : "Trening lżejszy"));
    info.appendChild(dnLista(sesja.zmianaDnia.opis.slice(0, 4)));
    info.appendChild(dnPrzycisk("Przywróć pełny trening", "akcja", function () {
      dnPrzywroc(sesja);
      zapiszDane();
      rysujDzis();
    }));
    blok.appendChild(info);
  }
  if (dnRozpoczeta(sesja) || dataSesjiISO(plan, sesja) !== dzisISO()) {
    return blok.childNodes.length ? blok : null;
  }
  const rzad = document.createElement("div");
  rzad.className = "dn-rzad";
  rzad.appendChild(dnPrzycisk("Skróć trening", "przycisk drugi", function () { dnOtworzSkracanie(plan, sesja); }));
  rzad.appendChild(dnPrzycisk("Słabszy dzień", "przycisk drugi", function () { dnOtworzSlabszyDzien(plan, sesja); }));
  blok.appendChild(rzad);
  blok.appendChild(tekstElement("div", "opis dn-czas", "Szacowany czas: ok. " + dnMinuty(sesja) + " min"));
  return blok;
}

// ----- Ostrzeżenie: ciężkie nogi dzień przed długim biegiem albo mocnymi interwałami -----

const DN_CIEZKIE_NOGI = /Przysiad|Martwy ciąg|Wykrok|Zakrok|Leg Press|Wypychanie|Hack|RDL|SLDL|Bułgarsk|Hip Thrust|Pistol|Nordic|Good Morning/i;
const DN_MOCNE_BIEGI = { dlugi: "długi bieg", interwaly: "interwały", tempowy: "bieg tempowy" };

function dnCiezkieNogi(sesja) {
  return cwiczeniaSesjiIds(sesja).filter(function (id) {
    const cw = znajdzCwiczenie(id);
    const il = sesja.parametry[id];
    if (!cw || !DN_CIEZKIE_NOGI.test(cw.nazwa) || dnSerie(il) < 3) {
      return false;
    }
    // Z ciężarem albo trudny wariant z masą ciała
    return Math.max.apply(null, [0].concat(ciezaryIlosci(il))) > 0 || (cw.poziom || 0) >= 3;
  });
}

// { bieg: {plan, sesja}, nogi: [nazwy], rodzaj } albo null
function dnKonfliktNogi(plan, sesja) {
  if (!sesja.treningId || sesja.ostrzezenieNogi === "odrzucone" || dnRozpoczeta(sesja)) {
    return null;
  }
  const nogi = dnCiezkieNogi(sesja);
  if (!nogi.length) {
    return null;
  }
  const jutro = dnPlusDni(dataSesjiISO(plan, sesja), 1);
  const bieg = dnSesje().find(function (x) {
    return x.data === jutro && x.sesja.rodzajBiegu && DN_MOCNE_BIEGI[x.sesja.rodzajBiegu] && !x.sesja.wynik;
  });
  if (!bieg) {
    return null;
  }
  return { bieg: bieg, nogi: nogi.map(function (id) { return znajdzCwiczenie(id).nazwa; }), rodzaj: DN_MOCNE_BIEGI[bieg.sesja.rodzajBiegu] };
}

function dnOstrzezenieNogi(plan, sesja) {
  const k = dnKonfliktNogi(plan, sesja);
  if (!k) {
    return null;
  }
  const blok = document.createElement("div");
  blok.className = "dn-ostrzezenie";
  blok.appendChild(tekstElement("div", "dn-zmiana-tytul", "Jutro " + k.rodzaj + ", a dziś ciężkie nogi"));
  blok.appendChild(tekstElement("p", "opis", "Dziś: " + k.nogi.slice(0, 3).join(", ") + ". Zmęczone nogi utrudnią jutrzejszy bieg, a bieg na zmęczonych nogach to większe ryzyko kontuzji. Prosta zasada: mocny trening nóg nie dzień przed długim lub mocnym biegiem."));
  const rzad = document.createElement("div");
  rzad.className = "dn-rzad";
  const tenSamPlan = k.bieg.plan === plan;
  const liczbaDni = typeof DNI_W_OKRESIE !== "undefined" ? DNI_W_OKRESIE[plan.okres] : null;
  const moznaPrzesunac = tenSamPlan || !liczbaDni || sesja.dzien + 2 < liczbaDni;
  if (moznaPrzesunac) {
    rzad.appendChild(dnPrzycisk(tenSamPlan ? "Zamień kolejność dni" : "Przenieś nogi na pojutrze", "przycisk drugi", function () {
      if (tenSamPlan) {
        const d = sesja.dzien;
        sesja.dzien = k.bieg.sesja.dzien;
        k.bieg.sesja.dzien = d;
      } else {
        sesja.dzien += 2;
      }
      zapiszDane();
      rysujDzis();
    }));
  }
  rzad.appendChild(dnPrzycisk("Zostaw", "akcja", function () {
    sesja.ostrzezenieNogi = "odrzucone";
    zapiszDane();
    blok.remove();
  }));
  blok.appendChild(rzad);
  return blok;
}

// ----- Stagnacja: karta na „Dziś” (najwyżej raz w tygodniu) -----

function dnStagnacjaDoPokazania() {
  const ost = dane.ustawienia.stagnacjaKarta;
  if (ost && ost > dnPlusDni(dzisISO(), -7)) {
    return null;
  }
  const pomin = dane.ustawienia.stagnacjaPomin || {};
  const dzis = dzisISO();
  const ids = [];
  dnSesje().forEach(function (x) {
    if (!x.sesja.treningId || x.data < dzis) {
      return;
    }
    cwiczeniaSesjiIds(x.sesja).forEach(function (id) {
      if (ids.indexOf(id) === -1 && !pomin[id]) {
        ids.push(id);
      }
    });
  });
  for (let i = 0; i < ids.length; i++) {
    const s = anStagnacja(ids[i]);
    if (s) {
      return { id: ids[i], s: s };
    }
  }
  return null;
}

// Zmiana zakresu powtórzeń w kolejnych 3 tygodniach planu: z 8–12 na 4–6 (ciężej) albo odwrotnie
function dnZmienZakres(id) {
  const dzis = dzisISO();
  const koniec = dnPlusDni(dzis, 21);
  let ile = 0;
  let kierunek = null;
  dnSesje().forEach(function (x) {
    const il = x.sesja.parametry && x.sesja.parametry[id];
    if (!il || il.typ !== "powtorzenia" || x.data < dzis || x.data > koniec || (x.sesja.zrobione && x.sesja.zrobione[id])) {
      return;
    }
    if (kierunek === null) {
      kierunek = il.powtorzenia >= 8 ? "ciezej" : "lzej";
    }
    if (kierunek === "ciezej") {
      il.powtorzenia = 5;
      il.zakres = [4, 6];
      if (Array.isArray(il.ciezary)) {
        il.ciezary = il.ciezary.map(function (kg) { return kg > 0 ? Math.round(kg * 1.1 / (kg >= 20 ? 2.5 : 0.5)) * (kg >= 20 ? 2.5 : 0.5) : kg; });
      }
    } else {
      il.powtorzenia = 10;
      il.zakres = [8, 12];
      if (Array.isArray(il.ciezary)) {
        il.ciezary = il.ciezary.map(function (kg) { return dnLzejszyKg(kg, 0.15); });
      }
    }
    delete il.wzor;
    ile++;
  });
  zapiszDane();
  return { ile: ile, kierunek: kierunek };
}

function dnKartaStagnacji() {
  const st = dnStagnacjaDoPokazania();
  if (!st) {
    return null;
  }
  const cw = znajdzCwiczenie(st.id);
  const karta = document.createElement("div");
  karta.className = "bz-karta dn-karta";
  karta.appendChild(tekstElement("div", "bz-tytul", "Stagnacja: " + cw.nazwa));
  karta.appendChild(tekstElement("p", "opis", "Od " + st.s.tygodni + " tygodni treningowych bez poprawy (najlepiej " + st.s.najlepiej + "). To normalne – ciało przyzwyczaiło się do bodźca. Wybierz jedną zmianę:"));
  const zakoncz = function (tekst) {
    dane.ustawienia.stagnacjaKarta = dzisISO();
    zapiszDane();
    karta.innerHTML = "";
    karta.appendChild(tekstElement("p", "opis", tekst));
    setTimeout(function () { karta.remove(); }, 4000);
  };
  const opcje = document.createElement("div");
  opcje.className = "dn-opcje";
  opcje.appendChild(dnPrzycisk("Zmień zakres powtórzeń (3 tygodnie)", "przycisk drugi", function () {
    const w = dnZmienZakres(st.id);
    zakoncz(w.ile ? (w.kierunek === "ciezej" ? "Przez 3 tygodnie: 4–6 powtórzeń, ciężar ok. 10% większy (" + w.ile + " treningów)." : "Przez 3 tygodnie: 8–12 powtórzeń, ciężar ok. 15% mniejszy (" + w.ile + " treningów).") : "W najbliższych 3 tygodniach planu nie ma tego ćwiczenia z powtórzeniami.");
  }));
  opcje.appendChild(dnPrzycisk("Tydzień lżej (odciążenie)", "przycisk drugi", function () {
    const ile = dnZastosujDeload();
    zakoncz(ile ? "Najbliższe 7 dni będą lżejsze (" + ile + " treningów)." : "W najbliższych 7 dniach nie ma treningów siłowych.");
    rysujDzis();
  }));
  const nast = dnSesje().filter(function (x) {
    return x.sesja.parametry && x.sesja.parametry[st.id] && x.data >= dzisISO() && !(x.sesja.zrobione && x.sesja.zrobione[st.id]);
  }).sort(function (a, b) { return a.data < b.data ? -1 : 1; })[0];
  if (nast && typeof otworzZamiane === "function") {
    opcje.appendChild(dnPrzycisk("Zmień na inny wariant", "przycisk drugi", function () {
      dane.ustawienia.stagnacjaKarta = dzisISO();
      zapiszDane();
      otworzZamiane(nast.plan, nast.sesja, st.id);
    }));
  }
  karta.appendChild(opcje);
  const rzad = document.createElement("div");
  rzad.className = "bz-rzad";
  rzad.appendChild(dnPrzycisk("Nie pokazuj dla tego ćwiczenia", "akcja", function () {
    dane.ustawienia.stagnacjaPomin = dane.ustawienia.stagnacjaPomin || {};
    dane.ustawienia.stagnacjaPomin[st.id] = true;
    zapiszDane();
    karta.remove();
  }));
  rzad.appendChild(dnPrzycisk("Później", "akcja", function () {
    dane.ustawienia.stagnacjaKarta = dzisISO();
    zapiszDane();
    karta.remove();
  }));
  karta.appendChild(rzad);
  return karta;
}

// ----- Podsumowanie tygodnia (niedziela od 18:00 i poniedziałek) -----

function dnTydzienDoPodsumowania(teraz) {
  teraz = teraz || new Date();
  const dzienTyg = teraz.getDay();
  const dzis = dnISO(teraz);
  let poniedzialek = null;
  if (dzienTyg === 0 && teraz.getHours() >= 18) {
    poniedzialek = dnPlusDni(dzis, -6);
  } else if (dzienTyg === 1) {
    poniedzialek = dnPlusDni(dzis, -7);
  }
  return poniedzialek;
}

function dnObjetoscSesji(s) {
  let suma = 0;
  Object.keys(s.zrobione || {}).forEach(function (id) {
    if (s.zrobione[id] && typeof anSerie === "function") {
      anSerie(s, id).forEach(function (r) {
        if (r.kg > 0) {
          suma += r.kg * r.p;
        }
      });
    }
  });
  return suma;
}

function dnStatystykiTygodnia(pon) {
  const nd = dnPlusDni(pon, 6);
  const st = { pon: pon, nd: nd, planowane: 0, zrobione: 0, objetosc: 0, km: 0, biegi: 0, rekordy: [], slabo: 0 };
  dnSesje().forEach(function (x) {
    const data = x.sesja.dataWykonania || x.data;
    if (x.data >= pon && x.data <= nd) {
      st.planowane++;
    }
    if (data < pon || data > nd) {
      return;
    }
    if (sesjaZaliczona(x.plan, x.sesja)) {
      st.zrobione++;
    }
    st.objetosc += dnObjetoscSesji(x.sesja);
    if (x.sesja.wynik && x.sesja.rodzajBiegu !== undefined) {
      const m = biegMetry(x.sesja.wynik.dystans);
      if (m) {
        st.km += m / 1000;
        st.biegi++;
      }
    }
  });
  (dane.cwiczenia || []).forEach(function (cw) {
    if (cw.rekord && cw.rekord.data >= pon && cw.rekord.data <= nd) {
      st.rekordy.push(cw.nazwa);
    }
  });
  st.slabo = (dane.samopoczucie || []).filter(function (x) { return x.data >= pon && x.data <= nd && x.ocena === "slabo"; }).length;
  return st;
}

// Jedna praktyczna rada (pierwsza pasująca reguła)
function dnRadaTygodnia(st, poprz) {
  if (st.planowane > 0 && st.zrobione < st.planowane / 2) {
    return "Udało się mniej treningów niż w planie. Na kolejny tydzień wybierz stałe pory i traktuj je jak spotkanie – regularność daje więcej niż pojedyncze mocne treningi.";
  }
  if (st.slabo >= 3) {
    return "Kilka słabszych dni. Zadbaj o sen (7–9 godzin) i rozważ lżejszy tydzień.";
  }
  if (poprz && poprz.objetosc > 0 && st.objetosc > poprz.objetosc * 1.25) {
    return "Objętość wzrosła o " + Math.round((st.objetosc / poprz.objetosc - 1) * 100) + "% względem poprzedniego tygodnia. Duże skoki zwiększają ryzyko przeciążenia – w kolejnym tygodniu trzymaj podobny poziom.";
  }
  if (st.rekordy.length) {
    return "Nowe rekordy to znak, że plan działa. Trzymaj się go i nie dokładaj na siłę.";
  }
  if (st.planowane > 0 && st.zrobione >= st.planowane) {
    return "Komplet treningów – świetna robota. Tak trzymaj w kolejnym tygodniu.";
  }
  return "Zaplanuj kolejny tydzień i zacznij od najłatwiejszego treningu – najtrudniej jest zacząć.";
}

function dnTekstTygodnia(st, rada) {
  const dataPL = function (iso) { const c = iso.split("-"); return Number(c[2]) + "." + c[1]; };
  const linie = ["Mój tydzień " + dataPL(st.pon) + "–" + dataPL(st.nd) + ":"];
  linie.push("Treningi: " + st.zrobione + (st.planowane ? " z " + st.planowane : ""));
  if (st.objetosc > 0) {
    linie.push("Podniesione łącznie: " + Math.round(st.objetosc).toLocaleString("pl-PL") + " kg");
  }
  if (st.km > 0) {
    linie.push("Bieganie: " + (Math.round(st.km * 10) / 10).toString().replace(".", ",") + " km w " + st.biegi + " biegach");
  }
  if (st.rekordy.length) {
    linie.push("Rekordy: " + st.rekordy.slice(0, 3).join(", "));
  }
  return { linie: linie, rada: rada };
}

function dnKartaTygodnia() {
  const pon = dnTydzienDoPodsumowania();
  if (!pon || dane.ustawienia.tydzienPodsumowany === pon) {
    return null;
  }
  const st = dnStatystykiTygodnia(pon);
  if (!st.planowane && !st.zrobione) {
    return null;
  }
  const poprz = dnStatystykiTygodnia(dnPlusDni(pon, -7));
  const t = dnTekstTygodnia(st, dnRadaTygodnia(st, poprz));
  const karta = document.createElement("div");
  karta.className = "bz-karta dn-karta dn-tydzien";
  karta.appendChild(tekstElement("div", "bz-tytul", t.linie[0].replace("Mój tydzień", "Twój tydzień")));
  karta.appendChild(dnLista(t.linie.slice(1)));
  karta.appendChild(tekstElement("p", "opis", "Rada: " + t.rada));
  const rzad = document.createElement("div");
  rzad.className = "bz-rzad";
  rzad.appendChild(dnPrzycisk("Udostępnij", "przycisk", function () {
    const tekst = t.linie.join("\n");
    if (navigator.share) {
      navigator.share({ text: tekst }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(tekst).then(function () { alert("Skopiowano podsumowanie – wklej je, gdzie chcesz."); });
    }
  }));
  rzad.appendChild(dnPrzycisk("Zamknij", "akcja", function () {
    dane.ustawienia.tydzienPodsumowany = pon;
    zapiszDane();
    karta.remove();
  }));
  karta.appendChild(rzad);
  return karta;
}

// Karty na górze „Dziś” (po kartach wznowienia i kopii)
function dnKartyDzis() {
  const karty = [];
  try {
    const t = dnKartaTygodnia();
    if (t) {
      karty.push(t);
    }
    const s = dnKartaStagnacji();
    if (s) {
      karty.push(s);
    }
  } catch (e) {
    // karta pomocnicza nie może zablokować ekranu Dziś
  }
  return karty;
}
