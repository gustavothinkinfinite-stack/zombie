"use strict";
/* Crónicas de París v0.9 — economía ficticia para el videojuego.
   Precios en euros de juego; Recursos facilita el comercio sin sustituir su Trasfondo. */
window.VTM_ECONOMY=(()=>{
 const EQ=window.VTM_EQUIPMENT, M=window.VTM_MECHANICS;
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const PRICE=Object.freeze({barra:34,cuchillo:52,pistola:250,municion:36,chaleco:120,botiquin:48,
  rumor:24,cover:38,favor:42});
 const LABEL=Object.freeze({rumor:"Información del barrio",cover:"Servicio de discreción",favor:"Presentación comercial"});
 const STOCK=Object.freeze({
  taller:["barra","cuchillo","botiquin","rumor"],
  cafe:["botiquin","rumor","cover"],
  oficina:["chaleco","botiquin","rumor","favor"],
  galeria:["rumor","cover","favor"],
  libros:["rumor","favor","botiquin"],
  flores:["cover","favor","botiquin"],
  almacen:["barra","municion","botiquin","rumor"],
  anticuario:["cuchillo","rumor","favor"]
 });
 function init(game){
  if(!game||!game.character)throw Error("Partida inválida");
  const r=clamp(Number(game.character.backgrounds?.Recursos)||0,0,5);
  const e=game.economy&&typeof game.economy==="object"&&!Array.isArray(game.economy)?game.economy:{};
  if(!e.initialized){
   // Fondos iniciales establecidos sólo una vez, incluso en guardados antiguos.
   e.cash=30+r*38;
   e.initialized=true;
   e.lastIncomeNight=game.clock?.night||1;
  }
  e.cash=clamp(Math.round(Number(e.cash)||0),0,9999);
  e.lastIncomeNight=clamp(Math.floor(Number(e.lastIncomeNight)||1),1,99999);
  e.purchases=e.purchases&&typeof e.purchases==="object"?e.purchases:{};
  e.rewards=e.rewards&&typeof e.rewards==="object"?e.rewards:{};
  e.ledger=Array.isArray(e.ledger)?e.ledger.slice(-60):[];
  game.economy=e;return e;
 }
 function ledger(game,reason,delta){
  const e=init(game),previous=e.cash;
  e.cash=clamp(e.cash+Math.round(delta),0,9999);
  const applied=e.cash-previous;
  if(applied)e.ledger.unshift({night:game.clock?.night||1,reason,amount:applied,balance:e.cash});
  e.ledger=e.ledger.slice(0,60);
  return applied;
 }
 function creditOnce(game,key,amount,reason){
  if(!key||!Number.isFinite(amount)||amount<0)return 0;
  const e=init(game);
  if(e.rewards[key])return 0;
  e.rewards[key]=true;
  return ledger(game,reason||"Pago recibido",Math.floor(amount));
 }
 function nextNight(game){
  const e=init(game),now=game.clock?.night||1;
  if(now<=e.lastIncomeNight)return 0;
  const r=clamp(Number(game.character.backgrounds?.Recursos)||0,0,5);
  // Subsistencia por noche, limitada a tres noches acumuladas para evitar abuso de reloj.
  const paid=(r?4+r*6:0)*Math.min(3,now-e.lastIncomeNight);
  e.lastIncomeNight=now;
  return paid?ledger(game,"Ingresos del Trasfondo Recursos",paid):0;
 }
 function stockFor(shop){
  const base=STOCK[shop?.kind]||["rumor","favor"];
  // No se ofrecen armas de fuego en tiendas comunes.
  return base;
 }
 function allowed(game,shop,id){
  const e=init(game),gear=EQ.init(game);
  if(game.combat?.active)return "En combate no se puede comprar";
  if(game.scene!=="sidevenue"||game.sidevenue!==shop?.id)return "Tenés que hablar con el encargado";
  if(!stockFor(shop).includes(id))return "El establecimiento no ofrece esto";
  if(!PRICE[id])return "Artículo desconocido";
  if(EQ.ITEMS[id]&&EQ.ITEMS[id].type!=="supply"&&gear.owned.includes(id))return "Ya poseés este objeto";
  if(id==="botiquin"&&gear.kits>=5)return "Máximo de botiquines";
  if(id==="municion"&&gear.ammo>=90)return "Máximo de munición";
  if(id==="municion"&&!(gear.owned.includes("pistola")||game.character.backgrounds?.Aliados>=2))
   return "Necesitás una pistola o Aliados 2";
  const key=shop.id+"|"+id;
  const night=game.clock?.night||1;
  if(e.purchases[id==="rumor"?key:night+"|"+key])return "Sin más existencias esta noche";
  const trust=game.localPlaces?.[shop.id]?.decision;
  if(trust==="pressure"&&(id==="favor"||id==="cover"))return "El encargado no quiere colaborar";
  return null;
 }
 function price(game,shop,id){
  if(!PRICE[id])return null;
  const r=clamp(Number(game.character.backgrounds?.Recursos)||0,0,5);
  const finance=clamp(Number(game.character.skills?.Finanzas)||0,0,5);
  const state=game.localPlaces?.[shop?.id]?.decision;
  const discount=clamp((r>=3?0.07:0)+(finance>=2?0.05:0)+(state==="help"?0.10:0),0,0.25);
  return Math.max(1,Math.ceil(PRICE[id]*(1-discount)));
 }
 function goods(game,shop){
  return stockFor(shop).map(id=>({id,name:EQ.ITEMS[id]?.name||LABEL[id]||id,price:price(game,shop,id),
   reason:allowed(game,shop,id)}));
 }
 function purchase(game,shop,id){
  const reason=allowed(game,shop,id);if(reason)return {error:reason};
  const e=init(game),cost=price(game,shop,id);
  if(e.cash<cost)return {error:"Fondos insuficientes: se necesitan "+cost+" €, disponibles "+e.cash+" €"};
  const amount=ledger(game,"Compra en "+shop.name+": "+id,-cost);
  if(amount!==-cost)return {error:"No se pudo registrar el pago"};
  const g=EQ.init(game),item=EQ.ITEMS[id];
  const key=shop.id+"|"+id,night=game.clock?.night||1;
  e.purchases[id==="rumor"?key:night+"|"+key]=true;
  if(item?.type==="weapon"||item?.type==="armor"){g.owned.push(id);if(id==="pistola")g.magazine=6;}
  if(id==="botiquin")g.kits++;
  if(id==="municion")g.ammo=clamp(g.ammo+6,0,90);
  let result="Obtuviste "+(item?.name||LABEL[id])+".";
  if(id==="rumor"){
   game.localClues=game.localClues||[];
   if(!game.localClues.includes(shop.id))game.localClues.push(shop.id);
   M.reward(game,"pista",1);result+=" "+shop.clue+" Ganaste una ventaja de pista.";
  }else if(id==="cover"){
   M.reward(game,"cobertura",2);result+=" Obtuviste dos ventajas de cobertura.";
  }else if(id==="favor"){
   M.reward(game,"influencia",1);result+=" Recibiste una ventaja de influencia.";
  }
  return {ok:true,item:id,cost,remaining:e.cash,description:result};
 }
 function sellable(game){
  const g=EQ.init(game);
  return g.owned.filter(id=>id!==g.equipped&&(!EQ.ITEMS[id]||EQ.ITEMS[id].type!=="armor"||!g.armor)&&PRICE[id]);
 }
 function sell(game,shop,id){
  const e=init(game),g=EQ.init(game);
  if(game.combat?.active||game.scene!=="sidevenue"||game.sidevenue!==shop?.id)return {error:"Necesitás estar en una tienda y fuera de combate"};
  if(!sellable(game).includes(id))return {error:"No podés vender un objeto que no poseés o tenés equipado"};
  const earned=Math.floor(PRICE[id]*0.4);
  const i=g.owned.indexOf(id);g.owned.splice(i,1);
  if(id==="pistola"){g.ammo=clamp(g.ammo+g.magazine,0,90);g.magazine=0;}
  ledger(game,"Venta de "+id+" a "+shop.name,earned);
  return {ok:true,earned,description:"Vendiste "+EQ.ITEMS[id].name+" por "+earned+" €. Saldo: "+e.cash+" €."};
 }
 function summary(game){
  const e=init(game);
  const r=Number(game.character.backgrounds?.Recursos)||0;
  return "Fondos "+e.cash+" € · Recursos "+r+" círculos · ingreso nocturno "+(r?4+r*6:0)+" €";
 }
 return {PRICE,STOCK,init,creditOnce,nextNight,goods,allowed,price,purchase,sellable,sell,summary};
})();