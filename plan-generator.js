// ===== Generator planów treningowych =====
// Z odpowiedzi użytkownika (profil) układa plan na 4 tygodnie z ćwiczeń, które są w bazie.
// Zasady (skrót):
//  - objętość: początkujący ok. 10–12 serii tygodniowo na dużą partię, średni 13–15, zaawansowany 16–20
//  - masa i rzeźba: 6–12 powtórzeń, przerwy 1–2 min; siła: 4–6 powtórzeń, przerwy 3 min
//  - każda duża partia co najmniej 2× w tygodniu (5 dni: góra/dół + push/pull/legs, 6 dni: push/pull/legs 2×)
//  - górny limit serii tygodniowo na partię (pgOgraniczObjetosc), brzuch w każdym treningu siłowym
//  - ćwiczenia zależne od poziomu i sprzętu (PG_T siłownia, PG_TD dom, drabinki kalisteniki)
//  - serie kończymy 2–3 powtórzenia przed upadkiem mięśniowym
// Ciężary startowe wyliczamy z kilku "kotwic" (ciężar, który użytkownik zrobi 10 razy z zapasem)
// przez proporcje między ćwiczeniami.

// ===== Szablony ćwiczeń =====

// ===== Ćwiczenia zależne od poziomu =====
// Każde "miejsce" w treningu ma listy dla poziomów 0–3 (pierwsze dostępne i bezpieczne jest wybierane,
// kolejne służą jako zamienniki przy bólach i jako warianty w kolejnych blokach).
// Początkujący: maszyny i hantle (stabilne, łatwa technika) oraz podstawowe ruchy ze sztangą dopiero od poziomu 1.
// Średniozaawansowani: ciężkie wielostawowe ze sztangą. Zaawansowani: więcej wariantów (front squat, Pendlay, martwy ciąg...).
function pgT(l0, l1, l2, l3) {
  return [l0, l1, l2, l3];
}

