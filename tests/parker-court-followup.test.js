"use strict";
/* Regresión EP/47: consecuencias políticas y de la corte tras recuperar un respaldo.
 * Ejecuta los módulos reales en un entorno aislado; no modifica partidas del usuario.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const sandbox = {window: {}};
for (const file of ["vtm-court.js", "vtm-parker-politics.js", "vtm-save.js"]) {
  vm.runInNewContext(fs.readFileSync(path.join(root, file), "utf8"), sandbox, {filename: file});
}
const C = sandbox.window.VTM_COURT;
const P = sandbox.window.VTM_PARKER_POLITICS;
const S = sandbox.window.VTM_SAVE;
const key = "cronicas-paris-ghoul-v1";
const clans = {Toreador: {}};
const fresh = name => ({
  version: 1, character: {name, clan: "Toreador"}, clock: {night: 7, minutes: 1215},
  elizabeth: {status: "reported", evidence: ["apartment", "police"]},
  localCases: {archivo: {complete: true}}, conspiracy: {chapter: 2, revealed: false},
  factions: {camarilla: 10, brujah: 10, nosferatu: 10}, exposure: 35,
  history: ["Una noche anterior"]
});
const ids = game => Array.from(P.next(game), entry => entry.id);

const game = fresh("Testigo de la corte");
const court = C.init(game);
court.prestige = 4;
court.history.unshift({night: 2, summary: "Audiencia anterior"});
assert.equal(P.protect(game, "sheriff"), true);
assert.equal(game.factions.camarilla, 13);
assert.equal(game.factions.brujah, 9);
assert.equal(game.exposure, 27);
assert.equal(P.protect(game, "shelter"), false, "La custodia no se puede sustituir");
assert.equal(P.verdict(game, 1), null, "Una sola contradicción no basta");
const outcome = P.verdict(game, 4);
assert.equal(outcome.unlock, "prefectura");
assert.equal(P.summary(game).verdict, "strong");
assert.deepEqual(ids(game), ["prefectura", "testigos", "corte"]);
assert.equal(C.init(game).prestige, 7, "El expediente sólido suma prestigio una vez");
assert.equal(game.court.history.length, 2);
assert.match(game.court.history[0].summary, /EP\/47/);
assert.equal(game.court.cases.length, 0, "La audiencia no dicta una condena automática");
assert.equal(game.elizabeth.status, "reported");
assert.equal(game.localCases.archivo.complete, true);
assert.equal(game.conspiracy.chapter, 2);
assert.equal(game.conspiracy.revealed, false);
const settled = JSON.stringify(game);
assert.equal(P.verdict(game, 4), null, "No se repite la audiencia");
assert.equal(JSON.stringify(game), settled, "La repetición no modifica política ni corte");

const data = new Map();
const storage = {
  getItem: k => data.has(k) ? data.get(k) : null,
  setItem: (k, value) => data.set(k, String(value)),
  removeItem: k => data.delete(k)
};
assert.equal(S.save(storage, key, game, clans), true);
assert.equal(S.load(storage, key, clans).fromBackup, false);
data.set(key, "{partida dañada");
const restored = S.load(storage, key, clans);
assert.equal(restored.fromBackup, true);
assert.equal(restored.game.character.name, "Testigo de la corte");
assert.deepEqual(ids(restored.game), ["prefectura", "testigos", "corte"]);
assert.equal(restored.game.court.prestige, 7);
assert.equal(restored.game.court.history.length, 2);
assert.equal(restored.game.elizabeth.status, "reported");
assert.equal(restored.game.localCases.archivo.complete, true);
assert.equal(restored.game.conspiracy.revealed, false);
assert.equal(P.verdict(restored.game, 4), null);
assert.equal(JSON.stringify(restored.game), settled,
  "Recuperar y consultar EP/47 no duplica efectos ni borra progreso");
console.log("OK: EP/47 sólido conserva custodia, prestigio y seguimientos tras respaldo");

const inquiry = fresh("Investigador independiente");
C.init(inquiry).prestige = 1;
assert.equal(P.verdict(inquiry, 2).unlock, "prefectura");
assert.equal(P.summary(inquiry).verdict, "inquiry");
assert.deepEqual(ids(inquiry), ["prefectura"], "La audiencia básica no inventa otras rutas");
assert.equal(inquiry.court.prestige, 2);
assert.equal(inquiry.court.cases.length, 0);
assert.equal(P.verdict(inquiry, 4), null);
assert.equal(inquiry.court.prestige, 2);
assert.equal(P.summary(restored.game).verdict, "strong",
  "Los expedientes de personajes diferentes no se mezclan");
console.log("OK: audiencia básica y fuerte permanecen aisladas y no repetibles");
