// ===== Moje możliwości =====
// Wyniki krótkiego testu sprawności. Kreator planu bierze z nich szczebel ćwiczeń i ciężary startowe.
// dane.mozliwosci = { data: "RRRR-MM-DD", wartosci: { klucz: liczba albo null (nie wiem / nie robię) } }

const MZ_GRUPY = [
  {
    nazwa: "Masa ciała",
    opis: "Rób po kolei, z 2–3 minutami przerwy między ćwiczeniami. Każde ćwiczenie do momentu, aż technika zaczyna się psuć (nie do upadku).",
    pola: [
      { k: "pompki", nazwa: "Pompki klasyczne", jedn: "powt.", jak: "Ciało w jednej linii, klatka prawie do podłogi, pełny wyprost rąk. Wpisz 0, jeśli nie zrobisz ani jednej." },
      { k: "podciagniecia", nazwa: "Podciągnięcia nachwytem", jedn: "powt.", jak: "Z pełnego zwisu, broda nad drążek, bez bujania. 0, jeśli jeszcze nie dajesz rady. Puste, gdy nie masz drążka." },
      { k: "dipy", nazwa: "Dipy na poręczach", jedn: "powt.", jak: "Ramię schodzi do poziomu poręczy, na górze pełny wyprost. Puste, gdy nie masz poręczy." },
      { k: "przysiady", nazwa: "Przysiady bez obciążenia", jedn: "powt.", jak: "Udo co najmniej równolegle do podłogi, pięty na ziemi, bez przerw. Możesz skończyć na 50." },
      { k: "plank", nazwa: "Deska przodem (plank)", jedn: "s", jak: "Na przedramionach, ciało w linii. Koniec, gdy biodra opadają albo unoszą się." },
      { k: "zwis", nazwa: "Zwis na drążku", jedn: "s", jak: "Na prostych rękach, chwyt nachwytem. Puste, gdy nie masz drążka." }
    ]
  },
  {
    nazwa: "Siłownia (sztanga) – jeśli ćwiczysz",
    opis: "Ciężar, który podniesiesz 10 razy, zostawiając zapas 2–3 powtórzeń. Nie testuj na maksa. Nie wiesz – zostaw puste.",
    pola: [
      { k: "s_pch", nazwa: "Wyciskanie sztangi na ławce", jedn: "kg", jak: "Razem ze sztangą." },
      { k: "s_wio", nazwa: "Wiosłowanie sztangą w opadzie", jedn: "kg", jak: "" },
      { k: "s_prz", nazwa: "Przysiad ze sztangą", jedn: "kg", jak: "" }
    ]
  },
  {
    nazwa: "Dom (hantle) – jeśli ćwiczysz",
    opis: "Ciężar na 10 powtórzeń z zapasem 2–3 powtórzeń.",
    pola: [
      { k: "d_pch", nazwa: "Wyciskanie hantli na ławce", jedn: "kg na rękę", jak: "" },
      { k: "d_wio", nazwa: "Wiosłowanie hantlą w oparciu o ławkę", jedn: "kg", jak: "" },
      { k: "d_prz", nazwa: "Przysiad z hantlem przy klatce", jedn: "kg", jak: "" }
    ]
  }
];

let mzNakladka = null;

// Granice, powyżej których wynik testu to najpewniej literówka
const MZ_LIMITY = { pompki: 150, podciagniecia: 60, dipy: 100, przysiady: 300, plank: 900, zwis: 600 };

function mzUwagi(wartosci) {
  const uwagi = [];
  Object.keys(wartosci).forEach(function (k) {
    const v = wartosci[k];
    const p = mzPole(k);
    if (typeof v !== "number" || !p) {
      return;
    }
    const limit = MZ_LIMITY[k] || 400;
    if (v > limit) {
      uwagi.push(p.nazwa + ": " + v + " " + p.jedn);
    }
  });
  return uwagi;
}

function mzWypelnione() {
  return !!(dane.mozliwosci && dane.mozliwosci.data);
}

function mzWartosc(k) {
  if (!mzWypelnione()) {
    return null;
  }
  const v = dane.mozliwosci.wartosci[k];
  return typeof v === "number" ? v : null;
}

// Data testu po polsku, np. "2.11.2026"
function mzData() {
  const c = dane.mozliwosci.data.split("-");
  return Number(c[2]) + "." + Number(c[1]) + "." + c[0];
}

