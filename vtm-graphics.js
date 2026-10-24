"use strict";
/* Motor de arte procedural 2D v2 · 480x300 px lógicos.
 Los fondos se almacenan en memoria; el estado del juego no cambia. */
window.VTM_GRAPHICS=(()=>{
const W=480,H=300,cache=new Map();
const artScenes={
 stjuly:"assets/escenarios/stjuly.svg",
 elysee:"assets/escenarios/elysee.svg",
 passy:"assets/escenarios/passy.svg",
 tuneles:"assets/escenarios/tuneles.svg",
 bastilla:"assets/escenarios/bastilla.svg",
 saintdenis:"assets/escenarios/saintdenis.svg",
 hemeroteca:"assets/escenarios/hemeroteca.svg",
 policia:"assets/escenarios/policia.svg"
};
const artResidences={
 Toreador:"assets/residencias/toreador.svg",
 Ventrue:"assets/residencias/ventrue.svg",
 Tremere:"assets/residencias/tremere.svg",
 Nosferatu:"assets/residencias/nosferatu.svg",
 Brujah:"assets/residencias/brujah.svg",
 Gangrel:"assets/residencias/gangrel.svg",
 Malkavian:"assets/residencias/malkavian.svg"
};
const artRooms={};
for(const clan of Object.keys(artResidences)){
 const stem=clan.toLowerCase();
 artRooms[clan+":study"]="assets/residencias/"+stem+"-despacho.svg";
 artRooms[clan+":quarters"]="assets/residencias/"+stem+"-habitaciones.svg";
}
const scenePictures={};
function registerBackplates(items,prefix){
 for(const [name,url] of Object.entries(items)){
   scenePictures[prefix+name]={url:"./"+url+"?v=escenarios-2",img:null,ready:false,loading:false,failed:false};
 }
}
registerBackplates(artScenes,"venue:");
registerBackplates(artResidences,"residence:");
registerBackplates(artRooms,"room:");
function renderBackplate(c,key){
 const entry=scenePictures[key];
 if(!entry)return false;
 if(!entry.ready){
   if(!entry.loading&&!entry.failed&&typeof Image==="function"){
     entry.loading=true;
     const img=new Image();
     entry.img=img;
     img.onload=()=>{entry.ready=!!img.naturalWidth;entry.failed=!entry.ready;entry.loading=false;};
     img.onerror=()=>{entry.failed=true;entry.ready=false;entry.loading=false;};
     img.src=entry.url;
   }
   if(!entry.ready)return false;
 }
 try{
   c.drawImage(entry.img,0,0,480,300);
   return true;
 }catch(e){entry.ready=false;entry.failed=true;entry.loading=false;return false;}
}
function backgroundStatus(){
 const keys=Object.keys(scenePictures);
 return {total:keys.length,ready:keys.filter(k=>scenePictures[k].ready).length,
 loading:keys.filter(k=>scenePictures[k].loading).length,
 failed:keys.filter(k=>scenePictures[k].failed).map(k=>k)};
}
const atlasRows={Toreador:0,Ventrue:1,Tremere:2,Nosferatu:3,Brujah:4,Gangrel:5,Malkavian:6,Ghoul:7,
 isabelle:8,ingrid:9,lucien:10,john:11,marcus:12,dupont:13,guardiana:14,archivista:15};
let atlas=null,atlasReady=false,atlasFailed=false;
if(typeof Image==="function"){
 atlas=new Image();
 atlas.onload=()=>{atlasReady=!!atlas.naturalWidth;atlasFailed=!atlasReady;};
 atlas.onerror=()=>{atlasReady=false;atlasFailed=true;};
 atlas.src="./assets/personajes-paris-v3.svg?v=vtm20-f6";
}
function drawSprite(c,x,y,opts){
 if(!atlasReady||!atlas)return false;
 const direction={down:0,left:1,right:2,up:3}[opts.facing]??0;
 const row=opts.npc&&atlasRows[opts.npc.id]!=null?atlasRows[opts.npc.id]:
  !opts.master&&!opts.npc&&!opts.embraced?atlasRows.Ghoul:(atlasRows[opts.clan]??atlasRows.Ghoul);
 const moving=!!opts.walking;
 const frame=moving?Math.floor(Math.abs(opts.cycle||0)*2.4)%4:0;
 const bounce=moving&&(frame===1||frame===3)?-1:0;
 const idleBreath=!moving&&Math.sin((opts.time||0)*1.35+row*.4)>.96?-1:0;
 const offset=bounce+idleBreath;
 try{
  // Sombra anclada al suelo; sólo el gráfico del personaje se mueve.
  rect(c,x-9,y+22,18,3,"#0a101a70");
  c.drawImage(atlas,(direction*4+frame)*32,row*48,32,48,Math.round(x)-16,Math.round(y)-21+offset,32,48);
  if(moving){
   const step=frame%2?1:-1,coat=opts.npc?.color||"#5c4a58";
   rect(c,x-9+step*2,y+13+offset,3,6,coat+"aa");
   rect(c,x+7-step*2,y+13+offset,2,5,"#302833aa");
   if(frame===0||frame===2)rect(c,x-4,y+24,8,1,"#c5b4a142");
  }
  window.VTM_ART_POLISH?.character(c,x,y,opts);
  if(opts.npc||opts.master){
   rect(c,x-23,y-36,46,12,"#101420c9");
   text(c,opts.npc?(opts.npc.name.length>14?opts.npc.name.slice(0,12):opts.npc.name):"DOMITOR",x,y-27,7,"#ecd1b3");
  }
  return true;
 }catch(e){atlasFailed=true;atlasReady=false;return false;}
}
const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));};
const text=(c,t,x,y,size=9,color="#ead2b4")=>{c.textAlign="center";c.font="bold "+size+"px monospace";c.fillStyle=color;c.fillText(t,x,y);};
const noise=(x,y,z=0)=>{let n=Math.imul(x+31,374761393)^Math.imul(y+17,668265263)^Math.imul(z+91,1442695041);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;};
function glow(c,x,y,r,rgb="240,195,150",a=.18){if(!c.createRadialGradient)return;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,"rgba("+rgb+","+a+")");g.addColorStop(1,"rgba("+rgb+",0)");c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
function drawCached(c,key,paint){let b=cache.get(key);if(!b){b=document.createElement("canvas");b.width=W;b.height=H;const ctx=b.getContext("2d");ctx.imageSmoothingEnabled=false;paint(ctx);cache.set(key,b);if(cache.size>16)cache.delete(cache.keys().next().value);}c.drawImage(b,0,0);}
function cobbles(c,bg,offset=0){rect(c,0,0,W,H,bg);for(let y=0;y<300;y+=15)for(let x=0;x<480;x+=24){const v=noise(x,y,offset);rect(c,x+2+(y%2)*3,y+3,19,1,v>.45?"#c1b3aa30":"#070b162a");if(v>.8)rect(c,x+10,y+8,3,2,"#d0c3af23");}}
function lamp(c,x,y){rect(c,x-1,y-17,3,21,"#786e74");rect(c,x-6,y-21,13,6,"#ebbc87");rect(c,x-3,y-23,7,3,"#fff1bb");glow(c,x,y-15,36,"249,187,124",.16);}
function windowPane(c,x,y,w,h){rect(c,x-3,y-4,w+6,h+8,"#211c29");rect(c,x,y,w,h,"#444357");rect(c,x+3,y+3,w-6,h-6,"#293447");rect(c,x+w/2-1,y,3,h,"#a38a82");rect(c,x,y+h/2,w,3,"#a38a82");rect(c,x-6,y+h,w+12,4,"#79616a");}
function door(c,x,y,label){rect(c,x-18,y-29,36,29,"#17131e");rect(c,x-14,y-26,28,26,"#795761");rect(c,x-9,y-22,18,20,"#362533");rect(c,x+7,y-12,2,3,"#ebc89c");text(c,label,x,y-34,8);}
function shelves(c,x,y,w,h,color){rect(c,x,y,w,h,color);rect(c,x+5,y+6,w-10,h-12,"#25202a");for(let k=0;k<3;k++){const yy=y+9+k*21;for(let xx=x+9;xx<x+w-10;xx+=9)rect(c,xx,yy,6,15,["#986f6a","#78788d","#b29379","#707d70"][Math.floor(noise(xx,yy)*4)]);rect(c,x+4,yy+16,w-8,3,color);}}
/* París nocturno v3: atlas urbano procedural en escala 480x300.
   Fondo puramente cosmético. Los centros de los 8 destinos y los controles
   no se recalculan: los jugadores conservan las mismas coordenadas. */
