// ===== Analiza wyników: historia ćwiczenia, szacowany 1RM, wykres, kalkulator talerzy =====
// Historia bierze zaliczone ćwiczenia ze wszystkich planów: serie z trybu „Ćwicz” (przebieg), a gdy ich nie ma –
// wpisane wykonanie albo plan (jak przy rekordach).

// ----- Historia -----

function anDataSesji(plan, s) {
  return s.dataWykonania || dataSesjiISO(plan, s);
}

// Serie ćwiczenia w sesji: [{ p, kg }]
function anSerie(s, id) {
  const zPrzebiegu = s.przebieg && s.przebieg.wyniki && s.przebieg.wyniki[id];
  if (zPrzebiegu && zPrzebiegu.length) {
    return zPrzebiegu.filter(function (r) { return typeof r.p === "number"; }).map(function (r) {
      return { p: r.p, kg: r.kg || 0 };
    });
  }
  const il = (s.wykonane && s.wykonane[id]) || (s.parametry && s.parametry[id]);
  if (!il || (il.typ !== "powtorzenia" && il.typ !== "serie-lista")) {
    return [];
  }
  const powt = listaPowtorzen(il);
  const kg = ciezaryIlosci(il);
  return powt.map(function (p, i) {
    return { p: p, kg: kg.length ? (kg[i] !== undefined ? kg[i] : kg[kg.length - 1]) : 0 };
  });
}

// Szacowany ciężar maksymalny na 1 powtórzenie, wzór Epleya: ciężar × (1 + powtórzenia / 30).
// Liczymy tylko z serii do 12 powtórzeń (przy dłuższych wzór jest mało wiarygodny).
function anEpley(kg, p) {
  if (!(kg > 0) || !(p >= 1) || p > 12) {
    return null;
  }
  return p === 1 ? kg : kg * (1 + p / 30);
}

// [{ data, kg (najcięższa seria), pPrzyKg, maxP, objetosc, e1rm, e1rmZ: {kg, p} }] od najstarszej
function anHistoria(id) {
  const poDniach = {};
  (dane.plany || []).forEach(function (plan) {
    (plan.sesje || []).forEach(function (s) {
      if (!s.zrobione || !s.zrobione[id]) {
        return;
      }
      const serie = anSerie(s, id);
      if (!serie.length) {
        return;
      }
      const data = anDataSesji(plan, s);
      const w = poDniach[data] || { data: data, kg: 0, pPrzyKg: 0, maxP: 0, objetosc: 0, e1rm: null, e1rmZ: null };
      serie.forEach(function (r) {
        if (r.kg > w.kg || (r.kg === w.kg && r.p > w.pPrzyKg)) {
          w.kg = r.kg;
          w.pPrzyKg = r.p;
        }
        w.maxP = Math.max(w.maxP, r.p);
        w.objetosc += r.kg > 0 ? r.kg * r.p : r.p;
        const e = anEpley(r.kg, r.p);
        if (e !== null && (w.e1rm === null || e > w.e1rm)) {
          w.e1rm = e;
          w.e1rmZ = { kg: r.kg, p: r.p };
        }
      });
      poDniach[data] = w;
    });
  });
  return Object.keys(poDniach).sort().map(function (k) { return poDniach[k]; });
}

function anDniOd(iso) {
  return Math.floor((Date.now() - new Date(iso + "T12:00:00").getTime()) / 86400000);
}

// Najlepszy szacowany 1RM z ostatnich 120 dni (a gdy wtedy nic – z całej historii) albo null
function anSzacowany1RM(id, historia) {
  const h = historia || anHistoria(id);
  let najlepszy = null;
  const swiezy = h.filter(function (w) { return anDniOd(w.data) <= 120; });
  (swiezy.length ? swiezy : h).forEach(function (w) {
    if (w.e1rm !== null && (!najlepszy || w.e1rm > najlepszy.kg)) {
      najlepszy = { kg: w.e1rm, z: w.e1rmZ, data: w.data };
    }
  });
  return najlepszy;
}

function anKg(x) {
  return (Math.round(x * 100) / 100).toString().replace(".", ",");
}

// ----- Wykres liniowy (jedna seria, SVG) -----
// punkty: [{ data, v }], jednostka: "kg" | "powt." | ...

