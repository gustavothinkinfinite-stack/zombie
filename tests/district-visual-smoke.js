"use strict";
/* Ejecutar con Node: node tests/district-visual-smoke.js
 * Renderizado sintético para validar tamaños, rótulos y puntos de interacción.
 * No necesita navegador ni cambia una partida real. */
const fs=require("fs"),path=require("path"),vm=require("vm");
const root=path.join(__dirname,".."),lib={};
const rects=[],captions=[],scaled=[];
const ctx={
  fillStyle:"",font:"",textAlign:"center",imageSmoothingEnabled:false,
  fillRect(x,y,w,h){rects.push({x,y,w,h})},
  fillText(text,x,y){captions.push({text,x,y,font:this.font})},
  drawImage(){},save(){},restore(){},translate(){},scale(x,y){scaled.push([x,y])},
  createRadialGradient(){return{addColorStop(){}}}
};
const sandbox={
 window:lib,document:{createElement(){return{width:480,height:300,getContext(){return ctx}}}},
 Math,Image:undefined
};
for(const f of ["vtm-data.js","vtm-districts.js","vtm-graphics.js"]){
 vm.runInNewContext(fs.readFileSync(path.join(root,f),"utf8"),sandbox,{filename:f});
}
const T=lib.VTM_DISTRICTS,G=lib.VTM_GRAPHICS,errors=[];
const labels={passy:"PASSY",stjuly:"ST. JULY",elysee:"ELÍSEO",
 hemeroteca:"HEMEROTECA",bastilla:"BASTILLA",saintdenis:"SAINT-DENIS",
 policia:"ARCHIVO POLICIAL",tuneles:"ACCESO A LOS TÚNELES"};
for(const d of T.defs){
 const g={scene:"district",district:d.id,x:240,y:155,clock:{night:3,minutes:1245},districtNotes:{}};
 const frozen=JSON.stringify(g),before=captions.length;
 T.draw(ctx,g,2.1,true);
 if(JSON.stringify(g)!==frozen)errors.push(d.id+": drawing changed save state");
 if(!captions.slice(before).some(t=>t.text==="PARÍS NOCTURNO  /  "+labels[d.id]))
  errors.push(d.id+": header missing or clipped");
 const venue=T.nearby({...g,x:240,y:122},30);
 const map=T.nearby({...g,x:83,y:263},30);
 if(venue?.type!=="venue")errors.push(d.id+": mission entrance changed");
 if(map?.type!=="map")errors.push(d.id+": map exit changed");
}
G.character(ctx,240,180,{districtScale:true,clan:"Nosferatu",embraced:true});
G.character(ctx,46,260,{mapScale:true,clan:"Nosferatu",embraced:true});
if(scaled.length!==2||Math.abs(scaled[0][0]-.68)>.001||Math.abs(scaled[1][0]-.46)>.001)
 errors.push("District / general-map character scales are not distinct");
if(T.defs.length!==8)errors.push("Eight playable districts not preserved");
if(!rects.length||rects.length<1200)errors.push("District scenery details were lost");
if(errors.length)throw new Error(errors.join("\n"));
console.log("OK: eight districts, readable titles, decorative scene, hotspots, state and scaled sprites");
