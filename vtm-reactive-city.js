"use strict";
/* CRÓNICAS DE PARÍS · Fase XVI — París reactivo.
 * Primer caso sistémico: robo nocturno en Bastilla.
 * La simulación avanza por reloj, incluso con el PJ fuera del distrito.
 * Memoria social, pistas, presencia policial y rumores persistentes.
 */
window.VTM_REACTIVE_CITY=(()=>{
 const START=22*60+15, POLICE=22*60+30, SEARCH=23*60, END=24*60+10;
 const ID="bastilla-robo-01";
 const milestones=[
  {id:"robbery",at:START,text:"Se produjo un robo en una calle de Bastilla."},
  {id:"patrol",at:POLICE,text:"Una patrulla llegó para recoger los primeros testimonios."},
  {id:"search",at:SEARCH,text:"Los agentes iniciaron la búsqueda; los comerciantes intercambian versiones."}
 ];
 const rumorTargets={
  robbery:["bastilla"],
  patrol:["bastilla","stjuly"],
  search:["bastilla","stjuly","policia"]
 };
 const rumorText={
  robbery:"Un peatón fue asaltado cerca del cruce de Bastilla.",
  patrol:"La policía llegó a Bastilla tras un robo nocturno.",
  search:"La policía busca a un sospechoso; varios testigos ofrecen versiones diferentes."
 };
 let bridge=null;
 function bind(api){bridge=api;}
 function clock(g){return (g.clock.minutes<12*60?g.clock.minutes+1440:g.clock.minutes);}
 function initialNight(g){return g.clock.minutes<12*60?g.clock.night+1:g.clock.night;}
 function time(g,s){return (g.clock.night-s.night)*1440+clock(g);}
 function init(g){
  if(!g||typeof g!=="object")return null;
  let s=g.reactiveCity;
  if(!s||typeof s!=="object"||Array.isArray(s))s=g.reactiveCity={};
  if(!s.case||typeof s.case!=="object"||Array.isArray(s.case)){
   s.case={id:ID,night:initialNight(g),stage:"pending",outcome:null,history:[],flags:{},attempts:{},memory:{witness:0,police:0,neighbors:0}};
  }
  const c=s.case;
  if(c.id!==ID){c.id=ID;c.night=initialNight(g);c.stage="pending";c.outcome=null;c.history=[];c.flags={};c.attempts={};c.memory={witness:0,police:0,neighbors:0};}
  c.night=Math.max(1,Math.floor(Number(c.night)||initialNight(g)));
  c.flags=c.flags&&typeof c.flags==="object"&&!Array.isArray(c.flags)?c.flags:{};
  c.attempts=c.attempts&&typeof c.attempts==="object"&&!Array.isArray(c.attempts)?c.attempts:{};
  c.memory=c.memory&&typeof c.memory==="object"&&!Array.isArray(c.memory)?c.memory:{witness:0,police:0,neighbors:0};
  for(const p of ["witness","police","neighbors"])c.memory[p]=Math.max(-3,Math.min(3,Number(c.memory[p])||0));
  c.history=Array.isArray(c.history)?c.history.filter(x=>x&&typeof x.text==="string").slice(-28):[];
  if(!["pending","robbery","patrol","search","closed"].includes(c.stage))c.stage="pending";
  if(!["detained","escaped","unresolved","concealed","retrieved",null].includes(c.outcome))c.outcome=null;
  s.rumors=Array.isArray(s.rumors)?s.rumors.filter(x=>x&&typeof x.id==="string"&&typeof x.district==="string").slice(-24):[];
  return s;
 }
 function history(s,id,text,at){
  if(s.history.some(e=>e.id===id))return false;
  s.history.push({id,text,at});s.history=s.history.slice(-28);return true;
 }
 function spread(g,id,at,targets,text){
  const s=init(g);const out=[];
  for(const district of targets){
   const key=id+":"+district;
   if(s.rumors.some(x=>x.id===key))continue;
   const rumor={id:key,district,text,at,night:s.case.night};
   s.rumors.push(rumor);out.push(rumor);
  }
  s.rumors=s.rumors.slice(-24);return out;
 }
 function resultFor(c){
  if(c.flags.concealed)return "concealed";
  if(c.flags.reported&&(c.flags.testimony||c.flags.evidence||c.flags.camera||c.flags.intervened))return "detained";
  if(c.flags.intervened)return "retrieved";
  if(c.flags.testimony||c.flags.evidence||c.flags.camera)return "escaped";
  return "unresolved";
 }
 const resolutions={
  detained:"Con información contrastada, la policía localiza y detiene a un sospechoso. El expediente sigue abierto hasta que se verifiquen todas las pruebas.",
  escaped:"Los testimonios y la documentación quedaron sin comunicar a tiempo. El sospechoso escapó; la policía conserva una descripción.",
  unresolved:"El robo quedó sin esclarecer. Los vecinos comentan que las patrullas llegan tarde y los testigos evitan implicarse.",
  concealed:"La intervención del investigador ocultó parte de las pruebas. Los vecinos y la policía sospechan que alguien manipuló lo ocurrido.",
  retrieved:"La intervención permitió recuperar pertenencias, pero el sospechoso no fue detenido y permanece libre."
 };
 function tick(g,throughNight=false){
  const s=init(g);if(!s)return[];
  const c=s.case,now=throughNight&&g.clock.night===c.night?END:time(g,c),changes=[];
  if(c.outcome)return changes;
  if(now<START)return changes;
  for(const m of milestones){
   if(now<m.at)continue;
   if(history(c,m.id,m.text,m.at)){
    changes.push({type:m.id,text:m.text});
    spread(g,m.id,m.at,rumorTargets[m.id],rumorText[m.id]);
   }
  }
  c.stage=now>=SEARCH?"search":now>=POLICE?"patrol":"robbery";
  if(now>=END){
   c.outcome=resultFor(c);c.stage="closed";
   const message=resolutions[c.outcome];
   if(history(c,"resolution",message,END))changes.push({type:"resolution",text:message});
   spread(g,"resolution",END,["bastilla","stjuly","policia","hemeroteca"],message);
  }
  return changes;
 }
 function visible(g){
  const s=init(g)?.case;
  if(!s||s.stage==="pending"||s.stage==="closed"||g.scene!=="district"||g.district!=="bastilla")return[];
  const now=time(g,s);
  const actors=[
   {id:"scene",x:247,y:215,title:"Lugar del robo",kind:"clue"},
   {id:"witness",x:185,y:213,title:"Testigo nerviosa",kind:"npc"}
  ];
  if(now<POLICE&&!s.flags.intervened)actors.push({id:"suspect",x:216,y:168,title:"Sospechoso que huye",kind:"npc"});
  if(now>=POLICE)actors.push({id:"officer",x:295,y:214,title:"Agente de policía",kind:"npc"});
  return actors;
 }
 function near(g,range=29){
  return visible(g).map(p=>({...p,d:Math.hypot(g.x-p.x,g.y-p.y)}))
   .filter(p=>p.d<=range).sort((a,b)=>a.d-b.d)[0]||null;
 }
 function active(g){
  const c=init(g)?.case;
  return c?.stage!=="pending"&&c?.stage!=="closed";
 }
 function mutate(g,flag,text,adjust={}){
  const s=init(g),c=s.case;if(c.flags[flag]||c.outcome)return false;
  c.flags[flag]=true;
  for(const [id,value]of Object.entries(adjust))c.memory[id]=Math.max(-3,Math.min(3,c.memory[id]+value));
  history(c,"action-"+flag,text,time(g,c));
  bridge?.log?.(text);bridge?.refresh?.();bridge?.save?.();return true;
 }
 function respond(g,description,success,next){
  bridge?.ask?.(success?"Un avance verificable":"La investigación se complica",description,
   [{label:"Continuar",action:()=>next?.()}],"BASTILLA · INVESTIGACIÓN");
 }
 function roll(g,flag,attr,skill,diff,yes,no,adjust={}){
  const c=init(g).case;
  if(c.flags[flag]||c.attempts[flag]===g.clock.night||c.outcome)return;
  const r=bridge?.roll?.(attr,skill,diff)||{success:false,dice:[]};
  c.attempts[flag]=g.clock.night;
  if(r.success)mutate(g,flag,yes,adjust);
  else{
   history(c,"failed-"+flag+"-"+g.clock.night,no,time(g,c));
   if(flag==="testimony")c.memory.witness=Math.max(-3,c.memory.witness-1);
   if(flag==="intervened")c.memory.police=Math.max(-3,c.memory.police-1);
   bridge?.log?.(no);bridge?.save?.();
  }
  bridge?.advance?.(8);
  respond(g,(r.success?yes:no)+"\n\nTirada: "+attr+" + "+skill+", dificultad "+diff+". Dados: "+(r.dice||[]).join(", ")+".",r.success);
 }
 function scene(g,spot){
  const c=init(g).case;
  if(c.outcome)return bridge?.ask?.("El incidente ya terminó",resolutions[c.outcome],[{label:"Continuar",action:()=>{}}],"BASTILLA · CONSECUENCIAS");
  const options=[];
  if(spot==="witness"){
   if(!c.flags.testimony&&c.attempts.testimony!==g.clock.night){
    options.push({label:"Escucharla · Carisma + Empatía (dif. 6)",action:()=>roll(g,"testimony","Carisma","Empatía",6,
     "La testigo identifica la ropa y dirección de huida del ladrón; acepta que conste su declaración.",
     "La testigo no confía en vos y todavía se niega a declarar.",{witness:1,neighbors:1})});
   }
   if(!c.flags.intimidated&&c.attempts.intimidated!==g.clock.night){
    options.push({label:"Presionarla para que calle · Manipulación + Intimidación (dif. 7)",action:()=>{
     const res=bridge?.roll?.("Manipulación","Intimidación",7)||{success:false,dice:[]};
     c.attempts.intimidated=g.clock.night;
     if(res.success)mutate(g,"intimidated","La testigo se marcha aterrorizada y evita hablar del caso.",{witness:-2,police:-1});
     else{history(c,"threat", "La testigo pide ayuda tras sentirse amenazada.",time(g,c));bridge?.save?.();}
     bridge?.exposure?.(3,"Una amenaza a una testigo mortal atrae atención innecesaria.");
     bridge?.advance?.(8);
     respond(g,res.success?"La testigo abandona el lugar, pero la policía puede recibir otros testimonios.":"La testigo se aleja buscando protección.",res.success);
    }});
   }
   return bridge?.ask?.("Madeleine Vial — testigo","Una mujer mortal presenció el robo. Tiembla y mira constantemente hacia la avenida. No conoce el mundo de los Vástagos.",
    [...options,{label:"Dejarla tranquila",action:()=>{}}],"BASTILLA · TESTIGO");
  }
  if(spot==="suspect"){
   if(c.flags.intervened||c.attempts.intervened===g.clock.night)return;
   return bridge?.ask?.("Sospechoso en fuga","El joven mira por encima del hombro y corre hacia las calles secundarias. Podés intentar interceptarlo sin matar ni utilizar poderes en público.",
    [{label:"Intervenir · Destreza + Atletismo (dif. 7)",action:()=>roll(g,"intervened","Destreza","Atletismo",7,
      "Conseguís interceptar al ladrón y recuperar un bolso. El sospechoso logra apartarse, pero su huida queda documentada.",
      "Perdés al sospechoso entre la gente. El forcejeo atrae miradas.",{neighbors:1})},
     {label:"No perseguir",action:()=>{}}],"BASTILLA · PERSECUCIÓN");
  }
  if(spot==="scene"){
   if(!c.flags.evidence&&c.attempts.evidence!==g.clock.night){
    options.push({label:"Examinar la escena · Percepción + Investigación (dif. 6)",action:()=>roll(g,"evidence","Percepción","Investigación",6,
      "Encontrás un objeto caído durante el forcejeo y conservás un detalle identificable para contrastarlo.",
      "El tránsito y la lluvia dificultan reconstruir los movimientos.",{police:1})});
   }
   if((c.flags.evidence||c.flags.intervened)&&!c.flags.concealed){
    options.push({label:"Ocultar las pruebas recuperadas",action:()=>{
      mutate(g,"concealed","Ocultás elementos que podrían ayudar a resolver el robo. Los testigos notan tu intervención.",{neighbors:-2,police:-2});
      bridge?.advance?.(5);respond(g,"Los efectos no son inmediatos. La policía seguirá buscando, pero dispondrá de menos información.",true);
    }});
   }
   return bridge?.ask?.("Escena del robo","Restos dispersos y marcas de forcejeo. La lluvia y los pasos de los curiosos hacen cada vez más difícil verificar los indicios.",
    [...options,{label:"Alejarte",action:()=>{}}],"BASTILLA · EVIDENCIAS");
  }
  if(spot==="officer"){
   if(!c.flags.reported){
    options.push({label:"Entregar información a la policía",action:()=>{
     if(c.flags.concealed)return respond(g,"Ya retiraste deliberadamente parte de las pruebas. La declaración no puede deshacer lo sucedido.",false);
     if(!(c.flags.testimony||c.flags.evidence||c.flags.camera||c.flags.intervened))
      return respond(g,"El agente solicita un testimonio verificable o pruebas concretas antes de iniciar una detención.",false);
     mutate(g,"reported","La policía recibe información verificable y activa una búsqueda dirigida.",{police:2,neighbors:1});
     bridge?.advance?.(10);respond(g,"La patrulla incorpora las pruebas al informe. La detención no se considera automática hasta que avance la investigación.",true);
    }});
   }
   return bridge?.ask?.("Agente Laurent — policía","El agente está trabajando en el robo. No conoce la existencia de vampiros. Sus decisiones dependen de testimonios y pruebas, no de la autoridad de la Camarilla.",
    [...options,{label:"No intervenir",action:()=>{}}],"BASTILLA · INVESTIGACIÓN POLICIAL");
  }
 }
 function interact(g){
  const spot=near(g);
  if(!spot)return false;
  scene(g,spot.id);return true;
 }
 function atShop(g,shop){
  if(!shop)return null;
  const s=init(g),c=s.case;
  const rumors=s.rumors.filter(x=>x.district===shop.district);
  if(!rumors.length)return null;
  return{latest:rumors[rumors.length-1],count:rumors.length,eligible:!c.outcome&&shop.id==="bastilla-bar"&&!c.flags.camera&&c.attempts.camera!==g.clock.night};
 }
 function shopChoices(g,shop){
  const entry=atShop(g,shop);if(!entry)return[];
  const options=[{label:"Preguntar por los rumores del robo en Bastilla",action:()=>{
   const key="rumor:"+shop.id, s=init(g),was=!!s.case.flags[key];
   if(!was){s.case.flags[key]=true;history(s.case,"heard-"+shop.id,"Conociste el relato difundido en "+shop.name+".",time(g,s.case));bridge?.save?.();}
   bridge?.ask?.("Rumores de Bastilla",entry.latest.text+"\n\nLos comerciantes transmiten versiones diferentes. Un rumor no equivale a una prueba.",
    [{label:"Continuar",action:()=>{}}],"PARÍS · RUMORES");
  }}];
  if(entry.eligible){
   options.push({label:"Pedir el registro de la cámara del bar · Carisma + Etiqueta (dif. 7)",action:()=>{
    roll(g,"camera","Carisma","Etiqueta",7,
     "Sofiane permite revisar un registro horario del bar que corrobora la presencia de una persona huyendo. La policía podrá contrastarlo.",
     "El encargado rechaza entregar material privado sin más garantías.",{neighbors:1,police:1});
   }});
  }
  return options;
 }
 function draw(c,g,time=0){
  if(g.scene!=="district"||g.district!=="bastilla")return;
  const sprites=visible(g);if(!sprites.length)return;
  const r=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);};
  for(const p of sprites){
   const wobble=Math.sin(time*2+p.x)*1.5;
   if(p.kind==="clue"){
    r(p.x-14,p.y-3,27,7,"#4c3d48");r(p.x-8,p.y-5,16,8,"#b7a07b");
   }else{
    r(p.x-5,p.y+6,12,3,"#10111aaa");
    r(p.x-4,p.y-9,8,16,p.id==="officer"?"#4b627e":p.id==="suspect"?"#714c52":"#86707c");
    r(p.x-3,p.y-15,6,7,"#c5a08d");
    r(p.x-4,p.y-17,8,3,"#38333b");
   }
   r(p.x-7,p.y-33+wobble,14,12,"#271b29");
   r(p.x-5,p.y-31+wobble,10,8,"#d6aa84");
   c.fillStyle="#29202b";c.font="bold 9px monospace";c.textAlign="center";c.fillText("!",p.x,p.y-25+wobble);
  }
 }
 function news(g){
  const s=init(g),c=s.case;
  const relevant=s.rumors.slice(-7).map(r=>"- "+r.district.toUpperCase()+": "+r.text).join("\n");
  const state=c.outcome?resolutions[c.outcome]:c.stage==="pending"?"Todavía no hay noticia del incidente.":c.stage==="robbery"?"Se ha producido un robo. La policía aún no ha llegado.":c.stage==="patrol"?"Una patrulla escucha a los testigos.":"La policía busca al responsable.";
  const known=Object.entries(c.flags).filter(([k,v])=>v&&["testimony","evidence","camera","intervened","reported","intimidated","concealed"].includes(k)).map(([k])=>({
   testimony:"Testimonio de una vecina",evidence:"Indicio físico",camera:"Registro comercial",intervened:"Intervención ante el ladrón",
   reported:"Información entregada a la policía",intimidated:"Testigo presionada",concealed:"Pruebas ocultadas"
  })[k]);
  return"EL ROBO DE BASTILLA\n\n"+state+"\n\nIndicios y decisiones:\n"+(known.join("\n")||"Sin intervención del jugador.")+
   "\n\nEcos por los barrios:\n"+(relevant||"Todavía no llegaron rumores.")+
   "\n\nReacción de los PNJ: testigo "+c.memory.witness+", policía "+c.memory.police+", vecindario "+c.memory.neighbors+".";
 }
 function summary(g){
  const s=init(g),c=s.case;
  return{stage:c.stage,outcome:c.outcome,night:c.night,rumors:s.rumors.length,actions:Object.keys(c.flags).filter(k=>c.flags[k]).length,
   timeline:c.history.map(x=>x.text),memory:{...c.memory},active:active(g)};
 }
 function menu(){
  const g=bridge?.getGame?.();if(!g)return;
  const spot=near(g),items=[];
  if(spot)items.push({label:"Intervenir: "+spot.title,action:()=>scene(g,spot.id)});
  items.push({label:"Cerrar",action:()=>{}});
  bridge?.ask?.("París reactivo — Bastilla",news(g),items,"FASE XVI · MUNDO REACTIVO");
 }
 return Object.freeze({bind,init,tick,near,visible,active,draw,interact,atShop,shopChoices,news,summary,menu,START,POLICE,SEARCH,END,version:"16.0"});
})();