function anWykres(punkty, jednostka, nazwaSerii) {
  const pudlo = document.createElement("figure");
  pudlo.className = "an-wykres";
  const W = 320;
  const H = 150;
  const L = 40;
  const R = 12;
  const T = 12;
  const B = 26;
  const vs = punkty.map(function (p) { return p.v; });
  let min = Math.min.apply(null, vs);
  let max = Math.max.apply(null, vs);
  if (max === min) {
    max = max + 1;
    min = Math.max(0, min - 1);
  }
  const zapas = (max - min) * 0.12;
  min = Math.max(0, min - zapas);
  max = max + zapas;
  const t0 = new Date(punkty[0].data + "T12:00:00").getTime();
  const t1 = new Date(punkty[punkty.length - 1].data + "T12:00:00").getTime();
  const x = function (p, i) {
    if (t1 === t0) {
      return L + (W - L - R) * (punkty.length === 1 ? 0.5 : i / (punkty.length - 1));
    }
    return L + (W - L - R) * (new Date(p.data + "T12:00:00").getTime() - t0) / (t1 - t0);
  };
  const y = function (v) { return T + (H - T - B) * (1 - (v - min) / (max - min)); };
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 " + W + " " + H);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", nazwaSerii + ": od " + anLiczba(punkty[0].v) + " do " + anLiczba(punkty[punkty.length - 1].v) + " " + jednostka + ", " + punkty.length + " treningów");
  const el = function (nazwa, atr) {
    const e = document.createElementNS(ns, nazwa);
    Object.keys(atr).forEach(function (k) { e.setAttribute(k, atr[k]); });
    svg.appendChild(e);
    return e;
  };
  // Siatka: 3 linie poziome, opisy osi Y
  [0, 0.5, 1].forEach(function (f) {
    const v = min + (max - min) * f;
    el("line", { x1: L, x2: W - R, y1: y(v), y2: y(v), class: "an-siatka" });
    const t = el("text", { x: L - 6, y: y(v) + 4, class: "an-os", "text-anchor": "end" });
    t.textContent = anLiczba(v);
  });
  // Opisy osi X: pierwsza i ostatnia data
  const dataPL = function (iso) { const c = iso.split("-"); return Number(c[2]) + "." + c[1]; };
  const t1el = el("text", { x: L, y: H - 6, class: "an-os", "text-anchor": "start" });
  t1el.textContent = dataPL(punkty[0].data);
  if (punkty.length > 1) {
    const t2el = el("text", { x: W - R, y: H - 6, class: "an-os", "text-anchor": "end" });
    t2el.textContent = dataPL(punkty[punkty.length - 1].data);
  }
  el("polyline", {
    points: punkty.map(function (p, i) { return x(p, i).toFixed(1) + "," + y(p.v).toFixed(1); }).join(" "),
    class: "an-linia"
  });
  const kropki = punkty.map(function (p, i) {
    return el("circle", { cx: x(p, i).toFixed(1), cy: y(p.v).toFixed(1), r: 4, class: "an-kropka" });
  });
  const pion = el("line", { x1: 0, x2: 0, y1: T, y2: H - B, class: "an-pion", visibility: "hidden" });
  pudlo.appendChild(svg);
  const podpis = document.createElement("figcaption");
  podpis.className = "an-podpis";
  const ostatni = punkty[punkty.length - 1];
  const domyslny = "Ostatnio (" + dataPL(ostatni.data) + "): " + anLiczba(ostatni.v) + " " + jednostka + ". Dotknij wykresu, żeby zobaczyć inne dni.";
  podpis.textContent = domyslny;
  pudlo.appendChild(podpis);
  // Dotyk / najechanie: najbliższy punkt
  const pokaz = function (zdarzenie) {
    const r = svg.getBoundingClientRect();
    const px = (zdarzenie.clientX - r.left) / r.width * W;
    let naj = 0;
    punkty.forEach(function (p, i) {
      if (Math.abs(x(p, i) - px) < Math.abs(x(punkty[naj], naj) - px)) {
        naj = i;
      }
    });
    kropki.forEach(function (k, i) { k.classList.toggle("aktywna", i === naj); });
    const xx = x(punkty[naj], naj);
    pion.setAttribute("x1", xx);
    pion.setAttribute("x2", xx);
    pion.setAttribute("visibility", "visible");
    podpis.textContent = dataPL(punkty[naj].data) + ": " + anLiczba(punkty[naj].v) + " " + jednostka + (punkty[naj].opis ? " (" + punkty[naj].opis + ")" : "");
  };
  svg.addEventListener("pointerdown", pokaz);
  svg.addEventListener("pointermove", pokaz);
  svg.addEventListener("pointerleave", function () {
    kropki.forEach(function (k) { k.classList.remove("aktywna"); });
    pion.setAttribute("visibility", "hidden");
    podpis.textContent = domyslny;
  });
  // Tabela dla czytnika ekranu i do sprawdzenia liczb
  const tabela = document.createElement("details");
  tabela.className = "an-tabela";
  tabela.appendChild(tekstElement("summary", "", "Pokaż jako tabelę"));
  const t = document.createElement("table");
  punkty.slice().reverse().slice(0, 20).forEach(function (p) {
    const w = document.createElement("tr");
    w.appendChild(tekstElement("td", "", dataPL(p.data)));
    w.appendChild(tekstElement("td", "", anLiczba(p.v) + " " + jednostka + (p.opis ? " · " + p.opis : "")));
    t.appendChild(w);
  });
  tabela.appendChild(t);
  pudlo.appendChild(tabela);
  return pudlo;
}