function buildingBlock(c,x,y,i,j){
 const n=noise(i,j,43),east=x>315,industrial=y>204,west=x<173;
 const palette=industrial?["#393843","#45404b","#4d4047","#363b44"]:
  east?["#57505d","#514553","#4b485b","#62515a"]:
  west?["#51444e","#464251","#5a4850","#494752"]:
  ["#463c4a","#51424d","#493f52","#5a434d"];
 const roof=palette[Math.min(3,Math.floor(n*4))];
 const w=47+Math.floor(noise(i,j,17)*9),h=31+Math.floor(noise(i,j,19)*8);
 rect(c,x+2,y+5,w+2,h+2,"#131721");
 rect(c,x+4,y+1,w-2,h+1,"#7f70752b");
 rect(c,x+5,y+3,w-4,h-2,roof);
 rect(c,x+8,y+7,w-10,h-9,"#302e3d");
 // Perspectiva de tejados mansarda, ligeramente inclinados en ambas laderas.
 rect(c,x+7,y+4,w-8,3,"#867176");
 rect(c,x+10,y+10,w-16,h-17,roof);
 rect(c,x+9,y+h-6,w-13,2,"#201f2e");
 if(n>.36){
  for(let k=0;k<3;k++){
   const wx=x+13+k*12,lit=noise(wx,j,54)>.57;
   rect(c,wx-1,y+12,9,12,"#171e2c");
   rect(c,wx,y+13,7,9,lit?"#c6a181":"#3b4354");
   rect(c,wx+3,y+13,1,9,"#292d3d");
   rect(c,wx,y+17,7,1,"#62555c");
   if(lit)rect(c,wx+1,y+14,2,2,"#f0d3a1");
  }
 }else{
  // Taller, almacén o pequeño patio interior.
  rect(c,x+15,y+12,w-28,h-20,"#2a333c");
  rect(c,x+17,y+14,w-32,h-24,industrial?"#526169":"#566259");
  rect(c,x+20,y+17,5,5,"#2b343d");
  if(noise(i,j,62)>.5)rect(c,x+23,y+18,8,3,"#a49c91");
 }
 if(n>.73){
  rect(c,x+w-17,y+1,9,10,"#76666a");
  rect(c,x+w-15,y-2,5,4,"#21212a");
  rect(c,x+w-12,y+3,1,4,"#c2a294");
 }
 if(n<.23){rect(c,x+8,y+6,2,h-12,"#9d8280");rect(c,x+w-3,y+7,2,h-13,"#302b35");}
 if(industrial)for(let k=0;k<3;k++)rect(c,x+13+k*12,y+h-11,6,3,"#70818d");
}
function streetTree(c,x,y,r=7){
 rect(c,x+1,y+4,2,6,"#625753");
 rect(c,x-r,y-r,r*2+2,r*2,"#15282a");
 rect(c,x-r+2,y-r+2,r*2-2,r*2-3,"#305047");
 rect(c,x-2,y-r+2,r,4,"#527663");
 rect(c,x+r-4,y+1,3,2,"#71917b");
}
function streetLamp(c,x,y){
 rect(c,x-1,y-8,2,10,"#827c7d");
 rect(c,x-4,y-10,8,3,"#e8c28f");
 rect(c,x-2,y-12,4,2,"#ffe4b1");
 glow(c,x,y-7,15,"229,179,119",.13);
 rect(c,x-5,y+3,10,1,"#c09b7750");
}
function boulevard(c,y,seed){
 rect(c,0,y-4,480,4,"#8b8383");
 rect(c,0,y,480,18,"#2d323f");
 rect(c,0,y+18,480,3,"#847b7e");
 rect(c,0,y+21,480,3,"#53525d");
 for(let x=0;x<480;x+=29){
  rect(c,x+7,y+9,14,1,"#afa999");
  if(noise(x,y,seed)>.55)rect(c,x+6,y+15,13,1,"#889aa349");
 }
 for(let x=12;x<480;x+=73){
  rect(c,x,y-3,12,1,"#b3a097");
  if(noise(x,y,91)>.38)streetLamp(c,x,y-2);
 }
 for(const x of [106,220,334,439]){
  for(let n=0;n<3;n++)rect(c,x-6+n*6,y+1,3,16,"#c4baaa80");
 }
}
function stoneBridge(c,x,y){
 rect(c,x-11,y-6,28,48,"#201e2a");
 rect(c,x-9,y-7,24,47,"#b0a097");
 rect(c,x-7,y-7,20,45,"#77717d");
 rect(c,x-7,y-5,20,2,"#ded1b1");
 rect(c,x-7,y+37,20,2,"#d0c0ac");
 for(let yy=y+2;yy<y+37;yy+=11){rect(c,x+1,yy,3,6,"#c4b6a8");}
 for(const xx of [x-9,x+14]){
  rect(c,xx,y-5,2,44,"#ded0c2");
  for(let yy=y;yy<y+35;yy+=8)rect(c,xx,yy,2,3,"#4b4149");
 }
}
function riverside(c){
 // Sena sinuoso con orillas, piedras húmedas, reflejos y tres puentes.
 for(let x=0;x<480;x+=3){
  const wave=Math.round(185+Math.sin(x/70)*7);
  rect(c,x,wave-5,3,4,"#aaa09a");
  rect(c,x,wave-1,3,32,"#172c40");
  rect(c,x,wave+4,3,21,"#254459");
  rect(c,x,wave+31,3,3,"#a59b95");
  if(noise(x,Math.floor(wave),81)>.45){
   rect(c,x,wave+8,2,1,"#7792a4");
   rect(c,x+1,wave+20,2,1,"#b2a390");
  }
  if(noise(x,31,4)>.86)rect(c,x+2,wave+13,1,6,"#92a8ad");
 }
 for(const x of [104,226,347]){
  const y=Math.round(185+Math.sin(x/70)*7);
  stoneBridge(c,x,y);
 }
}
function cityBackground(c){
 // Barrios: norte histórico, tejido bohemio occidental, residencias de
 // Passy al este y edificios industriales al sur.
 rect(c,0,0,W,H,"#242833");
 for(let j=0,y=0;y<300;j++,y+=45){
  for(let i=0,x=0;x<480;i++,x+=60){
   const garden=noise(i,j,63)>.86&&j!==0;
   if(garden){
    rect(c,x+3,y+4,54,36,"#18282c");
    rect(c,x+5,y+6,50,33,"#29423d");
    rect(c,x+5,y+6,50,2,"#758477");
    for(let n=0;n<4;n++){
     const tx=x+13+(n%2)*25,ty=y+14+Math.floor(n/2)*16;
     streetTree(c,tx,ty,5);
    }
    rect(c,x+27,y+9,2,26,"#a6a092");
   }else buildingBlock(c,x,y,i,j);
  }
 }
 // Pasajes verticales y calzadas con veredas dibujadas por encima de los
 // tejados: una misma gramática urbana en toda la vista.
 for(const x of [105,218,334,442]){
  rect(c,x-5,0,23,300,"#706b71");
  rect(c,x-3,0,19,300,"#2d323f");
  rect(c,x-3,0,2,300,"#948987");
  rect(c,x+14,0,2,300,"#aaa095");
  for(let y=0;y<300;y+=25){
   rect(c,x+5,y+6,2,10,"#bfb4a37a");
   if(noise(x,y,53)>.7)rect(c,x+10,y+19,3,1,"#9baab646");
  }
 }
 for(const y of [69,140,222,277])boulevard(c,y,17);
 riverside(c);
 // Plazas y arbolado urbano en torno a los bulevares.
 for(const [x,y] of [[30,62],[67,126],[165,124],[303,65],[371,134],[459,262]]){
  rect(c,x-12,y-4,25,18,"#767673");
  rect(c,x-10,y-2,21,14,"#536456");
  streetTree(c,x-2,y+5,7);
  rect(c,x+9,y+8,3,3,"#bdaf99");
 }
 // Marquesinas, jardines, bancos y coches aparcados complementan el tráfico
 // animado que ya existe en VTM_AMBIENCE.
 for(const [x,y,color] of [[19,96,"#646576"],[76,260,"#776267"],[291,116,"#52616c"],[455,109,"#5b6b70"]]){
  rect(c,x+2,y+5,23,4,"#111820");
  rect(c,x,y,27,10,color);
  rect(c,x+5,y+2,14,5,"#293b4b");
  rect(c,x+8,y+3,7,2,"#7897a5");
  rect(c,x+2,y+9,4,2,"#1b202c");
  rect(c,x+21,y+9,4,2,"#1b202c");
 }
 for(const [x,y] of [[54,118],[325,119],[36,252]]){
  rect(c,x,y,15,3,"#a89078");rect(c,x+2,y+3,2,4,"#4c4245");rect(c,x+12,y+3,2,4,"#4c4245");
 }
 // Ligera viñeta ambiental: no oscurece la zona central ni tapa etiquetas.
 rect(c,0,0,480,3,"#0b111a66");
 rect(c,0,296,480,4,"#0a111a66");
}
/* Los edificios y sus etiquetas son marcadores a escala de barrio, no paneles
   gigantes que tapen varias manzanas. El centro del marcador se conserva
   exactamente sobre el centro del destino usado por la interacción. */
