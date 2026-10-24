"use strict";
/* Regresión del regreso a París desde los ocho barrios.
 * node tests/district-exit-ui-smoke.js
 * El botón visual es externo al Canvas y usa la salida existente; esta
 * prueba comprueba su estructura y los puntos antiguos sin abrir navegador. */
const fs=require("fs"),vm=require("vm"),path=require("path");
const root=path.join(__dirname,"..");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const css=fs.readFileSync(path.join(root,"visual-2.css"),"utf8");
const gameCode=fs.readFileSync(path.join(root,"vtm-game.js"),"utf8");
const districtCode=fs.readFileSync(path.join(root,"vtm-districts.js"),"utf8");
const issues=[],check=(valid,message)=>{if(!valid)issues.push(message)};
check((html.match(/id="stageMapExit"/g)||[]).length===1,"Falta botón accesible en HTML");
check(/<button[^>]*id="stageMapExit"[^>]*class="[^"]*\bhidden\b/.test(html),"No inicia oculto");
check(/aria-label="Volver al mapa general de París"/.test(html),"Falta etiqueta accesible");
check(/\.stage-map-exit\{[\s\S]*?position:absolute;[\s\S]*?z-index:8;/.test(css),
 "El botón no se superpone con el Canvas");
check(css.includes(".stage-map-exit:focus-visible"),"Falta indicador de teclado");
check(/"stageMapExit"\)\.classList\.toggle\("hidden",game\.scene!=="district"\)/.test(gameCode),
 "No se actualiza visibilidad según la escena");
check(/"stageMapExit"\)\.addEventListener\("click",\(\)=>\{[\s\S]*?if\(game\?\.scene!=="district"\|\|overlayOpen\(\)\|\|game\.combat\?\.active\)return;[\s\S]*?leaveDistrict\(\)/.test(gameCode),
 "El botón no llama a la salida existente o ignora el estado del juego");
check(/"districtMapBtn"\)\.addEventListener\("click",/.test(gameCode),
 "Se perdió el botón lateral de regreso");
check(/vtm-districts\.js\?v=map-exit-overlay-v1-20261024/.test(html),
 "Falta actualizar el caché de barrios");
check(/vtm-game\.js\?v=map-exit-overlay-v1-20261024/.test(html),
 "Falta actualizar el caché de eventos");
check(/visual-2\.css\?v=map-exit-v1-20261024/.test(html),
 "Falta actualizar el caché CSS");
const window={},render=[];
function context(){
 return {fillRect(x,y,w,h){render.push({kind:"rect",x,y,w,h,fill:this.fillStyle})},
 fillText(value,x,y){render.push({kind:"text",value,x,y})},
 drawImage(){},createRadialGradient(){return{addColorStop(){}}}};
}
const ctx=context();
const document={createElement(){return{width:480,height:300,getContext:context}}};
vm.runInNewContext(districtCode,{window,document,Math},{filename:"vtm-districts.js"});
const T=window.VTM_DISTRICTS;
check(T.defs.length===8,"No están los ocho barrios");
for(const d of T.defs){
 const game={scene:"district",district:d.id,x:240,y:190,districtNotes:{},clock:{night:3,minutes:1200}};
 const before=JSON.stringify(game),from=render.length;
 T.draw(ctx,game,1.4,false);
 const painted=render.slice(from),signs=painted.filter(v=>v.kind==="text"&&v.value==="SALIDA"),
  paris=painted.filter(v=>v.kind==="text"&&v.value==="A PARÍS");
 check(signs.length===1&&paris.length===1,"No se dibuja el cartel frontal en "+d.id);
 check(painted.some(v=>v.kind==="rect"&&v.x===56&&v.y===215),
  "El cartel quedó fuera de la zona segura en "+d.id);
 check(JSON.stringify(game)===before,"El dibujo modificó la partida en "+d.id);
 const old=T.nearby({...game,x:83,y:263},30);
 check(old?.type==="map","La salida clásica con E cambió en "+d.id);
 const venue=T.nearby({...game,x:240,y:122},30);
 check(venue?.type==="venue","La entrada original cambió en "+d.id);
}
if(issues.length)throw Error(issues.join("\n"));
console.log("OK: ocho barrios, salida visible sobre el mapa, botón accesible, caché, controles y guardados sin cambios.");
