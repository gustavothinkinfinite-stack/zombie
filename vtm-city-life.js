"use strict";
/* Crónicas de París · Fase XV · Mundo nocturno autónomo.
 * Peatones, circulación, turnos comerciales y acontecimientos por reloj de juego.
 * Efectos persistentes, sin recompensas repetibles ni información vampírica secreta.
 */
window.VTM_CITY_LIFE=(()=>{
 const defs=[
  {id:"passy",people:["Portero de la finca","Residente nocturno","Repartidora"],events:[
   ["Llegada discreta","Un automóvil con cristales oscuros deja a varios invitados ante un portón. Nadie anuncia sus nombres.",[277,169]],
   ["Recogida nocturna","Un servicio de mensajería retira cajas sin identificación en una calle lateral.",[202,169]]]},
  {id:"stjuly",people:["Noctámbula","Portero de discoteca","Taxista"],events:[
   ["Fila ante un local","Un grupo espera su turno mientras el portero comprueba una lista de invitados.",[202,169]],
   ["Taxi sin pasajero","Un taxi se detiene junto a la acera y se marcha pocos minutos después sin recoger a nadie.",[277,169]]]},
  {id:"elysee",people:["Paseante elegante","Chofer","Vigilante discreto"],events:[
   ["Vehículo diplomático","Un coche oficial permanece unos minutos junto a un edificio vigilado.",[277,169]],
   ["Cambio de guardia","Dos empleados relevan discretamente a sus compañeros junto a la entrada de una residencia.",[202,169]]]},
  {id:"hemeroteca",people:["Estudiante nocturno","Mensajero de prensa","Bibliotecaria"],events:[
   ["Edición de madrugada","Un repartidor descarga paquetes de periódicos mientras varios empleados revisan la cabecera.",[202,169]],
   ["Archivo iluminado","Una ventana del archivo vuelve a iluminarse poco después de que el resto del edificio cerrara.",[277,169]]]},
  {id:"bastilla",people:["Músico de bar","Repartidor","Vecina del barrio"],events:[
   ["Discusión en la terraza","Una conversación animada atrae a curiosos, pero se disuelve antes de que llegue una patrulla.",[202,169]],
   ["Persiana a deshora","Un comerciante abre brevemente una persiana para recibir una entrega imprevista.",[277,169]]]},
  {id:"saintdenis",people:["Operario de depósito","Conductora","Vigilante industrial"],events:[
   ["Carga fuera de horario","Un camión recoge mercancía a una hora poco habitual. Los operarios evitan hablar con extraños.",[277,169]],
   ["Alarma en un depósito","Se encienden las luces de un almacén y un vigilante recorre la calle antes de regresar.",[202,169]]]},
  {id:"policia",people:["Agente de patrulla","Empleado del archivo","Conductor de servicio"],events:[
   ["Cambio de patrulla","Un vehículo policial regresa al estacionamiento mientras otra unidad inicia su recorrido.",[277,169]],
   ["Documentación urgente","Dos trabajadores trasladan carpetas al edificio oficial después del cierre.",[202,169]]]},
  {id:"tuneles",people:["Técnica de mantenimiento","Peatón apurado","Repartidor nocturno"],events:[
   ["Mantenimiento subterráneo","Una cuadrilla revisa una rejilla mientras el tránsito pasa sin prestarle atención.",[202,169]],
   ["Apagón breve","Varias luminarias fallan durante unos instantes y regresan poco después.",[277,169]]]}
 ];
 const byId=Object.fromEntries(defs.map(d=>[d.id,d]));
 const eventMinutes=[21*60+10,23*60+25,24*60+55]; // noche continua; 24:55 equivale a 00:55
 const hash=(a,b,c=0)=>{let v=Math.imul(a+19,2654435761)^Math.imul(b+37,1597334677)^Math.imul(c+71,2246822519);v=Math.imul(v^(v>>>16),2246822519);return ((v^(v>>>13))>>>0)/4294967295;};
 const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
 const phase=minutes=>minutes<12*60?minutes+1440:minutes;
 const hhmm=m=>String(Math.floor(m/60)%24).padStart(2,"0")+":"+String(Math.floor(m%60)).padStart(2,"0");
 const current=g=>phase(g?.clock?.minutes??1215);
 let api=null;
 function bind(callbacks){api=callbacks;}
 function init(g){
  if(!g||typeof g!=="object")return null;
  const s=g.cityLife&&typeof g.cityLife==="object"&&!Array.isArray(g.cityLife)?g.cityLife:(g.cityLife={});
  if(!Array.isArray(s.feed))s.feed=[];
  s.feed=s.feed.filter(e=>e&&typeof e==="object"&&byId[e.district]&&Number.isInteger(e.night)&&typeof e.id==="string").slice(-64);
  if(!s.seen||typeof s.seen!=="object"||Array.isArray(s.seen))s.seen={};
  if(!s.talked||typeof s.talked!=="object"||Array.isArray(s.talked))s.talked={};
  if(!s.checked||typeof s.checked!=="object"||Array.isArray(s.checked))s.checked={};
  if(!Array.isArray(s.surveillanceEpisodes))s.surveillanceEpisodes=[];
  s.surveillanceEpisodes=s.surveillanceEpisodes.filter(e=>e&&byId[e.district]&&
   Number.isInteger(e.night)&&e.night>=1&&["observe","avoid"].includes(e.choice)&&
   ["unconfirmed","noticed","avoided"].includes(e.outcome)&&typeof e.summary==="string").slice(-16);
  return s;
 }
 function plan(night,district){
  const def=byId[district];if(!def)return[];
  return def.events.map((e,i)=>{
   const minute=eventMinutes[(i+night+defs.indexOf(def))%eventMinutes.length]+Math.floor(hash(night,i,defs.indexOf(def))*23);
   return{id:night+":"+district+":"+i,night,district,title:e[0],detail:e[1],x:e[2][0],y:e[2][1],minute,end:minute+75};
  }).sort((a,b)=>a.minute-b.minute);
 }
 function tick(g,throughNight=false){
  const s=init(g);if(!s)return [];
  const night=Math.max(1,Math.floor(Number(g.clock?.night)||1)),now=throughNight?1810:current(g);
  const recent=new Set(s.feed.map(e=>e.id)),born=[];
  for(const d of defs){
   for(const e of plan(night,d.id)){
    if(e.minute>now||recent.has(e.id))continue;
    const item={...e};s.feed.push(item);recent.add(e.id);born.push(item);
   }
  }
  if(s.feed.length>64)s.feed=s.feed.slice(-64);
  const oldest=night-3;
  s.feed=s.feed.filter(e=>e.night>=oldest);
  for(const map of [s.seen,s.talked,s.checked]){
   for(const key of Object.keys(map)){
    const n=Number(key.split(":")[0]);if(Number.isFinite(n)&&n<oldest)delete map[key];
   }
  }
  return born;
 }
 function recent(g,city=null,limit=6){
  const s=init(g);if(!s)return[];
  return s.feed.filter(e=>(!city||e.district===city)).slice(-limit).reverse();
 }
 function active(g,city=g?.district){
  const s=init(g);if(!s||!byId[city])return[];
  const now=current(g),night=g.clock.night;
  return s.feed.filter(e=>e.district===city&&e.night===night&&e.minute<=now&&e.end>now);
 }
 const hours=Object.freeze({
  cafe:[19,4],flores:[19,1],oficina:[20,0],taller:[20,2],galeria:[20,1],
  libros:[19,1],anticuario:[20,1],almacen:[20,5]});
 function shopState(g,shop){
  if(!shop)return null;
  const span=hours[shop.kind]||[20,2],h=((g?.clock?.minutes??1215)/60)%24;
  const open=span[1]<span[0]?(h>=span[0]||h<span[1]):h>=span[0]&&h<span[1];
  const count=open?Math.max(0,Math.floor(1+hash(g.clock.night,shop.side,shop.id.length)*3+(Math.sin(current(g)*.09+shop.x)+1))):0;
  return{open,hours:hhmm(span[0]*60)+"–"+hhmm(span[1]*60),customers:Math.min(4,count),
   label:open?"Abierto al público":"Atención fuera del horario habitual"};
 }
 function shopReport(g,shop){
  const state=shopState(g,shop);
  return state.label+" · "+state.hours+" · "+state.customers+" cliente(s) estimados. "+
   (state.open?"El comercio recibe visitas durante el turno nocturno.":"El acceso del jugador permanece disponible mediante las rutas narrativas ya existentes.");
 }
 function pedestrian(g,idx,time=0){
  if(!byId[g?.district])return null;
  const role=byId[g.district].people[idx%3],n=defs.findIndex(d=>d.id===g.district);
  const routes=[
   {lo:195,hi:284,y:143,vertical:false},
   {lo:195,hi:285,y:177,vertical:false},
   {lo:137,hi:248,x:294,vertical:true},
   {lo:138,hi:243,x:185,vertical:true}
  ],route=routes[idx%4];
  const timePhase=clamp(current(g)-19*60,0,1000)*.12+time*3.4+hash(g.clock.night,n,idx)*150;
  const span=route.hi-route.lo,t=((timePhase%(span*2))+span*2)%(span*2);
  const value=route.lo+(t>span?span*2-t:t);
  let x=route.vertical?route.x:value,y=route.vertical?value:route.y;
  const dist=Math.hypot(x-g.x,y-g.y);
  if(dist<20){ // ceder un paso al jugador sin alterar colisiones
   if(route.vertical)x+=g.x<=x?9:-9;else y+=g.y<=y?9:-9;
  }
  return{id:g.district+":walker:"+idx,name:role,x,y,coat:["#73616d","#516979","#86625e","#64736a"][idx%4],
   face:["#c69f8d","#b68b76","#ddbba5"][idx%3]};
 }
 function walkers(g,time=0){
  if(g?.scene!=="district"||!byId[g.district])return[];
  const h=current(g);
  const total=h>=26*60?2:h>=24*60?3:4;
  return Array.from({length:total},(_,i)=>pedestrian(g,i,time));
 }
 function nearWalker(g,time=0,range=21){
  return walkers(g,time).map(w=>({...w,d:Math.hypot(w.x-g.x,w.y-g.y)}))
    .filter(w=>w.d<=range).sort((a,b)=>a.d-b.d)[0]||null;
 }
 function nearEvent(g,range=28){
  return active(g).map(e=>({...e,d:Math.hypot(e.x-g.x,e.y-g.y)}))
   .filter(e=>e.d<=range).sort((a,b)=>a.d-b.d)[0]||null;
 }
 function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h));}
 function human(c,x,y,coat,skin="#bd9584",time=0){
  rect(c,x-5,y+8,11,3,"#12172391");
  rect(c,x-4,y+1,3,8,"#1d1d25");rect(c,x+1,y+1,3,8,"#25232b");
  rect(c,x-5,y-9,10,13,coat);rect(c,x-2,y-15,6,6,skin);
  rect(c,x-3,y-17,8,3,"#28232e");
  if(Math.floor(time*5)%3===0)rect(c,x+5,y-4,3,5,coat);
 }
 function districtDraw(c,g,time=0,fx=true){
  if(g?.scene!=="district"||!byId[g.district])return;
  const h=current(g),vehicles=h>=27*60?1:h>=24*60?2:3;
  // Carriles visuales: el tráfico no impone colisiones nuevas a partidas viejas.
  for(let i=0;i<vehicles;i++){
   const direction=i%2===0?1:-1,progress=(time*(i===0?21:17)+i*179+g.clock.night*13)%550;
   const x=direction>0?progress-38:510-progress,y=i%2===0?155:182;
   if(x<14||x>468)continue;
   rect(c,x-15,y-5,30,11,["#455b72","#6a4b5e","#595d54"][i%3]);
   rect(c,x-9,y-6,16,3,"#a2a2ad");rect(c,x-7,y-4,14,5,"#2c3844");
   rect(c,x+(direction>0?12:-17),y-2,4,3,"#e6d1b0");
   rect(c,x+(direction>0?-15:12),y+1,3,2,"#ab565a");
  }
  for(const w of walkers(g,time))human(c,w.x,w.y,w.coat,w.face,time);
  for(const s of active(g)){
   const seen=!!init(g).seen[s.id];
   const pulse=Math.sin(time*3+s.x)*1.8;
   rect(c,s.x-8,s.y-23+pulse,16,14,seen?"#50645f":"#74505a");
   rect(c,s.x-5,s.y-20+pulse,10,8,seen?"#a7bfad":"#e4b883");
   rect(c,s.x-1,s.y-18+pulse,3,5,"#171723");
  }
  const shops=window.VTM_SHOPS?.byDistrict[g.district]||[];
  for(const shop of shops){
   const info=shopState(g,shop),x=shop.x,y=shop.y;
   rect(c,x-6,y-33,12,5,info.open?"#7d9a80":"#8d656e");
   rect(c,x-3,y-32,6,2,info.open?"#c0d1aa":"#d6a99f");
  }
 }
 function shopDraw(c,g,time=0){
  if(g?.scene!=="sidevenue")return;
  const shop=window.VTM_SHOPS?.byId[g.sidevenue],info=shopState(g,shop);
  if(!shop||!info)return;
  rect(c,238,57,4,4,info.open?"#83a584":"#a56a74");
  // Clientela distinta del encargado; itinerarios modestos entre dos vitrinas.
  for(let i=0;i<info.customers;i++){
   const p=time*(3+i*.8)+i*37+g.clock.night*11,x=[151,180,311,342][i]+Math.sin(p*.14)*8;
   const y=247+Math.sin(p*.2+i)*4;
   human(c,x,y,["#69556d","#63717b","#77635a","#637064"][i],undefined,time);
  }
 }
 function nearShopVisitor(g,time=0,range=22){
  if(g?.scene!=="sidevenue")return null;
  const shop=window.VTM_SHOPS?.byId[g.sidevenue],state=shopState(g,shop);
  if(!shop||!state?.open)return null;
  const entries=Array.from({length:state.customers},(_,i)=>{
   const p=time*(3+i*.8)+i*37+g.clock.night*11;
   const x=[151,180,311,342][i]+Math.sin(p*.14)*8,y=247+Math.sin(p*.2+i)*4;
   return {id:shop.id+":customer:"+i,name:"Cliente nocturno",x,y,d:Math.hypot(g.x-x,g.y-y)};
  });
  return entries.filter(x=>x.d<=range).sort((a,b)=>a.d-b.d)[0]||null;
 }
 // Los clientes reflejan decisiones sociales ya públicas del establecimiento
 // y su vecino, sin alterar relaciones, pruebas ni expedientes.
 function shopperReaction(g,shop){
  if(g?.scene!=="sidevenue"||!shop||shop.id!==g.sidevenue||!byId[shop.district])return "";
  const own=g.localPlaces?.[shop.id]?.decision;
  const other=(window.VTM_SHOPS?.byDistrict?.[shop.district]||[]).find(s=>s.id!==shop.id);
  const nearby=other?g.localPlaces?.[other.id]?.decision:null;
  let note=own==="help"?
   "Un cliente comenta que colaboraste con este comercio y te saluda con cordialidad.":
   own==="pressure"?
   "Un cliente recuerda una discusión tensa contigo en este local y evita prolongar la conversación.":
   nearby==="help"?
   "Tu colaboración con otro negocio del barrio llegó a oídos de algunos clientes.":
   nearby==="pressure"?
   "Se habla de un altercado en otro comercio del barrio. El cliente responde con cautela.":"";
  const heat=Number(g.cityConsequences?.heat?.[shop.district]);
  if(Number.isFinite(heat)&&heat>=40)
   note+=(note?" ":"")+"Las patrullas frecuentes hacen que los clientes hablen en voz baja.";
  return note;
 }
 function interactShop(g,time=0){
  const visitor=nearShopVisitor(g,time);if(!visitor)return false;
  const state=init(g),key=g.clock.night+":"+visitor.id;
  const shop=window.VTM_SHOPS?.byId[g.sidevenue],already=!!state.talked[key];
  const reaction=shopperReaction(g,shop);
  const body=already?"La persona continúa comprando y no tiene más novedades esta noche.":
   "Un cliente examina los artículos y comenta que la actividad del establecimiento cambia notablemente después de medianoche. No conoce los secretos de los Vástagos.";
  const choices=[{label:already?"Despedirte":"Escuchar y tomar nota",action:()=>{
   if(!already){state.talked[key]=true;api?.log?.("Hablaste con un cliente nocturno de "+shop.name+".");}
   api?.refresh?.();api?.save?.();
  }}];
  if(reaction)choices.push({label:"Preguntar qué se comenta sobre vos",action:()=>{
   const id=g.clock.night+":shop-reaction:"+visitor.id;
   if(!state.checked[id]){
    state.checked[id]=true;
    api?.log?.("Impresión comercial sin verificar en "+shop.name+": "+reaction);
    api?.save?.();
   }
   api?.ask?.("Conversación de mostrador",reaction+"\n\nEs una impresión social, no una prueba de investigación.",
    [{label:"Continuar",action:()=>{}}],"COMERCIO · REPUTACIÓN LOCAL");
   api?.refresh?.();
  }});
  api?.ask?.("Cliente de "+shop.name,body+(reaction?"\n\n"+reaction:"")+"\n\n"+shopReport(g,shop),
   choices,"COMERCIO · VIDA COTIDIANA");
  return true;
 }
 function bulletin(g){
  const rows=recent(g,null,7);
  const district=g.district||g.venue||(window.VTM_SHOPS?.byId[g.sidevenue]?.district)||"passy";
  return "Noche "+g.clock.night+" · "+hhmm(g.clock.minutes)+"\n"+
   "Barrio de referencia: "+(byId[district]?.id||"París")+
   "\n\nAcontecimientos ocurridos:\n"+(rows.map(x=>"- "+hhmm(x.minute)+" · "+byId[x.district].id+": "+x.title).join("\n")||"Sin informes registrados.")+
   "\n\nNo todas las noticias representan amenazas sobrenaturales.";
 }
 function interactEvent(g,e){
  const state=init(g);
  if(!e||!active(g).some(x=>x.id===e.id))return false;
  api?.ask?.(e.title,e.detail+"\n\nOcurre de forma autónoma, con independencia de dónde estuvieras cuando comenzó.",
   [{label:state.seen[e.id]?"Ya observado · continuar":"Registrar la observación",action:()=>{
     if(!state.seen[e.id]){state.seen[e.id]=true;api?.log?.("Registraste un acontecimiento en "+byId[e.district].id+": "+e.title+".");}
     api?.refresh?.();api?.save?.();
   }},{label:"Alejarte",action:()=>{}}],"PARÍS · ACONTECIMIENTO NOCTURNO");
  return true;
 }
 // Los rumores públicos de los siete incidentes reactivos ya circulan por
 // barrios y horarios; conversar no equivale a verificar sus afirmaciones.
 function streetRumor(g,w){
  if(!byId[g?.district]||typeof w?.id!=="string"||!w.id.startsWith(g.district+":walker:"))return null;
  const rows=g.reactiveDistricts?.rumors;
  if(!Array.isArray(rows))return null; // Partidas antiguas sin incidentes.
  const night=Math.max(1,Math.floor(Number(g.clock?.night)||1)),now=current(g);
  const published=rows.filter(r=>r&&r.district===g.district&&
   typeof r.text==="string"&&r.text.trim()&&
   Number.isInteger(r.night)&&r.night>=night-1&&r.night<=night&&
   Number.isFinite(r.minute)&&(r.night<night||r.minute<=now));
  published.sort((a,b)=>b.night-a.night||b.minute-a.minute||String(a.id).localeCompare(String(b.id)));
  if(!published.length)return null;
  const idx=Number(w.id.slice((g.district+":walker:").length));
  return published[Number.isInteger(idx)&&idx>=0?idx%Math.min(3,published.length):0];
 }
 // Los peatones pueden orientar hacia un comercio que ya participa en
 // el incidente. Escuchar el rumor no constituye una prueba ni activa misiones.
 function rumorLead(rumor){
  const def=window.VTM_REACTIVE_DISTRICTS?.byId?.[rumor?.origin];
  if(!def||!Array.isArray(def.shops))return null;
  const shop=def.shops.map(id=>window.VTM_SHOPS?.byId?.[id])
   .find(s=>s&&s.district===rumor.origin);
  return shop?{name:shop.name,district:def.name}:null;
 }
 // Reacciones civiles basadas en las decisiones persistidas y la vigilancia.
 // No convierten rumores en pruebas ni revelan sucesos ocultos.
 function neighborhoodReaction(g){
  const district=g?.district;
  if(g?.scene!=="district"||!byId[district])return "";
  const c=g.reactiveDistricts?.cases?.[district],night=Math.max(1,Math.floor(Number(g.clock?.night)||1));
  const flags=c?.flags&&typeof c.flags==="object"?c.flags:{};
  let note="";
  if(c&&Number.isInteger(c.night)&&c.night<=night&&c.stage!=="pending"){
   if(flags.intimidated)note="Varios vecinos evitan hablar de lo ocurrido: recuerdan que un testigo fue presionado y desconfían de nuevas preguntas.";
   else if(flags.hidden||flags.concealed)note="Las versiones del incidente siguen sin encajar. Los vecinos hablan con cautela y evitan señalar culpables.";
   else if((flags.reported&&(flags.evidence||flags.testimony||flags.shop))||c.outcome==="verified")
    note="Algunos vecinos saben que se entregaron indicios a los responsables del barrio y parecen más dispuestos a conversar.";
   else if(flags.helped||c.outcome==="aided")
    note="Un vecino recuerda que ayudaste durante el incidente. La conversación empieza con más confianza.";
   else if(c.outcome==="lost"||c.outcome==="unresolved")
    note="El incidente quedó sin una explicación convincente. Se percibe inquietud entre los residentes.";
  }
  const heat=Number(g.cityConsequences?.heat?.[district]);
  if(Number.isFinite(heat)&&heat>=40)
   note+=(note?" ":"")+"La atención policial en las calles hace que muchos midan sus palabras.";
  return note;
 }
 // La reputación ya existente en los 16 comercios llega a la conversación
 // con transeúntes. No se generan nuevos puntos ni cambios de relación.
 function streetCommerceReputation(g){
  const district=g?.district,contacts=window.VTM_CONTACTS;
  if(g?.scene!=="district"||!byId[district]||!contacts?.mood)return "";
  const shops=window.VTM_SHOPS?.byDistrict?.[district]||[];
  const weights={agradecido:2,cordial:1,neutral:0,receloso:-1,hostil:-2};
  const known=shops.map(shop=>contacts.mood(g,shop))
   .filter(mood=>Object.prototype.hasOwnProperty.call(weights,mood));
  if(!known.length)return "";
  const balance=known.reduce((n,mood)=>n+weights[mood],0);
  if(balance>0)return "En los comercios del barrio hablan bien de cómo trataste a sus responsables.";
  if(balance<0)return "Algunos comerciantes desconfían de vos y sus clientes prefieren medir las palabras.";
  return known.some(mood=>mood!=="neutral")?
   "Los comerciantes del barrio tienen opiniones divididas sobre tu comportamiento.":"";
 }
 // Señales de vigilancia civil: alerta ambiental, no identificación de cazadores.
 // La probabilidad es estable por barrio/noche y depende de la exposición ya guardada.
 // Nunca convierte una sospecha en prueba ni activa persecuciones o combates.
 function hunterWarning(g){
  const district=g?.district;
  if(g?.scene!=="district"||!byId[district])return "";
  const exposure=Math.max(0,Number(g.exposure)||0);
  const heat=Math.max(0,Number(g.cityConsequences?.heat?.[district])||0);
  const known=!!g.elizabeth?.hunters;
  if(!known&&exposure<35&&heat<40)return "";
  const chance=exposure>=70||heat>=70?1:
   exposure>=50||heat>=55?.8:known?.55:.4;
  const night=Math.max(1,Math.floor(Number(g.clock?.night)||1));
  if(hash(night,defs.findIndex(d=>d.id===district),97)>chance)return "";
  const note=exposure>=60||heat>=60?
   "Unos desconocidos sin insignias parecen observar tus desplazamientos desde un vehículo estacionado. No sabés a quién responden.":
   "Una vecina vio a dos desconocidos fotografiar entradas y anotar horarios. No pudo identificar a quién buscaban.";
  return note+(known?
   " El comportamiento recuerda una vigilancia humana que ya investigaste, pero no demuestra que sean las mismas personas.":"");
 }
 // Una sola decisión de vigilancia por noche: opcional y persistente.
 function surveillanceEpisode(g){
  const n=Math.max(1,Math.floor(Number(g?.clock?.night)||1));
  return init(g)?.surveillanceEpisodes.find(e=>e.night===n)||null;
 }
 function surveillanceAftermath(g){
  if(g?.scene!=="district"||!byId[g.district])return "";
  const n=Math.max(1,Math.floor(Number(g.clock?.night)||1));
  const e=init(g)?.surveillanceEpisodes.filter(x=>x.district===g.district&&
   n>=x.night+1&&n<=x.night+2).slice(-1)[0];
  if(!e)return "";
  if(e.outcome==="avoided")return "Desde que elegiste otra ruta, la calle parece más tranquila. No conocés a quienes la vigilaban.";
  if(e.outcome==="noticed")return "La noche siguiente hay miradas más cautelosas. Tal vez tu investigación llamó la atención.";
  return "Al volver a este barrio reconocés fotografías y anotaciones similares, pero ignorás quién las hizo.";
 }
 function resolveSurveillance(g,choice){
  if(!g||g.scene!=="district"||!byId[g.district]||!["observe","avoid"].includes(choice)||
    g.combat?.active||!hunterWarning(g)||surveillanceEpisode(g))return null;
  const state=init(g),night=Math.max(1,Math.floor(Number(g.clock?.night)||1));
  let outcome,summary;
  if(choice==="avoid"){
   outcome="avoided";
   summary="Cambiaste de recorrido para no ofrecer más información a los desconocidos.";
  }else{
   const roll=api?.roll?.("Percepción","Investigación",7);
   outcome=roll?.success?"unconfirmed":"noticed";
   summary=roll?.success?
    "Desde una distancia segura viste fotografías y horarios anotados. No identificaste a nadie ni sus intenciones.":
    "Intentaste observar, pero alguien pareció reparar en vos. Te alejaste antes de una confrontación.";
  }
  const record={night,district:g.district,choice,outcome,summary};
  state.surveillanceEpisodes.push(record);
  state.surveillanceEpisodes=state.surveillanceEpisodes.slice(-16);
  if(outcome==="noticed")api?.exposure?.(5,"Una investigación de vigilancia desconocida llamó la atención.");
  api?.log?.("Vigilancia sin verificar en "+g.district+": "+summary);
  api?.save?.();api?.refresh?.();
  return record;
 }
 function interactWalker(g,w){
  const state=init(g),key=g.clock.night+":"+w.id,remembered=!!state.talked[key];
  const rumor=streetRumor(g,w),lead=rumorLead(rumor),reaction=neighborhoodReaction(g),
   commerce=streetCommerceReputation(g),warning=hunterWarning(g),aftermath=surveillanceAftermath(g);
  const text=remembered?
   "La persona reconoce que ya conversaron esta noche. Mira la calle y continúa con sus asuntos.":
   "La persona interrumpe brevemente su recorrido. No conoce los secretos de los Vástagos ni tiene información excepcional.";
  const streetNews=rumor?
   "Se comenta en este barrio, sin pruebas verificadas: "+rumor.text+"\nEl comentario no constituye evidencia de una investigación.":
   (active(g).length?"En el barrio se comenta: "+active(g)[0].title+".":"La noche continúa con actividad cotidiana.");
  const choices=[{label:remembered?"Despedirte":"Preguntar por lo sucedido en el barrio",action:()=>{
   if(!remembered){
    state.talked[key]=true;
    api?.log?.("Conversaste con "+w.name+" en "+g.district+"."+(rumor?" Rumor sin verificar: "+rumor.text:""));
   }
   api?.refresh?.();api?.save?.();
  }}];
  if(reaction)choices.push({label:"Preguntar cómo cambió el barrio",action:()=>{
   const id=g.clock.night+":reaction:"+w.id;
   if(!state.checked[id]){
    state.checked[id]=true;
    api?.log?.("Impresiones de "+g.district+" (sin verificar): "+reaction);
    api?.save?.();
   }
   api?.ask?.(w.name,reaction+"\n\nSon impresiones vecinales; no constituyen pruebas de ninguna investigación.",
    [{label:"Seguir explorando",action:()=>{}}],"PARÍS · MEMORIA DEL BARRIO");
   api?.refresh?.();
  }});
  if(commerce)choices.push({label:"Preguntar qué opinan los comerciantes",action:()=>{
   const id=g.clock.night+":commerce:"+w.id;
   if(!state.checked[id]){
    state.checked[id]=true;
    api?.log?.("Impresión comercial sin verificar en "+g.district+": "+commerce);
    api?.save?.();
   }
   api?.ask?.(w.name,commerce+"\n\nSon opiniones sociales, no pruebas de ningún expediente.",
    [{label:"Seguir explorando",action:()=>{}}],"PARÍS · REPUTACIÓN COMERCIAL");
   api?.refresh?.();
  }});
  if(warning)choices.push({label:"Preguntar por la vigilancia extraña",action:()=>{
   const id=g.clock.night+":watch:"+w.id;
   if(!state.checked[id]){
    state.checked[id]=true;
    api?.log?.("Vigilancia civil sin verificar en "+g.district+": "+warning);
    api?.save?.();
   }
   api?.ask?.(w.name,warning+"\n\nNo es una prueba ni confirma la identidad o las intenciones de esas personas.",
    [{label:"Seguir explorando",action:()=>{}}],"PARÍS · VIGILANCIA DESCONOCIDA");
   api?.refresh?.();
  }});
  if(warning&&!surveillanceEpisode(g)){
   choices.push({label:"Observar discretamente · Percepción + Investigación (dif. 7)",action:()=>{
    const result=resolveSurveillance(g,"observe");
    if(result)api?.ask?.("Vigilancia desconocida",result.summary+"\\n\\nNo constituye prueba ni identifica a los desconocidos.",
     [{label:"Seguir explorando",action:()=>{}}],"PARÍS · OBSERVACIÓN NO VERIFICADA");
   }});
   choices.push({label:"Cambiar de ruta y evitar la vigilancia",action:()=>{
    const result=resolveSurveillance(g,"avoid");
    if(result)api?.ask?.("Retirada prudente",result.summary+"\\n\\nPodrás observar las consecuencias en las noches siguientes.",
     [{label:"Seguir explorando",action:()=>{}}],"PARÍS · VIGILANCIA EVITADA");
   }});
  }
  if(lead)choices.push({label:"Preguntar dónde contrastar el rumor",action:()=>{
   const note="Podés consultar en "+lead.name+", en "+lead.district+
    ". Allí conocen versiones del incidente, pero sólo una investigación puede aportar pruebas.";
   const id=g.clock.night+":lead:"+rumor.id;
   if(!state.checked[id]){
    state.checked[id]=true;
    api?.log?.("Orientación vecinal sin verificar: "+lead.name+" ("+lead.district+").");
    api?.save?.();
   }
   api?.ask?.("Una dirección para investigar",note,
    [{label:"Seguir explorando",action:()=>{}}],"PARÍS · RUMOR SIN VERIFICAR");
   api?.refresh?.();
  }});
  api?.ask?.(w.name,text+"\n\n"+streetNews+(reaction?"\n\n"+reaction:"")+(commerce?"\n\n"+commerce:"")+(warning?"\n\n"+warning:"")+(aftermath?"\n\n"+aftermath:""),choices,"PARÍS · TRANSEÚNTE");
  return true;
 }
 function interact(g,time=0){
  const event=nearEvent(g,27);
  if(event)return interactEvent(g,event);
  const npc=nearWalker(g,time,21);
  if(npc)return interactWalker(g,npc);
  return false;
 }
 function summary(g){
  const s=init(g);if(!s)return{events:0,active:0,shopsOpen:0,totalShops:0};
  const shopList=window.VTM_SHOPS?.definitions||[];
  return{events:s.feed.filter(e=>e.night===g.clock.night).length,
   active:active(g).length,shopsOpen:shopList.filter(x=>shopState(g,x)?.open).length,
   totalShops:shopList.length,local:g.scene==="district"?g.district:null};
 }
 return Object.freeze({defs,byId,bind,init,phase,current,hhmm,plan,tick,recent,active,shopState,shopReport,shopperReaction,
  pedestrian,walkers,nearWalker,nearEvent,nearShopVisitor,districtDraw,shopDraw,bulletin,streetRumor,rumorLead,neighborhoodReaction,streetCommerceReputation,hunterWarning,surveillanceEpisode,surveillanceAftermath,resolveSurveillance,interact,interactShop,interactEvent,interactWalker,summary,version:"15.7"});
})();