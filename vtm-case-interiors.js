"use strict";
/* Interiores 2D explorables del expediente Elizabeth Parker.
   Geometría lógica 480×300; obstáculos alineados con VTM_PHYSICS.
   Las escenas son nuevas y no alteran el recorrido anterior. */
window.VTM_CASE_INTERIORS=(()=>{
 const places=Object.freeze({
  "case-apartment":Object.freeze({
   id:"case-apartment",title:"Apartamento de Elizabeth",district:"hemeroteca",start:{x:240,y:252},
   spots:[
    {id:"exit",name:"Salir al barrio",x:240,y:264,range:36},
    {id:"desk",name:"Agenda y correspondencia",x:135,y:166,range:43},
    {id:"phone",name:"Teléfono y mensajes",x:261,y:220,range:35},
    {id:"photos",name:"Fotografías personales",x:346,y:160,range:43},
    {id:"window",name:"Ventana al patio",x:240,y:74,range:40}
   ]
  }),
  "case-garage":Object.freeze({
   id:"case-garage",title:"Garaje de Adrien Vasseur",district:"saintdenis",start:{x:240,y:253},
   spots:[
    {id:"exit",name:"Salir del garaje",x:240,y:264,range:35},
    {id:"car",name:"Vehículo sospechoso",x:137,y:190,range:42},
    {id:"ledger",name:"Registros y recibos",x:344,y:239,range:37},
    {id:"camera",name:"Cámara de seguridad",x:310,y:82,range:43},
    {id:"service",name:"Puerta de servicio",x:431,y:184,range:39}
   ]
  }),
  "case-hideout":Object.freeze({
   id:"case-hideout",title:"Refugio de Bapthiste",district:"bastilla",start:{x:240,y:252},
   spots:[
    {id:"exit",name:"Abandonar el refugio",x:240,y:264,range:35},
    {id:"bapthiste",name:"Enfrentar a Bapthiste",x:240,y:148,range:55},
    {id:"documents",name:"Documentos de la mesa",x:162,y:182,range:45},
    {id:"escape",name:"Ruta de retirada",x:408,y:176,range:42}
   ]
  })
 });
 const byId=id=>places[id]||null;
 function nearest(g){
  const p=byId(g?.scene);
  if(!p)return null;
  return p.spots.map(s=>({...s,d:Math.hypot(g.x-s.x,g.y-s.y)}))
   .filter(s=>s.d<=s.range).sort((a,b)=>a.d-b.d)[0]||null;
 }
 function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h);}
 function line(c,x,y,w,h,color){rect(c,x,y,w,h,color);}
 function name(c,t,x,y,color="#ddd0b7",size=9){
  c.font="bold "+size+"px monospace";c.fillStyle=color;c.textAlign="center";
  c.fillText(t,x,y);
 }
 function floor(c,base,tiling){
  rect(c,0,0,480,300,"#0d0e13");rect(c,16,42,448,244,base);
  for(let y=47;y<286;y+=20)for(let x=18;x<462;x+=23){
   const odd=(Math.floor(x/23)*3+Math.floor(y/20))%4;
   rect(c,x,y,22,19,odd===0?tiling:base);
   rect(c,x,y,22,1,"#12131b88");
  }
  rect(c,0,0,480,43,"#201e2a");
  rect(c,14,42,4,244,"#3e343c");rect(c,462,42,4,244,"#3e343c");
  rect(c,0,282,480,18,"#17121c");
 }
 function aperture(c,x,w,shade="#53627a"){
  rect(c,x,43,w,19,"#151b25");rect(c,x+4,46,w-8,14,shade);
  for(let q=x+16;q<x+w-4;q+=32)rect(c,q,46,3,14,"#9a8796");
 }
 function door(c,title){
  rect(c,211,279,58,20,"#111018");rect(c,218,280,44,16,"#6a5263");
  rect(c,222,284,36,2,"#ba9c91");name(c,title,240,296,"#f0d8ba",8);
 }
 function mark(c,s,ready,time){
  const pulse=(Math.sin(time*3+s.x/43)+1)*.12;
  rect(c,s.x-4,s.y-26,8,8,ready?"#b6c58c":"#d9b081");
  rect(c,s.x-2,s.y-24,4,4,"#25212b");
  if(c.globalAlpha!==undefined){c.globalAlpha=.65+pulse;name(c,s.name.toUpperCase().slice(0,22),s.x,s.y-31,"#e0d2c7",7);c.globalAlpha=1;}
 }
 function apartment(c){
  floor(c,"#3a313a","#433942");
  aperture(c,202,77,"#46536a");
  // Mesa de estudio (70,85,115,65).
  rect(c,70,85,115,65,"#211c25");rect(c,75,90,105,55,"#755a57");
  rect(c,81,95,70,40,"#d0b99e");rect(c,85,100,58,2,"#695661");
  rect(c,85,106,49,2,"#695661");rect(c,85,112,56,2,"#695661");
  rect(c,150,107,23,22,"#25212b");rect(c,155,113,13,8,"#a7acba");
  // Cama (295,70,130,75).
  rect(c,295,70,130,75,"#2b242c");rect(c,303,77,114,61,"#a69aa1");
  rect(c,313,86,43,27,"#d9cdbf");rect(c,361,86,43,27,"#d9cdbf");
  rect(c,309,115,100,16,"#685461");
  // Mesa baja central (210,160,65,40).
  rect(c,210,160,65,40,"#251e29");rect(c,215,165,55,29,"#886e62");
  rect(c,223,172,15,11,"#d9c7ac");rect(c,242,171,15,10,"#352b32");
  // Armario y álbum.
  rect(c,30,182,109,42,"#25202b");rect(c,35,187,99,32,"#58424d");
  rect(c,300,190,118,35,"#2b242f");rect(c,306,195,106,24,"#675360");
  rect(c,332,199,37,14,"#c9baa8");rect(c,340,202,21,9,"#424051");
  line(c,19,250,187,3,"#55474f");line(c,273,249,190,3,"#55474f");
 }
 function garage(c){
  floor(c,"#30343e","#353944");
  aperture(c,80,325,"#383d45");
  for(let y=80;y<280;y+=52)line(c,20,y,440,1,"#59606a88");
  // Automóvil visto desde arriba (70,85,150,90).
  rect(c,70,85,150,90,"#131923");rect(c,77,90,136,80,"#111522");
  rect(c,90,99,110,64,"#343942");rect(c,112,99,66,23,"#5b6671");
  rect(c,112,132,66,23,"#28323c");rect(c,77,94,12,14,"#d09e7e");
  rect(c,201,147,11,14,"#b45358");
  for(const x of [82,190]){rect(c,x,79,17,5,"#12141c");rect(c,x,174,17,6,"#12141c");}
  // Taller (320,75,120,75).
  rect(c,320,75,120,75,"#20242e");rect(c,326,80,108,63,"#5d5b60");
  for(let j=0;j<4;j++)rect(c,332+j*24,92,13,39,j%2?"#242a31":"#967e68");
  // Archivos (285,180,130,45).
  rect(c,285,180,130,45,"#1d202a");
  rect(c,291,185,118,35,"#545259");
  for(let j=0;j<4;j++){rect(c,297+j*27,190,22,21,"#383842");rect(c,302+j*27,199,12,3,"#c5b8a6");}
  // Puerta de servicio y líneas de suelo.
  rect(c,443,158,21,56,"#151923");rect(c,447,163,17,46,"#49424b");
  for(let x=45;x<268;x+=35)rect(c,x,246,18,2,"#b4a574");
 }
 function hideout(c,game){
  floor(c,"#383136","#43363b");
  aperture(c,190,100,"#2a343e");
  for(let y=60;y<262;y+=17)for(let x=20;x<462;x+=46)rect(c,x+((y/17)%2)*18,y,42,1,"#231e26");
  // Crates as cover.
  for(const box of [[40,101,110,70],[325,94,120,69],[49,203,95,50],[338,209,94,41]]){
   rect(c,...box,"#20191f");rect(c,box[0]+5,box[1]+4,box[2]-10,box[3]-8,"#64504a");
   rect(c,box[0]+10,box[1]+8,box[2]-20,3,"#8d6b5a");
  }
  rect(c,178,188,125,30,"#261d25");rect(c,185,192,111,23,"#7c5752");
  rect(c,202,198,22,13,"#d7c2a4");rect(c,235,199,24,12,"#261a22");
  if(game?.combat?.records?.bapthiste==="won")name(c,"EL BRUJAH YA NO ESTÁ EN PIE",240,133,"#cdb2b1",8);
 }
 function draw(c,id,time=0,game=null){
  const p=byId(id);if(!p)return false;
  c.save?.();
  if(id==="case-apartment")apartment(c);
  else if(id==="case-garage")garage(c);
  else hideout(c,game);
  rect(c,18,6,444,31,"#17141d");
  name(c,p.title.toUpperCase(),240,27,"#e9cab0",11);
  door(c,"SALIR");
  for(const s of p.spots){if(s.id!=="exit" && !(s.id==="bapthiste"&&game?.combat?.records?.bapthiste==="won"))mark(c,s,false,time);}
  c.restore?.();return true;
 }
 return Object.freeze({places,byId,nearest,draw});
})();