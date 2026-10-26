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
const engine=fs.readFileSync(path.join(root,"vtm-game.js"),"utf8");
assert.ok(engine.includes("if(civilFollowerMenu())return;"));
assert.ok(engine.includes("HUNTERS.decide(game,P,"));
assert.ok(engine.includes("HUNTERS?.canConfront(game,P)"));
console.log("OK: XXVII-C inicial — diálogo/retirada voluntarios, sin secretos ni pérdida de partidas");
