"use strict";
/* XXVII-C: no dibujar observadores huérfanos ni permitir confrontaciones falsas. */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const window={};
for(const file of ["vtm-hunters.js","vtm-save.js"])
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,"..",file),"utf8"),{window},{filename:file});
const H=window.VTM_HUNTERS,S=window.VTM_SAVE,physics={canStand:()=>true};
const episode={night:5,district:"bastilla",choice:"observe",outcome:"noticed"};
const make=()=>({
 version:1,character:{name:"Ghoul",clan:"Toreador"},embraced:false,
 scene:"district",district:"bastilla",clock:{night:6,minutes:1220},x:240,y:225,
 cityLife:{surveillanceEpisodes:[episode]},
 hunters:{resolved:{},history:[],follower:{
  district:"bastilla",night:6,source:"5:bastilla",x:260,y:225,mode:"tail",
  alert:50,lost:0,elapsed:2
 }},
 elizabeth:{evidence:["Parker"]},localCases:{closed:["local"]},
 principado:{chapter:1},conspiracy:{chapter:2},
 parkerDossier:{clues:["EP-03"]},parkerPolitics:{protection:"active"}
});
const game=make();
assert.equal(H.position(game).mode,"tail","episodio legítimo visible");
assert.equal(H.canConfront(game,physics),true,"interacción legítima disponible");
game.cityLife.surveillanceEpisodes=[];
const snapshot=JSON.stringify(game);
assert.equal(H.position(game),null,"sin episodio no aparece una silueta huérfana");
assert.equal(H.summary(game).active,false,"el diario tampoco indica un observador fantasma");
assert.equal(H.canConfront(game,physics),false,"sin indicios no hay confrontación");
assert.equal(H.decide(game,physics,"withdraw").length,0,"no se resuelve una confrontación falsa");
assert.equal(JSON.stringify(game),snapshot,"las comprobaciones no alteran la partida");
game.cityLife.surveillanceEpisodes=[episode];
game.hunters.cooldownUntilNight=6;
assert.equal(H.position(game),null,"durante el descanso no se muestra un observador residual");
assert.equal(H.canConfront(game,physics),false,"el descanso bloquea confrontaciones residuales");
const storageData=new Map(),storage={
 getItem:k=>storageData.has(k)?storageData.get(k):null,
 setItem:(k,v)=>storageData.set(k,String(v))
},key="cronicas-paris-ghoul-v1",clans={Toreador:{}};
assert.equal(S.save(storage,key,game,clans),true);
const newer=JSON.parse(JSON.stringify(game));newer.clock.minutes++;
assert.equal(S.save(storage,key,newer,clans),true);
storageData.set(key,"{corrupto");
const loaded=S.load(storage,key,clans);
assert.ok(loaded?.fromBackup,"se recupera el respaldo válido");
assert.equal(H.position(loaded.game),null,"el respaldo tampoco revive al observador residual");
assert.equal(H.canConfront(loaded.game,physics),false);
assert.equal(loaded.game.elizabeth.evidence[0],"Parker");
assert.equal(loaded.game.localCases.closed[0],"local");
assert.equal(loaded.game.parkerDossier.clues[0],"EP-03");
assert.equal(loaded.game.conspiracy.chapter,2);
loaded.game.hunters.cooldownUntilNight=5;
assert.equal(H.position(loaded.game).mode,"tail","al finalizar el descanso vuelve a validarse el episodio");
assert.equal(H.canConfront(loaded.game,physics),true);
console.log("OK: XXVII-C — sin observadores fantasma ni pérdida de expedientes");
