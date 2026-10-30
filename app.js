// ===== Nawigacja między ekranami =====

// Znajdujemy wszystkie zakładki i wszystkie ekrany
const zakladki = document.querySelectorAll(".zakladka");
const ekrany = document.querySelectorAll(".ekran");

// Pokazuje ekran o podanym id i zaznacza odpowiednią zakładkę
function pokazEkran(idEkranu) {
  ekrany.forEach(function (ekran) {
    ekran.classList.toggle("aktywny", ekran.id === idEkranu);
  });

  zakladki.forEach(function (zakladka) {
    zakladka.classList.toggle("aktywna", zakladka.dataset.ekran === idEkranu);
  });
  // Nowy ekran zawsze od góry (inaczej zostaje przewinięcie z poprzedniego)
  window.scrollTo(0, 0);
  const glowna = document.querySelector("main");
  if (glowna) {
    glowna.scrollTop = 0;
  }

  if (idEkranu === "ekran-dzis" && typeof rysujDzis === "function") {
    rysujDzis();
  }
  if (idEkranu === "ekran-postep" && typeof rysujPostep === "function") {
    rysujPostep();
  }
}

// Po dotknięciu zakładki pokazujemy jej ekran
zakladki.forEach(function (zakladka) {
  zakladka.addEventListener("click", function () {
    pokazEkran(zakladka.dataset.ekran);
  });
});

// ===== Czyszczenie danych (na czas budowy aplikacji) =====

const przyciskReset = document.getElementById("przycisk-reset");

przyciskReset.addEventListener("click", function () {
  if (confirm("Usunąć wszystkie zapisane dane?")) {
    localStorage.removeItem(KLUCZ_DANYCH);
    location.reload();
  }
});

// ===== Sprawdzenie, czy wszystkie pliki są w tej samej wersji =====
// Po wgraniu części plików na GitHub aplikacja potrafi działać "w połowie".
// Zamiast milczeć, pokazujemy wyraźny komunikat na górze strony.

(function sprawdzWersjePlikow() {
  const problemy = [];

  if (typeof KOLORY_AKTYWNOSCI === "undefined") {
    problemy.push("kreator.js");
  }
  if (typeof rysujKalendarz === "undefined") {
    problemy.push("kreator2.js");
  }
  if (!document.getElementById("kal-siatka")) {
    problemy.push("index.html");
  }
  if (typeof rysujDzis === "undefined") {
    problemy.push("dzis.js");
  }
  if (!document.getElementById("dzis-sesje") && problemy.indexOf("index.html") === -1) {
    problemy.push("index.html");
  }
  if (typeof rysujPostep === "undefined") {
    problemy.push("postep.js");
  }
  if (!document.getElementById("postep-tresc") && problemy.indexOf("index.html") === -1) {
    problemy.push("index.html");
  }
  if (typeof zrobIcs === "undefined") {
    problemy.push("ustawienia.js");
  }
  if (!document.getElementById("ust-alarm") && problemy.indexOf("index.html") === -1) {
    problemy.push("index.html");
  }
  if (typeof dodajCwiczeniaZListy === "undefined") {
    problemy.push("kopia.js");
  }
  if (!document.getElementById("kopia-zapisz") && problemy.indexOf("index.html") === -1) {
    problemy.push("index.html");
  }
  if (typeof sprawdzRekord === "undefined") {
    problemy.push("rekordy.js");
  }
  if (typeof otworzCwicz === "undefined") {
    problemy.push("cwicz.js");
  }
  if (typeof zrobAnatomie === "undefined") {
    problemy.push("anatomia.js");
  }
  if (typeof dane === "undefined" || dane.wersjaUstawien !== 5) {
    problemy.push("dane.js");
  }

  if (problemy.length === 0) {
    return;
  }

  const baner = document.createElement("div");
  baner.setAttribute("role", "alert");
  baner.style.cssText =
    "position:fixed;top:0;left:0;right:0;z-index:100;padding:12px 16px;" +
    "background:#B3261E;color:#fff;font-size:14px;line-height:1.4";
  baner.textContent =
    "Pliki aplikacji są w różnych wersjach. Wgraj ponownie wszystkie pliki razem. Do sprawdzenia: " +
    problemy.join(", ") + ".";
  document.body.appendChild(baner);
})();

// Strzałki wstecz na górze formularzy: robią to samo co schowany przycisk na dole
document.querySelectorAll(".wstecz[data-cel]").forEach(function (strzalka) {
  strzalka.addEventListener("click", function () {
    const cel = document.getElementById(strzalka.getAttribute("data-cel"));
    if (cel) {
      cel.click();
    }
  });
});

// Instalacja jako aplikacja i działanie bez internetu
if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
  const mialaKontroler = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register("sw.js").catch(function () {});
  navigator.serviceWorker.addEventListener("controllerchange", function () {
    if (!mialaKontroler) {
      return;
    }
    const info = document.createElement("div");
    info.style.cssText =
      "position:fixed;left:12px;right:12px;bottom:76px;z-index:100;padding:12px 16px;border-radius:12px;" +
      "background:var(--akcent);color:var(--karta);font-size:14px;display:flex;gap:12px;align-items:center;justify-content:space-between";
    info.textContent = "Jest nowa wersja aplikacji.";
    const przycisk = document.createElement("button");
    przycisk.textContent = "Odśwież";
    przycisk.style.cssText = "border:0;border-radius:8px;padding:8px 14px;font-weight:700;background:var(--karta);color:var(--akcent)";
    przycisk.addEventListener("click", function () {
      location.reload();
    });
    info.appendChild(przycisk);
    document.body.appendChild(info);
  });
}

// Jednorazowo: rekordy ćwiczeń zaliczonych wcześniej (z historii planów)
if (!dane.rekordyPrzeliczone && typeof przeliczRekordyZHistorii === "function") {
  przeliczRekordyZHistorii();
  dane.rekordyPrzeliczone = true;
  zapiszDane();
}

// Pierwsze narysowanie ekranu Dziś
if (typeof rysujDzis === "function" && document.getElementById("dzis-sesje")) {
  rysujDzis();
}

// Wszystkie pliki są już wczytane (rekordy.js ładuje się po cwiczenia.js): odśwież listę ćwiczeń z rekordami
rysujListe();
