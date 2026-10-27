"use strict";
/* XXVII-D: la interfaz del Caso 03 no anticipa identidades, tampoco tras recuperar un respaldo. */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),window={};
for(const filename of ["vtm-hunters-case.js","vtm-save.js"])
 vm.runInNewContext(fs.readFileSync(path.join(root,filename),"utf8"),{window},{filename});
const C=window.VTM_HUNTERS_CASE,S=window.VTM_SAVE;
const game={version:1,character:{clan:"Toreador",name:"Testigo"},
 clock:{night:8,minutes:1230},scene:"district",district:"tuneles",
 elizabeth:{hunters:true,evidence:["garage"],status:"reported"},
 hunters:{resolved:{"6:bastilla":"escaped"},cooldownUntilNight:7},
 parkerDossier:{proofs:["EP47"]},parkerPolitics:{protection:"active"},
 principado:{chapter:2},conspiracy:{secret:"no revelado"},
 localCases:{evidence:["anterior"]},cityConsequences:{heat:{policia:22}},
 combat:{},story:{xp:17},equipment:{ammo:6}};
function show(g){
 let dialog=null;
 C.bind({getGame:()=>g,ask:(title,body,options)=>{dialog={title,body,options};},
  save:()=>{},log:()=>{}});
 C.menu();
 assert.ok(dialog,"El expediente debe abrirse");
 const visible=[dialog.title,dialog.body,...dialog.options.map(x=>x.label)].join(" ");
 assert.doesNotMatch(visible,/Etienne|Moreau|Senescal|impostora/i,
  "La interfaz no debe anticipar el secreto de la conspiración");
 return visible;
}
function go(g,id){g.district=C.checks.find(x=>x.id===id).place;}
assert.doesNotMatch(show(game),/Julien Mercier|Madeleine Perrin/);
for(const scene of C.scenes){
 game.district=scene.place;
 assert.equal(C.attempt(game,scene.id,{success:true}).success,true);
}
assert.equal(C.compare(game,"archive").decision,"archive");
assert.doesNotMatch(show(game),/Julien Mercier|Madeleine Perrin/);
go(game,"porteria");
assert.equal(C.correlate(game,"porteria",{success:true}).success,true);
assert.doesNotMatch(show(game),/Julien Mercier|Madeleine Perrin/,
 "El testimonio del portero no acredita una identidad");
const protectedFields=["elizabeth","localCases","conspiracy","parkerDossier",
 "parkerPolitics","principado","cityConsequences","combat","story","equipment"];
const before=Object.fromEntries(protectedFields.map(k=>[k,JSON.stringify(game[k])]));
const data=new Map(),storage={
 getItem:k=>data.has(k)?data.get(k):null,
 setItem:(k,v)=>data.set(k,String(v))
};
const key="cronicas-paris-ghoul-v1",clans={Toreador:{}};
assert.equal(S.save(storage,key,game,clans),true);
const later=JSON.parse(JSON.stringify(game));later.clock.night++;
assert.equal(S.save(storage,key,later,clans),true);
data.set(key,"{principal corrupto");
const loaded=S.load(storage,key,clans);
assert.ok(loaded&&loaded.fromBackup,"Debe recuperar el respaldo válido");
const restored=loaded.game;
assert.equal(C.progress(restored).crosschecked,1);
assert.doesNotMatch(show(restored),/Julien Mercier|Madeleine Perrin/);
for(const field of protectedFields)
 assert.equal(JSON.stringify(restored[field]),before[field],field+" intacto");
go(restored,"alquiler");
assert.equal(C.correlate(restored,"alquiler",{success:true}).success,true);
assert.match(show(restored),/Julien Mercier/);
assert.doesNotMatch(show(restored),/Madeleine Perrin/);
go(restored,"mensajeria");
assert.equal(C.correlate(restored,"mensajeria",{success:true}).success,true);
assert.doesNotMatch(show(restored),/Madeleine Perrin/,
 "La mensajería por sí sola no acredita a Perrin");
go(restored,"copias");
assert.equal(C.correlate(restored,"copias",{success:true}).success,true);
assert.match(show(restored),/Julien Mercier/);
assert.match(show(restored),/Madeleine Perrin/);
const snapshot=JSON.stringify(restored);
show(restored);
assert.equal(JSON.stringify(restored),snapshot,
 "Consultar el expediente no debe alterar una partida ya normalizada");
console.log("OK: Caso 03 — privacidad de la interfaz y continuidad tras respaldo");
