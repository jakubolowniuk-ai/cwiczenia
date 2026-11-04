// ===== GPS: logika bez interfejsu (filtr, dystans, tempo, GPX) =====
// Punkt = [szerokość, długość, czas (ms), dokładność (m) albo null, wysokość (m) albo null, odcinek trasy]
// "Odcinek trasy" rośnie po każdej pauzie, więc pierwszy punkt po wznowieniu nie łączy się z ostatnim sprzed pauzy.
// Surowe punkty zapisujemy bez zmian, a dystans liczymy z przefiltrowanych (filtr można poprawić i przeliczyć stare biegi).

const GPS_FILTR = {
  wersja: 1,
  maxDokl: 25,      // odrzucamy punkty o dokładności gorszej niż 25 m
  maxPredkosc: 12,  // m/s (43 km/h) – szybciej człowiek nie biegnie, to skok sygnału
  minKrok: 3,       // m – nowy punkt liczymy dopiero, gdy oddalimy się od poprzedniego o tyle, ile wynosi niepewność (min. 3 m)
  resetPoSkokach: 8 // tyle skoków z rzędu oznacza, że to my się przesunęliśmy, a nie sygnał
};

const GPS_ODRZUCONY = 0;
const GPS_UZYTY = 1;
const GPS_STOI = 2;

