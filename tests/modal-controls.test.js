"use strict";
/* Regresiones de controles con ventanas de ficha, diario y diálogo.
 * Ejecutar: node tests/modal-controls.test.js
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const source=fs.readFileSync(path.join(__dirname,"..","vtm-game.js"),"utf8");
function section(start,end){
 const a=source.indexOf(start),b=source.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a,"No se encontró la sección: "+start);
 return source.slice(a,b);
}
const helpers=section(" function overlayOpen(){","\n let effectsEnabled=");
const move=section(" function moveStep(dt){","\n function frame(time){");
const keyboard=section('  window.addEventListener("keydown",e=>{','\n  window.addEventListener("keyup",');
const ids=["appearanceModal","sheetModal","journalModal"];
function environment(){
 const open=new Set(),keys=new Set(["w"]);
 const nodes=Object.fromEntries([...ids,"play","dialog","floatingHint"].map(id=>[id,{
  classList:{
   contains:name=>name==="hidden"?!open.has(id):false,
   add:name=>{if(name==="hidden")open.delete(id);},
   remove:name=>{if(name==="hidden")open.add(id);}
  },textContent:""
 }]));
 // El juego está visible; los demás paneles empiezan cerrados.
 open.add("play");
 const game={x:240,y:220,scene:"house",walking:true,character:{attr:{Destreza:2}},
  embraced:false,clock:{night:1},mechanics:null};
 const ctx={game,keys,touchMove:"up",walkTarget:{x:300,y:220},walkRoute:[{x:310,y:220}],
  dialogOpen:false,$:id=>nodes[id],P:null,clamp:(n,a,b)=>Math.max(a,Math.min(b,n)),
  nearInteractive:()=>"",Math};
 vm.runInNewContext(helpers,ctx);
 return{ctx,open,keys,game,nodes};
}
{
 const t=environment();
 // Ocultar la pantalla 'play' no significa que el panel esté abierto.
 t.open.delete("play");
 assert.equal(vm.runInNewContext("overlayOpen()",t.ctx),false);
 for(const id of ids){
  t.open.add(id);
  assert.equal(vm.runInNewContext("overlayOpen()",t.ctx),true,id+" bloquea exploración");
  t.open.delete(id);
 }
 t.ctx.dialogOpen=true;
 assert.equal(vm.runInNewContext("overlayOpen()",t.ctx),true,"diálogo bloquea exploración");
 t.ctx.dialogOpen=false;
 vm.runInNewContext("stopWalking()",t.ctx);
 assert.equal(t.keys.size,0);
 assert.equal(t.ctx.touchMove,null);
 assert.equal(t.ctx.walkTarget,null);
 assert.equal(t.ctx.walkRoute.length,0);
 assert.equal(t.game.walking,false);
 console.log("OK: paneles y diálogo bloquean controles; la entrada pendiente se limpia");
}
{
 const t=environment();
 t.open.delete("play");t.open.add("sheetModal");
 vm.runInNewContext(move+"\nmoveStep(0.1)",t.ctx);
 assert.equal(t.game.y,220);
 assert.equal(t.game.walking,false);
 t.open.delete("sheetModal");
 t.keys.clear();t.keys.add("w");
 t.ctx.touchMove=null;t.ctx.walkTarget=null;
 vm.runInNewContext("moveStep(0.1)",t.ctx);
 assert.ok(t.game.y<220,"el personaje debe volver a moverse tras cerrar el panel");
 console.log("OK: ficha abierta congela desplazamiento; cerrada lo reanuda");
}
{
 const t=environment();
 t.open.delete("play");
 let callback,interactions=0,prevented=0,closed=0;
 t.ctx.window={addEventListener:(type,fn)=>{if(type==="keydown")callback=fn;}};
 t.ctx.interact=()=>{interactions++;};
 t.ctx.closeDialog=()=>{closed++;t.ctx.dialogOpen=false;};
 t.ctx.closeAppearance=()=>{t.open.delete("appearanceModal");};
 vm.runInNewContext(keyboard,t.ctx);
 const send=(key,tagName="DIV")=>callback({
  key,repeat:false,target:{tagName},
  preventDefault:()=>{prevented++;}
 });
 t.keys.clear();t.open.add("journalModal");
 send("ArrowUp");
 assert.equal(t.keys.size,0);
 assert.equal(prevented,0,"el panel debe poder usar flechas sin bloqueo global");
 send("Escape","BUTTON");
 assert.equal(t.open.has("journalModal"),false,"Escape debe cerrar el diario");
 t.keys.clear();
 send("ArrowUp");
 assert.ok(t.keys.has("arrowup"));
 assert.equal(prevented,1);
 t.keys.clear();
 send(" ","BUTTON");
 assert.equal(interactions,0,"Espacio sobre botón no interactúa con el mapa");
 assert.equal(prevented,1,"Espacio sobre botón mantiene su acción nativa");
 send("e","TEXTAREA");
 assert.equal(interactions,0);
 send("e");
 assert.equal(interactions,1);
 console.log("OK: Escape, flechas, botones y campos de texto no generan acciones accidentales");
}
assert.match(source,/function interact\(\)\{\s*if\(!game\|\|overlayOpen\(\)\)return;/);
assert.match(source,/canvas\.addEventListener\("pointerdown",e=>\{\s*if\(!game\|\|overlayOpen\(\)\)return;/);
assert.match(source,/pointerdown",e=>\{if\(overlayOpen\(\)\)return;/);
console.log("OK: interacción, clic en mapa y cruceta táctil respetan paneles abiertos");
