"use strict";
/* CRÓNICAS DE PARÍS · Fase XVII · Siete investigaciones reactivas.
 * Complementa el robo de Bastilla sin cambiarlo ni reemplazar las misiones.
 * Cada incidente evoluciona fuera de pantalla y conserva memoria y desenlace.
 */
window.VTM_REACTIVE_DISTRICTS=(()=>{
 const scenarios=[
  {id:"passy",name:"Passy",title:"La valija del mensajero",start:21*60+35,
   report:22*60+15,search:23*60+5,end:24*60+35,
   scene:"Una valija queda abandonada cerca de un portón. Su propietario no aparece y una empleada busca al mensajero.",
   event:"Se encontró una valija olvidada frente a una residencia privada.",
   response:"El portero pide ayuda y solicita que nadie abra la valija sin testigos.",
   searchText:"Un servicio de mensajería reclama la valija; sus datos no coinciden con el recibo.",
   witness:"Portera Adèle",authority:"Encargado de la finca",person:"Repartidor nervioso",shops:["passy-anticuario"],
   heard:"Se comenta que un mensajero desapareció mientras hacía una entrega.",
   evidence:"Anotás una numeración de entrega que no coincide con la guía.",
   help:"Apartás la valija del tránsito antes de que alguien la retire sin permiso.",
   testimony:"Adèle recuerda qué vehículo se detuvo frente al portón.",
   resolution:{verified:"El encargado comprueba la guía, identifica al mensajero y registra una devolución segura.",
    aided:"La valija queda bajo resguardo, pero no se determina quién intentó recogerla.",
    lost:"La pista se difunde tarde; el falso mensajero desaparece con su vehículo.",
    hidden:"La valija se retira sin documentación: la finca sospecha encubrimiento.",
    unresolved:"La valija desaparece y nadie aclara quién la dejó."},
   rumorTo:["stjuly","elysee"]},
  {id:"stjuly",name:"Barrio del St. July",title:"Una invitación falsificada",start:22*60,
   report:22*60+35,search:23*60+20,end:24*60+55,
   scene:"Una invitación aparentemente falsificada provoca una discusión en la puerta de un local nocturno.",
   event:"Un cliente trató de entrar a un club con una invitación irregular.",
   response:"El portero separa a dos grupos mientras revisa la lista.",
   searchText:"El encargado del local reconstruye quién imprimió la invitación.",
   witness:"Camarera nocturna",authority:"Jefe de seguridad",person:"Invitado rechazado",shops:["stjuly-cafe"],
   heard:"Circulan invitaciones falsas para un evento nocturno.",
   evidence:"La tinta y la numeración de la invitación no corresponden al evento.",
   help:"Separás a los participantes y evitás un altercado a la vista del público.",
   testimony:"La camarera identifica quién entregó las invitaciones.",
   resolution:{verified:"Seguridad identifica al revendedor y retira las invitaciones falsas.",
    aided:"El altercado termina sin heridos, aunque el origen de las invitaciones sigue sin aclararse.",
    lost:"El revendedor abandona la zona antes de que se verifiquen las entradas.",
    hidden:"La documentación fue ocultada y el responsable continúa vendiendo accesos.",
    unresolved:"El incidente termina en discusiones y nadie determina la procedencia de las entradas."},
   rumorTo:["bastilla","passy"]},
  {id:"elysee",name:"Distrito del Elíseo",title:"El pase extraviado",start:21*60+55,
   report:22*60+40,search:23*60+35,end:25*60+5,
   scene:"Un pase de acceso civil aparece tirado ante un edificio oficial.",
   event:"Un pase de visitante apareció fuera de su edificio.",
   response:"El personal de seguridad solicita localizar al titular.",
   searchText:"El registro de visitas permite comprobar si el pase se usó tras su pérdida.",
   witness:"Chofer particular",authority:"Agente de seguridad",person:"Visitante preocupado",shops:["elysee-galeria"],
   heard:"Un visitante perdió su acreditación cerca de una residencia oficial.",
   evidence:"La acreditación contiene un número de registro que permite localizar a su titular.",
   help:"Resguardás el pase e impedís que se utilice indebidamente.",
   testimony:"Un chofer recuerda a quién vio recoger una acreditación similar.",
   resolution:{verified:"Seguridad identifica al titular y anula el pase extraviado.",
    aided:"El pase deja de circular, aunque la cronología de su pérdida sigue sin aclararse.",
    lost:"El titular tarda en recibir el aviso y se solicita una revisión adicional.",
    hidden:"Una acreditación fue escondida y se intensifican los controles de seguridad.",
    unresolved:"El pase permanece sin localizar y la institución aplica restricciones generales."},
   rumorTo:["passy","policia"]},
  {id:"hemeroteca",name:"Barrio de la Hemeroteca",title:"Un legajo alterado",start:21*60+45,
   report:22*60+20,search:23*60+15,end:24*60+45,
   scene:"Faltan páginas en un legajo histórico y el personal discute cuándo fueron retiradas.",
   event:"Un legajo importante apareció incompleto en el archivo.",
   response:"La responsable del turno revisa las solicitudes de consulta.",
   searchText:"Una hoja de préstamos revela discrepancias entre firmas y horarios.",
   witness:"Auxiliar de archivo",authority:"Responsable de sala",person:"Investigador visitante",shops:["hemeroteca-libreria"],
   heard:"En la hemeroteca se extraviaron páginas de un legajo.",
   evidence:"Encontrás marcas de extracción reciente y referencias a páginas faltantes.",
   help:"Protegés los papeles sueltos de una limpieza que iba a descartarlos.",
   testimony:"La auxiliar reconoce a quien solicitó el legajo antes del incidente.",
   resolution:{verified:"El archivo reconstruye la cadena de préstamos y conserva los indicios para recuperar los documentos.",
    aided:"Se protegen las páginas restantes, pero la desaparición no se esclarece.",
    lost:"La documentación incompleta se devuelve al depósito sin una atribución fiable.",
    hidden:"La ocultación de páginas obliga al archivo a restringir nuevas consultas.",
    unresolved:"Las páginas siguen faltando y nadie asume responsabilidad."},
   rumorTo:["policia","stjuly"]},
  {id:"saintdenis",name:"Saint-Denis",title:"El cargamento desviado",start:22*60+5,
   report:22*60+55,search:23*60+45,end:25*60+10,
   scene:"Un camión llega a un depósito con un precinto distinto al descrito en su hoja de ruta.",
   event:"Un envío industrial llegó con el precinto alterado.",
   response:"El capataz detiene temporalmente la descarga.",
   searchText:"Los encargados cotejan la matrícula con los registros del depósito.",
   witness:"Conductor del turno",authority:"Capataz del depósito",person:"Operario de carga",shops:["saintdenis-reparaciones","saintdenis-lavanderia"],
   heard:"Un camión descargó material con papeles contradictorios.",
   evidence:"El número de precinto y el manifiesto de carga no coinciden.",
   help:"Impedís que un trabajador quede expuesto a una carga inestable.",
   testimony:"El conductor recuerda un desvío no previsto en la ruta.",
   resolution:{verified:"El depósito identifica la irregularidad e inmoviliza temporalmente el envío.",
    aided:"La descarga termina sin accidentes, pero la procedencia de parte de la mercancía sigue en revisión.",
    lost:"El vehículo abandona el depósito antes de que se contrasten sus documentos.",
    hidden:"La manipulación del manifiesto genera sospechas y un control posterior.",
    unresolved:"La carga se almacena sin que nadie aclare sus inconsistencias."},
   rumorTo:["tuneles","policia"]},
  {id:"policia",name:"Barrio del Archivo Policial",title:"La carpeta extraviada",start:21*60+50,
   report:22*60+30,search:23*60+25,end:25*60,
   scene:"Una carpeta de registro queda junto a un vehículo de reparto fuera del edificio policial.",
   event:"Se perdió temporalmente un paquete de documentación administrativa.",
   response:"Un empleado solicita revisar el registro de entregas.",
   searchText:"El personal verifica la cadena de recepción y las firmas pendientes.",
   witness:"Mensajera municipal",authority:"Responsable de recepción",person:"Oficinista preocupado",shops:["policia-cafeteria"],
   heard:"Un envío administrativo llegó al edificio policial sin constancia de entrega.",
   evidence:"Un sello de recepción contiene una hora incompatible con la salida del mensajero.",
   help:"Evitás que la carpeta quede abandonada a la vista del público.",
   testimony:"La mensajera aporta un itinerario y una referencia al receptor.",
   resolution:{verified:"La recepción localiza el registro correcto y deja constancia del incidente.",
    aided:"La carpeta se resguarda, pero la entrega permanece bajo revisión.",
    lost:"Una falta de firmas retrasa la reconstrucción del movimiento documental.",
    hidden:"La desaparición intencionada de una referencia obliga a revisar otras entregas.",
    unresolved:"El trámite queda pendiente y los empleados responsabilizan al servicio de mensajería."},
   rumorTo:["hemeroteca","elysee"]},
  {id:"tuneles",name:"Acceso a los Túneles",title:"La avería del conducto",start:22*60+10,
   report:22*60+50,search:23*60+40,end:25*60+15,
   scene:"Sale vapor de una rejilla y dos operarios discuten sobre la seguridad de una instalación subterránea.",
   event:"Una avería provocó vapor y agua cerca de un acceso técnico.",
   response:"Un equipo delimita el acceso mientras busca el origen del fallo.",
   searchText:"Mantenimiento compara la presión de varias tuberías cercanas.",
   witness:"Operaria de mantenimiento",authority:"Jefe de cuadrilla",person:"Peatón afectado",shops:["tuneles-almacen"],
   heard:"Una avería mantiene cerrado parte de un acceso subterráneo.",
   evidence:"Las marcas de presión indican qué válvula presentó una pérdida.",
   help:"Alejás a un peatón del conducto antes de que se acerque al vapor.",
   testimony:"La operaria explica cuándo comenzó la anomalía y qué equipo fue revisado.",
   resolution:{verified:"La cuadrilla localiza la válvula defectuosa y registra una reparación provisional.",
    aided:"La zona queda señalizada y sin peatones expuestos mientras sigue la avería.",
    lost:"Se pierde tiempo buscando la fuente y el sector permanece restringido.",
    hidden:"La ocultación de las indicaciones dificulta el trabajo de reparación.",
    unresolved:"El acceso continúa delimitado y los técnicos no identifican el origen del fallo."},
   rumorTo:["saintdenis","bastilla"]}
 ];
 const defs=Object.freeze(scenarios.map(c=>Object.freeze(c)));
 const byId=Object.fromEntries(defs.map(d=>[d.id,d]));
 const STAGES=["pending","incident","response","search","closed"];
 const OUTCOMES=["verified","aided","lost","hidden","unresolved"];
 const stateKey="reactiveDistricts";
 const spots=[
  {id:"clue",x:236,y:216,kind:"clue"},
  {id:"witness",x:186,y:177,kind:"npc"},
  {id:"authority",x:296,y:178,kind:"npc"},
  {id:"person",x:238,y:159,kind:"npc"}
 ];
 let api=null;
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const gameMinute=g=>(g.clock.minutes<12*60?g.clock.minutes+1440:g.clock.minutes);
 const initialNight=g=>g.clock.minutes<12*60?g.clock.night+1:g.clock.night;
 const clock=(g,c)=>(g.clock.night-c.night)*1440+gameMinute(g);
 const outcomeText=(def,c)=>def.resolution[c.outcome]||"La situación sigue sin esclarecerse.";
 function bind(bridge){api=bridge;}
 function init(g){
  if(!g||typeof g!=="object")return null;
  let s=g[stateKey];if(!s||typeof s!=="object"||Array.isArray(s))s=g[stateKey]={};
  if(!s.cases||typeof s.cases!=="object"||Array.isArray(s.cases))s.cases={};
  if(!Array.isArray(s.rumors))s.rumors=[];
  s.rumors=s.rumors.filter(r=>r&&byId[r.origin]&&typeof r.district==="string"&&typeof r.text==="string").slice(-96);
  for(const def of defs){
   let c=s.cases[def.id];
   if(!c||typeof c!=="object"||Array.isArray(c))c=s.cases[def.id]={};
   c.night=Math.max(1,Math.floor(Number(c.night)||initialNight(g)));
   c.stage=STAGES.includes(c.stage)?c.stage:"pending";
   c.outcome=OUTCOMES.includes(c.outcome)?c.outcome:null;
   c.flags=c.flags&&typeof c.flags==="object"&&!Array.isArray(c.flags)?c.flags:{};
   c.attempts=c.attempts&&typeof c.attempts==="object"&&!Array.isArray(c.attempts)?c.attempts:{};
   c.history=Array.isArray(c.history)?c.history.filter(e=>e&&typeof e.text==="string").slice(-12):[];
   c.memory=c.memory&&typeof c.memory==="object"&&!Array.isArray(c.memory)?c.memory:{};
   for(const key of ["witness","authority","neighbors"])
    c.memory[key]=clamp(Number(c.memory[key])||0,-3,3);
  }
  return s;
 }
 function record(c,id,text,minute){
  if(c.history.some(h=>h.id===id))return false;
  c.history.push({id,text,minute});c.history=c.history.slice(-12);return true;
 }
 function spread(s,c,def,label,text,minute,targets){
  for(const district of targets){
   const id=def.id+":"+label+":"+district;
   if(s.rumors.some(r=>r.id===id))continue;
   s.rumors.push({id,origin:def.id,district,text,minute,night:c.night});
  }
  s.rumors=s.rumors.slice(-96);
 }
 function decide(c){
  if(c.flags.hidden)return "hidden";
  if(c.flags.reported&&(c.flags.evidence||c.flags.testimony||c.flags.shop))return "verified";
  if(c.flags.helped)return "aided";
  if(c.flags.evidence||c.flags.testimony||c.flags.shop)return "lost";
  return "unresolved";
 }
 function tick(g,finishNight=false){
  const s=init(g);if(!s)return[];
  const changes=[];
  for(const def of defs){
   const c=s.cases[def.id];
   if(c.outcome)continue;
   const now=finishNight&&g.clock.night===c.night?def.end:clock(g,c);
   if(now<def.start)continue;
   const phases=[
    ["incident","incident",def.start,def.event,[def.id]],
    ["response","response",def.report,def.response,[def.id,...def.rumorTo.slice(0,1)]],
    ["search","search",def.search,def.searchText,[def.id,...def.rumorTo]]
   ];
   for(const [stage,id,at,description,dest] of phases){
    if(now<at||!record(c,id,description,at))continue;
    c.stage=stage;spread(s,c,def,id,description,at,dest);
    changes.push({district:def.id,stage,text:description});
   }
   if(now>=def.end){
    c.outcome=decide(c);c.stage="closed";
    const msg=outcomeText(def,c);
    if(record(c,"closed",msg,def.end)){
     spread(s,c,def,"end",msg,def.end,[def.id,...def.rumorTo]);
     changes.push({district:def.id,stage:"closed",text:msg,outcome:c.outcome});
    }
   }
  }
  return changes;
 }
 function visible(g){
  if(g?.scene!=="district"||!byId[g.district])return[];
  const def=byId[g.district],c=init(g).cases[def.id],now=clock(g,c);
  if(c.stage==="pending"||c.stage==="closed")return[];
  return spots.filter(s=>s.id!=="authority"||now>=def.report)
   .filter(s=>s.id!=="person"||now<def.report)
   .filter(s=>s.id!=="witness"||!c.flags.intimidated)
   .map(p=>({...p,title:p.id==="witness"?def.witness:p.id==="authority"?def.authority:p.id==="person"?def.person:def.title}));
 }
 function near(g,range=30){
  return visible(g).map(s=>({...s,d:Math.hypot(g.x-s.x,g.y-s.y)}))
   .filter(s=>s.d<=range).sort((a,b)=>a.d-b.d)[0]||null;
 }
 function change(g,def,flag,message,effects){
  const s=init(g),c=s.cases[def.id];
  if(c.outcome||c.flags[flag])return false;
  c.flags[flag]=true;
  for(const [k,v]of Object.entries(effects||{}))c.memory[k]=clamp(c.memory[k]+v,-3,3);
  record(c,"action-"+flag,message,clock(g,c));
  api?.log?.(def.name+": "+message);api?.save?.();api?.refresh?.();
  return true;
 }
 function result(title,body){
  api?.ask?.(title,body,[{label:"Continuar explorando",action:()=>{}}],"PARÍS REACTIVO · INVESTIGACIÓN");
 }
 function test(g,def,flag,attr,skill,diff,positive,negative,effects){
  const c=init(g).cases[def.id];
  if(c.outcome||c.flags[flag]||c.attempts[flag]===g.clock.night)return;
  const dice=api?.roll?.(attr,skill,diff)||{success:false,dice:[]};
  c.attempts[flag]=g.clock.night;
  if(dice.success)change(g,def,flag,positive,effects);
  else {
   record(c,"fail-"+flag+"-"+g.clock.night,negative,clock(g,c));
   if(flag==="testimony")c.memory.witness=clamp(c.memory.witness-1,-3,3);
   api?.log?.(negative);api?.save?.();
  }
  api?.advance?.(7);
  result(dice.success?"Indicio contrastado":"No conseguís confirmar la pista",
   (dice.success?positive:negative)+"\n\n"+attr+" + "+skill+" (dif. "+diff+") · Dados: "+(dice.dice||[]).join(", "));
 }
 function scene(g,point){
  const s=init(g),def=byId[g.district],c=s.cases[def.id];
  if(c.outcome)return result(def.title,outcomeText(def,c));
  const opts=[];
  if(point==="clue"){
   if(!c.flags.evidence&&c.attempts.evidence!==g.clock.night)
    opts.push({label:"Examinar indicios · Percepción + Investigación (dif. 6)",action:()=>test(g,def,"evidence","Percepción","Investigación",6,def.evidence,"No conseguís identificar marcas verificables.",{authority:1})});
   if((c.flags.evidence||c.flags.helped)&&!c.flags.hidden&&!c.flags.reported)
    opts.push({label:"Ocultar lo encontrado",action:()=>{
      if(!change(g,def,"hidden","Ocultaste parte de la información.",{authority:-2,neighbors:-2}))return;
      api?.exposure?.(2,"La alteración de una investigación puede despertar sospechas.");
      api?.advance?.(6);result("Una decisión arriesgada",def.resolution.hidden);
    }});
   return api?.ask?.(def.title,def.scene+"\n\nBuscá detalles concretos antes de presentar conclusiones.",
    [...opts,{label:"Alejarte",action:()=>{}}],"PARÍS REACTIVO · ESCENA");
  }
  if(point==="witness"){
   if(!c.flags.testimony&&c.attempts.testimony!==g.clock.night)
    opts.push({label:"Escuchar al testigo · Carisma + Empatía (dif. 6)",action:()=>test(g,def,"testimony","Carisma","Empatía",6,def.testimony,"El testigo evita precisar lo que vio.",{witness:1,neighbors:1})});
   if(!c.flags.intimidated&&c.attempts.intimidated!==g.clock.night)
    opts.push({label:"Intimidarlo para que calle · Manipulación + Intimidación (dif. 7)",action:()=>{
      const r=api?.roll?.("Manipulación","Intimidación",7)||{success:false,dice:[]};
      c.attempts.intimidated=g.clock.night;
      if(r.success)change(g,def,"intimidated","El testigo se aleja atemorizado.",{witness:-2,authority:-1});
      else{record(c,"attempt-threat","El testigo pide ayuda tras la amenaza.",clock(g,c));api?.save?.();}
      api?.exposure?.(3,"La amenaza a un mortal llama la atención.");
      api?.advance?.(6);result("La reacción del testigo",r.success?"La persona abandona la calle. No es la única fuente posible.":"El testigo busca protección y no colabora.");
    }});
   return api?.ask?.(def.witness,def.scene+"\n\n"+(c.flags.intimidated?"La persona ya no quiere hablar.":"El testigo teme implicarse y conoce solamente una parte de lo sucedido."),
    [...opts,{label:"No intervenir",action:()=>{}}],"PARÍS REACTIVO · TESTIGO");
  }
  if(point==="person"){
   if(!c.flags.helped&&c.attempts.helped!==g.clock.night)
    opts.push({label:"Auxiliar sin violencia · Destreza + Atletismo (dif. 6)",action:()=>test(g,def,"helped","Destreza","Atletismo",6,def.help,"No conseguís intervenir a tiempo, pero evitás agravar el peligro.",{neighbors:1})});
   return api?.ask?.(def.person,def.scene+"\n\nHay una situación inmediata que podés aliviar sin resolver necesariamente el caso.",
    [...opts,{label:"Observar",action:()=>{}}],"PARÍS REACTIVO · DECISIÓN");
  }
  if(point==="authority"){
   if(!c.flags.reported){
    opts.push({label:"Entregar pruebas contrastadas",action:()=>{
      if(c.flags.hidden)return result("Información incompleta","Ocultaste parte de los indicios. No es posible borrar ese hecho con una declaración posterior.");
      if(!(c.flags.evidence||c.flags.testimony||c.flags.shop))
       return result("Necesitás corroboración","El responsable pide una prueba verificable o un testimonio antes de actuar.");
      if(change(g,def,"reported","Presentaste datos verificables ante el responsable.",{authority:2,neighbors:1})){
       api?.advance?.(8);result("Investigación formal","La información se incorpora al registro. El responsable verificará los hechos antes de actuar.");
      }
    }});
   }
   return api?.ask?.(def.authority,def.response+"\n\n"+(c.flags.reported?"Ya registró la información que aportaste.":"Puede actuar cuando reciba indicios suficientemente contrastados."),
    [...opts,{label:"Continuar",action:()=>{}}],"PARÍS REACTIVO · RESPONSABLE");
  }
 }
 function interact(g){const point=near(g);if(!point)return false;scene(g,point.id);return true;}
 function shopChoices(g,shop){
  if(!shop||!byId[shop.district])return[];
  const s=init(g),def=byId[shop.district],c=s.cases[def.id];
  const notices=s.rumors.filter(r=>r.district===shop.district);
  if(!notices.length)return[];
  const last=notices[notices.length-1];
  const opts=[{label:"Consultar rumores: "+def.title,action:()=>{
   if(!c.flags["rumor-"+shop.id]){c.flags["rumor-"+shop.id]=true;api?.save?.();}
   result("Rumores de "+shop.name,last.text+"\n\nSon versiones difundidas por los vecinos; contrastarlas requiere testigos o pruebas.");
  }}];
  if(def.shops.includes(shop.id)&&!c.outcome&&!c.flags.shop&&c.attempts.shop!==g.clock.night)
   opts.push({label:"Contrastar registros del comercio · Carisma + Etiqueta (dif. 7)",action:()=>test(g,def,"shop","Carisma","Etiqueta",7,
     "El encargado aporta una referencia comprobable que ayuda a reconstruir el incidente.",
     "El comerciante no comparte documentación sin mayores garantías.",{neighbors:1,authority:1})});
  return opts;
 }
 function draw(c,g,time=0){
  const points=visible(g);if(!points.length)return;
  const rectangle=(x,y,w,h,fill)=>{c.fillStyle=fill;c.fillRect(Math.round(x),Math.round(y),w,h);};
  for(const p of points){
   const bob=Math.sin(time*2+p.x)*1.5;
   if(p.id==="clue"){rectangle(p.x-12,p.y-3,24,7,"#756b66");rectangle(p.x-6,p.y-6,13,4,"#cfb492");}
   else{
    rectangle(p.x-6,p.y+7,12,3,"#10111b88");
    rectangle(p.x-5,p.y-8,10,16,p.id==="authority"?"#546477":p.id==="person"?"#7e6256":"#755f74");
    rectangle(p.x-3,p.y-15,6,7,"#c4a08c");
   }
   rectangle(p.x-5,p.y-31+bob,10,10,"#493044");
   rectangle(p.x-3,p.y-29+bob,6,6,"#e2bf8e");
   c.fillStyle="#17151b";c.textAlign="center";c.font="bold 8px monospace";c.fillText("!",p.x,p.y-23+bob);
  }
 }
 function overview(g){
  const s=init(g);
  return defs.map(def=>{
   const c=s.cases[def.id];
   return{name:def.name,title:def.title,stage:c.stage,outcome:c.outcome,
    history:c.history.map(h=>h.text),memory:{...c.memory},night:c.night,flags:{...c.flags}};
  });
 }
 function bulletin(g){
  const s=init(g);
  const states=defs.map(d=>{
   const c=s.cases[d.id],ended=c.outcome?d.resolution[c.outcome]:"Estado: "+c.stage;
   return d.name+" — "+d.title+"\n"+ended;
  }).join("\n\n");
  const recent=s.rumors.slice(-8).map(r=>r.district+": "+r.text).join("\n");
  return "SUCESOS REACTIVOS DE PARÍS\n\n"+states+"\n\nRUMORES RECIENTES\n"+(recent||"Todavía no hay novedades.");
 }
 function menu(){
  const g=api?.getGame?.();if(!g)return;
  const p=near(g),opts=[];
  if(p)opts.push({label:"Interactuar: "+p.title,action:()=>scene(g,p.id)});
  opts.push({label:"Cerrar",action:()=>{}});
  api?.ask?.("Los siete barrios — París reactivo",bulletin(g),opts,"FASE XVII · MUNDO REACTIVO");
 }
 return Object.freeze({defs,byId,bind,init,tick,visible,near,interact,shopChoices,draw,overview,bulletin,menu,version:"17.0"});
})();