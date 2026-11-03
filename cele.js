// ===== Cele i postęp na ścieżkach =====
// dane.sciezkiPostep = { idSciezki: { krok: indeks bieżącego kroku (0 = pierwszy; równy liczbie kroków = cel osiągnięty), data } }
// dane.cele = [ { typ: "sciezka", id }, { typ: "liczba", k: "podciagniecia", cel: 30 } ]

const CEL_MAX = 3;

// Cele „liczba powtórzeń”: klucz testu z Moich możliwości → ćwiczenie
const CELE_LICZBA = [
  { k: "pompki", nazwa: "Pompki klasyczne", domyslnie: 30, obciazenia: [] },
  { k: "podciagniecia", nazwa: "Podciąganie nachwytem", domyslnie: 15, obciazenia: [], drazek: true },
  { k: "dipy", nazwa: "Dipy na poręczach", domyslnie: 20, obciazenia: ["barki"], poreczy: true },
  { k: "przysiady", nazwa: "Przysiad klasyczny", domyslnie: 50, obciazenia: [] }
];

// Co mocno obciąża dana ścieżka (do ostrzeżeń o łączeniu celów)
const CEL_OBCIAZENIA = {
  "nadgarstki": ["stanie-na-rekach", "planche", "l-sit", "manna", "pompki-jedna-reka", "hinduskie", "pompki-plyo"],
  "barki": ["planche", "manna", "back-lever", "flaga", "muscle-up", "dipy", "stanie-na-rekach", "ohp", "ohp-zaaw", "olimpijskie", "olimpijskie-zaaw", "kolka", "dipy-dynamiczne"],
  "łokcie i bicepsy (proste ramiona)": ["planche", "front-lever", "back-lever", "flaga", "kolka", "podciaganie-jedna-reka", "muscle-up"],
  "kolana": ["pistol", "kolana", "skoki", "przysiad-zaaw"],
  "dolny odcinek pleców": ["martwy-ciag", "ciag-zaaw", "dragon-flag", "mostek", "olimpijskie", "olimpijskie-zaaw"]
};

function sciezkaWgId(id) {
  return (sciezkiDane || []).find(function (s) { return s.id === id; }) || null;
}

function sciezkaPostep(id) {
  return (dane.sciezkiPostep || {})[id] || null;
}

function ustawPostepSciezki(id, krok) {
  if (!dane.sciezkiPostep) {
    dane.sciezkiPostep = {};
  }
  dane.sciezkiPostep[id] = { krok: krok, data: new Date().toISOString().slice(0, 10) };
  zapiszDane();
}

function celLiczbaDef(k) {
  return CELE_LICZBA.find(function (c) { return c.k === k; }) || null;
}

function opisCelu(c) {
  if (c.typ === "sciezka") {
    const s = sciezkaWgId(c.id);
    return s ? s.nazwa : c.id;
  }
  const d = celLiczbaDef(c.k);
  return (d ? d.nazwa : c.k) + ": " + c.cel + " pod rząd";
}

function czyCelSciezki(id, cele) {
  return (cele || dane.cele || []).some(function (c) { return c.typ === "sciezka" && c.id === id; });
}

// Ostrzeżenia, gdy kilka celów obciąża te same stawy
function ostrzezeniaCelow(cele) {
  const wynik = [];
  Object.keys(CEL_OBCIAZENIA).forEach(function (miejsce) {
    const nazwy = [];
    cele.forEach(function (c) {
      if (c.typ === "sciezka" && CEL_OBCIAZENIA[miejsce].indexOf(c.id) !== -1) {
        nazwy.push(opisCelu(c));
      }
      if (c.typ === "liczba") {
        const d = celLiczbaDef(c.k);
        if (d && d.obciazenia.indexOf(miejsce.split(" ")[0]) !== -1) {
          nazwy.push(d.nazwa);
        }
      }
    });
    if (nazwy.length >= 2) {
      wynik.push("„" + nazwy.join("” i „") + "” mocno obciążają " + miejsce + ". Da się je łączyć, ale zwiększ objętość ostrożnie, a przy bólu zostaw jeden cel.");
    }
  });
  return wynik;
}

// Ścieżki, z których można wybrać cel przy danym sprzęcie
function sciezkiDlaSprzetu(sprzet) {
  return (sciezkiDane || []).filter(function (s) {
    return sprzet === "s" || s.typ === "kalistenika";
  });
}

// ===== Kreator planu: krok „cele” =====

