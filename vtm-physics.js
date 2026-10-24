"use strict";
/* Colisiones, navegación y alcance de interacción. Unidades: píxeles lógicos de Canvas.
   Zonas de interacción no bloqueadas; obstáculos alineados con la geometría dibujada. */
window.VTM_PHYSICS=(()=>{
const W=480,H=300,R=8,STEP=12;
const furniture={
 house:[
  {x:24,y:143,w:129,h:67,id:"mesa"},
  {x:329,y:130,w:127,h:81,id:"aparador"},
  {x:180,y:68,w:120,h:69,id:"sitial"}
 ],
 study:[
  {x:34,y:106,w:137,h:82,id:"biblioteca"},
  {x:309,y:108,w:142,h:81,id:"archivo"},
  {x:201,y:200,w:78,h:40,id:"escritorio"}
 ],
 quarters:[
  {x:41,y:117,w:151,h:89,id:"cama"},
  {x:286,y:110,w:154,h:90,id:"vestidor"}
 ],
 venue:[
  {x:50,y:154,w:158,h:80,id:"mostrador"},
  {x:302,y:156,w:130,h:73,id:"mobiliario"}
 ],
 district:[
  // Las manzanas y el edificio principal respetan vtm-districts.js.
  // La puerta del edificio central se alcanza desde la calle al sur.
  {x:206,y:74,w:68,h:47,id:"edificio-principal"},
  {x:19,y:51,w:151,h:70,id:"edificio-noroeste"},
  {x:310,y:51,w:151,h:70,id:"edificio-noreste"},
  {x:19,y:198,w:151,h:50,id:"edificio-suroeste"},
  {x:310,y:198,w:151,h:50,id:"edificio-sureste"}
 ],
 paris:[]
};
// Los tres interiores del caso Elizabeth utilizan geometrías propias.
furniture["case-apartment"]=[
 {x:70,y:85,w:115,h:65,id:"escritorio"},
 {x:295,y:70,w:130,h:75,id:"cama"},
 {x:210,y:160,w:65,h:40,id:"mesa"},
 {x:30,y:182,w:109,h:42,id:"armario"},
 {x:300,y:190,w:118,h:35,id:"aparador"}
];
furniture["case-garage"]=[
 {x:70,y:85,w:150,h:90,id:"coche"},
 {x:320,y:75,w:120,h:75,id:"taller"},
 {x:285,y:180,w:130,h:45,id:"archivos"}
];
furniture["case-hideout"]=[
 {x:40,y:101,w:110,h:70,id:"cajas-izq"},
 {x:325,y:94,w:120,h:69,id:"cajas-der"},
 {x:49,y:203,w:95,h:50,id:"cajas-sur-izq"},
 {x:338,y:209,w:94,h:41,id:"cajas-sur-der"},
 {x:178,y:188,w:125,h:30,id:"mesa"}
];
// Los comercios secundarios tienen además un mostrador central dibujado
// en vtm-shops.js; no se debe poder caminar a través de él.
furniture.sidevenue=[...furniture.venue,{x:202,y:191,w:76,h:42,id:"mostrador-central"}];
const sceneKey=(scene)=>furniture[scene]?scene:"paris";
function obstacles(scene){return furniture[sceneKey(scene)]||[];}
function canStand(scene,x,y,r=R){
 if(!Number.isFinite(x)||!Number.isFinite(y))return false;
 if(x<r+16||x>W-r-16||y<r+42||y>H-r-7)return false;
 return !obstacles(scene).some(b=>{
  const cx=Math.max(b.x,Math.min(x,b.x+b.w));
  const cy=Math.max(b.y,Math.min(y,b.y+b.h));
  return (cx-x)*(cx-x)+(cy-y)*(cy-y)<(r*r);
 });
}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function nearestFree(scene,x,y,r=R){
 const withinX=clamp(x,r+16,W-r-16),withinY=clamp(y,r+42,H-r-7);
 if(canStand(scene,withinX,withinY,r))return{x:withinX,y:withinY};
 let best=null,dMin=Infinity;
 // Espiral determinista para partidas antiguas guardadas en muebles.
 for(let dist=STEP;dist<Math.max(W,H);dist+=STEP){
  for(let a=0;a<16;a++){
   const t=a/16*Math.PI*2,cx=clamp(withinX+Math.cos(t)*dist,r+16,W-r-16);
   const cy=clamp(withinY+Math.sin(t)*dist,r+42,H-r-7);
   const d=(cx-withinX)**2+(cy-withinY)**2;
   if(canStand(scene,cx,cy,r)&&d<dMin){best={x:cx,y:cy};dMin=d;}
  }
  if(best)return best;
 }
 return {x:240,y:260};
}
function slide(scene,x,y,dx,dy){
 // Separar ejes permite deslizarse suavemente junto a una estantería o mesa.
 const nx=clamp(x+dx,R+16,W-R-16),ny=clamp(y+dy,R+42,H-R-7);
 let px=x,py=y;
 if(canStand(scene,nx,py))px=nx;
 if(canStand(scene,px,ny))py=ny;
 if(!canStand(scene,px,py)){const p=nearestFree(scene,x,y);px=p.x;py=p.y;}
 return {x:px,y:py,moved:Math.hypot(px-x,py-y)>0.05};
}
function path(scene,start,end){
 const clearance=R+3;
 const origin=nearestFree(scene,start.x,start.y,clearance),goal=nearestFree(scene,end.x,end.y,clearance);
 if(sceneKey(scene)==="paris")return [goal];
 const cols=Math.floor(W/STEP),rows=Math.floor(H/STEP);
 const encode=(x,y)=>y*cols+x;
 const cell=(x,y)=>({x:clamp(Math.floor(x/STEP),0,cols-1),y:clamp(Math.floor(y/STEP),0,rows-1)});
 const center=(x,y)=>({x:x*STEP+STEP/2,y:y*STEP+STEP/2});
 const closestCell=point=>{
   const base=cell(point.x,point.y);let found=null,d=Infinity;
   for(let yy=0;yy<rows;yy++)for(let xx=0;xx<cols;xx++){
     const p=center(xx,yy),dd=(p.x-point.x)**2+(p.y-point.y)**2;
     if(dd<d&&canStand(scene,p.x,p.y,clearance)){d=dd;found={x:xx,y:yy};}
   }
   return found||base;
 };
 const s=closestCell(origin),e=closestCell(goal),source=encode(s.x,s.y),finish=encode(e.x,e.y);
 const heuristic=(x,y)=>Math.abs(x-e.x)+Math.abs(y-e.y);
 const open=[{x:s.x,y:s.y,k:source,score:heuristic(s.x,s.y)}],g=new Map([[source,0]]),prev=new Map(),seen=new Set();
 const directions=[[1,0],[-1,0],[0,1],[0,-1]];
 let found=false,iterations=0;
 while(open.length&&iterations++<cols*rows*5){
  open.sort((a,b)=>a.score-b.score);
  const cur=open.shift();
  if(seen.has(cur.k))continue;
  if(cur.k===finish){found=true;break;}
  seen.add(cur.k);
  for(const [dx,dy] of directions){
   const x=cur.x+dx,y=cur.y+dy;
   if(x<0||y<0||x>=cols||y>=rows)continue;
   const k=encode(x,y),px=x*STEP+STEP/2,py=y*STEP+STEP/2;
   if(!canStand(scene,px,py,clearance))continue;
   if(seen.has(k))continue;
   const cand=g.get(cur.k)+1;
   if(cand<(g.get(k)??Infinity)){
    g.set(k,cand);prev.set(k,cur.k);open.push({x,y,k,score:cand+heuristic(x,y)});
   }
  }
 }
 if(!found)return [];
 const route=[];
 let k=finish,safety=0;
 while(k!==source&&safety++<cols*rows){
  const cx=k%cols,cy=Math.floor(k/cols);
  route.push({x:cx*STEP+STEP/2,y:cy*STEP+STEP/2});
  k=prev.get(k);if(k==null)break;
 }
 route.reverse();
 // Si el último tramo atraviesa un mueble, se termina en la casilla libre.
 const last=route.at(-1)||origin;let clear=true;
 for(let t=.1;t<=1;t+=.1){
   const x=last.x+(goal.x-last.x)*t,y=last.y+(goal.y-last.y)*t;
   if(!canStand(scene,x,y,clearance)){clear=false;break;}
 }
 if(clear)route.push(goal);
 return route;
}
return {obstacles,canStand,nearestFree,slide,path,version:"1.1"};
})();