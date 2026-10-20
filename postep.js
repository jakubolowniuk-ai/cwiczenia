// ===== Ekran Postęp: realizacja planu, stany sesji, rekordy i wskazówki =====
// Wszystko liczymy z danych aktywnego planu (dzis.js dostarcza funkcje pomocnicze).
// Zasada: nic tu nie jest "porażką" - pokazujemy, ile pracy zrobiono i co zrobić następnym razem.

const postepTresc = document.getElementById("postep-tresc");

// Jak bardzo wykonano sesję względem planu: 0 do 1 (nadwyżka nie podnosi powyżej 1)
function stosunekSesji(plan, sesja) {
  const aktywnosc = aktywnoscPlanu(plan, sesja.aktywnoscId);
  if (!aktywnosc) {
    return 0;
  }
  if (wymagaTreningu(aktywnosc)) {
    const ids = cwiczeniaSesjiIds(sesja);
    if (ids.length === 0) {
      return 0;
    }
    const zrobione = sesja.zrobione || {};
    const wykonane = sesja.wykonane || {};
    let suma = 0;
    ids.forEach(function (id) {
      if (zrobione[id]) {
        suma += wykonane[id] ? Math.min(1, stosunekIlosci(sesja.parametry[id], wykonane[id])) : 1;
      }
    });
    return suma / ids.length;
  }
  if (!sesja.wynik) {
    return 0;
  }
  return Math.min(1, stosunekWyniku(sesja, sesja.wynik));
}

function metry(d) {
  return d.jednostka === "km" ? d.wartosc * 1000 : d.wartosc;
}

// Wynik biegania lub basenu do celu
function stosunekWyniku(cel, wynik) {
  if (cel.dystans && wynik.dystans) {
    return metry(wynik.dystans) / metry(cel.dystans);
  }
  if (cel.dlugosci && wynik.dlugosci) {
    return wynik.dlugosci / cel.dlugosci;
  }
  if (cel.czas && wynik.czas) {
    return sekundyZ(wynik.czas.wartosc, wynik.czas.jednostka) / sekundyZ(cel.czas.wartosc, cel.czas.jednostka);
  }
  return 1;
}

// "pelna", "prawie" albo "brak" dla zaliczonej / niezaliczonej sesji
function stanSesji(plan, sesja) {
  if (!sesjaZaliczona(plan, sesja)) {
    return "brak";
  }
  const aktywnosc = aktywnoscPlanu(plan, sesja.aktywnoscId);
  if (wymagaTreningu(aktywnosc)) {
    return sesjaPonizejPlanu(sesja) ? "prawie" : "pelna";
  }
  return stosunekWyniku(sesja, sesja.wynik) < 1 ? "prawie" : "pelna";
}

function procent(czesc, calosc) {
  return calosc === 0 ? 0 : Math.round(czesc * 100 / calosc);
}

function zrobPasek(p, kolor) {
  const pasek = document.createElement("div");
  pasek.className = "pasek-postepu";
  const w = document.createElement("div");
  w.style.width = p + "%";
  if (kolor) {
    w.style.background = kolor;
  }
  pasek.appendChild(w);
  return pasek;
}

