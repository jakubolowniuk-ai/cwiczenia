// ===== Rekordy ćwiczeń =====
// cwiczenie.rekord = { typ: "ciezar" | "powtorzenia" | "czas", ciezar (kg), powtorzenia, serie, czas (sekundy), data }
// Siłownia (ćwiczenia z ciężarem): najcięższa seria. Bez ciężaru: najwięcej powtórzeń w serii. Na czas: najdłuższy czas.
// Aplikacja pyta "Zapisać nowy rekord?", gdy zaliczysz ćwiczenie lepiej niż dotychczasowy rekord (albo najlepszy wynik z historii).

function slowoSerii(n) {
  if (n === 1) {
    return "seria";
  }
  const reszta = n % 10;
  return reszta >= 2 && reszta <= 4 && (n % 100 < 10 || n % 100 > 20) ? "serie" : "serii";
}

function opisCzasuSekund(s) {
  const min = Math.floor(s / 60);
  const sek = Math.round((s - min * 60) * 10) / 10;
  if (min > 0) {
    return min + " min" + (sek > 0 ? " " + sek + " s" : "");
  }
  return sek + " s";
}

function opisRekordu(r) {
  if (!r) {
    return "";
  }
  const serie = r.serie ? " · " + r.serie + " " + slowoSerii(r.serie) : "";
  if (r.typ === "ciezar") {
    return r.ciezar + " kg × " + r.powtorzenia + serie;
  }
  if (r.typ === "powtorzenia") {
    return r.powtorzenia + " powt." + serie;
  }
  return opisCzasuSekund(r.czas);
}

// Czy a jest lepszy od b (ten sam typ)
function lepszyRekord(a, b) {
  if (a.typ === "ciezar") {
    return a.ciezar > b.ciezar || (a.ciezar === b.ciezar && a.powtorzenia > b.powtorzenia);
  }
  if (a.typ === "powtorzenia") {
    return a.powtorzenia > b.powtorzenia || (a.powtorzenia === b.powtorzenia && (a.serie || 0) > (b.serie || 0));
  }
  return a.czas > b.czas;
}

// Najlepszy wynik z jednego wykonania ćwiczenia (ilosc), jako rekord; null, gdy nie da się porównać
function kandydatRekordu(cwiczenie, ilosc) {
  if (!ilosc) {
    return null;
  }
  if (ilosc.typ === "powtorzenia" || ilosc.typ === "serie-lista") {
    const powt = listaPowtorzen(ilosc);
    const kg = ciezaryIlosci(ilosc);
    const n = liczbaSerii(ilosc);
    if (cwiczenie.zCiezarem && kg.length > 0) {
      let najlepsza = null;
      powt.forEach(function (p, i) {
        const c = kg[i] !== undefined ? kg[i] : kg[kg.length - 1];
        if (!najlepsza || c > najlepsza.ciezar || (c === najlepsza.ciezar && p > najlepsza.powtorzenia)) {
          najlepsza = { typ: "ciezar", ciezar: c, powtorzenia: p, serie: n };
        }
      });
      return najlepsza;
    }
    return { typ: "powtorzenia", powtorzenia: Math.max.apply(null, powt), serie: n };
  }
  if (ilosc.typ === "czas") {
    return { typ: "czas", czas: sekundyZ(ilosc.wartosc, ilosc.jednostka) };
  }
  if (ilosc.typ === "czas-serie") {
    return { typ: "czas", czas: Math.max.apply(null, ilosc.czasy.map(function (c) {
      return sekundyZ(c, ilosc.jednostka);
    })) };
  }
  return null;
}

// Najlepszy zaliczony wynik z historii (wszystkie plany) dla podanego typu rekordu
function najlepszyZHistorii(cwiczenie, typ, pomijanaSesjaId) {
  let najlepszy = null;
  dane.plany.forEach(function (plan) {
    plan.sesje.forEach(function (s) {
      if (s.id === pomijanaSesjaId || !s.zrobione || !s.zrobione[cwiczenie.id] || !s.parametry || !s.parametry[cwiczenie.id]) {
        return;
      }
      const k = kandydatRekordu(cwiczenie, (s.wykonane && s.wykonane[cwiczenie.id]) || s.parametry[cwiczenie.id]);
      if (k && k.typ === typ && (!najlepszy || lepszyRekord(k, najlepszy))) {
        najlepszy = k;
      }
    });
  });
  return najlepszy;
}

