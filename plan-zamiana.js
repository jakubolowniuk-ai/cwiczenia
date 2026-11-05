// ===== Zamiana ćwiczenia w planie =====
// Na ekranie Dziś przy ćwiczeniu głównym jest przycisk "Zamień". Okno pokazuje odpowiedniki:
// te same mięśnie, podobna trudność, krok łatwiej/trudniej na drabince, bez ćwiczeń kolidujących z bólem.
// Ukryte ćwiczenia są pomijane, chyba że przy układaniu planu użytkownik zgodził się na ich użycie.
// Zamiana dotyczy tylko niewykonanych sesji; trening jest kopiowany (jak przy zmianie wariantu w propozycjach).

const ZAM_SILOWE = ["rodzaj-cialo", "rodzaj-kalistenika", "rodzaj-statyczny"];
const ZAM_LIMIT = 8;

let zamPlan = null;
let zamSesja = null;
let zamStareId = null;
let zamTlo = null;

// Czy ćwiczenie jest dostępne przy zamianie w tym planie (ukryte, ból, sprzęt)
function zamDostepne(plan, cw) {
  const profil = (plan.kreator && plan.kreator.profil) || {};
  if (cw.ukryte && !profil.uzyjUkrytych) {
    return false;
  }
  if (typeof pgKoliduje === "function" && pgKoliduje(cw.nazwa, profil.bole, profil.sprzet)) {
    return false;
  }
  // Sprzęt z planu: siłownia → ćwiczenia siłowni, dom → siłownia i masa ciała, masa ciała → bez ćwiczeń na sprzęcie
  if (profil.sprzet === "c" && cw.rodzajId === "rodzaj-cialo") {
    return false;
  }
  if (profil.sprzet === "s" && cw.rodzajId === "rodzaj-kalistenika") {
    return false;
  }
  return true;
}

// Słowa nazwy, które coś mówią o ruchu (bez sprzętu i pozycji), do wykrywania wariantów tego samego ćwiczenia
const ZAM_POMIJANE = ["sztangą", "hantlami", "hantlem", "maszynie", "wyciągu", "linką", "liną", "leżąc", "stojąc", "siedząc", "jednorącz", "jednonóż", "obunóż", "ławce", "poziomej", "skośnej", "dodatniej", "ujemnej", "łamaną", "prostą", "kettlebellem", "talerzem", "oburącz", "chwytem", "podchwytem", "nachwytem", "dolnym", "górnym", "drążka", "drążkiem", "rączką"];
function zamSlowa(nazwa) {
  return nazwa.toLowerCase().replace(/\(.*?\)/g, " ").split(/[^a-ząćęłńóśźż0-9]+/).filter(function (s) {
    return s.length >= 4 && ZAM_POMIJANE.indexOf(s) === -1;
  });
}

function zamCzescWspolna(a, b) {
  const wspolne = a.filter(function (x) { return b.indexOf(x) !== -1; }).length;
  const suma = a.length + b.length - wspolne;
  return suma === 0 ? 0 : wspolne / suma;
}

// Odpowiedniki: ocena 0–1,5 z podobieństwa mięśni, partii, rodzaju, trudności i sąsiedztwa na drabince
function zamKandydaci(plan, sesja, stareId) {
  const stare = znajdzCwiczenie(stareId);
  if (!stare) {
    return [];
  }
  const zajete = {};
  cwiczeniaSesjiIds(sesja).concat(idyBloku(sesja, "przed"), idyBloku(sesja, "po")).forEach(function (id) {
    zajete[id] = true;
  });
  const grupaSilowa = ZAM_SILOWE.indexOf(stare.rodzajId) !== -1;
  const sasiedzi = {};
  if (typeof PR_DRABINKA !== "undefined") {
    if (PR_DRABINKA[stare.nazwa]) {
      sasiedzi[PR_DRABINKA[stare.nazwa]] = "krok trudniej";
    }
    Object.keys(PR_DRABINKA).forEach(function (k) {
      if (PR_DRABINKA[k] === stare.nazwa) {
        sasiedzi[k] = "krok łatwiej";
      }
    });
  }
  const wynik = [];
  dane.cwiczenia.forEach(function (cw) {
    if (cw.id === stareId || zajete[cw.id] || !zamDostepne(plan, cw)) {
      return;
    }
    if (grupaSilowa ? ZAM_SILOWE.indexOf(cw.rodzajId) === -1 : cw.rodzajId !== stare.rodzajId) {
      return;
    }
    const miesnie = zamCzescWspolna(stare.miesnieIds || [], cw.miesnieIds || []);
    const partie = zamCzescWspolna(stare.partieIds || [], cw.partieIds || []);
    if (miesnie === 0 && partie === 0 && !sasiedzi[cw.nazwa]) {
      return;
    }
    let ocena = miesnie * 0.8 + partie * 0.3;
    const slowaStare = zamSlowa(stare.nazwa);
    ocena += Math.min(0.45, 0.15 * zamSlowa(cw.nazwa).filter(function (s) { return slowaStare.indexOf(s) !== -1; }).length);
    if (cw.rodzajId === stare.rodzajId) {
      ocena += 0.2;
    }
    let opis = "";
    if (stare.poziom && cw.poziom) {
      const roznica = cw.poziom - stare.poziom;
      if (roznica > 1) {
        return;
      }
      ocena += roznica === 0 ? 0.3 : roznica === -1 ? 0.15 : 0.1;
      opis = roznica === 0 ? "ta sama trudność" : roznica > 0 ? "trochę trudniej" : "łatwiej";
    }
    if (sasiedzi[cw.nazwa]) {
      ocena += 0.4;
      opis = sasiedzi[cw.nazwa];
    }
    if (miesnie >= 0.5) {
      opis = (opis ? opis + " · " : "") + "te same mięśnie";
    }
    wynik.push({ cw: cw, ocena: ocena, opis: opis });
  });
  return wynik.sort(function (a, b) {
    return b.ocena - a.ocena || a.cw.nazwa.localeCompare(b.cw.nazwa, "pl");
  });
}

