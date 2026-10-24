"use strict";
/* Smoke test ejecutable con Node: node tests/paris-visual-smoke.js
   No requiere dependencias ni navegador; comprueba escala, centros, etiquetas
   y que el arte procedural no toque el estado guardado. */
const fs=require("fs"),vm=require("vm"),path=require("path");
const root=path.join(__dirname,"..");
let draws=0,drawRects=0,mainRects=[],texts=[],scaled=[];
const contextFor=(isBack=false)=>({
 fillStyle:"#000",font:"",textAlign:"center",imageSmoothingEnabled:false,
 fillRect(x,y,w,h){drawRects++;if(!isBack)mainRects.push({x,y,w,h});},
 fillText(t,x,y){if(!isBack)texts.push({t,x,y});},
 drawImage(){draws++;},
 save(){},restore(){},translate(){},scale(x,y){scaled.push([x,y]);},
 createRadialGradient(){return{addColorStop(){}}}
});
const win={VTM_ARCS:{personal:{}}};
const document={createElement(tag){
 if(tag!=="canvas")throw Error("Se esperaba un canvas");
 return {width:480,height:300,getContext(){return contextFor(true);}};
}};
const scripts=["vtm-data.js","vtm-graphics.js"];
for(const script of scripts){
 const src=fs.readFileSync(path.join(root,script),"utf8");
 vm.runInNewContext(src,{window:win,document,Math,Image:undefined}, {filename:script});
}
const D=win.VTM_DATA, G=win.VTM_GRAPHICS;
const ctx=contextFor();
const game={scene:"paris",activeQuest:"archivos",sideQuests:{},access:{elysee:false},
 character:{clan:"Nosferatu"}};
const before=JSON.stringify(game);
const env=Object.fromEntries(D.locations.map((x,i)=>[x.id,{accent:["#a89088","#ab7886","#83979c"][i%3]}]));
G.drawCity(ctx,game,D,{environments:env},1.5);
const expected=["Hemeroteca","St. July","Elíseo","Saint-Denis","Túneles",
 "Archivo policial","Casa de Passy","Bastilla","RESIDENCIA"];
const errors=[];
for(const name of expected)if(texts.filter(t=>t.t===name).length!==1)errors.push("Etiqueta ausente o duplicada: "+name);
if(D.locations.length!==8)errors.push("La lista de ocho escenarios cambió");
if(before!==JSON.stringify(game))errors.push("El renderizador mutó la partida");
if(drawRects<1000)errors.push("El detalle del mapa fue sustituido por un dibujo básico");
if(draws!==1)errors.push("El fondo debería estar cacheado en un solo canvas");
if(mainRects.some(r=>r.w>480||r.h>300))errors.push("Se dibujó un rectángulo desproporcionado");
const beforeSecond=drawRects;
G.drawCity(ctx,game,D,{environments:env},2.1);
if(draws!==2)errors.push("Segunda escena: falta el fondo cacheado");
if(drawRects-beforeSecond>700)errors.push("Se está renderizando de nuevo todo el fondo estático");
G.character(ctx,46,267,{clan:"Nosferatu",embraced:true,mapScale:true});
G.character(ctx,240,155,{clan:"Nosferatu",embraced:true});
if(scaled.length!==1||Math.abs(scaled[0][0]-0.46)>.001)errors.push("Escala exclusiva del personaje del mapa incorrecta");
if(errors.length)throw Error(errors.join("\n"));
console.log("OK: ciudad, 8 destinos, residencia, proporciones, cache, personaje y guardado");
