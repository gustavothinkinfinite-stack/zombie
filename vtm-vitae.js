"use strict";
/* CRÓNICAS DE PARÍS · Fase XX: vitae, Bestia y debilidades del clan.
 * Inspiración en Vampiro: La Mascarada, tercera edición. Reglas abreviadas
 * originales para este videojuego: NO son reproducción literal del manual.
 * No genera una historia oculta ni revela el secreto del Senescal.
 */
window.VTM_VITAE=(()=>{
 const CLANS=["Brujah","Gangrel","Malkavian","Nosferatu","Toreador","Tremere","Ventrue"];
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const CHOICES=[
  {id:"stjuly",label:"Ambientes sociales nocturnos",places:["stjuly"],detail:"Acostumbrado a alimentarte en ambientes sociales nocturnos."},
  {id:"elysee",label:"Círculos selectos y reuniones privadas",places:["elysee"],detail:"Sólo podés beber de presas vinculadas con círculos sociales muy definidos."},
  {id:"bastilla",label:"Vida nocturna de Bastilla",places:["bastilla"],detail:"Tu paladar reconoce un tipo de presa que encontrás en Bastilla."},
  {id:"passy",label:"Reuniones discretas de Passy",places:["passy"],detail:"Sólo tolerás sangre de personas de un ambiente muy particular."}
 ];
 const CANON={
  Brujah:"La Bestia responde con más facilidad a las provocaciones. La dificultad de las pruebas de Frenesí aumenta.",
  Gangrel:"La pérdida de control deja cambios físicos bestiales duraderos. Cuanto más se acumulan, más difícil es disimular la apariencia.",
  Malkavian:"La percepción queda atravesada por una inquietud persistente; momentos de presión alteran la concentración.",
  Nosferatu:"La apariencia inhumana dificulta los encuentros sociales directos, pero la experiencia de ocultarse favorece el sigilo.",
  Toreador:"El personaje puede perderse contemplando algo hermoso cuando una situación exige reaccionar.",
  Tremere:"Los rituales exigen disciplina y responsabilidades ante la estructura del clan; la magia evidente genera vigilancia.",
  Ventrue:"La sangre aceptable es muy específica: no todas las presas sirven para alimentarse."
 };
 let bridge=null;
 function bind(api){bridge=api;}
 function init(g){
  if(!g||!g.clock||!g.character)return null;
  let s=g.vitae;
  if(!s||typeof s!=="object"||Array.isArray(s))s=g.vitae={};
  s.lastNight=Math.max(1,Math.floor(Number(s.lastNight)||g.clock.night));
  s.frenzy=s.frenzy&&typeof s.frenzy==="object"&&!Array.isArray(s.frenzy)?s.frenzy:{active:false,untilNight:0};
  s.frenzy.active=!!s.frenzy.active;
  s.frenzy.untilNight=Math.max(0,Math.floor(Number(s.frenzy.untilNight)||0));
  s.terror=s.terror&&typeof s.terror==="object"&&!Array.isArray(s.terror)?s.terror:{active:false};
  s.terror.active=!!s.terror.active;
  s.terror.untilNight=Math.max(0,Math.floor(Number(s.terror.untilNight)||0));
  s.clan=CLANS.includes(g.character.clan)?g.character.clan:"Toreador";
  s.marks=clamp(Math.floor(Number(s.marks)||0),0,6);
  s.strain=clamp(Math.floor(Number(s.strain)||0),0,3);
  s.ritualWatch=clamp(Math.floor(Number(s.ritualWatch)||0),0,6);
  s.entrancedNight=Math.max(0,Math.floor(Number(s.entrancedNight)||0));
  s.omensNight=Math.max(0,Math.floor(Number(s.omensNight)||0));
  s.attempts=s.attempts&&typeof s.attempts==="object"&&!Array.isArray(s.attempts)?s.attempts:{};
  s.history=Array.isArray(s.history)?s.history.filter(x=>typeof x==="string").slice(-32):[];
  s.taste=CHOICES.some(x=>x.id===s.taste)?s.taste:
    CHOICES[clamp((Number(g.character.backgrounds?.Recursos)||0)-1,0,CHOICES.length-1)].id;
  return s;
 }
 const m=g=>g.mechanics||{};
 const record=(g,msg)=>{
  const s=init(g);
  s.history.unshift("Noche "+g.clock.night+": "+msg);
  s.history=s.history.slice(0,32);
  bridge?.log?.(msg);
 };
 function nightly(g){
  const s=init(g);if(!s)return[];
  const notes=[],elapsed=clamp(g.clock.night-s.lastNight,0,30);
  if(!elapsed)return notes;
  if(g.embraced){
   const before=m(g).blood||0;
   m(g).blood=clamp(before-elapsed,0,10);
   const consumed=before-m(g).blood;
   if(consumed>0){notes.push("El despertar consumió "+consumed+" punto(s) de vitae.");}
   if(m(g).blood<=2){notes.push("La escasez de Sangre intensifica la presión de la Bestia.");}
   s.strain=Math.max(0,s.strain-1);
   if(s.frenzy.untilNight<g.clock.night)s.frenzy.active=false;
   if(s.terror.untilNight<g.clock.night)s.terror.active=false;
  }
  s.lastNight=g.clock.night;
  for(const note of notes)record(g,note);
  return notes;
 }
 function rollVirtue(g,which,difficulty,rng=Math.random){
  const dice=Math.max(1,Math.min(5,Number(g.character.virtues?.[which])||1));
  const results=Array.from({length:dice},()=>Math.floor(rng()*10)+1);
  const hits=results.filter(x=>x>=difficulty).length,ones=results.filter(x=>x===1).length;
  return {dice:results,net:Math.max(0,hits-ones),success:hits>ones,difficulty,virtue:which};
 }
 function frenzy(g,reason="provocación",rng=Math.random){
  if(!g?.embraced)return null;
  const s=init(g),key=g.clock.night+":frenzy:"+String(reason).slice(0,30);
  if(s.attempts[key])return null;
  s.attempts[key]=true;
  const difficulty=clamp((m(g).blood<=2?8:6)+(s.clan==="Brujah"?2:0),4,10);
  const roll=rollVirtue(g,"Autocontrol",difficulty,rng);
  if(!roll.success){
   s.frenzy={active:true,untilNight:g.clock.night};
   if(s.clan==="Gangrel")s.marks=clamp(s.marks+1,0,6);
   s.strain=clamp(s.strain+1,0,3);
   record(g,"La Bestia supera tu Autocontrol ("+reason+")."+(s.clan==="Gangrel"?" Queda una nueva marca bestial.":""));
  }else record(g,"Resististe el impulso de Frenesí ("+reason+").");
  bridge?.save?.();bridge?.refresh?.();
  return {roll,frenzy:!roll.success,marks:s.marks};
 }
 function terror(g,source="fuego",rng=Math.random){
  if(!g?.embraced)return null;
  const s=init(g),key=g.clock.night+":terror:"+source.slice(0,32);
  if(s.attempts[key])return null;
  s.attempts[key]=true;
  const roll=rollVirtue(g,"Coraje",source==="sol"?8:7,rng);
  if(!roll.success){s.terror={active:true,untilNight:g.clock.night};s.strain=clamp(s.strain+1,0,3);record(g,"Una reacción de terror sobrenatural te obliga a replegarte.");}
  else record(g,"Resististe el temor sobrenatural.");
  bridge?.save?.();bridge?.refresh?.();
  return {roll,afraid:!roll.success};
 }
 function calm(g){
  const s=init(g);if(!g.embraced)return {error:"Todavía no sos Vástago."};
  if(!s.frenzy.active&&!s.terror.active)return {error:"No hay pérdida de control que resistir."};
  if((m(g).will||0)<1)return {error:"No queda Voluntad disponible."};
  const key=g.clock.night+":calm";
  if(s.attempts[key])return {error:"Ya intentaste dominar la Bestia esta noche."};
  s.attempts[key]=true;m(g).will--;
  s.frenzy.active=false;s.terror.active=false;
  record(g,"Gastaste Voluntad para recuperar el control, sin borrar sus consecuencias anteriores.");
  bridge?.save?.();bridge?.refresh?.();
  return {success:true,will:m(g).will};
 }
 function feedingRestriction(g){
  if(!g?.embraced||g.character?.clan!=="Ventrue")return null;
  const s=init(g),choice=CHOICES.find(x=>x.id===s.taste);
  const where=g.scene==="venue"?g.venue:null;
  if(!choice.places.includes(where))return "Restricción Ventrue: tu tipo de presa sólo aparece en "+choice.label+
    ". Debés visitar el lugar correspondiente para alimentarte.";
  return null;
 }
 function setTaste(g,id){
  if(g.character?.clan!=="Ventrue"||!CHOICES.some(x=>x.id===id))return false;
  const s=init(g),key="tasteLocked";
  if(s[key])return false;
  s.taste=id;s[key]=true;
  record(g,"La restricción de alimentación Ventrue quedó definida: "+CHOICES.find(x=>x.id===id).label+".");
  bridge?.save?.();return true;
 }
 function afterHunt(g,result,roll,rng=Math.random){
  if(!g?.embraced)return null;
  const s=init(g);
  if(result&&roll?.success){
   s.frenzy.active=false;
   record(g,"Te alimentaste y la presión inmediata de la Bestia disminuyó.");
  }else if(!roll?.success&&m(g).blood<=2)return frenzy(g,"hambre tras caza fallida",rng);
  return null;
 }
 function weakness(g,attr,skill){
  if(!g?.embraced)return {bonus:0,description:""};
  const s=init(g),clan=s.clan;
  let bonus=0,description=[];
  const social=["Carisma","Manipulación","Apariencia"].includes(attr);
  if(clan==="Nosferatu"&&social&&["Etiqueta","Expresión","Interpretación"].includes(skill)){
   bonus-=2;description.push("apariencia Nosferatu -2");
  }
  if(clan==="Nosferatu"&&skill==="Sigilo"){bonus++;description.push("experiencia subterránea +1");}
  if(clan==="Gangrel"&&s.marks>0&&social){bonus-=Math.min(2,Math.ceil(s.marks/2));description.push("marcas bestiales");}
  if(clan==="Malkavian"&&s.strain>=2&&["Investigación","Informática","Academicismo"].includes(skill)){
   bonus--;description.push("percepción alterada -1");
  }
  if(clan==="Malkavian"&&["Alerta","Empatía"].includes(skill)&&s.omensNight!==g.clock.night){
   bonus++;s.omensNight=g.clock.night;description.push("intuición extraña +1");
  }
  if(clan==="Tremere"&&skill==="Ocultismo"&&g.scene==="venue"&&g.venue==="passy"){
   bonus++;description.push("formación de la Casa Tremere +1");
  }
  if(s.frenzy.active&&social){bonus-=2;description.push("Frenesí -2");}
  if(s.terror.active&&skill!=="Atletismo"&&skill!=="Esquivar"){bonus--;description.push("temor sobrenatural -1");}
  return {bonus,description:description.join("; ")};
 }
 function observeBeauty(g,rng=Math.random){
  if(!g?.embraced||g.character.clan!=="Toreador")return null;
  if(!["stjuly","elysee"].includes(g.venue)||g.scene!=="venue")return null;
  const s=init(g);if(s.entrancedNight===g.clock.night)return null;
  s.entrancedNight=g.clock.night;
  const roll=rollVirtue(g,"Autocontrol",6,rng);
  if(!roll.success){s.strain=clamp(s.strain+1,0,3);record(g,"Una obra extraordinaria reclama tu atención y te hace perder tiempo.");return {lost:12,roll};}
  return {lost:0,roll};
 }
 function ritual(g,name){
  if(!g?.embraced||g.character.clan!=="Tremere"||name!=="Taumaturgia")return null;
  const s=init(g),key=g.clock.night+":ritual-watch";
  if(s.attempts[key])return null;
  s.attempts[key]=true;s.ritualWatch=clamp(s.ritualWatch+1,0,6);
  record(g,"El uso de Taumaturgia requiere un informe ante la jerarquía de la Casa.");
  return {watch:s.ritualWatch};
 }
 function summary(g){
  const s=init(g);if(!s)return "Sin estado vampírico.";
  if(!g.embraced)return "Ghoul: las restricciones vampíricas se activan tras el Abrazo.";
  const state=[];
  if(s.frenzy.active)state.push("Frenesí activo");
  if(s.terror.active)state.push("Rötschreck activo");
  if(m(g).blood<=2)state.push("Hambre intensa");
  if(s.marks&&s.clan==="Gangrel")state.push("marcas bestiales "+s.marks);
  if(s.ritualWatch&&s.clan==="Tremere")state.push("informes rituales "+s.ritualWatch);
  if(s.clan==="Ventrue")state.push("presa: "+CHOICES.find(x=>x.id===s.taste).label);
  return s.clan+": "+(state.join(" · ")||"estabilidad aparente");
 }
 function menu(){
  const g=bridge?.getGame?.();if(!g)return;
  const s=init(g),choices=[];
  if(g.embraced&&(s.frenzy.active||s.terror.active))
   choices.push({label:"Gastar 1 Voluntad para recuperar el control",disabled:(m(g).will||0)<1||!!s.attempts[g.clock.night+":calm"],action:()=>{
    const result=calm(g);
    bridge?.ask?.("La Bestia",result.error||"Recuperaste el control. Voluntad restante: "+result.will,
    [{label:"Continuar",action:()=>{}}],"FASE XX · VOLUNTAD");
   }});
  if(g.embraced&&s.clan==="Ventrue"&&!s.tasteLocked)
   for(const choice of CHOICES)
    choices.push({label:"Definir mi presa selectiva · "+choice.label,action:()=>{
     setTaste(g,choice.id);menu();
    }});
  choices.push({label:"Cerrar",action:()=>{}});
  bridge?.ask?.("La Sangre y la Bestia",
   "Estado: "+summary(g)+"\nSangre "+(m(g).blood||0)+"/10 · Voluntad "+(m(g).will||0)+"/"+g.character.willpower+
   " · Humanidad "+g.character.humanity+"/10.\n\nDebilidad del clan: "+CANON[s.clan]+
   "\n\nÚltimos hechos:\n"+(s.history.slice(0,5).map(x=>"• "+x).join("\n")||"Sin acontecimientos."),
   choices,"FASE XX · SISTEMA VAMPÍRICO");
 }
 return Object.freeze({CLANS,CHOICES,CANON,bind,init,nightly,frenzy,terror,calm,
  feedingRestriction,setTaste,afterHunt,weakness,observeBeauty,ritual,summary,menu,version:"20.0"});
})();