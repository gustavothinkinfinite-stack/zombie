"use strict";
/* node tests/principado-prologue.test.js
 * Fase XXI preliminar: sólo un dossier contrastado, sin revelar la conspiración. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),window={};
window.VTM_STORY={init:g=>{g.story=g.story||{xp:0,totalXp:0};return g.story;}};
vm.runInNewContext(fs.readFileSync(path.join(root,"vtm-principado.js"),"utf8"),{window});
const P=window.VTM_PRINCIPADO;
const create=()=>({
 version:1,character:{clan:"Nosferatu",name:"Personaje"},clock:{night:1,minutes:1215},
 scene:"venue",venue:"policia",x:240,y:200,story:{xp:0,totalXp:0},
 access:{elysee:true},history:["Otro caso sin modificar"],elizabeth:{status:"active"}
});
const run=(name,fn)=>{fn();console.log("OK:",name);};
const bridge=(g,good=true)=>{const prompts=[],logs=[];
 P.bind({getGame:()=>g,ask:(title,body,options)=>prompts.push({title,body,options}),
  roll:()=>({success:good,dice:good?[9,8]:[2,1],net:good?2:0}),
  log:s=>logs.push(s),refresh:()=>{},save:()=>{},
  exposure:()=>{},advance:minutes=>{g.clock.minutes=(g.clock.minutes+minutes)%1440}});
 return {prompts,logs};};
run("Migración sin destruir historias y aceptacion explícita de nuevo hilo",()=>{
 const g=create();const s=P.init(g);
 assert.equal(s.accepted,false);
 assert.equal(P.summary(g).found,0);
 assert.equal(g.elizabeth.status,"active");
 assert.equal(g.history[0],"Otro caso sin modificar");
 assert.equal(P.start(g),true);assert.equal(P.start(g),false);
});
run("Las pistas sólo pueden comprobarse en el lugar pertinente",()=>{
 const g=create();P.start(g);bridge(g);
 assert.match(P.investigate(g,"stjuly").error,/aquí/);
 assert.equal(P.summary(g).found,0);
});
run("Un éxito incorpora una fuente sin duplicar experiencia",()=>{
 const g=create();P.start(g);bridge(g);
 assert.equal(P.investigate(g,"policia").success,true);
 assert.equal(g.story.xp,1);assert.equal(g.story.totalXp,1);
 assert.match(P.investigate(g,"policia").error,/aquí/);
 assert.equal(g.story.xp,1);
});
run("Una investigación fallida puede reintentarse solamente otra noche",()=>{
 const g=create();P.start(g);bridge(g,false);
 assert.equal(P.investigate(g,"policia").success,false);
 assert.match(P.investigate(g,"policia").error,/esta noche/);
 g.clock.night++;bridge(g,true);
 assert.equal(P.investigate(g,"policia").success,true);
});
run("Tres fuentes habilitan un dossier pero no suplantan audiencias",()=>{
 const g=create();P.start(g);bridge(g,true);
 for(const id of ["policia","hemeroteca","stjuly"]){
  g.venue=id;
  assert.equal(P.investigate(g,id).success,true);
 }
 assert.equal(P.count(g),3);
 g.venue="stjuly";
 assert.match(P.submit(g).error,/Elíseo/);
 g.venue="elysee";
 assert.equal(P.submit(g).success,true);
 assert.equal(g.principado.dossier,true);
 assert.equal(g.story.xp,6); // 1+1+1+3
 assert.equal(P.submit(g).error!=null,true);
});
run("Sin permiso al Elíseo no puede presentarse el dossier",()=>{
 const g=create();P.start(g);bridge(g);
 for(const id of ["policia","hemeroteca","stjuly"]){g.venue=id;P.investigate(g,id);}
 g.venue="elysee";g.access.elysee=false;
 assert.match(P.submit(g).error,/permiso/);
});
run("Los contenidos no contienen la identidad oculta del Senescal",()=>{
 const source=fs.readFileSync(path.join(root,"vtm-principado.js"),"utf8");
 const publicContent=P.THREADS.map(t=>t.success+" "+t.fail+" "+t.premise).join(" ");
 for(const secret of ["impostora","usurpadora","anarquista","Etienne Moreau","sexta generación"])
  assert.equal(publicContent.toLowerCase().includes(secret.toLowerCase()),false);
 assert.ok(!source.includes("Etienne Moreau"));
});
run("El hilo es serializable y no altera la partida anterior",()=>{
 const g=create();P.start(g);bridge(g);
 P.investigate(g,"policia");
 const serialized=JSON.parse(JSON.stringify(g));
 assert.equal(P.summary(serialized).found,1);
 assert.equal(serialized.elizabeth.status,"active");
});
run("El juego y los scripts incluyen el prólogo sin cambiar la clave de guardado",()=>{
 const html=fs.readFileSync(path.join(root,"index.html"),"utf8"),
  game=fs.readFileSync(path.join(root,"vtm-game.js"),"utf8");
 assert.ok(html.includes("vtm-principado.js?"));
 assert.ok(html.indexOf("vtm-principado.js?")<html.indexOf("vtm-game.js?"));
 assert.ok(game.includes("PRINC.init(game)"));
 assert.ok(game.includes("PRINC.menu"));
 assert.ok(game.includes("PRINC.summary(game)"));
 assert.ok(game.includes('SAVE_KEY="cronicas-paris-ghoul-v1"'));
 new Function(game);
});
console.log("OK: Conspiración del Principado, primer dossier");