const mapNames={hemeroteca:"Hemeroteca",stjuly:"St. July",elysee:"Elíseo",
 saintdenis:"Saint-Denis",tuneles:"Túneles",policia:"Archivo policial",
 passy:"Casa de Passy",bastilla:"Bastilla"};
function landmarkArchitecture(c,id,cx,cy,color){
 const x=cx-24,y=cy-18;
 // Todos los destinos comparten escala; cada arquitectura conserva materiales
 // y una silueta propia, en lugar de marcos idénticos superpuestos al mapa.
 rect(c,x-3,y+5,54,34,"#101520af");
 rect(c,x-2,y+1,52,32,"#8b817c");
 rect(c,x,y+3,48,30,"#36313d");
 if(id==="hemeroteca"){
  // Biblioteca histórica: cubierta de zinc, frontón, pórtico y vanos altos.
  rect(c,x+4,y-3,40,9,"#43515d");
  rect(c,x+10,y-6,28,4,"#727986");
  rect(c,x+4,y+7,40,22,"#a4978f");
  rect(c,x+1,y+6,46,3,"#d6c2ad");
  for(const dx of [7,17,29,39]){
   rect(c,x+dx,y+10,4,18,"#cfc0b4");
   rect(c,x+dx+1,y+12,2,13,"#796e78");
  }
  rect(c,x+20,y+15,8,14,"#1f2635");
  rect(c,x+2,y+29,44,3,"#655d64");
 }else if(id==="stjuly"){
  // Club urbano art déco. La entrada está iluminada en ciruela y ámbar.
  rect(c,x+3,y-5,42,9,"#25222e");
  rect(c,x+5,y-7,38,3,"#98647d");
  rect(c,x+4,y+4,40,26,"#443349");
  for(let i=0;i<4;i++){
   rect(c,x+8+i*9,y+8,5,8,i%2?"#d99f8e":"#b77f9b");
   rect(c,x+10+i*9,y+9,2,6,"#2b2936");
  }
  rect(c,x+14,y+18,20,13,"#1a1725");
  rect(c,x+17,y+18,14,3,"#a56d88");
  rect(c,x+20,y+23,8,8,"#774862");
  rect(c,x+2,y+30,44,2,"#bd8e82");
 }else if(id==="elysee"){
  // Sede principesca: alas simétricas, pórtico y patio monumental.
  rect(c,x+1,y+6,46,23,"#aaa096");
  rect(c,x-3,y+8,12,22,"#c0b09b");
  rect(c,x+39,y+8,12,22,"#c0b09b");
  rect(c,x+8,y+1,32,6,"#615e6a");
  rect(c,x+15,y-4,18,6,"#998d88");
  for(const dx of [10,17,31,38]){
   rect(c,x+dx,y+10,3,14,"#e0cbb1");
   rect(c,x+dx,y+24,3,2,"#76656b");
  }
  rect(c,x+22,y+12,6,17,"#382a38");
  rect(c,x+20,y+29,10,6,"#8e7a78");
  rect(c,x+1,y+32,47,2,"#c4afa1");
 }else if(id==="saintdenis"){
  // Galpones de ladrillo con persianas industriales.
  rect(c,x+2,y-2,44,8,"#393f49");
  rect(c,x+2,y+6,44,25,"#735353");
  for(let i=0;i<6;i++){
   rect(c,x+4+i*7,y+9,5,6,i%2?"#af8879":"#363946");
   rect(c,x+4+i*7,y+16,5,1,"#3f333b");
  }
  rect(c,x+7,y+19,16,12,"#2e313d");
  for(let k=0;k<3;k++)rect(c,x+8,y+21+k*3,13,1,"#77747a");
  rect(c,x+27,y+20,14,11,"#2c252e");
  rect(c,x+29,y+23,8,2,"#af6664");
  rect(c,x+1,y+31,46,2,"#48333d");
 }else if(id==="tuneles"){
  // Acceso subterráneo: caseta de piedra y gran reja en el pavimento.
  rect(c,x+1,y+5,46,28,"#414b4a");
  rect(c,x+4,y+7,40,24,"#62625e");
  rect(c,x+7,y+8,34,5,"#979087");
  rect(c,x+11,y+13,26,18,"#131f24");
  for(let k=0;k<7;k++)rect(c,x+13+k*4,y+15,2,14,"#60766e");
  rect(c,x+12,y+17,24,2,"#495d58");
  rect(c,x+12,y+26,24,2,"#495d58");
  rect(c,x+4,y+31,40,2,"#292b31");
 }else if(id==="policia"){
  // Archivo administrativo: piedra fría, escalones y dos faroles azules.
  rect(c,x+2,y-3,44,8,"#596878");
  rect(c,x+4,y-5,40,2,"#a7acb1");
  rect(c,x+4,y+6,40,24,"#82888e");
  for(const dx of [8,16,32,40]){
   rect(c,x+dx,y+10,4,9,"#293744");
   rect(c,x+dx,y+10,4,1,"#c4b7ac");
  }
  rect(c,x+20,y+16,8,14,"#2b3041");
  rect(c,x+20,y+17,8,2,"#aeb2bc");
  rect(c,x+15,y+30,18,3,"#a4a0a1");
  for(const dx of [5,43])rect(c,x+dx,y+21,3,5,"#8eb3c7");
 }else if(id==="passy"){
  // Mansión aristocrática de Passy con jardín y cubierta mansarda.
  rect(c,x-4,y+10,56,23,"#2d4c44");
  for(const dx of [0,47])streetTree(c,x+dx,y+20,6);
  rect(c,x+6,y+3,36,27,"#a39a9f");
  rect(c,x+6,y-2,36,7,"#4f4a5a");
  rect(c,x+12,y-5,23,3,"#666171");
  for(const dx of [10,18,31,39]){
   rect(c,x+dx,y+9,4,9,"#d4bda1");
   rect(c,x+dx+1,y+10,2,6,"#3b4558");
  }
  rect(c,x+22,y+16,7,14,"#342d3c");
  rect(c,x+5,y+30,38,2,"#dbccc1");
 }else if(id==="bastilla"){
  // Fachadas de locales, escaparates y pequeña marquesina rojiza.
  rect(c,x+2,y+1,44,30,"#6b4c51");
  rect(c,x+2,y-3,44,5,"#34313d");
  for(const dx of [8,19,30,39]){
   rect(c,x+dx,y+7,5,7,"#d09f88");
   rect(c,x+dx+1,y+8,3,5,"#353040");
  }
  rect(c,x+5,y+18,38,12,"#302531");
  rect(c,x+9,y+18,10,7,"#92566c");
  rect(c,x+24,y+19,10,11,"#211d2b");
  rect(c,x+4,y+16,40,3,"#b47d73");
  rect(c,x+8,y+30,34,2,"#8e5a5d");
 }else{
  rect(c,x+5,y+4,38,27,color);
  rect(c,x+15,y+15,18,14,"#262331");
 }
 // Puertas resaltadas por el suelo mojado, sin alterar los hotspots.
 rect(c,cx-4,cy+15,8,2,"#d2b49a55");
}
function mapDestination(c,loc,active,color,locked,time){
 const cx=Math.round((loc.x+loc.w/2)/2.1);
 const cy=Math.round((loc.y+loc.h/2)/2);
 landmarkArchitecture(c,loc.id,cx,cy,color);
 const label=mapNames[loc.id]||loc.name;
 const labelWidth=Math.max(37,Math.min(80,Math.ceil(label.length*4.2+10)));
 const lx=Math.round(cx-labelWidth/2),ly=cy+19;
 // Rótulo discreto, independiente del edificio y legible sobre tejados.
 rect(c,lx-1,ly-1,labelWidth+2,12,"#0d121bbd");
 rect(c,lx,ly,labelWidth,10,locked?"#3e303d":"#222733");
 rect(c,lx,ly,labelWidth,1,active?"#e2b981":color);
 text(c,label,cx,ly+8,7,active?"#ffe1aa":"#e0d4c4");
 if(locked){
  rect(c,cx+15,cy-15,8,8,"#4f3743");
  rect(c,cx+17,cy-13,4,4,"#c98c92");
 }
 if(active){
  const pulse=Math.sin(time*2.8+cx)*.05+.16;
  glow(c,cx,cy-21,14,"238,191,121",pulse);
  rect(c,cx-2,cy-32,5,8,"#ecc58d");
  text(c,"!",cx,cy-25,6,"#2a2230");
 }
}
function mapResidence(c){
 // La residencia comparte escala con los otros destinos; el personaje aparece
 // encima, sin quedar encerrado dentro de un cartel rectangular de 85x55 px.
 const cx=43,cy=256;
 rect(c,cx-17,cy-13,34,17,"#12141d99");
 rect(c,cx-13,cy-17,27,5,"#a48a80");
 rect(c,cx-12,cy-12,25,15,"#4b3a45");
 rect(c,cx-8,cy-8,5,6,"#e0b38a");
 rect(c,cx+4,cy-8,5,6,"#ac9aa5");
 rect(c,cx-2,cy-8,5,11,"#211d29");
 // Rótulo sobre la casa, lejos de la barra inferior de controles.
 rect(c,10,220,70,13,"#11151ee8");
 rect(c,11,221,68,11,"#322b39");
 rect(c,12,221,66,1,"#b89a7c");
 text(c,"RESIDENCIA",45,229,7,"#f1d6b7");
}
function drawCity(c,game,D,N,time){
 drawCached(c,"paris",cityBackground);
 for(const loc of D.locations){
  const active=D.quests.some(q=>q.id===game.activeQuest&&q.place===loc.id)||
   (game.activeQuest==="archivos"&&["policia","stjuly","hemeroteca"].includes(loc.id))||
   Object.values(game.sideQuests||{}).some(q=>q.status==="active"&&window.VTM_ARCS.personal[q.id]?.target===loc.id);
  const color=N.environments[loc.id]?.accent||"#806b74";
  mapDestination(c,loc,active,color,loc.id==="elysee"&&!game.access?.elysee,time);
 }
 mapResidence(c);
}

