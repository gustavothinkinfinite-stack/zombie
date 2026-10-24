"use strict";
/* V0.9: comercio integrado en los establecimientos secundarios de París. */
window.VTM_ECONOMY_UI=(()=>{
 const E=window.VTM_ECONOMY,Q=window.VTM_EQUIPMENT,K=window.VTM_SHOPS;
 let bridge;
 function bind(api){bridge=api;}
 function game(){return bridge?.getGame();}
 function ask(title,description,buttons,heading="ECONOMÍA"){bridge.ask(title,description,buttons,heading);}
 function currentShop(){
  const g=game();if(!g||g.scene!=="sidevenue")return null;
  return K.byId[g.sidevenue]||null;
 }
 function wallet(){
  const g=game();if(!g)return;
  const e=E.init(g),shop=currentShop();
  const last=e.ledger.slice(0,8).map(x=>"Noche "+x.night+": "+(x.amount>=0?"+":"")+x.amount+" € — "+x.reason).join("\n");
  const buttons=[];
  if(shop)buttons.push({label:"Negociar con "+shop.keeper,action:()=>market(shop)});
  buttons.push({label:"Volver a Acciones",action:()=>bridge.actions()});
  ask("Fondos y operaciones",E.summary(g)+"\n\nMovimientos recientes:\n"+(last||"Todavía no hay movimientos registrados.")+
   "\n\nLos ingresos de Recursos se reciben una sola vez al comenzar cada noche. Cobrar por completar un encargo también es una operación única.",
   buttons,"DINERO Y RECURSOS");
 }
 function market(shop){
  const g=game();
  if(!g||g.scene!=="sidevenue"||g.sidevenue!==shop?.id){wallet();return;}
  ask("Comercio: "+shop.name,
   shop.keeper+" te atiende.\n\n"+E.summary(g)+
   "\n\nLos precios se reducen ligeramente si poseés Finanzas, Recursos elevados o ayudaste previamente al encargado. Los suministros tienen existencias limitadas.",
   [{label:"Comprar artículos y servicios",action:()=>buy(shop)},
    {label:"Vender un objeto que no esté equipado",action:()=>sell(shop)},
    {label:"Consultar el saldo y movimientos",action:wallet},
    {label:"Despedirte",action:()=>{}}],"COMERCIO NOCTURNO");
 }
 function buy(shop){
  const g=game();if(!g||g.scene!=="sidevenue"||g.sidevenue!==shop.id)return;
  const opts=E.goods(g,shop).map(offer=>({
   label:offer.name+" · "+offer.price+" €"+(offer.reason?" · "+offer.reason:""),
   disabled:!!offer.reason||E.init(g).cash<offer.price,
   action:()=>buyItem(shop,offer.id)
  }));
  opts.push({label:"Volver",action:()=>market(shop)});
  ask("Mercancías de "+shop.name,"Saldo disponible: "+E.init(g).cash+" €. Las compras consumen dinero, modifican el inventario y quedan registradas.",opts,"MOSTRADOR");
 }
 function buyItem(shop,id){
  const g=game();if(!g||g.scene!=="sidevenue"||g.sidevenue!==shop.id)return;
  const res=E.purchase(g,shop,id);
  if(res.ok){
   bridge.log(res.description);
   bridge.advance(5);bridge.refresh();bridge.save();
  }
  ask(res.ok?"Compra realizada":"No se pudo comprar",
   res.description||res.error,
   [{label:"Seguir comprando",action:()=>buy(shop)},{label:"Cerrar comercio",action:()=>{}}],
   "TRANSACCIÓN");
 }
 function sell(shop){
  const g=game();if(!g||g.scene!=="sidevenue"||g.sidevenue!==shop.id)return;
  const stock=E.sellable(g),opts=stock.map(id=>({
   label:"Vender "+Q.ITEMS[id].name+" · "+Math.floor(E.PRICE[id]*.4)+" €",
   action:()=>sellItem(shop,id)
  }));
  opts.push({label:"Regresar",action:()=>market(shop)});
  ask("Venta de artículos",
   "Los compradores pagan el 40 % del valor de referencia. Para vender un objeto primero tenés que desequiparlo.\n\n"+E.summary(g),
   opts,"SEGUNDA MANO");
 }
 function sellItem(shop,id){
  const g=game();if(!g)return;
  const res=E.sell(g,shop,id);
  if(res.ok){bridge.log(res.description);bridge.advance(5);bridge.refresh();bridge.save();}
  ask(res.ok?"Venta registrada":"Venta denegada",res.description||res.error,
   [{label:"Volver al mostrador",action:()=>sell(shop)}],"VENTA");
 }
 return {bind,wallet,market,buy,sell};
})();