// Ile dni minęło od testu
function mzDniOdTestu() {
  if (!mzWypelnione()) {
    return null;
  }
  const d = new Date(dane.mozliwosci.data + "T12:00:00");
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

function mzPole(k) {
  for (let i = 0; i < MZ_GRUPY.length; i++) {
    const p = MZ_GRUPY[i].pola.find(function (x) { return x.k === k; });
    if (p) {
      return p;
    }
  }
  return null;
}

// Krótkie podsumowanie, np. "Pompki 20 · Podciągnięcia 6 · Plank 60 s"
function mzPodsumowanie(klucze) {
  const czesci = [];
  (klucze || ["pompki", "podciagniecia", "dipy", "przysiady", "plank", "zwis", "s_pch", "s_wio", "s_prz", "d_pch", "d_wio", "d_prz"]).forEach(function (k) {
    const v = mzWartosc(k);
    const p = mzPole(k);
    if (v !== null && p) {
      czesci.push(p.nazwa + ": " + v + " " + p.jedn);
    }
  });
  return czesci;
}

// Przepisuje możliwości do profilu kreatora planu
function mzDoProfilu(p) {
  if (!mzWypelnione()) {
    return;
  }
  p.maxPompek = mzWartosc("pompki");
  p.maxPodciagniec = p.drazek === false ? null : mzWartosc("podciagniecia");
  p.maxPrzysiadow = mzWartosc("przysiady");
  p.maxPlank = mzWartosc("plank");
  const pref = p.sprzet === "d" ? "d_" : "s_";
  p.kotwice = {};
  ["pch", "wio", "prz"].forEach(function (k) {
    const v = mzWartosc(pref + k);
    if (v !== null && v > 0) {
      p.kotwice[k] = v;
    }
  });
}

function mzZamknij() {
  if (mzNakladka) {
    mzNakladka.remove();
    mzNakladka = null;
  }
}

// Formularz testu. poZapisie() wywoływane po zapisaniu (np. powrót do kreatora planu)
function otworzMozliwosci(poZapisie) {
  mzZamknij();
  const wartosci = Object.assign({}, (dane.mozliwosci && dane.mozliwosci.wartosci) || {});
  mzNakladka = document.createElement("div");
  mzNakladka.className = "pk-nakladka mz-nakladka";
  document.body.appendChild(mzNakladka);

  const gora = document.createElement("div");
  gora.className = "pk-gora";
  const wstecz = tekstElement("button", "akcja", "‹ Wstecz");
  wstecz.type = "button";
  wstecz.addEventListener("click", mzZamknij);
  gora.appendChild(wstecz);
  mzNakladka.appendChild(gora);

  const tresc = document.createElement("div");
  tresc.className = "pk-tresc";
  mzNakladka.appendChild(tresc);
  tresc.appendChild(tekstElement("h1", "", "Moje możliwości"));
  tresc.appendChild(tekstElement("p", "opis", "Krótki test (ok. 10 minut). Na jego podstawie kreator dobierze trudność ćwiczeń, powtórzenia i ciężary. Zrób rozgrzewkę przed testem. Jeśli czegoś nie robisz albo nie wiesz – zostaw puste."));

  MZ_GRUPY.forEach(function (g) {
    tresc.appendChild(tekstElement("h2", "mz-grupa", g.nazwa));
    tresc.appendChild(tekstElement("p", "opis", g.opis));
    g.pola.forEach(function (p) {
      const blok = document.createElement("div");
      blok.className = "pk-pole";
      blok.appendChild(tekstElement("label", "", p.nazwa + " (" + p.jedn + ")"));
      if (p.jak) {
        blok.appendChild(tekstElement("span", "opis", p.jak));
      }
      const pole = document.createElement("input");
      pole.type = "number";
      pole.inputMode = "decimal";
      pole.min = "0";
      pole.placeholder = "nie wiem / nie robię";
      pole.value = typeof wartosci[p.k] === "number" ? String(wartosci[p.k]) : "";
      pole.addEventListener("input", function () {
        const v = pole.value === "" ? null : Number(pole.value);
        wartosci[p.k] = v !== null && v >= 0 ? v : null;
        blad.textContent = "";
      });
      pole.addEventListener("focus", function () { pole.select(); });
      blok.appendChild(pole);
      tresc.appendChild(blok);
    });
  });

  const blad = tekstElement("p", "blad", "");
  mzNakladka.appendChild(blad);
  const zapisz = tekstElement("button", "przycisk wielki", "Zapisz możliwości");
  zapisz.type = "button";
  zapisz.addEventListener("click", function () {
    if (typeof wartosci.pompki !== "number") {
      blad.textContent = "Wpisz przynajmniej wynik pompek (0 też jest wynikiem).";
      return;
    }
    if (!bzPotwierdz(mzUwagi(wartosci))) {
      return;
    }
    const d = new Date();
    dane.mozliwosci = {
      data: d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"),
      wartosci: wartosci
    };
    zapiszDane();
    mzZamknij();
    if (typeof rysujUstawienia === "function") {
      rysujUstawienia();
    }
    if (poZapisie) {
      poZapisie();
    }
  });
  mzNakladka.appendChild(zapisz);
}

// Karta w Ustawieniach
function rysujKarteMozliwosci() {
  const karta = document.getElementById("ust-mozliwosci");
  if (!karta) {
    return;
  }
  karta.innerHTML = "";
  if (!mzWypelnione()) {
    karta.appendChild(tekstElement("p", "opis", "Nie zrobiłeś(aś) jeszcze testu. Bez niego kreator planu nie wie, od jakiego poziomu zacząć."));
  } else {
    const dni = mzDniOdTestu();
    karta.appendChild(tekstElement("p", "opis", "Test z " + mzData() + (dni > 56 ? " – minęło ponad 8 tygodni, warto zrobić go ponownie." : ".")));
    mzPodsumowanie().forEach(function (t) {
      karta.appendChild(tekstElement("div", "mz-wiersz", t));
    });
  }
  const b = tekstElement("button", "przycisk", mzWypelnione() ? "Zmień / zrób test ponownie" : "Zrób test");
  b.type = "button";
  b.addEventListener("click", function () { otworzMozliwosci(null); });
  karta.appendChild(b);
}
