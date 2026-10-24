"use strict";
/* Crónicas de París — Guardado local con una copia recuperable.
 * No altera la estructura del objeto guardado ni sus migraciones.
 * El respaldo conserva el último guardado principal válido; nunca se reemplaza
 * por contenido ilegible. La recuperación requiere confirmación en la interfaz.
 */
window.VTM_SAVE=(()=>{
 const backupKey=key=>key+"-backup";
 function parse(raw,clans){
  if(typeof raw!=="string"||!raw)return null;
  try{
   const data=JSON.parse(raw);
   return data&&typeof data==="object"&&!Array.isArray(data)&&data.version===1&&
    data.character&&typeof data.character==="object"&&
    Object.prototype.hasOwnProperty.call(clans||{},data.character.clan)?data:null;
  }catch(e){return null;}
 }
 function save(storage,key,game,clans){
  try{
   const payload=JSON.stringify(game);
   if(!parse(payload,clans))return false;
   const current=storage.getItem(key);
   const oldBackup=storage.getItem(backupKey(key));
   // Si el principal está dañado, jamás duplicar ese daño en el respaldo.
   // Si el respaldo ya es válido, conservarlo para una futura recuperación.
   const backup=parse(current,clans)?current:(parse(oldBackup,clans)?null:payload);
   if(backup!==null&&backup!==oldBackup){
    storage.setItem(backupKey(key),backup);
    if(storage.getItem(backupKey(key))!==backup)return false;
   }
   // Escritura al final: si falla preparar el respaldo no se toca el principal.
   storage.setItem(key,payload);
   return storage.getItem(key)===payload;
  }catch(e){return false;}
 }
 function load(storage,key,clans){
  try{
   const primary=parse(storage.getItem(key),clans);
   if(primary)return{game:primary,fromBackup:false};
   const backup=parse(storage.getItem(backupKey(key)),clans);
   if(backup)return{game:backup,fromBackup:true};
  }catch(e){}
  return null;
 }
 function hasSavedData(storage,key){
  try{
   // Incluso una partida ilegible cuenta para pedir confirmación de reemplazo.
   return !!(storage.getItem(key)||storage.getItem(backupKey(key)));
  }catch(e){return null;}
 }
 return Object.freeze({backupKey,parse,save,load,hasSavedData});
})();
