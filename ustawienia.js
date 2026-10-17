// ===== Ustawienia: alarm (przypomnienia) i wygląd (jasny / ciemny) =====
// dane.ustawienia = { godzinaAlarmu: "18:30", alarmWlaczony: true/false, motyw: "jasny" | "ciemny" }
// Gdy motyw nie jest wybrany, aplikacja idzie za trybem telefonu.

const ustOkno = document.getElementById("ustawienia-okno");
const ustOtworz = document.getElementById("otworz-ustawienia");
const ustWstecz = document.getElementById("ustawienia-wstecz");
const ustPrzelacznik = document.getElementById("ust-alarm");
const ustGodzinaBlok = document.getElementById("ust-godzina-blok");
const ustGodzina = document.getElementById("ust-godzina");
const ustIcsBlok = document.getElementById("ust-ics-blok");
const ustIcsPrzycisk = document.getElementById("ust-ics");
const ustIcsInfo = document.getElementById("ust-ics-info");
const ustJasny = document.getElementById("ust-jasny");
const ustCiemny = document.getElementById("ust-ciemny");

// ===== Motyw =====

function motywAktualny() {
  if (dane.ustawienia.motyw === "jasny" || dane.ustawienia.motyw === "ciemny") {
    return dane.ustawienia.motyw;
  }
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "ciemny" : "jasny";
}

function zastosujMotyw() {
  const wybrany = dane.ustawienia.motyw;
  if (wybrany === "jasny" || wybrany === "ciemny") {
    document.documentElement.setAttribute("data-motyw", wybrany);
  } else {
    document.documentElement.removeAttribute("data-motyw");
  }
}

// ===== Przypomnienia w kalendarzu telefonu (plik .ics) =====
// Strona internetowa nie może sama zadzwonić jak budzik, więc dajemy plik .ics:
// po otwarciu w Kalendarzu Google dodaje wydarzenia z powiadomieniem w dni sesji.

function dwie(n) {
  return String(n).padStart(2, "0");
}

function dniZSesjami(plan) {
  const dni = {};
  plan.sesje.forEach(function (s) {
    if (!dni[s.dzien]) {
      dni[s.dzien] = [];
    }
    const a = aktywnoscPlanu(plan, s.aktywnoscId);
    if (a) {
      const nazwa = opisAktywnosci(a).tytul;
      if (dni[s.dzien].indexOf(nazwa) === -1) {
        dni[s.dzien].push(nazwa);
      }
    }
  });
  return dni;
}

// Tekst pliku .ics dla aktywnego planu; tylko dni od dzisiaj wzwyż
function zrobIcs(plan, godzina) {
  const czesci = godzina.split(":");
  const g = Number(czesci[0]);
  const m = Number(czesci[1]);
  const dzisIndeks = dzisiejszyDzienPlanu(plan);
  const dni = dniZSesjami(plan);
  const teraz = new Date();
  const znacznik = teraz.getUTCFullYear() + dwie(teraz.getUTCMonth() + 1) + dwie(teraz.getUTCDate()) + "T" + dwie(teraz.getUTCHours()) + dwie(teraz.getUTCMinutes()) + dwie(teraz.getUTCSeconds()) + "Z";
  const linie = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Cwiczenia//PL", "CALSCALE:GREGORIAN"];
  let liczba = 0;
  Object.keys(dni).forEach(function (klucz) {
    const dzien = Number(klucz);
    if (dzien < dzisIndeks) {
      return;
    }
    const d = dataPlanu(plan, dzien);
    const dataTekst = d.getFullYear() + dwie(d.getMonth() + 1) + dwie(d.getDate());
    const koniecMin = g * 60 + m + 30;
    const koniec = dwie(Math.floor(koniecMin / 60) % 24) + dwie(koniecMin % 60);
    linie.push(
      "BEGIN:VEVENT",
      "UID:" + plan.id + "-" + dzien + "@cwiczenia",
      "DTSTAMP:" + znacznik,
      "DTSTART:" + dataTekst + "T" + dwie(g) + dwie(m) + "00",
      "DTEND:" + dataTekst + "T" + koniec + "00",
      "SUMMARY:Ćwiczenia: " + dni[klucz].join(", "),
      "DESCRIPTION:Czas na dzisiejszą sesję. Otwórz aplikację Ćwiczenia.",
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      "DESCRIPTION:Ćwiczenia",
      "TRIGGER:PT0M",
      "END:VALARM",
      "END:VEVENT"
    );
    liczba++;
  });
  linie.push("END:VCALENDAR");
  return { tekst: linie.join("\r\n"), liczba: liczba };
}

