"use strict";
/* Ejecutar: node tests/case-interiors.test.js */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),window={};
for(const file of ["vtm-case-interiors.js","vtm-physics.js","vtm-elizabeth.js","vtm-tactics.js"]){
 vm.runInNewContext(fs.readFileSync(path.join(root,file),"utf8"),{window},{filename:file});
}
const CI=window.VTM_CASE_INTERIORS,P=window.VTM_PHYSICS,E=window.VTM_ELIZABETH,T=window.VTM_TACTICS;
const test=(name,fn)=>{fn();console.log("OK:",name);};
function fakeCanvas(){
 const state={fills:0,labels:0},c={
  fillRect(){state.fills++},fillText(){state.labels++},save(){},restore(){},
  set fillStyle(v){},set textAlign(v){},set font(v){},
  set globalAlpha(v){},get globalAlpha(){return 1}
 };
 return {c,state};
}
test("interiores dibujables y alcanzables con colisiones",()=>{
 assert.deepEqual(Object.keys(CI.places).sort(),["case-apartment","case-garage","case-hideout"].sort());
 for(const id of Object.keys(CI.places)){
  const p=CI.byId(id);
  assert.ok(P.canStand(id,p.start.x,p.start.y),id+" entrada inaccesible");
  for(const spot of p.spots){
   const nearest=P.nearestFree(id,spot.x,spot.y);
   assert.ok(P.canStand(id,nearest.x,nearest.y),id+":"+spot.id);
   assert.ok(Math.hypot(nearest.x-spot.x,nearest.y-spot.y)<=spot.range,id+":"+spot.id+" demasiado lejos");
   assert.ok(P.path(id,p.start,nearest).length>0,id+":"+spot.id+" sin ruta");
  }
  const {c,state}=fakeCanvas();
  assert.equal(CI.draw(c,id,10,{scene:id,combat:{records:{}}}),true);
  assert.ok(state.fills>15 && state.labels>3,id+" carece de dibujo");
  assert.equal(CI.nearest({scene:id,x:p.start.x,y:p.start.y}).id,"exit");
 }
});
const fresh=()=>({clock:{night:1},scene:"venue",venue:"passy",elizabeth:null,story:{xp:0,totalXp:0},factions:{},history:[]});
test("el expediente ofrece entrada al apartamento sin abrir el garaje antes de tiempo",()=>{
 const g=fresh(),menus=[];
 E.bind({getGame:()=>g,ask:(title,text,options)=>{menus.push(options)},enterInterior:id=>{g.scene=id}});
 E.start(g);g.venue="hemeroteca";E.menu();
 const entry=menus.at(-1).find(c=>c.label.includes("apartamento"));
 assert.ok(entry&&!entry.disabled);entry.action();
 assert.equal(g.scene,"case-apartment");
 E.menu();assert.ok(!menus.at(-1).some(c=>c.label.includes("Entrar al apartamento")));
 g.scene="venue";g.venue="saintdenis";E.menu();
 assert.ok(menus.at(-1).find(c=>c.label.includes("garaje")).disabled);
 E.attempt(g,"mathieu",true);E.menu();
 assert.equal(menus.at(-1).find(c=>c.label.includes("garaje")).disabled,false);
});
test("refugio requiere pruebas, y Bapthiste tiene combate individual",()=>{
 const g=fresh(),menus=[];
 E.bind({getGame:()=>g,ask:(title,text,options)=>menus.push(options)});
 E.start(g);g.venue="bastilla";E.menu();
 assert.ok(menus.at(-1).find(c=>c.label.includes("refugio")).disabled);
 for(const id of ["mathieu","garage","john","police"])assert.equal(E.attempt(g,id,true).success,true);
 E.menu();assert.equal(menus.at(-1).find(c=>c.label.includes("refugio")).disabled,false);
 assert.equal(T.ENEMIES.bapthiste.name,"Bapthiste, Brujah rebelde");
 assert.ok(T.ENEMIES.bapthiste.health>=8);
});
test("scripts cargados antes del motor, salvado y UI conectados",()=>{
 const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
 const code=fs.readFileSync(path.join(root,"vtm-game.js"),"utf8");
 assert.ok(html.indexOf('src="vtm-case-interiors.js?')<html.indexOf('src="vtm-elizabeth.js?'));
 assert.ok(html.indexOf('src="vtm-elizabeth.js?')<html.indexOf('src="vtm-game.js?'));
 for(const name of ["enterCaseInterior","leaveCaseInterior","caseInteriorInteract","drawCaseInterior","caseAfterBattle","ELI.investigate","CI.nearest","bapthisteOutcome:caseAfterBattle"]){
  assert.ok(code.includes(name),name);
 }
 assert.ok(fs.readFileSync(path.join(root,"vtm-tactics-ui.js"),"utf8").includes("bridge.bapthisteOutcome?.()"));
});
console.log("OK: caso Elizabeth, interiores y combate táctico");