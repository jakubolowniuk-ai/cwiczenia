// ===== Generator planów treningowych =====
// Z odpowiedzi użytkownika (profil) układa plan na 4 tygodnie z ćwiczeń, które są w bazie.
// Zasady (skrót):
//  - objętość: początkujący ok. 10–12 serii tygodniowo na dużą partię, średni 13–15, zaawansowany 16–20
//  - masa i rzeźba: 6–12 powtórzeń, przerwy 1–2 min; siła: 4–6 powtórzeń, przerwy 3 min
//  - każda duża partia co najmniej 2× w tygodniu (poza planami 5–6-dniowymi o podziale push/pull/legs)
//  - serie kończymy 2–3 powtórzenia przed upadkiem mięśniowym
// Ciężary startowe wyliczamy z kilku "kotwic" (ciężar, który użytkownik zrobi 10 razy z zapasem)
// przez proporcje między ćwiczeniami.

// ===== Szablony ćwiczeń =====
// pgS(siłownia, dom, ciało, serie, od, do, przerwa) — jedno "miejsce" w treningu z listą zamienników
// (pierwsze dostępne i bezpieczne jest wybierane). null = brak takiego ćwiczenia dla sprzętu.
// Nazwy zaczynające się od "@" to drabinki trudności kalisteniki (pgDrabinka).

function pgS(s, d, c, serie, od, do_, przerwa, rdzen) {
  return { s: s, d: d, c: c, serie: serie, od: od, do: do_, przerwa: przerwa, r: !!rdzen };
}

const PG_PRZYSIAD = pgS(
  ["Przysiad ze sztangą na plecach (Back Squat)", "Wypychanie ciężaru na suwnicy (Leg Press)", "Przysiad Goblet z kettlebellem lub hantlem", "Hip Thrust ze sztangą"],
  ["Przysiad Goblet z kettlebellem lub hantlem", "Przysiad bułgarski z hantlami", "Martwy ciąg rumuński z hantlami"],
  ["Przysiad klasyczny", "Przysiad bułgarski", "Most biodrowy"], 3, 8, 10, 120);
const PG_WYCISKANIE = pgS(
  ["Wyciskanie sztangi na ławce poziomej", "Wyciskanie hantli na ławce poziomej", "Wyciskanie na maszynie Hammer (siedząc)"],
  ["Wyciskanie hantli na ławce poziomej", "Pompki klasyczne"], ["@push"], 3, 8, 10, 120);
const PG_WIOSLO = pgS(
  ["Wiosłowanie sztangą w opadzie tułowia", "Wiosłowanie na maszynie siedząc (chwyt neutralny)", "Wiosłowanie hantlą jednorącz w oparciu o ławkę"],
  ["Wiosłowanie hantlą jednorącz w oparciu o ławkę"], ["@pull"], 3, 8, 10, 120);
const PG_BARKI = pgS(
  ["Wyciskanie hantli siedząc", "Wyciskanie na maszynie nad głowę (siedząc)"],
  ["Wyciskanie hantli nad głowę stojąc", "Unoszenie hantli bokiem w staniu"], ["Pompki pike", "Podciąganie łopatkowe"], 2, 10, 12, 90);
const PG_BICEPS = pgS(
  ["Uginanie ramion z hantlami z supinacją"], ["Uginanie ramion z hantlami z supinacją"],
  ["Uginanie ramion w australijskim podciąganiu podchwytem"], 2, 10, 12, 60);
const PG_BRZUCH = pgS(
  ["Unoszenie nóg leżąc"], ["Unoszenie nóg leżąc"], ["Deska przodem (Front Plank)"], 3, 10, 15, 60, true);
const PG_BRZUCH_B = pgS(
  ["Pallof Press (wyciskanie linki w bok)", "Deska przodem (Front Plank)"], ["Deska przodem (Front Plank)"],
  ["Hollow Body Hold", "Dead Bug"], 3, 10, 12, 60, true);
const PG_CORE_G = pgS(
  ["Deska przodem (Front Plank)"], ["Deska przodem (Front Plank)"], ["Dead Bug"], 2, 10, 12, 45, true);

const PG_RDL = pgS(
  ["Martwy ciąg rumuński ze sztangą (RDL)", "Uginanie nóg leżąc na maszynie"],
  ["Martwy ciąg rumuński z hantlami"], ["Most biodrowy jednonóż", "Hip Thrust"], 3, 8, 10, 120);
const PG_SKOS = pgS(
  ["Wyciskanie hantli na ławce skośnej dodatniej", "Wyciskanie na maszynie skośnej", "Wyciskanie hantli na ławce poziomej"],
  ["Wyciskanie hantli na ławce skośnej dodatniej", "Wyciskanie hantli na ławce poziomej"], ["@pushB"], 3, 8, 12, 120);
const PG_PION = pgS(
  ["Ściąganie drążka wyciągu górnego do klatki", "Podciąganie z asystą na maszynie"],
  ["Wiosłowanie hantlami leżąc brzuchem na ławce skośnej (Seal Row)"], ["@pullB"], 3, 8, 12, 90);
const PG_NOGI2 = pgS(
  ["Wypychanie ciężaru na suwnicy (Leg Press)", "Przysiad bułgarski z hantlami", "Uginanie nóg siedząc na maszynie"],
  ["Przysiad bułgarski z hantlami", "Martwy ciąg rumuński z hantlami"], ["Wykroki w tył", "Most biodrowy"], 2, 10, 12, 90);
const PG_BOKI = pgS(
  ["Unoszenie hantli bokiem w staniu"], ["Unoszenie hantli bokiem w staniu"], null, 2, 12, 15, 60);
const PG_TRICEPS = pgS(
  ["Prostowanie ramion na wyciągu górnym z liną (Pushdown)"],
  ["Wyciskanie francuskie z hantlem jednorącz (siedząc)"], ["Dipy na ławce"], 2, 10, 12, 60);
const PG_LYDKI = pgS(
  ["Wspięcia na palce siedząc na maszynie", "Wspięcia na palce stojąc ze sztangą"],
  ["Wspięcia na palce obunóż"], ["Wspięcia na palce jednonóż"], 2, 12, 15, 45);
const PG_UGINANIE_NOG = pgS(
  ["Uginanie nóg leżąc na maszynie"], null, ["Sliding Leg Curl"], 2, 10, 12, 75);

// Góra / dół (4 dni)
const PG_G_PRZOD = pgS(PG_WYCISKANIE.s, PG_WYCISKANIE.d, PG_WYCISKANIE.c, 4, 6, 10, 150);
const PG_G_WIOSLO = pgS(
  ["Wiosłowanie sztangą w opadzie tułowia", "Wiosłowanie na maszynie z oparciem klatki", "Wiosłowanie hantlą jednorącz w oparciu o ławkę"],
  PG_WIOSLO.d, PG_WIOSLO.c, 4, 8, 10, 120);
const PG_G_OHP = pgS(
  ["Wyciskanie żołnierskie ze sztangą (OHP)", "Wyciskanie hantli siedząc", "Unoszenie hantli bokiem w staniu"],
  ["Wyciskanie hantli nad głowę stojąc", "Unoszenie hantli bokiem w staniu"], ["Pompki pike", "Podciąganie łopatkowe"], 3, 8, 10, 120);
const PG_G_PION = pgS(PG_PION.s, PG_PION.d, ["@pullB"], 3, 8, 12, 90);
const PG_G_BICEPS = pgS(
  ["Uginanie ramion ze sztangą łamaną stojąc", "Uginanie ramion z hantlami z supinacją"],
  PG_BICEPS.d, PG_BICEPS.c, 3, 8, 12, 60);