function residenceBase(c,room,clan,data){
 const nos=clan==="Nosferatu",trem=clan==="Tremere";
 cobbles(c,data.floor,clan.length);
 if(["Toreador","Brujah","Gangrel"].includes(clan)){
  for(let y=40;y<300;y+=17){rect(c,0,y,480,2,"#15141d55");for(let x=y%2?0:40;x<480;x+=72)rect(c,x,y+2,1,14,"#14172055");}
 }
 rect(c,0,0,480,39,data.wall);rect(c,0,37,480,3,data.metal);
 rect(c,0,0,17,300,"#171720");rect(c,463,0,17,300,"#171720");
 for(let x=18;x<470;x+=85){rect(c,x,0,8,208,"#1b1822");rect(c,x+2,0,4,200,data.furniture);rect(c,x-7,37,21,6,data.metal);}
 if(nos){for(let y of [60,110]){rect(c,28,y,424,8,"#3e5956");rect(c,28,y+2,422,2,"#99ad9f");}}
 else{windowPane(c,57,46,47,63);windowPane(c,368,46,47,63);}
 lamp(c,22,110);lamp(c,458,110);
 rect(c,148,181,185,94,"#251c29");rect(c,153,185,176,85,data.rug);rect(c,161,193,160,68,"#302332");rect(c,167,198,149,59,data.rug);
 for(let y=201;y<253;y+=15)for(let x=176;x<310;x+=21)rect(c,x,y,6,2,"#ceb7a35c");
 if(room==="house"){
  rect(c,180,68,120,69,data.furniture);rect(c,189,76,103,51,"#211d2b");rect(c,197,85,88,29,data.rug);
  rect(c,24,143,129,69,data.furniture);rect(c,30,148,117,56,"#3e2c39");
  rect(c,81,146,60,28,"#e7d3b7");rect(c,89,151,44,18,"#b59f8b");rect(c,93,155,30,2,"#6b535c");
  rect(c,329,130,127,81,data.furniture);rect(c,336,136,113,66,"#2e2531");rect(c,343,140,93,48,data.rug);
  rect(c,356,144,66,35,"#d6bea6");rect(c,362,150,54,24,"#423146");
  door(c,38,260,"DESPACHO");door(c,443,260,"HABITACIONES");door(c,240,296,"PARÍS");
 }else if(room==="study"){
  shelves(c,34,106,137,82,data.furniture);shelves(c,309,108,142,81,data.furniture);
  rect(c,119,119,60,43,"#d6bea1");rect(c,126,125,46,30,"#e7d6b7");
  rect(c,314,126,59,47,"#251c2b");rect(c,321,132,45,35,data.metal);
  rect(c,180,193,120,51,data.furniture);rect(c,188,198,104,39,"#a68a75");rect(c,204,203,71,28,"#e0c7a4");
  rect(c,211,208,50,2,"#65545a");rect(c,211,217,44,2,"#8b6a69");
  door(c,240,296,"SALÓN");
 }else{
  rect(c,41,117,151,89,data.furniture);rect(c,49,122,134,75,"#d5c5ad");rect(c,58,131,55,27,"#aa9f9f");
  rect(c,286,110,154,90,data.furniture);rect(c,294,118,136,72,data.rug);rect(c,302,126,120,56,"#342b37");
  rect(c,319,134,81,27,"#d0bda8");
  rect(c,114,121,60,32,"#826558");rect(c,119,125,50,23,"#b68f76");
  rect(c,306,128,61,27,"#e1d1b7");rect(c,316,132,40,18,"#635367");
  windowPane(c,218,73,45,49);door(c,240,296,"SALÓN");
 }
 if(trem)for(const x of [49,401]){rect(c,x,211,18,22,"#695274");text(c,"◇",x+9,228,14,"#d5bcd3");}
 if(clan==="Brujah")for(let i=0;i<4;i++){rect(c,32+i*34,42,26,17,"#68454b");rect(c,37+i*34,46,15,2,"#a67770");}
 if(clan==="Malkavian"){rect(c,218,9,45,23,"#67586e");rect(c,224,15,32,14,"#b7a5b7");}
 if(clan==="Toreador"){rect(c,230,6,30,28,"#b18b7d");rect(c,237,12,17,16,"#543446");}
 if(clan==="Ventrue")for(const x of [161,307]){rect(c,x,15,26,27,"#b7aba9");rect(c,x+4,20,18,15,"#4d5363");}
}
function drawResidence(c,room,clan,C,game,time,fx=true){
 const d=C.residences[clan];if(!d)return;
 if(!renderBackplate(c,room==="house"?"residence:"+clan:"room:"+clan+":"+room))drawCached(c,"res:"+clan+":"+room,ctx=>residenceBase(ctx,room,clan,d));
 window.VTM_ART_POLISH?.residence(c,room,clan,time,fx);
 for(const obj of C.residenceObjects[room]||[]){
  const seen=!!game.observed[obj.id],pulse=.55+.25*Math.sin(time*3+obj.x);
  rect(c,obj.x-7,obj.y-38,14,14,"#111420d0");rect(c,obj.x-5,obj.y-36,10,10,seen?"#5e8276":"#c3a17f");
  rect(c,obj.x-2,obj.y-33,4,4,seen?"#d2d9c6":"#f1d6a9");
  if(!seen)glow(c,obj.x,obj.y-30,16,"242,184,130",.08*pulse);
 }
 text(c,(room==="house"?d.name:room==="study"?d.study:d.quarters).toUpperCase(),240,23,10,d.metal);
}
function venueBase(c,id,env){
 const dark=id==="tuneles",club=id==="stjuly",court=id==="elysee",archive=["hemeroteca","policia"].includes(id);
 cobbles(c,env.room,id.length);
 rect(c,0,0,480,39,"#171722");rect(c,0,37,480,3,env.accent);
 rect(c,0,39,17,261,"#18151f");rect(c,463,39,17,261,"#18151f");
 for(let x=20;x<461;x+=84){rect(c,x,41,13,170,"#201b29");rect(c,x+3,43,5,163,env.accent);}
 if(dark){
  for(let y of [54,80,117]){rect(c,24,y,432,7,"#3d5b57");rect(c,24,y+2,430,2,"#819d97");}
  for(let x=30;x<446;x+=39)rect(c,x,67,3,106,"#34514d");
 }else{windowPane(c,55,63,58,80);windowPane(c,366,63,58,80);}
 if(club){
  rect(c,44,159,163,75,"#392936");rect(c,51,166,150,14,"#b28b79");rect(c,56,182,139,42,"#2c2734");
  for(let i=0;i<7;i++)rect(c,59+i*18,148,7,22,i%2?"#b69e8c":"#897696");
 }else if(dark){
  rect(c,48,154,152,77,"#213332");
  for(let i=0;i<5;i++){rect(c,54+i*28,164,22,38,"#111d24");rect(c,57+i*28,167,16,22,"#5a8d81");}
 }else if(court){
  rect(c,55,161,370,89,"#9e8a88");rect(c,62,167,356,75,"#5d4555");rect(c,75,178,322,55,"#332936");
 }else if(archive){
  shelves(c,50,154,158,77,id==="policia"?"#676d7b":"#78605b");
  rect(c,56,166,139,57,"#988675");
  for(let i=0;i<6;i++)rect(c,67+i*20,174,15,34,i%2?"#d7c4a7":"#8e7c77");
 }else{
  rect(c,53,160,155,75,"#5d4a53");rect(c,58,168,145,60,"#987d75");
 }
 rect(c,302,156,130,73,"#352c39");rect(c,312,163,112,58,env.accent);rect(c,321,171,93,41,"#2f2836");
 lamp(c,24,100);lamp(c,456,100);door(c,240,298,"SALIR");
}
function drawVenue(c,id,N,game,time,fx=true){
 const env=N.environments[id];if(!env)return;
 if(!renderBackplate(c,"venue:"+id))drawCached(c,"venue:"+id,ctx=>venueBase(ctx,id,env));
 window.VTM_ART_POLISH?.venue(c,id,time,fx);
 text(c,env.label.toUpperCase(),240,24,12);
 if(game.activeQuest||Object.values(game.sideQuests||{}).some(q=>q.status==="active")){
  const pul=.1+.05*Math.sin(time*3);glow(c,130,140,25,"236,183,121",pul);
 }
}


