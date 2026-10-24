"use strict";
/*
 * Crónicas de París — Vida nocturna, v2.0 fase VII
 *
 * Animación puramente cosmética y determinista: NO hay colisiones nuevas,
 * encuentros al azar, recursos ni progreso persistido salvo las observaciones
 * opcionales de la calle que el jugador examine. Ningún transeúnte es un PNJ
 * principal ni revela los secretos de la crónica.
 */
window.VTM_AMBIENCE=(()=>{
 const WIDTH=480,HEIGHT=300,TAU=Math.PI*2;
 const hotspots=Object.freeze([
  Object.freeze({id:"carteles",x:58,y:120,title:"Carteles bajo la lluvia",description:"Carteles de conciertos, anuncios comerciales y papeles arrancados se superponen en una pared húmeda. Entre ellos hay avisos de personas desaparecidas. Nada indica quién los colocó."}),
  Object.freeze({id:"quiosco",x:55,y:188,title:"El quiosco cerrado",description:"El cristal empañado de un quiosco devuelve el brillo de las farolas. Las primeras páginas hablan de política y negocios. En una columna menor se menciona una investigación periodística sobre incidentes nocturnos."}),
  Object.freeze({id:"taxi",x:396,y:282,title:"La parada de taxis",description:"Los conductores esperan bajo la lluvia mientras miran sus teléfonos. Una conversación se interrumpe al acercarte: en París, casi nadie desea hablar de lo que ha visto de madrugada."}),
  Object.freeze({id:"puente",x:205,y:284,title:"Reflejos sobre el Sena",description:"Un puente proyecta líneas de luz sobre el río oscuro. El agua arrastra folletos empapados; al otro lado, las ventanas iluminadas esconden vidas corrientes ajenas a la política de la noche."})
 ]);
 const people=[
  {x:23,y:66,span:87,speed:5.4,phase:0.2,coat:"#63536c",skin:"#bc9183",umbrella:true},
  {x:19,y:148,span:84,speed:-6.1,phase:3.9,coat:"#566376",skin:"#d0a28c",umbrella:false},
  {x:311,y:68,span:141,speed:7.4,phase:6.2,coat:"#866063",skin:"#d2ac93",umbrella:true},
  {x:287,y:217,span:143,speed:-5.8,phase:11.1,coat:"#5b6b6b",skin:"#b58975",umbrella:false},
  {x:25,y:289,span:127,speed:6.9,phase:4.9,coat:"#66555f",skin:"#bd9d93",umbrella:true},
  {x:316,y:289,span:148,speed:-7.1,phase:8.7,coat:"#4c6875",skin:"#cd9c85",umbrella:false},
  {x:126,y:143,span:86,speed:4.8,phase:1.4,coat:"#6c5155",skin:"#a97e65",umbrella:false},
  {x:174,y:64,span:88,speed:-5.4,phase:14.1,coat:"#64755e",skin:"#cfad90",umbrella:true},
  {x:23,y:217,span:91,speed:5.2,phase:8.4,coat:"#565265",skin:"#d0b69f",umbrella:false},
  {x:373,y:143,span:94,speed:-5.7,phase:17.1,coat:"#887768",skin:"#bf9984",umbrella:true},
  {x:166,y:291,span:75,speed:4.8,phase:10.2,coat:"#495f68",skin:"#d6ad98",umbrella:false},
  {x:277,y:143,span:88,speed:-5.2,phase:19.1,coat:"#706c70",skin:"#cba28c",umbrella:false}
 ];
 const cars=[
  {x:0,y:78,speed:17.5,start:2.1,body:"#4b6070",head:"#f1d2aa"},
  {x:0,y:222,speed:-13.2,start:7.4,body:"#675364",head:"#dbb5ad"},
  {x:0,y:150,speed:21.6,start:14.4,body:"#546560",head:"#f0d3a9"}
 ];
 function rect(c,x,y,w,h,color){
  c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));
 }
 function glow(c,x,y,r,rgb,a){
  if(!c.createRadialGradient)return;
  const grad=c.createRadialGradient(x,y,1,x,y,r);
  grad.addColorStop(0,"rgba("+rgb+","+Math.max(0,a).toFixed(3)+")");
  grad.addColorStop(1,"rgba("+rgb+",0)");
  c.fillStyle=grad;c.fillRect(x-r,y-r,r*2,r*2);
 }
 const wrap=(v,max)=>((v%max)+max)%max;
 function miniPedestrian(c,x,y,o,time,still=false){
  x=Math.round(x);y=Math.round(y);
  const walking=still?0:Math.round(Math.sin(time*9+o.phase)*2);
  rect(c,x-5,y+5,12,3,"#0c131a80");
  rect(c,x-4-walking,y-1,3,7,"#242430");
  rect(c,x+2+walking,y-1,3,7,"#242430");
  rect(c,x-5,y-13,11,14,"#181d2a");
  rect(c,x-4,y-12,9,12,o.coat);
  rect(c,x-2,y-20,6,6,o.skin);
  rect(c,x-3,y-21,8,3,"#34303a");
  rect(c,x-7,y-10,3,7,o.coat);
  rect(c,x+6,y-10,3,7,o.coat);
  if(o.umbrella){
   rect(c,x-1,y-27,2,17,"#a5a0a4");
   rect(c,x-12,y-27,25,3,"#323842");
   rect(c,x-9,y-31,19,4,"#535966");
   rect(c,x-5,y-33,11,2,"#777582");
  }
 }
 function taxi(c,x,y,o,time){
  x=Math.round(x);y=Math.round(y);
  const reversed=o.speed<0;
  rect(c,x+2,y+9,31,4,"#0a121caa");
  rect(c,x,y,34,10,"#1a1e29");
  rect(c,x+2,y+2,30,7,o.body);
  rect(c,x+9,y+1,15,6,"#28394b");
  rect(c,x+11,y+2,6,3,"#607586");
  rect(c,x+19,y+2,4,3,"#7e8fa0");
  rect(c,x+4,y+8,6,3,"#1a1c27");
  rect(c,x+26,y+8,6,3,"#171923");
  rect(c,x+(reversed?2:30),y+4,4,3,o.head);
  rect(c,x+(reversed?29:1),y+4,3,3,"#ad6671");
  if((Math.floor(time*1.6)+Math.abs(Math.round(o.start)))%6<3)rect(c,x+14,y-2,8,3,"#d1b997");
  // Reflejos sutiles en el asfalto mojado.
  rect(c,x+5,y+13,19,1,"#b1b7bc39");
  rect(c,x+9,y+15,12,1,"#d6ae9933");
 }
 function traffic(c,time,clockMinutes=1200){
  const minutes=Number.isFinite(clockMinutes)?clockMinutes:1200;
  const dawn=minutes>=270&&minutes<=360;
  const count=dawn?2:3;
  for(let i=0;i<count;i++){
   const o=cars[i],x=wrap(o.speed*time+o.start*32,WIDTH+65)-40;
   taxi(c,x,o.y,o,time);
  }
 }
 function street(c,time,game,enabled=true){
  if(!enabled)return;
  const minutes=game?.clock?.minutes??1200;
  traffic(c,time,minutes);
  const hour=Math.floor(minutes/60)%24;
  const count=hour>=2&&hour<6?6:hour>=20||hour<2?12:8;
  const xPlayer=game?.x??-100,yPlayer=game?.y??-100;
  for(let i=0;i<count;i++){
   const p=people[i],x=p.x+wrap(p.speed*time+p.phase*7,p.span),y=p.y+Math.sin(time*.35+i)*1.2;
   if(Math.hypot(x-xPlayer,y-yPlayer)<29)continue; // Respeta la legibilidad del protagonista.
   miniPedestrian(c,x,y,p,time);
  }
  for(let i=0;i<9;i++){
   const x=20+i*53,y=75+(i%3)*73;
   glow(c,x,y,18,"240,188,124",.026+.012*Math.sin(time*1.6+i));
  }
 }
 const venues={
  stjuly:[{x:77,y:229,coat:"#785267",skin:"#cb9988",umbrella:false},
          {x:180,y:245,coat:"#53616f",skin:"#ceac93",umbrella:false},
          {x:388,y:229,coat:"#74535f",skin:"#b98f7c",umbrella:false}],
  elysee:[{x:102,y:244,coat:"#647489",skin:"#d0ab90",umbrella:false},
          {x:382,y:243,coat:"#6a6070",skin:"#c69d89",umbrella:false}],
  bastilla:[{x:61,y:249,coat:"#81605a",skin:"#c09986",umbrella:false},
            {x:408,y:248,coat:"#585d69",skin:"#ae8d7a",umbrella:false}],
  saintdenis:[{x:75,y:249,coat:"#566877",skin:"#c0987b",umbrella:false}],
  hemeroteca:[{x:391,y:250,coat:"#777077",skin:"#c1a18a",umbrella:false}],
  policia:[{x:397,y:249,coat:"#5e727c",skin:"#c1a28c",umbrella:false}],
  passy:[],tuneles:[]
 };
 function interior(c,id,time,game,enabled=true){
  if(!enabled)return;
  const extras=venues[id]||[];
  const playerX=game?.x??-100,playerY=game?.y??-100;
  extras.forEach((p,i)=>{
   const x=p.x+Math.sin(time*.48+i)*2.3,y=p.y;
   if(Math.hypot(playerX-x,playerY-y)<24)return;
   miniPedestrian(c,x,y,{...p,phase:i},time,true);
  });
  if(id==="stjuly"){
   // Cambios muy leves de intensidad para la luz de la barra.
   glow(c,129,148,47,"226,109,164",.032+.02*Math.sin(time*1.2));
   glow(c,351,179,32,"208,125,180",.023+.016*Math.sin(time*1.5));
  }
  if(id==="passy"||id==="tuneles"||id==="policia"){
   const base=id==="tuneles"?"121,195,170":id==="passy"?"182,145,213":"147,186,211";
   glow(c,343,179,42,base,.027+.013*Math.sin(time*1.4));
   const x=id==="tuneles"?79:347;
   rect(c,x,166,22,2,"#bad9d74a");
   if(Math.sin(time*1.2)>0)rect(c,x+5,172,9,1,"#a3d2c25c");
  }
 }
 function foreground(c,scene,id,time,enabled=true,player=null){
  if(scene==="district"){
   // Capa de profundidad DESPUÉS del sprite: ramas y farolas pueden quedar
   // entre el jugador y la cámara, sin crear obstáculos o colisiones.
   rect(c,0,0,7,HEIGHT,"#09111a45");
   rect(c,WIDTH-7,0,7,HEIGHT,"#09111a45");
   if(enabled){
    const cold=id==="policia"?"158,207,233":id==="tuneles"?"113,186,157":
      id==="stjuly"?"229,118,173":id==="bastilla"?"240,154,119":
      id==="passy"||id==="elysee"?"235,200,155":"229,180,126";
    for(const [x,y] of [[189,112],[295,179],[30,137],[452,181]]){
     // Halos situados sobre el poste (primer plano de iluminación).
     glow(c,x,y-12,25,cold,.033+.009*Math.sin(time*1.1+x));
     rect(c,x-1,y-16,2,11,"#dfc49f44");
    }
    for(const [x,y] of [[65,147],[350,169],[234,210],[338,249]]){
     const wobble=Math.sin(time*1.2+x)*.3;
     glow(c,x,y,20,cold,.024+wobble*.01);
     rect(c,x-8,y+8,16,1,"#bdc9c02d");
    }
   }
   // La copa está por delante únicamente cuando el personaje pasa detrás.
   for(const x of [77,392]){
    if(!player||Math.abs(player.x-x)>19||player.y<234||player.y>274)continue;
    rect(c,x-14,244,30,14,"#253d36e8");
    rect(c,x-11,240,24,11,"#3e6454ef");
    rect(c,x-6,237,14,6,"#587b67ec");
    rect(c,x-12,251,7,3,"#688a74c5");
    rect(c,x+5,248,7,3,"#72947ac5");
   }
   return;
  }
  if(scene==="paris"){
   // Viñeta por capas sólo en los extremos. El centro y los destinos siguen libres.
   rect(c,0,0,10,HEIGHT,"#0b101b4f");
   rect(c,WIDTH-10,0,10,HEIGHT,"#0b101b4f");
   if(enabled){
    for(let i=0;i<4;i++){
     const x=13+i*149,y=24+Math.sin(time*.6+i)*2;
     glow(c,x,y,20,"216,180,142",.027);
    }
   }
   return;
  }
  // Elementos de primer plano sobre el personaje, sólo en bordes exteriores.
  const wood=scene==="venue"&&id==="tuneles"?"#1c3b3b":"#211c29";
  rect(c,0,193,12,107,wood);
  rect(c,468,193,12,107,wood);
  rect(c,10,194,3,76,"#b3977a36");
  rect(c,467,194,3,76,"#9b86943b");
  rect(c,0,292,194,8,"#15141ee0");
  rect(c,287,292,193,8,"#15141ee0");
  if(enabled){
   glow(c,24,94,38,scene==="venue"&&id==="tuneles"?"120,195,170":"229,185,131",.035+.008*Math.sin(time*1.3));
  }
 }
 function nearestStreetPoint(x,y,range=25){
  let best=null,dist=range;
  for(const spot of hotspots){
   const d=Math.hypot(x-spot.x,y-spot.y);
   if(d<dist){best=spot;dist=d;}
  }
  return best;
 }
 function landmarkMarkers(c,game,time,enabled=true){
  for(const spot of hotspots){
   const viewed=!!game?.flags?.["street:"+spot.id];
   const pulse=enabled ? 0.12*Math.sin(time*2+spot.x) : 0;
   rect(c,spot.x-7,spot.y-8,14,13,"#191925e0");
   rect(c,spot.x-5,spot.y-7,10,10,viewed?"#6a877a":"#ba9d80");
   rect(c,spot.x-2,spot.y-4,4,4,viewed?"#d3e4d6":"#f1e0b7");
   if(!viewed&&enabled)glow(c,spot.x,spot.y-3,15,"233,193,139",Math.max(.035,.08+pulse));
  }
 }
 return Object.freeze({street,interior,foreground,nearestStreetPoint,landmarkMarkers,hotspots,version:"2.0-phase-VII"});
})();