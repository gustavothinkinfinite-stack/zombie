# Crónicas de París — Juego web de Vampiro: La Mascarada (prototipo 0.4 · rediseño visual 2.0 fases I–III)

RPG 2D narrativo de pixel art oscuro, ambientado en **el Principado de París** creado previamente para la campaña del usuario. El personaje comienza como **humano ghoul** al servicio de un Domitor vampiro. **No hay zombis ni oleadas** en esta versión.

- **Juego:** https://wheat-chough-542895.hostingersite.com/
- **GitHub:** https://github.com/gustavothinkinfinite-stack/zombie
- **Configuración de despliegue:** https://hpanel.hostinger.com/websites/wheat-chough-542895.hostingersite.com/advanced/git
- **Rama:** \`main\`
- **Ruta de alojamiento:** \`public_html\`
- **Tecnología:** HTML + CSS + JavaScript Canvas, sin compilación ni servidor.

## Rediseño visual 2.0 — Fase III, primera entrega (23 de octubre de 2026)

- **Hoja de sprites reutilizable** en \`assets/personajes-paris-v2.svg\`: 16 personajes/variantes, cuatro direcciones y dos cuadros de marcha por dirección. Los sprites ya son archivos independientes que pueden sustituirse sin modificar la lógica de las misiones. Es un primer pixel art vectorial, **no arte profesional definitivo**.
- **Motor visual con respaldo:** \`vtm-graphics.js\` muestra el atlas SVG cuando está listo; si la imagen falla o no se descarga, dibuja los sprites anteriores.
- **Colisiones con mobiliario:** \`vtm-physics.js\` impide atravesar mesas, estanterías, camas y mostradores en residencias e interiores. Permite deslizarse por los bordes.
- **Movimiento por clic con rutas:** se calculan recorridos para rodear obstáculos en vez de caminar en línea recta. El control mediante WASD/flechas sigue disponible.
- **Compatibilidad con las partidas anteriores:** si una partida se guardó dentro del área ahora ocupada por un obstáculo, el personaje se coloca en una posición legal cercana sin alterar los datos de la ficha.
- **Pruebas realizadas:** dieciocho rutas hacia puertas, salidas, PNJ y objetos, ejecutadas fotograma por fotograma, y estructura de hoja de sprites. Se conservan el creador, el sistema de aprecio, las misiones y el Abrazo.

**Todavía pendiente:** nuevos tilesets ilustrados para París, escenarios con obstáculos variados a escala mayor, sprites con más fotogramas y una mayor diferenciación visual entre personajes secundarios.

## Rediseño visual 2.0 — Fase II (23 de octubre de 2026)

**Nueva implementación del mundo 2D:**

- \`vtm-graphics.js\` es un módulo Canvas 2D nuevo. Dibuja escenarios por procedimientos y reutiliza los fondos estáticos en memoria para no regenerar toda la ciudad y las habitaciones en cada fotograma.
- **París renovado:** calles y fachadas con detalles, ventanas iluminadas, farolas, Sena, puentes, árboles, vehículos y marcadores de misión.
- **Residencias por clan:** todas las combinaciones de siete clanes por salón, estudio y aposentos (21 vistas) usan nuevas texturas y decoraciones. Las coordenadas de interacción siguen siendo las mismas.
- **Interiores:** ocho localizaciones con arquitectura y objetos según el tipo de establecimiento; presentes físicamente en las escenas de investigación.
- **Sprites actualizados:** protagonista y PNJ con rasgos y colores por clan, cuatro direcciones de orientación y animación sencilla de marcha, más etiquetas discretas para personajes cercanos.
- **Atmósfera:** lluvia y partículas ambientales, halos luminosos en faroles y señalización sutil de objetos.
- **Opción FX:** botón para activar/desactivar lluvia y partículas; se guarda la preferencia de manera independiente de la partida y usa inicialmente \`prefers-reduced-motion\` del navegador.
- **Compatibilidad:** el sistema de aprecio, diálogos, misiones, fichas y guardado no cambia; el motor previo queda como reserva.

**Comprobaciones:** sintaxis de los archivos JS, referencias HTML, ejecución simulada de 21 habitaciones, ocho interiores, movimiento en París y guardado de una partida de la etapa anterior. La preferencia de FX también se probó activada y desactivada.

**Alcance real:** estos son fondos/sprites detallados **dibujados por código**, no un tileset ilustrado definitivo. No se han incorporado colisiones con mobiliario, animaciones completas con hojas de sprites ni mapas desplazables extensos. La publicación pública sigue dependiendo de completar el despliegue en Hostinger.

## Rediseño visual 2.0 — Fase I (23 de octubre de 2026)

**Nueva presentación, sin alterar las reglas ni los datos guardados:**
- **HUD y panel de juego:** tipografía y jerarquía visual renovadas, nueva paleta nocturna gótica, indicadores superpuestos sobre el escenario para nombre/condición/hora y exposición de la Mascarada. Paneles laterales más claros para Domitor, aprecio, misiones y política.
- **Diálogos:** presentación cinematográfica, retrato a la izquierda cuando habla un personaje, respuestas numeradas y mejor legibilidad. Los cuadros narrativos sin personaje hablante aprovechan toda la anchura.
- **Retratos:** primeros bustos de mayor resolución interna (144 × 176) para los siete Domitores y los PNJ existentes, con colores, atuendo, rostro y cabello diferenciados. Siguen siendo ilustraciones programáticas provisionales, no imágenes finales ilustradas.
- **Presentación responsive:** escritorio y móvil, con controles táctiles conservados, estados acompañados de texto y opción de movimiento reducido.
- **CSS independiente:** el archivo \`visual-2.css\` se carga después de \`style.css\` para separar el rediseño del motor del juego y permitir iteraciones seguras.
- **Guía artística:** [GUIA_VISUAL_2_0.md](GUIA_VISUAL_2_0.md) define paleta, composición, retratos, especificación de assets y futuras fases.

**Importante:** esta fase **no** sustituye todavía los tilesets y sprites del mapa por arte definitivo. La recreación completa de París, residencias y animaciones pertenece a las fases II–IV.

**Pruebas realizadas:** compilación sintáctica de los archivos JS, correspondencia entre IDs de HTML y referencias del motor, reglas CSS equilibradas, carga de una partida previa, sincronización del HUD, renderizado de retratos de los siete Domitores, ocultación de retratos en diálogos narrativos y conservación del acceso a misiones.

## Versión 0.4 — Facciones, encargos personales y horarios (octubre de 2026)

**Tres cadenas de encargos personales nuevas**, independientes del encargo principal del Domitor:

- **Ingrid — «Nombres bajo la piedra»:** desde los túneles Nosferatu al archivo policial. Elegís recuperar los datos discretamente o intentar borrar la referencia, con tiradas, riesgos y reputación.
- **Lucien — «Testigos de Saint-Denis»:** desde Bastilla a Saint-Denis. Podés escuchar a testigos o presionar a un sospechoso. La resolución repercute tanto en los Brujah como en la Camarilla.
- **Isabelle Dubois — «El sello de Passy»:** desde el St. July a Passy. Podés tramitar formalmente una copia o buscarla sin permiso. Afecta a la casa Tremere y, parcialmente, a la corte.

**Funcionamiento de los encargos:**
1. Hablar con Ingrid, Lucien o Isabelle en su lugar habitual.
2. Aceptar el encargo, sin perder la misión principal.
3. Visitar la ubicación objetivo y examinar el mueble marcado como \`EXAMINAR\`.
4. Elegir entre dos enfoques con Atributo + Habilidad y dificultad diferentes.
5. Volver al PNJ de origen a rendir el informe. Podés decir la verdad o exagerar tus resultados arriesgándote a una nueva tirada.
6. La relación con el PNJ y la reputación política varían según el resultado. Una misión terminada no se puede repetir para obtener recompensas ilimitadas.

**Sistemas nuevos:**

- **Facciones independientes:** Camarilla, Brujah de París, red Nosferatu y casa Tremere. Reputación de −100 a +100 con historial en el diario. El sistema es una mecánica propia del videojuego, no un valor oficial de la tercera edición.
- **Ventajas y penalizaciones:** a partir de +25/−25 de reputación se suma o resta un dado en determinadas Habilidades (Etiqueta y Política para Camarilla, Pelea para Brujah, Callejeo para Nosferatu, Ocultismo para Tremere). A partir de +20/−20 la reputación modifica la confianza efectiva en encuentros relacionados. Los bonos de favores ya obtenidos siguen funcionando.
- **Reloj nocturno:** número de noche, hora y horarios de presencia específicos para los ocho PNJ de los locales. El tiempo avanza al desplazarse entre edificios y durante las misiones. Si un personaje no está presente, podés **esperar hasta su regreso**. Al llegar el amanecer se salta a la siguiente noche (todavía no hay simulación diurna).
- **Mascarada:** cuando la exposición llega a 60 por primera vez, la Camarilla aplica una reducción de 8 puntos a tu reputación; el efecto no se repite por volver a superar el umbral. Si la exposición alcanza 25, podés pedir al Domitor ayuda para contener los rumores, mediante una tirada y con coste potencial de aprecio, **una vez por noche**.
- **HUD y mapa:** cuatro barras de facciones, reloj, encargos paralelos, nuevos indicadores de objetivos y pistas recogidas. El diario añade una sección de reputación y el estado de los encargos.
- **Compatibilidad:** se inicializan los campos de facciones, reloj, encuentros y encargos al continuar partidas previas. No se eliminan personajes ni partidas existentes.
- **Personajes ausentes:** cuando el horario indica que un PNJ no está en su local, se muestra su puesto vacío y se ofrece esperar; los objetos del lugar siguen siendo explorables.

**Pruebas ejecutadas:** migración de una partida anterior, aceptación de las tres misiones, resolución y entrega de informes, investigación simultánea de Dupont y una misión secundaria en el mismo lugar, recompensas únicas, horario de Isabelle y opción de espera, efecto de fracaso de un encargo, sanción de la Camarilla sin repetición, ayuda del Domitor no repetible en la misma noche y transición al anochecer siguiente.

**Límites:** las misiones nuevas tienen dos etapas y decisiones con dados, pero todavía no constituyen escenas de sigilo o combate en tiempo real. Los horarios se basan en un reloj simulado, no en el tiempo real de París. Las reputaciones no sustituyen los sistemas oficiales de Estatus, Influencia o Prestigio; son una capa mecánica específica del videojuego. No se agregaron revelaciones sobre el verdadero origen de la Senescal.

## Versión 0.3 — Vida social y París nocturno (octubre de 2026)

**Mejoras incorporadas:**

- **París en pixel art ampliado:** nuevos dibujos procedurales para tejados, ventanas, avenidas, farolas, el Sena, puentes y lluvia en movimiento. Los destinos tienen colores por escenario e indicadores de misión. Siguen siendo escenarios **esquemáticos**, no mapas definitivos dibujados a mano.
- **Ocho escenarios con interior:** Hemeroteca, St. July, Elíseo, Saint-Denis, túneles, archivo policial, Passy y Bastilla. Todos permiten entrar, examinar objetos, hablar con su representante y salir a las calles.
- **Retratos pixelados:** bustos personalizados de ocho interlocutores al abrir la conversación. Incluyen cabello, piel, vestimenta y afiliación; son dibujos iniciales programáticos y se sustituirán por sprites definitivos más adelante.
- **Ocho encuentros:** Isabelle Dubois, Ingrid, Lucien, John Winthrop, Marcus von Württemberg y Pierre Dupont (establecidos en la campaña); la Guardiana del Elíseo y el Encargado del archivo policial (roles sin nombre propio de este prototipo).
- **Primeras impresiones persistentes:** presentación mediante una tirada de Atributo + Habilidad apropiada al interlocutor, modificando su confianza entre −3 y +3. Cada primera impresión sólo puede resolverse una vez.
- **Rumores y favores:** conversaciones independientes por PNJ, pistas de contexto y referencias obtenibles tras ganarse la confianza. Los favores pueden otorgar +1 dado en una Habilidad concreta o facilitar trámites sociales. No se pueden pedir indefinidamente.
- **Control de acceso al Elíseo:** se entra con recomendación reconocible (por ejemplo, la invitación encontrada en la residencia), con la referencia de Isabelle Dubois o superando una tirada social. Si fallás, sigue existiendo una ruta para conseguir acceso.
- **Diario y HUD:** registro de los contactos conocidos, sus relaciones y favores, más el estado del acceso al Elíseo.
- **Compatibilidad:** la versión 0.3 amplía las partidas guardadas de las versiones 0.1 y 0.2 sin borrar personajes, misiones, pistas, aprecio ni Disciplinas. La confianza de Pierre Dupont en sus encuentros se sincroniza con el resultado de la investigación.

**Pruebas completadas:** carga de los cinco archivos JS, comprobación de selectores HTML, migración de partida antigua, acceso denegado al Elíseo, obtención y uso de invitación, interacción con los ocho PNJ, primeras impresiones no repetibles, misión de Pierre Dupont por dos fuentes, informe al Domitor y persistencia de las relaciones.

**Límites actuales:** la lluvia y los elementos urbanos son gráficos programáticos, no sprites ilustrados finales. Los interiores comparten parte de su estructura. Los PNJ no tienen rutinas diurnas/nocturnas, desplazamiento libre ni misiones personales completas. La exposición de la Mascarada y la reputación tienen efectos limitados y no reemplazan todavía un sistema completo de investigación policial o consecuencias políticas. No se revelan al jugador secretos sobre la Senescal ni la conspiración.

### Recorrido recomendado de la versión 0.3

Entrá en el despacho del Domitor, examiná los documentos, visitá la ciudad, conocé a Isabelle Dubois en el St. July y pedí una referencia después de mejorar su confianza. Probá el acceso al Elíseo. También podés encontrar una invitación examinando la mesa del salón de tu residencia. Pedile al Domitor la investigación de Pierre Dupont y reuní pruebas antes de confrontarlo. Volvé a informar para modificar el aprecio.

**Publicación:** los commits están en `main`. Revisar el último despliegue de Hostinger y pulsar **Redeploy** si todavía sirve una versión anterior; cambiar el código en GitHub por sí solo no confirma el despliegue del sitio.

## Versión 0.2 — Residencia e investigación ramificada (23 de octubre de 2026)

**Primera expansión implementada sobre la versión 0.1:**

- **Tres habitaciones navegables en la residencia:** salón principal con el Domitor, despacho/biblioteca y habitaciones privadas. Se entra y sale mediante puertas, no mediante menús.
- **Identidad de cada clan:** paleta, mobiliario, ambiente y textos de observación específicos para los siete Domitores.
- **Objetos interactivos:** cuadros, invitaciones, correspondencia, armarios, mapas, baúles, cuadernos y ventanas. Los objetos examinados se recuerdan y registran en el diario.
- **Diálogos con tiradas y decisiones:** saludo formal con Carisma + Etiqueta, lectura emocional del maestro con Percepción + Empatía, respuestas desafiantes y lecciones sobre la corte. Los eventos de aprobación única no se pueden repetir para acumular aprecio.
- **Primera investigación completa:** *Los documentos de Pierre Dupont*. Antes de confrontar al periodista debés investigar dos fuentes entre la Hemeroteca de París, el Archivo Policial y el St. July. Los tres lugares tienen interiores que podés recorrer y objetos que examinar.
- **Tres enfoques de confrontación:** negociación con Carisma + Empatía; robo con Destreza + Sigilo; intimidación con Manipulación + Intimidación. Cada uno permite éxitos o fracasos mediante dados y distintas consecuencias.
- **Consecuencias persistentes:** relación con Dupont (−5 a +5), exposición de la Mascarada (0 a 100), pruebas recogidas, método escogido, objetos inspeccionados e historial. Se muestran en el HUD y el Diario.
- **Compatibilidad con partidas 0.1:** se inicializan automáticamente los nuevos campos al cargar la partida, conservando personaje, aprecio, encargo y estado del Abrazo.
- **Corrección adicional:** reiniciar los 3 puntos iniciales de Disciplinas en la ceremonia ahora funciona.

Se mantiene una implementación **prototipo**, con ocho encargos definidos en datos, aunque la misión previa *El periodista indiscreto* se reserva y se salta tras finalizar *Los documentos de Pierre Dupont*, para no repetir de inmediato el mismo asunto.

La exposición actualmente **se registra y modifica** según las acciones, pero todavía no desencadena cazadores automáticos, castigos del Príncipe ni un sistema policial completo. Las relaciones con PNJ sirven como estado persistente para futuras ramificaciones.

**Controles de la residencia:** acercate a las puertas de los extremos del salón para entrar al despacho o los aposentos; con `E` examinás los objetos cercanos y volvés al salón por la salida inferior. En París, acercate al Archivo Policial, al St. July o a la Hemeroteca, entrá y examiná el mueble de archivos para conseguir una pista. Hablá con Pierre Dupont después de reunir al menos dos.

## Pruebas de regresión de la versión 0.2

- Se validó acceso desde una partida anterior y migración de guardado.
- Recorrido del despacho e inspección de correspondencia.
- Protección contra obtención reiterada de aprecio por el mismo diálogo.
- Aceptación de misión, acceso a la comisaría, recolección de pista, acceso al St. July, segunda pista, confrontación, retorno e informe.
- Camino positivo de negociación y negativo de intimidación, con exposición y relación.
- Abrazo, redistribución/reinicio de tres puntos de Disciplinas.
- Renderizado de salón, despacho y habitaciones para los siete clanes sin excepción de JavaScript.
- Comprobación de los identificadores del HTML y sintaxis de los archivos JS.

**Pendiente de verificación externa:** no se puede afirmar que Hostinger sirve la nueva versión hasta confirmar un despliegue posterior a estos commits y abrir la URL pública. La integración GitHub→Hostinger figuraba configurada previamente.

## Características incorporadas

1. **Creador en seis pasos:** concepto/nombre, clan del Domitor, Naturaleza, Conducta, Atributos, Habilidades, Trasfondos, Virtudes y puntos gratuitos.
2. **Reglas de Vampiro: La Mascarada 3.ª edición:** Atributos 7/5/3 con 1 punto base cada uno; Habilidades 13/9/5 con máximo 3 durante asignación inicial; Trasfondos 5; Virtudes 7 con 1 punto base; Humanidad = Conciencia + Autocontrol; Fuerza de Voluntad = Coraje; 15 puntos gratuitos y sus costes según manual. Todos los presupuestos son validados.
3. **Creación de ghoul (adaptación propia):** comienza humano, sin Disciplinas, y sólo puede seleccionar Trasfondos de mortal: Aliados, Contactos, Criados, Fama, Influencia y Recursos.
4. **Siete clanes de la Camarilla:** Brujah, Gangrel, Malkavian, Nosferatu, Toreador, Tremere y Ventrue. Un maestro prediseñado para cada uno.
5. **Casa inicial:** vista cenital pixel art. Aparece dentro de la residencia, frente al Domitor; se puede hablar con él y salir a París.
6. **Mapa inicial de París:** selección y desplazamiento físico entre ocho lugares; opciones de investigación, política, favores y combate mediante diálogos.
7. **Sistema de misiones:** ocho encargos repetibles en un ciclo introductorio, dos enfoques de resolución y tiradas d10 (Atributo + Habilidad; cada resultado >= dificultad aporta éxito, los 1 cancelan éxitos).
8. **Aprecio del Domitor:** 0–100; puede subir o bajar con diálogos, cumplimiento y resultados de misiones. Al llegar a 100 se ofrece el Abrazo; el jugador puede aceptarlo o aplazarlo.
9. **Abrazo y Disciplinas:** al aceptar, el personaje se convierte en Vástago del clan de su Domitor y distribuye 3 círculos iniciales entre las Disciplinas del clan.
10. **Guardado local:** partidas persistentes mediante \`localStorage\`, tecla/acción "Guardar" y recuperación desde la portada.

## PNJ y ambientación de la campaña de París

Se han incorporado **con sus nombres y cargos conocidos**:

- **Pierre Duvalier:** Príncipe Toreador de París; Domitor elegible Toreador.
- **Lord Thomas Wyndham:** Sheriff Ventrue; Domitor Ventrue.
- **Marcus von Württemberg:** Alto Regente Tremere; Domitor Tremere.
- **Erebos:** referente Nosferatu; Domitor Nosferatu.
- **Lucien:** Brujah afín a los anarquistas pero fiel a la Camarilla; Domitor Brujah.
- **Etienne Moreau:** Senescal, mencionada únicamente por su cargo *público*. **No revelar secretos de la campaña**.
- **Pierre Dupont:** periodista interesado en incidentes nocturnos.
- **John Winthrop, Ingrid e Isabelle Dubois:** presentes en la base de continuidad narrativa para futuras expansiones.
- **St. July, Elíseo, residencia Tremere de Passy, red Nosferatu, policía y barrios de París:** referencias de escenarios del universo establecido.

**PNJ nuevos, no provenientes del proyecto original confirmado:**
- **Gabriel Forestier**, Domitor Gangrel y guardián de los límites de París.
- **Marianne Delacroix**, Domitor Malkavian de Montmartre.

Los dos últimos son personajes creados **provisionalmente** para completar los siete clanes, no NPC establecidos de la campaña anterior.

**Importante:** el juego todavía NO importa toda la documentación de otro proyecto, la ciudad completa ni todas las fichas de sus PNJ. Esta versión utiliza solamente los datos conocidos. No debe confundirse con una reproducción exhaustiva del Principado.

## Referencia de reglas

El manual aportado por el usuario, *Vampiro: La Mascarada — 3.ª edición*, contiene:
- p. 103 — secuencia y presupuestos del creador, clanes, atributos y habilidades.
- p. 104 — Naturaleza/Conducta, Trasfondos y tabla de costes de puntos gratuitos.
- p. 106 — distribución inicial de rasgos y Virtudes.
- p. 107 — Humanidad y Fuerza de Voluntad.

Las misiones, la barra 0–100 de aprecio, la condición inicial sin Disciplinas y la ceremonia opcional son **reglas adaptadas expresamente para este videojuego**, no procedimientos establecidos por el manual.

## Controles

- \`WASD\` / flechas: movimiento.
- \`E\` / barra espaciadora: hablar / entrar / investigar según proximidad.
- Clic sobre el mapa: caminar hasta el punto.
- En pantallas táctiles: cruceta y botón Interactuar.
- Botones de ficha, diario y guardar: disponibles arriba del escenario.

## Estado y próximos pasos

Ésta es una **versión 0.1**, no un juego terminado. Falta ampliar interiores, retratos/animaciones, mapas transitables completos de París, decisiones a largo plazo, NPC adicionales con rutinas, fichas de salud/combate, equipo, economía de vitae y más profundidad en las misiones.

**Pruebas realizadas antes de la entrega:** carga de scripts, seis pasos de distribución de puntos, inicio del ghoul, conversación, aceptación de un encargo, salida a París, resolución de una tirada, informe al Domitor, cambio de aprecio, Abrazo al 100 % y asignación de Disciplinas.

## No oficial

Prototipo no oficial creado como adaptación de una campaña propia. No incorpora escaneos, ilustraciones ni texto extenso extraídos del manual. No está afiliado a las editoriales ni titulares de la franquicia.
