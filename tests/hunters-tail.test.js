"use strict";
/* Fase XXVII-B: vigilancia móvil no identificada, independiente de la policía. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),window={};
for(const file of ["vtm-physics.js","vtm-hunters.js","vtm-save.js"])
 vm.runInNewContext(fs.readFileSync(path.join(root,file),"utf8"),{window},{filename:file});
const H=window.VTM_HUNTERS,P=window.VTM_PHYSICS,SAVE=window.VTM_SAVE;
const make=()=>({version:1,character:{name:"Investigador",clan:"Toreador"},embraced:false,
 scene:"district",district:"bastilla",clock:{night:6,minutes:1220},x:235,y:225,
 exposure:85,cityLife:{surveillanceEpisodes:[{night:5,district:"bastilla",choice:"observe",outcome:"noticed",summary:"No identificado"}]},
 cityConsequences:{heat:{bastilla:0}},elizabeth:{evidence:["intacta"]},parkerDossier:{clues:["EP-03"]},
 parkerPolitics:{protection:"active"},conspiracy:{chapter:2},localCases:{closed:["caso"]},
 stealthChase:{crouched:false,patrols:{}}});
const check=(title,fn)=>{fn();console.log("OK:",title);};
check("Ghoul sin episodio previo o que evitó la vigilancia no atrae seguidores",()=>{
 const g=make();delete g.cityLife;
 assert.equal(H.source(g),null);assert.equal(H.step(g,.06,P).length,0);
 assert.equal(g.hunters,undefined);
 const safe=make();safe.cityLife.surveillanceEpisodes[0].outcome="avoided";
 assert.equal(H.step(safe,.06,P).length,0);
 assert.equal(safe.hunters,undefined);
});
check("Seguidor comienza lejos del personaje y no modifica patrullas policiales",()=>{
 const g=make();
 assert.equal(H.step(g,.06,P,{moving:true}).length,0);
 const p=g.hunters.follower;
 assert.ok(p&&P.canStand("district",p.x,p.y));
 assert.ok(Math.hypot(g.x-p.x,g.y-p.y)>=75);
 assert.equal(g.stealthChase.patrols.bastilla,undefined);
 assert.equal(g.cityConsequences.heat.bastilla,0);
 const loaded=JSON.parse(JSON.stringify(g));
 assert.equal(H.step(loaded,.06,P).length,0);
 assert.equal(loaded.hunters.follower.source,p.source);
 assert.deepEqual(loaded.elizabeth,g.elizabeth);
});
check("Edificios bloquean la visión; sigilo reduce la alerta del seguidor",()=>{
 assert.equal(H.sight(P,50,150,50,260),false);
 assert.equal(H.sight(P,240,225,295,225),true);
 const visible=make(),hidden=make();H.ensure(visible,P);H.ensure(hidden,P);
 for(const g of [visible,hidden]){g.hunters.follower.x=290;g.hunters.follower.y=225;}
 hidden.stealthChase.crouched=true;
 for(let i=0;i<18;i++){H.step(visible,.06,P,{moving:true});H.step(hidden,.06,P,{moving:true});}
 assert.ok(visible.hunters.follower.alert>hidden.hunters.follower.alert);
});
check("La persecución termina al perder la línea de visión y no se reinicia al cargar",()=>{
 const g=make();H.ensure(g,P);
 const p=g.hunters.follower;
 p.mode="tail";p.x=50;p.y=150;p.alert=60;
 g.x=50;g.y=260;
 const events=[];
 for(let i=0;i<76;i++)events.push(...H.step(g,.06,P,{moving:true}));
 assert.ok(events.some(x=>x.type==="escaped"),JSON.stringify(events));
 assert.equal(g.hunters.follower,null);
 assert.equal(H.ensure(g,P),null);
 assert.equal(g.combat,undefined);
 const recovered=JSON.parse(JSON.stringify(g));
 assert.equal(H.step(recovered,.06,P).length,0);
 assert.equal(recovered.hunters.resolved["5:bastilla"],"escaped");
});
check("Un seguimiento de otra noche caduca y no bloquea uno nuevo",()=>{
 const g=make(),first=H.ensure(g,P);
 assert.ok(first);
 const previous=first.source;
 g.clock.night=7;
 H.init(g);
 assert.equal(g.hunters.follower,null);
 assert.equal(g.hunters.resolved[previous],"expired");
 g.cityLife.surveillanceEpisodes.push({night:6,district:"bastilla",choice:"observe",outcome:"noticed"});
 const next=H.ensure(g,P);
 assert.ok(next,"debe permitir el nuevo episodio sin arrastrar al observador anterior");
 assert.equal(next.source,"6:bastilla");
 assert.equal(next.night,7);
 assert.equal(H.ensure(g,P),next,"el episodio nuevo es idempotente");
 const recovered=JSON.parse(JSON.stringify(g));
 assert.equal(H.ensure(recovered,P).source,"6:bastilla");
 assert.equal(recovered.hunters.resolved[previous],"expired");
 assert.equal(g.cityConsequences.heat.bastilla,0);
 assert.equal(g.conspiracy.chapter,2);
 assert.equal(g.elizabeth.evidence[0],"intacta");
});
check("Seguimiento de otra noche caduca aunque no aparezcan indicios nuevos",()=>{
 const g=make(),old=H.ensure(g,P);
 assert.ok(old);
 g.clock.night=7;
 assert.equal(H.source(g),null);
 assert.equal(H.step(g,.06,P).length,0);
 assert.equal(g.hunters.follower,null);
 assert.equal(g.hunters.resolved[old.source],"expired");
 const recovered=JSON.parse(JSON.stringify(g));
 assert.equal(H.step(recovered,.06,P).length,0);
 assert.equal(recovered.hunters.resolved[old.source],"expired");
 assert.deepEqual(recovered.elizabeth,g.elizabeth);
 assert.deepEqual(recovered.localCases,g.localCases);
 assert.equal(recovered.combat,undefined);
});
check("Un seguidor incompleto no bloquea la vigilancia ni modifica otros expedientes",()=>{
 for(const invalid of [null,"5:passy","0:bastilla"]){
  const g=make(),f=H.ensure(g,P),original=f.source;
  if(invalid===null)delete f.source;
  else f.source=invalid;
  H.init(g);
  assert.equal(g.hunters.follower,null,"se descarta el seguimiento inconsistente");
  assert.equal(g.hunters.resolved[original],undefined,"no se marca resuelto un episodio válido");
  const next=H.ensure(g,P);
  assert.ok(next,"el episodio válido sigue disponible");
  assert.equal(next.source,original);
  assert.equal(H.ensure(g,P),next,"no se duplica al reintentar");
  assert.equal(g.elizabeth.evidence[0],"intacta");
  assert.equal(g.localCases.closed[0],"caso");
  assert.equal(g.parkerPolitics.protection,"active");
  assert.equal(g.conspiracy.chapter,2);
  assert.equal(g.cityConsequences.heat.bastilla,0);
 }
});
check("Un muro próximo al observador bloquea la visión a corta distancia",()=>{
 const g=make(),p=H.ensure(g,P);
 assert.ok(p);
 p.mode="tail";p.x=200;p.y=200;p.alert=60;
 g.x=219;g.y=200;
 // La pared empieza antes del primer punto de muestreo anterior (9 px).
 const wall={canStand:(_scene,x)=>x<203||x>207,path:()=>[],slide:()=>({moved:false})};
 assert.equal(H.sight(wall,p.x,p.y,g.x,g.y),false);
 const events=H.step(g,.06,wall,{moving:false});
 assert.ok(!events.some(e=>e.type==="near"),"no puede reconocer al jugador tras el muro");
 assert.ok(g.hunters.follower,"el seguimiento no debe resolverse por error");
 assert.equal(g.hunters.resolved[p.source],undefined);
 assert.equal(g.elizabeth.evidence[0],"intacta");
 assert.equal(g.localCases.closed[0],"caso");
});
check("Un observador no reconoce al personaje a través de un obstáculo cercano",()=>{
 const g=make(),p=H.ensure(g,P);
 assert.ok(p);
 p.mode="tail";p.x=200;p.y=200;p.alert=60;
 g.x=220;g.y=200;
 // Barrera delgada entre dos posiciones cercanas: no basta la distancia.
 const barrier={canStand:(_scene,x)=>x<207||x>212};
 assert.equal(H.sight(barrier,p.x,p.y,g.x,g.y),false);
 const events=H.step(g,.06,barrier,{moving:false});
 assert.ok(!events.some(e=>e.type==="near"),"no puede identificar a través de una pared");
 assert.ok(g.hunters.follower,"el seguimiento continúa sin falso reconocimiento");
 assert.equal(g.hunters.resolved[p.source],undefined);
 assert.equal(g.elizabeth.evidence[0],"intacta");
 assert.equal(g.conspiracy.chapter,2);
});
check("Un episodio resuelto descarta el observador residual de una partida",()=>{
 const g=make(),p=H.ensure(g,P),id=p.source;
 g.hunters.resolved[id]="escaped";
 const restored=JSON.parse(JSON.stringify(g));
 assert.equal(H.ensure(restored,P),null,"no reinicia un episodio cerrado");
 assert.equal(H.position(restored),null,"no muestra un seguidor fantasma");
 assert.equal(restored.hunters.follower,null,"elimina el seguidor residual");
 assert.equal(restored.hunters.resolved[id],"escaped","conserva la resolución");
 assert.deepEqual(restored.elizabeth,g.elizabeth);
 assert.deepEqual(restored.localCases,g.localCases);
 assert.deepEqual(restored.parkerDossier,g.parkerDossier);
 assert.deepEqual(restored.conspiracy,g.conspiracy);
 assert.equal(restored.stealthChase.patrols.bastilla,undefined);
});
check("No actúa en interiores, otros barrios ni durante un combate existente",()=>{
 const g=make();H.ensure(g,P);
 assert.equal(H.step({...g,scene:"sidevenue"},.06,P).length,0);
 assert.equal(H.step({...g,combat:{active:{round:1}}},.06,P).length,0);
 assert.equal(H.position({...g,district:"passy"}),null);
 assert.equal(H.source({...g,clock:{night:5}}),null);
});
check("El guardado principal y el respaldo conservan el seguimiento sin alterar otros casos",()=>{
 const g=make();H.ensure(g,P);g.hunters.follower.mode="tail";g.hunters.follower.alert=60;
 const mem=new Map(),storage={getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>mem.set(k,String(v))};
 const key="cronicas-paris-ghoul-v1",clans={Toreador:{}};
 assert.equal(SAVE.save(storage,key,g,clans),true);
 const newer=JSON.parse(JSON.stringify(g));newer.clock.minutes++;
 assert.equal(SAVE.save(storage,key,newer,clans),true);
 mem.set(key,"{dañado");
 const result=SAVE.load(storage,key,clans);
 assert.ok(result?.fromBackup);
 assert.equal(result.game.hunters.follower.mode,"tail");
 assert.equal(result.game.hunters.follower.alert,60);
 assert.equal(result.game.conspiracy.chapter,2);
 assert.equal(result.game.parkerPolitics.protection,"active");
 assert.equal(JSON.stringify(result.game.elizabeth),JSON.stringify(g.elizabeth));
 assert.equal(JSON.stringify(result.game.localCases),JSON.stringify(g.localCases));
});
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const game=fs.readFileSync(path.join(root,"vtm-game.js"),"utf8");
assert.ok(html.indexOf("vtm-stealth-chase.js?")<html.indexOf("vtm-hunters.js?"));
assert.ok(html.indexOf("vtm-hunters.js?")<html.indexOf("vtm-game.js?"));
assert.ok(game.includes("HUNTERS.step(game,dt,P"));
assert.ok(game.includes("HUNTERS.draw(g,game"));
console.log("OK: Fase XXVII-B — seguimiento físico evitable, sin cazadores revelados");