function pkRysujCele(tresc, ustawWalidacje) {
  const p = pkProfil;
  if (!Array.isArray(p.cele)) {
    p.cele = [];
  }
  tresc.appendChild(pkEl("h1", "", "Cele umiejętności (opcjonalnie)"));
  tresc.appendChild(pkEl("p", "opis", "Wybierz do " + CEL_MAX + " celów, np. L-sit albo 30 podciągnięć. Plan połączy je z głównym celem treningu. Możesz pominąć ten krok."));

  const pelne = p.cele.length >= CEL_MAX;
  if (pelne) {
    tresc.appendChild(pkEl("p", "pk-uwaga", "Wybrano " + CEL_MAX + " cele – to maksimum. Odznacz któryś, żeby wybrać inny."));
  }
  ostrzezeniaCelow(p.cele).forEach(function (t) {
    tresc.appendChild(pkEl("p", "pk-uwaga", "⚠ " + t));
  });

  // Liczba powtórzeń
  tresc.appendChild(pkEl("h3", "pp-naglowek", "Liczba powtórzeń pod rząd"));
  const listaL = pkEl("div", "pk-lista");
  CELE_LICZBA.forEach(function (d) {
    if ((d.drazek && p.drazek === false && p.sprzet === "c") || (d.poreczy && !p.poreczy && p.sprzet === "c")) {
      return;
    }
    const istn = p.cele.find(function (c) { return c.typ === "liczba" && c.k === d.k; });
    const wiersz = pkEl("label", "pk-wiersz cel-wiersz");
    const pole = document.createElement("input");
    pole.type = "checkbox";
    pole.checked = !!istn;
    pole.disabled = !istn && pelne;
    pole.addEventListener("change", function () {
      p.cele = p.cele.filter(function (c) { return !(c.typ === "liczba" && c.k === d.k); });
      if (pole.checked) {
        p.cele.push({ typ: "liczba", k: d.k, cel: d.domyslnie });
      }
      pkRysuj();
    });
    wiersz.appendChild(pole);
    const tekst = pkEl("span", "cel-tekst", d.nazwa);
    const teraz = mzWartosc(d.k);
    if (teraz !== null) {
      tekst.appendChild(pkEl("small", "", "Teraz: " + teraz));
    }
    wiersz.appendChild(tekst);
    if (istn) {
      const ile = document.createElement("input");
      ile.type = "number";
      ile.inputMode = "numeric";
      ile.min = "1";
      ile.className = "cel-ile";
      ile.value = String(istn.cel);
      ile.setAttribute("aria-label", "Cel: ile powtórzeń");
      ile.addEventListener("input", function () {
        istn.cel = Math.max(1, Math.round(Number(ile.value) || 0));
      });
      wiersz.appendChild(ile);
    }
    listaL.appendChild(wiersz);
  });
  tresc.appendChild(listaL);

  // Umiejętności (ścieżki)
  [["kalistenika", "Umiejętności – kalistenika"], ["silownia", "Umiejętności – siłownia"]].forEach(function (g) {
    const sciezki = sciezkiDlaSprzetu(p.sprzet).filter(function (s) { return s.typ === g[0]; });
    if (!sciezki.length) {
      return;
    }
    tresc.appendChild(pkEl("h3", "pp-naglowek", g[1]));
    const lista = pkEl("div", "pk-lista");
    sciezki.forEach(function (s) {
      const wybrany = czyCelSciezki(s.id, p.cele);
      const wiersz = pkEl("label", "pk-wiersz cel-wiersz");
      const pole = document.createElement("input");
      pole.type = "checkbox";
      pole.checked = wybrany;
      pole.disabled = !wybrany && pelne;
      pole.addEventListener("change", function () {
        p.cele = p.cele.filter(function (c) { return !(c.typ === "sciezka" && c.id === s.id); });
        if (pole.checked) {
          p.cele.push({ typ: "sciezka", id: s.id });
        }
        pkRysuj();
      });
      wiersz.appendChild(pole);
      const tekst = pkEl("span", "cel-tekst", s.nazwa);
      const post = sciezkaPostep(s.id);
      tekst.appendChild(pkEl("small", "", post ? (post.krok >= s.kroki.length ? "Cel osiągnięty" : "Tu jesteś: krok " + (post.krok + 1) + " z " + s.kroki.length) : "Cel: " + s.cel));
      wiersz.appendChild(tekst);
      lista.appendChild(wiersz);
    });
    tresc.appendChild(lista);
  });
  ustawWalidacje(function () { return true; });
}

