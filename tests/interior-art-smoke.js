"use strict";
// Ejecutar: node tests/interior-art-smoke.js
// Prueba del arte decorativo, sin dependencias y sin interacción con guardados.
const fs=require("fs"),vm=require("vm"),path=require("path");
const root=path.join(__dirname,".."),window={};
const calls=[],ctx=()=>({
 fillStyle:"",font:"",textAlign:"center",imageSmoothingEnabled:false,
 fillRect(x,y,w,h){calls.push({t:"rect",x,y,w,h,color:this.fillStyle})},
 fillText(t,x,y){calls.push({t:"text",text:t,x,y})},
 drawImage(){calls.push({t:"image"})},save(){},restore(){},translate(){},
 scale(x,y){calls.push({t:"scale",x,y})},
 createRadialGradient(){calls.push({t:"glow"});return{addColorStop(){}}}
});
const c=ctx(),document={createElement(){return{width:480,height:300,getContext:ctx}}};
for(const file of ["vtm-art-polish.js","vtm-graphics.js"]){
 vm.runInNewContext(fs.readFileSync(path.join(root,file),"utf8"),{window,document,Math,Image:undefined},{filename:file});
}
const p=window.VTM_ART_POLISH,G=window.VTM_GRAPHICS,fail=[];
const test=(cond,msg)=>{if(!cond)fail.push(msg)};
const palette={floor:"#302a34",wall:"#413440",metal:"#806d74",
 furniture:"#554453",rug:"#5c3c52",name:"Residencia",study:"Despacho",quarters:"Habitaciones"};
const C={residences:{},residenceObjects:{house:[],study:[],quarters:[]}};
for(const clan of ["Toreador","Ventrue","Tremere","Nosferatu","Brujah","Gangrel","Malkavian"])C.residences[clan]=palette;
const g={character:{clan:"Nosferatu"},observed:{},clock:{night:3,minutes:1230},scene:"venue",x:240,y:210};
const copy=JSON.stringify(g);
for(const clan of Object.keys(C.residences))for(const room of ["house","study","quarters"]){
 const start=calls.length;
 G.drawResidence(c,room,clan,C,g,2.3,true);
 test(calls.length>start,clan+" "+room+" no se dibujó");
}
const locs=["stjuly","elysee","passy","tuneles","bastilla","saintdenis","hemeroteca","policia"];
const N={environments:{}};
for(const id of locs)N.environments[id]={room:"#292632",accent:"#98768a",label:id};
for(const id of locs){
 const start=calls.length;
 G.drawVenue(c,id,N,g,2.3,true);
 test(calls.length>start,"Falta la escena "+id);
}
let start=calls.length;
G.drawVenue(c,"stjuly",N,g,2.3,false);
const off=calls.slice(start).filter(x=>x.t==="glow").length;
start=calls.length;
G.drawVenue(c,"stjuly",N,g,2.3,true);
const on=calls.slice(start).filter(x=>x.t==="glow").length;
test(on>off,"Las luces decorativas no responden a FX");
for(const kind of ["taller","almacen","libreria","anticuario","floristeria","cafe","oficina"]){
 const first=calls.length;p.shop(c,kind,2.3,true);
 test(calls.length>first,"Falta decoración de tienda "+kind);
}
start=calls.length;
G.character(c,230,221,{clan:"Nosferatu",facing:"down",walking:true,cycle:.1,time:1});
const step1=JSON.stringify(calls.slice(start));
start=calls.length;
G.character(c,230,221,{clan:"Nosferatu",facing:"down",walking:true,cycle:.5,time:1});
const step2=JSON.stringify(calls.slice(start));
test(step1!==step2,"El atuendo no anima los pasos");
for(const clan of Object.keys(C.residences)){
 const first=calls.length;G.character(c,230,221,{clan,facing:"down",walking:false,time:1});
 test(calls.length>first,"No se dibujó el personaje "+clan);
}
test(JSON.stringify(g)===copy,"El dibujado cambió el estado de la partida");
test(calls.some(x=>x.t==="glow"),"No se generaron halos de interiores");
test(calls.length>2000,"El contenido dibujado es demasiado escaso");
if(fail.length)throw Error(fail.join("\n"));
console.log("OK: siete clanes, 21 habitaciones, ocho salones, siete comercios, sprites y FX. Guardados intactos.");
