"use strict";
/* Evitar perder el progreso al volver al menú si el navegador no guarda.
 * Ejecutar: node tests/menu-save-guard.test.js
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const source=fs.readFileSync(path.join(__dirname,"..","vtm-game.js"),"utf8");
const begin=source.indexOf('  $("titleBtn").addEventListener("click",');
const end=source.indexOf('\n  $("touchUse").addEventListener(',begin);
assert.ok(begin>=0&&end>begin,"Debe existir la acción para volver al menú");
const handlerSource=source.slice(begin,end);
function pressMenu({saved,restored}){
 const calls=[],button={disabled:true};
 let click;
 const $=id=>id==="titleBtn"?{addEventListener:(type,fn)=>{
  assert.equal(type,"click");click=fn;
 }}:id==="continueGame"?button:null;
 vm.runInNewContext(handlerSource,{
  $,save:()=>{calls.push("save");return saved;},
  load:()=>{calls.push("load");return restored;},
  show:id=>calls.push("show:"+id),
  notice:message=>calls.push("notice:"+message)
 });
 assert.equal(typeof click,"function");
 click();
 return{calls,button};
}
const denied=pressMenu({saved:false,restored:null});
assert.deepEqual(denied.calls,["save"]);
assert.equal(denied.button.disabled,true);
console.log("OK: si falla la escritura, el jugador no abandona la partida");

const unreadable=pressMenu({saved:true,restored:null});
assert.deepEqual(unreadable.calls.slice(0,2),["save","load"]);
assert.equal(unreadable.calls.some(x=>x.startsWith("show:")),false);
assert.equal(unreadable.calls.filter(x=>x.startsWith("notice:")).length,1);
assert.match(unreadable.calls.at(-1),/No se pudo verificar el guardado/);
assert.equal(unreadable.button.disabled,true);
console.log("OK: si no se puede recuperar el guardado, el juego sigue abierto");

const verified=pressMenu({saved:true,restored:{version:1,character:{clan:"Toreador"}}});
assert.deepEqual(verified.calls,["save","load","show:welcome"]);
assert.equal(verified.button.disabled,false);
console.log("OK: sólo un guardado recuperable permite volver al menú");
