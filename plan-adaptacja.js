// ===== Podsumowanie bloku i dopasowanie kolejnego bloku =====
// Statystyki z zakończonego bloku (ile zrobiono, jak oceniano ćwiczenia, jak ciężkie były biegi)
// zmieniają profil następnego bloku. Zmiany są małe i zawsze opisane w „Dlaczego ten plan?”.
// Pola profilu ustawiane tutaj: p.ocenyCw {nazwa: "latwo" | "ciezko"}, p.dni, p.dniOryg, p.biegPrzes (≤ 0, przesunięcie tygodnia
// planu biegowego), p.testWBloku (nowy test w tym bloku ma pierwszeństwo przed ocenami), p.adaptZmiany (zdania do planu).

const PA_PROG_REALIZACJI = 0.6;   // poniżej tej części zrobionych sesji plan jest za gęsty
const PA_PROG_PELNEJ = 0.85;      // od tej części można wrócić do pierwotnej liczby dni
const PA_MIN_OCEN = 3;            // tyle ocen potrzeba, by wyciągać wniosek o ćwiczeniu

function paAktywnoscBiegowa(plan, s) {
  const a = plan.aktywnosci.find(function (x) { return x.id === s.aktywnoscId; });
  return !!a && a.rodzajId === "rodzaj-bieganie";
}

// Statystyki bloku: sesje siłowe (z treningId), biegi, oceny
function paStatystyki(plan) {
  const st = {
    treningi: { planowane: 0, zrobione: 0 },
    biegi: { planowane: 0, zrobione: 0, dystansM: 0, wysilekSuma: 0, wysilekN: 0 },
    oceny: { latwo: 0, wsam: 0, ciezko: 0 },
    perCw: {}
  };
  plan.sesje.forEach(function (s) {
    if (s.treningId) {
      st.treningi.planowane++;
      if (sesjaZaliczona(plan, s)) {
        st.treningi.zrobione++;
      }
      Object.keys(s.ocena || {}).forEach(function (id) {
        const o = s.ocena[id];
        if (!st.oceny.hasOwnProperty(o)) {
          return;
        }
        st.oceny[o]++;
        const cw = znajdzCwiczenie(id);
        if (!cw) {
          return;
        }
        if (!st.perCw[cw.nazwa]) {
          st.perCw[cw.nazwa] = { latwo: 0, wsam: 0, ciezko: 0, statyczne: cw.rodzajId === "rodzaj-statyczny" };
        }
        st.perCw[cw.nazwa][o]++;
      });
    } else if (paAktywnoscBiegowa(plan, s)) {
      st.biegi.planowane++;
      if (s.wynik) {
        st.biegi.zrobione++;
        st.biegi.dystansM += biegMetry(s.wynik.dystans) || 0;
        if (typeof s.wynik.wysilek === "number") {
          st.biegi.wysilekSuma += s.wynik.wysilek;
          st.biegi.wysilekN++;
        }
      }
    }
  });
  return st;
}

function paTestWBloku(plan) {
  return typeof mzWypelnione === "function" && mzWypelnione() && dane.mozliwosci.data >= String(plan.start || "").slice(0, 10);
}

// Wniosek o ćwiczeniu z ocen: "latwo", "ciezko" albo null
function paWerdykt(o) {
  const n = o.latwo + o.wsam + o.ciezko;
  if (n < PA_MIN_OCEN) {
    return null;
  }
  if (o.latwo / n >= 0.6) {
    return "latwo";
  }
  if (o.ciezko / n >= 0.5) {
    return "ciezko";
  }
  return null;
}