const PG_T = {
  SQ: pgT(
    ["Wypychanie ciężaru na suwnicy (Leg Press)", "Przysiad Goblet z kettlebellem lub hantlem", "Hip Thrust na maszynie"],
    ["Przysiad ze sztangą na plecach (Back Squat)", "Wypychanie ciężaru na suwnicy (Leg Press)", "Przysiad Goblet z kettlebellem lub hantlem", "Hip Thrust ze sztangą"],
    ["Przysiad ze sztangą na plecach (Back Squat)", "Przysiad Hack na maszynie", "Wypychanie ciężaru na suwnicy (Leg Press)", "Hip Thrust ze sztangą"],
    ["Przysiad ze sztangą na plecach (Back Squat)", "Przysiad ze sztangą z przodu (Front Squat)", "Przysiad Hack na maszynie", "Hip Thrust ze sztangą"]),
  SQ2: pgT(
    ["Przysiad Goblet z kettlebellem lub hantlem", "Wypychanie ciężaru na suwnicy (Leg Press)", "Uginanie nóg siedząc na maszynie"],
    ["Wypychanie ciężaru na suwnicy (Leg Press)", "Przysiad bułgarski z hantlami", "Uginanie nóg siedząc na maszynie"],
    ["Przysiad bułgarski z hantlami", "Wykroki chodzone z hantlami", "Wypychanie ciężaru na suwnicy (Leg Press)", "Hip Thrust na maszynie"],
    ["Przysiad bułgarski z hantlami", "Wykroki chodzone z hantlami", "Przysiad Hack na maszynie", "Hip Thrust na maszynie"]),
  SQB: pgT(
    ["Przysiad Hack na maszynie", "Wypychanie ciężaru na suwnicy (Leg Press)", "Przysiad Goblet z kettlebellem lub hantlem"],
    ["Przysiad Hack na maszynie", "Wypychanie ciężaru na suwnicy (Leg Press)", "Uginanie nóg siedząc na maszynie"],
    ["Przysiad Hack na maszynie", "Wypychanie ciężaru na suwnicy (Leg Press)", "Uginanie nóg siedząc na maszynie"],
    ["Wypychanie ciężaru na suwnicy (Leg Press)", "Przysiad Hack na maszynie", "Uginanie nóg siedząc na maszynie"]),
  HING: pgT(
    ["Martwy ciąg rumuński z hantlami", "Uginanie nóg leżąc na maszynie"],
    ["Martwy ciąg rumuński ze sztangą (RDL)", "Martwy ciąg rumuński z hantlami", "Uginanie nóg leżąc na maszynie"],
    ["Martwy ciąg rumuński ze sztangą (RDL)", "Martwy ciąg na prostych nogach ze sztangą (SLDL)", "Uginanie nóg leżąc na maszynie"],
    ["Martwy ciąg rumuński ze sztangą (RDL)", "Martwy ciąg klasyczny", "Martwy ciąg na prostych nogach ze sztangą (SLDL)", "Uginanie nóg leżąc na maszynie"]),
  GLUTE: pgT(
    ["Hip Thrust na maszynie", "Martwy ciąg rumuński z hantlami"],
    ["Hip Thrust ze sztangą", "Hip Thrust na maszynie", "Martwy ciąg rumuński z hantlami"],
    ["Hip Thrust ze sztangą", "Hip Thrust na maszynie"],
    ["Hip Thrust ze sztangą", "Pull-Through na wyciągu", "Hip Thrust na maszynie"]),
  PRESS: pgT(
    ["Wyciskanie na maszynie Hammer (siedząc)", "Wyciskanie hantli na ławce poziomej"],
    ["Wyciskanie hantli na ławce poziomej", "Wyciskanie sztangi na ławce poziomej", "Wyciskanie na maszynie Hammer (siedząc)"],
    ["Wyciskanie sztangi na ławce poziomej", "Wyciskanie hantli na ławce poziomej", "Wyciskanie na maszynie Hammer (siedząc)"],
    ["Wyciskanie sztangi na ławce poziomej", "Wyciskanie hantli na ławce poziomej", "Wyciskanie sztangi leżąc na podłodze (Floor Press)"]),
  FLY: pgT(
    ["Rozpiętki na maszynie Pec Deck (butterfly)", "Wyciskanie na maszynie skośnej"],
    ["Rozpiętki na maszynie Pec Deck (butterfly)", "Rozpiętki z hantlami na ławce poziomej"],
    ["Rozpiętki z hantlami na skosie", "Rozpiętki na maszynie Pec Deck (butterfly)"],
    ["Dipy z pochyleniem tułowia", "Rozpiętki z hantlami na skosie", "Rozpiętki na maszynie Pec Deck (butterfly)"]),
  INCL: pgT(
    ["Wyciskanie na maszynie skośnej", "Wyciskanie hantli na ławce skośnej dodatniej"],
    ["Wyciskanie hantli na ławce skośnej dodatniej", "Wyciskanie na maszynie skośnej"],
    ["Wyciskanie sztangi na ławce skośnej dodatniej", "Wyciskanie hantli na ławce skośnej dodatniej", "Wyciskanie na maszynie skośnej"],
    ["Wyciskanie sztangi na ławce skośnej dodatniej", "Wyciskanie hantli na ławce skośnej dodatniej", "Rozpiętki z hantlami na skosie"]),
  ROW: pgT(
    ["Wiosłowanie na maszynie z oparciem klatki", "Przyciąganie linki wyciągu dolnego do brzucha (siedząc)"],
    ["Wiosłowanie na maszynie siedząc (chwyt neutralny)", "Wiosłowanie hantlą jednorącz w oparciu o ławkę", "Wiosłowanie sztangą w opadzie tułowia"],
    ["Wiosłowanie sztangą w opadzie tułowia", "Wiosłowanie sztangą T-Bar", "Wiosłowanie hantlą jednorącz w oparciu o ławkę"],
    ["Wiosłowanie sztangą z podłogi (Pendlay)", "Wiosłowanie sztangą w opadzie tułowia", "Wiosłowanie sztangą T-Bar"]),
  ROW2: pgT(
    ["Przyciąganie linki wyciągu dolnego do brzucha (siedząc)", "Wiosłowanie na maszynie siedząc (chwyt neutralny)"],
    ["Wiosłowanie na maszynie siedząc (chwyt neutralny)", "Przyciąganie linki wyciągu dolnego do brzucha (siedząc)", "Wiosłowanie jednorącz na wyciągu"],
    ["Wiosłowanie hantlą jednorącz w oparciu o ławkę", "Wiosłowanie jednorącz na wyciągu", "Wiosłowanie na maszynie siedząc (chwyt neutralny)"],
    ["Wiosłowanie hantlami leżąc brzuchem na ławce skośnej (Seal Row)", "Wiosłowanie hantlą jednorącz w oparciu o ławkę", "Wiosłowanie na maszynie z oparciem klatki"]),
  PION: pgT(
    ["Ściąganie drążka wyciągu górnego do klatki", "Podciąganie z asystą na maszynie"],
    ["Ściąganie drążka wyciągu górnego do klatki", "Podciąganie z asystą na maszynie", "Ściąganie drążka V (wąski chwyt neutralny)"],
    ["Podciąganie z asystą na maszynie", "Ściąganie drążka wyciągu górnego do klatki", "Ściąganie drążka V (wąski chwyt neutralny)"],
    ["Podciąganie nachwytem", "Ściąganie drążka wyciągu górnego do klatki", "Ściąganie drążka V (wąski chwyt neutralny)"]),
  OHP: pgT(
    ["Wyciskanie hantli siedząc", "Wyciskanie na maszynie nad głowę (siedząc)", "Unoszenie hantli bokiem w staniu"],
    ["Wyciskanie hantli siedząc", "Wyciskanie na maszynie nad głowę (siedząc)", "Unoszenie hantli bokiem w staniu"],
    ["Wyciskanie żołnierskie ze sztangą (OHP)", "Wyciskanie hantli siedząc", "Unoszenie hantli bokiem w staniu"],
    ["Wyciskanie żołnierskie ze sztangą (OHP)", "Wyciskanie Arnolda", "Unoszenie hantli bokiem w staniu"]),
  LAT: pgT(
    ["Unoszenie ramion bokiem na maszynie", "Unoszenie hantli bokiem w staniu"],
    ["Unoszenie hantli bokiem w staniu", "Unoszenie ramion bokiem na maszynie"],
    ["Unoszenie hantli bokiem w staniu", "Unoszenie ramienia bokiem na wyciągu dolnym"],
    ["Unoszenie ramienia bokiem na wyciągu dolnym", "Unoszenie hantli bokiem w staniu"]),
  REAR: pgT(
    ["Odwrotne rozpiętki na maszynie (Reverse Pec Deck)", "Face Pulls (przyciąganie liny do twarzy)"],
    ["Face Pulls (przyciąganie liny do twarzy)", "Odwrotne rozpiętki na maszynie (Reverse Pec Deck)"],
    ["Face Pulls (przyciąganie liny do twarzy)", "Unoszenie hantli w opadzie tułowia"],
    ["Face Pulls (przyciąganie liny do twarzy)", "Unoszenie hantli w opadzie tułowia", "Odwrotne rozpiętki na maszynie (Reverse Pec Deck)"]),
  BIC: pgT(
    ["Uginanie ramion z hantlami z supinacją", "Uginanie ramion na maszynie (Preacher Curl)"],
    ["Uginanie ramion z hantlami z supinacją", "Uginanie ramion ze sztangą łamaną stojąc"],
    ["Uginanie ramion ze sztangą łamaną stojąc", "Uginanie ramion z hantlami z supinacją"],
    ["Uginanie ramion z hantlami na ławce skośnej dodatniej", "Uginanie ramion ze sztangą łamaną stojąc", "Uginanie ramion z hantlami z supinacją"]),
  BIC2: pgT(
    ["Uginanie ramion na wyciągu dolnym z liną (chwyt młotkowy)", "Uginanie ramion z hantlami chwytem młotkowym (Hammer Curl)"],
    ["Uginanie ramion z hantlami chwytem młotkowym (Hammer Curl)", "Uginanie ramion na wyciągu dolnym z liną (chwyt młotkowy)"],
    ["Uginanie ramion z hantlami chwytem młotkowym (Hammer Curl)", "Uginanie ramion na modlitewniku ze sztangą łamaną"],
    ["Uginanie ramion na modlitewniku ze sztangą łamaną", "Uginanie ramion z hantlami chwytem młotkowym (Hammer Curl)"]),
  TRI: pgT(
    ["Prostowanie ramion na wyciągu górnym z liną (Pushdown)", "Prostowanie ramion na maszynie do tricepsu (siedząc)"],
    ["Prostowanie ramion na wyciągu górnym z liną (Pushdown)", "Prostowanie ramion na wyciągu z drążkiem prostym"],
    ["Wyciskanie francuskie ze sztangą łamaną leżąc", "Prostowanie ramion na wyciągu górnym z liną (Pushdown)"],
    ["Wyciskanie francuskie ze sztangą łamaną leżąc", "Prostowanie ramion na wyciągu górnym z liną (Pushdown)"]),
  TRI2: pgT(
    ["Prostowanie ramion z liną wyciągu zza głowy", "Prostowanie ramion na wyciągu z drążkiem prostym"],
    ["Prostowanie ramion z liną wyciągu zza głowy", "Prostowanie ramienia z hantlem w opadzie tułowia (Kickback)"],
    ["Prostowanie ramion z liną wyciągu zza głowy", "Wyciskanie francuskie z hantlem jednorącz (siedząc)"],
    ["Prostowanie ramion z liną wyciągu zza głowy", "Wyciskanie francuskie z hantlem jednorącz (siedząc)"]),
  CALF: pgT(
    ["Wspięcia na palce siedząc na maszynie", "Wspięcia na palce na suwnicy"],
    ["Wspięcia na palce siedząc na maszynie", "Wspięcia na palce stojąc ze sztangą"],
    ["Wspięcia na palce stojąc ze sztangą", "Wspięcia na palce na suwnicy", "Wspięcia na palce siedząc na maszynie"],
    ["Wspięcia na palce stojąc ze sztangą", "Wspięcia na palce na suwnicy", "Wspięcia na palce siedząc na maszynie"]),
  CALF2: pgT(
    ["Wspięcia na palce na suwnicy", "Wspięcia na palce siedząc na maszynie"],
    ["Wspięcia na palce na suwnicy", "Wspięcia na palce siedząc na maszynie"],
    ["Wspięcia na palce siedząc na maszynie", "Wspięcia na palce na suwnicy"],
    ["Wspięcia na palce siedząc na maszynie", "Wspięcia na palce na suwnicy"]),
  CURL: pgT(
    ["Uginanie nóg leżąc na maszynie", "Uginanie nóg siedząc na maszynie"],
    ["Uginanie nóg leżąc na maszynie", "Uginanie nóg siedząc na maszynie"],
    ["Uginanie nóg leżąc na maszynie", "Uginanie nóg siedząc na maszynie"],
    ["Uginanie nóg leżąc na maszynie", "Uginanie jednej nogi stojąc na maszynie"]),
  CURL2: pgT(
    ["Uginanie nóg siedząc na maszynie", "Uginanie nóg leżąc na maszynie"],
    ["Uginanie nóg siedząc na maszynie", "Uginanie nóg leżąc na maszynie"],
    ["Uginanie nóg siedząc na maszynie", "Uginanie nóg leżąc na maszynie"],
    ["Uginanie nóg siedząc na maszynie", "Uginanie jednej nogi stojąc na maszynie"]),
  CORE: pgT(
    ["Unoszenie nóg leżąc", "Deska przodem (Front Plank)"],
    ["Unoszenie nóg leżąc", "Brzuszki na maszynie (Ab Crunch)"],
    ["Allahy (skłony tułowia z linką wyciągu górnego)", "Kółko brzuszne (Ab Wheel Rollout) z kolan", "Unoszenie nóg leżąc"],
    ["Kółko brzuszne (Ab Wheel Rollout) z kolan", "Skłony tułowia na ławce skośnej ujemnej z talerzem", "Allahy (skłony tułowia z linką wyciągu górnego)"]),
  COREB: pgT(
    ["Deska przodem (Front Plank)", "Pallof Press (wyciskanie linki w bok)"],
    ["Pallof Press (wyciskanie linki w bok)", "Deska przodem (Front Plank)"],
    ["Pallof Press (wyciskanie linki w bok)", "Deska przodem z talerzem na plecach", "Drwal (Woodchopper) na wyciągu"],
    ["Drwal (Woodchopper) na wyciągu", "Deska przodem z talerzem na plecach", "Pallof Press (wyciskanie linki w bok)"]),
  // Krótki brzuch na koniec treningu góry (inny niż w dniach nóg, żeby było różnorodnie)
  COREG: pgT(
    ["Dead Bug", "Deska przodem (Front Plank)"],
    ["Deska przodem (Front Plank)", "Dead Bug"],
    ["Deska bokiem (Side Plank)", "Drwal (Woodchopper) na wyciągu"],
    ["Deska przodem z talerzem na plecach", "Deska bokiem (Side Plank)"])
};


