"use strict";
/* Regresión del respaldo recuperable; ejecutar: node tests/save-backup.test.js */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const src=fs.readFileSync(path.join(__dirname,"..","vtm-save.js"),"utf8");
const window={};vm.runInNewContext(src,{window},{filename:"vtm-save.js"});
const S=window.VTM_SAVE,clans={Toreador:{}},key="cronicas-paris-ghoul-v1",bk=key+"-backup";
const character=n=>({version:1,character:{name:"PJ "+n,clan:"Toreador"},clock:{night:n,minutes:1215},scene:"paris"});
function storage(){
 const db=new Map();let reject=null;
 return {
  db,block:key=>{reject=key;},
  getItem:k=>db.has(k)?db.get(k):null,
  setItem:(k,v)=>{if(k===reject)throw new Error("Storage quota");db.set(k,String(v));},
  removeItem:k=>db.delete(k)
 };
}
const mem=storage();
const first=character(1),second=character(2),third=character(3);
assert.equal(S.save(mem,key,first,clans),true);
assert.equal(mem.getItem(key),JSON.stringify(first));
assert.equal(mem.getItem(bk),JSON.stringify(first));
console.log("OK: la primera partida tiene copia recuperable");

assert.equal(S.save(mem,key,second,clans),true);
assert.equal(mem.getItem(key),JSON.stringify(second));
assert.equal(mem.getItem(bk),JSON.stringify(first));
console.log("OK: se conserva la última versión anterior válida");

mem.db.set(key,"{json roto");
const restored=S.load(mem,key,clans);
assert.equal(restored.fromBackup,true);
assert.equal(restored.game.character.name,"PJ 1");
assert.equal(S.hasSavedData(mem,key),true);
console.log("OK: si el guardado principal se daña, se recupera el respaldo");

assert.equal(S.save(mem,key,third,clans),true);
assert.equal(mem.getItem(bk),JSON.stringify(first));
assert.equal(mem.getItem(key),JSON.stringify(third));
console.log("OK: la partida dañada no contamina el respaldo");

const fail=storage();
assert.equal(S.save(fail,key,first,clans),true);
// Simular un guardado principal válido más reciente que la copia secundaria.
fail.db.set(key,JSON.stringify(second));
fail.block(bk);
assert.equal(S.save(fail,key,third,clans),false);
assert.equal(fail.getItem(key),JSON.stringify(second));
console.log("OK: no sobrescribir guardado previo si el respaldo falla");

const failPrimary=storage();
assert.equal(S.save(failPrimary,key,first,clans),true);
failPrimary.block(key);
assert.equal(S.save(failPrimary,key,second,clans),false);
assert.equal(failPrimary.getItem(key),JSON.stringify(first));
console.log("OK: un fallo de escritura no genera falso éxito");

const backupOnly=storage();
backupOnly.db.set(bk,JSON.stringify(first));
assert.equal(S.load(backupOnly,key,clans).fromBackup,true);
assert.equal(S.hasSavedData(backupOnly,key),true);
console.log("OK: un respaldo aislado también se reconoce");

const invalid=storage();
invalid.db.set(key,"{dañado");
invalid.db.set(bk,JSON.stringify({...first,character:{clan:"Desconocido"}}));
assert.equal(S.load(invalid,key,clans),null);
console.log("OK: los respaldos inválidos no se cargan");

const blocked={getItem:()=>{throw new Error("Acceso bloqueado");},setItem:()=>{throw new Error("Acceso bloqueado");}};
assert.equal(S.save(blocked,key,first,clans),false);
assert.equal(S.load(blocked,key,clans),null);
assert.equal(S.hasSavedData(blocked,key),null);
console.log("OK: almacenamiento bloqueado sin excepción fatal");

const gameSource=fs.readFileSync(path.join(__dirname,"..","vtm-game.js"),"utf8");
assert.ok(gameSource.includes("if(recovered&&!window.confirm("),"El respaldo debe requerir confirmación antes de cargar");
assert.ok(gameSource.includes("const saved=enterGame();"),"La recuperación debe guardar el estado validado");
console.log("OK: recuperar requiere consentimiento y revalida al entrar");
