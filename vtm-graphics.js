"use strict";
/* Motor de arte procedural 2D v2 · 480x300 px lógicos.
 Los fondos se almacenan en memoria; el estado del juego no cambia. */
window.VTM_GRAPHICS=(()=>{
const W=480,H=300,cache=new Map();
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
function cityBackground(c){
 cobbles(c,"#343643",5);
 for(let y=0;y<300;y+=38)for(let x=0;x<480;x+=53){
   const v=noise(x,y,12),roof=["#413b49","#51434a","#4a404d","#343747"][Math.floor(v*4)];
   rect(c,x+1,y+1,48,35,"#151923");rect(c,x+3,y+4,44,28,roof);rect(c,x+4,y+5,43,4,"#74616b");
   rect(c,x+7,y+11,36,17,"#363440");
   for(let j=0;j<4;j++){rect(c,x+9+j*8,y+14,5,10,noise(x+j,y,9)>.46?"#dab18a":"#2a303d");rect(c,x+10+j*8,y+16,3,3,"#374052");}
   if(v>.7){rect(c,x+18,y-2,9,8,"#695b60");rect(c,x+20,y-4,5,3,"#27262e");}
 }
 for(let y=71;y<300;y+=72){rect(c,0,y,480,18,"#2d313e");rect(c,0,y,480,2,"#8d8590");rect(c,0,y+16,480,2,"#76717d");for(let x=0;x<480;x+=28)rect(c,x+6,y+9,13,2,"#c2b19e");}
 for(let x=108;x<480;x+=118){rect(c,x,0,21,300,"#2c303d");rect(c,x,0,2,300,"#837b80");rect(c,x+19,0,2,300,"#837b80");for(let y=0;y<300;y+=36)rect(c,x+10,y+7,2,17,"#b5a494");}
 for(let x=0;x<480;x+=5){const y=158+Math.sin(x/80)*25;rect(c,x,y,6,26,"#2b3f54");rect(c,x+1,y+10,4,2,"#69879a");rect(c,x+2,y+20,3,1,"#b8a18b");}
 for(const x of [105,224,345]){const y=158+Math.sin(x/80)*25;rect(c,x,y-7,24,40,"#777179");rect(c,x+3,y-4,18,34,"#a09790");rect(c,x+6,y+4,12,2,"#d0b499");}
 for(let x=25;x<480;x+=82)for(const y of [60,226]){lamp(c,x,y);if(noise(x,y)>.4){rect(c,x+16,y-7,20,10,"#426452");rect(c,x+20,y-13,12,18,"#486e59");rect(c,x+24,y+3,3,9,"#695751");}}
 for(const [x,y,col] of [[139,76,"#59697a"],[243,220,"#704e60"],[362,146,"#63726e"]]){rect(c,x,y,29,14,"#171c27");rect(c,x+2,y+2,24,10,col);rect(c,x+8,y+3,12,6,"#293848");rect(c,x+4,y+12,5,2,"#e6a088");}
}
function drawCity(c,game,D,N,time){
 drawCached(c,"paris",cityBackground);
 for(const loc of D.locations){
  const x=Math.round(loc.x/2.1),y=Math.round(loc.y/2),w=Math.round(loc.w/2.1),h=Math.round(loc.h/2);
  const active=D.quests.some(q=>q.id===game.activeQuest&&q.place===loc.id)||(game.activeQuest==="archivos"&&["policia","stjuly","hemeroteca"].includes(loc.id))||Object.values(game.sideQuests||{}).some(q=>q.status==="active"&&window.VTM_ARCS.personal[q.id]?.target===loc.id);
  const color=N.environments[loc.id]?.accent||"#806b74";
  rect(c,x-3,y-3,w+6,h+6,active?"#d6b68c":"#151a26");rect(c,x,y,w,h,color);rect(c,x+5,y+5,w-10,h-10,"#292834");
  rect(c,x+8,y+7,w-16,4,"#b69a87");for(let i=0;i<3;i++)rect(c,x+11+i*10,y+15,6,7,i===1?"#ddb38d":"#45475a");
  const label=loc.name.length>18?loc.name.split(" ").slice(0,2).join(" "):loc.name;
  text(c,label,x+w/2,y+h/2+8,7);
  if(active){rect(c,x+w/2-4,y-14,8,9,"#e0bc8c");text(c,"!",x+w/2,y-7,9,"#342535");glow(c,x+w/2,y-10,18,"245,186,112",.15);}
  if(loc.id==="elysee"&&!game.access.elysee)rect(c,x+w-12,y+h-12,8,8,"#a56980");
 }
 rect(c,4,241,85,55,"#171b27");rect(c,10,248,72,45,"#927b7b");rect(c,17,254,58,33,"#2e2c3b");text(c,"RESIDENCIA",45,273,8);
}

// Continúa: escenas y sprites.
