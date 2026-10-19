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
  "mi-piersiowy": { p: ["M100 76 C88 73 74 74 64 80 C62 92 70 104 84 110 C92 112 98 112 100 112 Z"] },
  "mi-zebaty": { p: ["M66 106 L76 112 L76 136 L68 130 Z"] },
  "mi-naramienny-przedni": { p: ["M64 80 C60 80 56 81 53 84 L56 102 L63 100 C61 92 61 86 64 80 Z"] },
  "mi-naramienny-srodkowy": { p: ["M53 84 C47 86 44 92 44 99 C44 103 47 105 51 104 L56 102 Z"] },
  "mi-naramienny-tylny": { t: ["M64 80 C54 80 47 85 44 96 C46 104 54 106 62 101 C64 93 64 86 64 80 Z"] },
  "mi-biceps": { p: ["M50 106 C48 120 48 134 51 146 L60 146 C62 134 62 118 60 106 Z"] },
  "mi-triceps": { t: ["M48 106 C46 120 46 136 50 148 L60 148 C62 134 62 118 60 106 Z"] },
  "mi-ramienny": { p: ["M44 118 C42 130 42 140 45 148 L50 148 C49 138 49 128 50 116 Z"] },
  "mi-przedramiona": {
    p: ["M40 152 C38 172 36 194 36 212 L48 214 C52 196 54 174 56 152 Z"],
    t: ["M40 152 C38 172 36 194 36 212 L48 214 C52 196 54 174 56 152 Z"]
  },
  "mi-najszerszy": { t: ["M64 102 C70 106 80 114 90 126 L98 148 L96 186 C84 178 76 162 72 142 C70 126 66 114 64 102 Z"] },
  "mi-obly": { t: ["M62 98 C68 100 74 100 80 103 L78 114 C72 112 66 108 62 106 Z"] },
  "mi-czworoboczny": {
    t: ["M100 54 L90 60 C80 64 70 70 66 78 L76 92 L88 98 L100 104 Z", "M88 102 L100 108 L100 142 L90 128 Z"]
  },
  "mi-rownolegloboczny": { t: ["M78 94 L88 100 L88 126 L80 116 Z"] },
  "mi-prostowniki": { t: ["M92 128 L100 128 L100 196 L92 194 Z"] },
  "mi-czworoboczny-ledzwi": { t: ["M80 160 L91 164 L91 192 L82 186 Z"] },
  "mi-prosty": { p: ["M92 116 L100 116 L100 182 L93 180 Z"] },
  "mi-skosne": { p: ["M78 116 L90 118 L92 180 L82 176 C79 158 78 138 78 116 Z"] },
  "mi-poprzeczny": { p: ["M72 132 L77 134 L80 170 L74 170 Z"] },
  "mi-biodrowo-ledzwiowy": { p: ["M78 184 L94 192 L90 212 L76 202 Z"] },
  "mi-posladkowy-wielki": { t: ["M72 198 C70 214 78 230 100 232 L100 202 C90 198 80 196 72 198 Z"] },
  "mi-posladkowy-sredni": { t: ["M73 184 C82 184 92 191 98 200 C90 198 82 199 76 204 C72 198 71 190 73 184 Z"] },
  "mi-posladkowy-maly": { t: ["M75 190 L84 193 L80 201 L75 199 Z"] },
  "mi-czworoglowy": { p: ["M74 210 C68 238 68 268 74 292 L90 292 C91 262 91 236 92 210 Z"] },
  "mi-przywodziciele": { p: ["M93 214 L100 218 L99 270 C96 266 94 248 93 214 Z"] },
  "mi-kulszowo-goleniowe": { t: ["M74 238 C68 262 70 282 74 298 L96 298 C98 278 98 258 96 238 Z"] },
  "mi-brzuchaty-lydki": { t: ["M72 306 C68 326 72 346 78 354 L90 354 C94 346 96 326 92 306 Z"] },
  "mi-plaszczkowaty": { t: ["M77 356 L90 356 C90 368 88 380 86 390 L80 390 C78 380 77 368 77 356 Z"] },
  "mi-piszczelowy": { p: ["M74 310 C71 334 73 362 77 388 L84 388 C87 362 87 334 85 310 Z"] }
};

// Kolejność rysowania: pod spodem duże mięśnie, na wierzchu małe
const ANATOMIA_KOLEJNOSC = [
  "mi-najszerszy", "mi-obly", "mi-czworoboczny", "mi-rownolegloboczny", "mi-prostowniki", "mi-czworoboczny-ledzwi",
  "mi-posladkowy-wielki", "mi-posladkowy-sredni", "mi-posladkowy-maly",
  "mi-piersiowy", "mi-zebaty", "mi-prosty", "mi-skosne", "mi-poprzeczny", "mi-biodrowo-ledzwiowy",
  "mi-naramienny-przedni", "mi-naramienny-srodkowy", "mi-naramienny-tylny",
  "mi-biceps", "mi-triceps", "mi-ramienny", "mi-przedramiona",
  "mi-czworoglowy", "mi-przywodziciele", "mi-kulszowo-goleniowe",
  "mi-brzuchaty-lydki", "mi-plaszczkowaty", "mi-piszczelowy"
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
function rysujWidok(widok, zaznaczone) {
  const g = elementSvg("g", { class: "an-widok" });
  dodajPolowy(g, ANATOMIA_SYLWETKA, "an-cialo", null);
  g.appendChild(elementSvg("ellipse", { cx: 100, cy: 26, rx: 16, ry: 20, class: "an-cialo" }));
  ANATOMIA_KOLEJNOSC.forEach(function (id) {
    const ksztalty = (ANATOMIA_KSZTALTY[id] || {})[widok] || [];
    const wlaczony = zaznaczone.indexOf(id) !== -1;
    ksztalty.forEach(function (d) {
      dodajPolowy(g, d, wlaczony ? "an-miesien an-on" : "an-miesien", id);
    });
  });
  return g;
}

// Tworzy gotowy rysunek: przód po lewej, tył po prawej
function zrobAnatomie(zaznaczone) {
  const svg = elementSvg("svg", { viewBox: "0 0 420 430", class: "anatomia", role: "img" });
  const przod = rysujWidok("p", zaznaczone);
  const tyl = rysujWidok("t", zaznaczone);
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
