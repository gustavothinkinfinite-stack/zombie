"use strict";
/* node tests/browser-contract.test.js
 * Verifica las precondiciones estructurales del recorrido Playwright sin
 * sustituir la ejecución real de Chromium en Actions.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const game=fs.readFileSync(path.join(root,"vtm-game.js"),"utf8");
const smoke=fs.readFileSync(path.join(root,"tests/browser-smoke.cjs"),"utf8");
const localCI=fs.readFileSync(path.join(root,".github/workflows/browser-smoke.yml"),"utf8");
const prodCI=fs.readFileSync(path.join(root,".github/workflows/production-smoke.yml"),"utf8");
const regional=fs.readFileSync(path.join(root,"vtm-reactive-districts.js"),"utf8");
const run=(label,check)=>{check();console.log("OK:",label);};
run("La página identifica la Fase XXI y tiene los controles del recorrido",()=>{
 assert.ok(html.includes("EXPLORACIÓN · FASE XXI"));
 for(const id of ["startNew","nextStep","stepMark","continueGame","play","world",
  "journalBtn","journalModal","journalDetail","journalClose","dialog",
  "dialogOptions","dialogClose","dialogTitle","sceneTitle","manualSaveBtn"]){
  assert.ok(html.includes('id="'+id+'"'),id);
 }
 assert.ok(game.includes('input.id="creator-"+key'),"campo de nombre generado");
 assert.ok(game.includes('actionButton.id="actionsBtn"'),"botón acciones generado");
});
run("La prueba controla una partida sintética y no utiliza datos personales",()=>{
 assert.ok(smoke.includes('await browser.newContext('));
 assert.ok(smoke.includes('const key="cronicas-paris-ghoul-v1"'));
 assert.ok(smoke.includes('name:"Inspección automática"'));
 assert.ok(smoke.includes('sessionStorage.setItem("__cronicas_smoke_pending"'));
 assert.ok(!smoke.includes('browser.connectOverCDP('));
});
run("Las siete investigaciones se comparan por título y pueden aparecer en sus distritos",()=>{
 const titles=["La valija del mensajero","Una invitación falsificada",
  "El pase extraviado","Un legajo alterado","El cargamento desviado",
  "La carpeta extraviada","La avería del conducto"];
 for(const t of titles){
  assert.ok(regional.includes('title:"'+t+'"'),t);
  assert.ok(smoke.includes('"'+t+'"'),t);
 }
 assert.ok(smoke.includes("assert.equal(title.trim(),expectedTitles[district]"));
});
run("Los errores del navegador quedan disponibles para su análisis",()=>{
 for(const value of ["browser-smoke-failure.png","browser-smoke-report.json",
  "browser-smoke-trace.zip","httpFailures","context.tracing.start"]){
  assert.ok(smoke.includes(value),value);
 }
 for(const workflow of [localCI,prodCI]){
  for(const file of ["browser-smoke-report.json","browser-smoke-trace.zip","browser-smoke-failure.png"])
   assert.ok(workflow.includes(file),file);
  assert.ok(workflow.includes("if: always()"),"adjuntar también los diagnósticos de fallos");
 }
});
run("La validación pública usa Hostinger, sin despliegues ni acciones de escritura",()=>{
 assert.ok(prodCI.includes("https://wheat-chough-542895.hostingersite.com/"));
 assert.ok(prodCI.includes("workflow_dispatch"));
 assert.ok(prodCI.includes("branches: [main]"));
 assert.ok(!prodCI.includes("ftp-deploy-action"));
 assert.ok(!prodCI.includes("scp "));
});
console.log("OK: contrato Playwright/Chromium");
