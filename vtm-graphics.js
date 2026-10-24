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
const scenePictures={};
function loadBackplates(items,prefix){
 if(typeof Image!=="function")return;
 for(const [name,url] of Object.entries(items)){
   const entry={ready:false,failed:false,img:new Image()};
   scenePictures[prefix+name]=entry;
   entry.img.onload=()=>{entry.ready=!!entry.img.naturalWidth;entry.failed=!entry.ready;};
   entry.img.onerror=()=>{entry.failed=true;entry.ready=false;};
   entry.img.src="./"+url+"?v=escenarios-1";
 }
}
loadBackplates(artScenes,"venue:");
loadBackplates(artResidences,"residence:");
function renderBackplate(c,key){
 const entry=scenePictures[key];
 if(!entry?.ready)return false;
 try{
   c.drawImage(entry.img,0,0,480,300);
   return true;
 }catch(e){entry.ready=false;entry.failed=true;return false;}
}
function backgroundStatus(){
 const keys=Object.keys(scenePictures);
 return {total:keys.length,ready:keys.filter(k=>scenePictures[k].ready).length,
 failed:keys.filter(k=>scenePictures[k].failed).map(k=>k)};
}
const atlasRows={Toreador:0,Ventrue:1,Tremere:2,Nosferatu:3,Brujah:4,Gangrel:5,Malkavian:6,Ghoul:7,
 isabelle:8,ingrid:9,lucien:10,john:11,marcus:12,dupont:13,guardiana:14,archivista:15};
let atlas=null,atlasReady=false,atlasFailed=false;
if(typeof Image==="function"){
 atlas=new Image();
 atlas.onload=()=>{atlasReady=!!atlas.naturalWidth;atlasFailed=!atlasReady;};
 atlas.onerror=()=>{atlasReady=false;atlasFailed=true;};
 atlas.src="./assets/personajes-paris-v2.svg?v=vtm20-f3";
}
function drawSprite(c,x,y,opts){
 if(!atlasReady||!atlas)return false;
 const direction={down:0,left:1,right:2,up:3}[opts.facing]??0;
 const row=opts.npc&&atlasRows[opts.npc.id]!=null?atlasRows[opts.npc.id]:
  !opts.master&&!opts.npc&&!opts.embraced?atlasRows.Ghoul:(atlasRows[opts.clan]??atlasRows.Ghoul);
 const frame=opts.walking?Math.floor((opts.cycle||0)*2)%2:0;
 try{
  c.drawImage(atlas,(direction*2+frame)*32,row*48,32,48,Math.round(x)-16,Math.round(y)-21,32,48);
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
function drawResidence(c,room,clan,C,game,time){
 const d=C.residences[clan];if(!d)return;
 if(room!=="house"||!renderBackplate(c,"residence:"+clan))drawCached(c,"res:"+clan+":"+room,ctx=>residenceBase(ctx,room,clan,d));
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
function drawVenue(c,id,N,game,time){
 const env=N.environments[id];if(!env)return;
 if(!renderBackplate(c,"venue:"+id))drawCached(c,"venue:"+id,ctx=>venueBase(ctx,id,env));
 text(c,env.label.toUpperCase(),240,24,12);
 if(game.activeQuest||Object.values(game.sideQuests||{}).some(q=>q.status==="active")){
  const pul=.1+.05*Math.sin(time*3);glow(c,130,140,25,"236,183,121",pul);
 }
}


function character(c,x,y,opts={}){
 if(drawSprite(c,x,y,opts))return;
 const {master=false,clan="Toreador",npc=null,embraced=false,facing="down",walking=false,cycle=0,time=0}=opts;
 x=Math.round(x);y=Math.round(y);
 const palette={Toreador:"#986177",Tremere:"#847096",Brujah:"#975d57",Nosferatu:"#5d7d6b",Ventrue:"#647d96",Gangrel:"#657b60",Malkavian:"#85719a"};
 const jacket=npc?.color||palette[clan]||"#78817d",skin=npc?.skin||(clan==="Nosferatu"?"#a0a18b":"#d4ae98"),hair=npc?.hair||(clan==="Tremere"?"#a8a0a3":"#2b2830");
 const player=!master&&!npc,bob=walking?Math.round(Math.sin(cycle*10)*1.5):0,stride=walking?Math.round(Math.sin(cycle*10)*3):0;
 rect(c,x-12,y+18,24,5,"#0a0e1699");
 rect(c,x-7-stride,y+12,6,11,"#222833");rect(c,x+2+stride,y+12,6,11,"#1e222e");
 rect(c,x-8-stride,y+20,8,4,"#11151d");rect(c,x+1+stride,y+20,8,4,"#0d111b");
 rect(c,x-11,y-2+bob,22,17,"#151721");rect(c,x-9,y+bob,19,15,player?(embraced?"#734457":"#6e7b80"):jacket);
 rect(c,x-14,y+2+bob,5,13,jacket);rect(c,x+10,y+2+bob,5,13,jacket);
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
 if(npc){
   rect(c,x-24,y-32,48,11,"#11151dc9");
   text(c,npc.name.length>14?npc.name.slice(0,12)+"…":npc.name,x,y-24,7,"#f3d5b8");
 }else if(master){
   rect(c,x-23,y-32,46,11,"#12141ac4");
   text(c,"DOMITOR",x,y-24,7,"#edd1b7");
 }
}
function effects(c,mode,time,location){
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
   const mood=moods[location]||["231,188,140",.05];
   glow(c,240,100,72,mood[0],mood[1]*(1+Math.sin(time*1.6)*.15));
   for(let i=0;i<15;i++){
    const x=(i*53+Math.floor(Math.sin(time*.5+i)*11)+480)%480;
    const y=(i*61-Math.floor(time*(3+i%4))+3000)%300;
    rect(c,x,y,1,1,i%3?"#f2d9b14f":"#ebddd47c");
   }
 }
}
function clearCache(){cache.clear();}
return {drawCity,drawResidence,drawVenue,character,effects,clearCache,backgroundStatus,assetStatus:()=>({atlasReady,atlasFailed,...backgroundStatus()}),version:"2.0-phase-IV"};
})();
