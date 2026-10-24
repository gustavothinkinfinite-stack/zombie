"use strict";
/* Regresión de movimiento entre salón, despacho, habitaciones y París.
 * Ejecutar: node tests/residence-transitions.test.js
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const source=fs.readFileSync(path.join(root,"vtm-game.js"),"utf8");
function section(begin,end){
 const a=source.indexOf(begin),b=source.indexOf(end,a+begin.length);
 assert.ok(a>=0&&b>a,"No se pudo localizar "+begin);
 return source.slice(a,b);
}
const logic=[
 section(" function stopWalking(){","\n let effectsEnabled"),
 section(" function interact(){","\n function changeRoom("),
 section(" function changeRoom(name){","\n function observeObject(")
].join("\n");
const window={};
vm.runInNewContext(fs.readFileSync(path.join(root,"vtm-physics.js"),"utf8"),{window});
const P=window.VTM_PHYSICS;
const transitions=[
 {from:"house",x:44,y:233,to:"study",entry:[240,260]},
 {from:"house",x:436,y:233,to:"quarters",entry:[240,238]},
 {from:"study",x:240,y:268,to:"house",entry:[240,222]},
 {from:"quarters",x:240,y:268,to:"house",entry:[240,222]},
 {from:"house",x:240,y:269,to:"paris",entry:[46,267]},
 {from:"paris",x:46,y:269,to:"house",entry:[240,232]}
];
for(const t of transitions){
 const game={scene:t.from,x:t.x,y:t.y,walking:true,character:{clan:"Toreador"}};
 const keys=new Set(["w","e"]);
 const context={game,keys,touchMove:"up",walkTarget:{x:333,y:200},
  walkRoute:[{x:333,y:200},{x:300,y:150}],dialogOpen:false,CI:null,
  overlayOpen:()=>false,notice:()=>{},hud:()=>{},save:()=>{},
  C:{residences:{Toreador:{study:"Galería privada",quarters:"Habitaciones de servicio"}},
     residenceObjects:{house:[],study:[],quarters:[]}}};
 vm.runInNewContext(logic+"\ninteract()",context);
 assert.equal(game.scene,t.to,t.from+" debe pasar a "+t.to);
 assert.deepEqual([game.x,game.y],t.entry);
 assert.ok(P.canStand(game.scene,game.x,game.y),
  "La posición de llegada a "+t.to+" debe estar libre");
 assert.equal(keys.size,0,"Las teclas retenidas no deben mover al personaje en otra sala");
 assert.equal(context.touchMove,null,"El control táctil retenido debe detenerse");
 assert.equal(context.walkTarget,null,"El destino anterior debe descartarse");
 assert.equal(context.walkRoute.length,0,"La ruta anterior debe descartarse");
 assert.equal(game.walking,false,"La animación de marcha debe detenerse");
 console.log("OK: "+t.from+" -> "+t.to+" sin movimiento heredado");
}
// Los puntos de interacción principales siguen accesibles desde el ingreso.
for(const [scene,spawn,targets] of [
 ["house",{x:240,y:222},[{x:44,y:233},{x:436,y:233},{x:240,y:269},{x:240,y:150}]],
 ["study",{x:240,y:260},[{x:240,y:268},{x:185,y:137},{x:290,y:137},{x:240,y:260}]],
 ["quarters",{x:240,y:238},[{x:240,y:268},{x:142,y:104},{x:334,y:95},{x:239,y:102}]]
]){
 for(const target of targets){
  const route=P.path(scene,spawn,target);
  assert.ok(route.length>0,"No existe ruta a "+scene+" "+JSON.stringify(target));
  assert.ok(P.canStand(scene,route.at(-1).x,route.at(-1).y),
   "La ruta termina dentro de un mueble");
 }
 console.log("OK: rutas básicas de "+scene+" transitables");
}
console.log("Todas las transiciones de la residencia verificadas.");
