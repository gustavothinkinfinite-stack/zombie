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

 function missionFacade(c,d){
  // El punto E de interacción sigue siendo (240,122), sin mover el hotspot.
  const stone=["passy","elysee","hemeroteca","policia"].includes(d.id);
  rect(c,202,73,76,48,"#111722");
  rect(c,206,71,68,49,stone?"#716d76":"#4e3948");
  rect(c,210,76,60,42,stone?"#9a9294":"#654a57");
  if(d.id==="policia"){
   rect(c,206,72,68,9,"#52616e");
   rect(c,209,70,62,3,"#a3b1b8");
   for(const x of [214,225,253,264]){
    rect(c,x,86,6,15,"#303c4b");
    rect(c,x+1,88,4,10,"#8aa3b3");
   }
   rect(c,230,91,20,27,"#1a2432");
   rect(c,234,96,12,17,"#384354");
   rect(c,232,117,16,3,"#b1a9a1");
  }else if(d.id==="elysee"){
   rect(c,208,69,64,7,"#c8bab0");
   rect(c,218,64,44,5,"#7e7782");
   for(const x of [215,224,250,259]){
    rect(c,x,83,4,29,"#dbc7b7");
    rect(c,x+1,84,2,25,"#b09fa0");
   }
   rect(c,235,90,10,29,"#272330");
   rect(c,233,114,14,5,"#c5b8b0");
  }else if(d.id==="tuneles"){
   rect(c,210,80,60,39,"#465951");
   rect(c,216,85,48,34,"#151e22");
   for(let x=217;x<265;x+=6)rect(c,x,85,3,33,"#61756e");
   rect(c,216,96,48,3,"#384940");
   rect(c,216,111,48,3,"#384940");
  }else if(d.id==="saintdenis"){
   rect(c,210,76,60,43,"#6d5155");
   rect(c,212,81,56,6,"#3b3c46");
   for(const x of [217,229,241,253])rect(c,x,87,7,8,"#d4a78d");
   rect(c,221,99,38,19,"#252935");
   for(let yy=101;yy<118;yy+=4)rect(c,223,yy,34,2,"#6f7782");
  }else if(d.id==="bastilla"||d.id==="stjuly"){
   rect(c,209,77,62,41,d.id==="stjuly"?"#493146":"#5b3c46");
   rect(c,214,78,52,5,d.id==="stjuly"?"#b486a4":"#bb776e");
   for(const x of [216,231,248,260])rect(c,x,88,7,10,"#cd9b86");
   rect(c,224,101,32,18,"#211d2c");
   rect(c,230,103,20,4,"#8a637b");
  }else if(d.id==="passy"){
   rect(c,212,75,56,42,"#a69a9f");
   rect(c,214,72,52,4,"#50485b");
   for(const x of [220,232,250,259]){
    rect(c,x,83,5,10,"#d9bea1");
    rect(c,x+2,84,1,8,"#384052");
   }
   rect(c,233,99,14,19,"#302939");
  }else{
   rect(c,213,76,54,43,"#817079");
   rect(c,215,74,50,3,"#aaa2a2");
   for(const x of [219,232,249,260]){
    rect(c,x,84,5,11,"#e2c5a0");
    rect(c,x+2,86,1,8,"#493f4c");
   }
   rect(c,233,97,14,22,"#2b2834");
  }
  rect(c,228,119,24,4,"#2a303b");
  // Insignia pequeña encima de la entrada, sin título largo superpuesto.
  rect(c,232,80,16,3,d.lamp);
 }
 function districtCaption(d){
  const labels={passy:"PASSY",stjuly:"ST. JULY",elysee:"ELÍSEO",
    hemeroteca:"HEMEROTECA",bastilla:"BASTILLA",saintdenis:"SAINT-DENIS",
    policia:"ARCHIVO POLICIAL",tuneles:"ACCESO A LOS TÚNELES"};
  return "PARÍS NOCTURNO  /  "+(labels[d.id]||d.name.toUpperCase());
 }

 // Capa estática de ornamentación: detalles pixel art sobre la fachada
 // sin alterar puntos navegables ni áreas de interacción.
 function architecturalTrim(c,d){
  const noble=d.id==="passy"||d.id==="elysee",official=d.id==="policia",
        underground=d.id==="tuneles",industrial=d.id==="saintdenis",
        festive=d.id==="stjuly"||d.id==="bastilla";
  for(const [bx,by,bw,bh] of [[19,51,151,70],[310,51,151,70],[19,198,151,50],[310,198,151,50]]){
   const pale=noble?"#d1bbb0":official?"#acb7bd":industrial?"#756a70":"#9a8994";
   // Banda de piedra por pisos, con ménsulas bajo la cornisa.
   rect(c,bx+5,by+8,bw-10,1,pale+"70");
   rect(c,bx+6,by+bh-11,bw-12,2,"#272532");
   for(let x=bx+10;x<bx+bw-12;x+=16){
    rect(c,x,by+8,6,2,pale+"90");
    if(noble){
     rect(c,x+1,by+12,2,3,"#d1c3b8");
     rect(c,x-1,by+bh-16,8,2,"#b8aaa2");
     rect(c,x+1,by+bh-14,2,3,"#746e77");
    }else if(official){
     rect(c,x,by+bh-14,5,1,"#a4bac5");
     rect(c,x+1,by+bh-13,1,3,"#515f70");
    }else if(festive){
     rect(c,x+1,by+bh-12,9,2,"#ad7186");
     rect(c,x+3,by+bh-10,6,1,"#cb9b8b");
    }else if(industrial){
     rect(c,x+1,by+12,2,4,"#353841");
     rect(c,x+1,by+bh-10,8,1,"#9b7573");
    }
   }
   // Letreros de taller y cajas de ventilación que rompen la silueta.
   if(industrial||underground){
    for(const dx of [20,bw-32]){
     rect(c,bx+dx,by-2,15,6,"#303d43");
     for(let k=0;k<4;k++)rect(c,bx+dx+2+k*3,by,1,2,"#70858a");
    }
   }
   if(noble){
    rect(c,bx+Math.floor(bw/2)-10,by-4,20,5,"#77707a");
    rect(c,bx+Math.floor(bw/2)-6,by-7,12,3,"#a7a0a2");
    rect(c,bx+Math.floor(bw/2)-1,by-11,2,4,"#403843");
   }
  }
  // Pórticos: el acceso E permanece exactamente centrado en 240,122.
  for(const x of [207,270]){
   rect(c,x,78,3,41,noble?"#c7b8af":official?"#aab8c0":"#72616d");
   rect(c,x+1,83,1,32,"#302d39");
  }
  if(noble||official){
   rect(c,204,70,72,4,noble?"#b9aca7":"#909ca7");
   for(let x=212;x<272;x+=10)rect(c,x,71,4,2,"#dfd0bf");
   for(let i=0;i<3;i++)rect(c,226-i*3,123+i*2,28+i*6,2,"#8e858b");
  }else if(festive){
   rect(c,208,75,64,2,"#a97c95");
   for(let x=210;x<271;x+=8)rect(c,x,79,3,3,x%3?"#d89a8c":"#754f68");
  }else if(underground){
   for(let x=212;x<270;x+=8)rect(c,x,120,5,1,"#7c9588");
   rect(c,220,123,40,3,"#27383a");
  }
 }
 // Iluminación dinámica sobre el fondo cacheado. Sin impacto en juego.
 function nightIllumination(c,d,time){
  const mood={elysee:"232,204,152",passy:"211,189,156",stjuly:"208,112,165",
    bastilla:"230,146,115",policia:"140,188,224",hemeroteca:"226,182,119",
    saintdenis:"225,159,109",tuneles:"115,175,158"}[d.id]||"224,180,143";
  const flicker=.90+.08*Math.sin(time*.83+d.x*5)+.025*Math.sin(time*3.1+d.y);
  const sources=[[29,114],[450,114],[184,135],[295,183],[220,83],[260,83]];
  for(let i=0;i<sources.length;i++){
   const [x,y]=sources[i],strength=(i>=4?.09:.072)*flicker;
   light(c,x,y,i>=4?26:37,mood,strength);
   if(i<4){
    // Proyección cálida en el asfalto húmedo, desdoblada en segmentos.
    for(let j=0;j<3;j++){
     const yy=y+15+j*6;
     rect(c,x-13+j*3,yy,26-j*6,1,"rgba("+mood+","+(strength*(.38-j*.07)).toFixed(3)+")");
    }
   }
  }
  if(d.id==="stjuly"||d.id==="bastilla"){
   const a=.06+.035*(.5+.5*Math.sin(time*1.45));
   light(c,240,106,54,mood,a);
   for(let i=0;i<5;i++)rect(c,222+i*9,121,6,1,"rgba("+mood+","+(a*.9).toFixed(3)+")");
  }else if(d.id==="policia"){
   light(c,240,109,40,"162,208,232",.09+.015*Math.sin(time*.9));
   rect(c,216,126,48,1,"#779cb63b");
  }else if(d.id==="tuneles"){
   light(c,239,111,35,"109,187,152",.065+.03*Math.sin(time*1.1));
  }
 }
 function base(c,d){
  rect(c,0,0,W,H,"#242a37");
  // Cuatro manzanas dejan avenidas centrales transitables y aceras laterales.
  paintBlock(c,19,51,151,70,d,1+d.x);
  paintBlock(c,310,51,151,70,d,2+d.y);
  paintBlock(c,19,198,151,50,d,4+d.y);
  paintBlock(c,310,198,151,50,d,5+d.x);
  // Aceras independientes de la calzada: estrechan visualmente el cruce
  // sin tocar su sistema de movimiento ni posiciones interactivas.
  rect(c,0,127,480,66,"#77737a");
  rect(c,0,139,480,43,"#303845");
  rect(c,0,127,480,3,"#a69a93");
  rect(c,0,136,480,3,"#a5a0a2");
  rect(c,0,182,480,3,"#a49b9c");
  rect(c,0,190,480,3,"#8b858a");
  rect(c,179,40,122,260,"#807c80");
  rect(c,191,40,98,260,"#313a46");
  rect(c,178,40,4,260,"#a29899");
  rect(c,188,40,3,260,"#a4a1a2");
  rect(c,289,40,3,260,"#a39d9e");
  rect(c,298,40,4,260,"#918d92");
  // Juntas del pavimento y parches de asfalto desgastado.
  for(let x=5;x<480;x+=27){
   for(const y of [129,186]){
    rect(c,x,y,12,1,"#504e5a");
    if(hash(x,y,d.x+d.y)>.55)rect(c,x+3,y+4,6,1,"#b3a59e");
   }
   const g=hash(x,162,d.x);
   if(g>.64)rect(c,x+4,149+(x%4)*6,9,1,"#75838a60");
  }
  for(let y=47;y<300;y+=28){
   rect(c,181,y+2,7,1,"#b5a69b");
   rect(c,293,y+3,5,1,"#b5a69b");
   if(hash(y,d.y,9)>.45)rect(c,202+(y%3)*20,y+5,11,1,"#77879355");
  }
  // Marcas de separación, pasos de cebra y canaletas.
  for(let x=0;x<480;x+=34){
   if(x>161&&x<315)continue;
   rect(c,x+8,160,17,2,"#baaea3");
   rect(c,x+13,177,9,1,"#71818b");
  }
  for(let y=45;y<296;y+=38)if(y<127||y>192)rect(c,239,y+8,4,19,"#bdafa0");
  for(const x of [157,315]){
   for(let y=143;y<179;y+=7)rect(c,x+(x===157?0:2),y,18,3,"#c4bdb275");
  }
  for(const y of [116,195]){
   for(let x=202;x<281;x+=11)rect(c,x,y,5,13,"#c6baac9a");
  }
  for(const [x,y] of [[36,145],[325,158],[447,173],[263,217]]){
   rect(c,x,y,10,2,"#1e2836");
   rect(c,x+2,y+1,6,2,"#555a62");
   rect(c,x+4,y+3,2,1,"#a7a8a0");
  }
  // Dos locales secundarios tienen entradas propias, separadas de las notas ambientales.
  const local=window.VTM_SHOPS?.byDistrict[d.id]||[];
  for(const shop of local){
   const x=shop.x,y=shop.y;
   painterDoor(c,x,y,d,shop.side);
  }
  // Arquitectura específica de cada edificio principal.
  missionFacade(c,d);
  // Puntos de observación al oeste y al este del cruce.
  for(const spot of d.details){
   rect(c,spot.x-10,spot.y-22,20,10,"#171e2b");
   rect(c,spot.x-6,spot.y-20,12,6,d.lamp);
   rect(c,spot.x-4,spot.y-18,8,2,"#e8d8c6");
  }
  // La antigua señal del mapa se pinta en primer plano al final de draw().
  // Su punto de interacción histórico sigue en (83,263).
  for(const dir of Object.keys(edges)){
   const location=exits[dir],target=neighbour(d.id,dir);
   if(!target)continue;
   rect(c,location.x-14,location.y-13,28,16,"#181f2bc9");
   rect(c,location.x-11,location.y-11,22,12,"#696777");
   const arrow={north:"^",south:"v",west:"<",east:">"}[dir];
   text(c,arrow,location.x,location.y-2,12,"#f4d8af");
  }
  // Mobiliario: marquesinas, papeleras, postes y sombras de los faroles.
  // Se mantienen fuera de la zona de las dos notas interactivas y comercios.
  for(const [x,y] of [[23,146],[455,146],[167,208],[313,208]]){
   rect(c,x+1,y+4,9,2,"#15202a7a");
   rect(c,x,y,8,3,"#82737b");
   rect(c,x+2,y-4,4,4,"#5a636d");
  }
  if(d.id==="policia"){
   // Vehículo estacionado de servicio, señal institucional y vallas.
   rect(c,326,144,30,10,"#222b3a");
   rect(c,330,142,22,9,"#687b8c");
   rect(c,336,140,9,3,"#b3bcc5");
   rect(c,329,150,3,4,"#202938");
   rect(c,350,150,3,4,"#202938");
   for(let n=0;n<3;n++)rect(c,25+n*6,197,2,7,"#a6aeb3");
  }else if(d.id==="bastilla"){
   // Toldos de bares y un rincón de carteles desgastados.
   for(let n=0;n<5;n++)rect(c,26+n*12,199,9,4,n%2?"#995f66":"#5d424f");
   rect(c,330,195,15,9,"#392637");
   rect(c,333,196,9,3,"#ad8074");
  }else if(d.id==="passy"||d.id==="elysee"){
   for(const x of [44,423]){
    rect(c,x-2,199,20,3,"#aaa6a0");
    rect(c,x+1,202,2,10,"#bdb0a4");
    rect(c,x+15,202,2,10,"#bdb0a4");
   }
  }else if(d.id==="tuneles"){
   for(const x of [50,418]){
    rect(c,x,206,19,12,"#121d24");
    for(let t=0;t<5;t++)rect(c,x+3+t*3,207,1,9,"#5f7572");
   }
  }else if(d.id==="saintdenis"){
   for(let t=0;t<4;t++){
    rect(c,33+t*13,201,10,12,"#373b47");
    rect(c,34+t*13,203,8,1,"#9a7980");
   }
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
  architecturalTrim(c,d);
  rect(c,0,0,480,39,"#151b28d8");
  text(c,districtCaption(d),240,24,8,"#dfc6ab");
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
 function drawMapExitSign(c,time,fx){
  // Etiqueta sobre vegetación, mobiliario y suelo. El indicador apunta al
  // punto histórico (83,263); el retorno directo también está en la interfaz.
  const pulse=fx?(.06+.025*Math.sin(time*1.5)):0;
  rect(c,56,215,55,29,"#0a1018cb");
  rect(c,58,217,51,24,"#322e39");
  rect(c,59,217,49,2,"#d9b189");
  rect(c,61,221,11,14,"#56453d");
  rect(c,63,224,7,7,"#d3af82");
  text(c,"←",66,231,9,"#211a20");
  text(c,"SALIDA",89,227,8,"#f6dfc5");
  text(c,"A PARÍS",89,237,7,"#e2c8ae");
  rect(c,82,242,2,14,"#cca989");
  rect(c,80,254,6,2,"#cca989");
  text(c,"v",83,263,8,"#f3d5a8");
  if(pulse&&typeof c.createRadialGradient==="function")
   light(c,83,246,14,"237,191,137",pulse);
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
   nightIllumination(c,d,time);
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
  // Siempre visible incluso sin efectos, por encima de los transeúntes.
  drawMapExitSign(c,time,fx);
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