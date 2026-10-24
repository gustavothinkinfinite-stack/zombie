"use strict";
/* Misiones secundarias y horarios — contenido original del videojuego.
   No se presenta como canon adicional del material de campaña. */
window.VTM_ARCS = Object.freeze({
 factions:{
  camarilla:{name:"Camarilla",color:"#b9a28e"},
  brujah:{name:"Brujah de París",color:"#b57570"},
  nosferatu:{name:"Red Nosferatu",color:"#85a79b"},
  tremere:{name:"Casa Tremere",color:"#a696bf"}
 },
 personal:{
  ingrid:{
   id:"ingrid",title:"Nombres bajo la piedra",faction:"nosferatu",origin:"tuneles",target:"policia",
   offer:"Ingrid necesita confirmar la identidad de un informante comprometido. Sospecha que un expediente policial revela uno de los accesos de los Nosferatu. Te pide que averigües qué aparece en el registro antes de que alguien lo copie.",
   objective:"Entrá al Archivo policial y rastreá un expediente relacionado con un acceso subterráneo. Volvé a Ingrid con lo encontrado.",
   report:"Ingrid escucha tu informe sin interrumpir. Guarda la referencia en una libreta impermeable.",
   options:[
    {key:"quiet",label:"Copiar sólo los datos útiles, sin tocar el original",attr:"Inteligencia",skill:"Investigación",difficulty:6,success:"Identificaste el nombre del informante sin dejar alteraciones en el registro.",failure:"Encontraste la referencia, pero el empleado advirtió tu consulta repetida.",exposure:3,bonus:2},
    {key:"delete",label:"Intentar borrar la referencia comprometida",attr:"Destreza",skill:"Seguridad",difficulty:7,success:"La referencia desapareció del índice sin levantar sospechas.",failure:"Dejaste una modificación evidente en el archivo informatizado.",exposure:13,bonus:6}
   ]
  },
  lucien:{
   id:"lucien",title:"Testigos de Saint-Denis",faction:"brujah",origin:"bastilla",target:"saintdenis",
   offer:"Lucien cree que una pelea nocturna puede enfrentar a los Brujah con las autoridades del Principado. Quiere saber quién alentó el conflicto y evitar que todos carguen con la culpa de unos pocos.",
   objective:"Recorré Saint-Denis, encontrá una versión de los hechos y volvé con Lucien antes de que circulen acusaciones.",
   report:"Lucien aprieta los labios mientras escucha. «Las palabras de esta noche van a pesar en las próximas.»",
   options:[
    {key:"listen",label:"Hablar con testigos sin tomar partido",attr:"Percepción",skill:"Empatía",difficulty:6,success:"Dos testigos coinciden en que el enfrentamiento fue provocado deliberadamente.",failure:"La gente evita hablar. Aun así, recuperaste una descripción parcial.",exposure:2,bonus:2},
    {key:"pressure",label:"Presionar a un sospechoso para obtener una confesión",attr:"Manipulación",skill:"Intimidación",difficulty:7,success:"El sospechoso revela quién lo animó a provocar una pelea.",failure:"El sospechoso avisa a sus compañeros y la tensión se extiende por la calle.",exposure:19,bonus:6}
   ]
  },
  isabelle:{
   id:"isabelle",title:"El sello de Passy",faction:"tremere",origin:"stjuly",target:"passy",
   offer:"Isabelle Dubois necesita recuperar la copia de una comunicación sellada en Passy. El encargo parece menor, pero exige discreción: un error se interpretaría como una falta de disciplina ante el Alto Regente.",
   objective:"Visitá Passy, encontrá la copia del sello y regresá al St. July para entregar tu informe a Isabelle.",
   report:"Isabelle examina tus notas y asiente lentamente. «En esta casa, evitar un problema también es una forma de éxito.»",
   options:[
    {key:"formal",label:"Solicitar acceso mediante protocolo",attr:"Carisma",skill:"Etiqueta",difficulty:6,success:"Un empleado te entrega una copia legítima del documento.",failure:"Te demoraron con preguntas, pero lograste anotar la referencia de archivo.",exposure:1,bonus:2},
    {key:"stealth",label:"Buscar la copia sin anunciar tu visita",attr:"Destreza",skill:"Sigilo",difficulty:7,success:"Copiaste la referencia antes de que alguien notara tu presencia.",failure:"Un custodio te vio junto al registro y dejó constancia de la visita.",exposure:15,bonus:6}
   ]
  }
 },
 schedules:{
  isabelle:{start:21,end:3},ingrid:{start:20,end:5},lucien:{start:19,end:2},john:{start:22,end:4},
  marcus:{start:20,end:1},dupont:{start:19,end:2},archivista:{start:18,end:5},guardiana:{start:20,end:4}
 }
});