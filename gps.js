// ===== GPS: zapis tras, pomiar na ekranie biegu, import i eksport GPX =====
// Surowe punkty trasy leżą w IndexedDB (osobna baza), nie w localStorage. Nie wchodzą do kopii zapasowej (są duże),
// ale każdą trasę można pobrać jako plik GPX. Logika liczenia jest w gps-logika.js.

const GPS_BAZA = "cwiczenia-gps";
const GPS_SKLEP = "trasy";

let gpsBazaObietnica = null;
let gpsPunkty = [];
let gpsStatusy = [];
let gpsFiltrWynik = null;
let gpsNasluch = null;
let gpsTrasaId = null;
let gpsOstatniZapis = 0;
let gpsKomunikat = "";

function gpsDostepny() {
  return !!(navigator.geolocation);
}

function gpsWlaczony() {
  return dane.ustawienia.biegGps === true && gpsDostepny();
}

// ----- IndexedDB -----

function gpsBaza() {
  if (!gpsBazaObietnica) {
    gpsBazaObietnica = new Promise(function (ok, blad) {
      if (!window.indexedDB) {
        blad(new Error("brak IndexedDB"));
        return;
      }
      const zapytanie = indexedDB.open(GPS_BAZA, 1);
      zapytanie.onupgradeneeded = function () {
        zapytanie.result.createObjectStore(GPS_SKLEP, { keyPath: "id" });
      };
      zapytanie.onsuccess = function () { ok(zapytanie.result); };
      zapytanie.onerror = function () { blad(zapytanie.error); };
    });
  }
  return gpsBazaObietnica;
}

function gpsTransakcja(tryb, praca) {
  return gpsBaza().then(function (baza) {
    return new Promise(function (ok, blad) {
      const t = baza.transaction(GPS_SKLEP, tryb);
      const sklep = t.objectStore(GPS_SKLEP);
      const wynik = praca(sklep);
      t.oncomplete = function () { ok(wynik && "result" in wynik ? wynik.result : undefined); };
      t.onerror = function () { blad(t.error); };
      t.onabort = function () { blad(t.error); };
    });
  });
}

function gpsZapiszTrase(id, punkty) {
  return gpsTransakcja("readwrite", function (s) { return s.put({ id: id, punkty: punkty, zapisano: Date.now() }); });
}

function gpsCzytajTrase(id) {
  return gpsTransakcja("readonly", function (s) { return s.get(id); }).then(function (w) {
    return w ? w.punkty : null;
  });
}

function gpsUsunTrase(id) {
  if (!id) {
    return Promise.resolve();
  }
  return gpsTransakcja("readwrite", function (s) { return s.delete(id); }).catch(function () {});
}

function gpsNowyId() {
  return "t-" + Date.now().toString(36) + "-" + Math.floor(Math.random() * 1e6).toString(36);
}

// Usuwa trasy, do których nic już nie prowadzi (np. usunięty plan albo odrzucony pomiar)
function gpsSprzatnij() {
  const uzywane = {};
  (dane.plany || []).forEach(function (p) {
    (p.sesje || []).forEach(function (s) {
      if (s.wynik && s.wynik.trasaId) {
        uzywane[s.wynik.trasaId] = true;
      }
      if (s.wynikSzkic && s.wynikSzkic.trasaId) {
        uzywane[s.wynikSzkic.trasaId] = true;
      }
    });
  });
  if (biegStan && biegStan.trasaId) {
    uzywane[biegStan.trasaId] = true;
  }
  gpsTransakcja("readonly", function (s) { return s.getAllKeys(); }).then(function (klucze) {
    (klucze || []).forEach(function (k) {
      if (!uzywane[k]) {
        gpsUsunTrase(k);
      }
    });
  }).catch(function () {});
}

// ----- Pomiar na żywo -----

