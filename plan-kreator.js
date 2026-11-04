// ===== Kreator "Ułóż mi plan": pytania krok po kroku, potem gotowy plan =====
// Ekran budujemy w JS (nakładka na całą stronę). Logika układania planu jest w plan-generator.js.

let pkProfil = null;
let pkKrok = 0;
let pkNakladka = null;
let pkWynik = null;
let pkPoprzedniPlan = null;

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
  // Bieganie: własne pytania; część siłowa tylko, gdy jest siła w planie
  if (cel === "bieg") {
    kroki.push("biegcel");
    if (pkProfil.biegCel !== "pierwsze5") {
      kroki.push("bieg20");
    }
    kroki.push("biegpoziom", "biegdni", "silabieg");
    if (pkProfil.silaDni > 0) {
      kroki.push("dosw", "czas", "bloki", "sprzet");
      if (pkProfil.sprzet === "c") {
        kroki.push("sprzetc");
      }
      kroki.push("bole");
      if (pkUkryte().length > 0) {
        kroki.push("ukryte");
      }
    }
    kroki.push("tygodni");
    if (pkProfil.silaDni > 0) {
      kroki.push("kotwice");
    }
    kroki.push("podsumowanie");
    return kroki;
  }
  kroki.push("dosw", "dni", "czas", "bloki");
  if (cel !== "kalistenika") {
    kroki.push("sprzet");
  }
  if (cel === "kalistenika" || pkProfil.sprzet === "c") {
    kroki.push("sprzetc");
  }
  kroki.push("bole");
  if (pkUkryte().length > 0) {
    kroki.push("ukryte");
  }
  if (cel !== "bieg" && cel !== "zdrowie") {
    kroki.push("priorytet");
  }
  if (cel !== "bieg") {
    kroki.push("kardio");
  }
  if (cel !== "bieg") {
    kroki.push("cele");
    if ((pkProfil.cele || []).some(function (c) { return c.typ === "sciezka"; })) {
      kroki.push("celestart");
    }
  }
  kroki.push("tygodni", "kotwice", "podsumowanie");
  return kroki;
}

