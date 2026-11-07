// Generuje zrzuty ekranu do przewodnika (przewodnik/*.webp) z działającej aplikacji.
// Uruchomienie: node narzedzia/zrzuty-przewodnika.js  (potrzebny Playwright i Chromium)
const { chromium } = require("/home/claude/.npm-global/lib/node_modules/playwright");
const sciezka = require("path").resolve(__dirname, "..");
const fs = require("fs");

(async () => {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox", "--allow-file-access-from-files"] });
  const nowa = async () => {
    const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true })).newPage();
    p.on("dialog", (d) => d.accept());
    p.on("pageerror", (e) => console.log("BŁĄD:", e.message));
    await p.goto("file://" + sciezka + "/index.html");
    await p.waitForTimeout(2000);
    // Bez karty przypomnienia o kopii na zrzutach
    await p.evaluate(() => { dane.ustawienia.ostatniaKopia = dataDzisTekst(); zapiszDane(); });
    return p;
  };
  const zrzut = (p, n) => p.screenshot({ path: sciezka + "/przewodnik/" + n + ".png" });
  fs.readdirSync(sciezka + "/przewodnik").forEach((f) => fs.unlinkSync(sciezka + "/przewodnik/" + f));

  // ===== Plan z kreatora =====
  const p = await nowa();
  await zrzut(p, "01-start");

  // Moje możliwości (wypełniony test)
  await p.evaluate(() => {
    dane.mozliwosci = { data: dzisISO(), wartosci: { pompki: 22, podciagniecia: 6, dipy: 10, przysiady: 40, plank: 75, zwis: 45, s_pch: 50, s_wio: 45, s_prz: 60 } };
    zapiszDane();
    otworzMozliwosci();
  });
  await p.waitForTimeout(400);
  await zrzut(p, "02b-mozliwosci");
  await p.evaluate(() => mzZamknij());

  await p.tap("#dzis-uloz-plan");
  await p.waitForTimeout(300);
  await zrzut(p, "02-kreator");

  await p.evaluate(() => {
    Object.assign(pkProfil, { cel: "masa", dosw: 1, dni: 3, czas: 60, sprzet: "s", kotwice: { pch: 50, wio: 45, prz: 60 } });
    pkKrok = pkKroki().length - 1;
    pkRysuj();
  });
  await p.waitForTimeout(300);
  await zrzut(p, "03-gotowy-plan");
  await p.locator(".pk-nakladka button:text-is('Zacznij')").tap();
  await p.waitForTimeout(500);

  // Dziś: sesja z rozgrzewką i ćwiczeniami
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(200);
  await zrzut(p, "04-dzis");

  // Tryb Ćwicz: rozgrzewkę pomijamy, pokazujemy serię i przerwę
  await p.locator("#dzis-sesje button:text-is('Ćwicz')").first().tap();
  await p.waitForTimeout(400);
  for (let i = 0; i < 12; i++) {
    const nazwa = await p.locator("#cwicz-tresc .cw-nazwa").first().textContent();
    if (/Przysiad ze sztangą/.test(nazwa)) break;
    await p.locator("#cwicz-tresc button:text-is('Pomiń ćwiczenie')").tap();
    await p.waitForTimeout(250);
  }
  await zrzut(p, "05-cwicz");
  await p.locator("#cwicz-tresc button:text-is('Zrobione ✓')").tap();
  await p.waitForTimeout(1500);
  await zrzut(p, "06-przerwa");

  // Koniec sesji z oceną
  await p.evaluate(() => {
    const ids = cwSesja.treningId ? znajdzTrening(cwSesja.treningId).cwiczeniaIds : [];
    cwSesja.zrobione = cwSesja.zrobione || {};
    cwIds().forEach((id) => { cwSesja.zrobione[id] = true; });
    cwSesja.ocena = { [ids[0]]: "latwo", [ids[1]]: "wsam", [ids[2]]: "wsam" };
    zapiszDane();
    cwFaza = "koniec";
    cwRysuj();
  });
  await p.waitForTimeout(300);
  await p.locator("#cwicz-tresc .cw-podsumowanie").nth(7).evaluate((e) => e.scrollIntoView());
  await p.waitForTimeout(200);
  await zrzut(p, "07-ocena");
  await p.locator("#cwicz-tresc button:text-is('Zamknij')").tap();
  await p.waitForTimeout(300);

  // Propozycje progresji: dzisiejszy trening A po poprzednim A z górą zakresu
  await p.evaluate(() => {
    const plan = aktywnyPlan();
    const d = new Date();
    d.setDate(d.getDate() - 4);
    plan.start = d.toISOString().slice(0, 10);
    const a = plan.sesje.find((s) => s.dzien === 0);
    a.zrobione = {};
    a.wykonane = {};
    Object.keys(a.parametry).forEach((id) => {
      a.zrobione[id] = true;
      const il = JSON.parse(JSON.stringify(a.parametry[id]));
      if (il.zakres) il.powtorzenia = il.zakres[1];
      a.wykonane[id] = il;
    });
    plan.sesje.filter((s) => s.dzien === 2).forEach((s) => { s.zrobione = {}; Object.keys(s.parametry || {}).forEach((id) => { s.zrobione[id] = true; }); });
    zapiszDane();
    pokazEkran("ekran-dzis");
    rysujDzis();
  });
  await p.waitForTimeout(400);
  await p.locator(".pr-karta").evaluate((e) => e.scrollIntoView());
  await p.evaluate(() => window.scrollBy(0, -70));
  await p.waitForTimeout(200);
  await zrzut(p, "08-propozycje");

  // Inna wartość niż w planie
  await p.locator(".pr-karta button:text-is('Przyjmij wszystkie')").tap();
  await p.waitForTimeout(300);
  const glowne = p.locator("#dzis-sesje .wartosc-przycisk");
  const n = await glowne.count();
  await glowne.nth(Math.min(8, n - 1)).tap();
  await p.waitForTimeout(200);
  await p.locator("#wart-pola .wart-stepper button").nth(3).tap();
  await p.locator("#wart-pola .wart-stepper button").nth(3).tap();
  await p.waitForTimeout(200);
  await zrzut(p, "09-inne-wartosci");
  await p.tap("#wart-anuluj");

  // Postęp
  await p.evaluate(() => pokazEkran("ekran-postep"));
  await p.waitForTimeout(400);
  await zrzut(p, "11-postep");

  // Baza ćwiczeń
  await p.evaluate(() => pokazEkran("ekran-cwiczenia"));
  await p.waitForTimeout(300);
  await p.tap("#przycisk-filtry");
  await p.waitForTimeout(300);
  await p.locator("#chipy-partie .chip", { hasText: "Plecy" }).tap();
  await p.waitForTimeout(200);
  await p.tap("#przycisk-pokaz-wyniki");
  await p.waitForTimeout(300);
  await p.locator("#lista-cwiczen .karta").first().tap();
  await p.waitForTimeout(400);
  await zrzut(p, "12-baza");
  await p.evaluate(() => document.querySelectorAll(".gps-zgoda-tlo").forEach((x) => x.remove()));
  await p.tap("#przelacznik-treningi");
  await p.waitForTimeout(300);
  await zrzut(p, "13-moje-zestawy");
  await p.tap("#przelacznik-sciezki");
  await p.waitForTimeout(300);
  await p.evaluate(() => { const g = document.querySelector(".sciezka-grupa-przycisk"); if (g) g.click(); });
  await p.waitForTimeout(300);
  await zrzut(p, "17-sciezki");

  // Koniec planu: kolejny blok
  await p.evaluate(() => {
    const plan = aktywnyPlan();
    const d = new Date();
    d.setDate(d.getDate() - 31);
    plan.start = d.toISOString().slice(0, 10);
    zapiszDane();
    pokazEkran("ekran-dzis");
    rysujDzis();
  });
  await p.waitForTimeout(400);
  await p.locator(".dzis-karta.koniec").evaluate((e) => e.scrollIntoView());
  await p.evaluate(() => window.scrollBy(0, -70));
  await p.waitForTimeout(200);
  await zrzut(p, "14-kolejny-blok");

  // Pytanie o ukryte ćwiczenia (pojawia się tylko, gdy coś jest ukryte)
  await p.evaluate(() => {
    ["Przysiad ze sztangą na plecach (Back Squat)", "Wyciskanie sztangi na ławce poziomej", "Pajacyki"].forEach((n) => {
      const c = dane.cwiczenia.find((x) => x.nazwa === n);
      if (c) c.ukryte = true;
    });
    zapiszDane();
    pkOtworz();
    pkProfil.cel = "masa";
    pkKrok = pkKroki().indexOf("ukryte");
    pkRysuj();
  });
  await p.waitForTimeout(300);
  await zrzut(p, "12b-ukryte");
  await p.evaluate(() => pkZamknij());

  // ===== Bieganie: ekran biegu =====
  const g = await nowa();
  await g.evaluate(() => {
    dane.ustawienia.biegGps = false;
    pkOtworz();
    Object.assign(pkProfil, { cel: "bieg", biegCel: "pierwsze5", bieg20: false, biegPoziom: null, biegDni: 3, silaDni: 0, tygodni: 8 });
    pkKrok = pkKroki().length - 1;
    pkRysuj();
  });
  await g.waitForTimeout(300);
  await g.locator(".pk-nakladka button:text-is('Zacznij')").tap();
  await g.waitForTimeout(500);
  await g.evaluate(() => {
    const plan = aktywnyPlan();
    const s = plan.sesje.slice().sort((a, b) => a.dzien - b.dzien)[0];
    plan.start = dzisISO();
    s.dzien = 0;
    zapiszDane();
    rysujDzis();
  });
  await g.waitForTimeout(300);
  const start = g.locator("#dzis-sesje button", { hasText: "Start" }).first();
  if (await start.count()) {
    await start.tap();
    await g.waitForTimeout(3500);
    await zrzut(g, "15-bieg");
  }

  // ===== Pływanie: plan i trening na Dziś =====
  const w = await nowa();
  await w.evaluate(() => {
    pkOtworz();
    Object.assign(pkProfil, { cel: "plywanie", plywCel: "bez1000", plywBasen: { dlugosc: 25, jednostka: "m" }, plywTest: 8, plywStyle: ["Kraul", "Grzbietowy"], plywDni: 2, plywCzas: 45, tygodni: 12 });
    pkKrok = pkKroki().length - 1;
    pkRysuj();
  });
  await w.waitForTimeout(300);
  await w.locator(".pk-nakladka button:text-is('Zacznij')").tap();
  await w.waitForTimeout(500);
  await w.evaluate(() => {
    const plan = aktywnyPlan();
    plan.start = dzisISO();
    zapiszDane();
    rysujDzis();
    const d = document.querySelector(".plyw-dzis-bloki");
    if (d) { d.open = true; d.closest(".karta, .dzis-sesja, div").scrollIntoView(); }
    window.scrollBy(0, -60);
  });
  await w.waitForTimeout(400);
  await zrzut(w, "16-basen");

  // ===== Plan ręczny: kalendarz =====
  const r = await nowa();
  await r.tap("#dzis-utworz-plan");
  const dodaj = async (rodzaj, partie, razy) => {
    await r.tap("#kr-dodaj");
    await r.selectOption("#kr-rodzaj", rodzaj);
    for (const x of partie) await r.locator("#kr-partia .chip", { hasText: x }).first().tap();
    await r.fill("#kr-razy", String(razy));
    await r.tap("#kr-zapisz-aktywnosc");
  };
  await dodaj("rodzaj-cialo", ["Klatka", "Plecy"], 2);
  await dodaj("rodzaj-kalistenika", ["Ogólnorozwojowy"], 1);
  await dodaj("rodzaj-spacer", [], 3);
  await r.tap("#kr-dalej");
  await r.tap("#kal-propozycja");
  await r.waitForTimeout(400);
  await zrzut(r, "10-recznie");

  await b.close();
  require("child_process").execSync(
    "python3 -c \"import glob,os;from PIL import Image\nfor f in glob.glob('" + sciezka + "/przewodnik/*.png'):\n Image.open(f).convert('RGB').save(f[:-4]+'.webp','WEBP',quality=78,method=6);os.remove(f)\""
  );
})();
