"use strict";
/* Ejecutar desde la raíz: node tests/case-actors-visuals.test.js */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),window={};
const files=["vtm-case-interiors.js","vtm-physics.js","vtm-case-visuals.js","vtm-case-actors.js","vtm-elizabeth.js"];
for(const f of files)vm.runInNewContext(fs.readFileSync(path.join(root,f),"utf8"),{window},{filename:f});
const P=window.VTM_PHYSICS,CI=window.VTM_CASE_INTERIORS,V=window.VTM_CASE_VISUALS,A=window.VTM_CASE_ACTORS;
function game(room){
 return {scene:room,x:240,y:252,clock:{night:1},elizabeth:{status:"active",alert:0,evidence:[]},combat:{records:{}},history:[]};
}
const test=(name,fn)=>{fn();console.log("OK:",name);};
test("Cinco personajes con rutas, posiciones libres y estado persistente",()=>{
 assert.equal(Object.values(A.definitions).flat().length,5);
 for(const room of Object.keys(A.definitions)){
  const g=game(room),actors=A.ensure(g,room,P);
  assert.equal(actors.length,A.definitions[room].length);
  const initial=actors.map(a=>[a.id,a.state.x,a.state.y]);
  for(let i=0;i<900;i++){
   A.step(g,.045,P);
   for(const npc of A.list(g))assert.ok(P.canStand(room,npc.state.x,npc.state.y),npc.id+" atraviesa mobiliario");
  }
  assert.ok(A.list(g).some(a=>Math.hypot(a.state.x-initial.find(v=>v[0]===a.id)[1],a.state.y-initial.find(v=>v[0]===a.id)[2])>1),"ningún PNJ caminó en "+room);
  const restored=JSON.parse(JSON.stringify(g));A.init(restored,P);
  assert.equal(A.list(restored).length,A.list(g).length);
 }
});
test("Vigilante reacciona una vez por noche y reconoce la siguiente",()=>{
 const g=game("case-hideout");g.x=379;g.y=181;g.elizabeth.alert=3;A.ensure(g,g.scene,P);
 assert.equal(A.step(g,.03,P).filter(e=>e.type==="suspicion").length,1);
 assert.equal(A.step(g,.03,P).filter(e=>e.type==="suspicion").length,0);
 g.clock.night++;assert.equal(A.step(g,.03,P).filter(e=>e.type==="suspicion").length,1);
});
test("Vasseur puede huir sin desaparecer de toda la campaña",()=>{
 const g=game("case-garage");g.x=402;g.y=181;g.elizabeth.alert=4;A.ensure(g,g.scene,P);
 let fled=false;
 for(let i=0;i<400;i++){if(A.step(g,.04,P).some(e=>e.type==="fled")){fled=true;break;}}
 assert.equal(fled,true);
 assert.equal(A.list(g).some(n=>n.id==="vasseur"),false);
 g.clock.night++;g.elizabeth.alert=1;
 assert.equal(A.list(g).some(n=>n.id==="vasseur"),true);
});
test("Interrogatorios sin recompensas duplicadas",()=>{
 const g=game("case-apartment");A.ensure(g,g.scene,P);
 let last=null,saves=0;
 A.bind({getGame:()=>g,ask:(title,body,choices)=>{last={title,body,choices}},roll:()=>({success:true,dice:[8,7]}),advance:()=>{},log:()=>{},save:()=>{saves++},refresh:()=>{}});
 A.talk("madeleine");let option=last.choices.find(c=>c.label.includes("Pedir su testimonio"));
 assert.ok(option);option.action();
 assert.equal(g.caseActors.madeleine.interviewed,true);assert.ok(saves>0);
 A.talk("madeleine");assert.ok(!last.choices.some(c=>c.label.includes("Pedir su testimonio")));
});
test("Arte ambiental en cada escenario, incluso sin gradientes",()=>{
 for(const room of Object.keys(CI.places)){
  let fills=0;
  const c={fillRect(){fills++},save(){},restore(){},fillText(){},set fillStyle(v){},set textAlign(v){},set font(v){},set globalAlpha(v){},get globalAlpha(){return 1;}};
  assert.ok(V.draw(c,room,20,game(room),true));
  assert.ok(fills>80,room+" no dibujó detalles");
 }
 assert.equal(V.draw({},"paris",0,{},true),false);
});
test("Orden de carga, integración con el motor y etiquetas",()=>{
 const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
 const code=fs.readFileSync(path.join(root,"vtm-game.js"),"utf8");
 for(const file of ["vtm-case-visuals.js","vtm-case-actors.js"])
  assert.ok(html.indexOf(file)<html.indexOf("vtm-game.js")&&html.includes(file));
 assert.ok(html.includes("FASE XIV"));
 for(const method of ["ACT.init(game,P)","ACT.ensure(game,id,P)","ACT.step(game,dt,P)","ACT.draw(g,game,visualTime,G)","VIS.draw(g,game.scene,visualTime,game,effectsEnabled)","ACT.talk(actor.id)"])assert.ok(code.includes(method),method);
 assert.ok(!fs.readFileSync(path.join(root,"vtm-case-actors.js"),"utf8").includes("Etienne es una impostora"));
});
console.log("OK: regresiones completas de Fase XIV");