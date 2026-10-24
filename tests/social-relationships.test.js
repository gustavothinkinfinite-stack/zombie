"use strict";
/* Ejecutar desde la raíz del repositorio: node tests/social-relationships.test.js */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const window={};
for(const name of ["vtm-shops.js","vtm-contacts.js"]){
 const source=fs.readFileSync(path.join(root,name),"utf8");
 vm.runInNewContext(source,{window},{filename:name});
}
const K=window.VTM_SHOPS,H=window.VTM_CONTACTS;
const shop=K.byId["passy-anticuario"],next=K.byId["passy-conserjeria"];
const fixture=()=>({
 clock:{night:1,minutes:1215},localPlaces:{},localClues:[],
 exposure:10,contactMemory:{},contactLeads:[],contactIntroductions:{}
});
function test(label,fn){fn();process.stdout.write("OK "+label+"\n");}
test("Migración de partidas IX sin reclamar dos veces",()=>{
 const state=fixture();state.localPlaces[shop.id]={decision:"help"};
 H.init(state);
 assert.equal(H.followup(state,shop),null);
 assert.equal(H.summary(state).settled,1);
 assert.equal(state.contactMemory[shop.id].claimed,"legacy");
});
test("Una ayuda se habilita la siguiente noche una sola vez",()=>{
 const state=fixture();state.localPlaces[shop.id]={decision:"help"};
 H.remember(state,shop,"help",true);
 assert.equal(H.followup(state,shop),null);
 state.clock.night=2;
 assert.equal(H.tick(state).length,1);
 assert.equal(H.tick(state).length,0);
 assert.ok(H.followup(state,shop));
 const granted=H.resolve(state,shop,"introduction");
 assert.equal(granted.lead,next.id);
 assert.equal(H.resolve(state,shop,"introduction"),null);
 assert.equal(H.followup(state,shop),null);
});
test("Los rumores no se duplican durante la misma noche",()=>{
 const state=fixture();H.remember(state,shop,"inquire",true);
 assert.equal(H.nightNews(state,shop),null);
 state.clock.night=2;
 const message=H.hearNews(state,shop);
 assert.ok(message?.length>20);
 assert.equal(H.hearNews(state,shop),null);
 assert.equal(H.summary(state).rumors,1);
 state.clock.night=3;
 assert.ok(H.hearNews(state,shop));
 assert.equal(H.summary(state).rumors,2);
});
test("La presión provoca una sola consecuencia diferida",()=>{
 const state=fixture();state.localPlaces[shop.id]={decision:"pressure"};
 H.remember(state,shop,"pressure",true);
 state.clock.night=2;
 assert.equal(H.tick(state).length,1);
 assert.equal(state.exposure,14);
 H.tick(state);
 state.clock.night=3;H.tick(state);
 assert.equal(state.exposure,14);
});
test("Los vecinos influyen en la dificultad de investigación",()=>{
 const state=fixture();
 assert.equal(H.inquiryDifficulty(state,next),7);
 state.localPlaces[shop.id]={decision:"help"};
 assert.equal(H.inquiryDifficulty(state,next),6);
 state.localPlaces[shop.id].decision="pressure";
 assert.equal(H.inquiryDifficulty(state,next),8);
 state.contactIntroductions[next.id]=shop.id;
 assert.equal(H.inquiryDifficulty(state,next),7);
 state.contactLeads.push(shop.id+"->"+next.id);
 assert.equal(H.inquiryDifficulty(state,next),6);
 assert.match(H.districtContext(state,next).label,/intimidaste/);
});
test("La memoria se recupera después de serializar la partida",()=>{
 const state=fixture();H.remember(state,shop,"help",true);
 const restored=JSON.parse(JSON.stringify(state));
 H.init(restored);
 assert.equal(restored.contactMemory[shop.id].choice,"help");
 assert.equal(restored.contactMemory[shop.id].followup,"pending");
 restored.clock.night=2;H.tick(restored);
 assert.equal(restored.contactMemory[shop.id].followup,"ready");
});
process.stdout.write("Todas las pruebas sociales superadas.\n");