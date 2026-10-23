"use strict";
(function(){
const $=id=>document.getElementById(id);
const canvas=$("game"),g=canvas.getContext("2d"),mini=$("minimap"),mg=mini.getContext("2d");
const VW=1000,VH=640,S=500,COLS=20,ROWS=15,W=COLS*S,H=ROWS*S,BASE_X=10,BASE_Y=7,BASE_ID=BASE_Y*COLS+BASE_X;
const TYPES=["Casa","Casa","Casa","Tienda","Farmacia","Taller","Almacén","Comisaría"];
const COLORS={"Casa":"#837d6d","Tienda":"#9c8970","Farmacia":"#8b9c88","Taller":"#7e8583","Almacén":"#787e77","Comisaría":"#7d8997"};
const COST={wall:{wood:6,scrap:2},trap:{wood:4,scrap:2},tower:{wood:8,scrap:12},outpost:{wood:14,scrap:10}};
const LABEL={wall:"Barricada",trap:"Trampa",tower:"Torreta",outpost:"Puesto avanzado"};
const STORAGE_KEY="ultimo-refugio-world-v2";
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const dist=(a,b,c,d)=>Math.hypot(a-c,b-d);
const rand=(a,b)=>Math.random()*(b-a)+a;
const roll=p=>Math.random()<p;
const sector=(x,y)=>clamp(Math.floor(y/S),0,ROWS-1)*COLS+clamp(Math.floor(x/S),0,COLS-1);
const sectorCoord=(x,y)=>({col:clamp(Math.floor(x/S),0,COLS-1),row:clamp(Math.floor(y/S),0,ROWS-1)});
function hash(){
 let h=(saved.seed||173811)>>>0;
 for(let i=0;i<arguments.length;i++){h=Math.imul(h^(arguments[i]|0),16777619);h^=h>>>13;h=Math.imul(h,2246822519);}
 return (h>>>0)/4294967296;
}
let saved,buildings=[],buildingById=new Map(),zombies=[],roomZombies=[],bullets=[],particles=[],noises=[],visited=new Set(),spawned=new Set();
let mode="menu",lastMode="world",inside=null,buildType=null,keys=new Set(),pointer={x:500,y:320,active:false,down:false},camera={x:0,y:0},moveTimer=0,shotTimer=0,autosave=0,spawnTimer=0,hudTimer=0,noticeTimer=0,noticeText="",frameLast=performance.now(),clockTime=0,roomSpawned=false,runTouch=false;
function makeSave(){
 const startX=(BASE_X+.5)*S,startY=(BASE_Y+.5)*S;
 return {version:2,seed:Math.floor(Math.random()*2000000000),player:{x:startX,y:startY,hp:100,stamina:100,hunger:7,ammo:12,face:0,invuln:0},inv:{wood:12,scrap:9,cloth:2,food:2,med:1,bullets:18},time:480,visited:[BASE_ID],loot:{},clearedRooms:{},structures:[],roomId:null,roomPos:null,outside:null,deaths:0,kills:0};
}
function buildWorld(){
 buildings=[];buildingById=new Map();
 for(let row=0;row<ROWS;row++)for(let col=0;col<COLS;col++){
  if(col===BASE_X&&row===BASE_Y)continue;
  for(let n=0;n<4;n++){
   const cx=n%2,cy=Math.floor(n/2),type=TYPES[Math.floor(hash(col,row,n,4)*TYPES.length)];
   const x=col*S+(cx?301:29),y=row*S+(cy?301:29),w=170,h=170;
   const doorX=cx?x-4:x+w+4,doorY=y+h*.5;
   const b={id:col+"-"+row+"-"+n,x,y,w,h,doorX,doorY,type,col,row,n};
   buildings.push(b);buildingById.set(b.id,b);
  }
 }
}
function load(){
 try{
  const raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");
  if(!raw||raw.version!==2||!raw.player||!raw.inv)return false;
  saved=raw;saved.structures=Array.isArray(saved.structures)?saved.structures:[];saved.loot=saved.loot||{};
  saved.player.stamina=clamp(Number(saved.player.stamina)||50,0,100);
  saved.player.hunger=clamp(Number(saved.player.hunger)||0,0,100);
  saved.player.x=clamp(Number(saved.player.x)||0,18,W-18);
  saved.player.y=clamp(Number(saved.player.y)||0,18,H-18);
  saved.visited=Array.isArray(saved.visited)?saved.visited:[BASE_ID];saved.clearedRooms=saved.clearedRooms||{};
  return true;
 }catch(e){return false;}
}
function save(silent){
 if(!saved||mode==="menu"||mode==="over")return;
 saved.visited=Array.from(visited);
 saved.roomId=inside?inside.id:null;
 saved.roomPos=inside?{x:saved.player.x,y:saved.player.y}:null;
 try{localStorage.setItem(STORAGE_KEY,JSON.stringify(saved));if(!silent)note("Partida guardada en este navegador.");}
 catch(e){if(!silent)note("No se pudo guardar: almacenamiento lleno o bloqueado.");}
}
function begin(newGame){
 if(newGame||!load())saved=makeSave();
 buildWorld();zombies=[];roomZombies=[];bullets=[];particles=[];noises=[];spawned=new Set();
 visited=new Set(saved.visited);inside=null;buildType=null;moveTimer=0;spawnTimer=0;autosave=0;hudTimer=0;shotTimer=0;runTouch=false;
 if(saved.roomId&&buildingById.has(saved.roomId)){
  inside=buildingById.get(saved.roomId);
  saved.player.x=saved.roomPos?saved.roomPos.x:500;
  saved.player.y=saved.roomPos?saved.roomPos.y:540;
  initializeRoom();
  mode="inside";
 }else{saved.roomId=null;mode="world";}
 $("overlay").classList.add("hidden");$("pauseBtn").textContent="Pausa";
 announce("Estás en el mundo abierto. No hay oleadas; cada decisión hace ruido.");updateUI();save(true);
}
function announce(text){noticeText=text;noticeTimer=4.5;$("toast").textContent=text;$("toast").classList.remove("hidden");const log=$("log");const row=document.createElement("div");row.textContent="• "+text;log.prepend(row);while(log.childElementCount>6)log.lastElementChild.remove();}
function note(text){announce(text);}
function usedSlots(){return Object.values(saved.inv).reduce((sum,v)=>sum+(Number(v)||0),0);}
function capacity(){return 55+saved.structures.filter(s=>s.type==="outpost"&&s.hp>0).length*8;}
function addLoot(type,count){
 if(count<=0)return 0;
 const n=Math.min(Math.floor(count),Math.max(0,capacity()-usedSlots()));
 saved.inv[type]=(saved.inv[type]||0)+n;return n;
}
function generateLoot(b,k){
 const h=hash(b.col,b.row,b.n,k,36),n=1+Math.floor(hash(b.col,b.row,b.n,k,37)*6);
 if(b.type==="Farmacia")return {type:h<.65?"med":"cloth",count:1+Math.floor(n/2)};
 if(b.type==="Tienda")return {type:h<.50?"food":h<.72?"cloth":h<.88?"wood":"bullets",count:n};
 if(b.type==="Taller")return {type:h<.68?"scrap":h<.90?"wood":"bullets",count:n};
 if(b.type==="Almacén")return {type:h<.40?"wood":h<.8?"scrap":"food",count:n+2};
 if(b.type==="Comisaría")return {type:h<.6?"bullets":h<.83?"med":"scrap",count:n+1};
 return {type:h<.40?"wood":h<.67?"cloth":h<.87?"food":"scrap",count:n};
}
function zoneName(col,row){
 const a=["EL NORTE","LA RIBERA","LOS PINOS","EL CENTRO","LAS VÍAS","EL SUR"];
 const idx=clamp(Math.floor(row/3),0,5);
 return "SECTOR "+(row*COLS+col+1)+" · "+a[idx];
}
function intersectsRect(x,y,r,rect){return x+r>rect.x&&x-r<rect.x+rect.w&&y+r>rect.y&&y-r<rect.y+rect.h;}
function nearbyBuildings(x,y){
 const p=sectorCoord(x,y),arr=[];
 for(let row=Math.max(0,p.row-1);row<=Math.min(ROWS-1,p.row+1);row++)
  for(let col=Math.max(0,p.col-1);col<=Math.min(COLS-1,p.col+1);col++)
   for(let n=0;n<4;n++){const b=buildingById.get(col+"-"+row+"-"+n);if(b)arr.push(b);}
 return arr;
}
function blockedWorld(x,y,r,forZombie){
 if(x<r||y<r||x>W-r||y>H-r)return true;
 for(const b of nearbyBuildings(x,y))if(intersectsRect(x,y,r,b))return true;
 for(const s of saved.structures){
  if(s.hp<=0||s.type==="trap")continue;
  if(forZombie&&s.type==="tower")continue;
  if(dist(x,y,s.x,s.y)<r+(s.type==="outpost"?24:15))return true;
 }
 return false;
}
function blockedRoom(x,y,r){return x<42+r||x>958-r||y<53+r||y>607-r;}
function moveEntity(e,dx,dy,r,room,isZombie){
 let nextX=e.x+dx,nextY=e.y+dy;
 const blocked=room?blockedRoom:((x,y,rad)=>blockedWorld(x,y,rad,isZombie));
 if(!blocked(nextX,e.y,r))e.x=nextX;
 if(!blocked(e.x,nextY,r))e.y=nextY;
}
function doorTarget(){
 if(mode==="inside"){
  const p=saved.player;
  if(dist(p.x,p.y,500,584)<76)return {kind:"exit",distance:dist(p.x,p.y,500,584),text:"E · Salir a la calle"};
  for(let i=0;i<5;i++){
   if((saved.loot[inside.id]||[]).includes(i))continue;
   const pos=lootSpot(i),d=dist(p.x,p.y,pos.x,pos.y);
   if(d<75)return {kind:"loot",index:i,distance:d,text:"E · Saquear "+inside.type.toLowerCase()};
  }
  return null;
 }
 if(mode!=="world")return null;
 let best=null;
 for(const b of nearbyBuildings(saved.player.x,saved.player.y)){
  const d=dist(saved.player.x,saved.player.y,b.doorX,b.doorY);
  if(d<63&&(!best||d<best.distance))best={kind:"enter",building:b,distance:d,text:"E · Entrar: "+b.type};
 }
 const bx=(BASE_X+.5)*S,by=(BASE_Y+.5)*S,d=dist(saved.player.x,saved.player.y,bx,by);
 if(d<60&&(!best||d<best.distance))best={kind:"base",distance:d,text:"E · Guardar en el refugio"};
 return best;
}
function lootSpot(i){
 const slots=[{x:205,y:168},{x:495,y:165},{x:793,y:175},{x:252,y:402},{x:766,y:410}];
 return slots[i];
}
function initializeRoom(){
 roomZombies=[];roomSpawned=true;
 const p=saved.player;
 const amount=saved.clearedRooms[inside.id]?0:hash(inside.col,inside.row,inside.n,70)<.26?2:hash(inside.col,inside.row,inside.n,71)<.42?1:0;
 for(let i=0;i<amount;i++){
  const x=180+i*390+rand(-40,40),y=245+rand(-35,65);
  if(dist(x,y,p.x,p.y)>145)roomZombies.push(makeZombie(x,y,true));
 }
}
function enter(b){
 if(!b)return;
 saved.outside={x:saved.player.x,y:saved.player.y};
 inside=b;mode="inside";buildType=null;bullets=[];saved.player.x=500;saved.player.y=540;
 initializeRoom();sound(saved.outside.x,saved.outside.y,165,5);
 announce("Entraste en "+b.type.toLowerCase()+". Buscá suministros y vigilá los rincones.");save(true);
}
function leave(){
 if(!inside)return;
 inside=null;roomZombies=[];mode="world";bullets=[];
 const out=saved.outside||{x:(BASE_X+.5)*S,y:(BASE_Y+.5)*S};
 saved.player.x=out.x;saved.player.y=out.y;saved.outside=null;
 announce("Volviste a la calle.");save(true);
}
function interact(){
 if(mode!=="world"&&mode!=="inside")return;
 const t=doorTarget();if(!t){note("No hay nada cerca para interactuar.");return;}
 if(t.kind==="enter"){enter(t.building);return;}
 if(t.kind==="exit"){leave();return;}
 if(t.kind==="base"){save(false);return;}
 if(t.kind==="loot"){
  const reward=generateLoot(inside,t.index);
  if(capacity()-usedSlots()<reward.count){note("Necesitás "+reward.count+" espacios libres para recoger estos suministros.");return;}
  const n=addLoot(reward.type,reward.count);
  if(!saved.loot[inside.id])saved.loot[inside.id]=[];
  saved.loot[inside.id].push(t.index);
  sound(saved.outside.x,saved.outside.y,120,5);
  const names={wood:"madera",scrap:"chatarra",cloth:"tela",food:"comida",med:"botiquín",bullets:"balas"};
  announce("Encontraste "+n+" de "+names[reward.type]+".");
  save(true);
 }
}
function sound(x,y,radius,strength){
 noises.push({x,y,radius,age:0});
 if(noises.length>8)noises.shift();
 saved.noise=clamp((saved.noise||0)+strength,0,100);
 for(const z of zombies)if(dist(x,y,z.x,z.y)<radius){z.tx=x+rand(-35,35);z.ty=y+rand(-35,35);z.alert=Math.max(z.alert,6+strength*.12);}
 if(strength>=24&&mode==="world")for(let i=0;i<1+Math.floor(strength/22);i++)spawnAround(x,y,680,1100,true);
}
function makeZombie(x,y,room){
 return {x,y,hp:room?55:65,maxHp:room?55:65,speed:rand(34,48),r:12,face:rand(0,6.28),alert:0,tx:x+rand(-90,90),ty:y+rand(-90,90),hit:0,walk:rand(0,4),room:!!room};
}
function streetPoint(x,y){
 x=clamp(x,35,W-35);y=clamp(y,35,H-35);
 const col=clamp(Math.floor(x/S),0,COLS-1),row=clamp(Math.floor(y/S),0,ROWS-1);
 if(roll(.5))x=(col+.5)*S+rand(-25,25);
 else y=(row+.5)*S+rand(-25,25);
 return {x:clamp(x,25,W-25),y:clamp(y,25,H-25)};
}
function spawnAround(x,y,min,max,alerted){
 if(zombies.length>=80)return false;
 for(let tries=0;tries<12;tries++){
  const a=rand(0,Math.PI*2),d=rand(min,max),p=streetPoint(x+Math.cos(a)*d,y+Math.sin(a)*d);
  if(dist(p.x,p.y,saved.player.x,saved.player.y)<430||blockedWorld(p.x,p.y,15,true))continue;
  const z=makeZombie(p.x,p.y,false);
  if(alerted){z.tx=x;z.ty=y;z.alert=18;}
  zombies.push(z);return true;
 }
 return false;
}
function ambient(dt){
 if(mode!=="world")return;
 spawnTimer+=dt;
 if(spawnTimer<2.6)return;
 spawnTimer=0;
 const id=sector(saved.player.x,saved.player.y);
 const p=sectorCoord(saved.player.x,saved.player.y);
 for(let row=Math.max(0,p.row-1);row<=Math.min(ROWS-1,p.row+1);row++)
  for(let col=Math.max(0,p.col-1);col<=Math.min(COLS-1,p.col+1);col++){
   const k=row*COLS+col;
   if(spawned.has(k))continue;
   spawned.add(k);
   const count=1+Math.floor(hash(col,row,777)*3);
   if(k===BASE_ID)continue;
   for(let i=0;i<count;i++)spawnAround((col+.5)*S,(row+.5)*S,70,280,false);
  }
 if(zombies.length<45&&roll(.19+(saved.noise||0)*.004))spawnAround(saved.player.x,saved.player.y,560,1060,roll(.4));
 zombies=zombies.filter(z=>z.hp>0&&dist(z.x,z.y,saved.player.x,saved.player.y)<1850);
 if(spawned.size>30)for(const k of Array.from(spawned)){const col=k%COLS,row=Math.floor(k/COLS);if(Math.abs(col-p.col)>2||Math.abs(row-p.row)>2)spawned.delete(k);}
}
function targetZombies(){return inside?roomZombies:zombies;}
function zombieAI(dt){
 const list=targetZombies(),p=saved.player;
 for(const z of list){
  if(z.hp<=0)continue;
  z.hit=Math.max(0,z.hit-dt);z.walk-=dt;
  const d=dist(z.x,z.y,p.x,p.y),sight=inside?330:235,notice=(saved.noise||0)>35?60:0;
  if(d<sight+notice){z.tx=p.x;z.ty=p.y;z.alert=Math.max(z.alert,1.4);}
  else if(z.walk<=0&&z.alert<=0){z.tx=z.x+rand(-90,90);z.ty=z.y+rand(-90,90);z.walk=rand(2.5,7);}
  z.alert=Math.max(0,z.alert-dt);
  if(dist(z.x,z.y,z.tx,z.ty)>8){
   const a=Math.atan2(z.ty-z.y,z.tx-z.x);z.face=a;
   const sp=z.speed*(z.alert>0?1.38:.65)*dt;
   moveEntity(z,Math.cos(a)*sp,Math.sin(a)*sp,z.r,!!inside,true);
  }
  if(d<z.r+13&&z.hit<=0&&p.invuln<=0){p.hp=clamp(p.hp-rand(7,11),0,100);p.invuln=.55;z.hit=1.1;noticeText="¡Te atacó un infectado!";noticeTimer=1.2;if(p.hp<=0)die();}
  if(!inside&&d>1300&&z.alert<=0)z.walk=0;
 }
 if(inside){roomZombies=roomZombies.filter(z=>z.hp>0);if(roomSpawned&&roomZombies.length===0)saved.clearedRooms[inside.id]=true;}
 else zombies=zombies.filter(z=>z.hp>0);
}
function shoot(){
 if(mode!=="world"&&mode!=="inside"||shotTimer>0)return;
 if(saved.player.ammo<=0){note("Cargador vacío. Presioná R para recargar.");shotTimer=.3;return;}
 saved.player.ammo--;shotTimer=.24;
 let angle=saved.player.face,p=saved.player;
 if(pointer.active){const px=pointer.x+camera.x,py=pointer.y+camera.y;angle=Math.atan2(py-p.y,px-p.x);}
 else{const enemy=targetZombies().filter(z=>dist(z.x,z.y,p.x,p.y)<350).sort((a,b)=>dist(a.x,a.y,p.x,p.y)-dist(b.x,b.y,p.x,p.y))[0];
  if(enemy)angle=Math.atan2(enemy.y-p.y,enemy.x-p.x);}
 angle+=rand(-.055,.055);saved.player.face=angle;
 bullets.push({x:p.x+Math.cos(angle)*14,y:p.y+Math.sin(angle)*14,vx:Math.cos(angle)*850,vy:Math.sin(angle)*850,life:.78,dmg:38});
 if(inside){sound(saved.outside.x,saved.outside.y,820,27);for(const z of roomZombies)z.alert=9;}
 else sound(p.x,p.y,820,27);
 particles.push({x:p.x+Math.cos(angle)*20,y:p.y+Math.sin(angle)*20,t:.11,c:"#ffe5a1"});
}
function melee(){
 if(mode!=="world"&&mode!=="inside"||shotTimer>.17)return;
 shotTimer=.34;const p=saved.player,tar=targetZombies();
 let hit=false;
 for(const z of tar){const d=dist(p.x,p.y,z.x,z.y),a=Math.atan2(z.y-p.y,z.x-p.x);
  if(d<62&&Math.cos(a-p.face)>.15){z.hp-=27;z.alert=5;hit=true;if(z.hp<=0){saved.kills++;particles.push({x:z.x,y:z.y,t:.7,c:"#9f4d46"});}}
 }
 if(inside)sound(saved.outside.x,saved.outside.y,70,2);else sound(p.x,p.y,70,2);
 if(hit)note("Golpeaste a un infectado sin disparar.");
}
function reload(){
 if(mode!=="world"&&mode!=="inside")return;
 const need=12-saved.player.ammo,n=Math.min(need,saved.inv.bullets);
 if(n<=0){note("No tenés balas de reserva.");return;}
 saved.player.ammo+=n;saved.inv.bullets-=n;shotTimer=Math.max(shotTimer,.65);note("Arma recargada.");
}
function heal(){
 if(!saved||!["world","inside"].includes(mode))return;
 if(saved.inv.med<=0){note("No tenés botiquines.");return;}
 if(saved.player.hp>=100){note("Ya tenés la salud al máximo.");return;}
 saved.inv.med--;saved.player.hp=clamp(saved.player.hp+44,0,100);note("Usaste un botiquín.");
}
function eat(){
 if(!saved||!["world","inside"].includes(mode))return;
 if(saved.inv.food<=0){note("No tenés comida.");return;}
 if(saved.player.hunger<10){note("Todavía no tenés hambre.");return;}
 saved.inv.food--;saved.player.hunger=Math.max(0,saved.player.hunger-48);note("Comiste y recuperaste fuerzas.");
}
function canBuild(x,y,type){
 if(mode!=="world"||!COST[type])return false;
 const p=saved.player;
 if(dist(x,y,p.x,p.y)>185||blockedWorld(x,y,type==="outpost"?27:18))return false;
 for(const s of saved.structures)if(dist(x,y,s.x,s.y)<38)return false;
 const baseX=(BASE_X+.5)*S,baseY=(BASE_Y+.5)*S;
 let connected=dist(x,y,baseX,baseY)<320;
 if(!connected)connected=saved.structures.some(s=>s.type==="outpost"&&s.hp>0&&dist(x,y,s.x,s.y)<265);
 if(!connected)return false;
 return Object.entries(COST[type]).every(([key,val])=>saved.inv[key]>=val);
}
function build(x,y){
 if(!buildType||mode!=="world")return;
 x=Math.floor(x/36)*36+18;y=Math.floor(y/36)*36+18;
 if(!canBuild(x,y,buildType)){note("Fuera de la zona de construcción, lugar ocupado o faltan recursos.");return;}
 for(const [item,n] of Object.entries(COST[buildType]))saved.inv[item]-=n;
 saved.structures.push({type:buildType,x,y,hp:buildType==="wall"?140:buildType==="outpost"?170:buildType==="tower"?95:45,cool:0});
 sound(x,y,185,8);note(LABEL[buildType]+" instalada. La base sigue creciendo.");save(true);
}
function attackStructures(dt){
 for(const z of zombies){
  if(z.hp<=0)continue;
  for(const s of saved.structures){
   if(s.hp<=0||s.type==="trap")continue;
   if(dist(z.x,z.y,s.x,s.y)<36&&z.hit<=0){s.hp-=rand(4,8);z.hit=1.2;z.alert=4;z.tx=s.x;z.ty=s.y;break;}
  }
 }
 for(const s of saved.structures){
  if(s.hp<=0)continue;
  s.cool=Math.max(0,s.cool-dt);
  if(s.type==="trap"){
   for(const z of zombies)if(z.hp>0&&dist(z.x,z.y,s.x,s.y)<30&&s.cool<=0){z.hp-=30;s.cool=1.2;particles.push({x:z.x,y:z.y,t:.5,c:"#b58269"});break;}
  }
  if(s.type==="tower"&&s.cool<=0){
   const z=zombies.find(z=>z.hp>0&&dist(z.x,z.y,s.x,s.y)<255);
   if(z){z.hp-=32;s.cool=1.6;particles.push({x:z.x,y:z.y,t:.25,c:"#ffcc82"});sound(s.x,s.y,490,11);if(z.hp<=0)saved.kills++;}
  }
 }
 saved.structures=saved.structures.filter(s=>s.hp>0);
}
function updateBullets(dt){
 const list=targetZombies();
 for(const b of bullets){
  const steps=Math.max(1,Math.ceil(850*dt/15)),dx=b.vx*dt/steps,dy=b.vy*dt/steps;
  for(let i=0;i<steps&&b.life>0;i++){
   b.x+=dx;b.y+=dy;
   if(inside?blockedRoom(b.x,b.y,3):blockedWorld(b.x,b.y,3,true)){b.life=0;break;}
   for(const z of list)if(z.hp>0&&dist(b.x,b.y,z.x,z.y)<z.r+5){
    z.hp-=b.dmg;z.alert=5;b.life=0;
    particles.push({x:z.x,y:z.y,t:.5,c:"#ba6357"});
    if(z.hp<=0)saved.kills++;
    break;
   }
  }
  b.life-=dt;
 }
 bullets=bullets.filter(b=>b.life>0);
}
function die(){
 mode="over";save(false);localStorage.removeItem(STORAGE_KEY);buildType=null;
 $("overlayTitle").textContent="TU HISTORIA TERMINÓ.";
 $("overlayCopy").textContent="Sobreviviste hasta el día "+(Math.floor(saved.time/1440)+1)+". Eliminaste "+saved.kills+" infectados y recorriste "+visited.size+" de 300 sectores. Empezá otra partida para intentarlo de nuevo.";
 $("overlay").classList.remove("hidden");$("newBtn").textContent="Volver a empezar";$("continueBtn").disabled=true;announce("La ciudad reclamó otro superviviente.");
}
function tick(dt){
 if(mode!=="world"&&mode!=="inside")return;
 const p=saved.player;shotTimer=Math.max(0,shotTimer-dt);noticeTimer=Math.max(0,noticeTimer-dt);
 p.invuln=Math.max(0,p.invuln-dt);saved.noise=Math.max(0,(saved.noise||0)-dt*4.4);
 saved.time+=dt*.58;p.hunger=clamp(p.hunger+dt*.044,0,100);
 if(p.hunger>=100)p.hp=Math.max(0,p.hp-dt*1.4);
 if(p.hp<=0){die();return;}
 const dx=Number(keys.has("d")||keys.has("arrowright"))-Number(keys.has("a")||keys.has("arrowleft"));
 const dy=Number(keys.has("s")||keys.has("arrowdown"))-Number(keys.has("w")||keys.has("arrowup"));
 const mag=Math.hypot(dx,dy),moving=mag>0;
 const sprint=(keys.has("shift")||runTouch)&&p.stamina>2&&moving;
 if(moving){
  const sp=(sprint?235:147)*(p.hunger>80?.85:1),mx=dx/mag*sp*dt,my=dy/mag*sp*dt;
  moveEntity(p,mx,my,12,!!inside,false);
  if(!pointer.active)p.face=Math.atan2(my,mx);
  if(sprint){p.stamina=clamp(p.stamina-dt*24,0,100);moveTimer+=dt;if(moveTimer>.43){const n=inside?saved.outside:p;sound(n.x,n.y,230,4.5);moveTimer=0;}}
 }else moveTimer=0;
 if(!sprint)p.stamina=clamp(p.stamina+dt*15,0,100);
 if(pointer.down)shoot();
 if(mode==="world"){
  const id=sector(p.x,p.y);if(!visited.has(id)){visited.add(id);saved.visited=Array.from(visited);if(visited.size%5===0)note("Exploraste "+visited.size+" de 300 sectores.");}
  ambient(dt);attackStructures(dt);
 }else{
  // En interiores, los infectados de la calle no se teletransportan dentro.
 }
 zombieAI(dt);updateBullets(dt);
 noises=noises.filter(n=>(n.age+=dt)<.65);
 particles=particles.filter(n=>(n.t-=dt)>0);
 autosave+=dt;if(autosave>18){autosave=0;save(true);}
 hudTimer+=dt;if(hudTimer>.16){hudTimer=0;updateUI();}
}
function updateUI(){
 if(!saved)return;
 const p=saved.player;
 $("hpText").textContent=Math.ceil(p.hp)+"/100";$("hpBar").style.width=p.hp+"%";
 $("staminaText").textContent=Math.floor(p.stamina)+"%";$("staminaBar").style.width=p.stamina+"%";
 $("hungerText").textContent=Math.floor(p.hunger)+"%";$("hungerBar").style.width=p.hunger+"%";
 $("noiseText").textContent=Math.floor(saved.noise||0);$("noiseBar").style.width=(saved.noise||0)+"%";
 const n=saved.noise||0;const noiseTag=$("noiseTag");
 noiseTag.className="noise-tag"+(n>58?" danger":n>20?" loud":"");noiseTag.textContent=n>58?"¡MUCHO RUIDO!":n>20?"RUIDO: TE ESCUCHAN":"SILENCIO";
 $("ammo").textContent=p.ammo+" / "+saved.inv.bullets;
 for(const k of ["wood","scrap","cloth","food","med","bullets"])$(k).textContent=saved.inv[k]||0;
 $("capacity").textContent=usedSlots()+" / "+capacity();
 $("day").textContent=Math.floor(saved.time/1440)+1;
 const minutes=Math.floor(saved.time%1440),h=Math.floor(minutes/60),m=minutes%60;
 $("clock").textContent=String(h).padStart(2,"0")+":"+String(m).padStart(2,"0");
 $("explored").textContent=visited.size+" / 300";
 $("progressBar").style.width=(visited.size/300*100)+"%";
 $("baseStatus").textContent="Estructuras activas: "+saved.structures.length+" · Infectados eliminados: "+saved.kills;
 if(mode==="inside"){$("place").textContent=inside.type.toUpperCase()+" · INTERIOR";$("context").textContent="Entraste a explorar. E para saquear muebles o salir.";}
 else if(mode==="world"){$("place").textContent=zoneName(sectorCoord(p.x,p.y).col,sectorCoord(p.x,p.y).row);$("context").textContent="Los infectados deambulan y reaccionan a disparos o pasos.";}
 $("modeText").textContent=buildType?"CONSTRUIR · "+LABEL[buildType].toUpperCase():mode==="inside"?"SAQUEO INTERIOR":"EXPLORAR";
 $("hint").textContent=buildType?"Clic sobre terreno despejado. Construí cerca de la base o de un puesto.":"E interactuar · F golpear · R recargar · Shift correr";
 document.querySelectorAll("[data-build]").forEach(b=>b.classList.toggle("active",b.dataset.build===buildType));
 $("cancelBuild").classList.toggle("active",!!buildType);
 const t=doorTarget();$("prompt").classList.toggle("hidden",!t);if(t)$("prompt").textContent=t.text;
 $("toast").classList.toggle("hidden",noticeTimer<=0);
 drawMinimap();
}
function drawMinimap(){
 mg.fillStyle="#101918";mg.fillRect(0,0,300,225);
 const cw=15,ch=15;
 for(let row=0;row<ROWS;row++)for(let col=0;col<COLS;col++){
  const id=row*COLS+col;
  mg.fillStyle=id===BASE_ID?"#558964":visited.has(id)?"#5d7368":"#26352f";
  mg.fillRect(col*cw+1,row*ch+1,cw-2,ch-2);
 }
 const p=inside?saved.outside:saved.player;
 mg.fillStyle="#ffe4a7";mg.beginPath();mg.arc(p.x/W*300,p.y/H*225,4,0,Math.PI*2);mg.fill();
 mg.strokeStyle="#d3f7a0";mg.lineWidth=1.8;mg.strokeRect(BASE_X*cw+.5,BASE_Y*ch+.5,cw-1,ch-1);
}
function rect(x,y,w,h,color){g.fillStyle=color;g.fillRect(x,y,w,h);}
function circle(x,y,r,color){g.fillStyle=color;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();}
function text(t,x,y,size,color,align){
 g.fillStyle=color||"#e8f1e3";g.font="bold "+(size||12)+"px system-ui";g.textAlign=align||"left";g.fillText(t,x,y);
}
function drawCity(){
 camera.x=clamp(saved.player.x-VW/2,0,W-VW);camera.y=clamp(saved.player.y-VH/2,0,H-VH);
 g.save();g.translate(-camera.x,-camera.y);
 rect(camera.x,camera.y,VW,VH,"#394a3b");
 const startCol=clamp(Math.floor(camera.x/S)-1,0,COLS-1),endCol=clamp(Math.floor((camera.x+VW)/S)+1,0,COLS-1);
 const startRow=clamp(Math.floor(camera.y/S)-1,0,ROWS-1),endRow=clamp(Math.floor((camera.y+VH)/S)+1,0,ROWS-1);
 for(let row=startRow;row<=endRow;row++)for(let col=startCol;col<=endCol;col++){
  const x=col*S,y=row*S,b=col===BASE_X&&row===BASE_Y;
  rect(x,y,S,S,b?"#485b43":"#354635");
  if(b){
   rect(x+12,y+12,S-24,S-24,"#536449");
   g.strokeStyle="#9ea17b";g.lineWidth=7;g.strokeRect(x+12,y+12,S-24,S-24);
   for(let i=0;i<9;i++){circle(x+40+hash(col,row,i,301)*420,y+40+hash(col,row,i,302)*420,2.5,"#788b62");}
  }else{
   rect(x+204,y,92,S,"#31373a");rect(x,y+204,S,92,"#31373a");
   rect(x+210,y,80,S,"#3f4545");rect(x,y+210,S,80,"#3f4545");
   for(let j=20;j<S;j+=71){rect(x+247,y+j,5,24,"#c9bd8d66");rect(x+j,y+247,24,5,"#c9bd8d66");}
   for(let n=0;n<4;n++){
    const q=buildingById.get(col+"-"+row+"-"+n);if(!q)continue;
    rect(q.x+5,q.y+7,q.w,q.h,"#1b2923");
    rect(q.x,q.y,q.w,q.h,COLORS[q.type]);
    rect(q.x+8,q.y+8,q.w-16,q.h-16,"#5c665c");
    rect(q.x+15,q.y+15,q.w-30,q.h-30,COLORS[q.type]);
    g.strokeStyle="#c1b7a0";g.lineWidth=3;g.strokeRect(q.x+13,q.y+13,q.w-26,q.h-26);
    rect(q.doorX-5,q.doorY-15,10,30,"#d4c598");
    text(q.type,q.x+q.w/2,q.y+q.h/2,12,"#e3ded2","center");
    if((saved.loot[q.id]||[]).length===5)circle(q.doorX,q.doorY,5,"#596d5a");
    else circle(q.doorX,q.doorY,5,"#b7e49c");
   }
  }
 }
 const bx=(BASE_X+.5)*S,by=(BASE_Y+.5)*S;
 rect(bx-32,by-25,64,50,"#3e5945");g.strokeStyle="#c1de91";g.lineWidth=3;g.strokeRect(bx-32,by-25,64,50);text("BASE",bx,by+5,14,"#e6edc2","center");
 for(const s of saved.structures){
  if(s.x<camera.x-60||s.x>camera.x+VW+60||s.y<camera.y-60||s.y>camera.y+VH+60)continue;
  const t=s.type;
  if(t==="wall"){rect(s.x-20,s.y-11,40,22,"#9b7659");rect(s.x-18,s.y-7,36,5,"#d1ae84");}
  else if(t==="trap"){circle(s.x,s.y,18,"#7c5338");text("✕",s.x,s.y+7,25,"#dbc398","center");}
  else if(t==="tower"){circle(s.x,s.y,20,"#647c69");circle(s.x,s.y,9,"#d2d0a3");}
  else{rect(s.x-23,s.y-23,46,46,"#6e8d68");text("P",s.x,s.y+7,21,"#e8f3cc","center");}
  if(s.hp<(t==="wall"?140:t==="outpost"?170:t==="tower"?95:45)*.6)rect(s.x-18,s.y-28,36*(s.hp/170),3,"#e2a17b");
 }
 for(const n of noises){g.strokeStyle="rgba(244,195,130,"+(1-n.age/.65)*.33+")";g.lineWidth=2;g.beginPath();g.arc(n.x,n.y,n.radius*(n.age/.65),0,Math.PI*2);g.stroke();}
 drawZombies(zombies);
 drawBullets();
 drawPlayer();
 if(buildType){const p=pointerWorld();const x=Math.floor(p.x/36)*36+18,y=Math.floor(p.y/36)*36+18;circle(x,y,20,canBuild(x,y,buildType)?"#a2d68b88":"#e8787488");}
 g.restore();
 const hr=saved.time%1440/60;
 if(hr>18||hr<6){rect(0,0,VW,VH,"rgba(12,19,43,"+(hr>18?.28:.38)+")");}
}
function drawRoom(){
 camera.x=0;camera.y=0;rect(0,0,VW,VH,"#101a17");
 rect(32,43,936,578,"#1e2823");rect(46,56,908,544,"#6b6455");
 for(let x=85;x<960;x+=54){g.strokeStyle="#817d6b44";g.lineWidth=1;g.beginPath();g.moveTo(x,56);g.lineTo(x,602);g.stroke();}
 for(let y=70;y<600;y+=54){g.beginPath();g.moveTo(46,y);g.lineTo(954,y);g.stroke();}
 rect(45,50,910,11,"#283c34");rect(45,50,12,555,"#283c34");rect(944,50,12,555,"#283c34");
 rect(45,600,408,12,"#273b32");rect(548,600,408,12,"#273b32");
 rect(453,600,95,18,"#a9b487");
 text(inside.type.toUpperCase()+" · INTERIOR",500,92,21,"#e4d4ac","center");
 for(let i=0;i<5;i++){
  const p=lootSpot(i);const done=(saved.loot[inside.id]||[]).includes(i);
  rect(p.x-42,p.y-26,84,52,done?"#554f46":"#72664f");
  rect(p.x-36,p.y-20,72,15,done?"#6d685c":"#b7a272");
  if(!done){circle(p.x,p.y+13,8,"#d6e49b");text("?",p.x,p.y+18,13,"#233623","center");}
 }
 text("SALIDA",500,580,14,"#dfe9c6","center");
 drawZombies(roomZombies);drawBullets();drawPlayer();
}
function drawPlayer(){
 const p=saved.player;g.save();g.translate(p.x,p.y);g.rotate(p.face);
 if(p.invuln>0&&Math.floor(p.invuln*15)%2===0)g.globalAlpha=.45;
 circle(3,6,15,"#1f2b20aa");rect(-10,-10,19,20,"#b4c29c");circle(0,0,8,"#dec6a2");rect(8,-3,26,6,"#242e2b");rect(23,-2,11,4,"#b9b5a2");g.restore();
}
function drawZombies(list){
 for(const z of list){
  circle(z.x+3,z.y+6,13,"#131c16aa");g.save();g.translate(z.x,z.y);g.rotate(z.face);
  rect(-10,-11,20,22,"#576d54");circle(0,-2,9,"#a8aa8b");rect(2,-7,3,4,"#c15b4c");g.restore();
  if(z.hp<z.maxHp)rect(z.x-12,z.y-20,24*(z.hp/z.maxHp),3,"#db8577");
 }
}
function drawBullets(){
 for(const b of bullets)circle(b.x,b.y,3,"#ffe9ae");
 for(const p of particles)circle(p.x,p.y,4,p.c);
}
function drawMap(){
 camera.x=0;camera.y=0;rect(0,0,VW,VH,"#101a16");
 text("PLANO DE LA CIUDAD · 300 TRAMOS",VW/2,52,22,"#d8e5c5","center");
 const cw=38,ch=30,ox=120,oy=80;
 for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
  const id=r*COLS+c;rect(ox+c*cw+1,oy+r*ch+1,cw-3,ch-3,id===BASE_ID?"#6b9b68":visited.has(id)?"#5e7869":"#2b3932");
  if(visited.has(id))rect(ox+c*cw+13,oy+r*ch+10,10,8,"#819e83");
 }
 const p=inside?saved.outside:saved.player;const col=clamp(Math.floor(p.x/S),0,COLS-1),row=clamp(Math.floor(p.y/S),0,ROWS-1);
 circle(ox+(col+.5)*cw,oy+(row+.5)*ch,8,"#ffe6a8");
 text("VERDE: TU REFUGIO    ·    AMARILLO: TU POSICIÓN    ·    GRIS: ZONA SIN EXPLORAR",VW/2,578,13,"#b5c8b4","center");
 text("PRESIONÁ M O ESC PARA VOLVER",VW/2,608,12,"#dbeeb6","center");
}
function drawPause(){
 g.fillStyle="#0d171ad8";g.fillRect(0,0,VW,VH);
 text("PAUSA",VW/2,VH/2-15,48,"#f0efcf","center");
 text("ESC o el botón de pausa para continuar",VW/2,VH/2+23,16,"#c1d7be","center");
}
function render(){
 if(!saved){rect(0,0,VW,VH,"#1b2922");return;}
 if(mode==="map"){drawMap();return;}
 if(inside)drawRoom();else drawCity();
 if(mode==="pause")drawPause();
}
function pointerWorld(){
 return {x:pointer.x+camera.x,y:pointer.y+camera.y};
}
function setPointer(e){
 const box=canvas.getBoundingClientRect();
 pointer.x=(e.clientX-box.left)/box.width*VW;pointer.y=(e.clientY-box.top)/box.height*VH;pointer.active=true;
}
function pause(){
 if(mode==="pause"){mode=lastMode;$("pauseBtn").textContent="Pausa";}
 else if(mode==="world"||mode==="inside"){lastMode=mode;mode="pause";pointer.down=false;$("pauseBtn").textContent="Continuar";}
 updateUI();
}
function toggleMap(){
 if(mode==="map"){mode=lastMode;}else if(mode==="world"||mode==="inside"){lastMode=mode;mode="map";pointer.down=false;}updateUI();
}
function frame(now){
 const dt=clamp((now-frameLast)/1000,0,.045);frameLast=now;
 tick(dt);render();requestAnimationFrame(frame);
}
canvas.addEventListener("pointermove",setPointer);
canvas.addEventListener("pointerdown",e=>{
 if(!["world","inside"].includes(mode))return;
 e.preventDefault();setPointer(e);
 if(buildType&&mode==="world"){const p=pointerWorld();build(p.x,p.y);}
 else{pointer.down=true;shoot();}
});
window.addEventListener("pointerup",()=>{pointer.down=false;});
window.addEventListener("pointercancel",()=>{pointer.down=false;});
canvas.addEventListener("pointerleave",()=>{pointer.down=false;});
window.addEventListener("keydown",e=>{
 const k=e.key.toLowerCase();
 if([" ","arrowup","arrowdown","arrowleft","arrowright"].includes(k))e.preventDefault();
 if(e.target&&["INPUT","TEXTAREA"].includes(e.target.tagName))return;
 keys.add(k);
 if(e.repeat)return;
 if(k==="escape"){if(mode==="map")toggleMap();else pause();return;}
 if(k==="m"){toggleMap();return;}
 if(k==="v"){save(false);return;}
 if(k==="p"){pause();return;}
 if(!["world","inside"].includes(mode))return;
 if(k==="e")interact();
 else if(k==="r")reload();
 else if(k==="f")melee();
 else if(k==="q")heal();
 else if(k==="b"){buildType=buildType?null:"wall";updateUI();}
 else if(["1","2","3","4"].includes(k)){buildType=mode==="inside"?null:["wall","trap","tower","outpost"][Number(k)-1];updateUI();}
 else if(k===" ")shoot();
});
window.addEventListener("keyup",e=>keys.delete(e.key.toLowerCase()));
window.addEventListener("blur",()=>{keys.clear();pointer.down=false;runTouch=false;save(true);if(["world","inside"].includes(mode))pause();});
document.addEventListener("visibilitychange",()=>{if(document.hidden){save(true);keys.clear();}});
$("newBtn").addEventListener("click",()=>begin(true));
$("continueBtn").addEventListener("click",()=>begin(false));
$("pauseBtn").addEventListener("click",pause);
$("mapBtn").addEventListener("click",toggleMap);
$("saveBtn").addEventListener("click",()=>save(false));
$("reloadBtn").addEventListener("click",reload);
$("healBtn").addEventListener("click",heal);
$("eatBtn").addEventListener("click",eat);
$("cancelBuild").addEventListener("click",()=>{if(mode==="world"){buildType=buildType?null:"wall";updateUI();}});
document.querySelectorAll("[data-build]").forEach(b=>b.addEventListener("click",()=>{if(mode==="world"){buildType=b.dataset.build;updateUI();}}));
document.querySelectorAll("[data-key]").forEach(b=>{
 const k=b.dataset.key;
 b.addEventListener("pointerdown",e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(k);});
 for(const evt of ["pointerup","pointercancel","lostpointercapture"])b.addEventListener(evt,()=>keys.delete(k));
});
$("touchInteract").addEventListener("click",interact);
$("touchMelee").addEventListener("click",melee);
$("touchShoot").addEventListener("click",()=>{pointer.active=false;shoot();});
$("touchRun").addEventListener("pointerdown",e=>{e.preventDefault();runTouch=true;});
for(const evt of ["pointerup","pointercancel","pointerleave"])$("touchRun").addEventListener(evt,()=>{runTouch=false;});
$("continueBtn").disabled=!localStorage.getItem(STORAGE_KEY);
requestAnimationFrame(frame);
})();