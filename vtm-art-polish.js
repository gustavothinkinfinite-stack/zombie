"use strict";
/* Crónicas de París — acabados de sprites e interiores. VISUAL ONLY.
   Todos los objetos son decorativos: nunca leen ni escriben el guardado,
   ni cambian coordenadas, diálogos, escenas, colisiones o misiones. */
window.VTM_ART_POLISH=(()=>{
 const R=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));};
 const glow=(c,x,y,r,rgb,a)=>{
  if(typeof c.createRadialGradient!=="function")return;
  const g=c.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0,"rgba("+rgb+","+a.toFixed(3)+")");
  g.addColorStop(1,"rgba("+rgb+",0)");
  c.fillStyle=g;c.fillRect(Math.round(x-r),Math.round(y-r),r*2,r*2);
 };
 const palettes={
  Toreador:["#d5a2ac","#87556e","#edc2ba"],Ventrue:["#bac6d1","#637b97","#e3d3c4"],
  Tremere:["#c5a3d3","#71517b","#e1c9c6"],Nosferatu:["#8b9f89","#42635b","#c7c5aa"],
  Brujah:["#be8f86","#80505a","#ddbbab"],Gangrel:["#a9b99b","#567361","#c9ba9e"],
  Malkavian:["#b7a7d5","#72618b","#d3c1cb"]
 };
 const npcPalettes={
  isabelle:["#c5adc9","#6c4777"],ingrid:["#8da9a0","#3a635a"],
  lucien:["#bc8b79","#68464a"],john:["#d0c2ba","#64738b"],
  marcus:["#c0a3b7","#55445e"],dupont:["#bdad95","#62616b"],
  guardiana:["#e0c5b8","#7d677b"],archivista:["#adbac0","#606d78"]
 };
 function character(c,x,y,o={}){
  const id=o.npc?.id,colors=npcPalettes[id]||palettes[o.clan]||palettes.Toreador;
  const pale=colors[0],fabric=colors[1],accent=colors[2]||colors[0];
  const walking=!!o.walking,stride=walking?Math.sin((o.cycle||0)*12):0,step=walking?Math.round(stride*2):0;
  const breathing=!walking?Math.round(Math.sin((o.time||0)*1.7)*.7):0;
  const dir=o.facing||"down",front=dir==="down",back=dir==="up";
  const cy=Math.round(y+breathing);
  // Chaqueta con doble textura, botones y costuras; sombreado diferente por clan.
  R(c,x-9,cy+1,3,12,"#151820a1");
  R(c,x+7,cy+1,3,12,"#151820a1");
  R(c,x-6,cy+2,12,2,fabric+"aa");
  if(front){
   R(c,x-5,cy+1,4,3,pale);
   R(c,x+2,cy+1,4,3,pale);
   R(c,x-1,cy+2,2,12,"#191d2b");
   for(const yy of [5,10,14])R(c,x+1,cy+yy,1,1,accent);
   R(c,x-10-step,cy+2,2,9,fabric+"cc");
   R(c,x+8+step,cy+2,2,9,fabric+"cc");
  }else if(back){
   R(c,x-6,cy+3,12,2,pale+"ba");
   R(c,x-7,cy+14,14,2,fabric);
   R(c,x-3,cy+7,6,1,"#262a36");
  }else{
   const sign=dir==="left"?-1:1;
   R(c,x-sign*7,cy+4,4,10,pale+"a6");
   R(c,x+sign*4,cy+3,2,11,fabric);
   R(c,x+sign*6,cy+11,3,2,accent);
  }
  // Botas y faldones independientes de los cuadros del atlas.
  R(c,x-7-step,cy+18,5,2,"#131925");
  R(c,x+2+step,cy+18,5,2,"#131925");
  if(walking){
   R(c,x-10-step,cy+13,3,6,fabric+"d8");
   R(c,x+8+step,cy+13,3,6,fabric+"d8");
  }
  if(o.clan==="Tremere"){
   R(c,x-7,cy+4,2,14,"#ac89c0");
   R(c,x+5,cy+4,2,14,"#ac89c0");
  }else if(o.clan==="Ventrue"){
   R(c,x-3,cy+3,6,2,"#f0d5bf");
   R(c,x-2,cy+6,4,1,"#d8bd9c");
  }else if(o.clan==="Nosferatu"){
   R(c,x-5,cy-13,2,3,"#738677");
   R(c,x+4,cy-11,2,3,"#4c7665");
  }else if(o.clan==="Toreador"){
   R(c,x+7,cy+7,3,1,"#d9a1bc");
  }else if(o.clan==="Brujah"){
   R(c,x-8,cy+7,3,3,"#a75d61");
  }
  // Pequeños destellos faciales legibles en primer plano, sin blanquear rostros.
  if(front&&!back){
   R(c,x-3,cy-8,1,1,"#171925");
   R(c,x+3,cy-8,1,1,"#171925");
   if(o.clan!=="Nosferatu")R(c,x+1,cy-3,2,1,accent+"85");
  }
 }
 const decor={
  stjuly:{light:"211,109,159",wood:"#553346",accent:"#ba8599"},
  elysee:{light:"234,205,155",wood:"#6c5660",accent:"#d8c4a4"},
  passy:{light:"206,174,211",wood:"#63516a",accent:"#c4b0c7"},
  tuneles:{light:"108,187,154",wood:"#344c4b",accent:"#7da897"},
  bastilla:{light:"225,141,110",wood:"#58353d",accent:"#b87e70"},
  saintdenis:{light:"164,182,193",wood:"#44505c",accent:"#899ca4"},
  hemeroteca:{light:"218,175,122",wood:"#655057",accent:"#c7ad8e"},
  policia:{light:"142,194,228",wood:"#415163",accent:"#9fb6cd"}
 };
 function archedNiche(c,x,y,color){
  R(c,x-5,y-4,31,47,"#171b289f");R(c,x-2,y,25,40,color);
  R(c,x,y+2,21,35,"#222838");R(c,x+2,y+5,16,27,"#344153");
  R(c,x+10,y+5,2,27,"#a7b8b34c");
  R(c,x+2,y+17,16,2,"#a89b9166");
  R(c,x-5,y+39,31,4,"#82717a");
 }
 function shelfDetail(c,x,y,wood){
  R(c,x,y,62,44,wood);R(c,x+3,y+3,56,35,"#242532");
  for(let row=0;row<2;row++){
   const yy=y+6+row*17;
   for(let j=0;j<9;j++){
    const col=["#987b75","#627585","#a58b68","#716b87","#8d676a"][j%5];
    R(c,x+5+j*6,yy,4,10+(j%3),col);
    R(c,x+6+j*6,yy+2,1,6,"#d0b7a059");
   }
   R(c,x+3,yy+13,56,3,"#796574");
  }
 }
 function residence(c,room,clan,time,fx=true){
  const pale=palettes[clan]||palettes.Toreador;
  const lamp=clan==="Nosferatu"?"113,179,158":clan==="Tremere"?"163,123,202":
    clan==="Ventrue"?"225,200,151":"223,164,139";
  // Dibujos adicionales sobre las ilustraciones SVG existentes, fuera de
  // los hotspots del despacho, salón y dormitorios.
  for(const x of [55,391]){
   R(c,x,47,20,24,"#171a25ad");
   R(c,x+3,50,14,17,"#353d4b");
   R(c,x+5,52,9,12,pale[1]+"77");
   R(c,x+8,49,4,3,"#bfb2a0");
  }
  if(room==="house"){
   for(const x of [49,401]){
    R(c,x,138,7,24,"#403542");
    R(c,x-4,137,15,4,pale[0]);
    R(c,x-2,136,11,2,"#dac0a5");
   }
   R(c,218,58,45,5,"#c3a6889e");
   R(c,225,64,31,2,pale[0]+"c0");
   for(const x of [214,263])R(c,x,77,2,47,"#151722a6");
  }else if(room==="study"){
   shelfDetail(c,31,107,pale[1]);
   shelfDetail(c,389,107,pale[1]);
   R(c,205,198,70,3,"#e2c9b49a");
   R(c,224,203,32,10,"#a89a87");
   R(c,230,204,12,7,"#ebe0c7");
   R(c,262,200,3,9,"#5d626b");
   R(c,263,199,5,2,"#f2c99a");
  }else{
   // Tapices, costuras de cama y lámparas de noche.
   R(c,75,125,40,2,"#d7c4b9");
   R(c,81,131,28,1,"#f2e5d4b0");
   for(let i=0;i<5;i++)R(c,307+i*18,143,8,2,pale[0]+"b6");
   R(c,180,71,16,21,"#554450");
   R(c,185,75,6,13,pale[1]);
  }
  if(fx){
   const flicker=.067+.014*Math.sin(time*1.21+clan.length);
   glow(c,34,88,42,lamp,flicker);
   glow(c,448,88,42,lamp,flicker*.86);
   if(room==="study")glow(c,242,205,35,"239,192,140",.045+.018*Math.sin(time*1.8));
   if(room==="quarters")glow(c,351,151,45,lamp,.04+.012*Math.sin(time*.8));
   for(const x of [33,446]){
    for(let i=0;i<3;i++)R(c,x-10+i*4,114+i*9,20-i*6,1,"rgba("+lamp+","+(flicker*.28).toFixed(3)+")");
   }
  }
 }
 function venue(c,id,time,fx=true){
  const d=decor[id];if(!d)return;
  // Acabados en zócalos, paneles de madera y vitrinas. Los accesos E no
  // cambian de posición ni quedan bloqueados.
  for(const x of [34,434]){
   R(c,x,58,10,117,"#20222ea3");
   R(c,x+2,61,6,108,d.wood);
   for(let y=69;y<167;y+=22)R(c,x+2,y,6,1,d.accent+"b7");
  }
  for(const x of [64,368])archedNiche(c,x,63,d.wood);
  if(id==="stjuly"){
   for(let x=55;x<192;x+=16){
    R(c,x,150,7,21,x%3?"#876681":"#aa8290");
    R(c,x+2,155,2,9,"#d2b39d");
   }
   R(c,65,170,128,4,"#d2aa91b4");
   R(c,310,163,110,2,"#bd769e");
   for(let i=0;i<6;i++)R(c,323+i*15,170,7,10,["#b6899e","#c5ac92","#5c7184"][i%3]);
  }else if(id==="elysee"){
   for(let i=0;i<7;i++){const x=75+i*51;R(c,x,167,5,70,"#c8b9a1");R(c,x-3,167,11,4,"#dcc8b5");}
   R(c,106,199,269,2,"#b49c8a6b");
   R(c,238,127,5,15,"#e1c8ad");
  }else if(id==="policia"||id==="hemeroteca"){
   shelfDetail(c,54,155,d.wood);
   shelfDetail(c,138,155,d.wood);
   R(c,338,174,51,26,id==="policia"?"#334454":"#61504a");
   for(let j=0;j<5;j++)R(c,342+j*9,177,6,17,"#a2a4a1");
  }else if(id==="tuneles"){
   for(let x=45;x<432;x+=53){
    R(c,x,55,36,7,"#526f69");
    for(let j=0;j<4;j++)R(c,x+j*9,60,4,3,"#b3bfb67b");
   }
   R(c,48,201,156,5,"#233b3b");
  }else if(id==="passy"){
   R(c,74,166,100,7,"#78607b");
   for(let x=88;x<173;x+=20)R(c,x,179,5,22,"#ccb7bc");
   R(c,314,162,106,5,"#b2a0ad");
  }else if(id==="bastilla"||id==="saintdenis"){
   for(let x=58;x<186;x+=18)R(c,x,162,8,23,id==="bastilla"?"#976976":"#72818a");
   R(c,318,188,99,2,d.accent+"a6");
  }
  if(fx){
   const f=.045+.018*Math.sin(time*1.3+id.length);
   for(const x of [72,401]){
    glow(c,x,115,44,d.light,f);
    for(let j=0;j<3;j++)R(c,x-13+j*4,166+j*12,26-j*8,1,"rgba("+d.light+","+(f*.58).toFixed(3)+")");
   }
   if(id==="stjuly")glow(c,346,180,49,d.light,.065+.035*Math.sin(time*1.5));
   if(id==="tuneles")glow(c,243,170,51,d.light,.049+.02*Math.sin(time*.9));
  }
 }
 function shop(c,kind,time,fx=true){
  // Tiendas secundarias: decoración neutra sobre sus muebles existentes.
  const study=kind==="libreria"||kind==="anticuario",labor=kind==="taller"||kind==="almacen";
  for(const x of [54,378]){
   R(c,x,74,37,4,"#72606d");
   for(let i=0;i<4;i++){
    const xx=x+i*9,col=study?"#a68a7b":labor?"#6c8190":"#b49b91";
    R(c,xx,83,5,15,i%2?"#55576a":col);
    R(c,xx+1,87,1,7,"#dfc6a552");
   }
   R(c,x,99,38,3,"#333140");
  }
  if(fx){
   const mood=labor?"154,189,216":study?"228,187,140":"221,165,177";
   glow(c,132,140,36,mood,.042+.012*Math.sin(time*1.1));
   glow(c,351,140,36,mood,.042+.012*Math.cos(time*.9));
  }
 }
 return Object.freeze({character,residence,venue,shop,version:"1.0-visual-only"});
})();