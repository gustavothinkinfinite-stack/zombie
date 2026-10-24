"use strict";
/* Apariencia 2.0 · Opciones puramente visuales, independientes del sistema de reglas.
   Los ajustes se guardan con el personaje; ninguna opción modifica tiradas o clan. */
window.VTM_APPEARANCE=(()=>{
 const palettes={
  skin:[
   {id:"marfil",label:"Marfil",color:"#eed2bc"},
   {id:"claro",label:"Claro",color:"#d9ae96"},
   {id:"oliva",label:"Oliva",color:"#bc987a"},
   {id:"cobrizo",label:"Cobrizo",color:"#986b56"},
   {id:"oscuro",label:"Oscuro",color:"#6e4c42"}
  ],
  hair:[
   {id:"ebano",label:"Ébano",color:"#222029"},
   {id:"castano",label:"Castaño",color:"#533c39"},
   {id:"cobrizo",label:"Cobrizo",color:"#91574c"},
   {id:"ceniza",label:"Ceniza",color:"#7d7881"},
   {id:"plata",label:"Plata",color:"#b9b6bd"}
  ],
  coat:[
   {id:"negro",label:"Abrigo negro",color:"#313442",trim:"#7f7f91"},
   {id:"azul",label:"Traje azul noche",color:"#465b75",trim:"#aeb7be"},
   {id:"borgona",label:"Cuero borgoña",color:"#70414f",trim:"#ca8c82"},
   {id:"gris",label:"Tweed gris",color:"#65636c",trim:"#c3b8ab"},
   {id:"verde",label:"Verde oscuro",color:"#47625c",trim:"#90b0a3"}
  ],
  hairstyle:[
   {id:"corto",label:"Corto"},
   {id:"largo",label:"Largo"},
   {id:"recogido",label:"Recogido"}
  ],
  detail:[
   {id:"ninguno",label:"Sin accesorio"},
   {id:"bufanda",label:"Bufanda"},
   {id:"broche",label:"Broche"},
   {id:"lentes",label:"Anteojos"}
  ]
 };
 const defaults=Object.freeze({skin:"claro",hair:"ebano",coat:"negro",hairstyle:"corto",detail:"ninguno"});
 const accents={Toreador:"#be778f",Ventrue:"#b5b5a3",Tremere:"#a68abe",Nosferatu:"#729a80",Brujah:"#c57e77",Gangrel:"#94a786",Malkavian:"#baa1c8"};
 const values=Object.keys(defaults);
 const entry=(key,id)=>palettes[key]?.find(p=>p.id===id)||palettes[key]?.[0];
 function normalize(input){
  const v=input&&typeof input==="object"&&!Array.isArray(input)?input:{};
  const out={};
  for(const k of values){
   out[k]=palettes[k].some(t=>t.id===v[k])?v[k]:defaults[k];
  }
  return out;
 }
 const darken=(hex,mult)=>{
  const rgb=[1,3,5].map(i=>Math.max(0,Math.min(255,Math.round(parseInt(hex.slice(i,i+2),16)*mult))));
  return "#"+rgb.map(n=>n.toString(16).padStart(2,"0")).join("");
 };
 const px=(ctx,x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 /* El personaje ocupa una celda de 32x48; siempre alinear al atlas y al sprite de respaldo. */
 function overlay(ctx,x,y,input,{embraced=false,clan="Toreador",facing="down",walking=false,cycle=0,time=0}={}){
  const look=normalize(input),hair=entry("hair",look.hair).color,coat=entry("coat",look.coat),baseSkin=entry("skin",look.skin).color;
  const skin=embraced?darken(baseSkin,clan==="Nosferatu"?.77:.91):baseSkin;
  const dx=Math.round(x)-16,dy=Math.round(y)-21;
  const step=walking?Math.round(Math.sin(cycle*11)*2):0;
  px(ctx,dx+7+step,dy+33,8,7,darken(coat.color,.58));
  px(ctx,dx+18-step,dy+33,8,7,darken(coat.color,.55));
  px(ctx,dx+7,dy+20,19,17,coat.color);
  px(ctx,dx+4,dy+20,5,13,darken(coat.color,.82));
  px(ctx,dx+25,dy+20,4,13,darken(coat.color,.75));
  px(ctx,dx+9,dy+23,2,11,coat.trim);
  px(ctx,dx+22,dy+23,2,11,darken(coat.trim,.75));
  px(ctx,dx+5,dy+32,4,3,skin);px(ctx,dx+25,dy+32,4,3,skin);
  px(ctx,dx+11,dy+7,11,12,skin);
  px(ctx,dx+9,dy+10,3,8,skin);px(ctx,dx+21,dy+10,3,8,darken(skin,.94));
  if(embraced&&clan==="Nosferatu"){
   px(ctx,dx+12,dy+13,3,3,"#556f64");
   px(ctx,dx+20,dy+11,3,4,"#536a61");
   px(ctx,dx+16,dy+16,2,2,"#596e63");
  }
  const hs=look.hairstyle;
  px(ctx,dx+10,dy+4,14,5,hair);px(ctx,dx+12,dy+3,11,3,hair);
  if(hs==="largo"){px(ctx,dx+8,dy+8,4,20,hair);px(ctx,dx+23,dy+8,4,19,darken(hair,.85));}
  else if(hs==="recogido"){px(ctx,dx+10,dy+7,3,8,hair);px(ctx,dx+22,dy+7,3,8,hair);px(ctx,dx+24,dy+9,6,7,hair);}
  else{px(ctx,dx+9,dy+8,3,8,hair);px(ctx,dx+22,dy+8,3,8,hair);}
  if(facing==="up"){
   px(ctx,dx+11,dy+9,13,10,hair);
  }else if(facing==="down"){
   const blinking=!walking&&time>0&&time%5.8<.15;
   px(ctx,dx+13,dy+12,2,blinking?1:2,"#252530");
   px(ctx,dx+20,dy+12,2,blinking?1:2,"#252530");
   px(ctx,dx+16,dy+17,4,1,embraced?"#7b515c":"#9c746a");
   if(look.detail==="lentes"){
    px(ctx,dx+11,dy+10,6,5,"#34333d");px(ctx,dx+18,dy+10,6,5,"#34333d");
    px(ctx,dx+13,dy+12,3,2,"#83919d");px(ctx,dx+20,dy+12,3,2,"#83919d");
    px(ctx,dx+16,dy+11,3,1,"#bdb8ba");
   }
  }else{
   const ex=facing==="right"?21:12;
   px(ctx,dx+ex,dy+12,2,2,"#252530");
  }
  if(!walking){px(ctx,dx+16,dy+34+Math.round(Math.sin(time*1.8)),3,1,coat.trim);}
  if(look.detail==="bufanda"){
   px(ctx,dx+12,dy+21,13,5,"#b39a9e");
   px(ctx,dx+21+(walking?Math.round(Math.sin(cycle*10)):0),dy+24,4,13,"#8e6372");
  }else if(look.detail==="broche"){
   px(ctx,dx+21,dy+24,4,4,embraced?(accents[clan]||"#ba9a92"):"#cbb99d");
   px(ctx,dx+22,dy+25,2,2,"#282a32");
  }
  if(embraced){
   // Un único detalle cromático ligado al clan, sin imponer poderes visibles.
   px(ctx,dx+11,dy+30,13,2,accents[clan]||"#b7a4a3");
   px(ctx,dx+15,dy+25,4,4,accents[clan]||"#b7a4a3");
   if(clan==="Gangrel"){px(ctx,dx+11,dy+9,2,3,darken(skin,.65));}
   if(clan==="Malkavian"){px(ctx,dx+21,dy+23,3,2,"#d1bddb");}
   if(clan==="Tremere"){px(ctx,dx+14,dy+34,6,2,"#b9a1cb");}
  }
 }
 function preview(canvas,look,opts={}){
  if(!canvas?.getContext)return;
  const ctx=canvas.getContext("2d");if(!ctx)return;
  const w=canvas.width||180,h=canvas.height||220;
  ctx.imageSmoothingEnabled=false;
  ctx.fillStyle="#171924";ctx.fillRect(0,0,w,h);
  for(let i=0;i<11;i++){px(ctx,i*21,0,1,h,"#393040");}
  px(ctx,11,h-27,w-22,17,"#36313b");
  px(ctx,17,h-24,w-34,3,"#8b7475");
  ctx.save?.();
  ctx.translate?.(Math.round(w/2)-16*4,Math.round(h/2)-20*4);
  ctx.scale?.(4,4);
  // Base neutra con la misma geometría del atlas para vista previa instantánea.
  px(ctx,4,41,25,5,"#080b1380");
  px(ctx,7,33,7,11,"#242a36");px(ctx,18,33,7,11,"#242a36");
  px(ctx,7,20,19,15,"#323541");
  px(ctx,11,7,12,13,"#bf9d88");
  overlay(ctx,16,21,look,opts);
  ctx.restore?.();
 }
 return Object.freeze({palettes,defaults,normalize,overlay,preview});
})();