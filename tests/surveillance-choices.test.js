"use strict";
/* XXVII-A: avisos investigables, retirada segura y memoria entre noches. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),window={};
for(const filename of ["vtm-shops.js","vtm-contacts.js","vtm-city-life.js","vtm-save.js"])
 vm.runInNewContext(fs.readFileSync(path.join(root,filename),"utf8"),{window},{filename});
const CITY=window.VTM_CITY_LIFE,SAVE=window.VTM_SAVE;
const saveKey="cronicas-paris-ghoul-v1",clans={Toreador:{}};
function game(exposure=85){
 return {version:1,character:{name:"Investigadora",clan:"Toreador"},embraced:false,
  scene:"district",district:"bastilla",clock:{night:5,minutes:23*60+20},x:202,y:169,
  exposure,cityConsequences:{heat:{bastilla:12}},
  elizabeth:{case:"pendiente",hunters:true},localCases:{closed:["archivo"]},
  principado:{chapter:2},conspiracy:{secret:"sin revelar"},
  parkerDossier:{clues:["EP-03"]},parkerPolitics:{protection:"active"},
  vitae:{lastNight:4},stealthChase:{patrols:{}}};
}
function harness(success){
 const dialogs=[],logs=[],exposures=[],saves=[];
 CITY.bind({ask:(title,body,options)=>dialogs.push({title,body,options}),
  roll:(attr,skill,difficulty)=>{assert.equal(attr,"Percepción");assert.equal(skill,"Investigación");assert.equal(difficulty,7);return {success};},
  exposure:(amount,reason)=>exposures.push({amount,reason}),
  log:message=>logs.push(message),save:()=>saves.push(true),refresh:()=>{}});
 return {dialogs,logs,exposures,saves};
}
function option(dialogs,label){
 const found=dialogs.at(-1).options.find(o=>o.label.includes(label));
 assert.ok(found,"No existe opción "+label);return found;
}
function test(name,fn){fn();console.log("OK:",name);}
test("Ghoul discreto sin exposición no desencadena encuentros ni emboscadas",()=>{
 const g=game(0);g.elizabeth={hunters:false};
 assert.equal(CITY.hunterWarning(g),"");
 const h=harness(true);
 CITY.interactWalker(g,CITY.walkers(g,9)[0]);
 assert.equal(h.dialogs.at(-1).options.some(o=>/Observar discretamente|Cambiar de ruta/.test(o.label)),false);
 assert.equal(CITY.surveillanceEpisode(g),null);
 assert.equal(g.conspiracy.secret,"sin revelar");
});
test("Investigar puede aumentar exposición una vez y la decisión se mantiene al cambiar de barrio",()=>{
 const g=game(),h=harness(false),walker=CITY.walkers(g,9)[0];
 const protectedState=JSON.stringify([g.elizabeth,g.localCases,g.principado,g.conspiracy,g.parkerDossier,g.parkerPolitics,g.vitae,g.stealthChase,g.cityConsequences]);
 CITY.interactWalker(g,walker);
 option(h.dialogs,"Observar discretamente").action();
 assert.match(h.dialogs.at(-1).body,/no identifica/i);
 assert.equal(CITY.surveillanceEpisode(g).outcome,"noticed");
 assert.equal(h.exposures.length,1);
 assert.equal(h.exposures[0].amount,5);
 assert.equal(h.logs.length,1);assert.equal(h.saves.length,1);
 CITY.interactWalker(g,CITY.walkers(g,9)[1]);
 assert.equal(h.dialogs.at(-1).options.some(o=>/Observar discretamente|Cambiar de ruta/.test(o.label)),false);
 const other={...g,district:"passy",exposure:85};
 assert.equal(CITY.resolveSurveillance(other,"avoid"),null,"La decisión vale para toda la noche");
 const loaded=JSON.parse(JSON.stringify(g));loaded.clock.night=6;
 assert.match(CITY.surveillanceAftermath(loaded),/miradas más cautelosas/);
 CITY.interactWalker(loaded,CITY.walkers(loaded,9)[0]);
 assert.match(h.dialogs.at(-1).body,/miradas más cautelosas/);
 assert.doesNotMatch(h.dialogs.at(-1).body,/Senescal|Etienne|Moreau|impostora/i);
 assert.equal(JSON.stringify([loaded.elizabeth,loaded.localCases,loaded.principado,loaded.conspiracy,loaded.parkerDossier,loaded.parkerPolitics,loaded.vitae,loaded.stealthChase,loaded.cityConsequences]),protectedState);
});
test("Cambiar de ruta evita exposición y conserva consecuencias dos noches",()=>{
 const g=game(),h=harness(true);
 CITY.interactWalker(g,CITY.walkers(g,9)[0]);
 option(h.dialogs,"Cambiar de ruta").action();
 assert.equal(CITY.surveillanceEpisode(g).outcome,"avoided");
 assert.equal(h.exposures.length,0);assert.equal(h.saves.length,1);
 g.clock.night=6;assert.match(CITY.surveillanceAftermath(g),/otra ruta/);
 g.clock.night=7;assert.match(CITY.surveillanceAftermath(g),/otra ruta/);
 g.clock.night=8;assert.equal(CITY.surveillanceAftermath(g),"");
});
test("Observar con éxito no concede pruebas, recompensas ni identifica cazadores",()=>{
 const g=game(),h=harness(true);
 const record=CITY.resolveSurveillance(g,"observe");
 assert.equal(record.outcome,"unconfirmed");
 assert.match(record.summary,/No identificaste/);
 assert.equal(h.exposures.length,0);
 assert.equal(g.elizabeth.case,"pendiente");assert.equal(g.parkerDossier.clues[0],"EP-03");
 g.clock.night=6;assert.match(CITY.surveillanceAftermath(g),/fotografías y anotaciones/);
});
test("Respaldo recupera vigilancia y no reejecuta penalidades",()=>{
 const g=game(),h=harness(false);CITY.resolveSurveillance(g,"observe");
 const mem=new Map(),storage={
  getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>mem.set(k,String(v))
 };
 assert.equal(SAVE.save(storage,saveKey,g,clans),true);
 const advanced=JSON.parse(JSON.stringify(g));advanced.clock.night=6;
 assert.equal(SAVE.save(storage,saveKey,advanced,clans),true);
 mem.set(saveKey,"{partida dañada");
 const restored=SAVE.load(storage,saveKey,clans);
 assert.ok(restored&&restored.fromBackup);
 assert.equal(restored.game.cityLife.surveillanceEpisodes.length,1);
 assert.equal(CITY.resolveSurveillance(restored.game,"observe"),null);
 assert.equal(h.exposures.length,1);
 assert.equal(JSON.stringify(restored.game.elizabeth),JSON.stringify(g.elizabeth));
 assert.equal(JSON.stringify(restored.game.parkerPolitics),JSON.stringify(g.parkerPolitics));
 assert.equal(JSON.stringify(restored.game.conspiracy),JSON.stringify(g.conspiracy));
});
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const engine=fs.readFileSync(path.join(root,"vtm-game.js"),"utf8");
assert.ok(engine.includes("CITY.bind({getGame:()=>game,ask:askMenu,roll:dicePool,exposure"));
assert.ok(html.indexOf("vtm-city-life.js?")<html.indexOf("vtm-game.js?"));
console.log("OK: XXVII-A — vigilancia investigable, evitable y persistente");
