// ===== Progresja: propozycje zmian przed kolejnym treningiem =====
// Aplikacja niczego nie zmienia sama. Na ekranie Dziś pokazuje propozycje (np. "40 → 42,5 kg"),
// a użytkownik je przyjmuje albo zostawia. Zasady (podwójna progresja):
//  - wszystkie serie na górze zakresu powtórzeń → więcej ciężaru, powtórzenia wracają na początek zakresu
//  - ocena "Łatwo" → więcej ciężaru od razu
//  - w zakresie, ale nie na górze → o 1 powtórzenie więcej
//  - dwa razy z rzędu "Ciężko" → mniej ciężaru (ok. −7,5%)
//  - kalistenika: po osiągnięciu góry zakresu trudniejszy wariant ćwiczenia
//  - ćwiczenia statyczne: +5 s w każdej serii
// Rozstrzygnięcie propozycji zapisujemy w plan.progresja[idĆwiczenia] = { sesjaId, stan }.

// Trudniejszy wariant ćwiczeń z masą ciała
const PR_DRABINKA = {
  "Pompki z rękami na podwyższeniu": "Pompki klasyczne",
  "Pompki klasyczne": "Pompki z nogami na podwyższeniu",
  "Pompki z nogami na podwyższeniu": "Pompki łucznicze",
  "Pompki z wypchnięciem łopatek (Push-Up Plus)": "Pompki z wąskim rozstawem dłoni",
  "Pompki z wąskim rozstawem dłoni": "Pompki diamentowe",
  "Pompki pike": "Pompki pike z nogami na podwyższeniu",
  "Podciąganie australijskie": "Podciąganie australijskie z nogami na podwyższeniu",
  "Podciąganie australijskie z nogami na podwyższeniu": "Podciąganie nachwytem",
  "Podciąganie australijskie podchwytem": "Podciąganie podchwytem",
  "Przysiad klasyczny": "Przysiad bułgarski",
  "Wykroki w tył": "Przysiad bułgarski",
  "Most biodrowy": "Most biodrowy jednonóż",
  "Most biodrowy jednonóż": "Hip Thrust jednonóż",
  "Dipy na ławce": "Dipy na poręczach",
  "Wspięcia na palce obunóż": "Wspięcia na palce jednonóż"
};

function prLiczba(kg) {
  return String(Math.round(kg * 100) / 100).replace(".", ",");
}

// Krok zwiększania ciężaru: hantle 1–2 kg, sztanga 2,5 (góra) lub 5 kg (dół), maszyny 2,5–5 kg
function prKrok(cw, kg) {
  let typ = "m";
  for (let i = 0; i < PG_REGULY.length; i++) {
    if (PG_REGULY[i][0].test(cw.nazwa)) {
      typ = PG_REGULY[i][3];
      break;
    }
  }
  if (typ === "h") {
    return kg < 10 ? 1 : 2;
  }
  const dol = (cw.partieIds || []).slice(0, 1).some(function (p) {
    return p === "partia-nogi" || p === "partia-posladki";
  });
  if (typ === "s") {
    return dol ? 5 : 2.5;
  }
  return kg < 25 ? 2.5 : 5;
}

function prZaokraglij(kg, krok) {
  return Math.max(krok, Math.round(kg / krok) * krok);
}

// Ostatnie zaliczone wykonanie ćwiczenia w planie przed sesją "przed" (+ poprzednie, do oceny "dwa razy ciężko")
function prWykonania(plan, id, przed) {
  return plan.sesje.filter(function (s) {
    return s.dzien < przed.dzien && s.zrobione && s.zrobione[id] && s.parametry && s.parametry[id];
  }).sort(function (a, b) {
    return b.dzien - a.dzien;
  });
}

function prNowaIlosc(cur, zmiany) {
  const n = JSON.parse(JSON.stringify(cur));
  Object.keys(zmiany).forEach(function (k) { n[k] = zmiany[k]; });
  return n;
}

