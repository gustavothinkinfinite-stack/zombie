"use strict";
/* Crónicas de París 1.0 — favores, obligaciones y pequeños encargos políticos.
   Adaptación narrativa original. No revela secretos de la Senescal ni crea relaciones canónicas adicionales. */
window.VTM_POLITICS=(()=>{
 const M=window.VTM_MECHANICS;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const PLAYERS={
  ingrid:{name:"Ingrid",faction:"nosferatu",place:"tuneles",services:["intel","cover"],reference:"tunnelContact",rank:0,
   errand:{title:"Los movimientos en el archivo",target:"policia",attr:"Inteligencia",skill:"Investigación",difficulty:6,
    mission:"Revisá un índice público del archivo policial e identificá cuándo se consultaron registros de túneles.",
    success:"Encontraste un patrón de consultas irregular sin alterar los registros.",
    failure:"El archivista retuvo tus datos antes de que pudieras confirmar el índice."}},
  lucien:{name:"Lucien",faction:"brujah",place:"bastilla",services:["protection","mediation"],reference:"brujahContact",rank:0,
   errand:{title:"Testigos sin intimidación",target:"saintdenis",attr:"Percepción",skill:"Empatía",difficulty:6,
    mission:"Hablá con los vecinos de Saint-Denis sin provocar una pelea y averiguá quién está generando tensión.",
    success:"Varios vecinos corroboran una secuencia de hechos sin verse amenazados.",
    failure:"Un testigo se niega a colaborar y el barrio se pone en guardia."}},
  isabelle:{name:"Isabelle Dubois",faction:"tremere",place:"stjuly",services:["intel","recommendation"],reference:"courtReferral",rank:0,
   errand:{title:"Una copia sin destinatario",target:"hemeroteca",attr:"Inteligencia",skill:"Investigación",difficulty:7,
    mission:"Contrastá los datos públicos de una correspondencia antigua en la hemeroteca, sin retirar documentos.",
    success:"Anotaste la fecha y la referencia que Isabelle necesitaba.",
    failure:"No lograste distinguir la copia original de las transcripciones posteriores."}},
  marcus:{name:"Marcus von Württemberg",faction:"tremere",place:"passy",services:["preparation","intel"],reference:"tremereReference",rank:1,
   errand:{title:"Custodia de un sello menor",target:"stjuly",attr:"Inteligencia",skill:"Ocultismo",difficulty:7,
    mission:"Comprobá que un símbolo administrativo de la casa Tremere no fue falsificado durante su traslado al St. July.",
    success:"La comparación permite autenticar un sello secundario.",
    failure:"Las anotaciones no bastan para autenticar el documento."}},
  john:{name:"John Winthrop",faction:"camarilla",place:"saintdenis",services:["protection","recommendation"],reference:"sheriffWarning",rank:0,
   errand:{title:"Un informe sin nombres",target:"policia",attr:"Astucia",skill:"Política",difficulty:7,
    mission:"Averiguá si existe una denuncia pública por los disturbios nocturnos, sin mencionar Vástagos ni revelar nombres.",
    success:"Conseguís confirmar que hay una denuncia administrativa sin comprometer a nadie.",
    failure:"Tus preguntas quedan anotadas como una consulta sospechosa."}},
  guardiana:{name:"Guardiana del Elíseo",faction:"camarilla",place:"elysee",services:["recommendation","mediation"],reference:"courtProtocol",rank:1,
   errand:{title:"Verificación del protocolo",target:"stjuly",attr:"Carisma",skill:"Etiqueta",difficulty:7,
    mission:"Comprobá que una invitación social del St. July sigue las formalidades de la corte sin exigir datos reservados.",
    success:"Detectás y corregís un detalle de protocolo antes de que llegue a la corte.",
    failure:"El personal del club interpreta tu visita como una inspección inoportuna."}}
 };
 const SERVICES={
  intel:{label:"Solicitar una información fiable",description:"El contacto te proporciona una pista y una referencia útil sin revelar secretos centrales.",trust:0},
  cover:{label:"Pedir cobertura para tus movimientos",description:"La red Nosferatu borra indicios superficiales de una visita y proporciona discreción.",trust:0},
  protection:{label:"Solicitar protección temporal",description:"Alguien de confianza desvía atención sobre tus movimientos y te ayuda a preparar una retirada.",trust:0},
  recommendation:{label:"Pedir una presentación para la corte",description:"Obtenés una referencia reconocible por el protocolo del Elíseo, sin derecho automático a una audiencia.",trust:1},
  mediation:{label:"Pedir mediación entre facciones",description:"La relación entre tu personaje y una facción mejora gracias a una mediación limitada.",trust:1},
  preparation:{label:"Solicitar apoyo logístico discreto",description:"Una casa poderosa aporta planificación y cobertura para un próximo desafío.",trust:1}
 };
 const aliases=Object.fromEntries(Object.entries(PLAYERS).map(([id,n])=>[id,n.place]));
 function init(g){
  if(!g||!g.character)throw Error("Partida inválida");
  let p=g.politics&&typeof g.politics==="object"&&!Array.isArray(g.politics)?g.politics:{};
  p.credits=p.credits&&typeof p.credits==="object"?p.credits:{};
  p.earned=p.earned&&typeof p.earned==="object"?p.earned:{};
  p.errands=p.errands&&typeof p.errands==="object"?p.errands:{};
  p.used=p.used&&typeof p.used==="object"?p.used:{};
  p.debts=Array.isArray(p.debts)?p.debts.filter(d=>d&&PLAYERS[d.npc]&&["open","paid"].includes(d.status)).slice(-60):[];
  p.history=Array.isArray(p.history)?p.history.slice(0,70):[];
  p.serial=clamp(Math.floor(Number(p.serial)||0),0,99999);
  p.lastTick=clamp(Math.floor(Number(p.lastTick)||g.clock?.night||1),1,99999);
  for(const id of Object.keys(PLAYERS)){
   p.credits[id]=clamp(Math.floor(Number(p.credits[id])||0),0,3);
   // Importar un servicio personal ya realizado en guardados previos una sola vez.
   const quest=g.sideQuests?.[id];
   if(quest?.status==="done"&&!p.earned["personal:"+id]){
    p.earned["personal:"+id]=true;
    if(quest.result?.success)p.credits[id]=clamp(p.credits[id]+1,0,3);
   }
  }
  g.politics=p;return p;
 }
 function history(g,entry){
  const p=init(g);
  p.history.unshift({night:g.clock?.night||1,...entry});
  p.history=p.history.slice(0,70);
 }
 function favor(g,id,amount,key,reason){
  if(!PLAYERS[id]||!key||!Number.isFinite(amount)||amount<=0)return 0;
  const p=init(g);
  if(p.earned[key])return 0;
  p.earned[key]=true;
  const granted=Math.min(3-p.credits[id],Math.floor(amount));
  p.credits[id]+=granted;
  history(g,{type:"credit",npc:id,delta:granted,reason:reason||"Servicio prestado"});
  return granted;
 }
 function personal(g,id,success){
  if(!PLAYERS[id])return 0;
  return favor(g,id,success?1:0,"personal:"+id,"Encargo personal cumplido");
 }
 function trust(g,id){
  const p=PLAYERS[id];if(!p)return -3;
  const relationship=clamp(Number(g.npcRelations?.[id])||0,-3,3);
  const standing=clamp(Number(g.factions?.[p.faction])||0,-100,100);
  return clamp(relationship+(standing>=20?1:standing<=-20?-1:0),-3,3);
 }
 function respect(g){
  const standing=Number(g.factions?.camarilla)||0;
  const tasks=Math.max(0,Number(g.questIndex)||0);
  const active=Object.values(PLAYERS).filter((n)=>trust(g,Object.keys(PLAYERS).find(id=>PLAYERS[id]===n))>=1).length;
  const score=standing+Math.min(12,tasks*2)+Math.min(9,active*3);
  return {score,rank:score>=60?"Reputación elevada":score>=30?"Conocido en la corte":score>=10?"Reconocido por algunos":"Recién llegado"};
 }
 function activeDebt(g,id){
  return init(g).debts.find(d=>d.npc===id&&d.status==="open")||null;
 }
 function canEarn(g,id){
  const n=PLAYERS[id];if(!n)return "Sin encargo disponible";
  if(g.scene!=="venue"||g.venue!==n.place)return "Hablá con el personaje en su ubicación";
  if(trust(g,id)<n.rank)return "Tu reputación no permite solicitar el encargo";
  if(init(g).errands[id])return "Ya aceptaste este encargo";
  return null;
 }
 function accept(g,id){
  const problem=canEarn(g,id);if(problem)return {error:problem};
  const p=init(g);
  p.errands[id]={status:"active",attemptNight:0};
  history(g,{type:"task",npc:id,reason:"Aceptaste el encargo: "+PLAYERS[id].errand.title});
  return {ok:true,...PLAYERS[id].errand};
 }
 function tasksAt(g,place){
  const p=init(g);
  return Object.entries(p.errands).filter(([id,task])=>task.status==="active"&&PLAYERS[id]?.errand.target===place)
   .map(([id,task])=>({id,title:PLAYERS[id].errand.title,description:PLAYERS[id].errand.mission,
    skill:PLAYERS[id].errand.skill,attr:PLAYERS[id].errand.attr,difficulty:PLAYERS[id].errand.difficulty,
    blocked:task.attemptNight===g.clock.night?"Ya intentaste resolverlo esta noche":null}));
 }
 function investigate(g,id,roll){
  const p=init(g),n=PLAYERS[id],task=p.errands[id];
  if(!n||!task||task.status!=="active")return {error:"No tenés ese encargo"};
  if(g.scene!=="venue"||g.venue!==n.errand.target)return {error:"Debés investigar el lugar indicado"};
  if(task.attemptNight===g.clock.night)return {error:"Ya investigaste este asunto esta noche"};
  if(!roll||typeof roll.success!=="boolean"||!Array.isArray(roll.dice))return {error:"Tirada inválida"};
  task.attemptNight=g.clock.night;
  if(roll.success)task.status="ready";
  else g.exposure=clamp((g.exposure||0)+5,0,100);
  history(g,{type:"investigation",npc:id,reason:roll.success?"Resolviste "+n.errand.title:"No se obtuvo una prueba suficiente"});
  return {ok:true,success:!!roll.success,description:roll.success?n.errand.success:n.errand.failure,exposure:roll.success?0:5};
 }
 function report(g,id,choice){
  const p=init(g),n=PLAYERS[id],task=p.errands[id];
  if(!n||task?.status!=="ready"||g.scene!=="venue"||g.venue!==n.place)return {error:"No hay un encargo listo para informar aquí"};
  const due=activeDebt(g,id);
  if(!["credit","settle"].includes(choice))return {error:"Decisión inválida"};
  if(choice==="settle"&&!due)return {error:"No existe una deuda abierta con este personaje"};
  task.status="done";
  let granted=0;
  if(choice==="settle"){
   due.status="paid";due.paidNight=g.clock.night;
   history(g,{type:"settle",npc:id,reason:"Servicio prestado para saldar la obligación"});
  }else granted=favor(g,id,1,"task:"+id,"Encargo de "+n.name);
  g.npcRelations=g.npcRelations||{};
  g.npcRelations[id]=clamp((g.npcRelations[id]||0)+1,-3,3);
  g.factions=g.factions||{};
  g.factions[n.faction]=clamp((g.factions[n.faction]||0)+2,-100,100);
  return {ok:true,credited:granted,settled:choice==="settle",faction:n.faction,
   description:choice==="settle"?"Tu servicio compensó una deuda pendiente. La obligación queda saldada.":
    "Recibiste "+granted+" favor(es) a cobrar. "+n.name+" recordará que cumpliste el encargo."};
 }
 function availability(g,id,service,mode){
  const n=PLAYERS[id],s=SERVICES[service],p=init(g);
  if(!n||!s||!n.services.includes(service))return "Ese Vástago no puede prestarte este favor";
  if(g.scene!=="venue"||g.venue!==n.place)return "Necesitás hablar con el personaje";
  if(trust(g,id)<Math.max(n.rank,s.trust))return "No existe confianza suficiente";
  if((g.factions?.[n.faction]||0)<=-30)return "La facción se niega a colaborar";
  if(p.used[g.clock.night+"|"+id+"|"+service])return "Ya pediste este servicio esta noche";
  if(mode==="credit"){
   if(p.credits[id]<1)return "No tenés favores disponibles a cobrar";
  }else if(mode==="debt"){
   if(activeDebt(g,id))return "Ya mantenés una deuda abierta con este personaje";
   if(p.debts.filter(d=>d.status==="open").length>=2)return "Ya tenés demasiadas obligaciones pendientes";
   if(p.debts.filter(d=>d.status==="open"&&d.overdue).length)return "Hay deudas vencidas por saldar";
   if(trust(g,id)<1)return "Pedir un favor a crédito requiere confianza 1";
  }else return "Forma de pago inválida";
  return null;
 }
 function request(g,id,service,mode){
  const error=availability(g,id,service,mode);if(error)return {error};
  const p=init(g),n=PLAYERS[id];
  p.used[g.clock.night+"|"+id+"|"+service]=true;
  let debt=null;
  if(mode==="credit")p.credits[id]--;
  else{
   p.serial++;
   debt={id:p.serial,npc:id,service,issuedNight:g.clock.night,dueNight:g.clock.night+3,status:"open",overdue:false};
   p.debts.push(debt);
  }
  const result={ok:true,npc:id,service,mode,debt,description:SERVICES[service].description,access:null,exposure:0,trust:0};
  g.access=g.access||{};g.factions=g.factions||{};g.npcRelations=g.npcRelations||{};
  if(service==="intel"){
   M.reward(g,"pista",2);
   g.access[n.reference]=true;
   result.access=n.reference;
  }
  if(service==="cover"){M.reward(g,"cobertura",2);g.exposure=clamp((g.exposure||0)-9,0,100);result.exposure=-9;}
  if(service==="protection"){M.reward(g,"cobertura",1);M.reward(g,"preparacion",1);g.exposure=clamp((g.exposure||0)-7,0,100);result.exposure=-7;}
  if(service==="recommendation"){
   g.access.courtReferral=true;result.access="courtReferral";
   if(id==="guardiana")g.access.courtProtocol=true;
  }
  if(service==="mediation"){
   g.factions[n.faction]=clamp((g.factions[n.faction]||0)+4,-100,100);
   result.faction=n.faction;result.factionDelta=4;
  }
  if(service==="preparation"){M.reward(g,"preparacion",2);M.reward(g,"cobertura",1);}
  history(g,{type:"service",npc:id,mode,service,reason:"Favor solicitado: "+SERVICES[service].label});
  return result;
 }
 function settle(g,id){
  const p=init(g),due=activeDebt(g,id);
  if(!due)return {error:"No hay ninguna deuda abierta"};
  if(g.scene!=="venue"||g.venue!==PLAYERS[id].place)return {error:"Debés hablar con el acreedor"};
  if(p.credits[id]<1)return {error:"Necesitás un favor ganado para compensar esta deuda"};
  p.credits[id]--;due.status="paid";due.paidNight=g.clock.night;
  history(g,{type:"settle",npc:id,reason:"Favor cobrado para saldar una obligación"});
  return {ok:true,description:"La deuda con "+PLAYERS[id].name+" quedó saldada."};
 }
 function nextNight(g){
  const p=init(g),night=g.clock.night;
  if(night<=p.lastTick)return [];
  p.lastTick=night;const effects=[];
  for(const d of p.debts){
   if(d.status!=="open"||d.overdue||night<=d.dueNight)continue;
   const n=PLAYERS[d.npc];
   d.overdue=true;
   g.factions=g.factions||{};g.npcRelations=g.npcRelations||{};
   g.factions[n.faction]=clamp((g.factions[n.faction]||0)-6,-100,100);
   g.npcRelations[d.npc]=clamp((g.npcRelations[d.npc]||0)-1,-3,3);
   g.exposure=clamp((g.exposure||0)+4,0,100);
   history(g,{type:"overdue",npc:d.npc,reason:"Una deuda pendiente deterioró la confianza"});
   effects.push({npc:d.npc,name:n.name,faction:n.faction,description:"Incumpliste una obligación con "+n.name+"; perdés reputación y aumenta la exposición."});
  }
  return effects;
 }
 function summary(g){
  const p=init(g),pending=p.debts.filter(d=>d.status==="open");
  const credits=Object.values(p.credits).reduce((a,b)=>a+b,0);
  const active=Object.values(p.errands).filter(q=>q.status==="active"||q.status==="ready").length;
  return "Favores a cobrar "+credits+" · deudas abiertas "+pending.length+" · encargos políticos "+active+" · "+respect(g).rank;
 }
 return {PLAYERS,SERVICES,init,trust,respect,activeDebt,canEarn,accept,tasksAt,investigate,report,
  availability,request,settle,nextNight,summary,favor,personal};
})();