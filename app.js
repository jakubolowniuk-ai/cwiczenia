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

  if (idEkranu === "ekran-dzis" && typeof rysujDzis === "function") {
    rysujDzis();
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
  if (typeof rysujDzis === "undefined" || !document.getElementById("dzis-sesje")) {
    problemy.push("dzis.js");
  }
  if (typeof dane === "undefined" || dane.wersjaUstawien !== 3) {
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

// Pierwsze narysowanie ekranu Dziś
if (typeof rysujDzis === "function" && document.getElementById("dzis-sesje")) {
  rysujDzis();
}
