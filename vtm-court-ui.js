"use strict";
/* Crónicas de París — conversaciones de corte, recepción y expedientes.
 * Narrativa original: no se revela la verdad oculta sobre Etienne Moreau.
 */
window.VTM_COURT_UI=(()=>{
 const C=window.VTM_COURT,D=window.VTM_DATA;
 let api=null;
 function bind(bridge){api=bridge;}
 function game(){return api?.getGame();}
 function ask(title,body,options,tag="CORTE DEL PRINCIPADO"){
  api.ask(title,body,options,tag);
 }
 function save(message,minutes=10){
  if(message)api.log(message);
  if(minutes)api.advance(minutes);
  api.refresh();api.save();
 }
 function inCourt(g){return !!g&&g.scene==="venue"&&g.venue==="elysee"&&g.access?.elysee;}
 function page(){
  const g=game();if(!g)return;
  const c=C.init(g),court=inCourt(g),pending=C.hearable(g);
  const actions=[
   {label:"Consultar las Seis Tradiciones de la Camarilla",action:codex},
   {label:"Ver expedientes, sanciones y pruebas",action:casebook},
   {label:"Disputas pendientes en la corte",disabled:!court,action:disputes}
  ];
  if(court&&g.embraced){
   actions.unshift({label:"Solicitar audiencia al príncipe Pierre Duvalier",action:petitions});
   if(pending.length)actions.unshift({label:"Comparecer en una investigación disciplinaria ("+pending.length+")",action:trials});
  }
  if(g.embraced&&C.init(g).research&&g.scene==="venue"&&["policia","stjuly","passy","tuneles"].includes(g.venue)){
   actions.push({label:"Contrastar un documento de este lugar",action:()=>archive(g.venue)});
  }
  actions.push({label:"Cerrar",action:()=>{}});
  ask("La corte de Pierre Duvalier",
   "El príncipe Toreador rige París. La Guardiana vela por el protocolo y el Sheriff Lord Thomas Wyndham puede ejecutar decisiones legítimas. La Senescal Etienne Moreau participa de la administración conocida de la corte.\n\n"+
   C.summary(g)+"\n"+
   (court?"Te encontrás dentro del Elíseo.":"Las audiencias requieren ingresar al Elíseo con autorización.")+
   "\n\nUna sospecha no equivale a una sentencia. Los expedientes sólo describen lo que tu personaje ha podido documentar.",
   actions,"POLÍTICA Y TRADICIONES");
 }
 function codex(){
  const g=game(),c=C.init(g);
  const entries=Object.entries(C.TRADITIONS).map(([key,t])=>({label:t.name,
   action:()=>ask(t.name,t.rule+"\n\n"+
    "Las consecuencias dependen de los hechos que se prueben y de la autoridad del príncipe. El mero rumor no demuestra una infracción. Las decisiones de esta ciudad son parte de la campaña, no una tabla automática de condenas.",
    [{label:"Volver a las Tradiciones",action:codex}],"CÓDIGO DE LA CAMARILLA")}));
  entries.push({label:"Regresar",action:page});
  ask("Las Seis Tradiciones","Las obligaciones de la Camarilla estructuran la autoridad de Pierre Duvalier. Tu estatus personal: "+
    (c.recognized?"presentado ante el príncipe":"sin reconocimiento formal registrado")+".",
    entries,"TRADICIONES");
 }
 function casebook(){
  const g=game(),c=C.init(g),pending=C.hearable(g);
  const cases=c.cases.map(x=>C.TRADITIONS[x.tradition].name+" · "+x.status.toUpperCase()+
    " · origen: "+x.description+(x.decision?" · respuesta: "+x.decision:"")).join("\n\n");
  const fragments=c.research.fragments.map(id=>D.locations.find(x=>x.id===id)?.name||id).join(", ");
  const permit=Object.entries(c.permits).filter(([k,n])=>n>=g.clock.night)
   .map(([k,n])=>(D.locations.find(x=>x.id===k)?.name||k)+" (hasta noche "+n+")").join(", ");
  const history=c.history.slice(0,8).map(x=>"Noche "+x.night+": "+x.summary).join("\n");
  ask("Registro de la Guardiana",
   "Investigaciones abiertas: "+pending.length+" · Prestigio "+c.prestige+
   " · reconocimiento: "+(c.recognized?"sí":"no")+".\n\n"+
   "Anomalías documentales: "+c.research.fragments.length+"/4 ("+(fragments||"sin cotejos")+
   ").\nAutorización para investigar registros: "+(c.research.authorized?"vigente":"sin conceder")+
   ".\nLicencias provisionales de caza: "+(permit||"ninguna")+".\n\n"+
   "Expedientes:\n"+(cases||"No existen procedimientos registrados.")+
   "\n\nHistoria de la corte:\n"+(history||"Sin actuaciones previas."),
   [{label:"Regresar",action:page}],"ARCHIVO DE LA CORTE");
 }
 function petitions(){
  const g=game(),c=C.init(g),problem=C.canAudience(g);
  const buttons=[];
  if(!c.recognized)buttons.push({label:"Presentarte y solicitar reconocimiento",disabled:!!problem,action:()=>petition("present")});
  else{
   buttons.push({label:"Solicitar una licencia limitada de caza",disabled:!!problem,action:huntingPermit});
   buttons.push({label:"Solicitar investigación discreta sobre documentos",disabled:!!problem,action:()=>petition("inquiry")});
   if(c.cases.some(x=>["warning","sanctioned"].includes(x.status)))
    buttons.push({label:"Solicitar que se reconsidere una amonestación",disabled:!!C.canAudience(g,true),action:()=>petition("apology")});
  }
  buttons.push({label:"Consultar los requisitos y regresar",action:page});
  ask("Antes de la audiencia",
   "La Guardiana comunica tu petición, pero Duvalier no recibe a cualquiera por simple exigencia. La Etiqueta, el conocimiento de la corte y las recomendaciones pueden ayudarte.\n\n"+
   (problem?"Restricción: "+problem+".":"Podés solicitar una comparecencia esta noche.")+
   "\nCada comparecencia consume la oportunidad protocolaria de la noche. Presentarte no equivale a recibir un cargo.",
   buttons,"AUDIENCIAS DEL PRÍNCIPE");
 }
 function petition(type,place){
  const g=game(),r=C.PETITIONS[type];if(!r)return;
  const legal=C.canAudience(g,type==="apology");
  if(legal)return;
  if(type!=="present"&&!C.init(g).recognized)return;
  if(type==="inquiry"&&C.init(g).research.fragments.length<2){
   ask("Requisitos de la petición","El príncipe pide al menos dos anomalías documentales contrastadas de diferentes lugares de París antes de aceptar una pesquisa formal.",
    [{label:"Regresar",action:petitions}],"SOLICITUD INCOMPLETA");return;
  }
  const roll=api.roll(r.attr,r.skill,r.difficulty);
  const outcome=C.audience(g,type,roll,{place});
  if(outcome.error){ask("Petición rechazada",outcome.error,[{label:"Regresar",action:petitions}],"PROTOCOLO");return;}
  save("Audiencia ante Pierre Duvalier: "+r.title+".",18);
  ask(outcome.success?"Palabras del príncipe":"La corte aplaza la petición",
   "Pierre Duvalier escucha tu intervención desde su posición en el salón. La Guardiana deja constancia de cada palabra.\n\n"+
   outcome.description+"\n\n"+
   r.attr+" + "+r.skill+" (dif. "+r.difficulty+") ["+roll.dice.join(", ")+"] · "+
   roll.net+" éxitos netos.\n\n"+C.summary(g),
   [{label:"Abandonar la audiencia",action:page}],"RESOLUCIÓN PRINCIPESCA");
 }
 function huntingPermit(){
  const g=game(),choices=Object.entries(C.HUNT_DOMAINS).map(([id,name])=>({
    label:"Solicitar permiso temporal en "+name+" ("+(D.locations.find(x=>x.id===id)?.name||id)+")",
    disabled:C.init(g).permits[id]>=g.clock.night,action:()=>petition("territory",id)
  }));
  choices.push({label:"Volver",action:petitions});
  ask("Peticiones de dominio",
   "No podés apropiarte de territorios por un favor privado. Pedís al príncipe un permiso provisional para alimentar tu Reserva de Sangre sin infringir las costumbres locales. El permiso no exime de proteger la Mascarada.",
   choices,"LICENCIAS DE CAZA");
 }
 function trials(){
  const g=game(),cases=C.hearable(g);
  if(!inCourt(g))return;
  const options=cases.map(item=>({label:C.TRADITIONS[item.tradition].name+" · "+item.description+
   (item.hearingNight===g.clock.night?" · escuchado esta noche":""),
   disabled:item.hearingNight===g.clock.night,action:()=>trialOptions(item.id)}));
  options.push({label:"Regresar",action:page});
  ask("Investigaciones abiertas",
   "La Guardia del Elíseo recoge testimonios; ninguna sospecha sustituye una prueba. Podés comparecer para explicar los hechos, presentar documentos o financiar una reparación verificable.",
   options,"CARGOS Y DEFENSA");
 }
 function trialOptions(id){
  const g=game(),record=C.hearable(g).find(x=>x.id===id);
  if(!record)return;
  const actions=[
   {label:"Declarar con sinceridad · Carisma + Etiqueta (dif. 7)",action:()=>hear(id,"testimony","Carisma","Etiqueta",7)},
   {label:"Presentar un descargo documental · Inteligencia + Leyes (dif. 7)",action:()=>hear(id,"documents","Inteligencia","Leyes",7)},
   {label:"Proponer una reparación verificable · 35 €",disabled:window.VTM_ECONOMY.init(g).cash<35,action:()=>hear(id,"restitution")},
   {label:"Revisar otros expedientes",action:trials}
  ];
  ask(C.TRADITIONS[record.tradition].name,
   record.description+"\n\nGrado de prueba inicial: "+record.evidence+"/3. Una cifra baja puede indicar únicamente que alguien hizo circular un rumor.\n\n"+
   "El príncipe no dictará la pena máxima automáticamente: la declaración y los documentos pueden desmentir una acusación.",
   actions,"TRÁMITE DISCIPLINARIO");
 }
 function hear(id,mode,attr,skill,difficulty){
  const g=game();let roll=null;
  if(attr)roll=api.roll(attr,skill,difficulty);
  const result=C.trial(g,id,mode,roll);
  if(result.error)return;
  save("Audiencia disciplinaria: "+result.verdict+".",20);
  ask(result.verdict==="dismissed"?"Expediente archivado":result.verdict==="warning"?"Amonestación de la corte":"Censura política",
   result.description+"\n\nResolución: "+result.verdict+" · reputación Camarilla "+(result.delta>=0?"+":"")+result.delta+
    (roll?"\nTirada ["+roll.dice.join(", ")+"] · "+roll.net+" éxitos netos.":"\nCosto de reparación: "+result.cost+" €.")+
    "\n\nLas medidas afectan tus relaciones y el reconocimiento de la corte. No son una condena automática por un rumor.",
   [{label:"Volver al registro",action:casebook}],"FALLO DE DUVALIER");
 }
 function disputes(){
  const g=game();if(!inCourt(g))return;
  const entries=C.disputeOptions(g).map(d=>({
   label:d.title+" · pruebas "+d.proof.score+" · "+(d.status==="settled"?"resuelta":"pendiente"),
   disabled:d.status==="settled"||C.init(g).disputes[d.id]?.attemptNight===g.clock.night,
   action:()=>dispute(d.id)
  }));
  entries.push({label:"Regresar a la corte",action:page});
  ask("Conflictos que reclaman arbitraje",
   "Duvalier recibe desacuerdos entre facciones. Los informes contradictorios nunca prueban por sí solos culpabilidad.\n\n"+
   "Podés mediar, documentar o formular una acusación: la última opción exige pruebas especialmente sólidas.",
   entries,"DIPLOMACIA VAMPÍRICA");
 }
 function dispute(id){
  const g=game(),d=C.DISPUTES[id],proof=C.evidence(g,id);
  if(!d||!inCourt(g))return;
  ask(d.title,
   d.objective+"\n\nPartes: "+d.parties+
   "\n\nPruebas disponibles ("+proof.score+"): "+(proof.items.join("; ")||"Todavía no reuniste indicios verificables.")+
   "\n\nMediar requiere al menos una fuente; presentar pruebas requiere dos; formular una acusación grave, tres.",
   [{label:"Mediar entre las partes · Carisma + Etiqueta (dif. 6)",action:()=>arbitrate(id,"mediate","Carisma","Etiqueta",6)},
    {label:"Presentar un expediente contrastado · Inteligencia + Investigación (dif. 7)",action:()=>arbitrate(id,"document","Inteligencia","Investigación",7)},
    {label:"Formular una acusación formal · Manipulación + Política (dif. 8) — alto riesgo",action:()=>arbitrate(id,"accuse","Manipulación","Política",8)},
    {label:"Reunir más pruebas antes de intervenir",action:disputes}],
   "AUDIENCIA DE ARBITRAJE");
 }
 function arbitrate(id,method,attr,skill,difficulty){
  const g=game(),roll=api.roll(attr,skill,difficulty);
  const r=C.arbitrate(g,id,method,roll);
  if(r.error)return;
  save("Arbitraje de "+C.DISPUTES[id].title+": "+(r.success?"acuerdo":"sin resolución")+".",22);
  ask(r.success?"Decisión de Duvalier":"La corte exige cautela",
   r.description+"\n\n"+attr+" + "+skill+" ["+roll.dice.join(", ")+"] · "+
   roll.net+" éxitos · pruebas útiles: "+r.evidence+
   "\n\n"+(r.success?"La decisión se registra y ya no podrá repetirse para acumular reputación.":
   "El incidente no queda resuelto. Podés buscar más evidencia y comparecer otra noche.")+
   "\n\n"+C.summary(g),
   [{label:"Volver al Elíseo",action:page}],"ACUERDO POLÍTICO");
 }
 function archive(place){
  const g=game(),c=C.init(g),names={policia:"Archivo policial",stjuly:"St. July",passy:"Passy",tuneles:"Túneles Nosferatu"};
  if(g.scene!=="venue"||g.venue!==place)return;
  if(c.research.fragments.includes(place))return;
  if(c.research.checked.includes(g.clock.night+"|"+place))return;
  const checks={policia:{attr:"Inteligencia",skill:"Investigación",difficulty:7},
   stjuly:{attr:"Carisma",skill:"Etiqueta",difficulty:7},
   passy:{attr:"Inteligencia",skill:"Ocultismo",difficulty:7},
   tuneles:{attr:"Percepción",skill:"Callejeo",difficulty:7}};
  const check=checks[place],roll=api.roll(check.attr,check.skill,check.difficulty);
  const outcome=C.archiveFragment(g,place,roll);
  if(outcome.error)return;
  save("Cotejo documental en "+names[place]+": "+(outcome.success?"anomalía registrada":"sin pruebas")+".",14);
  ask(outcome.success?"Una fecha que no encaja":"Una pista insuficiente",
   outcome.description+"\n\nTirada: "+check.attr+" + "+check.skill+" ["+roll.dice.join(", ")+
   "] · "+roll.net+" éxitos.\n\n"+
   "Estos indicios describen irregularidades documentales; no identifican autores ni confirman ninguna conspiración.\n\n"+
   C.summary(g),[{label:"Continuar investigando",action:()=>{}}],"INDICIOS RESERVADOS");
 }
 return {bind,page,codex,casebook,petitions,trials,disputes,dispute,archive};
})();