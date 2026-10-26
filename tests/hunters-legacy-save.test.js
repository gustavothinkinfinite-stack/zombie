"use strict";
/* Regresión XXVII-B: partidas de fases anteriores sin estado de observadores. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const window={};
for(const file of ["vtm-physics.js","vtm-hunters.js","vtm-save.js"])
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,"..",file),"utf8"),{window},{filename:file});
const H=window.VTM_HUNTERS,P=window.VTM_PHYSICS,S=window.VTM_SAVE;
const key="cronicas-paris-ghoul-v1",clans={Toreador:{}};
const oldGame=()=>({
 version:1,character:{name:"Investigadora",clan:"Toreador"},
 scene:"district",district:"bastilla",clock:{night:6,minutes:1220},x:235,y:225,
 elizabeth:{evidence:["garaje"]},localCases:{archivo:{complete:true}},
 principado:{submitted:true},conspiracy:{chapter:2},
 parkerDossier:{collected:["EP-03"]},parkerPolitics:{protection:"shelter"},
 vitae:{tension:2}
});
const storage=()=>{
 const db=new Map();
 return {db,getItem:k=>db.has(k)?db.get(k):null,setItem:(k,v)=>db.set(k,String(v))};
};
const original=oldGame(),snapshot=JSON.stringify(original),mem=storage();
assert.equal(S.save(mem,key,original,clans),true);
const advanced=JSON.parse(snapshot);advanced.clock.night=7;
assert.equal(S.save(mem,key,advanced,clans),true);
mem.db.set(key,"{partida dañada");
const recovered=S.load(mem,key,clans);
assert.ok(recovered&&recovered.fromBackup,"debe ofrecer el respaldo anterior");
assert.equal(JSON.stringify(recovered.game),snapshot,"el respaldo antiguo conserva todos los expedientes");
assert.equal(H.step(recovered.game,.06,P).length,0,"sin indicios no aparece un observador");
assert.equal(recovered.game.hunters,undefined,"no se añade estado innecesario a la partida antigua");
assert.equal(JSON.stringify(original),snapshot,"el guardado no muta el original");
console.log("OK: recuperación de partida anterior sin vigilancia, con expedientes intactos");

const observed=oldGame();
observed.cityLife={surveillanceEpisodes:[
 {night:5,district:"bastilla",choice:"observe",outcome:"noticed"}
]};
const casesBefore=JSON.stringify({
 elizabeth:observed.elizabeth,localCases:observed.localCases,
 principado:observed.principado,conspiracy:observed.conspiracy,
 parkerDossier:observed.parkerDossier,parkerPolitics:observed.parkerPolitics,vitae:observed.vitae
});
assert.equal(observed.hunters,undefined,"la partida anterior no tenía el módulo");
const follower=H.ensure(observed,P);
assert.ok(follower,"el episodio válido debe poder iniciar seguimiento");
assert.equal(follower.source,"5:bastilla");
assert.equal(follower.night,6);
assert.equal(JSON.stringify({
 elizabeth:observed.elizabeth,localCases:observed.localCases,
 principado:observed.principado,conspiracy:observed.conspiracy,
 parkerDossier:observed.parkerDossier,parkerPolitics:observed.parkerPolitics,vitae:observed.vitae
}),casesBefore,"iniciar el seguimiento no modifica otros sistemas");

const mem2=storage();
assert.equal(S.save(mem2,key,observed,clans),true);
const next=JSON.parse(JSON.stringify(observed));next.clock.minutes++;
assert.equal(S.save(mem2,key,next,clans),true);
mem2.db.set(key,"{corrupto");
const fallback=S.load(mem2,key,clans);
assert.ok(fallback&&fallback.fromBackup);
const history=JSON.stringify(fallback.game.hunters.history);
assert.equal(H.ensure(fallback.game,P).source,"5:bastilla");
assert.equal(JSON.stringify(fallback.game.hunters.history),history,
 "recuperar no debe duplicar el inicio del seguimiento");
assert.equal(fallback.game.conspiracy.chapter,2);
assert.equal(fallback.game.elizabeth.evidence[0],"garaje");
assert.equal(fallback.game.localCases.archivo.complete,true);
assert.equal(fallback.game.parkerDossier.collected[0],"EP-03");
assert.equal(fallback.game.parkerPolitics.protection,"shelter");
assert.equal(fallback.game.vitae.tension,2);
console.log("OK: migración opcional XXVII-B y recuperación idempotente sin perder investigaciones");
