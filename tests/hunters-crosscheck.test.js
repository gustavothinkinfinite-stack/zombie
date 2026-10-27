"use strict";
/* XXVII-D: dos personas de interés, cuatro fuentes y consecuencias sin revelar informantes. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),window={};
for(const filename of ["vtm-hunters-case.js","vtm-save.js"])
 vm.runInNewContext(fs.readFileSync(path.join(root,filename),"utf8"),{window},{filename});
const C=window.VTM_HUNTERS_CASE,S=window.VTM_SAVE;
function sample(){
 return {version:1,character:{clan:"Toreador",name:"Testigo"},
  clock:{night:8,minutes:1230},scene:"district",district:"tuneles",
  elizabeth:{hunters:true,evidence:["garage"],status:"reported"},
  hunters:{resolved:{"6:bastilla":"escaped"},history:["se perdió el seguimiento"],cooldownUntilNight:7},
  parkerDossier:{proofs:["EP47"]},parkerPolitics:{protection:"active"},
  principado:{chapter:2},conspiracy:{secret:"no revelado"},
  localCases:{evidence:["anterior"]},cityConsequences:{heat:{policia:22}},
  combat:{},story:{xp:17},equipment:{ammo:6}};
}
function initial(g){
 for(const scene of C.scenes){
  g.district=scene.place;assert.equal(C.attempt(g,scene.id,{success:true}).success,true);
 }
 assert.equal(C.compare(g,"archive").decision,"archive");
}
function go(g,id){g.district=C.checks.find(d=>d.id===id).place;}
function test(title,fn){fn();console.log("OK:",title);}
test("Sin expediente preliminar no se exhiben personas de interés ni registros",()=>{
 const g=sample();C.init(g);
 assert.equal(C.canCorrelate(g,"alquiler").includes("Primero"),true);
 assert.equal(C.correlate(g,"alquiler",{success:true}),null);
 assert.equal(C.progress(g).followupDecision,null);
 const old=sample();old.elizabeth.hunters=false;
 assert.equal(C.init(old),null);assert.equal(C.atPlace(old,"stjuly"),false);
 assert.equal(C.correlate(old,"alquiler",{success:true}),null);
});
test("Verificación independiente: Mercier y Perrin no quedan corroborados por una sola pista",()=>{
 const g=sample();initial(g);
 assert.equal(C.atPlace(g,"stjuly"),true);
 assert.equal(C.atPlace(g,"hemeroteca"),true);
 assert.equal(C.atPlace(g,"elysee"),false);
 go(g,"alquiler");const one=C.correlate(g,"alquiler",{success:true});
 assert.equal(one.found,1);assert.match(one.message,/no identifica/);
 assert.equal(C.progress(g).suspects.find(x=>x.id==="mercier").confirmed,1);
 assert.equal(C.progress(g).suspects.find(x=>x.id==="perrin").confirmed,0);
 assert.equal(C.concludeCorrelations(g,"shadow"),null);
 go(g,"porteria");const two=C.correlate(g,"porteria",{success:true});
 assert.equal(two.found,2);
 assert.equal(C.progress(g).suspects.find(x=>x.id==="mercier").confirmed,2);
 assert.equal(C.progress(g).suspects.find(x=>x.id==="perrin").confirmed,0);
 assert.match(two.message,/no reconoce al conductor/);
 go(g,"copias");assert.equal(C.correlate(g,"copias",{success:true}).found,3);
 assert.equal(C.progress(g).suspects.find(x=>x.id==="perrin").confirmed,1);
 go(g,"mensajeria");assert.equal(C.correlate(g,"mensajeria",{success:true}).found,4);
 const p=C.progress(g);assert.equal(p.crosschecked,4);assert.equal(p.checksTotal,4);
 assert.equal(p.suspects[1].confirmed,2);
 assert.equal(p.nextChecks.length,0);
 assert.equal(C.correlate(g,"mensajeria",{success:true}),null);
 assert.match(C.canCorrelate(g,"mensajeria"),/ya está registrado/);
});
test("Si una prueba falla, se bloquea sólo esa fuente por la noche; al recargar no se regala",()=>{
 const g=sample();initial(g);go(g,"copias");
 assert.equal(C.correlate(g,"copias",{success:false}).success,false);
 assert.equal(C.progress(g).crosschecked,0);
 assert.match(C.canCorrelate(g,"copias"),/esta noche/);
 const cloned=JSON.parse(JSON.stringify(g));
 assert.equal(C.correlate(cloned,"copias",{success:true}),null);
 cloned.clock.night++;assert.equal(C.correlate(cloned,"copias",{success:true}).found,1);
 assert.equal(C.progress(cloned).crosschecked,1);
 assert.equal(C.progress(g).crosschecked,0);
});
test("Decisiones alternativas dan distintos costes, no recompensas ni identidades",()=>{
 for(const choice of ["protect","shadow"]){
  const g=sample();initial(g);
  for(const check of C.checks){go(g,check.id);assert.equal(C.correlate(g,check.id,{success:true}).success,true);}
  const before=JSON.stringify([g.elizabeth,g.parkerDossier,g.parkerPolitics,g.principado,g.conspiracy,g.localCases,g.cityConsequences,g.combat,g.story]);
  const result=C.concludeCorrelations(g,choice);
  assert.equal(result.exposure,choice==="shadow"?5:0);
  assert.doesNotMatch(result.message,/Etienne|Moreau|Senescal|impostora/i);
  assert.match(result.message,/no permiten acusar|ninguna de las pruebas demuestra/i);
  assert.equal(C.concludeCorrelations(g,choice),null);
  assert.equal(JSON.stringify([g.elizabeth,g.parkerDossier,g.parkerPolitics,g.principado,g.conspiracy,g.localCases,g.cityConsequences,g.combat,g.story]),before);
  assert.equal(g.hunters.resolved["6:bastilla"],"escaped");
  g.clock.night++;assert.ok(C.aftermath(g));
  assert.doesNotMatch(C.aftermath(g),/identificados|confirmados|cazadores son/i);
  g.clock.night++;assert.ok(C.aftermath(g));
  g.clock.night++;assert.equal(C.aftermath(g),"");
 }
});
test("Menú del segundo tramo ejecuta tirada y guardado una única vez",()=>{
 const g=sample();initial(g);go(g,"alquiler");
 const dialogs=[],saves=[],logs=[],advanced=[];
 C.bind({getGame:()=>g,ask:(title,body,options)=>dialogs.push({title,body,options}),
  save:()=>saves.push(true),refresh:()=>{},advance:n=>advanced.push(n),log:v=>logs.push(v),
  roll:(attribute,skill,diff)=>{assert.equal(attribute,"Inteligencia");assert.equal(skill,"Investigación");assert.equal(diff,7);return{success:true};},
  exposure:()=>{throw Error("Un contraste no debe causar exposición.");}});
 C.menu();
 const choice=dialogs.at(-1).options.find(x=>x.label.startsWith("Comprobar la reserva"));
 assert.ok(choice&&!choice.disabled);choice.action();
 assert.equal(C.progress(g).crosschecked,1);
 assert.deepEqual(advanced,[15]);assert.equal(saves.length,1);
 assert.match(dialogs.at(-1).body,/ni identifica a la fuente/);
 choice.action();assert.equal(saves.length,1,"Una segunda pulsación no reitera el resultado");
});
test("Partidas guardadas y respaldo conservan ambos nombres, las pruebas y los casos antiguos",()=>{
 const g=sample();initial(g);
 for(const id of ["alquiler","porteria","copias"]){go(g,id);C.correlate(g,id,{success:true});}
 const map=new Map(),st={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,String(v))};
 const key="cronicas-paris-ghoul-v1",clans={Toreador:{}};
 assert.equal(S.save(st,key,g,clans),true);
 const later=JSON.parse(JSON.stringify(g));later.clock.night++;
 assert.equal(S.save(st,key,later,clans),true);map.set(key,"{dañado");
 const restored=S.load(st,key,clans);
 assert.ok(restored.fromBackup);assert.equal(C.progress(restored.game).crosschecked,3);
 assert.equal(C.progress(restored.game).suspects[0].confirmed,2);
 assert.equal(C.progress(restored.game).suspects[1].confirmed,1);
 assert.equal(restored.game.hunters.resolved["6:bastilla"],"escaped");
 assert.equal(restored.game.hunters.cooldownUntilNight,7);
 for(const field of ["elizabeth","parkerDossier","parkerPolitics","principado","conspiracy","localCases","cityConsequences","combat","story"])
  assert.equal(JSON.stringify(restored.game[field]),JSON.stringify(g[field]),field+" preserved");
});
const engine=fs.readFileSync(path.join(root,"vtm-game.js"),"utf8");
assert.ok(engine.includes("HCASE?.atPlace(game,location.id)"));
assert.ok(engine.includes("report.suspects"));
assert.ok(!engine.includes("Etienne Moreau" + " confirma ser informante"));
console.log("OK: Caso 03 ampliado — corroboración sin acusaciones y continuidad de partidas");