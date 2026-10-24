"use strict";
// Ejecutar: node tests/night-visual-smoke.js
// Prueba puramente gráfica: no altera fichas, reglas, misiones ni guardados.
const fs=require("fs"),path=require("path"),vm=require("vm");
const root=path.join(__dirname,".."),world={VTM_ARCS:{personal:{}}};
let colors=[],drawn=0,glows=0,scales=[];
const makeContext=()=>({
 fillStyle:"",font:"",textAlign:"center",
 fillRect(x,y,w,h){drawn++;colors.push([x,y,w,h,this.fillStyle]);},
 fillText(){},drawImage(){},save(){},restore(){},translate(){},
 scale(x,y){scales.push([x,y]);},
 createRadialGradient(){glows++;return{addColorStop(){}}}
});
const c=makeContext();
const doc={createElement(){return{width:480,height:300,getContext:makeContext}}};
for(const file of ["vtm-data.js","vtm-districts.js","vtm-graphics.js","vtm-ambience.js"]){
 vm.runInNewContext(fs.readFileSync(path.join(root,file),"utf8"),{window:world,document:doc,Math,Image:undefined},{filename:file});
}
const districts=world.VTM_DISTRICTS,graphics=world.VTM_GRAPHICS,ambience=world.VTM_AMBIENCE;
const problems=[];
const check=(ok,reason)=>{if(!ok)problems.push(reason)};
for(const d of districts.defs){
 const g={scene:"district",district:d.id,x:240,y:155,clock:{night:3,minutes:1230},districtNotes:{}};
 const save=JSON.stringify(g),before=glows;
 districts.draw(c,g,2.2,true);
 ambience.foreground(c,"district",d.id,2.2,true,{x:240,y:155});
 check(glows>before,"No hay iluminacion dinámica en "+d.id);
 check(JSON.stringify(g)===save,"La escena modificó el guardado en "+d.id);
 check(districts.nearby({...g,x:240,y:122},30)?.type==="venue","Acceso movido en "+d.id);
 check(districts.nearby({...g,x:83,y:263},30)?.type==="map","Salida movida en "+d.id);
 const off=glows;
 districts.draw(c,g,2.2,false);
 check(glows===off,"Los efectos siguen activos con FX desactivados en "+d.id);
}
let before=colors.length;
ambience.foreground(c,"district","passy",1,true,{x:77,y:250});
const occlusion=colors.slice(before).filter(r=>r[0]>=60&&r[0]<100&&r[1]>=237&&r[1]<255).length;
before=colors.length;
ambience.foreground(c,"district","passy",1,true,{x:240,y:155});
const noOcclusion=colors.slice(before).filter(r=>r[0]>=60&&r[0]<100&&r[1]>=237&&r[1]<255).length;
check(occlusion>noOcclusion,"El árbol no respeta la profundidad del personaje");
const appearance={clan:"Nosferatu",embraced:true,walking:true,districtScale:true};
before=colors.length;
graphics.character(c,250,170,{...appearance,cycle:0.1,time:1});
const early=JSON.stringify(colors.slice(before));
before=colors.length;
graphics.character(c,250,170,{...appearance,cycle:0.5,time:1});
const later=JSON.stringify(colors.slice(before));
check(early!==later,"El caminar no produce fotogramas diferentes");
graphics.character(c,100,110,{clan:"Nosferatu",embraced:true,mapScale:true});
check(scales.length===3&&Math.abs(scales[0][0]-.68)<.001&&Math.abs(scales[2][0]-.46)<.001,
 "La escala se modificó fuera de las escenas previstas");
if(problems.length)throw new Error(problems.join("\n"));
console.log("OK: 8 barrios, reflejos, luces con FX opcionales, oclusión, caminar y guardados intactos.");
