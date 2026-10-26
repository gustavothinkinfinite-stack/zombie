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
  return s;
 }
 function progress(g){
  const s=read(g);
  const evidence=Array.isArray(s?.evidence)?scenes.filter(d=>s.evidence.includes(d.id)).map(d=>d.id):[];
  return{unlocked:unlocked(g),started:!!s,found:evidence.length,total:scenes.length,
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
    "Las fuentes permiten redactar una valoración cautelosa, no identificar culpables."),
   options,"CRÓNICAS DE PARÍS · CASO 03");
 }
 return Object.freeze({scenes,byId,bind,unlocked,localPlace,read,init,progress,canAttempt,attempt,compare,menu,version:"27D.1"});
})();