const PG_G_TRICEPS = pgS(PG_TRICEPS.s, PG_TRICEPS.d, PG_TRICEPS.c, 3, 10, 12, 60);
const PG_G_SKOS = pgS(PG_SKOS.s, PG_SKOS.d, PG_SKOS.c, 4, 8, 12, 120);
const PG_G_WIOSLO2 = pgS(
  ["Wiosłowanie na maszynie siedząc (chwyt neutralny)", "Przyciąganie linki wyciągu dolnego do brzucha (siedząc)"],
  ["Wiosłowanie hantlami leżąc brzuchem na ławce skośnej (Seal Row)"], ["Wiosłowanie australijskie jednorącz"], 3, 10, 12, 90);
const PG_G_BOKI = pgS(PG_BOKI.s, PG_BOKI.d, ["Pompki pike z nogami na podwyższeniu"], 3, 12, 15, 60);
const PG_G_TYL = pgS(
  ["Face Pulls (przyciąganie liny do twarzy)"], ["Unoszenie hantli w opadzie tułowia"], ["Podciąganie łopatkowe"], 3, 12, 15, 60);
const PG_G_MLOTEK = pgS(
  ["Uginanie ramion z hantlami chwytem młotkowym (Hammer Curl)"],
  ["Uginanie ramion z hantlami chwytem młotkowym (Hammer Curl)"],
  ["Uginanie ramion na niskim drążku podchwytem"], 2, 10, 12, 60);
const PG_G_TRICEPS2 = pgS(
  ["Prostowanie ramion z liną wyciągu zza głowy"],
  ["Prostowanie ramienia z hantlem w opadzie tułowia (Kickback)"], ["Pompki z wąskim rozstawem dłoni"], 2, 10, 12, 60);

const PG_D_PRZYSIAD = pgS(
  ["Przysiad ze sztangą na plecach (Back Squat)", "Wypychanie ciężaru na suwnicy (Leg Press)", "Hip Thrust ze sztangą"],
  ["Przysiad Goblet z kettlebellem lub hantlem", "Martwy ciąg rumuński z hantlami"], ["Przysiad bułgarski", "Most biodrowy"], 4, 6, 10, 150);
const PG_D_RDL = pgS(PG_RDL.s.slice(0, 1), PG_RDL.d, ["Most biodrowy jednonóż"], 3, 8, 10, 120);
const PG_D_WYKROKI = pgS(
  ["Wykroki chodzone z hantlami", "Przysiad bułgarski z hantlami", "Hip Thrust na maszynie"],
  ["Przysiad bułgarski z hantlami", "Martwy ciąg rumuński z hantlami"], ["Wykroki chodzone", "Most biodrowy jednonóż"], 3, 10, 12, 90);
const PG_D_UGINANIE = pgS(["Uginanie nóg leżąc na maszynie"], null, ["Sliding Leg Curl"], 3, 10, 12, 75);
const PG_D_LYDKI = pgS(
  ["Wspięcia na palce stojąc ze sztangą", "Wspięcia na palce siedząc na maszynie"],
  ["Wspięcia na palce obunóż"], ["Wspięcia na palce jednonóż"], 4, 10, 15, 60);
const PG_D_BRZUCH = pgS(
  ["Allahy (skłony tułowia z linką wyciągu górnego)", "Unoszenie nóg leżąc"],
  ["Unoszenie nóg leżąc"], ["Unoszenie kolan w zwisie"], 3, 10, 15, 60, true);
const PG_D2_NOGI = pgS(
  ["Wypychanie ciężaru na suwnicy (Leg Press)", "Przysiad Hack na maszynie", "Uginanie nóg siedząc na maszynie"],
  ["Przysiad bułgarski z hantlami", "Martwy ciąg rumuński z hantlami"], ["Wykroki w tył", "Most biodrowy"], 4, 10, 12, 120);
const PG_D2_POSLADKI = pgS(
  ["Hip Thrust ze sztangą", "Hip Thrust na maszynie"],
  ["Martwy ciąg rumuński z hantlami"], ["Hip Thrust jednonóż"], 3, 8, 12, 120);
const PG_D2_UGINANIE = pgS(["Uginanie nóg siedząc na maszynie"], null, null, 3, 10, 12, 75);
const PG_D2_PROSTOWANIE = pgS(["Prostowanie nóg na maszynie (siedząc)"], null, ["Przysiad kozacki (Cossack Squat)"], 3, 12, 15, 60);
const PG_D2_LYDKI = pgS(
  ["Wspięcia na palce na suwnicy", "Wspięcia na palce siedząc na maszynie"],
  ["Wspięcia na palce obunóż"], ["Wspięcia na palce z ugiętymi kolanami"], 3, 12, 15, 45);
const PG_D2_CORE = pgS(
  ["Pallof Press (wyciskanie linki w bok)", "Deska przodem z talerzem na plecach"],
  ["Deska przodem (Front Plank)"], ["Hollow Body Hold"], 3, 10, 12, 60, true);

const PG_SZABLONY = {
  fb: {
    A: [PG_PRZYSIAD, PG_WYCISKANIE, PG_WIOSLO, PG_BARKI, PG_BICEPS, PG_BRZUCH],
    B: [PG_RDL, PG_SKOS, PG_PION, PG_NOGI2, PG_BOKI, PG_TRICEPS, PG_LYDKI, PG_UGINANIE_NOG, PG_BRZUCH_B]
  },
  ul: {
    GA: [PG_G_PRZOD, PG_G_WIOSLO, PG_G_OHP, PG_G_PION, PG_G_BICEPS, PG_G_TRICEPS],
    DA: [PG_D_PRZYSIAD, PG_D_RDL, PG_D_WYKROKI, PG_D_UGINANIE, PG_D_LYDKI, PG_D_BRZUCH],
    GB: [PG_G_SKOS, PG_G_PION, PG_G_WIOSLO2, PG_G_BOKI, PG_G_TYL, PG_G_MLOTEK, PG_G_TRICEPS2],
    DB: [PG_D2_NOGI, PG_D2_POSLADKI, PG_D2_UGINANIE, PG_D2_PROSTOWANIE, PG_D2_LYDKI, PG_D2_CORE]
  },
  ppl: {
    Push: [PG_G_PRZOD, PG_G_OHP, PG_G_SKOS, PG_G_BOKI, PG_G_TRICEPS, PG_G_TRICEPS2],
    Pull: [PG_G_WIOSLO, PG_G_PION, PG_G_WIOSLO2, PG_G_TYL, PG_G_BICEPS, PG_G_MLOTEK, PG_CORE_G],
    Legs: [PG_D_PRZYSIAD, PG_D_RDL, PG_D2_NOGI, PG_D_UGINANIE, PG_D_LYDKI, PG_D_BRZUCH]
  },
  bsila: {
    S: [
      pgS(PG_PRZYSIAD.s, PG_PRZYSIAD.d, PG_PRZYSIAD.c, 2, 10, 12, 90),
      pgS(PG_RDL.s, PG_RDL.d, PG_RDL.c, 2, 10, 12, 90),
      pgS(PG_D_WYKROKI.s, PG_D_WYKROKI.d, PG_D_WYKROKI.c, 2, 10, 12, 75),
      pgS(PG_LYDKI.s, PG_LYDKI.d, PG_LYDKI.c, 2, 12, 15, 45),
      pgS(PG_BRZUCH.s, PG_BRZUCH.d, PG_BRZUCH.c, 2, 10, 15, 60, true)
    ]
  }
};

// ===== Szablony kalisteniki (masa ciała) =====
// Ćwiczenia wybierane z drabinek wg maksów użytkownika i doświadczenia (pgDrabinka), nie z jednej stałej listy.
function pgK(kod, serie, rdzen) {
  return pgS(null, null, ["@k:" + kod], serie, 8, 12, 90, rdzen);
}

