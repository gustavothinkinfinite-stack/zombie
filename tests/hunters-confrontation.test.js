"use strict";
/* XXVII-C inicial: diálogo o retirada voluntaria ante un observador civil. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),window={};
for(const file of ["vtm-physics.js","vtm-hunters.js","vtm-save.js"])
 vm.runInNewContext(fs.readFileSync(path.join(root,file),"utf8"),{window},{filename:file});
const H=window.VTM_HUNTERS,P=window.VTM_PHYSICS,SAVE=window.VTM_SAVE;
const make=()=>({version:1,character:{name:"Ghoul",clan:"Toreador"},embraced:false,
 scene:"district",district:"bastilla",clock:{night:6,minutes:1220},x:240,y:225,
 cityLife:{surveillanceEpisodes:[{night:5,district:"bastilla",choice:"observe",outcome:"noticed"}]},
 elizabeth:{evidence:["intacta"]},localCases:{closed:["uno"]},principado:{chapter:1},
 conspiracy:{chapter:2},parkerDossier:{clues:["EP-03"]},parkerPolitics:{protection:"active"},
 stealthChase:{patrols:{}},cityConsequences:{heat:{bastilla:0}},vitae:{blood:2}});
const old={version:1,character:{clan:"Toreador"},elizabeth:{case:"sin cambios"}};
const oldSnapshot=JSON.stringify(old);
assert.equal(H.canConfront(old,P),false);
assert.equal(H.decide(old,P,"withdraw").length,0);
assert.equal(JSON.stringify(old),oldSnapshot,"una partida antigua no se altera");
const prepare=()=>{const g=make(),p=H.ensure(g,P);assert.ok(p);
 p.mode="tail";p.x=260;p.y=225;return g;};
const outOfRange=prepare();outOfRange.x=50;outOfRange.y=225;
assert.equal(H.canConfront(outOfRange,P),false);
assert.equal(H.decide(outOfRange,P,"withdraw").length,0);
const blocked=prepare(),wall={canStand:(_scene,x)=>x<248||x>252};
assert.equal(H.canConfront(blocked,wall),false);
assert.equal(H.decide(blocked,wall,"dialogue",true).length,0);
const fighting=prepare();fighting.combat={active:{round:1}};
assert.equal(H.canConfront(fighting,P),false);
assert.equal(H.decide(fighting,P,"withdraw").length,0);
for(const [choice,success,status] of [["withdraw",false,"withdrew"],["dialogue",true,"spoken"],["dialogue",false,"refused"]]){
 const g=prepare(),id=g.hunters.follower.source;
 assert.equal(H.canConfront(g,P),true);
 assert.equal(H.decide(g,P,"invalid",true).length,0);
 const before=JSON.stringify({elizabeth:g.elizabeth,localCases:g.localCases,principado:g.principado,
  conspiracy:g.conspiracy,parkerDossier:g.parkerDossier,parkerPolitics:g.parkerPolitics,
  stealthChase:g.stealthChase,cityConsequences:g.cityConsequences,vitae:g.vitae});
 const events=H.decide(g,P,choice,success);
 assert.equal(events.length,1);
 assert.doesNotMatch(events[0].text,/Senescal|Etienne|Moreau|cazadores identificados/i);
 assert.equal(g.hunters.resolved[id],status);
 assert.equal(g.hunters.follower,null);
 assert.equal(H.canConfront(g,P),false);
 assert.equal(H.decide(g,P,choice,success).length,0,"no repite desenlaces");
 assert.equal(H.ensure(g,P),null,"no reaparece al volver a entrar");
 assert.equal(JSON.stringify({elizabeth:g.elizabeth,localCases:g.localCases,principado:g.principado,
  conspiracy:g.conspiracy,parkerDossier:g.parkerDossier,parkerPolitics:g.parkerPolitics,
  stealthChase:g.stealthChase,cityConsequences:g.cityConsequences,vitae:g.vitae}),before);
 assert.equal(g.combat,undefined,"no fuerza combate ni recompensas");
 const mem=new Map(),storage={getItem:k=>mem.get(k)||null,setItem:(k,v)=>mem.set(k,String(v))};
 const key="cronicas-paris-ghoul-v1",clans={Toreador:{}};
 assert.equal(SAVE.save(storage,key,g,clans),true);
 const next=JSON.parse(JSON.stringify(g));next.clock.minutes++;
 assert.equal(SAVE.save(storage,key,next,clans),true);
 mem.set(key,"{corrupto");
 const restored=SAVE.load(storage,key,clans);
 assert.ok(restored?.fromBackup);
 assert.equal(restored.game.hunters.resolved[id],status);
 assert.equal(H.ensure(restored.game,P),null);
 assert.equal(JSON.stringify(restored.game.elizabeth),JSON.stringify(g.elizabeth));
 assert.equal(JSON.stringify(restored.game.localCases),JSON.stringify(g.localCases));
}
// Una resolución recuperada puede coexistir transitoriamente con un seguidor residual.
// No debe dibujarse ni permitir una segunda confrontación antes de normalizar.
const residual=prepare(),resolvedId=residual.hunters.follower.source;
residual.hunters.resolved[resolvedId]="spoken";
const historyBefore=JSON.stringify(residual.hunters.history);
assert.equal(H.position(residual),null,"un observador ya resuelto no debe aparecer en el mapa");
assert.equal(H.canConfront(residual,P),false,"no se puede volver a confrontar");
assert.equal(H.decide(residual,P,"dialogue",true).length,0);
assert.equal(residual.hunters.resolved[resolvedId],"spoken");
assert.equal(JSON.stringify(residual.hunters.history),historyBefore);
H.init(residual);
assert.equal(residual.hunters.follower,null,"normalizar descarta el seguidor residual");
const damaged=prepare();damaged.hunters.follower.source="0:bastilla";
assert.equal(H.position(damaged),null,"un origen inválido no debe renderizarse");
assert.equal(H.canConfront(damaged,P),false);
assert.equal(H.decide(damaged,P,"withdraw").length,0);

// Un forcejeo voluntario permite escapar sin iniciar el combate tradicional.
// Si falla, el motor aplica absorción y como máximo una herida contundente.
for(const [success,status] of [[true,"broke_free"],[false,"shaken"]]){
 const g=prepare(),id=g.hunters.follower.source;
 g.mechanics={health:5,damage:{contundente:0,letal:0,agravado:0},guard:0};
 const before=JSON.stringify({elizabeth:g.elizabeth,localCases:g.localCases,
  principado:g.principado,conspiracy:g.conspiracy,parkerDossier:g.parkerDossier,
  parkerPolitics:g.parkerPolitics,stealthChase:g.stealthChase,cityConsequences:g.cityConsequences});
 const result=H.decide(g,P,"defend",success);
 assert.equal(result.length,1);
 assert.equal(g.hunters.resolved[id],status);
 assert.equal(H.decide(g,P,"defend",success).length,0,"no duplicar ni farmear el enfrentamiento");
 assert.equal(H.ensure(g,P),null);
 assert.equal(g.combat,undefined,"sin enemigo fijo ni PX");
 assert.doesNotMatch(result[0].text,/Etienne|Moreau|impostora|cazadores identificados/i);
 assert.equal(JSON.stringify({elizabeth:g.elizabeth,localCases:g.localCases,
  principado:g.principado,conspiracy:g.conspiracy,parkerDossier:g.parkerDossier,
  parkerPolitics:g.parkerPolitics,stealthChase:g.stealthChase,cityConsequences:g.cityConsequences}),before);
 const copy=JSON.parse(JSON.stringify(g));
 assert.equal(H.decide(copy,P,"defend",success).length,0);
 assert.equal(copy.hunters.resolved[id],status);
}
const injured=prepare();injured.mechanics={health:1};
const injuredBefore=JSON.stringify(injured);
assert.equal(H.decide(injured,P,"defend",false).length,0,"No forzar lesión incapacitante");
assert.equal(JSON.stringify(injured),injuredBefore,"Sin cambios con Salud insuficiente");
const engineText=fs.readFileSync(path.join(root,"vtm-game.js"),"utf8");
assert.ok(engineText.includes('dicePool("Fuerza","Pelea",7)'));
assert.ok(engineText.includes('HUNTERS.decide(game,P,"defend",roll.success)'));
assert.ok(engineText.includes('TACT.soak(game,"contundente",1)'));
assert.ok(engineText.includes('TACT.deal(game,absorbed.damage,"contundente")'));
assert.ok(engineText.includes('exposure(roll.success?6:8,'));
assert.ok(!engineText.includes('TACT.start(game,"hunters")'));
// Un veterano recuperado no modifica el formato de su partida.
const caseCopy=prepare();caseCopy.mechanics={health:4,damage:{contundente:0,letal:0,agravado:0}};
assert.equal(H.decide(caseCopy,P,"defend",true).length,1);
const memDef=new Map(),stDef={getItem:k=>memDef.get(k)||null,setItem:(k,v)=>memDef.set(k,String(v))};
assert.equal(SAVE.save(stDef,"cronicas-paris-ghoul-v1",caseCopy,{Toreador:{}}),true);
const restoredDef=SAVE.load(stDef,"cronicas-paris-ghoul-v1",{Toreador:{}});
assert.equal(restoredDef.game.hunters.resolved["5:bastilla"],"broke_free");
assert.equal(H.decide(restoredDef.game,P,"defend",true).length,0);

// Una retirada o conversación da una noche sin nuevo seguimiento automático.
const cooled=prepare(),cooledId=cooled.hunters.follower.source;
assert.equal(H.decide(cooled,P,"withdraw").length,1);
assert.equal(cooled.hunters.cooldownUntilNight,7);
cooled.clock.night=7;
cooled.cityLife.surveillanceEpisodes.push({night:6,district:"bastilla",choice:"observe",outcome:"noticed"});
assert.equal(H.source(cooled),null,"la noche siguiente sigue protegida");
assert.equal(H.ensure(cooled,P),null,"no aparece un nuevo observador durante el respiro");
const cooledRestored=JSON.parse(JSON.stringify(cooled));
assert.equal(H.ensure(cooledRestored,P),null,"el respiro sobrevive al guardado");
assert.equal(cooledRestored.hunters.resolved[cooledId],"withdrew");
cooledRestored.clock.night=8;
cooledRestored.cityLife.surveillanceEpisodes.push({night:7,district:"bastilla",choice:"observe",outcome:"noticed"});
assert.ok(H.ensure(cooledRestored,P),"un nuevo episodio válido puede surgir después del respiro");
assert.equal(cooledRestored.cityConsequences.heat.bastilla,0);
assert.equal(cooledRestored.elizabeth.evidence[0],"intacta");
assert.equal(cooledRestored.localCases.closed[0],"uno");

const engine=fs.readFileSync(path.join(root,"vtm-game.js"),"utf8");
assert.ok(engine.includes("if(civilFollowerMenu())return;"));
assert.ok(engine.includes("HUNTERS.decide(game,P,"));
assert.ok(engine.includes("HUNTERS?.canConfront(game,P)"));
console.log("OK: XXVII-C inicial — diálogo/retirada voluntarios, sin secretos ni pérdida de partidas");
