"use strict";
/* V0.7: combate por turnos y poderes por círculo.
   Adaptación interactiva de Vampiro 3.ª edición: iniciativa, ataque, daño y absorción.
   Los efectos concretos se simplifican para el prototipo, nunca sustituyen la ficha de mesa. */
window.VTM_TACTICS=(()=>{
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const EQ=window.VTM_EQUIPMENT,ADV=window.VTM_ADVANCED_TACTICS||null;
 const ENEMIES=Object.freeze({
  bapthiste:{name:"Bapthiste, Brujah rebelde",health:9,dex:4,wits:4,str:4,stamina:4,skill:3,willpower:7,armor:0,ammo:0,style:"agresivo",damage:"contundente",reward:3},
  saintdenis:{name:"Matón de Saint-Denis",health:6,dex:3,wits:2,str:3,stamina:2,skill:2,willpower:2,armor:0,ammo:0,style:"agresivo",damage:"contundente",reward:2},
  bastilla:{name:"Provocador de Bastilla",health:6,dex:3,wits:3,str:2,stamina:2,skill:2,willpower:3,armor:0,ammo:0,style:"evasivo",damage:"contundente",reward:2},
  passy:{name:"Custodio armado de Passy",health:7,dex:3,wits:2,str:2,stamina:3,skill:3,willpower:4,armor:1,ammo:4,style:"armado",damage:"letal",reward:3}
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
   ["Celeridad 1","speed",1,"Gastás un punto de Sangre para realizar una acción física adicional durante el turno."],
   ["Celeridad 2","speed",1,"Podés realizar dos acciones físicas adicionales al activar Celeridad."],
   ["Celeridad 3","speed",1,"Podés realizar tres acciones físicas adicionales al activar Celeridad."],
   ["Celeridad 4","speed",1,"Podés realizar cuatro acciones físicas adicionales al activar Celeridad."],
   ["Celeridad 5","speed",1,"Podés realizar cinco acciones físicas adicionales al activar Celeridad."]],
  Dementación:[
   ["Pasión","social",1,"Intensificás la emoción dominante de un interlocutor."],
   ["Hechizar","social",1,"La víctima se distrae ante percepciones perturbadoras."],
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
   ["Fortaleza 1","passive",0,"Recibís un dado permanente de absorción adicional."],
   ["Fortaleza 2","passive",0,"Recibís dos dados permanentes de absorción adicional."],
   ["Fortaleza 3","passive",0,"Recibís tres dados permanentes de absorción adicional."],
   ["Fortaleza 4","passive",0,"Recibís cuatro dados permanentes de absorción adicional."],
   ["Fortaleza 5","passive",0,"Recibís cinco dados permanentes de absorción adicional."]],
  Ofuscación:[
   ["Capa de Sombras","cover",1,"Permanecés inmóvil en un lugar poco visible."],
   ["Presencia Invisible","escape",1,"Pasás inadvertido mientras evitás llamar la atención."],
   ["Máscara de las Mil Caras","social",1,"Alterás la impresión que otros reciben de tu aspecto."],
   ["Desvanecimiento del Ojo Mental","escape",2,"Desaparecés de la percepción ordinaria de un perseguidor."],
   ["Encubrir a los Reunidos","cover",2,"Extendés el disimulo sobrenatural a tus acompañantes."]],
  Potencia:[
   ["Potencia 1","passive",0,"Sumás un éxito automático de fuerza en el daño."],
   ["Potencia 2","passive",0,"Sumás dos éxitos automáticos de fuerza en el daño."],
   ["Potencia 3","passive",0,"Sumás tres éxitos automáticos de fuerza en el daño."],
   ["Potencia 4","passive",0,"Sumás cuatro éxitos automáticos de fuerza en el daño."],
   ["Potencia 5","passive",0,"Sumás cinco éxitos automáticos de fuerza en el daño."]],
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
  if(EQ)EQ.init(g);
  if(g.combat.active?.enemy){const enemy=g.combat.active.enemy,def=ENEMIES[g.combat.active.place];if(def)for(const key of ["willpower","armor","style","ammo"])if(enemy[key]===undefined)enemy[key]=def[key];}
  const m=g.mechanics||{};
  const oldHealthOnly=!m.damage;
  m.damage=m.damage||{contundente:0,letal:0,agravado:0};
  if(oldHealthOnly&&Number.isFinite(m.health)&&m.health<7)m.damage.contundente=Math.max(0,7-m.health);
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
   (g.combat.active?" · enemigo "+g.combat.active.enemy.health+"/"+g.combat.active.enemy.max:"")+
   (EQ?" · "+EQ.summary(g):"");
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
  const armor=type==="agravado"?0:EQ?.init(g).armor?EQ.ITEMS.chaleco.soak:0;
  const pool=(type==="agravado"?fort:type==="letal"?(isVampire?rank(g,"Resistencia")+fort:0):rank(g,"Resistencia")+fort)+armor;
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
  g.combat.active={place,round:1,enemy:{name:e.name,health:e.health,max:e.health,dex:e.dex,wits:e.wits,str:e.str,stamina:e.stamina,skill:e.skill,damage:e.damage,willpower:e.willpower,armor:e.armor,ammo:e.ammo,style:e.style},history:[],ended:false,tactical:ADV?{distance:1}:undefined};
  ADV?.init(g);
  return {started:true,enemy:e.name};
 }
 // Encuentro independiente, identificado por episodio; sin recompensas de lugar.
 function startStreet(g){
  if(!window.VTM_HUNTERS?.canFight(g,window.VTM_PHYSICS))
   return {error:"No existe una amenaza civil que justifique este combate."};
  init(g);
  if(g.combat.active)return {error:"Ya hay un combate activo."};
  const place="street-vigilante:"+g.hunters.follower.source;
  if(g.combat.records[place])return {error:"Este encuentro ya se resolvió."};
  const enemy={name:"Vigilante hostil sin identificar",health:5,max:5,
   dex:3,wits:2,str:2,stamina:2,skill:2,willpower:3,armor:0,ammo:0,
   style:"evasivo",damage:"contundente"};
  g.combat.active={place,round:1,enemy,history:[],ended:false,
   tactical:ADV?{distance:1}:undefined};
  ADV?.init(g);
  return {started:true,enemy:enemy.name,place};
 }
 function action(g,choice,rng=Math.random){
  init(g);
  const encounter=g.combat.active;if(!encounter||encounter.ended)return {error:"No hay combate activo."};
  const e=encounter.enemy;
  const valid=["golpe","arma","disparo","esquiva","huida","recargar",...(ADV?.MOVES||[])].includes(choice);
  if(!valid)return {error:"Acción no admitida."};
  const invalid=ADV?.valid(g,choice);if(invalid)return {error:invalid};
  if(EQ&&choice!=="recargar"){const reason=EQ.moveAllowed(g,choice);if(reason)return {error:reason};}
  if(choice==="recargar"&&(!EQ||EQ.init(g).equipped!=="pistola"||EQ.init(g).ammo<=0||EQ.init(g).magazine>=6))return {error:"No podés recargar ahora."};
  const log=[],playerInit=rank(g,"Destreza")+rank(g,"Astucia")+Math.floor(rng()*10)+1+
   (g.embraced?Math.min(3,power(g,"Celeridad")):0);
  const enemyInit=e.dex+e.wits+Math.floor(rng()*10)+1;
  const outcome={playerInit,enemyInit,round:encounter.round,choice,log,playerRoll:null,enemyRoll:null,ended:false};
  let done=false,dodging=choice==="esquiva";
  const player=()=>{
   if(choice==="huida"){
    const t=dice(rank(g,"Destreza")+skill(g,"Atletismo")+wounds(g)+(ADV?.init(g)?.distance||0)+
      (g.embraced?power(g,"Celeridad"):0),7,rng);
    outcome.playerRoll=t;log.push(t.success?"Escapaste antes de quedar rodeado.":"Tu intento de retirada fracasó.");
    if(t.success){encounter.ended=true;g.combat.records[encounter.place]="escaped";done=true;outcome.ended=true;}
    return;
   }
   if(dodging){log.push("Adoptás una postura defensiva.");return;}
   if(ADV?.move(g,choice,log,rng))return;
   if(choice==="recargar"){const r=EQ.reload(g);log.push(r.ok?"Recargaste "+r.loaded+" cartucho(s); quedan "+r.reserve+" en reserva.":r.error);return;}
   const st=choice==="golpe"?"Pelea":choice==="arma"?"Armas Cuerpo a Cuerpo":"Armas de Fuego";
   if(choice==="disparo"){if(!EQ?.useAmmo(g)){log.push("No queda munición.");return;}log.push("Disparaste un cartucho.");}
   const p=dice(rank(g,"Destreza")+skill(g,st)+wounds(g)+
    (g.embraced&&g.mechanics.battleSpeed>0?1:0)+(ADV?.outgoing(g,choice)||0),choice==="disparo"?7:6,rng);
   outcome.playerRoll=p;
   if(!p.success){log.push("Tu ataque falló ("+p.dice.join(", ")+").");return;}
   const weapon=EQ?.ITEMS[EQ.init(g).equipped];
   const type=g.embraced&&g.mechanics.claws&&choice==="golpe"?"agravado":choice==="disparo"?"letal":choice==="arma"?weapon?.damage||"contundente":"contundente";
   const extra=type==="agravado"?1:choice==="arma"?weapon?.bonus||0:0;
   const dmg=dice(choice==="disparo"?(weapon?.bonus||3)+1+Math.max(0,p.net-1):rank(g,"Fuerza")+Math.max(0,p.net-1)+extra,6,rng);
   const potency=g.embraced&&choice!=="disparo"?power(g,"Potencia"):0;
   const raw=Math.max(0,dmg.net+potency);
   if(e.style==="evasivo"&&e.health<=Math.ceil(e.max/2)&&dice(e.dex+2,7,rng).net>=p.net){log.push("El adversario esquivó el ataque.");return;}
   const armor=type==="agravado"?0:e.stamina+(e.armor||0);
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
   if(ADV?.enemyMove(g,e,log))return;
   const attack=dice(Math.max(1,e.dex+e.skill+(e.style==="agresivo"&&e.health<=3?1:0)-(ADV?.incoming(g,choice)||0)),6,rng);outcome.enemyRoll=attack;
   if(e.style==="armado"&&e.ammo>0){e.ammo--;log.push("El custodio disparó ("+e.ammo+" cartuchos restantes).");}
   else if(e.style==="armado"&&e.ammo<=0){e.damage="contundente";log.push("El custodio agotó su munición y combate a golpes.");}
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
  // En el manual, las acciones extra de Celeridad suceden al final del turno.
  const extra=(choice==="golpe"||choice==="arma"||choice==="disparo")?g.mechanics.battleSpeed:0;
  for(let i=0;i<extra&&!done;i++){log.push("Acción física adicional "+(i+1)+" por Celeridad.");player();}
  g.mechanics.battleSpeed=0;
  if(g.mechanics.claws&&choice==="golpe")g.mechanics.claws=false;
  ADV?.after(g,choice);
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
  if(name==="Fortaleza"||name==="Potencia"){
   const level=Math.min(5,power(g,name)),label=name+" "+level,description=POWERS[name][level-1][3];
   return [{name,level,label,effect:"passive",cost:0,description,available:false,used:true,passive:true}];
  }
  if(name==="Celeridad"){
   const level=Math.min(5,power(g,name)),label="Celeridad "+level,description=POWERS[name][level-1][3];
   const k=g.clock.night+"|celerity|"+(g.combat.active?.round||0);
   return [{name,level,label,effect:"speed",cost:1,description,available:!!g.combat.active&&(g.mechanics?.blood||0)>0,
      used:!!g.mechanics?.powerHistory?.[k]}];
  }
  return POWERS[name].slice(0,Math.min(5,power(g,name))).map(([label,effect,cost,description],i)=>({
   name,level:i+1,label,effect,cost,description,
   available:(g.mechanics?.blood||0)>=cost,
   used:!!g.mechanics?.powerHistory?.[g.clock.night+"|"+name+"|"+(i+1)]
  }));
 }
 // Tirada enfrentada contra la voluntad concreta del adversario presente.
 function resist(g,enemy,effect,rng=Math.random){
  const table={command:["Manipulación","Intimidación"],terror:["Carisma","Intimidación"],
   social:["Carisma","Expresión"],read:["Percepción","Empatía"],calm:["Carisma","Trato con Animales"]};
  const [attribute,ability]=table[effect]||["Manipulación","Subterfugio"];
  const attacker=dice(rank(g,attribute)+skill(g,ability)+wounds(g),6,rng);
  const defender=dice(Math.max(1,enemy.willpower||2)+Math.max(1,enemy.wits||2),6,rng);
  return {success:attacker.net>defender.net,attacker,defender,attribute,ability};
 }
 function cast(g,name,index,rng=Math.random){
  init(g);
  if(!known(g,name))return {error:"No adquiriste esa Disciplina."};
  if(name==="Fortaleza"||name==="Potencia")return {error:"Esta Disciplina es pasiva: sus círculos ya funcionan automáticamente."};
  if(name==="Celeridad"){
   if(!g.combat.active)return {error:"Celeridad se activa durante un turno de combate."};
   const m=g.mechanics,level=Math.min(5,power(g,name)),day=g.clock.night+"|celerity|"+g.combat.active.round;
   m.powerHistory=m.powerHistory||{};
   if(m.powerHistory[day])return {error:"Ya utilizaste Celeridad este turno."};
   if((m.blood||0)<1)return {error:"Reserva de Sangre insuficiente."};
   m.powerHistory[day]=true;m.blood--;m.battleSpeed=level;
   return {name,label:"Celeridad "+level,level,cost:1,effect:"speed",risk:0,
      description:"Preparaste "+level+" acciones físicas adicionales para este turno.",
      changed:{battleSpeed:level}};
  }
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
  let opposed=null;
  if(fight&&["command","terror","social","read","calm"].includes(effect)){
   opposed=resist(g,fight.enemy,effect,rng);
   if(!opposed.success)return {name,label,level:index+1,cost,effect,risk:4,
    description:"El adversario resistió tu poder. Gastaste la Sangre y la acción sobrenatural dejó huellas.",
    changed:{},resisted:true,opposed};
  }
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
  if(effect==="social"&&fight){fight.enemy.skipAttack=true;changed.social=true;}
  if(effect==="calm"&&fight){fight.enemy.skipAttack=true;changed.calm=true;}
  if(effect==="read"&&fight){addToken("preparacion",1);changed.read=true;}
  if(effect==="terror"&&fight){fight.enemy.skipAttack=true;changed.terror=true;}
  if(effect==="terror"&&!fight)addToken("influencia",1);
  if(name==="Ofuscación"&&index>=1)changed.exposure=-Math.min(10,index*2+2);
  return {name,label,level:magnitude,cost,effect,risk,description:message,changed,opposed};
 }
 return {ENEMIES,POWERS,init,dice,wounds,status,deal,soak,start,startStreet,action,recover,catalog,cast,resist};
})();