"use strict";
/* Crónicas de París — Memoria social de contactos secundarios.
 * Separa relaciones ficticias menores de PNJ canónicos, misiones y atributos.
 * Cada consecuencia posterior se desbloquea a partir de la noche siguiente.
 * Los estados migran sin repetir recompensas de partidas anteriores.
 */
window.VTM_CONTACTS=(()=>{
 const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
 const validChoice=new Set(["help","inquire","pressure"]);
 const defaultEntry=(night=1)=>({choice:null,success:false,trust:0,decisionNight:night,followup:"none",
  nextNight:0,notified:false,settledNight:null,claimed:null,complicationApplied:false});
 const validIds=new Set(window.VTM_SHOPS?.definitions.map(s=>s.id)||[]);
 function nightOf(game){return Math.max(1,Math.floor(Number(game?.clock?.night)||1));}
 function init(game){
  if(!game||typeof game!=="object")return;
  const current=nightOf(game);
  if(!game.contactMemory||typeof game.contactMemory!=="object"||Array.isArray(game.contactMemory))game.contactMemory={};
  // Sólo los 16 locales actuales tienen relaciones secundarias.
  for(const id of Object.keys(game.contactMemory))if(!validIds.has(id))delete game.contactMemory[id];
  for(const [id,local] of Object.entries(game.localPlaces||{})){
   if(!validIds.has(id)||!local||!validChoice.has(local.decision))continue;
   if(!game.contactMemory[id]){
    const e=defaultEntry(current);
    e.choice=local.decision;
    e.success=local.decision==="inquire"&&!!game.localClues?.includes(id);
    e.trust=e.choice==="help"?2:e.choice==="pressure"?-2:e.success?1:-1;
    // Migración de partida vieja: decisión anterior ya pagada; evitar nuevo bono retroactivo.
    e.followup="settled";e.settledNight=current;e.claimed="legacy";
    game.contactMemory[id]=e;
   }
  }
  for(const [id,e] of Object.entries(game.contactMemory)){
   if(!e||typeof e!=="object"){delete game.contactMemory[id];continue;}
   const normalized={...defaultEntry(current),...e};
   normalized.trust=clamp(Math.trunc(Number(normalized.trust)||0),-2,2);
   normalized.decisionNight=Math.max(1,Math.floor(Number(normalized.decisionNight)||current));
   normalized.nextNight=Math.max(0,Math.floor(Number(normalized.nextNight)||0));
   normalized.followup=["none","pending","ready","settled"].includes(normalized.followup)?normalized.followup:"settled";
   if(!validChoice.has(normalized.choice))normalized.choice=null;
   if(normalized.followup==="pending"&&normalized.nextNight&&current>=normalized.nextNight)normalized.followup="ready";
   game.contactMemory[id]=normalized;
  }
 }
 function remember(game,shop,choice,success=false){
  init(game);
  if(!shop||!validIds.has(shop.id)||!validChoice.has(choice))return null;
  const previous=game.contactMemory[shop.id];
  if(previous?.choice)return previous; // protección ante repeticiones, incluso tras recargar
  const current=nightOf(game),e=defaultEntry(current);
  e.choice=choice;e.success=!!success;
  e.trust=choice==="help"?2:choice==="pressure"?-2:success?1:-1;
  e.followup="pending";e.nextNight=current+1;
  game.contactMemory[shop.id]=e;
  return e;
 }
 function tick(game){
  init(game);
  const alerts=[],current=nightOf(game);
  for(const [id,e] of Object.entries(game.contactMemory)){
   if(e.followup!=="ready"||e.notified)continue;
   const shop=window.VTM_SHOPS.byId[id];if(!shop)continue;
   e.notified=true;
   if(e.choice==="pressure"){
    // La denuncia produce un único efecto diferido, no una penalidad cada noche.
    if(!e.complicationApplied){
     game.exposure=clamp((Number(game.exposure)||0)+4,0,100);
     e.complicationApplied=true;
    }
    alerts.push("Noche "+current+": "+shop.keeper+" todavía recuerda tus amenazas. Los rumores aumentaron tu exposición.");
   }else if(e.choice==="help"){
    alerts.push("Noche "+current+": "+shop.keeper+" tiene pendiente un favor por tu ayuda.");
   }else if(e.success){
    alerts.push("Noche "+current+": "+shop.keeper+" reunió información adicional tras tu visita.");
   }else{
    alerts.push("Noche "+current+": "+shop.keeper+" podría aceptar una conversación más prudente.");
   }
  }
  return alerts;
 }
 function followup(game,shop){
  init(game);
  const e=game.contactMemory?.[shop?.id];
  if(!e||e.followup!=="ready")return null;
  const other=(window.VTM_SHOPS?.byDistrict[shop.district]||[]).find(x=>x.id!==shop.id);
  if(e.choice==="help")return {
   title:"Un favor pendiente",
   text:shop.keeper+" recuerda que lo ayudaste. Ahora ofrece cubrir tus movimientos ante miradas indiscretas, o presentarte a una persona de confianza en "+(other?.name||"el barrio")+".",
   options:["cover","introduction"]
  };
  if(e.choice==="inquire"&&e.success)return {
   title:"Un dato que faltaba",
   text:shop.keeper+" encontró otro detalle después de tu conversación. Menciona discretamente "+(other?.name||"otro negocio del distrito")+". La conexión merece comprobarse: todavía no es una prueba de la conspiración de la corte.",
   options:["lead"]
  };
  if(e.choice==="inquire")return {
   title:"Una segunda conversación",
   text:shop.keeper+" recuerda tu interés y permite aclarar el malentendido. Está dispuesto a retomar el trato sin facilitar información nueva.",
   options:["apologize"]
  };
  return {
   title:"Consecuencias de una amenaza",
   text:shop.keeper+" conserva el recuerdo de tus amenazas. La relación está deteriorada; se niega a seguir hablando y no te ofrecerá favores.",
   options:["acknowledge"]
  };
 }
 function resolve(game,shop,choice){
  init(game);
  const e=game.contactMemory?.[shop?.id],available=followup(game,shop);
  if(!e||!available||!available.options.includes(choice))return null;
  e.followup="settled";e.claimed=choice;e.settledNight=nightOf(game);
  let effect={type:choice,shopId:shop.id,deltaExposure:0,deltaFaction:0,lead:null,text:""};
  const other=(window.VTM_SHOPS.byDistrict[shop.district]||[]).find(s=>s.id!==shop.id);
  if(choice==="cover"){
   const before=Number(game.exposure)||0;
   game.exposure=clamp(before-6,0,100);
   effect.deltaExposure=game.exposure-before;
   effect.text=shop.keeper+" ayudó a desviar miradas de tus actividades recientes.";
  }else if(choice==="introduction"){
   if(!game.contactIntroductions||typeof game.contactIntroductions!=="object")game.contactIntroductions={};
   if(other)game.contactIntroductions[other.id]=shop.id;
   effect.lead=other?.id||null;
   effect.text=shop.keeper+" te entregó una presentación para "+(other?.name||"otro vecino")+".";
  }else if(choice==="lead"){
   if(!Array.isArray(game.contactLeads))game.contactLeads=[];
   if(other){
    const lead=shop.id+"->"+other.id;
    if(!game.contactLeads.includes(lead))game.contactLeads.push(lead);
    effect.lead=other.id;
   }
   effect.text="Registraste una conexión comercial para verificar en otra visita.";
  }else if(choice==="apologize"){
   e.trust=0;
   effect.text="El contacto aceptó tus disculpas, aunque sigue sin ofrecer información.";
  }else{
   effect.text="La relación con "+shop.keeper+" permanece deteriorada.";
  }
  return effect;
 }
 function mood(game,shop){
  const e=game.contactMemory?.[shop?.id];
  if(!e||!e.choice)return "desconocido";
  return e.trust>=2?"agradecido":e.trust>=1?"cordial":e.trust<=-2?"hostil":e.trust<=-1?"receloso":"neutral";
 }
 function summary(game){
  const all=Object.values(game.contactMemory||{});
  return {known:all.length,ready:all.filter(e=>e.followup==="ready").length,
    settled:all.filter(e=>e.followup==="settled").length,
    introductions:Object.keys(game.contactIntroductions||{}).length,
    leads:(game.contactLeads||[]).length};
 }
 return Object.freeze({init,remember,tick,followup,resolve,mood,summary,version:"1.0"});
})();