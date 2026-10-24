"use strict";
/* Regresiones de geometría y navegación de los ocho barrios.
 * Ejecutar: node tests/district-navigation.test.js
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,".."),window={};
for(const file of ["vtm-physics.js","vtm-shops.js","vtm-districts.js"]){
 vm.runInNewContext(fs.readFileSync(path.join(root,file),"utf8"),{window},{filename:file});
}
const P=window.VTM_PHYSICS,T=window.VTM_DISTRICTS,K=window.VTM_SHOPS;
const main=P.obstacles("district").find(o=>o.id==="edificio-principal");
assert.ok(main,"El edificio principal debe tener colisión");
assert.deepEqual([main.x,main.y,main.w,main.h],[206,74,68,47]);
assert.equal(P.canStand("district",240,100),false,"No se puede caminar por el interior del edificio dibujado");
assert.equal(P.canStand("district",240,136),true,"La puerta debe ser accesible desde la calle");
const migrated=P.nearestFree("district",240,100);
assert.ok(P.canStand("district",migrated.x,migrated.y),"Partidas anteriores no deben quedar atrapadas");
console.log("OK: edificio principal sólido, puerta accesible y recuperación de partidas");

const opposite={north:"south",south:"north",west:"east",east:"west"};
for(const d of T.defs){
 for(const dir of Object.keys(opposite)){
  const next=T.neighbour(d.id,dir);
  if(!next)continue;
  assert.equal(T.neighbour(next,opposite[dir]),d.id,
   "Los enlaces entre barrios deben ser bidireccionales");
  const arrival=T.arrival(opposite[dir]);
  assert.ok(P.canStand("district",arrival.x,arrival.y,11),
   "La entrada de "+next+" desde "+dir+" debe estar libre incluso con margen de ruta");
 }
 const shopList=K.byDistrict[d.id]||[];
 assert.equal(shopList.length,2,"Cada barrio conserva dos comercios");
}
console.log("OK: ocho barrios conectados, entradas transitables y dieciséis comercios intactos");

function follow(route,start){
 let pos={...start};
 for(const target of route){
  let steps=0;
  while(Math.hypot(pos.x-target.x,pos.y-target.y)>=4.5&&steps++<180){
   const dx=target.x-pos.x,dy=target.y-pos.y,d=Math.hypot(dx,dy);
   const next=P.slide("district",pos.x,pos.y,dx/d*Math.min(3,d),dy/d*Math.min(3,d));
   if(!next.moved)break;
   pos={x:next.x,y:next.y};
   assert.ok(P.canStand("district",pos.x,pos.y),"El camino no puede atravesar edificios");
  }
  assert.ok(Math.hypot(pos.x-target.x,pos.y-target.y)<5,
   "El camino no debe atascarse antes de llegar al punto intermedio");
 }
 return pos;
}
const start={x:240,y:195};
const targets=[
 ["puerta principal",{x:240,y:136}],
 ["mapa general",{x:83,y:263}],
 ["comercio oeste",{x:80,y:187}],
 ["comercio este",{x:400,y:187}],
 ["observación oeste",{x:115,y:157}],
 ["observación este",{x:364,y:157}],
 ["salida norte",{x:240,y:62}],
 ["salida sur",{x:240,y:267}],
 ["salida oeste",{x:39,y:155}],
 ["salida este",{x:441,y:155}]
];
for(const [name,target] of targets){
 const route=P.path("district",start,target);
 assert.ok(route.length>0,"Debe existir ruta hasta "+name);
 const pos=follow(route,start);
 assert.ok(Math.hypot(pos.x-target.x,pos.y-target.y)<7,
  "Debe alcanzarse "+name+" sin atravesar el edificio central");
 console.log("OK: navegación hasta "+name);
}
const probe={district:"passy",x:240,y:136};
assert.equal(T.nearby(probe)?.type,"venue","El acceso principal sigue funcionando");
for(const shop of K.byDistrict.passy){
 assert.equal(T.nearby({district:"passy",x:shop.x,y:shop.y})?.type,"shop",
  "Los comercios conservan su interacción");
}
console.log("OK: puertas y comercios siguen siendo interactuables");
