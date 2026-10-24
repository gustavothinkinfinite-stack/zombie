"use strict";
/* Ejecutar: node tests/local-cases.test.js desde la raíz del repositorio */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const window={};
for(const file of ["vtm-shops.js","vtm-local-cases.js"]){
 vm.runInNewContext(fs.readFileSync(path.join(root,file),"utf8"),{window},{filename:file});
}
const K=window.VTM_SHOPS,C=window.VTM_LOCAL_CASES;
const game=()=>({clock:{night:1,minutes:1215},localClues:[],localCases:{},localPlaces:{},exposure:10});
const test=(name,fn)=>{fn();console.log("OK:",name)};
test("Cuatro expedientes sin establecimientos repetidos",()=>{
 assert.equal(C.definitions.length,4);
 assert.equal(new Set(C.definitions.flatMap(c=>c.steps)).size,16);
 for(const c of C.definitions)assert.equal(c.steps.length,4);
});
test("No se puede saltar una prueba intermedia",()=>{
 const state=game(),c=C.definitions[0];
 assert.equal(C.atShop(state,K.byId[c.steps[2]]).eligible,false);
 assert.equal(C.attempt(state,K.byId[c.steps[2]],true),null);
});
test("Una tirada fallida permite reintentar solamente la noche siguiente",()=>{
 const state=game(),shop=K.byId[C.definitions[0].steps[0]];
 assert.equal(C.attempt(state,shop,false).success,false);
 assert.equal(C.atShop(state,shop).blockedUntil,true);
 assert.equal(C.attempt(state,shop,true),null);
 state.clock.night=2;
 assert.equal(C.attempt(state,shop,true).success,true);
});
test("Las cuatro fuentes desbloquean una resolución única",()=>{
 const state=game(),caseData=C.definitions[0];
 for(const id of caseData.steps)assert.equal(C.attempt(state,K.byId[id],true).success,true);
 assert.equal(C.progress(state,caseData.id).ready,true);
 assert.equal(C.resolve(state,caseData.id,"archive").exposure,-4);
 assert.equal(C.resolve(state,caseData.id,"report"),null);
 assert.equal(C.summary(state).completed,1);
});
test("Las tres resoluciones admitidas otorgan efectos distintos",()=>{
 const modes=["report","archive","witnesses"];
 const effects=[];
 for(let i=0;i<modes.length;i++){
  const state=game(),def=C.definitions[i];
  for(const id of def.steps)C.attempt(state,K.byId[id],true);
  effects.push(C.resolve(state,def.id,modes[i]));
 }
 assert.equal(effects[0].standing,2);
 assert.equal(effects[1].exposure,-4);
 assert.equal(effects[2].standing,1);
});
test("Partidas anteriores conservan las pistas en orden",()=>{
 const state=game(),def=C.definitions[1];
 state.localClues=[def.steps[0],def.steps[1],def.steps[3]];
 C.init(state);
 assert.equal(C.progress(state,def.id).count,2);
 assert.equal(C.progress(state,def.id).ready,false);
});
test("Partida serializada retiene el cierre y no repite recompensa",()=>{
 const state=game(),def=C.definitions[2];
 for(const id of def.steps)C.attempt(state,K.byId[id],true);
 C.resolve(state,def.id,"report");
 const restored=JSON.parse(JSON.stringify(state));
 C.init(restored);
 assert.equal(C.progress(restored,def.id).complete,true);
 assert.equal(C.resolve(restored,def.id,"report"),null);
 assert.equal(restored.localCases[def.id].evidence.length,4);
});
console.log("Siete escenarios de prueba completados.");
