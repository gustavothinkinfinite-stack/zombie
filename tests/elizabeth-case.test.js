"use strict";
/* node tests/elizabeth-case.test.js */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const window={};
vm.runInNewContext(fs.readFileSync(path.join(root,"vtm-elizabeth.js"),"utf8"),{window},{filename:"vtm-elizabeth.js"});
const E=window.VTM_ELIZABETH;
const test=(label,fn)=>{fn();console.log("OK:",label);};
const fresh=()=>({clock:{night:1,minutes:1215},scene:"venue",venue:"passy",story:{locations:{},xp:0,totalXp:0},factions:{camarilla:0,brujah:0,nosferatu:0,tremere:0},history:[],exposure:0});
test("migración no destructiva de partidas previas",()=>{
 const g=fresh();E.init(g);
 assert.equal(E.summary(g).status,"dormant");
 assert.deepEqual(Object.keys(g.story.locations),[]);
 assert.equal(E.scenes.length,8);
});
test("encargo sólo en Passy, una vez",()=>{
 const g=fresh();assert.equal(E.atPlace(g,"passy"),true);
 assert.equal(E.atPlace(g,"policia"),false);
 assert.equal(E.start(g),true);
 assert.equal(E.start(g),false);
 assert.equal(E.atPlace(g,"policia"),true);
});
test("rutas alternativas al garaje y reintentos nocturnos",()=>{
 for(const lead of ["mathieu","lucien","erebos"]){
  const g=fresh();E.start(g);
  assert.ok(E.canAttempt(g,"garage"));
  assert.equal(E.attempt(g,lead,true).success,true);
  assert.equal(E.canAttempt(g,"garage"),null);
  assert.equal(E.attempt(g,"garage",false).success,false);
  assert.ok(E.canAttempt(g,"garage"));
  g.clock.night++;
  assert.equal(E.attempt(g,"garage",true).success,true);
  assert.equal(E.attempt(g,"garage",true),null);
 }
});
test("sin cuatro pruebas no se permite reportar ni confrontar",()=>{
 const g=fresh();E.start(g);
 E.attempt(g,"mathieu",true);E.attempt(g,"garage",true);
 assert.equal(E.canReport(g),false);
 assert.ok(E.canConfront(g));
 assert.equal(E.report(g,"sheriff"),null);
});
test("pruebas, confrontación, cierre y audiencia persisten sin duplicarse",()=>{
 const g=fresh();E.start(g);
 for(const id of ["john","apartment","police","mathieu","garage"]){
  assert.equal(E.attempt(g,id,true).success,true);
 }
 assert.equal(E.summary(g).count,5);
 assert.equal(E.canReport(g),true);
 assert.equal(E.confront(g,true,"documentos").success,true);
 assert.ok(E.canConfront(g));
 assert.ok(E.report(g,"sheriff"));
 assert.equal(E.report(g,"sheriff"),null);
 assert.equal(E.court(g,"inquiry"),true);
 assert.equal(E.court(g,"inquiry"),false);
 assert.equal(E.hunters(g),true);
 assert.equal(E.hunters(g),false);
 const restored=JSON.parse(JSON.stringify(g));
 assert.equal(E.summary(restored).count,5);
 assert.equal(E.summary(restored).court,"inquiry");
 assert.equal(E.summary(restored).hunters,true);
});
test("no se filtra el secreto de la Senescal al contenido visible",()=>{
 const text=fs.readFileSync(path.join(root,"vtm-elizabeth.js"),"utf8");
 assert.ok(text.includes("Etienne Moreau"));
 assert.ok(!text.includes("Etienne es una impostora")&&!text.includes("Etienne organiza los cazadores"));
});
test("integración: carga de script y accesos de acciones/diario",()=>{
 const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
 const code=fs.readFileSync(path.join(root,"vtm-game.js"),"utf8");
 assert.ok(html.includes('src="vtm-elizabeth.js?'));
 assert.ok(html.indexOf('src="vtm-elizabeth.js?')<html.indexOf('src="vtm-game.js?'));
 for(const needle of ["ELI.init(game)","ELI.bind(","ELI.atPlace(","ELI.menu","ELI.summary(game)"])assert.ok(code.includes(needle),needle);
});
console.log("OK: Elizabeth Parker — suite completa");