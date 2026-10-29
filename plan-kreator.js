// ===== Kreator "Ułóż mi plan": pytania krok po kroku, potem gotowy plan =====
// Ekran budujemy w JS (nakładka na całą stronę). Logika układania planu jest w plan-generator.js.

let pkProfil = null;
let pkKrok = 0;
let pkNakladka = null;
let pkWynik = null;

const PK_CELE = [
  ["masa", "Zwiększyć masę mięśniową", "Więcej mięśni i siły, trening na masę"],
  ["rzezba", "Zredukować tkankę tłuszczową", "Rzeźba: trening siłowy plus kardio"],
  ["sila", "Zwiększyć siłę", "Ciężkie serie, mało powtórzeń"],
  ["zdrowie", "Zdrowie i kondycja", "Spokojny trening całego ciała i trochę kardio"],
  ["bieg", "Biegać / poprawić wytrzymałość", "Plan biegowy z krótkim treningiem siłowym"],
  ["kalistenika", "Ćwiczyć z masą własnego ciała", "Pompki, podciąganie, przysiady: bez siłowni"]
];
const PK_DOSW = [
  [0, "Zaczynam albo wracam po przerwie", "Nigdy nie ćwiczyłem(am) regularnie"],
  [1, "Poniżej 6 miesięcy regularnych treningów", ""],
  [2, "Od 6 miesięcy do 2 lat", ""],
  [3, "Ponad 2 lata", ""]
];
const PK_SPRZET = [
  ["s", "Pełna siłownia", "Sztangi, maszyny, wyciągi"],
  ["d", "Dom: hantle i ławka", "Bez sztangi i maszyn"],
  ["c", "Masa ciała z drążkiem", "Bez ciężarów, tylko drążek"]
];
const PK_BOLE = [
  ["plecy", "Plecy (dolny odcinek)"],
  ["kolano", "Kolana"],
  ["bark", "Barki"],
  ["nadgarstek", "Nadgarstki"]
];
const PK_PRIORYTET = [
  [null, "Bez priorytetu, równomiernie"],
  ["partia-klatka", "Klatka piersiowa"],
  ["partia-plecy", "Plecy"],
  ["partia-barki", "Barki"],
  ["partia-ramiona", "Ramiona"],
  ["partia-nogi", "Nogi"],
  ["partia-posladki", "Pośladki"],
  ["partia-brzuch", "Brzuch"]
];

// Lista kroków zależy od wybranego celu
function pkKroki() {
  const cel = pkProfil.cel || "masa";
  const kroki = ["cel"];
  kroki.push("dosw", "dni", "czas", "bloki");
  if (cel !== "kalistenika") {
    kroki.push("sprzet");
  }
  kroki.push("bole");
  if (cel !== "bieg" && cel !== "zdrowie") {
    kroki.push("priorytet");
  }
  if (cel !== "bieg") {
    kroki.push("kardio");
  }
  kroki.push("tygodni", "kotwice", "podsumowanie");
  return kroki;
}

function pkEl(tag, klasa, tekst) {
  const el = document.createElement(tag);
  if (klasa) {
    el.className = klasa;
  }
  if (tekst != null) {
    el.textContent = tekst;
  }
  return el;
}

// Duży przycisk wyboru (tytuł + opcjonalny opis); zaznaczony ma ramkę w kolorze akcentu
function pkOpcja(tytul, opis, wybrana, przy) {
  const b = pkEl("button", "pk-opcja" + (wybrana ? " wybrana" : ""));
  b.type = "button";
  b.appendChild(pkEl("b", "", tytul));
  if (opis) {
    b.appendChild(pkEl("span", "opis", opis));
  }
  b.addEventListener("click", przy);
  return b;
}

