"use strict";
/* XXVII-B: un observador civil sin identidad confirmada.
 * No usa ni modifica la persecución policial; sin ataques automáticos.
 */
window.VTM_HUNTERS=(()=>{
 const districts=new Set(["passy","stjuly","elysee","hemeroteca","bastilla","saintdenis","policia","tuneles"]);
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),routes=new WeakMap();
 function source(g){
  const n=Math.floor(Number(g?.clock?.night)||0);
  if(g?.scene!=="district"||!districts.has(g.district)||n<2)return null;
  return Array.isArray(g.cityLife?.surveillanceEpisodes)?
   g.cityLife.surveillanceEpisodes.find(e=>e&&e.night===n-1&&e.district===g.district&&e.choice==="observe"&&e.outcome==="noticed")||null:null;
 }
 function init(g){
  if(!g||typeof g!=="object")return null;
  const s=g.hunters&&typeof g.hunters==="object"&&!Array.isArray(g.hunters)?g.hunters:(g.hunters={});
  if(!s.resolved||typeof s.resolved!=="object"||Array.isArray(s.resolved))s.resolved={};
  s.history=Array.isArray(s.history)?s.history.filter(v=>typeof v==="string").slice(-12):[];
  const p=s.follower;
  if(p){
   if(!districts.has(p.district)||!Number.isInteger(p.night)||!Number.isFinite(p.x)||!Number.isFinite(p.y)||!["watch","tail"].includes(p.mode))s.follower=null;
   else if(Number.isInteger(g.clock?.night)&&p.night!==g.clock.night){
    // Un seguidor de otra noche no puede bloquear episodios nuevos ni reaparecer.
    if(typeof p.source==="string"&&p.source&&!s.resolved[p.source])s.resolved[p.source]="expired";
    s.follower=null;routes.delete(g);
   }
   else{
    p.x=clamp(p.x,24,456);p.y=clamp(p.y,51,285);
    p.alert=clamp(Number(p.alert)||0,0,100);p.lost=clamp(Number(p.lost)||0,0,60);
    p.elapsed=clamp(Number(p.elapsed)||0,0,70);
   }
  }
  return s;
 }
 function sight(physics,x1,y1,x2,y2){
  const length=Math.hypot(x2-x1,y2-y1);
  for(let d=9;d<length;d+=7){
   const t=d/length;
   if(!physics.canStand("district",x1+(x2-x1)*t,y1+(y2-y1)*t,3))return false;
  }
  return true;
 }
 function ensure(g,physics){
  const episode=source(g);if(!episode||!physics)return null;
  const s=init(g),id=episode.night+":"+episode.district;
  if(s.resolved[id])return null;
  if(s.follower)return s.follower.source===id&&s.follower.night===g.clock.night?s.follower:null;
  const possible=[[320,225],[80,169],[420,260],[240,260]]
   .map(([x,y])=>physics.nearestFree("district",x,y))
   .filter(p=>physics.canStand("district",p.x,p.y)&&Math.hypot(g.x-p.x,g.y-p.y)>=75)
   .sort((a,b)=>Math.hypot(g.x-b.x,g.y-b.y)-Math.hypot(g.x-a.x,g.y-a.y));
  if(!possible.length)return null;
  const p=possible[0];
  s.follower={district:g.district,night:g.clock.night,source:id,x:p.x,y:p.y,mode:"watch",alert:0,lost:0,elapsed:0};
  s.history.push("Noche "+g.clock.night+": una silueta apareció en "+g.district+".");
  s.history=s.history.slice(-12);
  return s.follower;
 }
 function position(g){
  const p=g?.hunters?.follower;
  return p&&g.scene==="district"&&p.district===g.district&&p.night===g.clock?.night?{x:p.x,y:p.y,mode:p.mode}:null;
 }
 function finish(g,type,message){
  const s=init(g),p=s?.follower;if(!p)return[];
  s.resolved[p.source]=type;s.follower=null;routes.delete(g);
  s.history.push("Noche "+g.clock.night+": "+message);s.history=s.history.slice(-12);
  return [{type,text:message}];
 }
 function follow(g,p,physics,dt){
  let route=routes.get(g);
  if(!route||route.delay<=0||route.source!==p.source||route.points.length===0||Math.hypot(g.x-route.x,g.y-route.y)>28){
   route={source:p.source,delay:.8,x:g.x,y:g.y,points:physics.path("district",{x:p.x,y:p.y},{x:g.x,y:g.y}).slice(0,85)};
   routes.set(g,route);
  }else route.delay-=dt;
  const next=route.points[0];if(!next)return;
  const dist=Math.hypot(next.x-p.x,next.y-p.y);
  if(dist<4){route.points.shift();return;}
  const t=Math.min(48*dt,dist)/dist;
  const moved=physics.slide("district",p.x,p.y,(next.x-p.x)*t,(next.y-p.y)*t);
  if(moved.moved){p.x=moved.x;p.y=moved.y;}else route.delay=0;
 }
 function step(g,dt,physics,options={}){
  if(!g||g.scene!=="district"||!physics||g.combat?.active)return[];
  const p=ensure(g,physics);if(!p)return[];
  const time=clamp(Number(dt)||0,0,.07);if(time===0)return[];
  p.elapsed+=time;
  if(p.elapsed>=55)return finish(g,"vanished","La silueta desapareció sin dejar pruebas de sus intenciones.");
  const dist=Math.hypot(g.x-p.x,g.y-p.y),hidden=!!g.stealthChase?.crouched;
  const seen=sight(physics,p.x,p.y,g.x,g.y);
  const observable=seen&&dist<=(hidden?45:100)+(options.sprinting&&!hidden?28:0);
  if(observable){p.alert=clamp(p.alert+time*(options.moving?40:18),0,100);p.lost=0;}
  else{p.alert=clamp(p.alert-time*25,0,100);if(p.mode==="tail")p.lost+=time;}
  const events=[];
  if(p.mode==="watch"&&p.alert>=45){
   p.mode="tail";p.lost=0;
   events.push({type:"follow",text:"Una silueta sin insignias parece seguirte. Podés perderla entre las calles."});
  }
  if(p.mode==="tail"){
   if(!observable&&p.lost>=4)return events.concat(finish(g,"escaped","Perdiste a quien parecía seguirte. No conocés su identidad."));
   if(observable)follow(g,p,physics,time);
   if(Math.hypot(g.x-p.x,g.y-p.y)<22)
    return events.concat(finish(g,"near","El desconocido se acercó, observó tu rostro y se retiró sin agredirte."));
  }
  return events;
 }
 function draw(ctx,g){
  const p=position(g);if(!p||!ctx)return;
  ctx.fillStyle="#141820aa";ctx.fillRect(p.x-9,p.y+9,18,4);
  ctx.fillStyle="#44434a";ctx.fillRect(p.x-6,p.y-11,12,19);
  ctx.fillStyle="#9f978e";ctx.fillRect(p.x-4,p.y-17,8,7);
  ctx.fillStyle="#34323b";ctx.fillRect(p.x-7,p.y-24,14,7);
  if(p.mode==="tail"){ctx.fillStyle="#d6c0ac";ctx.font="bold 8px monospace";ctx.textAlign="center";ctx.fillText("¿SEGUIMIENTO?",p.x,p.y-30);}
 }
 function summary(g){const p=position(g),s=g?.hunters;return {active:!!p,mode:p?.mode||"sin seguimiento",history:Array.isArray(s?.history)?s.history.slice(-5):[]};}
 return Object.freeze({source,init,ensure,position,sight,step,draw,summary,version:"27B.1"});
})();