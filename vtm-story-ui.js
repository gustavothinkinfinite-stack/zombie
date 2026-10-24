"use strict";
/* Integración de escenas narrativas y progreso con el motor Canvas v0.6. */
window.VTM_STORY_UI=(()=>{
 const S=window.VTM_STORY,M=window.VTM_MECHANICS,D=window.VTM_DATA,N=window.VTM_NPCS,C=window.VTM_CONTENT;
 let api=null;
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function bind(callbacks){api=callbacks;}
 function game(){return api?.getGame();}
 function openScene(location){
  const g=game(),scene=S.scenes[location.id];
  if(!g||!scene)return;
  S.init(g);
  const state=g.story.locations[location.id];
  const options=scene.paths.map(path=>{
   const reason=S.canAttempt(g,location.id,path);
   const ability=path.min?path.skill+" "+path.min:path.background?
    path.background+" "+path.minBackground:path.power?path.power+" "+path.minPower:"Libre";
   const rank=path.power?(g.character.disciplines[path.power]||0):0;
   const difficulty=Math.max(4,path.diff-(rank>=3?1:0));
   return {label:path.label+" · "+ability+" · "+path.attr+" + "+path.skill+
    " (dif. "+difficulty+")"+(path.moral?" · riesgo moral":"")+
    (reason?" · "+reason:""),disabled:!!reason,
    action:()=>attempt(location,path,difficulty)};
  });
  options.push({label:"Dejar el asunto por ahora",action:()=>{}});
  api.ask(scene.title,scene.intro+"\n\nCada estrategia depende de tu ficha y produce consecuencias distintas. Una tentativa por noche; la resolución exitosa queda guardada y no repite recompensas.\n\n"+
   (state?.success?"Asunto ya resuelto.":state?.night===g.clock.night?"Ya actuaste aquí esta noche.":"Decidí cómo intervenir.")+
   "\n\nHumanidad: "+g.character.humanity+"/10 · Experiencia: "+g.story.xp+" PX.",
   options,"DECISIONES DEL PERSONAJE");
 }
 function attempt(location,path,difficulty){
  const g=game();if(!g||S.canAttempt(g,location.id,path))return;
  const roll=api.roll(path.attr,path.skill,difficulty);
  const result=S.resolve(g,location.id,path.id,roll);
  if(!result)return;
  let consequence="";
  if(result.injury){
   M.init(g).health=Math.max(0,g.mechanics.health-result.injury);
   consequence+="\nDaño: perdés "+result.injury+" punto de Salud.";
  }
  if(result.terror){
   const fear=api.vitaeTerror?.("amenaza sobrenatural en "+location.id)||S.fearTest(g);
   if(fear?.roll)consequence+="\nCoraje ["+fear.roll.dice.join(", ")+"]: "+(fear.afraid?"el temor te obliga a replegarte.":"resistís el temor.");
  }
  if(result.moral){
   const moral=S.moralTest(g,result.moral);
   consequence+="\nConciencia ["+moral.roll.dice.join(", ")+"]: "+(moral.degeneration?
     "perdés 1 punto de Humanidad.":"no perdés Humanidad, aunque tu acción deja huella.");
  }
  if(result.exposure)api.exposure(result.exposure,"Consecuencias de "+location.name+".");
  if(result.faction)api.faction(result.faction,5,"Interviniste en "+location.name+".");
  const npc=N.byLocation[location.id];
  if(npc){
   g.npcRelations=g.npcRelations||{};
   g.npcRelations[npc.id]=clamp((g.npcRelations[npc.id]||0)+result.trust,-3,3);
  }
  if(result.success){
   if(g.activeQuest==="archivos"&&!g.readyReport&&C.investigation.sources[location.id]&&
     !g.arc.clues.includes(location.id)){
    g.arc.clues.push(location.id);
    consequence+="\nConseguiste una pista para el caso Dupont ("+g.arc.clues.length+"/2).";
   }
   for(const sq of Object.values(g.sideQuests||{})){
    if(sq.status==="active" && window.VTM_ARCS.personal[sq.id]?.target===location.id)sq.prepared=true;
   }
  }
  api.log(location.name+" · "+path.label+": "+(result.success?"resuelto":"fracaso")+".");
  api.advance(18);api.refresh();api.save();
  api.ask(result.success?"Un avance en la investigación":"Nuevas complicaciones",
   result.text+"\n\n"+path.attr+" + "+path.skill+" (dif. "+difficulty+") · ["+roll.dice.join(", ")+
   "] · "+roll.net+" éxitos."+(roll.modifiers?"\nModificadores: "+roll.modifiers+".":"")+
   consequence+(result.experience?"\nExperiencia ganada: +"+result.experience+" PX.":"")+
   (result.success?"\nLa resolución queda registrada permanentemente.":"\nPodés regresar otra noche e intentar otra estrategia.")+
   "\n\nHumanidad "+g.character.humanity+"/10 · Salud "+M.init(g).health+"/7 · PX "+g.story.xp+".",
   [{label:"Continuar",action:()=>{}}],"RESULTADO PERSISTENTE");
 }
 function training(){
  const g=game();if(!g)return;S.init(g);
  const categories=["Atributo","Habilidad","Virtud","Humanidad","Voluntad"];
  if(g.embraced)categories.push("Disciplina");
  api.ask("Experiencia y aprendizaje","Puntos de experiencia disponibles: "+g.story.xp+
   " · Obtenidos: "+g.story.totalXp+".\nLos rasgos crecen mediante experiencia ganada en escenas y encargos. Los cambios quedan guardados.",
   categories.map(cat=>({label:"Mejorar "+cat,action:()=>trainingCategory(cat)}))
    .concat([{label:"Cerrar",action:()=>{}}]),"PROGRESIÓN");
 }
 function trainingCategory(category){
  const g=game(),c=g.character;
  const entries=category==="Atributo"?Object.keys(c.attr):category==="Habilidad"?Object.keys(c.skills):
   category==="Virtud"?Object.keys(c.virtues):category==="Disciplina"?D.clans[c.clan].disciplines:
   [category];
  const values={Atributo:c.attr,Habilidad:c.skills,Virtud:c.virtues,Disciplina:c.disciplines};
  const options=entries.map(name=>{
   const current=values[category]?values[category][name]||0:category==="Humanidad"?c.humanity:c.willpower;
   const price=S.xpPrice(c,category,name,g.embraced);
   return {label:name+" "+current+" → "+(current+1)+(price===null?" · máximo":" · "+price+" PX"),
    disabled:!price||g.story.xp<price,action:()=>improve(category,name)};
  });
  options.push({label:"Regresar",action:training});
  api.ask("Mejorar "+category,"Experiencia actual: "+g.story.xp+" PX. Sólo se habilitan los rasgos que podés pagar.",
   options,"APRENDIZAJE");
 }
 function improve(category,name){
  const g=game(),result=S.improve(g,category,name);
  if(!result)return;
  if(category==="Voluntad"||(category==="Virtud"&&name==="Coraje")){
   M.init(g).will=Math.min(g.character.willpower,g.mechanics.will+1);
  }
  api.log("Aumentaste "+category+" · "+name+" a "+result.value+" (−"+result.cost+" PX).");
  api.refresh();api.save();
  api.ask("Aprendizaje completado",name+" sube a "+result.value+". Gastaste "+result.cost+
   " PX; quedan "+result.remaining+" PX.",
   [{label:"Seguir aprendiendo",action:()=>trainingCategory(category)},{label:"Continuar",action:()=>{}}],
   "PROGRESIÓN");
 }
 function checkHunger(){
  const g=game();if(!g||!g.embraced)return null;
  const outcome=S.frenzyTest(g);
  if(outcome?.frenzy){
   api.exposure(8,"La Bestia se impuso durante una caza desesperada.");
   api.log("Autocontrol fallido: la Bestia domina tus instintos temporalmente.");
  }else if(outcome)api.log("Autocontrol: resististe el impulso de la Bestia.");
  return outcome;
 }
 function summary(){
  const g=game();return g?"Humanidad "+g.character.humanity+"/10 · Experiencia "+S.init(g).xp+" PX":"";
 }
 return {bind,openScene,training,checkHunger,summary};
})();