"use strict";
/* Accesibilidad del creador: cada etiqueta visible identifica su campo.
 * No inicializa una partida ni modifica el almacenamiento.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const source=fs.readFileSync(path.join(__dirname,"..","vtm-game.js"),"utf8");
const begin=source.indexOf(" function field(title,key,type,options){");
const end=source.indexOf("\n function appearanceControls(",begin);
assert.ok(begin>=0&&end>begin,"No se encontró el constructor de campos del creador");

function element(tagName){
 return {
  tagName,children:[],listeners:{},
  appendChild(node){this.children.push(node);return node;},
  addEventListener(type,fn){this.listeners[type]=fn;}
 };
}
const creator={name:"Elena",concept:"Investigador",nature:"Autócrata",demeanor:"Autócrata"};
let renders=0,validations=0;
const context={
 document:{createElement:element},creator,
 renderSheet:()=>{renders++;},refreshValidation:()=>{validations++;}
};
vm.runInNewContext(source.slice(begin,end),context);

const fields=[
 ["Nombre","name","text",undefined],
 ["Concepto","concept","select",["Investigador","Artista"]],
 ["Naturaleza","nature","select",["Autócrata","Protector"]],
 ["Conducta","demeanor","select",["Autócrata","Protector"]]
];
const ids=new Set();
for(const [title,key,type,options] of fields){
 const box=context.field(title,key,type,options);
 assert.equal(box.children.length,2,"La etiqueta y el control deben estar en el mismo grupo");
 const [label,input]=box.children;
 assert.equal(label.tagName,"label");
 assert.equal(label.textContent,title);
 assert.equal(input.id,"creator-"+key);
 assert.equal(label.htmlFor,input.id,"La etiqueta debe activar y nombrar el control");
 assert.ok(!ids.has(input.id),"Los identificadores no pueden repetirse");
 ids.add(input.id);
 assert.equal(input.tagName,type==="select"?"select":"input");
 assert.equal(input.value,creator[key],"La edición no debe perder los valores actuales");
 if(type==="select")assert.equal(input.children.length,options.length);
 else assert.equal(input.maxLength,48,"Conservar el límite del nombre");
 input.value="Cambio "+key;
 input.listeners.change();
 assert.equal(creator[key],"Cambio "+key,"El campo debe conservar su actualización");
}
assert.equal(renders,fields.length);
assert.equal(validations,fields.length);
console.log("OK: etiquetas de los cuatro campos asociadas, valores y cambios conservados");
