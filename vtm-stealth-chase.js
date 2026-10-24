"use strict";
/* Fase XIX · Sigilo y persecución policial en calles.
 * Agente físico con visión bloqueada por obstáculos; la huida no es un
 * combate ni causa arresto automático. Estado opcional y persistente.
 */
window.VTM_STEALTH_CHASE=(()=>{
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const valid=new Set(["passy","stjuly","elysee","hemeroteca","bastilla","saintdenis","policia","tuneles"]);
 const origin={x:320,y:225};
 const nav=new WeakMap();
 let bridge=null;
 function bind(api){bridge=api;}
 function init(g){
  if(!g||typeof g!=="object")return null;
  let s=g.stealthChase;
  if(!s||typeof s!=="object"||Array.isArray(s))s=g.stealthChase={};
  s.crouched=!!s.crouched;
  if(!s.patrols||typeof s.patrols!=="object"||Array.isArray(s.patrols))s.patrols={};
  s.captures=Math.max(0,Math.floor(Number(s.captures)||0));
  s.escapes=Math.max(0,Math.floor(Number(s.escapes)||0));
  s.history=Array.isArray(s.history)?s.history.filter(x=>typeof x==="string").slice(-16):[];
  for(const [key,p]of Object.entries(s.patrols)){
   if(!valid.has(key)||!p||typeof p!=="object"){delete s.patrols[key];continue;}
   p.x=Number.isFinite(p.x)?clamp(p.x,24,456):origin.x;
   p.y=Number.isFinite(p.y)?clamp(p.y,51,285):origin.y;
   p.alert=clamp(Number(p.alert)||0,0,100);
   p.cooldown=clamp(Number(p.cooldown)||0,0,120);
   p.lost=clamp(Number(p.lost)||0,0,30);
   p.mode=["watch","search","pursuit","cooldown"].includes(p.mode)?p.mode:"watch";
   p.night=Math.max(1,Number(p.night)||g.clock?.night||1);
   p.capturePending=!!p.capturePending;
  }
  return s;
 }
 function hot(g,id){
  return Math.max(0,Number(g.cityConsequences?.heat?.[id])||0);
 }
 function ensure(g,physics){
  if(g?.scene!=="district"||!valid.has(g.district)||hot(g,g.district)<20)return null;
  const s=init(g),id=g.district;
  let p=s.patrols[id];
  if(!p){
   const safe=physics.nearestFree("district",origin.x,origin.y);
   p=s.patrols[id]={x:safe.x,y:safe.y,alert:0,cooldown:0,lost:0,night:g.clock.night,mode:"watch",capturePending:false};
  }
  if(!physics.canStand("district",p.x,p.y)){
   const safe=physics.nearestFree("district",p.x,p.y);p.x=safe.x;p.y=safe.y;
  }
  return p;
 }
 function position(g,physics){
  const p=init(g)?.patrols?.[g?.district];
  return p&&(!physics||physics.canStand("district",p.x,p.y))?{x:p.x,y:p.y}:null;
 }
 function sight(physics,x1,y1,x2,y2){
  const distance=Math.hypot(x2-x1,y2-y1);
  if(distance<18)return true;
  for(let dist=9;dist<distance;dist+=7){
   const f=dist/distance;
   if(!physics.canStand("district",x1+(x2-x1)*f,y1+(y2-y1)*f,3))return false;
  }
  return true;
 }
 function navState(g){let rt=nav.get(g);if(!rt){rt={};nav.set(g,rt);}return rt;}
 function follow(g,p,physics,dt){
  const rt=navState(g),id=g.district;
  let route=rt[id],d=Math.hypot(g.x-p.x,g.y-p.y);
  if(!route||route.delay<=0||Math.hypot(g.x-route.tx,g.y-route.ty)>30||route.points.length===0){
   route={delay:.8,tx:g.x,ty:g.y,points:physics.path("district",{x:p.x,y:p.y},{x:g.x,y:g.y}).slice(0,100)};
   rt[id]=route;
  }else route.delay-=dt;
  if(route.points.length===0)return;
  const point=route.points[0],distance=Math.hypot(point.x-p.x,point.y-p.y);
  if(distance<4){route.points.shift();return;}
  const speed=(p.mode==="pursuit"?64:29)*Math.max(0,dt);
  const fraction=Math.min(speed,distance)/distance;
  const next=physics.slide("district",p.x,p.y,(point.x-p.x)*fraction,(point.y-p.y)*fraction);
  if(next.moved){p.x=next.x;p.y=next.y;}
  else route.delay=0;
  // El objetivo se recalcula al moverse más de 30 píxeles o expirar el plazo.
 }
 function step(g,dt,physics,options={}){
  if(!g||g.scene!=="district"||!physics||g.combat?.active)return[];
  const p=ensure(g,physics);if(!p)return[];
  const s=init(g),time=Math.max(0,Math.min(.07,Number(dt)||0)),events=[];
  if(p.night!==g.clock.night){
   p.night=g.clock.night;p.alert=Math.min(p.alert,15);p.capturePending=false;p.cooldown=0;p.mode="watch";
  }
  if(p.cooldown>0){p.cooldown=Math.max(0,p.cooldown-time);p.mode="cooldown";return events;}
  const distance=Math.hypot(g.x-p.x,g.y-p.y);
  const seen=sight(physics,p.x,p.y,g.x,g.y);
  const crouch=!!s.crouched,sprinting=!!options.sprinting&&!crouch;
  const speed=sprinting ? 1.7 : (crouch ? 0.65 : 1);
  const radius=(!crouch?112:48)+(sprinting?34:0)+(hot(g,g.district)>=60?18:0);
  const observable=seen&&distance<=radius;
  if(observable){
   p.alert=clamp(p.alert+time*(options.moving?34*speed:17),0,100);
   p.lost=0;
  }else{
   p.alert=clamp(p.alert-time*(crouch?37:23),0,100);
   p.lost+=time;
  }
  if(p.alert>=65&&p.mode!=="pursuit"){
   p.mode="pursuit";s.history.push("Noche "+g.clock.night+": una patrulla comenzó a seguirte en "+g.district+".");
   events.push({type:"pursuit",district:g.district,text:"Una patrulla te ha identificado como persona de interés y te sigue."});
  }
  if(p.mode==="pursuit"){
   if(!observable&&p.lost>=5){
    p.mode="cooldown";p.cooldown=24;p.alert=0;s.escapes++;
    s.history.push("Noche "+g.clock.night+": perdiste a la patrulla en "+g.district+".");
    events.push({type:"escaped",text:"Perdiste a tus perseguidores tras las esquinas y la oscuridad."});
   }else{
    follow(g,p,physics,time);
    if(Math.hypot(g.x-p.x,g.y-p.y)<21&&!p.capturePending){
     p.capturePending=true;
     events.push({type:"confrontation",district:g.district,text:"La patrulla te intercepta. Deberás explicar tu presencia o intentar retirarte."});
    }
   }
  }else if(p.mode==="search"||p.alert>28){
   p.mode="search";
   if(distance>42&&seen)follow(g,p,physics,time);
   if(p.alert<9)p.mode="watch";
  }
  s.history=s.history.slice(-16);
  return events;
 }
 function encounter(g){
  const s=init(g),p=s?.patrols?.[g?.district];if(!p?.capturePending)return false;
  const title="Control policial · "+g.district,story=
   "Dos agentes te detienen para verificar tu identidad. Sos sospechoso por tus movimientos, no por una certeza sobrenatural. Podés colaborar o tratar de escapar.";
  const actions=[
   {label:"Dar explicaciones · Carisma + Subterfugio (dif. 7)",action:()=>resolve(g,"talk")},
   {label:"Apartarte y huir · Destreza + Atletismo (dif. 8)",action:()=>resolve(g,"run")},
   {label:"Aceptar la identificación",action:()=>resolve(g,"submit")}
  ];
  bridge?.ask?.(title,story,actions,"FASE XIX · PERSECUCIÓN");
  return true;
 }
 function resolve(g,choice){
  const s=init(g),p=s?.patrols?.[g?.district];if(!p?.capturePending)return;
  const previous=g.district,police=window.VTM_CITY_CONSEQUENCES;
  let message="",success=true;
  if(choice==="submit"){s.captures++;message="La policía anota tus datos y te deja seguir bajo vigilancia. No se prueba ningún delito ni se revela la Mascarada.";police?.report?.(g,{kind:"ordinary",reason:"Identificación tras una persecución",heat:6,source:"identification:"+g.clock.night+":"+previous,observed:true});}
  else{
   const roll=bridge?.roll?.(choice==="talk"?"Carisma":"Destreza",choice==="talk"?"Subterfugio":"Atletismo",choice==="talk"?7:8)||{success:false};
   success=!!roll.success;
   if(success){
    s.escapes++;
    message=choice==="talk"?"La patrulla acepta una explicación verosímil y suspende el seguimiento.":"Aprovechás un paso estrecho para salir de su alcance. El informe policial permanece abierto.";
    if(choice==="run"){g.x=240;g.y=266;}
   }else{
    s.captures++;
    message=choice==="talk"?"Tus explicaciones son contradictorias; la policía toma tus datos.":"No conseguís escapar. La patrulla te identifica y deja constancia del intento.";
    police?.report?.(g,{kind:"ordinary",reason:"Intervención policial con identificación",heat:8,source:"confrontation:"+g.clock.night+":"+previous,observed:true});
   }
  }
  p.capturePending=false;p.alert=0;p.mode="cooldown";p.cooldown=30;
  s.history.push("Noche "+g.clock.night+": "+message);s.history=s.history.slice(-16);
  bridge?.log?.(message);bridge?.save?.();bridge?.refresh?.();
  bridge?.ask?.(success?"La patrulla se retira":"Control documentado",message,
   [{label:"Continuar",action:()=>{}}],"POLICÍA · RESULTADO");
  return {success,message};
 }
 function toggle(g){
  if(!g||g.scene!=="district"||g.combat?.active)return false;
  const s=init(g);s.crouched=!s.crouched;bridge?.refresh?.();bridge?.save?.();
  return s.crouched;
 }
 function speed(g,sprint=false){
  if(!g||g.scene!=="district")return 1;
  const s=init(g);return s.crouched?.57:sprint?1.42:1;
 }
 function interact(g){const p=init(g)?.patrols?.[g?.district];if(p?.capturePending)return encounter(g);return false;}
 function summary(g){
  const s=init(g),p=s?.patrols?.[g?.district];
  return {crouched:s.crouched,mode:p?.mode||"sin patrulla",alert:Math.round(p?.alert||0),
   captures:s.captures,escapes:s.escapes,history:s.history.slice(-8)};
 }
 function draw(c,g,time=0){
  if(g?.scene!=="district"||hot(g,g.district)<20)return;
  const p=init(g)?.patrols?.[g.district];if(!p)return;
  c.fillStyle="#0a1320bb";c.fillRect(p.x-8,p.y+9,16,4);
  c.fillStyle=p.mode==="pursuit"?"#b65a52":"#55718d";c.fillRect(p.x-6,p.y-11,12,19);
  c.fillStyle="#c8a596";c.fillRect(p.x-4,p.y-18,8,8);
  c.fillStyle=p.mode==="pursuit"?"#d58373":"#acc4d4";c.fillRect(p.x-8,p.y-25,16,4);
  if(p.mode==="pursuit"){
   c.fillStyle="#eab9ab";c.fillRect(p.x-5,p.y-33+Math.sin(time*3),10,3);
  }
  if(init(g).crouched){
   c.fillStyle="#9cbab0";c.font="bold 9px monospace";c.textAlign="center";c.fillText("SIGILO",g.x,g.y-32);
  }
 }
 return Object.freeze({bind,init,ensure,position,sight,step,encounter,resolve,toggle,speed,interact,summary,draw,version:"19.0"});
})();