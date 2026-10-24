"use strict";
/* CRÓNICAS DE PARÍS · FASE XXI — LA CONSPIRACIÓN DEL PRINCIPADO
 * Campaña de investigación en tres actos y audiencia final, con resultados
 * permanentes. Los secretos se muestran sólo tras corroborar pruebas.
 * Los datos del senescal se mantienen separados de los diálogos iniciales.
 * Un jugador puede comenzar como ghoul: no requiere un Abrazo forzoso.
 */
window.VTM_CONSPIRACY=(()=>{
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const LEADS=Object.freeze([
  // Acto I: cadena de custodia documental
  {id:"despacho",act:1,place:"policia",title:"El registro de custodia",attr:"Inteligencia",skill:"Investigación",altAttr:"Carisma",altSkill:"Empatía",dif:7,witness:"archivista",
   lead:"La cadena de custodia de un traslado anterior a la reciente reorganización presenta un vacío nocturno.",
   proof:"Un asiento duplicado confirma que alguien rectificó el horario y sustituyó la firma de recepción.",
   social:"El archivero admite haber recibido instrucciones para conservar ambas versiones y teme perder su empleo."},
  {id:"prensa",act:1,place:"hemeroteca",title:"La edición desaparecida",attr:"Percepción",skill:"Investigación",altAttr:"Manipulación",altSkill:"Subterfugio",dif:7,witness:"redactor",
   lead:"Un reportaje sobre una recepción oficial fue retirado antes de circular por París.",
   proof:"La edición anterior contiene una fotografía y una fecha que no coinciden con la crónica posterior.",
   social:"Un redactor recuerda quién ordenó retirar la edición, aunque evita pronunciar nombres ante desconocidos."},
  {id:"mensajes",act:1,place:"stjuly",title:"El segundo destinatario",attr:"Inteligencia",skill:"Investigación",altAttr:"Carisma",altSkill:"Etiqueta",dif:7,witness:"camarero",
   lead:"El registro del St. July conserva dos justificantes para un único despacho cerrado.",
   proof:"Un segundo acuse de recibo lleva un sello que nunca pasó por el circuito de la corte.",
   social:"El empleado relata la llegada de un mensajero fuera de horario y acepta conservar su testimonio."},
  {id:"sendero",act:1,place:"tuneles",title:"El paso oculto",attr:"Astucia",skill:"Callejeo",altAttr:"Percepción",altSkill:"Empatía",dif:7,witness:"vigilante",
   lead:"Una ruta subterránea coincide con las horas que faltan en los registros.",
   proof:"Una marca de acceso y un registro de mantenimiento confirman que un pasajero cruzó por una entrada privada.",
   social:"Un vigilante subterráneo confirma una presencia inesperada, pero no pudo reconocerla."},
  // Acto II: testimonios y conflictos de lealtad
  {id:"ingrid",act:2,place:"tuneles",title:"La red que escuchó",attr:"Astucia",skill:"Callejeo",altAttr:"Carisma",altSkill:"Empatía",dif:7,witness:"ingrid",faction:"nosferatu",
   lead:"Ingrid dispone de una secuencia de movimientos que evita acusar a personas sin pruebas.",
   proof:"Las fechas de tres rutas y una ausencia en la red encajan con un desplazamiento encubierto.",
   social:"Ingrid contrasta tus versiones con testigos de los túneles. Si cuidás sus fuentes, podría respaldarte."},
  {id:"lucien",act:2,place:"bastilla",title:"Las provocaciones de Bastilla",attr:"Astucia",skill:"Política",altAttr:"Carisma",altSkill:"Liderazgo",dif:7,witness:"lucien",faction:"brujah",
   lead:"Lucien cree que alguien explota las tensiones Brujah para apartar la atención de asuntos de la corte.",
   proof:"Los incidentes obedecen a un calendario demasiado preciso como para ser una reacción espontánea.",
   social:"Lucien accede a comparar los disturbios con tus fechas sin revelar a sus informantes."},
  {id:"isabelle",act:2,place:"stjuly",title:"La firma del intermediario",attr:"Inteligencia",skill:"Ocultismo",altAttr:"Carisma",altSkill:"Etiqueta",dif:8,witness:"isabelle",faction:"tremere",
   lead:"Isabelle Dubois puede determinar si un sello menor fue confeccionado por manos autorizadas.",
   proof:"El lacre es auténtico, pero fue reaplicado sobre un sobre más reciente que el supuesto despacho.",
   social:"Isabelle reconoce una irregularidad técnica y promete conservar una copia con cadena de custodia."},
  {id:"john",act:2,place:"saintdenis",title:"La advertencia del Sheriff",attr:"Astucia",skill:"Política",altAttr:"Manipulación",altSkill:"Subterfugio",dif:7,witness:"john",faction:"camarilla",
   lead:"John Winthrop conoce los límites de las atribuciones del Sheriff y teme una acusación sin respaldo.",
   proof:"Una orden secundaria no pasó por el despacho del Sheriff, pese a invocar sus competencias.",
   social:"John acepta elevar una irregularidad verificable a Lord Thomas Wyndham si evitás divulgar nombres."},
  // Acto III: pruebas de identidad, no mera sospecha política
  {id:"firma",act:3,place:"passy",title:"La firma anterior",attr:"Inteligencia",skill:"Ocultismo",altAttr:"Inteligencia",altSkill:"Investigación",dif:8,witness:"custodio",faction:"tremere",
   lead:"Una pieza sellada conserva una firma fechada antes de la interrupción de comunicaciones.",
   proof:"La firma original y la actual proceden de manos diferentes. El sello fue rehecho cuidadosamente.",
   social:"El custodio confirma el orden de los sellos, aunque se niega a interpretar su significado."},
  {id:"imagen",act:3,place:"hemeroteca",title:"Dos semblantes en una fecha",attr:"Percepción",skill:"Investigación",altAttr:"Carisma",altSkill:"Expresión",dif:8,witness:"redactor",
   lead:"Una fotografía original y una copia retocada muestran una divergencia que podría ser relevante.",
   proof:"La copia ocultó cambios identificables en los rasgos y en la cronología del personaje retratado.",
   social:"Una editora identifica a quien ordenó la rectificación y ofrece conservar los negativos."},
  {id:"interrogatorio",act:3,place:"policia",title:"El último traslado",attr:"Inteligencia",skill:"Leyes",altAttr:"Manipulación",altSkill:"Subterfugio",dif:8,witness:"archivista",
   lead:"Un expediente de traslado incluye una anotación marginal que nunca llegó al informe oficial.",
   proof:"El registro consigna una captura no autorizada y un cierre administrativo anterior al supuesto regreso.",
   social:"Una funcionaria describe el modo en que se sustituyó la orden y teme que alguien destruya su copia."},
  {id:"testamento",act:3,place:"stjuly",title:"El documento sin dueño",attr:"Inteligencia",skill:"Investigación",altAttr:"Carisma",altSkill:"Etiqueta",dif:8,witness:"camarero",
   lead:"Un sobre entregado al club quedó cerrado cuando debería haber sido reclamado por su firmante.",
   proof:"El documento contiene datos reservados previos a la desaparición que el ocupante actual del cargo contradice.",
   social:"El camarero conserva el comprobante de una entrega realizada por alguien que se presentaba como otro."}
 ]);
 const BY_ID=Object.fromEntries(LEADS.map(x=>[x.id,x]));
 const ACTS=Object.freeze({
  1:{name:"I · Una ausencia en los archivos",intro:"Las fechas de los documentos coinciden con una interrupción de comunicaciones. Hay que comprobar si se trata de un error aislado.",threshold:3},
  2:{name:"II · La ciudad de los testigos",intro:"Los archivos son insuficientes sin quienes vivieron aquella noche. Ingrid, Lucien, Isabelle y el entorno del Sheriff desconfían de las acusaciones precipitadas.",threshold:3},
  3:{name:"III · La identidad detrás del sello",intro:"La cadena de indicios apunta a una sustitución posible. Comprobá el origen de las firmas, la fotografía y el último traslado antes de informar a la corte.",threshold:3},
  4:{name:"IV · La noche del veredicto",intro:"La investigación ha alcanzado su punto crítico. Sólo ahora la prueba sostenida permite formular una acusación concreta ante el Principado.",threshold:0}
 });
 const ENDINGS=Object.freeze({
  council:{name:"La verdad ante el Príncipe",kind:"camarilla",requireSupport:2,
   text:"La Guardiana acepta los testimonios protegidos y el Príncipe Pierre Duvalier recibe una acusación fundada. Lord Thomas Wyndham abre un cerco sobre las rutas implicadas. La impostura deja de ser un rumor; las autoridades del Principado deberán actuar. La ciudad evita una caza indiscriminada, pero la batalla política apenas comienza."},
  shadows:{name:"La verdad en manos de los informantes",kind:"nosferatu",requireSupport:2,
   text:"Entregás las pruebas a una alianza discreta de testigos y custodios. Erebos recibe un resumen contrastado sin entregar la identidad de las fuentes. La operación contra la usurpación avanza en silencio, mientras los Vástagos comunes siguen ignorando la magnitud del peligro."},
  rupture:{name:"Las puertas de la rebelión",kind:"brujah",requireSupport:1,
   text:"Hacés llegar la verdad a los sectores enfrentados con el Principado. Las facciones interpretan las pruebas como una ocasión para disputarse París. La conspiración queda expuesta, pero la ciudad entra en una crisis de alianzas y la protección de los mortales pasa a ser incierta."},
  silence:{name:"El expediente sellado",kind:"none",requireSupport:0,
   text:"Elegís ocultar el expediente. Los testigos quedan fuera del alcance inmediato de la corte, pero la autoridad suplantada conserva poder para seguir manipulando París. Conocés la verdad y cargás con el precio político de no utilizarla."}
 });
 const SECRETS=Object.freeze({
  identity:"Las firmas, la cronología y los testigos permiten concluir que quien ocupa el cargo de Senescal como Etienne Moreau no es la misma persona que lo ocupaba antes. El senescal original fue secuestrado y asesinado, y una antigua anarquista de sexta generación ha asumido su identidad para destruir la Camarilla desde dentro. La prueba identifica una usurpación; no autoriza por sí sola una ejecución.",
  report:"La impostura del Senescal Etienne Moreau constituye el eje de la conspiración, pero sus vínculos con cada incidente secundario todavía requieren pruebas específicas."
 });
 let bridge=null;
 const has=(g,id)=>!!init(g)?.clues[id]?.confirmed;
 const at=(g,place)=>g.scene==="venue"&&g.venue===place||g.scene==="district"&&g.district===place;
 function bind(api){bridge=api;}
 function init(g){
  if(!g||!g.character||!g.clock)return null;
  const s=g.conspiracy&&typeof g.conspiracy==="object"&&!Array.isArray(g.conspiracy)?g.conspiracy:g.conspiracy={};
  s.started=!!s.started;
  s.chapter=clamp(Math.floor(Number(s.chapter)||1),1,4);
  s.lastNight=Math.max(1,Math.floor(Number(s.lastNight)||g.clock.night));
  s.pressure=clamp(Number(s.pressure)||0,0,100);
  s.clues=s.clues&&typeof s.clues==="object"&&!Array.isArray(s.clues)?s.clues:{};
  s.attempts=s.attempts&&typeof s.attempts==="object"&&!Array.isArray(s.attempts)?s.attempts:{};
  s.witnesses=s.witnesses&&typeof s.witnesses==="object"&&!Array.isArray(s.witnesses)?s.witnesses:{};
  s.support=s.support&&typeof s.support==="object"&&!Array.isArray(s.support)?s.support:{};
  s.credits=s.credits&&typeof s.credits==="object"&&!Array.isArray(s.credits)?s.credits:{};
  s.history=Array.isArray(s.history)?s.history.filter(x=>typeof x==="string").slice(-42):[];
  s.revealed=!!s.revealed;
  s.ending=ENDINGS[s.ending]?s.ending:null;
  s.endedNight=clamp(Math.floor(Number(s.endedNight)||0),0,100000);
  for(const lead of LEADS){
   if(!s.clues[lead.id]||typeof s.clues[lead.id]!=="object")s.clues[lead.id]={confirmed:false};
   s.clues[lead.id].confirmed=!!s.clues[lead.id].confirmed;
  }
  return s;
 }
 function secured(g){return Object.values(init(g).witnesses).filter(w=>w?.protected).length;}
 function supporters(g){return Object.entries(init(g).support).filter(([,v])=>v>=1).map(([id])=>id);}
 function count(g,act){return LEADS.filter(x=>x.act===act&&has(g,x.id)).length;}
 function record(g,message){const s=init(g);s.history.unshift("Noche "+g.clock.night+": "+message);s.history=s.history.slice(0,42);bridge?.log?.(message);}
 function award(g,key,points){
  const s=init(g);
  if(s.credits[key])return 0;
  s.credits[key]=true;
  const story=window.VTM_STORY?.init?.(g);
  if(story){story.xp+=points;story.totalXp+=points;}
  return points;
 }
 function allowed(g){
  if(!g?.principado?.dossier)return "El prólogo documental debe entregarse primero a la Guardiana del Elíseo.";
  if(!g.access?.elysee)return "Debés conservar el permiso de acceso al Elíseo.";
  return null;
 }
 function start(g){
  const s=init(g),reason=allowed(g);
  if(reason)return {error:reason};
  if(s.started)return {error:"La investigación ya está abierta."};
  s.started=true;s.chapter=1;
  record(g,"Se abrió un expediente reservado para contrastar nuevas fuentes sin señalar todavía a ningún culpable.");
  bridge?.save?.();bridge?.refresh?.();
  return {started:true};
 }
 function tick(g){
  const s=init(g);if(!s||!s.started||s.ending)return[];
  const elapsed=clamp(g.clock.night-s.lastNight,0,30);
  if(!elapsed)return[];
  s.lastNight=g.clock.night;
  const notes=[];
  const exposure=Number(g.exposure)||0;
  const increase=clamp(Math.floor(exposure/25),0,4);
  s.pressure=clamp(s.pressure+increase*elapsed-(exposure<20?elapsed:0),0,100);
  // Los rumores dañan testimonios sin destruir pistas conseguidas ni softlockear.
  if(s.pressure>=70){
   for(const w of Object.values(s.witnesses)){
    if(!w.protected&&w.trust>0)w.trust=Math.max(0,w.trust-1);
   }
   notes.push("La presión aumenta entre los testigos; conviene proteger sus declaraciones.");
  }
  for(const message of notes)record(g,message);
  return notes;
 }
 function investigate(g,id,method="document"){
  const s=init(g),lead=BY_ID[id];
  if(!s.started||s.ending||!lead||lead.act!==s.chapter)return {error:"La fuente no está disponible en este capítulo."};
  if(!at(g,lead.place))return {error:"Tenés que visitar "+lead.place+" para contrastar esta pista."};
  if(has(g,id))return {error:"Esta prueba ya está incorporada al dossier."};
  if(!["document","witness"].includes(method))return {error:"Método desconocido."};
  const key=g.clock.night+":"+id;if(s.attempts[key])return {error:"Ya trabajaste esta pista esta noche."};
  s.attempts[key]=true;
  const alt=method==="witness",difficulty=clamp(lead.dif+(alt?0:0)+(s.pressure>=75?1:0),4,10);
  const roll=bridge?.roll?.(alt?lead.altAttr:lead.attr,alt?lead.altSkill:lead.skill,difficulty)||{success:false,dice:[]};
  if(!roll.success){
   const delta=alt?7:4;s.pressure=clamp(s.pressure+delta,0,100);
   record(g,lead.title+": la fuente todavía no puede sostener la afirmación.");
   bridge?.exposure?.(alt?4:2,"Una consulta delicada produjo nuevas sospechas.");
   bridge?.advance?.(14);bridge?.save?.();bridge?.refresh?.();
   bridge?.ask?.("Fuente inconclusa",
    "No hay una declaración verificable. Podés regresar otra noche y cambiar de método. Tirada: ["+(roll.dice||[]).join(", ")+"].",
    [{label:"Revisar el expediente",action:menu}],"FASE XXI · INVESTIGACIÓN");
   return {success:false,id};
  }
  s.clues[id]={confirmed:true,night:g.clock.night,method,quality:alt?1:2};
  if(alt){
   const w=s.witnesses[lead.witness]||{trust:0,protected:false,contacts:[]};
   w.trust=clamp(w.trust+1,-3,3);
   if(!Array.isArray(w.contacts))w.contacts=[];
   if(!w.contacts.includes(id))w.contacts.push(id);
   s.witnesses[lead.witness]=w;
  }
  const px=award(g,"clue:"+id,2);
  const text=alt?lead.social:lead.proof;
  record(g,lead.title+": "+(alt?"declaración confirmada.":"documento contrastado."));
  bridge?.advance?.(14);bridge?.save?.();bridge?.refresh?.();
  bridge?.ask?.("Prueba incorporada",
   text+"\n\nReferencia "+(alt?"testimonial":"documental")+" registrada. "+
   (px?"Experiencia +"+px+" PX. ":"")+
   "No constituye por sí sola una acusación formal.",
   [{label:"Revisar las pistas",action:menu}],"FASE XXI · DOSSIER");
  return {success:true,id,method,px};
 }
 function protect(g,id,choice){
  const s=init(g),lead=BY_ID[id];
  if(!lead||!has(g,id)||!at(g,lead.place)||!["protect","pressure"].includes(choice)||s.ending)
   return {error:"No podés intervenir sobre este testimonio aquí."};
  const key="witness:"+id;if(s.credits[key])return {error:"Ya tomaste una decisión irreversible sobre esta fuente."};
  const roll=bridge?.roll?.(choice==="protect"?"Carisma":"Manipulación",
   choice==="protect"?"Empatía":"Intimidación",choice==="protect"?6:7)||{success:false,dice:[]};
  s.credits[key]=true;
  let w=s.witnesses[lead.witness]||{trust:0,protected:false,contacts:[]};
  w.trust=clamp(w.trust+(choice==="protect"?(roll.success?2:0):-2),-3,3);
  if(choice==="protect"&&roll.success)w.protected=true;
  s.witnesses[lead.witness]=w;
  let message;
  if(choice==="protect"){
   message=roll.success?"La fuente acepta custodia discreta y se compromete a sostener lo que vio.":"El testigo todavía no confía en una protección que no puede comprobar.";
   if(roll.success&&lead.faction){
    s.support[lead.faction]=Math.max(1,s.support[lead.faction]||0);
    g.npcRelations=g.npcRelations||{};
    g.npcRelations[lead.witness]=clamp((g.npcRelations[lead.witness]||0)+1,-3,3);
    bridge?.faction?.(lead.faction,2,"Protegiste una fuente vinculada con su organización.");
   }
  }else{
   s.pressure=clamp(s.pressure+15,0,100);
   message="La fuente siente la presión. Aunque la versión se mantiene registrada, su colaboración futura se deteriora y la ciudad comienza a desconfiar.";
   bridge?.exposure?.(8,"Una fuente vinculada al Principado denunció amenazas.");
  }
  record(g,message);bridge?.advance?.(12);bridge?.save?.();bridge?.refresh?.();
  bridge?.ask?.("El destino de una fuente",message+
   "\nResultado ["+(roll.dice||[]).join(", ")+"] · "+(roll.success?"éxito":"fracaso")+".",
   [{label:"Continuar",action:menu}],"FASE XXI · TESTIGOS");
  return {success:!!roll.success,choice,id,protected:!!w.protected};
 }
 function closeAct(g){
  const s=init(g),act=s.chapter,info=ACTS[act];
  if(!s.started||s.ending||act>=4)return {error:"No hay acto pendiente de cerrar."};
  if(count(g,act)<info.threshold)return {error:"Necesitás tres pruebas independientes en este acto."};
  const distinct=new Set(LEADS.filter(x=>x.act===act&&has(g,x.id)).map(x=>x.place));
  if(distinct.size<3)return {error:"Las pruebas deben proceder de tres lugares diferentes."};
  const complete=act===3;
  s.chapter=act+1;
  award(g,"act:"+act,3);
  if(complete){
   s.revealed=true;
   record(g,"Las pruebas de identidad revelaron la sustitución del Senescal. Sólo una decisión consciente permitirá usar esta verdad.");
   bridge?.ask?.("La verdad del Senescal",SECRETS.identity+
     "\n\nEsta revelación queda en tu diario. Ahora debés decidir qué hacer con la evidencia y a quién exponés.",
     [{label:"Preparar la decisión final",action:menu}],"FASE XXI · REVELACIÓN");
  }else{
   record(g,"El informe del acto "+act+" quedó contrastado. Comienza una nueva línea de investigación.");
   bridge?.ask?.("El siguiente capítulo",
    "Corroboraste "+count(g,act)+" referencias en lugares independientes. "+
    ACTS[s.chapter].intro+"\n\nExperiencia de investigación +3 PX.",
    [{label:"Ver nuevas fuentes",action:menu}],"FASE XXI · CAPÍTULO "+s.chapter);
  }
  bridge?.save?.();bridge?.refresh?.();
  return {advanced:true,chapter:s.chapter,revealed:s.revealed};
 }
 function finaleAvailable(g,choice){
  const s=init(g),ending=ENDINGS[choice];
  if(!s.started||s.chapter!==4||!s.revealed||s.ending)return "Todavía no alcanzaste la decisión final.";
  if(!ending)return "Desenlace desconocido.";
  if(!(g.scene==="venue"&&g.venue==="elysee"&&g.access?.elysee))return "La decisión final exige llegar al Elíseo y acceder a la corte.";
  if(count(g,3)<3||count(g,2)<3||count(g,1)<3)return "Faltan pruebas independientes para sostener la revelación.";
  if(choice==="council"&&(secured(g)<2||s.pressure>=75))return "Para exponer el caso ante el Príncipe necesitás dos testigos protegidos y una exposición controlada.";
  if(choice==="shadows"&&(!s.support.nosferatu||secured(g)<1))return "Para operar con Erebos necesitás una fuente Nosferatu respaldada y un testigo protegido.";
  if(choice==="rupture"&&!s.support.brujah)return "Para negociar con los rebeldes necesitás haber respaldado a un testigo Brujah.";
  return null;
 }
 function conclude(g,choice){
  const problem=finaleAvailable(g,choice);if(problem)return {error:problem};
  const s=init(g),ending=ENDINGS[choice];
  const key=g.clock.night+":final:"+choice;
  if(s.attempts[key])return {error:"Ya defendiste esta posición esta noche."};
  // Ocultar la evidencia es una decisión explícita. El resto exige una prueba.
  let roll=null;
  if(choice!=="silence"){
   s.attempts[key]=true;
   const checks=choice==="council"?["Carisma","Política",7]:
    choice==="shadows"?["Inteligencia","Subterfugio",7]:["Manipulación","Callejeo",7];
   roll=bridge?.roll?.(...checks)||{success:false,dice:[]};
   if(!roll.success){
    s.pressure=clamp(s.pressure+8,0,100);
    record(g,"La propuesta política fracasó. Las pruebas permanecen intactas y podrás intentarlo otra noche.");
    bridge?.advance?.(18);bridge?.save?.();bridge?.refresh?.();
    bridge?.ask?.("La negociación no prosperó",
     "La corte o los intermediarios todavía no aceptan la salida propuesta. Conservás todas las pruebas. "+
     "Dado(s): ["+(roll.dice||[]).join(", ")+"].",
     [{label:"Reconsiderar la decisión",action:menu}],"FASE XXI · CLÍMAX");
    return {success:false,choice};
   }
  }
  s.ending=choice;s.endedNight=g.clock.night;s.pressure=clamp(s.pressure+(choice==="rupture"?20:choice==="silence"?8:-7),0,100);
  const deltas={council:{camarilla:12,nosferatu:3},shadows:{nosferatu:12,camarilla:3},
    rupture:{brujah:12,camarilla:-12},silence:{camarilla:-6,nosferatu:-4}};
  for(const [f,d]of Object.entries(deltas[choice])){
   g.factions=g.factions||{};g.factions[f]=clamp((g.factions[f]||0)+d,-100,100);
  }
  if(choice==="council")window.VTM_COURT?.addCase?.(g,"dominio","conspiracy:identity",3,
   "Un dossier corroborado impugna la identidad de quien ocupa el cargo de Senescal. Corresponde investigar antes de resolver responsabilidades.");
  if(choice==="rupture")bridge?.exposure?.(10,"La confrontación entre facciones elevó las sospechas nocturnas.");
  const px=award(g,"ending:"+choice,8);
  record(g,"Crónica resuelta: "+ending.name+".");
  bridge?.advance?.(24);bridge?.save?.();bridge?.refresh?.();
  bridge?.ask?.(ending.name,ending.text+"\n\nLa verdad fue descubierta: "+SECRETS.report+
    "\n\nExperiencia final +"+px+" PX. Las relaciones y las consecuencias de París siguen activas.",
   [{label:"Volver a París",action:()=>{}}],"FASE XXI · FINAL DE CAMPAÑA");
  return {success:true,ending:choice,px};
 }
 function summary(g){
  const s=init(g);if(!s)return null;
  return {started:s.started,chapter:s.chapter,chapterName:ACTS[s.chapter].name,
   counts:[1,2,3].map(n=>count(g,n)),total:LEADS.length,
   verified:LEADS.filter(x=>has(g,x.id)).length,pressure:s.pressure,protected:secured(g),
   support:supporters(g),revealed:s.revealed,ending:s.ending,
   history:s.history.slice(0,10)};
 }
 function journal(g){
  const s=init(g),p=summary(g);if(!s?.started)return [];
  const out=["Conspiración: "+p.chapterName+" · referencias "+p.verified+"/12 · presión "+p.pressure+"/100."];
  for(const a of [1,2,3])out.push("Acto "+a+": "+p.counts[a-1]+"/4 pruebas reunidas.");
  out.push("Testigos protegidos: "+p.protected+" · apoyos: "+(p.support.join(", ")||"ninguno")+".");
  if(s.revealed)out.push("Revelación comprobada: "+SECRETS.report);
  if(s.ending)out.push("Desenlace: "+ENDINGS[s.ending].name+". "+ENDINGS[s.ending].text);
  out.push(...p.history);
  return out;
 }
 function menu(){
  const g=bridge?.getGame?.();if(!g)return;
  const s=init(g),p=summary(g),opts=[];
  const prereq=allowed(g);
  if(!s.started){
   if(!prereq)opts.push({label:"Abrir investigación reservada del Principado",action:()=>{start(g);menu();}});
   opts.push({label:"Volver",action:()=>{}});
   bridge?.ask?.("La conspiración del Principado",prereq||
    "El prólogo está entregado. Podés iniciar una investigación formal y separada, que no interferirá con tus otros encargos.",
    opts,"FASE XXI · CAMPAÑA");return;
  }
  const chapter=ACTS[s.chapter];
  let body=chapter.intro+"\n\n"+chapter.name+
   "\nPruebas por acto: "+p.counts.join(" / ")+" · testigos protegidos "+p.protected+
   " · presión "+p.pressure+"/100 · apoyos: "+(p.support.join(", ")||"ninguno")+".\n\n";
  if(s.ending){
   body=ENDINGS[s.ending].text+"\n\n"+SECRETS.report+"\n\nTu final está registrado. Las otras misiones de París siguen activas.";
  }else if(s.chapter<=3){
   for(const lead of LEADS.filter(x=>x.act===s.chapter)){
    const proved=has(g,lead.id);
    body+=(proved?"✓ ":"○ ")+lead.title+" · "+lead.place+"\n"+
     (proved?(s.clues[lead.id].method==="witness"?lead.social:lead.proof):lead.lead)+"\n\n";
    if(!proved&&at(g,lead.place)&&!s.attempts[g.clock.night+":"+lead.id]){
     opts.push({label:"Examinar pruebas · "+lead.title+" ("+lead.attr+" + "+lead.skill+")",
      action:()=>investigate(g,lead.id,"document")});
     opts.push({label:"Entrevistar testigo · "+lead.title+" ("+lead.altAttr+" + "+lead.altSkill+")",
      action:()=>investigate(g,lead.id,"witness")});
    }
    if(proved&&at(g,lead.place)&&!s.credits["witness:"+lead.id]){
     opts.push({label:"Proteger una fuente · "+lead.title,action:()=>protect(g,lead.id,"protect")});
     opts.push({label:"Presionar a la fuente · "+lead.title,action:()=>protect(g,lead.id,"pressure")});
    }
   }
   if(count(g,s.chapter)>=chapter.threshold)
    opts.push({label:s.chapter===3?"Comparar todas las pruebas de identidad":"Concluir este acto y abrir el siguiente",
     action:()=>closeAct(g)});
  }else{
   body+=SECRETS.identity+"\n\n";
   for(const [id,ending]of Object.entries(ENDINGS)){
    const reason=finaleAvailable(g,id);
    opts.push({label:ending.name+(reason?" · "+reason:""),disabled:!!reason,
      action:()=>conclude(g,id)});
   }
  }
  opts.push({label:"Cerrar",action:()=>{}});
  bridge?.ask?.(s.ending?"El destino del Principado":"Crónicas de París · "+chapter.name,body,
    opts,"FASE XXI · LA CONSPIRACIÓN");
 }
 return Object.freeze({LEADS,ACTS,ENDINGS,bind,init,start,tick,count,secured,supporters,
  investigate,protect,closeAct,finaleAvailable,conclude,summary,journal,menu,version:"21.0"});
})();