const PG_KAL = {
  fb: {
    A: [pgK("squat", 3), pgK("push", 3), pgK("pullV", 3), pgK("pushV", 2), pgK("core1", 3, true), pgK("biceps", 2), pgK("calf", 2), pgK("core3", 2), pgK("lunge", 2), pgK("dip", 2)],
    B: [pgK("hinge", 3), pgK("pushB", 3), pgK("pullVB", 3), pgK("lunge", 2), pgK("dip", 3), pgK("core2", 3, true), pgK("ham", 2), pgK("core4", 2), pgK("squatB", 2), pgK("biceps", 2), pgK("pushV", 2)]
  },
  ul: {
    GA: [pgK("push", 4), pgK("pullV", 4), pgK("pushV", 3), pgK("dip", 3), pgK("biceps", 2), pgK("core3", 2), pgK("pullH", 2)],
    DA: [pgK("squat", 4), pgK("hinge", 3), pgK("ham", 3), pgK("calf", 3), pgK("core2", 3, true), pgK("lunge", 2)],
    GB: [pgK("pushB", 4), pgK("pullVB", 4), pgK("pullH", 3), pgK("pushV", 3), pgK("dip", 3), pgK("core4", 2), pgK("biceps", 2)],
    DB: [pgK("lunge", 4), pgK("hinge", 3), pgK("squatB", 3), pgK("calf", 3), pgK("core1", 3, true), pgK("ham", 2), pgK("core3", 2)]
  },
  ppl: {
    Push: [pgK("push", 4), pgK("pushV", 3), pgK("dip", 3), pgK("pushB", 3), pgK("core3", 2)],
    Pull: [pgK("pullV", 4), pgK("pullH", 3), pgK("pullVB", 3), pgK("biceps", 3), pgK("core2", 3, true)],
    Legs: [pgK("squat", 4), pgK("hinge", 3), pgK("lunge", 3), pgK("ham", 3), pgK("calf", 3), pgK("core1", 3, true)]
  },
  bsila: {
    S: [pgK("squat", 2), pgK("hinge", 2), pgK("lunge", 2), pgK("calf", 2), pgK("core1", 2, true)]
  }
};

// Dodatkowe ćwiczenie dla wybranej partii (priorytet)
const PG_PRIORYTET = {
  "partia-klatka": pgS(["Rozpiętki na maszynie Pec Deck (butterfly)", "Rozpiętki z hantlami na ławce poziomej"], ["Rozpiętki z hantlami na ławce poziomej"], ["Pompki szerokie"], 2, 10, 15, 60),
  "partia-plecy": pgS(["Ściąganie prostych ramion na wyciągu górnym", "Wiosłowanie jednorącz na wyciągu"], ["Wiosłowanie hantlami leżąc brzuchem na ławce skośnej (Seal Row)"], ["Podciąganie australijskie podchwytem"], 2, 10, 12, 75),
  "partia-barki": pgS(["Unoszenie hantli bokiem w staniu"], ["Unoszenie hantli bokiem w staniu"], ["Pompki pike"], 2, 12, 15, 60),
  "partia-ramiona": pgS(["Uginanie ramion z hantlami chwytem młotkowym (Hammer Curl)"], ["Uginanie ramion z hantlami chwytem młotkowym (Hammer Curl)"], ["Pompki diamentowe"], 2, 10, 12, 60),
  "partia-nogi": pgS(["Prostowanie nóg na maszynie (siedząc)"], ["Przysiad bułgarski z hantlami"], ["Wykrok boczny"], 2, 12, 15, 60),
  "partia-posladki": pgS(["Hip Thrust ze sztangą"], ["Martwy ciąg rumuński z hantlami"], ["Most biodrowy jednonóż"], 2, 10, 15, 75),
  "partia-brzuch": pgS(["Allahy (skłony tułowia z linką wyciągu górnego)"], ["Russian Twist"], ["Hollow Body Hold"], 2, 10, 15, 60)
};

// ===== Drabinki trudności (kalistenika) =====

// Drabinki: kolejne warianty od najłatwiejszego do najtrudniejszego (indeks = "szczebel")
const PG_KAL_LAD = {
  push: ["Pompki z rękami na podwyższeniu", "Pompki klasyczne", "Pompki z nogami na podwyższeniu", "Pompki łucznicze", "Pompki pseudo-planche"],
  pushB: ["Pompki z wypchnięciem łopatek (Push-Up Plus)", "Pompki z wąskim rozstawem dłoni", "Pompki diamentowe", "Pompki hinduskie", "Pompki pseudo-planche"],
  pushV: ["Pompki pike", "Pompki pike", "Pompki pike z nogami na podwyższeniu", "Pompki w staniu na rękach przy ścianie", "Pompki w staniu na rękach przy ścianie"],
  dip: ["Dipy na ławce", "Dipy na ławce", "Dipy na poręczach", "Dipy z pochyleniem tułowia", "Dipy z pionowym tułowiem"],
  pullV: ["Podciąganie australijskie", "Podciąganie australijskie z nogami na podwyższeniu", "Podciąganie nachwytem", "Podciąganie szerokim nachwytem", "Podciąganie łucznicze"],
  pullVB: ["Podciąganie australijskie podchwytem", "Podciąganie australijskie podchwytem", "Podciąganie podchwytem", "Podciąganie chwytem neutralnym", "Podciąganie wąskim nachwytem"],
  pullH: ["Podciąganie australijskie", "Podciąganie australijskie z nogami na podwyższeniu", "Podciąganie australijskie z nogami na podwyższeniu", "Wiosłowanie australijskie jednorącz", "Wiosłowanie australijskie jednorącz"],
  biceps: ["Uginanie ramion w australijskim podciąganiu podchwytem", "Uginanie ramion w australijskim podciąganiu podchwytem", "Uginanie ramion na niskim drążku podchwytem", "Uginanie ramion na niskim drążku podchwytem", "Podciąganie podchwytem"],
  squat: ["Przysiad klasyczny", "Przysiad bułgarski", "Przysiad kozacki (Cossack Squat)", "Pistol Squat z podparciem", "Pistol Squat"],
  squatB: ["Przysiad sumo", "Przysiad głęboki", "Przysiad kozacki (Cossack Squat)", "Pistol Squat z podparciem", "Pistol Squat"],
  lunge: ["Wykroki w tył", "Wykroki chodzone", "Wykroki chodzone", "Przysiad bułgarski", "Przysiad bułgarski"],
  hinge: ["Most biodrowy", "Most biodrowy jednonóż", "Hip Thrust jednonóż", "Hip Thrust jednonóż", "Hip Thrust jednonóż"],
  ham: ["Sliding Leg Curl", "Sliding Leg Curl", "Sliding Leg Curl", "Nordic Hamstring Curl", "Nordic Hamstring Curl"],
  calf: ["Wspięcia na palce obunóż", "Wspięcia na palce obunóż", "Wspięcia na palce jednonóż", "Wspięcia na palce jednonóż", "Wspięcia na palce jednonóż"],
  core1: ["Deska przodem (Front Plank)", "Deska przodem (Front Plank)", "Hollow Body Hold", "Hollow Body Hold", "L-Sit"],
  core2: ["Odwrotne spięcia brzucha", "Unoszenie nóg leżąc", "Unoszenie kolan w zwisie", "Unoszenie prostych nóg w zwisie", "Toes to Bar"],
  core2bez: ["Odwrotne spięcia brzucha", "Unoszenie nóg leżąc", "Scyzoryk (V-up)", "Scyzoryk (V-up)", "Scyzoryk (V-up)"],
  core3: ["Deska bokiem (Side Plank)", "Deska bokiem (Side Plank)", "Russian Twist", "Russian Twist", "Wycieraczki w zwisie (Windshield Wipers)"],
  core4: ["Dead Bug", "Dead Bug", "Rowerki brzucha", "Hollow Body Rocks", "Hollow Body Rocks"]
};

// Szczebel na drabince z maksymalnej liczby powtórzeń; bez danych: z doświadczenia
function pgSzczebelPchania(p) {
  const m = p.maxPompek;
  if (m == null) {
    return [0, 1, 2, 2][p.dosw || 0];
  }
  return m < 5 ? 0 : m < 15 ? 1 : m < 25 ? 2 : m < 35 ? 3 : 4;
}