// Dom z hantlami (i ławką): ten sam układ, inne ćwiczenia; trudniejsze warianty dla bardziej zaawansowanych
const PG_TD = {
  SQ: pgT(
    ["Przysiad Goblet z kettlebellem lub hantlem", "Przysiad z hantlami", "Most biodrowy"],
    ["Przysiad Goblet z kettlebellem lub hantlem", "Przysiad z hantlami", "Most biodrowy"],
    ["Przysiad bułgarski z hantlami", "Przysiad Goblet z kettlebellem lub hantlem", "Most biodrowy jednonóż"],
    ["Przysiad bułgarski z hantlami", "Przysiad z hantlami", "Most biodrowy jednonóż"]),
  SQ2: pgT(
    ["Wejścia na podwyższenie z hantlami (Step-up)", "Przysiad sumo z hantlem", "Most biodrowy", "Most biodrowy jednonóż"],
    ["Wykroki chodzone z hantlami", "Wejścia na podwyższenie z hantlami (Step-up)", "Most biodrowy"],
    ["Wykroki chodzone z hantlami", "Wejścia na podwyższenie z hantlami (Step-up)", "Hip Thrust jednonóż"],
    ["Wejścia na podwyższenie z hantlami (Step-up)", "Wykroki chodzone z hantlami", "Hip Thrust jednonóż"]),
  SQB: pgT(
    ["Przysiad sumo z hantlem", "Przysiad Goblet z kettlebellem lub hantlem", "Most biodrowy"],
    ["Przysiad bułgarski z hantlami", "Przysiad sumo z hantlem", "Most biodrowy"],
    ["Przysiad Goblet z kettlebellem lub hantlem", "Przysiad sumo z hantlem", "Hip Thrust jednonóż"],
    ["Przysiad Goblet z kettlebellem lub hantlem", "Przysiad z hantlami", "Hip Thrust jednonóż"]),
  HING: pgT(
    ["Martwy ciąg rumuński z hantlami", "Most biodrowy", "Most biodrowy jednonóż"],
    ["Martwy ciąg rumuński z hantlami", "Most biodrowy jednonóż"],
    ["Martwy ciąg rumuński z hantlami", "Swing z kettlebellem", "Hip Thrust jednonóż"],
    ["Martwy ciąg rumuński z hantlami", "Swing z kettlebellem", "Hip Thrust jednonóż"]),
  GLUTE: pgT(
    ["Most biodrowy", "Martwy ciąg rumuński z hantlami"],
    ["Most biodrowy jednonóż", "Swing z kettlebellem"],
    ["Hip Thrust jednonóż", "Swing z kettlebellem"],
    ["Hip Thrust jednonóż", "Swing z kettlebellem"]),
  PRESS: pgT(
    ["Wyciskanie hantli na ławce poziomej", "Pompki z rękami na podwyższeniu"],
    ["Wyciskanie hantli na ławce poziomej", "Pompki klasyczne"],
    ["Wyciskanie hantli na ławce poziomej", "Pompki z nogami na podwyższeniu"],
    ["Wyciskanie hantli na ławce poziomej", "Pompki z nogami na podwyższeniu"]),
  FLY: pgT(
    ["Rozpiętki z hantlami na ławce poziomej", "Pompki z rękami na podwyższeniu"],
    ["Rozpiętki z hantlami na ławce poziomej", "Pompki klasyczne"],
    ["Rozpiętki z hantlami na skosie", "Pompki szerokie"],
    ["Pompki łucznicze", "Rozpiętki z hantlami na skosie"]),
  INCL: pgT(
    ["Wyciskanie hantli na ławce skośnej dodatniej", "Pompki klasyczne"],
    ["Wyciskanie hantli na ławce skośnej dodatniej", "Pompki klasyczne"],
    ["Wyciskanie hantli na ławce skośnej dodatniej", "Wyciskanie hantli z rotacją"],
    ["Wyciskanie hantli na ławce skośnej dodatniej", "Wyciskanie hantli z rotacją"]),
  ROW: pgT(
    ["Wiosłowanie hantlą jednorącz w oparciu o ławkę"],
    ["Wiosłowanie hantlą jednorącz w oparciu o ławkę"],
    ["Wiosłowanie hantlą jednorącz w oparciu o ławkę", "Wiosłowanie hantlami leżąc brzuchem na ławce skośnej (Seal Row)"],
    ["Wiosłowanie hantlą jednorącz w oparciu o ławkę", "Wiosłowanie hantlami leżąc brzuchem na ławce skośnej (Seal Row)"]),
  // Bez drążka nie ma ciągnięcia pionowego, więc plecy dostają dwa rodzaje wiosłowania
  ROW2: pgT(
    ["Wiosłowanie hantlami leżąc brzuchem na ławce skośnej (Seal Row)", "Wiosłowanie hantlą jednorącz w oparciu o ławkę"],
    ["Wiosłowanie hantlami leżąc brzuchem na ławce skośnej (Seal Row)", "Wiosłowanie hantlą jednorącz w oparciu o ławkę"],
    ["Wiosłowanie hantlami leżąc brzuchem na ławce skośnej (Seal Row)", "Wiosłowanie hantlą jednorącz w oparciu o ławkę"],
    ["Wiosłowanie hantlami leżąc brzuchem na ławce skośnej (Seal Row)", "Wiosłowanie hantlą jednorącz w oparciu o ławkę"]),
  PION: pgT(
    ["Wiosłowanie hantlami leżąc brzuchem na ławce skośnej (Seal Row)", "Wiosłowanie hantlą jednorącz w oparciu o ławkę"],
    ["Wiosłowanie hantlami leżąc brzuchem na ławce skośnej (Seal Row)", "Wiosłowanie hantlą jednorącz w oparciu o ławkę"],
    ["Wiosłowanie hantlami leżąc brzuchem na ławce skośnej (Seal Row)", "Wiosłowanie hantlą jednorącz w oparciu o ławkę"],
    ["Wiosłowanie hantlami leżąc brzuchem na ławce skośnej (Seal Row)", "Wiosłowanie hantlą jednorącz w oparciu o ławkę"]),
  OHP: pgT(
    ["Wyciskanie hantli siedząc", "Wyciskanie hantli nad głowę stojąc", "Unoszenie hantli bokiem w staniu"],
    ["Wyciskanie hantli siedząc", "Wyciskanie hantli nad głowę stojąc", "Unoszenie hantli bokiem w staniu"],
    ["Wyciskanie hantli nad głowę stojąc", "Wyciskanie hantli siedząc", "Unoszenie hantli bokiem w staniu"],
    ["Wyciskanie Arnolda", "Wyciskanie hantli nad głowę stojąc", "Unoszenie hantli bokiem w staniu"]),
  LAT: pgT(
    ["Unoszenie hantli bokiem w staniu"], ["Unoszenie hantli bokiem w staniu"],
    ["Unoszenie hantli bokiem w staniu", "Unoszenie hantli przed siebie"], ["Unoszenie hantli bokiem w staniu", "Unoszenie hantli przed siebie"]),
  REAR: pgT(
    ["Unoszenie hantli w opadzie tułowia"], ["Unoszenie hantli w opadzie tułowia"],
    ["Unoszenie hantli w opadzie tułowia"], ["Unoszenie hantli w opadzie tułowia"]),
  BIC: pgT(
    ["Uginanie ramion z hantlami z supinacją"],
    ["Uginanie ramion z hantlami z supinacją", "Uginanie ramion z hantlami chwytem młotkowym (Hammer Curl)"],
    ["Uginanie ramion z hantlami na ławce skośnej dodatniej", "Uginanie ramion z hantlami z supinacją"],
    ["Uginanie ramion z hantlami na ławce skośnej dodatniej", "Uginanie skoncentrowane z hantlem"]),
  BIC2: pgT(
    ["Uginanie ramion z hantlami chwytem młotkowym (Hammer Curl)"],
    ["Uginanie ramion z hantlami chwytem młotkowym (Hammer Curl)"],
    ["Uginanie ramion z hantlami chwytem młotkowym (Hammer Curl)", "Uginanie skoncentrowane z hantlem"],
    ["Uginanie skoncentrowane z hantlem", "Uginanie ramion z hantlami chwytem młotkowym (Hammer Curl)"]),
  TRI: pgT(
    ["Wyciskanie francuskie z hantlem jednorącz (siedząc)", "Prostowanie ramienia z hantlem w opadzie tułowia (Kickback)"],
    ["Wyciskanie francuskie z hantlem jednorącz (siedząc)", "Prostowanie ramienia z hantlem w opadzie tułowia (Kickback)"],
    ["Wyciskanie francuskie z hantlami leżąc (Skull Crushers)", "Wyciskanie francuskie z hantlem jednorącz (siedząc)"],
    ["Wyciskanie francuskie z hantlami leżąc (Skull Crushers)", "Wyciskanie francuskie z hantlem jednorącz (siedząc)"]),
  TRI2: pgT(
    ["Prostowanie ramienia z hantlem w opadzie tułowia (Kickback)", "Dipy na ławce"],
    ["Prostowanie ramienia z hantlem w opadzie tułowia (Kickback)", "Dipy na ławce"],
    ["Dipy na ławce", "Prostowanie ramienia z hantlem w opadzie tułowia (Kickback)"],
    ["Dipy na ławce", "Prostowanie ramienia z hantlem w opadzie tułowia (Kickback)"]),
  CALF: pgT(
    ["Wspięcia na palce obunóż"], ["Wspięcia na palce obunóż"],
    ["Wspięcia na palce jednonóż", "Wspięcia na palce obunóż"], ["Wspięcia na palce jednonóż", "Wspięcia na palce obunóż"]),
  CALF2: pgT(
    ["Wspięcia na palce obunóż"], ["Wspięcia na palce obunóż"],
    ["Wspięcia na palce z ugiętymi kolanami", "Wspięcia na palce obunóż"], ["Wspięcia na palce z ugiętymi kolanami", "Wspięcia na palce jednonóż"]),
  CURL: pgT(
    ["Most biodrowy", "Sliding Leg Curl"], ["Sliding Leg Curl", "Most biodrowy jednonóż"],
    ["Sliding Leg Curl", "Most biodrowy jednonóż"], ["Nordic Hamstring Curl", "Sliding Leg Curl"]),
  CURL2: pgT(
    ["Most biodrowy jednonóż", "Most biodrowy"], ["Sliding Leg Curl", "Most biodrowy jednonóż"],
    ["Sliding Leg Curl", "Hip Thrust jednonóż"], ["Sliding Leg Curl", "Nordic Hamstring Curl"]),
  CORE: pgT(
    ["Unoszenie nóg leżąc", "Deska przodem (Front Plank)"],
    ["Unoszenie nóg leżąc", "Odwrotne spięcia brzucha"],
    ["Scyzoryk (V-up)", "Russian Twist z talerzem lub kettlebellem", "Unoszenie nóg leżąc"],
    ["Scyzoryk (V-up)", "Hollow Body Rocks", "Russian Twist z talerzem lub kettlebellem"]),
  COREB: pgT(
    ["Deska przodem (Front Plank)", "Dead Bug"],
    ["Deska przodem (Front Plank)", "Dead Bug"],
    ["Hollow Body Hold", "Deska bokiem (Side Plank)"],
    ["Hollow Body Hold", "Skłony boczne z hantlem w staniu", "Deska bokiem (Side Plank)"]),
  COREG: pgT(
    ["Dead Bug", "Deska bokiem (Side Plank)"],
    ["Dead Bug", "Deska bokiem (Side Plank)"],
    ["Deska bokiem (Side Plank)", "Russian Twist z talerzem lub kettlebellem"],
    ["Russian Twist z talerzem lub kettlebellem", "Deska bokiem (Side Plank)"])
};

