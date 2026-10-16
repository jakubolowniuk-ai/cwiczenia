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
    if (poprzedni && poprzedni.ilosc.typ === wpis.ilosc.typ) {
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

function rysujPostep() {
  postepTresc.innerHTML = "";
  const plan = aktywnyPlan();
  if (!plan) {
    postepTresc.appendChild(tekstElement("p", "opis", "Gdy ułożysz plan i zaczniesz ćwiczyć, zobaczysz tutaj swoje wyniki."));
    return;
  }

  const indeks = dzisiejszyDzienPlanu(plan);
  const liczbaDni = DNI_W_OKRESIE[plan.okres];
  const poczatek = dataPlanu(plan, 0);
  const koniec = dataPlanu(plan, liczbaDni - 1);
  postepTresc.appendChild(tekstElement("p", "opis", (plan.okres === "tydzien" ? "Plan tygodniowy" : "Plan miesięczny") + " · " + poczatek.getDate() + "." + (poczatek.getMonth() + 1) + " – " + koniec.getDate() + "." + (koniec.getMonth() + 1)));

  const wymagane = plan.sesje.filter(function (s) {
    return s.dzien <= indeks;
  });

  // Realizacja planu
  const karta = document.createElement("div");
  karta.className = "pp-karta";
  karta.appendChild(tekstElement("div", "opis", "Realizacja planu"));
  if (wymagane.length === 0) {
    karta.appendChild(tekstElement("p", "opis", "Pierwsze sesje jeszcze przed Tobą."));
  } else {
    let suma = 0;
    wymagane.forEach(function (s) {
      suma += stosunekSesji(plan, s);
    });
    const p = procent(suma, wymagane.length);
    karta.appendChild(tekstElement("div", "pp-duze", p + "%"));
    karta.appendChild(zrobPasek(p));
    karta.appendChild(tekstElement("p", "opis", "zaplanowanej pracy do dziś (serie × powtórzenia, czas i dystans)"));
  }
  postepTresc.appendChild(karta);

  // Trzy stany sesji
  const liczniki = { pelna: 0, prawie: 0, brak: 0 };
  let przed = 0;
  plan.sesje.forEach(function (s) {
    const stan = stanSesji(plan, s);
    if (stan !== "brak") {
      liczniki[stan]++;
    } else if (s.dzien < indeks) {
      liczniki.brak++;
    } else {
      przed++;
    }
  });
  const stany = document.createElement("div");
  stany.className = "pp-stany";
  [["✓", liczniki.pelna, "w pełni", "#0B6B5F"], ["◐", liczniki.prawie, "prawie", "#D97706"], ["○", liczniki.brak, "niezrobione", "#55625F"]].forEach(function (d) {
    const blok = document.createElement("div");
    blok.className = "pp-stan";
    const ikona = tekstElement("div", "ikona", d[0]);
    ikona.style.color = d[3];
    blok.appendChild(ikona);
    blok.appendChild(tekstElement("div", "liczba", String(d[1])));
    blok.appendChild(tekstElement("div", "podpis", d[2]));
    stany.appendChild(blok);
  });
  postepTresc.appendChild(stany);
  if (przed > 0) {
    postepTresc.appendChild(tekstElement("p", "opis", "Jeszcze przed Tobą: " + przed + " " + (przed === 1 ? "sesja" : "sesji") + "."));
  }

  // Aktywności
  const aktywnosci = document.createElement("div");
  aktywnosci.className = "pp-karta";
  plan.aktywnosci.forEach(function (aktywnosc) {
    const sesje = plan.sesje.filter(function (s) {
      return s.aktywnoscId === aktywnosc.id;
    });
    const due = sesje.filter(function (s) {
      return s.dzien <= indeks;
    });
    let suma = 0;
    due.forEach(function (s) {
      suma += stosunekSesji(plan, s);
    });
    const p = procent(suma, due.length);
    const zaliczone = sesje.filter(function (s) {
      return sesjaZaliczona(plan, s);
    }).length;

    const blok = document.createElement("div");
    blok.className = "pp-akt";
    const gora = document.createElement("div");
    gora.className = "pp-akt-gora";
    const kwadrat = document.createElement("span");
    kwadrat.className = "kwadrat";
    kwadrat.style.background = aktywnosc.kolor || "#0B6B5F";
    gora.appendChild(kwadrat);
    gora.appendChild(tekstElement("b", "", opisAktywnosci(aktywnosc).tytul));
    gora.appendChild(tekstElement("b", "", due.length === 0 ? "—" : p + "%"));
    blok.appendChild(gora);
    blok.appendChild(tekstElement("div", "pp-podpis", zaliczone + " z " + aktywnosc.razy + " sesji"));
    blok.appendChild(zrobPasek(p, aktywnosc.kolor));
    aktywnosci.appendChild(blok);
  });
  postepTresc.appendChild(aktywnosci);

  // Wskazówki motywacyjne
  znajdzRekordy(plan).slice(-2).reverse().forEach(function (r) {
    postepTresc.appendChild(zrobWskazowke("★", "#0B6B5F", "#DDF1E8", "Nowy rekord", znajdzCwiczenie(r.id).nazwa + ": " + opisIlosci(r.ilosc) + ". Poprzednio " + opisIlosci(r.poprzednio) + "."));
  });
  znajdzDoPoprawy(plan).slice(0, 2).forEach(function (d) {
    postepTresc.appendChild(zrobWskazowke("↗", "#D97706", "#FDEFD3", "Na następny raz", znajdzCwiczenie(d.id).nazwa + ": ostatnio " + opisIlosci(d.wykonane) + " zamiast " + opisIlosci(d.plan) + ". Celuj w " + opisIlosci(d.plan) + "."));
  });
  const seria = liczSerie(plan, indeks);
  if (seria >= 2) {
    postepTresc.appendChild(zrobWskazowke(String(seria), "#2563EB", "#E3ECFD", "Seria: " + seria + " sesji z rzędu", "Dni odpoczynku jej nie przerywają."));
  }
}