// ===== Kreator planu: krok „cele-start” – gdzie jesteś na ścieżkach wybranych celów =====

function pkCeleBezStartu() {
  return (pkProfil.cele || []).filter(function (c) {
    return c.typ === "sciezka" && !sciezkaPostep(c.id) && sciezkaWgId(c.id);
  });
}

function pkRysujCeleStart(tresc, ustawWalidacje) {
  const brak = pkCeleBezStartu();
  if (!brak.length) {
    tresc.appendChild(pkEl("h1", "", "Punkty startowe ustalone"));
    tresc.appendChild(pkEl("p", "opis", "Wiem, od którego kroku zacząć każdy cel."));
    ustawWalidacje(function () { return true; });
    return;
  }
  const s = sciezkaWgId(brak[0].id);
  tresc.appendChild(pkEl("h1", "", "Gdzie jesteś: " + s.nazwa + "?"));
  tresc.appendChild(pkEl("p", "opis", "Zaznacz najtrudniejszy krok, który już robisz z podanym kryterium. Zaczniemy od następnego." + (brak.length > 1 ? " Zostało ścieżek: " + brak.length + "." : "")));
  tresc.appendChild(pkOpcja("Żadnego jeszcze nie robię", "Zacznę od kroku 1: " + s.kroki[0].cwiczenie, false, function () {
    ustawPostepSciezki(s.id, 0);
    pkRysuj();
  }));
  s.kroki.forEach(function (k, i) {
    tresc.appendChild(pkOpcja((i + 1) + ". " + k.cwiczenie, "Robię: " + k.kryterium, false, function () {
      ustawPostepSciezki(s.id, i + 1);
      pkRysuj();
    }));
  });
  ustawWalidacje(function () { return pkCeleBezStartu().length === 0; });
}

// ===== Widok ścieżki: „Tu jesteś” =====

let sciezkaWyborStartu = false;

function sciezkiPasekPostepu(s) {
  const blok = sciezkiEl("div", "sciezka-postep");
  const post = sciezkaPostep(s.id);
  if (sciezkaWyborStartu) {
    blok.appendChild(sciezkiEl("p", "", "Dotknij najtrudniejszy krok, który już robisz z podanym kryterium."));
    const zaden = sciezkiEl("button", "przycisk maly", "Żadnego jeszcze nie robię");
    zaden.type = "button";
    zaden.addEventListener("click", function () {
      ustawPostepSciezki(s.id, 0);
      sciezkaWyborStartu = false;
      rysujSciezki();
    });
    const anuluj = sciezkiEl("button", "akcja", "Anuluj");
    anuluj.type = "button";
    anuluj.addEventListener("click", function () {
      sciezkaWyborStartu = false;
      rysujSciezki();
    });
    blok.appendChild(zaden);
    blok.appendChild(anuluj);
    return blok;
  }
  if (post) {
    const koniec = post.krok >= s.kroki.length;
    blok.appendChild(sciezkiEl("strong", "", koniec ? "Cel osiągnięty 🎉" : "Tu jesteś: krok " + (post.krok + 1) + " z " + s.kroki.length));
    const pasek = sciezkiEl("div", "sciezka-pasek");
    const wyp = sciezkiEl("span", "");
    wyp.style.width = Math.round(100 * Math.min(post.krok, s.kroki.length) / s.kroki.length) + "%";
    pasek.appendChild(wyp);
    blok.appendChild(pasek);
  }
  const b = sciezkiEl("button", "przycisk maly", post ? "Zmień, gdzie jestem" : "Ustal, gdzie jestem");
  b.type = "button";
  b.addEventListener("click", function () {
    sciezkaWyborStartu = true;
    rysujSciezki();
  });
  blok.appendChild(b);
  if (czyCelSciezki(s.id)) {
    blok.appendChild(sciezkiEl("span", "sciezka-cel-znak", "Twój cel"));
  }
  return blok;
}

// ===== Etap 4: zaliczanie kroków, krok niżej, aktualizacja możliwości =====

// Ćwiczenie → pole testu w Moich możliwościach
const CEL_TEST_CWICZENIA = {
  "Pompki klasyczne": "pompki",
  "Podciąganie nachwytem": "podciagniecia",
  "Dipy na poręczach": "dipy",
  "Przysiad klasyczny": "przysiady",
  "Deska przodem (Front Plank)": "plank"
};

