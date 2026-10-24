"use strict";
/* node tests/phase19.test.js — Fase XIX, regresión determinista. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),window={};
for(const file of ["vtm-equipment.js","vtm-advanced-tactics.js","vtm-tactics.js","vtm-physics.js","vtm-city-consequences.js","vtm-stealth-chase.js"])
 vm.runInNewContext(fs.readFileSync(path.join(root,file),"utf8"),{window},{filename:file});
const ADV=window.VTM_ADVANCED_TACTICS,T=window.VTM_TACTICS,P=window.VTM_PHYSICS,C=window.VTM_CITY_CONSEQUENCES,CHASE=window.VTM_STEALTH_CHASE,SAVE_KEY="cronicas-paris-ghoul-v1";
const game=(scene="district",district="bastilla")=>({
 version:1,character:{clan:"Toreador",name:"Protagonista",attr:{Destreza:4,Astucia:3,Fuerza:3,Resistencia:3,Carisma:3,Manipulación:3},
 skills:{Atletismo:3,Pelea:3,Esquivar:2,Subterfugio:2},disciplines:{}},
 clock:{night:1,minutes:1230},scene,district,venue:district,x:270,y:225,embraced:false,mechanics:{health:7},combat:{},
 cityConsequences:{heat:{[district]:55}},factions:{camarilla:0},history:[]
});
const run=(name,fn)=>{fn();console.log("OK:",name);};
const rng=()=>.78;
run("Migración: sólo se añade tactical en un combate activo y se conservan campos antiguos",()=>{
 const g=game("venue");g.quest={id:"Elizabeth"};assert.equal(T.start(g,"bastilla").started,true);
 assert.equal(ADV.summary(g).includes("distancia media"),true);
 assert.equal(g.quest.id,"Elizabeth");
 assert.equal(ADV.init(g).distance,1);
 assert.equal(g.combat.records.bastilla,undefined);
});
run("Migración de combates activos: conserva el alcance original del cuerpo a cuerpo",()=>{
 const g=game("venue");
 g.combat.active={round:3,place:"bastilla",enemy:{name:"Rival antiguo",health:4,max:6,style:"evasivo"},history:[],ended:false};
 assert.equal(ADV.init(g).distance,0);
 assert.equal(ADV.valid(g,"golpe"),null);
 assert.equal(g.combat.active.round,3);
});
run("Rango: se impiden los golpes lejanos hasta gastar un turno en avanzar",()=>{
 const g=game("venue");T.start(g,"bastilla");
 assert.match(T.action(g,"golpe",rng).error,/acercarte/);
 assert.equal(g.combat.active.round,1);
 assert.equal(T.action(g,"avanzar",rng).error,undefined);
 assert.equal(ADV.init(g).distance,0);
 assert.equal(g.combat.active.round,2);
 assert.equal(T.action(g,"golpe",rng).error,undefined);
});
run("Cobertura, puntería y flanqueo afectan las tiradas sin regalar daño",()=>{
 const g=game("venue");T.start(g,"bastilla");
 let state=ADV.init(g);
 assert.equal(ADV.outgoing(g,"disparo"),0);
 assert.equal(T.action(g,"cubrirse",rng).error,undefined);
 assert.equal(state.cover,1);
 assert.equal(ADV.incoming(g,"golpe")>=1,true);
 assert.equal(T.action(g,"apuntar",rng).error,undefined);
 assert.equal(state.aim,1);
 assert.equal(ADV.outgoing(g,"disparo"),1);
 assert.equal(T.action(g,"flanquear",()=>.99).error,undefined);
 assert.equal(state.flank,true);
 assert.equal(ADV.outgoing(g,"disparo")>=2,true);
 ADV.after(g,"disparo");assert.equal(state.flank,false);assert.equal(state.aim,0);
});
run("Adversario de contacto avanza si está lejos y no puede golpearte de inmediato",()=>{
 const g=game("venue");T.start(g,"saintdenis");
 const s=ADV.init(g);s.distance=2;
 const res=T.action(g,"cubrirse",rng);
 assert.equal(res.enemyRoll,null);
 assert.ok(res.log.some(x=>x.includes("avanza")));
 assert.equal(s.distance,1);
});
run("No se acumulan ventajas ilimitadas y el turno conserva su historial",()=>{
 const g=game("venue");T.start(g,"bastilla");
 const s=ADV.init(g);s.cover=2;s.aim=2;s.distance=0;
 assert.match(T.action(g,"cubrirse",rng).error,/mejor cobertura/);
 assert.match(T.action(g,"apuntar",rng).error,/máxima/);
 assert.match(T.action(g,"avanzar",rng).error,/contacto/);
 assert.equal(g.combat.active.round,1);
});
run("Línea de visión respeta los edificios del mismo mapa",()=>{
 assert.equal(P.canStand("district",50,150),true);
 assert.equal(P.canStand("district",50,260),true);
 assert.equal(CHASE.sight(P,50,150,50,260),false);
 assert.equal(CHASE.sight(P,240,225,295,225),true);
});
run("Sigilo reduce visibilidad, velocidad y conserva postura",()=>{
 const normal=game(),hidden=game();
 normal.x=235;hidden.x=235;
 CHASE.step(normal,.05,P,{moving:true});
 CHASE.toggle(hidden);
 CHASE.step(hidden,.05,P,{moving:true});
 assert.equal(CHASE.summary(hidden).crouched,true);
 assert.ok(CHASE.speed(hidden,false)<1);
 assert.ok(CHASE.speed(normal,true)>1);
 assert.ok(CHASE.summary(hidden).alert<=CHASE.summary(normal).alert);
 const cloned=JSON.parse(JSON.stringify(hidden));
 assert.equal(CHASE.summary(cloned).crouched,true);
});
run("Una patrulla busca, persigue e intercepta por la calle",()=>{
 const g=game();g.x=270;g.y=226;const events=[];
 for(let i=0;i<220;i++)events.push(...CHASE.step(g,.045,P,{moving:false}));
 assert.ok(events.some(e=>e.type==="pursuit"),JSON.stringify(events));
 assert.ok(events.some(e=>e.type==="confrontation"),JSON.stringify(events));
 assert.ok(P.canStand("district",CHASE.position(g).x,CHASE.position(g).y));
 assert.ok(C.visible(g).some(e=>e.id==="patrol"&&e.x===CHASE.position(g).x));
});
run("Dialogar o identificarse resuelve el encuentro sin matar ni alterar la misión",()=>{
 const g=game();g.quest={id:"Elizabeth"};const dialogs=[];
 CHASE.bind({getGame:()=>g,ask:(title,body,opts)=>dialogs.push({title,opts}),roll:()=>({success:true,dice:[9,8]}),save:()=>{},refresh:()=>{},log:()=>{}});
 for(let i=0;i<220;i++)CHASE.step(g,.045,P,{moving:false});
 assert.equal(CHASE.encounter(g),true);
 const option=dialogs.at(-1).opts.find(e=>e.label.includes("Dar explicaciones"));
 assert.ok(option);option.action();
 assert.equal(CHASE.summary(g).captures,0);
 assert.equal(g.quest.id,"Elizabeth");
 assert.equal(CHASE.summary(g).mode,"cooldown");
});
run("Las rutas de combate, persecución y UI cargan antes del motor principal",()=>{
 const html=fs.readFileSync(path.join(root,"index.html"),"utf8"),
 main=fs.readFileSync(path.join(root,"vtm-game.js"),"utf8"),
 ui=fs.readFileSync(path.join(root,"vtm-tactics-ui.js"),"utf8");
 assert.ok(html.includes("FASE XXI"));
 for(const file of ["vtm-advanced-tactics.js","vtm-stealth-chase.js"])assert.ok(html.includes(file+"?"));
 assert.ok(html.indexOf("vtm-advanced-tactics.js?")<html.indexOf("vtm-tactics.js?"));
 assert.ok(html.indexOf("vtm-stealth-chase.js?")<html.indexOf("vtm-game.js?"));
 assert.ok(main.includes("CHASE.step(game,dt,P"));
 assert.ok(main.includes('k==="c"'));
 assert.ok(main.includes('keys.has("shift")'));
 assert.ok(main.includes("CHASE.summary(game)"));
 assert.ok(main.includes('SAVE_KEY="cronicas-paris-ghoul-v1"'));
 assert.ok(ui.includes("Buscar cobertura")&&ui.includes("Flanquear"));
 new Function(main);
});
console.log("OK: Fase XIX — combate táctico, persecución y sigilo");