// Ilość dla nowego ćwiczenia: przeliczenie powtórzeń na czas (i odwrotnie), ciężar startowy wyliczony jak w generatorze
function zamIlosc(stara, stare, nowe, plan) {
  const k = JSON.parse(JSON.stringify(stara));
  const statNowe = nowe.rodzajId === "rodzaj-statyczny";
  const statStare = stare.rodzajId === "rodzaj-statyczny";
  let wynik = k;
  if (statNowe && !statStare && k.typ === "powtorzenia") {
    wynik = { typ: "czas-serie", czasy: new Array(Math.min(k.serie || 3, 4)).fill(20), jednostka: "s" };
  } else if (!statNowe && statStare && (k.typ === "czas-serie" || k.typ === "czas")) {
    const serie = k.typ === "czas-serie" ? k.czasy.length : 3;
    wynik = { typ: "powtorzenia", serie: serie, powtorzenia: 10, zakres: [8, 12] };
  }
  delete wynik.ciezary;
  const profil = (plan.kreator && plan.kreator.profil) || null;
  if (wynik.typ === "powtorzenia" && nowe.zCiezarem && profil && typeof pgKg === "function" && typeof pgKotwice === "function") {
    const kg = pgKg(nowe, profil, pgKotwice(profil));
    if (kg > 0) {
      wynik.ciezary = new Array(wynik.serie).fill(kg);
    }
  }
  return wynik;
}

// Zastosowanie zamiany: kopia treningu z nowym ćwiczeniem dla wybranych sesji
function zamZastosuj(plan, sesja, stareId, noweId, wszystkie) {
  const stare = znajdzCwiczenie(stareId);
  const nowe = znajdzCwiczenie(noweId);
  const cele = plan.sesje.filter(function (s) {
    if (s === sesja) {
      return true;
    }
    return wszystkie && s.treningId === sesja.treningId && s.dzien >= sesja.dzien && s.parametry && s.parametry[stareId] &&
      !(s.zrobione && s.zrobione[stareId]) && !(s.przebieg && s.przebieg.wyniki && s.przebieg.wyniki[stareId]);
  });
  const kopie = {};
  cele.forEach(function (s) {
    const trening = znajdzTrening(s.treningId);
    if (trening && !kopie[trening.id]) {
      const kopia = JSON.parse(JSON.stringify(trening));
      kopia.id = "tr-zam-" + Date.now() + "-" + Math.floor(Math.random() * 100000);
      kopia.cwiczeniaIds = kopia.cwiczeniaIds.map(function (id) { return id === stareId ? noweId : id; });
      kopia.roboczy = true;
      dane.treningi.push(kopia);
      kopie[trening.id] = kopia.id;
    }
    if (trening) {
      s.treningId = kopie[trening.id];
    }
    s.parametry[noweId] = zamIlosc(s.parametry[stareId], stare, nowe, plan);
    delete s.parametry[stareId];
    if (s.kolejnosc) {
      s.kolejnosc = s.kolejnosc.map(function (id) { return id === stareId ? noweId : id; });
    }
  });
  zapiszDane();
  return cele.length;
}

