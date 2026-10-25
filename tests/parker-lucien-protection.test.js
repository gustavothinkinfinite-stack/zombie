"use strict";
/* EP/47: la custodia negociada con Lucien y la audiencia básica sobreviven
 * al respaldo sin duplicar efectos ni revelar el secreto de la campaña.
 * Usa almacenamiento simulado; nunca accede a partidas reales.
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
const P = sandbox.window.VTM_PARKER_POLITICS;
const S = sandbox.window.VTM_SAVE;
const key = "cronicas-paris-ghoul-v1";
const clans = {Toreador: {}};
const game = {
  version: 1, character: {name: "Testigo de Lucien", clan: "Toreador"},
  clock: {night: 9, minutes: 1215},
  elizabeth: {status: "reported", evidence: ["apartment", "police"]},
  localCases: {archivo: {complete: true}},
  conspiracy: {chapter: 2, revealed: false},
  factions: {camarilla: 10, brujah: 10, nosferatu: 10},
  exposure: 35, history: ["Noche anterior"]
};
const originalCases = JSON.stringify({
  elizabeth: game.elizabeth, localCases: game.localCases,
  conspiracy: game.conspiracy, history: game.history
});
assert.equal(P.protect(game, "lucien"), true);
assert.equal(game.factions.brujah, 13);
assert.equal(game.factions.camarilla, 9);
assert.equal(game.exposure, 29);
assert.equal(P.protect(game, "sheriff"), false, "No sustituir la custodia negociada");
assert.equal(P.verdict(game, 1), null, "Una contradicción no habilita audiencia");
assert.equal(P.verdict(game, 2).unlock, "prefectura");
assert.equal(P.summary(game).verdict, "inquiry");
assert.deepEqual(Array.from(P.next(game), item => item.id), ["prefectura", "testigos"],
  "La audiencia básica no debe desbloquear la vía de la corte");
assert.equal(game.court.prestige, 1);
assert.equal(game.court.cases.length, 0, "No se condena automáticamente a nadie");
assert.equal(JSON.stringify({
  elizabeth: game.elizabeth, localCases: game.localCases,
  conspiracy: game.conspiracy, history: game.history
}), originalCases, "No se altera la investigación previa ni el secreto de la Senescal");

const data = new Map();
const storage = {
  getItem: k => data.has(k) ? data.get(k) : null,
  setItem: (k, value) => data.set(k, String(value)),
  removeItem: k => data.delete(k)
};
assert.equal(S.save(storage, key, game, clans), true);
assert.ok(data.has(key + "-backup"), "La partida debe tener respaldo");
const snapshot = JSON.stringify(game);
data.set(key, "{principal dañado");
const restored = S.load(storage, key, clans);
assert.equal(restored.fromBackup, true);
assert.equal(restored.game.character.name, "Testigo de Lucien");
assert.equal(restored.game.parkerPolitics.protection, "lucien");
assert.equal(restored.game.parkerPolitics.verdict, "inquiry");
assert.deepEqual(Array.from(P.next(restored.game), item => item.id),
  ["prefectura", "testigos"]);
assert.equal(restored.game.court.prestige, 1);
assert.equal(restored.game.conspiracy.revealed, false);
assert.equal(restored.game.localCases.archivo.complete, true);
assert.equal(P.protect(restored.game, "sheriff"), false);
assert.equal(P.verdict(restored.game, 4), null, "No repetir ni mejorar audiencia ya resuelta");
assert.equal(JSON.stringify(restored.game), snapshot,
  "Consultar el expediente recuperado no duplica ni modifica sus efectos");
console.log("OK: EP/47 con Lucien conserva protección, audiencia y progreso tras respaldo");
