"use strict";
/* Prueba de estructura del panel de personaje. Ejecutar: node tests/character-hud.test.js */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const source=fs.readFileSync(path.join(root,"vtm-game.js"),"utf8");
const styles=fs.readFileSync(path.join(root,"visual-2.css"),"utf8");
const index=fs.readFileSync(path.join(root,"index.html"),"utf8");
const start=source.indexOf('  const details=document.createElement("details");');
const end=source.indexOf('\n  $("startNew").addEventListener(',start);
assert.ok(start>=0&&end>start,"Debe existir el resumen secundario de la ficha");
const panel={children:[],appendChild(child){this.children.push(child);}};
function makeElement(tagName){
 return {tagName,className:"",id:"",textContent:"",children:[],append(...nodes){this.children.push(...nodes);}};
}
const document={createElement:makeElement,querySelector:selector=>{
 assert.equal(selector,".character-panel");
 return panel;
}};
vm.runInNewContext(source.slice(start,end),{document});
assert.equal(panel.children.length,1,"Un solo bloque se inserta en la ficha");
const detail=panel.children[0];
assert.equal(detail.tagName,"details","Las estadísticas tienen que poder expandirse");
assert.equal(detail.className,"mechanics-details");
assert.equal(detail.children[0].tagName,"summary");
assert.match(detail.children[0].textContent,/Estado y recursos/);
assert.equal(detail.children[1].id,"mechanicsSummary","El HUD debe mantener su ID de actualización");
assert.equal(detail.children[1].tagName,"p");
assert.equal(detail.open,undefined,"El resumen inicia cerrado, sin ocultar el HUD esencial");
assert.ok(source.includes('const mechanical=$("mechanicsSummary");if(mechanical)mechanical.textContent='),
 "Las estadísticas siguen actualizándose durante la partida");
assert.match(styles,/\.character-panel \.mechanics-details\{grid-column:1 \/ -1;/,
 "El bloque no debe quedar atrapado en una sola columna");
assert.match(styles,/\.character-panel \.mechanics-details \.mechanics-summary\{[^}]*overflow-wrap:anywhere;/,
 "Los datos deben ajustarse al ancho del panel");
assert.match(index,/visual-2\.css\?v=vtm[^"]+hudfix/,
 "La hoja corregida debe invalidar la caché anterior");
assert.match(index,/vtm-game\.js\?v=vtm[^"]+hudfix/,
 "El script corregido debe invalidar la caché anterior");
console.log("OK: ficha compacta y expandible, con información y actualización preservadas");
