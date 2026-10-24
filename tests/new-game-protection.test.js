"use strict";
/* Regresión: la creación de un personaje no puede borrar una partida sin consentimiento.
 * Ejecutar: node tests/new-game-protection.test.js
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const source=fs.readFileSync(path.join(__dirname,"..","vtm-game.js"),"utf8");
const start=source.indexOf(" function confirmNewStory(){");
const end=source.indexOf("\n function startStory(){",start);
assert.ok(start>=0&&end>start,"Debe existir una comprobación previa al inicio");
const guard=source.slice(start,end);
function check(stored,answer,{unavailable=false}={}){
 let prompts=0,reads=0;
 const localStorage={getItem:key=>{
  reads++;
  assert.equal(key,"cronicas-paris-ghoul-v1");
  if(unavailable)throw new Error("Storage unavailable");
  return stored;
 }};
 const window={confirm:message=>{
  prompts++;
  assert.match(message,/partida|guardado/i);
  return answer;
 }};
 const allowed=vm.runInNewContext(guard+"\nconfirmNewStory()",{
  localStorage,window,SAVE_KEY:"cronicas-paris-ghoul-v1"
 });
 return{allowed,prompts,reads};
}
assert.deepEqual(check(null,false),{allowed:true,prompts:0,reads:1});
console.log("OK: primera partida inicia sin confirmación");
assert.deepEqual(check('{"version":1,"character":{"name":"Antigua"}}',false),{allowed:false,prompts:1,reads:1});
console.log("OK: cancelar preserva la partida anterior");
assert.deepEqual(check('{"version":1,"character":{"name":"Antigua"}}',true),{allowed:true,prompts:1,reads:1});
console.log("OK: reemplazar requiere aprobación expresa");
assert.deepEqual(check("partida antigua ilegible",false),{allowed:false,prompts:1,reads:1});
console.log("OK: incluso partidas antiguas o dañadas están protegidas");
assert.deepEqual(check(null,false,{unavailable:true}),{allowed:false,prompts:1,reads:1});
assert.deepEqual(check(null,true,{unavailable:true}),{allowed:true,prompts:1,reads:1});
console.log("OK: error al consultar almacenamiento requiere aprobación");

const story=source.slice(end,end+1150);
const guardIndex=story.indexOf("if(!confirmNewStory())return;");
const replaceIndex=story.indexOf("game={version:1,character:buildCharacter()");
assert.ok(guardIndex>0&&replaceIndex>guardIndex,"El guard debe ejecutarse antes de sustituir el personaje");
console.log("OK: el estado sólo se reemplaza después de confirmar");
