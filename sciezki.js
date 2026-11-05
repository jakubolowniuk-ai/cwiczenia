// Ścieżki rozwoju: uporządkowane kroki od najłatwiejszego do celu (tylko podgląd)
const widokSciezki = document.getElementById("widok-sciezki");
const przelacznikSciezki = document.getElementById("przelacznik-sciezki");
let sciezkiDane = null;
let sciezkaOtwarta = null;
// Które grupy (Kalistenika / Siłownia / Bieganie) są rozwinięte – na starcie zwinięte
const sciezkiGrupyOtwarte = {};

function sciezkiWczytaj(poWczytaniu) {
  if (sciezkiDane) {
    poWczytaniu();
    return;
  }
  fetch("sciezki.json").then(function (o) { return o.json(); }).then(function (j) {
    sciezkiDane = j.sciezki || [];
    poWczytaniu();
  }).catch(function () {
    widokSciezki.textContent = "Nie udało się wczytać ścieżek.";
  });
}

function sciezkiEl(tag, klasa, tekst) {
  const e = document.createElement(tag);
  if (klasa) { e.className = klasa; }
  if (tekst) { e.textContent = tekst; }
  return e;
}

function sciezkiCwiczenie(nazwa) {
  return znajdzCwiczeniePoNazwie(nazwa, true);
}

function sciezkiZakres(s) {
  const poz = s.kroki.map(function (k) {
    const c = k.cwiczenie ? sciezkiCwiczenie(k.cwiczenie) : null;
    return c && c.poziom ? c.poziom : 0;
  }).filter(Boolean);
  if (!poz.length) { return null; }
  return [Math.min.apply(null, poz), Math.max.apply(null, poz)];
}

function rysujSciezki() {
  widokSciezki.innerHTML = "";
  if (sciezkaOtwarta) {
    rysujSciezke(sciezkaOtwarta);
    return;
  }
  widokSciezki.appendChild(sciezkiEl("p", "podpowiedz-poziomow", "Wybierz cel. Każda ścieżka to kolejne ćwiczenia od łatwego do trudnego – przechodź dalej, gdy spełnisz kryterium kroku."));
  [["kalistenika", "Kalistenika", "Ćwiczenia z masą ciała: podciąganie, pompki, figury."], ["silownia", "Siłownia", "Ćwiczenia z ciężarem: przysiad, wyciskanie, martwy ciąg."], ["bieganie", "Bieganie", "Od pierwszych minut biegu do półmaratonu."]].forEach(function (g) {
    const lista = sciezkiDane.filter(function (s) { return s.typ === g[0]; });
    if (!lista.length) { return; }
    const otwarta = !!sciezkiGrupyOtwarte[g[0]];
    const moje = lista.filter(function (s) { return sciezkaPostep(s.id) || czyCelSciezki(s.id); }).length;
    const naglowek = sciezkiEl("button", "sciezka-grupa-przycisk" + (otwarta ? " otwarta" : ""));
    naglowek.type = "button";
    naglowek.setAttribute("aria-expanded", otwarta ? "true" : "false");
    const tekst = sciezkiEl("span", "sciezka-grupa-tekst");
    tekst.appendChild(sciezkiEl("strong", "", g[1]));
    tekst.appendChild(sciezkiEl("span", "sciezka-meta", lista.length + " ścieżek" + (moje ? " · Twoje: " + moje : "") + " · " + g[2]));
    naglowek.appendChild(tekst);
    naglowek.appendChild(sciezkiEl("span", "sciezka-grupa-strzalka", otwarta ? "▾" : "▸"));
    naglowek.addEventListener("click", function () {
      sciezkiGrupyOtwarte[g[0]] = !otwarta;
      rysujSciezki();
    });
    widokSciezki.appendChild(naglowek);
    if (!otwarta) {
      return;
    }
    const pojemnik = sciezkiEl("div", "sciezka-grupa-lista");
    widokSciezki.appendChild(pojemnik);
    lista.forEach(function (s) {
      const karta = sciezkiEl("button", "sciezka-karta");
      karta.type = "button";
      karta.appendChild(sciezkiEl("strong", "", s.nazwa));
      karta.appendChild(sciezkiEl("span", "sciezka-cel", "Cel: " + s.cel));
      const meta = sciezkiEl("span", "sciezka-meta", s.kroki.length + " kroków");
      const z = sciezkiZakres(s);
      if (z) {
        meta.appendChild(document.createTextNode(" · poziomy "));
        meta.appendChild(znaczekPoziomu(z[0], true));
        if (z[1] !== z[0]) {
          meta.appendChild(document.createTextNode(" → "));
          meta.appendChild(znaczekPoziomu(z[1], true));
        }
      }
      karta.appendChild(meta);
      const post = sciezkaPostep(s.id);
      if (post || czyCelSciezki(s.id)) {
        const st = sciezkiEl("span", "sciezka-meta sciezka-stan", "");
        if (czyCelSciezki(s.id)) {
          st.appendChild(sciezkiEl("span", "sciezka-cel-znak", "Twój cel"));
        }
        if (post) {
          st.appendChild(document.createTextNode(post.krok >= s.kroki.length ? " Cel osiągnięty" : " Tu jesteś: krok " + (post.krok + 1) + " z " + s.kroki.length));
        }
        karta.appendChild(st);
      }
      karta.addEventListener("click", function () {
        sciezkaOtwarta = s;
        rysujSciezki();
        window.scrollTo(0, 0);
      });
      pojemnik.appendChild(karta);
    });
  });
}