function anLiczba(v) {
  return (Math.round(v * 10) / 10).toString().replace(".", ",");
}

// ----- Sekcja „Twoje wyniki” w opisie ćwiczenia -----

function anSekcjaOpisu(cw) {
  const h = anHistoria(cw.id);
  if (!h.length) {
    return null;
  }
  const blok = document.createElement("div");
  blok.className = "an-blok";
  blok.appendChild(tekstElement("div", "etykieta", "Twoje wyniki"));
  const zCiezarem = h.some(function (w) { return w.kg > 0; });
  const rm = zCiezarem ? anSzacowany1RM(cw.id, h) : null;
  if (rm) {
    blok.appendChild(tekstElement("p", "", "Szacowany ciężar na 1 powtórzenie (1RM): ok. " + anKg(Math.round(rm.kg * 2) / 2) + " kg – z serii " + anKg(rm.z.kg) + " kg × " + rm.z.p + "."));
    blok.appendChild(tekstElement("p", "opis", "To szacunek ze wzoru Epleya (ciężar × (1 + powtórzenia ÷ 30)), nie wynik do sprawdzania na maksa."));
  }
  const s = typeof anStagnacja === "function" ? anStagnacja(cw.id, h) : null;
  if (s) {
    blok.appendChild(tekstElement("p", "an-uwaga", "Od " + s.tygodni + " tygodni treningowych bez poprawy (najlepiej " + s.najlepiej + ")."));
  }
  if (h.length < 2) {
    blok.appendChild(tekstElement("p", "opis", "Wykres pojawi się po drugim treningu z tym ćwiczeniem."));
    return blok;
  }
  const tryby = zCiezarem ? [
    ["Ciężar", "kg", function (w) { return w.kg; }, function (w) { return w.pPrzyKg + " powt."; }],
    ["1RM", "kg", function (w) { return w.e1rm; }, function (w) { return w.e1rmZ ? anKg(w.e1rmZ.kg) + " kg × " + w.e1rmZ.p : ""; }],
    ["Objętość", "kg", function (w) { return w.objetosc; }, function () { return "ciężar × powtórzenia, suma serii"; }]
  ] : [
    ["Powtórzenia", "powt.", function (w) { return w.maxP; }, function () { return "najlepsza seria"; }],
    ["Objętość", "powt.", function (w) { return w.objetosc; }, function () { return "suma serii"; }]
  ];
  const przelacznik = document.createElement("div");
  przelacznik.className = "an-przelacznik";
  przelacznik.setAttribute("role", "group");
  przelacznik.setAttribute("aria-label", "Co pokazać na wykresie");
  const miejsce = document.createElement("div");
  const rysuj = function (nr) {
    Array.prototype.forEach.call(przelacznik.children, function (b, i) {
      b.classList.toggle("aktywny", i === nr);
      b.setAttribute("aria-pressed", i === nr ? "true" : "false");
    });
    const tr = tryby[nr];
    const punkty = h.filter(function (w) { return tr[2](w) !== null && tr[2](w) > 0; }).map(function (w) {
      return { data: w.data, v: tr[2](w), opis: tr[3](w) };
    });
    miejsce.innerHTML = "";
    if (punkty.length < 2) {
      miejsce.appendChild(tekstElement("p", "opis", "Za mało danych do tego wykresu."));
      return;
    }
    miejsce.appendChild(anWykres(punkty, tr[1], tr[0]));
  };
  tryby.forEach(function (tr, i) {
    const b = tekstElement("button", "chip", tr[0]);
    b.type = "button";
    b.addEventListener("click", function () { rysuj(i); });
    przelacznik.appendChild(b);
  });
  blok.appendChild(przelacznik);
  blok.appendChild(miejsce);
  rysuj(0);
  return blok;
}