function gpsZapiszNaDysk(wymus) {
  if (!gpsTrasaId || !gpsPunkty.length) {
    return;
  }
  const teraz = Date.now();
  if (!wymus && teraz - gpsOstatniZapis < 5000) {
    return;
  }
  gpsOstatniZapis = teraz;
  gpsZapiszTrase(gpsTrasaId, gpsPunkty.slice()).catch(function () {});
}

function gpsPrzelicz() {
  gpsFiltrWynik = gpsFiltr(gpsPunkty);
  gpsStatusy = gpsFiltrWynik.status;
}

function gpsPunktPrzyszedl(poz) {
  if (!biegStan || !biegStan.gps || biegStan.stan !== "trwa") {
    return;
  }
  const c = poz.coords;
  gpsPunkty.push([c.latitude, c.longitude, poz.timestamp, typeof c.accuracy === "number" ? c.accuracy : null,
    typeof c.altitude === "number" ? c.altitude : null, biegStan.gpsSeg || 0]);
  gpsKomunikat = "";
  gpsPrzelicz();
  gpsZapiszNaDysk(false);
  if (typeof biegRysujGps === "function") {
    biegRysujGps();
  }
}

function gpsBladPrzyszedl(blad) {
  if (blad && blad.code === 1) {
    // Brak zgody: bieg liczymy dalej, ale bez GPS
    gpsKomunikat = "Brak zgody na lokalizację. Bieg liczony jest bez GPS. Zgodę włączysz w ustawieniach przeglądarki (kłódka przy adresie strony).";
    if (biegStan) {
      biegStan.gps = false;
      biegZapiszStan();
    }
    gpsZatrzymajNasluch();
  } else {
    gpsKomunikat = "GPS nie może ustalić pozycji. Wyjdź na otwartą przestrzeń.";
  }
  if (typeof biegRysujGps === "function") {
    biegRysujGps();
  }
}

function gpsZatrzymajNasluch() {
  if (gpsNasluch !== null && gpsDostepny()) {
    navigator.geolocation.clearWatch(gpsNasluch);
  }
  gpsNasluch = null;
}

function gpsZacznijNasluch() {
  gpsZatrzymajNasluch();
  if (!gpsDostepny()) {
    return;
  }
  gpsNasluch = navigator.geolocation.watchPosition(gpsPunktPrzyszedl, gpsBladPrzyszedl, {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 20000
  });
}

// Start pomiaru (nowy bieg albo powrót po odświeżeniu strony)
function gpsStartPomiaru() {
  gpsPunkty = [];
  gpsStatusy = [];
  gpsFiltrWynik = null;
  gpsKomunikat = "";
  gpsTrasaId = biegStan.trasaId;
  gpsOstatniZapis = Date.now();
  gpsZacznijNasluch();
  // Po odświeżeniu strony dociągamy punkty zapisane wcześniej
  gpsCzytajTrase(gpsTrasaId).then(function (stare) {
    if (stare && stare.length) {
      gpsPunkty = stare.concat(gpsPunkty);
      gpsPunkty.sort(function (a, b) { return a[2] - b[2]; });
      gpsPrzelicz();
    }
  }).catch(function () {});
}

// Koniec pomiaru: zwraca podsumowanie albo null
function gpsKoniecPomiaru() {
  gpsZatrzymajNasluch();
  gpsZapiszNaDysk(true);
  const wynik = gpsPunkty.length ? gpsPodsumuj(gpsPunkty) : null;
  const id = gpsTrasaId;
  const ile = gpsPunkty.length;
  gpsTrasaId = null;
  gpsPunkty = [];
  gpsStatusy = [];
  gpsFiltrWynik = null;
  return wynik ? { trasaId: id, podsumowanie: wynik, punktow: ile } : null;
}

function gpsNowySegment() {
  if (biegStan) {
    biegStan.gpsSeg = (biegStan.gpsSeg || 0) + 1;
  }
}

// Po powrocie na kartę przeglądarka potrafi wstrzymać lokalizację – uruchamiamy nasłuch od nowa
document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "visible" && biegStan && biegStan.gps && gpsNasluch !== null) {
    gpsZacznijNasluch();
  } else if (document.visibilityState === "hidden") {
    gpsZapiszNaDysk(true);
  }
});
window.addEventListener("pagehide", function () { gpsZapiszNaDysk(true); });