function pgSzczebelCiagniecia(p) {
  const m = p.maxPodciagniec;
  if (m == null) {
    return [0, 1, 2, 2][p.dosw || 0];
  }
  return m < 1 ? 0 : m < 5 ? 1 : m < 10 ? 2 : m < 15 ? 3 : 4;
}

// Kod "@k:nazwa" → nazwa ćwiczenia dla profilu (szczebel zależy od maksów i doświadczenia, sprzęt zawęża wybór)
function pgDrabinka(kod, p, kandydaci) {
  if (kod.indexOf("@k:") !== 0) {
    return null;
  }
  const jedna = function (n) {
    return kandydaci ? (n ? [n] : []) : n;
  };
  const klucz = kod.slice(3);
  const dosw = p.dosw || 0;
  const dosw2 = Math.min(dosw, 2);
  const zDraz = p.drazek !== false;
  const zPor = !!p.poreczy;
  let r = dosw2;
  if (/^push|^dip/.test(klucz)) {
    r = pgSzczebelPchania(p);
    if (klucz === "pushV") {
      r = Math.min(4, Math.max(dosw2, r - 1));
    }
    if (klucz === "dip" && !zPor) {
      r = 0;
    }
  } else if (/^pull|^biceps/.test(klucz)) {
    if (!zDraz) {
      return jedna(klucz === "pullVB" ? "Podciąganie australijskie podchwytem" : klucz === "biceps" ? null : "Podciąganie australijskie");
    }
    r = pgSzczebelCiagniecia(p);
  } else if (klucz === "core2") {
    return jedna(PG_KAL_LAD[zDraz ? "core2" : "core2bez"][dosw]);
  } else if (klucz === "core3" && !zDraz) {
    r = Math.min(r, 3);
  }
  const lad = PG_KAL_LAD[klucz];
  if (!lad) {
    return jedna(null);
  }
  const idx = Math.min(r, lad.length - 1);
  if (kandydaci) {
    // wariant z drabinki, a gdy jest już użyty w treningu, łatwiejsze szczeble poniżej
    return lad.slice(0, idx + 1).reverse().filter(function (n, i, t) { return t.indexOf(n) === i; });
  }
  return lad[idx];
}

// ===== Bezpieczeństwo: ćwiczenia kolidujące z bolącym miejscem =====

const PG_BOLE = {
  kolano: /Przysiad|Wykro|Zakro|Wejścia|Leg Press|Wypychanie|Hack|Pistol|Wall Sit|Cossack|Prostowanie nóg|Nordic|Burpees|Skoki|Wyskok/i,
  bark: /żołnierskie|OHP|nad głowę|Arnolda|Dipy|pike|Pompki hinduskie|łucznicze|Wyciskanie hantli siedząc/i,
  plecy: /Martwy|RDL|SLDL|Good Morning|sztangą w opadzie|Swing|Prostowanie tułowia|Back Squat|Front Squat|T-Bar|Pendlay/i,
  nadgarstek: /Pompki|Dipy|Uginanie ramion ze sztangą|Zginanie nadgarstków|Planche|Bear|Crab/i
};

function pgKoliduje(nazwa, bole) {
  return (bole || []).some(function (b) {
    return PG_BOLE[b] && PG_BOLE[b].test(nazwa);
  });
}

// ===== Ciężary startowe =====
// [wzór, kotwica, proporcja, typ]: typ s = sztanga, h = hantel (na rękę), m = maszyna / wyciąg
const PG_REGULY = [
  [/Wyciskanie sztangi na ławce poziomej|Floor Press/, "pch", 1, "s"],
  [/Wyciskanie sztangi na ławce skośnej dodatniej/, "pch", 0.8, "s"],
  [/Wyciskanie sztangi wąskim chwytem/, "pch", 0.8, "s"],
  [/Wyciskanie hantli na ławce skośnej|Wyciskanie hantli z rotacją/, "pch", 0.3, "h"],
  [/Wyciskanie hantli na ławce poziomej/, "pch", 0.35, "h"],
  [/maszynie Hammer|maszynie skośnej|Smitha na ławce/, "pch", 0.8, "m"],
  [/Pec Deck/, "pch", 0.45, "m"],
  [/Rozpiętki z hantlami/, "pch", 0.12, "h"],
  [/OHP|żołnierskie/, "pch", 0.6, "s"],
  [/Wyciskanie na maszynie nad głowę/, "pch", 0.55, "m"],
  [/Wyciskanie hantli siedząc|nad głowę stojąc|Arnolda/, "pch", 0.22, "h"],
  [/Unoszenie hantli bokiem|Unoszenie hantli przed/, "pch", 0.1, "h"],
  [/Unoszenie ramion bokiem na maszynie/, "pch", 0.3, "m"],
  [/Prostowanie ramion na wyciągu|Prostowanie ramion z liną|Prostowanie ramion na maszynie/, "pch", 0.3, "m"],
  [/Wyciskanie francuskie ze sztangą/, "pch", 0.35, "s"],
  [/Wyciskanie francuskie z hantl|Skull|Prostowanie ramienia z hantlem/, "pch", 0.12, "h"],
  [/Uginanie ramion ze sztangą/, "pch", 0.4, "s"],
  [/Uginanie ramion z hantlami|Hammer Curl|skoncentrowane/, "pch", 0.2, "h"],
  [/Uginanie ramion na (wyciągu|maszynie)/, "pch", 0.3, "m"],
  [/Face Pulls/, "wio", 0.3, "m"],
  [/Unoszenie hantli w opadzie/, "wio", 0.1, "h"],
  [/Wiosłowanie sztangą/, "wio", 1, "s"],
  [/Wiosłowanie hantl/, "wio", 0.4, "h"],
  [/Ściąganie drążka/, "wio", 0.9, "m"],
  [/Wiosłowanie (na maszynie|jednorącz na wyciągu)|T-Bar|Przyciąganie linki/, "wio", 0.85, "m"],
  [/Ściąganie prostych/, "wio", 0.4, "m"],
  [/Back Squat/, "prz", 1, "s"],
  [/Front Squat/, "prz", 0.75, "s"],
  [/Hack/, "prz", 1.1, "m"],
  [/Leg Press|Wypychanie/, "prz", 1.4, "m"],
  [/Goblet|sumo z hantlem|Przysiad z hantlami/, "prz", 0.3, "h"],
  [/bułgarski z hantlami|Wykroki chodzone z hantlami|Wejścia/, "prz", 0.15, "h"],
  [/rumuński ze sztangą|SLDL/, "prz", 0.8, "s"],
  [/rumuński z hantlami/, "prz", 0.3, "h"],
  [/Hip Thrust ze sztangą/, "prz", 0.9, "s"],
  [/Hip Thrust na maszynie/, "prz", 0.9, "m"],
  [/Uginanie nóg/, "prz", 0.35, "m"],
  [/Prostowanie nóg na maszynie/, "prz", 0.4, "m"],
  [/Wspięcia na palce stojąc ze sztangą/, "prz", 0.6, "s"],
  [/Wspięcia na palce (siedząc|na suwnicy)/, "prz", 0.5, "m"],
  [/Allahy|Drwal/, "wio", 0.3, "m"],
  [/Pallof/, "wio", 0.1, "m"]
];

// Ciężary domyślne ("nie wiem") w przeliczeniu na sztangę: [wyciskanie, wiosłowanie, przysiad]
const PG_DOMYSLNE = [[25, 25, 30], [35, 35, 45], [50, 45, 65], [70, 60, 90]];

