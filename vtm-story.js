"use strict";
/* Crónicas de París v0.6 — escenas con alternativas condicionadas por la ficha.
   Contenido original del videojuego; inspirado en la tercera edición, no reproduce poderes canónicos. */
window.VTM_STORY=(()=>{
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 // Cada escena sólo concede la recompensa única una vez. Un fracaso deja reintentar en otra noche.
 const scenes={
  policia:{
   title:"El expediente que no debía existir",
   intro:"El archivista custodia registros nocturnos. Un número de expediente enlaza una desaparición con agentes influyentes de París.",
   paths:[
    {id:"formal",label:"Fundamentar una solicitud legal",attr:"Inteligencia",skill:"Leyes",min:2,diff:6,grant:"policeReference",faction:"camarilla",success:"El archivista comprueba la norma que citás y autoriza una consulta limitada.",failure:"Tu argumento legal es incompleto y el empleado anota tu nombre.",risk:4},
    {id:"system",label:"Cruzar registros informáticos",attr:"Inteligencia",skill:"Informática",min:2,diff:7,grant:"policeReference",success:"Un registro secundario confirma la existencia del expediente desaparecido.",failure:"El sistema registra una consulta inusual; podrían investigar la conexión.",risk:11},
    {id:"influence",label:"Solicitar el expediente a través de una institución",attr:"Manipulación",skill:"Política",background:"Influencia",minBackground:2,diff:6,grant:"policeReference",success:"Un funcionario conocido habilita el acceso administrativo sin preguntas.",failure:"La intervención institucional deja un rastro de favores.",risk:5},
    {id:"shadow",label:"Examinar el pasillo por si hay una copia",attr:"Percepción",skill:"Investigación",diff:8,success:"Encontrás una referencia marginal en un índice olvidado.",failure:"La vigilancia te obliga a abandonar el pasillo precipitadamente.",risk:6},
    {id:"unseen",label:"Pasar inadvertido mediante Ofuscación",attr:"Destreza",skill:"Sigilo",power:"Ofuscación",minPower:1,diff:6,grant:"policeReference",success:"La mirada del empleado se aparta mientras copiás la referencia.",failure:"Un movimiento rompe tu concentración; un testigo te reconoce.",risk:13}
   ]
  },
  stjuly:{
   title:"Susurros entre las mesas del St. July",
   intro:"Un mensajero vinculado a los Tremere ha dejado una referencia en manos de un camarero. La música tapa la conversación.",
   paths:[
    {id:"protocol",label:"Preguntar siguiendo el protocolo",attr:"Carisma",skill:"Etiqueta",min:2,diff:6,grant:"courtReferral",faction:"tremere",success:"El camarero acepta presentar discretamente tu nombre a un intermediario.",failure:"Tu insistencia llega a oídos de quienes custodian la barra.",risk:4},
    {id:"mask",label:"Escuchar haciéndote pasar por un cliente habitual",attr:"Manipulación",skill:"Subterfugio",min:2,diff:7,grant:"courtReferral",success:"Oís el apellido del remitente y reconocés una ruta hacia la corte.",failure:"Un cliente nota que escuchás más de lo que hablás.",risk:8},
    {id:"famous",label:"Aprovechar tu notoriedad en círculos sociales",attr:"Apariencia",skill:"Expresión",background:"Fama",minBackground:2,diff:6,success:"Los invitados te reciben y revelan un secreto social menor.",failure:"Un fotógrafo se interesa demasiado por tu aparición.",risk:10},
    {id:"read",label:"Observar quién evita al mensajero",attr:"Percepción",skill:"Empatía",diff:8,success:"Identificás al invitado que teme ser relacionado con los Tremere.",failure:"Confundís una discusión doméstica con un asunto secreto.",risk:3},
    {id:"aura",label:"Interpretar el ambiente mediante Auspex",attr:"Percepción",skill:"Empatía",power:"Auspex",minPower:1,diff:6,success:"Percibís la tensión de quien guarda una noticia comprometida.",failure:"La multitud de impresiones te confunde y llama la atención.",risk:6}
   ]
  },
  elysee:{
   title:"El favor escondido en la corte",
   intro:"En el Elíseo una pequeña disputa amenaza con convertirse en una ofensa formal. Nadie quiere perder prestigio.",
   paths:[
    {id:"courtesy",label:"Resolver la ofensa con Etiqueta",attr:"Carisma",skill:"Etiqueta",min:2,diff:6,grant:"courtProtocol",faction:"camarilla",success:"La Guardiana admite que conocés las reglas del Elíseo.",failure:"La intervención resulta inoportuna y ambas partes te recuerdan.",risk:3},
    {id:"politics",label:"Reconstruir las alianzas de ambos bandos",attr:"Astucia",skill:"Política",min:2,diff:6,grant:"courtProtocol",faction:"camarilla",success:"Señalás una solución que permite a los dos bandos salvar las apariencias.",failure:"Tus conclusiones provocan desconfianza entre los asistentes.",risk:5},
    {id:"allies",label:"Solicitar mediación de un aliado",attr:"Carisma",skill:"Liderazgo",background:"Aliados",minBackground:2,diff:7,success:"Tu aliado confirma los antecedentes de la disputa y calma la situación.",failure:"La mediación revela que tu respaldo no alcanza para esta corte.",risk:6},
    {id:"observe",label:"Escuchar antes de intervenir",attr:"Percepción",skill:"Empatía",diff:8,success:"Notás qué palabra podría agravar el conflicto y evitás pronunciarla.",failure:"Un comentario aparentemente inocente irrita a uno de los presentes.",risk:3},
    {id:"presence",label:"Calmar a los presentes con Presencia",attr:"Carisma",skill:"Liderazgo",power:"Presencia",minPower:1,diff:7,success:"La atención se concentra en vos y el enfrentamiento se apacigua.",failure:"El magnetismo sobrenatural resulta demasiado notorio.",risk:11}
   ]
  },
  saintdenis:{
   title:"La discusión a punto de estallar",
   intro:"Un joven mortal queda atrapado entre matones que esperan que alguien dé el primer golpe.",
   paths:[
    {id:"mediate",label:"Mediar sin recurrir a amenazas",attr:"Carisma",skill:"Empatía",min:2,diff:6,grant:"brujahContact",faction:"brujah",success:"Los matones se separan y el joven puede marcharse ileso.",failure:"Un agresor se burla de tu intervención y aumenta el tumulto.",risk:5},
    {id:"defend",label:"Interponerte y contener al agresor",attr:"Destreza",skill:"Pelea",min:2,diff:7,grant:"brujahContact",faction:"brujah",success:"Desarmás al agresor sin dañar al muchacho.",failure:"Recibís un golpe antes de contener la pelea.",risk:11,injury:1},
    {id:"street",label:"Convocar gente de confianza del barrio",attr:"Manipulación",skill:"Callejeo",background:"Contactos",minBackground:2,diff:6,success:"Conseguís testigos que acompañan al joven hasta una calle segura.",failure:"Los agresores identifican a tus conocidos.",risk:7},
    {id:"threat",label:"Amenazar con violencia para despejar la calle",attr:"Manipulación",skill:"Intimidación",diff:7,moral:1,success:"Los hostigadores huyen, pero los testigos recordarán tus amenazas.",failure:"La provocación deriva en una persecución.",risk:16,successRisk:9},
    {id:"potence",label:"Mostrar fuerza sobrenatural con Potencia",attr:"Fuerza",skill:"Pelea",power:"Potencia",minPower:1,diff:6,moral:1,success:"El grupo retrocede al ver tu fuerza inhumana.",failure:"Perdés control de la escena y ponés en riesgo la Mascarada.",risk:20,successRisk:12}
   ]
  },
  tuneles:{
   title:"Un rumor enterrado bajo París",
   intro:"Un informante de Ingrid teme que alguien haya descubierto una entrada a la red Nosferatu.",
   paths:[
    {id:"streets",label:"Reconstruir el itinerario del informante",attr:"Astucia",skill:"Callejeo",min:2,diff:6,grant:"tunnelContact",faction:"nosferatu",success:"Descubrís la ruta segura y podés advertir a la red.",failure:"Tu consulta alerta a otro grupo que también busca al informante.",risk:7},
    {id:"terminal",label:"Comparar las grabaciones de un terminal",attr:"Inteligencia",skill:"Informática",min:2,diff:7,grant:"tunnelContact",faction:"nosferatu",success:"Las horas de ingreso confirman la presencia de un desconocido.",failure:"El terminal deja constancia de un acceso no autorizado.",risk:5},
    {id:"contacts",label:"Preguntar a tus Contactos subterraneos",attr:"Percepción",skill:"Investigación",background:"Contactos",minBackground:2,diff:6,grant:"tunnelContact",success:"La red comparte un nombre comprometido con el incidente.",failure:"Tu contacto no confía en el propósito de la consulta.",risk:4},
    {id:"track",label:"Examinar huellas junto al conducto",attr:"Percepción",skill:"Alerta",diff:8,success:"Encontrás marcas recientes cerca de un acceso oculto.",failure:"La humedad borró las huellas y perdés tiempo.",risk:2},
    {id:"beasts",label:"Consultar a las ratas mediante Animalismo",attr:"Carisma",skill:"Trato con Animales",power:"Animalismo",minPower:1,diff:6,grant:"tunnelContact",success:"Una inquietud en las ratas indica por dónde pasó el intruso.",failure:"Los animales se dispersan antes de ofrecer una pista clara.",risk:5}
   ]
  },
  passy:{
   title:"El símbolo en la biblioteca de Passy",
   intro:"Un sello de correspondencia está junto a una referencia ritual. Tocarlo sin permiso podría tener consecuencias.",
   paths:[
    {id:"occult",label:"Interpretar el sello sin tocarlo",attr:"Inteligencia",skill:"Ocultismo",min:2,diff:6,grant:"tremereReference",faction:"tremere",success:"Reconocés el valor del sello y comunicás un dato preciso al regente.",failure:"Interpretás un símbolo secundario como si fuera central.",risk:6,terror:true},
    {id:"tools",label:"Examinar las herramientas del custodio",attr:"Inteligencia",skill:"Pericias",min:2,diff:7,success:"Deducís cómo conservar el objeto sin dañar el lacre.",failure:"Una marca accidental obliga al custodio a revisar el depósito.",risk:8},
    {id:"formal",label:"Solicitar autorización por Etiqueta",attr:"Carisma",skill:"Etiqueta",min:2,diff:6,grant:"tremereReference",success:"La documentación llega por vía correcta y sin violar el sello.",failure:"Tu petición queda a consideración de un superior ausente.",risk:3},
    {id:"watch",label:"Observar las señales del archivo",attr:"Percepción",skill:"Alerta",diff:8,success:"Advertís que alguien ha colocado un libro donde no corresponde.",failure:"Confundís una sombra con movimiento en la biblioteca.",risk:2},
    {id:"thaum",label:"Percibir la resonancia de sangre",attr:"Inteligencia",skill:"Ocultismo",power:"Taumaturgia",minPower:1,diff:7,grant:"tremereReference",success:"Detectás una anomalía que cambia la interpretación del sello.",failure:"El intento deja un signo sobrenatural ante otros Vástagos.",risk:12,successRisk:4,terror:true}
   ]
  },
  bastilla:{
   title:"Los nombres en la lista de Bastilla",
   intro:"Lucien quiere conocer quién está usando a los Brujah para fomentar un enfrentamiento innecesario.",
   paths:[
    {id:"lead",label:"Convencer a los presentes de hablar",attr:"Carisma",skill:"Liderazgo",min:2,diff:6,grant:"brujahContact",faction:"brujah",success:"Un testigo confirma quién provocó la discusión original.",failure:"Nadie desea arriesgarse por vos.",risk:4},
    {id:"street",label:"Investigar entre vecinos del barrio",attr:"Astucia",skill:"Callejeo",min:2,diff:6,grant:"brujahContact",success:"Una descripción coincide con la de un provocador conocido.",failure:"Te señalan como alguien que hace preguntas para la Camarilla.",risk:6},
    {id:"ally",label:"Pedir a un aliado que contraste nombres",attr:"Manipulación",skill:"Política",background:"Aliados",minBackground:2,diff:7,success:"El aliado separa los rumores de las personas realmente implicadas.",failure:"La colaboración se demora y otras facciones se enteran.",risk:6},
    {id:"observe",label:"Leer el comportamiento de la multitud",attr:"Percepción",skill:"Empatía",diff:8,success:"Reconocés quién teme que la verdad salga a la luz.",failure:"Una discusión banal te distrae de los hechos.",risk:3},
    {id:"domination",label:"Forzar una confesión usando Dominación",attr:"Manipulación",skill:"Intimidación",power:"Dominación",minPower:1,diff:7,moral:1,success:"La confesión llega de forma inquietantemente automática.",failure:"El testigo se resiste y advierte que algo no es natural.",risk:13,successRisk:6}
   ]
  },
  hemeroteca:{
   title:"El recorte que Pierre Dupont escondió",
   intro:"Los números de archivo no coinciden con las fotografías públicas. Dupont conserva una copia en un lugar reservado.",
   paths:[
    {id:"research",label:"Contrastar el índice de publicaciones",attr:"Inteligencia",skill:"Investigación",min:2,diff:6,grant:"pressContact",success:"Hallás una fecha imposible de explicar con el informe publicado.",failure:"Una consulta repetida despierta sospechas entre los archiveros.",risk:5},
    {id:"press",label:"Rastrear los archivos digitales",attr:"Inteligencia",skill:"Informática",min:2,diff:7,grant:"pressContact",success:"Una copia de seguridad revela quién alteró la referencia.",failure:"La sesión expira y un encargado revisa los accesos.",risk:6},
    {id:"contacts",label:"Consultar a una fuente periodística",attr:"Carisma",skill:"Expresión",background:"Contactos",minBackground:2,diff:6,success:"Una fuente confirma que Dupont ha recibido amenazas.",failure:"El informante no quiere ser relacionado con vos.",risk:4},
    {id:"observe",label:"Examinar la sala en busca de contradicciones",attr:"Percepción",skill:"Alerta",diff:8,success:"Percibís un detalle que alguien intentó borrar de un recorte.",failure:"El archivero interpreta tu recorrido como una intrusión.",risk:6},
    {id:"auspex",label:"Agudizar los sentidos con Auspex",attr:"Percepción",skill:"Investigación",power:"Auspex",minPower:1,diff:6,success:"Reconocés una alteración reciente que nadie había advertido.",failure:"Tus sentidos se saturan en la biblioteca abarrotada.",risk:4}
   ]
  }
 };
 function init(g){
  if(!g.story||typeof g.story!=="object")g.story={};
  g.story.locations=g.story.locations||{};
  g.story.history=Array.isArray(g.story.history)?g.story.history:[];
  g.story.xp=Number.isFinite(g.story.xp)?Math.max(0,Math.floor(g.story.xp)):0;
  g.story.totalXp=Number.isFinite(g.story.totalXp)?Math.max(g.story.xp,g.story.totalXp):g.story.xp;
  g.story.virtueChecks=g.story.virtueChecks||{};
  g.character.humanity=clamp(Number.isFinite(g.character.humanity)?g.character.humanity:7,0,10);
  return g.story;
 }
 function qualifications(g,path){
  if(path.min&&((g.character.skills?.[path.skill]||0)<path.min))return "Requiere "+path.skill+" "+path.min;
  if(path.background&&(g.character.backgrounds?.[path.background]||0)<path.minBackground)return "Requiere "+path.background+" "+path.minBackground;
  if(path.power&&(!g.embraced||(g.character.disciplines?.[path.power]||0)<(path.minPower||1)))return "Requiere "+path.power+" y el Abrazo";
  if(path.power&&(g.mechanics?.blood||0)<(path.power==="Taumaturgia"?2:1))return "Sangre insuficiente";
  return null;
 }
 function canAttempt(g,place,path){
  init(g);
  const status=g.story.locations[place];
  if(!scenes[place]||!path)return "Escena inexistente";
  if(status?.success)return "Escena resuelta";
  if(status?.night===g.clock.night)return "Ya intentaste resolverla esta noche";
  return qualifications(g,path);
 }
 function resolve(g,place,id,roll){
  init(g);
  const scene=scenes[place],path=scene?.paths.find(p=>p.id===id);
  if(!path||canAttempt(g,place,path))return null;
  if(path.power)g.mechanics.blood-=path.power==="Taumaturgia"?2:1;
  const good=!!roll.success;
  g.story.locations[place]={night:g.clock.night,success:good,method:id};
  const xp=good?2:0;
  if(xp){g.story.xp+=xp;g.story.totalXp+=xp;}
  if(good&&path.grant){g.access=g.access||{};g.access[path.grant]=true;}
  const out={success:good,text:good?path.success:path.failure,
   exposure:good?(path.successRisk||0):(path.risk||4),
   faction:good?path.faction:null,trust:good?1:-1,
   injury:!good?(path.injury||0):0,experience:xp,
   moral:good?(path.moral||0):0,terror:!!path.terror,
   path,place};
  g.story.history.unshift({night:g.clock.night,place,method:id,success:good});
  g.story.history=g.story.history.slice(0,24);
  return out;
 }
 function xpPrice(character,category,name,embraced){
  const obj=category==="Atributo"?character.attr:category==="Habilidad"?character.skills:
   category==="Disciplina"?character.disciplines:category==="Virtud"?character.virtues:null;
  const cur=obj?obj[name]||0:category==="Humanidad"?character.humanity:category==="Voluntad"?character.willpower:0;
  if(cur>= (category==="Humanidad"||category==="Voluntad"?10:5))return null;
  if(category==="Disciplina"){
   if(!embraced)return null;
   return cur===0?10:cur*5;
  }
  if(category==="Atributo")return cur*4;
  if(category==="Habilidad")return cur===0?3:cur*2;
  if(category==="Virtud")return cur*2;
  if(category==="Humanidad")return cur*2;
  if(category==="Voluntad")return cur;
  return null;
 }
 function improve(g,category,name){
  const s=init(g),c=g.character,price=xpPrice(c,category,name,g.embraced);
  const target={Atributo:c.attr,Habilidad:c.skills,Virtud:c.virtues,Disciplina:c.disciplines}[category];
  if(category==="Disciplina"&&!Object.keys(c.disciplines||{}).includes(name) &&
     !["Brujah","Toreador","Ventrue","Malkavian","Gangrel","Nosferatu","Tremere"].includes(c.clan))return null;
  if(price===null||!price||s.xp<price)return null;
  if(target){
   if(!(name in target) && category!=="Disciplina")return null;
   target[name]=(target[name]||0)+1;
   if(category==="Virtud"){
    if(name==="Coraje")c.willpower=Math.max(c.willpower,c.virtues.Coraje);
    if(name==="Conciencia"||name==="Autocontrol")c.humanity=Math.min(10,c.humanity+1);
   }
  }else if(category==="Humanidad")c.humanity++;
  else if(category==="Voluntad")c.willpower++;
  else return null;
  s.xp-=price;
  s.history.unshift({night:g.clock.night,training:category+" "+name,price});
  return {cost:price,remaining:s.xp,value:target?target[name]:category==="Humanidad"?c.humanity:c.willpower};
 }
 function virtueRoll(g,name,difficulty=6,rng=Math.random){
  const count=clamp(g.character.virtues?.[name]||1,1,5);
  const dice=Array.from({length:count},()=>Math.floor(rng()*10)+1);
  const hits=dice.filter(x=>x>=difficulty).length,ones=dice.filter(x=>x===1).length;
  return {dice,net:Math.max(0,hits-ones),success:hits>ones,trait:name,difficulty};
 }
 function moralTest(g,severity=1,rng=Math.random){
  init(g);
  const roll=virtueRoll(g,"Conciencia",Math.min(9,6+severity),rng);
  if(!roll.success)g.character.humanity=clamp(g.character.humanity-1,0,10);
  return {roll,degeneration:!roll.success,humanity:g.character.humanity};
 }
 function frenzyTest(g,rng=Math.random){
  if(!g.embraced||(g.mechanics?.blood||0)>2)return null;
  const roll=virtueRoll(g,"Autocontrol",7,rng);
  if(!roll.success){
   g.story.frenzyNight=g.clock.night;
   g.mechanics.will=Math.max(0,g.mechanics.will-1);
  }
  return {roll,frenzy:!roll.success};
 }
 function fearTest(g,rng=Math.random){
  const roll=virtueRoll(g,"Coraje",6,rng);
  if(!roll.success)g.mechanics.will=Math.max(0,g.mechanics.will-1);
  return {roll,afraid:!roll.success};
 }
 return {scenes,init,qualifications,canAttempt,resolve,xpPrice,improve,virtueRoll,moralTest,frenzyTest,fearTest};
})();