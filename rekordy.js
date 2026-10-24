// ===== Rekordy ćwiczeń =====
// cwiczenie.rekord = { typ: "ciezar" | "powtorzenia" | "czas", ciezar (kg), powtorzenia, serie, czas (sekundy), data }
// Siłownia (ćwiczenia z ciężarem): najcięższa seria. Bez ciężaru: najwięcej powtórzeń w serii. Na czas: najdłuższy czas.
// Aplikacja pyta "Zapisać nowy rekord?", gdy zaliczysz ćwiczenie lepiej niż dotychczasowy rekord (albo najlepszy wynik z historii).

// "2026-10-24" -> "24.10.2026"
function dataPL(iso) {
  const c = String(iso || "").split("-");
  return c.length === 3 ? c[2] + "." + c[1] + "." + c[0] : String(iso || "");
}

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
      const r = wg[akt.rodzajId] || (wg[akt.rodzajId] = { dystans: 0, kroki: 0 });
      if (s.wynik.dystans) {
        r.dystans = Math.max(r.dystans, metry(s.wynik.dystans));
      }
      if (s.wynik.kroki) {
        r.kroki = Math.max(r.kroki, s.wynik.kroki);
      }
    });
  });
  return wg;
}

function dodajRekordyAktywnosci() {
  dodajRekordyDystansu();
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
    if (czesci.length > 0) {
      wiersze.push([nazwaKategorii(rodzajId), czesci.join(" · ")]);
    }
  });
  if (wiersze.length === 0) {
    return;
  }
  postepTresc.appendChild(tekstElement("h3", "pp-naglowek", "Najdłuższe wyniki"));
  wiersze.forEach(function (w) {
    postepTresc.appendChild(zrobWskazowke("★", "#0B6B5F", "#DDF1E8", w[0], w[1]));
  });
}

// ===== Rekordy na wybranym dystansie (bieganie, rower, basen) =====
// dane.rekordyDystans = [{ id, rodzajId, dystansM, styl, czas (sekundy albo null), data }]
// Użytkownik sam wybiera dystanse (podpowiadamy popularne). Czas jest lepszy, gdy jest krótszy.

const DYSTANSE_PODPOWIEDZI = {
  "rodzaj-bieganie": [[1000, "1 km"], [3000, "3 km"], [5000, "5 km"], [10000, "10 km"], [21097.5, "Półmaraton"], [42195, "Maraton"]],
  "rodzaj-rower": [[10000, "10 km"], [20000, "20 km"], [40000, "40 km"], [50000, "50 km"], [100000, "100 km"]],
  "rodzaj-basen": [[50, "50 m"], [100, "100 m"], [200, "200 m"], [400, "400 m"], [800, "800 m"], [1500, "1500 m"]]
};
const RODZAJE_REKORDOW_DYSTANSU = ["rodzaj-bieganie", "rodzaj-rower", "rodzaj-basen"];
const TOLERANCJA_DYSTANSU = 0.02;

function liczbaPL(x) {
  return String(Math.round(x * 100) / 100).replace(".", ",");
}

function opisDystansuM(m) {
  const pods = Object.keys(DYSTANSE_PODPOWIEDZI).reduce(function (acc, k) {
    return acc.concat(DYSTANSE_PODPOWIEDZI[k]);
  }, []).find(function (p) {
    return p[0] === m && p[1].indexOf("km") === -1 && p[1].indexOf(" m") === -1;
  });
  if (pods) {
    return pods[1] + " (" + liczbaPL(m / 1000) + " km)";
  }
  return m >= 1000 ? liczbaPL(m / 1000) + " km" : liczbaPL(m) + " m";
}

// Czas jak w wynikach zawodów: 24:10 albo 1:05:30 (setne części sekundy tylko, gdy są)
function opisCzasuRekordu(s) {
  const calk = Math.floor(s);
  const ulamek = Math.round((s - calk) * 10) / 10;
  const h = Math.floor(calk / 3600);
  const m = Math.floor((calk % 3600) / 60);
  const sek = calk % 60;
  const dwie = function (x) {
    return x < 10 ? "0" + x : String(x);
  };
  const koncowka = ulamek > 0 ? String(ulamek).slice(1).replace(".", ",") : "";
  return h > 0 ? h + ":" + dwie(m) + ":" + dwie(sek) + koncowka : m + ":" + dwie(sek) + koncowka;
}

function opisRekorduDystansu(r) {
  const nazwa = nazwaKategorii(r.rodzajId) + (r.styl ? " " + r.styl.toLowerCase() : "");
  return nazwa + " · " + opisDystansuM(r.dystansM);
}