// Propozycja dla jednego ćwiczenia w sesji; zwraca { id, cw, tytul, powod, nowaIlosc, nowyCwId?, sesjaOdniesienia } albo null
function prPropozycja(plan, sesja, id) {
  const cur = sesja.parametry && sesja.parametry[id];
  if (!cur || sesja.zrobione && sesja.zrobione[id]) {
    return null;
  }
  const cw = znajdzCwiczenie(id);
  if (!cw) {
    return null;
  }
  const wyk = prWykonania(plan, id, sesja);
  if (wyk.length === 0) {
    return null;
  }
  const L = wyk[0];
  const roz = plan.progresja && plan.progresja[id];
  if (roz && roz.sesjaId === L.id) {
    return null;
  }
  const planowana = L.parametry[id];
  const zrobiona = (L.wykonane && L.wykonane[id]) || planowana;
  const ocena = L.ocena && L.ocena[id];
  const poprzedniaCiezko = wyk.length > 1 && wyk[1].ocena && wyk[1].ocena[id] === "ciezko";

  // Ćwiczenia statyczne: czasy w seriach
  if (cur.typ === "czas-serie" && zrobiona.typ === "czas-serie" && planowana.typ === "czas-serie") {
    const wszystkie = zrobiona.czasy.length >= planowana.czasy.length && planowana.czasy.every(function (t, i) {
      return zrobiona.czasy[i] >= t;
    });
    if (!wszystkie || ocena === "ciezko") {
      return null;
    }
    const nowe = cur.czasy.map(function (t) { return t + 5; });
    return {
      id: id, cw: cw, sesjaOdniesienia: L,
      tytul: cur.czasy[0] + " s → " + nowe[0] + " s",
      powod: "Utrzymałeś(aś) pełny czas w każdej serii, więc dokładamy 5 sekund.",
      nowaIlosc: prNowaIlosc(cur, { czasy: nowe })
    };
  }

  if (!cur.zakres || !(cur.typ === "powtorzenia") || !(zrobiona.typ === "powtorzenia" || zrobiona.typ === "serie-lista")) {
    return null;
  }
  const lo = cur.zakres[0];
  const hi = cur.zakres[1];
  const reps = listaPowtorzen(zrobiona);
  const serie = planowana.serie || reps.length;
  const maxPowt = Math.max.apply(null, reps);
  const minPowt = Math.min.apply(null, reps);
  const wszystkieSerie = reps.length >= serie;
  const naGorze = wszystkieSerie && minPowt >= hi;
  const wZakresie = wszystkieSerie && minPowt >= lo;
  const kgCur = Math.max.apply(null, (cur.ciezary || [0]).concat([0]));
  const kgWyk = Math.max.apply(null, ((zrobiona.ciezary && zrobiona.ciezary.length > 0) ? zrobiona.ciezary : (planowana.ciezary || [0])).concat([0]));
  const kgBaza = kgWyk > 0 ? kgWyk : kgCur;
  const srodek = Math.round((lo + hi) / 2);

  // Z ciężarem
  if (kgBaza > 0) {
    const krok = prKrok(cw, kgBaza);
    if (ocena === "ciezko" && poprzedniaCiezko) {
      const nowy = prZaokraglij(kgBaza * 0.925, krok >= 2.5 ? 2.5 : 1);
      if (nowy >= kgBaza) {
        return null;
      }
      return {
        id: id, cw: cw, sesjaOdniesienia: L,
        tytul: prLiczba(kgBaza) + " → " + prLiczba(nowy) + " kg",
        powod: "Dwa razy z rzędu ocena „Ciężko”. Lżejszy ciężar pozwoli wrócić do dobrej techniki i znów robić postępy.",
        nowaIlosc: prNowaIlosc(cur, { powtorzenia: srodek, ciezary: new Array(cur.serie).fill(nowy) })
      };
    }
    if (ocena === "ciezko") {
      return null;
    }
    if (wZakresie && (naGorze || ocena === "latwo")) {
      const nowy = kgBaza + krok;
      return {
        id: id, cw: cw, sesjaOdniesienia: L,
        tytul: prLiczba(kgBaza) + " → " + prLiczba(nowy) + " kg",
        powod: naGorze
          ? "Wszystkie serie zrobione na górze zakresu (" + hi + " powt.). Czas dołożyć ciężar. Powtórzenia wracają na początek zakresu."
          : "Oceniłeś(aś) to jako „Łatwo”, więc zwiększamy ciężar.",
        nowaIlosc: prNowaIlosc(cur, { powtorzenia: naGorze ? lo : Math.max(lo, Math.min(cur.powtorzenia, hi)), ciezary: new Array(cur.serie).fill(nowy) })
      };
    }
    if (wZakresie && !naGorze) {
      const nowePowt = Math.min(hi, minPowt + 1);
      if (nowePowt <= cur.powtorzenia && kgBaza <= kgCur) {
        return null;
      }
      return {
        id: id, cw: cw, sesjaOdniesienia: L,
        tytul: cur.serie + " × " + cur.powtorzenia + " → " + cur.serie + " × " + nowePowt,
        powod: "Zrobiłeś(aś) wszystkie serie w zakresie. Dołóż 1 powtórzenie, a gdy dojdziesz do " + hi + ", zwiększymy ciężar.",
        nowaIlosc: prNowaIlosc(cur, { powtorzenia: nowePowt, ciezary: new Array(cur.serie).fill(kgBaza) })
      };
    }
    return null;
  }

  // Bez ciężaru (kalistenika): trudniejszy wariant albo więcej powtórzeń
  if (ocena === "ciezko") {
    return null;
  }
  if (naGorze || (ocena === "latwo" && wZakresie && maxPowt >= hi)) {
    const nast = PR_DRABINKA[cw.nazwa];
    const nowyCw = nast ? znajdzCwiczeniePoNazwie(nast) : null;
    if (nowyCw && !(sesja.parametry && sesja.parametry[nowyCw.id])) {
      return {
        id: id, cw: cw, sesjaOdniesienia: L, nowyCwId: nowyCw.id,
        tytul: cw.nazwa + " → " + nowyCw.nazwa,
        powod: "Wszystkie serie na górze zakresu (" + hi + " powt.). Czas na trudniejszy wariant. Powtórzenia wracają na początek zakresu.",
        nowaIlosc: prNowaIlosc(cur, { powtorzenia: lo })
      };
    }
    return null;
  }
  if (wZakresie) {
    const nowePowt = Math.min(hi, minPowt + 1);
    if (nowePowt <= cur.powtorzenia) {
      return null;
    }
    return {
      id: id, cw: cw, sesjaOdniesienia: L,
      tytul: cur.serie + " × " + cur.powtorzenia + " → " + cur.serie + " × " + nowePowt,
      powod: "Zrobiłeś(aś) wszystkie serie w zakresie. Dołóż 1 powtórzenie, a gdy dojdziesz do " + hi + ", zaproponuję trudniejszy wariant.",
      nowaIlosc: prNowaIlosc(cur, { powtorzenia: nowePowt })
    };
  }
  return null;
}

