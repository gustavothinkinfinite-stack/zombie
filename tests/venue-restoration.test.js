"use strict";
/* Regresión: las partidas de interiores eliminados deben volver a un lugar seguro.
 * Ejecutar: node tests/venue-restoration.test.js
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const window={};
for(const name of ["vtm-data.js","vtm-physics.js","vtm-districts.js"]){
 vm.runInNewContext(fs.readFileSync(path.join(root,name),"utf8"),{window},{filename:name});
}
const D=window.VTM_DATA,P=window.VTM_PHYSICS,T=window.VTM_DISTRICTS;
const source=fs.readFileSync(path.join(root,"vtm-game.js"),"utf8");
const start=source.indexOf(" function expandSave(){");
const end=source.indexOf("\n function enterGame(){",start);
assert.ok(start>=0&&end>start,"La migración debe estar disponible");
const migration=source.slice(start,end);
const fixture=()=>({
 version:1,scene:"venue",venue:"interior-retirado",venueReturn:null,
 x:240,y:237,cityPos:{x:46,y:267},district:"passy",
 character:{clan:"Toreador",appearance:{},disciplines:{},backgrounds:{}},
 history:["Progreso conservado"],flags:{evidence:true},
 clock:{night:4,minutes:1230},localPlaces:{},localClues:[]
});
function restore(game){
 const stub={init:()=>{},tick:()=>[]};
 const context={game,D,T,P,A:{factions:{camarilla:0,brujah:0,nosferatu:0,tremere:0}},
  V:{normalize:x=>x},K:{normalize:()=>{}},CASES:stub,H:stub,M:stub,
  ST:stub,TACT:stub,EQUIP:stub,ECON:stub,WORLD:stub,ELI:stub,POL:stub,
  ACT:stub,CITY:stub,REACT:stub,REGION:stub,CIV:stub,CHASE:stub,VITAE:stub,PRINC:stub,
  COURT:{init:()=>{},exposureReview:()=>{}},CI:null};
 vm.runInNewContext(migration+"\nexpandSave()",context);
 return game;
}
const district=fixture();
district.venueReturn={scene:"district",district:"passy",x:240,y:136};
restore(district);
assert.equal(district.scene,"district");
assert.equal(district.district,"passy");
assert.equal(district.x,240);assert.equal(district.y,136);
assert.equal(district.venue,null);assert.equal(district.venueReturn,null);
assert.ok(P.canStand(district.scene,district.x,district.y));
assert.deepEqual(district.history,["Progreso conservado"]);
assert.equal(district.flags.evidence,true);
console.log("OK: interior retirado vuelve al barrio de origen sin perder progreso");

const map=restore(fixture());
assert.equal(map.scene,"paris");
assert.equal(map.x,46);assert.equal(map.y,267);
assert.equal(map.venue,null);assert.equal(map.venueReturn,null);
assert.ok(P.canStand(map.scene,map.x,map.y));
console.log("OK: interior retirado sin retorno vuelve al mapa general");

const invalid=fixture();
invalid.venueReturn={scene:"district",district:"barrio-retirado",x:240,y:136};
restore(invalid);
assert.equal(invalid.scene,"paris");
assert.ok(P.canStand(invalid.scene,invalid.x,invalid.y));
console.log("OK: retorno a barrio retirado no deja la partida atrapada");

const valid=fixture();
valid.venue=D.locations[0].id;
valid.venueReturn={scene:"district",district:"passy",x:240,y:136};
restore(valid);
assert.equal(valid.scene,"venue");
assert.equal(valid.venue,D.locations[0].id);
assert.equal(valid.venueReturn.district,"passy");
assert.ok(P.canStand(valid.scene,valid.x,valid.y));
console.log("OK: interiores vigentes conservan su escena y regreso");
