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
 assert.deepEqual(result.game.elizabeth,g.elizabeth);
 assert.deepEqual(result.game.localCases,g.localCases);
});
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const game=fs.readFileSync(path.join(root,"vtm-game.js"),"utf8");
assert.ok(html.indexOf("vtm-stealth-chase.js?")<html.indexOf("vtm-hunters.js?"));
assert.ok(html.indexOf("vtm-hunters.js?")<html.indexOf("vtm-game.js?"));
assert.ok(game.includes("HUNTERS.step(game,dt,P"));
assert.ok(game.includes("HUNTERS.draw(g,game"));
console.log("OK: Fase XXVII-B — seguimiento físico evitable, sin cazadores revelados");