function rysujSciezke(s) {
  const wstecz = sciezkiEl("button", "przycisk maly", "← Wszystkie ścieżki");
  wstecz.type = "button";
  wstecz.addEventListener("click", function () {
    sciezkaOtwarta = null;
    sciezkaWyborStartu = false;
    rysujSciezki();
  });
  widokSciezki.appendChild(wstecz);
  widokSciezki.appendChild(sciezkiEl("h2", "sciezka-tytul", s.nazwa));
  widokSciezki.appendChild(sciezkiEl("p", "sciezka-opis", s.opis));
  widokSciezki.appendChild(sciezkiEl("p", "sciezka-opis", "Cel: " + s.cel));
  if (s.uwaga) {
    widokSciezki.appendChild(sciezkiEl("p", "sciezka-uwaga", "⚠ " + s.uwaga));
  }
  widokSciezki.appendChild(sciezkiPasekPostepu(s));
  const post = sciezkaPostep(s.id);
  const ol = sciezkiEl("ol", "sciezka-kroki");
  s.kroki.forEach(function (k, i) {
    const li = sciezkiEl("li", "sciezka-krok");
    if (sciezkaWyborStartu) {
      li.classList.add("wybieralny");
      li.addEventListener("click", function () {
        ustawPostepSciezki(s.id, i + 1);
        sciezkaWyborStartu = false;
        rysujSciezki();
      });
    } else if (post) {
      li.classList.add(i < post.krok ? "zaliczony" : i === post.krok ? "aktualny" : "przyszly");
    }
    const c = k.cwiczenie ? sciezkiCwiczenie(k.cwiczenie) : null;
    const gora = sciezkiEl("div", "sciezka-krok-gora");
    gora.appendChild(sciezkiEl("span", "sciezka-nr", String(i + 1)));
    const nazwa = sciezkiEl(c && !sciezkaWyborStartu ? "button" : "span", "sciezka-nazwa", k.cwiczenie || k.nazwa);
    if (!k.cwiczenie) {
      nazwa.classList.add("bez-linku");
    }
    if (c && !sciezkaWyborStartu) {
      nazwa.type = "button";
      nazwa.addEventListener("click", function () { otworzOpis(c); });
    } else if (k.cwiczenie) {
      nazwa.classList.add("brak");
    }
    gora.appendChild(nazwa);
    if (c && c.poziom) { gora.appendChild(znaczekPoziomu(c.poziom, true)); }
    if (!sciezkaWyborStartu && post && i === post.krok) { gora.appendChild(sciezkiEl("span", "sciezka-tu", "Tu jesteś")); }
    if (!sciezkaWyborStartu && post && i < post.krok) { gora.appendChild(sciezkiEl("span", "sciezka-ok", "✓")); }
    li.appendChild(gora);
    li.appendChild(sciezkiEl("div", "sciezka-kryt", "Przejdź dalej, gdy: " + k.kryterium));
    if (k.uwaga) { li.appendChild(sciezkiEl("div", "sciezka-uwaga", "⚠ " + k.uwaga)); }
    if (c && c.ukryte) { li.appendChild(sciezkiEl("div", "sciezka-kryt", "(to ćwiczenie jest u Ciebie ukryte)")); }
    ol.appendChild(li);
  });
  widokSciezki.appendChild(ol);
  if (s.wsparcie && s.wsparcie.length) {
    widokSciezki.appendChild(sciezkiEl("h3", "sciezka-grupa", "Ćwiczenia wspierające"));
    const w = sciezkiEl("ul", "sciezka-wsparcie");
    s.wsparcie.forEach(function (n) {
      const li = sciezkiEl("li");
      const c = sciezkiCwiczenie(n);
      if (c) {
        const b = sciezkiEl("button", "sciezka-nazwa", n);
        b.type = "button";
        b.addEventListener("click", function () { otworzOpis(c); });
        li.appendChild(b);
      } else {
        li.textContent = n;
      }
      w.appendChild(li);
    });
    widokSciezki.appendChild(w);
  }
}

przelacznikSciezki.addEventListener("click", function () {
  pokazWidok("sciezki");
});
