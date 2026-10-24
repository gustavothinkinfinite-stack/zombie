"use strict";
/* node tests/conspiracy-phase21.test.js
 * Campaña completa: pruebas, PNJ, presión, cuatro finales y protección de spoilers.
 */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),window={},cases=[];
window.VTM_STORY={init:g=>{g.story=g.story||{xp:0,totalXp:0};return g.story;}};
window.VTM_COURT={addCase:(g,tradition,source,evidence,description)=>{
 cases.push({tradition,source,evidence,description});
 g.court=g.court||{cases:[]};g.court.cases.push({tradition,source});
}};
vm.runInNewContext(fs.readFileSync(path.join(root,"vtm-conspiracy.js"),"utf8"),{window});
const C=window.VTM_CONSPIRACY;
const fresh=()=>({character:{name:"Jugador",clan:"Toreador"},clock:{night:3,minutes:1200},
 scene:"venue",venue:"elysee",access:{elysee:true},principado:{dossier:true},
 story:{xp:0,totalXp:0},exposure:0,factions:{camarilla:0,nosferatu:0,brujah:0,tremere:0},
 npcRelations:{},elizabeth:{status:"open"},history:["No borrar historia"]});
const bind=(g,good=true)=>{const dialogs=[],events=[],state={rollSuccess:good};
 C.bind({getGame:()=>g,ask:(title,body,options)=>dialogs.push({title,body,options}),
  roll:()=>({success:state.rollSuccess,net:state.rollSuccess?3:0,dice:state.rollSuccess?[9,9,8]:[1,2,4]}),
  log:t=>events.push(t),save:()=>{},refresh:()=>{},advance:n=>{g.clock.minutes=(g.clock.minutes+n)%1440},
  exposure:n=>{g.exposure+=n},faction:(id,n)=>{g.factions[id]=(g.factions[id]||0)+n}});
 return{dialogs,events,state};
};
const move=(g,id)=>{const lead=C.LEADS.find(l=>l.id===id);g.scene="venue";g.venue=lead.place;};
const actLeads={1:["despacho","prensa","mensajes"],2:["ingrid","lucien","isabelle"],3:["firma","imagen","interrogatorio"]};
const run=(title,fn)=>{cases.length=0;fn();console.log("OK:",title);};
function complete(g,{protect=false}={}){
 C.start(g);
 for(const act of [1,2,3]){
  for(const id of actLeads[act]){
   move(g,id);const result=C.investigate(g,id,id==="lucien"?"witness":"document");
   assert.equal(result.success,true,id);
   if(protect&&["despacho","prensa","ingrid","lucien"].includes(id)){
    const status=C.protect(g,id,"protect");assert.equal(status.success,true,id);
   }
  }
  assert.equal(C.count(g,act),3);
  const advance=C.closeAct(g);assert.equal(advance.advanced,true);
  assert.equal(advance.chapter,act+1);
 }
 g.scene="venue";g.venue="elysee";
}
run("No empieza la campaña antes de presentar el dossier del prólogo",()=>{
 const g=fresh(),b=bind(g);g.principado.dossier=false;
 assert.match(C.start(g).error,/prólogo/);C.menu();
 assert.ok(!b.dialogs.at(-1).body.includes("Etienne Moreau"));
 assert.equal(C.summary(g).started,false);
});
run("Comenzar es explícito y no borra la investigación Elizabeth Parker",()=>{
 const g=fresh();bind(g);assert.equal(C.start(g).started,true);
 assert.match(C.start(g).error,/abierta/);
 assert.equal(g.elizabeth.status,"open");assert.deepEqual(g.history,["No borrar historia"]);
 assert.equal(C.summary(g).chapter,1);
});
run("Doce pistas únicas y cuatro puntos de investigación por acto",()=>{
 assert.equal(C.LEADS.length,12);
 assert.equal(new Set(C.LEADS.map(l=>l.id)).size,12);
 for(const act of [1,2,3])assert.equal(C.LEADS.filter(l=>l.act===act).length,4);
});
run("Pista rechazada fuera de lugar y un fracaso permite reintentar otra noche",()=>{
 const g=fresh(),b=bind(g);C.start(g);
 assert.match(C.investigate(g,"despacho").error,/visitar/);
 move(g,"despacho");b.state.rollSuccess=false;
 assert.equal(C.investigate(g,"despacho").success,false);
 assert.match(C.investigate(g,"despacho").error,/esta noche/);
 g.clock.night=4;b.state.rollSuccess=true;
 assert.equal(C.investigate(g,"despacho","witness").success,true);
 assert.equal(C.investigate(g,"despacho","document").error!=null,true);
 assert.equal(g.story.xp,2);
});
run("La verdad no se revela antes de contrastar tres actos",()=>{
 const g=fresh(),b=bind(g);C.start(g);
 for(const id of actLeads[1]){move(g,id);C.investigate(g,id);}
 assert.equal(C.summary(g).revealed,false);
 assert.ok(C.journal(g).every(line=>!line.includes("anarquista de sexta generación")));
 assert.equal(g.court,undefined);
 assert.equal(C.closeAct(g).chapter,2);
 assert.ok(!C.journal(g).join(" ").includes("usurpación"));
});
run("Tres actos independientes revelan la identidad sólo tras acción expresa",()=>{
 const g=fresh();bind(g);complete(g,{protect:true});
 assert.equal(C.summary(g).chapter,4);
 assert.equal(C.summary(g).revealed,true);
 assert.ok(C.journal(g).some(x=>x.includes("Senescal")));
 assert.ok(C.summary(g).protected>=2);
 assert.ok(C.summary(g).support.includes("nosferatu"));
 assert.ok(C.summary(g).support.includes("brujah"));
});
run("Los testigos presionados elevan sospecha sin borrar evidencia",()=>{
 const g=fresh();bind(g);C.start(g);move(g,"despacho");
 C.investigate(g,"despacho");const x=C.protect(g,"despacho","pressure");
 assert.equal(x.choice,"pressure");assert.equal(g.conspiracy.pressure,15);
 assert.ok(C.journal(g).some(x=>x.includes("presión")||x.includes("Conspiración")));
 assert.equal(C.investigate(g,"despacho").error!=null,true);
});
run("La presión evoluciona una vez por noche y no inutiliza pruebas conseguidas",()=>{
 const g=fresh();bind(g);C.start(g);g.exposure=75;
 g.clock.night=4;C.tick(g);
 const p=g.conspiracy.pressure;assert.ok(p>0);
 C.tick(g);assert.equal(g.conspiracy.pressure,p);
 move(g,"despacho");C.investigate(g,"despacho");
 assert.equal(C.count(g,1),1);
});
run("Final público exige testigos protegidos y suficiente evidencia",()=>{
 const g=fresh();bind(g);complete(g);
 assert.match(C.finaleAvailable(g,"council"),/dos testigos/);
 assert.equal(C.finaleAvailable(g,"silence"),null);
});
run("La corte recibe una acusación comprobada, sin condena o ejecución automática",()=>{
 const g=fresh();bind(g);complete(g,{protect:true});
 assert.equal(C.finaleAvailable(g,"council"),null);
 const result=C.conclude(g,"council");assert.equal(result.success,true);
 assert.equal(C.summary(g).ending,"council");
 assert.equal(cases.length,1);assert.equal(cases[0].tradition,"dominio");
 assert.equal(g.elizabeth.status,"open");
 assert.equal(C.conclude(g,"council").error!=null,true);
});
run("La alianza Nosferatu permite un desenlace sigiloso",()=>{
 const g=fresh();bind(g);complete(g,{protect:true});
 assert.equal(C.finaleAvailable(g,"shadows"),null);
 assert.equal(C.conclude(g,"shadows").ending,"shadows");
 assert.equal(cases.length,0);
});
run("La alianza Brujah permite una ruptura política de mayor presión",()=>{
 const g=fresh();bind(g);complete(g,{protect:true});const p=g.conspiracy.pressure;
 assert.equal(C.finaleAvailable(g,"rupture"),null);
 assert.equal(C.conclude(g,"rupture").ending,"rupture");
 assert.ok(g.conspiracy.pressure>p);
 assert.ok(g.factions.brujah>g.factions.camarilla);
});
run("Sellar expediente es un final voluntario, no una acusación fabricada",()=>{
 const g=fresh();bind(g);complete(g);
 assert.equal(C.conclude(g,"silence").ending,"silence");
 assert.equal(cases.length,0);
});
run("Tirada final fallida conserva prueba y permite reintentar otra noche",()=>{
 const g=fresh(),b=bind(g);complete(g,{protect:true});
 b.state.rollSuccess=false;assert.equal(C.conclude(g,"council").success,false);
 assert.equal(C.summary(g).ending,null);assert.equal(C.count(g,3),3);
 g.clock.night++;b.state.rollSuccess=true;
 assert.equal(C.conclude(g,"council").success,true);
});
run("Expediente y desenlaces sobreviven serialización sin recompensas duplicadas",()=>{
 const g=fresh();bind(g);complete(g,{protect:true});
 assert.equal(g.story.xp,27); // 9 pruebas x2 + 3 actos x3
 C.conclude(g,"council");assert.equal(g.story.xp,35);
 const stored=JSON.parse(JSON.stringify(g));assert.equal(C.summary(stored).ending,"council");
 assert.equal(stored.story.xp,35);
 assert.deepEqual(stored.history,["No borrar historia"]);
});
run("El orden de carga y los menús integran la fase sin cambiar la clave del guardado",()=>{
 const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
 const game=fs.readFileSync(path.join(root,"vtm-game.js"),"utf8");
 assert.ok(html.includes("FASE XXI"));
 assert.ok(html.indexOf("vtm-principado.js?")<html.indexOf("vtm-conspiracy.js?"));
 assert.ok(html.indexOf("vtm-conspiracy.js?")<html.indexOf("vtm-game.js?"));
 for(const needle of ["CONSP.init(game)","CONSP.tick(game)","CONSP.menu","CONSP.journal(game)","CONSP.summary(game)"])
  assert.ok(game.includes(needle),needle);
 assert.ok(game.includes('SAVE_KEY="cronicas-paris-ghoul-v1"'));
 new Function(game);
});
console.log("OK: Fase XXI · cuatro desenlaces, pruebas y conspiración");
