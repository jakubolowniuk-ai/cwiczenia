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
}

// Po dotknięciu zakładki pokazujemy jej ekran
zakladki.forEach(function (zakladka) {
  zakladka.addEventListener("click", function () {
    pokazEkran(zakladka.dataset.ekran);
  });
});

// ===== Test zapisu danych =====

const licznikKategorii = document.getElementById("licznik-kategorii");
const licznikCwiczen = document.getElementById("licznik-cwiczen");
const przyciskTest = document.getElementById("przycisk-test");
const przyciskReset = document.getElementById("przycisk-reset");

// Wpisuje na ekranie aktualne liczby z danych
function odswiezLiczniki() {
  licznikKategorii.textContent = dane.kategorie.length;
  licznikCwiczen.textContent = dane.cwiczenia.length;
}

// Dodaje ćwiczenie testowe i zapisuje dane w telefonie
przyciskTest.addEventListener("click", function () {
  dane.cwiczenia.push({ id: "test-" + Date.now(), nazwa: "Ćwiczenie testowe" });
  zapiszDane();
  odswiezLiczniki();
});

// Kasuje zapisane dane i wczytuje stronę od nowa
przyciskReset.addEventListener("click", function () {
  localStorage.removeItem(KLUCZ_DANYCH);
  location.reload();
});

odswiezLiczniki();
