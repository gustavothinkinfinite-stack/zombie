"use strict";
/* Control de combate, sangre y poderes en las escenas. Requiere VTM_TACTICS y VTM_STORY. */
window.VTM_TACTICS_UI=(()=>{
 const E=window.VTM_TACTICS,S=window.VTM_STORY,M=window.VTM_MECHANICS;
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
   {label:"Atacar con un arma improvisada · Destreza + Armas Cuerpo a Cuerpo",id:"arma"},
   {label:"Usar un arma de fuego · Destreza + Armas de Fuego",id:"disparo",blocked:!(game.character.skills["Armas de Fuego"]>0)},
   {label:"Defender y esquivar · Destreza + Esquivar",id:"esquiva"},
   {label:"Intentar huir · Destreza + Atletismo",id:"huida"}
  ];
  const options=actions.map(a=>({label:a.label,disabled:a.blocked,action:()=>battleRound(a.id)}));
  if(game.embraced)options.push({label:"Activar una Disciplina antes del siguiente intercambio",action:powersMenu});
  detail("Combate · turno "+combat.round,
   combat.enemy.name+" · Salud enemiga "+combat.enemy.health+"/"+combat.enemy.max+
   "\nIniciativa: Destreza + Astucia + d10. Los ataques se resuelven contra dificultad 6 (7 con armas de fuego), seguidos de daño y absorción.\n\n"+
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
    bridge.faction(result.place==="saintdenis"?"brujah":result.place==="passy"?"tremere":"brujah",2,"Conflicto controlado.");
   }
   if(result.defeat){
    // Rescate contextual: evita un guardado injugable, pero deja coste.
    E.recover(game,2,"contundente");
    bridge.exposure(12,"El altercado provocó intervención de testigos.");
    bridge.faction("camarilla",-4,"El desorden llegó a oídos de la corte.");
    extra+="\nTe auxiliaron tras quedar incapacitado; recuperás dos niveles de Salud, pero aumenta la exposición.";
   }
  }
  bridge.advance(7);bridge.refresh();bridge.save();
  detail(result.victory?"Enfrentamiento resuelto":result.defeat?"Quedaste fuera de combate":
    result.ended?"Huida lograda":"Intercambio de ataques",
    result.log.join("\n")+
    "\n\nIniciativa propia "+result.playerInit+" · rival "+result.enemyInit+
    (result.playerRoll?"\nTirada: ["+result.playerRoll.dice.join(", ")+"] · "+result.playerRoll.net+" éxitos.":"")+
    (result.enemyRoll?"\nAtaque rival: ["+result.enemyRoll.dice.join(", ")+"] · "+result.enemyRoll.net+" éxitos.":"")+
    extra+"\n\n"+body(),
    result.ended?[{label:"Continuar la historia",action:()=>{}}]:
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
  if(res.changed.exposure)bridge.exposure(res.changed.exposure,"La Ofuscación oculta rastros.");
  bridge.log("Disciplina "+name+" · "+res.label+" nivel "+res.level+" (−"+res.cost+" Sangre).");
  bridge.refresh();bridge.save();
  detail(res.label,res.description+"\n\nPoder utilizado: "+name+" "+res.level+
   " · coste "+res.cost+" Sangre.\n"+body(),
   [{label:game.combat?.active?"Regresar al combate":"Elegir otro poder",action:()=>game.combat?.active?battleMenu():powersOf(name)},
    {label:"Cerrar",action:()=>{}}],"PODER SOBRENATURAL");
 }
 return {bind,battleEntry,battleMenu,powersMenu,status:body,canBattle};
})();