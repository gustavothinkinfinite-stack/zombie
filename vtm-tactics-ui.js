"use strict";
/* Control de combate, sangre y poderes en las escenas. Requiere VTM_TACTICS y VTM_STORY. */
window.VTM_TACTICS_UI=(()=>{
 const E=window.VTM_TACTICS,S=window.VTM_STORY,M=window.VTM_MECHANICS,G=window.VTM_EQUIPMENT,ADV=window.VTM_ADVANCED_TACTICS||null;
 let bridge=null;
 function bind(api){bridge=api;}
 function g(){return bridge?.getGame();}
 function detail(title,body,options,tag){bridge.ask(title,body,options,tag);}
 function body(){return E.status(g());}
 function canBattle(place){
  const game=g();if(!game)return false;
  return !!E.ENEMIES[place] && game.mechanics?.health>0 && game.combat?.records?.[place]!=="won";
 }
 function battleEntry(place){
  const game=g();if(!game)return;
  E.init(game);
  if(game.combat.active){battleMenu();return;}
  const npc=E.ENEMIES[place];
  if(!npc)return;
  if(!canBattle(place)){
   detail("El enfrentamiento terminó","Ya resolviste el conflicto de este lugar o necesitás recuperarte.",[{label:"Continuar",action:()=>{}}],"COMBATE");return;
  }
  const approaches=[
   {label:"Intervenir físicamente · iniciar enfrentamiento",action:()=>battleStart(place)},
   {label:"Buscar una solución pacífica",action:()=>bridge.scene(place)},
   {label:"Preparar equipo e inventario",action:equipmentMenu},
   {label:"Retirarte sin intervenir",action:()=>{}}
  ];
  detail("Una confrontación en "+npc.name,
   "Elegí cómo responder. Un combate consume turnos, permite esquivar, atacar o huir, y puede provocar daño físico. Antes de agredir también podés intentar resolver la escena con Atributos y Habilidades.\n\n"+
   body(),approaches,"ENCUENTRO PELIGROSO");
 }
 function battleStart(place){
  const game=g(),started=E.start(game,place);
  if(started.error){
   detail("No podés iniciar el combate",started.error,[{label:"Volver",action:()=>{}}],"COMBATE");return;
  }
  bridge.log("Comienza un enfrentamiento con "+started.enemy+".");
  bridge.save();battleMenu();
 }
 function battleMenu(){
  const game=g(),combat=game?.combat?.active;
  if(!combat){detail("Sin combate activo","Por ahora no hay ningún enfrentamiento en curso.",[{label:"Continuar",action:()=>{}}],"COMBATE");return;}
  const actions=[
   {label:"Pelear sin armas · Destreza + Pelea",id:"golpe"},
   {label:"Atacar con arma cuerpo a cuerpo · "+(G.init(game).equipped||"sin arma"),id:"arma",blocked:!!G.moveAllowed(game,"arma")},
   {label:"Disparar · "+G.init(game).magazine+" cartuchos en cargador",id:"disparo",blocked:!!G.moveAllowed(game,"disparo")},
   {label:"Recargar pistola (consume turno)",id:"recargar",blocked:!(G.init(game).equipped==="pistola"&&G.init(game).ammo>0&&G.init(game).magazine<6)},
   {label:"Defender y esquivar · Destreza + Esquivar",id:"esquiva"},
   {label:"Intentar huir · Destreza + Atletismo",id:"huida"},
   ...(ADV?[
    {label:"Buscar cobertura · protegerte de ataques",id:"cubrirse"},
    {label:"Avanzar · cerrar distancias",id:"avanzar"},
    {label:"Retroceder · ganar distancia",id:"retroceder"},
    {label:"Apuntar · preparar el siguiente disparo",id:"apuntar"},
    {label:"Flanquear · Destreza + Atletismo",id:"flanquear"}
   ]:[])
  ];
  const options=actions.map(a=>({label:a.label,disabled:!!a.blocked||!!ADV?.valid(game,a.id),action:()=>battleRound(a.id)}));
  if(game.embraced)options.push({label:"Activar una Disciplina antes del siguiente intercambio",action:powersMenu});
  options.push({label:"Consultar inventario (equipar fuera del combate)",action:equipmentMenu});
  detail("Combate · turno "+combat.round,
   combat.enemy.name+" · Salud enemiga "+combat.enemy.health+"/"+combat.enemy.max+" · Voluntad "+(combat.enemy.willpower||2)+" · estilo "+(combat.enemy.style||"normal")+
   "\nIniciativa: Destreza + Astucia + d10. Ataque y daño se resuelven con cobertura, posición y absorción.\n"+(ADV?"\n"+ADV.summary(game)+"\n":"")+"\n"+
   body(),options,"COMBATE POR TURNOS");
 }
 function battleRound(move){
  const game=g();if(!game?.combat?.active)return;
  const result=E.action(game,move);
  if(result.error)return;
  let extra="";
  if(result.ended){
   if(result.victory){
    // PX sólo por primera victoria, sin recompensas infinitas.
    const info=E.ENEMIES[result.place];
    const score=S.init(game);
    if(!game.combat.rewards)game.combat.rewards={};
    if(!game.combat.rewards[result.place]){
     score.xp+=info.reward;score.totalXp+=info.reward;
     game.combat.rewards[result.place]=true;extra+="\nExperiencia de combate +"+info.reward+" PX.";
    }
    if(game.activeQuest&&!game.readyReport&&
      window.VTM_DATA.quests.find(q=>q.id===game.activeQuest)?.place===result.place){
      const q=window.VTM_DATA.quests.find(q=>q.id===game.activeQuest);
      game.readyReport={id:q.id,success:true,praise:q.praise,detail:"El conflicto quedó controlado tras un enfrentamiento.",dice:[],net:1,
       skill:"Pelea",attribute:"Destreza",difficulty:6};
      extra+="\nEncargo principal completado; regresá con tu Domitor.";
    }
    for(const q of Object.values(game.sideQuests||{})){
     if(q.status==="active"&&window.VTM_ARCS.personal[q.id]?.target===result.place)q.prepared=true;
    }
    if(move==="arma"||move==="disparo"||game.character.humanity<=3) {
      const moral=S.moralTest(game,1);
      extra+="\nConciencia ["+moral.roll.dice.join(", ")+"]: "+(moral.degeneration?
        "la violencia deterioró tu Humanidad.":"evitaste perder Humanidad.");
    }
    if(result.place!=="bapthiste")bridge.faction(result.place==="saintdenis"?"brujah":result.place==="passy"?"tremere":"brujah",2,"Conflicto controlado.");
    else extra+="\nBapthiste ha sido incapacitado. Debés decidir si entregarlo bajo custodia.";
   }
   if(result.defeat){
    // Rescate contextual: evita un guardado injugable, pero deja coste.
    E.recover(game,2,"contundente");
    bridge.exposure(12,"El altercado provocó intervención de testigos.");
    bridge.faction("camarilla",-4,"El desorden llegó a oídos de la corte.");
    extra+="\nTe auxiliaron tras quedar incapacitado; recuperás dos niveles de Salud, pero aumenta la exposición.";
   }
  }
  if((result.damageToPlayer||0)>=2&&game.embraced&&(game.mechanics?.blood||0)<=3){
   const impulse=bridge.vitaeFrenzy?.("heridas graves en combate");
   if(impulse?.frenzy)extra+="\nLa Bestia se apoderó de tus instintos.";
  }
  bridge.advance(7);bridge.refresh();bridge.save();
  detail(result.victory?"Enfrentamiento resuelto":result.defeat?"Quedaste fuera de combate":
    result.ended?"Huida lograda":"Intercambio de ataques",
    result.log.join("\n")+
    "\n\nIniciativa propia "+result.playerInit+" · rival "+result.enemyInit+
    (result.playerRoll?"\nTirada: ["+result.playerRoll.dice.join(", ")+"] · "+result.playerRoll.net+" éxitos.":"")+
    (result.enemyRoll?"\nAtaque rival: ["+result.enemyRoll.dice.join(", ")+"] · "+result.enemyRoll.net+" éxitos.":"")+
    extra+"\n\n"+body(),
    result.ended?[{label:result.victory&&result.place==="bapthiste"?"Decidir custodia de Bapthiste":"Continuar la historia",action:()=>{if(result.victory&&result.place==="bapthiste")bridge.bapthisteOutcome?.();}}]:
      [{label:"Siguiente turno",action:battleMenu},{label:"Disciplina",disabled:!game.embraced,action:powersMenu}],
    result.ended?"RESULTADO DEL COMBATE":"RONDA RESUELTA");
 }
 function powersMenu(){
  const game=g();
  if(!game?.embraced){
   detail("Dones de la Sangre","Todavía no recibiste el Abrazo.",[{label:"Regresar",action:()=>{}}],"DISCIPLINAS");return;
  }
  const list=window.VTM_DATA.clans[game.character.clan].disciplines;
  const choices=list.map(name=>({label:name+" · "+(game.character.disciplines?.[name]||0)+" círculos",
   disabled:!(game.character.disciplines?.[name]>0),action:()=>powersOf(name)}));
  choices.push({label:"Regresar",action:()=>game.combat?.active?battleMenu():bridge.actions()});
  detail("Disciplinas de "+game.character.clan,
   "Cada círculo desbloquea un efecto distinto, cuando la Disciplina lo permite. Celeridad, Potencia y Fortaleza también participan en el combate.\n"+
   "La sangre es limitada, y las intervenciones evidentes pueden comprometer la Mascarada.\n\n"+body(),
   choices,"PODERES POR NIVEL");
 }
 function powersOf(name){
  const game=g(),available=E.catalog(game,name);
  const options=available.map((p,i)=>({
    label:"Nivel "+p.level+" · "+p.label+(p.passive?" · pasivo siempre activo":" · "+p.cost+" Sangre")+(p.used&&!p.passive?" · usado":"")+
      (!p.available?" · sin Sangre":""),
    disabled:p.used||!p.available,action:()=>cast(name,i)
  }));
  options.push({label:"Regresar",action:powersMenu});
  detail("Disciplina: "+name,
   "Nivel adquirido: "+(game.character.disciplines[name]||0)+
   ". Cada poder posee un efecto contextual y un límite de uso por noche.\n\n"+body(),options,"DISCIPLINAS");
 }
 function cast(name,index){
  const game=g(),res=E.cast(game,name,index);
  if(res.error){
   detail("No podés activar el poder",res.error,[{label:"Volver",action:()=>powersOf(name)}],"DISCIPLINAS");return;
  }
  if(res.risk)bridge.exposure(res.risk,"Manifestación sobrenatural: "+res.label+".");
  bridge.vitaeRitual?.(name);
  if(res.changed.exposure)bridge.exposure(res.changed.exposure,"La Ofuscación oculta rastros.");
  if(res.resisted)bridge.log(res.label+": el adversario superó la tirada enfrentada.");
  bridge.log("Disciplina "+name+" · "+res.label+" nivel "+res.level+" (−"+res.cost+" Sangre).");
  bridge.refresh();bridge.save();
  detail(res.label,res.description+(res.opposed?"\n\nTirada enfrentada: "+res.opposed.attribute+" + "+res.opposed.ability+" ["+res.opposed.attacker.dice.join(", ")+"] = "+res.opposed.attacker.net+" éxitos; defensa de Voluntad + Astucia ["+res.opposed.defender.dice.join(", ")+"] = "+res.opposed.defender.net+" éxitos. "+(res.opposed.success?"El efecto se impuso.":"El adversario resistió."):"")+"\n\nPoder utilizado: "+name+" "+res.level+
   " · coste "+res.cost+" Sangre.\n"+body(),
   [{label:game.combat?.active?"Regresar al combate":"Elegir otro poder",action:()=>game.combat?.active?battleMenu():powersOf(name)},
    {label:"Cerrar",action:()=>{}}],"PODER SOBRENATURAL");
 }

 function equipmentMenu(){
  const game=g();if(!game)return;
  const eq=G.init(game),place=game.scene==="venue"?game.venue:null;
  const options=[];
  for(const id of eq.owned){
   const item=G.ITEMS[id];
   if(item.type!=="weapon"&&item.type!=="armor")continue;
   const selected=item.type==="armor"?eq.armor:eq.equipped===id;
   options.push({label:(selected?"✓ ":"")+item.name+" · "+(item.type==="armor"?"protección":"arma"),
    disabled:!!game.combat?.active,action:()=>equipItem(id)});
  }
  if(eq.equipped)options.push({label:"Guardar arma y quedar con las manos libres",disabled:!!game.combat?.active,action:()=>equipItem("sinarma")});
  if(eq.kits>0)options.push({label:"Usar botiquín · Medicina (quedan "+eq.kits+")",
   disabled:!!game.combat?.active,action:useKit});
  if(place)for(const offer of G.offers(game,place)){
   const item=G.ITEMS[offer.item];
   options.push({label:"Conseguir "+item.name+" · "+offer.attr+" + "+offer.skill+
    " (dif. 7)"+(offer.blocked?" · "+offer.blocked:""),
    disabled:!!offer.blocked,action:()=>acquireItem(place,offer)});
  }
  options.push({label:"Regresar",action:()=>game.combat?.active?battleMenu():bridge.actions()});
  detail("Inventario y suministros",G.summary(game)+
   "\n\nLos objetos permanecen en tu partida. Para obtenerlos necesitás habilidades, Trasfondos y estar en el lugar adecuado. La munición es finita y el cargador se recarga en combate gastando un turno.",
   options,"EQUIPO PERSISTENTE");
 }
 function equipItem(id){
  const game=g(),result=G.equip(game,id);
  if(!result.error){bridge.log("Equipo: "+result.name+".");bridge.save();bridge.refresh();}
  detail(result.error?"No podés equiparlo":"Equipo actualizado",result.error||result.name+"\n\n"+G.summary(game),
   [{label:"Continuar",action:equipmentMenu}],"INVENTARIO");
 }
 function acquireItem(place,offer){
  const game=g();if(!game||G.available(game,offer))return;
  const rolled=bridge.roll(offer.attr,offer.skill,7);
  const result=G.acquire(game,place,offer.item,rolled);
  if(result.error)return;
  if(result.exposure)bridge.exposure(result.exposure,"Adquisición de equipo en "+place+".");
  bridge.log(result.success?"Conseguiste "+result.name+".":"No lograste obtener "+result.name+".");
  bridge.advance(12);bridge.refresh();bridge.save();
  detail(result.success?"Suministros obtenidos":"Gestión sin resultado",
   (result.success?"Conseguiste ":"No pudiste conseguir ")+result.name+
   ".\nTirada: ["+rolled.dice.join(", ")+"] · "+rolled.net+" éxitos.\n\n"+G.summary(game),
   [{label:"Volver al inventario",action:equipmentMenu}],"ADQUISICIÓN");
 }
 function useKit(){
  const game=g(),result=G.treat(game,E);
  if(!result.error){bridge.log("Aplicaste un botiquín y recuperaste "+result.healed+" niveles.");bridge.advance(18);bridge.refresh();bridge.save();}
  detail(result.error?"No podés tratar heridas":"Primeros auxilios",
   result.error||"Recuperaste "+result.healed+" niveles de Salud.\n"+G.summary(game),
   [{label:"Continuar",action:equipmentMenu}],"MEDICINA");
 }
 return {bind,battleEntry,battleMenu,powersMenu,equipmentMenu,status:body,canBattle};
})();