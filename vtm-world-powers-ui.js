"use strict";
/* V0.9: poderes contextuales de exploración, conversaciones y comercio. */
window.VTM_WORLD_POWERS_UI=(()=>{
 const W=window.VTM_WORLD_POWERS;
 let bridge=null;
 function bind(api){bridge=api;}
 function menu(){
  const game=bridge?.getGame();
  if(!game)return;
  if(!game.embraced){
   bridge.ask("Disciplinas de exploración","Los ghouls todavía no pueden utilizar estas técnicas. Sólo estarán disponibles después del Abrazo.",
    [{label:"Regresar",action:bridge.actions}],"SANGRE Y PODER");return;
  }
  const ctx=W.context(game);
  if(!ctx){bridge.ask("Sin objetivo sobrenatural",
    "Necesitás estar dentro de un establecimiento, en un lugar de investigación o recorriendo un barrio para aplicar estos poderes.",
    [{label:"Regresar",action:bridge.actions}],"DISCIPLINAS");return;}
  const opts=W.catalog(game).map(rule=>({
   label:rule.name+" "+(game.character.disciplines[rule.name]||0)+" · "+rule.label+
    " · "+rule.cost+" Sangre"+(rule.reason?" · "+rule.reason:""),
   disabled:!!rule.reason,action:()=>perform(rule.name)
  }));
  opts.push({label:"Cerrar",action:()=>{}});
  bridge.ask("Los poderes en "+ctx.label,
   "Cada alternativa depende de la Disciplina adquirida. Las capacidades mentales sólo se aplican a mortales de los comercios. Las intervenciones tienen costes, resistencias y consecuencias. Los poderes pasivos continúan funcionando sin activarse.\n\n"+
   "Sangre disponible: "+game.mechanics.blood+"/10.",
   opts,"DISCIPLINAS EN EL MUNDO");
 }
 function perform(name){
  const game=bridge?.getGame(),rule=W.RULES[name];
  if(!game||!rule||W.available(game,name))return;
  const roll=bridge.roll(rule.attr,rule.skill,rule.difficulty);
  const result=W.use(game,name,roll);
  if(result.error)return;
  if(result.exposure)bridge.exposure(result.exposure,"Consecuencias de "+name+" en "+result.place+".");
  bridge.observedPower?.(name,result);
  bridge.log(name+": "+(result.success?"intervención lograda":"efecto fallido")+". Sangre gastada: "+result.cost+".");
  bridge.advance(8);bridge.refresh();bridge.save();
  let detail=result.description+"\n\n"+rule.attr+" + "+rule.skill+" (dif. "+rule.difficulty+
   "): ["+result.roll.dice.join(", ")+"] · "+result.roll.net+" éxitos.";
  if(result.defense)detail+="\nResistencia mortal: ["+result.defense.dice.join(", ")+"] · "+result.defense.net+" éxitos.";
  if(result.clue)detail+="\n\nIndicio: "+result.clue;
  if(result.discount)detail+="\nTrato favorable en este comercio esta noche: "+Math.round(result.discount*100)+" % adicional.";
  if(result.humanity)detail+="\nConciencia: ["+result.humanity.roll.join(", ")+"] · "+
    (result.humanity.degeneration?"Humanidad reducida a "+result.humanity.value+".":"Conservás tu Humanidad.");
  detail+="\n\nSangre restante: "+game.mechanics.blood+"/10.";
  bridge.ask(result.success?"Efecto sobrenatural":"Poder resistido o fallido",detail,
    [{label:"Intentar otro poder",action:menu},{label:"Continuar",action:()=>{}}],"ACCIONES SOBRENATURALES");
 }
 return {bind,menu,perform};
})();