// ----- Ekran biegu: kafle i komunikat -----

function gpsOpisSygnalu() {
  if (!biegStan || !biegStan.gps) {
    return gpsKomunikat || "GPS wyłączony";
  }
  if (biegStan.stan !== "trwa") {
    return "GPS wstrzymany na czas pauzy";
  }
  const s = gpsSygnal(gpsPunkty, gpsStatusy, Date.now());
  if (s.stan === "szukam") {
    return "GPS szuka sygnału… Poczekaj chwilę na otwartej przestrzeni.";
  }
  if (s.stan === "brak") {
    return "Brak sygnału GPS. Sprawdź, czy aplikacja jest na wierzchu, a ekran włączony.";
  }
  if (s.stan === "slaby") {
    return "Słaby sygnał GPS – dystans może być zaniżony.";
  }
  return "GPS działa" + (s.dokl !== null ? " (±" + Math.round(s.dokl) + " m)" : "");
}

function biegRysujGps() {
  if (!biegEkran || !biegEkran._el || !biegEkran._el.gps) {
    return;
  }
  const el = biegEkran._el.gps;
  const wlaczony = !!(biegStan && biegStan.gps);
  el.dystWart.textContent = wlaczony && gpsFiltrWynik ? biegKm(gpsFiltrWynik.dystansM) : "—";
  el.dystEtyk.textContent = wlaczony ? "dystans (GPS)" : "dystans (bez GPS)";
  let tempo = null;
  if (wlaczony && gpsFiltrWynik && biegStan.stan === "trwa") {
    tempo = gpsTempoOkno(gpsPunkty, gpsStatusy, Date.now());
  }
  el.tempoWart.textContent = tempo ? biegTempoTekst(Math.round(tempo)) : "—";
  el.tempoEtyk.textContent = wlaczony ? "tempo (min/km)" : "tempo";
  const tekst = gpsOpisSygnalu();
  el.status.textContent = tekst;
  el.status.classList.toggle("ostrzezenie", wlaczony && /Słaby|Brak/.test(tekst) || (!wlaczony && !!gpsKomunikat));
  el.przelacznik.textContent = wlaczony ? "Wyłącz GPS (bieżnia, hala)" : "Włącz GPS";
  el.przelacznik.hidden = !wlaczony && !gpsDostepny();
}

// Komunikat o GPS pod kaflami ekranu biegu (wywoływane z biegOtworzEkran). Zwraca elementy do odświeżania.
function gpsZbudujEkran(ekran, k) {
  const status = tekstElement("div", "bieg-gps-status", "");
  status.setAttribute("aria-live", "polite");
  const przelacznik = tekstElement("button", "akcja bieg-gps-przycisk", "");
  przelacznik.type = "button";
  przelacznik.addEventListener("click", function () {
    if (biegStan.gps) {
      gpsKoniecPomiaruBezZapisu();
      biegStan.gps = false;
      gpsKomunikat = "";
    } else if (gpsDostepny()) {
      biegStan.gps = true;
      biegStan.trasaId = biegStan.trasaId || gpsNowyId();
      biegStan.gpsSeg = (biegStan.gpsSeg || 0) + 1;
      gpsStartPomiaru();
    }
    biegZapiszStan();
    biegRysujGps();
  });
  const wrapper = document.createElement("div");
  wrapper.className = "bieg-gps";
  wrapper.appendChild(status);
  wrapper.appendChild(przelacznik);
  ekran.appendChild(wrapper);
  return { dystWart: k.dystWart, dystEtyk: k.dystEtyk, tempoWart: k.tempoWart, tempoEtyk: k.tempoEtyk, status: status, przelacznik: przelacznik };
}

// Wyłączenie GPS w trakcie biegu: punkty zebrane do tej pory zostają (liczą się do dystansu)
function gpsKoniecPomiaruBezZapisu() {
  gpsZatrzymajNasluch();
  gpsZapiszNaDysk(true);
}

