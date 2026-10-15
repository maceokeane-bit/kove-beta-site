// Generates the two QR codes for each poster design.
//
//   node scripts/make-poster-qr.mjs [outDir] [design ...]
//   node scripts/make-poster-qr.mjs ~/Desktop/posterQR 2 3 4
//
// "Learn more" links to /?p=N and "Get the app" to /get?p=N. index.html turns
// p into UTM tags and /get sends phones to their store tagged with the design.
// Each SVG has the Kove logo in the middle, which is why error correction is H.
// matrix.json holds the module grids so PNGs can be rendered from the same data.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import QRCode from "qrcode";

const SITE = "https://kove-beta-site.web.app";
const DARK = "#0f1f2e";
const LIGHT = "#ffffff";
const MARGIN = 4; // quiet zone, in modules
const LOGO_SHARE = 0.24; // logo box width as a share of the code (not the quiet zone)

const [outArg, ...designArgs] = process.argv.slice(2);
const outDir = resolve((outArg ?? "~/Desktop/posterQR").replace(/^~/, homedir()));
const designs = designArgs.length ? designArgs : ["2", "3", "4"];

const logo = readFileSync(new URL("../public/images/logo.png", import.meta.url)).toString("base64");

function svgFor(modules) {
  const size = modules.size;
  const full = size + MARGIN * 2;
  let path = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (modules.get(x, y)) path += `M${x + MARGIN} ${y + MARGIN}h1v1h-1z`;
    }
  }
  const box = size * LOGO_SHARE;
  const boxXY = (full - box) / 2;
  const pad = box * 0.12;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${full} ${full}" shape-rendering="crispEdges">
<rect width="${full}" height="${full}" fill="${LIGHT}"/>
<path fill="${DARK}" d="${path}"/>
<rect x="${boxXY}" y="${boxXY}" width="${box}" height="${box}" rx="${box * 0.22}" fill="${LIGHT}" shape-rendering="geometricPrecision"/>
<image x="${boxXY + pad}" y="${boxXY + pad}" width="${box - pad * 2}" height="${box - pad * 2}" href="data:image/png;base64,${logo}"/>
</svg>
`;
}

mkdirSync(outDir, { recursive: true });
const matrix = {};

for (const design of designs) {
  const codes = {
    "learn-more": `${SITE}/?p=${design}`,
    "get-the-app": `${SITE}/get?p=${design}`,
  };
  for (const [kind, url] of Object.entries(codes)) {
    const qr = QRCode.create(url, { errorCorrectionLevel: "H" });
    const name = `poster${design}-${kind}`;
    writeFileSync(join(outDir, `${name}.svg`), svgFor(qr.modules));
    matrix[name] = {
      url,
      size: qr.modules.size,
      rows: Array.from({ length: qr.modules.size }, (_, y) =>
        Array.from({ length: qr.modules.size }, (_, x) => (qr.modules.get(x, y) ? 1 : 0)).join(""),
      ),
    };
    console.log(`${name}.svg  ${url}  (version ${qr.version}, ${qr.modules.size}x${qr.modules.size})`);
  }
}

writeFileSync(join(outDir, "matrix.json"), JSON.stringify({ margin: MARGIN, logoShare: LOGO_SHARE, codes: matrix }, null, 2));