function dataSesjiISO(plan, sesja) {
  const d = dataPlanu(plan, sesja.dzien);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

// Rekordy: ćwiczenie zrobione lepiej niż kiedykolwiek wcześniej (tylko w aktywnym planie)
function znajdzRekordy(aktywny) {
  const wpisy = [];
  dane.plany.forEach(function (plan) {
    plan.sesje.forEach(function (sesja) {
      const zrobione = sesja.zrobione || {};
      const wykonane = sesja.wykonane || {};
      Object.keys(zrobione).forEach(function (id) {
        if (zrobione[id] && sesja.parametry && sesja.parametry[id]) {
          wpisy.push({
            id: id,
            data: dataSesjiISO(plan, sesja),
            ilosc: wykonane[id] || sesja.parametry[id],
            wAktywnym: plan === aktywny
          });
        }
      });
    });
  });
  wpisy.sort(function (a, b) {
    return a.data < b.data ? -1 : a.data > b.data ? 1 : 0;
  });
  const najlepsze = {};
  const rekordy = [];
  wpisy.forEach(function (wpis) {
    const poprzedni = najlepsze[wpis.id];
    const miara = miaraIlosci(wpis.ilosc);
    if (poprzedni && (poprzedni.ilosc.typ === wpis.ilosc.typ || (czyPowtorzenia(poprzedni.ilosc) && czyPowtorzenia(wpis.ilosc)))) {
      if (miara > poprzedni.miara) {
        if (wpis.wAktywnym) {
          rekordy.push({ id: wpis.id, ilosc: wpis.ilosc, poprzednio: poprzedni.ilosc, data: wpis.data });
        }
        najlepsze[wpis.id] = { ilosc: wpis.ilosc, miara: miara };
      }
    } else {
      najlepsze[wpis.id] = { ilosc: wpis.ilosc, miara: miara };
    }
  });
  return rekordy;
}

// Ćwiczenia zrobione poniżej planu (ostatni raz każdego)
function znajdzDoPoprawy(plan) {
  const mapa = {};
  plan.sesje.slice().sort(function (a, b) {
    return a.dzien - b.dzien;
  }).forEach(function (sesja) {
    const wykonane = sesja.wykonane || {};
    const zrobione = sesja.zrobione || {};
    Object.keys(zrobione).forEach(function (id) {
      if (!zrobione[id] || !sesja.parametry || !sesja.parametry[id]) {
        return;
      }
      if (wykonane[id] && stosunekIlosci(sesja.parametry[id], wykonane[id]) < 1) {
        mapa[id] = { id: id, plan: sesja.parametry[id], wykonane: wykonane[id] };
      } else {
        delete mapa[id];
      }
    });
  });
  return Object.keys(mapa).map(function (id) {
    return mapa[id];
  });
}

// Ile zaliczonych sesji z rzędu (dzień odpoczynku nie przerywa serii)
function liczSerie(plan, indeks) {
  const wymagane = plan.sesje.filter(function (s) {
    return s.dzien <= indeks && !(s.dzien === indeks && !sesjaZaliczona(plan, s));
  }).sort(function (a, b) {
    return b.dzien - a.dzien;
  });
  let seria = 0;
  for (let i = 0; i < wymagane.length; i++) {
    if (!sesjaZaliczona(plan, wymagane[i])) {
      break;
    }
    seria++;
  }
  return seria;
}

function zrobWskazowke(znaczek, kolor, tlo, tytul, opis) {
  const blok = document.createElement("div");
  blok.className = "pp-wskazowka";
  blok.style.background = tlo;
  const z = tekstElement("div", "znaczek", znaczek);
  z.style.background = kolor;
  blok.appendChild(z);
  const tekst = document.createElement("div");
  tekst.appendChild(tekstElement("div", "t", tytul));
  tekst.appendChild(tekstElement("div", "o", opis));
  blok.appendChild(tekst);
  return blok;
}

// ===== Ekran główny: dwa kafelki =====

function zrobKafelek(etykieta, duza, jednostka, p, akcja) {
  const k = document.createElement("button");
  k.className = "pp-kafel";
  const gora = document.createElement("div");
  gora.className = "pp-kafel-gora";
  gora.appendChild(tekstElement("span", "", etykieta));
  gora.appendChild(tekstElement("span", "strzalka", "›"));
  k.appendChild(gora);
  const dol = document.createElement("div");
  dol.className = "pp-kafel-dol";
  dol.appendChild(tekstElement("div", "pp-kafel-duza", duza));
  dol.appendChild(tekstElement("div", "pp-kafel-jedn", jednostka));
  dol.appendChild(zrobPasek(p));
  k.appendChild(dol);
  k.addEventListener("click", akcja);
  return k;
}

function sesjeDnia(plan, indeks) {
  return plan.sesje.filter(function (s) {
    return s.dzien === indeks;
  });
}

function nazwaOkresu(plan) {
  return plan.okres === "tydzien" ? "Tydzień" : "Miesiąc";
}

function zakresDat(plan) {
  const a = dataPlanu(plan, 0);
  const b = dataPlanu(plan, DNI_W_OKRESIE[plan.okres] - 1);
  return a.getDate() + "." + (a.getMonth() + 1) + " – " + b.getDate() + "." + (b.getMonth() + 1);
}

function rysujPostep() {
  postepTresc.innerHTML = "";
  const plan = aktywnyPlan();
  if (!plan) {
    postepTresc.appendChild(tekstElement("p", "opis", "Gdy ułożysz plan i zaczniesz ćwiczyć, zobaczysz tutaj swoje wyniki."));
    return;
  }

  const indeks = dzisiejszyDzienPlanu(plan);
  postepTresc.appendChild(tekstElement("p", "opis", (plan.okres === "tydzien" ? "Plan tygodniowy" : "Plan miesięczny") + " · " + zakresDat(plan)));

  const kafle = document.createElement("div");
  kafle.className = "pp-kafle";

  // Kafelek Dziś
  const dzis = sesjeDnia(plan, indeks);
  const zalDzis = dzis.filter(function (s) {
    return sesjaZaliczona(plan, s);
  }).length;
  if (dzis.length === 0) {
    kafle.appendChild(zrobKafelek("Dziś", "—", indeks < 0 ? "plan jeszcze się nie zaczął" : "odpoczynek", 0, function () {
      otworzOknoDzis(plan, indeks);
    }));
  } else {
    kafle.appendChild(zrobKafelek("Dziś", zalDzis + " z " + dzis.length, dzis.length === 1 ? "sesja" : "sesje", procent(zalDzis, dzis.length), function () {
      otworzOknoDzis(plan, indeks);
    }));
  }

  // Kafelek Tydzień / Miesiąc
  const wymagane = plan.sesje.filter(function (s) {
    return s.dzien <= indeks;
  });
  let suma = 0;
  wymagane.forEach(function (s) {
    suma += stosunekSesji(plan, s);
  });
  const p = procent(suma, wymagane.length);
  const zalPlan = plan.sesje.filter(function (s) {
    return sesjaZaliczona(plan, s);
  }).length;
  kafle.appendChild(zrobKafelek(nazwaOkresu(plan), wymagane.length === 0 ? "—" : p + "%", zalPlan + " z " + plan.sesje.length + " sesji", p, function () {
    otworzOknoOkresu(plan, indeks);
  }));
  postepTresc.appendChild(kafle);

  const seria = liczSerie(plan, indeks);
  if (seria >= 2) {
    postepTresc.appendChild(zrobWskazowke(String(seria), "#2563EB", "#E3ECFD", "Seria: " + seria + " sesji z rzędu", "Dni odpoczynku jej nie przerywają."));
  }

  const usun = document.createElement("button");
  usun.className = "akcja usun pp-usun";
  usun.textContent = "Usuń plan";
  usun.addEventListener("click", function () {
    otworzUsuwanie(plan);
  });
  postepTresc.appendChild(usun);
}

// ===== Usuwanie planu =====

const usunTlo = document.getElementById("usun-tlo");
const usunOpis = document.getElementById("usun-opis");
const usunAnuluj = document.getElementById("usun-anuluj");
const usunPotwierdz = document.getElementById("usun-potwierdz");
let usuwanyPlan = null;

function otworzUsuwanie(plan) {
  usuwanyPlan = plan;
  const zaliczone = plan.sesje.filter(function (s) {
    return sesjaZaliczona(plan, s);
  }).length;
  usunOpis.textContent = (plan.okres === "tydzien" ? "Plan tygodniowy" : "Plan miesięczny") + " i jego postęp zostaną usunięte. Zaliczone sesje: " + zaliczone + " z " + plan.sesje.length + ".";
  usunTlo.hidden = false;
}

function zamknijUsuwanie() {
  usunTlo.hidden = true;
  usuwanyPlan = null;
}

usunAnuluj.addEventListener("click", zamknijUsuwanie);
usunTlo.addEventListener("click", function (zdarzenie) {
  if (zdarzenie.target === usunTlo) {
    zamknijUsuwanie();
  }
});
usunPotwierdz.addEventListener("click", function () {
  dane.plany = dane.plany.filter(function (p) {
    return p !== usuwanyPlan;
  });
  zapiszDane();
  zamknijUsuwanie();
  rysujPostep();
  rysujDzis();
});

// ===== Okno ze szczegółami =====

const postepOkno = document.getElementById("postep-okno");
const postepOknoTytul = document.getElementById("postep-okno-tytul");
const postepOknoPodtytul = document.getElementById("postep-okno-podtytul");
const postepOknoTresc = document.getElementById("postep-okno-tresc");
const postepOknoWstecz = document.getElementById("postep-okno-wstecz");

function pokazOkno(tytul, podtytul) {
  postepOknoTytul.textContent = tytul;
  postepOknoPodtytul.textContent = podtytul;
  postepOknoTresc.innerHTML = "";
  postepOkno.hidden = false;
}

postepOknoWstecz.addEventListener("click", function () {
  postepOkno.hidden = true;
});

function zrobMarker(stan, kolor) {
  const m = document.createElement("span");
  m.className = "pp-marker " + stan;
  m.style.setProperty("--kolor", kolor);
  return m;
}

function otworzOknoOkresu(plan, indeks) {
  pokazOkno(nazwaOkresu(plan), zakresDat(plan));
  const wymagane = plan.sesje.filter(function (s) {
    return s.dzien <= indeks;
  });
  let suma = 0;
  wymagane.forEach(function (s) {
    suma += stosunekSesji(plan, s);
  });
  const p = procent(suma, wymagane.length);

  const gora = document.createElement("div");
  gora.className = "pp-karta";
  gora.appendChild(tekstElement("div", "opis", "Realizacja planu"));
  gora.appendChild(tekstElement("div", "pp-duze", wymagane.length === 0 ? "—" : p + "%"));
  gora.appendChild(zrobPasek(p));
  postepOknoTresc.appendChild(gora);

  const lista = document.createElement("div");
  lista.className = "pp-karta";
  plan.aktywnosci.forEach(function (aktywnosc) {
    const sesje = plan.sesje.filter(function (s) {
      return s.aktywnoscId === aktywnosc.id;
    }).sort(function (a, b) {
      return a.dzien - b.dzien;
    });
    const due = sesje.filter(function (s) {
      return s.dzien <= indeks;
    });
    let s2 = 0;
    due.forEach(function (s) {
      s2 += stosunekSesji(plan, s);
    });
    const pa = procent(s2, due.length);
    const zaliczone = sesje.filter(function (s) {
      return sesjaZaliczona(plan, s);
    }).length;
    const kolor = aktywnosc.kolor || "#0B6B5F";

    const blok = document.createElement("div");
    blok.className = "pp-akt";
    const wiersz = document.createElement("div");
    wiersz.className = "pp-akt-gora";
    const kwadrat = document.createElement("span");
    kwadrat.className = "kwadrat";
    kwadrat.style.background = kolor;
    wiersz.appendChild(kwadrat);
    wiersz.appendChild(tekstElement("b", "", opisAktywnosci(aktywnosc).tytul));
    wiersz.appendChild(tekstElement("b", "", due.length === 0 ? "—" : pa + "%"));
    blok.appendChild(wiersz);

    const markery = document.createElement("div");
    markery.className = "pp-markery";
    sesje.forEach(function (s) {
      const stan = stanSesji(plan, s);
      markery.appendChild(zrobMarker(stan === "pelna" ? "pelny" : stan === "prawie" ? "pol" : "pusty", kolor));
    });
    blok.appendChild(markery);
    blok.appendChild(tekstElement("div", "pp-podpis", zaliczone + " z " + aktywnosc.razy + " sesji"));
    blok.appendChild(zrobPasek(pa, kolor));
    lista.appendChild(blok);
  });
  postepOknoTresc.appendChild(lista);

  znajdzRekordy(plan).slice(-2).reverse().forEach(function (r) {
    postepOknoTresc.appendChild(zrobWskazowke("★", "#0B6B5F", "#DDF1E8", "Nowy rekord", znajdzCwiczenie(r.id).nazwa + ": " + opisIlosci(r.ilosc) + ". Poprzednio " + opisIlosci(r.poprzednio) + "."));
  });
  znajdzDoPoprawy(plan).slice(0, 2).forEach(function (d) {
    postepOknoTresc.appendChild(zrobWskazowke("↗", "#D97706", "#FDEFD3", "Na następny raz", znajdzCwiczenie(d.id).nazwa + ": ostatnio " + opisIlosci(d.wykonane) + ". Celuj w " + opisIlosci(d.plan) + "."));
  });

  postepOknoTresc.appendChild(tekstElement("p", "pp-legenda", "■ w pełni   ◐ prawie   □ jeszcze przed Tobą"));
}

function otworzOknoDzis(plan, indeks) {
  const dzis = new Date();
  const nazwyDni = ["niedziela", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota"];
  pokazOkno("Dziś", nazwyDni[dzis.getDay()] + ", " + dzis.getDate() + " " + MIESIACE_DOPELNIACZ[dzis.getMonth()]);
  const sesje = sesjeDnia(plan, indeks);
  if (sesje.length === 0) {
    postepOknoTresc.appendChild(zrobPustyKomunikat("Dziś odpoczywasz", "Brak sesji w planie na dzisiaj."));
    return;
  }
  sesje.forEach(function (sesja) {
    const aktywnosc = aktywnoscPlanu(plan, sesja.aktywnoscId);
    const stan = stanSesji(plan, sesja);
    const karta = document.createElement("div");
    karta.className = "dzis-karta";
    karta.style.borderLeftColor = aktywnosc.kolor || "#0B6B5F";
    const naglowek = document.createElement("div");
    naglowek.className = "dzis-naglowek";
    naglowek.appendChild(tekstElement("div", "dzis-tytul", opisAktywnosci(aktywnosc).tytul + " " + numerSesjiWPlanie(plan, sesja) + " z " + aktywnosc.razy));
    const status = tekstElement("div", "dzis-status " + stan, stan === "pelna" ? "✓ w pełni" : stan === "prawie" ? "◐ prawie" : "□ do zrobienia");
    naglowek.appendChild(status);
    karta.appendChild(naglowek);

    if (wymagaTreningu(aktywnosc)) {
      cwiczeniaSesjiIds(sesja).forEach(function (id) {
        const zrobione = !!(sesja.zrobione || {})[id];
        const plan_ = sesja.parametry[id];
        const wyk = zrobione && sesja.wykonane ? sesja.wykonane[id] : null;
        const wiersz = document.createElement("div");
        wiersz.className = "cw-wiersz";
        const znacznik = document.createElement("div");
        znacznik.className = "odhacz maly" + (zrobione ? " zrobione" : "");
        znacznik.textContent = zrobione ? "✓" : "";
        wiersz.appendChild(znacznik);
        const tekst = document.createElement("div");
        tekst.className = "karta-tekst";
        tekst.appendChild(tekstElement("div", "karta-nazwa", znajdzCwiczenie(id).nazwa));
        tekst.appendChild(tekstElement("div", "karta-opis", opisIlosci(wyk || plan_)));
        if (wyk) {
          const r = opisRoznicy(plan_, wyk);
          if (r) {
            tekst.appendChild(tekstElement("div", "etykieta " + (r.wiecej ? "ponad" : "ponizej"), r.wiecej ? r.tekst : "plan " + opisIlosci(plan_) + " · " + r.tekst));
          }
        }
        wiersz.appendChild(tekst);
        karta.appendChild(wiersz);
      });
    } else if (sesja.wynik) {
      karta.appendChild(tekstElement("div", "karta-opis", "Wynik: " + opisCeluSesji(sesja.wynik)));
    } else {
      karta.appendChild(tekstElement("div", "karta-opis", "Cel: " + opisCeluSesji(sesja)));
    }
    postepOknoTresc.appendChild(karta);
  });
}
