"use strict";
/* Ejecutar: node tests/reactive-city.test.js */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),window={};
for(const file of ["vtm-shops.js","vtm-physics.js","vtm-reactive-city.js"])
 vm.runInNewContext(fs.readFileSync(path.join(root,file),"utf8"),{window},{filename:file});
const R=window.VTM_REACTIVE_CITY,P=window.VTM_PHYSICS,K=window.VTM_SHOPS;
const game=(minutes=1215,night=1)=>({scene:"district",district:"bastilla",clock:{night,minutes},x:247,y:215});
function setup(g,success=true){
 const dialogs=[],logs=[];
 R.bind({getGame:()=>g,ask:(title,detail,choices)=>dialogs.push({title,detail,choices}),
  roll:()=>({success,dice:success?[9,8,7]:[2,3,4]}),
  log:m=>logs.push(m),save:()=>{},refresh:()=>{},exposure:()=>{},
  advance:minutes=>{g.clock.minutes=(g.clock.minutes+minutes)%1440;R.tick(g)}});
 return {dialogs,logs,last:()=>dialogs.at(-1),pick:label=>{
  const choice=dialogs.at(-1)?.choices.find(v=>v.label.includes(label));
  assert.ok(choice,"No existe la opción '"+label+"'");choice.action();
 }};
}
const test=(title,fn)=>{fn();console.log("OK:",title);};
test("Migración no destructiva y comienzo diferido desde madrugada",()=>{
 const s=game(1215);s.otherMission={active:true};assert.equal(R.summary(s).stage,"pending");
 assert.equal(s.otherMission.active,true);
 const late=game(65,3);R.init(late);
 assert.equal(R.summary(late).night,4);assert.equal(R.tick(late).length,0);
});
test("Hitos del robo, policía, investigación y rumores fuera de Bastilla",()=>{
 const s=game();R.init(s);
 assert.equal(R.tick(s).length,0);
 s.clock.minutes=1335;assert.equal(R.tick(s).length,1);
 assert.equal(R.tick(s).length,0);
 assert.ok(R.visible(s).some(p=>p.id==="suspect"));
 s.clock.minutes=1350;assert.equal(R.tick(s).length,1);
 assert.ok(R.visible(s).some(p=>p.id==="officer"));
 s.scene="house";s.clock.minutes=1380;
 assert.equal(R.tick(s).length,1);assert.ok(s.reactiveCity.rumors.some(v=>v.district==="policia"));
 assert.ok(s.reactiveCity.rumors.some(v=>v.district==="stjuly"));
 assert.equal(R.tick(s).length,0);
});
test("Testimonio corroborado y entrega a policía dan un desenlace verificable",()=>{
 const s=game(1380);R.tick(s);const b=setup(s);
 s.x=185;s.y=213;
 assert.equal(R.interact(s),true);b.pick("Escucharla");
 assert.equal(s.reactiveCity.case.flags.testimony,true);
 assert.equal(s.reactiveCity.case.memory.witness,1);
 s.x=295;s.y=214;R.interact(s);b.pick("Entregar información");
 assert.equal(s.reactiveCity.case.flags.reported,true);
 s.clock.minutes=10;R.tick(s);
 assert.equal(R.summary(s).outcome,"detained");
 assert.equal(R.tick(s).length,0);
 assert.ok(R.summary(s).timeline.some(v=>v.includes("detiene")));
});
test("Recuperar pertenencias no implica detener automáticamente al sospechoso",()=>{
 const s=game(1335);R.tick(s);const b=setup(s);
 s.x=216;s.y=168;R.interact(s);b.pick("Intervenir");
 assert.equal(s.reactiveCity.case.flags.intervened,true);
 s.clock.minutes=10;R.tick(s);assert.equal(R.summary(s).outcome,"retrieved");
});
test("Ocultar pruebas genera un desenlace distinto y evita borrar lo ya denunciado",()=>{
 const s=game(1335);R.tick(s);const b=setup(s);
 s.x=247;s.y=215;R.interact(s);b.pick("Examinar la escena");
 s.x=247;s.y=215;R.interact(s);b.pick("Ocultar las pruebas");
 assert.equal(s.reactiveCity.case.flags.concealed,true);
 s.clock.minutes=10;R.tick(s);assert.equal(R.summary(s).outcome,"concealed");
});
test("Las amenazas tienen memoria y la testigo realmente abandona la escena",()=>{
 const s=game(1380);R.tick(s);const b=setup(s);
 s.x=185;s.y=213;R.interact(s);b.pick("Presionarla");
 assert.equal(s.reactiveCity.case.flags.intimidated,true);
 assert.ok(s.reactiveCity.case.memory.witness<0);
 assert.equal(R.visible(s).some(v=>v.id==="witness"),false);
});
test("La investigación continúa aunque el jugador se marche y el caso puede quedar sin resolver",()=>{
 const s=game();R.tick(s);
 s.scene="house";s.clock.minutes=1215;
 assert.ok(R.tick(s,true).length>=3);
 assert.equal(R.summary(s).outcome,"unresolved");
 assert.ok(s.reactiveCity.rumors.some(x=>x.district==="hemeroteca"));
 const copy=JSON.parse(JSON.stringify(s));
 assert.equal(R.summary(copy).outcome,"unresolved");
 assert.equal(R.tick(copy).length,0);
});
test("Rumores llegan a comercios, el bar facilita una evidencia alternativa",()=>{
 const s=game(1380);R.tick(s);const b=setup(s);
 const shop=K.byId["bastilla-bar"];assert.ok(R.atShop(s,shop));
 const options=R.shopChoices(s,shop);
 assert.ok(options.some(v=>v.label.includes("registro de la cámara")));
 options.find(v=>v.label.includes("registro de la cámara")).action();
 assert.equal(s.reactiveCity.case.flags.camera,true);
 assert.equal(R.shopChoices(s,shop).some(v=>v.label.includes("registro de la cámara")),false);
 s.scene="sidevenue";s.sidevenue="stjuly-cafe";assert.ok(R.atShop(s,K.byId["stjuly-cafe"]));
});
test("Objetos y PNJ están a distancia alcanzable y sin colisiones",()=>{
 const s=game(1380);R.tick(s);
 for(const spot of R.visible(s)){
  const free=P.nearestFree("district",spot.x,spot.y);
  assert.ok(P.canStand("district",free.x,free.y),spot.id);
  assert.ok(Math.hypot(free.x-spot.x,free.y-spot.y)<29,spot.id);
 }
 let blocks=0;
 const canvas={fillRect(){blocks++},fillText(){},set fillStyle(v){},set font(v){},set textAlign(v){}};
 R.draw(canvas,s,2);assert.ok(blocks>10);
});
test("Integración con el motor anterior y pruebas del proyecto",()=>{
 const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
 const main=fs.readFileSync(path.join(root,"vtm-game.js"),"utf8");
 assert.ok(html.indexOf("vtm-reactive-city.js?")>0);
 assert.ok(html.indexOf("vtm-reactive-city.js?")<html.indexOf("vtm-game.js?"));
 assert.ok(html.includes("FASE XVIII"));
 for(const needle of ["REACT.init(game)","REACT.tick(game","REACT?.interact(game)","REACT.shopChoices(game,shop)","REACT.draw(g,game","REACT.menu","REACT.summary(game)"]){
  assert.ok(main.includes(needle),needle);
 }
 assert.ok(main.includes('SAVE_KEY="cronicas-paris-ghoul-v1"'));
 new Function(main);
});
console.log("OK: Fase XVI — Bastilla reactiva");
