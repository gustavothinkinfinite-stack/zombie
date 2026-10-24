"use strict";
/* Fase XIV — Arte 2D adicional para escenarios de investigación.
 * Pinceladas pixeladas, sombras, reflejos y luces animadas discretas.
 * Sin PNG externos, sin alterar las colisiones ni las pistas canónicas.
 */
window.VTM_CASE_VISUALS=(()=>{
 const rooms=new Set(["case-apartment","case-garage","case-hideout"]);
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const r=(c,x,y,w,h,fill)=>{c.fillStyle=fill;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
 const hash=(n)=>{let v=Math.imul(n^0x9e3779b9,0x85ebca6b);v=Math.imul(v^(v>>>13),0xc2b2ae35);return ((v^(v>>>16))>>>0)/4294967295;};
 function halo(c,x,y,rad,rgb,alpha){
  if(typeof c.createRadialGradient==="function"){
   const g=c.createRadialGradient(x,y,2,x,y,rad);
   g.addColorStop(0,"rgba("+rgb+","+alpha+")");
   g.addColorStop(1,"rgba("+rgb+",0)");
   c.fillStyle=g;c.fillRect(x-rad,y-rad,rad*2,rad*2);
  }else r(c,x-rad/2,y-rad/2,rad,rad,"rgba("+rgb+","+(alpha*.09)+")");
 }
 function specks(c,seed,tint,num){
  for(let i=0;i<num;i++){
   const a=hash(seed*231+i*17),b=hash(seed*73+i*37);
   r(c,22+Math.floor(a*435),64+Math.floor(b*207),1+(i%8===0?2:0),1,tint);
  }
 }
 function apartment(c,time){
  // Cuadros, teléfono, alfombra gastada y reflejos de la lluvia.
  for(const [x,y] of [[31,75],[45,75],[30,104]]){
   r(c,x-2,y-2,12,17,"#1a1722");r(c,x,y,8,13,"#ba947e");r(c,x+2,y+2,4,9,"#626977");
  }
  r(c,197,222,85,28,"#443442");r(c,200,225,79,22,"#554151");
  for(let i=0;i<6;i++)r(c,204+i*12,228+(i%2)*5,8,1,"#8d6375");
  r(c,247,208,18,12,"#151d28");r(c,252,211,9,4,"#9eacbd");r(c,252,217,9,1,"#667985");
  r(c,106,78,42,4,"#16121b");r(c,116,75,22,3,"#bca57a");
  // Ventana y sombras proyectadas, sin añadir objetos sólidos.
  const glint=Math.floor((Math.sin(time*.76)+1)*2);
  r(c,207,48,65,2,"#91a5bb");
  for(let i=0;i<5;i++)r(c,214+i*12,56,1,4+((i+glint)%3),"#9eafbc88");
  halo(c,248,61,73,"119,153,188",.19);
  halo(c,130,113,105,"235,170,111",.18);
  for(let i=0;i<10;i++){
   const sx=35+hash(i*41)*420,sy=69+hash(i*98)*183;
   r(c,sx+Math.sin(time*.33+i)*1.2,sy+Math.cos(time*.38+i)*1.4,1,1,"#ffe1b525");
  }
 }
 function garage(c,time){
  // Señales pintadas, charcos y reflejos de luminarias industriales.
  for(const y of [69,232,270]){
   for(let x=26;x<463;x+=31){r(c,x,y,17,2,"#97856866");}
  }
  for(let i=0;i<6;i++){
   r(c,38+i*28,232,12,3,"#c1ac6a");
   r(c,38+i*28,236,12,1,"#4d4738");
  }
  const stains=[[47,191,32,9],[255,83,48,11],[266,266,33,7],[423,257,29,7]];
  for(const [x,y,w,h] of stains){
   r(c,x,y,w,h,"#101a21a0");r(c,x+4,y+1,w-9,2,"#52687766");
  }
  const flashing=.65+Math.sin(time*4.4)*.19;
  halo(c,267,78,92,"178,212,225",flashing*.20);
  halo(c,93,56,63,"204,222,225",.16);
  for(let i=0;i<5;i++)r(c,231+i*34,69,20,1,i%2?"#a7b5c6aa":"#738899aa");
  r(c,438,63,11,8,"#292f38");
  r(c,441,65,5,4,Math.sin(time*2.6)>0?"#c35b62":"#6b3139");
  for(const [x,y] of [[275,159],[244,246],[379,249]]){r(c,x,y,11,2,"#718e9f66");r(c,x+2,y+3,8,1,"#506a7966");}
 }
 function hideout(c,time){
  // Grietas, polvo, proyectores con fallo y papeles sobre la mesa.
  for(let i=0;i<12;i++){
   const x=28+hash(i*17)*417,y=69+hash(i*31)*180;
   r(c,x,y,9,1,"#100f18aa");r(c,x+9,y+1,3,1,"#1e1a20aa");
  }
  for(let i=0;i<7;i++){
   const x=73+i*48;
   r(c,x,55,2,2,"#68616988");
   r(c,x+2,57,1,10+(i%3)*3,"#14121855");
  }
  // Proyección de sombras de una reja desde el techo.
  for(let i=0;i<7;i++)r(c,179+i*18,61,2,51,"#12121e33");
  for(const [x,y] of [[202,198],[226,201],[254,199]]){r(c,x,y,16,9,"#d3b7a2");r(c,x+2,y+3,12,1,"#645964");}
  halo(c,240,79,90,"170,74,84",.12+Math.max(0,Math.sin(time*3.2))*.12);
  halo(c,402,77,65,"223,178,117",.11);
  r(c,447,57,11,18,"#26151c");
  r(c,449,59,7,7,Math.sin(time*2)>0?"#a04d58":"#5c3038");
  for(let i=0;i<9;i++){const x=18+hash(i*99)*440,y=62+hash(i*12)*205;r(c,x,y,2,1,"#a9a2ad2c");}
 }
 function draw(c,room,time=0,game=null,effects=true){
  if(!rooms.has(room))return false;
  c.save?.();
  specks(c,room==="case-garage"?3:room==="case-apartment"?2:5,"#ddd8c217",68);
  if(room==="case-apartment")apartment(c,effects?time:0);
  else if(room==="case-garage")garage(c,effects?time:0);
  else hideout(c,effects?time:0);
  // Colores de ambiente local en marcos y zócalos.
  const edge=room==="case-garage"?"#8895a0":room==="case-apartment"?"#a98983":"#a45c63";
  r(c,14,43,3,241,edge);r(c,464,43,2,241,edge);
  r(c,0,39,480,2,"#06070d99");
  c.restore?.();return true;
 }
 return Object.freeze({draw,version:"14.0"});
})();