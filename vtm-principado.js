"use strict";
/* PRÓLOGO · CONSPIRACIÓN DEL PRINCIPADO DE PARÍS
 * Primer vínculo investigativo entre archivos mortales, prensa y política vampírica.
 * No contiene la identidad ni la verdadera situación de la Senescal.
 * La verdad de la campaña no se obtiene por puntuación ni se revela de inmediato.
 */
window.VTM_PRINCIPADO=(()=>{
 const THREADS=Object.freeze([
  {id:"policia",name:"La hoja de traslado",place:"policia",attr:"Inteligencia",skill:"Investigación",difficulty:7,
   premise:"En el archivo policial hay constancia de un traslado nocturno que no coincide con la copia administrativa.",
   success:"La hoja conserva dos horarios incompatibles y la marca de una oficina que no firmó la recepción.",
   fail:"La solicitud queda anotada y todavía no conseguís una copia fiable.",
   context:"Archivo policial de París"},
  {id:"hemeroteca",name:"Una fecha borrada",place:"hemeroteca",attr:"Percepción",skill:"Investigación",difficulty:6,
   premise:"Algunas crónicas de la vida pública parisina cambiaron de fecha entre su primera edición y los ejemplares archivados.",
   success:"Identificás una rectificación posterior que remite al mismo intervalo nocturno que figura en otros registros.",
   fail:"Los ejemplares no bastan para distinguir una corrección rutinaria de una alteración deliberada.",
   context:"Hemeroteca"},
  {id:"stjuly",name:"Una correspondencia extraviada",place:"stjuly",attr:"Carisma",skill:"Etiqueta",difficulty:7,
   premise:"Un empleado del St. July recuerda que una correspondencia oficial nunca recibió confirmación de entrega.",
   success:"El registro del local permite reconstruir el recorrido de una nota sin conocer todavía a su destinatario final.",
   fail:"El personal no quiere hablar de visitantes reservados sin referencias suficientes.",
   context:"Club St. July"},
  {id:"tuneles",name:"Una ruta entre barrios",place:"tuneles",attr:"Astucia",skill:"Callejeo",difficulty:7,
   premise:"Circula el rumor de que ciertos mensajeros evitaron las vías oficiales aquella noche.",
   success:"Un informante describe una ruta concreta y un horario verificable, sin identificar a los pasajeros.",
   fail:"Los testimonios son contradictorios y todavía no podés distinguir una ruta real de un rumor.",
   context:"Acceso a los túneles"}
 ]);
 let bridge=null;
 const byId=Object.fromEntries(THREADS.map(t=>[t.id,t]));
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function bind(api){bridge=api;}
 function init(g){
  if(!g||!g.character||!g.clock)return null;
  let s=g.principado;
  if(!s||typeof s!=="object"||Array.isArray(s))s=g.principado={};
  s.accepted=!!s.accepted;
  s.dossier=!!s.dossier;
  s.threads=s.threads&&typeof s.threads==="object"&&!Array.isArray(s.threads)?s.threads:{};
  s.attempts=s.attempts&&typeof s.attempts==="object"&&!Array.isArray(s.attempts)?s.attempts:{};
  s.history=Array.isArray(s.history)?s.history.filter(x=>typeof x==="string").slice(-20):[];
  s.informedNight=clamp(Math.floor(Number(s.informedNight)||0),0,100000);
  for(const t of THREADS){
   const old=s.threads[t.id];s.threads[t.id]=old&&typeof old==="object"&&!Array.isArray(old)?old:{};
   s.threads[t.id].confirmed=!!s.threads[t.id].confirmed;
   s.threads[t.id].night=Math.max(0,Math.floor(Number(s.threads[t.id].night)||0));
  }
  return s;
 }
 function present(g,t){return (g.scene==="venue"&&g.venue===t.place)||(g.scene==="district"&&g.district===t.place);}
 function count(g){return THREADS.filter(t=>init(g).threads[t.id].confirmed).length;}
 function record(g,message){const s=init(g);s.history.unshift("Noche "+g.clock.night+": "+message);s.history=s.history.slice(0,20);bridge?.log?.(message);}
 function start(g){
  const s=init(g);if(s.accepted)return false;
  s.accepted=true;record(g,"Comenzaste a contrastar documentos incongruentes del Principado, sin acusar todavía a nadie.");
  bridge?.save?.();bridge?.refresh?.();return true;
 }
 function investigate(g,id){
  const s=init(g),t=byId[id];
  if(!s.accepted||!t||!present(g,t)||s.threads[id].confirmed)return {error:"No podés seguir esa pista aquí."};
  const marker=g.clock.night+":"+id;
  if(s.attempts[marker])return {error:"Ya investigaste esa fuente esta noche."};
  s.attempts[marker]=true;
  const roll=bridge?.roll?.(t.attr,t.skill,t.difficulty)||{success:false,dice:[]};
  const found=!!roll.success;
  let message=found?t.success:t.fail;
  if(found){
   s.threads[id]={confirmed:true,night:g.clock.night};
   const story=window.VTM_STORY?.init?.(g);
   if(story&&!g.principado.credited)g.principado.credited={};
   if(story&&!g.principado.credited[id]){
    story.xp+=1;story.totalXp+=1;s.credited[id]=true;
    message+="\nExperiencia por contraste documental: +1 PX.";
   }
  }else{
   bridge?.exposure?.(3,"La consulta documental suscitó preguntas entre empleados mortales.");
  }
  record(g,t.name+": "+(found?"pista corroborada.":"sin corroboración."));
  bridge?.advance?.(12);bridge?.save?.();bridge?.refresh?.();
  bridge?.ask?.(found?"Referencia corroborada":"Fuente inconclusa",
    message+"\n\n"+t.attr+" + "+t.skill+" (dif. "+t.difficulty+"): ["+(roll.dice||[]).join(", ")+"]"+
    "\nLa prueba de una coincidencia no identifica por sí sola al responsable.",
    [{label:"Seguir investigando",action:menu}],"DOSSIER DEL PRINCIPADO");
  return {success:found,thread:id,found:count(g)};
 }
 function submit(g){
  const s=init(g);
  if(!s.accepted||s.dossier)return {error:"No hay un nuevo dossier pendiente."};
  if(count(g)<3)return {error:"Necesitás al menos tres fuentes independientes."};
  if(!(g.scene==="venue"&&g.venue==="elysee"&&g.access?.elysee))
   return {error:"El informe sólo puede entregarse en el Elíseo con permiso de acceso."};
  if(s.informedNight===g.clock.night)return {error:"Ya solicitaste una revisión esta noche."};
  s.informedNight=g.clock.night;
  const roll=bridge?.roll?.("Carisma","Etiqueta",7)||{success:false,dice:[]};
  if(roll.success){
   s.dossier=true;
   record(g,"La Guardiana recibió tu dossier de incongruencias. No formuló acusaciones ni adelantó conclusiones.");
   const story=window.VTM_STORY?.init?.(g);
   if(story&&!s.dossierRewarded){story.xp+=3;story.totalXp+=3;s.dossierRewarded=true;}
  }else record(g,"La Guardiana solicita revisar la presentación del dossier antes de registrarlo.");
  bridge?.advance?.(16);bridge?.save?.();bridge?.refresh?.();
  const text=roll.success?
   "La Guardiana recibe las referencias y exige una verificación independiente. Nadie queda acusado. En la corte empiezan a circular preguntas nuevas.\n\nPrólogo completado · +3 PX.":
   "La documentación es prometedora, pero su exposición ante la corte aún es confusa. Podés mejorar tu presentación en otra noche.";
  bridge?.ask?.(roll.success?"El dossier fue recibido":"Presentación aplazada",
   text,[{label:"Continuar",action:()=>{}}],"PRINCIPADO DE PARÍS");
  return {success:!!roll.success};
 }
 function summary(g){
  const s=init(g);
  return {accepted:s.accepted,dossier:s.dossier,
   found:count(g),total:THREADS.length,
   threads:THREADS.map(t=>({id:t.id,name:t.name,confirmed:s.threads[t.id].confirmed,context:t.context})),
   history:s.history.slice(0,6)};
 }
 function menu(){
  const g=bridge?.getGame?.();if(!g)return;
  const s=init(g),progress=summary(g);
  const options=[];
  if(!s.accepted)options.push({label:"Comenzar a contrastar registros de París",action:()=>{start(g);menu();}});
  else for(const t of THREADS){
   const key=g.clock.night+":"+t.id;
   if(!s.threads[t.id].confirmed&&present(g,t))
    options.push({label:"Investigar: "+t.name+" · "+t.attr+" + "+t.skill+" (dif. "+t.difficulty+")",
      disabled:!!s.attempts[key],action:()=>investigate(g,t.id)});
  }
  if(!s.dossier&&count(g)>=3&&g.scene==="venue"&&g.venue==="elysee"&&g.access?.elysee)
   options.push({label:"Presentar el dossier a la Guardiana · Carisma + Etiqueta (dif. 7)",
    disabled:s.informedNight===g.clock.night,action:()=>submit(g)});
  options.push({label:"Cerrar",action:()=>{}});
  const report=THREADS.map(t=>(s.threads[t.id].confirmed?"✓ ":"○ ")+t.name+
   " · "+t.context+"\n"+(s.threads[t.id].confirmed?t.success:t.premise)).join("\n\n");
  bridge?.ask?.("Crónica del Principado · El expediente de las coincidencias",
   "Prólogo de investigación documental. Las fechas y firmas discrepantes podrían no tener un origen común: no hay todavía una acusación fundamentada.\n\n"+
   "Fuentes corroboradas: "+progress.found+"/"+progress.total+
   " · dossier: "+(s.dossier?"entregado":"sin presentar")+
   "\n\n"+report+"\n\nReuní al menos tres fuentes independientes y, si tenés acceso, presentalas formalmente en el Elíseo.",
   options,"CONSPIRACIÓN · PRÓLOGO");
 }
 return Object.freeze({THREADS,bind,init,present,start,count,investigate,submit,summary,menu,version:"20.1"});
})();