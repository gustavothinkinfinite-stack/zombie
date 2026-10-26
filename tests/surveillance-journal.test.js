"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),window={};
for(const file of ["vtm-shops.js","vtm-contacts.js","vtm-city-life.js","vtm-hunters.js","vtm-save.js"])
 vm.runInNewContext(fs.readFileSync(path.join(root,file),"utf8"),{window},{filename:file});
const CITY=window.VTM_CITY_LIFE,SAVE=window.VTM_SAVE;
const episode=(night,outcome,choice="observe")=>({night,district:"bastilla",choice,outcome,
 summary:"Etienne Moreau es la Senescal impostora: texto no público"});
const old={version:1,character:{clan:"Toreador"},elizabeth:{case:"abierto"}};
const oldSnapshot=JSON.stringify(old);
assert.equal(CITY.surveillanceJournal(old).length,0);
assert.equal(CITY.surveillanceJournal(null).length,0);
assert.equal(JSON.stringify(old),oldSnapshot);
const g={version:1,character:{clan:"Toreador",name:"Investigadora"},clock:{night:6},
 cityLife:{surveillanceEpisodes:[episode(2,"noticed"),episode(3,"unconfirmed"),episode(4,"avoided","avoid")]},
 elizabeth:{case:"abierto"},localCases:{done:["uno"]},principado:{chapter:1},
 conspiracy:{secret:"cerrado"},parkerDossier:{clues:["EP-03"]},
 parkerPolitics:{protection:"active"},stealthChase:{patrols:{}},vitae:{blood:2}};
const before=JSON.stringify(g),lines=Array.from(CITY.surveillanceJournal(g));
assert.equal(lines.length,3);
assert.match(lines[0],/Noche 2.*no hay identificación/);
assert.match(lines[1],/Noche 3.*sin identificar/);
assert.match(lines[2],/Noche 4.*cambiaste de ruta/);
assert.doesNotMatch(lines.join(" "),/Etienne|Moreau|Senescal|impostora/);
assert.equal(JSON.stringify(g),before);
const more={cityLife:{surveillanceEpisodes:[{...episode(9,"noticed"),district:"desconocido"},
 ...Array.from({length:7},(_,i)=>episode(i+1,"unconfirmed"))]}};
const recent=Array.from(CITY.surveillanceJournal(more));
assert.equal(recent.length,5);assert.match(recent[0],/Noche 3/);assert.match(recent[4],/Noche 7/);
const db=new Map(),store={getItem:k=>db.get(k)||null,setItem:(k,v)=>db.set(k,String(v))};
const key="cronicas-paris-ghoul-v1",clans={Toreador:{}};
assert.equal(SAVE.save(store,key,g,clans),true);
const later=JSON.parse(JSON.stringify(g));later.clock.night=7;
assert.equal(SAVE.save(store,key,later,clans),true);
db.set(key,"{corrupto");
const loaded=SAVE.load(store,key,clans);
assert.ok(loaded&&loaded.fromBackup);
const snapshot=JSON.stringify(loaded.game);
assert.equal(CITY.surveillanceJournal(loaded.game).length,3);
assert.equal(CITY.surveillanceJournal(loaded.game).length,3);
assert.equal(JSON.stringify(loaded.game),snapshot);
for(const k of ["elizabeth","localCases","principado","conspiracy","parkerDossier",
 "parkerPolitics","stealthChase","vitae"])
 assert.equal(JSON.stringify(loaded.game[k]),JSON.stringify(g[k]));
const engine=fs.readFileSync(path.join(root,"vtm-game.js"),"utf8");
assert.ok(engine.includes("const observations=CITY.surveillanceJournal(game);"));
assert.ok(engine.includes("Vigilancia civil sin verificar"));
const HUNTERS=window.VTM_HUNTERS;
const legacySnapshot=JSON.stringify(old);
assert.equal(HUNTERS.summary(old).active,false);
assert.equal(HUNTERS.summary(old).history.length,0);
assert.equal(JSON.stringify(old),legacySnapshot,"un guardado antiguo no debe mutar");
const watched={...g,cityLife:{surveillanceEpisodes:[...g.cityLife.surveillanceEpisodes,episode(5,"noticed")]},
 scene:"district",district:"bastilla",hunters:{
 history:Array.from({length:7},(_,i)=>"Noche "+(i+1)+": silueta sin identificar."),
 follower:{district:"bastilla",night:6,mode:"tail",source:"5:bastilla",x:250,y:225}
}};
const watchedSnapshot=JSON.stringify(watched);
assert.equal(HUNTERS.source(watched)?.night,5,"el seguidor visible requiere un indicio válido");
const watch=HUNTERS.summary(watched);
assert.equal(watch.active,true);
assert.equal(watch.history.length,5);
assert.match(watch.history[0],/Noche 3/);
assert.match(watch.history[4],/Noche 7/);
assert.doesNotMatch(watch.history.join(" "),/Etienne|Moreau|Senescal|impostora/);
assert.equal(JSON.stringify(watched),watchedSnapshot,"consultar el diario no debe alterar la partida");
assert.equal(HUNTERS.summary({...watched,scene:"paris"}).active,false);
assert.ok(engine.includes("const watch=HUNTERS.summary(game);"));
assert.ok(engine.includes("Seguimiento civil sin identificar"));
assert.ok(engine.includes("for(const event of watch.history)"));
console.log("OK: diario de vigilancia civil y respaldo recuperable sin filtrar secretos");