// pgS(siłownia, dom, ciało, serie, od, do, przerwa, rdzeń) — jedno "miejsce" w treningu.
// Siłownia i dom: listy dla poziomów 0–3 (PG_T, PG_TD). Ciało: lista albo drabinka "@...". null = brak ćwiczenia dla sprzętu.
function pgS(s, d, c, serie, od, do_, przerwa, rdzen) {
  return { s: s, d: d, c: c, serie: serie, od: od, do: do_, przerwa: przerwa, r: !!rdzen };
}
const T = PG_T;
const TD = PG_TD;

// Całe ciało
const PG_PRZYSIAD = pgS(T.SQ, TD.SQ, ["Przysiad klasyczny", "Przysiad bułgarski", "Most biodrowy"], 3, 8, 10, 120);
const PG_WYCISKANIE = pgS(T.PRESS, TD.PRESS, ["@push"], 3, 8, 10, 120);
const PG_WIOSLO = pgS(T.ROW, TD.ROW, ["@pull"], 3, 8, 10, 120);
const PG_BARKI = pgS(T.OHP, TD.OHP, ["Pompki pike", "Podciąganie łopatkowe"], 2, 10, 12, 90);
const PG_BICEPS = pgS(T.BIC, TD.BIC, ["Uginanie ramion w australijskim podciąganiu podchwytem"], 2, 10, 12, 60);
const PG_BRZUCH = pgS(T.CORE, TD.CORE, ["Deska przodem (Front Plank)"], 3, 10, 15, 60, true);
const PG_BRZUCH_B = pgS(T.COREB, TD.COREB, ["Hollow Body Hold", "Dead Bug"], 3, 10, 12, 60, true);
const PG_CORE_G = pgS(T.COREG, TD.COREG, ["Dead Bug"], 2, 10, 12, 45, true);
const PG_RDL = pgS(T.HING, TD.HING, ["Most biodrowy jednonóż", "Hip Thrust"], 3, 8, 10, 120);
const PG_SKOS = pgS(T.INCL, TD.INCL, ["@pushB"], 3, 8, 12, 120);
const PG_PION = pgS(T.PION, TD.PION, ["@pullB"], 3, 8, 12, 90);
const PG_NOGI2 = pgS(T.SQ2, TD.SQ2, ["Wykroki w tył", "Most biodrowy"], 2, 10, 12, 90);
const PG_BOKI = pgS(T.LAT, TD.LAT, null, 2, 12, 15, 60);
const PG_TRICEPS = pgS(T.TRI, TD.TRI, ["Dipy na ławce"], 2, 10, 12, 60);
const PG_LYDKI = pgS(T.CALF, TD.CALF, ["Wspięcia na palce jednonóż"], 2, 12, 15, 45);
const PG_UGINANIE_NOG = pgS(T.CURL, TD.CURL, ["Sliding Leg Curl"], 2, 10, 12, 75);

