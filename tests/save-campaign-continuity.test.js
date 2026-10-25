"use strict";
/* Continuidad de todos los expedientes al recuperar un guardado anterior. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const window={};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,"..","vtm-save.js"),"utf8"),{window});
const S=window.VTM_SAVE;
const key="cronicas-paris-ghoul-v1",backup=S.backupKey(key),clans={Toreador:{}};
const data=new Map();
const storage={getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v))};
const original={
 version:1,character:{name:"Investigadora",clan:"Toreador"},
 clock:{night:12,minutes:1215},
 elizabeth:{status:"reported",evidence:["garage","police"]},
 localCases:{archivo:{complete:true},muelle:{clues:["carta"]}},
 principado:{clues:{policia:true},submitted:true},
 conspiracy:{chapter:2,witnesses:{ingrid:"protected"}},
 parkerDossier:{collected:["EP-03"],linked:["porter"]},
 parkerPolitics:{protection:"shelter",verdict:"inquiry"},
 vitae:{lastNight:12,tension:2},
 history:["La primera pista"],factions:{nosferatu:7}
};
const originalJSON=JSON.stringify(original);
assert.equal(S.save(storage,key,original,clans),true);
assert.equal(data.get(backup),originalJSON);
const advanced=JSON.parse(originalJSON);
advanced.clock.night=13;
advanced.conspiracy.chapter=3;
advanced.parkerDossier.collected.push("EP-04");
assert.equal(S.save(storage,key,advanced,clans),true);
assert.equal(data.get(key),JSON.stringify(advanced));
assert.equal(data.get(backup),originalJSON,"el respaldo conserva la versión anterior completa");
data.set(key,"{partida dañada");
const recovered=S.load(storage,key,clans);
assert.ok(recovered&&recovered.fromBackup,"debe recuperar el respaldo válido");
assert.equal(JSON.stringify(recovered.game),originalJSON,
 "la recuperación no debe mezclar el estado reciente ni omitir expedientes");
assert.equal(S.hasSavedData(storage,key),true);
assert.equal(S.save(storage,key,recovered.game,clans),true);
assert.equal(S.load(storage,key,clans).fromBackup,false);
assert.equal(data.get(backup),originalJSON,"consolidar no debe degradar el respaldo");
assert.equal(JSON.stringify(original),originalJSON,"guardar no muta la partida en memoria");
console.log("OK: recuperación íntegra de Elizabeth, casos locales, Principado, conspiración, EP/47 y Vitae");
