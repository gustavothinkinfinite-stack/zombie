"use strict";
/* XXVII-C: la tregua tras una confrontación se aplica a todos los barrios. */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),window={};
for(const file of ["vtm-physics.js","vtm-hunters.js","vtm-save.js"])
 vm.runInNewContext(fs.readFileSync(path.join(root,file),"utf8"),{window},{filename:file});
const H=window.VTM_HUNTERS,P=window.VTM_PHYSICS,S=window.VTM_SAVE;
const game={
 version:1,character:{name:"Investigadora",clan:"Toreador"},embraced:false,
 scene:"district",district:"bastilla",clock:{night:6,minutes:1200},x:240,y:225,
 cityLife:{surveillanceEpisodes:[{night:5,district:"bastilla",choice:"observe",outcome:"noticed"}]},
 cityConsequences:{heat:{bastilla:2,passy:4}},stealthChase:{patrols:{}},
 elizabeth:{evidence:["Parker"]},localCases:{closed:["uno"]},
 principado:{chapter:1},conspiracy:{chapter:2},
 parkerDossier:{clues:["EP-03"]},parkerPolitics:{protection:"active"}
};
const protectedState=g=>JSON.stringify({
 elizabeth:g.elizabeth,localCases:g.localCases,principado:g.principado,
 conspiracy:g.conspiracy,parkerDossier:g.parkerDossier,
 parkerPolitics:g.parkerPolitics,cityConsequences:g.cityConsequences,
 stealthChase:g.stealthChase
});
const before=protectedState(game);
const follower=H.ensure(game,P);
assert.ok(follower,"episodio legítimo inicial");
follower.mode="tail";follower.x=260;follower.y=225;
assert.equal(H.canConfront(game,P),true);
const id=follower.source;
assert.equal(H.decide(game,P,"withdraw").length,1);
assert.equal(game.hunters.resolved[id],"withdrew");
assert.equal(game.hunters.cooldownUntilNight,7);
assert.equal(H.ensure(game,P),null,"no reaparición inmediata");
game.clock.night=7;game.district="passy";
game.cityLife.surveillanceEpisodes.push({night:6,district:"passy",choice:"observe",outcome:"noticed"});
assert.equal(H.source(game),null,"la tregua cubre otros barrios");
assert.equal(H.ensure(game,P),null,"no hay seguidor en otro barrio durante la tregua");
assert.equal(H.position(game),null);
assert.equal(H.canConfront(game,P),false);
assert.equal(protectedState(game),before,"no modifica policía ni expedientes");
const key="cronicas-paris-ghoul-v1",clans={Toreador:{}},db=new Map();
const storage={getItem:k=>db.has(k)?db.get(k):null,setItem:(k,v)=>db.set(k,String(v))};
assert.equal(S.save(storage,key,game,clans),true);
const newer=JSON.parse(JSON.stringify(game));newer.clock.minutes++;
assert.equal(S.save(storage,key,newer,clans),true);
db.set(key,"{principal dañado");
const recovered=S.load(storage,key,clans);
assert.ok(recovered?.fromBackup,"recuperación desde respaldo");
const restored=recovered.game;
assert.equal(restored.hunters.cooldownUntilNight,7);
assert.equal(restored.hunters.resolved[id],"withdrew");
assert.equal(H.source(restored),null,"tregua intacta después de recuperar");
assert.equal(H.ensure(restored,P),null);
assert.equal(protectedState(restored),before);
restored.clock.night=8;
restored.cityLife.surveillanceEpisodes.push({night:7,district:"passy",choice:"observe",outcome:"noticed"});
assert.ok(H.source(restored),"un episodio válido vuelve a estar disponible tras la tregua");
assert.equal(restored.combat,undefined,"sin combate ni recompensas automáticas");
assert.equal(protectedState(restored),before);
console.log("OK: XXVII-C — tregua entre barrios y respaldo sin alterar expedientes");
