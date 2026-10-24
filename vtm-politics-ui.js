"use strict";
/* Crónicas de París 1.0 — diálogos políticos, libro de deudas y favores.
   Las decisiones respetan las ubicaciones reales de los PNJ. */
window.VTM_POLITICS_UI=(()=>{
 const P=window.VTM_POLITICS,D=window.VTM_DATA,N=window.VTM_NPCS;
 let bridge=null;
 function bind(api){bridge=api;}
 function g(){return bridge?.getGame();}
 function dialog(title,message,options,label="CORTE DE PARÍS"){bridge.ask(title,message,options,label);}
 function persist(){bridge.refresh();bridge.save();}
 function ledger(){
  const game=g();if(!game)return;
  const data=P.init(game),rep=P.respect(game);
  const credits=Object.entries(P.PLAYERS).map(([id,n])=>{
   const debt=P.activeDebt(game,id),task=data.errands[id],known=game.knownNpcs?.includes(id);
   return n.name+": "+data.credits[id]+" favor(es)"+(debt?" · deuda hasta noche "+debt.dueNight+(debt.overdue?" (VENCIDA)":""):"")+
    (task?" · encargo "+(task.status==="active"?"en curso":task.status==="ready"?"listo para entregar":"terminado"):"")+
    (known?" · conocido":"");
  }).join("\n");
  const recent=data.history.slice(0,8).map(h=>"Noche "+h.night+": "+(P.PLAYERS[h.npc]?.name||"Corte")+" — "+h.reason).join("\n");
  dialog("Libro de favores y deudas",
   "Prestigio social local: "+rep.rank+" ("+rep.score+"). No equivale a un cargo formal de la Camarilla.\n\n"+
   credits+"\n\nMovimientos recientes:\n"+(recent||"No se han establecido compromisos.")+
   "\n\nLas deudas no saldadas durante tres noches acaban deteriorando la confianza y la reputación.",
   [{label:"Cerrar el libro",action:()=>{}}],"OBLIGACIONES DEL PRINCIPADO");
 }
 function npcMenu(id){
  const game=g(),n=P.PLAYERS[id];
  if(!game||!n)return;
  if(game.scene!=="venue"||game.venue!==n.place)return;
  const data=P.init(game),trust=P.trust(game,id),debt=P.activeDebt(game,id),task=data.errands[id];
  const options=[];
  if(!task){
   const blocked=P.canEarn(game,id);
   options.push({label:"Ofrecer un servicio a cambio de un favor"+(blocked?" · "+blocked:""),
     disabled:!!blocked,action:()=>accept(id)});
  }else if(task.status==="active")options.push({label:"Recordar el servicio pendiente: "+n.errand.title,
    action:()=>dialog(n.errand.title,n.errand.mission+"\n\nDestino: "+(D.locations.find(x=>x.id===n.errand.target)?.name||n.errand.target),
      [{label:"Comprendido",action:()=>{}}],"ENCARGO POLÍTICO")});
  else if(task.status==="ready"){
   options.push({label:"Entregar el servicio y cobrar un favor",action:()=>report(id,"credit")});
   if(debt)options.push({label:"Entregar el servicio para saldar tu deuda",action:()=>report(id,"settle")});
  }
  options.push({label:"Pedir protección, información o mediación",action:()=>requestMenu(id)});
  if(debt&&data.credits[id]>0)options.push({label:"Saldar una deuda con un favor ganado",action:()=>settle(id)});
  options.push({label:"Consultar tus obligaciones con "+n.name,action:ledger});
  options.push({label:"Despedirte",action:()=>{}});
  dialog("Negociar con "+n.name,
   "Relación: "+trust+" · Reputación con "+(window.VTM_ARCS.factions[n.faction]?.name||n.faction)+
   ": "+(game.factions[n.faction]||0)+" · Favores a cobrar: "+data.credits[id]+
   (debt?"\nDeuda abierta por "+P.SERVICES[debt.service]?.label+
    " · vencimiento noche "+debt.dueNight+(debt.overdue?" · VENCIDA":""):"\nNo le debés ningún servicio.")+
   "\n\nLas promesas son personales: cada personaje registra sus propias deudas, y una reputación mala puede cerrar opciones.",
   options,"NEGOCIACIÓN VAMPÍRICA");
 }
 function accept(id){
  const game=g(),result=P.accept(game,id);
  if(result.error)return;
  bridge.log("Nuevo compromiso con "+P.PLAYERS[id].name+": "+result.title+".");
  persist();
  dialog("Servicio aceptado",result.mission+
   "\n\nBuscá pruebas en "+(D.locations.find(x=>x.id===result.target)?.name||result.target)+
   ". Después regresá con "+P.PLAYERS[id].name+".",
   [{label:"Empezar la investigación",action:()=>{}}],"ENCARGO A CAMBIO DE FAVOR");
 }
 function investigate(id){
  const game=g(),n=P.PLAYERS[id],task=P.tasksAt(game,game.venue).find(t=>t.id===id);
  if(!task||task.blocked)return;
  const roll=bridge.roll(task.attr,task.skill,task.difficulty);
  const result=P.investigate(game,id,roll);
  if(result.error)return;
  bridge.log((result.success?"Se resolvió":"Falló")+" la investigación para "+n.name+".");
  bridge.advance(14);persist();
  dialog(result.success?"Pruebas recuperadas":"Investigación sin resultados",
   result.description+"\n\nTirada "+task.attr+" + "+task.skill+" (dif. "+task.difficulty+") ["+
   roll.dice.join(", ")+"] · "+roll.net+" éxitos."+
   (result.success?"\n\nRegresá con "+n.name+" para entregar el servicio.":"\n\nPodés volver a intentarlo otra noche. La consulta elevó tu exposición."),
   [{label:"Continuar",action:()=>{}}],"INVESTIGACIÓN POLÍTICA");
 }
 function report(id,mode){
  const game=g(),result=P.report(game,id,mode);
  if(result.error)return;
  bridge.log(result.description);
  bridge.advance(8);persist();
  dialog("Obligación cumplida",result.description+
   "\n\nTu vínculo con "+P.PLAYERS[id].name+" mejora, al igual que la reputación en su facción.",
   [{label:"Continuar en la corte",action:()=>npcMenu(id)}],"CRÉDITO Y DEUDA");
 }
 function settle(id){
  const game=g(),result=P.settle(game,id);
  if(result.error)return;
  bridge.log(result.description);bridge.advance(4);persist();
  dialog("Deuda saldada",result.description,
   [{label:"Regresar",action:()=>npcMenu(id)}],"OBLIGACIONES CUMPLIDAS");
 }
 function requestMenu(id){
  const game=g(),n=P.PLAYERS[id],credits=P.init(game).credits[id];
  const options=[];
  for(const service of n.services){
   const rules=P.SERVICES[service];
   const creditBlock=P.availability(game,id,service,"credit");
   const debtBlock=P.availability(game,id,service,"debt");
   options.push({label:rules.label+" · cobrar 1 favor"+(creditBlock?" · "+creditBlock:""),
    disabled:!!creditBlock,action:()=>request(id,service,"credit")});
   options.push({label:rules.label+" · contraer una deuda"+(debtBlock?" · "+debtBlock:""),
    disabled:!!debtBlock,action:()=>request(id,service,"debt")});
  }
  options.push({label:"Regresar a "+n.name,action:()=>npcMenu(id)});
  dialog("Favores de "+n.name,
   "Favores ganados con "+n.name+": "+credits+
   ". Consumir un favor no genera una deuda. Pedir un servicio a crédito sí: tendrás tres noches para saldar la obligación y puede perjudicarte incumplirla.\n\n"+
   n.services.map(s=>P.SERVICES[s].label+": "+P.SERVICES[s].description).join("\n"),
   options,"INTERCAMBIO DE FAVORES");
 }
 function request(id,service,mode){
  const game=g(),out=P.request(game,id,service,mode);
  if(out.error)return;
  bridge.log(P.PLAYERS[id].name+" prestó un favor: "+P.SERVICES[service].label+".");
  bridge.advance(8);persist();
  dialog("El precio de la influencia",out.description+
   "\n\n"+(mode==="credit"?"Gastaste un favor que tenías a cobrar.":"Ahora debés un favor a "+P.PLAYERS[id].name+
   ". Cumplí su encargo o saldá la deuda antes de la noche "+out.debt.dueNight+".")+
   (out.exposure?"\nTu exposición cambió "+out.exposure+".":"")+
   (out.access?"\nConseguiste una referencia reconocible: "+out.access+".":""),
   [{label:"Continuar la conversación",action:()=>npcMenu(id)}],"COMPROMISO POLÍTICO");
 }
 return {bind,ledger,npcMenu,investigate,accept,report,settle,requestMenu};
})();