"use strict";
/* XXVII-C: el diario explica el respiro sin revelar observadores ni alterar partidas. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),window={};
for(const file of ["vtm-hunters.js","vtm-save.js"])
 vm.runInNewContext(fs.readFileSync(path.join(root,file),"utf8"),{window},{filename:file});
const H=window.VTM_HUNTERS,S=window.VTM_SAVE;
const engine=fs.readFileSync(path.join(root,"vtm-game.js"),"utf8");
const start=engine.indexOf("  if(HUNTERS){\\n   const watch=HUNTERS.summary(game);".replace(/\\n/g,"\n"));
const end=engine.indexOf('  const contacts=document.createElement("p");',start);
assert.ok(start>=0&&end>start,"bloque del diario presente");
const block=engine.slice(start,end);
function diary(game){
 const lines=[],document={createElement:()=>({textContent:""})},root={appendChild:n=>lines.push(n.textContent)};
 vm.runInNewContext(block,{game,HUNTERS:H,document,root});
 return lines.join("\n");
}
const make=()=>({version:1,character:{name:"Investigadora",clan:"Toreador"},
 clock:{night:7,minutes:1200},hunters:{cooldownUntilNight:7,resolved:{"5:bastilla":"withdrew"},history:[]},
 elizabeth:{evidence:["Parker"]},localCases:{closed:["caso"]},principado:{chapter:1},
 conspiracy:{chapter:2},parkerDossier:{clues:["EP-03"]},parkerPolitics:{protection:"active"}});
const g=make(),before=JSON.stringify(g);
assert.match(diary(g),/hasta finalizar la noche 7/,"muestra respiro incluso sin historial");
assert.match(diary(g),/sin observador activo/);
assert.doesNotMatch(diary(g),/Senescal|Etienne|Moreau|cazadores identificados/i);
assert.equal(JSON.stringify(g),before,"consultar el diario no modifica la partida");
g.clock.night=8;
assert.equal(diary(g),"","el aviso caduca al terminar la tregua");
g.hunters.history=["Noche 6: conversación sin identificar."];
assert.match(diary(g),/conversación sin identificar/,"se conserva el historial");
assert.doesNotMatch(diary(g),/hasta finalizar la noche 7/);
const legacy={version:1,character:{clan:"Toreador"},clock:{night:3}};
assert.equal(diary(legacy),"","las partidas antiguas no crean un estado de cazadores");
assert.equal(legacy.hunters,undefined);
const saved=make(),mem=new Map(),key="cronicas-paris-ghoul-v1",clans={Toreador:{}};
const storage={getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>mem.set(k,String(v))};
assert.equal(S.save(storage,key,saved,clans),true);
const newer=JSON.parse(JSON.stringify(saved));newer.clock.minutes++;
assert.equal(S.save(storage,key,newer,clans),true);
mem.set(key,"{corrupto");
const recovered=S.load(storage,key,clans);
assert.ok(recovered?.fromBackup);
assert.match(diary(recovered.game),/hasta finalizar la noche 7/);
for(const key of ["elizabeth","localCases","principado","conspiracy","parkerDossier","parkerPolitics"])
 assert.equal(JSON.stringify(recovered.game[key]),JSON.stringify(saved[key]),key+" intacto");
console.log("OK: diario muestra la noche de respiro y respeta respaldos y expedientes");
