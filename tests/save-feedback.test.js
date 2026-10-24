"use strict";
/* Regresión: no informar éxito si el navegador rechaza guardar.
 * Ejecutar: node tests/save-feedback.test.js
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.join(__dirname,"..");
const source=fs.readFileSync(path.join(root,"vtm-game.js"),"utf8");
const moduleSource=fs.readFileSync(path.join(root,"vtm-save.js"),"utf8");
const window={};vm.runInNewContext(moduleSource,{window});
const SAVER=window.VTM_SAVE;
const start=source.indexOf(" function save(){");
const end=source.indexOf("\n function load(){",start);
assert.ok(start>=0&&end>start,"La rutina de guardado debe existir");
const saverSource=source.slice(start,end);
const clans={Toreador:{}};
const fixture={version:1,character:{name:"Investigadora",clan:"Toreador"},scene:"paris"};
function runSave(game,storage){
 const notices=[];
 const saved=vm.runInNewContext(saverSource+"\nsave()",{
  game,SAVER,localStorage:storage,SAVE_KEY:"test-save",D:{clans},
  notice:message=>notices.push(message)
 });
 return{saved,notices};
}
function memory(){
 const values=new Map();
 return{
  values,getItem:key=>values.get(key)||null,
  setItem:(key,value)=>values.set(key,value)
 };
}
const goodStore=memory();
const good=runSave(fixture,goodStore);
assert.equal(good.saved,true);
assert.deepEqual(good.notices,[]);
assert.deepEqual(JSON.parse(goodStore.getItem("test-save")),fixture);
assert.deepEqual(JSON.parse(goodStore.getItem("test-save-backup")),fixture);
console.log("OK: la confirmación depende de una escritura real y respaldada");

const denied=runSave(fixture,{
 getItem:()=>null,
 setItem:()=>{throw new Error("QuotaExceededError");}
});
assert.equal(denied.saved,false);
assert.deepEqual(denied.notices,["No se pudo guardar en este navegador."]);
console.log("OK: no hay falso éxito si el almacenamiento rechaza la escritura");

const inaccessible=runSave(fixture,{
 getItem:()=>{throw new Error("SecurityError");},
 setItem:()=>{throw new Error("SecurityError");}
});
assert.equal(inaccessible.saved,false);
assert.equal(inaccessible.notices.length,1);
console.log("OK: acceso denegado no bloquea el juego");

const empty=runSave(null,{getItem:()=>null,setItem:()=>{throw Error("No debe escribir");}});
assert.equal(empty.saved,false);
assert.deepEqual(empty.notices,[]);
console.log("OK: sin partida no se informa que se guardó");

const listener=source.match(/\$\("manualSaveBtn"\)\.addEventListener\("click",(\(\)=>\{[^\n]*\})\);/);
assert.ok(listener,"El botón Guardar debe tener manejador");
function feedback(saved){
 const messages=[];
 const handler=vm.runInNewContext("("+listener[1]+")",{
  save:()=>saved,notice:message=>messages.push(message)
 });
 handler();return messages;
}
assert.deepEqual(feedback(false),[]);
assert.deepEqual(feedback(true),["Partida guardada."]);
assert.ok(source.includes('const saved=save();closeAppearance();if(saved)notice("Apariencia guardada.");'));
console.log("OK: botones de Guardar y Apariencia respetan el resultado");