function pkOtworz() {
  const dosw = 0;
  pkProfil = {
    cel: null, dosw: dosw, dni: 3, czas: 60, sprzet: "s", bole: [], priorytet: null,
    kardio: { ile: 0, rodzaj: "spacer" }, tygodni: 4, kotwice: {}, maxPompek: null, maxPodciagniec: null,
    bieg20: false, rozgrzewka: true, rozciaganie: true
  };
  pkKrok = 0;
  pkWynik = null;
  if (!pkNakladka) {
    pkNakladka = pkEl("div", "pk-nakladka");
    pkNakladka.hidden = true;
    document.body.appendChild(pkNakladka);
  }
  pkNakladka.hidden = false;
  pkRysuj();
}

function pkZamknij() {
  pkNakladka.hidden = true;
}

function pkRysuj() {
  const kroki = pkKroki();
  const krok = kroki[pkKrok];
  pkNakladka.innerHTML = "";
  pkNakladka.scrollTop = 0;

  const gora = pkEl("div", "pk-gora");
  const wstecz = pkEl("button", "akcja", pkKrok === 0 ? "Zamknij" : "‹ Wstecz");
  wstecz.addEventListener("click", function () {
    if (pkKrok === 0) {
      pkZamknij();
    } else {
      pkKrok--;
      pkRysuj();
    }
  });
  gora.appendChild(wstecz);
  if (krok !== "podsumowanie") {
    gora.appendChild(pkEl("span", "opis", "Krok " + (pkKrok + 1) + " z " + kroki.length));
  }
  pkNakladka.appendChild(gora);

  const tresc = pkEl("div", "pk-tresc");
  pkNakladka.appendChild(tresc);
  const dalej = pkEl("button", "przycisk wielki", "Dalej");
  dalej.type = "button";
  let pokazDalej = true;
  let walidacja = null;

  function nastepny() {
    if (walidacja && !walidacja()) {
      return;
    }
    pkKrok++;
    pkRysuj();
  }

  function wybor(tytul, podpis, opcje, aktualna, ustaw) {
    tresc.appendChild(pkEl("h1", "", tytul));
    if (podpis) {
      tresc.appendChild(pkEl("p", "opis", podpis));
    }
    opcje.forEach(function (o) {
      tresc.appendChild(pkOpcja(o[1], o[2], aktualna === o[0], function () {
        ustaw(o[0]);
        pkKrok++;
        pkRysuj();
      }));
    });
  }

  if (krok === "cel") {
    pokazDalej = false;
    wybor("Jaki jest Twój cel?", "Ułożę plan, który możesz potem dowolnie edytować.", PK_CELE, pkProfil.cel, function (w) {
      pkProfil.cel = w;
      if (w === "kalistenika") {
        pkProfil.sprzet = "c";
      } else if (pkProfil.sprzet === "c") {
        pkProfil.sprzet = "s";
      }
      if (w === "rzezba" && pkProfil.kardio.ile === 0) {
        pkProfil.kardio.ile = 2;
      }
      if (w === "zdrowie" && pkProfil.kardio.ile === 0) {
        pkProfil.kardio.ile = 2;
      }
      if (w === "bieg") {
        pkProfil.kardio.ile = 0;
      }
    });
  } else if (krok === "dosw") {
    pokazDalej = false;
    wybor("Jakie masz doświadczenie?", "Od tego zależy, ile serii i jak trudne ćwiczenia dostaniesz.", PK_DOSW, pkProfil.dosw, function (w) {
      pkProfil.dosw = w;
    });
  } else if (krok === "dni") {
    pokazDalej = false;
    wybor("Ile dni w tygodniu możesz ćwiczyć?", "Wybierz tyle, ile naprawdę uda Ci się utrzymać.", [2, 3, 4, 5, 6].map(function (n) {
      return [n, n + " dni", n === 3 ? "Dobry wybór na start" : ""];
    }), pkProfil.dni, function (w) {
      pkProfil.dni = w;
    });
  } else if (krok === "czas") {
    pokazDalej = false;
    wybor("Ile czasu masz na jeden trening?", "Sam trening, bez rozgrzewki i rozciągania (o nich zapytam za chwilę). Plan na całe ciało potrzebuje ok. 60 minut. Przy krótszym czasie zostaną ćwiczenia podstawowe, a powiem Ci, co pominąłem.", [30, 45, 60, 90].map(function (n) {
      return [n, n + " minut", ""];
    }), pkProfil.czas, function (w) {
      pkProfil.czas = w;
    });
  } else if (krok === "bloki") {
    pokazDalej = false;
    const t = pgCzasyBlokow();
    tresc.appendChild(pkEl("h1", "", "Rozgrzewka i rozciąganie?"));
    tresc.appendChild(pkEl("p", "opis", "Rozgrzewka przed treningiem przygotowuje stawy i mięśnie. Rozciąganie po nim pomaga się wyciszyć. Oba bloki są poza czasem treningu, który wybrałeś(aś), więc wydłużą sesję."));
    const r = pkProfil.rozgrzewka;
    const z = pkProfil.rozciaganie;
    [
      [true, true, "Tak, jedno i drugie", "Dodatkowo ok. " + (t.rozgrzewka + t.rozciaganie) + " min (rozgrzewka " + t.rozgrzewka + ", rozciąganie " + t.rozciaganie + ")"],
      [true, false, "Tylko rozgrzewka", "Dodatkowo ok. " + t.rozgrzewka + " min"],
      [false, true, "Tylko rozciąganie", "Dodatkowo ok. " + t.rozciaganie + " min"],
      [false, false, "Nie, sam trening", "Możesz dodać je później w edycji planu"]
    ].forEach(function (o) {
      tresc.appendChild(pkOpcja(o[2], o[3], r === o[0] && z === o[1], function () {
        pkProfil.rozgrzewka = o[0];
        pkProfil.rozciaganie = o[1];
        pkKrok++;
        pkRysuj();
      }));
    });
  } else if (krok === "sprzet") {
    pokazDalej = false;
    wybor("Gdzie będziesz ćwiczyć?", "", PK_SPRZET, pkProfil.sprzet, function (w) {
      pkProfil.sprzet = w;
    });
  } else if (krok === "bole") {
    tresc.appendChild(pkEl("h1", "", "Czy coś Cię boli?"));
    tresc.appendChild(pkEl("p", "opis", "Zaznacz miejsca, które mają być oszczędzane. Pominę ćwiczenia, które je mocno obciążają. Jeśli lekarz zakazał jakichś ruchów, wybierz też te miejsca."));
    const lista = pkEl("div", "pk-lista");
    PK_BOLE.forEach(function (b) {
      const wiersz = pkEl("label", "pk-wiersz");
      const pole = document.createElement("input");
      pole.type = "checkbox";
      pole.checked = pkProfil.bole.indexOf(b[0]) !== -1;
      pole.addEventListener("change", function () {
        pkProfil.bole = pkProfil.bole.filter(function (x) { return x !== b[0]; });
        if (pole.checked) {
          pkProfil.bole.push(b[0]);
        }
      });
      wiersz.appendChild(pole);
      wiersz.appendChild(pkEl("span", "", b[1]));
      lista.appendChild(wiersz);
    });
    tresc.appendChild(lista);
    tresc.appendChild(pkEl("p", "opis", "Przy bólu skonsultuj się z lekarzem lub fizjoterapeutą. Plan nie zastępuje porady medycznej."));
  } else if (krok === "priorytet") {
    pokazDalej = false;
    wybor("Czy jakaś partia jest dla Ciebie ważniejsza?", "Dodam do planu jedno ćwiczenie więcej dla tej partii.", PK_PRIORYTET.map(function (o) {
      return [o[0] === null ? "brak" : o[0], o[1], ""];
    }), pkProfil.priorytet === null ? "brak" : pkProfil.priorytet, function (w) {
      pkProfil.priorytet = w === "brak" ? null : w;
    });
  } else if (krok === "kardio") {
    tresc.appendChild(pkEl("h1", "", "Czy dodać kardio?"));
    tresc.appendChild(pkEl("p", "opis", "Spokojne kardio w dni bez siły (ok. 25–30 minut)."));
    const rzad = pkEl("div", "pk-rzad");
    [0, 1, 2, 3].forEach(function (n) {
      const b = pkEl("button", "chip" + (pkProfil.kardio.ile === n ? " aktywny" : ""), n === 0 ? "Bez" : n + "× w tygodniu");
      b.type = "button";
      b.addEventListener("click", function () {
        pkProfil.kardio.ile = n;
        pkRysuj();
      });
      rzad.appendChild(b);
    });
    tresc.appendChild(rzad);
    if (pkProfil.kardio.ile > 0) {
      tresc.appendChild(pkEl("p", "opis", "Rodzaj kardio:"));
      const rzad2 = pkEl("div", "pk-rzad");
      [["spacer", "Szybki marsz"], ["bieganie", "Bieganie"], ["rower", "Rower"]].forEach(function (r) {
        const b = pkEl("button", "chip" + (pkProfil.kardio.rodzaj === r[0] ? " aktywny" : ""), r[1]);
        b.type = "button";
        b.addEventListener("click", function () {
          pkProfil.kardio.rodzaj = r[0];
          pkRysuj();
        });
        rzad2.appendChild(b);
      });
      tresc.appendChild(rzad2);
    }
    const wolne = 7 - pkProfil.dni;
    if (pkProfil.kardio.ile > wolne) {
      tresc.appendChild(pkEl("p", "opis", "Przy " + pkProfil.dni + " dniach treningu zostaje " + wolne + " wolnych dni, więc zmieszczę tylko tyle kardio."));
    }
  } else if (krok === "tygodni") {
    pokazDalej = false;
    wybor("Na jak długo ułożyć plan?", "Plan powstaje w blokach po 4 tygodnie. Kolejny blok ułożę na podstawie Twoich prawdziwych wyników.", [
      [4, "4 tygodnie", "Zacznij od tego, jeśli nie jesteś pewien(na)"],
      [8, "8 tygodni", "Dwa bloki"],
      [12, "12 tygodni", "Trzy bloki"]
    ], pkProfil.tygodni, function (w) {
      pkProfil.tygodni = w;
    });
  } else if (krok === "kotwice") {
    pokazDalej = pkProfil.cel !== "bieg";
    pkRysujKotwice(tresc, function (f) { walidacja = f; });
  } else if (krok === "podsumowanie") {
    pokazDalej = false;
    pkRysujPodsumowanie(tresc);
  }

  if (pokazDalej) {
    dalej.addEventListener("click", nastepny);
    pkNakladka.appendChild(dalej);
  }
}

