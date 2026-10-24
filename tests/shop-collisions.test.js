"use strict";
/* Regresiones de navegación de los 16 comercios secundarios.
 * Ejecutar: node tests/shop-collisions.test.js
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,".."),window={};
for(const file of ["vtm-physics.js","vtm-shops.js"]){
 vm.runInNewContext(fs.readFileSync(path.join(root,file),"utf8"),{window},{filename:file});
}
const P=window.VTM_PHYSICS,K=window.VTM_SHOPS;
assert.equal(K.definitions.length,16);
const counter=P.obstacles("sidevenue").find(o=>o.id==="mostrador-central");
assert.ok(counter,"El mostrador central debe tener colisión");
assert.equal(counter.x,202);assert.equal(counter.y,191);
assert.equal(counter.w,76);assert.equal(counter.h,42);
assert.equal(P.canStand("sidevenue",240,220),false,"No se debe atravesar el mostrador");
assert.equal(P.canStand("sidevenue",240,236),false,"El punto antiguo estaba sobre el mueble");
assert.equal(P.canStand("sidevenue",240,250),true,"El nuevo punto de entrada es transitable");
assert.equal(P.canStand("venue",240,220),true,"Los edificios de misión no cambian");
console.log("OK: mostrador sólido, entrada segura y colisiones de misión intactas");

const migrated=P.nearestFree("sidevenue",240,236);
assert.ok(P.canStand("sidevenue",migrated.x,migrated.y),"Una partida antigua se recoloca sin quedar atrapada");
console.log("OK: las partidas antiguas recuperan una posición válida");

function follow(route,start){
 let pos={...start};
 for(const target of route){
  let steps=0;
  while(Math.hypot(pos.x-target.x,pos.y-target.y)>=4.5&&steps++<150){
   const dx=target.x-pos.x,dy=target.y-pos.y,d=Math.hypot(dx,dy);
   const next=P.slide("sidevenue",pos.x,pos.y,dx/d*Math.min(3,d),dy/d*Math.min(3,d));
   if(!next.moved)break;
   pos={x:next.x,y:next.y};
   assert.ok(P.canStand("sidevenue",pos.x,pos.y),"La ruta no puede cruzar muebles");
  }
  assert.ok(Math.hypot(pos.x-target.x,pos.y-target.y)<5,
   "La ruta debe alcanzar cada punto intermedio sin atascarse");
 }
 return pos;
}
const spawn={x:240,y:250};
for(const [name,target,radius] of [
 ["encargado",{x:240,y:104},60],
 ["mostrador lateral",{x:130,y:143},55],
 ["estantería",{x:350,y:146},55],
 ["salida",{x:240,y:270},43]
]){
 const route=P.path("sidevenue",spawn,target);
 assert.ok(route.length>0,"Debe existir una ruta hacia "+name);
 const pos=follow(route,spawn);
 assert.ok(Math.hypot(pos.x-target.x,pos.y-target.y)<radius,
  "La ruta debe terminar dentro del alcance de interacción de "+name);
 console.log("OK: ruta sin atravesar muebles hacia "+name);
}
const game=fs.readFileSync(path.join(root,"vtm-game.js"),"utf8");
assert.match(game,/game\.sidevenue=shop\.id;game\.scene="sidevenue";\s*game\.x=240;game\.y=250;/,
 "La entrada debe situarse delante del mostrador");
console.log("OK: punto de entrada del motor sincronizado con la geometría");
