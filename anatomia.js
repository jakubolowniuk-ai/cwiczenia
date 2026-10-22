// ===== Grafika anatomiczna: sylwetka z przodu i z tyłu, mięśnie podświetlone na czerwono =====
// Kształty rysujemy tylko dla lewej połowy ciała (x mniejsze niż 100), a prawą dostajemy
// przez odbicie lustrzane. Klucz kształtu to id mięśnia z dane.js (np. "mi-najszerszy").

const ANATOMIA_SYLWETKA =
  "M93 46 L93 58 C78 62 62 66 54 74 C44 80 40 96 40 112 L38 160 L34 214 L38 226 L50 226 L54 214 " +
  "L56 164 L62 124 C64 116 68 112 70 108 L73 150 C72 170 70 184 68 198 C66 230 66 262 70 292 " +
  "C66 310 68 340 70 362 L68 392 L66 404 L88 404 L90 392 L92 362 C94 340 96 320 96 300 " +
  "C98 270 100 240 100 214 L100 46 Z";

// Każdy mięsień: lista kształtów na widoku z przodu (p) i z tyłu (t)
const ANATOMIA_KSZTALTY = {
  "mi-mostkowo-obojczykowy": { p: ["M94 46 L99 56 L96 66 L92 58 Z"] },
  "mi-piersiowy": { p: ["M100 76 C88 73 74 74 64 80 C62 92 70 104 84 110 C92 112 98 112 100 112 Z"] },
  "mi-zebaty": { p: ["M66 106 L76 112 L76 136 L68 130 Z"] },
  "mi-naramienny-przedni": { p: ["M64 80 C60 80 56 81 53 84 L56 102 L63 100 C61 92 61 86 64 80 Z"] },
  "mi-naramienny-srodkowy": { p: ["M53 84 C47 86 44 92 44 99 C44 103 47 105 51 104 L56 102 Z"] },
  "mi-naramienny-tylny": { t: ["M64 80 C54 80 47 85 44 96 C46 104 54 106 62 101 C64 93 64 86 64 80 Z"] },
  "mi-podgrzebieniowy": { t: ["M64 84 L76 88 L78 100 C72 100 68 99 62 98 C64 94 64 90 64 84 Z"] },
  "mi-biceps": { p: ["M50 106 C48 120 48 134 51 146 L60 146 C62 134 62 118 60 106 Z"] },
  "mi-ramienny": { p: ["M44 118 C42 130 42 140 45 148 L50 148 C49 138 49 128 50 116 Z"] },
  "mi-triceps-boczny": { t: ["M48 106 C46 120 46 136 50 148 L54 148 L54 106 Z"] },
  "mi-triceps-dlugi": { t: ["M54 106 L60 106 C62 118 62 134 60 148 L54 148 Z"] },
  "mi-ramienno-promieniowy": { p: ["M40 152 C39 160 38 168 38 176 L54 176 C55 168 56 160 56 152 Z"] },
  "mi-zginacze-przedramienia": { p: ["M38 178 C37 190 36 202 36 212 L48 214 C50 202 52 190 54 178 Z"] },
  "mi-prostowniki-przedramienia": { t: ["M40 152 C38 172 36 194 36 212 L48 214 C52 196 54 174 56 152 Z"] },
  "mi-najszerszy": { t: ["M64 102 C70 106 80 114 90 126 L98 148 L96 186 C84 178 76 162 72 142 C70 126 66 114 64 102 Z"] },
  "mi-obly": { t: ["M62 98 C68 100 74 100 80 103 L78 114 C72 112 66 108 62 106 Z"] },
  "mi-czworoboczny-gorny": { t: ["M100 54 L90 60 C80 64 70 70 66 78 L76 90 L100 94 Z"] },
  "mi-czworoboczny-srodkowy": { t: ["M76 90 L100 94 L100 108 L88 104 L78 98 Z"] },
  "mi-czworoboczny-dolny": { t: ["M88 104 L100 108 L100 142 L90 128 Z"] },
  "mi-rownolegloboczny": { t: ["M78 94 L88 100 L88 126 L80 116 Z"] },
  "mi-prostowniki": { t: ["M92 128 L100 128 L100 196 L92 194 Z"] },
  "mi-wielodzielny": { t: ["M96 130 L100 130 L100 194 L96 194 Z"] },
  "mi-czworoboczny-ledzwi": { t: ["M80 160 L91 164 L91 192 L82 186 Z"] },
  "mi-prosty": { p: ["M92 116 L100 116 L100 182 L93 180 Z"] },
  "mi-skosny-zewnetrzny": { p: ["M78 116 L90 118 L91 156 L80 154 C78 144 78 130 78 116 Z"], t: ["M72 150 L80 152 L82 180 L74 176 Z"] },
  "mi-skosny-wewnetrzny": { p: ["M80 156 L91 158 L92 180 L82 176 Z"] },
  "mi-poprzeczny": { p: ["M72 132 L77 134 L80 170 L74 170 Z"] },
  "mi-biodrowo-ledzwiowy": { p: ["M78 184 L94 192 L90 212 L76 202 Z"] },
  "mi-posladkowy-wielki": { t: ["M72 198 C70 214 78 230 100 232 L100 202 C90 198 80 196 72 198 Z"] },
  "mi-posladkowy-sredni": { t: ["M73 184 C82 184 92 191 98 200 C90 198 82 199 76 204 C72 198 71 190 73 184 Z"] },
  "mi-posladkowy-maly": { t: ["M75 190 L84 193 L80 201 L75 199 Z"] },
  "mi-napinacz-powiezi": { p: ["M72 196 L80 198 L78 214 L72 210 Z"] },
  "mi-prosty-uda": { p: ["M80 212 L88 212 C88 240 88 266 87 290 L80 290 C79 266 79 240 80 212 Z"] },
  "mi-obszerny-boczny": { p: ["M74 210 L80 212 C79 240 79 266 80 290 L74 292 C68 268 68 238 74 210 Z"] },
  "mi-obszerny-przysrodkowy": { p: ["M88 212 L92 210 C91 236 91 262 90 292 L87 290 C88 266 88 240 88 212 Z"] },
  "mi-przywodziciele": { p: ["M93 214 L100 218 L99 270 C96 266 94 248 93 214 Z"] },
  "mi-dwuglowy-uda": { t: ["M74 238 L85 238 L85 298 L74 298 C70 282 68 262 74 238 Z"] },
  "mi-polsciegnisty": { t: ["M85 238 L96 238 C98 258 98 278 96 298 L85 298 Z"] },
  "mi-brzuchaty-boczny": { t: ["M72 306 L82 306 L82 354 L78 354 C72 346 68 326 72 306 Z"] },
  "mi-brzuchaty-przysrodkowy": { t: ["M82 306 L92 306 C96 326 94 346 90 354 L82 354 Z"] },
  "mi-plaszczkowaty": { t: ["M77 356 L90 356 C90 368 88 380 86 390 L80 390 C78 380 77 368 77 356 Z"] },
  "mi-strzalkowe": { p: ["M70 312 C68 330 70 350 72 372 L75 372 C74 350 73 330 74 312 Z"] },
  "mi-piszczelowy": { p: ["M74 310 C71 334 73 362 77 388 L84 388 C87 362 87 334 85 310 Z"] }
};

