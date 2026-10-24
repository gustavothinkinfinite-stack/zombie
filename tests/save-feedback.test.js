"use strict";
/* Regresión: jamás informar que la partida se guardó si el navegador lo impide.
 * Ejecutar: node tests/save-feedback.test.js
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const source=fs.readFileSync(path.join(__dirname,"..","vtm-game.js"),"utf8");
const begin=source.indexOf(" function save(){");
const end=source.indexOf("\n function load(){",begin);
assert.ok(begin!==-1&&end>begin,"Se debe poder localizar la rutina de guardado");
const saveSource=source.slice(begin,end);
function runSave(game,storage){
 const notices=[];
 const success=vm.runInNewContext(saveSource+"\nsave()",{
  game,SAVE_KEY:"test-save",localStorage:storage,notice:msg=>notices.push(msg)
 });
 return{success,notices};
}
const state={version:1,character:{name:"Investigadora"},scene:"paris"};
let stored=null;
const good=runSave(state,{setItem:(key,value)=>{stored={key,value};}});
assert.equal(good.success,true);
assert.deepEqual(good.notices,[]);
assert.equal(stored.key,"test-save");
assert.deepEqual(JSON.parse(stored.value),state);
console.log("OK: confirmación sólo tras escritura real");

const denied=runSave(state,{setItem:()=>{throw new Error("QuotaExceededError");}});
assert.equal(denied.success,false);
assert.deepEqual(denied.notices,["No se pudo guardar en este navegador."]);
console.log("OK: error de almacenamiento sin falso éxito");

const empty=runSave(null,{setItem:()=>{throw new Error("No debería escribir");}});
assert.equal(empty.success,false);
assert.deepEqual(empty.notices,[]);
console.log("OK: sin partida no se afirma que se guardó");

const listener=source.match(/\$\("manualSaveBtn"\)\.addEventListener\("click",(\(\)=>\{[^\n]*\})\);/);
assert.ok(listener,"Se debe poder localizar la acción de Guardar");
function manualSaveFeedback(saved){
 const messages=[];
 const handler=vm.runInNewContext("("+listener[1]+")",{
  save:()=>saved,notice:msg=>messages.push(msg)
 });
 handler();
 return messages;
}
assert.deepEqual(manualSaveFeedback(false),[]);
assert.deepEqual(manualSaveFeedback(true),["Partida guardada."]);
console.log("OK: botón Guardar respeta el resultado");

assert.ok(source.includes('const saved=save();closeAppearance();if(saved)notice("Apariencia guardada.");'),
 "Guardar apariencia no debe confirmar éxito cuando falló el almacenamiento");
console.log("OK: editor de apariencia respeta el resultado");
