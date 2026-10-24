"use strict";
/* node tests/npc-wait-reactivity.test.js
 * Garantiza que esperar un PNJ no salte sucesos ni duplique ingresos.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const code=fs.readFileSync(path.join(root,"vtm-game.js"),"utf8");
const begin=code.indexOf(" function waitForNPC(npc){");
const end=code.indexOf(" function increaseFaction(",begin);
assert.ok(begin>=0&&end>begin,"No se pudo aislar la rutina de espera del PNJ");
const body=code.slice(begin,end);
function scenario(start,meeting){
 const game={clock:{night:3,minutes:start}};
 const events=[],npc={id:"contact",name:"Contacto"};
 const A={schedules:{contact:{start:meeting,end:3}}};
 const CITY={tick:(g,complete=false)=>events.push(["city",g.clock.night,g.clock.minutes,complete])};
 const M={nextNight:()=>events.push(["mechanic"])};
 const ECON={nextNight:()=>{events.push(["salary"]);return 16;}};
 const f=new Function("game","A","CITY","M","ECON","processReactiveNight","processContactNight",
  "processPoliticalNight","log","hud","save","meetNPC",
  '"use strict";'+body+";return waitForNPC;");
 const wait=f(game,A,CITY,M,ECON,(complete=false)=>events.push(["react",game.clock.night,game.clock.minutes,complete]),
  ()=>events.push(["contacts"]),()=>events.push(["politics"]),s=>events.push(["log",s]),
  ()=>events.push(["hud"]),()=>events.push(["save"]),n=>events.push(["meet",n.id]));
 wait(npc);
 return{game,events};
}
function check(title,fn){fn();console.log("OK:",title);}
check("Esperar unas horas de la misma noche no duplica el ingreso ni el descanso",()=>{
 const {game,events}=scenario(20*60+30,22);
 assert.equal(game.clock.night,3);
 assert.equal(game.clock.minutes,22*60);
 assert.equal(events.filter(e=>e[0]==="salary").length,0);
 assert.equal(events.filter(e=>e[0]==="mechanic").length,0);
 assert.deepEqual(events.filter(e=>e[0]==="react").map(x=>x[3]),[false]);
 assert.equal(events.at(-1)[0],"meet");
});
check("Esperar un horario anterior completa la noche y actualiza casos antes de pasar a la siguiente",()=>{
 const {game,events}=scenario(23*60+15,22);
 assert.equal(game.clock.night,4);
 assert.equal(game.clock.minutes,22*60);
 assert.deepEqual(events.filter(e=>e[0]==="react").map(x=>x[3]),[true,false]);
 assert.deepEqual(events.filter(e=>e[0]==="city").map(x=>x[3]),[true,false]);
 assert.equal(events.filter(e=>e[0]==="salary").length,1);
 assert.ok(events.findIndex(e=>e[0]==="react"&&e[3])<events.findIndex(e=>e[0]==="salary"));
});
check("Esperar desde la madrugada a una cita de tarde avanza a la noche siguiente",()=>{
 const {game,events}=scenario(2*60+15,19);
 assert.equal(game.clock.night,4);
 assert.equal(game.clock.minutes,19*60);
 assert.equal(events.filter(e=>e[0]==="salary").length,1);
 assert.deepEqual(events.filter(e=>e[0]==="react").map(x=>x[3]),[true,false]);
});
console.log("OK: sincronización de esperas con París reactivo");
