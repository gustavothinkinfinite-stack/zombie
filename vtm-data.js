/* Último Refugio: Crónicas de París | datos de reglas y ambientación
 * Referencia: Vampiro: La Mascarada 3.ª edición, pp. 103, 104, 106, 130-134.
 * La etapa ghoul, el aprecio y las misiones son adaptaciones propias del videojuego.
 */
window.VTM_DATA = Object.freeze({
 clans: {
   Brujah:{master:"Lucien",title:"Intermediario Brujah de la Camarilla",sire:"Lucien",newNPC:false,accent:"#ad6465",disciplines:["Celeridad","Potencia","Presencia"],opening:"La rebeldía no es una excusa para la imprudencia. Demostrá que sabés proteger a los tuyos.",voice:"directa",area:"Bastilla"},
   Gangrel:{master:"Gabriel Forestier",title:"Vigilante de los límites de París",newNPC:true,accent:"#90ad7b",disciplines:["Animalismo","Fortaleza","Protean"],opening:"La ciudad tiene caminos que nadie ve. Si aprendés a escucharlos, quizá sobrevivas.",voice:"reservada",area:"Bois de Vincennes"},
   Malkavian:{master:"Marianne Delacroix",title:"Oráculo de las noches parisinas",newNPC:true,accent:"#b6a7cd",disciplines:["Auspex","Dementación","Ofuscación"],opening:"Algunas puertas sólo se abren cuando uno deja de fingir que no escucha.",voice:"inquietante",area:"Montmartre"},
   Nosferatu:{master:"Erebos",title:"Referente de la red Nosferatu",newNPC:false,accent:"#8fa198",disciplines:["Animalismo","Ofuscación","Potencia"],opening:"Traeme información útil. Lo que otros susurran vale mucho más que su dinero.",voice:"desconfiada",area:"Red subterránea"},
   Toreador:{master:"Pierre Duvalier",title:"Príncipe Toreador de París",newNPC:false,accent:"#c1a48c",disciplines:["Auspex","Celeridad","Presencia"],opening:"En esta ciudad, un gesto elegante puede salvarte; una palabra inoportuna puede condenarte.",voice:"cortesana",area:"Elíseo"},
   Tremere:{master:"Marcus von Württemberg",title:"Alto Regente Tremere en París",newNPC:false,accent:"#b28fba",disciplines:["Auspex","Dominación","Taumaturgia"],opening:"La obediencia se prueba con actos medidos y resultados verificables. No acepto improvisaciones.",voice:"rigurosa",area:"Passy"},
   Ventrue:{master:"Lord Thomas Wyndham",title:"Sheriff del Principado de París",newNPC:false,accent:"#92add0",disciplines:["Dominación","Fortaleza","Presencia"],opening:"La discreción, el honor y la eficacia siguen siendo exigibles, incluso en una noche de crisis.",voice:"formal",area:"Residencia del Sheriff"}
 },
 attributes:{
   Físicos:["Fuerza","Destreza","Resistencia"],
   Sociales:["Carisma","Manipulación","Apariencia"],
   Mentales:["Percepción","Inteligencia","Astucia"]
 },
 abilities:{
   Talentos:["Alerta","Atletismo","Callejeo","Empatía","Esquivar","Expresión","Intimidación","Liderazgo","Pelea","Subterfugio"],
   Técnicas:["Armas Cuerpo a Cuerpo","Armas de Fuego","Conducir","Etiqueta","Interpretación","Pericias","Seguridad","Sigilo","Supervivencia","Trato con Animales"],
   Conocimientos:["Academicismo","Ciencias","Finanzas","Informática","Investigación","Leyes","Lingüística","Medicina","Ocultismo","Política"]
 },
 backgrounds:["Aliados","Contactos","Criados","Fama","Influencia","Recursos"],
 virtues:["Conciencia","Autocontrol","Coraje"],
 archetypes:["Ansioso de Emociones","Arquitecto","Autócrata","Bellaco","Bizarro","Bravucón","Bufón","Celebrante","Competidor","Confabulador","Conformista","Director","Fanático","Hosco","Juez","Mártir","Masoquista","Monstruo","Niño","Pedagogo","Penitente","Perfeccionista","Pervertido","Protector","Rebelde","Solitario","Superviviente","Tradicionalista","Visionario","Vividor"],
 locations:[
   {id:"hemeroteca",name:"Hemeroteca de París",kind:"Investigación",x:230,y:115,w:168,h:105,detail:"Pierre Dupont investiga sucesos nocturnos"},
   {id:"stjuly",name:"Club St. July",kind:"Favores",x:515,y:112,w:158,h:116,detail:"Punto de encuentro bajo influencia Tremere"},
   {id:"elysee",name:"Elíseo",kind:"Política",x:805,y:130,w:145,h:119,detail:"La corte de Pierre Duvalier"},
   {id:"saintdenis",name:"Calles de Saint-Denis",kind:"Combate",x:820,y:398,w:155,h:118,detail:"Un conflicto que amenaza la Mascarada"},
   {id:"tuneles",name:"Acceso a los túneles",kind:"Investigación",x:475,y:422,w:173,h:115,detail:"Informantes vinculados a Erebos"},
   {id:"policia",name:"Archivo policial",kind:"Investigación",x:180,y:408,w:177,h:114,detail:"Expedientes sobre hechos inexplicables"},
   {id:"passy",name:"Casa de Passy",kind:"Favores",x:690,y:280,w:138,h:92,detail:"Influencia del clan Tremere"},
   {id:"bastilla",name:"Bastilla",kind:"Política",x:325,y:265,w:141,h:89,detail:"Terreno de encuentros y fricciones Brujah"}
 ],
 quests:[
   {id:"archivos",title:"Los documentos de Pierre Dupont",kind:"Investigación",place:"hemeroteca",summary:"Investigá las fuentes de Pierre Dupont: inspeccioná el archivo policial y conseguí información en el St. July antes de recuperar o neutralizar sus documentos.",skill:"Investigación",attr:"Inteligencia",difficulty:6,praise:29,penalty:15,normal:"Las pruebas están a salvo sin comprometer la Mascarada.",fail:"La prensa recibió nuevas sospechas sobre hechos sobrenaturales."},
   {id:"prensa",title:"El periodista indiscreto",kind:"Investigación",place:"hemeroteca",summary:"Descubrí qué sabe Pierre Dupont sobre incidentes nocturnos.",skill:"Subterfugio",attr:"Manipulación",difficulty:6,praise:26,penalty:10,normal:"Pierre Dupont dejó escapar un detalle relevante sin sospechar tu propósito.",fail:"Pierre Dupont percibe contradicciones y se vuelve más cauteloso."},
   {id:"club",title:"Un favor en el St. July",kind:"Favores",place:"stjuly",summary:"Entregá un mensaje cifrado sin revelar quién lo envía.",skill:"Etiqueta",attr:"Carisma",difficulty:6,praise:22,penalty:9,normal:"El mensaje cambia de manos discretamente.",fail:"Tu llegada genera preguntas incómodas."},
   {id:"audiencia",title:"Una audiencia delicada",kind:"Política",place:"elysee",summary:"Resolvé una ofensa menor antes de que escale en la corte.",skill:"Política",attr:"Astucia",difficulty:7,praise:30,penalty:14,normal:"Tus palabras evitan una confrontación entre miembros de la corte.",fail:"La disputa crece y el incidente llega a oídos del príncipe."},
   {id:"pasadizos",title:"Ecos bajo la ciudad",kind:"Investigación",place:"tuneles",summary:"Obtené información de un intermediario Nosferatu.",skill:"Callejeo",attr:"Percepción",difficulty:6,praise:26,penalty:11,normal:"Una pista valiosa emerge de los pasadizos.",fail:"Tu pregunta llega a quienes no deberían escucharla."},
   {id:"encuentro",title:"El altercado de Saint-Denis",kind:"Combate",place:"saintdenis",summary:"Desactivá una amenaza sin exponer la Mascarada.",skill:"Pelea",attr:"Destreza",difficulty:6,praise:32,penalty:16,normal:"Reducís al agresor sin atraer la atención pública.",fail:"El enfrentamiento deja testigos y consecuencias."},
   {id:"passy",title:"Una encomienda en Passy",kind:"Favores",place:"passy",summary:"Recuperá discretamente un objeto destinado al regente Tremere.",skill:"Sigilo",attr:"Destreza",difficulty:6,praise:28,penalty:12,normal:"La encomienda está a salvo y nadie percibe el intercambio.",fail:"Un guardia interrumpe la operación."},
   {id:"bastilla",title:"Lealtades en disputa",kind:"Política",place:"bastilla",summary:"Averiguá quién intenta enfrentar a los Brujah con la Camarilla.",skill:"Empatía",attr:"Percepción",difficulty:6,praise:27,penalty:11,normal:"Identificás a un agitador sin implicarte en la disputa.",fail:"Tus sospechas provocan hostilidad."}
 ],
 lore:{
  prince:"Pierre Duvalier",sheriff:"Lord Thomas Wyndham",seneschal:"Etienne Moreau",
  tremere:"Marcus von Württemberg",tremereLieutenant:"Isabelle Dubois",nosferatu:"Erebos",
  nosferatuAgent:"Ingrid",bruja:"Lucien",journalist:"Pierre Dupont",
  sheriffChilde:"John Winthrop",club:"St. July",
  note:"Se respetan nombres y jerarquías conocidas; la verdad oculta sobre la Senescal no se revela al jugador."
 }
});