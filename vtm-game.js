"use strict";
(() => {
 const D=window.VTM_DATA, C=window.VTM_CONTENT, SAVE_KEY="cronicas-paris-ghoul-v1", $=id=>document.getElementById(id);
 const groupsA=Object.keys(D.attributes),groupsH=Object.keys(D.abilities),CLANS=Object.keys(D.clans);
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const sum=o=>Object.values(o).reduce((a,b)=>a+b,0);
 const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 let creator=null,step=0,game=null,keys=new Set(),lastTime=0,walkTarget=null,toastTimer=0;
 let dialogOpen=false,touchMove=null,canvas=$("world"),g=canvas.getContext("2d",{alpha:false});
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
    free:{attrs:{},skills:{},backgrounds:{},virtues:{},humanity:0,will:0},freeCategory:"Atributo",freeTrait:"Fuerza"};
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
  const lines=[["Nombre",creator.name||"Sin nombre"],["Concepto",creator.concept],["Naturaleza",creator.nature],["Conducta",creator.demeanor],["Estado inicial","Ghoul humano"],["Clan del maestro",creator.clan],["Domitor",D.clans[creator.clan].master],["Humanidad",humanity()],["Fuerza de Voluntad",will()],["Disciplinas","Ninguna"],["Puntos gratuitos",freeSpent()+" / 15"]];
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
  game.observed=game.observed||{};
  game.arc=game.arc||{clues:[],outcome:null,visited:[]};
  game.arc.clues=Array.isArray(game.arc.clues)?game.arc.clues:[];
  game.arc.visited=Array.isArray(game.arc.visited)?game.arc.visited:[];
  game.relations=game.relations||{dupont:0};
  game.exposure=Number.isFinite(game.exposure)?clamp(game.exposure,0,100):0;
  game.cityPos=game.cityPos||{x:46,y:267};
  game.venue=game.venue||null;
 }
 function enterGame(){
  expandSave();
  show("play");keys.clear();walkTarget=null;closeDialog();
  const c=game.character,m=D.clans[c.clan];
  $("masterLabel").textContent=m.master;$("masterRole").textContent=m.title;
  $("playName").textContent=c.name;$("playClan").textContent=c.clan;
  $("playHumanity").textContent=c.humanity;$("playWill").textContent=c.willpower;
  $("playState").textContent=game.embraced?"Vástago":"Ghoul";
  $("history").innerHTML="";game.history.slice(0,5).forEach(x=>{const p=document.createElement("p");p.textContent="• "+x;$("history").appendChild(p);});
  hud();save();
 }
 function startStory(){
  game={version:1,character:buildCharacter(),scene:"house",x:240,y:220,appreciation:0,
   activeQuest:null,readyReport:null,questIndex:0,history:[],embraced:false,hasSpoken:false,disciplineSpent:0,
   observed:{},arc:{clues:[],outcome:null,visited:[]},relations:{dupont:0},exposure:0,cityPos:{x:46,y:267},venue:null};
  log("Tu primera noche como sirviente de "+D.clans[game.character.clan].master+".");
  enterGame();notice("Acercate a tu Domitor y presioná E para hablar.");
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
  $("leadsStatus").textContent=game.activeQuest==="archivos"?"Pruebas: "+game.arc.clues.length+"/2 como mínimo. "+(game.readyReport?"Informá al Domitor.":"Investigá tres fuentes en París."):"Los sucesos nocturnos se ocultan entre rumores y silencios.";
 }
 function questObj(id){return D.quests.find(q=>q.id===id);}
 function askMenu(title,text,choices,label="CONVERSACIÓN"){
  dialogOpen=true;$("dialog").classList.remove("hidden");$("dialogEyebrow").textContent=label;$("dialogTitle").textContent=title;$("dialogText").textContent=text;
  const target=$("dialogOptions");target.innerHTML="";
  for(const choice of choices){
   const b=document.createElement("button");b.textContent=choice.label;
   if(choice.disabled)b.disabled=true;
   b.addEventListener("click",()=>{closeDialog();choice.action?.();});
   target.appendChild(b);
  }
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
  choices.push({label:"Preguntar por la corte de París",action:()=>askMenu("El Principado de París","Pierre Duvalier rige el Principado. Lord Thomas Wyndham ejerce como Sheriff. La Senescal Etienne Moreau coordina numerosos asuntos de la corte. Tu deber es respetar la Mascarada y obedecer sin atraer miradas.",[{label:"Comprendo.",action:()=>{addAppreciation(1,"Escuchaste atentamente los consejos.");}}],"LA CAMARILLA")});
  choices.push({label:"Responder de forma desafiante",action:()=>{addAppreciation(-4,"Una insolencia delante del maestro.");askMenu(name,"La confianza se gana. Tus palabras, por ahora, te alejan de ella.",[{label:"Retirarme.",action:()=>{}}],"REPRIMENDA");}});
  askMenu(name,clan.opening,choices,"TU DOMITOR · "+game.character.clan.toUpperCase());
 }
 function requestQuest(){
  const choices=D.quests.filter(q=>q.id!=="archivos"||!game.arc.outcome);
  const q=choices[game.questIndex%choices.length];
  askMenu("Un encargo para "+game.character.name,
   q.summary+" Deberás desplazarte hasta "+D.locations.find(l=>l.id===q.place).name+". Tu forma de actuar determinará cuánto confiaré en vos.",
   [{label:"Aceptar con respeto (+2 aprecio)",action:()=>{game.activeQuest=q.id;game.readyReport=null;addAppreciation(2,"Aceptaste el encargo con cortesía.");notice("Salí de la residencia y buscá "+q.title+".");}},
    {label:"Aceptar con arrogancia (−3 aprecio)",action:()=>{game.activeQuest=q.id;game.readyReport=null;addAppreciation(-3,"Tu arrogancia incomodó al Domitor.");}},
    {label:"Todavía no estoy listo",action:()=>{}}],"MISIÓN · "+q.kind.toUpperCase());
 }
 function dicePool(attribute,skill,difficulty){
  const c=game.character;const count=Math.max(1,c.attr[attribute]+(c.skills[skill]||0));
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
  if(!game.activeQuest){
   askMenu(location.name,location.detail+" No tenés un encargo activo para este lugar.",[{label:"Regresar a las calles",action:()=>{}}],"PARÍS");return;
  }
  const q=questObj(game.activeQuest);
  if(q.id==="archivos"&&!game.readyReport&&["hemeroteca","policia","stjuly"].includes(location.id)){
    enterVenue(location);return;
  }
  if(q.place!==location.id){
   askMenu(location.name,location.detail+" Tu misión actual está vinculada con "+D.locations.find(x=>x.id===q.place).name+".",[{label:"Continuar explorando",action:()=>{}}],"UN LUGAR DE PARÍS");
   return;
  }
  if(game.readyReport){notice("Ya cumpliste esta parte: volvé con tu Domitor.");return;}
  askMenu(q.title,location.detail+"\n\n"+q.summary,
   [{label:"Actuar con "+q.attr+" + "+q.skill+" (dificultad "+q.difficulty+")",action:()=>questAction(q,false)},
    {label:"Intentar un abordaje sigiloso con Astucia + Sigilo (dificultad "+(q.difficulty+1)+", mayor aprecio)",action:()=>questAction(q,true)},
    {label:"Abandonar el lugar sin intervenir",action:()=>{log("Te retiraste sin actuar.");}}],"MISIÓN · "+q.kind.toUpperCase());
 }

 function exposure(delta,reason){
  game.exposure=clamp(game.exposure+delta,0,100);
  if(delta)log((delta>0?"+":"")+delta+" exposición · "+reason);
  if(game.exposure>=60)notice("Tu actividad está atrayendo miradas peligrosas.");
  hud();save();
 }
 function rememberClue(location,success,description,roll){
  const arc=game.arc;
  if(!arc.clues.includes(location.id))arc.clues.push(location.id);
  if(!success)exposure(9,"Tu investigación dejó un rastro.");
  log("Pista: "+C.investigation.sources[location.id].name+". "+description);
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
   game.venue=location.id;game.cityPos={x:game.x,y:game.y};game.scene="venue";game.x=240;game.y=237;
   if(!game.arc.visited.includes(location.id))game.arc.visited.push(location.id);
   log("Visitaste "+location.name+".");hud();save();
 }
 function venueInteract(){
  const src=C.investigation.sources[game.venue],exit=Math.hypot(game.x-240,game.y-270);
  if(exit<42){
   game.scene="paris";game.x=game.cityPos.x;game.y=game.cityPos.y;game.venue=null;hud();save();return;
  }
  if(Math.hypot(game.x-130,game.y-143)<55){researchLead({id:game.venue});return;}
  if(Math.hypot(game.x-240,game.y-104)<60){
   if(game.venue==="hemeroteca"&&game.arc.clues.length>=2&&!game.readyReport)confrontDupont();
   else askMenu(game.venue==="hemeroteca"?"Pierre Dupont":game.venue==="policia"?"Empleado del archivo":"Camarero del St. July",
      game.venue==="hemeroteca"?"El periodista no comparte sus documentos con desconocidos. Reuní por lo menos dos pruebas.":src.hint,
      [{label:"Continuar investigando",action:()=>{}}],"PERSONAJE");
   return;
  }
  if(Math.hypot(game.x-350,game.y-146)<55){
   askMenu("Un detalle del lugar",src.hint+" Parece que alguien estuvo aquí hace poco.",
     [{label:"Examinar el entorno",action:()=>{}}],"OBSERVACIÓN");return;
  }
  notice("Examiná el archivo a la izquierda, hablá con la persona o regresá por la salida.");
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
    game.embraced=true;game.character.disciplines={};game.character.status="Vástago";
    log("Recibiste el Abrazo. Ya pertenecés al clan "+game.character.clan+".");
    save();hud();disciplineCeremony();
   }},
   {label:"Rechazo por ahora. Conservaré mi condición de ghoul",action:()=>{log("Pospusiste el Abrazo. Tu Domitor sigue aguardando tu decisión.");save();}}],"CEREMONIA DEL ABRAZO");
 }
 function disciplineCeremony(){
  const available=D.clans[game.character.clan].disciplines,disc=game.character.disciplines;
  const spent=()=>Object.values(disc).reduce((a,b)=>a+b,0);
  const make=()=>{
   askMenu("Primeros dones de la sangre","Asigná los 3 círculos iniciales entre las Disciplinas de tu clan. Se encuentran disponibles: "+available.join(", ")+". Puntos asignados: "+spent()+"/3.",
    available.map(name=>({label:name+": "+(disc[name]||0)+" círculos · añadir uno",disabled:spent()>=3||(disc[name]||0)>=3,action:()=>{disc[name]=(disc[name]||0)+1;save();make();}})).concat([
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
  game.scene=name;game.x=240;game.y=name==="house"?222:238;walkTarget=null;hud();save();
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
  pixel(x-9,y+5,18,19,type==="master"?"#181722":"#50565c");pixel(x-13,y+10,5,12,type==="master"?"#272431":"#4b5457");
  pixel(x+8,y+10,5,12,type==="master"?"#28232b":"#4f5458");
  pixel(x-5,y-10,10,12,type==="master"?"#c9b6a8":"#c1a389");
  pixel(x-6,y-15,12,6,type==="master"?"#18181f":"#2a252b");
  pixel(x-6,y+8,12,9,accent);
  pixel(x-3,y-7,2,2,"#161016");pixel(x+3,y-7,2,2,"#161016");
  if(type==="master"){pixel(x-14,y+19,28,4,"#15121b");pixel(x-7,y+23,6,3,"#14131a");pixel(x+2,y+23,6,3,"#14131a");}
  else{pixel(x-7,y+22,6,5,"#222128");pixel(x+2,y+22,6,5,"#222128");}
 }
 function drawHouse(){
  tileBackground("#302630");
  pixel(0,0,480,38,"#1b1620");pixel(10,20,460,5,"#6a5059");
  for(let x=18;x<470;x+=64){pixel(x,0,8,260,"#271e29");pixel(x+3,20,2,224,"#533e49");}
  pixel(63,40,90,76,"#493641");pixel(67,45,82,68,"#a18b70");pixel(72,48,72,62,"#423844");
  pixel(328,40,90,76,"#493641");pixel(332,45,82,68,"#a18b70");pixel(338,48,70,62,"#423844");
  pixel(158,0,164,31,"#2c2029");pixel(203,9,74,18,"#866b70");
  pixel(179,144,122,55,"#463542");pixel(186,148,108,7,"#a88c78");pixel(190,156,100,32,"#513a45");
  pixel(187,190,108,10,"#2a202a");
  pixel(38,150,85,51,"#463743");pixel(45,154,68,9,"#8a6e63");pixel(48,164,62,31,"#5c4149");
  pixel(350,150,82,53,"#47343c");pixel(355,155,73,39,"#69434d");pixel(360,161,65,8,"#956d65");
  pixel(165,194,151,80,"#68434f");pixel(172,199,136,70,"#4e323b");pixel(181,205,117,57,"#76545b");
  for(let x=183;x<302;x+=13)for(let y=208;y<260;y+=11){pixel(x,y,5,5,"#51323d");}
  pixel(213,270,54,30,"#1c1b21");pixel(218,271,44,12,"#b98c72");pixel(228,279,24,18,"#3c2d36");
  pixel(231,285,18,8,"#17131a");
  portrait(240,96,"master",D.clans[game.character.clan].accent);
  portrait(game.x,game.y,"player",game.embraced?"#9c505e":"#8a8a74");
  textPixel("DOMITOR",240,61,"#e5bca4",10,"center");
  textPixel("PUERTA",240,266,"#e4c29d",9,"center");
 }
 function textPixel(t,x,y,color,size,align){g.font="bold "+(size||9)+"px monospace";g.fillStyle=color;g.textAlign=align||"left";g.fillText(t,x,y);}
 function drawParis(){
  pixel(0,0,480,300,"#242631");
  // Tres barrios separados por avenidas y el Sena.
  for(let y=0;y<300;y+=38)for(let x=0;x<480;x+=53){
    const k=(x*71+y*13)%7;
    pixel(x+2,y+4,43,28,["#3d3842","#403741","#46383e","#474043","#39353d","#4b3d44","#434049"][k]);
    pixel(x+5,y+5,38,4,"#60535b");
    for(let w=0;w<4;w++)pixel(x+7+w*8,y+12,4,6,(w+k)%2===0?"#b29377":"#1c1c23");
    pixel(x+7,y+25,32,3,"#2c2530");
  }
  for(let y=70;y<300;y+=72){pixel(0,y,480,13,"#57545a");for(let x=0;x<480;x+=25)pixel(x+5,y+6,12,1,"#c6ae93");}
  for(let x=110;x<480;x+=118){pixel(x,0,17,300,"#56525c");for(let y=0;y<300;y+=32)pixel(x+7,y+5,2,16,"#a8947a");}
  // Sena y puentes
  for(let x=0;x<480;x+=10){const sy=157+Math.sin(x/80)*28;pixel(x,sy,11,23,"#303f52");pixel(x+2,sy+12,6,1,"#617384");}
  for(const l of D.locations){
   const x=Math.round(l.x/2.1),y=Math.round(l.y/2),w=Math.round(l.w/2.1),h=Math.round(l.h/2);
   pixel(x,y,w,h,"#2a222e");pixel(x+3,y+3,w-6,h-6,"#65505a");
   pixel(x+7,y+7,w-14,h-14,"#31252f");
   pixel(x+5,y+5,w-10,2,game.activeQuest&&questObj(game.activeQuest).place===l.id?"#ead3aa":"#ad8b84");
   const words=l.name.split(" ");const label=words.length>2?words.slice(0,2).join(" "):l.name;
   textPixel(label,x+w/2,y+h/2,"#e9d0ae",7,"center");
   if(game.activeQuest&&questObj(game.activeQuest).place===l.id){pixel(x+w/2-3,y+h/2-20,6,6,"#ead5a0");}
  }
  pixel(5,243,79,54,"#2a222c");pixel(12,250,66,43,"#57454e");pixel(20,256,50,30,"#342631");textPixel("CASA",43,270,"#f0d4b9",9,"center");
  portrait(game.x,game.y,"player",game.embraced?"#a65164":"#8fa2a0");
 }
 function drawWorld(){
  if(!game)return;
  if(game.scene==="house")drawHouse();else drawParis();
  // decorative top/bottom pixel bars
  pixel(0,0,480,3,"#b69581");pixel(0,297,480,3,"#b69581");
  if(dialogOpen){pixel(0,0,480,300,"#15101b66");}
 }
 function nearInteractive(){
  if(!game)return "";
  if(game.scene==="house"){
   if(Math.hypot(game.x-240,game.y-96)<62)return "E · Hablar con "+D.clans[game.character.clan].master;
   if(Math.hypot(game.x-240,game.y-274)<46)return "E · Salir a las calles de París";
   return "";
  }
  if(Math.hypot(game.x-46,game.y-269)<42)return "E · Regresar a la casa";
  for(const l of D.locations){
   const x=(l.x+l.w/2)/2.1,y=(l.y+l.h/2)/2;
   if(Math.hypot(game.x-x,game.y-y)<44)return "E · "+l.name;
  }
  return "";
 }
 function moveStep(dt){
  if(!game||dialogOpen)return;
  let dx=0,dy=0;
  if(keys.has("w")||keys.has("arrowup")||touchMove==="up")dy--;
  if(keys.has("s")||keys.has("arrowdown")||touchMove==="down")dy++;
  if(keys.has("a")||keys.has("arrowleft")||touchMove==="left")dx--;
  if(keys.has("d")||keys.has("arrowright")||touchMove==="right")dx++;
  if((dx||dy)&&walkTarget)walkTarget=null;
  if(!dx&&!dy&&walkTarget){
   const dd=Math.hypot(walkTarget.x-game.x,walkTarget.y-game.y);
   if(dd<4)walkTarget=null;
   else{dx=walkTarget.x-game.x;dy=walkTarget.y-game.y;}
  }
  const length=Math.hypot(dx,dy);
  if(length){
   const speed=76*dt;
   game.x=clamp(game.x+dx/length*speed,game.scene==="house"?22:11,game.scene==="house"?458:470);
   game.y=clamp(game.y+dy/length*speed,game.scene==="house"?48:13,game.scene==="house"?280:290);
  }
  const near=nearInteractive();if(near)$("floatingHint").textContent=near;
  else $("floatingHint").textContent=game.scene==="house"?"WASD: mover · E: hablar / salir":"WASD: mover · E: investigar / regresar";
 }
 function frame(time){
  const dt=Math.min(.045,(time-lastTime)/1000||0);lastTime=time;
  moveStep(dt);drawWorld();
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
  $("sheetClose").addEventListener("click",()=>$("sheetModal").classList.add("hidden"));
  $("journalBtn").addEventListener("click",journalModal);
  $("journalClose").addEventListener("click",()=>$("journalModal").classList.add("hidden"));
  $("manualSaveBtn").addEventListener("click",()=>{save();notice("Partida guardada.");});
  $("titleBtn").addEventListener("click",()=>{save();show("welcome");$("continueGame").disabled=!load();});
  $("touchUse").addEventListener("click",interact);
  for(const b of document.querySelectorAll("[data-move]")){
   const dir=b.dataset.move;b.addEventListener("pointerdown",e=>{e.preventDefault();touchMove=dir;b.setPointerCapture?.(e.pointerId);});
   ["pointerup","pointercancel","lostpointercapture"].forEach(evt=>b.addEventListener(evt,()=>{if(touchMove===dir)touchMove=null;}));
  }
  window.addEventListener("keydown",e=>{
   const k=e.key.toLowerCase();if(["arrowup","arrowdown","arrowleft","arrowright"," "].includes(k))e.preventDefault();
   if(e.target?.tagName==="INPUT"||e.target?.tagName==="SELECT")return;
   keys.add(k);if(e.repeat||!game||$("play").classList.contains("hidden"))return;
   if(k==="e"||k===" ")interact();
   if(k==="escape"){if(!$("dialog").classList.contains("hidden"))closeDialog();$("sheetModal").classList.add("hidden");$("journalModal").classList.add("hidden");}
  });
  window.addEventListener("keyup",e=>keys.delete(e.key.toLowerCase()));
  window.addEventListener("blur",()=>{keys.clear();touchMove=null;if(game)save();});
  document.addEventListener("visibilitychange",()=>{if(document.hidden&&game)save();});
  canvas.addEventListener("pointerdown",e=>{
   if(!game||dialogOpen)return;
   const r=canvas.getBoundingClientRect();
   const x=(e.clientX-r.left)/r.width*480,y=(e.clientY-r.top)/r.height*300;
   walkTarget={x:clamp(x,12,469),y:clamp(y,25,285)};
  });
  $("continueGame").disabled=!load();window.requestAnimationFrame(frame);
 }
 setup();
})();