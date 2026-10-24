"use strict";
/* Contrato de recursos visuales: detectar SVG o estilos faltantes antes de publicar.
 * No ejecuta el juego ni modifica el estado de las partidas.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const graphics = fs.readFileSync(path.join(root, "vtm-graphics.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

function localAsset(relativePath) {
  assert.match(relativePath, /^assets\/[\w/-]+\.svg$/, `Ruta de SVG inesperada: ${relativePath}`);
  const absolute = path.join(root, relativePath);
  assert.ok(fs.existsSync(absolute), `Falta recurso gráfico: ${relativePath}`);
  const svg = fs.readFileSync(absolute, "utf8");
  assert.match(svg, /<svg\b[^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/,
    `No es un SVG válido como recurso local: ${relativePath}`);
  return svg;
}

const scenes = [...graphics.matchAll(/:\s*"(assets\/escenarios\/[\w-]+\.svg)"/g)]
  .map(match => match[1]);
const residences = [...graphics.matchAll(/:\s*"(assets\/residencias\/[\w-]+\.svg)"/g)]
  .map(match => match[1]);
assert.equal(scenes.length, 8, "Deben conservarse los ocho fondos de París");
assert.equal(residences.length, 7, "Deben conservarse los siete salones de Domitores");
assert.equal(new Set([...scenes, ...residences]).size, 15,
  "Cada escenario y residencia necesita su recurso propio");
for (const asset of [...scenes, ...residences]) localAsset(asset);

// El motor construye dinámicamente los nombres de los despachos y habitaciones.
assert.ok(graphics.includes('artRooms[clan+":study"]'),
  "El motor debe registrar los despachos privados");
assert.ok(graphics.includes('artRooms[clan+":quarters"]'),
  "El motor debe registrar las habitaciones privadas");
for (const residence of residences) {
  const clan = path.basename(residence, ".svg");
  localAsset(`assets/residencias/${clan}-despacho.svg`);
  localAsset(`assets/residencias/${clan}-habitaciones.svg`);
}

const atlasMatch = graphics.match(/atlas\.src\s*=\s*["']\.\/(assets\/personajes-paris-v\d+\.svg)\?[^"']+["']/);
assert.ok(atlasMatch, "No se encontró el atlas de personajes usado por el motor");
const atlas = localAsset(atlasMatch[1]);
const dimensions = atlas.match(/<svg\b[^>]*\bwidth="(\d+)"[^>]*\bheight="(\d+)"/);
assert.ok(dimensions, "El atlas necesita dimensiones SVG explícitas");
assert.equal(Number(dimensions[1]), 32 * 4 * 4,
  "El atlas debe contener cuatro direcciones de cuatro cuadros de 32 píxeles");
assert.equal(Number(dimensions[2]), 48 * 16,
  "El atlas debe contener 16 filas de personajes de 48 píxeles");

const styles = [...html.matchAll(/<link\s+rel="stylesheet"\s+href="([^"]+)"/g)]
  .map(match => match[1].split("?")[0]);
assert.ok(styles.includes("style.css") && styles.includes("visual-2.css"),
  "Deben cargarse ambos estilos del juego");
for (const style of styles) {
  assert.match(style, /^[\w-]+\.css$/, `Estilo no local: ${style}`);
  assert.ok(fs.existsSync(path.join(root, style)), `Falta la hoja de estilos: ${style}`);
}

console.log(`OK: ${scenes.length} barrios, ${residences.length * 3} fondos de residencias, atlas y estilos locales`);