function pkPoleLiczba(etykieta, podpowiedz, wartosc, przy) {
  const blok = pkEl("div", "pk-pole");
  blok.appendChild(pkEl("label", "", etykieta));
  if (podpowiedz) {
    blok.appendChild(pkEl("span", "opis", podpowiedz));
  }
  const pole = document.createElement("input");
  pole.type = "number";
  pole.inputMode = "decimal";
  pole.min = "0";
  pole.value = wartosc != null && wartosc !== "" ? wartosc : "";
  pole.placeholder = "nie wiem";
  pole.addEventListener("input", function () {
    przy(pole.value === "" ? null : Number(pole.value));
  });
  pole.addEventListener("focus", function () { pole.select(); });
  blok.appendChild(pole);
  return blok;
}

function pkRysujKotwice(tresc, ustawWalidacje) {
  const p = pkProfil;
  if (p.cel === "bieg") {
    tresc.appendChild(pkEl("h1", "", "Czy przebiegniesz 20 minut bez przerwy?"));
    tresc.appendChild(pkEl("p", "opis", "Od tego zależy, czy zaczniemy od marszobiegu, czy od spokojnych biegów ciągłych."));
    [[true, "Tak, 20 minut dam radę", "Biegi ciągłe, z czasem coraz dłuższe"], [false, "Nie lub nie wiem", "Marszobieg: bieg przeplatany marszem"]].forEach(function (o) {
      tresc.appendChild(pkOpcja(o[1], o[2], p.bieg20 === o[0], function () {
        p.bieg20 = o[0];
        pkKrok++;
        pkRysuj();
      }));
    });
    ustawWalidacje(function () { return true; });
    return;
  }
  if (p.sprzet === "c") {
    tresc.appendChild(pkEl("h1", "", "Sprawdźmy Twoją siłę"));
    tresc.appendChild(pkEl("p", "opis", "Wpisz, ile razy dasz radę zrobić dane ćwiczenie z poprawną techniką. Jeśli nie wiesz, zostaw puste, ułożę łagodny start."));
    tresc.appendChild(pkPoleLiczba("Pompki klasyczne (maksymalnie powtórzeń)", "Z prostym ciałem, klatka do podłogi", p.maxPompek, function (v) { p.maxPompek = v; }));
    tresc.appendChild(pkPoleLiczba("Podciągnięcia na drążku (maksymalnie)", "0 jeśli jeszcze nie dajesz rady", p.maxPodciagniec, function (v) { p.maxPodciagniec = v; }));
    ustawWalidacje(function () { return true; });
    return;
  }
  const dom = p.sprzet === "d";
  tresc.appendChild(pkEl("h1", "", "Jakie ciężary stosujesz?"));
  tresc.appendChild(pkEl("p", "opis", "Podaj ciężar, który podniesiesz 10 razy, zostawiając zapas 2–3 powtórzeń (czyli nie do upadku). Resztę ciężarów wyliczę z proporcji. Puste pole oznacza „nie wiem” i dostaniesz łagodny start."));
  if (dom) {
    tresc.appendChild(pkPoleLiczba("Wyciskanie hantli na ławce (kg na jedną rękę)", "", p.kotwice.pch, function (v) { p.kotwice.pch = v; }));
    tresc.appendChild(pkPoleLiczba("Wiosłowanie hantlą w oparciu o ławkę (kg)", "", p.kotwice.wio, function (v) { p.kotwice.wio = v; }));
    tresc.appendChild(pkPoleLiczba("Przysiad z hantlem przy klatce (kg)", "", p.kotwice.prz, function (v) { p.kotwice.prz = v; }));
  } else {
    tresc.appendChild(pkPoleLiczba("Wyciskanie sztangi na ławce (kg razem ze sztangą)", "", p.kotwice.pch, function (v) { p.kotwice.pch = v; }));
    tresc.appendChild(pkPoleLiczba("Wiosłowanie sztangą w opadzie (kg)", "", p.kotwice.wio, function (v) { p.kotwice.wio = v; }));
    tresc.appendChild(pkPoleLiczba("Przysiad ze sztangą (kg)", "Jeśli nie robisz, zostaw puste", p.kotwice.prz, function (v) { p.kotwice.prz = v; }));
  }
  tresc.appendChild(pkEl("p", "opis", "Jeśli masz wątpliwości, wpisz mniej. Zawsze możesz zwiększyć ciężar w trakcie."));
  ustawWalidacje(function () { return true; });
}