// Kotwice w przeliczeniu na "sztangę 10 powtórzeń z zapasem" (dla domu: z hantli na rękę)
function pgKotwice(p) {
  const d = PG_DOMYSLNE[p.dosw || 0];
  const k = p.kotwice || {};
  const wynik = { pch: d[0], wio: d[1], prz: d[2], domyslne: !(k.pch > 0 && k.wio > 0 && k.prz > 0) };
  if (p.sprzet === "d") {
    if (k.pch > 0) { wynik.pch = k.pch / 0.35; }
    if (k.wio > 0) { wynik.wio = k.wio / 0.4; }
    if (k.prz > 0) { wynik.prz = k.prz / 0.3; }
  } else {
    if (k.pch > 0) { wynik.pch = k.pch; }
    if (k.wio > 0) { wynik.wio = k.wio; }
    if (k.prz > 0) { wynik.prz = k.prz; }
  }
  return wynik;
}

// Ciężar startowy ćwiczenia w kg (0 = bez ciężaru)
function pgCiezar(nazwa, kotw) {
  for (let i = 0; i < PG_REGULY.length; i++) {
    const r = PG_REGULY[i];
    if (r[0].test(nazwa)) {
      const kg = kotw[r[1]] * r[2];
      if (r[3] === "s") {
        return Math.max(20, Math.round(kg / 2.5) * 2.5);
      }
      if (r[3] === "h") {
        return Math.max(2, kg < 10 ? Math.round(kg) : Math.round(kg / 2) * 2);
      }
      return Math.max(5, kg < 25 ? Math.round(kg / 2.5) * 2.5 : Math.round(kg / 5) * 5);
    }
  }
  return 0;
}

// ===== Pomocnicze =====

function pgZnajdz(nazwa) {
  return dane.cwiczenia.find(function (c) {
    return c.nazwa === nazwa && !c.ukryte;
  });
}

function pgZnajdzBlok(poczatek, rodzajBloku) {
  return dane.treningi.find(function (t) {
    return t.blok === rodzajBloku && t.nazwa.indexOf(poczatek) === 0;
  });
}

// Dni tygodnia (przesunięcia od dziś), w które trenujemy; reszta to dni wolne
const PG_DNI = {
  1: [0],
  2: [0, 3],
  3: [0, 2, 4],
  4: [0, 1, 3, 4],
  5: [0, 1, 2, 4, 5],
  6: [0, 1, 2, 3, 4, 5]
};

const PG_NAZWY_CELI = {
  masa: "Masa",
  rzezba: "Rzeźba",
  sila: "Siła",
  zdrowie: "Zdrowie i kondycja",
  bieg: "Bieganie",
  kalistenika: "Kalistenika"
};

const PG_RODZAJE_KARDIO = {
  bieganie: "rodzaj-bieganie",
  rower: "rodzaj-rower",
  spacer: "rodzaj-spacer"
};

// Wybór podziału treningów zależnie od celu, doświadczenia i liczby dni
function pgPodzial(p) {
  let dni = p.dni;
  const uwagi = [];
  if (p.cel === "bieg") {
    return { typ: "bieg", dni: dni, uwagi: uwagi };
  }
  if (p.dosw <= 1 && dni > 4) {
    dni = 4;
    uwagi.push("Przy tym doświadczeniu 4 treningi tygodniowo w zupełności wystarczą, więc tyle zaplanowałem. Mięśnie rosną w czasie odpoczynku.");
  }
  if (dni <= 3) {
    return { typ: "fb", dni: dni, uwagi: uwagi };
  }
  if (dni === 4) {
    return { typ: "ul", dni: dni, uwagi: uwagi };
  }
  return { typ: "ppl", dni: dni, uwagi: uwagi };
}

// Kolejność typów treningu w kolejnych sesjach
function pgTypSesji(podzial, j) {
  if (podzial.typ === "fb") {
    return { klucz: j % 2 === 0 ? "A" : "B", szablon: "fb", przesun: 0 };
  }
  if (podzial.typ === "ul") {
    return { klucz: ["GA", "DA", "GB", "DB"][j % 4], szablon: "ul", przesun: 0 };
  }
  const klucze = ["Push", "Pull", "Legs"];
  return { klucz: klucze[j % 3], szablon: "ppl", przesun: Math.floor(j / 3) % 2 };
}

// ===== Budowa treningu z szablonu =====

// Klucz "tego samego ruchu": np. dwa Hip Thrusty nie trafią do jednego treningu
function pgKlucz(nazwa) {
  return /^Hip Thrust/.test(nazwa) ? "Hip Thrust" : nazwa;
}

function pgWybierzCwiczenie(slot, p, uzyte, przesun) {
  let lista = slot[p.sprzet];
  if (!lista) {
    return null;
  }
  let plaska = [];
  lista.forEach(function (n) {
    plaska = plaska.concat(n.indexOf("@k:") === 0 ? pgDrabinka(n, p, true) : [n]);
  });
  lista = plaska.filter(function (n) {
    return n && !uzyte[n] && !uzyte["~" + pgKlucz(n)] && !pgKoliduje(n, p.bole) && pgZnajdz(n);
  });
  if (lista.length === 0) {
    return null;
  }
  return pgZnajdz(lista[Math.min(p.sprzet === "c" ? 0 : (przesun || 0), lista.length - 1)]);
}

function pgParametryCelu(slot, indeks, p) {
  let serie = slot.serie;
  let od = slot.od;
  let do_ = slot.do;
  let przerwa = slot.przerwa;
  const glowne = indeks < 3;
  if (p.cel === "sila") {
    if (glowne) {
      serie = Math.max(serie, 4);
      od = 4;
      do_ = 6;
      przerwa = 180;
    } else {
      serie = Math.min(serie, 3);
      od = 8;
      do_ = 10;
    }
  } else if (p.cel === "zdrowie") {
    serie = 2;
    od = 10;
    do_ = 15;
    przerwa = 60;
  } else if (p.dosw === 0 && p.dni >= 4) {
    serie = Math.max(2, serie - 1);
  }
  if (p.sprzet === "c") {
    // Masa ciała: serie i zakresy zależą od doświadczenia (zaawansowani robią trudniejsze warianty, więc mniej powtórzeń)
    const poz = p.dosw || 0;
    const rdz = !!slot.r;
    if (p.cel !== "zdrowie") {
      if (glowne) {
        serie = [3, 3, 4, 4][poz];
        od = [8, 8, 6, 5][poz];
        do_ = [12, 12, 10, 8][poz];
        przerwa = 90;
      } else if (rdz) {
        serie = 3;
        od = 10;
        do_ = 15;
        przerwa = 60;
      } else {
        serie = Math.min(slot.serie, 2) + (poz >= 2 ? 1 : 0);
        od = [10, 10, 8, 8][poz];
        do_ = [15, 15, 12, 12][poz];
        przerwa = 60;
      }
    } else {
      od = 10;
      do_ = 15;
      przerwa = 60;
    }
  }
  return { serie: serie, od: od, do: do_, przerwa: przerwa };
}

// Czas trwania treningu w minutach (serie × (praca + przerwa) + przejścia)
function pgMinuty(wpisy) {
  let sek = 0;
  wpisy.forEach(function (w) {
    sek += w.serie * (40 + w.przerwa) + 30;
  });
  return sek / 60;
}

// Czas bloku (rozgrzewki albo rozciągania) w minutach, zaokrąglony; ok. 10 s na przejście między ćwiczeniami
function pgMinutyBloku(blok) {
  let sek = 0;
  blok.cwiczeniaIds.forEach(function (id) {
    const il = (blok.parametry && blok.parametry[id]) || DOMYSLNA_ILOSC_BLOKU;
    const m = il.jednostka === "min" ? 60 : 1;
    if (il.typ === "czas") {
      sek += il.wartosc * m;
    } else if (il.typ === "czas-powtorzenia") {
      sek += il.powtorzenia * il.czas.wartosc * (il.czas.jednostka === "min" ? 60 : 1);
    } else if (il.typ === "czas-serie") {
      il.czasy.forEach(function (c) { sek += c * m; });
    } else if (il.typ === "powtorzenia") {
      sek += il.serie * il.powtorzenia * 3;
    } else {
      sek += 30;
    }
    sek += 10;
  });
  return Math.round(sek / 60);
}

