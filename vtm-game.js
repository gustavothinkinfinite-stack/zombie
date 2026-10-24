"use strict";
(() => {
 const D=window.VTM_DATA, C=window.VTM_CONTENT, N=window.VTM_NPCS, A=window.VTM_ARCS, G=window.VTM_GRAPHICS||null, P=window.VTM_PHYSICS||null, V=window.VTM_APPEARANCE, SAVE_KEY="cronicas-paris-ghoul-v1", $=id=>document.getElementById(id);
 const groupsA=Object.keys(D.attributes),groupsH=Object.keys(D.abilities),CLANS=Object.keys(D.clans);
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const sum=o=>Object.values(o).reduce((a,b)=>a+b,0);
 const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 let creator=null,step=0,game=null,keys=new Set(),lastTime=0,walkTarget=null,walkRoute=[],toastTimer=0;
 let dialogOpen=false,touchMove=null,pendingLook=null,visualTime=0,embraceFxUntil=0,canvas=$("world"),g=canvas.getContext("2d",{alpha:false});
 let effectsEnabled=true;
 try{
   const preference=localStorage.getItem("cronicas-paris-visual-fx");
   effectsEnabled=preference===null?!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches:preference==="1";
 }catch(e){effectsEnabled=true;}
 function updateFxButton(){
   const btn=$("visualEffectsBtn");if(!btn)return;
   btn.textContent=effectsEnabled?"✦ FX activados":"✦ FX desactivados";
   btn.setAttribute("aria-pressed",String(effectsEnabled));
 }
 g.imageSmoothingEnabled=false;
 const ITEMS=[["concepto","Concepto"],["atributos","Atributos"],["habilidades","Habilidades"],["trasfondos","Trasfondos"],["virtudes","Virtudes"],["gratuitos","Puntos gratuitos"]];
 const PRIORITY_BUDGET_ATTR=[7,5,3],PRIORITY_BUDGET_SKILL=[13,9,5];
 const BASE_COLORS=["#17111c","#241c28","#302430","#433039","#785055","#c29b83","#ead4ac"];
 function freshDraft(){
  const a={},h={},b={},v={};
  for(const names of Object.values(D.attributes))for(const key of names)a[key]=1;
  for(const names of Object.values(D.abilities))for(const key of names)h[key]=0;
  for(const key of D.backgrounds)b[key]=0;
  for(const key of D.virtues)v[key]=1;
  return {name:"",concept:"Investigador",clan:"Toreador",nature:"Superviviente",demeanor:"Protector",
    attr:a,skills:h,backgrounds:b,virtues:v,
    attrRanks:{"Físicos":0,"Sociales":1,"Mentales":2},
    skillRanks:{"Talentos":0,"Técnicas":1,"Conocimientos":2},
    free:{attrs:{},skills:{},backgrounds:{},virtues:{},humanity:0,will:0},freeCategory:"Atributo",freeTrait:"Fuerza",appearance:V.normalize()};
 }
 function freeCost(cat){return {"Atributo":5,"Habilidad":2,"Trasfondo":1,"Virtud":2,"Humanidad":1,"Voluntad":1}[cat];}
 function adjusted(trait,cat){
  const data=cat==="Atributo"?"attr":cat==="Habilidad"?"skills":cat==="Trasfondo"?"backgrounds":"virtues";
  const purchases=cat==="Atributo"?"attrs":data;
  return creator[data][trait]+(creator.free[purchases][trait]||0);
 }
 function humanity(){return creator.virtues.Conciencia+creator.virtues.Autocontrol+(creator.free.virtues.Conciencia||0)+(creator.free.virtues.Autocontrol||0)+creator.free.humanity;}
 function will(){return creator.virtues.Coraje+(creator.free.virtues.Coraje||0)+creator.free.will;}
 function freeSpent(){return sum(creator.free.attrs)*5+sum(creator.free.skills)*2+sum(creator.free.backgrounds)+sum(creator.free.virtues)*2+creator.free.humanity+creator.free.will;}
 function rankLimit(group,type){return (type==="attr"?PRIORITY_BUDGET_ATTR:PRIORITY_BUDGET_SKILL)[creator[(type==="attr"?"attrRanks":"skillRanks")][group]];}
 function leftFor(group,type){
  const keys=(type==="attr"?D.attributes:D.abilities)[group],v=creator[type],base=type==="attr"?1:0;
  return rankLimit(group,type)-keys.reduce((s,k)=>s+v[k]-base,0);
 }
 function attributeAndSkillValid(type){
  const list=type==="attr"?groupsA:groupsH;return list.every(gr=>leftFor(gr,type)===0);
 }
 function validation(i){
  if(i===0)return creator.name.trim().length<2?"Escribí un nombre de al menos dos caracteres.":"";
  if(i===1)return !attributeAndSkillValid("attr")?"Distribuí exactamente 7/5/3 puntos adicionales entre los grupos de Atributos.":"";
  if(i===2)return !attributeAndSkillValid("skills")?"Distribuí exactamente 13/9/5 puntos entre las Habilidades (máximo 3 durante esta fase).":"";
  if(i===3)return sum(creator.backgrounds)!==5?"Debés repartir exactamente 5 puntos de Trasfondos adecuados a un ghoul humano.":"";
  if(i===4)return sum(creator.virtues)!==10?"Repartí 7 puntos adicionales entre las tres Virtudes (cada una empieza con 1).":"";
  if(i===5)return freeSpent()!==15?"Gastá los 15 puntos gratuitos antes de finalizar.":"";
  return "";
 }
 function show(id){
  ["welcome","creator","play"].forEach(k=>$(k).classList.toggle("hidden",k!==id));
 }
 function tagName(group,type){return type==="attr"?D.attributes[group]:D.abilities[group];}
 function dotRow(label,value,max,min,onChange){
  const row=document.createElement("div");row.className="trait";
  const name=document.createElement("span");name.textContent=label;row.appendChild(name);
  const dots=document.createElement("div");dots.className="dots";
  for(let i=1;i<=max;i++){
   const dot=document.createElement("button");dot.type="button";dot.className=i<=value?"on":"";
   dot.title=label+": "+i+" círculo"+(i>1?"s":"");
   dot.setAttribute("aria-label",label+" "+i+" círculos");
   dot.addEventListener("click",()=>onChange(i<=value?Math.max(min,i-1):i));
   dots.appendChild(dot);
  }
  row.appendChild(dots);return row;
 }
 function item(name,help){const h=document.createElement("h2");h.className="section-title";h.textContent=name;const p=document.createElement("p");p.className="section-lead";p.textContent=help;return [h,p];}
 function field(title,key,type,options){
  const box=document.createElement("div");box.className="field";
  const label=document.createElement("label");label.textContent=title;box.appendChild(label);
  const input=type==="select"?document.createElement("select"):document.createElement("input");
  if(type==="select"){for(const opt of options){const o=document.createElement("option");o.value=opt;o.textContent=opt;input.appendChild(o)}}
  else{input.type="text";input.maxLength=48;input.placeholder="Nombre del personaje";}
  input.value=creator[key];input.addEventListener("change",()=>{creator[key]=input.value;renderSheet();refreshValidation();});
  input.addEventListener("input",()=>{creator[key]=input.value;renderSheet();refreshValidation();});box.appendChild(input);return box;
 }

 function appearanceControls(root,model,embraced,clan){
   const shell=document.createElement("div");shell.className="appearance-layout";
   const left=document.createElement("div");left.className="appearance-fields";
   const labels={skin:"Tono de piel",hair:"Color de cabello",coat:"Vestimenta",hairstyle:"Peinado",detail:"Accesorio"};
   for(const key of Object.keys(V.palettes)){
     const box=document.createElement("div");box.className="field";
     const label=document.createElement("label");label.textContent=labels[key];box.appendChild(label);
     const sel=document.createElement("select");sel.setAttribute("aria-label",labels[key]);
     for(const val of V.palettes[key]){
       const option=document.createElement("option");option.value=val.id;option.textContent=val.label;sel.appendChild(option);
     }
     sel.value=model.appearance[key];
     sel.addEventListener("change",()=>{
       model.appearance[key]=sel.value;
       V.preview(preview,model.appearance,{embraced,clan});
       if(creator&&model===creator)renderSheet();
     });
     box.appendChild(sel);left.appendChild(box);
   }
   const right=document.createElement("div");right.className="appearance-preview";
   const preview=document.createElement("canvas");preview.width=180;preview.height=210;
   preview.setAttribute("aria-label","Vista previa del personaje, frente");
   right.appendChild(preview);
   const caption=document.createElement("p");caption.textContent=embraced?"VÁSTAGO · "+clan.toUpperCase():"GHOUL · SERVICIO NOCTURNO";right.appendChild(caption);
   const caption2=document.createElement("small");caption2.textContent="Vista frontal · La ropa y el rostro se reflejan también al caminar.";right.appendChild(caption2);
   shell.append(left,right);root.appendChild(shell);
   V.preview(preview,model.appearance,{embraced,clan});
 }
 function openAppearance(){
   if(!game)return;
   if(!$("dialog").classList.contains("hidden"))closeDialog();
   $("sheetModal").classList.add("hidden");$("journalModal").classList.add("hidden");
   pendingLook={appearance:V.normalize(game.character.appearance)};
   const box=$("appearanceBody");box.innerHTML="";
   appearanceControls(box,pendingLook,game.embraced,game.character.clan);
   $("appearanceModal").classList.remove("hidden");
 }
 function closeAppearance(){
   pendingLook=null;
   $("appearanceModal").classList.add("hidden");
 }
 function renderConcept(root){
  item("Concepto y patronazgo","El personaje es todavía humano, ligado por sangre a un Domitor vampiro. Elegí el clan de su maestro: ese será el clan posible tras el Abrazo.").forEach(x=>root.appendChild(x));
  const fields=document.createElement("div");fields.className="fields";
  fields.appendChild(field("Nombre","name","text"));
  fields.appendChild(field("Concepto","concept","select",["Investigador","Artista","Periodista","Criminal","Policía","Académico","Médico","Diplomático","Soldado","Heredero","Activista","Profesional","Estudiante"]));
  fields.appendChild(field("Naturaleza","nature","select",D.archetypes));
  fields.appendChild(field("Conducta","demeanor","select",D.archetypes));
  root.appendChild(fields);
  const head=document.createElement("h2");head.className="section-title";head.style.marginTop="25px";head.textContent="Clan del Domitor";root.appendChild(head);
  const grid=document.createElement("div");grid.className="clan-grid";
  for(const clan of CLANS){const m=D.clans[clan],b=document.createElement("button");b.type="button";b.className="clan"+(creator.clan===clan?" active":"");
   b.innerHTML="<strong>"+esc(clan)+"</strong><small>"+esc(m.master)+" · "+esc(m.title)+"</small><p>"+esc(m.opening)+"</p>";
   b.addEventListener("click",()=>{creator.clan=clan;renderCreator();});grid.appendChild(b);
  }root.appendChild(grid);
  const appearanceTitle=document.createElement("h2");appearanceTitle.className="section-title";appearanceTitle.textContent="Apariencia del ghoul";appearanceTitle.style.marginTop="28px";
  root.appendChild(appearanceTitle);
  const hint=document.createElement("p");hint.className="section-lead";hint.textContent="Elegí el rostro y la vestimenta. Son opciones estéticas; no gastan puntos de creación.";
  root.appendChild(hint);
  appearanceControls(root,creator,false,creator.clan);
 }
 function drawRanked(root,type){
  const attr=type==="attr";
  item(attr?"Atributos":"Habilidades",attr?"Cada Atributo empieza con 1 círculo. Elegí prioridades y repartí los puntos extra 7/5/3.":"Elegí prioridades para Talentos, Técnicas y Conocimientos. Repartí 13/9/5 puntos; no más de 3 círculos por Habilidad en esta fase.").forEach(x=>root.appendChild(x));
  const ranks=creator[attr?"attrRanks":"skillRanks"],data=attr?D.attributes:D.abilities,vals=creator[attr?"attr":"skills"];
  const cards=document.createElement("div");cards.className="group-grid";
  for(const group of Object.keys(data)){
   const c=document.createElement("div");c.className="group-card";const h=document.createElement("div");h.className="group-head";
   const title=document.createElement("strong");title.textContent=group;h.appendChild(title);
   const select=document.createElement("select");["Primario","Secundario","Terciario"].forEach((txt,n)=>{const opt=document.createElement("option");opt.value=n;opt.textContent=txt;select.appendChild(opt)});
   select.value=String(ranks[group]);select.title="Prioridad de "+group;
   select.addEventListener("change",()=>{const next=Number(select.value),other=Object.keys(ranks).find(k=>k!==group&&ranks[k]===next);if(other!==undefined)ranks[other]=ranks[group];ranks[group]=next;renderCreator();});
   h.appendChild(select);const rem=document.createElement("small");const left=leftFor(group,attr?"attr":"skills");rem.textContent=(left>=0?left:"+"+Math.abs(left))+" por distribuir";h.appendChild(rem);c.appendChild(h);
   for(const key of data[group])c.appendChild(dotRow(key,vals[key],attr?5:3,attr?1:0,next=>{
     const prev=vals[key];if(next>prev&&leftFor(group,attr?"attr":"skills")<(next-prev))return;
     vals[key]=next;renderCreator();
   }));cards.appendChild(c);
  }root.appendChild(cards);
 }
 function renderSimpleDots(root,kind){
  const isBg=kind==="bg";const keys=isBg?D.backgrounds:D.virtues,vals=isBg?creator.backgrounds:creator.virtues,base=isBg?0:1,target=isBg?5:10,total=sum(vals);
  item(isBg?"Trasfondos mortales":"Virtudes",isBg?
  "Invertí 5 puntos. Están disponibles Aliados, Contactos, Criados, Fama, Influencia y Recursos. No se permiten Generación, Rebaño ni Posición vampírica en esta etapa.":
  "Las Virtudes Conciencia, Autocontrol y Coraje comienzan con 1 punto cada una. Repartí 7 puntos adicionales. Humanidad = Conciencia + Autocontrol; Voluntad = Coraje.").forEach(x=>root.appendChild(x));
  const remaining=document.createElement("div");remaining.className="remaining";remaining.innerHTML="Puntos restantes: <strong>"+(target-total)+"</strong>";root.appendChild(remaining);
  const grid=document.createElement("div");grid.className="group-grid";const card=document.createElement("div");card.className="group-card";card.style.gridColumn="1 / -1";
  for(const key of keys)card.appendChild(dotRow(key,vals[key],5,base,next=>{if(next>vals[key]&&sum(vals)+next-vals[key]>target)return;vals[key]=next;renderCreator();}));
  grid.appendChild(card);root.appendChild(grid);
 }
 function freeChoices(category){
  if(category==="Atributo")return Object.keys(creator.attr);
  if(category==="Habilidad")return Object.keys(creator.skills);
  if(category==="Trasfondo")return Object.keys(creator.backgrounds);
  if(category==="Virtud")return Object.keys(creator.virtues);
  return ["Reserva"];
 }
 function freeField(){return {"Atributo":"attrs","Habilidad":"skills","Trasfondo":"backgrounds","Virtud":"virtues"}[creator.freeCategory];}
 function renderFree(root){
  item("Quince puntos gratuitos","Personalizá la ficha con los costes del manual. Los círculos adquiridos aquí pueden elevar una Habilidad por encima del límite de 3 de la distribución inicial. No se compran Disciplinas antes del Abrazo.").forEach(x=>root.appendChild(x));
  const box=document.createElement("div");box.className="remaining";box.innerHTML="Gastados: <strong>"+freeSpent()+" / 15</strong> · Disponibles: <strong>"+(15-freeSpent())+"</strong>";root.appendChild(box);
  const fees=document.createElement("p");fees.className="section-lead";fees.textContent="Costes: Atributo 5 · Habilidad 2 · Trasfondo 1 · Virtud 2 · Humanidad 1 · Voluntad 1 (por círculo).";root.appendChild(fees);
  const opts=document.createElement("div");opts.className="free-actions";opts.style.margin="25px 0";
  const sel=document.createElement("select");const kinds=["Atributo","Habilidad","Trasfondo","Virtud","Humanidad","Voluntad"];
  for(const k of kinds){const op=document.createElement("option");op.textContent=k;op.value=k;sel.appendChild(op);}sel.value=creator.freeCategory;
  sel.addEventListener("change",()=>{creator.freeCategory=sel.value;creator.freeTrait=freeChoices(sel.value)[0];renderCreator();});opts.appendChild(sel);
  const traits=document.createElement("select");
  for(const k of freeChoices(creator.freeCategory)){const op=document.createElement("option");op.textContent=k;op.value=k;traits.appendChild(op);}
  if(!freeChoices(creator.freeCategory).includes(creator.freeTrait))creator.freeTrait=freeChoices(creator.freeCategory)[0];
  traits.value=creator.freeTrait;traits.addEventListener("change",()=>{creator.freeTrait=traits.value;renderCreator();});opts.appendChild(traits);
  const count=document.createElement("strong");const kind=creator.freeCategory,trait=creator.freeTrait,map=freeField();
  const current=map?(creator.free[map][trait]||0):(kind==="Humanidad"?creator.free.humanity:creator.free.will);
  count.textContent="Comprados: "+current;opts.appendChild(count);
  const minus=document.createElement("button");minus.textContent="−";minus.title="Reembolsar 1 círculo";minus.disabled=current<=0;
  minus.addEventListener("click",()=>{if(map){creator.free[map][trait]=Math.max(0,current-1);}else if(kind==="Humanidad")creator.free.humanity--;else creator.free.will--;renderCreator();});opts.appendChild(minus);
  const plus=document.createElement("button");plus.textContent="+ ("+freeCost(kind)+" puntos)";
  const finalVal=map?adjusted(trait,kind):(kind==="Humanidad"?humanity():will());
  const maxVal=kind==="Habilidad"?5:kind==="Humanidad"||kind==="Voluntad"?10:5;
  plus.disabled=(15-freeSpent())<freeCost(kind)||finalVal>=maxVal;
  plus.addEventListener("click",()=>{if(map)creator.free[map][trait]=(creator.free[map][trait]||0)+1;else if(kind==="Humanidad")creator.free.humanity++;else creator.free.will++;renderCreator();});opts.appendChild(plus);
  root.appendChild(opts);
  const hr=document.createElement("div");hr.className="remaining";hr.innerHTML="Humanidad final: <strong>"+humanity()+"</strong> · Fuerza de Voluntad final: <strong>"+will()+"</strong> · Disciplinas iniciales: <strong>0</strong>";root.appendChild(hr);
  for(const [display,k,cat] of [["Atributos","attrs","Atributo"],["Habilidades","skills","Habilidad"],["Trasfondos","backgrounds","Trasfondo"],["Virtudes","virtues","Virtud"]]){
   const records=Object.entries(creator.free[k]).filter(([,n])=>n>0);
   if(records.length){const p=document.createElement("p");p.className="section-lead";p.textContent=display+": "+records.map(([k,n])=>k+" +"+n).join(" · ");root.appendChild(p);}
  }
 }
 function renderSheet(){
  if(!creator)return;
  const s=$("sheetSummary");s.innerHTML="";
  const lines=[["Nombre",creator.name||"Sin nombre"],["Concepto",creator.concept],["Naturaleza",creator.nature],["Conducta",creator.demeanor],["Estado inicial","Ghoul humano"],["Clan del maestro",creator.clan],["Domitor",D.clans[creator.clan].master],["Humanidad",humanity()],["Fuerza de Voluntad",will()],["Disciplinas","Ninguna"],["Apariencia",V.palettes.coat.find(v=>v.id===creator.appearance?.coat)?.label||"Abrigo negro"],["Puntos gratuitos",freeSpent()+" / 15"]];
  for(const [k,v] of lines){const r=document.createElement("div");r.className="sheetline";const l=document.createElement("span");l.textContent=k;const b=document.createElement("b");b.textContent=v;r.append(l,b);s.appendChild(r);}
 }
 function refreshValidation(){const val=validation(step);$("validation").textContent=val;$("nextStep").disabled=!!val;const next=$("nextStep");next.textContent=step===5?"COMENZAR HISTORIA":"Continuar →";}
 function renderCreator(){
  show("creator");
  $("stepMark").textContent="PASO "+(step+1)+" / 6";
  $("steps").innerHTML="";
  for(let i=0;i<ITEMS.length;i++){const b=document.createElement("span");b.className="stepchip"+(i===step?" active":i<step?" done":"");b.textContent=(i+1)+" "+ITEMS[i][1];$("steps").appendChild(b);}
  $("previousStep").disabled=step===0;
  const body=$("createBody");body.innerHTML="";
  if(step===0)renderConcept(body);
  if(step===1)drawRanked(body,"attr");
  if(step===2)drawRanked(body,"skills");
  if(step===3)renderSimpleDots(body,"bg");
  if(step===4)renderSimpleDots(body,"virtue");
  if(step===5)renderFree(body);
  renderSheet();refreshValidation();
 }
 function buildCharacter(){
  const clone=JSON.parse(JSON.stringify(creator));
  clone.appearance=V.normalize(clone.appearance);
  for(const k of Object.keys(clone.attr))clone.attr[k]+=(clone.free.attrs[k]||0);
  for(const k of Object.keys(clone.skills))clone.skills[k]+=(clone.free.skills[k]||0);
  for(const k of Object.keys(clone.backgrounds))clone.backgrounds[k]+=(clone.free.backgrounds[k]||0);
  for(const k of Object.keys(clone.virtues))clone.virtues[k]+=(clone.free.virtues[k]||0);
  clone.humanity=clone.virtues.Conciencia+clone.virtues.Autocontrol+clone.free.humanity;
  clone.willpower=clone.virtues.Coraje+clone.free.will;
  clone.disciplines={};
  delete clone.free;return clone;
 }
 function save(){
  if(!game)return;
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(game));}catch(e){notice("No se pudo guardar en este navegador.");}
 }
 function load(){try{const s=JSON.parse(localStorage.getItem(SAVE_KEY));if(s&&s.version===1&&s.character&&D.clans[s.character.clan])return s;}catch(e){}return null;}
 function log(message){
  game.history.unshift(message);game.history=game.history.slice(0,35);
  const target=$("history");target.innerHTML="";
  game.history.slice(0,5).forEach(t=>{const p=document.createElement("p");p.textContent="• "+t;target.appendChild(p);});
 }
 function notice(message){$("notice").textContent=message;$("notice").classList.remove("hidden");toastTimer=4;}
 function expandSave(){
  if(!game)return;
  game.character.appearance=V.normalize(game.character.appearance);
  game.observed=game.observed||{};
  game.arc=game.arc||{clues:[],outcome:null,visited:[]};
  game.arc.clues=Array.isArray(game.arc.clues)?game.arc.clues:[];
  game.arc.visited=Array.isArray(game.arc.visited)?game.arc.visited:[];
  game.relations=game.relations||{dupont:0};
  game.exposure=Number.isFinite(game.exposure)?clamp(game.exposure,0,100):0;
  game.cityPos=game.cityPos||{x:46,y:267};
  game.venue=game.venue||null;
  game.flags=game.flags||{};
  game.npcRelations=game.npcRelations||{};
  game.npcFlags=game.npcFlags||{};
  game.knownNpcs=Array.isArray(game.knownNpcs)?game.knownNpcs:[];
  game.access=game.access||{};
  game.sideQuests=game.sideQuests||{};
  game.factions=game.factions||{camarilla:0,brujah:0,nosferatu:0,tremere:0};
  for(const key of Object.keys(A.factions))if(!Number.isFinite(game.factions[key]))game.factions[key]=0;
  game.clock=game.clock||{night:1,minutes:20*60+15};
  game.clock.night=Math.max(1,Math.floor(Number(game.clock.night)||1));
  game.clock.minutes=Math.max(0,Math.min(1439,Math.floor(Number.isFinite(Number(game.clock.minutes))?Number(game.clock.minutes):1215)));
  if(P){
   const pos=P.nearestFree(game.scene,game.x,game.y);
   if(!P.canStand(game.scene,game.x,game.y)){game.x=pos.x;game.y=pos.y;}
  }
 }
 function enterGame(){
  expandSave();
  show("play");keys.clear();walkTarget=null;walkRoute=[];closeDialog();
  const c=game.character,m=D.clans[c.clan];
  $("masterLabel").textContent=m.master;$("masterRole").textContent=m.title;
  $("playName").textContent=c.name;$("playClan").textContent=c.clan;
  $("playHumanity").textContent=c.humanity;$("playWill").textContent=c.willpower;
  $("playState").textContent=game.embraced?"Vástago":"Ghoul";
  $("stageName").textContent=game.character.name;
  $("stageState").textContent=(game.embraced?"VÁSTAGO":"GHOUL")+" · "+game.character.clan.toUpperCase();
  $("stageClock").textContent="NOCHE "+game.clock.night+" · "+formatClock();
  $("stageRiskBar").style.width=game.exposure+"%";
  $("history").innerHTML="";game.history.slice(0,5).forEach(x=>{const p=document.createElement("p");p.textContent="• "+x;$("history").appendChild(p);});
  hud();save();
 }
 function startStory(){
  game={version:1,character:buildCharacter(),scene:"house",x:240,y:220,appreciation:0,
   activeQuest:null,readyReport:null,questIndex:0,history:[],embraced:false,hasSpoken:false,disciplineSpent:0,
   observed:{},arc:{clues:[],outcome:null,visited:[]},relations:{dupont:0},exposure:0,cityPos:{x:46,y:267},venue:null,flags:{},npcRelations:{},npcFlags:{},knownNpcs:[],access:{},sideQuests:{},factions:{camarilla:0,brujah:0,nosferatu:0,tremere:0},clock:{night:1,minutes:1215}};
  log("Tu primera noche como sirviente de "+D.clans[game.character.clan].master+".");
  enterGame();notice("Acercate a tu Domitor y presioná E para hablar.");
 }

 function formatClock(){
   const t=game.clock.minutes;
   return String(Math.floor(t/60)).padStart(2,"0")+":"+String(t%60).padStart(2,"0");
 }
 function advanceClock(amount){
   game.clock.minutes+=Math.max(0,Math.round(amount));
   if(game.clock.minutes>=1440)game.clock.minutes-=1440;
   // El prototipo sólo representa actividad nocturna; se omiten las horas de sol.
   if(game.clock.minutes>=360&&game.clock.minutes<1080){
     game.clock.minutes=1200;game.clock.night++;
     log("La noche siguiente cae sobre París.");
   }
   hud();save();
 }
 function npcIsPresent(npcId){
   const schedule=A.schedules[npcId];if(!schedule)return true;
   const hour=game.clock.minutes/60;
   return schedule.end<=schedule.start?(hour>=schedule.start||hour<schedule.end):(hour>=schedule.start&&hour<schedule.end);
 }
 function waitForNPC(npc){
   const schedule=A.schedules[npc.id];
   if(!schedule)return;
   const current=game.clock.minutes,target=schedule.start*60;
   if(current>=target||current<360)game.clock.night++;
   game.clock.minutes=target;
   log("Esperaste hasta que "+npc.name+" regresara al lugar.");
   hud();save();
   meetNPC(npc);
 }
 function increaseFaction(id,delta,reason){
   if(!A.factions[id])return;
   game.factions[id]=clamp(game.factions[id]+delta,-100,100);
   log("Reputación con "+A.factions[id].name+": "+(delta>=0?"+":"")+delta+". "+reason);
   updateFactionHud();save();
 }
 function updateFactionHud(){
   const names=Object.keys(A.factions).map(id=>({id,value:game.factions[id]||0}));
   names.sort((a,b)=>b.value-a.value);
   const top=names[0];
   $("standingLabel").textContent=top.value>0?A.factions[top.id].name+" ("+top.value+")":"Sin alianzas";
   $("nightClock").textContent=game.clock.night+" · "+formatClock();
   const root=$("factionBars");root.innerHTML="";
   for(const id of Object.keys(A.factions)){
     const f=A.factions[id],value=game.factions[id]||0;
     const line=document.createElement("div");line.className="faction-row";
     const title=document.createElement("span");title.textContent=f.name;
     const amount=document.createElement("b");amount.textContent=(value>0?"+":"")+value;
     const bar=document.createElement("i");bar.className="faction-track";
     const fill=document.createElement("i");fill.className="faction-fill";
     fill.style.width=(Math.abs(value)/100*50)+"%";
     fill.style.left=value>=0?"50%":(50-Math.abs(value)/100*50)+"%";
     fill.style.background=value>=0?f.color:"#bb6677";
     bar.appendChild(fill);line.append(title,amount,bar);root.appendChild(line);
   }
   const target=$("sideQuestList");target.innerHTML="";
   const active=Object.values(game.sideQuests).filter(q=>q.status==="active"||q.status==="ready");
   if(!active.length)target.textContent="Visitá a Ingrid, Lucien o Isabelle para conseguir encargos personales.";
   for(const sq of active){
     const data=A.personal[sq.id],line=document.createElement("div");line.className="side-entry";
     const title=document.createElement("strong");title.textContent=data.title;
     const desc=document.createElement("span");
     desc.textContent=sq.status==="ready"?"Regresá con "+N.byLocation[data.origin].name+".":data.objective;
     line.append(title,desc);target.appendChild(line);
   }
 }
 function hud(){
  if(!game)return;
  const m=D.clans[game.character.clan];$("appreciationText").textContent=game.appreciation+" / 100";
  $("appreciationBar").style.width=game.appreciation+"%";
  $("embraceHint").textContent=game.embraced?"El Abrazo ha sido consumado.":game.appreciation>=100?"Podés solicitar el Abrazo a tu Domitor.":"Ganá su confianza mediante actos y decisiones.";
  $("playState").textContent=game.embraced?"Vástago":"Ghoul";
  $("questTitle").textContent=game.activeQuest?questObj(game.activeQuest).title:"Sin encargo activo";
  $("questDetail").textContent=game.readyReport?"Regresá a la casa para informar al Domitor.":game.activeQuest?questObj(game.activeQuest).summary:"Hablá con tu maestro para recibir una misión.";
  $("questPhase").textContent=game.readyReport?"LISTO PARA INFORMAR":game.activeQuest?"MISIÓN EN CURSO":"A LA ESPERA";
  const houseScene=["house","study","quarters"].includes(game.scene);
  $("sceneLabel").textContent=houseScene?"RESIDENCIA · "+m.area.toUpperCase():game.scene==="venue"?"INVESTIGACIÓN · "+(D.locations.find(l=>l.id===game.venue)?.name||"PARÍS").toUpperCase():"PARÍS · EL PRINCIPADO";
  $("sceneTitle").textContent=houseScene?game.scene==="study"?"El despacho":game.scene==="quarters"?"Habitaciones privadas":"La presencia del Domitor":game.scene==="venue"?"Dentro del lugar":"Las calles después del anochecer";
  $("floatingHint").textContent=houseScene?"E: examinar objetos, hablar o salir":"E: interactuar con objetos y personajes";
  $("exposureText").textContent=game.exposure+" / 100";
  $("exposureBar").style.width=game.exposure+"%";
  $("dupontRelation").textContent=game.relations.dupont>=2?"Confía en vos":game.relations.dupont<=-2?"Desconfía de vos":"Neutral";
  $("knownNpcs").textContent=game.knownNpcs.length+" / 8";
  $("elyseeStatus").textContent=game.access.elysee?"Concedido":game.observed.invitation||game.access.courtReferral?"Con recomendación":"Pendiente";
  updateFactionHud();
  $("leadsStatus").textContent=game.activeQuest==="archivos"?"Pruebas: "+game.arc.clues.length+"/2 como mínimo. "+(game.readyReport?"Informá al Domitor.":"Investigá tres fuentes en París."):"Los sucesos nocturnos se ocultan entre rumores y silencios.";
 }
 function questObj(id){return D.quests.find(q=>q.id===id);}
 function askMenu(title,text,choices,label="CONVERSACIÓN"){
  dialogOpen=true;$("dialog").classList.remove("hidden");$("dialogEyebrow").textContent=label;$("dialogTitle").textContent=title;$("dialogText").textContent=text;
  $("portraitPanel").classList.add("hidden");
  document.querySelector(".dialogue-shell")?.classList.remove("has-portrait");
  const target=$("dialogOptions");target.innerHTML="";
  for(const choice of choices){
   const b=document.createElement("button");b.textContent=choice.label;
   if(choice.disabled)b.disabled=true;
   b.addEventListener("click",()=>{closeDialog();choice.action?.();});
   target.appendChild(b);
  }
  renderSpeakerPortrait(title);
 }
 function closeDialog(){$("dialog").classList.add("hidden");dialogOpen=false;keys.clear();walkTarget=null;}
 function addAppreciation(n,why){game.appreciation=clamp(game.appreciation+n,0,100);log((n>=0?"+":"")+n+" aprecio · "+why);hud();save();}
 function speak(){
  if(!game.hasSpoken){game.hasSpoken=true;log("Has hablado con tu Domitor por primera vez.");save();}
  const clan=D.clans[game.character.clan],name=clan.master;
  const choices=[];
  if(game.appreciation>=100&&!game.embraced)choices.push({label:"Solicitar el Abrazo",action:offerEmbrace});
  if(game.readyReport)choices.push({label:"Informar del encargo concluido",action:reportQuest});
  if(!game.activeQuest&&!game.readyReport)choices.push({label:"Solicitar un nuevo encargo",action:requestQuest});
  if(game.activeQuest&&!game.readyReport)choices.push({label:"Pedir instrucciones sobre el encargo",action:()=>{const q=questObj(game.activeQuest);askMenu("Instrucciones",q.summary,[{label:"Entendido. Partiré ahora.",action:()=>{}}],"ENCARGO ACTIVO");}});
  choices.push({label:"Preguntar por la corte de París",action:()=>askMenu("El Principado de París",
   "Pierre Duvalier rige el Principado. Lord Thomas Wyndham ejerce como Sheriff y Etienne Moreau ocupa el cargo de Senescal. Un comentario a destiempo basta para crear enemigos; respetá la Mascarada.",
   [{label:"Comprendo las reglas de la corte",action:()=>{
     if(!game.flags.courtBriefed){game.flags.courtBriefed=true;addAppreciation(1,"Atendiste la primera lección de protocolo.");}
     else{log("Repasaste el protocolo de la corte.");save();}
   }}],"LA CAMARILLA")});
  if(!game.flags.formalGreeting)choices.push({label:"Saludar con el protocolo adecuado · Carisma + Etiqueta",action:()=>{
   game.flags.formalGreeting=true;
   const r=dicePool("Carisma","Etiqueta",6);
   const n=r.success?4:-2;
   addAppreciation(n,r.success?"Tu saludo fue recibido con aprobación.":"Tu trato resultó demasiado torpe para la corte.");
   askMenu(D.clans[game.character.clan].master,r.success?
    "Aprendés deprisa. Prestá atención a las formas; también son armas.":"Antes de hablar de honor o discreción, aprendé cómo dirigirte a un Vástago.",
    [{label:"Entendido.",action:()=>{}}],"PRUEBA SOCIAL · DADOS: "+r.dice.join(", "));
  }});
  if(game.exposure>=25&&game.flags.exposureHelpNight!==game.clock.night){
   choices.push({label:"Pedir ayuda para contener los rumores sobre tus actos",action:()=>{
     game.flags.exposureHelpNight=game.clock.night;
     const test=dicePool("Inteligencia","Subterfugio",7),successful=test.success;
     exposure(successful?-24:7,successful?"Se ocultaron rastros comprometedores.":"Intentar encubrir los hechos creó nuevas sospechas.");
     addAppreciation(successful?-2:-5,successful?"Tu Domitor desaprueba el coste del favor.":"Tu falta de previsión vuelve a perjudicarte.");
     askMenu("La discreción tiene precio",successful?
       "Un intermediario logra desviar la atención sobre tu actividad. Tu maestro, sin embargo, te exige mayor cuidado.":
       "El intento de encubrimiento no convence a los testigos. Tu maestro no va a repetir esta ayuda durante la misma noche.",
       [{label:"Asumir las consecuencias",action:()=>{}}],"MASQUERADA · DADOS "+test.dice.join(", "));
   }});
  }
  if(!game.flags.readTheRoom)choices.push({label:"Observar el ánimo del maestro · Percepción + Empatía",action:()=>{
   game.flags.readTheRoom=true;
   const r=dicePool("Percepción","Empatía",6);
   const text=r.success?"Su silencio oculta preocupación. Los movimientos de la prensa inquietan a la corte; un expediente se ha vuelto importante.":
    "No conseguís leer su expresión. En vez de una respuesta, recibís una mirada prolongada.";
   log("Intentaste comprender los motivos de tu Domitor.");save();
   askMenu("Los gestos del poder",text+"\nTirada: "+r.dice.join(", ")+" · "+r.net+" éxitos netos.",
     [{label:"Guardar la impresión",action:()=>{}}],"PERCEPCIÓN");
  }});
  choices.push({label:"Responder de forma desafiante",action:()=>{addAppreciation(-4,"Una insolencia delante del maestro.");askMenu(name,"La confianza se gana. Tus palabras, por ahora, te alejan de ella.",[{label:"Retirarme.",action:()=>{}}],"REPRIMENDA");}});
  askMenu(name,clan.opening,choices,"TU DOMITOR · "+game.character.clan.toUpperCase());
 }
 function requestQuest(){
  const choices=D.quests.filter(q=>!game.arc.outcome||!["archivos","prensa"].includes(q.id));
  const index=game.arc.outcome?Math.max(0,game.questIndex-1):game.questIndex;
  const q=choices[index%choices.length];
  askMenu("Un encargo para "+game.character.name,
   q.summary+" Deberás desplazarte hasta "+D.locations.find(l=>l.id===q.place).name+". Tu forma de actuar determinará cuánto confiaré en vos.",
   [{label:"Aceptar con respeto (+2 aprecio)",action:()=>{game.activeQuest=q.id;game.readyReport=null;addAppreciation(2,"Aceptaste el encargo con cortesía.");notice("Salí de la residencia y buscá "+q.title+".");}},
    {label:"Aceptar con arrogancia (−3 aprecio)",action:()=>{game.activeQuest=q.id;game.readyReport=null;addAppreciation(-3,"Tu arrogancia incomodó al Domitor.");}},
    {label:"Todavía no estoy listo",action:()=>{}}],"MISIÓN · "+q.kind.toUpperCase());
 }
 function dicePool(attribute,skill,difficulty){
  const c=game.character;
  const buffs={"Callejeo":"tunnelContact","Pelea":"brujahContact","Política":"sheriffWarning","Ocultismo":"tremereReference","Empatía":"pressContact","Investigación":"policeReference","Etiqueta":"courtProtocol"};
  const patron={"Etiqueta":"camarilla","Política":"camarilla","Pelea":"brujah","Callejeo":"nosferatu","Ocultismo":"tremere"}[skill];
  const faction=patron?(game.factions[patron]||0):0;
  const politicalDie=faction>=25?1:faction<=-25?-1:0;
  const bonus=(game.access?.[buffs[skill]]?1:0)+politicalDie;
  const count=Math.max(1,c.attr[attribute]+(c.skills[skill]||0)+bonus);
  const dice=Array.from({length:count},()=>Math.floor(Math.random()*10)+1);
  const hits=dice.filter(d=>d>=difficulty).length,ones=dice.filter(d=>d===1).length;
  const net=Math.max(0,hits-ones),botch=hits===0&&ones>0;
  return {dice,success:net>0,net,botch,count};
 }
 function questAction(q,hard){
  const checks=hard?{skill:"Sigilo",attr:"Astucia",difficulty:q.difficulty+1}:{skill:q.skill,attr:q.attr,difficulty:q.difficulty};
  const rolled=dicePool(checks.attr,checks.skill,checks.difficulty);
  const reward=rolled.success?q.praise+(hard?6:0):-(q.penalty+(hard?3:0));
  game.readyReport={id:q.id,success:rolled.success,praise:reward,detail:rolled.success?q.normal:q.fail,
   dice:rolled.dice,net:rolled.net,skill:checks.skill,attribute:checks.attr,difficulty:checks.difficulty};
  const narrative=rolled.success?q.normal:q.fail;
  log(q.title+": "+(rolled.success?"resultado favorable":"resultado adverso")+".");
  const desc=narrative+"\n\nTirada: "+checks.attr+" ("+game.character.attr[checks.attr]+") + "+checks.skill+
   " ("+(game.character.skills[checks.skill]||0)+"), dificultad "+checks.difficulty+
   ". Dados: ["+rolled.dice.join(", ")+"] · Éxitos netos: "+rolled.net+(rolled.botch?" · PIFIA":"")+
   ". Volvé con tu maestro para informar del resultado.";
  askMenu(rolled.success?"Objetivo cumplido":"La misión se complicó",desc,[{label:"Volver a informar",action:()=>{}}],rolled.success?"ÉXITO":"FRACASO");
  hud();save();
 }
 function locationAction(location){
  if(location.id==="elysee"&&!game.access.elysee){elyseeGate();return;}
  enterVenue(location);
 }


 function renderSpeakerPortrait(speaker){
   if(!game)return;
   let npc=Object.values(N.byLocation).find(n=>n.name===speaker);
   if(!npc){
     const entry=Object.entries(D.clans).find(([name,m])=>m.master===speaker);
     if(entry){
       const [clan,info]=entry;
       npc={id:"domitor-"+clan.toLowerCase(),name:info.master,clan,role:info.title,
         color:info.accent,skin:clan==="Nosferatu"?"#a6b29d":"#d0b1a4",
         hair:clan==="Tremere"?"#a39ca9":clan==="Nosferatu"?"#343b36":"#28242b"};
     }
   }
   if(npc)renderNpcPortrait(npc);
 }
 function renderNpcPortrait(npc){
   const canvas=$("npcPortrait"),ctx=canvas.getContext("2d");
   const w=canvas.width,h=canvas.height;
   ctx.imageSmoothingEnabled=false;
   const p=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
   const poly=(points,c)=>{ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);
     for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);
     ctx.closePath();ctx.fill();};
   const color=npc.color||"#7d6471",skin=npc.skin||"#c9aa9c",hair=npc.hair||"#30272f";
   const isNos=npc.id==="ingrid"||npc.clan==="Nosferatu";
   const isWoman=["isabelle","ingrid","guardiana"].includes(npc.id)||npc.id==="domitor-malkavian";
   const senior=["marcus","domitor-tremere","domitor-toreador","domitor-ventrue"].includes(npc.id);
   // Antiguo arco parisino y luz lateral para retratos de 144 x 176.
   p(0,0,w,h,"#171823");
   p(8,7,128,162,"#20202b");
   for(let i=0;i<11;i++){p(i*14-3,12,4,148,i%2?"#282630":"#2d2936");}
   p(18,28,108,118,"#38313c");p(24,32,96,111,"#1e202b");
   p(24,32,4,104,"#79666c");p(116,32,4,104,"#79666c");
   p(28,36,88,3,"#9f8977");
   p(70,35,3,108,"#645763");
   for(let i=0;i<7;i++){p((i*31+17)%135,18+(i*19)%100,3,12,"#a87a6650");}
   p(37,44,25,64,"#3f4150");p(82,44,27,64,"#4c4050");
   p(37,44,3,64,"#6b6274");p(107,44,3,64,"#6b6274");
   // Halo cálido y cenefa, sin agregar efectos dependientes de red.
   for(let i=0;i<11;i++){p(16+i*9,140,6,2,i%3?"#8b5c5b":"#bf9772");}
   p(12,151,120,25,"#161722");
   poly([[8,175],[13,136],[25,115],[48,107],[70,118],[92,108],[117,121],[132,146],[138,175]],"#15151e");
   poly([[14,175],[22,134],[39,119],[56,116],[71,128],[91,115],[113,127],[127,175]],color);
   p(21,143,7,32,"#151920");p(116,141,8,34,"#16161f");
   poly([[49,115],[71,144],[91,115],[83,112],[71,121],[58,110]],"#dec6ae");
   poly([[40,119],[59,115],[68,155],[50,144]],"#242331");
   poly([[100,118],[87,115],[73,155],[93,144]],"#22232d");
   poly([[59,119],[72,140],[85,118],[80,154],[65,154]],"#3f343c");
   p(66,136,10,6,"#b9aaa0");p(68,140,5,26,"#4e2c3f");
   // Cuello y mandíbula: hombros en escorzo; luz frontal.
   poly([[62,102],[84,102],[86,124],[70,139],[58,124]],"#9e766f");
   poly([[50,58],[61,44],[88,44],[99,62],[94,94],[83,111],[64,113],[51,96]],skin);
   poly([[87,45],[99,62],[94,94],[83,111],[75,109],[80,84]],"#a58681");
   p(55,71,4,23,"#e4c0ab");p(95,73,3,20,"#8c6263");
   p(64,88,3,12,"#aa7f76");p(76,93,5,10,"#b88b80");
   p(58,73,10,2,"#382932");p(80,73,12,2,"#342733");
   p(59,79,9,4,"#ede0ca");p(80,79,9,4,"#d6c4b2");
   p(63,80,3,3,"#293a42");p(83,80,3,3,"#27323c");
   p(60,78,7,1,"#3b2932");p(81,78,7,1,"#3b2932");
   p(68,97,8,2,"#9e736f");p(72,101,8,2,"#75525c");p(67,106,11,2,"#8f6365");
   p(57,98,3,6,"#bf9890");p(90,93,3,5,"#7f535e");
   // Peinado definido por el tipo de personaje.
   poly([[48,66],[49,49],[60,35],[84,31],[103,43],[101,62],[94,62],[92,49],[80,45],[65,50],[59,62]],hair);
   p(50,53,9,18,hair);p(92,48,9,23,hair);
   p(65,40,25,4,senior?"#b4abb0":"#50404b");
   if(isWoman){
     p(47,58,8,63,hair);p(96,55,9,61,hair);
     p(44,89,6,28,"#3a3039");p(104,89,4,24,"#292330");
     p(55,51,39,4,hair);p(58,55,12,4,hair);
     p(57,106,8,2,"#c99490");p(78,106,7,2,"#c99490");
   }
   if(senior){p(52,51,8,15,"#9e9192");p(91,53,8,10,"#99919b");p(66,45,27,4,"#7c7881");}
   if(npc.id==="lucien"){p(51,47,44,7,"#242027");p(65,108,17,3,"#433138");p(61,112,23,4,"#4b333a");}
   if(npc.id==="john"){p(46,52,10,14,"#272329");p(85,43,18,8,"#251f23");p(70,146,5,17,"#e6d6ca");p(71,151,4,14,"#526172");}
   if(npc.id==="dupont"){
     p(15,136,17,39,"#74706b");p(111,132,20,43,"#74706b");
     p(64,76,10,3,"#a58b81");p(64,95,14,3,"#ac8077");
     p(59,109,31,8,"#5c4544");p(57,113,36,3,"#4c3637");
   }
   if(isNos){
     poly([[57,46],[91,45],[97,62],[91,101],[77,110],[62,107],[52,94]],"#8f9a83");
     p(59,80,10,4,"#1f2625");p(79,79,10,4,"#1f2625");
     p(69,98,10,3,"#586c5e");p(76,63,9,4,"#7a937c");p(57,72,7,3,"#556f5c");
   }
   if(npc.id==="marcus"||npc.id==="domitor-tremere"){
     p(25,138,15,37,"#382a49");p(102,138,15,37,"#3b2d4c");
     p(68,141,7,22,"#c4ada9");p(67,146,9,4,"#69556d");
   }
   if(npc.id==="guardiana"){p(17,139,18,35,"#332b36");p(110,140,18,35,"#342b36");p(67,142,13,3,"#cfaf84");}
   if(npc.id==="isabelle"){p(20,148,26,26,"#563a60");p(97,146,25,28,"#593b62");p(68,147,11,4,"#b9a2c3");}
   // Marco y firma visual cromática del personaje.
   p(0,0,144,4,"#be9d82");p(0,172,144,4,"#be9d82");
   p(0,0,4,176,"#7c6570");p(140,0,4,176,"#7c6570");
   p(10,157,24,5,color);p(111,157,24,5,color);
   p(12,14,42,2,"#c4ac92");p(88,14,42,2,"#c4ac92");
   $("portraitClan").textContent=npc.clan.toUpperCase()+" · "+npc.role;
   $("portraitPanel").classList.remove("hidden");
   document.querySelector(".dialogue-shell")?.classList.add("has-portrait");
 }

 function offerPersonalQuest(npc){
   const arc=A.personal[npc.id];
   if(!arc||game.sideQuests[npc.id])return;
   askMenu(arc.title,arc.offer+"\n\n"+arc.objective,[
    {label:"Aceptar el encargo personal",action:()=>{
      game.sideQuests[npc.id]={id:npc.id,status:"active",result:null};
      log("Nuevo encargo de "+npc.name+": "+arc.title+".");
      advanceClock(4);hud();save();
      notice("Encargo agregado al diario: "+arc.title+".");
    }},
    {label:"Todavía no aceptar",action:()=>{}}
   ],"ENCARGO PERSONAL · "+npc.name.toUpperCase());
 }
 function personalAtLocation(id){
   return Object.values(game.sideQuests).filter(sq=>sq.status==="active"&&A.personal[sq.id]?.target===id);
 }
 function resolvePersonalAtTarget(arc){
   const quest=game.sideQuests[arc.id];
   if(!quest||quest.status!=="active")return;
   const choices=arc.options.map(option=>({
    label:option.label+" · "+option.attr+" + "+option.skill+" (dif. "+option.difficulty+")",
    action:()=>{
     const dice=dicePool(option.attr,option.skill,option.difficulty);
     const successful=dice.success;
     const result={
       success:successful,method:option.key,exposure:successful?option.exposure:option.exposure+9,
       bonus:successful?option.bonus:0,dice:dice.dice,net:dice.net,
       description:successful?option.success:option.failure
     };
     quest.result=result;quest.status="ready";
     if(result.exposure)exposure(result.exposure,"Consecuencias del encargo de "+N.byLocation[arc.origin].name+".");
     log("Completaste la investigación para "+N.byLocation[arc.origin].name+".");
     advanceClock(16);hud();save();
     askMenu("El resultado de "+arc.title,result.description+
      "\n\nTirada: ["+dice.dice.join(", ")+"] · éxitos netos "+dice.net+"."+
      "\n\nRegresá con "+N.byLocation[arc.origin].name+" para presentar el informe.",
      [{label:"Regresar con el resultado",action:()=>{}}],successful?"INVESTIGACIÓN RESUELTA":"RESULTADO COMPLICADO");
    }
   }));
   choices.push({label:"No intervenir todavía",action:()=>{}});
   askMenu(arc.title,arc.objective+"\n\n¿Cómo vas a proceder?",choices,"INVESTIGACIÓN SECUNDARIA");
 }
 function reportPersonal(npc){
   const arc=A.personal[npc.id],quest=game.sideQuests[npc.id];
   if(!arc||quest?.status!=="ready")return;
   const result=quest.result;
   const options=[
    {label:"Entregar un informe honesto",action:()=>completePersonal(npc,arc,result,true)},
    {label:"Exagerar tus logros · Manipulación + Subterfugio (dif. 7)",action:()=>{
      const check=dicePool("Manipulación","Subterfugio",7);
      if(!check.success){exposure(6,"Una mentira mal construida llamó la atención.");}
      completePersonal(npc,arc,result,check.success);
    }},
    {label:"Posponer la entrega",action:()=>{}}
   ];
   askMenu("Un informe para "+npc.name,arc.report+"\n\n"+result.description,options,"FINAL DE ENCARGO");
 }
 function completePersonal(npc,arc,result,credible){
   const quest=game.sideQuests[arc.id];
   if(quest?.status!=="ready")return;
   quest.status="done";quest.reported=true;
   const excellent=result.success&&credible;
   const factionPoints=excellent?10+result.bonus:credible?-5:-10;
   game.npcRelations[npc.id]=clamp((game.npcRelations[npc.id]||0)+(excellent?2:-1),-3,3);
   increaseFaction(arc.faction,factionPoints,"El informe de "+arc.title+".");
   if(arc.id==="lucien"){
     increaseFaction("camarilla",excellent?4:-5,"Tensión controlada en Saint-Denis.");
   }
   if(arc.id==="isabelle"){
     increaseFaction("camarilla",excellent?3:-4,"Cuidado del protocolo de Passy.");
   }
   if(arc.id==="ingrid"&&excellent)game.access.tunnelContact=true;
   if(excellent&&D.clans[game.character.clan].master===npc.name)addAppreciation(3,"Tu Domitor apreció un trabajo adicional.");
   log("Encargo personal concluido: "+arc.title+".");
   advanceClock(5);hud();save();
   askMenu(npc.name,excellent?
     "«Cumpliste con discreción. Recordaré lo que hiciste.»\n\nReputación con "+A.factions[arc.faction].name+" +"+factionPoints+".":
     "«Escuché tu informe. Tendremos que lidiar con las consecuencias.»\n\nReputación con "+A.factions[arc.faction].name+" "+factionPoints+".",
     [{label:"Continuar mi camino",action:()=>{}}],"CONSECUENCIAS POLÍTICAS");
 }
 function inspectLocationActions(location){
   const tasks=personalAtLocation(location.id);
   const q=game.activeQuest?questObj(game.activeQuest):null;
   const mainHere=!!q&&q.place===location.id&&!game.readyReport;
   const dupontHere=game.activeQuest==="archivos"&&!game.readyReport&&["policia","stjuly","hemeroteca"].includes(location.id);
   const actions=[];
   if(dupontHere)actions.push({label:"Investigar el caso Pierre Dupont",action:()=>researchLead(location)});
   else if(mainHere)actions.push({label:"Investigar el encargo de tu Domitor",action:()=>resolveStandardQuest(q)});
   for(const quest of tasks){
      const arc=A.personal[quest.id];
      actions.push({label:"Investigar: "+arc.title,action:()=>resolvePersonalAtTarget(arc)});
   }
   actions.push({label:"Examinar el lugar sin intervenir",action:()=>{
    const src=C.investigation.sources[location.id],env=N.environments[location.id];
    askMenu("Un vistazo a "+location.name,(src?.hint||env.description)+"\n\n"+location.detail,
     [{label:"Seguir explorando",action:()=>{}}],"OBSERVACIÓN");
   }});
   if(actions.length===1){actions[0].action();return;}
   askMenu("¿Qué vas a investigar?",location.name+" puede aportar información a más de un encargo.",actions,"TRABAJO DE CAMPO");
 }
 function npcState(id){
  if(!game.npcFlags[id])game.npcFlags[id]={};
  if(!Number.isFinite(game.npcRelations[id]))game.npcRelations[id]=0;
  return game.npcFlags[id];
 }
 function favorDescription(id){
  const texts={
   courtReferral:"Te expidieron una referencia que la Guardiana del Elíseo puede reconocer.",
   tunnelContact:"Disponés de un contacto en la red subterránea. (+1 dado en Callejeo)",
   brujahContact:"Tenés a quién recurrir en Bastilla. (+1 dado en Pelea)",
   sheriffWarning:"Conocés un enlace del Sheriff. (+1 dado en Política)",
   tremereReference:"Contás con una referencia Tremere. (+1 dado en Ocultismo)",
   pressContact:"Conservás el teléfono de un informante de prensa. (+1 dado en Empatía)",
   policeReference:"Tenés una referencia para consultar los archivos. (+1 dado en Investigación)",
   courtProtocol:"Aprendiste las normas de la corte. (+1 dado en Etiqueta)"
  };
  return texts[id]||"Se registró una nueva relación.";
 }
 function meetNPC(npc){
  const state=npcState(npc.id);
  if(!game.knownNpcs.includes(npc.id)){
    game.knownNpcs.push(npc.id);
    log("Conociste a "+npc.name+".");
  }
  const baseTrust=npc.id==="dupont"?clamp(game.relations.dupont,-3,3):game.npcRelations[npc.id];
  const npcFaction={"ingrid":"nosferatu","lucien":"brujah","isabelle":"tremere","marcus":"tremere","john":"camarilla","guardiana":"camarilla"}[npc.id];
  const standing=npcFaction?(game.factions[npcFaction]||0):0;
  const trust=clamp(baseTrust+(standing>=20?1:standing<=-20?-1:0),-3,3);
  const opts=[];
  if(!state.impression){
   opts.push({label:"Presentarte con respeto · "+npc.check.attr+" + "+npc.check.skill,action:()=>{
    state.impression=true;
    const roll=dicePool(npc.check.attr,npc.check.skill,npc.check.difficulty);
    const shift=roll.success?1:-1;
    game.npcRelations[npc.id]=clamp(game.npcRelations[npc.id]+shift,-3,3);
    if(npc.id==="dupont"){game.relations.dupont=clamp(game.relations.dupont+shift,-5,5);game.npcRelations.dupont=clamp(game.relations.dupont,-3,3);}
    log((roll.success?"Buena":"Mala")+" primera impresión ante "+npc.name+".");
    hud();save();
    askMenu("Primera impresión",roll.success?
     "La cautela inicial cede un poco. "+npc.name+" parece dispuesto a escucharte.":
     npc.rebuke,
     [{label:"Continuar",action:()=>{}}],
     "TIRADA · "+npc.check.attr+" + "+npc.check.skill+" · "+roll.dice.join(", "));
   }});
  }
  opts.push({label:"Preguntar por los rumores de París",action:()=>{
   if(!state.rumor){
    state.rumor=true;log("Rumor de "+npc.name+": "+npc.rumor);save();
   }
   askMenu("Rumores de la noche",npc.rumor,[{label:"Tomar nota",action:()=>{}}],"INFORMACIÓN");
  }});
  if(!state.aid){
   opts.push({label:"Solicitar una ayuda o referencia ("+(trust>=1?"confianza suficiente":"requiere confianza +1")+")",disabled:trust<1,action:()=>{
    state.aid=true;game.access[npc.aidKey]=true;
    if(npc.id==="dupont"){game.relations.dupont=clamp(game.relations.dupont+1,-5,5);game.npcRelations.dupont=clamp(game.relations.dupont,-3,3);}
    log(npc.name+" te debe un pequeño favor.");hud();save();
    askMenu("Un favor limitado",npc.aid+"\n\n"+favorDescription(npc.aidKey),
      [{label:"Agradecer la ayuda",action:()=>{}}],"FAVOR DEBIDO");
   }});
  }
  if(npc.id==="dupont"&&game.activeQuest==="archivos"&&!game.readyReport&&game.arc.clues.length>=2){
    opts.unshift({label:"Confrontar a Dupont sobre sus documentos",action:confrontDupont});
  }
  const personal=A.personal[npc.id];
  if(personal){
    const current=game.sideQuests[npc.id];
    if(!current)opts.unshift({label:"Preguntar por un encargo personal · "+personal.title,action:()=>offerPersonalQuest(npc)});
    else if(current.status==="ready")opts.unshift({label:"Entregar el informe: "+personal.title,action:()=>reportPersonal(npc)});
    else if(current.status==="active")opts.push({label:"Repasar el encargo: "+personal.title,action:()=>{
      askMenu(personal.title,personal.objective,[{label:"Comprendido",action:()=>{}}],"ENCARGO EN CURSO");
    }});
  }
  if(npc.id==="isabelle"&&!state.stjulyWarning){
   opts.push({label:"Preguntar por la autoridad Tremere en París",action:()=>{
     state.stjulyWarning=true;log("Isabelle mencionó la autoridad del Regente Marcus von Württemberg.");
     save();askMenu("La casa Tremere","El Alto Regente Marcus von Württemberg mantiene un férreo control del clan. Aquí no conviene tomar partido entre sus subordinados.",
      [{label:"Comprendido",action:()=>{}}],"POLÍTICA DEL CLAN");
   }});
  }
  opts.push({label:"Despedirte",action:()=>{}});
  hud();save();
  askMenu(npc.name,npc.greeting+"\n\n"+npc.role+"\nRelación actual: "+trust+" (−3 a +3)",opts,
   npc.clan.toUpperCase()+" · ENCUENTRO");
 }
 function elyseeGate(){
  if(game.access.elysee){enterVenue(D.locations.find(l=>l.id==="elysee"));return;}
  const opts=[];
  if(game.observed.invitation||game.access.courtReferral){
   opts.push({label:"Presentar una recomendación reconocible",action:()=>{
    game.access.elysee=true;log("El personal del Elíseo autorizó tu entrada.");
    hud();save();enterVenue(D.locations.find(l=>l.id==="elysee"));
   }});
  }
  if(!game.npcFlags.elyseeAttempted){
   opts.push({label:"Solicitar acceso mediante Carisma + Etiqueta (dificultad 7)",action:()=>{
    game.npcFlags.elyseeAttempted=true;
    const roll=dicePool("Carisma","Etiqueta",7);
    if(roll.success){
      game.access.elysee=true;log("Te autorizaron a entrar al Elíseo tras verificar tu presentación.");
      hud();save();enterVenue(D.locations.find(l=>l.id==="elysee"));
      notice("Tu petición fue aceptada.");
    }else{
      log("El Elíseo rechazó tu solicitud de acceso.");save();
      askMenu("Acceso denegado","No figurás en la lista. Consultá las cartas de tu residencia o ganate un contacto que pueda recomendarte. Tu solicitud quedó registrada.",
        [{label:"Retirarte",action:()=>{}}],"PROTOCOLO DE LA CORTE · DADOS "+roll.dice.join(", "));
    }
   }});
  }
  opts.push({label:"Volver a la ciudad",action:()=>{}});
  askMenu("Las puertas del Elíseo","Una guardia discreta custodia la entrada. No basta con conocer el nombre del príncipe Pierre Duvalier para presentarse ante la corte.",opts,"ACCESO RESTRINGIDO");
 }
 function resolveStandardQuest(q){
  const choices=[
   {label:"Proceder con "+q.attr+" + "+q.skill+" (dificultad "+q.difficulty+")",action:()=>questAction(q,false)},
   {label:"Intentar una aproximación discreta · Astucia + Sigilo (dif. "+(q.difficulty+1)+")",action:()=>questAction(q,true)},
   {label:"Posponer el encargo",action:()=>{}}
  ];
  askMenu(q.title,q.summary+"\n\nTu maestro evaluará tanto el resultado como la discreción.",choices,"OBJETIVO DEL DOMITOR");
 }
 function exposure(delta,reason){
  game.exposure=clamp(game.exposure+delta,0,100);
  if(delta)log((delta>0?"+":"")+delta+" exposición · "+reason);
  if(game.exposure>=60&&!game.flags.marquedMasquerade){
    game.flags.marquedMasquerade=true;
    increaseFaction("camarilla",-8,"Los rumores sobre tu actividad llegaron a la corte.");
  }
  if(game.exposure>=60)notice("Tu actividad está atrayendo miradas peligrosas.");
  hud();save();
 }
 function rememberClue(locationId,success,description,roll){
  const arc=game.arc;
  if(!arc.clues.includes(locationId))arc.clues.push(locationId);
  if(!success)exposure(9,"Tu investigación dejó un rastro.");
  log("Pista: "+C.investigation.sources[locationId].name+". "+description);
  const extra="Tirada: "+roll.dice.join(", ")+" · Éxitos netos "+roll.net+".";
  askMenu("Una nueva pista",description+"\n\n"+extra+"\n\nPruebas reunidas: "+arc.clues.length+" de 2 necesarias."+
    (arc.clues.length>=2?" Ahora podés enfrentar a Pierre Dupont en la hemeroteca.":" Investigá otra fuente."),
    [{label:"Guardar esta información",action:()=>{}}],"INVESTIGACIÓN");
  hud();save();
 }
 function researchLead(location){
  const source=C.investigation.sources[location.id];
  if(!source)return;
  if(game.arc.clues.includes(location.id)){
   askMenu(source.name,"Ya registraste esta fuente. Una vez guardada una pista, no podés conseguirla dos veces.",
     [{label:"Regresar",action:()=>{}}],"PRUEBA OBTENIDA");return;
  }
  const bg=game.character.backgrounds.Contactos||0;
  const choices=[{label:"Investigar con "+source.attr+" + "+source.skill+" (dificultad "+source.difficulty+")",action:()=>{
   const roll=dicePool(source.attr,source.skill,source.difficulty);
   rememberClue(location.id,roll.success,roll.success?source.success:source.failure,roll);
  }}];
  if(bg>=2)choices.push({label:"Pedir ayuda a tus Contactos ("+bg+" círculos; dificultad 6)",action:()=>{
   const roll=dicePool("Carisma","Callejeo",6);
   rememberClue(location.id,roll.success,roll.success?"Un contacto te facilita información: "+source.success:source.failure,roll);
  }});
  choices.push({label:"Aún no voy a arriesgarme",action:()=>{}});
  askMenu(source.name,source.hint,choices,"BUSCAR EVIDENCIAS");
 }
 function confrontDupont(){
  if(game.arc.clues.length<2){
    askMenu("Pierre Dupont","El periodista te estudia con cautela. Sin al menos dos pistas, no tenés argumentos suficientes para forzar una conversación útil.",
      [{label:"Seguir reuniendo pistas",action:()=>{}}],"HEMEROTECA");return;
  }
  const options=Object.entries(C.investigation.approaches).map(([key,a])=>({
   label:a.label+" · "+a.attr+" + "+a.skill+" (dif. "+a.difficulty+")",
   action:()=>{
    const roll=dicePool(a.attr,a.skill,a.difficulty);
    const success=roll.success;
    let favor=0,rel=0,risk=0;
    if(key==="persuade"){favor=success?34:-14;rel=success?3:-1;risk=success?-3:4;}
    if(key==="steal"){favor=success?39:-17;rel=success?0:-2;risk=success?0:17;}
    if(key==="threaten"){favor=success?24:-27;rel=-3;risk=success?18:32;}
    game.relations.dupont=clamp(game.relations.dupont+rel,-5,5);
    game.npcRelations.dupont=clamp(game.relations.dupont,-3,3);
    if(risk)exposure(risk,key==="threaten"?"Amenazaste a un testigo humano.":"Se dejaron rastros durante el encuentro.");
    game.arc.outcome={approach:key,success,dice:roll.dice,detail:success?a.success:a.failure,relationDelta:rel,exposureDelta:risk};
    const detail=(success?a.success:a.failure)+" Dados: ["+roll.dice.join(", ")+"] · éxitos netos: "+roll.net+".";
    game.readyReport={id:"archivos",success,praise:favor,detail,dice:roll.dice,net:roll.net,skill:a.skill,attribute:a.attr,difficulty:a.difficulty};
    log("Confrontación con Pierre Dupont: "+(success?"éxito":"complicaciones")+".");
    hud();save();
    askMenu("El destino de las pruebas",detail+"\n\nAhora debés informar a tu Domitor.",
      [{label:"Regresar con los resultados",action:()=>{}}],"CONSECUENCIAS");
   }
  }));
  options.push({label:"Aplazar la confrontación",action:()=>{}});
  askMenu("Pierre Dupont","El periodista abre una carpeta repleta de fotografías y testimonios. Tenés "+game.arc.clues.length+
   " fuentes contrastadas. ¿Qué precio estás dispuesto a pagar para proteger la Mascarada?",options,"DECISIÓN IMPORTANTE");
 }
 function enterVenue(location){
   game.venue=location.id;game.cityPos={x:game.x,y:game.y};game.scene="venue";game.x=240;game.y=237;walkTarget=null;walkRoute=[];
   if(!game.arc.visited.includes(location.id))game.arc.visited.push(location.id);
   log("Visitaste "+location.name+".");advanceClock(12);hud();save();
 }
 function venueInteract(){
  const npc=N.byLocation[game.venue],env=N.environments[game.venue];
  const location=D.locations.find(l=>l.id===game.venue);
  const exit=Math.hypot(game.x-240,game.y-270);
  if(exit<42){
   game.scene="paris";game.x=game.cityPos.x;game.y=game.cityPos.y;game.venue=null;
   advanceClock(5);hud();save();return;
  }
  if(Math.hypot(game.x-130,game.y-143)<55){
   inspectLocationActions(location);return;
  }
  if(Math.hypot(game.x-240,game.y-104)<60){
   if(npcIsPresent(npc.id)){meetNPC(npc);}
   else askMenu("Ahora no está "+npc.name,
     "Son las "+formatClock()+". "+npc.name+" suele atender a partir de las "+String(A.schedules[npc.id].start).padStart(2,"0")+":00. Podés recorrer otros lugares o esperar.",
     [{label:"Esperar hasta su llegada",action:()=>waitForNPC(npc)},
      {label:"Explorar por tu cuenta",action:()=>{}}],"HORARIOS DE PARÍS");
   return;
  }
  if(Math.hypot(game.x-350,game.y-146)<55){
   const key="inspect_"+game.venue;
   if(!game.flags[key]){game.flags[key]=true;log("Examinaste "+location.name+".");save();}
   askMenu("Detalles del lugar",env.description+"\n\n"+location.detail,
    [{label:"Continuar",action:()=>{}}],"OBSERVACIÓN");return;
  }
  notice("Acercate al personaje, examiná los objetos o regresá por la salida.");
 }
 function reportQuest(){
  const r=game.readyReport,q=questObj(r.id),master=D.clans[game.character.clan].master;
  askMenu("Tu informe al Domitor",r.detail+" ¿Cómo lo presentarás a "+master+"?",
    [{label:"Informar con honestidad (aprecio "+(r.praise>=0?"+":"")+r.praise+")",action:()=>endQuest(r.praise,"Presentaste un informe veraz.")},
     {label:"Disimular las dificultades (arriesgado)",action:()=>{
      const test=dicePool("Manipulación","Subterfugio",7),n=test.success?Math.round(r.praise*.7)-2:-19;
      const detail="Tu versión "+(test.success?"resultó convincente.":"fue cuestionada.")+" Dados: "+test.dice.join(", ")+".";
      endQuest(n,detail);
     }}],"INFORME FINAL");
 }
 function endQuest(points,reason){
  const last=game.readyReport?.id;
  game.activeQuest=null;game.readyReport=null;game.questIndex++;addAppreciation(points,reason);
  askMenu("Una sentencia del maestro",reason+(game.appreciation>=100&&!game.embraced?"\n\nHas ganado su favor. El Abrazo es ahora una posibilidad, nunca una obligación.":"\n\nTodavía quedan pruebas por superar."),
    [{label:game.appreciation>=100&&!game.embraced?"Hablar del Abrazo":"Continuar mi servicio",action:()=>{if(game.appreciation>=100&&!game.embraced)offerEmbrace();}}],"APRECIO "+game.appreciation+" / 100");
  save();
 }
 function offerEmbrace(){
  if(game.appreciation<100||game.embraced)return;
  const m=D.clans[game.character.clan].master;
  askMenu("El precio de la eternidad",m+" ha preparado una ceremonia privada. Aceptar significará dejar atrás tu vida mortal y entrar en el clan "+game.character.clan+". La decisión será irreversible para este personaje.",
  [{label:"Acepto el Abrazo y sus consecuencias",action:()=>{
    game.embraced=true;embraceFxUntil=visualTime+4;game.character.disciplines={};game.character.status="Vástago";
    log("Recibiste el Abrazo. Ya pertenecés al clan "+game.character.clan+".");
    save();hud();disciplineCeremony();
   }},
   {label:"Rechazo por ahora. Conservaré mi condición de ghoul",action:()=>{log("Pospusiste el Abrazo. Tu Domitor sigue aguardando tu decisión.");save();}}],"CEREMONIA DEL ABRAZO");
 }
 function disciplineCeremony(){
  const available=D.clans[game.character.clan].disciplines,disc=()=>game.character.disciplines;
  const spent=()=>Object.values(disc()).reduce((a,b)=>a+b,0);
  const make=()=>{
   askMenu("Primeros dones de la sangre","Asigná los 3 círculos iniciales entre las Disciplinas de tu clan. Se encuentran disponibles: "+available.join(", ")+". Puntos asignados: "+spent()+"/3.",
    available.map(name=>({label:name+": "+(disc()[name]||0)+" círculos · añadir uno",disabled:spent()>=3||(disc()[name]||0)>=3,action:()=>{disc()[name]=(disc()[name]||0)+1;save();make();}})).concat([
      {label:"Reiniciar distribución",action:()=>{game.character.disciplines={};save();make();}},
      {label:"Confirmar Disciplinas y continuar",disabled:spent()!==3,action:()=>{log("Completaste la asignación inicial de Disciplinas.");save();hud();notice("Sos un Vástago del clan "+game.character.clan+".");}}
    ]),"EL ABRAZO · CLAN "+game.character.clan.toUpperCase());
  };make();
 }

 function interact(){
  if(!game||dialogOpen)return;
  const room=game.scene;
  if(room==="venue"){venueInteract();return;}
  if(["house","study","quarters"].includes(room)){
   if(room==="house"){
    if(Math.hypot(game.x-240,game.y-98)<62){speak();return;}
    if(Math.hypot(game.x-240,game.y-269)<45){
      game.scene="paris";game.x=46;game.y=267;walkTarget=null;notice("La noche de París te espera.");hud();save();return;
    }
    if(Math.hypot(game.x-44,game.y-233)<47){changeRoom("study");return;}
    if(Math.hypot(game.x-436,game.y-233)<47){changeRoom("quarters");return;}
   }else if(Math.hypot(game.x-240,game.y-268)<48){changeRoom("house");return;}
   const objects=C.residenceObjects[room]||[];
   const nearby=objects.map(o=>({item:o,d:Math.hypot(game.x-o.x,game.y-o.y)})).sort((a,b)=>a.d-b.d)[0];
   if(nearby&&nearby.d<52){observeObject(nearby.item);return;}
   notice(room==="house"?"Acercate al maestro, una puerta o un objeto señalado.":"Examiná los objetos o volvé al salón por la puerta.");
   return;
  }
  if(room==="paris"){
   if(Math.hypot(game.x-46,game.y-269)<44){
    game.scene="house";game.x=240;game.y=232;walkTarget=null;hud();save();notice("Regresaste a la residencia.");return;
   }
   let nearest=null,best=999;
   for(const location of D.locations){
    const x=(location.x+location.w/2)/2.1,y=(location.y+location.h/2)/2;
    const d=Math.hypot(game.x-x,game.y-y);
    if(d<best){best=d;nearest=location;}
   }
   if(nearest&&best<43){locationAction(nearest);return;}
   notice("Acercate a alguno de los lugares del mapa.");
  }
 }
 function changeRoom(name){
  game.scene=name;game.x=240;game.y=name==="house"?222:name==="study"?260:238;walkTarget=null;walkRoute=[];hud();save();
  const r=C.residences[game.character.clan];
  notice(name==="study"?r.study:name==="quarters"?r.quarters:"Regresaste al salón.");
 }
 function observeObject(obj){
   const clan=game.character.clan,r=C.residences[clan],already=!!game.observed[obj.id],text=r.objects[obj.id];
   if(!already){game.observed[obj.id]=true;log("Observaste: "+obj.title+".");save();}
   const bonus=obj.id==="dossier"&&game.activeQuest==="archivos"?"\n\nUna referencia al periodista Pierre Dupont confirma que el encargo es delicado.":obj.id==="journal"?"\n\nLos sirvientes parecen conocer detalles que no aparecen en los documentos oficiales.":"";
   askMenu(obj.title,text+bonus+(already?"\n\nYa examinaste este objeto.":""),
     [{label:"Memorizar y continuar",action:()=>{}}],"OBJETO EXAMINABLE");
 }
 function pixel(x,y,w,h,col){g.fillStyle=col;g.fillRect(Math.floor(x),Math.floor(y),Math.ceil(w),Math.ceil(h));}
 function tileBackground(seed){
  pixel(0,0,480,300,seed);
  for(let y=0;y<300;y+=16)for(let x=0;x<480;x+=16){
   pixel(x,y,15,15,((x/16+y/16)%4===0)?"#342b36":"#2d2831");
   if((x+y)%7===0)pixel(x+4,y+7,3,1,"#4b3b48");
  }
 }
 function portrait(x,y,type,accent){
  if(G){
    const npc=type==="master"&&game.scene==="venue"?N.byLocation[game.venue]:null;
    G.character(g,x,y,{master:type==="master",npc,clan:npc?.clan||game.character.clan,
      embraced:!!game.embraced,facing:type==="player"?(game.facing||"down"):"down",
      walking:type==="player"&&!!game.walking,cycle:game.walkCycle||0,time:visualTime,
      appearance:type==="player"?game.character.appearance:null});
    return;
  }
  pixel(x-9,y+5,18,19,type==="master"?"#181722":"#50565c");pixel(x-13,y+10,5,12,type==="master"?"#272431":"#4b5457");
  pixel(x+8,y+10,5,12,type==="master"?"#28232b":"#4f5458");
  pixel(x-5,y-10,10,12,type==="master"?"#c9b6a8":"#c1a389");
  pixel(x-6,y-15,12,6,type==="master"?"#18181f":"#2a252b");
  pixel(x-6,y+8,12,9,accent);
  pixel(x-3,y-7,2,2,"#161016");pixel(x+3,y-7,2,2,"#161016");
  if(type==="master"){pixel(x-14,y+19,28,4,"#15121b");pixel(x-7,y+23,6,3,"#14131a");pixel(x+2,y+23,6,3,"#14131a");}
  else{pixel(x-7,y+22,6,5,"#222128");pixel(x+2,y+22,6,5,"#222128");}
 }

 function drawHouse(){drawResidence(game.scene);}
 function drawResidence(room){
  if(G){
    G.drawResidence(g,room,game.character.clan,C,game,visualTime);
    if(room==="house")portrait(240,98,"master",D.clans[game.character.clan].accent);
    portrait(game.x,game.y,"player",game.embraced?"#9c505e":"#8a8a74");
    return;
  }
  const info=C.residences[game.character.clan],walls=info.wall,floor=info.floor,metal=info.metal,wood=info.furniture;
  pixel(0,0,480,300,"#0f0e15");
  // Mosaico de piedra / tablones, con grano pixelado.
  for(let y=30;y<300;y+=18)for(let x=4;x<480;x+=28){
   pixel(x,y,27,17,floor);pixel(x+2,y+1,23,1,"#30252f");
   if((x*7+y*3)%5===0)pixel(x+5,y+9,3,2,"#695361");
  }
  pixel(0,0,480,40,walls);pixel(0,35,480,5,metal);
  pixel(0,0,15,300,walls);pixel(465,0,15,300,walls);
  for(let x=22;x<475;x+=73){pixel(x,0,9,220,"#16131c");pixel(x+2,0,3,212,wood);pixel(x-6,38,21,6,metal);}
  // Ventanas arqueadas y reflejos
  for(const x of [72,361]){
    pixel(x-22,42,49,74,"#211925");pixel(x-17,47,39,64,"#5c586b");
    pixel(x-13,51,31,56,room==="study"?"#5a5369":"#53536a");
    pixel(x+2,51,3,57,metal);pixel(x-13,78,31,3,metal);
    pixel(x-9,55,6,19,"#8d8191");pixel(x+9,85,5,13,"#73627d");
    pixel(x-27,109,60,7,wood);
  }
  // Alfombra y baldosas: color de cada clan.
  pixel(142,175,196,100,info.rug);pixel(151,181,178,87,"#211b27");pixel(159,187,162,75,info.rug);
  for(let y=195;y<259;y+=13)for(let x=172;x<307;x+=21){pixel(x,y,8,3,"#d2b89b66");}
  // Luminarias de pared
  for(const x of [22,453]){
   pixel(x-6,99,12,5,"#201b22");pixel(x-2,89,5,14,metal);
   pixel(x-5,82,11,8,"#e0b36f");pixel(x-2,79,5,4,"#f0db9e");
   pixel(x-12,81,24,24,"#e8b77618");
  }
  if(room==="house"){
   // Trono discreto del maestro.
   pixel(196,64,88,63,wood);pixel(203,55,74,49,"#231d29");pixel(209,66,62,29,info.rug);
   pixel(183,103,22,33,metal);pixel(275,103,22,33,metal);
   pixel(169,146,142,58,wood);pixel(177,153,126,12,"#b08c78");pixel(185,166,110,32,"#352530");
   pixel(23,145,121,65,wood);pixel(28,151,109,51,"#382932");
   pixel(338,131,114,70,wood);pixel(345,137,100,56,"#42333d");
   // Libro antiguo, mapa o carta interactiva sobre una mesa.
   pixel(81,144,58,24,"#b2a094");pixel(87,148,46,16,"#e5d4ae");
   pixel(87,151,46,2,"#7b4a4b");
   pixel(336,128,58,45,"#9e7c72");pixel(342,132,46,36,"#4b3b42");
   pixel(348,137,34,26,"#d8bb9b");pixel(353,139,24,22,"#43323e");
   portrait(240,98,"master",D.clans[game.character.clan].accent);
   textPixel("DOMITOR",240,51,"#e4c7ae",9,"center");
   // Puertas laterales y principal.
   pixel(15,215,28,42,"#160e16");pixel(19,220,20,34,"#6a4b53");
   pixel(437,215,28,42,"#160e16");pixel(440,220,21,34,"#6a4b53");
   pixel(209,267,62,33,"#160d18");pixel(217,269,46,31,wood);
   textPixel("DESPACHO",34,213,8,"#ddbf9e","left");
   textPixel("HABITACIONES",449,212,8,"#ddbf9e","right");
   textPixel("PARÍS",240,290,"#f1d1af",9,"center");
  }else if(room==="study"){
   // Estantes y archivo del maestro.
   for(const x of [49,317]){
    pixel(x,112,115,70,wood);pixel(x+5,118,105,58,"#241b28");
    for(let yy=123;yy<170;yy+=20)for(let xx=x+9;xx<x+101;xx+=8){
     const c=(xx+yy)%3;pixel(xx,yy,6,15,["#816973","#9d7c64","#696884"][c]);
    }
    pixel(x+4,138,107,3,metal);pixel(x+4,163,107,3,metal);
   }
   pixel(187,196,106,42,wood);pixel(196,199,90,32,"#997868");
   pixel(207,206,64,18,"#d9c1a0");pixel(223,208,30,14,"#63566e");
   pixel(118,121,55,39,"#d2ae86");pixel(128,126,34,28,"#e2cfb3");pixel(133,131,10,2,"#504659");
   pixel(316,127,46,40,"#24202a");pixel(324,133,30,22,metal);pixel(339,138,4,6,"#1d161b");
   textPixel(info.study.toUpperCase(),240,22,metal,12,"center");
   pixel(212,267,56,33,"#160d18");pixel(220,269,40,28,wood);textPixel("SALÓN",240,291,"#f0d1b4",9,"center");
  }else{
   // Cuartos privados: cama, baúl, espejo, mesa de lectura.
   pixel(47,118,136,78,wood);pixel(53,124,124,66,"#ded0b7");pixel(60,130,44,28,"#a1a09e");
   pixel(290,113,133,74,wood);pixel(298,122,117,56,"#6c515d");
   pixel(303,126,107,47,"#b5aa98");pixel(330,130,60,32,"#d9c9b0");
   pixel(113,117,57,32,"#5e483d");pixel(119,121,45,23,"#a17e65");
   pixel(304,130,58,22,"#e0cab2");pixel(315,133,37,14,"#534451");
   pixel(219,74,46,51,metal);pixel(225,80,34,39,"#584960");pixel(231,84,21,31,"#78849d");
   textPixel(info.quarters.toUpperCase(),240,22,metal,12,"center");
   pixel(212,267,56,33,"#160d18");pixel(220,269,40,28,wood);textPixel("SALÓN",240,291,"#f0d1b4",9,"center");
  }
  const items=C.residenceObjects[room]||[];
  for(const item of items){
   const seen=game.observed[item.id];
   pixel(item.x-4,item.y-35,8,8,seen?"#829b7b":"#e3bd75");
   textPixel(seen?"✓":"?",item.x,item.y-28,"#171420",8,"center");
  }
  portrait(game.x,game.y,"player",game.embraced?"#9c505e":"#9a9b83");
  pixel(0,0,480,3,metal);
 }
 function drawVenue(){
  if(G){
    const npc=N.byLocation[game.venue];
    G.drawVenue(g,game.venue,N,game,visualTime);
    if(npc&&npcIsPresent(npc.id))portrait(240,104,"master",npc.color);
    else {pixel(216,96,48,25,"#332b36");textPixel("AUSENTE",240,90,"#d0a2a0",9,"center");}
    portrait(game.x,game.y,"player",game.embraced?"#a65164":"#8fa2a0");
    return;
  }
  const location=D.locations.find(l=>l.id===game.venue);
  const npc=N.byLocation[game.venue],env=N.environments[game.venue];
  if(!location||!env){pixel(0,0,480,300,"#1a1820");return;}
  pixel(0,0,480,300,env.room);
  // Piso de piedra y reflejos de la iluminación nocturna.
  for(let y=42;y<300;y+=18)for(let x=16;x<461;x+=30){
    pixel(x,y,29,17,(x+y)%3===0?"#40353f":"#342d38");
    pixel(x+3,y+3,19,1,"#5d4a55");
  }
  pixel(0,0,480,40,env.room);pixel(0,38,480,5,env.accent);
  pixel(0,41,18,259,"#201823");pixel(462,41,18,259,"#201823");
  for(let x=25;x<460;x+=84){pixel(x,65,15,136,"#211a27");pixel(x+3,67,7,126,env.accent);}
  // Los salones tienen ventanas y vitrinas; los túneles, conductos.
  for(const x of [86,345]){
    pixel(x-34,69,68,80,"#584751");pixel(x-27,77,54,66,"#231f2c");
    pixel(x-20,82,40,53,game.venue==="tuneles"?"#283d3e":"#4d5367");
    pixel(x-2,82,4,53,"#9b857e");pixel(x-20,107,40,3,"#9b857e");
  }
  // Mesa del archivo, legajos y puntos de interacción.
  pixel(50,162,160,73,"#231c27");pixel(61,166,139,62,env.accent);
  pixel(72,172,116,49,"#53434c");
  for(let i=0;i<5;i++){pixel(80+i*20,179,15,28,"#b1a091");pixel(83+i*20,182,7,2,"#665866");}
  pixel(303,148,132,81,"#241d29");pixel(309,156,119,68,"#6a525b");
  pixel(317,165,100,48,"#342732");
  if(env.object==="barra"){
   for(let i=0;i<8;i++)pixel(323+i*11,162,5,26,i%2?"#d5ae84":"#89949c");
  }else if(env.object==="terminal"){
   pixel(340,169,58,35,"#171b26");pixel(346,175,46,22,"#4d7e70");pixel(355,185,27,3,"#a6be9c");
  }else if(env.object==="estatua"){
   pixel(349,166,35,45,"#d2bda8");pixel(338,201,58,10,"#a38f85");pixel(359,153,15,17,"#e3d0b8");
  }else if(env.object==="calle"){
   pixel(320,175,93,15,"#222831");pixel(350,149,7,29,"#a69d9c");pixel(343,140,20,9,"#e6bf81");
  }else{
   pixel(337,167,61,38,"#d1bca5");pixel(350,173,39,26,"#65505a");
  }
  textPixel("EXAMINAR",130,138,"#ebd7b1",9,"center");
  textPixel("OBSERVAR",366,132,"#dbc0b0",9,"center");
  // Sprite distinguible por el atuendo y la paleta del PNJ.
  if(npcIsPresent(npc.id)){
    portrait(240,104,"master",npc.color);
    pixel(238,93,5,3,npc.hair);pixel(235,90,11,4,npc.hair);
    pixel(236,101,3,2,npc.skin);pixel(243,101,3,2,npc.skin);
    if(["isabelle","guardiana","marcus"].includes(npc.id)){pixel(229,110,6,11,"#c9a885");pixel(246,110,6,11,"#c9a885");}
    textPixel(npc.name.toUpperCase(),240,66,"#f3dcb4",Math.min(9,480/(npc.name.length+12)),"center");
  }else{
    pixel(219,113,42,9,"#55404b");pixel(223,99,34,15,"#2c222f");
    textPixel("AUSENTE",240,67,"#d1a7a3",9,"center");
  }
  pixel(207,265,66,35,"#19141f");pixel(216,271,48,29,env.accent);
  textPixel("SALIR",240,286,"#f0d3b1",9,"center");
  portrait(game.x,game.y,"player",game.embraced?"#ac5f6c":"#889b98");
  textPixel(env.label.toUpperCase(),240,24,"#f1d7bd",12,"center");
 }
 function textPixel(t,x,y,color,size,align){g.font="bold "+(size||9)+"px monospace";g.fillStyle=color;g.textAlign=align||"left";g.fillText(t,x,y);}
 function drawParis(){
  if(G){
    G.drawCity(g,game,D,N,visualTime);
    portrait(game.x,game.y,"player",game.embraced?"#a65164":"#8fa2a0");
    return;
  }
  pixel(0,0,480,300,"#23232e");
  // Manzanas de París por la noche: techos inclinados, ventanas y chimeneas.
  for(let y=0;y<300;y+=38)for(let x=0;x<480;x+=53){
    const k=Math.floor((x*71+y*13)/19)%7;
    const c=["#353443","#41404c","#44373f","#4a3c48","#39323c","#423a49","#34343d"][(k+7)%7];
    pixel(x+1,y+3,47,31,"#1a1a26");
    pixel(x+4,y+5,40,25,c);
    pixel(x+7,y+7,34,4,"#5d5057");
    for(let w=0;w<4;w++){
      pixel(x+8+w*8,y+13,4,8,(w+k)%3===0?"#e9ba80":"#23222c");
      pixel(x+7+w*8,y+12,6,2,"#776671");
    }
    pixel(x+9,y+25,30,3,"#25212a");
    if((x+y)%4===0){pixel(x+14,y-3,9,9,"#57444b");pixel(x+16,y-5,5,2,"#211b24");}
  }
  // Avenidas con marcas viales y aceras.
  for(let y=70;y<300;y+=72){
    pixel(0,y,480,15,"#4e505a");pixel(0,y+1,480,2,"#8c8181");
    for(let x=0;x<480;x+=28)pixel(x+6,y+8,14,1,"#c5ad8b");
    pixel(0,y+13,480,1,"#7b6976");
  }
  for(let x=110;x<480;x+=118){
    pixel(x,0,19,300,"#4d5058");pixel(x,0,2,300,"#807a7f");
    for(let y=0;y<300;y+=37)pixel(x+9,y+7,2,17,"#c1a27d");
  }
  // Sena: reflejos sobre el agua y tres pasos elevados.
  for(let x=0;x<480;x+=10){
    const sy=157+Math.sin(x/80)*28;
    pixel(x,sy,11,25,"#303f53");pixel(x+2,sy+11,7,1,"#748fa5");
    pixel(x+3,sy+20,5,1,"#a7a18e");
  }
  for(const x of [104,228,350]){
    const sy=157+Math.sin(x/80)*28;
    pixel(x,sy-6,20,39,"#69636a");pixel(x+2,sy-4,16,35,"#8b8180");
    pixel(x+5,sy+3,10,2,"#baac93");
  }
  // Farolas, bancos y árboles de las avenidas.
  for(let x=22;x<480;x+=81)for(const y of [59,213]){
    pixel(x,y-18,2,23,"#b5a59a");pixel(x-3,y-21,8,5,"#e9c18b");
    pixel(x-7,y-23,17,2,"#725d53");pixel(x-10,y-26,24,15,"#e8c27a19");
    if((x+y)%3!==0){pixel(x+20,y-8,12,8,"#394b40");pixel(x+24,y-13,6,17,"#46614a");pixel(x+25,y+1,3,7,"#695349");}
  }
  // Los destinos forman pequeñas zonas de interés con puertas iluminadas.
  for(const l of D.locations){
   const x=Math.round(l.x/2.1),y=Math.round(l.y/2),w=Math.round(l.w/2.1),h=Math.round(l.h/2);
   const env=N.environments[l.id],quest=game.activeQuest&&questObj(game.activeQuest);
   const active=quest?.place===l.id || (game.activeQuest==="archivos"&&["policia","stjuly","hemeroteca"].includes(l.id)) || personalAtLocation(l.id).length>0;
   pixel(x-3,y-3,w+6,h+6,active?"#bea47a":"#181c27");
   pixel(x,y,w,h,env?.room||"#47404b");
   pixel(x+4,y+4,w-8,h-8,env?.accent||"#75616b");
   pixel(x+8,y+8,w-16,h-16,"#24232f");
   pixel(x+8,y+8,w-16,2,"#bf9b88");
   const title=l.name.length>18?l.name.split(" ").slice(0,2).join(" "):l.name;
   textPixel(title,x+w/2,y+h/2+3,"#f0dab4",7,"center");
   if(active){pixel(x+w/2-4,y-12,8,8,"#f0cf88");textPixel("!",x+w/2,y-5,"#2a2425",8,"center");}
   if(l.id==="elysee"&&!game.access.elysee){pixel(x+w-12,y+h-12,8,8,"#ab6276");}
  }
  // Residencia de origen: única zona segura marcada en el plano.
  pixel(4,241,83,56,"#191723");pixel(10,247,71,47,"#947c74");pixel(17,253,57,35,"#352b3a");
  pixel(23,256,46,3,"#be987a");textPixel("RESIDENCIA",45,271,"#f2d9ae",8,"center");
  pixel(0,0,480,3,"#c3a283");
  portrait(game.x,game.y,"player",game.embraced?"#a65164":"#8fa2a0");
 }
 function rainOverlay(){
  // Lluvia pixelada determinista que mantiene la animación sin bibliotecas externas.
  const phase=visualTime*32;
  for(let i=0;i<80;i++){
   const x=(i*73+Math.floor(phase*1.3))%480;
   const y=(i*47+Math.floor(phase*2.2))%300;
   pixel(x,y,1,4,i%5===0?"#afbbcd99":"#7a8a9c60");
  }
 }
 function drawWorld(){
  if(!game)return;
  if(["house","study","quarters"].includes(game.scene))drawHouse();else if(game.scene==="venue")drawVenue();else{drawParis();if(!G&&effectsEnabled)rainOverlay();}
  if(G&&effectsEnabled)G.effects(g,game.scene==="paris"?"paris":"interior",visualTime,game.scene==="venue"?game.venue:game.character.clan,game.scene);
  if(G&&effectsEnabled&&visualTime<embraceFxUntil)G.transformation(g,game.x,game.y,visualTime,embraceFxUntil-visualTime,game.character.clan);
  // decorative top/bottom pixel bars
  pixel(0,0,480,3,"#b69581");pixel(0,297,480,3,"#b69581");
  if(dialogOpen){pixel(0,0,480,300,"#15101b66");}
 }

 function nearInteractive(){
  if(!game)return "";
  const room=game.scene;
  if(["house","study","quarters"].includes(room)){
   if(room==="house"){
    if(Math.hypot(game.x-240,game.y-98)<62)return "E · Hablar con "+D.clans[game.character.clan].master;
    if(Math.hypot(game.x-240,game.y-269)<45)return "E · Salir a París";
    if(Math.hypot(game.x-44,game.y-233)<47)return "E · Entrar al despacho";
    if(Math.hypot(game.x-436,game.y-233)<47)return "E · Entrar a las habitaciones";
   }else if(Math.hypot(game.x-240,game.y-268)<48)return "E · Regresar al salón";
   for(const obj of C.residenceObjects[room])if(Math.hypot(game.x-obj.x,game.y-obj.y)<52)return "E · "+obj.title;
   return "";
  }
  if(room==="venue"){
   if(Math.hypot(game.x-240,game.y-270)<42)return "E · Regresar a las calles";
   if(Math.hypot(game.x-130,game.y-143)<55)return "E · "+(game.activeQuest&&questObj(game.activeQuest).place===game.venue?"Investigar el encargo":"Examinar archivos");
   if(Math.hypot(game.x-240,game.y-104)<60)return npcIsPresent(N.byLocation[game.venue].id)?"E · Hablar con "+N.byLocation[game.venue].name:"E · Consultar cuándo regresa "+N.byLocation[game.venue].name;
   if(Math.hypot(game.x-350,game.y-146)<55)return "E · Observar el entorno";
   return "";
  }
  if(Math.hypot(game.x-46,game.y-269)<42)return "E · Regresar a la residencia";
  for(const l of D.locations){
   const x=(l.x+l.w/2)/2.1,y=(l.y+l.h/2)/2;
   if(Math.hypot(game.x-x,game.y-y)<44)return "E · "+l.name;
  }
  return "";
 }
 function moveStep(dt){
  if(!game)return;
  if(!$("appearanceModal").classList.contains("hidden")){game.walking=false;return;}
  if(dialogOpen){game.walking=false;return;}
  let dx=0,dy=0;
  if(keys.has("w")||keys.has("arrowup")||touchMove==="up")dy--;
  if(keys.has("s")||keys.has("arrowdown")||touchMove==="down")dy++;
  if(keys.has("a")||keys.has("arrowleft")||touchMove==="left")dx--;
  if(keys.has("d")||keys.has("arrowright")||touchMove==="right")dx++;
  if((dx||dy)&&walkTarget){walkTarget=null;walkRoute=[];}
  if(!dx&&!dy&&walkTarget){
   const dd=Math.hypot(walkTarget.x-game.x,walkTarget.y-game.y);
   if(dd<5){
    walkTarget=walkRoute.shift()||null;
    if(walkTarget){dx=walkTarget.x-game.x;dy=walkTarget.y-game.y;}
   }else{dx=walkTarget.x-game.x;dy=walkTarget.y-game.y;}
  }
  const length=Math.hypot(dx,dy);
  game.walking=length>.01;
  if(length){
   if(Math.abs(dx)>Math.abs(dy))game.facing=dx<0?"left":"right";
   else game.facing=dy<0?"up":"down";
   const speed=76*dt;
   const mx=dx/length*Math.min(speed,length),my=dy/length*Math.min(speed,length);
   const pos=P?P.slide(game.scene,game.x,game.y,mx,my):{
     x:clamp(game.x+mx,["house","study","quarters","venue"].includes(game.scene)?22:11,["house","study","quarters","venue"].includes(game.scene)?458:470),
     y:clamp(game.y+my,["house","study","quarters","venue"].includes(game.scene)?48:13,["house","study","quarters","venue"].includes(game.scene)?280:290),
     moved:true};
   game.x=pos.x;game.y=pos.y;game.walking=pos.moved;
   if(pos.moved)game.walkCycle=(game.walkCycle||0)+dt*5.1;
   if(!pos.moved&&walkTarget){walkTarget=null;walkRoute=[];}
  }
  const near=nearInteractive();if(near)$("floatingHint").textContent=near;
  else $("floatingHint").textContent=["house","study","quarters"].includes(game.scene)?"WASD: mover · E: explorar la residencia":"WASD: mover · E: investigar / regresar";
 }
 function frame(time){
  const dt=Math.min(.045,(time-lastTime)/1000||0);lastTime=time;
  visualTime+=dt;moveStep(dt);drawWorld();
  if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)$("notice").classList.add("hidden");}
  window.requestAnimationFrame(frame);
 }
 function sheetModal(){
  const c=game.character,sections=[["Atributos",c.attr],["Habilidades",c.skills],["Trasfondos",c.backgrounds],["Virtudes",c.virtues],["Disciplinas",c.disciplines]];
  const root=$("sheetDetail");root.innerHTML="";
  const header=document.createElement("p");header.textContent=c.name+" · "+c.concept+" · "+c.nature+" / "+c.demeanor+" · "+(game.embraced?"Vástago":"Ghoul")+" del clan "+c.clan;root.appendChild(header);
  const grid=document.createElement("div");grid.className="sheet-detail-grid";root.appendChild(grid);
  for(const [title,entries] of sections){
   const section=document.createElement("section");const h=document.createElement("h4");h.textContent=title;section.appendChild(h);
   const raw=Object.entries(entries);if(!raw.length){const p=document.createElement("p");p.textContent="Todavía no adquiridas.";section.appendChild(p);}
   for(const [k,v] of raw){const p=document.createElement("p");p.textContent=k+" · "+"●".repeat(v)+"○".repeat(Math.max(0,5-v));section.appendChild(p);}
   grid.appendChild(section);
  }
  $("sheetModal").classList.remove("hidden");
 }
 function journalModal(){
  const root=$("journalDetail");root.innerHTML="";
  const p=document.createElement("p");p.textContent="Domitor: "+D.clans[game.character.clan].master+" · Aprecio: "+game.appreciation+"/100 · Encargos completados: "+game.questIndex+" · Estado: "+(game.embraced?"Vástago":"Ghoul");root.appendChild(p);
  if(game.activeQuest){const q=questObj(game.activeQuest),r=document.createElement("p");r.textContent="Misión actual: "+q.title+" — "+q.summary+(game.readyReport?" / Regresá a informar.":"");root.appendChild(r);}
  if(game.activeQuest==="archivos"||game.arc.outcome){
   const p=document.createElement("p");p.textContent="Caso Dupont: "+game.arc.clues.length+" fuentes investigadas · "+game.arc.clues.map(k=>C.investigation.sources[k]?.name||k).join(", ")+". "+(game.arc.outcome?"Resolución: "+game.arc.outcome.approach+".":"Visitá dos fuentes y hablá con Dupont en la hemeroteca.");
   root.appendChild(p);
  }
  const rep=document.createElement("p");rep.textContent="Exposición de la Mascarada: "+game.exposure+"/100 · Relación con Dupont: "+game.relations.dupont+" (−5 a +5) · Objetos examinados en la residencia: "+Object.keys(game.observed).filter(k=>game.observed[k]).length;root.appendChild(rep);
  const f=document.createElement("p");f.textContent="Reputación política: "+Object.keys(A.factions).map(id=>A.factions[id].name+" "+(game.factions[id]>0?"+":"")+(game.factions[id]||0)).join(" · ")+". Noche "+game.clock.night+", "+formatClock()+".";root.appendChild(f);
  for(const quest of Object.values(game.sideQuests)){
    const arc=A.personal[quest.id];if(!arc)continue;
    const row=document.createElement("p");row.textContent="Encargo personal · "+arc.title+": "+(quest.status==="done"?"Finalizado":quest.status==="ready"?"Volvé con "+N.byLocation[arc.origin].name:arc.objective)+".";
    root.appendChild(row);
  }
  const contacts=document.createElement("p");
  contacts.textContent="Contactos conocidos ("+game.knownNpcs.length+"/8): "+(game.knownNpcs.map(id=>Object.values(N.byLocation).find(n=>n.id===id)).filter(Boolean).map(n=>n.name+" ["+(game.npcRelations[n.id]||0)+"]").join("; ")||"Ninguno");
  root.appendChild(contacts);
  const favours=Object.entries(game.access).filter(([k,v])=>v).map(([k])=>favorDescription(k));
  const favors=document.createElement("p");favors.textContent="Referencias y favores: "+(favours.join("; ")||"Ninguno");root.appendChild(favors);
  game.history.forEach(entry=>{const r=document.createElement("p");r.textContent="• "+entry;root.appendChild(r);});
  $("journalModal").classList.remove("hidden");
 }
 function setup(){
  $("startNew").addEventListener("click",()=>{creator=freshDraft();step=0;renderCreator();});
  $("continueGame").addEventListener("click",()=>{const persisted=load();if(persisted){game=persisted;enterGame();if(game.embraced&&Object.values(game.character.disciplines||{}).reduce((a,b)=>a+b,0)<3)disciplineCeremony();}else notice("No hay partida guardada.");});
  $("previousStep").addEventListener("click",()=>{if(step>0){step--;renderCreator();}});
  $("nextStep").addEventListener("click",()=>{if(validation(step))return;if(step===5)startStory();else{step++;renderCreator();}});
  $("dialogClose").addEventListener("click",closeDialog);
  $("characterBtn").addEventListener("click",sheetModal);
  $("appearanceBtn").addEventListener("click",openAppearance);
  $("appearanceCancel").addEventListener("click",closeAppearance);
  $("appearanceApply").addEventListener("click",()=>{
    if(!game||!pendingLook)return;
    game.character.appearance=V.normalize(pendingLook.appearance);
    save();closeAppearance();notice("Apariencia guardada.");
  });
  $("sheetClose").addEventListener("click",()=>$("sheetModal").classList.add("hidden"));
  $("journalBtn").addEventListener("click",journalModal);
  $("journalClose").addEventListener("click",()=>$("journalModal").classList.add("hidden"));
  $("manualSaveBtn").addEventListener("click",()=>{save();notice("Partida guardada.");});
  $("visualEffectsBtn").addEventListener("click",()=>{
    effectsEnabled=!effectsEnabled;
    try{localStorage.setItem("cronicas-paris-visual-fx",effectsEnabled?"1":"0");}catch(e){}
    updateFxButton();
    notice(effectsEnabled?"Efectos ambientales activados.":"Efectos ambientales desactivados.");
  });
  updateFxButton();
  $("titleBtn").addEventListener("click",()=>{save();show("welcome");$("continueGame").disabled=!load();});
  $("touchUse").addEventListener("click",interact);
  for(const b of document.querySelectorAll("[data-move]")){
   const dir=b.dataset.move;b.addEventListener("pointerdown",e=>{e.preventDefault();touchMove=dir;b.setPointerCapture?.(e.pointerId);});
   ["pointerup","pointercancel","lostpointercapture"].forEach(evt=>b.addEventListener(evt,()=>{if(touchMove===dir)touchMove=null;}));
  }
  window.addEventListener("keydown",e=>{
   const k=e.key.toLowerCase();if(["arrowup","arrowdown","arrowleft","arrowright"," "].includes(k))e.preventDefault();
   if(e.target?.tagName==="INPUT"||e.target?.tagName==="SELECT")return;
   if(!$("appearanceModal").classList.contains("hidden")&&k!=="escape")return;
   keys.add(k);if(e.repeat||!game||$("play").classList.contains("hidden"))return;
   if(k==="e"||k===" ")interact();
   if(k==="escape"){if(!$("dialog").classList.contains("hidden"))closeDialog();$("sheetModal").classList.add("hidden");$("journalModal").classList.add("hidden");closeAppearance();}
  });
  window.addEventListener("keyup",e=>keys.delete(e.key.toLowerCase()));
  window.addEventListener("blur",()=>{keys.clear();touchMove=null;if(game)save();});
  document.addEventListener("visibilitychange",()=>{if(document.hidden&&game)save();});
  canvas.addEventListener("pointerdown",e=>{
   if(!game||dialogOpen||!$("appearanceModal").classList.contains("hidden"))return;
   const r=canvas.getBoundingClientRect();
   const x=(e.clientX-r.left)/r.width*480,y=(e.clientY-r.top)/r.height*300;
   if(P){
      const route=P.path(game.scene,{x:game.x,y:game.y},{x,y});
      walkTarget=route.shift()||null;walkRoute=route;
   }else{
      walkTarget={x:clamp(x,12,469),y:clamp(y,25,285)};walkRoute=[];
   }
  });
  $("continueGame").disabled=!load();window.requestAnimationFrame(frame);
 }
 setup();
})();