function celeToast(tekst) {
  let pojemnik = document.querySelector(".cele-toasty");
  if (!pojemnik) {
    pojemnik = document.createElement("div");
    pojemnik.className = "cele-toasty";
    document.body.appendChild(pojemnik);
  }
  const t = document.createElement("div");
  t.className = "cele-toast";
  t.setAttribute("role", "status");
  t.textContent = tekst;
  pojemnik.appendChild(t);
  setTimeout(function () { t.classList.add("znika"); }, 5000);
  setTimeout(function () { t.remove(); }, 5600);
}

// Czy wynik spełnia kryterium kroku, np. "3 × 10" albo "3 × 30 s"
function celKryteriumSpelnione(kryterium, ilosc) {
  const k = pgKryterium(kryterium);
  let wartosci = [];
  if (czyPowtorzenia(ilosc)) {
    wartosci = listaPowtorzen(ilosc);
  } else if (czyStatyczne(ilosc)) {
    const j = jednostkaCzasu(ilosc);
    wartosci = listaCzasow(ilosc).map(function (c) { return sekundyZ(c, j); });
  } else if (ilosc.typ === "czas") {
    wartosci = [sekundyZ(ilosc.wartosc, ilosc.jednostka)];
  }
  return wartosci.filter(function (v) { return v >= k.ile; }).length >= k.serie;
}

// Najlepsza pojedyncza seria (powtórzenia albo sekundy)
function celNajlepszaSeria(ilosc) {
  if (czyPowtorzenia(ilosc)) {
    return Math.max.apply(null, listaPowtorzen(ilosc));
  }
  if (czyStatyczne(ilosc)) {
    const j = jednostkaCzasu(ilosc);
    return Math.max.apply(null, listaCzasow(ilosc).map(function (c) { return sekundyZ(c, j); }));
  }
  if (ilosc.typ === "czas") {
    return sekundyZ(ilosc.wartosc, ilosc.jednostka);
  }
  return 0;
}

function planSesji(sesja) {
  return dane.plany.find(function (p) { return p.sesje.indexOf(sesja) !== -1; }) || null;
}

// Wywoływane po zaliczeniu ćwiczenia (Dziś, okno wartości, tryb Ćwicz)
function celeSprawdz(sesja, id) {
  if (!sesja.zrobione || !sesja.zrobione[id] || !sesja.parametry || !sesja.parametry[id]) {
    return;
  }
  const cw = znajdzCwiczenie(id);
  if (!cw) {
    return;
  }
  const wynik = (sesja.wykonane && sesja.wykonane[id]) || sesja.parametry[id];
  const komunikaty = [];

  // Moje możliwości: lepszy wynik z treningu podnosi wartość testu
  const klucz = CEL_TEST_CWICZENIA[cw.nazwa];
  if (klucz && mzWypelnione()) {
    const najlepsza = celNajlepszaSeria(wynik);
    const teraz = mzWartosc(klucz);
    if (najlepsza > 0 && (teraz === null || najlepsza > teraz)) {
      dane.mozliwosci.wartosci[klucz] = najlepsza;
      komunikaty.push("Nowy wynik w Moich możliwościach: " + mzPole(klucz).nazwa + " " + najlepsza + " " + mzPole(klucz).jedn);
      const celL = (dane.cele || []).find(function (c) { return c.typ === "liczba" && c.k === klucz; });
      if (celL && najlepsza >= celL.cel) {
        komunikaty.push("🎉 Cel osiągnięty: " + opisCelu(celL) + "!");
      }
    }
  }

  // Ścieżki celów: czy to bieżący krok i czy kryterium jest spełnione
  if (sciezkiDane) {
    (dane.cele || []).forEach(function (c) {
      if (c.typ !== "sciezka") {
        return;
      }
      const s = sciezkaWgId(c.id);
      const post = sciezkaPostep(c.id);
      if (!s || !post || post.krok >= s.kroki.length) {
        return;
      }
      const krok = s.kroki[post.krok];
      if (krok.cwiczenie !== cw.nazwa || !celKryteriumSpelnione(krok.kryterium, wynik)) {
        return;
      }
      const nowy = post.krok + 1;
      ustawPostepSciezki(s.id, nowy);
      if (nowy >= s.kroki.length) {
        komunikaty.push("🎉 " + s.nazwa + ": cel osiągnięty!");
        return;
      }
      const nast = s.kroki[nowy];
      komunikaty.push("✓ " + s.nazwa + ": krok " + nowy + " zaliczony. Następny: " + nast.cwiczenie + " (" + nast.kryterium + ").");
      // Następny krok to to samo ćwiczenie z wyższym kryterium: od razu nowe wartości w przyszłych sesjach
      const plan = planSesji(sesja);
      if (plan && nast.cwiczenie === cw.nazwa) {
        const w = pgWpisKroku(nast, s, nowy, {});
        if (w) {
          plan.sesje.forEach(function (x) {
            if (x.dzien > sesja.dzien && x.parametry && x.parametry[id] && !(x.zrobione && x.zrobione[id])) {
              x.parametry[id] = pgIlosc(w);
            }
          });
          plan.celeOpisy = plan.celeOpisy || {};
          plan.celeOpisy[id] = w.celOpis;
        }
      } else {
        komunikaty.push("Zmianę ćwiczenia zaproponuję w „Propozycjach na dziś” przy następnym treningu.");
      }
    });
  }
  if (komunikaty.length) {
    zapiszDane();
    celeToast(komunikaty.join(" "));
  }
}