function zamZamknij() {
  if (zamTlo) {
    zamTlo.remove();
    zamTlo = null;
  }
}

function otworzZamiane(plan, sesja, stareId) {
  zamPlan = plan;
  zamSesja = sesja;
  zamStareId = stareId;
  const stare = znajdzCwiczenie(stareId);
  const profil = (plan.kreator && plan.kreator.profil) || {};
  const ileSesji = plan.sesje.filter(function (s) {
    return s.treningId === sesja.treningId && s.dzien >= sesja.dzien && s.parametry && s.parametry[stareId] &&
      !(s.zrobione && s.zrobione[stareId]);
  }).length;

  zamZamknij();
  zamTlo = document.createElement("div");
  zamTlo.className = "wynik-tlo";
  const okno = document.createElement("div");
  okno.className = "okno zam-okno";
  okno.setAttribute("role", "dialog");
  okno.setAttribute("aria-label", "Zamień ćwiczenie");
  zamTlo.appendChild(okno);
  okno.appendChild(tekstElement("h2", "", "Zamień: " + stare.nazwa));

  const zakres = document.createElement("div");
  zakres.className = "zam-zakres";
  const etykiety = [["wszystkie", "Ten i kolejne treningi z tym zestawem (" + ileSesji + ")"], ["jedna", "Tylko ten trening"]];
  etykiety.forEach(function (e, i) {
    const l = document.createElement("label");
    l.className = "wybor";
    const r = document.createElement("input");
    r.type = "radio";
    r.name = "zam-zakres";
    r.value = e[0];
    r.checked = i === (ileSesji > 1 ? 0 : 1);
    l.appendChild(r);
    l.appendChild(document.createTextNode(" " + e[1]));
    zakres.appendChild(l);
  });
  okno.appendChild(zakres);

  okno.appendChild(tekstElement("p", "opis", profil.uzyjUkrytych
    ? "Odpowiedniki z całej bazy, także ukryte (zgodziłeś się na nie przy układaniu planu)."
    : "Odpowiedniki z całej bazy z pominięciem ukrytych ćwiczeń i tych, które kolidują z Twoim bólem."));

  const szukaj = document.createElement("input");
  szukaj.type = "search";
  szukaj.placeholder = "Szukaj w całej bazie";
  okno.appendChild(szukaj);

  const lista = document.createElement("div");
  lista.className = "zam-lista";
  okno.appendChild(lista);
  const wiecej = document.createElement("button");
  wiecej.className = "przycisk-przerywany";
  wiecej.textContent = "Pokaż więcej";
  okno.appendChild(wiecej);
  const anuluj = document.createElement("button");
  anuluj.className = "przycisk drugi";
  anuluj.textContent = "Anuluj";
  anuluj.addEventListener("click", zamZamknij);
  okno.appendChild(anuluj);

  const wszyscy = zamKandydaci(plan, sesja, stareId);
  let limit = ZAM_LIMIT;
  const rysuj = function () {
    const tekst = szukaj.value.trim().toLowerCase();
    const pasujace = wszyscy.filter(function (k) {
      return tekst === "" || k.cw.nazwa.toLowerCase().indexOf(tekst) !== -1;
    });
    lista.innerHTML = "";
    if (pasujace.length === 0) {
      lista.appendChild(tekstElement("p", "opis", "Brak pasujących ćwiczeń."));
    }
    pasujace.slice(0, tekst === "" ? limit : 30).forEach(function (k) {
      const wiersz = document.createElement("button");
      wiersz.className = "zam-wiersz";
      const nazwa = tekstElement("div", "karta-nazwa", k.cw.nazwa);
      if (k.cw.poziom && typeof znaczekPoziomu === "function") {
        nazwa.appendChild(znaczekPoziomu(k.cw.poziom, true));
      }
      wiersz.appendChild(nazwa);
      if (k.opis) {
        wiersz.appendChild(tekstElement("div", "karta-opis", k.opis));
      }
      wiersz.addEventListener("click", function () {
        const wszystkie = okno.querySelector('input[name="zam-zakres"]:checked').value === "wszystkie";
        zamZastosuj(plan, sesja, stareId, k.cw.id, wszystkie);
        zamZamknij();
        rysujDzis();
      });
      lista.appendChild(wiersz);
    });
    wiecej.hidden = tekst !== "" || limit >= pasujace.length;
  };
  wiecej.addEventListener("click", function () {
    limit += ZAM_LIMIT;
    rysuj();
  });
  szukaj.addEventListener("input", rysuj);
  rysuj();
  document.body.appendChild(zamTlo);
}