// Ćwiczenia ukryte przez użytkownika w bazie
function pkUkryte() {
  return dane.cwiczenia.filter(function (c) { return c.ukryte; });
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
    cele: JSON.parse(JSON.stringify(dane.cele || [])), biegCel: null, biegPoziom: null, biegDni: 3, silaDni: 0, silaRodzaj: "biegacz", bieg20: false, rozgrzewka: true, rozciaganie: true, drazek: true, poreczy: false, zapiszZestawy: true, uzyjUkrytych: false
  };
  pkKrok = 0;
  pkWynik = null;
  pkPoprzedniPlan = null;
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
  } else if (krok === "biegcel") {
    pokazDalej = false;
    wybor("Jaki masz cel biegowy?", "Od celu zależą długość planu, rodzaje biegów i to, czym plan się kończy.", PG_BIEG_CELE.map(function (c) {
      return [c.id, c.nazwa, c.opis];
    }), pkProfil.biegCel, function (w) {
      pkProfil.biegCel = w;
      pkProfil.tygodni = pgBiegCel(w).tygodni;
      pkProfil.biegPoziom = null;
      if (w === "pierwsze5") {
        pkProfil.bieg20 = false;
      }
    });
  } else if (krok === "bieg20") {
    pokazDalej = false;
    wybor("Czy przebiegniesz 20 minut bez przerwy?", "Jeśli nie, zaczniemy od marszobiegu – to najbezpieczniejsza droga do ciągłego biegu.", [
      [true, "Tak, 20 minut dam radę", "Biegi ciągłe, z czasem coraz dłuższe"],
      [false, "Nie lub nie wiem", "Marszobieg: bieg przeplatany marszem"]
    ], pkProfil.bieg20, function (w) {
      pkProfil.bieg20 = w;
    });
  } else if (krok === "biegpoziom") {
    pokazDalej = false;
    const podp = pgBiegPoziom(Object.assign({}, pkProfil, { biegPoziom: null }));
    wybor("Jak szczegółowy ma być plan?", "Podpowiedź z Twojego celu: " + (podp === "poczatkujacy" ? "początkujący" : "zaawansowany") + ". Możesz to zmienić.", [
      ["poczatkujacy", "Początkujący", "Spokojne biegi, prosty język, mniej akcentów"],
      ["zaawansowany", "Zaawansowany", "Interwały, bieg tempowy, odcinki na dystans, dłuższe biegi"]
    ], pkProfil.biegPoziom || podp, function (w) {
      pkProfil.biegPoziom = w;
    });
  } else if (krok === "biegdni") {
    pokazDalej = false;
    const mb = pkProfil.biegCel === "pierwsze5" || !pkProfil.bieg20;
    wybor("Ile razy w tygodniu chcesz biegać?", mb ? "Przy marszobiegu 3 razy w tygodniu wystarczy – dni przerwy są potrzebne stawom i ścięgnom." : "Dni biegu rozłożę z przerwami. Najdłuższy bieg będzie na końcu tygodnia.", [2, 3, 4, 5].map(function (n) {
      return [n, n + " razy", n === 3 ? "Dobry wybór na start" : n === 5 ? "Dla osób, które biegają regularnie" : ""];
    }), pkProfil.biegDni, function (w) {
      pkProfil.biegDni = w;
    });
  } else if (krok === "silabieg") {
    pokazDalej = false;
    tresc.appendChild(pkEl("h1", "", "Trening siłowy w planie?"));
    tresc.appendChild(pkEl("p", "opis", "Siła zmniejsza ryzyko kontuzji i poprawia ekonomię biegu. Ułożę ją w dni bez biegu, nie dzień przed długim biegiem."));
    [
      [0, null, "Bez siły", "Sam bieg"],
      [1, "biegacz", "Siła dla biegacza 1×", "Nogi, pośladki, brzuch – ok. 30 min"],
      [2, "biegacz", "Siła dla biegacza 2×", "Nogi, pośladki, brzuch – ok. 30 min"],
      [1, "cale", "Całe ciało 1×", "Pełny trening siłowy"],
      [2, "cale", "Całe ciało 2×", "Pełny trening siłowy, treningi A i B"]
    ].forEach(function (o) {
      const wyb = pkProfil.silaDni === o[0] && (o[0] === 0 || pkProfil.silaRodzaj === o[1]);
      tresc.appendChild(pkOpcja(o[2], o[3], wyb, function () {
        pkProfil.silaDni = o[0];
        if (o[1]) {
          pkProfil.silaRodzaj = o[1];
        }
        pkKrok++;
        pkRysuj();
      }));
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
  } else if (krok === "sprzetc") {
    pokazDalej = false;
    wybor("Jaki sprzęt masz do ćwiczeń z masą ciała?", "Od tego zależy, czy dostaniesz podciąganie, dipy na poręczach i ćwiczenia w zwisie.", [
      ["dp", "Drążek i poręcze", "Podciąganie, dipy na poręczach, unoszenie nóg w zwisie"],
      ["d", "Tylko drążek", "Podciąganie i zwis, dipy na ławce lub krześle"],
      ["n", "Bez sprzętu", "Tylko podłoga, krzesło lub stół"]
    ], pkProfil.poreczy ? "dp" : pkProfil.drazek ? "d" : "n", function (w) {
      pkProfil.drazek = w !== "n";
      pkProfil.poreczy = w === "dp";
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
  } else if (krok === "ukryte") {
    pokazDalej = false;
    const ukryte = pkUkryte();
    const przyklady = ukryte.slice(0, 3).map(function (c) { return c.nazwa; }).join(", ");
    wybor("Użyć ukrytych ćwiczeń?", "Ukryte ćwiczenia w Twojej bazie: " + ukryte.length + " (np. " + przyklady + (ukryte.length > 3 ? "…" : "") + "). Czy mogą trafić do planu?", [
      [false, "Nie, pomiń ukryte", "Plan powstanie tylko z widocznych ćwiczeń, a ukryte zastąpię innymi"],
      [true, "Tak, mogą być w planie", "Ukryte ćwiczenia traktuję jak pozostałe"]
    ], !!pkProfil.uzyjUkrytych, function (w) {
      pkProfil.uzyjUkrytych = w;
    });
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
  } else if (krok === "tygodni" && pkProfil.cel === "bieg") {
    pokazDalej = false;
    const zal = pgBiegCel(pkProfil.biegCel).tygodni;
    wybor("Na ile tygodni plan?", "Plan powstaje blokami po 4 tygodnie, ale objętość rośnie przez cały czas, a ostatni tydzień kończy się sprawdzianem.", [4, 8, 12, 16].map(function (n) {
      return [n, n + " tygodni", n === zal ? "Zalecane dla tego celu" : ""];
    }), pkProfil.tygodni, function (w) {
      pkProfil.tygodni = w;
    });
  } else if (krok === "tygodni") {
    pokazDalej = false;
    wybor("Na jak długo ułożyć plan?", "Plan powstaje w blokach po 4 tygodnie. Kolejny blok ułożę na podstawie Twoich prawdziwych wyników.", [
      [4, "4 tygodnie", "Zacznij od tego, jeśli nie jesteś pewien(na)"],
      [8, "8 tygodni", "Dwa bloki"],
      [12, "12 tygodni", "Trzy bloki"]
    ], pkProfil.tygodni, function (w) {
      pkProfil.tygodni = w;
    });
  } else if (krok === "cele" || krok === "celestart") {
    if (!sciezkiDane) {
      pokazDalej = false;
      tresc.appendChild(pkEl("p", "opis", "Wczytuję ścieżki…"));
      sciezkiWczytaj(pkRysuj);
    } else if (krok === "cele") {
      pkRysujCele(tresc, function (f) { walidacja = f; });
    } else {
      pkRysujCeleStart(tresc, function (f) { walidacja = f; });
      pokazDalej = pkCeleBezStartu().length === 0;
    }
  } else if (krok === "kotwice") {
    pokazDalej = mzWypelnione();
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

  // Możliwości bierzemy z profilu „Moje możliwości” (Ustawienia). Bez testu nie zgadujemy.
  if (!mzWypelnione()) {
    tresc.appendChild(pkEl("h1", "", "Najpierw uzupełnij swoje możliwości"));
    tresc.appendChild(pkEl("p", "opis", "Żeby dobrze dobrać trudność ćwiczeń, powtórzenia i ciężary, potrzebuję wyników krótkiego testu (ok. 10 minut). Bez nich plan byłby zgadywany. Wyniki zapiszą się w Ustawieniach i przydadzą się przy kolejnych planach."));
    const b = pkEl("button", "przycisk wielki", "Uzupełnij teraz");
    b.type = "button";
    b.addEventListener("click", function () {
      otworzMozliwosci(function () { pkRysuj(); });
    });
    tresc.appendChild(b);
    ustawWalidacje(function () { return mzWypelnione(); });
    return;
  }
  mzDoProfilu(p);
  tresc.appendChild(pkEl("h1", "", "Twoje możliwości"));
  const dni = mzDniOdTestu();
  tresc.appendChild(pkEl("p", "opis", "Na podstawie testu z " + mzData() + " dobiorę trudność i ciężary." + (dni > 56 ? " Test ma ponad 8 tygodni – jeśli zrobiłeś(aś) postępy, zrób go ponownie." : "")));
  const klucze = p.sprzet === "c" ? ["pompki", "podciagniecia", "dipy", "przysiady", "plank"]
    : p.sprzet === "d" ? ["pompki", "przysiady", "plank", "d_pch", "d_wio", "d_prz"]
    : ["pompki", "przysiady", "plank", "s_pch", "s_wio", "s_prz"];
  const lista = mzPodsumowanie(klucze);
  if (lista.length === 0) {
    tresc.appendChild(pkEl("p", "opis", "Brak wyników dla tego rodzaju treningu – zacznę łagodnie."));
  }
  lista.forEach(function (t) {
    tresc.appendChild(pkEl("div", "mz-wiersz", t));
  });
  if (p.sprzet !== "c" && !(p.kotwice.pch > 0 && p.kotwice.wio > 0 && p.kotwice.prz > 0)) {
    tresc.appendChild(pkEl("p", "opis", "Nie wszystkie ciężary są wpisane – brakujące wyliczę ostrożnie. Zawsze możesz je zmienić w trakcie."));
  }
  const zmien = pkEl("button", "akcja", "Zmień wyniki testu");
  zmien.type = "button";
  zmien.addEventListener("click", function () {
    otworzMozliwosci(function () { pkRysuj(); });
  });
  tresc.appendChild(zmien);
  ustawWalidacje(function () { mzDoProfilu(p); return true; });
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
  tresc.appendChild(pkEl("p", "opis", (pkProfil.cel === "bieg" && pkProfil.tygodni > 4 ? "Plan na " + pkProfil.tygodni + " tygodni, teraz blok " + (pkProfil.blokNr || 1) + " (4 tygodnie)" : "Blok 4 tygodnie") + " · " + liczba + " sesji. Pierwsza dziś." + czasTekst));

  wynik.uwagi.forEach(function (u) {
    tresc.appendChild(pkEl("p", "pk-uwaga", u));
  });
  if ((pkProfil.cele || []).length) {
    tresc.appendChild(pkEl("p", "pk-uwaga", "Twoje cele: " + pkProfil.cele.map(opisCelu).join(", ") + ". Ćwiczenia celów (★) są na początku treningów, w których pracują te same mięśnie. Postęp zobaczysz w Ścieżkach."));
  }

  // Pierwszy tydzień
  tresc.appendChild(pkEl("h3", "pp-naglowek", "Pierwszy tydzień"));
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
        karta.appendChild(pkEl("div", "pk-cw" + (w.cel ? " pk-cw-cel" : ""), (w.cel ? "★ " : "") + w.cw.nazwa + " · " + opisIlosci(il, w.cw)));
      });
    } else {
      karta.appendChild(pkEl("b", "", etykieta + ": " + nazwaKategorii(s.kardio) + (s.rodzajBiegu ? " · " + biegRodzaj(s.rodzajBiegu).nazwa.toLowerCase() : "")));
      const cel = s.odcinki ? biegOpisOdcinkow(s.odcinki) : [s.dystans ? s.dystans.wartosc + " " + s.dystans.jednostka : "", s.czas ? s.czas + " min" : ""].filter(Boolean).join(" · ");
      karta.appendChild(pkEl("div", "pk-cw", cel));
      if (s.notatka) {
        karta.appendChild(pkEl("div", "pk-cw", s.notatka));
      }
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

  const wierszZ = pkEl("label", "pk-wiersz");
  const poleZ = document.createElement("input");
  poleZ.type = "checkbox";
  poleZ.checked = pkProfil.zapiszZestawy !== false;
  poleZ.addEventListener("change", function () {
    pkProfil.zapiszZestawy = poleZ.checked;
  });
  wierszZ.appendChild(poleZ);
  wierszZ.appendChild(pkEl("span", "", "Zapisz treningi jako moje zestawy (zakładka Ćwiczenia → Moje treningi)"));
  tresc.appendChild(wierszZ);

  const zacznij = pkEl("button", "przycisk wielki", "Zacznij");
  zacznij.type = "button";
  zacznij.addEventListener("click", function () {
    if (!pkWynik) {
      return;
    }
    pgZapisz(pkWynik, { zapiszZestawy: pkProfil.zapiszZestawy !== false });
    dane.cele = JSON.parse(JSON.stringify(pkProfil.cele || []));
    // Plan biegowy: ścieżka „Bieganie” jako cel, start zależny od tego, czy biegasz 20 minut
    if (pkProfil.cel === "bieg") {
      if (!dane.cele.some(function (c) { return c.typ === "sciezka" && c.id === "bieganie"; }) && dane.cele.length < CEL_MAX) {
        dane.cele.push({ typ: "sciezka", id: "bieganie" });
      }
      if (!sciezkaPostep("bieganie")) {
        dane.sciezkiPostep = dane.sciezkiPostep || {};
        dane.sciezkiPostep.bieganie = { krok: pkProfil.bieg20 ? 1 : 0, data: dzisISO() };
      }
    }
    zapiszDane();
    pkWynik = null;
    if (pkPoprzedniPlan) {
      pkPoprzedniPlan.zamkniety = true;
      pkPoprzedniPlan.zamknieto = new Date().toISOString();
      pkPoprzedniPlan = null;
      zapiszDane();
    }
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


// Kolejny blok planu: od razu ekran z gotowym planem (profil z poprzedniego bloku, ciężary z wyników)
function pkNastepnyBlok(plan) {
  const profil = pgProfilKolejnegoBloku(plan);
  pkOtworz();
  pkPoprzedniPlan = plan;
  Object.assign(pkProfil, profil);
  pkKrok = pkKroki().length - 1;
  pkRysuj();
}