// Zmienia profil kolejnego bloku (p to kopia profilu poprzedniego bloku). Zwraca zdania opisujące zmiany.
function paZastosuj(plan, p) {
  const st = paStatystyki(plan);
  const zmiany = [];
  p.ocenyCw = {};
  p.testWBloku = paTestWBloku(plan);

  // Siła: liczba dni
  const t = st.treningi;
  if (t.planowane >= 4) {
    const czesc = t.zrobione / t.planowane;
    if (czesc < PA_PROG_REALIZACJI && p.cel !== "bieg" && p.dni > 2) {
      p.dniOryg = p.dniOryg || p.dni;
      p.dni = p.dni - 1;
      zmiany.push("Zrobiłeś(aś) " + t.zrobione + " z " + t.planowane + " treningów, więc ułożyłem o jeden dzień mniej w tygodniu (" + p.dni + "). Lepiej robić mniej, ale regularnie.");
    } else if (czesc >= PA_PROG_PELNEJ && p.dniOryg && p.dni < p.dniOryg) {
      p.dni = p.dni + 1;
      if (p.dni >= p.dniOryg) {
        delete p.dniOryg;
      }
      zmiany.push("Zrobiłeś(aś) " + t.zrobione + " z " + t.planowane + " treningów, więc wracam do " + p.dni + " dni w tygodniu.");
    }
  }

  // Ćwiczenia: łatwo / ciężko
  Object.keys(st.perCw).forEach(function (nazwa) {
    const o = st.perCw[nazwa];
    if (o.statyczne) {
      return;
    }
    const w = paWerdykt(o);
    if (!w) {
      return;
    }
    const zCiezarem = p.ostatnie && p.ostatnie[nazwa] > 0;
    if (!zCiezarem && p.testWBloku) {
      // Nowy test sam dobierze trudność wariantu; oceny nie nakładamy drugi raz
      return;
    }
    p.ocenyCw[nazwa] = w;
    if (w === "latwo") {
      zmiany.push(nazwa + ": oceniałeś(aś) jako łatwe, więc " + (zCiezarem ? "ciężar będzie nieco większy (ok. 5%)." : "dołożę 2 powtórzenia."));
    } else {
      zmiany.push(nazwa + ": oceniałeś(aś) jako ciężkie, więc " + (zCiezarem ? "ciężar będzie nieco mniejszy (ok. 5%)." : "zmniejszę liczbę powtórzeń."));
    }
  });

  // Bieganie: zbyt mało biegów albo za duży wysiłek → powtórzenie ostatnich tygodni planu
  const b = st.biegi;
  if (p.cel === "bieg" && b.planowane >= 3) {
    const czesc = b.zrobione / b.planowane;
    const sredni = b.wysilekN ? b.wysilekSuma / b.wysilekN : null;
    if (czesc < PA_PROG_REALIZACJI) {
      p.biegPrzes = (p.biegPrzes || 0) - 2;
      zmiany.push("Zrobiłeś(aś) " + b.zrobione + " z " + b.planowane + " biegów, więc powtórzę dwa ostatnie tygodnie planu zamiast zwiększać objętość. Plan będzie o 2 tygodnie dłuższy.");
    } else if (sredni !== null && sredni >= 8) {
      p.biegPrzes = (p.biegPrzes || 0) - 1;
      zmiany.push("Biegi oceniałeś(aś) średnio na " + (Math.round(sredni * 10) / 10) + "/10, więc powtórzę ostatni tydzień planu, żeby ciało się przyzwyczaiło. Plan będzie o tydzień dłuższy.");
    }
  }
  if (p.cel === "plywanie" && typeof pgPlywAdaptuj === "function") {
    pgPlywAdaptuj(plan, p, zmiany);
  }
  p.adaptZmiany = zmiany;
  return zmiany;
}

// ===== Okno podsumowania przed kolejnym blokiem =====

function paWiersz(kontener, etykieta, wartosc) {
  const w = document.createElement("div");
  w.className = "bieg-rek";
  w.appendChild(tekstElement("span", "", etykieta));
  w.appendChild(tekstElement("b", "", wartosc));
  kontener.appendChild(w);
}

