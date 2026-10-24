"use strict";
/* Crear una partida no puede reemplazar el guardado principal ni respaldo sin permiso. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.join(__dirname,"..");
const source=fs.readFileSync(path.join(root,"vtm-game.js"),"utf8");
const moduleSource=fs.readFileSync(path.join(root,"vtm-save.js"),"utf8");
const windowModule={};vm.runInNewContext(moduleSource,{window:windowModule});
const SAVER=windowModule.VTM_SAVE;
const start=source.indexOf(" function confirmNewStory(){");
const end=source.indexOf("\n function startStory(){",start);
assert.ok(start>=0&&end>start,"Debe existir la comprobación previa al inicio");
const guard=source.slice(start,end);
function check(primary,backup,answer,{unavailable=false}={}){
 let prompts=0,reads=0;
 const localStorage={getItem:key=>{
  reads++;
  if(unavailable)throw Error("Storage unavailable");
  assert.ok(["cronicas-paris-ghoul-v1","cronicas-paris-ghoul-v1-backup"].includes(key));
  return key.endsWith("-backup")?backup:primary;
 }};
 const window={confirm:message=>{
  prompts++;
  assert.match(message,/partida|guardado/i);
  return answer;
 }};
 const allowed=vm.runInNewContext(guard+"\nconfirmNewStory()",{
  localStorage,window,SAVER,SAVE_KEY:"cronicas-paris-ghoul-v1"
 });
 return{allowed,prompts,reads};
}
assert.equal(check(null,null,false).allowed,true);
assert.equal(check(null,null,false).prompts,0);
console.log("OK: sin partidas, se permite crear personaje");
const saved='{"version":1,"character":{"name":"Antigua"}}';
assert.equal(check(saved,null,false).allowed,false);
assert.equal(check(saved,null,false).prompts,1);
assert.equal(check(saved,null,true).allowed,true);
console.log("OK: una partida existente requiere confirmación");
assert.equal(check(null,saved,false).allowed,false);
assert.equal(check(null,saved,true).allowed,true);
console.log("OK: un respaldo aislado también queda protegido");
assert.equal(check("{dañado",null,false).allowed,false);
assert.equal(check("{dañado",null,true).allowed,true);
console.log("OK: los datos ilegibles siguen protegidos");
assert.equal(check(null,null,false,{unavailable:true}).allowed,false);
assert.equal(check(null,null,true,{unavailable:true}).allowed,true);
console.log("OK: acceso restringido al almacenamiento exige confirmación");
const story=source.slice(end,end+1250);
const guardIndex=story.indexOf("if(!confirmNewStory())return;");
const replaceIndex=story.indexOf("game={version:1,character:buildCharacter()");
assert.ok(guardIndex>0&&replaceIndex>guardIndex);
console.log("OK: la confirmación ocurre antes de sustituir al personaje");
