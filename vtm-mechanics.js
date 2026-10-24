"use strict";
/* Crónicas de París — motor de rasgos jugables v0.5.
   Adaptación para videojuego de la ficha de Vampiro 3.ª edición.
   No sustituye la descripción formal de los poderes del manual. */
window.VTM_MECHANICS=(()=>{
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const A=[
  ["Alerta","Percepción","Detectar a quien te vigila","pista","urban",6],
  ["Atletismo","Destreza","Cruzar un paso vigilado","cobertura","urban",6],
  ["Callejeo","Astucia","Buscar rumores de los bajos fondos","pista","urban",6],
  ["Empatía","Percepción","Leer las emociones de un testigo","influencia","social",6],
  ["Esquivar","Destreza","Evitar una emboscada","cobertura","urban",6],
  ["Expresión","Apariencia","Conmover a los presentes con tu discurso","influencia","social",6],
  ["Intimidación","Manipulación","Disuadir a un hostigador","preparacion","urban",7],
  ["Liderazgo","Carisma","Coordinar discretamente a tus colaboradores","influencia","social",7],
  ["Pelea","Fuerza","Contener a un agresor sin armas","preparacion","urban",7],
  ["Subterfugio","Manipulación","Ocultar tu identidad y tus intenciones","cobertura","social",6],
  ["Armas Cuerpo a Cuerpo","Destreza","Desarmar a una amenaza","preparacion","urban",7],
  ["Armas de Fuego","Destreza","Resolver una amenaza armada","preparacion","urban",8],
  ["Conducir","Destreza","Preparar una ruta de escape","cobertura","urban",6],
  ["Etiqueta","Carisma","Seguir el protocolo de un encuentro","influencia","social",6],
  ["Interpretación","Apariencia","Representar un papel para pasar inadvertido","influencia","social",7],
  ["Pericias","Inteligencia","Preparar herramientas y equipo","preparacion","house",6],
  ["Seguridad","Astucia","Estudiar cerraduras y alarmas","cobertura","study",7],
  ["Sigilo","Destreza","Moverte sin dejar testigos","cobertura","urban",6],
  ["Supervivencia","Resistencia","Tratar las lesiones y soportar la noche","salud","urban",6],
  ["Trato con Animales","Carisma","Seguir el comportamiento de un animal","pista","urban",6],
  ["Academicismo","Inteligencia","Contrastar una referencia histórica","pista","study",6],
  ["Ciencias","Inteligencia","Examinar los indicios materiales","pista","study",7],
  ["Finanzas","Inteligencia","Rastrear un pago sospechoso","pista","study",7],
  ["Informática","Inteligencia","Cruzar registros informáticos","pista","study",7],
  ["Investigación","Percepción","Reconstruir una secuencia de hechos","pista","study",6],
  ["Leyes","Inteligencia","Estudiar la legalidad de un expediente","influencia","study",7],
  ["Lingüística","Inteligencia","Interpretar un mensaje extranjero","pista","study",7],
  ["Medicina","Inteligencia","Aplicar primeros auxilios","salud","urban",6],
  ["Ocultismo","Inteligencia","Interpretar símbolos ocultos","pista","study",7],
  ["Política","Astucia","Identificar lealtades en la corte","influencia","social",7]
 ].map(([skill,attr,label,reward,scene,difficulty])=>({skill,attr,label,reward,scene,difficulty}));
 const B={
  Aliados:{attr:"Carisma",skill:"Liderazgo",reward:"influencia",message:"Un aliado mortal acepta ayudarte en una gestión delicada."},
  Contactos:{attr:"Percepción",skill:"Callejeo",reward:"pista",message:"Una fuente discreta comparte un dato que no figura en los registros."},
  Criados:{attr:"Carisma",skill:"Liderazgo",reward:"cobertura",message:"Un servidor de confianza se encarga de las tareas comprometedoras."},
  Fama:{attr:"Apariencia",skill:"Expresión",reward:"influencia",message:"Alguien te reconoce y decide escucharte; también puede recordarte."},
  Influencia:{attr:"Manipulación",skill:"Política",reward:"influencia",message:"Tu posición facilita una gestión en instituciones mortales."},
  Recursos:{attr:"Inteligencia",skill:"Finanzas",reward:"cobertura",message:"Tus recursos financian un intermediario y evitan exposición personal."}
 };
 const POWERS={
  Animalismo:{skills:["Trato con Animales","Supervivencia","Alerta"],reward:"pista",text:"Los animales te muestran rastros inadvertidos."},
  Auspex:{skills:["Alerta","Empatía","Investigación","Ocultismo"],reward:"pista",text:"Tus sentidos perciben detalles invisibles para otros."},
  Celeridad:{skills:["Atletismo","Esquivar","Pelea","Sigilo"],reward:"preparacion",text:"Los movimientos de los demás parecen ralentizarse."},
  Dementación:{skills:["Empatía","Intimidación","Subterfugio"],reward:"influencia",risk:5,text:"Las emociones ajenas cambian de forma inquietante."},
  Dominación:{skills:["Subterfugio","Intimidación","Liderazgo"],reward:"influencia",text:"Tu voluntad se impone durante un encuentro limitado."},
  Fortaleza:{skills:["Supervivencia","Esquivar","Pelea"],reward:"cobertura",text:"Tu cuerpo soporta golpes que derrotarían a un mortal."},
  Ofuscación:{skills:["Sigilo","Seguridad","Subterfugio"],reward:"cobertura",text:"Los testigos dejan de reparar en tu presencia."},
  Potencia:{skills:["Pelea","Atletismo","Armas Cuerpo a Cuerpo"],reward:"preparacion",text:"Tu fuerza se vuelve sobrenatural."},
  Presencia:{skills:["Etiqueta","Expresión","Empatía","Liderazgo"],reward:"influencia",text:"Tu magnetismo altera la disposición de los presentes."},
  Protean:{skills:["Supervivencia","Sigilo","Alerta","Trato con Animales"],reward:"cobertura",text:"Los instintos del depredador guían tus sentidos."},
  Taumaturgia:{skills:["Ocultismo","Investigación","Ciencias"],reward:"pista",risk:6,cost:2,text:"La sangre responde a un principio oculto, poniendo en peligro la Mascarada."}
 };
 const PASSIVE={
  Aliados:["Liderazgo","Política","Intimidación"],
  Contactos:["Investigación","Callejeo","Alerta","Informática"],
  Criados:["Pericias","Seguridad","Medicina"],
  Fama:["Expresión","Etiqueta","Interpretación"],
  Influencia:["Leyes","Política","Finanzas"],
  Recursos:["Finanzas","Conducir","Seguridad"]
 };
 const APPLIES={
  pista:["Investigación","Alerta","Callejeo","Ocultismo","Informática","Ciencias","Lingüística","Academicismo","Finanzas"],
  cobertura:["Sigilo","Subterfugio","Esquivar","Seguridad","Conducir","Atletismo"],
  influencia:["Empatía","Etiqueta","Liderazgo","Expresión","Intimidación","Política","Leyes","Interpretación"],
  preparacion:["Pelea","Armas Cuerpo a Cuerpo","Armas de Fuego","Pericias","Supervivencia","Medicina","Atletismo"]
 };
 function init(game){
  let m=game.mechanics||{};
  m.used=m.used||{};
  m.tokens=m.tokens||{pista:0,cobertura:0,influencia:0,preparacion:0};
  for(const name of Object.keys(APPLIES))m.tokens[name]=clamp(+m.tokens[name]||0,0,3);
  m.health=clamp(Number.isFinite(m.health)?m.health:7,0,7);
  m.will=clamp(Number.isFinite(m.will)?m.will:game.character.willpower,0,game.character.willpower);
  m.blood=game.embraced?clamp(Number.isFinite(m.blood)?m.blood:10,0,10):0;
  m.lastNight=m.lastNight||game.clock.night;
  if(!game.embraced)m.power=null;
  game.mechanics=m;return m;
 }
 function mark(game,key){init(game).used[game.clock.night+"|"+key]=true;}
 function used(game,key){return !!init(game).used[game.clock.night+"|"+key];}
 function allowed(game,action){
  const s=game.scene;
  if(action.scene==="urban")return s==="paris"||s==="venue";
  if(action.scene==="social")return s==="venue"||s==="house";
  if(action.scene==="study")return s==="venue"||s==="study";
  return ["house","study","quarters"].includes(s);
 }
 function reward(game,name,n=1){
  const m=init(game);
  if(name==="salud"){
   const healed=clamp(Math.floor(n),0,7-m.health);m.health+=healed;
   if(m.damage){
    let left=healed;
    for(const kind of ["contundente","letal","agravado"]){
     const take=Math.min(m.damage[kind]||0,left);
     m.damage[kind]-=take;left-=take;
    }
   }
  }
  else m.tokens[name]=clamp((m.tokens[name]||0)+n,0,3);
 }
 function modifiers(game,attr,skill){
  const m=init(game),b=game.character.backgrounds||{};
  let passive=0,extra=0;
  const details=[];
  for(const [name,skills] of Object.entries(PASSIVE)){
   if(!skills.includes(skill))continue;
   const bonus=(b[name]||0)>=4?2:(b[name]||0)>=2?1:0;
   if(bonus>passive){passive=bonus;details[0]=name+" +"+bonus;}
  }
  for(const [name,skills] of Object.entries(APPLIES)){
   if(skills.includes(skill)&&m.tokens[name]>0){m.tokens[name]--;extra++;details.push("ventaja "+name+" +1");break;}
  }
  if(m.power&&POWERS[m.power.name]?.skills.includes(skill)){
   extra+=m.power.bonus;details.push(m.power.name+" +"+m.power.bonus);
   m.power.charges--;if(m.power.charges<=0)m.power=null;
  }
  if(m.health===0){extra-=3;details.push("incapacitado -3");}
  else if(m.health<=3){extra--;details.push("heridas -1");}
  if(game.embraced&&m.blood===0){extra-=2;details.push("hambre -2");}
  return {bonus:passive+extra,description:details.join("; ")||"sin modificadores"};
 }
 function actionResult(game,action,roll){
  const m=init(game),key="ability:"+(game.scene==="venue"?game.venue:game.scene)+":"+action.skill;
  if(used(game,key))return null;
  mark(game,key);
  let exposure=0,description="";
  if(roll.success){
   reward(game,action.reward);
   description="Conseguís el objetivo. Ganás "+(action.reward==="salud"?"1 nivel de Salud":"1 ventaja de "+action.reward)+" para próximas decisiones.";
   if(action.skill==="Armas de Fuego")exposure=3;
  }else{
   exposure=action.skill==="Armas de Fuego"?14:4;
   if(["Pelea","Armas Cuerpo a Cuerpo","Armas de Fuego"].includes(action.skill)&&m.tokens.cobertura===0)m.health=clamp(m.health-1,0,7);
   else if(["Pelea","Armas Cuerpo a Cuerpo","Armas de Fuego"].includes(action.skill))m.tokens.cobertura--;
   description="El intento fracasa. Dejás rastros y un combate puede causarte heridas.";
  }
  return {exposure,description};
 }
 function backgroundResult(game,name,success){
  const m=init(game),rank=game.character.backgrounds[name]||0;
  if(rank<1||used(game,"background:"+name))return null;
  mark(game,"background:"+name);
  if(success)reward(game,B[name].reward,Math.max(1,Math.ceil(rank/2)));
  if(success&&name==="Recursos"&&rank>=3)reward(game,"pista");
  if(success&&name==="Criados"&&rank>=3)reward(game,"preparacion");
  return {exposure:!success?5:name==="Fama"?3:0,description:success?B[name].message:"La gestión no prospera y deja un rastro."};
 }
 function powerResult(game,name){
  const m=init(game),level=game.character.disciplines?.[name]||0,p=POWERS[name];
  const cost=p?.cost||1;
  if(!game.embraced||!level||!p||m.blood<cost||used(game,"power:"+name))return null;
  mark(game,"power:"+name);m.blood-=cost;
  m.power={name,bonus:Math.min(3,level),charges:Math.max(1,level)};
  reward(game,p.reward,Math.min(2,level));
  return {exposure:p.risk||0,description:p.text+" Tenés "+m.power.charges+" tirada(s) compatibles potenciadas.",cost};
 }
 function huntResult(game,roll){
  const m=init(game),key="hunt:"+(game.venue||game.scene);
  if(!game.embraced||used(game,key)||m.blood===10)return null;
  mark(game,key);
  if(roll.success){m.blood=clamp(m.blood+Math.max(1,Math.min(3,roll.net)),0,10);return {exposure:2,description:"Te alimentás sin matar a la víctima. Recuperás sangre, pero siempre queda algún riesgo."};}
  m.will=clamp(m.will-1,0,game.character.willpower);
  return {exposure:12,description:"La presa escapa y los testigos advierten movimientos extraños. Perdés 1 Voluntad."};
 }
 function nextNight(game){
  const m=init(game);
  if(m.lastNight!==game.clock.night){m.lastNight=game.clock.night;m.will=Math.min(game.character.willpower,m.will+1);m.power=null;}
 }
 function summary(game){
  const m=init(game),t=m.tokens;
  return "Salud "+m.health+"/7 · Voluntad "+m.will+"/"+game.character.willpower+
   (game.embraced?" · Sangre "+m.blood+"/10":" · Ghoul sin poderes")+
   " · Ventajas: pistas "+t.pista+", cobertura "+t.cobertura+", influencia "+t.influencia+", preparación "+t.preparacion+
   (m.power?" · "+m.power.name+" ("+m.power.charges+" tiradas)":"");
 }
 return {actions:A,backgrounds:B,powers:POWERS,init,used,allowed,modifiers,actionResult,backgroundResult,powerResult,huntResult,nextNight,summary,reward,mark};
})();