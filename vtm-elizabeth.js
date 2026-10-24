"use strict";
/* Crónicas de París — caso Elizabeth Parker / Bapthiste.
   Contenido narrativo original de la campaña, sin revelar el secreto de Etienne.
   Nunca modifica el estado de las cuatro investigaciones ambientales previas. */
window.VTM_ELIZABETH=(()=>{
 const scenes=[
  {id:"john",place:"passy",label:"Reconstruir el altercado con John Winthrop",
   attr:"Percepción",skill:"Empatía",diff:6,
   intro:"John explica que el incidente del Elíseo terminó con su expulsión. Su recuerdo de Bapthiste debe contrastarse con testigos independientes.",
   success:"John describe el instante en que Bapthiste se acercó a Elizabeth. La versión permite buscar testigos del mechón de cabello.",
   failure:"John está a la defensiva. Confirmás el conflicto y su expulsión, pero aún no conseguís un relato verificable."},
  {id:"apartment",place:"hemeroteca",label:"Examinar el apartamento de Elizabeth",
   attr:"Percepción",skill:"Investigación",diff:6,
   intro:"Desde el barrio de la hemeroteca llegás al domicilio de Elizabeth. Era una mortal que no conocía el mundo de los Vástagos.",
   success:"Una nota y mensajes conservados muestran que Elizabeth temía la insistencia de Bapthiste. Un recibo apunta a un viaje nocturno.",
   failure:"Percibís que Elizabeth tenía miedo de alguien insistente, pero los documentos no permiten identificar con seguridad a esa persona."},
  {id:"police",place:"policia",label:"Contrastar el informe con Claire Renaud",
   attr:"Inteligencia",skill:"Investigación",diff:7,
   intro:"La inspectora Claire Renaud intenta resolver el homicidio sin ceder a presiones. Una denuncia anónima dirigió el registro de un vehículo relacionado con John.",
   success:"El cabello se recuperó tras una pista anónima demasiado específica. El hallazgo sugiere contacto, no prueba por sí solo quién cometió el crimen.",
   failure:"La inspectora confirma que hubo una denuncia y material capilar. No permite todavía revisar la cadena documental."},
  {id:"elodie",place:"elysee",label:"Pedir testimonio a Élodie Charpentier",
   attr:"Carisma",skill:"Etiqueta",diff:7,
   intro:"El personal del Elíseo protege el protocolo. Élodie recuerda movimientos bruscos durante el conflicto; la sanción impuesta a John permanece vigente.",
   success:"Élodie recuerda cabello entre los dedos de Bapthiste después de que se aproximara a Elizabeth. No afirma haber presenciado el asesinato.",
   failure:"Élodie confirma el incidente, pero se niega a formalizar su recuerdo sin una petición adecuada."},
  {id:"mathieu",place:"saintdenis",label:"Hablar con Mathieu Lefèvre, el conductor",
   attr:"Carisma",skill:"Empatía",diff:6,
   intro:"Mathieu, un conductor mortal, teme por su hija. Trasladó a Elizabeth antes de su muerte y recuerda un automóvil que la esperaba.",
   success:"Mathieu identifica parte de la matrícula y describe a un hombre de cabello corto: la pista permite localizar a Adrien Vasseur.",
   failure:"Mathieu confirma el trayecto, pero no confía en vos lo suficiente para compartir la matrícula. Alguien lo ha amenazado."},
  {id:"lucien",place:"bastilla",label:"Negociar información con Lucien",
   attr:"Manipulación",skill:"Política",diff:7,
   intro:"Lucien rechaza que todo su clan pague por los actos de Bapthiste. Exige un intercambio discreto y verificable.",
   success:"Lucien admite que Adrien Vasseur trabaja para Bapthiste y ofrece una referencia sobre un garaje, sin apoyar una cacería indiscriminada.",
   failure:"Lucien reconoce el peligro político del caso, pero no acepta entregar nombres sin mayores garantías."},
  {id:"erebos",place:"tuneles",label:"Consultar los movimientos en la red Nosferatu",
   attr:"Percepción",skill:"Callejeo",diff:7,
   intro:"Los informantes de Erebos conocen rutas y vehículos nocturnos. Su información no se regala y puede crear una deuda.",
   success:"Un registro de entradas vincula el vehículo descrito por Mathieu con un garaje utilizado por colaboradores de Bapthiste.",
   failure:"Conseguís una referencia a movimientos extraños de coches, pero nadie entrega una identificación sin algo a cambio."},
  {id:"garage",place:"saintdenis",label:"Registrar el garaje de Adrien Vasseur",
   attr:"Inteligencia",skill:"Investigación",diff:8,any:["mathieu","lucien","erebos"],
   intro:"El garaje de Vasseur presenta registros de alquiler, comunicaciones y gastos. El intermediario conserva documentos para protegerse.",
   success:"Los registros relacionan el vehículo y los pagos de Vasseur con fechas clave del asesinato y con contactos de Bapthiste. La evidencia requiere corroboración.",
   failure:"Localizás el garaje y confirmás su uso por Vasseur, pero no asegurás aún documentos suficientemente completos. El riesgo de vigilancia aumenta."}
 ];
 const byId=Object.fromEntries(scenes.map(s=>[s.id,s]));
 const valid=new Set(scenes.map(s=>s.id));
 const endings={
  sheriff:{label:"Entregar las pruebas a Wyndham",text:"El Sheriff recibe un informe sobre Elizabeth, el cabello y Vasseur. La acusación pasa a la autoridad del Principado; John no queda absuelto automáticamente."},
  lucien:{label:"Compartir el expediente con Lucien",text:"Lucien recibe pruebas limitadas y propone una actuación que no convierta a todos los Brujah en acusados. La corte todavía debe conocer el caso."},
  etienne:{label:"Solicitar mediación de Etienne Moreau",text:"La Senescal ofrece llevar el asunto a la corte y solicita conocer las pruebas. Parece una solución institucional razonable, aunque crea una dependencia política."}
 };
 let api=null;
 const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
 function bind(callbacks){api=callbacks;}
 function get(){return api?.getGame?.()||null;}
 function init(g){
  if(!g.elizabeth||typeof g.elizabeth!=="object"||Array.isArray(g.elizabeth))g.elizabeth={};
  const s=g.elizabeth;
  if(!["dormant","active","reported"].includes(s.status))s.status="dormant";
  s.evidence=Array.isArray(s.evidence)?[...new Set(s.evidence.filter(id=>valid.has(id)))]:[];
  s.attempts=s.attempts&&typeof s.attempts==="object"&&!Array.isArray(s.attempts)?s.attempts:{};
  s.alert=clamp(Number.isFinite(s.alert)?s.alert:0,0,6);
  s.history=Array.isArray(s.history)?s.history.slice(-20):[];
  s.outcome=endings[s.outcome]?s.outcome:null;
  s.interviewedEtienne=!!s.interviewedEtienne;
  s.confrontation=s.confrontation||null;
  s.confrontNight=Math.max(0,Math.floor(Number(s.confrontNight)||0));
  s.court=s.court||null;
  s.hunters=!!s.hunters;
  s.startedNight=Math.max(0,Math.floor(Number(s.startedNight)||0));
  return s;
 }
 const has=(s,id)=>s.evidence.includes(id);
 const localPlace=g=>g.scene==="venue"?g.venue:g.scene==="district"?g.district:null;
 function canAttempt(g,id){
  const s=init(g),d=byId[id];
  if(!d)return "Pista inexistente.";
  if(s.status==="dormant")return "Recibí primero el encargo en Passy.";
  if(has(s,id))return "Prueba ya contrastada.";
  if(d.any&&!d.any.some(k=>has(s,k)))return "Necesitás localizar primero una referencia al garaje.";
  if(s.attempts[id]===g.clock.night)return "Ya investigaste esta pista esta noche.";
  return null;
 }
 function start(g){
  const s=init(g);if(s.status!=="dormant")return false;
  s.status="active";s.startedNight=g.clock.night;
  s.history.push("Noche "+g.clock.night+": Wyndham solicita investigar sin prejuzgar a John Winthrop.");
  return true;
 }
 function attempt(g,id,success){
  const reason=canAttempt(g,id);if(reason)return null;
  const s=init(g),d=byId[id],ok=!!success;
  s.attempts[id]=g.clock.night;
  if(ok){s.evidence.push(id);s.history.push("Noche "+g.clock.night+": prueba contrastada — "+d.label+".");}
  else {s.alert=clamp(s.alert+1,0,6);s.history.push("Noche "+g.clock.night+": pista incompleta — "+d.label+".");}
  s.history=s.history.slice(-20);
  return {success:ok,text:ok?d.success:d.failure,alert:s.alert,clue:d.label};
 }
 function canConfront(g){
  const s=init(g);
  if(s.status==="dormant"||!has(s,"garage")||s.evidence.length<4)return "Necesitás el garaje y al menos cuatro pruebas contrastadas.";
  if(s.confrontation?.success)return "La confrontación ya produjo una ventaja verificable.";
  if(s.confrontNight===g.clock.night)return "Ya intentaste confrontarlo esta noche.";
  return null;
 }
 function confront(g,success,method){
  if(canConfront(g))return null;
  const s=init(g);s.confrontNight=g.clock.night;
  if(success){
   s.confrontation={success:true,method,night:g.clock.night};
   s.history.push("Noche "+g.clock.night+": Bapthiste confrontado; su versión mostró contradicciones.");
  } else {
   s.alert=clamp(s.alert+2,0,6);
   s.history.push("Noche "+g.clock.night+": Bapthiste evitó responder y aumentó su cautela.");
  }
  s.history=s.history.slice(-20);
  return {success:!!success,alert:s.alert};
 }
 function canReport(g){
  const s=init(g);
  return s.status==="active"&&has(s,"garage")&&s.evidence.length>=4;
 }
 function report(g,mode){
  const s=init(g);
  if(!canReport(g)||!endings[mode])return null;
  s.status="reported";s.outcome=mode;
  s.history.push("Noche "+g.clock.night+": el expediente fue presentado mediante "+endings[mode].label.toLowerCase()+".");
  s.history=s.history.slice(-20);
  return endings[mode];
 }
 function court(g,choice){
  const s=init(g);
  if(s.status!=="reported"||s.court||!["custody","inquiry","witness"].includes(choice))return false;
  s.court=choice;
  s.history.push("Noche "+g.clock.night+": audiencia en la corte; se solicita "+({custody:"custodia del sospechoso",inquiry:"investigación imparcial",witness:"protección de testigos"})[choice]+".");
  s.history=s.history.slice(-20);return true;
 }
 function hunters(g){
  const s=init(g);
  if(s.status!=="reported"||s.hunters)return false;
  s.hunters=true;
  s.history.push("Noche "+g.clock.night+": detectada vigilancia humana cerca de un refugio de Bapthiste.");
  s.history=s.history.slice(-20);return true;
 }
 function summary(g){
  const s=init(g);
  const next=scenes.filter(d=>!has(s,d.id)).filter(d=>!d.any||d.any.some(k=>has(s,k))).map(d=>d.place+" — "+d.label);
  return {status:s.status,count:s.evidence.length,total:scenes.length,alert:s.alert,outcome:s.outcome,clues:s.evidence.map(id=>byId[id].label),next:next.slice(0,4),court:s.court,hunters:s.hunters,history:[...s.history]};
 }
 function refresh(message){
  if(message)api?.log?.(message);
  api?.refresh?.();api?.save?.();
 }
 function detail(g){
  const s=init(g),d=summary(g);
  if(s.status==="dormant")return "Lord Thomas Wyndham puede encargar una investigación sobre Elizabeth Parker. Buscá a su gente en Passy. No se han abierto todavía las diligencias.";
  return "Pruebas: "+d.count+"/"+d.total+" · Alerta de Bapthiste: "+d.alert+"/6 · "+
   (s.status==="reported"?"Informe entregado a "+({sheriff:"Wyndham",lucien:"Lucien",etienne:"Etienne Moreau"})[s.outcome]+".":"Investigación activa.")+
   "\n\nPruebas verificadas:\n"+(d.clues.map(x=>"• "+x).join("\n")||"Todavía ninguna.")+
   "\n\nSiguientes vías:\n"+(d.next.map(x=>"• "+x).join("\n")||"Sin nuevas pistas por ahora.")+
   (canReport(g)?"\n\nYa podés presentar el informe desde Passy.":"");
 }
 function investigate(id){
  const g=get(),d=byId[id];if(!g||!d||canAttempt(g,id))return;
  api.ask(d.label,d.intro+" \n\nTirada: "+d.attr+" + "+d.skill+" · dificultad "+d.diff+".",[
   {label:"Contrastar la pista",action:()=>{
    const roll=api.roll(d.attr,d.skill,d.diff);
    const result=attempt(g,id,roll.success);
    if(!result)return;
    if(!result.success)api.exposure(3,"El rastro de la investigación llama la atención.");
    if(result.success){const story=window.VTM_STORY?.init(g);if(story){story.xp+=1;story.totalXp+=1;}}
    api.advance(20);refresh((result.success?"Prueba incorporada: ":"Investigación incompleta: ")+d.label);
    api.ask(result.success?"Un hallazgo verificable":"La pista sigue abierta",
      result.text+"\n\nDados: "+roll.dice.join(", ")+".\nPodés continuar por otra vía o reintentar en una noche posterior.",
      [{label:"Volver al expediente",action:menu}],"ELIZABETH PARKER · INVESTIGACIÓN");
   }},{label:"No intervenir todavía",action:menu}
  ],"ELIZABETH PARKER · ESCENA");
 }
 function meeting(){
  const g=get(),s=init(g);if(s.interviewedEtienne)return;
  api.ask("Etienne Moreau — Una propuesta prudente",
   "La Senescal desea evitar una disputa entre Wyndham y los Brujah. Ofrece mediar, pero quiere conocer qué habéis averiguado. La propuesta podría resolver la crisis política, pero compartir el expediente también implica ceder control sobre las pruebas.",
   [{label:"Escuchar su propuesta sin entregar pruebas",action:()=>{s.interviewedEtienne=true;api.advance(10);refresh("Etienne ofreció colaboración institucional.");menu();}},
    {label:"Compartir un resumen limitado del expediente",action:()=>{s.interviewedEtienne=true;api.advance(10);refresh("La Senescal conoce una parte de las pesquisas.");menu();}},
    {label:"Posponer la reunión",action:menu}],"POLÍTICA · ST. JULY");
 }
 function confrontation(){
  const g=get(),reason=canConfront(g);if(reason)return;
  api.ask("Bapthiste — Confrontación",
   "Bapthiste cuestiona la imparcialidad del Sheriff. Una contradicción documentada puede debilitar su coartada, pero una tirada social no lo captura ni autoriza su destrucción.",
   [{label:"Exponer contradicciones · Inteligencia + Investigación (dif. 7)",action:()=>handleConfront("documentos","Inteligencia","Investigación",7)},
    {label:"Forzar una negociación · Manipulación + Política (dif. 8)",action:()=>handleConfront("negociación","Manipulación","Política",8)},
    {label:"Seguir reuniendo pruebas",action:menu}],"CONFRONTACIÓN BRUJAH");
 }
 function handleConfront(method,attr,skill,diff){
  const g=get(),roll=api.roll(attr,skill,diff),result=confront(g,roll.success,method);if(!result)return;
  if(!result.success)api.exposure(5,"La conversación con Bapthiste pone en riesgo la discreción.");
  api.advance(30);refresh(result.success?"Bapthiste no consigue sostener su versión.":"Bapthiste queda advertido de la investigación.");
  api.ask("La respuesta de Bapthiste",result.success?
   "Al confrontarlo con datos contradictorios, Bapthiste pierde credibilidad ante posibles mediadores. No ha sido capturado; necesitás autoridad, acuerdos o una operación para detenerlo.":
   "Bapthiste retuerce las acusaciones y se marcha o corta el contacto. Aumenta la presión sobre los testigos y las pruebas.",
   [{label:"Volver al expediente",action:menu}],"RESULTADO · "+roll.dice.join(", "));
 }
 function submit(){
  const g=get();
  if(!canReport(g))return;
  api.ask("¿A quién entregar las pruebas?",
   "Reuniste suficientes indicios para formalizar la acusación. Elegir quién recibirá el caso altera las relaciones políticas, pero no modifica quién organizó el crimen.",
   Object.entries(endings).map(([key,e])=>({label:e.label,action:()=>{
    if(!report(g,key))return;
    if(key==="sheriff")api.faction("camarilla",5,"Informe documentado sobre Elizabeth.");
    if(key==="lucien")api.faction("brujah",5,"Acuerdo de colaboración con Lucien.");
    api.advance(25);refresh("Expediente Elizabeth Parker: informe presentado.");
    api.ask("El precio de la verdad",e.text+"\n\nLa corte puede reclamar el caso; Bapthiste continúa sujeto a las decisiones de los Vástagos.",
    [{label:"Consultar el expediente",action:menu}],"RESOLUCIÓN POLÍTICA");
   }})).concat([{label:"Conservar las pruebas por ahora",action:menu}]),"DECISIÓN IRREVERSIBLE");
 }
 function hearing(){
  const g=get(),s=init(g);
  if(s.status!=="reported"||s.court)return;
  api.ask("Audiencia ante Pierre Duvalier",
   "El Príncipe escucha el informe. Wyndham tiene un conflicto de intereses por John, Lucien defiende la responsabilidad individual y Etienne pide prudencia. El Príncipe conserva la autoridad para decidir.",
   [{label:"Solicitar custodia formal de Bapthiste",action:()=>finishCourt("custody")},
    {label:"Solicitar investigación independiente",action:()=>finishCourt("inquiry")},
    {label:"Solicitar protección de los testigos mortales",action:()=>finishCourt("witness")},
    {label:"Pedir aplazamiento",action:menu}],"CORTE DEL PRINCIPADO");
 }
 function finishCourt(choice){
  const g=get();if(!court(g,choice))return;
  api.advance(20);refresh("La corte recibió una petición sobre el caso Elizabeth.");
  api.ask("La decisión queda en manos del Príncipe",
   "Pierre Duvalier toma nota y ordena evaluar la solicitud. La sentencia y la suerte de Bapthiste no se imponen automáticamente; la política del Principado continúa.",
   [{label:"Volver al expediente",action:menu}],"CONSECUENCIA POLÍTICA");
 }
 function watchHunters(){
  const g=get();if(!hunters(g))return;
  const roll=api.roll("Percepción","Alerta",7);
  api.advance(15);refresh("Indicios de vigilancia humana cerca del refugio.");
  api.ask("Los hombres que cazan monstruos",roll.success?
   "Detectás un vehículo de vigilancia y observadores mortales con información precisa sobre un refugio de Bapthiste. No conocés quién les facilitó los datos.":
   "Encontrás rastros de una vigilancia reciente. Los movimientos parecen humanos y deliberados, pero no identificás a los responsables.",
   [{label:"Registrar el descubrimiento",action:menu}],"NUEVA AMENAZA · "+roll.dice.join(", "));
 }
 function menu(){
  const g=get();if(!g||!api)return;
  const s=init(g),place=localPlace(g);
  const options=[];
  if(s.status==="dormant"){
   if(place==="passy")options.push({label:"Aceptar el encargo del Sheriff",action:()=>{
    if(!start(g))return;
    api.advance(10);refresh("Wyndham encargó esclarecer el asesinato de Elizabeth Parker.");
    api.ask("Un encargo delicado",
     "Wyndham exige investigar imparcialmente la muerte de Elizabeth. Bapthiste obtuvo cabello suyo en el Elíseo y John está bajo sospecha. La investigación no autoriza destruir a ningún Vástago.",
     [{label:"Comenzar la investigación",action:menu}],"ELIZABETH PARKER · NUEVO CASO");
   }});
  } else {
   for(const d of scenes.filter(item=>item.place===place)){
    const reason=canAttempt(g,d.id);
    options.push({label:d.label+(reason?" · "+reason:""),disabled:!!reason,action:()=>investigate(d.id)});
   }
   if(place==="stjuly"&&s.evidence.length>=2&&!s.interviewedEtienne)options.push({label:"Hablar con Etienne Moreau",action:meeting});
   if(place==="bastilla"&&s.status==="active")options.push({label:"Confrontar a Bapthiste"+(canConfront(g)?" · "+canConfront(g):""),disabled:!!canConfront(g),action:confrontation});
   if(place==="passy"&&s.status==="active")options.push({label:"Presentar el informe al Principado"+(canReport(g)?"":" · Requiere cuatro pruebas y el garaje"),disabled:!canReport(g),action:submit});
   if(place==="elysee"&&s.status==="reported"&&!s.court)options.push({label:"Intervenir en la audiencia ante Pierre Duvalier",action:hearing});
   if(place==="tuneles"&&s.status==="reported"&&!s.hunters)options.push({label:"Investigar la vigilancia humana",action:watchHunters});
  }
  options.push({label:"Cerrar expediente",action:()=>{}});
  api.ask("Expediente: Elizabeth Parker",detail(g)+
    (place?"\n\nUbicación actual: "+place+".":"\n\nAcercate a un lugar del mapa y entrá en él para buscar indicios."),
    options,"CRÓNICAS DE PARÍS · CASO PRINCIPAL");
 }
 function atPlace(g,id){
  const s=init(g);
  return s.status==="dormant"?id==="passy":
   scenes.some(d=>d.place===id&&!has(s,d.id))||
   (id==="stjuly"&&s.evidence.length>=2&&!s.interviewedEtienne)||
   (id==="bastilla"&&s.status==="active")||
   (id==="passy"&&s.status==="active")||
   (id==="elysee"&&s.status==="reported"&&!s.court)||
   (id==="tuneles"&&s.status==="reported"&&!s.hunters);
 }
 return Object.freeze({bind,init,summary,start,canAttempt,attempt,canConfront,confront,canReport,report,court,hunters,atPlace,menu,scenes,endings});
})();