function character(c,x,y,opts={}){
 // En el mapa general una persona ocupa menos de una manzana. Mantener los
 // sprites a escala normal en interiores y barrios visitables.
 if(opts.mapScale||opts.districtScale){
  const k=opts.mapScale?0.46:0.68;
  c.save();c.translate(Math.round(x),Math.round(y));c.scale(k,k);
  character(c,0,0,{...opts,mapScale:false,districtScale:false});
  c.restore();
  if(!opts.npc&&!opts.master){
   const shadowY=opts.mapScale?12:17;
   rect(c,x-5,y+shadowY,10,2,"#dfc09c");
   rect(c,x-2,y+shadowY-1,4,1,"#f2dab7");
  }
  return;
 }
 const spriteDrawn=drawSprite(c,x,y,opts);
 if(spriteDrawn){
   if(opts.appearance&&!opts.master&&!opts.npc)window.VTM_APPEARANCE?.overlay(c,x,y,opts.appearance,opts);
   return;
 }
 const {master=false,clan="Toreador",npc=null,embraced=false,facing="down",walking=false,cycle=0,time=0}=opts;
 x=Math.round(x);y=Math.round(y);
 const palette={Toreador:"#986177",Tremere:"#847096",Brujah:"#975d57",Nosferatu:"#5d7d6b",Ventrue:"#647d96",Gangrel:"#657b60",Malkavian:"#85719a"};
 const jacket=npc?.color||palette[clan]||"#78817d",skin=npc?.skin||(clan==="Nosferatu"?"#a0a18b":"#d4ae98"),hair=npc?.hair||(clan==="Tremere"?"#a8a0a3":"#2b2830");
 const player=!master&&!npc;
 const stride=walking?Math.round(Math.sin(cycle*12)*3):0;
 const bob=walking?Math.round(Math.sin(cycle*12)*1.4):Math.sin(time*1.2+clan.length)>.96?-1:0;
 const sway=walking?Math.round(Math.cos(cycle*12)*2):0;
 rect(c,x-12,y+18,24,5,"#0a0e1699");
 rect(c,x-7-stride,y+12,6,11,"#222833");rect(c,x+2+stride,y+12,6,11,"#1e222e");
 rect(c,x-8-stride,y+20,8,4,"#11151d");rect(c,x+1+stride,y+20,8,4,"#0d111b");
 rect(c,x-11,y-2+bob,22,17,"#151721");rect(c,x-9,y+bob,19,15,player?(embraced?"#734457":"#6e7b80"):jacket);
 rect(c,x-14+sway,y+2+bob,5,13,jacket);rect(c,x+10-sway,y+2+bob,5,13,jacket);
 rect(c,x-10-sway,y+11+bob,4,10,"#302634");rect(c,x+8+sway,y+11+bob,4,10,"#302634");
 rect(c,x-13,y+10+bob,4,3,skin);rect(c,x+11,y+10+bob,4,3,skin);
 rect(c,x-5,y-12+bob,11,14,skin);rect(c,x-6,y-15+bob,12,6,hair);
 rect(c,x-7,y-10+bob,3,8,hair);rect(c,x+5,y-10+bob,3,8,hair);
 if(facing==="down"){rect(c,x-3,y-7+bob,2,2,"#26232c");rect(c,x+3,y-7+bob,2,2,"#26232c");rect(c,x-1,y-3+bob,3,1,"#9d6e6c");}
 else if(facing==="up"){rect(c,x-6,y-12+bob,12,10,hair);rect(c,x-3,y+3+bob,6,7,"#303240");}
 else{const dir=facing==="left"?-1:1;rect(c,x+dir*4,y-7+bob,2,2,"#26232c");rect(c,x+dir*7,y-3+bob,2,1,"#b17b78");}
 if(master||npc){
   rect(c,x-11,y+7+bob,4,14,"#1c1a25");rect(c,x+8,y+7+bob,4,14,"#181923");
   rect(c,x-6,y+3+bob,3,7,"#d8bcab");rect(c,x+5,y+3+bob,3,7,"#bda293");
 }
 if(clan==="Tremere"){rect(c,x-12,y+2,3,15,"#615779");rect(c,x+9,y+2,3,15,"#615779");}
 if(clan==="Nosferatu"){rect(c,x-7,y-11+bob,4,9,"#5c7968");rect(c,x+4,y-9+bob,4,8,"#506b59");}
 if(embraced&&player)rect(c,x-2,y+4+bob,5,3,"#b9778d");
 if(npc?.id==="isabelle")rect(c,x-3,y-15+bob,8,3,"#383039");
 if(npc?.id==="lucien")rect(c,x-8,y-15+bob,14,4,"#22242c");
 if(npc?.id==="john")rect(c,x-2,y+5+bob,4,9,"#e0d0c6");
 if(npc?.id==="ingrid")rect(c,x+4,y-9+bob,5,4,"#567361");
 window.VTM_ART_POLISH?.character(c,x,y,opts);
 if(opts.appearance&&player)window.VTM_APPEARANCE?.overlay(c,x,y,opts);
 if(npc){
   rect(c,x-24,y-32,48,11,"#11151dc9");
   text(c,npc.name.length>14?npc.name.slice(0,12)+"…":npc.name,x,y-24,7,"#f3d5b8");
 }else if(master){
   rect(c,x-23,y-32,46,11,"#12141ac4");
   text(c,"DOMITOR",x,y-24,7,"#edd1b7");
 }
}
function effects(c,mode,time,location,room=""){
 if(mode==="paris"){
   // Lluvia en dos capas, sin arrays ni partículas almacenadas en cada fotograma.
   for(let i=0;i<56;i++){
    const x=(i*73+Math.floor(time*41))%480,y=(i*43+Math.floor(time*73))%300;
    rect(c,x,y,1,i%3?4:6,i%4?"#b4c7d266":"#d8dfe4a0");
   }
   for(let i=0;i<13;i++){
    const x=(i*37+7)%470,y=75+(i%3)*71;
    rect(c,x,y,1,7,i%2?"#e7cba42e":"#b6b8c120");
   }
 }else{
   const moods={
    stjuly:["221,105,158",.10],elysee:["233,207,162",.10],passy:["183,146,224",.08],
    tuneles:["110,194,166",.11],bastilla:["228,135,118",.08],
    saintdenis:["145,180,215",.11],hemeroteca:["228,185,135",.07],
    policia:["151,204,229",.06],Tremere:["171,125,222",.07],
    Nosferatu:["114,183,150",.08],Toreador:["220,126,162",.07],
    Malkavian:["183,155,217",.07],Ventrue:["187,185,162",.07],
    Brujah:["210,122,108",.07],Gangrel:["155,182,133",.07]
   };
   // Luz ambiental de baja intensidad propia de cada estancia.
   // Se dibuja por encima del fondo, debajo del HUD y sólo con FX activados.
   if(room==="study"){
     glow(c,242,204,44,moods[location]?.[0]||"239,193,144",.065+.018*Math.sin(time*2.2));
     glow(c,133,115,34,"231,191,142",.03+.013*Math.cos(time*1.7));
     for(let i=0;i<4;i++){
       const alpha=.055+.034*Math.sin(time*1.9+i*1.5);
       rect(c,211+i*15,210,2,7,"rgba(246,207,164,"+Math.max(0,alpha).toFixed(3)+")");
     }
   }else if(room==="quarters"){
     glow(c,239,101,64,"141,171,222",.046+.012*Math.sin(time*.85));
     for(let i=0;i<4;i++){
       const alpha=.04+.023*Math.sin(time*.9+i*2);
       rect(c,224+i*10,121,5,15,"rgba(145,185,232,"+Math.max(0,alpha).toFixed(3)+")");
     }
   }else if(room==="house"){
     glow(c,239,87,56,"236,173,132",.045+.013*Math.sin(time*1.6));
   }else if(location==="stjuly"){
     glow(c,113,145,62,"221,105,158",.075+.03*Math.sin(time*1.1));
     glow(c,374,142,49,"190,102,187",.063+.025*Math.sin(time*1.35));
   }else if(location==="elysee"){
     glow(c,239,165,85,"231,207,159",.035+.012*Math.sin(time*.7));
   }else if(location==="tuneles"){
     glow(c,108,171,54,"102,198,172",.075+.035*Math.sin(time*2));
   }else if(location==="passy"){
     glow(c,240,192,48,"174,129,208",.06+.024*Math.sin(time*1.8));
   }
   const mood=moods[location]||["231,188,140",.05];
   glow(c,240,100,72,mood[0],mood[1]*(1+Math.sin(time*1.6)*.15));
   for(let i=0;i<15;i++){
    const x=(i*53+Math.floor(Math.sin(time*.5+i)*11)+480)%480;
    const y=(i*61-Math.floor(time*(3+i%4))+3000)%300;
    rect(c,x,y,1,1,i%3?"#f2d9b14f":"#ebddd47c");
   }
 }
}
function transformation(c,x,y,time,remaining,clan){
 // Resplandor temporal únicamente durante el Abrazo (no aura permanente).
 const fade=Math.max(0,Math.min(1,remaining/4));
 const palette={Toreador:"182,89,111",Ventrue:"147,141,156",Tremere:"159,114,189",Nosferatu:"114,164,139",Brujah:"182,90,86",Gangrel:"143,159,104",Malkavian:"162,119,176"};
 const rgb=palette[clan]||"166,104,124";
 glow(c,x,y,45+20*(1-fade),rgb,.24*fade);
 for(let i=0;i<23;i++){
   const alpha=.10+.6*fade;
   const a=i/23*Math.PI*2+time*2.1;
   const r=15+Math.sin(time*3+i)*5+(1-fade)*31;
   rect(c,x+Math.cos(a)*r,y+Math.sin(a)*r*.65-5,2+(i%3),3+(i%2),
     "rgba("+rgb+","+Math.min(.76,alpha).toFixed(3)+")");
 }
}
function clearCache(){cache.clear();}
return {drawCity,drawResidence,drawVenue,character,effects,transformation,clearCache,backgroundStatus,assetStatus:()=>({atlasReady,atlasFailed,...backgroundStatus()}),version:"2.0-phase-VI"};
})();
