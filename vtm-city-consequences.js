"use strict";
/* CRÓNICAS DE PARÍS · FASE XVIII — LA CIUDAD RECUERDA
 * Escala reactiva persistente: testigos, atención policial, reputación,
 * Mascarada e información. Adaptación del videojuego, no tabla reglística oficial.
 * Rumores y sospechas NO equivalen a una condena de la Camarilla.
 */
window.VTM_CITY_CONSEQUENCES=(()=>{
 const DISTRICTS=["passy","stjuly","elysee","hemeroteca","bastilla","saintdenis","policia","tuneles"];
 const valid=new Set(DISTRICTS);
 const cap=(v,a,b)=>Math.max(a,Math.min(b,v));
 const sanitizeText=s=>String(s||"").slice(0,220);
 const WALK={x:320,y:225},WITNESS={x:177,y:225};
 const DISCIPLINES=new Set(["Dominación","Dementación","Taumaturgia","Potencia","Celeridad","Protean"]);
 let bridge=null;
 function bind(api){bridge=api;}
 function district(g){
  const s=g?.scene,id=s==="district"?g.district:s==="venue"?g.venue:
    s==="sidevenue"?window.VTM_SHOPS?.byId?.[g.sidevenue]?.district:
    s?.startsWith("case-")?window.VTM_CASE_INTERIORS?.byId?.(s)?.district:null;
  return valid.has(id)?id:null;
 }
 function state(g){
  if(!g||typeof g!=="object")return null;
  let s=g.cityConsequences;
  if(!s||typeof s!=="object"||Array.isArray(s))s=g.cityConsequences={};
  s.heat=s.heat&&typeof s.heat==="object"&&!Array.isArray(s.heat)?s.heat:{};
  for(const id of DISTRICTS)s.heat[id]=cap(Number(s.heat[id])||0,0,100);
  s.reports=Array.isArray(s.reports)?s.reports.filter(v=>v&&valid.has(v.district)&&typeof v.id==="string").slice(-96):[];
  s.known=s.known&&typeof s.known==="object"&&!Array.isArray(s.known)?s.known:{};
  s.attempts=s.attempts&&typeof s.attempts==="object"&&!Array.isArray(s.attempts)?s.attempts:{};
  s.seen=s.seen&&typeof s.seen==="object"&&!Array.isArray(s.seen)?s.seen:{};
  s.witnesses=s.witnesses&&typeof s.witnesses==="object"&&!Array.isArray(s.witnesses)?s.witnesses:{};
  s.history=Array.isArray(s.history)?s.history.slice(-60):[];
  s.lastNight=Math.max(1,Math.floor(Number(s.lastNight)||g.clock?.night||1));
  s.lastCaseSync=Number(s.lastCaseSync)||0;
  return s;
 }
 function init(g){return state(g);}
 function push(s,id,night,text){
  if(s.history.some(v=>v.id===id))return false;
  s.history.push({id,night,text:sanitizeText(text)});
  s.history=s.history.slice(-60);return true;
 }
 function witness(s,d,night,source){
  const key=d+":"+night;
  if(!s.witnesses[key])s.witnesses[key]={district:d,firstNight:night,trust:0,speaks:false,seenSources:[]};
  const w=s.witnesses[key];
  if(!w.seenSources.includes(source))w.seenSources.push(source);
  return w;
 }
 function report(g,{kind="ordinary",reason="",heat=5,source="",observed=false,district:input=null}={}){
  const s=state(g),d=input||district(g);if(!s||!valid.has(d))return null;
  const night=g.clock.night;
  const key=night+":"+d+":"+String(source||kind).slice(0,70);
  if(s.known[key])return null; // Idempotente frente a hud(), recargas y callbacks repetidos.
  s.known[key]=true;
  const delta=cap(Math.round(heat),0,22);
  s.heat[d]=cap(s.heat[d]+delta,0,100);
  const id="report:"+key;
  const r={id,night,district:d,kind,reason:sanitizeText(reason),observed:!!observed,
    due:night+1,processed:false};
  s.reports.push(r);s.reports=s.reports.slice(-96);
  if(observed)witness(s,d,night,key);
  push(s,key,night,"En "+d+" se registró "+(kind==="supernatural"?"un indicio inusual":"una denuncia potencial")+
    (observed?" con testigo.":"."));
  return r;
 }
 function exposure(g,delta,reason){
  if(delta<=0)return null;
  const d=district(g);if(!d)return null;
  const source="exposure:"+sanitizeText(reason).toLowerCase().replace(/\s+/g,"-").slice(0,48);
  return report(g,{kind:"ordinary",reason,heat:cap(Math.ceil(delta*.9),2,13),
    source,observed:delta>=7,district:d});
 }
 function power(g,name,result){
  if(!g?.embraced||!DISCIPLINES.has(name)||!result||!district(g))return null;
  // Un poder discreto no equivale, por sí solo, a una violación de la Mascarada.
  const visible= ["Dominación","Dementación","Taumaturgia","Potencia","Celeridad","Protean"].includes(name);
  if(!visible)return null;
  return report(g,{kind:"supernatural",heat:name==="Taumaturgia"||name==="Potencia"?14:10,
    source:"power:"+name+":"+(result.place||district(g)),observed:true,
    reason:"Uso potencialmente visible de "+name+"; requiere confirmación."});
 }
 function syncCases(g){
  const s=state(g);if(!s)return[];
  const added=[];
  const flags=[];
  const r=g.reactiveCity?.case;
  if(r?.flags&&r?.night)flags.push({d:"bastilla",night:r.night,flags:r.flags,label:"Robo de Bastilla"});
  const collection=g.reactiveDistricts?.cases||{};
  for(const [d,c]of Object.entries(collection))
   if(valid.has(d)&&c?.flags)flags.push({d,night:c.night||g.clock.night,flags:c.flags,label:"Incidente de "+d});
  for(const c of flags){
   for(const [key,kind,heat] of [["intimidated","intimidation",9],["hidden","concealment",7],["concealed","concealment",7]]){
    if(!c.flags[key])continue;
    const id="incident:"+c.d+":"+c.night+":"+key;
    // La consecuencia de un hecho anterior se registra una sola vez,
    // aunque el caso conserve sus flags durante muchas noches.
    if(s.known["global:"+id])continue;
    const found=report(g,{kind,reason:c.label+": testigos o indicios alterados",
      source:id,heat,district:c.d,observed:true});
    if(found){s.known["global:"+id]=true;added.push(found);}
   }
   if(c.flags.reported){
    const id="resolved:"+c.d+":"+c.night;
    if(!s.known[id]){
     s.known[id]=true;s.heat[c.d]=cap(s.heat[c.d]-7,0,100);
     push(s,id,g.clock.night,"La colaboración documental redujo la sospecha policial en "+c.d+".");
    }
   }
  }
  return added;
 }
 function tick(g){
  const s=state(g);if(!s)return[];
  const night=g.clock.night,notes=[];
  syncCases(g);
  if(night>s.lastNight){
   const elapsed=Math.min(30,night-s.lastNight);
   for(const id of DISTRICTS)s.heat[id]=cap(s.heat[id]-elapsed*4,0,100);
   s.lastNight=night;
  }
  for(const r of s.reports){
   if(r.processed||r.due>night)continue;
   r.processed=true;
   if(r.observed){
    s.heat[r.district]=cap(s.heat[r.district]+(r.kind==="supernatural"?8:3),0,100);
    const id="notice:"+r.id;
    const msg="Un testigo de "+r.district+" compartió información "+(r.kind==="supernatural"?"inusual":"sobre una conducta sospechosa")+".";
    if(push(s,id,night,msg))notes.push(msg);
   }
  }
  if(g.embraced){
   // Sólo testimonios sobrenaturales independientes y corroborados abren un
   // expediente preliminar; no se dicta una condena por la barra de sospecha.
   const corroborated=s.reports.filter(r=>r.processed&&r.observed&&r.kind==="supernatural");
   const origins=[...new Set(corroborated.map(r=>r.id))];
   if(origins.length>=2&&!s.known["court:evidence"]){
    const COURT=window.VTM_COURT;
    if(COURT?.addCase){
     COURT.addCase(g,"mascarada","city-consequences:corroborated",1,
      "Se recibieron dos referencias sobre posibles manifestaciones sobrenaturales en lugares públicos. Es necesaria una audiencia y verificación.");
     s.known["court:evidence"]=true;
     const msg="La corte inició una comprobación preliminar sobre dos testimonios relacionados con la Mascarada.";
     if(push(s,"court",night,msg))notes.push(msg);
    }
   }
  }
  return notes;
 }
 function heat(g,d){return state(g)?.heat[valid.has(d)?d:district(g)]||0;}
 function visible(g){
  const d=district(g);
  if(g?.scene!=="district"||!d)return[];
  const s=state(g),out=[],level=heat(g,d);
  if(level>=20)out.push({id:"patrol",x:WALK.x,y:WALK.y,title:level>=55?"Patrulla investigadora":"Patrulla nocturna"});
  if(Object.values(s.witnesses).some(w=>w.district===d&&w.firstNight>=g.clock.night-2))
   out.push({id:"witness",x:WITNESS.x,y:WITNESS.y,title:"Testigo del barrio"});
  return out;
 }
 function near(g,range=30){
  const sorted=visible(g).map(v=>({...v,d:Math.hypot(g.x-v.x,g.y-v.y)}))
   .filter(v=>v.d<range).sort((a,b)=>a.d-b.d);
  return sorted[0]||null;
 }
 function attempt(g,kind,attr,skill,difficulty){
  const s=state(g),d=district(g),key=g.clock.night+":"+d+":"+kind;
  if(!d||s.attempts[key])return null;
  s.attempts[key]=true;
  const roll=bridge?.roll?.(attr,skill,difficulty)||{success:false,dice:[]};
  let message;
  if(kind==="clarify"){
   if(roll.success){s.heat[d]=cap(s.heat[d]-15,0,100);message="La patrulla contrasta tus explicaciones y reduce la vigilancia, sin cerrar otros expedientes.";}
   else{s.heat[d]=cap(s.heat[d]+7,0,100);message="Tus respuestas son contradictorias; la patrulla toma nota de tu presencia.";}
  }else if(kind==="rumor"){
   if(roll.success){s.heat[d]=cap(s.heat[d]-9,0,100);message="La versión de los hechos queda corregida entre los vecinos. No desaparecen testimonios oficiales.";}
   else{s.heat[d]=cap(s.heat[d]+4,0,100);message="Los vecinos desconfían de la explicación y aumenta la atención.";}
  }else if(kind==="contact"){
   if(roll.success){s.heat[d]=cap(s.heat[d]-11,0,100);message="Un contacto ayuda a ordenar información verificable sin borrar las pruebas.";}
   else{message="El contacto no consigue información suficiente para intervenir esta noche.";}
  }else if(kind==="witness"){
   const list=Object.values(s.witnesses).filter(w=>w.district===d);
   if(roll.success){for(const w of list){w.trust=cap(w.trust+1,-3,3);w.speaks=true;}message="El testigo relata los hechos sin añadir acusaciones no comprobadas.";}
   else{for(const w of list)w.trust=cap(w.trust-1,-3,3);message="El testigo evita dar detalles y pide que no lo presiones.";}
  }
  push(s,"attempt:"+key,g.clock.night,message);
  bridge?.log?.(message);bridge?.advance?.(10);bridge?.refresh?.();bridge?.save?.();
  bridge?.ask?.("Ecos de la noche",message+"\n\nDados: "+roll.dice.join(", ")+".",
    [{label:"Continuar",action:()=>{}}],"PARÍS REACTIVO · CONSECUENCIAS");
  return {success:!!roll.success,kind,message};
 }
 function reactTo(g,p){
  const d=district(g),s=state(g),base=g.clock.night+":"+d+":";
  const opts=[];
  if(p.id==="patrol"){
   if(!s.attempts[base+"clarify"])opts.push({label:"Explicar tu presencia · Carisma + Etiqueta (dif. 7)",action:()=>attempt(g,"clarify","Carisma","Etiqueta",7)});
   opts.push({label:"Retirarte sin enfrentarte a la patrulla",action:()=>{}});
   bridge?.ask?.(p.title,"El agente conoce algunas denuncias locales, pero no su significado sobrenatural. Estar bajo observación no constituye una condena.",
     opts,"POLICÍA · "+d.toUpperCase());return;
  }
  if(p.id==="witness"){
   if(!s.attempts[base+"witness"])opts.push({label:"Escuchar al testigo · Carisma + Empatía (dif. 6)",action:()=>attempt(g,"witness","Carisma","Empatía",6)});
   opts.push({label:"Dejarlo continuar su camino",action:()=>{}});
   bridge?.ask?.("Testigo de "+d,"Una persona recuerda algo ocurrido en el barrio. Puede corroborar circunstancias sin conocer la existencia de Vástagos.",opts,"MEMORIA DE PARÍS");
  }
 }
 function interact(g){const p=near(g);if(!p)return false;reactTo(g,p);return true;}
 function options(g){
  const d=district(g),s=state(g);
  if(!d)return[];
  const key=g.clock.night+":"+d+":",out=[];
  if(heat(g,d)>0&&!s.attempts[key+"rumor"])
   out.push({label:"Aclarar los rumores del barrio · Manipulación + Subterfugio (dif. 7)",
     action:()=>attempt(g,"rumor","Manipulación","Subterfugio",7)});
  const trust=Object.values(g.contactMemory||{}).some(c=>(Number(c.trust)||0)>=1);
  const ally=(Number(g.factions?.nosferatu)||0)>=10||(Number(g.factions?.brujah)||0)>=10;
  if(heat(g,d)>=12&&(trust||ally)&&!s.attempts[key+"contact"])
   out.push({label:"Consultar un contacto discreto · Inteligencia + Investigación (dif. 7)",
     action:()=>attempt(g,"contact","Inteligencia","Investigación",7)});
  return out;
 }
 function summary(g){
  const s=state(g),d=district(g),total=DISTRICTS.reduce((n,id)=>n+s.heat[id],0);
  const worst=[...DISTRICTS].sort((a,b)=>s.heat[b]-s.heat[a])[0];
  return {district:d,local:d?s.heat[d]:0,total,worst,high:s.heat[worst],
   pending:s.reports.filter(r=>!r.processed).length,
   witnesses:Object.keys(s.witnesses).length,
   knownCases:s.history.filter(x=>x.id==="court").length,
   logs:s.history.slice(-10).map(x=>x.text)};
 }
 function bulletin(g){
  const s=state(g);
  return "LA CIUDAD RECUERDA\n\n"+DISTRICTS.map(d=>d+": vigilancia "+s.heat[d]+"/100").join("\n")+
   "\n\nTestimonios: "+Object.keys(s.witnesses).length+
   " · avisos pendientes: "+s.reports.filter(r=>!r.processed).length+
   "\n\nÚltimas novedades:\n"+(s.history.slice(-8).reverse().map(x=>"• "+x.text).join("\n")||"Sin incidentes registrados.")+
   "\n\nLos rumores no equivalen a una infracción probada de la Mascarada.";
 }
 function menu(){
  const g=bridge?.getGame?.();if(!g)return;
  bridge.ask("Mascarada y vigilancia policial",bulletin(g),
   [...options(g),{label:"Cerrar",action:()=>{}}],"FASE XVIII · LA CIUDAD RECUERDA");
 }
 function draw(c,g,time=0){
  for(const p of visible(g)){
   const x=p.x,y=p.y,police=p.id==="patrol";
   c.fillStyle="#11121c99";c.fillRect(x-8,y+9,16,4);
   c.fillStyle=police?"#3c5b77":"#6b5a69";c.fillRect(x-6,y-7,12,17);
   c.fillStyle="#c3a18e";c.fillRect(x-4,y-14,8,7);
   c.fillStyle=police?"#a1c1d7":"#cbb697";c.fillRect(x-7,y-28+Math.sin(time*2),14,5);
  }
 }
 return Object.freeze({DISTRICTS,bind,init,state,district,report,exposure,power,syncCases,tick,heat,visible,near,interact,options,summary,bulletin,menu,draw,version:"18.0"});
})();