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