function formaPrzypomnien(n) {
  if (n === 1) {
    return "przypomnienie";
  }
  if (n % 10 >= 2 && n % 10 <= 4 && !(n % 100 >= 12 && n % 100 <= 14)) {
    return "przypomnienia";
  }
  return "przypomnień";
}

function pobierzIcs() {
  const plan = aktywnyPlan();
  if (!plan) {
    return;
  }
  const wynik = zrobIcs(plan, dane.ustawienia.godzinaAlarmu);
  if (wynik.liczba === 0) {
    ustIcsInfo.textContent = "W planie nie ma już dni z sesjami do przypomnienia.";
    return;
  }
  const plik = new Blob([wynik.tekst], { type: "text/calendar" });
  const adres = URL.createObjectURL(plik);
  const link = document.createElement("a");
  link.href = adres;
  link.download = "cwiczenia-przypomnienia.ics";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(function () {
    URL.revokeObjectURL(adres);
  }, 2000);
  ustIcsInfo.textContent = "Pobrano. Otwórz plik, a Kalendarz doda " + wynik.liczba + " " + formaPrzypomnien(wynik.liczba) + ". Po zmianie godziny pobierz plik jeszcze raz.";
}

// ===== Rysowanie ekranu =====

function rysujUstawienia() {
  const wlaczony = dane.ustawienia.alarmWlaczony !== false;
  ustPrzelacznik.setAttribute("aria-checked", wlaczony ? "true" : "false");
  ustPrzelacznik.classList.toggle("wlaczony", wlaczony);
  ustGodzinaBlok.hidden = !wlaczony;
  ustGodzina.value = dane.ustawienia.godzinaAlarmu || "18:30";
  ustIcsBlok.hidden = !wlaczony || !aktywnyPlan();

  const motyw = motywAktualny();
  ustJasny.classList.toggle("aktywny", motyw === "jasny");
  ustCiemny.classList.toggle("aktywny", motyw === "ciemny");
}

ustOtworz.addEventListener("click", function () {
  ustIcsInfo.textContent = "";
  rysujUstawienia();
  ustOkno.hidden = false;
});

ustWstecz.addEventListener("click", function () {
  ustOkno.hidden = true;
});

ustPrzelacznik.addEventListener("click", function () {
  dane.ustawienia.alarmWlaczony = dane.ustawienia.alarmWlaczony === false;
  zapiszDane();
  rysujUstawienia();
});

ustGodzina.addEventListener("change", function () {
  if (/^\d{2}:\d{2}$/.test(ustGodzina.value)) {
    dane.ustawienia.godzinaAlarmu = ustGodzina.value;
    zapiszDane();
    ustIcsInfo.textContent = "";
  } else {
    ustGodzina.value = dane.ustawienia.godzinaAlarmu || "18:30";
  }
});

ustIcsPrzycisk.addEventListener("click", pobierzIcs);

function wybierzMotyw(motyw) {
  dane.ustawienia.motyw = motyw;
  zapiszDane();
  zastosujMotyw();
  rysujUstawienia();
}

ustJasny.addEventListener("click", function () {
  wybierzMotyw("jasny");
});
ustCiemny.addEventListener("click", function () {
  wybierzMotyw("ciemny");
});

zastosujMotyw();
