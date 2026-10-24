"use strict";
/* Crónicas de París — Fase XIX · decisiones tácticas compatibles con VTM_TACTICS.
 * Rango abstracto y cobertura por intercambio; no altera heridas, Sangre ni equipo.
 */
window.VTM_ADVANCED_TACTICS=(()=>{
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const MOVES=Object.freeze(["cubrirse","avanzar","retroceder","apuntar","flanquear"]);
 function init(g){
  const a=g?.combat?.active;
  if(!a)return null;
  let s=a.tactical;
  if(!s||typeof s!=="object"||Array.isArray(s))s=a.tactical={};
  s.distance=clamp(Math.floor(Number.isFinite(+s.distance)?+s.distance:1),0,2);
  s.cover=clamp(Math.floor(Number(s.cover)||0),0,2);
  s.enemyCover=clamp(Math.floor(Number(s.enemyCover)||0),0,1);
  s.aim=clamp(Math.floor(Number(s.aim)||0),0,2);
  s.flank=!!s.flank;
  s.turn=Math.max(0,Math.floor(Number(s.turn)||0));
  return s;
 }
 function valid(g,choice){
  const s=init(g);if(!s)return "No hay combate activo.";
  if(choice==="avanzar"&&s.distance===0)return "Ya estás a distancia de contacto.";
  if(choice==="retroceder"&&s.distance===2)return "No queda una retirada adicional dentro de la escena.";
  if(choice==="cubrirse"&&s.cover===2)return "Ya tenés la mejor cobertura disponible.";
  if(choice==="apuntar"&&s.aim===2)return "Ya estás apuntando con la máxima precisión.";
  if(choice==="flanquear"&&s.flank)return "Ya tenés al rival flanqueado.";
  if(["golpe","arma"].includes(choice)&&s.distance>0)return "Necesitás acercarte para alcanzar al adversario.";
  if(choice==="disparo"&&s.distance===0)return null;
  return null;
 }
 function move(g,choice,log,rng=Math.random){
  const s=init(g);if(!s||!MOVES.includes(choice))return false;
  s.turn++;
  if(choice==="cubrirse"){s.cover=clamp(s.cover+1,0,2);s.aim=0;log.push("Te desplazás hacia una protección sólida (cobertura "+s.cover+"/2).");}
  if(choice==="avanzar"){s.distance--;s.cover=0;s.aim=0;log.push("Cerrás la distancia y quedás "+range(s.distance)+".");}
  if(choice==="retroceder"){s.distance++;s.aim=0;log.push("Te replegás hasta quedar "+range(s.distance)+".");}
  if(choice==="apuntar"){s.aim=clamp(s.aim+1,0,2);log.push("Esperás el instante adecuado y mejorás el próximo disparo (puntería +"+s.aim+").");}
  if(choice==="flanquear"){
   const dex=Math.max(1,Number(g.character?.attr?.Destreza)||1);
   const ath=Math.max(0,Number(g.character?.skills?.Atletismo)||0);
   let dice=0,ones=0;
   for(let i=0;i<dex+ath;i++){const value=Math.floor(rng()*10)+1;if(value>=7)dice++;if(value===1)ones++;}
   if(dice>ones){s.flank=true;s.enemyCover=0;log.push("Encontraste un ángulo lateral: la cobertura enemiga queda anulada para tu siguiente ataque.");}
   else{log.push("El adversario anticipó el flanqueo; quedaste expuesto.");s.cover=0;}
   s.aim=0;
  }
  return true;
 }
 function range(distance){return ["cuerpo a cuerpo","a distancia media","a distancia larga"][distance]||"a distancia desconocida";}
 function outgoing(g,choice){
  const s=init(g);if(!s)return 0;
  let bonus=0;
  if(choice==="disparo")bonus+=s.aim-(s.distance===2?1:0);
  if(["golpe","arma","disparo"].includes(choice))bonus+=(s.flank?2:0)-s.enemyCover;
  return bonus;
 }
 function incoming(g,choice){
  const s=init(g);if(!s)return 0;
  let reduction=s.cover+(s.distance===2?1:0);
  if(choice==="apuntar")reduction=Math.max(0,reduction-1);
  return reduction;
 }
 function enemyMove(g,enemy,log){
  const s=init(g);if(!s)return false;
  const armed=enemy.style==="armado"&&enemy.ammo>0;
  if(s.distance>0&&!armed){
   s.distance=Math.max(0,s.distance-1);
   log.push("El rival avanza para llegar a distancia de ataque. Posición: "+range(s.distance)+".");
   return true;
  }
  // Los adversarios armados pueden buscar cobertura mientras siguen disparando.
  if(armed&&enemy.health<=Math.ceil(enemy.max/2)&&s.enemyCover===0){
   s.enemyCover=1;log.push("El rival herido se protege tras un obstáculo.");
  }
  return false;
 }
 function after(g,choice){
  const s=init(g);if(!s)return;
  if(["golpe","arma","disparo"].includes(choice)){s.aim=0;s.flank=false;}
  if(choice==="huida"){s.cover=0;s.aim=0;}
 }
 function summary(g){
  const s=init(g);if(!s)return "Sin intercambio táctico.";
  return "Posición: "+range(s.distance)+" · cobertura "+s.cover+"/2 · cobertura rival "+s.enemyCover+
    " · apuntado +"+s.aim+(s.flank?" · flanqueo activo":"");
 }
 return Object.freeze({MOVES,init,valid,move,range,outgoing,incoming,enemyMove,after,summary,version:"19.0"});
})();