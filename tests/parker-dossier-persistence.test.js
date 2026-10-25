"use strict";
/* Regresión EP/47: compatibilidad con partidas antiguas, aislamiento y respaldo. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const window={};
const document={readyState:"loading",addEventListener(){}};
for(const file of ["vtm-parker-politics.js","vtm-parker-dossier.js","vtm-save.js"]){
 vm.runInNewContext(fs.readFileSync(path.join(root,file),"utf8"),{window,document},{filename:file});
}
const D=window.VTM_PARKER_DOSSIER;
const P=window.VTM_PARKER_POLITICS;
const S=window.VTM_SAVE;
const key="cronicas-paris-ghoul-v1";
const clans={Toreador:{}};
const fresh=name=>({
 version:1,character:{name,clan:"Toreador"},clock:{night:3,minutes:1215},
 elizabeth:{status:"reported",evidence:["apartment","police"]},
 localCases:{archivo:{complete:true}},conspiracy:{chapter:2},
 factions:{nosferatu:5,camarilla:5,brujah:5},exposure:20,
 history:["Historial anterior"],npcRelations:{john:1}
});
const first=fresh("Primer personaje");
const before=JSON.parse(JSON.stringify(first));
let current=first;
D.bind({getGame:()=>current,save(){},refresh(){}});
assert.equal(first.parkerDossier,undefined);
assert.equal(first.parkerPolitics,undefined);
const dossier=D.getState();
assert.equal(dossier,first.parkerDossier);
assert.equal(Object.keys(dossier).length,0);
assert.equal(P.init(first).protection,null);
for(const field of ["elizabeth","localCases","conspiracy","history","npcRelations"]){
 assert.deepEqual(first[field],before[field],field+" no debe alterarse al migrar");
}
console.log("OK: una partida antigua agrega EP/47 sin borrar investigaciones ni decisiones");

dossier.collected=["EP-03","EP-04","EP-05"];
dossier.linked=["porter"];
assert.equal(P.protect(first,"shelter"),true);
assert.equal(P.protect(first,"lucien"),false,"la protección elegida no se reemplaza");
assert.equal(first.factions.nosferatu,7);
assert.equal(first.exposure,8);
assert.equal(P.verdict(first,1),null,"una sola contradicción no habilita audiencia");
assert.equal(P.verdict(first,2).unlock,"prefectura");
assert.equal(P.verdict(first,2),null,"la audiencia no puede duplicarse");
assert.equal(P.summary(first).verdict,"inquiry");
console.log("OK: protección y audiencia EP/47 son persistentes y no repetibles");

const second=fresh("Segundo personaje");
second.elizabeth.status="open";
current=second;
assert.equal(D.getState(),second.parkerDossier);
assert.notEqual(second.parkerDossier,first.parkerDossier);
assert.equal(second.parkerDossier.collected,undefined);
assert.equal(P.summary(second).protection,null);
assert.equal(P.protect(second,"lucien"),true);
assert.equal(P.summary(first).protection,"shelter");
assert.equal(first.parkerDossier.collected.length,3);
assert.equal(first.localCases.archivo.complete,true);
assert.equal(first.conspiracy.chapter,2);
console.log("OK: cambiar de personaje activo no mezcla expedientes ni alianzas");

const db=new Map();
const storage={
 getItem:k=>db.has(k)?db.get(k):null,
 setItem:(k,v)=>{db.set(k,String(v));},
 removeItem:k=>db.delete(k)
};
assert.equal(S.save(storage,key,first,clans),true);
assert.equal(db.has(key+"-backup"),true);
const normal=S.load(storage,key,clans);
assert.equal(normal.fromBackup,false);
assert.equal(normal.game.parkerDossier.collected.length,3);
assert.equal(normal.game.parkerPolitics.protection,"shelter");
assert.equal(normal.game.parkerPolitics.verdict,"inquiry");
assert.equal(normal.game.elizabeth.status,"reported");
assert.equal(normal.game.localCases.archivo.complete,true);
assert.equal(normal.game.conspiracy.chapter,2);
assert.equal(P.verdict(normal.game,2),null,"no repetir audiencia tras recargar");

db.set(key,"{guardado principal ilegible");
const recovered=S.load(storage,key,clans);
assert.equal(recovered.fromBackup,true);
assert.equal(recovered.game.character.name,"Primer personaje");
assert.equal(recovered.game.parkerDossier.linked[0],"porter");
assert.equal(recovered.game.parkerPolitics.protection,"shelter");
assert.equal(recovered.game.elizabeth.status,"reported");
assert.equal(recovered.game.localCases.archivo.complete,true);
assert.equal(recovered.game.conspiracy.chapter,2);
current=recovered.game;
assert.equal(D.getState().collected.length,3);
console.log("OK: guardado principal y respaldo recuperan EP/47 sin perder progreso previo");