function dodajRekordyDystansu() {
  postepTresc.appendChild(tekstElement("h3", "pp-naglowek", "Moje rekordy na dystansie"));
  const lista = dane.rekordyDystans || [];
  if (lista.length === 0) {
    postepTresc.appendChild(tekstElement("p", "opis", "Wybierz dystans (np. 5 km, 100 m kraulem), wpisz swój rekord, a aplikacja zapyta, gdy go poprawisz."));
  }
  lista.forEach(function (r) {
    const przycisk = document.createElement("button");
    przycisk.className = "pp-poprzedni";
    przycisk.appendChild(tekstElement("b", "", opisRekorduDystansu(r)));
    przycisk.appendChild(tekstElement("span", "opis", r.czas ? "★ " + opisCzasuRekordu(r.czas) + (r.data ? " (" + dataPL(r.data) + ")" : "") : "Jeszcze bez wyniku"));
    przycisk.addEventListener("click", function () {
      otworzRekordDystansu(r);
    });
    postepTresc.appendChild(przycisk);
  });
  const dodaj = document.createElement("button");
  dodaj.className = "przycisk-przerywany";
  dodaj.textContent = "+ Dodaj rekord na dystansie";
  dodaj.addEventListener("click", function () {
    otworzRekordDystansu(null);
  });
  postepTresc.appendChild(dodaj);
}

// ----- Okno dodawania / edycji -----

const rdTlo = document.getElementById("rd-tlo");
const rdRodzaj = document.getElementById("rd-rodzaj");
const rdChipy = document.getElementById("rd-chipy");
const rdDystans = document.getElementById("rd-dystans");
const rdJednostka = document.getElementById("rd-jednostka");
const rdStylBlok = document.getElementById("rd-styl-blok");
const rdStyl = document.getElementById("rd-styl");
const rdGodz = document.getElementById("rd-godz");
const rdMin = document.getElementById("rd-min");
const rdSek = document.getElementById("rd-sek");
const rdData = document.getElementById("rd-data");
const rdBlad = document.getElementById("rd-blad");
const rdUsun = document.getElementById("rd-usun");
let rdEdytowany = null;

function ustawDystansWOknie(m) {
  if (m >= 1000) {
    rdDystans.value = String(Math.round(m / 10) / 100);
    rdJednostka.value = "km";
  } else {
    rdDystans.value = String(m);
    rdJednostka.value = "m";
  }
}

function odczytajDystansM() {
  const x = Number(String(rdDystans.value).replace(",", "."));
  return rdJednostka.value === "km" ? x * 1000 : x;
}

function rysujChipyDystansow() {
  rdChipy.innerHTML = "";
  const wybrany = odczytajDystansM();
  (DYSTANSE_PODPOWIEDZI[rdRodzaj.value] || []).forEach(function (p) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip" + (Math.abs(wybrany - p[0]) < 0.5 ? " aktywny" : "");
    chip.textContent = p[1];
    chip.addEventListener("click", function () {
      ustawDystansWOknie(p[0]);
      rysujChipyDystansow();
    });
    rdChipy.appendChild(chip);
  });
  rdStylBlok.hidden = rdRodzaj.value !== "rodzaj-basen";
}

function otworzRekordDystansu(rekord) {
  rdEdytowany = rekord;
  rdBlad.textContent = "";
  rdRodzaj.innerHTML = "";
  RODZAJE_REKORDOW_DYSTANSU.forEach(function (id) {
    const o = document.createElement("option");
    o.value = id;
    o.textContent = nazwaKategorii(id);
    rdRodzaj.appendChild(o);
  });
  rdStyl.innerHTML = "";
  dane.stylePlywania.forEach(function (n) {
    const o = document.createElement("option");
    o.value = n;
    o.textContent = n;
    rdStyl.appendChild(o);
  });
  rdRodzaj.value = rekord ? rekord.rodzajId : "rodzaj-bieganie";
  rdRodzaj.disabled = !!rekord;
  if (rekord) {
    ustawDystansWOknie(rekord.dystansM);
    rdStyl.value = rekord.styl || dane.stylePlywania[0];
    const c = rekord.czas || 0;
    rdGodz.value = c ? String(Math.floor(c / 3600)) : "";
    rdMin.value = c ? String(Math.floor((c % 3600) / 60)) : "";
    rdSek.value = c ? String(Math.round((c % 60) * 10) / 10) : "";
    rdData.value = rekord.data || "";
  } else {
    rdDystans.value = "";
    rdJednostka.value = "km";
    rdGodz.value = "";
    rdMin.value = "";
    rdSek.value = "";
    rdData.value = "";
  }
  rdUsun.hidden = !rekord;
  rysujChipyDystansow();
  rdTlo.hidden = false;
}

