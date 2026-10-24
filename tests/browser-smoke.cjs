"use strict";
/* Fase XVII — Prueba real en Chromium, ejecutada en GitHub Actions.
 * node tests/browser-smoke.cjs (requiere "playwright" y servidor HTTP local).
 * Nunca usa la partida de un usuario: perfil de navegador aislado.
 */
const assert=require("node:assert/strict");
const {chromium}=require("playwright");
const fs=require("node:fs");
const base=process.env.GAME_URL||"http://127.0.0.1:4173/";
const key="cronicas-paris-ghoul-v1";
(async()=>{
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:"reduce"});
 const page=await context.newPage();
 const errors=[],httpFailures=[],checks=[];
 const startedAt=new Date().toISOString();
 page.on("pageerror",e=>errors.push(String(e)));
 page.on("response",response=>{
   if(response.status()>=400&&/\.(?:js|css)(?:\?|$)/.test(response.url()))
     httpFailures.push(response.status()+" "+response.url());
 });
 await context.tracing.start({screenshots:true,snapshots:true,sources:true});
 const check=async(label,fn)=>{
   await fn();
   checks.push({label,status:"passed"});
   console.log("OK: "+label);
 };
 const report=(status,error=null)=>({
   result:status,url:base,startedAt,finishedAt:new Date().toISOString(),
   checks,errors,httpFailures,error:error?String(error):null
 });
 try{
  await page.goto(base,{waitUntil:"load"});
  await check("La portada carga la Fase XXI",async()=>{
   assert.match(await page.locator(".brand-version").innerText(),/FASE XXI/);
   assert.match(await page.title(),/Crónicas de París/);
   assert.equal(errors.length,0,errors.join("\n"));
  });
  await check("El creador de personaje responde a los controles",async()=>{
   await page.locator("#startNew").click();
   await page.locator("#creator-name").fill("Prueba de navegador");
   await page.locator("#nextStep").click();
   assert.match(await page.locator("#stepMark").innerText(),/PASO 2 \/ 6/);
  });
  await page.evaluate((saveKey)=>{
   const d=window.VTM_DATA;
   const attr=Object.fromEntries(Object.values(d.attributes).flat().map(n=>[n,2]));
   const skills=Object.fromEntries(Object.values(d.abilities).flat().map(n=>[n,1]));
   const backgrounds=Object.fromEntries(d.backgrounds.map(n=>[n,0]));
   backgrounds.Recursos=2;
   const character={name:"Inspección automática",concept:"Investigador",nature:"Superviviente",demeanor:"Protector",clan:"Toreador",
    attr,skills,backgrounds,virtues:{Conciencia:3,Autocontrol:3,Coraje:3},humanity:6,willpower:3,disciplines:{},appearance:window.VTM_APPEARANCE.normalize()};
   const game={version:1,character,scene:"house",x:240,y:220,appreciation:0,activeQuest:null,readyReport:null,questIndex:0,history:[],
    embraced:false,hasSpoken:false,disciplineSpent:0,observed:{},arc:{clues:[],outcome:null,visited:[]},relations:{dupont:0},exposure:0,
    cityPos:{x:46,y:267},venue:null,district:null,districtVisited:[],districtNotes:{},venueReturn:null,
    sidevenue:null,sideReturn:null,localPlaces:{},localClues:[],localCases:{},contactMemory:{},contactIntroductions:{},contactLeads:[],
    flags:{},npcRelations:{},npcFlags:{},knownNpcs:[],access:{},sideQuests:{},
    factions:{camarilla:0,brujah:0,nosferatu:0,tremere:0},clock:{night:1,minutes:1215}};
   localStorage.setItem(saveKey,JSON.stringify(game));
  },key);
  await page.reload({waitUntil:"load"});
  await check("Continuar partida abre el mapa con guardado compatible",async()=>{
   assert.equal(await page.locator("#continueGame").isDisabled(),false);
   await page.locator("#continueGame").click();
   assert.equal(await page.locator("#play").isVisible(),true);
   assert.equal(await page.locator("#world").isVisible(),true);
   await page.locator("#journalBtn").click();
   assert.equal(await page.locator("#journalModal").isVisible(),true);
   const body=await page.locator("#journalDetail").innerText();
   assert.match(body,/Passy/);
   assert.match(body,/Saint-Denis/);
   await page.locator("#journalClose").click();
  });
  await check("Los menús de ocho barrios reactivos aparecen",async()=>{
   await page.locator("#actionsBtn").click();
   const menu=await page.locator("#dialogOptions").innerText();
   assert.match(menu,/investigar el robo de Bastilla/i);
   assert.match(menu,/otros siete barrios/i);
   assert.match(menu,/La Sangre y la Bestia/i);
   assert.match(menu,/Conspiración del Principado/i);
   await page.locator("#dialogClose").click();
  });
  await check("La Sangre y la Bestia abre su estado sin perder la partida",async()=>{
   await page.locator("#actionsBtn").click();
   await page.locator("#dialogOptions button").filter({hasText:"La Sangre y la Bestia"}).click();
   assert.match(await page.locator("#dialogTitle").innerText(),/La Sangre y la Bestia/);
   assert.match(await page.locator("#dialogText").innerText(),/Ghoul|Sangre/);
   await page.locator("#dialogClose").click();
  });
  await check("El prólogo conspirativo se inicia y persiste con las misiones antiguas",async()=>{
   await page.locator("#actionsBtn").click();
   await page.locator("#dialogOptions button").filter({hasText:"investigar coincidencias"}).click();
   assert.match(await page.locator("#dialogTitle").innerText(),/Crónica del Principado/);
   await page.locator("#dialogOptions button").filter({hasText:"Comenzar a contrastar registros"}).click();
   assert.match(await page.locator("#dialogText").innerText(),/Fuentes corroboradas: 0\/4/);
   await page.locator("#dialogClose").click();
   const current=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
   assert.equal(current.principado.accepted,true);
   assert.ok(current.elizabeth||current.arc,"El caso y progreso existentes siguen guardados");
  });
  await check("La campaña principal no revela secretos antes del prólogo",async()=>{
   await page.locator("#actionsBtn").click();
   await page.locator("#dialogOptions button").filter({hasText:"Campaña principal"}).click();
   const text=await page.locator("#dialogText").innerText();
   assert.match(text,/prólogo documental/i);
   assert.doesNotMatch(text,/antigua anarquista|usurpación|sexta generación/i);
   await page.locator("#dialogClose").click();
  });
  // El guardado al salir de la página anterior no debe reemplazar la posición de prueba.
  // Aplicamos el escenario antes de que arranque el motor en la nueva navegación.
  await page.addInitScript(saveKey=>{
   const pending=sessionStorage.getItem("__cronicas_smoke_pending");
   if(pending){
    localStorage.setItem(saveKey,pending);
    sessionStorage.removeItem("__cronicas_smoke_pending");
   }
  },key);
  const expectedTitles={
   passy:"La valija del mensajero",
   stjuly:"Una invitación falsificada",
   elysee:"El pase extraviado",
   hemeroteca:"Un legajo alterado",
   saintdenis:"El cargamento desviado",
   policia:"La carpeta extraviada",
   tuneles:"La avería del conducto"
  };
  const places=Object.keys(expectedTitles);
  for(const district of places){
   await page.evaluate(([saveKey,id])=>{
    const game=JSON.parse(localStorage.getItem(saveKey));
    game.scene="district";game.district=id;game.x=236;game.y=216;game.clock.night=1;game.clock.minutes=23*60+50;
    // La ficción del dossier existe sólo en este perfil aislado de Chromium.
    if(id==="passy"){
     game.principado=game.principado||{};game.principado.dossier=true;
     game.access=game.access||{};game.access.elysee=true;
    }
    sessionStorage.setItem("__cronicas_smoke_pending",JSON.stringify(game));
   },[key,district]);
   await page.reload({waitUntil:"load"});
   await page.locator("#continueGame").click();
   if(district==="passy"){
    await check("La campaña abre acto I sin revelar secretos anticipados",async()=>{
     await page.locator("#actionsBtn").click();
     await page.locator("#dialogOptions button").filter({hasText:"Campaña principal"}).click();
     await page.locator("#dialogOptions button").filter({hasText:"Abrir investigación reservada"}).click();
     const body=await page.locator("#dialogText").innerText();
     assert.match(body,/Una ausencia en los archivos/);
     assert.doesNotMatch(body,/antigua anarquista|usurpación|sexta generación/i);
     await page.locator("#dialogClose").click();
     const stored=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
     assert.equal(stored.conspiracy.started,true);
     assert.equal(stored.conspiracy.revealed,false);
     assert.equal(stored.conspiracy.chapter,1);
    });
    await check("Sigilo y carrera — controles de la Fase XIX",async()=>{
     await page.evaluate(()=>document.activeElement?.blur());
     await page.keyboard.press("c");
     const crouched=await page.evaluate(k=>JSON.parse(localStorage.getItem(k))?.stealthChase?.crouched,key);
     assert.equal(crouched,true,"La tecla C debe guardar el modo sigilo");
     assert.match(await page.locator("#stealthStatus").innerText(),/Sigilo activo/);
     await page.keyboard.down("Shift");await page.keyboard.down("d");
     await page.waitForTimeout(75);await page.keyboard.up("d");await page.keyboard.up("Shift");
     await page.keyboard.press("c");
     assert.equal(await page.evaluate(k=>JSON.parse(localStorage.getItem(k))?.stealthChase?.crouched,key),false);
    });
   }
   await check("Mapa + objeto interactivo de "+district,async()=>{
    assert.equal(await page.locator("#play").isVisible(),true);
    const state=await page.locator("#sceneTitle").innerText();
    assert.ok(state.length>0);
    // El botón Continuar partida puede conservar el foco después de ocultarse.
    // Comprobamos E desde la superficie de juego, no desde un botón oculto.
    await page.evaluate(()=>document.activeElement?.blur());
    await page.keyboard.press("e");
    await page.waitForSelector("#dialog:not(.hidden)",{timeout:5000});
    const title=await page.locator("#dialogTitle").innerText();
    assert.equal(title.trim(),expectedTitles[district],`Escena equivocada en ${district}: ${title}`);
    await page.locator("#dialogClose").click();
    assert.equal(errors.length,0,errors.join("\n"));
   });
  }
  await check("Guardar, reiniciar y cargar no elimina la partida",async()=>{
   await page.locator("#manualSaveBtn").click();
   const raw=await page.evaluate(k=>localStorage.getItem(k),key);
   const save=JSON.parse(raw);
   assert.equal(save.version,1);
   assert.ok(save.reactiveDistricts?.cases?.passy);
   assert.ok(save.reactiveDistricts?.cases?.tuneles);
   await page.reload({waitUntil:"load"});
   assert.equal(await page.locator("#continueGame").isDisabled(),false);
  });
  assert.equal(errors.length,0,"Excepciones del juego:\n"+errors.join("\n"));
  assert.equal(httpFailures.length,0,"Recursos no disponibles:\n"+httpFailures.join("\n"));
  fs.writeFileSync("browser-smoke-report.json",JSON.stringify(report("passed"),null,2)+"\n");
  await context.tracing.stop({path:"browser-smoke-trace.zip"});
  console.log("PASS: Smoke test real Chromium — Crónicas de París Fase XXI");
 }catch(e){
  checks.push({label:"Fallo observado",status:"failed",message:String(e)});
  try{await page.screenshot({path:"browser-smoke-failure.png",fullPage:true});}catch(_){}
  try{await context.tracing.stop({path:"browser-smoke-trace.zip"});}catch(_){}
  try{fs.writeFileSync("browser-smoke-report.json",JSON.stringify(report("failed",e),null,2)+"\n");}catch(_){}
  console.error("Errores de página:",errors.join("\n"));
  console.error("Errores HTTP:",httpFailures.join("\n"));
  throw e;
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
