"use strict";
// Test: node tests/sprite-atlas-v4-smoke.js
// Revisa los 256 cuadros SVG, sus limites, la seleccion de clan/direccion
// y la recuperacion a la hoja anterior si v4 falla al cargar.
const fs=require("fs"),path=require("path"),vm=require("vm");
const root=path.join(__dirname,"..");
const prev=fs.readFileSync(path.join(root,"assets/personajes-paris-v3.svg"),"utf8");
const svg=fs.readFileSync(path.join(root,"assets/personajes-paris-v4.svg"),"utf8");
const errors=[],assert=(ok,msg)=>{if(!ok)errors.push(msg)};
assert(svg.includes('width="512" height="768" viewBox="0 0 512 768"'),"Dimensiones de la hoja alteradas");
assert(svg.includes('shape-rendering="crispEdges"'),"Pixel art suavizado");
assert(!/<(?:script|foreignObject|image)\b/i.test(svg),"Se introdujo contenido externo o ejecutable");
const cells=[...svg.matchAll(/<g transform="translate\((\d+) (\d+)\)">([\s\S]*?)<\/g>/g)];
const oldCells=[...prev.matchAll(/<g transform="translate\((\d+) (\d+)\)">([\s\S]*?)<\/g>/g)];
assert(cells.length===256&&oldCells.length===256,"La hoja no contiene exactamente 256 cuadros");
let rects=0,oldRects=0,invalid=0;
for(let i=0;i<cells.length;i++){
 const [_,xs,ys,body]=cells[i],row=Math.floor(i/16),col=i%16;
 assert(+xs===col*32&&+ys===row*48,"Celda desplazada: "+i);
 const rs=[...body.matchAll(/<rect x="([-\d.]+)" y="([-\d.]+)" width="([-\d.]+)" height="([-\d.]+)"/g)];
 rects+=rs.length;
 for(const r of rs){
  const [x,y,w,h]=r.slice(1).map(Number);
  if(!(x>=0&&y>=0&&w>0&&h>0&&x+w<=32&&y+h<=48))invalid++;
 }
}
for(const cell of oldCells)oldRects+=(cell[3].match(/<rect /g)||[]).length;
assert(rects>oldRects+5000,"La hoja v4 no incorpora suficientes detalles originales");
assert(invalid===0,"Se dibujaron detalles fuera de la celda: "+invalid);
assert(!svg.includes("</script>"),"El atlas contiene etiquetas imprevistas");
const sources=[];
class TestImage{
 constructor(){this.naturalWidth=512;}
 set src(value){this.url=value;sources.push(this);}
 get src(){return this.url;}
}
const draws=[],window={VTM_ART_POLISH:{character(){}},VTM_APPEARANCE:{overlay(){}},VTM_ARCS:{personal:{}}};
const document={createElement(){return{width:480,height:300,getContext(){return {fillRect(){},fillText(){},drawImage(){},save(){},restore(){},translate(){},scale(){},createRadialGradient(){return{addColorStop(){}}}}}}}};
vm.runInNewContext(fs.readFileSync(path.join(root,"vtm-graphics.js"),"utf8"),{window,document,Image:TestImage,Math},{filename:"vtm-graphics.js"});
const ctx={fillRect(){},fillText(){},drawImage(image,sx,sy,sw,sh){draws.push({image:image.src,sx,sy,sw,sh})},
 save(){},restore(){},translate(){},scale(){},createRadialGradient(){return{addColorStop(){}}}};
const images=sources.filter(i=>i.src.includes("personajes-paris-"));
assert(images.length===1&&images[0].src.includes("v4.svg"),"La nueva hoja no se solicita al cargar");
images[0].onload();
const clanNames=["Toreador","Ventrue","Tremere","Nosferatu","Brujah","Gangrel","Malkavian"];
const directions=["down","left","right","up"];
for(let row=0;row<clanNames.length;row++){
 for(let dir=0;dir<directions.length;dir++){
  const before=draws.length;
  window.VTM_GRAPHICS.character(ctx,240,135,{clan:clanNames[row],embraced:true,facing:directions[dir],walking:false,time:0});
  assert(draws.length===before+1,"No se dibuja "+clanNames[row]+"/"+directions[dir]);
  const last=draws.at(-1);
  assert(last.sy===row*48&&last.sx===dir*4*32&&last.sw===32&&last.sh===48,"Atlas mal indexado");
 }
}
const before=draws.length;
window.VTM_GRAPHICS.character(ctx,240,135,{clan:"Toreador",embraced:false,facing:"down",walking:false});
assert(draws[before]?.sy===7*48,"El ghoul no utiliza la fila mortal");
const npcRows={isabelle:8,ingrid:9,lucien:10,john:11,marcus:12,dupont:13,guardiana:14,archivista:15};
for(const [id,row] of Object.entries(npcRows)){
 const before=draws.length;
 window.VTM_GRAPHICS.character(ctx,240,135,{clan:"Toreador",embraced:true,npc:{id,name:id},facing:"down"});
 assert(draws[before]?.sy===row*48,"NPC perdido en fila incorrecta: "+id);
}
const oldSource=sources[0];
oldSource.onerror();
const fallback=sources.at(-1);
assert(fallback!==oldSource&&fallback.src.includes("personajes-paris-v3.svg"),"No existe recuperacion al atlas v3");
fallback.onload();
const n=draws.length;
window.VTM_GRAPHICS.character(ctx,240,135,{clan:"Nosferatu",embraced:true,facing:"left"});
assert(draws.length===n+1&&draws.at(-1).image.includes("v3.svg"),"El respaldo v3 no se utiliza tras fallar v4");
if(errors.length)throw Error(errors.join("\n"));
console.log("OK: "+cells.length+" cuadros, "+rects+" formas, 16 variantes, 4 direcciones, ghoul, PNJ y respaldo v3.");