// Góra (podział góra / dół i push / pull / legs)
const PG_G_PRZOD = pgS(T.PRESS, TD.PRESS, ["@push"], 4, 6, 10, 150);
const PG_G_WIOSLO = pgS(T.ROW, TD.ROW, ["@pull"], 4, 8, 10, 120);
const PG_G_OHP = pgS(T.OHP, TD.OHP, ["Pompki pike", "Podciąganie łopatkowe"], 3, 8, 10, 120);
const PG_G_PION = pgS(T.PION, TD.PION, ["@pullB"], 3, 8, 12, 90);
const PG_G_KLATKA2 = pgS(T.FLY, TD.FLY, ["Pompki szerokie"], 2, 10, 15, 60);
const PG_G_BICEPS = pgS(T.BIC, TD.BIC, ["Uginanie ramion w australijskim podciąganiu podchwytem"], 3, 8, 12, 60);
const PG_G_TRICEPS = pgS(T.TRI, TD.TRI, ["Dipy na ławce"], 3, 10, 12, 60);
const PG_G_SKOS = pgS(T.INCL, TD.INCL, ["@pushB"], 4, 8, 12, 120);
const PG_G_WIOSLO2 = pgS(T.ROW2, TD.ROW2, ["Wiosłowanie australijskie jednorącz"], 3, 10, 12, 90);
const PG_G_BOKI = pgS(T.LAT, TD.LAT, ["Pompki pike z nogami na podwyższeniu"], 3, 12, 15, 60);
const PG_G_TYL = pgS(T.REAR, TD.REAR, ["Podciąganie łopatkowe"], 3, 12, 15, 60);
const PG_G_MLOTEK = pgS(T.BIC2, TD.BIC2, ["Uginanie ramion na niskim drążku podchwytem"], 2, 10, 12, 60);
const PG_G_TRICEPS2 = pgS(T.TRI2, TD.TRI2, ["Pompki z wąskim rozstawem dłoni"], 2, 10, 12, 60);

