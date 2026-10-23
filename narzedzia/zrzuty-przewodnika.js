// Generuje zrzuty ekranu do przewodnika (przewodnik/*.png) z działającej aplikacji.
// Uruchomienie: node narzedzia/zrzuty-przewodnika.js  (potrzebny Playwright i Chromium)
const { chromium } = require("/home/claude/.npm-global/lib/node_modules/playwright");
const sciezka = require("path").resolve(__dirname, "..");
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox", "--allow-file-access-from-files"] });
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true })).newPage();
  p.on("dialog", (d) => d.accept());
  const zrzut = (n) => p.screenshot({ path: sciezka + "/przewodnik/" + n + ".png" });
  await p.goto("file://" + sciezka + "/index.html");
  await p.waitForTimeout(2000);
  await zrzut("1-start");

  await p.tap("#dzis-utworz-plan");
  const dodaj = async (rodzaj, partie, razy) => {
    await p.tap("#kr-dodaj");
    await p.selectOption("#kr-rodzaj", rodzaj);
    for (const x of partie) await p.locator("#kr-partia .chip", { hasText: x }).first().tap();
    await p.fill("#kr-razy", String(razy));
    await p.tap("#kr-zapisz-aktywnosc");
  };
  await dodaj("rodzaj-cialo", ["Klatka", "Plecy"], 2);
  await dodaj("rodzaj-kalistenika", ["Ogólnorozwojowy"], 1);
  await dodaj("rodzaj-spacer", [], 3);
  await p.waitForTimeout(300);
  await zrzut("2-aktywnosci");

  await p.tap("#kr-dalej");
  await p.tap("#kal-propozycja");
  await p.waitForTimeout(400);
  await zrzut("3-kalendarz");

  // Pierwsza sesja z ćwiczeniami: pokazujemy ekran z dodanymi ćwiczeniami
  const dzien = await p.evaluate(() => szkic.sesje.find((s) => wymagaTreningu(znajdzAktywnosc(s.aktywnoscId))).dzien);
  await p.locator(".kafelek").nth(dzien).tap();
  const idx = await p.evaluate(() => pdSesje && 0);
  const lista = await p.evaluate(() => szkic.sesje.filter((s) => s.dzien === pdDzien).findIndex((s) => wymagaTreningu(znajdzAktywnosc(s.aktywnoscId))));
  await p.locator("#pd-sesje .akcja").nth(lista).tap();
  await p.locator("#pd-sesja-trening .akcja").first().tap();
  await p.waitForTimeout(200);
  await p.locator("#kr2-cwiczenia .akcja").nth(0).tap();
  await p.locator("#kr2-cwiczenia .akcja").nth(1).tap();
  await zrzut("4-cwiczenia-w-sesji");
  await p.tap("#kr2-zapisz");
  await p.waitForTimeout(300);
  const wejscia = p.locator("#pd-sesja-parametry input:visible");
  for (let i = 0; i < (await wejscia.count()); i++) await wejscia.nth(i).fill("8");
  await p.tap("#pd-sesja-zapisz");
  await p.tap("#pd-zamknij");

  // Reszta sesji: wypełniamy automatycznie
  for (let g = 0; g < 12; g++) {
    const n = await p.evaluate(() => szkic.sesje.filter((s) => !sesjaGotowa(s)).length);
    if (!n) break;
    const dz = await p.evaluate(() => szkic.sesje.find((s) => !sesjaGotowa(s)).dzien);
    await p.locator(".kafelek").nth(dz).tap();
    const ix = await p.evaluate(() => szkic.sesje.filter((s) => s.dzien === pdDzien).findIndex((s) => !sesjaGotowa(s)));
    await p.locator("#pd-sesje .akcja").nth(ix).tap();
    const typ = await p.evaluate(() => (wymagaTreningu(znajdzAktywnosc(pdSesja.aktywnoscId)) ? "cw" : "x"));
    if (typ === "cw") {
      await p.locator("#pd-sesja-trening .akcja").first().tap();
      await p.locator("#kr2-wszystkie").check();
      await p.locator("#kr2-cwiczenia .akcja").nth(0).tap();
      await p.locator("#kr2-cwiczenia .akcja").nth(1).tap();
      await p.tap("#kr2-zapisz");
      const w = p.locator("#pd-sesja-parametry input:visible");
      for (let i = 0; i < (await w.count()); i++) await w.nth(i).fill("8");
    } else {
      await p.fill("#pd-sesja-parametry input >> nth=0", "6000");
    }
    await p.tap("#pd-sesja-zapisz");
    await p.tap("#pd-zamknij");
  }
  await p.tap("#kal-zapisz");
  await p.waitForTimeout(400);

  // Dziś: pierwsza sesja przesunięta na dzisiaj, jedno ćwiczenie zaliczone
  await p.evaluate(() => {
    const plan = aktywnyPlan();
    const kolejne = plan.sesje.slice().sort((a, b) => a.dzien - b.dzien);
    const cw = kolejne.find((s) => s.treningId);
    cw.dzien = 0;
    zapiszDane();
    rysujDzis();
  });
  await p.evaluate(() => pokazEkran("ekran-dzis"));
  await p.waitForTimeout(300);
  await p.locator("#dzis-sesje .odhacz").first().tap();
  await p.waitForTimeout(300);
  await zrzut("5-dzis");

  await p.evaluate(() => pokazEkran("ekran-postep"));
  await p.waitForTimeout(300);
  await zrzut("6-postep");

  await p.evaluate(() => pokazEkran("ekran-cwiczenia"));
  await p.waitForTimeout(300);
  const filtry = await p.$("#blok-filtrow");
  if (await filtry.isHidden()) await p.evaluate(() => (document.getElementById("blok-filtrow").hidden = false));
  await p.locator("#chipy-partie .chip", { hasText: "Plecy" }).tap();
  await p.locator("#chipy-miesnie .chip").nth(3).tap();
  await p.waitForTimeout(300);
  await zrzut("7-baza");
  await b.close();
  // PNG -> WEBP (mniejsze pliki)
  require("child_process").execSync(
    "python3 -c \"import glob,os;from PIL import Image\nfor f in glob.glob('" + sciezka + "/przewodnik/*.png'):\n Image.open(f).convert('RGB').save(f[:-4]+'.webp','WEBP',quality=78,method=6);os.remove(f)\""
  );
})();