// ----- Zgoda przed pierwszym użyciem -----

function gpsZapytajOZgode(poWyborze) {
  const tlo = document.createElement("div");
  tlo.className = "gps-zgoda-tlo";
  tlo.setAttribute("role", "dialog");
  tlo.setAttribute("aria-label", "Pomiar GPS");
  const okno = document.createElement("div");
  okno.className = "gps-zgoda";
  okno.appendChild(tekstElement("h2", "", "Mierzyć dystans przez GPS?"));
  okno.appendChild(tekstElement("p", "opis", "Aplikacja użyje lokalizacji telefonu tylko w czasie biegu, żeby policzyć dystans i tempo. Trasa zostaje w Twoim telefonie i nie jest nigdzie wysyłana."));
  okno.appendChild(tekstElement("p", "opis", "Podczas biegu ekran musi być włączony, a aplikacja na wierzchu. Na bieżni lub hali wybierz „Bez GPS”. Wybór zmienisz w Ustawieniach."));
  const tak = tekstElement("button", "przycisk wielki", "Włącz GPS");
  tak.type = "button";
  const nie = tekstElement("button", "przycisk wielki drugi", "Bez GPS (sam stoper)");
  nie.type = "button";
  const wybor = function (v) {
    dane.ustawienia.biegGps = v;
    zapiszDane();
    tlo.remove();
    if (typeof biegRysujUstawienia === "function") {
      biegRysujUstawienia();
    }
    poWyborze();
  };
  tak.addEventListener("click", function () { wybor(true); });
  nie.addEventListener("click", function () { wybor(false); });
  okno.appendChild(tak);
  okno.appendChild(nie);
  tlo.appendChild(okno);
  document.body.appendChild(tlo);
}

// ----- Wynik biegu: dane GPS do szkicu -----

// Wywoływane z biegStop. Zwraca pola do dopisania do wynikSzkic.
function gpsDoSzkicu(st0) {
  if (!st0.trasaId) {
    return null;
  }
  const k = gpsKoniecPomiaru();
  if (!k) {
    gpsUsunTrase(st0.trasaId);
    return { brak: true };
  }
  const dystans = gpsDystansWyniku(k.podsumowanie.dystansM);
  if (!dystans) {
    gpsUsunTrase(st0.trasaId);
    return { brak: true };
  }
  return {
    trasaId: k.trasaId,
    dystans: dystans,
    gps: {
      dystansM: Math.round(k.podsumowanie.dystansM),
      punktow: k.punktow,
      odrzuconych: k.podsumowanie.odrzuconych,
      slaby: k.podsumowanie.slabySygnal,
      filtr: k.podsumowanie.wersjaFiltra
    }
  };
}

// ----- Import GPX -----

function gpsImportuj(plan, sesja) {
  const wej = document.createElement("input");
  wej.type = "file";
  wej.accept = ".gpx,application/gpx+xml,application/xml,text/xml,application/octet-stream";
  wej.addEventListener("change", function () {
    const plik = wej.files && wej.files[0];
    if (!plik) {
      return;
    }
    const czytnik = new FileReader();
    czytnik.onload = function () {
      const w = gpsZGpx(String(czytnik.result));
      if (w.blad) {
        alert(w.blad);
        return;
      }
      const p = gpsPodsumujGpx(w.punkty);
      const dystans = gpsDystansWyniku(p.dystansM);
      if (!dystans || p.czasS < 30) {
        alert("W tej trasie jest za mało ruchu (poniżej 50 m albo 30 s), więc nie zapisuję jej jako biegu.");
        return;
      }
      const id = gpsNowyId();
      gpsZapiszTrase(id, w.punkty).catch(function () {});
      sesja.wynikSzkic = {
        odcinkiWyniki: null,
        czas: { wartosc: p.czasS, jednostka: "s" },
        dystans: dystans,
        pauzy: p.pauzy,
        czasPauzS: p.czasPauzS,
        zrodlo: "gps",
        data: p.data,
        dataBiegu: p.data,
        trasaId: id,
        gps: { dystansM: Math.round(p.dystansM), punktow: p.punktow, odrzuconych: p.odrzuconych, slaby: false, filtr: GPS_FILTR.wersja, import: true }
      };
      zapiszDane();
      rysujDzis();
      otworzWynik(plan, sesja);
    };
    czytnik.onerror = function () { alert("Nie udało się odczytać pliku."); };
    czytnik.readAsText(plik);
  });
  wej.click();
}