// Dół
const PG_D_PRZYSIAD = pgS(T.SQ, TD.SQ, ["Przysiad bułgarski", "Most biodrowy"], 4, 6, 10, 150);
const PG_D_RDL = pgS(T.HING, TD.HING, ["Most biodrowy jednonóż"], 3, 8, 10, 120);
const PG_D_WYKROKI = pgS(T.SQ2, TD.SQ2, ["Wykroki chodzone", "Most biodrowy jednonóż"], 3, 10, 12, 90);
const PG_D_UGINANIE = pgS(T.CURL, TD.CURL, ["Sliding Leg Curl"], 3, 10, 12, 75);
const PG_D_LYDKI = pgS(T.CALF, TD.CALF, ["Wspięcia na palce jednonóż"], 4, 10, 15, 60);
const PG_D_BRZUCH = pgS(T.CORE, TD.CORE, ["Unoszenie kolan w zwisie"], 3, 10, 15, 60, true);
const PG_D2_NOGI = pgS(T.SQB, TD.SQB, ["Wykroki w tył", "Most biodrowy"], 4, 10, 12, 120);
const PG_D2_POSLADKI = pgS(T.GLUTE, TD.GLUTE, ["Hip Thrust jednonóż"], 3, 8, 12, 120);
const PG_D2_UGINANIE = pgS(T.CURL2, TD.CURL2, null, 3, 10, 12, 75);
const PG_D2_PROSTOWANIE = pgS(["Prostowanie nóg na maszynie (siedząc)"], ["Wejścia na podwyższenie z hantlami (Step-up)", "Przysiad sumo z hantlem"], ["Przysiad kozacki (Cossack Squat)"], 3, 12, 15, 60);
const PG_D2_LYDKI = pgS(T.CALF2, TD.CALF2, ["Wspięcia na palce z ugiętymi kolanami"], 3, 12, 15, 45);
const PG_D2_CORE = pgS(T.COREB, TD.COREB, ["Hollow Body Hold"], 3, 10, 12, 60, true);

