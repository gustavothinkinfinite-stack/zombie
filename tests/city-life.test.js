"use strict";
/* node tests/city-life.test.js */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),window={};
for(const f of ["vtm-shops.js","vtm-districts.js","vtm-reactive-districts.js","vtm-city-life.js"])vm.runInNewContext(fs.readFileSync(path.join(root,f),"utf8"),{window},{filename:f});
const C=window.VTM_CITY_LIFE,S=window.VTM_SHOPS,D=window.VTM_DISTRICTS;
const test=(label,fn)=>{fn();console.log("OK:",label);};
const g=(scene="district",district="bastilla",minutes=1215,night=1)=>({scene,district,sidevenue:"stjuly-cafe",x:202,y:169,clock:{night,minutes}});
test("Los ocho barrios y los dieciséis locales existentes siguen siendo compatibles",()=>{
 assert.equal(D.defs.length,8);assert.equal(S.definitions.length,16);assert.equal(C.defs.length,8);
 for(const d of D.defs)assert.ok(C.byId[d.id],"Barrio sin simulación: "+d.id);
});
test("Sucesos independientes por barrio, hora y noche sin duplicaciones",()=>{
 const game=g();C.init(game);
 assert.equal(C.tick(game).length,0);
 game.clock.minutes=1425;const triggered=C.tick(game);
 assert.ok(triggered.length>=8);
 assert.equal(C.tick(game).length,0);
 assert.ok(triggered.some(e=>e.district!=="bastilla"));
 const saved=JSON.parse(JSON.stringify(game));
 assert.equal(C.recent(saved).length,C.recent(game).length);
 C.tick(game,true);
 assert.equal(C.summary(game).events,16);
 game.clock.night++;game.clock.minutes=1215;
 assert.equal(C.tick(game).length,0);
 game.clock.minutes=1425;
 assert.ok(C.tick(game).length>0);
 assert.equal(C.tick(game).length,0);
});
test("Los eventos se muestran en un barrio solo durante su ventana activa",()=>{
 const game=g();
 game.clock.minutes=1430;C.tick(game);
 for(const e of C.active(game))assert.ok(e.minute<=C.current(game)&&e.end>C.current(game));
 game.clock.minutes=3*60+30;
 assert.equal(C.active(game).length,0);
});
test("El horario comercial cambia tras medianoche sin cerrar las misiones",()=>{
 const coffee=S.byId["stjuly-cafe"];
 assert.equal(C.shopState(g("sidevenue","stjuly",1215),coffee).open,true);
 assert.equal(C.shopState(g("sidevenue","stjuly",2*60),coffee).open,true);
 assert.equal(C.shopState(g("sidevenue","stjuly",12*60),coffee).open,false);
 assert.match(C.shopReport(g("sidevenue","stjuly",12*60),coffee),/acceso del jugador permanece disponible/i);
});
test("Rutas de peatones, vehículos y visitantes de negocios se pueden renderizar",()=>{
 const game=g(),canvas={fillRect(){count++},fillText(){},save(){},restore(){},set fillStyle(v){},set font(v){},set textAlign(v){}};
 let count=0;C.tick(game);
 assert.ok(C.walkers(game,14).length>=3);
 assert.ok(C.nearWalker({...game,x:C.walkers(game,14)[0].x,y:C.walkers(game,14)[0].y},14));
 C.districtDraw(canvas,game,14);
 assert.ok(count>=20);
 const shopGame=g("sidevenue","stjuly",1215);count=0;
 C.shopDraw(canvas,shopGame,14);
 assert.ok(count>=10);
 const first=shopGame.clock.night;
 const trial=C.shopState(shopGame,S.byId[shopGame.sidevenue]);
 assert.ok(trial.customers>0&&first===shopGame.clock.night);
});
test("Sucesos y transeúntes permiten interacción una vez por noche",()=>{
 const game=g(),messages=[];game.clock.minutes=21*60+35;C.tick(game);
 C.bind({ask:(title,body,options)=>{messages.push({title,body,options})},save:()=>{},log:()=>{},refresh:()=>{}});
 const event=C.active(game,"bastilla")[0];
 assert.ok(event);
 assert.equal(C.interactEvent(game,event),true);
 const opts=messages.at(-1).options;
 opts[0].action();
 assert.equal(game.cityLife.seen[event.id],true);
 C.interactEvent(game,event);
 assert.match(messages.at(-1).options[0].label,/Ya observado/);
 const passerby=C.walkers(game,15)[0],p={...game,x:passerby.x,y:passerby.y};
 assert.equal(C.interactWalker(p,passerby),true);
 messages.at(-1).options[0].action();
 assert.ok(game.cityLife.talked[game.clock.night+":"+passerby.id]);
});
test("Los peatones transmiten rumores públicos según barrio y hora sin alterar expedientes",()=>{
 const game=g("district","bastilla",23*60+40,2),messages=[],logs=[];
 game.elizabeth={proof:["pista original"]};
 game.localCases={closed:["expediente anterior"]};
 game.reactiveDistricts={rumors:[
  {id:"visible",origin:"stjuly",district:"bastilla",night:2,minute:23*60+20,text:"Un club revisa invitaciones falsificadas."},
  {id:"futuro",origin:"passy",district:"bastilla",night:2,minute:24*60+10,text:"Mensaje que todavía no circula."},
  {id:"anterior",origin:"stjuly",district:"bastilla",night:1,minute:23*60,text:"Un visitante discutió con un portero."},
  {id:"otro-barrio",origin:"stjuly",district:"passy",night:2,minute:23*60,text:"Rumor ajeno al barrio."}
 ]};
 const walker=C.walkers(game,8)[0],rumor=C.streetRumor(game,walker);
 assert.equal(rumor.id,"visible");
 C.bind({ask:(title,body,options)=>messages.push({title,body,options}),log:x=>logs.push(x),save:()=>{},refresh:()=>{}});
 assert.equal(C.interactWalker(game,walker),true);
 assert.match(messages.at(-1).body,/invitaciones falsificadas/);
 assert.match(messages.at(-1).body,/sin pruebas verificadas/);
 assert.doesNotMatch(messages.at(-1).body,/todavía no circula|Rumor ajeno/);
 messages.at(-1).options[0].action();
 assert.equal(logs.length,1);
 assert.match(logs[0],/Rumor sin verificar/);
 const loaded=JSON.parse(JSON.stringify(game));
 assert.equal(loaded.cityLife.talked[game.clock.night+":"+walker.id],true);
 assert.equal(C.interactWalker(loaded,walker),true);
 assert.match(messages.at(-1).body,/ya conversaron/);
 messages.at(-1).options[0].action();
 assert.equal(logs.length,1,"No se repite el registro al cargar una partida");
 assert.deepEqual(loaded.elizabeth,game.elizabeth);
 assert.deepEqual(loaded.localCases,game.localCases);
 const withoutRumors=g("district","bastilla",22*60,2);
 withoutRumors.reactiveDistricts={rumors:[game.reactiveDistricts.rumors[1]]};
 assert.equal(C.streetRumor(withoutRumors,C.walkers(withoutRumors,8)[0]),null);
 assert.equal(C.streetRumor(g(),C.walkers(g(),8)[0]),null,"Compatibilidad con partidas antiguas");
});
test("Los rumores indican comercios existentes sin conceder pruebas ni repetir orientaciones",()=>{
 const game=g("district","bastilla",23*60+40,2),dialogs=[],logs=[],saved=[];
 game.elizabeth={investigacion:"intacta"};
 game.localCases={pistas:3};
 game.reactiveDistricts={rumors:[{
  id:"stjuly:search:bastilla",origin:"stjuly",district:"bastilla",
  night:2,minute:23*60+20,text:"Se revisan invitaciones falsas."
 }]};
 const person=C.walkers(game,8)[0],rumor=C.streetRumor(game,person);
 assert.equal(C.rumorLead(rumor).name,"Café des Lanternes");
 C.bind({ask:(title,body,choices)=>dialogs.push({title,body,choices}),
  log:text=>logs.push(text),save:()=>saved.push(true),refresh:()=>{}});
 C.interactWalker(game,person);
 const lead=dialogs.at(-1).choices.find(c=>/dónde contrastar/.test(c.label));
 assert.ok(lead);
 lead.action();
 assert.match(dialogs.at(-1).body,/Café des Lanternes/);
 assert.match(dialogs.at(-1).body,/sólo una investigación puede aportar pruebas/);
 assert.equal(logs.length,1);
 assert.equal(game.cityLife.checked["2:lead:stjuly:search:bastilla"],true);
 assert.deepEqual(game.elizabeth,{investigacion:"intacta"});
 assert.deepEqual(game.localCases,{pistas:3});
 const recovered=JSON.parse(JSON.stringify(game));
 C.interactWalker(recovered,person);
 dialogs.at(-1).choices.find(c=>/dónde contrastar/.test(c.label)).action();
 assert.equal(logs.length,1,"Una pista ya anotada no debe duplicar entradas");
 assert.equal(saved.length,1,"No se vuelve a escribir el mismo dato");
 const unknown={origin:"inexistente"};
 assert.equal(C.rumorLead(unknown),null);
 assert.equal(C.rumorLead(null),null);
 const old=g();C.interactWalker(old,C.walkers(old,8)[0]);
 assert.equal(dialogs.at(-1).choices.length,1,"Las partidas antiguas no inventan indicios");
});
test("El guardado original y las rutas de entrada a comercios permanecen",()=>{
 const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
 const source=fs.readFileSync(path.join(root,"vtm-game.js"),"utf8");
 assert.ok(html.indexOf('src="vtm-city-life.js?')>0);
 assert.ok(html.indexOf('src="vtm-city-life.js?')<html.indexOf('src="vtm-game.js?'));
 assert.match(html, /<span class="brand-version">[^<]*FASE [IVXLCDM]+/, "La portada debe indicar una fase vigente");
 for(const mark of ["CITY.init(game)","CITY.tick(game)","CITY.districtDraw","CITY.shopDraw","CITY?.interactShop","CITY.bulletin","cityRealSeconds"])assert.ok(source.includes(mark),mark);
 assert.ok(source.includes('SAVE_KEY="cronicas-paris-ghoul-v1"'));
 new Function(source);
});
console.log("OK: vida nocturna de París — Fase XV");