function gpsOdleglosc(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Zwraca { dystansM, status[] (GPS_ODRZUCONY | GPS_UZYTY | GPS_STOI), uzyte, odrzucone }
// Pozycję uśredniamy z ostatnich 5 dobrych punktów (to usuwa drżenie), a dystans liczymy między uśrednionymi pozycjami.
function gpsFiltr(punkty, opcje) {
  const o = Object.assign({}, GPS_FILTR, opcje || {});
  const status = new Array(punkty.length);
  let dystans = 0;
  let poprz = null;   // ostatni nieodrzucony punkt (surowy), do wykrywania skoków
  let kotwica = null; // [lat, lon, t, odcinek] – ostatnia policzona pozycja (uśredniona)
  let okno = [];
  let skoki = 0;
  let uzyte = 0;
  let odrzucone = 0;
  for (let i = 0; i < punkty.length; i++) {
    const p = punkty[i];
    if (typeof p[0] !== "number" || typeof p[1] !== "number" || typeof p[2] !== "number" ||
        (typeof p[3] === "number" && p[3] > o.maxDokl)) {
      status[i] = GPS_ODRZUCONY;
      odrzucone++;
      continue;
    }
    if (poprz === null || p[5] !== poprz[5]) {
      poprz = p;
      okno = [p];
      kotwica = [p[0], p[1], p[2], p[5]];
      skoki = 0;
      status[i] = GPS_UZYTY;
      uzyte++;
      continue;
    }
    const dt = (p[2] - poprz[2]) / 1000;
    if (dt <= 0) {
      status[i] = GPS_ODRZUCONY;
      odrzucone++;
      continue;
    }
    // Zapas na niepewność obu pozycji, żeby zwykłe drżenie przy słabszym sygnale nie wyglądało jak skok
    const zapas = (typeof p[3] === "number" ? p[3] : 0) + (typeof poprz[3] === "number" ? poprz[3] : 0);
    if (Math.max(0, gpsOdleglosc(poprz[0], poprz[1], p[0], p[1]) - zapas) / dt > o.maxPredkosc) {
      skoki++;
      if (skoki >= o.resetPoSkokach) {
        // To my się przesunęliśmy (np. po długiej przerwie sygnału), a nie sygnał skoczył
        poprz = p;
        okno = [p];
        kotwica = [p[0], p[1], p[2], p[5]];
        skoki = 0;
        status[i] = GPS_UZYTY;
        uzyte++;
      } else {
        status[i] = GPS_ODRZUCONY;
        odrzucone++;
      }
      continue;
    }
    skoki = 0;
    poprz = p;
    okno.push(p);
    if (okno.length > 5) {
      okno.shift();
    }
    let la = 0;
    let lo = 0;
    okno.forEach(function (q) { la += q[0]; lo += q[1]; });
    la /= okno.length;
    lo /= okno.length;
    const d = gpsOdleglosc(kotwica[0], kotwica[1], la, lo);
    const dtK = (p[2] - kotwica[2]) / 1000;
    const dokl = typeof p[3] === "number" ? p[3] : 4;
    // Stoisz: ruch wolniejszy niż 0,8 m/s w obrębie niepewności albo mniejszy niż niepewność pozycji
    const stoi = d < Math.max(o.minKrok, dokl) || (dtK > 0 && d / dtK < 0.8 && d < 3 * dokl);
    if (stoi) {
      status[i] = GPS_STOI;
      continue;
    }
    dystans += d;
    kotwica = [la, lo, p[2], p[5]];
    status[i] = GPS_UZYTY;
    uzyte++;
  }
  return { dystansM: dystans, status: status, uzyte: uzyte, odrzucone: odrzucone, wersja: o.wersja };
}

// Stan sygnału na żywo: { stan: "szukam" | "dobry" | "slaby" | "brak", dokl }
function gpsSygnal(punkty, status, teraz) {
  if (!punkty.length) {
    return { stan: "szukam", dokl: null };
  }
  const ost = punkty[punkty.length - 1];
  if (teraz - ost[2] > 20000) {
    return { stan: "brak", dokl: null };
  }
  let n = 0;
  let zle = 0;
  for (let i = punkty.length - 1; i >= 0 && n < 10; i--) {
    if (teraz - punkty[i][2] > 30000) {
      break;
    }
    n++;
    if (status[i] === GPS_ODRZUCONY) {
      zle++;
    }
  }
  if (n >= 3 && zle / n >= 0.5) {
    return { stan: "slaby", dokl: typeof ost[3] === "number" ? ost[3] : null };
  }
  return { stan: "dobry", dokl: typeof ost[3] === "number" ? ost[3] : null };
}

// Tempo z ostatnich 30 s w sekundach na km albo null (stoisz, za mało danych)
function gpsTempoOkno(punkty, status, teraz, okno) {
  okno = okno || 30000;
  const uzyte = [];
  for (let i = punkty.length - 1; i >= 0; i--) {
    if (status[i] !== GPS_UZYTY) {
      continue;
    }
    if (teraz - punkty[i][2] > okno) {
      break;
    }
    if (uzyte.length && punkty[i][5] !== uzyte[0][5]) {
      break;
    }
    uzyte.unshift(punkty[i]);
  }
  if (uzyte.length < 2) {
    return null;
  }
  let d = 0;
  for (let i = 1; i < uzyte.length; i++) {
    d += gpsOdleglosc(uzyte[i - 1][0], uzyte[i - 1][1], uzyte[i][0], uzyte[i][1]);
  }
  const dt = (uzyte[uzyte.length - 1][2] - uzyte[0][2]) / 1000;
  if (d < 10 || dt < 8) {
    return null;
  }
  return dt / (d / 1000);
}

// Dystans do zapisu w wyniku: { wartosc (km, 2 miejsca), jednostka: "km" } albo null, gdy to tylko szum
function gpsDystansWyniku(dystansM) {
  if (!(dystansM >= 50)) {
    return null;
  }
  return { wartosc: Math.round(dystansM / 10) / 100, jednostka: "km" };
}

// Podsumowanie całej trasy po biegu
function gpsPodsumuj(punkty) {
  const f = gpsFiltr(punkty);
  const wszystkie = punkty.length;
  return {
    dystansM: f.dystansM,
    punktow: wszystkie,
    odrzuconych: f.odrzucone,
    // Dużo odrzuconych punktów = dystans mógł wyjść za mały
    slabySygnal: wszystkie >= 10 && f.odrzucone / wszystkie > 0.3,
    wersjaFiltra: f.wersja
  };
}

// ===== GPX =====

function gpsDataLokalna(t) {
  const d = new Date(t);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

// Zwraca { punkty } albo { blad }
function gpsZGpx(tekst) {
  let doc;
  try {
    doc = new DOMParser().parseFromString(tekst, "application/xml");
  } catch (e) {
    return { blad: "To nie jest poprawny plik GPX." };
  }
  if (!doc || doc.getElementsByTagName("parsererror").length) {
    return { blad: "To nie jest poprawny plik GPX." };
  }
  const segmenty = Array.prototype.slice.call(doc.getElementsByTagName("trkseg"));
  const punkty = [];
  let bezCzasu = 0;
  segmenty.forEach(function (seg, nr) {
    Array.prototype.slice.call(seg.getElementsByTagName("trkpt")).forEach(function (pt) {
      const lat = parseFloat(pt.getAttribute("lat"));
      const lon = parseFloat(pt.getAttribute("lon"));
      const czasEl = pt.getElementsByTagName("time")[0];
      const eleEl = pt.getElementsByTagName("ele")[0];
      const t = czasEl ? Date.parse(czasEl.textContent.trim()) : NaN;
      if (!isFinite(lat) || !isFinite(lon)) {
        return;
      }
      if (!isFinite(t)) {
        bezCzasu++;
        return;
      }
      const ele = eleEl ? parseFloat(eleEl.textContent) : NaN;
      punkty.push([lat, lon, t, null, isFinite(ele) ? ele : null, nr]);
    });
  });
  if (!punkty.length) {
    return { blad: bezCzasu ? "Plik GPX nie ma czasu przy punktach trasy, więc nie da się policzyć tempa." : "W pliku nie ma trasy (punktów GPS)." };
  }
  punkty.sort(function (a, b) { return a[5] - b[5] || a[2] - b[2]; });
  return { punkty: punkty };
}

// Z trasy GPX: dystans, czas ruchu (przerwy dłuższe niż 30 s liczymy jako pauzy), data
function gpsPodsumujGpx(punkty) {
  const f = gpsFiltr(punkty);
  let ruchS = 0;
  let pauzy = 0;
  let pauzaS = 0;
  for (let i = 1; i < punkty.length; i++) {
    if (punkty[i][5] !== punkty[i - 1][5]) {
      continue;
    }
    const dt = (punkty[i][2] - punkty[i - 1][2]) / 1000;
    if (dt > 30) {
      pauzy++;
      pauzaS += dt;
    } else if (dt > 0) {
      ruchS += dt;
    }
  }
  return {
    dystansM: f.dystansM,
    czasS: Math.round(ruchS),
    pauzy: pauzy,
    czasPauzS: Math.round(pauzaS),
    data: gpsDataLokalna(punkty[0][2]),
    punktow: punkty.length,
    odrzuconych: f.odrzucone
  };
}

function gpsDoGpx(punkty, nazwa) {
  const esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); };
  const wyj = ['<?xml version="1.0" encoding="UTF-8"?>',
    '<gpx version="1.1" creator="Ćwiczenia" xmlns="http://www.topografix.com/GPX/1/1">',
    "<trk><name>" + esc(nazwa || "Bieg") + "</name>"];
  let seg = null;
  punkty.forEach(function (p) {
    if (p[5] !== seg) {
      if (seg !== null) {
        wyj.push("</trkseg>");
      }
      wyj.push("<trkseg>");
      seg = p[5];
    }
    wyj.push('<trkpt lat="' + p[0] + '" lon="' + p[1] + '">' +
      (typeof p[4] === "number" ? "<ele>" + p[4] + "</ele>" : "") +
      "<time>" + new Date(p[2]).toISOString() + "</time></trkpt>");
  });
  if (seg !== null) {
    wyj.push("</trkseg>");
  }
  wyj.push("</trk></gpx>");
  return wyj.join("\n");
}