// Po zaliczeniu ćwiczenia: jeśli wynik bije rekord, pytamy, czy go zapisać
function sprawdzRekord(sesja, id) {
  const cwiczenie = znajdzCwiczenie(id);
  if (!cwiczenie || !sesja.zrobione || !sesja.zrobione[id] || !sesja.parametry || !sesja.parametry[id]) {
    return;
  }
  const kandydat = kandydatRekordu(cwiczenie, (sesja.wykonane && sesja.wykonane[id]) || sesja.parametry[id]);
  if (!kandydat) {
    return;
  }
  let dotychczasowy;
  if (cwiczenie.rekord) {
    if (cwiczenie.rekord.typ !== kandydat.typ) {
      return;
    }
    dotychczasowy = cwiczenie.rekord;
  } else {
    dotychczasowy = najlepszyZHistorii(cwiczenie, kandydat.typ, sesja.id);
  }
  if (!dotychczasowy || !lepszyRekord(kandydat, dotychczasowy)) {
    return;
  }
  if (confirm("Nowy rekord! " + cwiczenie.nazwa + ": " + opisRekordu(kandydat) + " (poprzednio " + opisRekordu(dotychczasowy) + ").\n\nZapisać jako Twój rekord?")) {
    cwiczenie.rekord = Object.assign({}, kandydat, { data: dzisISO() });
    zapiszDane();
    rysujDzis();
  }
}

// ===== Okno wpisywania rekordu =====

const rekTlo = document.getElementById("rek-tlo");
const rekTytul = document.getElementById("rek-tytul");
const rekPola = document.getElementById("rek-pola");
const rekBlad = document.getElementById("rek-blad");
const rekUsun = document.getElementById("rek-usun");
let rekCwiczenie = null;
let rekOdczyt = null;

function poleRekordu(etykieta, wartosc, atrybuty) {
  const blok = document.createElement("div");
  blok.className = "wart-blok";
  blok.appendChild(tekstElement("div", "wart-etykieta", etykieta));
  const pole = document.createElement("input");
  pole.type = "number";
  pole.inputMode = "decimal";
  pole.min = "0";
  if (atrybuty && atrybuty.step) {
    pole.step = atrybuty.step;
  }
  pole.value = wartosc ? String(wartosc) : "";
  blok.appendChild(pole);
  rekPola.appendChild(blok);
  return pole;
}

function rysujPolaRekordu(typ, r) {
  rekPola.innerHTML = "";
  r = r && r.typ === typ ? r : {};
  const pola = {};
  if (typ === "ciezar") {
    pola.ciezar = poleRekordu("Ciężar (kg)", r.ciezar, { step: "0.5" });
    pola.powtorzenia = poleRekordu("Powtórzenia w tej serii", r.powtorzenia);
    pola.serie = poleRekordu("Liczba serii (opcjonalnie)", r.serie);
  } else if (typ === "powtorzenia") {
    pola.powtorzenia = poleRekordu("Powtórzenia w serii", r.powtorzenia);
    pola.serie = poleRekordu("Liczba serii (opcjonalnie)", r.serie);
  } else {
    pola.min = poleRekordu("Czas: minuty", r.czas ? Math.floor(r.czas / 60) : 0);
    pola.sek = poleRekordu("Czas: sekundy", r.czas ? Math.round((r.czas % 60) * 10) / 10 : 0);
  }
  pola.data = document.createElement("input");
  const blokData = document.createElement("div");
  blokData.className = "wart-blok";
  blokData.appendChild(tekstElement("div", "wart-etykieta", "Data (opcjonalnie)"));
  pola.data.type = "date";
  pola.data.value = r.data || "";
  blokData.appendChild(pola.data);
  rekPola.appendChild(blokData);

  rekOdczyt = function () {
    const liczba = function (p) {
      return p ? Number(p.value) || 0 : 0;
    };
    const wynik = { typ: typ, data: pola.data.value || "" };
    if (typ === "ciezar") {
      wynik.ciezar = liczba(pola.ciezar);
      wynik.powtorzenia = Math.round(liczba(pola.powtorzenia));
      wynik.serie = Math.round(liczba(pola.serie)) || null;
      if (!(wynik.ciezar > 0) || !(wynik.powtorzenia >= 1)) {
        return "Wpisz ciężar i liczbę powtórzeń.";
      }
    } else if (typ === "powtorzenia") {
      wynik.powtorzenia = Math.round(liczba(pola.powtorzenia));
      wynik.serie = Math.round(liczba(pola.serie)) || null;
      if (!(wynik.powtorzenia >= 1)) {
        return "Wpisz liczbę powtórzeń.";
      }
    } else {
      wynik.czas = liczba(pola.min) * 60 + liczba(pola.sek);
      if (!(wynik.czas > 0)) {
        return "Wpisz czas.";
      }
    }
    return wynik;
  };
}

