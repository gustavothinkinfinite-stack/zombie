"use strict";
/* node tests/city-consequences.test.js */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const cases=[];
const window={VTM_COURT:{addCase:(g,tradition,source,evidence,description)=>{
 cases.push({tradition,source,evidence,description});
 g.court=g.court||{cases:[]};
 if(!g.court.cases.some(e=>e.source===source))g.court.cases.push({tradition,source,evidence,description});
}}};
vm.runInNewContext(fs.readFileSync(path.join(root,"vtm-city-consequences.js"),"utf8"),{window});
const C=window.VTM_CITY_CONSEQUENCES;
const g=(district="bastilla",night=1)=>({scene:"district",district,x:320,y:225,clock:{night,minutes:1230},
 embraced:true,exposure:0,character:{humanity:7},factions:{camarilla:0,brujah:12,nosferatu:12},
 contactMemory:{"bastilla-bar":{trust:2}},history:[],flags:{}});
const test=(label,fn)=>{fn();console.log("OK:",label);};
test("Una partida antigua se amplía sin eliminar campos ni duplicar eventos",()=>{
 const game=g();game.legacy={quest:"Elizabeth Parker"};
 C.init(game);
 assert.equal(game.legacy.quest,"Elizabeth Parker");
 assert.equal(C.DISTRICTS.length,8);
 assert.equal(Object.keys(game.cityConsequences.heat).length,8);
 assert.equal(C.summary(game).total,0);
});
test("Denuncias con fuente idempotente; los rumores mundanos no condenan",()=>{
 cases.length=0;
 const game=g();
 assert.ok(C.exposure(game,12,"Amenazaste a un testigo mortal"));
 assert.equal(C.exposure(game,12,"Amenazaste a un testigo mortal"),null);
 assert.ok(C.summary(game).local>=10);
 game.clock.night++;
 C.tick(game);assert.equal(C.summary(game).pending,0);
 assert.equal(cases.length,0);
 assert.ok(C.summary(game).witnesses>=1);
});
test("La disciplina discreta no constituye evidencia sobrenatural",()=>{
 const game=g();assert.equal(C.power(game,"Auspex",{place:"bastilla"}),null);
 assert.equal(C.power(game,"Ofuscación",{place:"bastilla"}),null);
 assert.equal(C.summary(game).total,0);
});
test("Dos manifestaciones públicas independientes abren sólo una comprobación",()=>{
 cases.length=0;
 const game=g();
 assert.ok(C.power(game,"Dominación",{place:"bastilla"}));
 assert.equal(C.power(game,"Dominación",{place:"bastilla"}),null);
 game.scene="district";game.district="saintdenis";
 assert.ok(C.power(game,"Potencia",{place:"saintdenis"}));
 assert.equal(C.tick(game).length,0);
 assert.equal(cases.length,0);
 game.clock.night=2;
 const notes=C.tick(game);
 assert.equal(cases.length,1);
 assert.equal(cases[0].tradition,"mascarada");
 assert.ok(notes.some(x=>x.includes("corte")));
 C.tick(game);assert.equal(cases.length,1);
 const restored=JSON.parse(JSON.stringify(game));
 C.tick(restored);assert.equal(cases.length,1);
});
test("Un único testimonio sobrenatural nunca inicia el proceso de la corte",()=>{
 cases.length=0;
 const game=g();
 C.power(game,"Taumaturgia",{place:"bastilla"});
 game.clock.night=2;C.tick(game);
 assert.equal(cases.length,0);
});
test("La intimidación y la ocultación en otras investigaciones producen eco policial",()=>{
 const game=g();
 game.reactiveCity={case:{night:1,flags:{intimidated:true}}};
 game.reactiveDistricts={cases:{passy:{night:1,flags:{hidden:true,reported:true}}}};
 C.tick(game);
 assert.ok(C.heat(game,"bastilla")>0);
 assert.ok(game.cityConsequences.reports.some(x=>x.district==="passy"));
 const before=game.cityConsequences.reports.length;
 C.tick(game);assert.equal(game.cityConsequences.reports.length,before);
 game.clock.night=2;C.tick(game);
 game.clock.night=3;C.tick(game);
 assert.equal(game.cityConsequences.reports.length,before,"Una amenaza antigua no debe denunciarse de nuevo cada noche");
});
test("La vigilancia activa una patrulla y sus interacciones se recuerdan por noche",()=>{
 const game=g(),dialogs=[],logs=[];
 for(let i=1;i<=3;i++){game.clock.night=i;C.report(game,{kind:"ordinary",source:"threat:"+i,heat:11,observed:true});}
 const initial=C.heat(game,"bastilla");
 assert.ok(initial>=20);
 assert.ok(C.visible(game).some(x=>x.id==="patrol"));
 C.bind({getGame:()=>game,ask:(title,text,choices)=>dialogs.push({title,text,choices}),
  roll:()=>({success:true,dice:[9,8]}),advance:()=>{},save:()=>{},refresh:()=>{},log:s=>logs.push(s)});
 assert.equal(C.interact(game),true);
 let choice=dialogs.at(-1).choices.find(c=>c.label.includes("Explicar"));
 assert.ok(choice);choice.action();
 assert.equal(C.heat(game,"bastilla"),initial-15);
 C.interact(game);
 assert.ok(!dialogs.at(-1).choices.some(c=>c.label.includes("Explicar")));
});
test("El contacto confiable permite reducir rumores una vez por noche",()=>{
 const game=g();const dialogs=[];
 C.report(game,{kind:"ordinary",source:"x",heat:20,observed:true});
 C.bind({getGame:()=>game,ask:(title,text,choices)=>dialogs.push({title,text,choices}),
  roll:()=>({success:true,dice:[10,9]}),advance:()=>{},save:()=>{},refresh:()=>{},log:()=>{}});
 const opts=C.options(game);
 const contact=opts.find(o=>o.label.includes("contacto discreto"));
 assert.ok(contact);contact.action();assert.equal(C.options(game).some(o=>o.label.includes("contacto discreto")),false);
});
test("La cobertura por testigos y el calor policial persisten al guardar",()=>{
 const game=g();
 C.report(game,{kind:"ordinary",source:"extra",heat:30,observed:true});
 const serialized=JSON.parse(JSON.stringify(game));
 assert.equal(C.heat(serialized,"bastilla"),C.heat(game,"bastilla"));
 assert.equal(C.summary(serialized).witnesses,C.summary(game).witnesses);
 const ctx={fillRect(){count++},set fillStyle(s){}};
 let count=0;
 C.draw(ctx,game,0);assert.ok(count>0);
});
test("Carga de scripts y enlaces al motor sin alterar la clave del guardado",()=>{
 const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
 const main=fs.readFileSync(path.join(root,"vtm-game.js"),"utf8");
 const world=fs.readFileSync(path.join(root,"vtm-world-powers-ui.js"),"utf8");
 assert.ok(html.includes("FASE XVIII"));
 assert.ok(html.indexOf("vtm-city-consequences.js?")<html.indexOf("vtm-game.js?"));
 for(const symbol of ["CIV.init(game)","CIV.tick(game)","CIV.exposure(game","CIV.menu","CIV.draw(g,game","CIV?.interact(game)","observedPower:"])
  assert.ok(main.includes(symbol),symbol);
 assert.ok(world.includes("bridge.observedPower?.(name,result)"));
 assert.ok(main.includes('SAVE_KEY="cronicas-paris-ghoul-v1"'));
 new Function(main);
});
console.log("OK: Fase XVIII — policía, Mascarada, memoria y persistencia");