// Propozycja w „Propozycjach na dziś” dla ćwiczenia ze ścieżki celu.
// Zwraca propozycję, null (brak propozycji, bez zwykłej drabinki) albo undefined (to nie ćwiczenie celu).
function celPropozycja(plan, sesja, id, cw, cur, wyk) {
  if (!sciezkiDane) {
    return undefined;
  }
  let wynikP;
  (dane.cele || []).some(function (c) {
    if (c.typ === "liczba") {
      // Cel „liczba pod rząd”: ćwiczenie zostaje to samo (bez zmiany na trudniejszy wariant), rosną powtórzenia
      const d = celLiczbaDef(c.k);
      if (d && d.nazwa === cw.nazwa) {
        wynikP = null;
        return true;
      }
      return false;
    }
    const s = sciezkaWgId(c.id);
    const post = sciezkaPostep(c.id);
    if (!s || !post) {
      return false;
    }
    const k = Math.min(post.krok, s.kroki.length);
    const biezacy = k < s.kroki.length ? s.kroki[k] : null;
    // Ćwiczenie to bieżący krok: ewentualnie krok niżej, gdy dwa razy z rzędu wyraźnie nie wychodzi
    if (biezacy && biezacy.cwiczenie === cw.nazwa) {
      wynikP = null;
      if (k > 0 && wyk.length >= 2 && s.kroki[k - 1].cwiczenie !== cw.nazwa) {
        const slabo = wyk.slice(0, 2).every(function (x) {
          const pl = x.parametry[id];
          const zr = (x.wykonane && x.wykonane[id]) || pl;
          return (x.ocena && x.ocena[id] === "ciezko") || stosunekIlosci(pl, zr) < 0.7;
        });
        const nizej = slabo ? znajdzCwiczeniePoNazwie(s.kroki[k - 1].cwiczenie, true) : null;
        if (nizej && !(sesja.parametry && sesja.parametry[nizej.id])) {
          const w = pgWpisKroku(s.kroki[k - 1], s, k - 1, {});
          wynikP = {
            id: id, cw: cw, sesjaOdniesienia: wyk[0], nowyCwId: nizej.id,
            tytul: cw.nazwa + " → " + nizej.nazwa + " (krok niżej)",
            powod: "Dwa ostatnie treningi wyraźnie poniżej planu albo z oceną „Ciężko”. Krok niżej na ścieżce „" + s.nazwa + "” pozwoli zbudować siłę i wrócić tu za kilka tygodni.",
            nowaIlosc: pgIlosc(w),
            poPrzyjeciu: function () {
              ustawPostepSciezki(s.id, k - 1);
              plan.celeOpisy = plan.celeOpisy || {};
              plan.celeOpisy[nizej.id] = w.celOpis;
            }
          };
        }
      }
      return true;
    }
    // Ćwiczenie to poprzedni (zaliczony) krok: proponujemy następny
    if (k > 0 && s.kroki[k - 1].cwiczenie === cw.nazwa) {
      wynikP = null;
      if (!biezacy) {
        return true;
      }
      const nast = znajdzCwiczeniePoNazwie(biezacy.cwiczenie, true);
      if (nast && !(sesja.parametry && sesja.parametry[nast.id])) {
        const w = pgWpisKroku(biezacy, s, k, {});
        wynikP = {
          id: id, cw: cw, sesjaOdniesienia: wyk[0], nowyCwId: nast.id,
          tytul: "Krok zaliczony: " + cw.nazwa + " → " + nast.nazwa,
          powod: "Spełniłeś(aś) kryterium kroku na ścieżce „" + s.nazwa + "”. Następny krok: " + biezacy.kryterium + ".",
          nowaIlosc: pgIlosc(w),
          poPrzyjeciu: function () {
            plan.celeOpisy = plan.celeOpisy || {};
            plan.celeOpisy[nast.id] = w.celOpis;
          }
        };
      }
      return true;
    }
    return false;
  });
  return wynikP;
}