// Podpowiedź w trybie „Ćwicz”: jaki to procent szacowanego 1RM
function anProcent1RM(id, kg) {
  const rm = anSzacowany1RM(id);
  if (!rm || !(kg > 0)) {
    return "";
  }
  return "≈ " + Math.round(kg * 100 / rm.kg) + "% szacowanego 1RM (" + anKg(Math.round(rm.kg * 2) / 2) + " kg)";
}

// ----- Kalkulator talerzy -----

const AN_TALERZE_WSZYSTKIE = [25, 20, 15, 10, 5, 2.5, 2, 1.25, 1, 0.5];
const AN_TALERZE_DOMYSLNE = [25, 20, 15, 10, 5, 2.5, 1.25];

function anSztanga() {
  const u = dane.ustawienia.sztanga || {};
  return {
    gryf: typeof u.gryf === "number" && u.gryf >= 0 ? u.gryf : 20,
    talerze: Array.isArray(u.talerze) && u.talerze.length ? u.talerze.slice() : AN_TALERZE_DOMYSLNE.slice()
  };
}

// Ćwiczenie ze sztangą (tylko tu kalkulator ma sens)
function anZeSztanga(cw) {
  return !!cw && cw.zCiezarem && (/sztang/i.test(cw.nazwa) || (/martwy ciąg|deadlift/i.test(cw.nazwa) && !/hantl|kettl/i.test(cw.nazwa)));
}

// Zwraca { naStrone: [{kg, ile}], osiagalny, ciezar (faktyczny), nizej, wyzej, blad }
function anTalerze(cel, gryf, talerze) {
  if (!(cel >= 0)) {
    return { blad: "Wpisz ciężar." };
  }
  if (cel < gryf) {
    return { blad: "To mniej niż sam gryf (" + anKg(gryf) + " kg)." };
  }
  // Liczymy w setnych kilograma, żeby uniknąć błędów zaokrągleń
  const lista = talerze.slice().sort(function (a, b) { return b - a; }).map(function (t) { return Math.round(t * 100); });
  let reszta = Math.round((cel - gryf) * 100 / 2);
  const naStrone = [];
  lista.forEach(function (t) {
    const ile = Math.floor(reszta / t);
    if (ile > 0) {
      naStrone.push({ kg: t / 100, ile: ile });
      reszta -= ile * t;
    }
  });
  const ciezar = gryf + 2 * naStrone.reduce(function (s, x) { return s + x.kg * x.ile; }, 0);
  const wynik = { naStrone: naStrone, osiagalny: reszta === 0, ciezar: Math.round(ciezar * 100) / 100 };
  if (reszta !== 0) {
    const najmniejszy = lista.length ? lista[lista.length - 1] / 100 : 0;
    wynik.nizej = wynik.ciezar;
    wynik.wyzej = Math.round((wynik.ciezar + 2 * najmniejszy) * 100) / 100;
  }
  return wynik;
}

function anOpisTalerzy(w) {
  if (!w.naStrone.length) {
    return "Sam gryf, bez talerzy.";
  }
  return w.naStrone.map(function (x) { return x.ile + " × " + anKg(x.kg) + " kg"; }).join(" + ");
}

