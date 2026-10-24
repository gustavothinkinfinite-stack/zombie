"use strict";
/* Crónicas de París v0.8 — equipamiento, recursos y munición, persistentes.
   Economía abstracta de Trasfondos: sin dinero imaginario ni armas gratuitas. */
window.VTM_EQUIPMENT=(()=>{
 const ITEMS=Object.freeze({
  barra:{name:"Barra metálica",type:"weapon",style:"arma",skill:"Armas Cuerpo a Cuerpo",damage:"contundente",bonus:1,description:"Herramienta pesada encontrada en un taller."},
  cuchillo:{name:"Cuchillo",type:"weapon",style:"arma",skill:"Armas Cuerpo a Cuerpo",damage:"letal",bonus:1,description:"Hoja corta de uso cercano."},
  pistola:{name:"Pistola compacta",type:"weapon",style:"disparo",skill:"Armas de Fuego",damage:"letal",bonus:3,magazine:6,description:"Arma de fuego con cargador limitado; los disparos pueden dejar testigos."},
  municion:{name:"Munición (6 cartuchos)",type:"supply",quantity:6,description:"Recarga para el arma de fuego; nunca es ilimitada."},
  chaleco:{name:"Chaleco protector",type:"armor",soak:2,description:"Añade dos dados de absorción de daño contundente y letal."},
  botiquin:{name:"Botiquín de campaña",type:"supply",description:"Permite tratar dos puntos de daño contundente o uno letal según Medicina."}
 });
 const OFFERS={
  saintdenis:[
   {item:"barra",attr:"Percepción",skill:"Investigación",rank:1,background:null,place:"Taller de Saint-Denis",risk:1},
   {item:"botiquin",attr:"Inteligencia",skill:"Medicina",rank:2,background:"Recursos",backgroundRank:1,place:"Comercio del barrio",risk:0}
  ],
  bastilla:[
   {item:"cuchillo",attr:"Astucia",skill:"Callejeo",rank:2,background:"Recursos",backgroundRank:1,place:"Puesto nocturno",risk:3},
   {item:"pistola",attr:"Manipulación",skill:"Callejeo",rank:3,background:"Contactos",backgroundRank:3,place:"Intermediario clandestino",risk:12},
   {item:"municion",attr:"Carisma",skill:"Callejeo",rank:2,background:"Contactos",backgroundRank:2,place:"Intermediario de confianza",risk:4}
  ],
  passy:[
   {item:"chaleco",attr:"Inteligencia",skill:"Finanzas",rank:2,background:"Recursos",backgroundRank:3,place:"Proveedor especializado",risk:0},
   {item:"botiquin",attr:"Inteligencia",skill:"Medicina",rank:1,background:"Recursos",backgroundRank:1,place:"Farmacia de guardia",risk:0}
  ],
  policia:[
   {item:"pistola",attr:"Carisma",skill:"Liderazgo",rank:2,background:"Aliados",backgroundRank:3,place:"Armería autorizada",risk:2},
   {item:"municion",attr:"Manipulación",skill:"Política",rank:2,background:"Influencia",backgroundRank:2,place:"Proveedor institucional",risk:2}
  ],
  stjuly:[
   {item:"botiquin",attr:"Inteligencia",skill:"Medicina",rank:2,background:"Recursos",backgroundRank:1,place:"Servicio de primera ayuda",risk:0}
  ]
 };
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function init(game){
  const o=game.equipment&&typeof game.equipment==="object"?game.equipment:{};
  o.owned=Array.isArray(o.owned)?[...new Set(o.owned.filter(x=>ITEMS[x]&&ITEMS[x].type!=="supply"))]:[];
  o.equipped=ITEMS[o.equipped]?.type==="weapon"&&o.owned.includes(o.equipped)?o.equipped:null;
  o.armor=o.owned.includes("chaleco")&&!!o.armor;
  o.ammo=clamp(Math.floor(Number(o.ammo)||0),0,90);
  o.magazine=clamp(Math.floor(Number(o.magazine)||0),0,ITEMS.pistola.magazine);
  o.kits=clamp(Math.floor(Number(o.kits)||0),0,5);
  o.acquired=o.acquired&&typeof o.acquired==="object"?o.acquired:{};
  o.history=Array.isArray(o.history)?o.history.slice(-35):[];
  game.equipment=o;return o;
 }
 function summary(game){
  const e=init(game);
  return "Equipo: "+(e.equipped?ITEMS[e.equipped].name:"sin arma equipada")+
    (e.armor?" · chaleco":"")+
    " · munición "+e.magazine+" cargada / "+e.ammo+" reserva · botiquines "+e.kits+
    " · pertenencias "+e.owned.map(k=>ITEMS[k].name).join(", ");
 }
 function available(game,offer){
  const e=init(game),item=ITEMS[offer.item];
  if(game.combat?.active)return "No se puede conseguir equipo en combate";
  if(game.scene!=="venue"||!(OFFERS[game.venue]||[]).some(x=>x.item===offer.item&&x.skill===offer.skill))return "Necesitás visitar el establecimiento apropiado";
  if(item.type!=="supply"&&e.owned.includes(offer.item))return "Ya lo tenés";
  if(e.acquired[game.clock.night+"|"+offer.item])return "Ya intentaste conseguirlo esta noche";
  if(offer.item==="botiquin"&&e.kits>=5)return "Ya llevás el máximo de botiquines";
  if(offer.item==="municion"&&e.ammo>=90)return "Reserva de munición completa";
  if((game.character.skills?.[offer.skill]||0)<offer.rank)return "Requiere "+offer.skill+" "+offer.rank;
  if(offer.background&&(game.character.backgrounds?.[offer.background]||0)<offer.backgroundRank)return "Requiere "+offer.background+" "+offer.backgroundRank;
  if(offer.item==="pistola"&&(game.character.skills?.["Armas de Fuego"]||0)<1)return "Requiere Armas de Fuego 1";
  return null;
 }
 function offers(game,place){
  return (OFFERS[place]||[]).map(o=>({...o,blocked:available(game,o)}));
 }
 function acquire(game,place,id,rolled){
  const offer=(OFFERS[place]||[]).find(x=>x.item===id);
  if(!offer)return {error:"No hay una fuente de equipo aquí."};
  if(game.scene!=="venue"||game.venue!==place)return {error:"No estás en ese establecimiento."};
  const reason=available(game,offer);
  if(reason)return {error:reason};
  if(!rolled||typeof rolled.success!=="boolean")return {error:"Falta la tirada de adquisición."};
  const e=init(game),item=ITEMS[id];
  // Tanto el éxito como el fracaso gastan la oportunidad de la noche; no hay tiradas ilimitadas.
  e.acquired[game.clock.night+"|"+id]=true;
  const info={success:!!rolled.success,item:id,name:item.name,exposure:rolled.success?offer.risk:offer.risk+6};
  if(rolled.success){
   if(item.type==="weapon"||item.type==="armor")e.owned.push(id);
   if(id==="pistola")e.magazine=6;
   if(id==="municion")e.ammo=clamp(e.ammo+6,0,90);
   if(id==="botiquin")e.kits=clamp(e.kits+1,0,5);
  }
  e.history.push({night:game.clock.night,place,id,success:!!rolled.success});
  e.history=e.history.slice(-35);
  return info;
 }
 function equip(game,id){
  const e=init(game),item=ITEMS[id];
  if(game.combat?.active)return {error:"Cambiá el equipo fuera de combate."};
  if(id==="sinarma"){e.equipped=null;return {ok:true,name:"Manos libres"};}
  if(!item||!e.owned.includes(id))return {error:"No tenés ese objeto."};
  if(item.type==="weapon"){e.equipped=id;return {ok:true,name:item.name};}
  if(item.type==="armor"){e.armor=!e.armor;return {ok:true,name:item.name+(e.armor?" equipado":" guardado")};}
  return {error:"Objeto no equipable."};
 }
 function moveAllowed(game,move){
  const e=init(game);
  if(move==="golpe"||move==="esquiva"||move==="huida")return null;
  if(move==="arma"){
   if(!e.equipped||ITEMS[e.equipped]?.style!=="arma")return "Equipá primero un arma cuerpo a cuerpo desde Inventario";
  }
  if(move==="disparo"){
   if(e.equipped!=="pistola")return "Equipá una pistola desde Inventario";
   if(!e.magazine)return "Cargador vacío: recargá antes de disparar";
   if(!(game.character.skills?.["Armas de Fuego"]>0))return "No conocés Armas de Fuego";
  }
  return null;
 }
 function useAmmo(game){
  const e=init(game);
  if(e.equipped!=="pistola"||e.magazine<=0)return false;
  e.magazine--;return true;
 }
 function reload(game){
  const e=init(game);
  if(e.equipped!=="pistola")return {error:"Equipá primero una pistola."};
  if(e.ammo<=0)return {error:"No tenés munición de reserva."};
  if(e.magazine===6)return {error:"El cargador ya está completo."};
  const count=Math.min(6-e.magazine,e.ammo);
  e.magazine+=count;e.ammo-=count;
  return {ok:true,loaded:count,magazine:e.magazine,reserve:e.ammo};
 }
 function treat(game,tactics){
  const e=init(game);
  if(game.combat?.active)return {error:"No podés aplicar el botiquín durante un turno de combate."};
  if(e.kits<1)return {error:"No te quedan botiquines."};
  if((game.character.skills?.Medicina||0)<1)return {error:"Necesitás Medicina 1 para aplicar el botiquín."};
  const m=game.mechanics||{};
  if((Number.isFinite(m.health)?m.health:7)>=7)return {error:"No tenés heridas que tratar."};
  const isLethal=(m.damage?.letal||0)>0;
  if((m.damage?.agravado||0)>0&&(m.damage?.contundente||0)===0&&!isLethal)
   return {error:"El daño agravado no puede curarse con este botiquín."};
  const actual=tactics.recover(game,isLethal?1:2,isLethal?"letal":"contundente");
  if(!actual)return {error:"Necesitás atención especializada."};
  e.kits--;
  return {ok:true,healed:actual,remaining:e.kits};
 }
 return {ITEMS,OFFERS,init,summary,available,offers,acquire,equip,moveAllowed,useAmmo,reload,treat};
})();