// Kolejność rysowania: pod spodem duże mięśnie, na wierzchu małe
const ANATOMIA_KOLEJNOSC = [
  "mi-najszerszy", "mi-obly", "mi-czworoboczny-gorny", "mi-czworoboczny-srodkowy", "mi-czworoboczny-dolny",
  "mi-rownolegloboczny", "mi-podgrzebieniowy", "mi-prostowniki", "mi-wielodzielny", "mi-czworoboczny-ledzwi",
  "mi-posladkowy-wielki", "mi-posladkowy-sredni", "mi-posladkowy-maly", "mi-napinacz-powiezi",
  "mi-piersiowy", "mi-zebaty", "mi-prosty", "mi-skosny-zewnetrzny", "mi-skosny-wewnetrzny", "mi-poprzeczny", "mi-biodrowo-ledzwiowy",
  "mi-mostkowo-obojczykowy",
  "mi-naramienny-przedni", "mi-naramienny-srodkowy", "mi-naramienny-tylny",
  "mi-biceps", "mi-ramienny", "mi-triceps-boczny", "mi-triceps-dlugi",
  "mi-ramienno-promieniowy", "mi-zginacze-przedramienia", "mi-prostowniki-przedramienia",
  "mi-prosty-uda", "mi-obszerny-boczny", "mi-obszerny-przysrodkowy", "mi-przywodziciele",
  "mi-dwuglowy-uda", "mi-polsciegnisty",
  "mi-brzuchaty-boczny", "mi-brzuchaty-przysrodkowy", "mi-plaszczkowaty", "mi-strzalkowe", "mi-piszczelowy"
];