// ===== Tydzień testu =====

// Karta w Dziś: w 4. tygodniu bloku przypomnienie o teście możliwości
function celeKartaTestu(plan, kontener) {
  if (!plan || !plan.tydzienTestu) {
    return;
  }
  const dzien = dzisiejszyDzienPlanu(plan);
  if (dzien < plan.tydzienTestu || dzien > plan.tydzienTestu + 6) {
    return;
  }
  const odTestu = dataPlanu(plan, plan.tydzienTestu);
  const zrobiony = mzWypelnione() && new Date(dane.mozliwosci.data + "T12:00:00") >= odTestu;
  const karta = document.createElement("div");
  karta.className = "pr-karta";
  karta.appendChild(tekstElement("div", "pr-naglowek", zrobiony ? "Test zrobiony ✓" : "Tydzień lżejszy i test"));
  karta.appendChild(tekstElement("p", "opis", zrobiony
    ? "Wyniki zapisane. Kolejny blok planu ułożę na ich podstawie."
    : "W tym tygodniu jest mniej serii, żeby ciało odpoczęło. Zrób w wolnym dniu test możliwości – kolejny blok dobierze się do nowych wyników."));
  if (!zrobiony) {
    const b = tekstElement("button", "przycisk", "Zrób test");
    b.type = "button";
    b.addEventListener("click", function () { otworzMozliwosci(function () { rysujDzis(); }); });
    karta.appendChild(b);
  }
  kontener.appendChild(karta);
}

// ===== Postęp: karta „Moje cele” =====

function celeKartaPostepu() {
  const cele = dane.cele || [];
  if (!cele.length) {
    return null;
  }
  const karta = document.createElement("div");
  karta.className = "pp-karta cele-karta";
  karta.appendChild(tekstElement("div", "pp-naglowek", "Moje cele"));
  cele.forEach(function (c) {
    const wiersz = document.createElement("div");
    wiersz.className = "cele-wiersz";
    let tytul;
    let stan;
    let proc;
    if (c.typ === "sciezka") {
      const s = sciezkaWgId(c.id);
      if (!s) {
        return;
      }
      const post = sciezkaPostep(c.id);
      const k = post ? Math.min(post.krok, s.kroki.length) : 0;
      tytul = s.nazwa;
      stan = k >= s.kroki.length ? "Cel osiągnięty 🎉" : "Krok " + (k + 1) + " z " + s.kroki.length + ": " + s.kroki[k].cwiczenie + (post && post.data ? " · od " + post.data.split("-").reverse().join(".") : "");
      proc = Math.round(100 * k / s.kroki.length);
      wiersz.addEventListener("click", function () {
        sciezkaOtwarta = s;
        pokazEkran("ekran-cwiczenia");
        pokazWidok("sciezki");
      });
      wiersz.classList.add("klikalny");
    } else {
      const d = celLiczbaDef(c.k);
      const teraz = mzWartosc(c.k);
      tytul = (d ? d.nazwa : c.k) + " pod rząd";
      stan = (teraz === null ? "?" : teraz) + " z " + c.cel + (teraz !== null && teraz >= c.cel ? " – cel osiągnięty 🎉" : "");
      proc = teraz === null ? 0 : Math.min(100, Math.round(100 * teraz / c.cel));
    }
    wiersz.appendChild(tekstElement("div", "cele-tytul", tytul));
    wiersz.appendChild(tekstElement("div", "opis", stan));
    const pasek = document.createElement("div");
    pasek.className = "sciezka-pasek";
    const wyp = document.createElement("span");
    wyp.style.width = proc + "%";
    pasek.appendChild(wyp);
    wiersz.appendChild(pasek);
    karta.appendChild(wiersz);
  });
  return karta;
}

// Ścieżki potrzebne od startu, gdy są cele (zaliczanie kroków w Dziś)
if ((dane.cele || []).some(function (c) { return c.typ === "sciezka"; })) {
  sciezkiWczytaj(function () {});
}