function znajdzCwiczeniePoNazwie(nazwa) {
  return dane.cwiczenia.find(function (c) {
    return c.nazwa === nazwa && !c.ukryte;
  });
}

// Propozycje do dzisiejszych (niezaliczonych) sesji treningowych planu
function prPropozycjeDnia(plan, sesjeDzis) {
  const lista = [];
  sesjeDzis.forEach(function (sesja) {
    if (!sesja.treningId || sesjaZaliczona(plan, sesja)) {
      return;
    }
    cwiczeniaSesjiIds(sesja).forEach(function (id) {
      const pr = prPropozycja(plan, sesja, id);
      if (pr) {
        pr.sesja = sesja;
        lista.push(pr);
      }
    });
  });
  return lista;
}

// Zapisuje rozstrzygnięcie; przyjęcie zmienia parametry wszystkich przyszłych, niewykonanych sesji z tym ćwiczeniem
function prRozstrzygnij(plan, pr, przyjmij) {
  if (!plan.progresja) {
    plan.progresja = {};
  }
  plan.progresja[pr.id] = { sesjaId: pr.sesjaOdniesienia.id, stan: przyjmij ? "przyjeto" : "zostaw" };
  if (przyjmij) {
    const odDnia = pr.sesja.dzien;
    const sklonowane = {};
    plan.sesje.forEach(function (s) {
      if (s.dzien < odDnia || (s.zrobione && s.zrobione[pr.id]) || !s.parametry || !s.parametry[pr.id]) {
        return;
      }
      const nowa = JSON.parse(JSON.stringify(pr.nowaIlosc));
      if (!pr.nowyCwId) {
        s.parametry[pr.id] = nowa;
        return;
      }
      // Zmiana wariantu: nowy zestaw dla przyszłych sesji, stare sesje zostają bez zmian
      const stary = znajdzTrening(s.treningId);
      if (!stary) {
        return;
      }
      if (!sklonowane[stary.id]) {
        const kopia = JSON.parse(JSON.stringify(stary));
        kopia.id = "tr-pr-" + Date.now() + "-" + Math.floor(Math.random() * 100000);
        kopia.cwiczeniaIds = kopia.cwiczeniaIds.map(function (c) { return c === pr.id ? pr.nowyCwId : c; });
        kopia.roboczy = true;
        dane.treningi.push(kopia);
        sklonowane[stary.id] = kopia.id;
      }
      s.treningId = sklonowane[stary.id];
      const parametry = s.parametry;
      delete parametry[pr.id];
      parametry[pr.nowyCwId] = nowa;
    });
  }
  zapiszDane();
}

