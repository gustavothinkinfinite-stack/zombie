"use strict";
/* Crónicas de París — audiencias de Pierre Duvalier, arbitraje y Tradiciones.
   Las seis Tradiciones conservan su temática; procedimientos, tiradas y sanciones son
   adaptaciones originales para el juego, no una tabla oficial del manual.
   No contiene revelaciones sobre la identidad ni los planes secretos de la Senescal. */
window.VTM_COURT=(()=>{
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const T={
  mascarada:{name:"Primera: La Mascarada",rule:"Proteger la existencia de los Vástagos frente a los mortales.",gravity:3},
  dominio:{name:"Segunda: El Dominio",rule:"Respetar la autoridad sobre los territorios y sus restricciones.",gravity:2},
  progenie:{name:"Tercera: La Progenie",rule:"No crear progenie sin la autorización correspondiente.",gravity:4},
  responsabilidad:{name:"Cuarta: La Responsabilidad",rule:"Responder por los actos del chiquillo mientras esté bajo tutela.",gravity:2},
  hospitalidad:{name:"Quinta: La Hospitalidad",rule:"Presentarse ante quien gobierna el dominio y respetar su acogida.",gravity:2},
  destruccion:{name:"Sexta: La Destrucción",rule:"No adjudicarse sin autorización el derecho de destruir a otro Vástago.",gravity:4}
 };
 const DISPUTES={
  bastilla:{title:"Las acusaciones tras el altercado de Saint-Denis",place:"bastilla",
   parties:"Lucien y un sector enfrentado a los Brujah leales",factions:["brujah","camarilla"],
   objective:"El príncipe quiere separar los testimonios fiables de las provocaciones en el barrio.",
   evidence:["bastilla","saintdenis"],support:["lucien"],reference:"brujahContact",
   good:"La corte acepta una reconstrucción prudente. Se ordena prevenir nuevos enfrentamientos, sin culpar a todo un clan.",
   weak:"Las versiones siguen enfrentadas. El príncipe solicita más testimonios antes de determinar responsabilidades."},
  passy:{title:"Disputa por una correspondencia de Passy",place:"passy",
   parties:"Los representantes de la Casa Tremere",factions:["tremere","camarilla"],
   objective:"Una comunicación llegó fuera de su cauce regular. La cuestión es administrativa, pero la confianza está en juego.",
   evidence:["passy","stjuly"],support:["isabelle"],reference:"tremereReference",
   good:"La documentación permite cerrar el incidente menor sin impugnar la autoridad del Regente.",
   weak:"La corte evita validar una acusación sin cadena documental y solicita informes adicionales."},
  tuneles:{title:"Los registros de accesos subterráneos",place:"tuneles",
   parties:"La red Nosferatu y los responsables de seguridad urbana",factions:["nosferatu","camarilla"],
   objective:"La existencia de referencias sensibles en archivos mortales preocupa a los habitantes del subsuelo.",
   evidence:["tuneles","policia"],support:["ingrid"],reference:"tunnelContact",
   good:"El príncipe autoriza una comprobación limitada para proteger rutas de acceso sin exponer a los informantes.",
   weak:"Sin pruebas suficientes, el asunto continúa reservado y ninguna parte recibe una condena."}
 };
 const PETITIONS={
  present:{title:"Solicitar reconocimiento ante el príncipe",attr:"Carisma",skill:"Etiqueta",difficulty:6},
  territory:{title:"Solicitar licencia limitada de caza",attr:"Manipulación",skill:"Política",difficulty:7},
  inquiry:{title:"Solicitar una investigación discreta",attr:"Inteligencia",skill:"Leyes",difficulty:7},
  apology:{title:"Pedir levantar una amonestación",attr:"Carisma",skill:"Etiqueta",difficulty:7}
 };
 const HUNT_DOMAINS={stjuly:"Casa Tremere",passy:"Casa Tremere",bastilla:"Brujah de Bastilla",tuneles:"Red Nosferatu",elysee:"Elíseo"};
 function init(g){
  let s=g.court&&typeof g.court==="object"&&!Array.isArray(g.court)?g.court:{};
  s.recognized=!!s.recognized;
  s.prestige=clamp(Math.floor(Number(s.prestige)||0),-30,50);
  s.permits=s.permits&&typeof s.permits==="object"?s.permits:{};
  s.cases=Array.isArray(s.cases)?s.cases.filter(x=>x&&T[x.tradition]&&["open","dismissed","warning","sanctioned"].includes(x.status)).slice(0,50):[];
  s.disputes=s.disputes&&typeof s.disputes==="object"?s.disputes:{};
  s.research=s.research&&typeof s.research==="object"?s.research:{};
  s.research.fragments=Array.isArray(s.research.fragments)?[...new Set(s.research.fragments.filter(k=>["policia","stjuly","passy","tuneles"].includes(k)))]:[];
  s.research.authorized=!!s.research.authorized;
  s.research.checked=Array.isArray(s.research.checked)?s.research.checked:[];
  s.audiences=s.audiences&&typeof s.audiences==="object"?s.audiences:{};
  s.sanctions=s.sanctions&&typeof s.sanctions==="object"?s.sanctions:{};
  s.sanctions.restrictedUntil=Math.max(0,Math.floor(Number(s.sanctions.restrictedUntil)||0));
  s.history=Array.isArray(s.history)?s.history.slice(0,60):[];
  s.lastExposureBand=clamp(Math.floor(Number(s.lastExposureBand)||0),0,2);
  s.idCounter=clamp(Math.floor(Number(s.idCounter)||0),0,99999);
  g.court=s;return s;
 }
 function addLog(g,summary){
  const c=init(g);c.history.unshift({night:g.clock.night,summary});c.history=c.history.slice(0,60);
 }
 function addCase(g,tradition,source,evidence,description){
  const c=init(g);
  if(!T[tradition]||!source)return null;
  const found=c.cases.find(x=>x.source===source&&x.tradition===tradition);
  if(found)return found;
  c.idCounter++;
  const value={id:c.idCounter,tradition,source,evidence:clamp(evidence,0,3),description,
    status:"open",openedNight:g.clock.night,hearingNight:0,decision:null};
  c.cases.push(value);
  addLog(g,"Se abrió una investigación preliminar: "+T[tradition].name+".");
  return value;
 }
 function exposureReview(g){
  if(!g?.embraced)return null;
  const c=init(g),band=g.exposure>=75?2:g.exposure>=45?1:0;
  if(band<=c.lastExposureBand)return null;
  c.lastExposureBand=band;
  // Rumor ≠ prueba. No hay sentencia automática por una barra de exposición.
  return addCase(g,"mascarada","exposure:"+band,band===1?0:1,
   band===1?"Rumores mortales que requieren verificación.":"Hay varios testimonios mortales sin corroborar sobre tus movimientos.");
 }
 function hunting(g,place,result){
  if(!g?.embraced||!result?.success||!HUNT_DOMAINS[place])return null;
  if(init(g).permits[place]>=g.clock.night)return null;
  if(!init(g).recognized){
   addCase(g,"hospitalidad","hunting-unrecognized:"+place,1,
     "La corte debe verificar si el Vástago se presentó antes de alimentarse en un dominio custodiado.");
  }
  const caseRecord=addCase(g,"dominio","hunting:"+g.clock.night+":"+place,1,
    "Consta una posible caza sin permiso en un dominio custodiado por "+HUNT_DOMAINS[place]+".");
  if(caseRecord)addLog(g,"La caza quedó registrada para una eventual audiencia, no como culpabilidad declarada.");
  return caseRecord;
 }
 function evidence(g,id){
  const d=DISPUTES[id];if(!d)return {score:0,items:[]};
  const items=[];
  const visited=g.arc?.visited||[];
  for(const x of d.evidence){
   if(g.story?.locations?.[x]?.success)items.push("Escena de "+x+" resuelta");
   else if(g.arc?.clues?.includes(x))items.push("Fuente documental de "+x);
   else if(g.politics?.errands && Object.entries(g.politics.errands).some(([who,s])=>
      s.status==="done"&&["lucien","isabelle","ingrid"].includes(who)&&x===window.VTM_POLITICS.PLAYERS[who]?.errand.target))items.push("Informe político sobre "+x);
   else if(visited.includes(x))items.push("Observaciones directas en "+x);
  }
  if(g.access?.[d.reference])items.push("Referencia personal corroborable");
  if(id==="bastilla"&&g.sideQuests?.lucien?.status==="done")items.push("Informe entregado a Lucien");
  if(id==="passy"&&g.sideQuests?.isabelle?.status==="done")items.push("Informe entregado a Isabelle");
  if(id==="tuneles"&&g.sideQuests?.ingrid?.status==="done")items.push("Informe entregado a Ingrid");
  return {score:items.length,items};
 }
 function canAudience(g,allowRestricted=false){
  if(!g?.embraced)return "Sólo los Vástagos pueden comparecer ante la corte";
  if(g.scene!=="venue"||g.venue!=="elysee")return "La audiencia se solicita dentro del Elíseo";
  if(!g.access?.elysee)return "Necesitás autorización de entrada al Elíseo";
  const c=init(g);
  if(c.audiences.petitionNight===g.clock.night)return "Ya compareciste ante el príncipe esta noche";
  if(!allowRestricted&&c.sanctions.restrictedUntil>=g.clock.night&&c.recognized)return "Debés resolver primero las restricciones de la corte";
  return null;
 }
 function audience(g,type,roll,meta={}){
  const c=init(g),rule=PETITIONS[type],access=canAudience(g,type==="apology");
  if(!rule||access)return {error:access||"Petición desconocida"};
  if(!roll||!Array.isArray(roll.dice)||typeof roll.success!=="boolean")return {error:"Tirada inválida"};
  if(type==="apology"&&!c.cases.some(x=>x.status==="warning"||x.status==="sanctioned"))return {error:"No hay sanción que reconsiderar"};
  if(type==="territory"&&!HUNT_DOMAINS[meta.place])return {error:"El destino no requiere esta autorización"};
  if(type!=="present"&&!c.recognized)return {error:"Primero debés ser reconocido por el príncipe"};
  c.audiences.petitionNight=g.clock.night;
  const sponsorship=!!(g.access?.courtReferral||g.access?.courtProtocol);
  const evidenceScore=type==="inquiry"?c.research.fragments.length:0;
  const success=!!roll.success&&(type!=="inquiry"||evidenceScore>=2);
  const outcome={type,success,title:rule.title,description:"",recognized:c.recognized};
  g.factions=g.factions||{};g.access=g.access||{};
  if(type==="present"){
   if(success){
    c.recognized=true;c.prestige=clamp(c.prestige+4,-30,50);
    g.factions.camarilla=clamp((g.factions.camarilla||0)+4,-100,100);
    outcome.description="Pierre Duvalier recibe tu presentación formal. La Guardiana inscribe tu nombre entre los Vástagos reconocidos del Principado. No se concede un cargo ni un dominio propio.";
   }else outcome.description="La Guardiana aconseja mejorar la presentación y volver otra noche. No se te acusa de infringir ninguna Tradición.";
  }else if(type==="territory"){
   if(success){
    c.permits[meta.place]=g.clock.night+3;c.prestige=clamp(c.prestige+1,-30,50);
    outcome.description="El príncipe autoriza una licencia excepcional para cazar en "+HUNT_DOMAINS[meta.place]+" hasta la noche "+c.permits[meta.place]+". Debés respetar la Mascarada.";
   }else outcome.description="La corte no concede el permiso solicitado. Cazar sin autorización seguirá pudiendo generar una investigación.";
  }else if(type==="inquiry"){
   if(success){
    c.research.authorized=true;c.prestige=clamp(c.prestige+2,-30,50);
    outcome.description="Duvalier autoriza a contrastar documentos administrativos con discreción y sin acusar a persona alguna. La autorización no revela quién alteró los registros.";
   }else outcome.description=evidenceScore<2?"No hay suficientes indicios corroborados para autorizar la pesquisa.":"La corte exige una solicitud más sólida o un respaldo político.";
  }else if(type==="apology"){
   if(success){
    const caution=c.cases.find(x=>x.status==="warning"||x.status==="sanctioned");
    if(caution){caution.status="dismissed";caution.decision="reconsidered";}
    c.sanctions.restrictedUntil=0;c.prestige=clamp(c.prestige+1,-30,50);
    outcome.description="La corte reconsidera una amonestación previa y levanta las restricciones que dependían de ella.";
   }else outcome.description="La amonestación se mantiene. Un nuevo intento podrá presentarse otra noche.";
  }
  if(sponsorship&&success)outcome.description+=" Tu recomendación fue reconocida por el protocolo.";
  addLog(g,rule.title+": "+(success?"aceptada":"aplazada")+".");
  return outcome;
 }
 function hearable(g){
  return init(g).cases.filter(x=>x.status==="open");
 }
 function trial(g,caseId,method,roll){
  const c=init(g);
  if(!g.embraced||g.scene!=="venue"||g.venue!=="elysee"||!g.access?.elysee)return {error:"Debés comparecer personalmente ante la Guardiana"};
  const record=c.cases.find(x=>x.id===caseId&&x.status==="open");
  if(!record)return {error:"Expediente inexistente o ya resuelto"};
  if(record.hearingNight===g.clock.night)return {error:"Este expediente ya fue oído esta noche"};
  if(!["testimony","documents","restitution"].includes(method))return {error:"Defensa desconocida"};
  if(method!=="restitution"&&(!roll||typeof roll.net!=="number"||!Array.isArray(roll.dice)))return {error:"Falta la prueba de defensa"};
  const finance=window.VTM_ECONOMY;
  if(method==="restitution"&&(!finance||finance.init(g).cash<35))return {error:"Se requieren 35 € para costear una reparación verificable"};
  const boost=method==="documents"?(g.arc?.clues?.length||0)+(c.research.fragments.length>=2?1:0):0;
  const rating=method==="restitution"?3:Math.max(0,roll.net)+boost;
  record.hearingNight=g.clock.night;
  let verdict="dismissed",text="";
  if(method==="restitution"){
   const wallet=finance.init(g);
   wallet.cash-=35;
   wallet.ledger.unshift({night:g.clock.night,reason:"Reparación verificada ante la corte",amount:-35,balance:wallet.cash});
   wallet.ledger=wallet.ledger.slice(0,60);
   g.exposure=clamp((g.exposure||0)-10,0,100);
   verdict=record.evidence>=2?"warning":"dismissed";
   text="Pagaste una reparación verificable y colaboraste con la corte. El príncipe distingue este acto de una confesión forzosa.";
  }else if(rating>=2+record.evidence){
   verdict="dismissed";text="La documentación y el testimonio deshacen las dudas razonables. Se archiva la investigación sin declarar culpabilidad.";
  }else if(record.evidence<=1){
   verdict="warning";text="La prueba sigue siendo insuficiente para un castigo severo; la Guardiana registra una advertencia y exige mayor discreción.";
  }else{
   verdict="sanctioned";text="El príncipe dicta una censura limitada por conducta imprudente. No autoriza una Caza de Sangre ni declara hechos que no se probaron.";
  }
  record.status=verdict;record.decision=method;record.resolvedNight=g.clock.night;
  const delta=verdict==="dismissed"?2:verdict==="warning"?-3:-9;
  c.prestige=clamp(c.prestige+delta,-30,50);
  g.factions.camarilla=clamp((g.factions.camarilla||0)+delta,-100,100);
  if(verdict==="sanctioned")c.sanctions.restrictedUntil=Math.max(c.sanctions.restrictedUntil,g.clock.night+1);
  addLog(g,T[record.tradition].name+": "+(verdict==="dismissed"?"archivado":verdict==="warning"?"amonestado":"censura")+".");
  return {ok:true,verdict,description:text,delta,cost:method==="restitution"?35:0};
 }
 function archiveFragment(g,place,roll){
  const c=init(g);
  if(!g.embraced||g.scene!=="venue"||g.venue!==place||!["policia","stjuly","passy","tuneles"].includes(place))return {error:"Este lugar no ofrece la comprobación documental"};
  if(c.research.fragments.includes(place))return {error:"Ya recuperaste esta referencia"};
  if(c.research.checked.includes(g.clock.night+"|"+place))return {error:"Ya revisaste esta fuente esta noche"};
  if(!roll||typeof roll.success!=="boolean")return {error:"Tirada inválida"};
  c.research.checked.push(g.clock.night+"|"+place);
  if(!roll.success){
   g.exposure=clamp((g.exposure||0)+4,0,100);
   return {ok:true,success:false,description:"La referencia es ambigua. No hay fundamento para atribuirla a nadie y tu consulta deja constancia."};
  }
  c.research.fragments.push(place);
  const descriptions={
   policia:"Un número de registro fue modificado tras la presentación original del expediente.",
   stjuly:"Las fechas de una entrega social no coinciden exactamente con su inscripción administrativa.",
   passy:"Un sello secundario aparece descrito de manera distinta en dos inventarios.",
   tuneles:"Una ruta de comunicación fue anotada con una codificación temporal inconsistente."
  };
  addLog(g,"Nueva anomalía documental contrastada en "+place+".");
  return {ok:true,success:true,description:descriptions[place],count:c.research.fragments.length};
 }
 function disputeOptions(g){
  const c=init(g);
  return Object.entries(DISPUTES).map(([id,d])=>({id,...d,proof:evidence(g,id),status:c.disputes[id]?.status||"pending"}));
 }
 function arbitrate(g,id,approach,roll){
  if(!g.embraced||g.scene!=="venue"||g.venue!=="elysee"||!g.access?.elysee)return {error:"El arbitraje requiere comparecer ante la corte"};
  const c=init(g),d=DISPUTES[id],state=c.disputes[id]||{};
  if(!d)return {error:"Disputa inexistente"};
  if(state.status==="settled")return {error:"Esta disputa ya fue resuelta"};
  if(state.attemptNight===g.clock.night)return {error:"Ya defendiste tu posición sobre este asunto esta noche"};
  if(!["mediate","document","accuse"].includes(approach))return {error:"Argumento desconocido"};
  if(!roll||typeof roll.net!=="number"||!Array.isArray(roll.dice))return {error:"Falta una tirada"};
  const proof=evidence(g,id);
  state.attemptNight=g.clock.night;
  c.disputes[id]=state;
  let threshold=approach==="mediate"?2:approach==="document"?3:4;
  let effective=roll.net+(approach==="document"?Math.min(3,proof.score):Math.min(2,Math.floor(proof.score/2)));
  const sufficient=approach==="accuse"?proof.score>=3:approach==="document"?proof.score>=2:proof.score>=1;
  const success=!!roll.success&&effective>=threshold&&sufficient;
  const result={id,approach,success,evidence:proof.score,net:roll.net,delta:{},description:""};
  g.factions=g.factions||{};
  if(success){
   state.status="settled";state.approach=approach;state.resolvedNight=g.clock.night;
   c.prestige=clamp(c.prestige+(approach==="mediate"?4:5),-30,50);
   for(const faction of d.factions){
    g.factions[faction]=clamp((g.factions[faction]||0)+(approach==="accuse"?2:4),-100,100);
    result.delta[faction]=approach==="accuse"?2:4;
   }
   if(id==="bastilla"&&approach==="mediate")g.access.brujahContact=true;
   if(id==="passy"&&approach==="document")g.access.tremereReference=true;
   if(id==="tuneles"&&approach==="document")g.access.tunnelContact=true;
   result.description=d.good+" El juicio no afirma la existencia de un conspirador aún no identificado.";
  }else{
   c.prestige=clamp(c.prestige-(approach==="accuse"?4:1),-30,50);
   if(approach==="accuse"&&proof.score<3){
    g.factions.camarilla=clamp((g.factions.camarilla||0)-5,-100,100);
    result.delta.camarilla=-5;
    result.description="Una acusación grave sin pruebas suficientes resulta improcedente. La corte te amonesta por imprudencia, no condena al acusado.";
   }else result.description=d.weak;
  }
  addLog(g,"Arbitraje "+d.title+": "+(success?"acuerdo aceptado":"sin resolución")+".");
  return result;
 }
 function summary(g){
  const c=init(g),open=c.cases.filter(x=>x.status==="open");
  const disputes=Object.values(c.disputes).filter(x=>x.status==="settled").length;
  return "Corte: "+(c.recognized?"reconocido":"sin presentación formal")+" · prestigio "+c.prestige+
   " · investigaciones "+open.length+" · arbitrajes "+disputes+"/"+Object.keys(DISPUTES).length+
   " · anomalías documentadas "+c.research.fragments.length+"/4";
 }
 return {TRADITIONS:T,DISPUTES,PETITIONS,HUNT_DOMAINS,init,addCase,exposureReview,hunting,evidence,
  canAudience,audience,hearable,trial,archiveFragment,disputeOptions,arbitrate,summary};
})();