"use strict";
/* Crónicas de París · Relaciones persistentes v1.
   Memoria local de los 16 encargados, sin alterar PNJ canónicos, tiradas centrales
   ni secretos del Principado. Todo resultado es determinista excepto las tiradas
   explícitas que el motor principal ya realiza. */
window.VTM_RELATIONSHIPS=(()=>{
 const minmax=(n,min,max)=>Math.max(min,Math.min(max,n));
 const valid=n=>Number.isFinite(Number(n))?Number(n):0;
 const numericNight=game=>Math.max(1,Math.floor(valid(game?.clock?.night)||1));
 const places=()=>window.VTM_SHOPS?.byId||{};
 function defaultMemory(){return{trust:0,firstNight:0,lastNight:0,visits:0,decision:null,result:null,favor:0,aftermath:null,aftermathNight:0,seenNewsNight:0};}
 function normalize(game){
  if(!game||typeof game!=="object")return null;
  const existing=game.shopMemory&&typeof game.shopMemory==="object"&&!Array.isArray(game.shopMemory)?game.shopMemory:{};
  const out={};
  for(const [id,raw] of Object.entries(existing)){
   if(!places()[id])continue;
   const row=raw&&typeof raw==="object"?raw:{};
   out[id]={
     trust:minmax(Math.round(valid(row.trust)),-3,3),
     firstNight:Math.max(0,Math.floor(valid(row.firstNight))),
     lastNight:Math.max(0,Math.floor(valid(row.lastNight))),
     visits:minmax(Math.floor(valid(row.visits)),0,1000),
     decision:["help","inquire","pressure"].includes(row.decision)?row.decision:null,
     result:["success","failure"].includes(row.result)?row.result:null,
     favor:row.favor===1?1:0,
     aftermath:["reference","followup","repair"].includes(row.aftermath)?row.aftermath:null,
     aftermathNight:Math.max(0,Math.floor(valid(row.aftermathNight))),
     seenNewsNight:Math.max(0,Math.floor(valid(row.seenNewsNight)))
   };
  }
  game.shopMemory=out;
  for(const [id,shopState] of Object.entries(game.localPlaces||{})){
   if(!places()[id]||!shopState?.decision||out[id]?.decision)continue;
   // Las decisiones de partidas antiguas ya otorgaron sus premios. Se migra
   // su memoria, pero no se vuelven a abonar reputación ni favores previos.
   const row=out[id]||defaultMemory();
   row.decision=shopState.decision;
   row.trust=shopState.decision==="help"?1:shopState.decision==="pressure"?-3:0;
   row.result=shopState.decision==="inquire"
       ?(game.localClues?.includes(id)?"success":"failure"):"success";
   row.favor=0;
   row.aftermath="followup"; // No reabrir ventajas de versiones anteriores.
   row.firstNight=numericNight(game);
   row.lastNight=numericNight(game);
   row.visits=Math.max(1,row.visits);
   out[id]=row;
  }
  return out;
 }
 function memory(game,shop){
  normalize(game);
  if(!places()[shop?.id])return null;
  return game.shopMemory[shop.id]||(game.shopMemory[shop.id]=defaultMemory());
 }
 function neighbourhood(game,shop){
  const nearby=(window.VTM_SHOPS?.byDistrict?.[shop.district]||[])
    .filter(s=>s.id!==shop.id);
  let helped=0,pressured=0;
  for(const adjacent of nearby){
   const row=game.localPlaces?.[adjacent.id];
   if(row?.decision==="help")helped++;
   if(row?.decision==="pressure")pressured++;
  }
  return {helped,pressured};
 }
 function modifiers(game,shop){
  const context=neighbourhood(game,shop);
  const m=memory(game,shop);
  return {trust:minmax(m.trust+context.helped-context.pressured,-3,3),
    inquiryDifficulty:minmax(7+context.pressured-context.helped,5,9),
    context};
 }
 function visit(game,shop){
  const row=memory(game,shop),night=numericNight(game);
  if(!row)return null;
  if(row.firstNight===0)row.firstNight=night;
  if(row.lastNight!==night){
   row.lastNight=night;
   row.visits=Math.min(1000,row.visits+1);
  }
  return row;
 }
 function decision(game,shop,choice,success=true){
  const row=memory(game,shop);
  if(!row||row.decision||!["help","inquire","pressure"].includes(choice))return null;
  row.decision=choice;row.result=success?"success":"failure";
  row.trust=minmax(row.trust+(choice==="help"?2:choice==="pressure"?-3:success?1:-1),-3,3);
  row.favor=choice==="help"?1:0;
  if(row.firstNight===0)row.firstNight=numericNight(game);
  row.lastNight=numericNight(game);
  row.visits=Math.max(1,row.visits);
  return row;
 }
 function options(game,shop){
  const m=memory(game,shop);if(!m||!m.decision||m.aftermath)return[];
  const n=numericNight(game);
  if(n<=m.lastNight)return [];
  if(m.decision==="help"&&m.favor===1)return[{id:"reference",label:"Cobrar el favor ofrecido en la noche anterior"}];
  if(m.decision==="inquire")return[{id:"followup",label:"Retomar la conversación de otra noche"}];
  if(m.decision==="pressure")return[{id:"repair",label:"Intentar reparar el daño causado"}];
  return[];
 }
 const news=[
  "En la calle comentan cambios de turno, pero nadie aporta nombres.",
  "Un vehículo que solía estacionar aquí ya no aparece a estas horas.",
  "Alguien pidió que los recibos de anoche se conservaran unos días más.",
  "Los vecinos prefieren hablar del tiempo antes que de sus visitantes."
 ];
 function nightlyLine(game,shop){
  const n=numericNight(game);
  const seed=shop.id.split("").reduce((a,c)=>a+c.charCodeAt(0),0);
  return news[(n+seed)%news.length];
 }
 function status(game,shop){
  const m=memory(game,shop);if(!m)return null;
  const mod=modifiers(game,shop);
  const trust=mod.trust;
  const label=trust>=2?"Confía en vos":trust>=1?"Cordial":trust<=-2?"Hostil":trust<0?"Reservado":"Neutral";
  const pressure=mod.context.pressured>0?" Aquí también llegó noticia de problemas con otro comercio.":"";
  const help=mod.context.helped>0?" Aquí recuerdan que colaboraste con un vecino.":"";
  const previous=m.decision==="help"?"Recuerda la ayuda que le ofreciste."
    :m.decision==="pressure"?"No ha olvidado tus amenazas."
    :m.decision==="inquire"?"Recuerda las preguntas de tu última visita."
    :"Todavía no sabe qué esperar de vos.";
  const newNight=m.decision&&numericNight(game)>m.lastNight;
  return {label,trust,previous,context:pressure+help,
    differentNight:newNight,news:nightlyLine(game,shop),
    couldFollowup:options(game,shop).length>0,
    inquiryDifficulty:mod.inquiryDifficulty};
 }
 function conclude(game,shop,kind,success=true){
  const m=memory(game,shop);if(!m||m.aftermath||!options(game,shop).some(a=>a.id===kind))return null;
  m.aftermath=kind;
  m.aftermathNight=numericNight(game);
  if(kind==="reference"){
   m.favor=0;
   m.trust=minmax(m.trust+1,-3,3);
   return{kind,success:true,clue:shop.clue,trust:m.trust,rep:0,exposure:0,
     text:shop.keeper+" cumple su palabra y te facilita una copia de una referencia local. "+shop.clue+
     "\\n\\nEl favor queda saldado; no podrá reclamarse otra vez."};
  }
  if(kind==="followup"){
   m.trust=minmax(m.trust+(success?1:-1),-3,3);
   return{kind,success:!!success,clue:success?shop.clue:null,trust:m.trust,rep:0,exposure:success?0:2,
     text:success?shop.keeper+" recuerda un detalle que antes pasó por alto. "+shop.clue:
       shop.keeper+" se muestra cansado de las preguntas. Tendrás que conformarte con lo averiguado; no volverá a hablar de ello."};
  }
  if(kind==="repair"){
   m.trust=minmax(m.trust+(success?2:0),-3,3);
   return{kind,success:!!success,clue:null,trust:m.trust,rep:success?1:0,exposure:0,
     text:success?shop.keeper+" acepta tus disculpas con reservas. La relación se suaviza, pero nadie olvida del todo lo ocurrido.":
       shop.keeper+" rechaza cualquier intento de reconciliación. Tendrás que convivir con las consecuencias."};
  }
  return null;
 }
 function summaries(game){
  normalize(game);
  const rows=Object.entries(game.shopMemory).filter(([id,r])=>places()[id]&&(r.visits>0||r.decision));
  return {
   known:rows.length,
   trusted:rows.filter(([id,r])=>r.trust>0).length,
   hostile:rows.filter(([id,r])=>r.trust<=-2).length,
   favors:rows.filter(([id,r])=>r.favor===1&&r.decision==="help"&&!r.aftermath).length,
   followups:rows.filter(([id])=>options(game,places()[id]).length>0).length,
   entries:rows.map(([id,r])=>({id,name:places()[id].keeper,shop:places()[id].name,
    trust:r.trust,visits:r.visits,decision:r.decision,favor:r.favor,followup:!!r.aftermath}))
  };
 }
 return Object.freeze({normalize,memory,visit,modifiers,decision,options,status,conclude,summaries,nightlyLine,version:"1.0"});
})();