function otworzRekord(cwiczenie) {
  rekCwiczenie = cwiczenie;
  rekTytul.textContent = "Rekord: " + cwiczenie.nazwa;
  rekBlad.textContent = "";
  rekPola.innerHTML = "";
  const rodzaj = znajdzKategorie(cwiczenie.rodzajId);
  const typStart = cwiczenie.rekord
    ? cwiczenie.rekord.typ
    : cwiczenie.zCiezarem ? "ciezar" : rodzaj && rodzaj.miara === "statyczna" ? "czas" : "powtorzenia";

  const wybor = document.createElement("select");
  [["ciezar", "Ciężar i powtórzenia"], ["powtorzenia", "Powtórzenia"], ["czas", "Czas"]].forEach(function (para) {
    const opcja = document.createElement("option");
    opcja.value = para[0];
    opcja.textContent = para[1];
    wybor.appendChild(opcja);
  });
  wybor.value = typStart;
  wybor.addEventListener("change", function () {
    rysujPolaRekordu(wybor.value, cwiczenie.rekord);
    rekPola.insertBefore(wybor, rekPola.firstChild);
  });
  rysujPolaRekordu(typStart, cwiczenie.rekord);
  rekPola.insertBefore(wybor, rekPola.firstChild);
  rekUsun.hidden = !cwiczenie.rekord;
  rekTlo.hidden = false;
}

function zamknijRekord() {
  rekTlo.hidden = true;
  rekCwiczenie = null;
}

document.getElementById("rek-anuluj").addEventListener("click", zamknijRekord);
rekTlo.addEventListener("click", function (z) {
  if (z.target === rekTlo) {
    zamknijRekord();
  }
});
document.getElementById("rek-zapisz").addEventListener("click", function () {
  const wynik = rekOdczyt();
  if (typeof wynik === "string") {
    rekBlad.textContent = wynik;
    return;
  }
  rekCwiczenie.rekord = wynik;
  zapiszDane();
  zamknijRekord();
  rysujListe();
  rysujDzis();
});
rekUsun.addEventListener("click", function () {
  delete rekCwiczenie.rekord;
  zapiszDane();
  zamknijRekord();
  rysujListe();
  rysujDzis();
});

// ===== Rekordy aktywności (bieganie, rower, spacer…): liczone automatycznie z wyników =====

function rekordyAktywnosci() {
  const wg = {};
  dane.plany.forEach(function (plan) {
    plan.sesje.forEach(function (s) {
      if (!s.wynik) {
        return;
      }
      const akt = plan.aktywnosci.find(function (a) {
        return a.id === s.aktywnoscId;
      });
      if (!akt) {
        return;
      }
      const r = wg[akt.rodzajId] || (wg[akt.rodzajId] = { dystans: 0, kroki: 0, czas: 0 });
      if (s.wynik.dystans) {
        r.dystans = Math.max(r.dystans, metry(s.wynik.dystans));
      }
      if (s.wynik.kroki) {
        r.kroki = Math.max(r.kroki, s.wynik.kroki);
      }
      if (s.wynik.czas) {
        r.czas = Math.max(r.czas, sekundyZ(s.wynik.czas.wartosc, s.wynik.czas.jednostka));
      }
    });
  });
  return wg;
}

function dodajRekordyAktywnosci() {
  const wg = rekordyAktywnosci();
  const wiersze = [];
  Object.keys(wg).forEach(function (rodzajId) {
    const r = wg[rodzajId];
    const czesci = [];
    if (r.dystans > 0) {
      czesci.push("najdłuższy dystans " + (r.dystans >= 1000 ? Math.round(r.dystans / 10) / 100 + " km" : r.dystans + " m"));
    }
    if (r.kroki > 0) {
      czesci.push("najwięcej kroków " + r.kroki);
    }
    if (r.czas > 0) {
      czesci.push("najdłuższy czas " + opisCzasuSekund(r.czas));
    }
    if (czesci.length > 0) {
      wiersze.push([nazwaKategorii(rodzajId), czesci.join(" · ")]);
    }
  });
  if (wiersze.length === 0) {
    return;
  }
  postepTresc.appendChild(tekstElement("h3", "pp-naglowek", "Rekordy aktywności"));
  wiersze.forEach(function (w) {
    postepTresc.appendChild(zrobWskazowke("★", "#0B6B5F", "#DDF1E8", w[0], w[1]));
  });
}