// Orientacyjny czas rozgrzewki i rozciągania dla kroku kreatora (średnio, z gotowych zestawów)
function pgCzasyBlokow() {
  const ogolna = pgZnajdzBlok("Rozgrzewka ogólna", "rozgrzewka");
  const calosc = pgZnajdzBlok("Rozciąganie po treningu: całe ciało", "rozciaganie");
  return { rozgrzewka: ogolna ? pgMinutyBloku(ogolna) : 5, rozciaganie: calosc ? pgMinutyBloku(calosc) : 8 };
}

function pgCzasStatyczny(dosw) {
  return [20, 30, 40, 45][dosw || 0];
}

// Zwraca listę wpisów treningu: { cw, serie, od, do, przerwa, kg, statyczne, czasy }
function pgBudujTrening(sloty, p, kotw, przesun) {
  const uzyte = {};
  let wpisy = [];
  sloty.forEach(function (slot, i) {
    const cw = pgWybierzCwiczenie(slot, p, uzyte, przesun);
    if (!cw) {
      return;
    }
    uzyte[cw.nazwa] = true;
    uzyte["~" + pgKlucz(cw.nazwa)] = true;
    const par = pgParametryCelu(slot, i, p);
    wpisy.push({
      cw: cw,
      serie: par.serie,
      od: par.od,
      do: par.do,
      przerwa: par.przerwa,
      kg: p.sprzet === "c" ? 0 : pgCiezar(cw.nazwa, kotw),
      statyczne: cw.rodzajId === "rodzaj-statyczny",
      rdzen: !!slot.r
    });
  });

  // Priorytet: dodatkowe ćwiczenie dla wybranej partii, jeśli ten trening już ją obejmuje
  if (p.priorytet && PG_PRIORYTET[p.priorytet]) {
    const trenujePartie = wpisy.some(function (w) {
      return (w.cw.partieIds || [])[0] === p.priorytet;
    });
    if (trenujePartie) {
      const cw = pgWybierzCwiczenie(PG_PRIORYTET[p.priorytet], p, uzyte, 0);
      if (cw) {
        const slot = PG_PRIORYTET[p.priorytet];
        uzyte[cw.nazwa] = true;
        wpisy.splice(Math.min(wpisy.length, 4), 0, {
          cw: cw, serie: slot.serie, od: slot.od, do: slot.do, przerwa: slot.przerwa,
          kg: p.sprzet === "c" ? 0 : pgCiezar(cw.nazwa, kotw), statyczne: cw.rodzajId === "rodzaj-statyczny"
        });
      }
    }
  }

  // Dopasowanie do czasu treningu (rozgrzewka i rozciąganie są liczone osobno, ponad ten czas)
  const budzet = Math.max(20, p.czas);
  const pelne = wpisy.slice();
  const pelnyCzas = Math.ceil(pgMinuty(pelne));
  // Ćwiczenia na brzuch (rdzeń) nie odpadają; usuwamy od końca zwykłe ćwiczenia dodatkowe (pierwsze 3 zostają)
  while (pgMinuty(wpisy) > budzet) {
    let idx = -1;
    for (let i = wpisy.length - 1; i >= 3; i--) {
      if (!wpisy[i].rdzen) {
        idx = i;
        break;
      }
    }
    if (idx === -1) {
      break;
    }
    wpisy.splice(idx, 1);
  }
  wpisy.forEach(function (w) {
    if (w.statyczne) {
      const t = pgCzasStatyczny(p.dosw);
      w.czasy = new Array(w.serie).fill(t);
    }
  });
  const pominiete = pelne.filter(function (w) {
    return wpisy.indexOf(w) === -1;
  });
  return { wpisy: wpisy, pominiete: pominiete, pelnyCzas: pelnyCzas };
}

// Ilość do zapisania w sesji
function pgIlosc(w) {
  if (w.statyczne) {
    return { typ: "czas-serie", czasy: w.czasy.slice(), jednostka: "s" };
  }
  const start = Math.round((w.od + w.do) / 2);
  const ilosc = { typ: "powtorzenia", serie: w.serie, powtorzenia: start, zakres: [w.od, w.do] };
  if (w.kg > 0) {
    ilosc.ciezary = new Array(w.serie).fill(w.kg);
  }
  return ilosc;
}

// ===== Bieganie =====

const PG_MARSZOBIEG = [
  { opis: "8 × (1 min biegu + 2 min marszu)", min: 24 },
  { opis: "6 × (2 min biegu + 2 min marszu)", min: 24 },
  { opis: "5 × (3 min biegu + 2 min marszu)", min: 25 },
  { opis: "4 × (5 min biegu + 2 min marszu)", min: 28 }
];
const PG_BIEG_LATWY = [20, 25, 30, 30];
const PG_BIEG_DLUGI = [25, 30, 35, 40];

// ===== Główna funkcja: profil → opis planu =====
// Zwraca { nazwa, treningi: {klucz: {nazwa, wpisy, blokPrzed, blokPo}}, sesje: [{dzien, kluczTreningu | kardio}], powody, uwagi }

