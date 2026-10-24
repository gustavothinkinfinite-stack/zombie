"use strict";
/* Node tests/vitae-phase20.test.js — módulos oficiales anteriores no reemplazados. */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),window={};
for(const file of ["vtm-mechanics.js","vtm-vitae.js"])
 vm.runInNewContext(fs.readFileSync(path.join(root,file),"utf8"),{window},{filename:file});
const M=window.VTM_MECHANICS,V=window.VTM_VITAE;
const g=(clan="Toreador",embraced=true)=>({
 version:1,scene:"venue",venue:"stjuly",clock:{night:1,minutes:1215},embraced,
 character:{clan,willpower:5,humanity:7,virtues:{Autocontrol:3,Coraje:3,Conciencia:3},
 attr:{Destreza:3,Carisma:3,Manipulación:3},skills:{Sigilo:2,Empatía:2},disciplines:{},
 backgrounds:{Recursos:2}},mechanics:{blood:embraced?8:0,will:5,health:7},history:[],
 flags:{},sideQuests:{id:"Elizabeth"},custom:{notErased:true}
});
const run=(name,fn)=>{fn();console.log("OK:",name);};
run("Carga de partida previa no causa gasto retroactivo ni borra tramas",()=>{
 const game=g();M.init(game);V.init(game);
 assert.equal(game.mechanics.blood,8);
 assert.equal(game.vitae.lastNight,1);
 assert.equal(game.sideQuests.id,"Elizabeth");assert.equal(game.custom.notErased,true);
});
run("Nuevo amanecer consume vitae exactamente una vez sin duplicar Voluntad",()=>{
 const game=g();M.init(game);V.init(game);game.mechanics.will=2;game.clock.night=2;
 M.nextNight(game);
 assert.equal(game.mechanics.blood,7);
 assert.equal(game.mechanics.will,3);
 M.nextNight(game);assert.equal(game.mechanics.blood,7);assert.equal(game.mechanics.will,3);
 game.clock.night=4;M.nextNight(game);
 assert.equal(game.mechanics.blood,5);
});
run("Un ghoul no pierde vitae y conserva las reglas de su condición",()=>{
 const game=g("Brujah",false);M.init(game);V.init(game);game.clock.night=4;
 M.nextNight(game);assert.equal(game.mechanics.blood,0);
 assert.equal(V.frenzy(game,"provocación"),null);
 assert.equal(V.summary(game).includes("Ghoul"),true);
});
run("Brujah recibe dificultad de Frenesí superior; la Bestia deja estado recuperable",()=>{
 const br=g("Brujah"),tor=g("Toreador");
 M.init(br);M.init(tor);
 br.mechanics.blood=2;tor.mechanics.blood=2;
 const roll1=V.frenzy(br,"provocación",()=>0.0);
 const roll2=V.frenzy(tor,"provocación",()=>0.0);
 assert.equal(roll1.roll.difficulty,10);
 assert.equal(roll2.roll.difficulty,8);
 assert.equal(roll1.frenzy,true);
 const before=br.mechanics.will;assert.equal(V.calm(br).success,true);
 assert.equal(br.mechanics.will,before-1);
 assert.equal(V.calm(br).error!=null,true);
});
run("Gangrel conserva las marcas bestiales tras el Frenesí",()=>{
 const game=g("Gangrel");M.init(game);
 assert.equal(V.frenzy(game,"ataque",()=>0.0).frenzy,true);
 assert.equal(V.init(game).marks,1);
 assert.equal(V.weakness(game,"Carisma","Etiqueta").bonus,-3);
 V.calm(game);
 assert.equal(V.weakness(game,"Carisma","Etiqueta").bonus,-1);
 const raw=JSON.parse(JSON.stringify(game));
 assert.equal(V.init(raw).marks,1);
});
run("Nosferatu obtiene sigilo y penalización social sin editar atributos",()=>{
 const game=g("Nosferatu");M.init(game);
 assert.equal(V.weakness(game,"Carisma","Etiqueta").bonus,-2);
 assert.equal(V.weakness(game,"Destreza","Sigilo").bonus,1);
 assert.equal(game.character.attr.Carisma,3);
});
run("Malkavian recibe indicio intuitivo una vez por noche y tensión en investigación",()=>{
 const game=g("Malkavian");M.init(game);
 assert.equal(V.weakness(game,"Percepción","Empatía").bonus,1);
 assert.equal(V.weakness(game,"Percepción","Empatía").bonus,0);
 game.vitae.strain=2;
 assert.equal(V.weakness(game,"Inteligencia","Investigación").bonus,-1);
});
run("Toreador contempla la belleza una vez por noche sin impedir exploración",()=>{
 const game=g("Toreador");M.init(game);game.scene="venue";game.venue="elysee";
 const effect=V.observeBeauty(game,()=>0.0);
 assert.equal(effect.lost,12);
 assert.equal(V.observeBeauty(game),null);
 assert.equal(game.scene,"venue");
});
run("Tremere acumula obligaciones rituales sin convertirlas en condena",()=>{
 const game=g("Tremere");M.init(game);game.venue="passy";
 assert.equal(V.weakness(game,"Inteligencia","Ocultismo").bonus,1);
 assert.equal(V.ritual(game,"Taumaturgia").watch,1);
 assert.equal(V.ritual(game,"Taumaturgia"),null);
 assert.equal(game.court,undefined);
});
run("Ventrue debe alimentarse en su entorno selectivo",()=>{
 const game=g("Ventrue");M.init(game);
 assert.equal(V.setTaste(game,"passy"),true);
 assert.equal(V.setTaste(game,"bastilla"),false);
 assert.match(V.feedingRestriction(game),/Passy/);
 game.venue="passy";
 assert.equal(V.feedingRestriction(game),null);
 V.afterHunt(game,{}, {success:true});
 assert.equal(game.vitae.tasteLocked,true);
});
run("Rötschreck distingue la prueba de Coraje y permite gastar Voluntad",()=>{
 const game=g();M.init(game);
 const fear=V.terror(game,"fuego",()=>0.0);
 assert.equal(fear.afraid,true);
 assert.equal(V.summary(game).includes("Rötschreck"),true);
 assert.equal(V.calm(game).success,true);
 assert.equal(V.summary(game).includes("Rötschreck"),false);
});
run("La caza adecuada reduce Frenesí y la escasez de sangre está representada",()=>{
 const game=g("Brujah");M.init(game);game.mechanics.blood=2;
 V.frenzy(game,"provocación",()=>0.0);
 V.afterHunt(game,{}, {success:true});
 assert.equal(V.init(game).frenzy.active,false);
 game.clock.night=2;M.nextNight(game);
 assert.equal(V.summary(game).includes("Hambre intensa"),true);
});
run("Los módulos están integrados y el formato de partida existente se conserva",()=>{
 const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
 const main=fs.readFileSync(path.join(root,"vtm-game.js"),"utf8");
 const ui=fs.readFileSync(path.join(root,"vtm-story-ui.js"),"utf8");
 assert.ok(html.includes("FASE XXI"));
 assert.ok(html.indexOf("vtm-vitae.js?")<html.indexOf("vtm-game.js?"));
 for(const term of ["VITAE.init(game)","VITAE?.feedingRestriction(game)","VITAE?.weakness(game","VITAE.menu",
 "VITAE?.observeBeauty(game)","VITAE?.afterHunt(game","VITAE?.frenzy(game","SAVE_KEY=\"cronicas-paris-ghoul-v1\""])
  assert.ok(main.includes(term),term);
 assert.ok(ui.includes("const fear=S.fearTest(g)"));
 assert.ok(fs.readFileSync(path.join(root,"vtm-tactics-ui.js"),"utf8").includes("bridge.vitaeFrenzy?.("));
 new Function(main);
});
console.log("OK: Fase XX — vitae, clanes, voluntad y bestia");
