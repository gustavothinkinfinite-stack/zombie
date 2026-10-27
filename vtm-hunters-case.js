"use strict";
/* Crónicas de París · XXVII-D: Caso 03, primera investigación.
 * Ninguna evidencia revela al informante ni identifica automáticamente a cazadores.
 * Estado opcional en game.hunters.case03; formato de guardado v1 intacto.
 */
window.VTM_HUNTERS_CASE=(()=>{
 const scenes=Object.freeze([
  Object.freeze({id:"refugio",place:"tuneles",title:"Examinar rastros de un refugio abandonado",
   attr:"Percepción",skill:"Investigación",diff:7,
   intro:"Hay rumores de que el antiguo ocupante de un refugio dejó de aparecer. Nadie puede confirmar todavía una desaparición.",
   success:"Hallás marcas de desmontaje reciente y fotografías de accesos tomadas desde la calle. No prueban quién entró ni qué ocurrió con el ocupante.",
   failure:"El refugio parece alterado, pero la oscuridad y los daños impiden distinguir rastros fiables."}),
  Object.freeze({id:"vehiculo",place:"saintdenis",title:"Rastrear el automóvil que vigila las calles",
   attr:"Percepción",skill:"Callejeo",diff:7,
   intro:"Un comerciante recuerda un vehículo detenido varias noches cerca de distintos accesos. Su relato requiere comprobación.",
   success:"Contrastás horarios y parte de una matrícula; el vehículo cambió de ubicación siguiendo las entradas de varios edificios. No identificás a sus ocupantes.",
   failure:"Varias matrículas y vehículos se parecen al descrito. No conseguís una referencia segura."}),
  Object.freeze({id:"registro",place:"policia",title:"Comparar avisos y movimientos policiales",
   attr:"Inteligencia",skill:"Investigación",diff:8,
   intro:"Los avisos de vigilancia mezclan denuncias, patrullajes habituales y anotaciones sin firma. No todos están relacionados.",
   success:"Dos entradas sin firmar comparten horarios con el vehículo y los accesos fotografiados. Su procedencia no consta y la policía no está identificada como responsable.",
   failure:"La documentación disponible carece de firmas y fechas suficientes para confirmar coincidencias."})
 ]);
 const byId=Object.freeze(Object.fromEntries(scenes.map(s=>[s.id,s])));

 // Las personas de interés no son sospechosos confirmados. Cada hipótesis
 // necesita dos comprobaciones independientes de la investigación inicial.
 const people=Object.freeze([
  Object.freeze({id:"mercier",name:"Julien Mercier",role:"nombre vinculado a la reserva de un vehículo; no hay prueba de quién conducía"}),
  Object.freeze({id:"perrin",name:"Madeleine Perrin",role:"nombre que figura en un circuito de entrega de documentos; no se conoce el contenido ni el destinatario final"})
 ]);
 const checks=Object.freeze([
  Object.freeze({id:"alquiler",person:"mercier",place:"saintdenis",title:"Comprobar la reserva del automóvil",
   attr:"Inteligencia",skill:"Investigación",diff:7,
   success:"La reserva de un vehículo comparable figura a nombre de Julien Mercier. El registro no identifica a quien lo conducía.",
   failure:"La oficina de alquiler no puede distinguir la reserva de otros vehículos del mismo modelo."}),
  Object.freeze({id:"porteria",person:"mercier",place:"stjuly",title:"Contrastar la descripción con un portero",
   attr:"Carisma",skill:"Empatía",diff:7,
   success:"Un portero recuerda el vehículo en horarios similares, pero no reconoce al conductor. El testimonio vincula recorridos, no a Mercier con los hechos.",
   failure:"El portero duda de la hora y no puede sostener su descripción."}),
  Object.freeze({id:"copias",person:"perrin",place:"hemeroteca",title:"Comprobar la ruta de los sobres duplicados",
   attr:"Inteligencia",skill:"Investigación",diff:8,
   success:"Un recibo de copias muestra una recogida a nombre de Madeleine Perrin. Nada demuestra que conociera el contenido de los sobres.",
   failure:"Los folios están incompletos y la identidad de quien retiró las copias sigue incierta."}),
  Object.freeze({id:"mensajeria",person:"perrin",place:"policia",title:"Contrastar el registro de mensajería",
   attr:"Percepción",skill:"Investigación",diff:7,
   success:"Una anotación de mensajería confirma la franja horaria de la recogida. No consta una orden policial ni una relación con una célula.",
   failure:"La anotación carece de hora verificable; no demuestra una entrega relacionada."})
 ]);
 const byCheck=Object.freeze(Object.fromEntries(checks.map(d=>[d.id,d])));

 let api=null;
 const bind=bridge=>{api=bridge;};
 const night=g=>Math.max(1,Math.floor(Number(g?.clock?.night)||1));
 const unlocked=g=>g?.elizabeth?.hunters===true;
 const localPlace=g=>g?.scene==="district"?g.district:g?.scene==="venue"?g.venue:null;
 function read(g){
  const s=g?.hunters?.case03;
  return s&&typeof s==="object"&&!Array.isArray(s)?s:null;
 }
 function init(g){
  if(!unlocked(g))return null;
  if(!g.hunters||typeof g.hunters!=="object"||Array.isArray(g.hunters))g.hunters={};
  let s=read(g);
  if(!s)s=g.hunters.case03={startedNight:night(g),evidence:[],attempts:{},history:[],decision:null,decisionNight:null};
  s.evidence=Array.isArray(s.evidence)?[...new Set(s.evidence.filter(id=>byId[id]))]:[];
  if(!s.attempts||typeof s.attempts!=="object"||Array.isArray(s.attempts))s.attempts={};
  s.history=Array.isArray(s.history)?s.history.filter(x=>typeof x==="string").slice(-16):[];
  if(!["archive","warn"].includes(s.decision))s.decision=null;
  s.correlations=Array.isArray(s.correlations)?
   [...new Set(s.correlations.filter(id=>byCheck[id]))]:[];
  if(!s.correlationAttempts||typeof s.correlationAttempts!=="object"||Array.isArray(s.correlationAttempts))
   s.correlationAttempts={};
  if(!["protect","shadow"].includes(s.followupDecision))s.followupDecision=null;
  return s;
 }
 function progress(g){
  const s=read(g);
  const evidence=Array.isArray(s?.evidence)?scenes.filter(d=>s.evidence.includes(d.id)).map(d=>d.id):[];
  const correlations=Array.isArray(s?.correlations)?
   checks.filter(d=>s.correlations.includes(d.id)).map(d=>d.id):[];
  const suspects=people.map(person=>{
   const confirmed=checks.filter(d=>d.person===person.id&&correlations.includes(d.id)).length;
   return{id:person.id,name:person.name,role:person.role,confirmed,
    total:2,status:confirmed===2?"dos fuentes contrastadas":confirmed===1?"una fuente: falta contraste":"sin corroborar"};
  });
  return{unlocked:unlocked(g),started:!!s,found:evidence.length,total:scenes.length,
   crosschecked:correlations.length,checksTotal:checks.length,suspects,
   followupDecision:["protect","shadow"].includes(s?.followupDecision)?s.followupDecision:null,
   nextChecks:checks.filter(d=>!correlations.includes(d.id)).map(d=>({place:d.place,title:d.title})),
   evidence:evidence.map(id=>byId[id].title),ready:evidence.length===scenes.length,
   decision:["archive","warn"].includes(s?.decision)?s.decision:null,
   next:scenes.filter(d=>!evidence.includes(d.id)).map(d=>({place:d.place,title:d.title})),
   history:Array.isArray(s?.history)?s.history.slice(-8):[]};
 }
 function canAttempt(g,id){
  const d=byId[id];
  if(!d)return "No existe esa línea de investigación.";
  if(!unlocked(g))return "Todavía no tenés indicios de vigilancia humana sobre el refugio.";
  if(g?.combat?.active)return "Primero debés terminar el combate.";
  if(localPlace(g)!==d.place)return "Debés trasladarte al lugar indicado.";
  const s=read(g);
  if(s?.decision)return "El informe preliminar ya está registrado.";
  if(s?.evidence?.includes(id))return "Esta fuente ya está contrastada.";
  if(s?.attempts?.[id]===night(g))return "Ya examinaste esta fuente esta noche.";
  return null;
 }
 function attempt(g,id,roll){
  const reason=canAttempt(g,id);
  if(reason||typeof roll?.success!=="boolean")return null;
  const s=init(g),d=byId[id],n=night(g);
  s.attempts[id]=n;
  if(roll.success)s.evidence.push(id);
  const message=roll.success?d.success:d.failure;
  s.history.push("Noche "+n+": "+d.title+" — "+(roll.success?"indicio corroborado.":"información insuficiente."));
  s.history=s.history.slice(-16);
  return{success:roll.success,message,found:s.evidence.length,total:scenes.length,
   ready:s.evidence.length===scenes.length};
 }
 function compare(g,decision){
  const p=progress(g);
  if(!p.unlocked||!p.started||!p.ready||p.decision||
     !["archive","warn"].includes(decision)||g.combat?.active)return null;
  const s=init(g);
  s.decision=decision;s.decisionNight=night(g);
  const message=decision==="archive"?
   "Archivaste las tres fuentes bajo reserva. Los indicios son compatibles con una vigilancia humana coordinada, pero no prueban la identidad, los objetivos ni la fuente de la información.":
   "Compartiste una advertencia sin nombres con contactos de confianza. Los indicios apuntan a vigilancia humana coordinada, pero avisar puede atraer nuevas miradas; nadie ha identificado a los responsables.";
  s.history.push("Noche "+night(g)+": informe preliminar "+(decision==="archive"?"resguardado.":"comunicado con prudencia."));
  s.history=s.history.slice(-16);
  return{message,exposure:decision==="warn"?3:0,decision};
 }

 function atPlace(g,place){
  return !!(unlocked(g)&&(scenes.some(d=>d.place===place)||
   (read(g)?.decision&&checks.some(d=>d.place===place))));
 }
 function canCorrelate(g,id){
  const d=byCheck[id],state=read(g);
  if(!d)return "Referencia inexistente.";
  if(!unlocked(g))return "Primero debés investigar la vigilancia humana sobre Bapthiste.";
  if(!progress(g).ready||!state?.decision)return "Primero debés contrastar tres fuentes y decidir cómo manejar el informe preliminar.";
  if(g?.combat?.active)return "Debés resolver el combate antes de investigar.";
  if(localPlace(g)!==d.place)return "Debés acudir al lugar de la comprobación.";
  if(state.followupDecision)return "El balance de personas de interés ya fue registrado.";
  if(state.correlations?.includes(id))return "Este contraste ya está registrado.";
  if(state.correlationAttempts?.[id]===night(g))return "Ya intentaste este contraste esta noche.";
  return null;
 }
 function correlate(g,id,roll){
  if(canCorrelate(g,id)||typeof roll?.success!=="boolean")return null;
  const s=init(g),d=byCheck[id],n=night(g);
  s.correlationAttempts[id]=n;
  if(roll.success)s.correlations.push(id);
  const p=progress(g);
  s.history.push("Noche "+n+": "+d.title+" — "+(roll.success?"contraste anotado.":"sin corroborar."));
  s.history=s.history.slice(-16);
  return{success:roll.success,message:roll.success?d.success:d.failure,
   found:p.crosschecked,total:checks.length,suspects:p.suspects};
 }
 function concludeCorrelations(g,choice){
  const p=progress(g),s=read(g);
  if(!unlocked(g)||!p.ready||!p.decision||p.crosschecked!==checks.length||
   p.followupDecision||g?.combat?.active||!["protect","shadow"].includes(choice))return null;
  init(g);
  s.followupDecision=choice;s.followupNight=night(g);
  const message=choice==="protect"?
   "Decidiste advertir de forma discreta a los testigos y mantener ambas fichas bajo reserva. Las fuentes muestran movimientos vinculados, pero no permiten acusar a Mercier ni a Perrin de cazar Vástagos.":
   "Decidiste observar a distancia los próximos movimientos de ambos contactos. El seguimiento añade exposición, aunque ninguna de las pruebas demuestra que Mercier o Perrin sean integrantes de la célula.";
  s.history.push("Noche "+night(g)+": "+(choice==="protect"?"testigos prevenidos;":"observación discreta decidida;")+" identidades sin confirmar.");
  s.history=s.history.slice(-16);
  return{choice,message,exposure:choice==="shadow"?5:0};
 }
 function aftermath(g){
  const state=read(g),n=night(g);
  if(!state?.followupDecision||!Number.isInteger(state.followupNight)||
   n<=state.followupNight||n>state.followupNight+2)return "";
  return state.followupDecision==="protect"?
   "Al regresar, algunos testigos procuran no exponerse. Tu advertencia fue recibida, aunque no aportó nombres nuevos.":
   "Al regresar, el automóvil observado ya no ocupa el mismo lugar. No sabés si la vigilancia se trasladó o si eran movimientos ajenos al caso.";
 }

 function menu(){
  const g=api?.getGame?.();
  if(!g||!api)return;
  if(!unlocked(g)){
   api.ask("Caso 03 · Los cazadores de la noche",
    "Aún no identificaste una vigilancia humana vinculada con el refugio de Bapthiste. Proseguí ese expediente antes de iniciar nuevas pesquisas.",
    [{label:"Cerrar",action:()=>{}}],"EXPEDIENTE BLOQUEADO");return;
  }
  const wasOpen=!!read(g);init(g);
  if(!wasOpen){api.log?.("Abierto el Caso 03: examinar quién vigila las calles sin prejuzgar identidades.");api.save?.();}
  const p=progress(g),place=localPlace(g),options=[];
  for(const d of scenes.filter(x=>x.place===place)){
   const reason=canAttempt(g,d.id);
   options.push({label:d.title+(reason?" · "+reason:""),disabled:!!reason,action:()=>{
    if(canAttempt(g,d.id))return;
    const roll=api.roll(d.attr,d.skill,d.diff);
    const result=attempt(g,d.id,roll);
    if(!result)return;
    api.advance?.(15);api.log?.("Caso 03: "+(result.success?"contrastaste ":"no pudiste contrastar ")+d.title+".");
    api.refresh?.();api.save?.();
    api.ask(d.title,d.intro+"\n\n"+result.message+
     "\n\n"+result.found+"/"+result.total+" fuentes contrastadas. Ninguna identifica por sí sola a los responsables.",
     [{label:"Revisar expediente",action:menu}], "CASO 03 · FUENTE "+(result.success?"CONTRASTADA":"SIN CORROBORAR"));
   }});
  }
  if(p.decision){
   for(const d of checks.filter(x=>x.place===place)){
    const reason=canCorrelate(g,d.id);
    options.push({label:d.title+(reason?" · "+reason:""),disabled:!!reason,action:()=>{
     if(canCorrelate(g,d.id))return;
     const roll=api.roll(d.attr,d.skill,d.diff);
     const result=correlate(g,d.id,roll);
     if(!result)return;
     api.advance?.(15);
     api.log?.("Caso 03: "+(result.success?"contraste corroborado — ":"contraste inconcluso — ")+d.title+".");
     api.refresh?.();api.save?.();
     api.ask(d.title,result.message+
      "\n\nComprobaciones: "+result.found+"/"+result.total+
      ". No constituye una acusación ni identifica a la fuente de las filtraciones.",
      [{label:"Volver al expediente",action:menu}],
      "CASO 03 · "+(result.success?"CORROBORACIÓN PARCIAL":"SIN CONFIRMACIÓN"));
    }});
   }
   if(p.crosschecked===checks.length&&!p.followupDecision){
    for(const [id,label]of [["protect","Proteger a los testigos sin formular acusaciones"],
      ["shadow","Observar los próximos movimientos sin confrontar"]]){
     options.push({label,action:()=>{
      const result=concludeCorrelations(g,id);if(!result)return;
      if(result.exposure)api.exposure?.(result.exposure,"Seguir a personas de interés atrajo miradas.");
      api.advance?.(10);api.log?.("Caso 03: "+result.message);api.refresh?.();api.save?.();
      api.ask("Balance de personas de interés",result.message+
       "\n\nLa identidad de los cazadores y el origen de los avisos siguen sin verificarse.",
       [{label:"Cerrar",action:()=>{}}],"CASO 03 · SIN ACUSACIÓN");
     }});
    }
   }
  }
  if(p.ready&&!p.decision){
   for(const [id,label]of [["archive","Resguardar el informe preliminar"],["warn","Compartir una advertencia discreta"]]){
    options.push({label,action:()=>{
     const result=compare(g,id);if(!result)return;
     if(result.exposure)api.exposure?.(result.exposure,"Una advertencia sobre vigilancia humana dejó rastros.");
     api.advance?.(10);api.log?.("Caso 03: "+result.message);api.refresh?.();api.save?.();
     api.ask("Informe preliminar",result.message+
      "\n\nLa investigación sobre la identidad de la célula y el origen de las filtraciones continúa pendiente.",
      [{label:"Cerrar",action:()=>{}}],"CASO 03 · BALANCE PROVISIONAL");
    }});
   }
  }
  options.push({label:"Cerrar expediente",action:()=>{}});
  api.ask("Caso 03 · Los cazadores de la noche",
   "Se investiga un refugio aparentemente abandonado, un vehículo de vigilancia y registros sin firma. La desaparición de su ocupante, la identidad de los observadores y la procedencia de los avisos no están demostradas."+
   "\n\nFuentes contrastadas: "+p.found+"/"+p.total+
   (p.decision?" · Informe preliminar "+(p.decision==="archive"?"resguardado.":"comunicado discretamente."):"")+
   "\n"+(p.next.length?"Por contrastar: "+p.next.map(d=>d.title+" ("+d.place+")").join("; "):
    "Las fuentes permiten redactar una valoración cautelosa, no identificar culpables.")+
   (p.decision?"\n\nPersonas de interés (sin acusación): "+
    p.suspects.map(x=>x.name+" — "+x.role+"; "+x.status).join(". ")+
    "\nComprobaciones cruzadas: "+p.crosschecked+"/"+p.checksTotal+
    (p.followupDecision?" · Decisión posterior: "+(p.followupDecision==="protect"?"proteger testigos":"observar sin confrontar"):
     "\nPor contrastar: "+p.nextChecks.map(x=>x.title+" ("+x.place+")").join("; ")):"")+
   (aftermath(g)?"\n\n"+aftermath(g):""),
   options,"CRÓNICAS DE PARÍS · CASO 03");
 }
 return Object.freeze({scenes,byId,people,checks,bind,unlocked,localPlace,atPlace,read,init,progress,canAttempt,attempt,compare,canCorrelate,correlate,concludeCorrelations,aftermath,menu,version:"27D.2"});
})();