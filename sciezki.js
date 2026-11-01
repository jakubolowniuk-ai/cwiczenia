// Ścieżki rozwoju: uporządkowane kroki od najłatwiejszego do celu (tylko podgląd)
const widokSciezki = document.getElementById("widok-sciezki");
const przelacznikSciezki = document.getElementById("przelacznik-sciezki");
let sciezkiDane = null;
let sciezkaOtwarta = null;

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
    const c = sciezkiCwiczenie(k.cwiczenie);
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
  [["kalistenika", "Kalistenika"], ["silownia", "Siłownia"]].forEach(function (g) {
    const lista = sciezkiDane.filter(function (s) { return s.typ === g[0]; });
    if (!lista.length) { return; }
    widokSciezki.appendChild(sciezkiEl("h2", "sciezka-grupa", g[1] + " (" + lista.length + ")"));
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
      karta.addEventListener("click", function () {
        sciezkaOtwarta = s;
        rysujSciezki();
        window.scrollTo(0, 0);
      });
      widokSciezki.appendChild(karta);
    });
  });
}

function rysujSciezke(s) {
  const wstecz = sciezkiEl("button", "przycisk maly", "← Wszystkie ścieżki");
  wstecz.type = "button";
  wstecz.addEventListener("click", function () {
    sciezkaOtwarta = null;
    rysujSciezki();
  });
  widokSciezki.appendChild(wstecz);
  widokSciezki.appendChild(sciezkiEl("h2", "sciezka-tytul", s.nazwa));
  widokSciezki.appendChild(sciezkiEl("p", "sciezka-opis", s.opis));
  widokSciezki.appendChild(sciezkiEl("p", "sciezka-opis", "Cel: " + s.cel));
  if (s.uwaga) {
    widokSciezki.appendChild(sciezkiEl("p", "sciezka-uwaga", "⚠ " + s.uwaga));
  }
  const ol = sciezkiEl("ol", "sciezka-kroki");
  s.kroki.forEach(function (k, i) {
    const li = sciezkiEl("li", "sciezka-krok");
    const c = sciezkiCwiczenie(k.cwiczenie);
    const gora = sciezkiEl("div", "sciezka-krok-gora");
    gora.appendChild(sciezkiEl("span", "sciezka-nr", String(i + 1)));
    const nazwa = sciezkiEl(c ? "button" : "span", "sciezka-nazwa", k.cwiczenie);
    if (c) {
      nazwa.type = "button";
      nazwa.addEventListener("click", function () { otworzOpis(c); });
    } else {
      nazwa.classList.add("brak");
    }
    gora.appendChild(nazwa);
    if (c && c.poziom) { gora.appendChild(znaczekPoziomu(c.poziom, true)); }
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
