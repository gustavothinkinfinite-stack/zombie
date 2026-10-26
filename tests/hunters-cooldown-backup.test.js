"use strict";
/* XXVII-C: el descanso tras una confrontación sobrevive al respaldo recuperable. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,".."),window={};
for(const file of ["vtm-physics.js","vtm-hunters.js","vtm-save.js"])
 vm.runInNewContext(fs.readFileSync(path.join(root,file),"utf8"),{window},{filename:file});
const H=window.VTM_HUNTERS,P=window.VTM_PHYSICS,SAVE=window.VTM_SAVE;
const game={
 version:1,character:{name:"Ghoul",clan:"Toreador"},embraced:false,
 scene:"district",district:"bastilla",clock:{night:6,minutes:1220},x:240,y:225,
 cityLife:{surveillanceEpisodes:[{night:5,district:"bastilla",choice:"observe",outcome:"noticed"}]},
 elizabeth:{evidence:["Parker"]},localCases:{closed:["local"]},
 principado:{chapter:1},conspiracy:{chapter:2},
 parkerDossier:{clues:["EP-03"]},parkerPolitics:{protection:"active"},
 stealthChase:{patrols:{}},cityConsequences:{heat:{bastilla:0}}
};
const follower=H.ensure(game,P);
assert.ok(follower,"la vigilancia previa habilita un observador");
follower.mode="tail";follower.x=260;follower.y=225;
assert.equal(H.canConfront(game,P),true);
const episode=follower.source;
assert.equal(H.decide(game,P,"withdraw").length,1);
assert.equal(game.hunters.resolved[episode],"withdrew");
assert.equal(game.hunters.cooldownUntilNight,7);
const protectedState=JSON.stringify({
 elizabeth:game.elizabeth,localCases:game.localCases,principado:game.principado,
 conspiracy:game.conspiracy,parkerDossier:game.parkerDossier,
 parkerPolitics:game.parkerPolitics,stealthChase:game.stealthChase,
 cityConsequences:game.cityConsequences
});
const data=new Map();
const storage={
 getItem:key=>data.has(key)?data.get(key):null,
 setItem:(key,value)=>{data.set(key,String(value));}
};
const key="cronicas-paris-ghoul-v1",clans={Toreador:{}};
assert.equal(SAVE.save(storage,key,game,clans),true);
const newer=JSON.parse(JSON.stringify(game));
newer.clock.minutes++;
assert.equal(SAVE.save(storage,key,newer,clans),true);
assert.ok(SAVE.parse(data.get(SAVE.backupKey(key)),clans),"el respaldo debe ser válido");
data.set(key,"{principal ilegible");
const loaded=SAVE.load(storage,key,clans);
assert.ok(loaded&&loaded.fromBackup,"se recupera el respaldo, no el principal corrupto");
const restored=loaded.game;
assert.equal(restored.hunters.resolved[episode],"withdrew");
assert.equal(restored.hunters.cooldownUntilNight,7);
assert.equal(restored.hunters.follower,null);
assert.equal(JSON.stringify({
 elizabeth:restored.elizabeth,localCases:restored.localCases,principado:restored.principado,
 conspiracy:restored.conspiracy,parkerDossier:restored.parkerDossier,
 parkerPolitics:restored.parkerPolitics,stealthChase:restored.stealthChase,
 cityConsequences:restored.cityConsequences
}),protectedState,"los expedientes y sistemas anteriores permanecen intactos");
restored.clock.night=7;
restored.cityLife.surveillanceEpisodes.push({
 night:6,district:"bastilla",choice:"observe",outcome:"noticed"
});
assert.equal(H.source(restored),null,"la noche de descanso continúa tras recuperar el respaldo");
assert.equal(H.ensure(restored,P),null,"no reaparece el seguidor durante el descanso");
assert.equal(restored.combat,undefined,"no se fuerza combate");
restored.clock.night=8;
restored.cityLife.surveillanceEpisodes.push({
 night:7,district:"bastilla",choice:"observe",outcome:"noticed"
});
assert.ok(H.ensure(restored,P),"un episodio posterior legítimo vuelve a estar disponible");
assert.equal(restored.cityConsequences.heat.bastilla,0,"no se altera la vigilancia policial");
const legacy={version:1,character:{clan:"Toreador"},scene:"district",district:"bastilla",clock:{night:6}};
const before=JSON.stringify(legacy);
assert.equal(H.canConfront(legacy,P),false);
assert.equal(H.source(legacy),null);
assert.equal(JSON.stringify(legacy),before,"una partida antigua sin seguimiento no se altera");
console.log("OK: XXVII-C — respiro recuperado desde respaldo y expedientes conservados");
