"use strict";
/* XXVII-C: la defensa civil voluntaria se recupera sin repetir daños ni expedientes. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,".."),window={};
for(const file of ["vtm-physics.js","vtm-hunters.js","vtm-save.js"])
 vm.runInNewContext(fs.readFileSync(path.join(root,file),"utf8"),{window},{filename:file});
const H=window.VTM_HUNTERS,P=window.VTM_PHYSICS,SAVE=window.VTM_SAVE;
const make=()=>({
 version:1,character:{name:"Ghoul",clan:"Toreador"},embraced:false,
 scene:"district",district:"bastilla",clock:{night:6,minutes:1220},x:240,y:225,
 cityLife:{surveillanceEpisodes:[{night:5,district:"bastilla",choice:"observe",outcome:"noticed"}]},
 mechanics:{health:3,damage:{contundente:1,letal:0,agravado:0}},
 elizabeth:{evidence:["Parker"]},localCases:{closed:["local"]},
 principado:{chapter:1},conspiracy:{chapter:2},
 parkerDossier:{clues:["EP-03"]},parkerPolitics:{protection:"active"},
 stealthChase:{patrols:{}},cityConsequences:{heat:{bastilla:0}}
});
const preserve=g=>JSON.stringify({
 elizabeth:g.elizabeth,localCases:g.localCases,principado:g.principado,
 conspiracy:g.conspiracy,parkerDossier:g.parkerDossier,
 parkerPolitics:g.parkerPolitics,stealthChase:g.stealthChase,
 cityConsequences:g.cityConsequences
});
const key="cronicas-paris-ghoul-v1",clans={Toreador:{}};
for(const [success,status] of [[true,"broke_free"],[false,"shaken"]]){
 const game=make(),follower=H.ensure(game,P);
 assert.ok(follower);
 follower.mode="tail";follower.x=260;follower.y=225;
 assert.equal(H.canConfront(game,P),true);
 const id=follower.source,prior=preserve(game);
 const events=H.decide(game,P,"defend",success);
 assert.equal(events.length,1);
 assert.equal(game.hunters.resolved[id],status);
 assert.equal(game.hunters.cooldownUntilNight,7);
 assert.equal(game.hunters.follower,null);
 assert.equal(game.combat,undefined,"no se inicia combate ni se entregan PX");
 assert.equal(preserve(game),prior,"no se tocan los expedientes");
 assert.doesNotMatch(events[0].text,/Senescal|Etienne|Moreau|identidad confirmada/i);
 const mem=new Map(),storage={
  getItem:k=>mem.has(k)?mem.get(k):null,
  setItem:(k,v)=>mem.set(k,String(v))
 };
 assert.equal(SAVE.save(storage,key,game,clans),true);
 const newer=JSON.parse(JSON.stringify(game));newer.clock.minutes++;
 assert.equal(SAVE.save(storage,key,newer,clans),true);
 mem.set(key,"{principal corrupto");
 const loaded=SAVE.load(storage,key,clans);
 assert.ok(loaded?.fromBackup,"debe recuperar el respaldo válido");
 const restored=loaded.game;
 assert.equal(restored.hunters.resolved[id],status);
 assert.equal(restored.hunters.cooldownUntilNight,7);
 assert.equal(restored.mechanics.health,3);
 assert.equal(restored.mechanics.damage.contundente,1);
 assert.equal(preserve(restored),prior);
 assert.equal(H.decide(restored,P,"defend",success).length,0,"sin doble resolución");
 assert.equal(H.ensure(restored,P),null,"sin seguidor duplicado");
 restored.clock.night=7;
 restored.cityLife.surveillanceEpisodes.push({night:6,district:"bastilla",choice:"observe",outcome:"noticed"});
 assert.equal(H.ensure(restored,P),null,"descanso conservado tras recuperar");
 restored.clock.night=8;
 restored.cityLife.surveillanceEpisodes.push({night:7,district:"bastilla",choice:"observe",outcome:"noticed"});
 assert.ok(H.ensure(restored,P),"vigilancia legítima disponible después del descanso");
 assert.equal(preserve(restored),prior);
}
const vulnerable=make(),f=H.ensure(vulnerable,P);
assert.ok(f);f.mode="tail";f.x=260;f.y=225;
vulnerable.mechanics.health=1;
const before=JSON.stringify(vulnerable);
assert.equal(H.decide(vulnerable,P,"defend",false).length,0,"sin forcejeo incapacitante");
assert.equal(JSON.stringify(vulnerable),before,"el rechazo no altera la partida");
assert.equal(H.decide(vulnerable,P,"withdraw").length,1,"la retirada pacífica sigue disponible");
assert.equal(vulnerable.combat,undefined);
console.log("OK: XXVII-C — defensa recuperable, sin doble resolución ni bloqueo del ghoul");
