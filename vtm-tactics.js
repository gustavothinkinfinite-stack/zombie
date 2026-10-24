"use strict";
/* V0.7: combate por turnos y poderes por círculo.
   Adaptación interactiva de Vampiro 3.ª edición: iniciativa, ataque, daño y absorción.
   Los efectos concretos se simplifican para el prototipo, nunca sustituyen la ficha de mesa. */
window.VTM_TACTICS=(()=>{
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const ENEMIES=Object.freeze({
  saintdenis:{name:"Matón de Saint-Denis",health:6,dex:3,wits:2,str:3,stamina:2,skill:2,damage:"contundente",reward:2},
  bastilla:{name:"Provocador de Bastilla",health:6,dex:2,wits:3,str:3,stamina:2,skill:2,damage:"contundente",reward:2},
  passy:{name:"Custodio armado de Passy",health:7,dex:3,wits:2,str:2,stamina:3,skill:3,damage:"letal",reward:3}
 });
 // Poderes de 1 a 5. Celeridad, Potencia y Fortaleza mantienen además efecto pasivo.
 const POWERS=Object.freeze({
  Animalismo:[
   ["Susurros Salvajes","intel",1,"Sos capaz de obtener indicios del comportamiento de animales cercanos."],
   ["La Llamada","intel",1,"La fauna de los alrededores acude y revela rutas poco transitadas."],
   ["Reprimir a la Bestia","calm",1,"Calmás por un momento los impulsos violentos de una criatura."],
   ["Comunión de Espíritus","intel",2,"Proyectás tu percepción por un animal y reconocés sus alrededores."],
   ["Apartar a la Bestia","calm",2,"Intentás desplazar temporalmente la furia predatoria." ]],
  Auspex:[
   ["Sentidos Agudizados","intel",1,"Percibís detalles ocultos a los sentidos mortales."],
   ["Percepción del Aura","read",1,"Interpretás señales emocionales de una criatura cercana."],
   ["El Toque del Espíritu","intel",1,"Un objeto revela rastros de su propietario anterior."],
   ["Telepatía","read",2,"Percibís pensamientos superficiales en un intercambio breve."],
   ["Proyección Psíquica","intel",3,"Tu conciencia contempla una zona distante, dejando el cuerpo vulnerable."]],
  Celeridad:[
   ["Reflejos Sobrenaturales","speed",1,"Tu velocidad te permite actuar antes que adversarios comunes."],
   ["Desplazamiento Fugaz","speed",1,"Cubrís un trayecto con rapidez inhumana."],
   ["Acción Relámpago","speed",1,"Realizás una maniobra táctica adicional."],
   ["Torbellino","speed",2,"Una sucesión de desplazamientos evita una encerrona."],
   ["Velocidad Imposible","speed",2,"Superás durante unos instantes a casi cualquier perseguidor."]],
  Dementación:[
   ["Pasión","social",1,"Intensificás la emoción dominante de un interlocutor."],
   ["El Encantamiento","social",1,"La víctima se distrae ante percepciones perturbadoras."],
   ["Los Ojos del Caos","intel",1,"Descubrís patrones desordenados que ocultan indicios."],
   ["La Voz de la Locura","terror",2,"Sembrás una conmoción emocional muy difícil de ocultar."],
   ["Locura Total","terror",2,"Provocás un episodio de desorientación de consecuencias impredecibles."]],
  Dominación:[
   ["Orden","command",1,"Una instrucción breve impone una vacilación a un mortal que te mira."],
   ["Mesmerismo","command",1,"Una instrucción más elaborada domina un encuentro breve."],
   ["La Mente Olvidadiza","cover",1,"Alterás el recuerdo inmediato de un testigo."],
   ["Condicionamiento","social",2,"Moldeás progresivamente la obediencia en una relación previa."],
   ["Posesión","command",3,"Intentás dirigir temporalmente el cuerpo de un mortal." ]],
  Fortaleza:[
   ["Resistencia Sobrenatural","guard",1,"Tu sangre amortigua el siguiente ataque."],
   ["Cuerpo Inamovible","guard",1,"Tu vigor hace retroceder a quien intenta derribarte."],
   ["Blindaje de la Sangre","guard",1,"Tu resistencia física supera la de un mortal."],
   ["Soportar el Castigo","guard",1,"Sobrevivís a un daño que parecería incapacitante."],
   ["Fortaleza Absoluta","guard",2,"Concentrás toda tu fortaleza en una defensa extraordinaria."]],
  Ofuscación:[
   ["Capa de Sombras","cover",1,"Permanecés inmóvil en un lugar poco visible."],
   ["Presencia Invisible","escape",1,"Pasás inadvertido mientras evitás llamar la atención."],
   ["Máscara de las Mil Caras","social",1,"Alterás la impresión que otros reciben de tu aspecto."],
   ["Desvanecimiento del Ojo Mental","escape",2,"Desaparecés de la percepción ordinaria de un perseguidor."],
   ["Encubrir a los Reunidos","cover",2,"Extendés el disimulo sobrenatural a tus acompañantes."]],
  Potencia:[
   ["Fuerza Inhumana","strength",0,"Tu fuerza supera los límites humanos."],
   ["Golpe Demoledor","strength",0,"Un impacto puede apartar a un oponente peligroso."],
   ["Poder Aplastante","strength",0,"La fuerza de tu sangre rompe una barrera menor."],
   ["Proeza Descomunal","strength",1,"Ejecutás una maniobra que ningún mortal normal podría realizar."],
   ["Poder Titánico","strength",1,"Tu fuerza alcanza una magnitud temible."]],
  Presencia:[
   ["Fascinación","social",1,"Tu carisma provoca interés inmediato."],
   ["Mirada Aterradora","terror",1,"Intimidás con una presencia sobrenatural."],
   ["Encantamiento","social",1,"Un interlocutor siente una simpatía difícil de explicar."],
   ["Invocación","social",2,"Hacés llegar una llamada irresistible a alguien que te conoce."],
   ["Majestad","social",2,"Tu porte exige respeto y paraliza una confrontación." ]],
  Protean:[
   ["Ojos de la Bestia","intel",1,"Distinguís formas y movimientos en la oscuridad."],
   ["Garras de la Bestia","claws",1,"Tus manos desarrollan garras capaces de causar daño agravado."],
   ["Fusión con la Tierra","escape",1,"Desaparecés dentro de la tierra cuando el entorno lo permite."],
   ["Forma de la Bestia","claws",2,"Adoptás la fuerza y los instintos de una bestia."],
   ["Forma de Niebla","escape",2,"Te deslizás sin cuerpo sólido para evitar un peligro."]],
  Taumaturgia:[
   ["Sabor de la Sangre","intel",1,"Interpretás una muestra de vitae para descubrir indicios."],
   ["Furia de la Sangre","social",1,"Manipulás el impulso sanguíneo de otro ser, con riesgo para la Mascarada."],
   ["Potencia de la Sangre","blood",1,"Tu vitae se concentra temporalmente en una manifestación de poder."],
   ["Robo de Vitae","blood",2,"Una transferencia de vitae puede recuperar parte de tu reserva."],
   ["Caldero de Sangre","terror",2,"Invocás un efecto sanguíneo muy peligroso y evidente."]]
 });
 const keys=Object.keys(POWERS);
 const dice=(count,difficulty=6,rng=Math.random)=>{
  const values=Array.from({length:Math.max(1,Math.min(30,Math.round(count)||1))},()=>Math.floor(rng()*10)+1);
  const successes=values.filter(v=>v>=difficulty).length,ones=values.filter(v=>v===1).length;
  return {dice:values,net:Math.max(0,successes-ones),success:successes>ones,botch:successes===0&&ones>0};
 };
 const rank=(g,k)=>Math.max(0,Number(g.character?.attr?.[k])||1);
 const skill=(g,k)=>Math.max(0,Number(g.character?.skills?.[k])||0);
 const power=(g,k)=>Math.max(0,Number(g.character?.disciplines?.[k])||0);
 function init(g){
  g.combat=g.combat||{};
  g.combat.records=g.combat.records||{};
  const m=g.mechanics||{};
  m.damage=m.damage||{contundente:0,letal:0,agravado:0};
  for(const k of ["contundente","letal","agravado"])m.damage[k]=clamp(Number(m.damage[k])||0,0,7);
  // Existing saves contain only numerical health; retain that value.
  m.health=clamp(Number.isFinite(m.health)?m.health:7,0,7);
  m.guard=clamp(Number(m.guard)||0,0,4);
  m.battleSpeed=clamp(Number(m.battleSpeed)||0,0,6);
  m.claws=!!m.claws;
  g.mechanics=m;return g.combat;
 }
 function wounds(g){
  const hp=init(g)&&g.mechanics.health;
  return hp<=0?-5:hp<=1?-2:hp<=3?-2:hp<=5?-1:0;
 }
 function status(g){
  const m=g.mechanics;init(g);
  return "Salud "+m.health+"/7 · contundente "+m.damage.contundente+
   " · letal "+m.damage.letal+" · agravado "+m.damage.agravado+
   (g.embraced?" · Sangre "+m.blood+"/10":"")+
   (g.combat.active?" · enemigo "+g.combat.active.enemy.health+"/"+g.combat.active.enemy.max:"");
 }
 function deal(g,damage,type){
  init(g);const m=g.mechanics,amount=clamp(Math.floor(damage),0,7);
  m.damage[type]=(m.damage[type]||0)+amount;
  m.health=clamp(m.health-amount,0,7);
  return {amount,health:m.health,type};
 }
 function soak(g,type,raw,rng=Math.random){
  init(g);
  const isVampire=!!g.embraced,fort=isVampire?power(g,"Fortaleza"):0;
  // Fortaleza puede absorber agravado. Los mortales no absorben daño letal con Resistencia.
  const pool=type==="agravado"?fort:type==="letal"?(isVampire?rank(g,"Resistencia")+fort:0):rank(g,"Resistencia")+fort;
  const rolled=pool>0?dice(pool,6,rng):{dice:[],net:0};
  let rest=Math.max(0,raw-rolled.net-g.mechanics.guard);
  g.mechanics.guard=0;
  if(type==="contundente"&&isVampire)rest=Math.max(0,Math.floor(rest/2));
  return {soaked:raw-rest,damage:rest,dice:rolled.dice,pool};
 }
 function start(g,place){
  init(g);const e=ENEMIES[place];
  if(!e)return {error:"Aquí no hay un encuentro de combate definido."};
  if(g.combat.active)return {error:"Ya participás en un combate."};
  if(g.combat.records[place]==="won")return {error:"Ya neutralizaste la amenaza de este lugar."};
  if(g.mechanics.health<=0)return {error:"Estás incapacitado; necesitás recuperarte."};
  g.combat.active={place,round:1,enemy:{name:e.name,health:e.health,max:e.health,dex:e.dex,wits:e.wits,str:e.str,stamina:e.stamina,skill:e.skill,damage:e.damage},history:[],ended:false};
  return {started:true,enemy:e.name};
 }
 function action(g,choice,rng=Math.random){
  init(g);
  const encounter=g.combat.active;if(!encounter||encounter.ended)return {error:"No hay combate activo."};
  const e=encounter.enemy;
  const valid=["golpe","arma","disparo","esquiva","huida"].includes(choice);
  if(!valid)return {error:"Acción no admitida."};
  const log=[],playerInit=rank(g,"Destreza")+rank(g,"Astucia")+Math.floor(rng()*10)+1+
   (g.embraced?Math.min(3,power(g,"Celeridad")):0);
  const enemyInit=e.dex+e.wits+Math.floor(rng()*10)+1;
  const outcome={playerInit,enemyInit,round:encounter.round,choice,log,playerRoll:null,enemyRoll:null,ended:false};
  let done=false,dodging=choice==="esquiva";
  const player=()=>{
   if(choice==="huida"){
    const t=dice(rank(g,"Destreza")+skill(g,"Atletismo")+wounds(g)+
      (g.embraced?power(g,"Celeridad"):0),7,rng);
    outcome.playerRoll=t;log.push(t.success?"Escapaste antes de quedar rodeado.":"Tu intento de retirada fracasó.");
    if(t.success){encounter.ended=true;g.combat.records[encounter.place]="escaped";done=true;outcome.ended=true;}
    return;
   }
   if(dodging){log.push("Adoptás una postura defensiva.");return;}
   const st=choice==="golpe"?"Pelea":choice==="arma"?"Armas Cuerpo a Cuerpo":"Armas de Fuego";
   if(choice==="disparo"&&skill(g,st)===0){log.push("No tenés preparación para manejar un arma de fuego.");return;}
   const p=dice(rank(g,"Destreza")+skill(g,st)+wounds(g)+
    (g.embraced&&g.mechanics.battleSpeed>0?1:0),choice==="disparo"?7:6,rng);
   outcome.playerRoll=p;
   if(!p.success){log.push("Tu ataque falló ("+p.dice.join(", ")+").");return;}
   const type=g.embraced&&g.mechanics.claws&&choice==="golpe"?"agravado":choice==="disparo"||choice==="arma"?"letal":"contundente";
   const extra=type==="agravado"?1:choice==="arma"?1:choice==="disparo"?2:0;
   const dmg=dice(rank(g,"Fuerza")+Math.max(0,p.net-1)+extra,6,rng);
   const potency=g.embraced?power(g,"Potencia"):0;
   const raw=Math.max(0,dmg.net+potency);
   const armor=type==="agravado"?0:e.stamina;
   const absorbed=dice(armor,6,rng);
   const net=Math.max(0,raw-absorbed.net);
   e.health=clamp(e.health-net,0,e.max);
   log.push("Ataque "+st+": "+p.net+" éxitos; daño "+raw+", absorción "+absorbed.net+
    ", "+net+" "+type+" ("+e.health+" Salud enemiga).");
   outcome.damageToEnemy=net;
   if(e.health===0){
    encounter.ended=true;g.combat.records[encounter.place]="won";done=true;outcome.ended=true;
    outcome.victory=true;log.push("La amenaza quedó neutralizada.");
   }
  };
  const npc=()=>{
   if(done)return;
   if(e.skipAttack){e.skipAttack=false;log.push("El adversario pierde su acción por un poder sobrenatural.");return;}
   const attack=dice(e.dex+e.skill,6,rng);outcome.enemyRoll=attack;
   if(!attack.success){log.push("El adversario falló su ataque.");return;}
   const dodge=dodging?dice(rank(g,"Destreza")+skill(g,"Esquivar")+wounds(g),6,rng):{net:0,dice:[]};
   if(dodge.net>=attack.net&&dodge.net>0){log.push("Evitaste el ataque por Esquivar.");return;}
   const dmg=dice(e.str+Math.max(0,attack.net-1)+(e.damage==="letal"?1:0),6,rng);
   const absorb=soak(g,e.damage,dmg.net,rng);
   if(absorb.damage>0)deal(g,absorb.damage,e.damage);
   log.push("El enemigo causó "+dmg.net+" de daño "+e.damage+"; absorción "+absorb.soaked+
    "; daño sufrido "+absorb.damage+".");
   outcome.damageToPlayer=absorb.damage;
   if(g.mechanics.health<=0){
    done=true;encounter.ended=true;g.combat.records[encounter.place]="lost";outcome.ended=true;outcome.defeat=true;
    log.push("Quedaste incapacitado. El combate terminó.");
   }
  };
  // La defensa se declara antes del ataque enemigo. Iniciativa determina quién ejecuta primero.
  if(playerInit>=enemyInit){player();npc();}
  else{npc();if(!done)player();}
  if(g.mechanics.battleSpeed>0&&choice!=="huida"&&choice!=="esquiva")g.mechanics.battleSpeed--;
  if(g.mechanics.claws&&choice==="golpe")g.mechanics.claws=false;
  encounter.history.push({round:encounter.round,choice,log:[...log]});
  encounter.history=encounter.history.slice(-10);
  if(!outcome.ended)encounter.round++;
  else{outcome.place=encounter.place;g.combat.active=null;}
  return outcome;
 }
 function recover(g,amount,type="contundente"){
  init(g);const m=g.mechanics;
  const healed=Math.min(7-m.health,Math.max(0,Math.floor(amount)));
  if(!healed)return 0;
  m.health+=healed;
  let remaining=healed;
  for(const t of [type,"contundente","letal","agravado"]){
   const reduce=Math.min(m.damage[t]||0,remaining);
   m.damage[t]-=reduce;remaining-=reduce;
  }
  return healed;
 }
 function known(g,name){
  return keys.includes(name)&&g.embraced&&power(g,name)>0;
 }
 function catalog(g,name){
  if(!known(g,name))return [];
  return POWERS[name].slice(0,Math.min(5,power(g,name))).map(([label,effect,cost,description],i)=>({
   name,level:i+1,label,effect,cost,description,
   available:(g.mechanics?.blood||0)>=cost,
   used:!!g.mechanics?.powerHistory?.[g.clock.night+"|"+name+"|"+(i+1)]
  }));
 }
 function cast(g,name,index){
  init(g);
  if(!known(g,name))return {error:"No adquiriste esa Disciplina."};
  const [label,effect,cost,description]=POWERS[name][index]||[];
  if(!label||index>=power(g,name))return {error:"No tenés suficientes círculos para ese poder."};
  const m=g.mechanics,day=g.clock.night+"|"+name+"|"+(index+1);
  m.powerHistory=m.powerHistory||{};
  if(m.powerHistory[day])return {error:"Ya utilizaste este poder esta noche."};
  if((m.blood||0)<cost)return {error:"Reserva de Sangre insuficiente."};
  const fight=g.combat.active;
  if(effect==="command"&&!fight)return {error:"Necesitás un adversario presente en combate."};
  if(effect==="claws"&&!fight)return {error:"Las garras sólo se activan ante un enfrentamiento."};
  if(effect==="strength"&&!fight)return {error:"La proeza de Potencia requiere un desafío físico."};
  m.powerHistory[day]=true;m.blood-=cost;
  const magnitude=index+1,risk=(name==="Taumaturgia"&&index>=3?8:effect==="terror"?6:0);
  let message=description,changed={};
  const addToken=(kind,n=1)=>{m.tokens=m.tokens||{};m.tokens[kind]=clamp((m.tokens[kind]||0)+n,0,3);};
  if(effect==="intel"){addToken("pista",Math.min(2,magnitude));changed.pista=true;}
  if(effect==="read"||effect==="social"){addToken("influencia",Math.min(2,magnitude));changed.influencia=true;}
  if(effect==="cover"){addToken("cobertura",Math.min(2,magnitude));changed.cobertura=true;}
  if(effect==="guard"){m.guard=clamp(m.guard+Math.min(3,Math.ceil(magnitude/2)),0,4);changed.guard=m.guard;}
  if(effect==="speed"){m.battleSpeed=clamp(m.battleSpeed+Math.min(3,magnitude),0,6);changed.battleSpeed=m.battleSpeed;addToken("preparacion",1);}
  if(effect==="strength"){addToken("preparacion",Math.min(3,magnitude));changed.strength=true;}
  if(effect==="claws"){m.claws=true;changed.claws=true;}
  if(effect==="escape"){addToken("cobertura",Math.min(3,magnitude));changed.cobertura=true;}
  if(effect==="calm"){addToken("influencia",1);changed.calm=true;}
  if(effect==="blood"){m.blood=clamp(m.blood+(index>=3?2:1),0,10);changed.blood=m.blood;}
  if(effect==="command"&&fight){fight.enemy.skipAttack=true;changed.command=true;}
  if(effect==="terror"&&fight){fight.enemy.skipAttack=true;changed.terror=true;}
  if(effect==="terror"&&!fight)addToken("influencia",1);
  if(name==="Ofuscación"&&index>=1)changed.exposure=-Math.min(10,index*2+2);
  return {name,label,level:magnitude,cost,effect,risk,description:message,changed};
 }
 return {ENEMIES,POWERS,init,dice,wounds,status,deal,soak,start,action,recover,catalog,cast};
})();