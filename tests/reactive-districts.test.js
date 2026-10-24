"use strict";
/* node tests/reactive-districts.test.js — Fase XVII */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),window={};
for(const file of ["vtm-shops.js","vtm-districts.js","vtm-physics.js","vtm-save.js","vtm-reactive-districts.js"]){
 vm.runInNewContext(fs.readFileSync(path.join(root,file),"utf8"),{window},{filename:file});
}
const R=window.VTM_REACTIVE_DISTRICTS,P=window.VTM_PHYSICS,K=window.VTM_SHOPS,D=window.VTM_DISTRICTS,S=window.VTM_SAVE;
const test=(label,fn)=>{fn();console.log("OK:",label);};
const fresh=(district="passy",night=1,minutes=1215)=>({version:1,character:{name:"Protagonista",clan:"Toreador"},scene:"district",district,x:236,y:216,clock:{night,minutes},previous:{quests:[1,2,3]}});
function harness(g,success=true){
 const dialogs=[],logs=[];
 R.bind({getGame:()=>g,ask:(title,body,choices)=>dialogs.push({title,body,choices}),roll:()=>({success,dice:success?[9,8]:[2,3]}),
  log:s=>logs.push(s),save:()=>{},refresh:()=>{},exposure:()=>{},
  advance:min=>{g.clock.minutes=(g.clock.minutes+min)%1440;R.tick(g)}});
 const pick=(part)=>{
  const found=dialogs.at(-1)?.choices?.find(v=>v.label.includes(part));
  assert.ok(found,"No existe opción "+part);
  found.action();return found;
 };
 return {dialogs,logs,pick};
}
function at(g,def,minutes){g.clock.minutes=minutes%1440;R.tick(g);}
function finish(g,def){at(g,def,def.end+2);return R.overview(g).find(r=>r.name===def.name);}
test("Siete nuevos relatos con identidad, horarios y locales reales",()=>{
 assert.equal(R.defs.length,7);
 assert.equal(new Set(R.defs.map(x=>x.id)).size,7);
 assert.equal(D.defs.length,8);
 for(const d of R.defs)for(const shop of d.shops){
  assert.ok(K.byId[shop],shop);
  assert.equal(K.byId[shop].district,d.id);
 }
});
test("Todos los casos progresan fuera de pantalla y se cierran una sola vez",()=>{
 const g=fresh();R.init(g);assert.equal(R.tick(g).length,0);
 g.scene="house";g.clock.minutes=23*60+53;
 assert.equal(R.tick(g).filter(e=>e.stage!=="closed").length,21);
 assert.equal(R.tick(g).length,0);
 g.clock.minutes=2*60;
 const endings=R.tick(g).filter(e=>e.stage==="closed");
 assert.equal(endings.length,7);
 assert.equal(R.tick(g).length,0);
 assert.ok(R.overview(g).every(c=>c.outcome==="unresolved"));
 assert.deepEqual(g.previous.quests,[1,2,3]);
});
test("Los actores y pruebas son alcanzables con la navegación existente",()=>{
 for(const def of R.defs){
  const g=fresh(def.id);at(g,def,def.search+1);
  const spots=R.visible(g);assert.equal(spots.length,3);
  for(const p of spots){
   const free=P.nearestFree("district",p.x,p.y);
   assert.ok(P.canStand("district",free.x,free.y),def.id+":"+p.id);
   assert.ok(P.path("district",{x:240,y:266},free).length>0,def.id+":"+p.id);
   assert.ok(Math.hypot(free.x-p.x,free.y-p.y)<30,def.id+":"+p.id);
  }
  const canvas={fillRect(){},fillText(){},set fillStyle(c){},set font(f){},set textAlign(a){}};
  R.draw(canvas,g,7);
 }
});
test("Cada distrito puede resolver su caso entregando pruebas válidas",()=>{
 for(const def of R.defs){
  const g=fresh(def.id),ui=harness(g);at(g,def,def.search+2);
  g.x=236;g.y=216;assert.equal(R.interact(g),true);ui.pick("Examinar indicios");
  assert.equal(g.reactiveDistricts.cases[def.id].flags.evidence,true);
  g.x=296;g.y=178;R.interact(g);ui.pick("Entregar pruebas");
  const result=finish(g,def);assert.equal(result.outcome,"verified",def.id);
  assert.ok(result.memory.authority>0);
  assert.equal(R.tick(g).length,0);
 }
});
test("Prestar ayuda, no informar y ocultar datos producen tres consecuencias diferentes",()=>{
 const [def]=R.defs;
 for(const [action,expected] of [["Auxiliar","aided"],["Examinar","lost"],["Ocultar","hidden"]]){
  const g=fresh(def.id),ui=harness(g);at(g,def,action==="Auxiliar"?def.start+2:def.search+2);
  if(action==="Auxiliar"){g.x=238;g.y=159;R.interact(g);ui.pick("Auxiliar");}
  else {
   g.x=236;g.y=216;R.interact(g);ui.pick("Examinar");
   if(action==="Ocultar"){R.interact(g);ui.pick("Ocultar");}
  }
  assert.equal(finish(g,def).outcome,expected,expected);
 }
});
test("Un testigo intimidado desaparece y las consecuencias persisten",()=>{
 const def=R.defs[0],g=fresh(def.id),ui=harness(g);at(g,def,def.search+2);
 g.x=186;g.y=177;R.interact(g);ui.pick("Intimidarlo");
 assert.ok(g.reactiveDistricts.cases[def.id].memory.witness<0);
 assert.equal(R.visible(g).some(p=>p.id==="witness"),false);
 assert.equal(finish(g,def).outcome,"unresolved");
});
test("Rumores externos no se confunden con las pruebas del barrio receptor",()=>{
 const def=R.byId.passy,g=fresh("stjuly");at(g,def,def.report+2);
 const shop=K.byId["stjuly-cafe"],out=R.shopChoices(g,shop);
 assert.ok(out.some(a=>a.label.includes("Passy")));
 assert.ok(out.some(a=>a.label.includes("Una invitación falsificada")));
 assert.ok(out.some(a=>a.label.includes("Contrastar registros")));
});
test("Persistencia local sin reemplazar el formato de partidas de Vampiro",()=>{
 const g=fresh();g.clock.minutes=23*60+50;R.tick(g);
 const raw=JSON.parse(JSON.stringify(g));
 assert.equal(R.overview(raw).length,7);
 const db=new Map(),storage={getItem:k=>db.get(k)||null,setItem:(k,v)=>db.set(k,v)};
 assert.equal(S.save(storage,"cronicas-paris-ghoul-v1",g,{Toreador:{}}),true);
 const restored=S.load(storage,"cronicas-paris-ghoul-v1",{Toreador:{}}).game;
 assert.equal(restored.reactiveDistricts.rumors.length,g.reactiveDistricts.rumors.length);
 assert.deepEqual(Array.from(restored.previous.quests),[1,2,3]);
});
test("Carga de módulos, integración de menús y prueba automática CI",()=>{
 const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
 const game=fs.readFileSync(path.join(root,"vtm-game.js"),"utf8");
 assert.ok(html.indexOf("vtm-reactive-districts.js?")>0);
 assert.ok(html.indexOf("vtm-reactive-districts.js?")<html.indexOf("vtm-game.js?"));
 assert.ok(html.includes("FASE XXI"));
 for(const phrase of ["REGION.init(game)","REGION.tick(game","REGION?.interact(game)","REGION.shopChoices(game,shop)","REGION.draw(g,game,visualTime)","REGION.overview(game)"])
  assert.ok(game.includes(phrase),phrase);
 assert.ok(game.includes('SAVE_KEY="cronicas-paris-ghoul-v1"'));
 const yml=fs.readFileSync(path.join(root,".github/workflows/quality.yml"),"utf8");
 assert.ok(yml.includes("./tests/*.test.js"));
 new Function(game);
});
console.log("OK: Fase XVII — siete barrios reactivos");