// ----- Szczegóły zapisanego biegu: GPX i przeliczenie -----

function gpsPobierzGpx(b) {
  gpsCzytajTrase(b.trasaId).then(function (punkty) {
    if (!punkty || !punkty.length) {
      alert("Trasa nie jest już zapisana w tym telefonie.");
      return;
    }
    pobierzPlik("bieg-" + b.data + ".gpx", gpsDoGpx(punkty, "Bieg " + b.data));
  }).catch(function () { alert("Nie udało się odczytać trasy."); });
}

// Przelicza dystans jednego biegu z surowych punktów aktualnym filtrem. Zwraca obietnicę { stare, nowe } albo null.
function gpsPrzeliczBieg(sesja) {
  const w = sesja.wynik;
  if (!w || !w.trasaId) {
    return Promise.resolve(null);
  }
  return gpsCzytajTrase(w.trasaId).then(function (punkty) {
    if (!punkty || !punkty.length) {
      return null;
    }
    const pod = gpsPodsumuj(punkty);
    const nowy = gpsDystansWyniku(pod.dystansM);
    if (!nowy) {
      return null;
    }
    const stare = w.dystans ? biegMetry(w.dystans) : null;
    w.dystans = nowy;
    w.gps = Object.assign({}, w.gps || {}, {
      dystansM: Math.round(pod.dystansM),
      punktow: punkty.length,
      odrzuconych: pod.odrzuconych,
      slaby: pod.slabySygnal,
      filtr: pod.wersjaFiltra
    });
    zapiszDane();
    return { stare: stare, nowe: biegMetry(nowy) };
  }).catch(function () { return null; });
}

function gpsPrzeliczWszystkie(info) {
  const sesje = [];
  dane.plany.forEach(function (p) {
    p.sesje.forEach(function (s) {
      if (s.wynik && s.wynik.trasaId) {
        sesje.push(s);
      }
    });
  });
  if (!sesje.length) {
    info.textContent = "Nie ma jeszcze biegów z zapisaną trasą GPS.";
    return;
  }
  info.textContent = "Przeliczam…";
  let zmienione = 0;
  let brak = 0;
  sesje.reduce(function (lancuch, s) {
    return lancuch.then(function () {
      return gpsPrzeliczBieg(s).then(function (r) {
        if (!r) {
          brak++;
        } else if (r.stare === null || Math.abs(r.stare - r.nowe) >= 5) {
          zmienione++;
        }
      });
    });
  }, Promise.resolve()).then(function () {
    info.textContent = "Przeliczono " + (sesje.length - brak) + " z " + sesje.length + " biegów, zmieniły się dystanse w " + zmienione + "." + (brak ? " Brak zapisanej trasy dla " + brak + "." : "");
    if (typeof rysujDzis === "function") {
      rysujDzis();
    }
  });
}

// ----- Ustawienia -----

(function () {
  const przycisk = document.getElementById("ust-bieg-przelicz");
  if (przycisk) {
    przycisk.addEventListener("click", function () {
      gpsPrzeliczWszystkie(document.getElementById("ust-bieg-przelicz-info"));
    });
  }
  const gps = document.getElementById("ust-bieg-gps");
  if (gps) {
    gps.addEventListener("click", function () {
      dane.ustawienia.biegGps = dane.ustawienia.biegGps !== true;
      zapiszDane();
      biegRysujUstawienia();
    });
  }
  setTimeout(gpsSprzatnij, 4000);
})();
