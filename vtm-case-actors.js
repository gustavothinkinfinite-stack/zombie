"use strict";
/* Fase XIV — Vida autónoma en tres interiores de investigación.
 * Conductas deterministas: inspeccionar, patrullar, vigilar, evitar y retirarse.
 * Sin datos de red, decisiones secretas de Etienne ni recompensas repetibles.
 */
window.VTM_CASE_ACTORS=(()=>{
 const definitions=Object.freeze({
  "case-apartment":[
   {id:"madeleine",name:"Madeleine Roche",role:"Vecina",color:"#88718b",skin:"#d3ae9a",hair:"#807981",speed:13,
    x:405,y:250,waypoints:[[401,249],[373,248],[384,229]],kind:"neighbor"},
   {id:"claire",name:"Claire Renaud",role:"Inspectora",color:"#586879",skin:"#b38b77",hair:"#302c32",speed:17,
    x:194,y:171,waypoints:[[194,171],[279,147],[281,233],[197,239]],kind:"investigator"}
  ],
  "case-garage":[
   {id:"vasseur",name:"Adrien Vasseur",role:"Intermediario",color:"#515b67",skin:"#bda28f",hair:"#20202a",speed:22,
    x:425,y:180,waypoints:[[426,181],[411,253],[281,246],[274,167]],kind:"fugitive"}
  ],
  "case-hideout":[
   {id:"bapthiste",name:"Bapthiste",role:"Brujah",color:"#69404d",skin:"#885b49",hair:"#15151b",speed:18,
    x:243,y:151,waypoints:[[243,151],[306,173],[166,170],[230,141]],kind:"boss"},
   {id:"watchman",name:"Vigilante",role:"Custodio mortal",color:"#58565f",skin:"#b9a08d",hair:"#26232a",speed:19,
    x:388,y:185,waypoints:[[388,185],[320,182],[324,248],[390,181]],kind:"guard"}
  ]
 });
 const byId=Object.fromEntries(Object.values(definitions).flat().map(v=>[v.id,v]));
 const runtime=new WeakMap();
 let api=null;
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function bind(bridge){api=bridge;}
 function init(g,physics){
  if(!g||typeof g!=="object")return {};
  if(!g.caseActors||typeof g.caseActors!=="object"||Array.isArray(g.caseActors))g.caseActors={};
  for(const [room,defs] of Object.entries(definitions)){
   for(const def of defs){
    const a=g.caseActors[def.id];
    if(!a||typeof a!=="object"||Array.isArray(a))continue;
    a.x=Number.isFinite(a.x)?clamp(a.x,25,454):def.x;
    a.y=Number.isFinite(a.y)?clamp(a.y,53,279):def.y;
    a.index=clamp(Math.floor(Number(a.index)||0),0,def.waypoints.length-1);
    a.interviewed=!!a.interviewed;
    a.protected=!!a.protected;
    a.fledNight=clamp(Math.floor(Number(a.fledNight)||0),0,1000000);
    a.attemptNight=clamp(Math.floor(Number(a.attemptNight)||0),0,1000000);
    a.alertNight=clamp(Math.floor(Number(a.alertNight)||0),0,1000000);
    a.mode=["patrol","inspect","watch","wary","retreat"].includes(a.mode)?a.mode:"patrol";
    if(physics&&!physics.canStand(room,a.x,a.y)){
     const safe=physics.nearestFree(room,a.x,a.y);a.x=safe.x;a.y=safe.y;
    }
   }
  }
  return g.caseActors;
 }
 function ensure(g,scene,physics){
  if(!definitions[scene])return [];
  init(g,physics);
  for(const def of definitions[scene]){
   if(g.caseActors[def.id])continue;
   const pos=physics?physics.nearestFree(scene,def.x,def.y):{x:def.x,y:def.y};
   g.caseActors[def.id]={x:pos.x,y:pos.y,index:0,mode:"patrol",interviewed:false,protected:false,
    fledNight:0,attemptNight:0,alertNight:0};
  }
  return list(g);
 }
 function available(g,def){
  if(g.scene!=="case-apartment"&&g.scene!=="case-garage"&&g.scene!=="case-hideout")return false;
  if(def.id==="vasseur" && (g.elizabeth?.status==="reported"||g.caseActors?.vasseur?.fledNight===(g.clock?.night||1)))return false;
  if(def.id==="bapthiste" && (g.combat?.records?.bapthiste==="won"||["captured","escaped"].includes(g.elizabeth?.bapthisteOutcome)))return false;
  if(def.id==="watchman" && ["captured","escaped"].includes(g.elizabeth?.bapthisteOutcome))return false;
  return true;
 }
 function list(g){
  return (definitions[g?.scene]||[]).filter(def=>available(g,def))
   .map(def=>({...def,state:g.caseActors?.[def.id]})).filter(v=>v.state);
 }
 function nearby(g,maxDistance=38){
  const actors=list(g),dist=a=>Math.hypot(a.state.x-g.x,a.state.y-g.y);
  return actors.filter(a=>dist(a)<=maxDistance).sort((a,b)=>dist(a)-dist(b))[0]||null;
 }
 function routeData(g){
  let rt=runtime.get(g);
  if(!rt){rt={};runtime.set(g,rt);}
  return rt;
 }
 function step(g,dt,physics){
  if(!g||!definitions[g.scene]||!physics)return [];
  const actors=ensure(g,g.scene,physics),events=[],rt=routeData(g);
  const night=Math.max(1,Number(g.clock?.night)||1),alert=g.elizabeth?.alert||0;
  for(const def of actors){
   const a=def.state,dist=Math.hypot(a.x-g.x,a.y-g.y);
   let nextMode=def.kind==="investigator"?"inspect":"patrol";
   if(def.kind==="boss"&&dist<92)nextMode="watch";
   else if(def.kind==="neighbor"&&dist<53)nextMode="watch";
   else if(def.kind==="investigator"&&dist<55)nextMode="watch";
   else if(def.kind==="guard"&&dist<88)nextMode="wary";
   else if(def.kind==="fugitive"&&dist<95)nextMode=alert>=3?"retreat":"wary";
   a.mode=nextMode;
   if(def.kind==="guard"&&dist<75&&alert>=3&&!a.protected&&a.alertNight!==night){
    a.alertNight=night;events.push({type:"suspicion",id:def.id,text:"El vigilante reconoce una presencia no esperada y da la alarma."});
   }
   if(nextMode==="watch"||nextMode==="wary")continue;
   let target;
   if(nextMode==="retreat"){
    target={x:425,y:180};
   }else{
    const waypoint=def.waypoints[a.index];
    target={x:waypoint[0],y:waypoint[1]};
   }
   target=physics.nearestFree(g.scene,target.x,target.y);
   if(Math.hypot(a.x-target.x,a.y-target.y)<9){
    if(nextMode==="retreat"){
     a.fledNight=night;events.push({type:"fled",id:def.id,text:"Adrien Vasseur abandona el garaje por el acceso de servicio."});continue;
    }
    a.index=(a.index+1)%def.waypoints.length;
    delete rt[def.id];continue;
   }
   let path=rt[def.id];
   const key=g.scene+":"+a.index+":"+nextMode;
   if(!path||path.key!==key||!path.points.length){
    path={key,points:physics.path(g.scene,{x:a.x,y:a.y},target)};rt[def.id]=path;
   }
   if(!path.points.length)continue;
   const wp=path.points[0],delta=Math.hypot(wp.x-a.x,wp.y-a.y);
   if(delta<4){path.points.shift();continue;}
   const speed=def.speed*(nextMode==="retreat"?1.65:1)*Math.min(.06,Math.max(0,dt));
   const factor=Math.min(speed,delta)/delta;
   const p=physics.slide(g.scene,a.x,a.y,(wp.x-a.x)*factor,(wp.y-a.y)*factor);
   if(p.moved){a.x=p.x;a.y=p.y;}
   else {delete rt[def.id];a.index=(a.index+1)%def.waypoints.length;}
  }
  return events;
 }
 function draw(c,g,time,graphics){
  const actors=list(g).sort((a,b)=>a.state.y-b.state.y);
  for(const def of actors){
   const a=def.state;
   const shade=def.kind==="boss"?"#b9737d":def.kind==="fugitive"?"#a3aeb9":"#d0baa0";
   c.fillStyle="#080a14aa";c.fillRect(Math.round(a.x)-11,Math.round(a.y)+16,22,5);
   if(graphics?.character)graphics.character(c,a.x,a.y,{npc:{id:def.id,name:def.name,color:def.color,skin:def.skin,hair:def.hair},clan:def.kind==="boss"?"Brujah":"Toreador",facing:a.mode==="retreat"?"right":"down",walking:a.mode!=="watch"&&a.mode!=="wary",cycle:time,time});
   else{
    c.fillStyle=def.color;c.fillRect(Math.round(a.x)-7,Math.round(a.y),14,19);
    c.fillStyle=def.skin;c.fillRect(Math.round(a.x)-5,Math.round(a.y)-12,10,11);
   }
   c.fillStyle="#17151dcc";c.fillRect(Math.round(a.x)-42,Math.round(a.y)-33,84,12);
   c.textAlign="center";c.font="bold 8px monospace";c.fillStyle=shade;c.fillText(def.name,Math.round(a.x),Math.round(a.y)-24);
   if(a.mode==="wary"||a.mode==="retreat"){c.fillStyle="#dc9873";c.fillRect(Math.round(a.x)-2,Math.round(a.y)-40,5,5);}
  }
 }
 function talk(id){
  const g=api?.getGame?.(),def=byId[id];if(!g||!def)return;
  const a=g.caseActors?.[id];if(!a||!available(g,def))return;
  if(id==="bapthiste"){api?.bapthiste?.();return;}
  const options=[],night=g.clock?.night||1;
  const texts={
   madeleine:"La vecina de Elizabeth se muestra nerviosa. No comprende el mundo vampírico y no quiere involucrarse en una disputa.",
   claire:"Claire Renaud revisa objetos, horarios y testimonios. No confía en los poderosos interesados en cerrar el caso.",
   vasseur:"Adrien Vasseur comprueba sus llaves, observa la salida de servicio y calcula cómo abandonar el lugar.",
   watchman:"Un vigilante mortal patrulla el refugio. Desconoce parte de los asuntos de su empleador, pero sabe que no debe dejar pasar a cualquiera."
  };
  if(!a.interviewed&&a.attemptNight!==night){
   const checks={
    madeleine:{label:"Pedir su testimonio · Carisma + Empatía (dif. 6)",attr:"Carisma",skill:"Empatía",diff:6,
      yes:"Madeleine confirma que Elizabeth había rechazado varias visitas insistentes. No puede identificar al asesino.",
      no:"Madeleine tiene miedo de hablar y pide que regreses otro día."},
    claire:{label:"Contrastar observaciones · Inteligencia + Investigación (dif. 6)",attr:"Inteligencia",skill:"Investigación",diff:6,
      yes:"Claire detecta una anomalía en los horarios y te orienta a revisar el expediente formal en el archivo policial.",
      no:"Claire no entrega el detalle sin más pruebas o una autorización adecuada."},
    vasseur:{label:"Presionarlo con discreción · Manipulación + Subterfugio (dif. 7)",attr:"Manipulación",skill:"Subterfugio",diff:7,
      yes:"Vasseur admite encargarse de vehículos y comunicaciones para Bapthiste. No confiesa el asesinato y busca terminar la conversación.",
      no:"Vasseur evita responder y comienza a vigilar tus movimientos."},
    watchman:{label:"Convencerlo de que no intervenga · Carisma + Callejeo (dif. 7)",attr:"Carisma",skill:"Callejeo",diff:7,
      yes:"El vigilante decide no impedirte el paso. No proporciona una confesión ni abandona automáticamente su puesto.",
      no:"El vigilante no se fía de tu explicación y permanece alerta."}
   };
   const check=checks[id];
   options.push({label:check.label,action:()=>{
    a.attemptNight=night;
    const roll=api.roll(check.attr,check.skill,check.diff);
    if(roll.success){
     a.interviewed=true;if(id==="watchman")a.protected=true;
    }else if(["vasseur","watchman"].includes(id)){
     const s=g.elizabeth;if(s)s.alert=clamp((s.alert||0)+1,0,6);
     api.exposure?.(2,"Una conversación incómoda alertó a los colaboradores de Bapthiste.");
    }
    api.advance?.(12);api.log?.(roll.success?"Testimonio o favor obtenido de "+def.name+".":"Conversación inconclusa con "+def.name+".");
    api.refresh?.();api.save?.();
    api.ask("Conversación con "+def.name,(roll.success?check.yes:check.no)+"\n\nDados: "+roll.dice.join(", ")+".",
     [{label:"Continuar explorando",action:()=>{}}],"VIDA DE PARÍS · TESTIGOS");
   }});
  }
  options.push({label:"Dejarlo continuar con su rutina",action:()=>{}});
  api.ask(def.name,texts[id]+"\n\nConducta actual: "+({patrol:"recorre el lugar",inspect:"examina el entorno",watch:"te observa",wary:"se muestra receloso",retreat:"busca una salida"})[a.mode]+".",
   options,"ENCUENTRO · "+def.role.toUpperCase());
 }
 return Object.freeze({definitions,byId,bind,init,ensure,list,nearby,step,draw,talk,version:"14.0"});
})();