"use strict";
/*
 * Expedientes secundarios encadenados. Cuatro tramas ambientales de cuatro
 * establecimientos cada una, sin implicar hechos del canon principal.
 * El estado es determinista y persistente, las tiradas las realiza el motor.
 */
window.VTM_LOCAL_CASES=(()=>{
 const definitions=[
  {id:"entregas",title:"Entregas sin destinatario",faction:"nosferatu",
   premise:"Un conjunto de entregas nocturnas aparece en recibos dispersos. El motivo todavía es desconocido.",
   steps:["passy-conserjeria","stjuly-floristeria","saintdenis-lavanderia","tuneles-almacen"],
   conclusion:"Los horarios y comprobantes sugieren una misma cadena logística nocturna, sin identificar quién la dirige."},
  {id:"papeles",title:"Las páginas extraviadas",faction:"tremere",
   premise:"Documentos y recortes de distintas instituciones presentan pequeñas inconsistencias.",
   steps:["hemeroteca-libreria","hemeroteca-encuadernacion","policia-copisteria","elysee-notaria"],
   conclusion:"La comparación identifica anomalías de archivo; no determina si son errores, fraude o encubrimiento."},
  {id:"vehiculos",title:"La ruta de los coches",faction:"brujah",
   premise:"Varias personas mencionan vehículos y rutas que cambian según la hora de la noche.",
   steps:["stjuly-cafe","saintdenis-reparaciones","policia-cafeteria","bastilla-bar"],
   conclusion:"Los testimonios y las reparaciones reconstruyen una ruta probable, pero no a sus ocupantes."},
  {id:"objetos",title:"Objetos fuera de lugar",faction:"camarilla",
   premise:"Objetos, registros y grabaciones aparecen sin que sus propietarios puedan explicar su recorrido.",
   steps:["passy-anticuario","elysee-galeria","bastilla-estudio","tuneles-electronica"],
   conclusion:"Las señales vinculan varios intermediarios locales; ninguna prueba basta para acusar a la corte."}
 ];
 const validShops=()=>window.VTM_SHOPS?.byId||{};
 const byId=Object.fromEntries(definitions.map(d=>[d.id,d]));
 const byShop=Object.fromEntries(definitions.flatMap(d=>d.steps.map((s,i)=>[s,{caseId:d.id,index:i}])));
 const choices=[
  {id:"report",label:"Presentar un informe reservado a un contacto político"},
  {id:"archive",label:"Archivar las pruebas y mantenerlas fuera de circulación"},
  {id:"witnesses",label:"Informar discretamente a los testigos implicados"}
 ];
 const nInt=(value,min,max)=>Math.max(min,Math.min(max,Number.isFinite(Number(value))?Math.floor(Number(value)):min));
 const night=game=>nInt(game?.clock?.night,1,100000);
 function empty(){return{evidence:[],attempts:{},resolution:null,completedNight:0,startedNight:0};}
 function init(game){
  if(!game||typeof game!=="object")return {};
  const data=game.localCases&&typeof game.localCases==="object"&&!Array.isArray(game.localCases)?game.localCases:{};
  const normalized={};
  for(const d of definitions){
   const raw=data[d.id]&&typeof data[d.id]==="object"?data[d.id]:{};
   const r=empty();
   const rawEvidence=Array.isArray(raw.evidence)?raw.evidence:[];
   // Orden estricto: no se puede inventar una prueba a mitad de la cadena.
   for(const shop of d.steps){
    if(rawEvidence.includes(shop))r.evidence.push(shop);
    else break;
   }
   const tries=raw.attempts&&typeof raw.attempts==="object"?raw.attempts:{};
   for(const shop of d.steps)if(Number.isFinite(Number(tries[shop]))&&Number(tries[shop])>0)r.attempts[shop]=nInt(tries[shop],1,100000);
   r.resolution=choices.some(c=>c.id===raw.resolution)?raw.resolution:null;
   r.completedNight=r.resolution?nInt(raw.completedNight,1,100000):0;
   r.startedNight=nInt(raw.startedNight,0,100000);
   // Conserva las pistas que ya existían en la versión anterior sin volver
   // a cobrar recompensas ni alterar conversaciones originales.
   if(!r.resolution){
    for(const shop of d.steps.slice(r.evidence.length)){
     if(!Array.isArray(game.localClues)||!game.localClues.includes(shop))break;
     r.evidence.push(shop);
    }
   }
   if(r.evidence.length&&!r.startedNight)r.startedNight=night(game);
   normalized[d.id]=r;
  }
  game.localCases=normalized;
  return normalized;
 }
 function progress(game,id){
  init(game);const d=byId[id],r=game.localCases[id];
  if(!d)return null;
  const count=r.evidence.length;
  return{...d,count,total:d.steps.length,complete:!!r.resolution,
    ready:count===d.steps.length&&!r.resolution,mode:r.resolution,
    nextShop:count<d.steps.length?validShops()[d.steps[count]]||null:null};
 }
 function atShop(game,shop){
  if(!shop||!byShop[shop.id])return null;
  const {caseId,index}=byShop[shop.id],p=progress(game,caseId);
  if(p.complete)return{...p,eligible:false,reason:"Expediente resuelto.",index};
  if(index<p.count)return{...p,eligible:false,reason:"Ya contrastaste las pruebas en este lugar.",index};
  if(index>p.count)return{...p,eligible:false,reason:"Antes necesitás comprobar otra fuente.",index};
  return{...p,eligible:true,previous:index>0?validShops()[p.steps[index-1]]||null:null,
    priorEvidence:Array.isArray(game.localClues)&&game.localClues.includes(shop.id),
    blockedUntil:(game.localCases[caseId].attempts[shop.id]||0)>=night(game),index};
 }
 function attempt(game,shop,success){
  const available=atShop(game,shop);
  if(!available?.eligible||available.blockedUntil)return null;
  const row=game.localCases[available.id];
  if(!available.priorEvidence)row.attempts[shop.id]=night(game);
  if(!success&&!available.priorEvidence)return{success:false,id:available.id,title:available.title,
    message:"No pudiste corroborar la pista. Podrás revisar esta fuente en otra noche."};
  if(row.evidence.length===0)row.startedNight=night(game);
  row.evidence.push(shop.id);
  if(!Array.isArray(game.localClues))game.localClues=[];
  if(!game.localClues.includes(shop.id))game.localClues.push(shop.id);
  const p=progress(game,available.id);
  return{success:true,id:available.id,title:p.title,
    message:shop.clue,
    next:p.nextShop?{id:p.nextShop.id,name:p.nextShop.name,district:p.nextShop.district}:null,
    ready:p.ready,count:p.count,total:p.total};
 }
 function resolve(game,id,choice){
  const p=progress(game,id);
  if(!p||!p.ready||!choices.some(c=>c.id===choice))return null;
  const row=game.localCases[id];row.resolution=choice;row.completedNight=night(game);
  const effect=choice==="report"?{faction:p.faction,standing:2,exposure:2}:
    choice==="archive"?{faction:null,standing:0,exposure:-4}:
    {faction:"brujah",standing:1,exposure:0};
  const story=choice==="report"?
   "Entregaste un informe discreto a una red política local. La colaboración abre puertas, pero alguien sabe que estuviste investigando.":
   choice==="archive"?
   "Conservaste las pruebas sin difundirlas. Reducís la posibilidad de que tus pesquisas llamen la atención.":
   "Avisaste a las personas mencionadas en tus notas sin formular acusaciones. Los testigos están prevenidos.";
  return{...effect,title:p.title,mode:choice,conclusion:p.conclusion,text:story,completedNight:row.completedNight};
 }
 function summary(game){
  init(game);
  const data=definitions.map(d=>progress(game,d.id));
  return{total:definitions.length,completed:data.filter(p=>p.complete).length,
    ready:data.filter(p=>p.ready).length,evidence:data.reduce((n,p)=>n+p.count,0),
    maxEvidence:definitions.reduce((n,d)=>n+d.steps.length,0),
    cases:data};
 }
 return Object.freeze({definitions,byId,byShop,choices,init,progress,atShop,attempt,resolve,summary,version:"1.0"});
})();