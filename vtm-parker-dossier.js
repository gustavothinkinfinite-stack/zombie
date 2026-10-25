"use strict";
/* Fase XXIV · EP/47: mesa documental interactiva.
 * Complementa VTM_ELIZABETH. No revela secretos de la Senescal.
 * Guarda hallazgos y decisiones independientemente para respetar partidas anteriores.
 */
(()=> {
 let bridge=null;
 const docs=[
  {id:"EP-03",title:"Inventario del apartamento",place:"policia",requires:"apartment",auth:"mixta",text:"ACTA EP/47 — Inventario de objetos. EP-03-B: pañuelo claro bordado J. W., recuperado próximo al cuerpo. Fotografiado 23:58; embolsado 00:14 por la unidad actuante; depósito 01:12. No existe determinación pericial de cuándo fue depositado.",custody:"Escena → fotografía policial → bolsa EP47-B-014 → depósito de evidencias.",challenge:"Que las iniciales correspondan a John no demuestra quién trasladó el objeto."},
  {id:"EP-04",title:"Declaración oficial de la portera",place:"policia",requires:"police",auth:"alterada",text:"DECLARACIÓN — Madeleine Fournier: «Vi a un hombre elegante ingresar aproximadamente a las 22:00». Nota del funcionario: características compatibles con John Winthrop.",custody:"Entrevista → transcripción policial → copia oficial. Falta una autorización escrita para la rectificación.",challenge:"El nombre de John aparece en la interpretación del agente, no en una identificación espontánea."},
  {id:"EP-05",title:"Cuaderno original de portería",place:"hemeroteca",requires:"apartment",auth:"auténtica",text:"20:42 — Parker regresa sola. 21:30 — ruido en acceso de servicio. 22:05 — vecino informa discusión. 23:16 — llamada de vecina. 23:29 — llegada policial. Nota: «No vi subir visitantes por la entrada principal después de Parker».",custody:"Cuaderno de Madeleine Fournier → copia fotografiada por investigadores → original permanece con ella.",challenge:"Contradice el supuesto avistamiento de John de EP-04."},
  {id:"EP-06",title:"Parte del acceso secundario",place:"hemeroteca",requires:"apartment",auth:"auténtica",text:"MANTENIMIENTO — Émile Renaud. Incidencia 21:34: puerta del patio con cierre intermitente. No consta apertura autorizada durante la noche. Se ordena revisión al día siguiente.",custody:"Registro de mantenimiento → responsable del inmueble → copia contrastada.",challenge:"La ruta de servicio fue omitida en la reconstrucción policial."},
  {id:"EP-09",title:"Testimonio del conductor",place:"saintdenis",requires:"mathieu",auth:"testimonio",text:"Mathieu Lefèvre, conductor mortal: trasladó a Elizabeth antes de su muerte. Vio un vehículo esperando en las inmediaciones. Una parte de la matrícula apunta al garaje de Adrien Vasseur. Teme represalias si confirma la identificación.",custody:"Declaración oral → acta firmada → custodia de los investigadores. Testigo protegido pendiente.",challenge:"Debe corroborarse con el garaje y los movimientos documentados del vehículo."},
  {id:"EP-11",title:"El mechón del Elíseo",place:"elysee",requires:"elodie",auth:"testimonio",text:"Élodie Charpentier recuerda que Bapthiste agarró el cabello de Elizabeth durante la disputa con John. Los cabellos localizados posteriormente pueden proceder de un contacto anterior al crimen.",custody:"Declaración de Élodie → acta firmada; muestra física → archivo pericial independiente.",challenge:"La presencia de cabello no demuestra que John estuviera en el apartamento."},
  {id:"EP-12",title:"Coartada de John",place:"passy",requires:"john",auth:"verificable",text:"John afirma que se hallaba en una reunión privada. Libro de recepción: 21:36–22:42; llamada de oficina 22:09 durante doce minutos. El empleado no lo observó ininterrumpidamente.",custody:"Libro de recepción, registro telefónico y entrevista al empleado, obtenidos por separado.",challenge:"La corroboración independiente debilita la lectura acusatoria del pañuelo."},
  {id:"EP-13",title:"Nota de alteración",place:"policia",requires:"garage",auth:"por autenticar",text:"NOTA RECUPERADA — EP/47. «Corregir declaración de portería. No insistir en acceso trasero. Incorporar descripción del hombre relacionado con W. Cita 18:30, Café Saint-Paul. Entrega pendiente: 15.000 F». No aparece el nombre de la persona que dio la instrucción.",custody:"Nota original bajo custodia policial → copia con procedencia registrada. Requiere cotejo de escritura, reunión y pagos.",challenge:"La nota y los cambios de versión sustentan una manipulación, pero no identifican por sí solos al autor intelectual."}
 ];
 const issues=[
  {id:"porter",label:"La declaración oficial contradice a la portera",ids:["EP-04","EP-05"],effect:"La identificación de John no consta en el apunte contemporáneo."},
  {id:"route",label:"La policía omitió una entrada alternativa",ids:["EP-05","EP-06"],effect:"Existía una vía secundaria compatible con movimientos no vistos por portería."},
  {id:"fabric",label:"El pañuelo y el cabello no sitúan a John en el crimen",ids:["EP-03","EP-11","EP-12"],effect:"La propiedad del objeto y el cabello son auténticos; su interpretación incriminatoria no está demostrada."},
  {id:"order",label:"Hubo una orden para modificar la versión oficial",ids:["EP-04","EP-05","EP-13"],effect:"La nota anterior explica el cambio documental, pendiente de autenticación definitiva."},
  {id:"network",label:"La logística vincula a Bapthiste y su entorno",ids:["EP-09","EP-11","EP-13"],effect:"Los testimonios y movimientos crean una línea de investigación sobre la fabricación del caso."}
 ];
 const game=()=>bridge?.getGame?.()||null;
 const readSave=()=>{const g=game();if(!g)return {};if(!g.parkerDossier||typeof g.parkerDossier!=="object")g.parkerDossier={};return g.parkerDossier};
 const store=s=>{const g=game();if(!g)return;g.parkerDossier=s;bridge?.save?.();bridge?.refresh?.()};
 const h=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 let active=null;
 function render(){
  const g=game(),e=g?.elizabeth||{},s=readSave();
  const opened=!!(e.status&&e.status!=="dormant");
  const evidence=Array.isArray(e.evidence)?e.evidence:[];
  const unlocked=d=>opened&&(evidence.includes(d.requires)||d.requires==="apartment"&&evidence.includes("apartment")||d.requires==="garage"&&evidence.includes("garage"));
  const collected=s.collected||[],linked=s.linked||[];
  
  const detail=docs.find(d=>d.id===active&&collected.includes(d.id));
  const list=docs.map(d=>'<button class="ep-doc '+(collected.includes(d.id)?"owned":"")+'" data-doc="'+d.id+'" '+(!unlocked(d)?"disabled":"")+'><b>'+d.id+'</b> '+h(d.title)+'<small>'+(collected.includes(d.id)?"Archivado":unlocked(d)?"Disponible para contrastar":"Buscá la pista en el mapa")+'</small></button>').join("");
  const comparisons=issues.map(x=>{const ready=x.ids.every(id=>collected.includes(id));return '<button class="ep-issue" data-issue="'+x.id+'" '+(!ready||linked.includes(x.id)?"disabled":"")+'>'+h(x.label)+'<small>'+x.ids.join(" + ")+' · '+(linked.includes(x.id)?"Contradicción demostrada":ready?"Contrastar ahora":"Faltan documentos")+'</small></button>'}).join("");
  const count=linked.length;
  const result=count>=4?"La corte puede aceptar una impugnación fundada de la acusación contra John.":count>=2?"Hay contradicciones suficientes para solicitar nuevas diligencias.":"Todavía faltan pruebas cruzadas antes de sostener una acusación formal.";
  document.getElementById("ep-body").innerHTML='<div class="ep-banner"><b>EP/47 · ELIZABETH PARKER</b><span>'+collected.length+'/'+docs.length+' documentos · '+count+'/'+issues.length+' contradicciones</span></div>'+
   (!opened?'<p>Este expediente se desbloquea al aceptar el encargo sobre Elizabeth Parker en Passy. Continuá la historia y regresá aquí.</p>':
   '<p class="ep-muted">Los documentos se consiguen al investigar las localizaciones del juego. Las contradicciones requieren pruebas contrastadas, no una única tirada.</p>')+
   '<div class="ep-grid"><section><h3>Documentos</h3>'+list+'</section><section><h3>Mesa de contraste</h3>'+comparisons+'</section></div>'+
   (detail?'<section class="ep-paper"><b>'+h(detail.id+" — "+detail.title)+'</b><p>'+h(detail.text)+'</p><small>CADENA DE CUSTODIA: '+h(detail.custody)+'</small><p><em>Pregunta para la audiencia: '+h(detail.challenge)+'</em></p></section>':'')+
   (s.note?'<p class="ep-finding">'+h(s.note)+'</p>':'')+
   '<section class="ep-verdict"><h3>Audiencia ante Duvalier</h3><p>'+result+'</p><button id="ep-hearing" '+(count<2||s.verdict||e.status!=="reported"?"disabled":"")+'>'+(s.verdict?"Presentación registrada":"Presentar argumentos ante la corte")+'</button>'+(s.verdict?'<p class="ep-finding">'+h(s.verdict)+'</p>':'')+'</section>';
  document.querySelectorAll("[data-doc]").forEach(b=>b.addEventListener("click",()=>{
   const id=b.dataset.doc,d=docs.find(x=>x.id===id);
   if(!unlocked(d))return;
   const state=readSave();state.collected=Array.from(new Set([...(state.collected||[]),id]));store(state);active=id;render();
  }));
  document.querySelectorAll("[data-issue]").forEach(b=>b.addEventListener("click",()=>{
   const x=issues.find(i=>i.id===b.dataset.issue),state=readSave();
   if(!x.ids.every(id=>(state.collected||[]).includes(id)))return;
   state.linked=Array.from(new Set([...(state.linked||[]),x.id]));state.note=x.effect;store(state);render();
  }));
  document.getElementById("ep-hearing").addEventListener("click",()=>{
   const state=readSave();if((state.linked||[]).length<2||state.verdict)return;
   const g=game(),e=g?.elizabeth;
   if(!e||e.status!=="reported"){state.note="Antes de una audiencia formal, presentá el informe de Elizabeth a la autoridad correspondiente desde Passy.";store(state);render();return;}
   const formal=state.linked.length>=4;
   state.verdict=(formal?"Duvalier ordena revisar la acusación contra John y abrir una investigación reservada sobre las alteraciones del expediente.":"Duvalier autoriza nuevas diligencias y suspende cualquier conclusión definitiva contra John.")+" La prohibición de acceso al Elíseo continúa como asunto separado.";
   if(!e.court){e.court="inquiry";e.history=Array.isArray(e.history)?e.history:[];e.history.push("Dossier EP/47 presentado en audiencia: "+(formal?"impugnación documentada":"solicitud de nuevas diligencias")); }
   g.npcRelations=g.npcRelations||{};
   g.npcRelations.john=Math.min(3,(g.npcRelations.john||0)+1);
   if(g.history&&Array.isArray(g.history))g.history.push("Audiencia Parker: "+(formal?"expediente impugnado":"nuevas diligencias abiertas")+".");
   store(state);render();
  });
 }
 function mount(){
  if(document.getElementById("ep-open"))return;
  const btn=document.createElement("button");btn.id="ep-open";btn.type="button";btn.textContent="▤ Expediente EP/47";
  const anchor=document.getElementById("journalBtn");anchor?.parentNode?.insertBefore(btn,anchor.nextSibling);
  const modal=document.createElement("div");modal.id="ep-modal";modal.className="ep-modal hidden";
  modal.innerHTML='<div class="ep-shell" role="dialog" aria-modal="true" aria-label="Expediente documental Elizabeth Parker"><header><div><small>CRÓNICAS DE PARÍS · ARCHIVO RESERVADO</small><h2>El asesinato de Elizabeth Parker</h2></div><button id="ep-close" aria-label="Cerrar expediente">✕</button></header><div id="ep-body"></div></div>';
  document.body.appendChild(modal);
  const close=()=>{modal.classList.add("hidden");document.getElementById("ep-open").focus()};
  btn.addEventListener("click",()=>{const play=document.getElementById("play");if(play?.classList.contains("hidden"))return;render();modal.classList.remove("hidden");document.getElementById("ep-close").focus()});
  document.getElementById("ep-close").addEventListener("click",close);
  modal.addEventListener("click",e=>{if(e.target===modal)close()});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!modal.classList.contains("hidden"))close()});
 }
 window.VTM_PARKER_DOSSIER=Object.freeze({bind(api){bridge=api},getState:readSave});
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount);else mount();
})();
