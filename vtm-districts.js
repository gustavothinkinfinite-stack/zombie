"use strict";
/* CRÓNICAS DE PARÍS — Barrios explorables (primera expansión)
 * Topología de 8 distritos interconectados. Cada barrio es una escena de
 * 480×300 píxeles; no pretende reproducir las distancias reales de París.
 * Las ubicaciones del mapa original, sus misiones y accesos siguen intactos.
 */
window.VTM_DISTRICTS=(()=>{
 const W=480,H=300;
 const defs=[
  {id:"passy",name:"Passy",x:0,y:0,tone:"#57516a",brick:"#564755",lamp:"#cbb8cc",character:"Casas silenciosas, portones custodiados y fachadas impecables.",
   details:[
    {id:"portero",x:115,y:157,title:"El portero de Passy",text:"El portero permanece bajo la marquesina, atento a los coches que reducen la velocidad. Ninguno de los visitantes parece necesitar anunciar su nombre."},
    {id:"jardin",x:364,y:157,title:"Un jardín tras los muros",text:"La vegetación se recorta tras una reja demasiado alta. Bajo la luz tenue, los senderos desaparecen entre setos cuidadosamente mantenidos."}]},
  {id:"stjuly",name:"Barrio del St. July",x:1,y:0,tone:"#64425f",brick:"#5f3b55",lamp:"#d3a5b7",character:"Música distante, taxis nocturnos y puertas de terciopelo.",
   details:[
    {id:"acera",x:115,y:157,title:"La fila bajo el toldo",text:"Una fila de noctámbulos aguarda sin hacer ruido. Un automóvil oscuro se detiene apenas unos segundos antes de seguir su camino."},
    {id:"portada",x:364,y:157,title:"La fachada vecina",text:"Un antiguo edificio conserva ornamentos dorados bajo capas de pintura. Desde el interior llega música de una fiesta privada."}]},
  {id:"elysee",name:"Distrito del Elíseo",x:2,y:0,tone:"#6c6267",brick:"#77717b",lamp:"#dbc7ad",character:"Embajadas, edificios solemnes y una discreta vigilancia.",
   details:[
    {id:"guardia",x:115,y:157,title:"Vigilancia discreta",text:"Dos figuras observan la calle desde el interior de un coche estacionado. No llevan uniforme ni parecen interesados en los transeúntes."},
    {id:"fuente",x:364,y:157,title:"La fuente silenciosa",text:"Una fuente de piedra devuelve los reflejos de las ventanas cercanas. Su mármol exhibe décadas de desgaste, aunque la plaza permanece impecable."}]},
  {id:"hemeroteca",name:"Barrio de la Hemeroteca",x:0,y:1,tone:"#6b5654",brick:"#68534c",lamp:"#d7b99a",character:"Bibliotecas, puestos de prensa y viejas instituciones.",
   details:[
    {id:"prensa",x:115,y:157,title:"Periódicos de última hora",text:"Los titulares hablan de negocios y escándalos. En una página interior hay una breve nota sobre incidentes inexplicables que las autoridades atribuyen a disturbios."},
    {id:"biblioteca",x:364,y:157,title:"Luz en la biblioteca",text:"Entre los libros apilados en una ventana, una lámpara continúa encendida. Alguien trabaja cuando el resto de la ciudad debería dormir."}]},
  {id:"bastilla",name:"Bastilla",x:1,y:1,tone:"#764a4c",brick:"#65434a",lamp:"#dea88a",character:"Bares, grafitis, persianas metálicas y reuniones improvisadas.",
   details:[
    {id:"graffiti",x:115,y:157,title:"Pintadas recientes",text:"La pintura aún fresca cubre consignas antiguas. No queda claro si anuncia un movimiento político o una disputa entre grupos rivales."},
    {id:"bar",x:364,y:157,title:"Conversaciones en la terraza",text:"Un grupo discute con intensidad alrededor de una mesa. La conversación se apaga al advertir que alguien escucha demasiado cerca."}]},
  {id:"saintdenis",name:"Saint-Denis",x:2,y:1,tone:"#455466",brick:"#485466",lamp:"#c8b3a1",character:"Depósitos, callejones industriales y avenidas poco transitadas.",
   details:[
    {id:"taller",x:115,y:157,title:"El taller cerrado",text:"Herramientas abandonadas y una cortina de hierro entreabierta sugieren que el trabajo terminó de forma apresurada."},
    {id:"cruce",x:364,y:157,title:"El cruce desierto",text:"El semáforo cambia de color para una calle vacía. Un vehículo pasa sin detenerse y desaparece detrás de los depósitos."}]},
  {id:"policia",name:"Barrio del Archivo Policial",x:0,y:2,tone:"#526374",brick:"#4c5966",lamp:"#b3c1c9",character:"Dependencias oficiales, vehículos de servicio y ventanas iluminadas.",
   details:[
    {id:"patrulla",x:115,y:157,title:"Una patrulla en espera",text:"Los agentes descansan junto a un coche de servicio. La radio emite mensajes breves que se pierden bajo el ruido del motor."},
    {id:"expedientes",x:364,y:157,title:"Ventanas del archivo",text:"Cajas de documentación se apilan tras los cristales. Una silueta revisa papeles bajo una luz demasiado blanca."}]},
  {id:"tuneles",name:"Acceso a los Túneles",x:1,y:2,tone:"#3f625e",brick:"#40534f",lamp:"#9cbeb1",character:"Subsuelo húmedo, rejillas oxidadas y calles estrechas.",
   details:[
    {id:"rejilla",x:115,y:157,title:"La rejilla de ventilación",text:"Una corriente de aire tibio sube desde las profundidades. Bajo el ruido del tránsito se escucha un zumbido mecánico constante."},
    {id:"desague",x:364,y:157,title:"El agua bajo la calle",text:"El agua desciende hacia las cloacas arrastrando hojas y residuos. Un pequeño objeto metálico desaparece en la oscuridad."}]}
 ];
 const byId=Object.fromEntries(defs.map(d=>[d.id,d]));
 const grid=new Map(defs.map(d=>[d.x+","+d.y,d.id]));
 const edges={north:[0,-1],south:[0,1],west:[-1,0],east:[1,0]};
 const exits={north:{x:240,y:62},south:{x:240,y:267},west:{x:39,y:155},east:{x:441,y:155}};
 const entrances={north:{x:240,y:249},south:{x:240,y:60},west:{x:428,y:155},east:{x:52,y:155}};
 function neighbour(id,dir){const d=byId[id],step=edges[dir];return d&&step?grid.get((d.x+step[0])+","+(d.y+step[1]))||null:null;}
 function arrival(dir){return {...(entrances[dir]||{x:240,y:195})};}
 function point(id,name){return byId[id]?.details.find(o=>o.id===name)||null;}
 const rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.ceil(w)),Math.max(1,Math.ceil(h)));};
 const hash=(a,b,z=0)=>{let n=Math.imul(a+17,374761393)^Math.imul(b+43,668265263)^Math.imul(z+29,2246822519);n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967295;};
 function text(c,s,x,y,size=8,color="#ecdfcb",align="center"){c.textAlign=align;c.fillStyle=color;c.font="bold "+size+"px monospace";c.fillText(s,Math.round(x),Math.round(y));}
 function light(c,x,y,r,rgb,a){
  if(typeof c.createRadialGradient!=="function")return;
  const gradient=c.createRadialGradient(x,y,1,x,y,r);
  gradient.addColorStop(0,"rgba("+rgb+","+a+")");
  gradient.addColorStop(1,"rgba("+rgb+",0)");
  c.fillStyle=gradient;c.fillRect(x-r,y-r,r*2,r*2);
 }
 const background=new Map();
 function paintBlock(c,x,y,w,h,d,seed){
  // Fachadas coherentes con el barrio y con variaciones por bloque.
  const rnd=hash(seed,d.x+4,d.y+8),office=d.id==="policia",
   noble=["passy","elysee"].includes(d.id),work=["saintdenis","tuneles"].includes(d.id),
   lively=["bastilla","stjuly"].includes(d.id);
  const roofs=noble?["#625c67","#514956","#67616a","#514c5a"]:
   office?["#586675","#4b5969","#485562","#5d6976"]:
   work?["#39434b","#444852","#4b454f","#354650"]:
   lively?["#664550","#56414c","#684951","#534153"]:
   ["#615459","#514953","#6c5556","#4b4a59"];
  const roof=roofs[Math.floor(rnd*roofs.length)],brick=noble?"#a09596":office?"#6b7a88":work?"#625a61":d.brick;
  rect(c,x+3,y+6,w+1,h,"#131821");
  rect(c,x,y+2,w,h-1,brick);
  rect(c,x,y,w,6,roof);
  rect(c,x+2,y+5,w-4,3,noble?"#c1aca6":"#80717c");
  rect(c,x+4,y+8,w-8,h-15,roof);
  // Volúmenes y juntas horizontales: distintos edificios en una misma manzana.
  for(let fy=y+15;fy<y+h-11;fy+=16)rect(c,x+5,fy,w-10,1,"#c4b5aa25");
  const bay=Math.max(3,Math.floor((w-20)/18));
  const pitch=(w-16)/bay;
  for(let col=0;col<bay;col++){
   const xx=Math.round(x+8+col*pitch),ww=Math.min(9,Math.floor(pitch)-4);
   for(let yy=y+13;yy<y+h-15;yy+=16){
    const lit=hash(xx,yy,seed)>(office?.54:lively?.48:.67);
    rect(c,xx-2,yy-2,ww+4,12,"#242b37");
    rect(c,xx,yy,ww,8,lit?"#bd9b86":"#354152");
    rect(c,xx+1,yy+1,Math.max(2,ww-2),6,lit?"#d9c0a6":"#1d2937");
    rect(c,xx+Math.floor(ww/2),yy,1,8,"#4e4a54");
    if(noble){
     rect(c,xx-3,yy+8,ww+6,2,"#b8a8a6");
     rect(c,xx-2,yy+10,1,3,"#8d7f87");
     rect(c,xx+ww+1,yy+10,1,3,"#8d7f87");
    }else if(work){
     rect(c,xx-2,yy+9,ww+4,3,"#343a44");
    }else if(lively&&yy===y+13){
     rect(c,xx-2,yy+9,ww+4,1,"#b47d88");
    }
   }
  }
  // Elementos estructurales que rompen la repetición.
  if(seed%3===0){
   rect(c,x+14,y-3,14,12,"#756e76");
   rect(c,x+17,y-7,8,5,"#292c36");
   rect(c,x+18,y+1,5,3,"#3d4550");
  }
  if(seed%4===1){
   rect(c,x+w-26,y+5,18,10,"#363b4a");
   rect(c,x+w-24,y+7,14,5,office?"#8795a3":"#977e85");
   rect(c,x+w-22,y+8,5,3,"#293442");
  }
  if(noble){
   rect(c,x+5,y+h-9,w-10,4,"#a49a99");
   for(const xx of [x+11,x+w-14])rect(c,xx,y+h-14,3,10,"#c6b8ac");
  }else if(work){
   rect(c,x+8,y+h-12,Math.min(44,w-20),7,"#202733");
   for(let j=0;j<4;j++)rect(c,x+11+j*10,y+h-10,7,3,"#687681");
  }else if(lively){
   rect(c,x+10,y+h-12,w-20,7,"#40303e");
   for(let j=0;j<Math.floor((w-20)/14);j++){
    const xx=x+12+j*14;
    rect(c,xx,y+h-11,10,5,j%2?"#966b7a":"#7d606c");
   }
  }
  rect(c,x+5,y+h-5,w-10,2,"#262b37");
 }
 function painterDoor(c,x,y,d,side){
  rect(c,x-16,y-12,32,12,"#1b202c");
  rect(c,x-14,y-10,28,10,d.lamp);
  rect(c,x-11,y-9,22,8,d.brick);
  rect(c,x-6,y-7,12,6,"#252333");
  rect(c,x+4,y-6,2,2,"#f1d2a6");
  text(c,side?"TIENDA":"LOCAL",x,y-16,7,"#f0ddc3");
 }
 function base(c,d){
  rect(c,0,0,W,H,"#242a37");
  // Cuatro manzanas dejan avenidas centrales transitables y aceras laterales.
  paintBlock(c,19,51,151,70,d,1+d.x);
  paintBlock(c,310,51,151,70,d,2+d.y);
  paintBlock(c,19,198,151,50,d,4+d.y);
  paintBlock(c,310,198,151,50,d,5+d.x);
  rect(c,0,127,480,63,"#3b424e");
  rect(c,178,40,124,260,"#39414d");
  rect(c,0,134,480,5,"#77727a");
  rect(c,0,183,480,5,"#716e78");
  rect(c,184,40,5,260,"#8c858b");
  rect(c,292,40,5,260,"#89838a");
  // Adoquines de las dos avenidas y marcas viales.
  for(let x=0;x<480;x+=33){rect(c,x+8,159,17,2,"#beafa3");rect(c,x+14,174,9,1,"#70808b");}
  for(let y=46;y<295;y+=34){rect(c,237,y+8,5,19,"#c1aea0");}
  for(const yy of [130,182]){for(let xx=0;xx<480;xx+=20){rect(c,xx+2,yy,14,2,"#6d727e");}}
  for(const xx of [181,295]){for(let yy=48;yy<300;yy+=22){rect(c,xx,yy+1,2,13,"#87818a");}}
  // Dos locales secundarios tienen entradas propias, separadas de las notas ambientales.
  const local=window.VTM_SHOPS?.byDistrict[d.id]||[];
  for(const shop of local){
   const x=shop.x,y=shop.y;
   painterDoor(c,x,y,d,shop.side);
  }
  // El edificio de misión se identifica claramente sin entorpecer el pasillo.
  rect(c,206,74,68,47,"#1b1926");
  rect(c,212,79,56,37,d.brick);
  rect(c,218,84,44,29,"#332b37");
  rect(c,230,93,20,25,"#201d2a");
  rect(c,246,108,2,4,"#e5c594");
  rect(c,217,76,47,3,d.lamp);
  text(c,d.name.length>22?d.name.slice(0,20):d.name,240,72,8,"#f1d9bd");
  // Puntos de observación al oeste y al este del cruce.
  for(const spot of d.details){
   rect(c,spot.x-10,spot.y-22,20,10,"#171e2b");
   rect(c,spot.x-6,spot.y-20,12,6,d.lamp);
   rect(c,spot.x-4,spot.y-18,8,2,"#e8d8c6");
  }
  // Señalización permanente de salida del barrio hacia el mapa general.
  rect(c,64,252,39,20,"#1c222e");
  rect(c,67,254,33,16,"#5a5260");
  text(c,"MAPA",83,265,7,"#f6deb6");
  for(const dir of Object.keys(edges)){
   const location=exits[dir],target=neighbour(d.id,dir);
   if(!target)continue;
   rect(c,location.x-14,location.y-13,28,16,"#181f2bc9");
   rect(c,location.x-11,location.y-11,22,12,"#696777");
   const arrow={north:"^",south:"v",west:"<",east:">"}[dir];
   text(c,arrow,location.x,location.y-2,12,"#f4d8af");
  }
  // Luminarias y árboles en áreas seguras.
  for(const [x,y] of [[190,130],[293,184],[30,135],[453,184]]){
   rect(c,x-2,y-18,3,20,"#a59b99");
   rect(c,x-6,y-21,11,6,"#e9c69d");
  }
  for(const [x,y] of [[77,275],[392,274]]){
   rect(c,x-3,y-13,6,19,"#554948");
   rect(c,x-15,y-26,30,19,"#4a6b62");
   rect(c,x-11,y-32,22,10,"#587c6b");
   rect(c,x-6,y-35,12,6,"#698674");
  }
  rect(c,0,0,480,39,"#151b28d8");
  text(c,"PARÍS NOCTURNO  /  "+d.name.toUpperCase(),240,25,11,"#dfc6ab");
 }
 function backplate(c,id){
  let cached=background.get(id);
  if(!cached&&typeof document!=="undefined"&&document.createElement){
   const canvas=document.createElement("canvas");canvas.width=W;canvas.height=H;
   const context=canvas.getContext("2d");
   if(context){context.imageSmoothingEnabled=false;base(context,byId[id]);cached=canvas;background.set(id,canvas);}
  }
  if(cached&&typeof c.drawImage==="function")c.drawImage(cached,0,0);
  else base(c,byId[id]);
 }
 function draw(c,game,time,fx=true){
  const d=byId[game.district];if(!d)return;
  backplate(c,d.id);
  const observed=game.districtNotes||{};
  for(const spot of d.details){
   const found=!!observed[d.id+":"+spot.id];
   rect(c,spot.x-6,spot.y-33,12,10,found?"#537667":"#ad8b6f");
   text(c,found?"✓":"?",spot.x,spot.y-25,9,"#faf0d8");
  }
  // Un icono señala exclusivamente los contactos que tienen novedades pendientes.
  for(const shop of window.VTM_SHOPS?.byDistrict[d.id]||[]){
   if(game.contactMemory?.[shop.id]?.followup!=="ready")continue;
   const y=shop.y-30+Math.sin(time*2+shop.side)*2;
   rect(c,shop.x-7,y-14,14,14,"#24202de6");
   rect(c,shop.x-5,y-12,10,10,"#d3ad78");
   text(c,"!",shop.x,y-3,10,"#261d2b");
  }
  if(fx){
   for(let i=0;i<25;i++){
    const x=(i*71+Math.floor(time*28))%W,y=(i*53+Math.floor(time*64))%H;
    rect(c,x,y,1,3+i%3,"#b3c4d65a");
   }
   for(const [x,y] of [[189,112],[295,179],[30,137],[452,181]]){
    light(c,x,y,30,"248,200,141",.09+.03*Math.sin(time*1.3+x));
   }
   // Personas anónimas, no interactuables: se apartan del centro de la escena.
   for(let i=0;i<5;i++){
    const x=18+((time*(4+i)+i*83)%445),y=i%2?182:136;
    if(Math.hypot(x-game.x,y-game.y)<28)continue;
    rect(c,x-4,y+9,10,3,"#10172498");
    rect(c,x-4,y-5,8,15,["#665769","#526a75","#795861"][i%3]);
    rect(c,x-2,y-11,5,7,"#b99b8c");
    rect(c,x-3,y-13,6,3,"#36303b");
   }
  }
 }
 function nearby(game,range=31){
  const d=byId[game.district];if(!d)return null;
  const x=game.x,y=game.y;
  // Permite entrar al establecimiento desde la avenida central.
  if(Math.hypot(x-240,y-122)<range+13)return{type:"venue",name:d.name};
  const map={x:83,y:263};
  if(Math.hypot(x-map.x,y-map.y)<range)return{type:"map",name:"Mapa de París"};
  // Los locales secundarios ocupan una zona distinta de los rincones de calle.
  const shop=window.VTM_SHOPS?.byDistrict[d.id]?.map(s=>({shop:s,d:Math.hypot(x-s.x,y-s.y)}))
    .filter(v=>v.d<28).sort((a,b)=>a.d-b.d)[0];
  if(shop)return{type:"shop",shop:shop.shop,name:shop.shop.name};
  for(const spot of d.details){
   if(Math.hypot(x-spot.x,y-spot.y)<range+3)return{type:"note",detail:spot,name:spot.title};
  }
  for(const dir of ["west","east","north","south"]){
   if(!neighbour(d.id,dir))continue;
   const gate=exits[dir];
   if(Math.hypot(x-gate.x,y-gate.y)<range)return{type:"neighbour",dir,target:neighbour(d.id,dir),name:byId[neighbour(d.id,dir)].name};
  }
  return null;
 }
 function points(id){return byId[id]?.details||[];}
 return Object.freeze({defs,byId,neighbour,arrival,draw,nearby,points,exits,version:"1.0"});
})();