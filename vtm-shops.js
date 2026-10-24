"use strict";
/* Edificios secundarios del Principado de París.
   Dos por barrio, sin personajes canónicos ni revelaciones de la trama central.
   Los efectos narrativos se conceden una sola vez por establecimiento. */
window.VTM_SHOPS=(()=>{
 const definitions=[
 {
  "id": "passy-anticuario",
  "district": "passy",
  "side": 0,
  "name": "Anticuario de Passy",
  "kind": "anticuario",
  "description": "La vitrina reúne relojes detenidos y fotografías antiguas.",
  "keeper": "Margot Bellier",
  "clue": "Un reloj de bolsillo lleva las iniciales de alguien que ya no figura en los registros del comercio.",
  "rumor": "Un cliente reservó una pieza y pidió que se conservara su procedencia en secreto.",
  "faction": "nosferatu",
  "x": 80,
  "y": 187
 },
 {
  "id": "passy-conserjeria",
  "district": "passy",
  "side": 1,
  "name": "Conserjería nocturna",
  "kind": "oficina",
  "description": "Una recepción de mármol sigue iluminada a horas improbables.",
  "keeper": "Émile Laurent",
  "clue": "En el libro de visitas hay varias entregas nocturnas sin nombre de destinatario.",
  "rumor": "Un repartidor espera instrucciones que nadie parece querer dar por escrito.",
  "faction": "camarilla",
  "x": 400,
  "y": 187
 },
 {
  "id": "stjuly-floristeria",
  "district": "stjuly",
  "side": 0,
  "name": "Floristería de madrugada",
  "kind": "flores",
  "description": "Flores frescas descansan junto a recipientes con agua helada.",
  "keeper": "Camille Rivière",
  "clue": "Un pedido de rosas blancas fue retirado de madrugada sin dejar dirección.",
  "rumor": "Las flores se envían a salones privados incluso cuando el local está cerrado.",
  "faction": "camarilla",
  "x": 80,
  "y": 187
 },
 {
  "id": "stjuly-cafe",
  "district": "stjuly",
  "side": 1,
  "name": "Café des Lanternes",
  "kind": "cafe",
  "description": "El café permanece abierto mientras la lluvia golpea los toldos.",
  "keeper": "Nadia Morel",
  "clue": "Un parroquiano dejó anotaciones sobre vehículos que cambian de ruta después de medianoche.",
  "rumor": "Varios clientes pagan con billetes nuevos y evitan ser fotografiados.",
  "faction": "brujah",
  "x": 400,
  "y": 187
 },
 {
  "id": "elysee-galeria",
  "district": "elysee",
  "side": 0,
  "name": "Galería Saint-Honoré",
  "kind": "galeria",
  "description": "Lienzos modernos alternan con esculturas de mármol bajo focos cálidos.",
  "keeper": "Anaïs Fournier",
  "clue": "Un cuadro fue retirado antes de una inauguración sin constar en el catálogo.",
  "rumor": "Una sala privada recibe visitas que nunca participan de las exposiciones públicas.",
  "faction": "camarilla",
  "x": 80,
  "y": 187
 },
 {
  "id": "elysee-notaria",
  "district": "elysee",
  "side": 1,
  "name": "Estudio de documentos",
  "kind": "oficina",
  "description": "Archivadores impecables ocupan las paredes de un despacho sobrio.",
  "keeper": "Benoît Lemaire",
  "clue": "Un poder notarial reciente tiene una firma que no coincide con la ficha archivada.",
  "rumor": "Algunos documentos se entregan personalmente y no pasan por mensajería.",
  "faction": "tremere",
  "x": 400,
  "y": 187
 },
 {
  "id": "hemeroteca-libreria",
  "district": "hemeroteca",
  "side": 0,
  "name": "Librería de la Rue des Archives",
  "kind": "libros",
  "description": "Montañas de libros usados invaden las mesas de lectura.",
  "keeper": "Juliette Bernard",
  "clue": "Una edición de prensa fue reemplazada por otra con una noticia recortada.",
  "rumor": "Los ejemplares más solicitados tratan sobre sucesos aparentemente inconexos.",
  "faction": "nosferatu",
  "x": 80,
  "y": 187
 },
 {
  "id": "hemeroteca-encuadernacion",
  "district": "hemeroteca",
  "side": 1,
  "name": "Taller de encuadernación",
  "kind": "taller",
  "description": "El olor a papel, cola y cuero llena un local diminuto.",
  "keeper": "Paul Dufour",
  "clue": "Una encuadernación reciente contiene hojas de una época diferente.",
  "rumor": "Un comprador pagó para recuperar sólo las tapas de varios legajos.",
  "faction": "tremere",
  "x": 400,
  "y": 187
 },
 {
  "id": "bastilla-bar",
  "district": "bastilla",
  "side": 0,
  "name": "Le Verre Fêlé",
  "kind": "cafe",
  "description": "Un bar ruidoso conserva una mesa vacía junto al fondo.",
  "keeper": "Sofiane Petit",
  "clue": "Una conversación sobre desalojos se interrumpió cuando llegó un mensajero.",
  "rumor": "Los vecinos discuten un cambio repentino en las patrullas del barrio.",
  "faction": "brujah",
  "x": 80,
  "y": 187
 },
 {
  "id": "bastilla-estudio",
  "district": "bastilla",
  "side": 1,
  "name": "Estudio de música",
  "kind": "taller",
  "description": "Amplificadores y cables descansan junto a una consola vieja.",
  "keeper": "Zoé Martin",
  "clue": "Una grabación contiene voces de una reunión que supuestamente nunca ocurrió.",
  "rumor": "Un músico perdió su empleo después de tocar en una fiesta privada.",
  "faction": "brujah",
  "x": 400,
  "y": 187
 },
 {
  "id": "saintdenis-lavanderia",
  "district": "saintdenis",
  "side": 0,
  "name": "Lavandería Saint-Denis",
  "kind": "taller",
  "description": "Las lavadoras giran detrás de cristales empañados.",
  "keeper": "Malik Benali",
  "clue": "Una chaqueta olvidada conserva un recibo de un vehículo de reparto.",
  "rumor": "Los turnos nocturnos reciben más ropa de hoteles que de particulares.",
  "faction": "nosferatu",
  "x": 80,
  "y": 187
 },
 {
  "id": "saintdenis-reparaciones",
  "district": "saintdenis",
  "side": 1,
  "name": "Taller de reparaciones",
  "kind": "taller",
  "description": "Herramientas y motores desarmados cubren el banco principal.",
  "keeper": "Hugo Perrin",
  "clue": "Un coche fue reparado con un número de patente temporal sospechoso.",
  "rumor": "Alguien compró piezas antiguas para instalar dispositivos modernos.",
  "faction": "brujah",
  "x": 400,
  "y": 187
 },
 {
  "id": "policia-cafeteria",
  "district": "policia",
  "side": 0,
  "name": "Cafetería del turno de noche",
  "kind": "cafe",
  "description": "El olor a café recalentado impregna una sala de mesas metálicas.",
  "keeper": "Claire Dubois",
  "clue": "Un agente menciona expedientes cerrados antes de terminar las entrevistas.",
  "rumor": "En el turno de noche se habla poco de las llamadas que no quedaron registradas.",
  "faction": "camarilla",
  "x": 80,
  "y": 187
 },
 {
  "id": "policia-copisteria",
  "district": "policia",
  "side": 1,
  "name": "Copistería de expedientes",
  "kind": "oficina",
  "description": "Una impresora industrial trabaja detrás de un mostrador estrecho.",
  "keeper": "Thierry Caron",
  "clue": "Algunos folios se imprimieron dos veces con números de expediente diferentes.",
  "rumor": "Un empleado conserva papel destruido que debería haber sido triturado.",
  "faction": "nosferatu",
  "x": 400,
  "y": 187
 },
 {
  "id": "tuneles-almacen",
  "district": "tuneles",
  "side": 0,
  "name": "Almacén subterráneo",
  "kind": "almacen",
  "description": "Tuberías y cajas de suministros forman un laberinto bien ordenado.",
  "keeper": "Mireille Roche",
  "clue": "Un envío se facturó a una empresa que ya no opera en esta dirección.",
  "rumor": "Los proveedores reciben instrucciones contradictorias sobre los accesos.",
  "faction": "nosferatu",
  "x": 80,
  "y": 187
 },
 {
  "id": "tuneles-electronica",
  "district": "tuneles",
  "side": 1,
  "name": "Reparación de aparatos usados",
  "kind": "taller",
  "description": "Monitores de tubo parpadean junto a equipos desarmados.",
  "keeper": "Rémi Garnier",
  "clue": "Un circuito fue modificado para interceptar señales de un edificio cercano.",
  "rumor": "Un cliente vuelve cada semana para borrar datos de dispositivos antiguos.",
  "faction": "nosferatu",
  "x": 400,
  "y": 187
 }
];
 const byId=Object.fromEntries(definitions.map(s=>[s.id,s]));
 const byDistrict={};
 for(const s of definitions)(byDistrict[s.district]??=[]).push(s);
 const schemes={
 anticuario:{wall:"#48383d",wood:"#7d5a55",floor:"#35313c",accent:"#d2ad8f"},
 oficina:{wall:"#3c4553",wood:"#697381",floor:"#373e49",accent:"#b3bdc6"},
 flores:{wall:"#423a49",wood:"#675b54",floor:"#3d3540",accent:"#c08b99"},
 cafe:{wall:"#493640",wood:"#825f56",floor:"#43363c",accent:"#d2aa83"},
 galeria:{wall:"#4f4752",wood:"#aaa1a4",floor:"#585059",accent:"#dac8b7"},
 libros:{wall:"#3d343e",wood:"#786254",floor:"#3a3438",accent:"#c8ab86"},
 taller:{wall:"#3e4148",wood:"#697278",floor:"#3a3d45",accent:"#b8a8a0"},
 almacen:{wall:"#304443",wood:"#58736a",floor:"#303e3d",accent:"#aac4b3"}
 };
 const painter=(ctx,x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
 function text(ctx,word,x,y,size=9,color="#f3dbc4"){ctx.fillStyle=color;ctx.font="bold "+size+"px monospace";ctx.textAlign="center";ctx.fillText(word,x,y);}
 function base(c,store){
  const p=schemes[store.kind]||schemes.oficina;
  painter(c,0,0,480,300,p.floor);
  for(let y=42;y<300;y+=18)for(let x=14;x<465;x+=36){
   painter(c,x,y,34,16,y%36===6?"#171b2459":"#14182333");
   painter(c,x+2,y+2,23,1,"#eee2cf1a");
  }
  painter(c,0,0,480,41,p.wall);painter(c,0,38,480,3,p.accent);
  painter(c,0,40,16,260,"#151720");painter(c,463,40,17,260,"#151720");
  for(const x of [46,366]){
   painter(c,x,56,68,81,"#202430");painter(c,x+7,62,55,68,p.wood);
   painter(c,x+12,67,45,52,"#2c3140");
   painter(c,x+33,68,2,52,p.accent);
   painter(c,x+12,93,45,2,p.accent);
  }
  // Muebles coherentes con las colisiones heredadas de escenas 'venue'.
  painter(c,49,153,158,79,p.wood);painter(c,55,159,146,65,p.wall);
  painter(c,62,163,133,5,p.accent);
  painter(c,302,156,130,73,p.wood);painter(c,309,161,116,60,p.wall);
  painter(c,318,167,98,44,"#22242d");
  painter(c,219,264,43,36,"#282632");painter(c,224,269,33,31,p.wood);
  painter(c,233,280,2,3,p.accent);
  for(let i=0;i<6;i++){
   const xx=61+i*21;
   if(store.kind==="flores"){
    painter(c,xx,172,10,16,["#8b6877","#c0858c","#747e6d"][i%3]);
    painter(c,xx+4,163,2,16,"#72937c");
    painter(c,xx,157,10,9,"#c6a0a3");
   }else if(["libros","anticuario","galeria"].includes(store.kind)){
    painter(c,xx,173,15,29,["#7d5c60","#a18b74","#656983"][i%3]);
    painter(c,xx+3,178,9,2,"#e2d3b240");
   }else if(["taller","almacen"].includes(store.kind)){
    painter(c,xx,173,16,21,"#68757b");painter(c,xx+3,178,10,8,"#303944");
   }else{
    painter(c,xx,176,15,14,p.accent);painter(c,xx+2,180,11,2,"#fff2d859");
   }
  }
  // Mostradores laterales y lámparas, corredor central despejado.
  for(const x of [23,456]){
   painter(c,x,75,3,84,p.wood);painter(c,x-7,76,17,5,p.accent);
   painter(c,x-4,70,10,6,"#edc6a4");
  }
  painter(c,202,191,76,42,p.wall);painter(c,207,198,66,34,p.wood);
  painter(c,213,203,53,2,p.accent);
  text(c,store.name.toUpperCase().slice(0,34),240,25,10);
  // Objetos se muestran delante de muebles; no ocupan el pasillo.
  for(const [x,y] of [[130,143],[350,143]]){
   painter(c,x-8,y-28,16,15,"#171923d0");
   painter(c,x-5,y-25,10,9,p.accent);
   text(c,"?",x,y-17,9,"#282333");
  }
 }
 const backgrounds=new Map();
 function draw(c,game,time,fx=true){
  const shop=byId[game.sidevenue];if(!shop)return;
  let cached=backgrounds.get(shop.id);
  if(!cached&&typeof document!=="undefined"&&document.createElement){
   const canvas=document.createElement("canvas");canvas.width=480;canvas.height=300;
   const c2=canvas.getContext("2d");
   if(c2){c2.imageSmoothingEnabled=false;base(c2,shop);cached=canvas;backgrounds.set(shop.id,canvas);}
  }
  if(cached)c.drawImage(cached,0,0);
  else base(c,shop);
  // Puerta de salida y zona de conversación.
  const p=schemes[shop.kind]||schemes.oficina;
  const action=game.localPlaces?.[shop.id];
  painter(c,230,64,20,12,action?.decision?"#82947d":p.accent);
  painter(c,232,66,16,8,"#33303b");
  if(fx&&typeof c.createRadialGradient==="function"){
   const gradient=c.createRadialGradient(240,135,1,240,135,72);
   gradient.addColorStop(0,"rgba(225,180,142,"+(.055+.022*Math.sin(time*2)).toFixed(3)+")");
   gradient.addColorStop(1,"rgba(225,180,142,0)");
   c.fillStyle=gradient;c.fillRect(168,63,144,144);
  }
 }
 function nearest(game){
  if(game.scene!=="sidevenue"||!byId[game.sidevenue])return null;
  const places=[{type:"exit",x:240,y:270,r:43,name:"Salir al barrio"},
   {type:"clerk",x:240,y:104,r:60,name:"Conversar con el encargado"},
   {type:"clue",x:130,y:143,r:55,name:"Revisar el mostrador"},
   {type:"shelf",x:350,y:146,r:55,name:"Examinar la estantería"}];
  return places.map(k=>({...k,d:Math.hypot(game.x-k.x,game.y-k.y)})).filter(k=>k.d<k.r).sort((a,b)=>a.d-b.d)[0]||null;
 }
 function normalize(game){
  game.localPlaces=(game.localPlaces&&typeof game.localPlaces==="object"&&!Array.isArray(game.localPlaces))?game.localPlaces:{};
  game.localClues=Array.isArray(game.localClues)?[...new Set(game.localClues.filter(id=>byId[id]))]:[];
  if(game.scene==="sidevenue"&&!byId[game.sidevenue]){
   game.scene=game.sideReturn?.district?"district":"paris";
   game.district=game.sideReturn?.district||game.district;
   game.x=game.sideReturn?.x??240;game.y=game.sideReturn?.y??195;
  }
  return game;
 }
 return Object.freeze({definitions,byId,byDistrict,draw,nearest,normalize,version:"1.0"});
})();