// Ekran z gotowym planem: podsumowanie, "Dlaczego ten plan?", przycisk "Zacznij"
function pkRysujPodsumowanie(tresc) {
  const wynik = pgBuduj(pkProfil);
  pkWynik = wynik;

  tresc.appendChild(pkEl("h1", "", wynik.nazwa));
  const liczba = wynik.sesje.length;
  let czasTekst = "";
  if (pkProfil.cel !== "bieg") {
    const dod = (wynik.czasBlokow.rozgrzewka || 0) + (wynik.czasBlokow.rozciaganie || 0);
    czasTekst = " Trening do " + pkProfil.czas + " min" + (dod > 0 ? " plus ok. " + dod + " min rozgrzewki i rozciągania." : ".");
  }
  tresc.appendChild(pkEl("p", "opis", "Plan na 4 tygodnie · " + liczba + " sesji. Pierwsza dziś." + czasTekst));

  wynik.uwagi.forEach(function (u) {
    tresc.appendChild(pkEl("p", "pk-uwaga", u));
  });

  // Pierwszy tydzień
  tresc.appendChild(pkEl("h3", "pp-naglowek", "Pierwszy tydzień"));
  const dniTyg = ["Dziś"];
  const nazwyDni = ["Niedz.", "Pon.", "Wt.", "Śr.", "Czw.", "Pt.", "Sob."];
  wynik.sesje.filter(function (s) { return s.dzien < 7; }).forEach(function (s) {
    const karta = pkEl("div", "formularz pk-sesja");
    const d = new Date();
    d.setDate(d.getDate() + s.dzien);
    const etykieta = s.dzien === 0 ? "Dziś" : nazwyDni[d.getDay()] + " " + d.getDate() + "." + (d.getMonth() + 1);
    if (s.trening) {
      const t = wynik.treningi[s.trening];
      karta.appendChild(pkEl("b", "", etykieta + ": " + t.nazwa));
      t.wpisy.forEach(function (w) {
        const il = pgIlosc(w);
        karta.appendChild(pkEl("div", "pk-cw", w.cw.nazwa + " · " + opisIlosci(il)));
      });
    } else {
      karta.appendChild(pkEl("b", "", etykieta + ": " + nazwaKategorii(s.kardio)));
      karta.appendChild(pkEl("div", "pk-cw", s.czas + " min · " + s.notatka));
    }
    tresc.appendChild(karta);
  });

  tresc.appendChild(pkEl("h3", "pp-naglowek", "Dlaczego ten plan?"));
  const ul = pkEl("ul", "pk-powody");
  wynik.powody.forEach(function (t) {
    ul.appendChild(pkEl("li", "", t));
  });
  tresc.appendChild(ul);

  tresc.appendChild(pkEl("p", "opis", "To plan ogólny, a nie porada indywidualna. Jeśli masz choroby albo kontuzje, skonsultuj trening z lekarzem lub trenerem."));

  const zacznij = pkEl("button", "przycisk wielki", "Zacznij");
  zacznij.type = "button";
  zacznij.addEventListener("click", function () {
    if (!pkWynik) {
      return;
    }
    pgZapisz(pkWynik);
    pkWynik = null;
    pkZamknij();
    pokazEkran("ekran-dzis");
    rysujDzis();
  });
  tresc.appendChild(zacznij);
  const zmien = pkEl("button", "przycisk drugi wielki", "Zmień odpowiedzi");
  zmien.type = "button";
  zmien.addEventListener("click", function () {
    pkKrok = 0;
    pkRysuj();
  });
  tresc.appendChild(zmien);
}

// ===== Przyciski wejścia =====

function pkDodajPrzyciski() {
  if (typeof dzisUtworzPlan !== "undefined" && dzisUtworzPlan && !document.getElementById("dzis-uloz-plan")) {
    const b = pkEl("button", "przycisk wielki", "Ułóż mi plan");
    b.id = "dzis-uloz-plan";
    b.addEventListener("click", pkOtworz);
    dzisUtworzPlan.parentNode.insertBefore(b, dzisUtworzPlan);
    dzisUtworzPlan.className = "przycisk drugi wielki";
    dzisUtworzPlan.textContent = "Utwórz plan ręcznie";
  }
  if (typeof postepNowyPlan !== "undefined" && postepNowyPlan && !document.getElementById("postep-uloz-plan")) {
    const b2 = pkEl("button", "przycisk wielki", "Ułóż mi plan");
    b2.id = "postep-uloz-plan";
    b2.addEventListener("click", pkOtworz);
    postepNowyPlan.parentNode.insertBefore(b2, postepNowyPlan);
    postepNowyPlan.className = "przycisk drugi wielki";
    postepNowyPlan.textContent = "Nowy plan ręcznie";
  }
}

pkDodajPrzyciski();
