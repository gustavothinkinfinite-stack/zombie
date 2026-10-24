"use strict";
/* v0.9: Disciplinas aplicadas a lugares y mortales, no sólo bonificaciones.
   Acciones originales del videojuego. No implementan todos los poderes canónicos de mesa. */
window.VTM_WORLD_POWERS=(()=>{
 const M=window.VTM_MECHANICS,E=window.VTM_ECONOMY,T=window.VTM_TACTICS,
  K=window.VTM_SHOPS,D=window.VTM_DATA;
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const RULES={
  Animalismo:{rank:1,label:"Escuchar los animales del entorno",attr:"Carisma",skill:"Trato con Animales",difficulty:6,
   cost:1,mode:"intel",text:"Un animal habituado a este barrio señala movimientos recientes de personas."},
  Auspex:{rank:1,label:"Agudizar los sentidos e investigar el lugar",attr:"Percepción",skill:"Alerta",difficulty:6,
   cost:1,mode:"intel",text:"Tu percepción distingue detalles y rastros que los presentes no advierten."},
  Celeridad:{rank:1,label:"Activar desplazamiento sobrenatural esta noche",attr:"Destreza",skill:"Atletismo",difficulty:6,
   cost:1,mode:"speed",text:"Tus movimientos se vuelven más rápidos durante el resto de la noche."},
  Dementación:{rank:1,label:"Alterar las emociones del encargado",attr:"Manipulación",skill:"Empatía",difficulty:7,
   cost:1,mode:"mental",resist:true,kind:"terror",text:"La inquietud distrae al mortal de una conversación discreta."},
  Dominación:{rank:1,label:"Imponer una orden breve al encargado",attr:"Manipulación",skill:"Intimidación",difficulty:7,
   cost:1,mode:"command",resist:true,kind:"command",moral:1,text:"El encargado acepta una instrucción simple, pero puede recordar una mirada inquietante."},
  Fortaleza:{rank:1,label:"Resistencia física siempre activa",attr:null,skill:null,cost:0,mode:"passive",
   text:"Fortaleza mejora la absorción del daño sin necesitar una activación social."},
  Ofuscación:{rank:1,label:"Ocultar tu paso entre las sombras",attr:"Destreza",skill:"Sigilo",difficulty:7,
   cost:1,mode:"cover",text:"Los testigos dejan de prestar atención a tu presencia durante un instante."},
  Potencia:{rank:1,label:"Apartar una barrera pesada",attr:"Fuerza",skill:"Atletismo",difficulty:7,
   cost:0,mode:"strength",text:"Apartás un obstáculo físico sin necesitar ayuda mortal."},
  Presencia:{rank:1,label:"Atraer la simpatía del encargado",attr:"Carisma",skill:"Expresión",difficulty:6,
   cost:1,mode:"charm",resist:true,kind:"social",text:"La persona te concede su atención y podría tratarte con más generosidad."},
  Protean:{rank:1,label:"Examinar la oscuridad con ojos de depredador",attr:"Percepción",skill:"Alerta",difficulty:6,
   cost:1,mode:"intel",text:"Ves señales imperceptibles en el fondo oscuro del establecimiento."},
  Taumaturgia:{rank:1,label:"Buscar resonancias de sangre en el lugar",attr:"Inteligencia",skill:"Ocultismo",difficulty:7,
   cost:2,mode:"ritual",text:"Una lectura ritual identifica indicios, no certezas sobre la conspiración."}
 };
 function init(g){
  let w=g.worldPowers&&typeof g.worldPowers==="object"?g.worldPowers:{};
  w.used=w.used&&typeof w.used==="object"?w.used:{};
  w.discounts=w.discounts&&typeof w.discounts==="object"?w.discounts:{};
  g.worldPowers=w;return w;
 }
 function context(g){
  if(!g||!g.character)return null;
  if(g.scene==="sidevenue"&&K?.byId?.[g.sidevenue])return {id:g.sidevenue,shop:K.byId[g.sidevenue],label:K.byId[g.sidevenue].name,kind:"shop"};
  if(g.scene==="venue"&&D.locations.some(x=>x.id===g.venue))return {id:g.venue,shop:null,label:D.locations.find(x=>x.id===g.venue).name,kind:"venue"};
  if(g.scene==="district"&&g.district)return {id:g.district,shop:null,label:"Barrio de "+g.district,kind:"district"};
  return null;
 }
 function key(g,ctx,name){return g.clock.night+"|"+ctx.id+"|"+name;}
 function available(g,name){
  const rule=RULES[name],ctx=context(g);
  if(!ctx||!rule)return "Sólo disponible al explorar lugares reales";
  if(!g.embraced)return "Requiere el Abrazo";
  if((g.character.disciplines?.[name]||0)<rule.rank)return "Disciplina no adquirida";
  if(g.combat?.active)return "No disponible durante el combate";
  if(rule.mode==="passive")return "Ya está activa de forma permanente";
  if(rule.resist&&ctx.kind!=="shop")return "Requiere un interlocutor mortal";
  if(rule.resist&&Number.isFinite(g.x)&&Number.isFinite(g.y)&&Math.hypot(g.x-240,g.y-104)>75)return "Acercate primero al encargado";
  if(rule.mode==="strength"&&!(ctx.kind==="venue"&&["tuneles","passy","saintdenis"].includes(ctx.id))&&!(ctx.kind==="shop"&&["almacen","taller"].includes(ctx.shop.kind)))return "No hay una barrera física que apartar aquí";
  if(rule.mode==="speed"&&init(g).sprintNight===g.clock.night)return "Ya activaste Celeridad esta noche";
  if(init(g).used[key(g,ctx,name)])return "Ya lo intentaste aquí esta noche";
  if((g.mechanics?.blood||0)<rule.cost)return "Reserva de Sangre insuficiente";
  return null;
 }
 function catalog(g){
  const ctx=context(g);
  if(!ctx||!g.embraced)return [];
  return Object.entries(RULES).filter(([name])=>(g.character.disciplines?.[name]||0)>0)
   .map(([name,rule])=>({name,...rule,reason:available(g,name)}));
 }
 function use(g,name,roll,rng=Math.random){
  const ctx=context(g),rule=RULES[name],reason=available(g,name);
  if(reason)return {error:reason};
  if(!roll||!Array.isArray(roll.dice)||!Number.isFinite(roll.net))return {error:"No se recibió una tirada válida"};
  const w=init(g),m=M.init(g);
  w.used[key(g,ctx,name)]=true;
  m.blood-=rule.cost;
  let opponent=null,success=roll.net>0;
  if(rule.resist){
   // Prueba simplificada de resistencia de un mortal; no revela atributos de PNJ Vástagos.
   const toughness={oficina:4,taller:3,cafe:2,almacen:3,libros:2,galeria:3}[ctx.shop.kind]||2;
   const defense=T.dice(toughness,6,rng);
   opponent={dice:defense.dice,net:defense.net};
   success=roll.net>defense.net;
  }
  let reward="",exposure=success?0:6,humanity=null,discount=0,clue=null;
  if(success){
   if(rule.mode==="intel"||rule.mode==="ritual"){
    M.reward(g,"pista",1);
    if(ctx.shop){
     g.localClues=Array.isArray(g.localClues)?g.localClues:[];
     if(!g.localClues.includes(ctx.id))g.localClues.push(ctx.id);
     clue=ctx.shop.clue;
    }else if(g.activeQuest==="archivos"&&["policia","stjuly","hemeroteca"].includes(ctx.id)&&!g.readyReport){
     if(!g.arc)g.arc={clues:[],visited:[]};
     if(!g.arc.clues.includes(ctx.id))g.arc.clues.push(ctx.id);
     clue="Identificaste un indicio adicional para la investigación del periodista.";
    }else{
     clue="La escena ofrece detalles que podrás utilizar en una investigación futura.";
    }
   }
   if(rule.mode==="cover"){M.reward(g,"cobertura",1);exposure=-Math.min(10,5+(g.character.disciplines[name]||1));}
   if(rule.mode==="strength"){M.reward(g,"preparacion",1);exposure=7;}
   if(rule.mode==="speed"){w.sprintNight=g.clock.night;M.reward(g,"preparacion",1);}
   if(rule.mode==="mental"){M.reward(g,"influencia",1);exposure=5;}
   if(rule.mode==="command"||rule.mode==="charm"){
     discount=rule.mode==="command"?0.12:0.15;
     w.discounts[ctx.id]={night:g.clock.night,value:discount,source:name};
     exposure=rule.mode==="command"?8:2;
   }
   if(rule.mode==="ritual")exposure=4;
  } else exposure=rule.resist?9:6;
  if(rule.moral&&success){
   const moral=window.VTM_STORY.moralTest(g,rule.moral,rng);
   humanity={degeneration:moral.degeneration,roll:moral.roll.dice,value:g.character.humanity};
  }
  return {name,label:rule.label,success,cost:rule.cost,roll,defense:opponent,
   exposure,humanity,discount,clue,
   description:success?rule.text:"El intento no alcanza su objetivo; la Sangre se gastó igualmente.",
   mode:rule.mode,place:ctx.id};
 }
 return {RULES,init,context,available,catalog,use};
})();