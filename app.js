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