const PG_SZABLONY = {
  fb: {
    A: [PG_PRZYSIAD, PG_WYCISKANIE, PG_WIOSLO, PG_BARKI, PG_BICEPS, PG_BRZUCH],
    B: [PG_RDL, PG_SKOS, PG_PION, PG_NOGI2, PG_BOKI, PG_TRICEPS, PG_LYDKI, PG_UGINANIE_NOG, PG_BRZUCH_B]
  },
  ul: {
    GA: [PG_G_PRZOD, PG_G_WIOSLO, PG_G_OHP, PG_G_PION, PG_G_KLATKA2, PG_G_BICEPS, PG_G_TRICEPS, PG_CORE_G],
    DA: [PG_D_PRZYSIAD, PG_D_RDL, PG_D_WYKROKI, PG_D_UGINANIE, PG_D_LYDKI, PG_D_BRZUCH],
    GB: [PG_G_SKOS, PG_G_PION, PG_G_WIOSLO2, PG_G_KLATKA2, PG_G_BOKI, PG_G_TYL, PG_G_MLOTEK, PG_G_TRICEPS2, PG_CORE_G],
    DB: [PG_D2_NOGI, PG_D2_POSLADKI, PG_D2_UGINANIE, PG_D2_PROSTOWANIE, PG_D2_LYDKI, PG_D2_CORE]
  },
  ppl: {
    Push: [PG_G_PRZOD, PG_G_OHP, PG_G_SKOS, PG_G_KLATKA2, PG_G_BOKI, PG_G_TRICEPS, PG_G_TRICEPS2, PG_CORE_G],
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
    B: [pgK("hinge", 3), pgK("pushC", 3), pgK("pullVB", 3), pgK("lunge", 2), pgK("dip", 3), pgK("core2", 3, true), pgK("ham", 2), pgK("core4", 2), pgK("squatB", 2), pgK("biceps", 2), pgK("pushV", 2)]
  },
  ul: {
    GA: [pgK("push", 4), pgK("pullV", 4), pgK("pushV", 3), pgK("dip", 3), pgK("biceps", 2), pgK("core3", 2, true), pgK("pushC", 2), pgK("pullH", 2)],
    DA: [pgK("squat", 4), pgK("hinge", 3), pgK("ham", 3), pgK("calf", 3), pgK("core2", 3, true), pgK("lunge", 2)],
    GB: [pgK("pushC", 4), pgK("pullVB", 4), pgK("pullH", 3), pgK("pushV", 3), pgK("dip", 3), pgK("core4", 2, true), pgK("biceps", 2), pgK("pushB", 2)],
    DB: [pgK("lunge", 4), pgK("hinge", 3), pgK("squatB", 3), pgK("calf", 3), pgK("core1", 3, true), pgK("ham", 2), pgK("core3", 2)]
  },
  ppl: {
    Push: [pgK("push", 4), pgK("pushV", 3), pgK("dip", 3), pgK("pushC", 3), pgK("core3", 2, true), pgK("pushB", 2)],
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
  pushC: ["Pompki z rękami na podwyższeniu", "Pompki szerokie", "Pompki szerokie", "Pompki łucznicze", "Pompki pseudo-planche"],
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

// Przy treningu z masą ciała pompki i dipy są podstawą, więc przy bolącym nadgarstku zostają,
// ale z zaleceniem robienia ich na uchwytach do pompek lub na pięściach (nadgarstek prosto)
const PG_BOLE_NADGARSTEK_CIALO = /Uginanie ramion ze sztangą|Zginanie nadgarstków|Planche|Bear|Crab/i;

function pgKoliduje(nazwa, bole, sprzet) {
  return (bole || []).some(function (b) {
    const wzor = b === "nadgarstek" && sprzet === "c" ? PG_BOLE_NADGARSTEK_CIALO : PG_BOLE[b];
    return wzor && wzor.test(nazwa);
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

// Ukryte ćwiczenia: domyślnie generator ich nie używa (użytkownik może na to pozwolić w kreatorze).
// Ustawiane na czas jednego wywołania pgBuduj; pgUkrytePominiete zbiera ukryte, które zostały pominięte.
let pgUkryteDozwolone = false;
let pgUkrytePominiete = {};

function pgZnajdz(nazwa) {
  return dane.cwiczenia.find(function (c) {
    return c.nazwa === nazwa && (!c.ukryte || pgUkryteDozwolone);
  });
}

function pgCzyUkryte(nazwa) {
  return dane.cwiczenia.some(function (c) {
    return c.nazwa === nazwa && c.ukryte;
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

// Bieganie: b = dni biegu, s = dni siły (nogi i brzuch)
const PG_DNI_BIEG = {
  2: { b: [0, 3], s: [] },
  3: { b: [0, 2, 4], s: [] },
  4: { b: [0, 2, 4], s: [5] },
  5: { b: [0, 2, 4], s: [1, 5] },
  6: { b: [0, 2, 4, 6], s: [1, 5] }
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
  if (dni === 5) {
    // Góra / dół + push / pull / legs: każda partia 2× w tygodniu (sam push/pull/legs przy 5 dniach daje nogi raz na tydzień)
    return { typ: "ulppl", dni: dni, uwagi: uwagi };
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
  if (podzial.typ === "ulppl") {
    const k = j % 5;
    return k < 2 ? { klucz: ["GA", "DA"][k], szablon: "ul", przesun: 0 } : { klucz: ["Push", "Pull", "Legs"][k - 2], szablon: "ppl", przesun: 1 };
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
  if (Array.isArray(lista[0])) {
    lista = lista[Math.min(p.dosw || 0, lista.length - 1)];
  }
  let plaska = [];
  lista.forEach(function (n) {
    plaska = plaska.concat(n.indexOf("@k:") === 0 ? pgDrabinka(n, p, true) : [n]);
  });
  lista = plaska.filter(function (n) {
    const pasuje = n && !uzyte[n] && !uzyte["~" + pgKlucz(n)] && !pgKoliduje(n, p.bole, p.sprzet);
    if (pasuje && !pgUkryteDozwolone && pgCzyUkryte(n)) {
      pgUkrytePominiete[n] = true;
      return false;
    }
    return pasuje && pgZnajdz(n);
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
  } else if (p.sprzet !== "c") {
    // Masa i rzeźba: serie, zakresy i przerwy rosną z doświadczeniem (początkujący: więcej powtórzeń i lżej, zaawansowani: ciężej)
    const poz = p.dosw || 0;
    if (!slot.r) {
      if (glowne) {
        // Przy 2 treningach w tygodniu każda partia jest ćwiczona rzadziej, więc główne ćwiczenia dostają serię więcej
        serie = [3, 3, 4, 4][poz] + (p.dni <= 2 ? 1 : 0);
        od = [10, 8, 6, 5][poz];
        do_ = [12, 10, 10, 8][poz];
        przerwa = [90, 120, 150, 150][poz];
      } else {
        serie = Math.min(slot.serie, [2, 2, 3, 3][poz]);
        od = [12, 10, 8, 8][poz];
        do_ = [15, 12, 12, 12][poz];
        przerwa = [60, 75, 75, 75][poz];
      }
    }
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

// Ciężar startowy: z ostatnich wyników (kolejny blok) albo wyliczony z kotwic
function pgKg(cw, p, kotw) {
  if (p.sprzet === "c") {
    return 0;
  }
  return p.ostatnie && p.ostatnie[cw.nazwa] > 0 ? p.ostatnie[cw.nazwa] : pgCiezar(cw.nazwa, kotw);
}

// Zwraca listę wpisów treningu: { cw, serie, od, do, przerwa, kg, statyczne, czasy }
function pgBudujTrening(sloty, p, kotw, przesun) {
  const uzyte = {};
  let wpisy = [];
  sloty.forEach(function (slot, i) {
    // Kolejne bloki: ćwiczenia dodatkowe (od 4. miejsca) zmieniają się na inne warianty, główne zostają
    const obrot = i >= 3 && p.sprzet !== "c" ? (p.blokNr || 1) - 1 : 0;
    const cw = pgWybierzCwiczenie(slot, p, uzyte, (przesun || 0) + obrot);
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
      kg: pgKg(cw, p, kotw),
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
          kg: pgKg(cw, p, kotw), statyczne: cw.rodzajId === "rodzaj-statyczny"
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
  pgUkryteDozwolone = !!p.uzyjUkrytych;
  pgUkrytePominiete = {};
  try {
    return pgBudujPlan(p);
  } finally {
    pgUkryteDozwolone = false;
  }
}

function pgBudujPlan(p) {
  const kotw = pgKotwice(p);
  const podzial = pgPodzial(p);
  const wynik = { treningi: {}, sesje: [], powody: [], uwagi: podzial.uwagi.slice(), profil: p, kotwice: kotw };
  let kardioIle = p.kardio && p.kardio.ile ? p.kardio.ile : 0;

  // Dni tygodnia (przesunięcia od dziś). Siła: tyle dni, ile przewiduje podział (początkujący max 4).
  // Bieganie: biegi nie dzień po dniu (stawy i ścięgna potrzebują dnia przerwy), marszobieg max 3× w tygodniu.
  let dniBiegu = [];
  let dniSily;
  let wzor;
  if (p.cel === "bieg") {
    const uklad = PG_DNI_BIEG[Math.min(6, Math.max(2, p.dni))];
    dniBiegu = p.bieg20 ? uklad.b : uklad.b.slice(0, 3);
    dniSily = uklad.s;
    wzor = dniBiegu.concat(dniSily);
    kardioIle = 0;
  } else {
    wzor = PG_DNI[Math.min(6, Math.max(1, podzial.dni))];
    dniSily = wzor;
  }
  const wolne = [0, 1, 2, 3, 4, 5, 6].filter(function (d) { return wzor.indexOf(d) === -1; });
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
    if (podzial.typ === "ppl" && t.ts.przesun === 1) {
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

  pgOgraniczObjetosc(wynik, p);

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
    fb: "całe ciało", ul: "góra / dół", ulppl: "góra / dół + push / pull / legs", ppl: "push / pull / legs", bieg: p.bieg20 ? "bieg ciągły" : "marszobieg"
  }[podzial.typ];
  wynik.nazwa = PG_NAZWY_CELI[p.cel] + " – " + etykietaPodzialu + " " + wzor.length + "×";
  if (p.cel === "bieg" && wzor.length < p.dni) {
    wynik.uwagi.push("Na początek marszobieg 3 razy w tygodniu w zupełności wystarczy, z dniem przerwy między biegami. Pozostałe dni to odpoczynek albo trening siły.");
  }
  if (p.tygodni > 4) {
    wynik.nazwa += " (blok " + (p.blokNr || 1) + "/" + (p.tygodni / 4) + ")";
  } else if ((p.blokNr || 1) > 1) {
    wynik.nazwa += " (blok " + p.blokNr + ")";
  }
  return wynik;
}

// Objętość: nie więcej niż ok. 14 / 16 / 20 / 22 serii tygodniowo na partię (wg poziomu; nogi +4, bo to kilka dużych mięśni).
// Nadmiar zabieramy po jednej serii z ćwiczeń tej partii, które mają ich najwięcej (min. 2 serie zostają).
function pgOgraniczObjetosc(wynik, p) {
  if (p.cel === "zdrowie" || p.cel === "bieg") {
    return;
  }
  const ile = {};
  wynik.sesje.forEach(function (s) {
    if (s.dzien < 7 && s.trening) {
      ile[s.trening] = (ile[s.trening] || 0) + 1;
    }
  });
  const klucze = Object.keys(ile);
  function wpisyGrupy(g) {
    const lista = [];
    klucze.forEach(function (k) {
      wynik.treningi[k].wpisy.forEach(function (w, i) {
        if (!w.statyczne && pgGrupa(w.cw) === g) {
          lista.push({ w: w, i: i, razy: ile[k] });
        }
      });
    });
    return lista;
  }
  ["klatka", "plecy", "nogi", "barki", "ramiona"].forEach(function (g) {
    const max = [14, 16, 20, 22][p.dosw || 0] + (g === "nogi" ? 4 : 0);
    const lista = wpisyGrupy(g);
    let suma = lista.reduce(function (a, x) { return a + x.w.serie * x.razy; }, 0);
    while (suma > max) {
      let naj = null;
      lista.forEach(function (x) {
        if (x.w.serie > 2 && (!naj || x.w.serie > naj.w.serie || (x.w.serie === naj.w.serie && x.i > naj.i))) {
          naj = x;
        }
      });
      if (!naj) {
        break;
      }
      naj.w.serie--;
      suma -= naj.razy;
    }
  });
}

// Grupa mięśni ćwiczenia do liczenia serii: klatka, plecy, barki, ramiona, nogi (z pośladkami), brzuch, lydki
function pgGrupa(cw) {
  if (/Wspięcia|Tibialis/i.test(cw.nazwa)) {
    return "lydki";
  }
  // Martwe ciągi pracują głównie tyłem uda i pośladkami, więc liczymy je do nóg
  if (/Martwy ciąg|RDL|SLDL/.test(cw.nazwa)) {
    return "nogi";
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
    const nazwaPodzialu = { fb: "całe ciało 2–3 razy w tygodniu", ul: "podział góra / dół", ulppl: "podział góra / dół + push / pull / legs", ppl: "podział push / pull / legs" }[podzial.typ];
    powody.push("Dla " + poziomy[p.dosw] + " przy " + podzial.dni + " dniach dobrze działa " + nazwaPodzialu + ": każda duża partia jest trenowana regularnie, a między treningami ma czas na regenerację.");
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
      powody.push(["Na początek więcej powtórzeń (10–15) i lżejsze ciężary: łatwiej opanować technikę, a mięśnie rosną tak samo dobrze.", "Powtórzenia 8–12 w większości serii", "Powtórzenia 6–12 w większości serii", "Ciężkie serie po 5–8 powtórzeń w ćwiczeniach głównych i 8–12 w dodatkowych"][p.dosw || 0] + (p.dosw ? " i ok. 2 powtórzenia zapasu na koniec serii to sprawdzony zakres dla budowy mięśni." : ""));
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
  if (p.sprzet === "c" && p.bole && p.bole.indexOf("nadgarstek") !== -1) {
    wynik.uwagi.push("Nadgarstek: pompki i dipy rób na uchwytach do pompek albo na pięściach, tak żeby nadgarstek był prosty. Jeśli mimo to boli, pomiń ćwiczenie.");
  }
  const ukryte = Object.keys(pgUkrytePominiete);
  if (ukryte.length > 0) {
    wynik.uwagi.push("Pominąłem ukryte przez Ciebie ćwiczenia (" + ukryte.slice(0, 4).join(", ") + (ukryte.length > 4 ? " i inne" : "") + ") i wstawiłem zamienniki.");
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
    kreator: { profil: JSON.parse(JSON.stringify(p)), blok: p.blokNr || 1, powody: wynik.powody }
  };
  dane.plany.push(plan);
  zapiszDane();
  return plan;
}


// ===== Kolejny blok =====
// Profil z poprzedniego bloku + ciężary z ostatnio wykonanych serii (nie z pierwotnych szacunków)
function pgProfilKolejnegoBloku(plan) {
  const p = JSON.parse(JSON.stringify(plan.kreator.profil));
  p.blokNr = (plan.kreator.blok || 1) + 1;
  p.ostatnie = {};
  plan.sesje.slice().sort(function (a, b) { return a.dzien - b.dzien; }).forEach(function (s) {
    if (!s.zrobione || !s.parametry) { return; }
    Object.keys(s.zrobione).forEach(function (id) {
      const cw = znajdzCwiczenie(id);
      const il = (s.wykonane && s.wykonane[id]) || s.parametry[id];
      if (!cw || !il || !il.ciezary || il.ciezary.length === 0) { return; }
      const kg = Math.max.apply(null, il.ciezary);
      if (kg > 0) {
        p.ostatnie[cw.nazwa] = kg;
      }
    });
  });
  return p;
}