function pgBuduj(p) {
  const kotw = pgKotwice(p);
  const podzial = pgPodzial(p);
  const wynik = { treningi: {}, sesje: [], powody: [], uwagi: podzial.uwagi.slice(), profil: p, kotwice: kotw };
  const dniTreningu = [];
  let kardioIle = p.kardio && p.kardio.ile ? p.kardio.ile : 0;

  let silowe = podzial.dni;
  let biegowe = 0;
  if (p.cel === "bieg") {
    const sila = p.dni >= 5 ? 2 : p.dni === 4 ? 1 : 0;
    silowe = sila;
    biegowe = Math.min(4, p.dni - sila);
    kardioIle = 0;
  }

  // Dni tygodnia: pierwsze przesunięcia dla treningów, reszta jest wolna
  const wzor = PG_DNI[Math.min(6, Math.max(1, p.dni))];
  const wolne = [0, 1, 2, 3, 4, 5, 6].filter(function (d) { return wzor.indexOf(d) === -1; });

  // Przydział dni tygodnia: bieganie dostaje pierwsze dni, siła kolejne
  const dniBiegu = wzor.slice(0, biegowe);
  const dniSily = p.cel === "bieg" ? wzor.slice(biegowe) : wzor;
  const dniKardio = wolne.slice(0, kardioIle);

  // Treningi siłowe
  const typyUzyte = {};
  let licznik = 0;
  for (let tydz = 0; tydz < 4; tydz++) {
    dniSily.forEach(function (przes) {
      const dzien = tydz * 7 + przes;
      let ts;
      if (p.cel === "bieg") {
        ts = { klucz: "S", szablon: "bsila", przesun: 0 };
      } else {
        ts = pgTypSesji(podzial, licznik);
      }
      licznik++;
      if (!typyUzyte[ts.klucz + ts.przesun]) {
        const sloty = (p.sprzet === "c" ? PG_KAL : PG_SZABLONY)[ts.szablon][ts.klucz];
        typyUzyte[ts.klucz + ts.przesun] = Object.assign({ ts: ts }, pgBudujTrening(sloty, p, kotw, ts.przesun));
      }
      wynik.sesje.push({ dzien: dzien, trening: ts.klucz + ts.przesun, szablon: ts.szablon, klucz: ts.klucz });
    });
  }

  const OPISY = {
    A: "Trening A (całe ciało)", B: "Trening B (całe ciało)",
    GA: "Góra A", DA: "Dół A", GB: "Góra B", DB: "Dół B",
    Push: "Push (pchanie)", Pull: "Pull (ciągnięcie)", Legs: "Legs (nogi)", S: "Siła dla biegacza (nogi i brzuch)"
  };
  Object.keys(typyUzyte).forEach(function (k) {
    const t = typyUzyte[k];
    let nazwa = OPISY[t.ts.klucz];
    if (t.ts.szablon === "ppl" && t.ts.przesun === 1) {
      nazwa += " 2";
    }
    wynik.treningi[k] = {
      nazwa: nazwa,
      wpisy: t.wpisy,
      pominiete: t.pominiete,
      pelnyCzas: t.pelnyCzas,
      gora: ["GA", "GB", "Push", "Pull"].indexOf(t.ts.klucz) !== -1,
      dol: ["DA", "DB", "Legs", "S"].indexOf(t.ts.klucz) !== -1
    };
  });

  // Bloki rozgrzewki i rozciągania
  wynik.czasBlokow = { rozgrzewka: 0, rozciaganie: 0 };
  if (p.rozgrzewka !== false || p.rozciaganie !== false) {
    Object.keys(wynik.treningi).forEach(function (k) {
      const t = wynik.treningi[k];
      const przed = t.gora ? "Rozgrzewka górnej części ciała" : t.dol ? "Rozgrzewka nóg i pośladków" : "Rozgrzewka ogólna";
      const po = t.gora ? "Rozciąganie po treningu: góra ciała" : t.dol ? "Rozciąganie po treningu: nogi" : "Rozciąganie po treningu: całe ciało";
      t.blokPrzed = p.rozgrzewka !== false ? (pgZnajdzBlok(przed, "rozgrzewka") || pgZnajdzBlok("Rozgrzewka ogólna", "rozgrzewka") || null) : null;
      t.blokPo = p.rozciaganie !== false ? (pgZnajdzBlok(po, "rozciaganie") || null) : null;
      wynik.czasBlokow.rozgrzewka = Math.max(wynik.czasBlokow.rozgrzewka, t.blokPrzed ? pgMinutyBloku(t.blokPrzed) : 0);
      wynik.czasBlokow.rozciaganie = Math.max(wynik.czasBlokow.rozciaganie, t.blokPo ? pgMinutyBloku(t.blokPo) : 0);
    });
  }

  // Bieganie
  if (p.cel === "bieg") {
    const ciagle = !!p.bieg20;
    for (let tydz = 0; tydz < 4; tydz++) {
      dniBiegu.forEach(function (przes, i) {
        const ostatni = i === dniBiegu.length - 1 && dniBiegu.length > 1;
        let czas;
        let notatka;
        if (ciagle) {
          czas = ostatni ? PG_BIEG_DLUGI[tydz] : PG_BIEG_LATWY[tydz];
          notatka = ostatni ? "Dłuższy, spokojny bieg. Tempo rozmowy: powinieneś móc mówić pełnymi zdaniami." : "Spokojny bieg w tempie rozmowy.";
        } else {
          czas = PG_MARSZOBIEG[tydz].min;
          notatka = PG_MARSZOBIEG[tydz].opis + ". Zacznij od 5 min szybkiego marszu. Tempo biegu ma być spokojne: takie, w którym możesz mówić.";
        }
        wynik.sesje.push({ dzien: tydz * 7 + przes, kardio: "rodzaj-bieganie", czas: czas, notatka: notatka });
      });
    }
  } else if (kardioIle > 0) {
    const rodzaj = PG_RODZAJE_KARDIO[(p.kardio && p.kardio.rodzaj) || "spacer"];
    for (let tydz = 0; tydz < 4; tydz++) {
      dniKardio.forEach(function (przes) {
        const baza = p.cel === "zdrowie" ? 30 : 25;
        wynik.sesje.push({
          dzien: tydz * 7 + przes, kardio: rodzaj, czas: baza + (tydz >= 2 ? 5 : 0),
          notatka: "Spokojne tempo, takie żeby dało się rozmawiać."
        });
      });
    }
  }

  wynik.sesje.sort(function (a, b) { return a.dzien - b.dzien; });
  pgPowody(wynik, p, podzial, kotw);

  // Za krótki czas: mówimy wprost, co pominięto i ile czasu potrzeba na pełny trening
  const klucze = Object.keys(wynik.treningi);
  const pominiete = klucze.some(function (k) { return wynik.treningi[k].pominiete.length > 0; });
  const liczbaPominietych = klucze.reduce(function (suma, k) { return Math.max(suma, wynik.treningi[k].pominiete.length); }, 0);
  if (pominiete && liczbaPominietych >= 2 && p.cel !== "sila") {
    const potrzeba = Math.max.apply(null, klucze.map(function (k) { return wynik.treningi[k].pelnyCzas; }));
    const nazwy = {};
    klucze.forEach(function (k) {
      wynik.treningi[k].pominiete.forEach(function (w) { nazwy[w.cw.nazwa] = true; });
    });
    wynik.uwagi.unshift("W " + p.czas + " minutach treningu mieszczą się ćwiczenia podstawowe (nogi, pchanie, ciągnięcie, brzuch). Żeby trening był pełniejszy i dawał lepszy efekt, wydłuż go do ok. " + Math.ceil(potrzeba / 5) * 5 + " minut. Wtedy dołożę: " + Object.keys(nazwy).slice(0, 6).join(", ").toLowerCase() + (Object.keys(nazwy).length > 6 ? " i inne" : "") + ".");
  }

  // Nazwa planu
  const etykietaPodzialu = {
    fb: "całe ciało", ul: "góra / dół", ppl: "push / pull / legs", bieg: p.bieg20 ? "bieg ciągły" : "marszobieg"
  }[podzial.typ];
  wynik.nazwa = PG_NAZWY_CELI[p.cel] + " – " + etykietaPodzialu + " " + p.dni + "×";
  if (p.tygodni > 4) {
    wynik.nazwa += " (blok 1/" + (p.tygodni / 4) + ")";
  }
  return wynik;
}

// Grupa mięśni ćwiczenia do liczenia serii: klatka, plecy, barki, ramiona, nogi (z pośladkami), brzuch, lydki
function pgGrupa(cw) {
  if (/Wspięcia|Tibialis/i.test(cw.nazwa)) {
    return "lydki";
  }
  const mapa = {
    "partia-klatka": "klatka", "partia-plecy": "plecy", "partia-barki": "barki", "partia-ramiona": "ramiona",
    "partia-nogi": "nogi", "partia-posladki": "nogi", "partia-brzuch": "brzuch"
  };
  return mapa[(cw.partieIds || [])[0]] || null;
}

