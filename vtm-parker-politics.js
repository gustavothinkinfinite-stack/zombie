"use strict";
/* Fase XXVI: consecuencias de Parker. Estado en la partida; sin revelaciones sobre Etienne. */
window.VTM_PARKER_POLITICS=(()=>{
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const choices={
  shelter:{label:"Protección discreta de testigos",description:"Reduce la vulnerabilidad de las declaraciones y facilita el contacto Nosferatu.",relations:{nosferatu:2,camarilla:1},risk:-12},
  sheriff:{label:"Custodia bajo autoridad del Sheriff",description:"Asegura testigos ante la corte, pero Lucien cuestiona la independencia.",relations:{camarilla:3,brujah:-1},risk:-8},
  lucien:{label:"Garantía negociada con Lucien",description:"La protección Brujah reduce las represalias indiscriminadas, pero Wyndham exige explicaciones.",relations:{brujah:3,camarilla:-1},risk:-6}
 };
 const consequences={
  inquiry:{title:"Nuevas diligencias",text:"La Prefectura debe revisar sus declaraciones. La investigación policial queda disponible como seguimiento.",unlock:"prefectura"},
  strong:{title:"Impugnación documentada",text:"Las contradicciones impiden sostener la acusación original sin nuevas pruebas; el Príncipe autoriza verificar a Mercier.",unlock:"prefectura"},
  protection:{title:"Testimonios bajo protección",text:"Se conserva la posibilidad de ratificar los testimonios sin exponer sus domicilios.",unlock:"testigos"}
 };
 function init(g){if(!g)return null;let s=g.parkerPolitics;if(!s||typeof s!=="object"||Array.isArray(s))s=g.parkerPolitics={};
  s.protection=choices[s.protection]?s.protection:null;s.processed=!!s.processed;s.verdict=s.verdict||null;
  s.flags=s.flags&&typeof s.flags==="object"?s.flags:{};s.history=Array.isArray(s.history)?s.history.slice(-30):[];
  s.pressure=clamp(Number(s.pressure)||0,0,100);return s;}
 function log(g,t){const s=init(g);s.history.unshift("Noche "+(g.clock?.night||1)+": "+t);s.history=s.history.slice(0,30);}
 function protect(g,key){
  const s=init(g);if(!choices[key]||s.protection||g?.elizabeth?.status==="dormant")return false;
  s.protection=key;s.flags.testigos=true;
  const v=choices[key];g.factions=g.factions||{};
  for(const [f,n] of Object.entries(v.relations))if(Number.isFinite(g.factions[f]))g.factions[f]=clamp(g.factions[f]+n,0,100);
  if(Number.isFinite(g.exposure))g.exposure=clamp(g.exposure+v.risk,0,100);
  log(g,v.label+".");return true;
 }
 function verdict(g,links){
  const s=init(g);if(s.processed||g?.elizabeth?.status!=="reported"||links<2)return null;
  s.processed=true;s.verdict=links>=4?"strong":"inquiry";s.flags.prefectura=true;
  if(s.protection)s.flags.testigos=true;
  const c=window.VTM_COURT?.init?.(g);if(c){c.prestige=clamp(c.prestige+(links>=4?3:1),-30,50);c.history.unshift({night:g.clock?.night||1,summary:"EP/47: "+consequences[s.verdict].title+". Examen político, no condena automática."});}
  log(g,"Audiencia EP/47: "+consequences[s.verdict].title+".");
  return consequences[s.verdict];
 }
 function next(g){
  const s=init(g),paths=[];
  if(s.flags.prefectura)paths.push({id:"prefectura",title:"Los expedientes de la Prefectura",description:"Seguí la orden de modificación, el pago a Mercier y el acceso a los archivos."});
  if(s.flags.testigos)paths.push({id:"testigos",title:"La red de testigos",description:"Contrastá las declaraciones con Ingrid y los contactos del Elíseo."});
  if(s.verdict==="strong")paths.push({id:"corte",title:"Los cuchillos del Elíseo",description:"Cuestioná las consecuencias del expediente ante Duvalier sin levantar automáticamente la sanción de John."});
  return paths;
 }
 function summary(g){const s=init(g);return {protection:s.protection,verdict:s.verdict,pressure:s.pressure,paths:next(g),history:s.history};}
 return Object.freeze({init,protect,verdict,summary,choices,next});
})();