// Okno kalkulatora. poUzyciu(kg) – wstawia wybrany ciężar (np. do serii w trybie „Ćwicz”)
function anOtworzKalkulator(kg, poUzyciu) {
  const tlo = document.createElement("div");
  tlo.className = "gps-zgoda-tlo";
  tlo.setAttribute("role", "dialog");
  tlo.setAttribute("aria-label", "Kalkulator talerzy");
  const okno = document.createElement("div");
  okno.className = "gps-zgoda an-kalk";
  tlo.appendChild(okno);
  document.body.appendChild(tlo);
  const zamknij = function () { tlo.remove(); };
  tlo.addEventListener("click", function (e) { if (e.target === tlo) { zamknij(); } });

  okno.appendChild(tekstElement("h2", "", "Kalkulator talerzy"));
  const etykieta = tekstElement("label", "", "Ciężar na sztandze (kg, razem z gryfem)");
  const pole = document.createElement("input");
  pole.type = "number";
  pole.inputMode = "decimal";
  pole.min = "0";
  pole.step = "0.5";
  pole.className = "bz-pole an-pole";
  pole.value = kg > 0 ? String(kg) : "";
  dostepnoscPowiaz(etykieta, pole);
  okno.appendChild(etykieta);
  okno.appendChild(pole);
  const wynikEl = document.createElement("div");
  wynikEl.className = "an-wynik";
  wynikEl.setAttribute("aria-live", "polite");
  okno.appendChild(wynikEl);

  const ust = document.createElement("details");
  ust.className = "pomoc-slownik";
  ust.appendChild(tekstElement("summary", "", "Gryf i dostępne talerze"));
  const gryfEt = tekstElement("label", "", "Waga gryfu (kg)");
  const gryf = document.createElement("input");
  gryf.type = "number";
  gryf.inputMode = "decimal";
  gryf.min = "0";
  gryf.className = "bz-pole an-pole";
  gryf.value = String(anSztanga().gryf);
  dostepnoscPowiaz(gryfEt, gryf);
  ust.appendChild(gryfEt);
  ust.appendChild(gryf);
  ust.appendChild(tekstElement("p", "opis", "Talerze, które masz (zakładam, że każdego jest dość par):"));
  const chipy = document.createElement("div");
  chipy.className = "chipy";
  AN_TALERZE_WSZYSTKIE.forEach(function (t) {
    const c = tekstElement("button", "chip", anKg(t) + " kg");
    c.type = "button";
    const ustaw = function () {
      const wl = anSztanga().talerze.indexOf(t) !== -1;
      c.classList.toggle("aktywny", wl);
      c.setAttribute("aria-pressed", wl ? "true" : "false");
    };
    ustaw();
    c.addEventListener("click", function () {
      const s = anSztanga();
      const i = s.talerze.indexOf(t);
      if (i === -1) {
        s.talerze.push(t);
      } else if (s.talerze.length > 1) {
        s.talerze.splice(i, 1);
      }
      dane.ustawienia.sztanga = s;
      zapiszDane();
      ustaw();
      licz();
    });
    chipy.appendChild(c);
  });
  ust.appendChild(chipy);
  okno.appendChild(ust);

  const uzyj = tekstElement("button", "przycisk wielki", "Użyj tego ciężaru");
  uzyj.type = "button";
  uzyj.hidden = !poUzyciu;
  let doUzycia = null;
  uzyj.addEventListener("click", function () {
    if (doUzycia !== null && poUzyciu) {
      poUzyciu(doUzycia);
    }
    zamknij();
  });
  okno.appendChild(uzyj);
  const zamk = tekstElement("button", "przycisk wielki drugi", "Zamknij");
  zamk.type = "button";
  zamk.addEventListener("click", zamknij);
  okno.appendChild(zamk);

  const licz = function () {
    const s = anSztanga();
    wynikEl.innerHTML = "";
    const cel = pole.value === "" ? NaN : Number(pole.value);
    const w = anTalerze(cel, s.gryf, s.talerze);
    doUzycia = null;
    if (w.blad) {
      wynikEl.appendChild(tekstElement("p", "opis", w.blad));
      uzyj.disabled = true;
      return;
    }
    uzyj.disabled = false;
    if (w.osiagalny) {
      doUzycia = w.ciezar;
      wynikEl.appendChild(tekstElement("div", "an-strona", "Na każdą stronę:"));
      wynikEl.appendChild(tekstElement("div", "an-talerze-tekst", anOpisTalerzy(w)));
      const rys = document.createElement("div");
      rys.className = "an-rysunek";
      rys.setAttribute("aria-hidden", "true");
      w.naStrone.forEach(function (x) {
        for (let i = 0; i < x.ile; i++) {
          const t = tekstElement("span", "an-talerz", anKg(x.kg));
          t.style.height = (28 + Math.min(25, x.kg) * 2.4) + "px";
          rys.appendChild(t);
        }
      });
      wynikEl.appendChild(rys);
    } else {
      const nizej = anTalerze(w.nizej, s.gryf, s.talerze);
      const wyzej = anTalerze(w.wyzej, s.gryf, s.talerze);
      wynikEl.appendChild(tekstElement("p", "an-uwaga", "Tego ciężaru nie złożysz z tych talerzy. Najbliżej:"));
      [[w.nizej, nizej], [w.wyzej, wyzej]].forEach(function (para) {
        const b = tekstElement("button", "przycisk drugi an-opcja", anKg(para[0]) + " kg: " + anOpisTalerzy(para[1]) + " na stronę");
        b.type = "button";
        b.addEventListener("click", function () {
          pole.value = String(para[0]);
          licz();
        });
        wynikEl.appendChild(b);
      });
      uzyj.disabled = true;
    }
  };
  pole.addEventListener("input", licz);
  gryf.addEventListener("input", function () {
    const v = Number(gryf.value);
    if (gryf.value !== "" && v >= 0 && v <= 50) {
      const s = anSztanga();
      s.gryf = v;
      dane.ustawienia.sztanga = s;
      zapiszDane();
      licz();
    }
  });
  licz();
  pole.focus();
}

