"use strict";
/* Contrato del actualizador de caché; no escribe index.html ni partidas. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {refresh} = require("../tools/refresh-cache.cjs");

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cronicas-cache-"));
try {
  fs.writeFileSync(path.join(dir, "vtm-save.js"), "contenido inicial");
  fs.writeFileSync(path.join(dir, "visual.css"), "body { color: red; }");
  const source = '<link href="visual.css?v=viejo&modo=oscuro" rel="stylesheet">\n' +
    '<script defer src="vtm-save.js?v=viejo"></script>\n' +
    '<script src="https://cdn.example.org/externo.js?v=viejo"></script>\n';
  const first = refresh(source, dir);
  assert.equal(first.updated, 2);
  assert.equal(first.resources, 2);
  assert.match(first.html, /visual\.css\?v=sha256-[0-9a-f]{12}&modo=oscuro/);
  assert.match(first.html, /vtm-save\.js\?v=sha256-[0-9a-f]{12}/);
  assert.match(first.html, /https:\/\/cdn\.example\.org\/externo\.js\?v=viejo/);
  const second = refresh(first.html, dir);
  assert.equal(second.updated, 0, "La operación debe ser idempotente");
  assert.equal(second.html, first.html);
  fs.writeFileSync(path.join(dir, "vtm-save.js"), "contenido actualizado");
  const third = refresh(first.html, dir);
  assert.equal(third.updated, 1, "Sólo cambia el identificador del recurso editado");
  assert.notEqual(third.html, first.html);
  assert.equal(third.html.match(/visual\.css\?[^"']+/)[0], first.html.match(/visual\.css\?[^"']+/)[0]);
  assert.throws(() => refresh('<script src="faltante.js?v=1"></script>', dir), /ENOENT/);
  assert.throws(() => refresh('<script src="../secreto.js?v=1"></script>', dir), /fuera del proyecto/);
  assert.throws(() => refresh("<div>sin recursos</div>", dir), /No se encontraron recursos/);
  // Un enlace simbólico puede eludir la protección de rutas con "..".
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), "cronicas-cache-externo-"));
  try {
    const secret = path.join(outside, "secreto.js");
    fs.writeFileSync(secret, "contenido privado");
    fs.symlinkSync(secret, path.join(dir, "externo.js"));
    assert.throws(
      () => refresh('<script src="externo.js?v=1"></script>', dir),
      /fuera del proyecto/,
      "No debe leerse un archivo externo mediante un enlace simbólico"
    );
    fs.symlinkSync(path.join(dir, "vtm-save.js"), path.join(dir, "interno.js"));
    assert.equal(refresh('<script src="interno.js?v=1"></script>', dir).updated, 1);
  } finally {
    fs.rmSync(outside, {recursive: true, force: true});
  }
  console.log("OK: versiones SHA-256 reproducibles, selectivas, seguras e idempotentes");
} finally {
  fs.rmSync(dir, {recursive: true, force: true});
}