const SVG_NS = "http://www.w3.org/2000/svg";

function elementSvg(nazwa, atrybuty) {
  const el = document.createElementNS(SVG_NS, nazwa);
  Object.keys(atrybuty || {}).forEach(function (k) {
    el.setAttribute(k, atrybuty[k]);
  });
  return el;
}

// Jedna połowa ciała, dwa razy: oryginał i odbicie lustrzane
function dodajPolowy(grupa, kszt, klasa, miesienId) {
  [null, "translate(200 0) scale(-1 1)"].forEach(function (transformacja) {
    const sciezka = elementSvg("path", { d: kszt, class: klasa });
    if (miesienId) {
      sciezka.setAttribute("data-mi", miesienId);
    }
    if (transformacja) {
      sciezka.setAttribute("transform", transformacja);
    }
    grupa.appendChild(sciezka);
  });
}

// Rysuje jeden widok ("p" = przód, "t" = tył); zaznaczone to lista id mięśni
function rysujWidok(widok, zaznaczone, opcje) {
  opcje = opcje || {};
  const g = elementSvg("g", { class: "an-widok" });
  dodajPolowy(g, ANATOMIA_SYLWETKA, "an-cialo", null);
  g.appendChild(elementSvg("ellipse", { cx: 100, cy: 26, rx: 16, ry: 20, class: "an-cialo" }));
  ANATOMIA_KOLEJNOSC.forEach(function (id) {
    const ksztalty = (ANATOMIA_KSZTALTY[id] || {})[widok] || [];
    const wlaczony = zaznaczone.indexOf(id) !== -1;
    let klasa = wlaczony ? "an-miesien an-on" : "an-miesien";
    // Odcień zależy od tego, ile razy mięsień był ćwiczony (1, 2, 3 i więcej)
    if (wlaczony && opcje.poziomy && opcje.poziomy[id]) {
      klasa += " an-p" + Math.min(3, opcje.poziomy[id]);
    }
    // Przerywany kontur: mięsień jest w planie, ale jeszcze nie ćwiczony
    if (!wlaczony && opcje.plan && opcje.plan.indexOf(id) !== -1) {
      klasa += " an-plan";
    }
    ksztalty.forEach(function (d) {
      dodajPolowy(g, d, klasa, id);
    });
  });
  return g;
}

// Tworzy gotowy rysunek: przód po lewej, tył po prawej
function zrobAnatomie(zaznaczone, opcje) {
  const svg = elementSvg("svg", { viewBox: "0 0 420 430", class: "anatomia", role: "img" });
  const przod = rysujWidok("p", zaznaczone, opcje);
  const tyl = rysujWidok("t", zaznaczone, opcje);
  tyl.setAttribute("transform", "translate(220 0)");
  svg.appendChild(przod);
  svg.appendChild(tyl);
  const t1 = elementSvg("text", { x: 100, y: 424, class: "an-podpis", "text-anchor": "middle" });
  t1.textContent = "Przód";
  const t2 = elementSvg("text", { x: 320, y: 424, class: "an-podpis", "text-anchor": "middle" });
  t2.textContent = "Tył";
  svg.appendChild(t1);
  svg.appendChild(t2);
  return svg;
}