// "Dlaczego ten plan?" i ostrzeżenia
function pgPowody(wynik, p, podzial, kotw) {
  const powody = wynik.powody;
  const poziomy = ["osoby początkującej", "osoby początkującej", "osoby średniozaawansowanej", "osoby zaawansowanej"];
  if (podzial.typ === "bieg") {
    powody.push(p.bieg20
      ? "Biegasz ciągle, więc plan to spokojne biegi z jednym dłuższym w tygodniu. Czas rośnie co tydzień o ok. 5 minut."
      : "Zaczynasz od marszobiegu: krótkie odcinki biegu przeplatane marszem. Co tydzień biegu jest więcej, a marszu mniej, co oszczędza stawy i pozwala zbudować kondycję.");
    if (wynik.treningi.S) {
      powody.push("Krótkie ćwiczenia nóg i brzucha (2 serie) wzmacniają stawy i poprawiają ekonomię biegu.");
    }
  } else {
    const nazwaPodzialu = { fb: "całe ciało 2–3 razy w tygodniu", ul: "podział góra / dół", ppl: "podział push / pull / legs" }[podzial.typ];
    powody.push("Dla " + poziomy[p.dosw] + " przy " + p.dni + " dniach dobrze działa " + nazwaPodzialu + ": każda duża partia jest trenowana regularnie, a między treningami ma czas na regenerację.");
    // Objętość: serie tygodniowo na grupę mięśni w pierwszym tygodniu
    const serie = {};
    wynik.sesje.filter(function (s) { return s.dzien < 7 && s.trening; }).forEach(function (s) {
      wynik.treningi[s.trening].wpisy.forEach(function (w) {
        const g = pgGrupa(w.cw);
        if (g && !w.statyczne) {
          serie[g] = (serie[g] || 0) + w.serie;
        }
        if (g === "brzuch" || (w.statyczne && (w.cw.partieIds || [])[0] === "partia-brzuch")) {
          serie.brzuch = (serie.brzuch || 0) + (w.statyczne ? w.serie : 0);
        }
      });
    });
    wynik.serieTygodniowo = serie;
    const kolejnosc = [["klatka", "klatka"], ["plecy", "plecy"], ["nogi", "nogi i pośladki"], ["barki", "barki"], ["ramiona", "ramiona"], ["brzuch", "brzuch"], ["lydki", "łydki"]];
    const opis = kolejnosc.filter(function (g) { return serie[g[0]]; }).map(function (g) {
      return g[1] + " " + serie[g[0]];
    });
    if (opis.length > 0) {
      powody.push("Serie w tygodniu: " + opis.join(", ") + ". Badania pokazują, że dla wzrostu mięśni najlepiej sprawdza się ok. 10–20 serii tygodniowo na dużą partię, zależnie od poziomu.");
    }
    const brak = kolejnosc.filter(function (g) { return !serie[g[0]] && ["ramiona", "lydki", "barki"].indexOf(g[0]) !== -1; }).map(function (g) { return g[1]; });
    if (brak.length > 0 && p.cel !== "sila") {
      wynik.uwagi.push("Ćwiczenia na " + brak.join(", ") + " pracują tu tylko pośrednio (przy innych ruchach), bo nie mieszczą się w " + p.czas + " minutach.");
    }
    if (p.cel === "sila") {
      powody.push("Siłę buduje się ciężkimi seriami po 4–6 powtórzeń i długimi przerwami (3 min), dlatego główne ćwiczenia są właśnie takie.");
    } else if (p.cel === "zdrowie") {
      powody.push("Zalecenia zdrowotne (m.in. NHS) to ćwiczenia siłowe dla wszystkich grup mięśni co najmniej 2 razy w tygodniu oraz aktywność aerobowa. Dlatego plan łączy oba.");
    } else if (p.cel === "rzezba") {
      powody.push("Przy redukcji tkanki tłuszczowej mięśnie trzeba nadal trenować ciężko, więc trening jest taki sam jak na masę, a do tego dochodzi kardio. Najważniejsza jest dieta, której plan nie obejmuje.");
    } else {
      powody.push("Powtórzenia 6–12 w większości serii i ok. 2 powtórzenia zapasu na koniec serii to sprawdzony zakres dla budowy mięśni.");
    }
  }
  if (wynik.czasBlokow && (wynik.czasBlokow.rozgrzewka || wynik.czasBlokow.rozciaganie)) {
    powody.push("Rozgrzewka (ok. " + wynik.czasBlokow.rozgrzewka + " min) i rozciąganie (ok. " + wynik.czasBlokow.rozciaganie + " min) są dołączone poza czasem treningu. Możesz je wyłączyć w edycji planu.");
  }
  powody.push("Po każdym treningu ocenisz ćwiczenia (łatwo / w sam raz / ciężko), a aplikacja zaproponuje, kiedy dołożyć ciężar.");

  if (p.sprzet !== "c" && kotw.domyslne && p.cel !== "bieg") {
    wynik.uwagi.push("Ciężary startowe dobrałem ostrożnie. Jeśli któryś jest za lekki albo za ciężki, popraw go w trakcie treningu. Zaczynaj lżej, jeśli masz wątpliwości.");
  }
  if (p.sprzet === "c" && p.drazek === false) {
    wynik.uwagi.push("Bez drążka podciąganie australijskie zrobisz pod stabilnym stołem albo na bardzo niskim drążku. Z drążkiem plan będzie pełniejszy.");
  }
  if (p.sprzet === "c" && p.drazek !== false && !p.poreczy) {
    wynik.uwagi.push("Bez poręczy dipy wykonasz na ławce lub krześle. Z poręczami zrobisz trudniejsze wersje.");
  }
  if (p.bole && p.bole.length > 0) {
    wynik.uwagi.push("Wyłączyłem ćwiczenia obciążające bolące miejsca (" + p.bole.join(", ") + "). Przy bólu skonsultuj się z lekarzem lub fizjoterapeutą.");
  }
}

// ===== Zapis planu do danych aplikacji =====

function pgZapisz(wynik, opcje) {
  const zapiszZestawy = !!(opcje && opcje.zapiszZestawy);
  const p = wynik.profil;
  const znacznik = Date.now();
  const rodzajSily = p.sprzet === "c" ? "rodzaj-kalistenika" : "rodzaj-cialo";

  // Aktywności: siłowa i kardio
  const aktywnosci = [];
  function aktywnosc(rodzajId, ogolny) {
    let a = aktywnosci.find(function (x) { return x.rodzajId === rodzajId; });
    if (!a) {
      a = {
        id: "ak-" + (znacznik + aktywnosci.length), rodzajId: rodzajId, partiaId: null, partieIds: [],
        ogolny: !!ogolny, razy: 0, kolor: KOLORY_AKTYWNOSCI[aktywnosci.length % KOLORY_AKTYWNOSCI.length]
      };
      aktywnosci.push(a);
    }
    a.razy++;
    return a;
  }

  // Treningi (zestawy robocze)
  const treningiId = {};
  Object.keys(wynik.treningi).forEach(function (k, i) {
    const t = wynik.treningi[k];
    const trening = {
      id: "tr-pg-" + znacznik + "-" + i,
      nazwa: t.nazwa + " – " + wynik.nazwa,
      cwiczeniaIds: t.wpisy.map(function (w) { return w.cw.id; }),
      roboczy: !zapiszZestawy
    };
    if (zapiszZestawy) {
      trening.parametry = {};
      t.wpisy.forEach(function (w) { trening.parametry[w.cw.id] = pgIlosc(w); });
    }
    dane.treningi.push(trening);
    treningiId[k] = trening.id;
    // Ćwiczenia z ciężarem muszą mieć włączone pole ciężaru; zapisujemy też zalecaną przerwę
    t.wpisy.forEach(function (w) {
      if (w.kg > 0 && !w.cw.zCiezarem) {
        w.cw.zCiezarem = true;
      }
      if (!w.cw.przerwa) {
        w.cw.przerwa = w.przerwa;
      }
    });
  });

  const sesje = [];
  wynik.sesje.forEach(function (s) {
    if (s.trening) {
      const t = wynik.treningi[s.trening];
      const a = aktywnosc(rodzajSily, true);
      const sesja = nowaSesja(a, s.dzien);
      sesja.treningId = treningiId[s.trening];
      const parametry = {};
      t.wpisy.forEach(function (w) { parametry[w.cw.id] = pgIlosc(w); });
      if (t.blokPrzed) {
        sesja.blokPrzedId = t.blokPrzed.id;
      }
      if (t.blokPo) {
        sesja.blokPoId = t.blokPo.id;
      }
      [t.blokPrzed, t.blokPo].forEach(function (blok) {
        if (!blok) { return; }
        blok.cwiczeniaIds.forEach(function (id) {
          if (!(id in parametry)) {
            parametry[id] = (blok.parametry && blok.parametry[id]) || DOMYSLNA_ILOSC_BLOKU;
          }
        });
      });
      sesja.parametry = parametry;
      sesje.push(sesja);
    } else {
      const a = aktywnosc(s.kardio, false);
      const sesja = nowaSesja(a, s.dzien);
      sesja.czas = { wartosc: s.czas, jednostka: "min" };
      sesja.notatka = s.notatka;
      sesje.push(sesja);
    }
  });

  const plan = {
    id: "pl-" + znacznik,
    okres: "miesiac",
    nazwa: wynik.nazwa,
    start: dzisISO(),
    aktywnosci: aktywnosci,
    sesje: sesje,
    utworzono: new Date().toISOString(),
    kreator: { profil: JSON.parse(JSON.stringify(p)), blok: 1, powody: wynik.powody }
  };
  dane.plany.push(plan);
  zapiszDane();
  return plan;
}
