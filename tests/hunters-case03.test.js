"use strict";
/* XXVII-D: Caso 03, investigación documental con información incompleta. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),window={};
for(const file of ["vtm-hunters-case.js","vtm-save.js"])
 vm.runInNewContext(fs.readFileSync(path.join(root,file),"utf8"),{window},{filename:file});
const CASE=window.VTM_HUNTERS_CASE,SAVE=window.VTM_SAVE;
function make(){
 return {version:1,character:{clan:"Toreador",name:"Investigadora"},clock:{night:6,minutes:1225},
  scene:"district",district:"tuneles",elizabeth:{status:"reported",hunters:true,evidence:["garage"]},
  hunters:{history:["seguimiento antiguo"],resolved:{"5:bastilla":"escaped"}},
  localCases:{cases:["intacta"]},conspiracy:{secret:"sin revelar"},principado:{politics:"intacta"},
  parkerDossier:{clues:["EP47"]},parkerPolitics:{protection:"active"},cityConsequences:{heat:{tuneles:4}},
  stealthChase:{crouched:true,patrols:{}},combat:{},history:[]};
}
const test=(label,fn)=>{fn();console.log("OK:",label);};
test("La investigación no se activa por policía o por fama sin haber identificado vigilancia humana",()=>{
 const g=make();g.elizabeth.hunters=false;g.exposure=100;g.cityConsequences.heat.tuneles=100;
 assert.equal(CASE.unlocked(g),false);
 assert.equal(CASE.init(g),null);
 assert.equal(g.hunters.case03,undefined);
 assert.equal(CASE.canAttempt(g,"refugio").includes("Todavía"),true);
 assert.equal(CASE.progress(g).unlocked,false);
});
test("Tres fuentes diferentes exigen visitar los barrios, tirar dados y admitir fallos",()=>{
 const g=make();assert.equal(CASE.progress(g).found,0);
 assert.equal(CASE.canAttempt(g,"vehiculo").includes("trasladarte"),true);
 assert.equal(CASE.attempt(g,"vehiculo",{success:true}),null);
 assert.equal(CASE.attempt(g,"refugio",{success:false}).success,false);
 assert.match(CASE.canAttempt(g,"refugio"),/esta noche/);
 assert.equal(CASE.attempt(g,"refugio",{success:true}),null);
 g.clock.night++;
 assert.equal(CASE.attempt(g,"refugio",{success:true}).found,1);
 assert.equal(CASE.attempt(g,"refugio",{success:true}),null);
 g.district="saintdenis";assert.equal(CASE.attempt(g,"vehiculo",{success:true}).found,2);
 g.district="policia";assert.equal(CASE.attempt(g,"registro",{success:true}).found,3);
 const p=CASE.progress(g);assert.equal(p.ready,true);assert.equal(p.next.length,0);
 assert.equal(CASE.attempt(g,"registro",{success:true}),null);
 assert.equal(CASE.compare(g,"arbitrary"),null);
 assert.equal(CASE.compare(g,"warn").exposure,3);
 assert.equal(CASE.compare(g,"archive"),null);
 assert.equal(CASE.progress(g).decision,"warn");
});
test("Informe reservado no afirma identidad de cazadores ni filtradores y no da recompensas",()=>{
 const g=make();CASE.init(g);
 for(const s of CASE.scenes){
  g.district=s.place;
  assert.equal(CASE.attempt(g,s.id,{success:true}).success,true);
 }
 const old=JSON.stringify([g.elizabeth,g.localCases,g.conspiracy,g.principado,g.parkerDossier,g.parkerPolitics,g.cityConsequences,g.stealthChase,g.combat]);
 const report=CASE.compare(g,"archive");
 assert.equal(report.exposure,0);
 assert.match(report.message,/vigilancia humana coordinada/);
 assert.match(report.message,/no prueban la identidad/);
 assert.doesNotMatch(report.message,/Etienne|Moreau|Senescal|impostora|fuente identificada/i);
 assert.equal(CASE.compare(g,"archive"),null);
 assert.equal(JSON.stringify([g.elizabeth,g.localCases,g.conspiracy,g.principado,g.parkerDossier,g.parkerPolitics,g.cityConsequences,g.stealthChase,g.combat]),old);
 assert.equal(g.combat.rewards,undefined);assert.equal(g.story,undefined);
});
test("Fuentes fallidas pueden reintentarse después de otra noche sin duplicar pistas",()=>{
 const g=make();assert.equal(CASE.attempt(g,"refugio",{success:false}).success,false);
 assert.equal(CASE.progress(g).found,0);
 const reloaded=JSON.parse(JSON.stringify(g));
 assert.equal(CASE.attempt(reloaded,"refugio",{success:true}),null);
 reloaded.clock.night=7;assert.equal(CASE.attempt(reloaded,"refugio",{success:true}).found,1);
 assert.equal(CASE.progress(reloaded).evidence.length,1);
});
test("Respaldo conserva el caso sin alterar a Elizabeth y los seguimientos existentes",()=>{
 const g=make();CASE.init(g);
 CASE.attempt(g,"refugio",{success:true});g.district="saintdenis";CASE.attempt(g,"vehiculo",{success:true});
 const map=new Map(),storage={getItem:k=>map.has(k)?map.get(k):null,setItem:(k,v)=>map.set(k,String(v))};
 const key="cronicas-paris-ghoul-v1",clans={Toreador:{}};
 assert.equal(SAVE.save(storage,key,g,clans),true);
 const later=JSON.parse(JSON.stringify(g));later.clock.night=7;
 assert.equal(SAVE.save(storage,key,later,clans),true);
 map.set(key,"{dañado");
 const rec=SAVE.load(storage,key,clans);assert.equal(rec.fromBackup,true);
 assert.equal(CASE.progress(rec.game).found,2);
 assert.equal(rec.game.hunters.resolved["5:bastilla"],"escaped");
 assert.equal(JSON.stringify(rec.game.elizabeth),JSON.stringify(g.elizabeth));
 assert.equal(JSON.stringify(rec.game.conspiracy),JSON.stringify(g.conspiracy));
 assert.equal(CASE.canAttempt(rec.game,"refugio"),"Esta fuente ya está contrastada.");
});
test("Menú del Caso 03 usa tiradas, minutos y guardado sin convertir rumores en pruebas",()=>{
 const g=make(),asked=[],saved=[],logs=[],advanced=[];
 CASE.bind({getGame:()=>g,ask:(title,body,opts,tag)=>asked.push({title,body,opts,tag}),
  roll:(attr,skill,diff)=>{assert.equal(attr,"Percepción");assert.equal(skill,"Investigación");assert.equal(diff,7);return {success:true,dice:[9],net:1};},
  save:()=>saved.push(true),refresh:()=>{},advance:n=>advanced.push(n),log:s=>logs.push(s),exposure:()=>{throw Error("Sin exposición por inspección exitosa");}});
 CASE.menu();
 assert.equal(CASE.progress(g).started,true);
 const action=asked.at(-1).opts.find(o=>o.label.startsWith("Examinar rastros"));
 assert.ok(action);action.action();
 assert.equal(CASE.progress(g).found,1);assert.deepEqual(advanced,[15]);
 assert.ok(saved.length>=2);
 assert.match(asked.at(-1).body,/No prueban quién entró/);
 assert.doesNotMatch(asked.at(-1).body,/Senescal|Etienne|Moreau|impostora/i);
 assert.ok(logs.length>0);
});
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const engine=fs.readFileSync(path.join(root,"vtm-game.js"),"utf8");
assert.ok(html.indexOf("vtm-hunters-case.js?")<html.indexOf("vtm-game.js?"));
assert.ok(engine.includes("HCASE.menu"));
assert.ok(engine.includes("HCASE.bind("));
assert.ok(engine.includes("Caso 03 · Los cazadores de la noche"));
console.log("OK: XXVII-D — Caso 03 investigable sin filtración prematura");
