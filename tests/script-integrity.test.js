"use strict";
/* Contrato de integración: detectar módulos ausentes, duplicados o cargados fuera de orden.
 * No modifica partidas ni ejecuta el motor del juego.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const scripts = [...html.matchAll(/<script\s+src="([^"]+)"\s*><\/script>/g)]
  .map(match => match[1]);
assert.ok(scripts.length > 0, "La página debe cargar los módulos del juego");

const modules = scripts.map(src => {
  assert.match(src, /^[\w-]+\.js(?:\?[^"#]*)?$/, `Script no local o ruta inesperada: ${src}`);
  const file = src.split("?")[0];
  assert.ok(fs.existsSync(path.join(root, file)), `Falta el archivo ${file}`);
  return file;
});
assert.equal(new Set(modules).size, modules.length, "No cargar dos veces un mismo módulo");
assert.equal(modules.at(-1), "vtm-game.js", "El motor debe cargarse al final");

const required = [
  "vtm-data.js", "vtm-content.js", "vtm-npcs.js", "vtm-arcs.js",
  "vtm-graphics.js", "vtm-physics.js", "vtm-mechanics.js",
  "vtm-shops.js", "vtm-contacts.js", "vtm-local-cases.js",
  "vtm-districts.js", "vtm-story.js", "vtm-story-ui.js",
  "vtm-equipment.js", "vtm-tactics.js", "vtm-tactics-ui.js",
  "vtm-economy.js", "vtm-economy-ui.js", "vtm-world-powers.js",
  "vtm-world-powers-ui.js", "vtm-case-interiors.js", "vtm-elizabeth.js",
  "vtm-save.js", "vtm-politics.js", "vtm-politics-ui.js",
  "vtm-city-consequences.js"
];
for (const file of required) {
  assert.ok(modules.includes(file), `Módulo indispensable no incluido: ${file}`);
  assert.ok(modules.indexOf(file) < modules.indexOf("vtm-game.js"),
    `El motor debe encontrar ${file} antes de inicializarse`);
}
const before = (a, b) => assert.ok(modules.indexOf(a) < modules.indexOf(b),
  `Orden de carga incorrecto: ${a} debe preceder a ${b}`);
before("vtm-data.js", "vtm-content.js");
before("vtm-physics.js", "vtm-case-interiors.js");
before("vtm-case-interiors.js", "vtm-elizabeth.js");
before("vtm-tactics.js", "vtm-tactics-ui.js");
before("vtm-economy.js", "vtm-economy-ui.js");
before("vtm-politics.js", "vtm-politics-ui.js");
before("vtm-save.js", "vtm-game.js");
before("vtm-court.js", "vtm-city-consequences.js");
before("vtm-city-consequences.js", "vtm-game.js");

const styles = [...html.matchAll(/<link\s+rel="stylesheet"\s+href="([^"]+)"/g)]
  .map(match => match[1].split("?")[0]);
assert.ok(styles.indexOf("style.css") >= 0, "Falta el estilo base");
assert.ok(styles.indexOf("visual-2.css") > styles.indexOf("style.css"),
  "El rediseño visual debe cargarse después del estilo base");

console.log(`OK: ${modules.length} módulos locales, sistemas esenciales y orden de carga protegidos`);