// ----- Stagnacja -----
// Ćwiczenie stoi w miejscu, gdy od ostatniej poprawy (szacowany 1RM, a bez ciężaru – najlepsza seria powtórzeń)
// minęły co najmniej 4 tygodnie treningowe (tygodnie, w których ćwiczenie było zrobione), a ostatni trening był w ciągu 3 tygodni.

const AN_STAGNACJA_TYGODNI = 4;

function anTydzien(iso) {
  const d = new Date(iso + "T12:00:00");
  const dzien = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dzien);
  return d.toISOString().slice(0, 10);
}

function anMiara(w) {
  if (w.kg > 0) {
    return w.e1rm !== null ? w.e1rm : w.kg * (1 + 12 / 30);
  }
  return w.maxP;
}

function anStagnacja(id, historia) {
  const cw = znajdzCwiczenie(id);
  if (!cw || cw.rodzajId === "rodzaj-statyczny" || (typeof RODZAJE_BEZ_REKORDOW !== "undefined" && RODZAJE_BEZ_REKORDOW.indexOf(cw.rodzajId) !== -1)) {
    return null;
  }
  const h = historia || anHistoria(id);
  if (h.length < AN_STAGNACJA_TYGODNI + 2 || anDniOd(h[h.length - 1].data) > 21) {
    return null;
  }
  let najlepsza = -1;
  let poprawa = 0;
  h.forEach(function (w, i) {
    const m = anMiara(w);
    // Poprawa = więcej niż 0,5% ponad dotychczasowy najlepszy wynik (drobne wahania się nie liczą)
    if (m > najlepsza * 1.005) {
      poprawa = i;
    }
    najlepsza = Math.max(najlepsza, m);
  });
  const tygodnie = {};
  h.slice(poprawa + 1).forEach(function (w) { tygodnie[anTydzien(w.data)] = true; });
  const ile = Object.keys(tygodnie).length;
  if (ile < AN_STAGNACJA_TYGODNI) {
    return null;
  }
  const w = h[poprawa];
  return {
    tygodni: ile,
    od: w.data,
    najlepiej: w.kg > 0 ? anKg(w.kg) + " kg × " + w.pPrzyKg : w.maxP + " powt.",
    zCiezarem: w.kg > 0
  };
}