// Karta "Propozycje na dziś" nad dzisiejszymi sesjami planu
function prDodajKarte(plan, sesjeDzis, kontener) {
  const lista = prPropozycjeDnia(plan, sesjeDzis);
  if (lista.length === 0) {
    return;
  }
  const karta = document.createElement("div");
  karta.className = "pr-karta";
  karta.appendChild(tekstElement("div", "pr-naglowek", "Propozycje na dziś"));
  karta.appendChild(tekstElement("p", "opis", "Na podstawie ostatniego treningu i Twoich ocen. Nic nie zmieni się bez Twojej zgody."));
  lista.forEach(function (pr) {
    const wiersz = document.createElement("div");
    wiersz.className = "pr-wiersz";
    wiersz.appendChild(tekstElement("div", "pr-nazwa", pr.cw.nazwa));
    wiersz.appendChild(tekstElement("div", "pr-zmiana", pr.tytul));
    wiersz.appendChild(tekstElement("div", "opis", pr.powod));
    const przyciski = document.createElement("div");
    przyciski.className = "pr-przyciski";
    const tak = tekstElement("button", "przycisk", "Przyjmij");
    tak.addEventListener("click", function () {
      prRozstrzygnij(plan, pr, true);
      rysujDzis();
    });
    const nie = tekstElement("button", "przycisk drugi", "Zostaw");
    nie.addEventListener("click", function () {
      prRozstrzygnij(plan, pr, false);
      rysujDzis();
    });
    przyciski.appendChild(tak);
    przyciski.appendChild(nie);
    wiersz.appendChild(przyciski);
    karta.appendChild(wiersz);
  });
  if (lista.length > 1) {
    const wszystkie = tekstElement("button", "przycisk wielki", "Przyjmij wszystkie");
    wszystkie.addEventListener("click", function () {
      lista.forEach(function (pr) { prRozstrzygnij(plan, pr, true); });
      rysujDzis();
    });
    karta.appendChild(wszystkie);
  }
  kontener.appendChild(karta);
}