function zamknijRekordDystansu() {
  rdTlo.hidden = true;
  rdEdytowany = null;
}

rdRodzaj.addEventListener("change", function () {
  rdDystans.value = "";
  rysujChipyDystansow();
});
rdDystans.addEventListener("input", rysujChipyDystansow);
rdJednostka.addEventListener("change", rysujChipyDystansow);
document.getElementById("rd-anuluj").addEventListener("click", zamknijRekordDystansu);
rdTlo.addEventListener("click", function (z) {
  if (z.target === rdTlo) {
    zamknijRekordDystansu();
  }
});
rdUsun.addEventListener("click", function () {
  dane.rekordyDystans = dane.rekordyDystans.filter(function (r) {
    return r !== rdEdytowany;
  });
  zapiszDane();
  zamknijRekordDystansu();
  rysujPostep();
});
document.getElementById("rd-zapisz").addEventListener("click", function () {
  const m = odczytajDystansM();
  if (!(m > 0)) {
    rdBlad.textContent = "Wpisz dystans albo wybierz z podpowiedzi.";
    return;
  }
  const czas = (Number(rdGodz.value) || 0) * 3600 + (Number(rdMin.value) || 0) * 60 + (Number(String(rdSek.value).replace(",", ".")) || 0);
  if (czas < 0) {
    rdBlad.textContent = "Czas nie może być ujemny.";
    return;
  }
  const rodzajId = rdRodzaj.value;
  const styl = rodzajId === "rodzaj-basen" ? rdStyl.value : "";
  const taki = dane.rekordyDystans.find(function (r) {
    return r !== rdEdytowany && r.rodzajId === rodzajId && r.styl === styl && Math.abs(r.dystansM - m) / m <= 0.001;
  });
  if (taki) {
    rdBlad.textContent = "Taki rekord już jest na liście.";
    return;
  }
  const wpis = { id: rdEdytowany ? rdEdytowany.id : "rd-" + Date.now(), rodzajId: rodzajId, dystansM: m, styl: styl, czas: czas > 0 ? czas : null, data: rdData.value || "" };
  if (rdEdytowany) {
    dane.rekordyDystans = dane.rekordyDystans.map(function (r) {
      return r === rdEdytowany ? wpis : r;
    });
  } else {
    dane.rekordyDystans.push(wpis);
  }
  zapiszDane();
  zamknijRekordDystansu();
  rysujPostep();
});

// Po zapisaniu wyniku sesji: jeśli dystans i czas pasują do wybranego dystansu i czas jest lepszy, pytamy o zapis rekordu
function sprawdzRekordDystansu(rodzajId, wynik) {
  if (!wynik || !wynik.czas || !Array.isArray(dane.rekordyDystans)) {
    return;
  }
  let metrySesji = null;
  let styl = "";
  if (rodzajId === "rodzaj-basen") {
    const etapy = etapySesji(wynik);
    if (etapy.length !== 1) {
      return;
    }
    metrySesji = etapy[0].metry;
    styl = etapy[0].styl || "";
  } else if (wynik.dystans) {
    metrySesji = metry(wynik.dystans);
  }
  if (!(metrySesji > 0)) {
    return;
  }
  const czas = sekundyZ(wynik.czas.wartosc, wynik.czas.jednostka);
  let pasujacy = null;
  dane.rekordyDystans.forEach(function (r) {
    if (r.rodzajId === rodzajId && (r.styl || "") === styl && Math.abs(metrySesji - r.dystansM) / r.dystansM <= TOLERANCJA_DYSTANSU) {
      if (!pasujacy || Math.abs(metrySesji - r.dystansM) < Math.abs(metrySesji - pasujacy.dystansM)) {
        pasujacy = r;
      }
    }
  });
  if (!pasujacy || (pasujacy.czas && czas >= pasujacy.czas)) {
    return;
  }
  const poprzednio = pasujacy.czas ? " (poprzednio " + opisCzasuRekordu(pasujacy.czas) + ")" : "";
  if (confirm("Nowy rekord! " + opisRekorduDystansu(pasujacy) + ": " + opisCzasuRekordu(czas) + poprzednio + ".\n\nZapisać jako Twój rekord?")) {
    pasujacy.czas = czas;
    pasujacy.data = dzisISO();
    zapiszDane();
    rysujPostep();
  }
}
