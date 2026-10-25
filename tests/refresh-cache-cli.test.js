"use strict";
/* Contrato de la interfaz de línea de comandos del actualizador de caché.
 * Trabaja sólo sobre una copia temporal: jamás escribe index.html del juego.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {spawnSync} = require("node:child_process");

const root = path.resolve(__dirname, "..");
const sourceTool = path.join(root, "tools", "refresh-cache.cjs");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "cronicas-cache-cli-"));
try {
  const toolsDir = path.join(temp, "tools");
  fs.mkdirSync(toolsDir);
  const tool = path.join(toolsDir, "refresh-cache.cjs");
  fs.copyFileSync(sourceTool, tool);
  const index = path.join(temp, "index.html");
  const initial = '<link rel="stylesheet" href="style.css?v=manual&tema=oscuro">\n' +
    '<script src="game.js?v=manual"></script>\n';
  fs.writeFileSync(index, initial);
  fs.writeFileSync(path.join(temp, "style.css"), "body { color: #fff; }");
  fs.writeFileSync(path.join(temp, "game.js"), "window.TEST = true;");
  const run = (...args) => spawnSync(process.execPath, [tool, ...args], {
    cwd: temp, encoding: "utf8", timeout: 10000
  });
  const assertExit = (result, status) => {
    assert.equal(result.error, undefined, String(result.error));
    assert.equal(result.status, status, result.stdout + "\n" + result.stderr);
  };

  assertExit(run(), 0);
  assert.equal(fs.readFileSync(index, "utf8"), initial,
    "Sin argumentos debe informar sin modificar la página");
  assertExit(run("--dry-run"), 0);
  assert.equal(fs.readFileSync(index, "utf8"), initial);
  assertExit(run("--check"), 1);
  assert.equal(fs.readFileSync(index, "utf8"), initial,
    "--check debe fallar si hay versiones pendientes, sin escribir");
  assertExit(run("--write"), 0);
  const updated = fs.readFileSync(index, "utf8");
  assert.match(updated, /style\.css\?v=sha256-[a-f0-9]{12}&tema=oscuro/);
  assert.match(updated, /game\.js\?v=sha256-[a-f0-9]{12}/);
  assertExit(run("--check"), 0);
  assertExit(run("--write"), 0);
  assert.equal(fs.readFileSync(index, "utf8"), updated,
    "Escribir dos veces no debe alterar las versiones vigentes");
  assertExit(run("--write", "--check"), 2);
  assert.equal(fs.readFileSync(index, "utf8"), updated);

  const outside = fs.mkdtempSync(path.join(os.tmpdir(), "cronicas-cache-cli-out-"));
  try {
    const secret = path.join(outside, "externo.js");
    fs.writeFileSync(secret, "No debe leerse");
    fs.unlinkSync(path.join(temp, "game.js"));
    fs.symlinkSync(secret, path.join(temp, "game.js"));
    assertExit(run("--write"), 1);
    assert.equal(fs.readFileSync(index, "utf8"), updated,
      "Ante un recurso externo, --write debe conservar el HTML anterior");
  } finally {
    fs.rmSync(outside, {recursive: true, force: true});
  }
  console.log("OK: CLI de caché — consulta, comprobación, escritura, idempotencia y fallo seguro");
} finally {
  fs.rmSync(temp, {recursive: true, force: true});
}
