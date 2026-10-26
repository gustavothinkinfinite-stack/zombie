"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),window={};
for(const file of ["vtm-equipment.js","vtm-advanced-tactics.js","vtm-tactics.js","vtm-physics.js","vtm-hunters.js","vtm-save.js"])
 vm.runInNewContext(fs.readFileSync(path.join(root,file),"utf8"),{window},{filename:file});
const H=window.VTM_HUNTERS,T=window.VTM_TACTICS,P=window.VTM_PHYSICS,S=window.VTM_SAVE,E=window.VTM_EQUIPMENT;
function make(){
 const g={version:1,character:{name:"Ghoul",clan:"Toreador",attr:{Destreza:4,Astucia:3,Fuerza:3,Resistencia:3},skills:{Pelea:3,Atletismo:3,Esquivar:2,"Armas de Fuego":2},disciplines:{}},
  embraced:false,scene:"district",district:"bastilla",clock:{night:6,minutes:1230},x:240,y:225,exposure:85,
  mechanics:{health:7,damage:{contundente:0,letal:0,agravado:0}},combat:{},
  cityLife:{surveillanceEpisodes:[{night:5,district:"bastilla",choice:"observe",outcome:"noticed",summary:"Observación ambigua"}]},
  elizabeth:{hunters:true,evidence:["original"]},localCases:{closed:["otro"]},principado:{chapter:1},conspiracy:{secret:"oculto"},
  parkerDossier:{clues:["EP-03"]},parkerPolitics:{protection:"active"},stealthChase:{patrols:{}},cityConsequences:{heat:{bastilla:14}},
  equipment:{owned:["pistola"],equipped:"pistola",magazine:6,ammo:6}};
 const follower=H.ensure(g,P);assert.ok(follower);
 follower.mode="tail";follower.x=260;follower.y=225;follower.alert=60;
 return g;
}
const check=(label,fn)=>{fn();console.log("OK:",label);};
check("Ningún combate sin antecedentes, hostilidad y Salud suficiente",()=>{
 for(const mutate of [g=>g.elizabeth.hunters=false,g=>g.exposure=20,g=>g.hunters.follower.alert=10,g=>g.hunters.follower.mode="watch",g=>g.mechanics.health=1]){
  const g=make();mutate(g);assert.equal(H.canFight(g,P),false);assert.ok(T.startStreet(g).error);
 }
 const old={version:1,character:{clan:"Toreador"}};assert.ok(T.startStreet(old).error);
});
check("Combate identificado por episodio sin alterar misiones ni rivales fijos",()=>{
 const g=make(),before=JSON.stringify([g.elizabeth,g.localCases,g.parkerDossier,g.parkerPolitics,g.conspiracy]);
 const name=T.ENEMIES.bastilla.name,r=T.startStreet(g);
 assert.equal(r.started,true);assert.equal(r.place,"street-vigilante:5:bastilla");
 assert.equal(g.combat.active.enemy.name,"Vigilante hostil sin identificar");
 assert.equal(T.ENEMIES.bastilla.name,name);assert.ok(T.startStreet(g).error);
 assert.equal(JSON.stringify([g.elizabeth,g.localCases,g.parkerDossier,g.parkerPolitics,g.conspiracy]),before);
});
check("La huida táctica resuelve una vez y no otorga experiencia",()=>{
 const g=make(),r=T.startStreet(g),action=T.action(g,"huida",()=>.95);
 assert.equal(action.ended,true);assert.equal(action.place,r.place);
 assert.equal(g.combat.records[r.place],"escaped");
 assert.equal(H.finishFight(g,r.place).length,1);
 assert.equal(H.finishFight(g,r.place).length,0);
 assert.equal(g.hunters.resolved["5:bastilla"],"fight_escaped");
 assert.equal(g.hunters.cooldownUntilNight,7);
 assert.equal(g.combat.active,null);
 assert.equal(g.combat.rewards,undefined);
 assert.equal(H.ensure(g,P),null);assert.ok(T.startStreet(g).error);
});
check("Disparar consume munición sin cerrar expedientes ni conceder PX",()=>{
 const g=make();T.startStreet(g);const old=E.init(g).magazine;
 const out=T.action(g,"disparo",()=>.7);
 assert.equal(out.error,undefined);assert.equal(E.init(g).magazine,old-1);
 assert.equal(g.parkerDossier.clues[0],"EP-03");assert.equal(g.combat.rewards,undefined);
});
check("El respaldo recupera un combate activo sin alterar casos",()=>{
 const g=make();T.startStreet(g);
 const map=new Map(),store={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,String(v))};
 const key="cronicas-paris-ghoul-v1",clans={Toreador:{}};
 assert.equal(S.save(store,key,g,clans),true);
 const later=JSON.parse(JSON.stringify(g));later.clock.minutes++;
 assert.equal(S.save(store,key,later,clans),true);map.set(key,"{dañado");
 const restored=S.load(store,key,clans);
 assert.equal(restored.fromBackup,true);
 assert.equal(restored.game.combat.active.place,"street-vigilante:5:bastilla");
 assert.equal(restored.game.equipment.magazine,6);
 assert.equal(JSON.stringify(restored.game.elizabeth),JSON.stringify(g.elizabeth));
 assert.equal(JSON.stringify(restored.game.conspiracy),JSON.stringify(g.conspiracy));
});
check("La derrota permite recuperación y no reinicia el mismo episodio",()=>{
 const g=make(),r=T.startStreet(g);
 g.combat.active=null;g.combat.records[r.place]="lost";
 assert.equal(H.finishFight(g,r.place).length,1);
 g.mechanics.health=0;
 assert.equal(T.recover(g,2,"contundente"),2);
 assert.equal(g.mechanics.health,2);
 assert.equal(H.finishFight(g,r.place).length,0);assert.equal(H.ensure(g,P),null);
});
const ui=fs.readFileSync(path.join(root,"vtm-tactics-ui.js"),"utf8");
const engine=fs.readFileSync(path.join(root,"vtm-game.js"),"utf8");
assert.ok(engine.includes("TACTUI.streetEntry()"));
for(const anchor of ["E.startStreet(game)","S.moralTest(game,1)","!street","E.recover(game,2"])assert.ok(ui.includes(anchor),anchor);
console.log("OK: XXVII-C — combate contextual y persistente, sin cazadores revelados");