function paOtworzPodsumowanie(plan, dalej) {
  const tlo = document.createElement("div");
  tlo.className = "gps-zgoda-tlo";
  tlo.setAttribute("role", "dialog");
  tlo.setAttribute("aria-label", "Podsumowanie bloku");
  const okno = document.createElement("div");
  okno.className = "gps-zgoda pa-okno";
  tlo.appendChild(okno);
  document.body.appendChild(tlo);
  const zamknij = function () { tlo.remove(); };

  const rysuj = function () {
    okno.innerHTML = "";
    const st = paStatystyki(plan);
    const zmiany = pgProfilKolejnegoBloku(plan).adaptZmiany || [];
    okno.appendChild(tekstElement("h2", "", "Podsumowanie bloku"));
    const karta = document.createElement("div");
    karta.className = "pp-karta";
    const t = st.treningi;
    if (t.planowane) {
      paWiersz(karta, "Treningi", t.zrobione + " z " + t.planowane + " (" + Math.round(t.zrobione * 100 / t.planowane) + "%)");
      const o = st.oceny;
      if (o.latwo + o.wsam + o.ciezko) {
        paWiersz(karta, "Oceny ćwiczeń", o.latwo + " łatwo · " + o.wsam + " w sam raz · " + o.ciezko + " ciężko");
      }
    }
    const b = st.biegi;
    if (b.planowane) {
      paWiersz(karta, "Biegi", b.zrobione + " z " + b.planowane);
      if (b.dystansM > 0) {
        paWiersz(karta, "Przebiegnięte", biegKm(b.dystansM));
      }
      if (b.wysilekN) {
        paWiersz(karta, "Średni wysiłek", (Math.round(b.wysilekSuma / b.wysilekN * 10) / 10) + "/10");
      }
    }
    okno.appendChild(karta);

    okno.appendChild(tekstElement("p", "pp-naglowek", "Co zmienię w kolejnym bloku"));
    if (zmiany.length) {
      const lista = document.createElement("ul");
      lista.className = "pa-lista";
      zmiany.slice(0, 8).forEach(function (z) { lista.appendChild(tekstElement("li", "", z)); });
      okno.appendChild(lista);
      if (zmiany.length > 8) {
        okno.appendChild(tekstElement("p", "opis", "…i " + (zmiany.length - 8) + " mniejszych zmian (zobaczysz je w „Dlaczego ten plan?”)."));
      }
    } else {
      okno.appendChild(tekstElement("p", "opis", "Nic nie wymaga zmiany: zostaje ten sam poziom, ciężary wezmę z Twoich ostatnich treningów, a ćwiczenia dodatkowe zmienią się na inne warianty."));
    }

    // Test możliwości (siła): świeży test trafia do nowego bloku
    if (plan.kreator.profil.cel === "plywanie" && typeof pgPlywAdaptuj === "function") {
      const pl = pgPlywAdaptuj(plan, JSON.parse(JSON.stringify(plan.kreator.profil)), []);
      if (pl.planowane) {
        paWiersz(karta, "Treningi na basenie", pl.zrobione + " z " + pl.planowane);
        if (pl.najM > 0) {
          paWiersz(karta, "Najdłużej bez zatrzymania", Math.round(pl.najM) + " m");
        }
        if (pl.wysilek !== null) {
          paWiersz(karta, "Średni wysiłek", (Math.round(pl.wysilek * 10) / 10) + "/10");
        }
      }
    }
    if (plan.kreator.profil.cel !== "plywanie" && (plan.kreator.profil.cel !== "bieg" || plan.kreator.profil.silaDni)) {
      const dni = typeof mzDniOdTestu === "function" ? mzDniOdTestu() : null;
      if (dni === null || dni > 56) {
        okno.appendChild(tekstElement("p", "opis", dni === null ? "Nie masz zapisanego testu możliwości. Zrób go (ok. 10 minut), a kolejny blok dobierze trudność do Twojej formy." : "Test możliwości ma ponad 8 tygodni. Zrób go ponownie (ok. 10 minut), a kolejny blok dobierze trudność do Twojej formy."));
        const test = tekstElement("button", "przycisk drugi", "Zrób test teraz");
        test.type = "button";
        test.addEventListener("click", function () { otworzMozliwosci(rysuj); });
        okno.appendChild(test);
      } else {
        okno.appendChild(tekstElement("p", "opis", "Kolejny blok użyje Twojego testu możliwości z " + mzData() + "."));
      }
    }

    const ok = tekstElement("button", "przycisk wielki", "Ułóż kolejny blok");
    ok.type = "button";
    ok.addEventListener("click", function () { zamknij(); dalej(); });
    okno.appendChild(ok);
    const nie = tekstElement("button", "przycisk wielki drugi", "Wróć");
    nie.type = "button";
    nie.addEventListener("click", zamknij);
    okno.appendChild(nie);
  };
  rysuj();
}
