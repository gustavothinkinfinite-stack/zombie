# Crónicas de París — Guía visual 2.0

**Estado:** Fases I–XXVI integradas en `main` (25 de octubre de 2026). Esta guía es un registro evolutivo: los pendientes descritos en fases anteriores son históricos cuando una fase posterior los resuelve.  
**Alcance:** Interfaz, HUD, diálogos, retratos, ciudad e interiores procedurales, atlas SVG de personajes, colisiones y navegación.  
**Archivos:** \`visual-2.css\` (sistema de presentación), \`index.html\` (composición), \`vtm-game.js\` (integración, estados y movimiento), \`vtm-graphics.js\` (renderizado de mapas y personajes en Canvas).  
**Restricción:** No modificar las reglas de Vampiro, las misiones, el estado de las partidas guardadas ni la ambientación establecida para modernizar la apariencia.

 
## Continuidad visual y narrativa — Fases XIV–XXVI

Esta sección actualiza el alcance del proyecto sin reemplazar los registros históricos de las fases I–XIII. La descripción funcional vigente está en [README.md](README.md); las indicaciones antiguas sobre sistemas «pendientes» deben contrastarse con las fases posteriores antes de implementar cambios.

- **XIV–XVII · Mundo y personajes:** interiores enriquecidos, actores de casos, vida urbana y barrios reactivos. Mantener los mapas y colisiones, el acceso a los lugares, las relaciones sociales y los recorridos ya probados. Referencias: `vtm-art-polish.js`, `vtm-city-life.js`, `vtm-reactive-city.js`, `vtm-reactive-districts.js`.
- **XVIII–XIX · Consecuencias y acción:** sospecha policial, testigos, Mascarada, combate táctico ampliado, sigilo y persecuciones. Preservar el registro de consecuencias, las rutas y la autonomía de los módulos `vtm-city-consequences.js`, `vtm-advanced-tactics.js` y `vtm-stealth-chase.js`.
- **XX · Sangre y Bestia:** conservar la progresión ghoul–Abrazo, el sistema de Sangre y sus efectos sin sustituir las reglas ni estados anteriores. Referencia: `vtm-vitae.js`.
- **XXI · Campaña del Principado:** `vtm-principado.js` y `vtm-conspiracy.js` integran el prólogo y los actos investigativos. La interfaz debe impedir revelaciones anticipadas del secreto de la Senescal y respetar las decisiones persistentes de testigos, pruebas y alianzas.
- **XXIV–XXVI · EP/47 y consecuencias de Elizabeth Parker:** `vtm-parker-dossier.js` agrega una mesa documental de pruebas y contradicciones; `vtm-parker-politics.js` gestiona protección de testigos, audiencia y seguimientos políticos. Su estado pertenece al personaje activo (`parkerDossier`, `parkerPolitics`) y debe restaurarse sin mezclar personajes ni adelantar revelaciones de la Senescal. La UI de `vtm-parker-dossier.css` debe conservar la lectura de documentos y las decisiones no repetibles.
- **Investigaciones coexistentes:** mantener el expediente Elizabeth Parker de fase XII, sus interiores de fase XIII y las cuatro investigaciones locales con sus pruebas y desenlaces. La campaña principal no debe reiniciar `game.elizabeth`, `localCases` ni otros estados preexistentes.
- **Partidas antiguas:** preservar la versión 1, `cronicas-paris-ghoul-v1`, `cronicas-paris-ghoul-v1-backup`, la recuperación con confirmación y las migraciones no destructivas de `vtm-save.js`. Nunca cambiar la estructura de guardado por motivos exclusivamente visuales.
- **Validación:** `.github/workflows/quality.yml` revisa sintaxis de JavaScript/CommonJS y ejecuta recursivamente todos los `tests/**/*.test.js` y `tests/**/*.test.cjs`, incluidos `elizabeth-case.test.js`, `local-cases.test.js`, `save-backup.test.js`, `conspiracy-phase21.test.js` y `parker-dossier-persistence.test.js`. `browser-smoke.yml` prueba Chromium local; `production-smoke.yml` prueba la URL pública en Chromium. La validación de producción comprueba funcionalidades servidas, pero no demuestra por sí sola que Hostinger publique el SHA exacto del último commit.



## Preparación del próximo release

La [hoja de ruta de cazadores XXVII](RELEASE_XXVII.md) distingue encuentros ambientales, seguimiento, persecución, combate opcional e investigación documental. **XXVII-A está integrado y XXVII-B tiene su primera entrega:** observar o evitar vigilancia civil, con consecuencia persistente, y una figura no identificada que puede seguir al personaje por calles transitables. Su navegación se renderiza en Canvas desde `vtm-hunters.js`, sin convertirse en policía. XXVII-C ya ofrece diálogo, retirada o forcejeo defensivo no letal y voluntario ante el observador sin identificar, con línea de visión y distancia limitadas; el daño eventual usa la absorción de `vtm-tactics.js`, pero aún no hay combate por turnos propio; la célula de cazadores identificados y sus combates propios siguen pendientes. No reemplazar los módulos policiales por cazadores ni adelantar identidades secretas en conversaciones, rótulos, mapas, registros o pantallas de derrota. Reutilizar la escala visual y las reglas de accesibilidad existentes sin modificar coordenadas y colisiones. La versión visible sigue siendo fase XXVI hasta aprobar Chromium local y validación de Hostinger.

## Dirección artística

**Gótico urbano de lujo discreto, no medieval ni caricaturesco.** París contemporánea y lluviosa, mármol oscuro, vidrio húmedo, caoba, cuero, metales envejecidos y acentos de vino. La nobleza de la Camarilla debe transmitir autoridad; los Brujah, fricción urbana; los Nosferatu, inteligencia subterránea; los Tremere, orden y secreto.

- No saturar toda la pantalla de rojo; reservarlo para decisiones peligrosas y exposición.
- Las jerarquías deben percibirse por luz, mobiliario, composición y postura, no por textos explicativos extensos.
- Cada PNJ necesita silueta, paleta y gesto distinguibles. La ficha del PNJ debe alimentar tanto su sprite como el retrato.
- Mantener la cámara cenital de 480 × 300 píxeles lógicos por compatibilidad, con escalado pixel-perfect o nearest-neighbour. En futuro, migrar mediante pruebas a 640 × 400 u 800 × 500 píxeles internos si la legibilidad lo permite.

## Paleta de referencia

| Rol | Hex | Uso |
|---|---|---|
| Tinta nocturna | \`#0B0D13\` | Fondo general |
| Panel frío | \`#171922\` | HUD y superficies |
| Panel elevado | \`#22222D\` | Tarjetas y diálogo |
| Bordes discretos | \`#494653\` | Separadores |
| Marfil | \`#F0E3D3\` | Texto principal |
| Gris azulado | \`#9BA1AC\` | Metadatos |
| Latón envejecido | \`#D7B88B\` | Foco, botones principales y rangos |
| Borgoña | \`#B25A69\` | Estado vampírico / peligro |
| Verde grisáceo | \`#87A99A\` | Informantes, Nosferatu, estados seguros |
| Azul acero | \`#8A9FB8\` | Camarilla institucional |
| Violeta gris | \`#A696BF\` | Tremere |

### Aplicación por facción

- **Camarilla / Ventrue:** piedra azulada, reflejos de marfil, oro de baja saturación.
- **Toreador:** vino, cobre, terciopelo y arte contemporáneo.
- **Brujah:** óxido, cuero, ámbar industrial.
- **Nosferatu:** verde húmedo, cemento gris, terminales con luz desaturada.
- **Tremere:** violeta profundo, piedra negra y luz fría.

## HUD — composición de Fase I

1. **Barra de marca:** nombre del juego, contexto de París y estado de la versión.
2. **Cabecera del escenario:** nombre de la ubicación y acciones globales (Ficha, Diario, Guardar, Menú).
3. **Área de juego:** arte cenital con viñeta de borde. Superposición superior: nombre del jugador, condición (ghoul o Vástago) y hora. Superposición inferior: acción contextual y riesgo de la Mascarada.
4. **Lateral de información:** Domitor y su aprecio, existencia del personaje, misión principal, estado de la Mascarada y política, misiones secundarias, registro.
5. **En teléfonos:** el escenario tiene prioridad; HUD lateral se desplaza debajo. Los controles táctiles siguen disponibles.

Los valores de la ficha **no deben duplicarse con lógica independiente**. El HTML usa identificadores \`stageName\`, \`stageState\`, \`stageClock\`, \`stageRiskBar\` y el método \`hud()\` los sincroniza.

## Diálogos — composición de Fase I

- Modal centrado sobre el mapa con fondo atenuado.
- Retrato grande a la izquierda y texto a la derecha cuando un PNJ es el interlocutor.
- Para narración y tiradas sin personaje hablante, sólo texto, usando toda la anchura.
- Encabezado de función (encuentro, Mascarada, investigación, etc.), nombre del hablante, texto de lectura cómoda y botones de decisión bien diferenciados.
- Los retratos de los siete Domitores se identifican por el nombre establecido en los datos del clan. Los PNJ conocidos se leen de \`vtm-npcs.js\`.
- Primeros retratos procedurales: 144 × 176, pixel art detallado, con variaciones de vestimenta, pelo y facciones. Son provisionales hasta contar con arte ilustrado definitivo.

## Implementación efectiva — Fase II

**Nuevo motor visual:** \`vtm-graphics.js\` realiza el dibujo en Canvas 2D sin depender de imágenes externas, librerías de render ni servidores. Genera escenarios de 480 × 300 píxeles lógicos con los mismos puntos de interacción que las versiones anteriores. Los fondos estáticos se reutilizan en memoria por ciudad, clan/sala o interior; los sprites, indicadores de misión y efectos se dibujan sobre ellos.

- **París:** fachadas con ventanas iluminadas, tejados, avenidas, farolas con halos, el Sena, tres puentes, árboles y vehículos. Los ocho accesos conservan sus ubicaciones y su lógica de misión.
- **Residencias:** salón, despacho y aposentos para los siete clanes, con materiales y decoración adaptados a los colores de cada Domitor. Los objetos observables mantienen sus coordenadas de detección.
- **Ocho interiores:** arquitectura y elementos propios para club, túneles, Elíseo, archivos y otros destinos.
- **Sprites 2D:** protagonista y PNJ dibujados con cabeza, rasgos, abrigo, zapatos y ropa diferenciada por clan. Orientación arriba, abajo, izquierda y derecha. La animación de caminar cambia las piernas y el desplazamiento vertical del sprite.
- **Ambientación:** lluvia en capas, polvo interior, iluminación radial y destellos suaves en los objetos importantes.
- **Rendimiento y accesibilidad:** botón \`FX activados / desactivados\` que controla lluvia y partículas; su preferencia se guarda por separado de la partida. Se respeta inicialmente la preferencia del sistema de reducir movimiento.
- **Motor de respaldo:** \`vtm-game.js\` conserva el renderer antiguo como fallback si \`window.VTM_GRAPHICS\` no está disponible, aunque el sitio debe cargar ambos scripts en el orden correcto.

**Todavía pendiente:** sustituir los gráficos generados por un tileset artístico y una hoja de sprites creados por un ilustrador, animación de brazos/gestos, variaciones de ropa personalizables en el creador, colisiones con el mobiliario y mapas de barrios a mayor escala. Los gráficos 2.0 actuales son más ricos, pero siguen siendo **procedurales**, no arte pintado a mano.

### Pruebas de integración

Se ejecutaron pruebas con contextos Canvas simulados de las 21 combinaciones de salón/despacho/aposentos de siete clanes; ocho interiores; París con movimiento del personaje; persistencia del estado anterior (aprecio y ficha); y preferencias de efectos gráficos. No se detectaron excepciones JavaScript en esos recorridos. Una prueba de Canvas simulada no reemplaza una revisión visual en múltiples navegadores ni un despliegue público comprobado.

## Fase III — Primera entrega integrada

**Sprites como recursos independientes.** La hoja local \`assets/personajes-paris-v2.svg\` contiene 16 filas de personajes y siete clanes, cuatro orientaciones y dos cuadros por dirección. Formato 256 × 768, sprites individuales de 32 × 48. \`vtm-graphics.js\` la carga y recorta mediante \`drawImage\`. Si no carga, se emplean los sprites anteriores como respaldo. [Consultar especificación del asset](assets/README.md).

**Interacción física.** \`vtm-physics.js\` incorpora obstáculos de muebles para los tres espacios de las residencias y los ocho interiores. El movimiento por teclado se desliza sobre los bordes en lugar de atravesarlos. Al pulsar sobre un destino en pantalla, calcula rutas transitables en una rejilla lógica, rodeando las mesas y los muebles. Se preservan las coordenadas de interacción de puertas, Domitores, archivos, documentos y salidas.

**Migración.** Las partidas anteriores que guardaban a un personaje dentro de muebles se reposicionan en el lugar transitable más próximo al cargarse, conservando los valores del personaje, misiones, aprecio, contactos y Abrazo. Las rutas son temporales y no se guardan.

**Verificaciones automatizadas:** 18 rutas hacia puntos principales (puertas, Domitor, archivos, objetos, PNJ y salidas), ejecutadas con movimiento simulado a escala de fotogramas y margen de colisión, sin atascarse. La hoja SVG contiene 16 × 4 × 2 = 128 cuadros y 3544 rectángulos de dibujo. La compatibilidad de las escenas y el guardado se verificó anteriormente.

**Pendiente:** arte de entorno ilustrado manualmente, más fotogramas por animación, personalización estética real del protagonista y profundidad de escenarios mediante colisiones con rutas físicas coherentes. El sistema actual sigue siendo un **prototipo**; el atlas es nuevo y editable, pero no constituye arte comercial definitivo.

## Fase IV — Escenarios originales ilustrados

Los ocho destinos de París disponen de nuevos fondos SVG independientes en `assets/escenarios/`: St. July, Elíseo, Passy, túneles, Bastilla, Saint-Denis, hemeroteca y comisaría. Los siete salones principales de los Domitores disponen de fondos específicos en `assets/residencias/`. Se diseñaron manteniendo el espacio de navegación central y los puntos de interacción existentes.

El motor carga las imágenes en segundo plano y preserva el fondo Canvas procedimental como respaldo hasta que el SVG esté listo, o si la carga falla. Las luces animadas se adaptan al lugar cuando los FX están activos.

Las imágenes son vectoriales originales y sustituibles; el mayor detalle artístico sigue siendo trabajo pendiente. Los despachos y habitaciones privadas no cuentan aún con fondos SVG propios.

## Fase V — Despachos y habitaciones privadas

La serie de residencias está cubierta en tres estancias por clan: salón, despacho y dormitorio, un total de **21 fondos exclusivos**. Se añadieron catorce archivos SVG en `assets/residencias/`, con nombres `<clan>-despacho.svg` y `<clan>-habitaciones.svg`. Los ambientes incluyen bibliotecas, documentos, camas, vestidores, paneles y ornamentos distintivos.

Los 29 fondos se registran mediante URLs locales y se cargan **cuando se visitan**, evitando descargar todas las imágenes al abrir el juego. Cuando un recurso no está cargado o falla, el renderizador usa automáticamente su fondo anterior de Canvas.

Iluminación ambiental: luz sobre libros y escritorio en el despacho, reflejos fríos nocturnos en los dormitorios, luces particulares en cada salón y lugar público. Los FX se pueden desactivar sin modificar la partida.

La compatibilidad de colisiones requiere mantener accesibles estos puntos: despacho `(145,137)`, `(338,137)`, `(240,212)`, dormitorio `(142,135)`, `(334,135)`, `(239,102)`, salida `(240,270)`. Cada fondo corresponde a un lienzo lógico de 480 × 300.

**Pruebas:** 14 recursos SVG existentes; 21 estancias y ocho locales renderizados; fallback con carga retrasada y fallida; guardado, movimiento y opción FX verificados por simulación del motor. Queda pendiente una revisión visual real en navegador y completar arte y animación ilustrados profesionalmente.

## Fase VI — Apariencia y evolución visual

Se añadió `vtm-appearance.js` como módulo independiente, con cinco tonos de piel, cinco colores de cabello, cinco vestimentas, tres peinados y cuatro accesorios. El creador de personaje muestra una vista previa en Canvas, y durante la partida se pueden guardar o descartar cambios de apariencia desde un modal.

Las selecciones se incorporan a `game.character.appearance`; las partidas antiguas se migran mediante `normalize()`. Ninguna elección tiene coste en puntos ni afecta reglas. El sprite se compone superponiendo capas cromáticas sobre la hoja base; la ropa y la cara personalizadas se conservan después del Abrazo. Se atenúa ligeramente el tono de piel y se añaden detalles cromáticos según clan. Nosferatu adquiere marcas adicionales. Los acentos son símbolos visuales del prototipo, no nuevos poderes.

`assets/personajes-paris-v3.svg` contiene ahora **256 cuadros** (16 filas × cuatro direcciones × cuatro cuadros). Dimensiones: 512 × 768 px. Cada celda conserva 32 × 48 px, garantizando continuidad del motor y del fallback. El movimiento intercala cuatro cuadros de marcha; hay parpadeo y detalles de reposo. El Abrazo tiene un efecto breve condicionado por FX.

La interfaz actualiza inmediatamente la condición del jugador tras el Abrazo. Quedan pendientes hojas de sprites hechas a mano, mayor variedad de siluetas y vestuario y revisiones visuales reales en distintos dispositivos.

## Fase VII — Vida urbana y capas animadas

El módulo `vtm-ambience.js` realiza tres tareas separadas de la lógica del juego:

1. `street()`: peatones y taxis de movimiento determinista, cantidad variable según las horas de la noche, con lluvia y luces ya existentes del motor.
2. `interior()` y `foreground()`: personajes de ambiente que no se confunden con contactos jugables; monitores y luces con variación tenue; bordes en primer plano para dar profundidad sin obstaculizar pasillos ni puertas.
3. `landmarkMarkers()` y `nearestStreetPoint()`: cuatro rincones observables con texto ambiental e ingreso en el diario (una vez por rincón).

Las figuras de ambiente **no son objetivos de misiones, no se pueden atacar, no tienen colisión y no otorgan recursos ni dados adicionales**. Sus posiciones no se guardan. Al desactivar FX desaparecen peatones, taxis, extras y variaciones de luz, pero los puntos observables permanecen visibles y utilizables.

Se conservaron las coordenadas de entrada a edificios y los interiores de siete clanes. Todo funciona a 480 × 300 px lógicos con el motor y el atlas de la fase VI.

Para ampliar esta fase, priorizar calles conectadas de varios sectores, ciclos de PNJ realmente persistentes, rutas peatonales físicas y posibles encuentros narrativos, separando siempre decoración de actores interactivos.

## Fase VIII — Exploración de barrios

Nuevo módulo \`vtm-districts.js\`: ocho escenas exteriores conectadas por accesos cardinales y el mapa general existente. Cada escena tiene bloques de edificios, avenidas transitables, una entrada al local previamente existente, dos puntos de observación y pasos hacia los barrios adyacentes. El motor mantiene una cámara de 480×300 píxeles lógicos; cada cambio de barrio transfiere al jugador al borde opuesto de la nueva escena.

La escena \`district\` conserva el sistema de colisiones, las rutas al hacer clic y las animaciones de la fase anterior. El progreso de ocho zonas y dieciséis rincones se guarda en dos propiedades nuevas del archivo de partida. La visita a un local desde un barrio conserva su punto de regreso. La escena \`paris\` no desaparece y los jugadores pueden seguir entrando directamente en sus destinos mediante el menú de navegación.

Esta primera topología es un **grafo lúdico**, no un plano geográfico preciso de París. Las próximas iteraciones deberían añadir edificios secundarios interactivos, mayor diferenciación por barrio, interiores adicionales, eventos contextuales y cartografía a escala.

## Fase IX — Interiores comerciales secundarios

Se incorporaron dos nuevos accesos por barrio y 16 escenas \`sidevenue\` mediante el módulo \`vtm-shops.js\`. Comparten lienzo de 480×300 píxeles y reutilizan el sistema de colisiones de los interiores de la fase III.

Se utiliza un conjunto de esquemas de decoración y paletas para oficinas, galerías, bares, librerías, anticuarios, talleres, floristerías y almacenes. Las capas y props son originales generados por Canvas, con elementos temáticos según establecimiento. Cada local incluye un mostrador lateral, una estantería, un encargado, área central transitable y una salida.

El módulo de barrios ubica dos entradas a distancia de los rincones observables. El jugador puede decidir ayudar al encargado, investigar o presionarlo. Los cambios de reputación, riesgo y pistas se guardan por local una sola vez. No hay recompensas ilimitadas por repetir conversaciones.

Los fondos y PNJ comerciales son una base funcional para la siguiente fase artística; deben sustituirse progresivamente por assets ilustrados individuales.

## Fase X — Memoria social y señalización de contactos

La ampliación de interacción integra el módulo \`vtm-contacts.js\` con los 16 comercios de la fase IX. La confianza, el tipo de trato, los favores pendientes, las presentaciones y los rumores por noche se guardan en la partida. Cuando llega una nueva noche, el módulo activa consecuencias no repetibles; el panel de exploración muestra los contactos con novedades.

Los locales que tienen información pendiente muestran un indicador visual \`!\` flotante, discreto y dibujado por Canvas, para que el usuario pueda localizarlos sin abrir repetidamente el diario. Las conversaciones reconocen las relaciones creadas en otros locales del mismo barrio.

Se añadió un botón para descansar desde el refugio: esta función permite avanzar una noche cuando el jugador desea comprobar las consecuencias de una decisión. La acción exige confirmación para evitar que un clic accidental haga progresar el reloj.

Los PNJ principales, sus secretos y el sistema de tiradas de tercera edición siguen separados. Las interacciones comerciales son secundarias; su memoria no debe contradecir los hechos de la campaña.

## Fase XI — Investigaciones secundarias entre barrios

Cuatro expedientes enlazan los 16 locales previamente ilustrados: entregas, documentos, automóviles y objetos. El jugador contrasta fuentes en orden mediante tiradas, dispone de información del siguiente destino en el diario y puede cerrar cada caso con una decisión política, discreta o social. Los finales son acotados y no resuelven la intriga de la Senescal.

La interfaz incorpora dos contadores de progreso: expedientes resueltos y pruebas contrastadas. En los diálogos de los encargados aparece **Contrastar indicios** cuando corresponde y **Cerrar expediente** cuando las cuatro pruebas están reunidas; las conversaciones originales siguen disponibles.

El módulo \`vtm-local-cases.js\` administra estado y compatibilidad. Las pruebas de regresión están en \`tests/local-cases.test.js\`. No se añadieron recursos gráficos externos ni se modificaron las colisiones; esta fase es principalmente narrativa y sistémica.

## Fase XII — Expediente Elizabeth Parker: «La sangre de los inocentes»

La investigación principal se añade a las misiones del Domitor y a los cuatro expedientes ambientales de la fase XI; **no los reemplaza**. Desde **Acciones → Expediente Elizabeth Parker**, el jugador puede iniciar el encargo en Passy y contrastar ocho fuentes: John Winthrop, el apartamento de Elizabeth, la policía, el Elíseo, Mathieu, el garaje de Adrien Vasseur, Lucien y la red de Erebos. Las tiradas usan Atributo + Habilidad y permiten volver a intentarlo en otra noche sin borrar lo averiguado.

La interfaz debe distinguir **pistas comprobadas**, **fuentes aún pendientes** y **consecuencias políticas**. Con cuatro pruebas, incluido el garaje, se abre la confrontación con Bapthiste en Bastilla. El caso conserva su propio estado persistente en `game.elizabeth`, independiente de `localCases` y de la progresión del Abrazo.

**Límite de canon:** Elizabeth era mortal y desconocía la sociedad vampírica; el mechón obtenido por Bapthiste se utilizó para incriminar a John. La historia no debe revelar al jugador el secreto de Etienne Moreau ni atribuir culpabilidad automática a John. El sistema de investigación es una adaptación del videojuego, no una sustitución del manual de mesa.

**Regresión obligatoria:** `tests/elizabeth-case.test.js`. Mantener visibles en el diario los indicios y decisiones ya guardados.

## Fase XIII — Tres interiores explorables del expediente

`vtm-case-interiors.js` aporta tres escenarios cenitales de **480 × 300 píxeles lógicos**, con colisiones de `vtm-physics.js`, navegación WASD, clic y controles táctiles:

| Interior | Acceso narrativo | Interacción principal |
|---|---|---|
| Apartamento de Elizabeth | Hemeroteca, con el expediente iniciado | Escritorio, mensajes, fotografías y ventana |
| Garaje de Adrien Vasseur | Saint-Denis, tras obtener una referencia de Mathieu, Lucien o Erebos | Registros, vehículo, cámaras y salida de servicio |
| Refugio de Bapthiste | Bastilla, con cuatro pruebas que incluyan el garaje | Confrontación, retirada o combate por turnos |

La salida inferior devuelve al personaje al escenario y coordenadas anteriores mediante `game.caseReturn`. El refugio **no ejecuta automáticamente** a Bapthiste: la confrontación y las decisiones posteriores requieren elecciones explícitas. Su combate usa los módulos `vtm-tactics.js` y `vtm-tactics-ui.js`, con una ficha simplificada para el videojuego.

**Regresión obligatoria:** `tests/case-interiors.test.js` junto con `tests/elizabeth-case.test.js`. No desplazar puertas ni objetos sin comprobar rutas transitables, regreso y guardado.

## Sistemas transversales que debe conservar cualquier rediseño

- **Progresión:** ghoul al servicio del Domitor, aprecio, encargos, Abrazo eventual, Disciplinas, Humanidad y Mascarada; módulos `vtm-story.js`, `vtm-mechanics.js`, `vtm-world-powers.js` y `vtm-game.js`.
- **Exploración:** ocho barrios conectados, mapa general, interiores de residencia y lugares públicos, dieciséis comercios y sus colisiones; `vtm-districts.js`, `vtm-shops.js`, `vtm-physics.js` y `vtm-graphics.js`.
- **Relaciones e investigaciones:** memoria social entre noches, cuatro expedientes locales de dieciséis pruebas y caso Elizabeth Parker; `vtm-contacts.js`, `vtm-local-cases.js` y `vtm-elizabeth.js`.
- **Sistemas complementarios:** equipo, combate táctico, economía, favores políticos, deudas y servicios; `vtm-equipment.js`, `vtm-tactics.js`, `vtm-economy.js` y `vtm-politics.js` con sus interfaces.
- **Persistencia:** `vtm-save.js` mantiene la clave `cronicas-paris-ghoul-v1`, el respaldo `cronicas-paris-ghoul-v1-backup`, la versión de partida 1, la recuperación confirmada y las migraciones no destructivas. Nunca reiniciar datos antiguos, sobrescribir un respaldo válido con datos corruptos ni eludir confirmaciones de sustitución.
- **Validación:** `.github/workflows/quality.yml` debe revisar la sintaxis de todos los scripts y ejecutar **todos** los `tests/*.test.js`, incluidos `save-backup.test.js`, `local-cases.test.js`, `elizabeth-case.test.js` y `case-interiors.test.js`. Un commit aprobado no confirma por sí mismo que Hostinger haya publicado el cambio.

## Pendientes de arte y pulido (no son fases nuevas)

### Sprites y mundo urbano
- Sprite de ghoul (hombre/mujer y personalización básica), cuatro direcciones de movimiento, animaciones de caminar/idle.
- Sprite propio de cada Domitor y PNJ importante.
- Reemplazar patrones urbanos procedurales por tileset de París: adoquín, asfalto mojado, aceras, mansardas, farolas, árboles, Sena, puentes y señalización de edificios.
- Calcular escala y colisiones antes de añadir animaciones complejas.

### Residencias e interiores
- Siete residencias con identidad espacial y, al menos, una estancia característica de cada clan.
- St. July, Elíseo, Passy, túneles Nosferatu, Bastilla, comisaría y hemeroteca.
- Tres capas por sala: suelo, obstáculos y primer plano; iluminación dinámica por zona y objetos examinables claramente identificados.

### Efectos y accesibilidad
- Lluvia con dirección y profundidad, charcos y reflejos controlados.
- Luces puntuales, velas, humo ambiental, niebla tenue y sombras suaves.
- Transiciones de entrada/salida de edificios, microanimaciones en diálogos y accesibilidad.

## Reglas de interfaz

- Evitar paneles con texturas demasiado marcadas: los textos deben leerse siempre.
- Mínimo de 44 px de superficie táctil para controles prioritarios.
- Mantener indicadores de estado con texto además del color (aprecio, exposición, reputación).
- Respetar \`prefers-reduced-motion\`.
- No usar enlaces a bibliotecas, tipografías o imágenes externas críticas para la carga del juego.
- Cargar \`visual-2.css\` **después** de \`style.css\` para poder mantener el tema sin alterar la lógica original.
- Antes de publicar, probar creación de personaje, carga de partida, conversación con Domitor, PNJ, informe de misión, barras y diálogos sin retrato.

## Publicación

Código: https://github.com/gustavothinkinfinite-stack/zombie  
Sitio: https://wheat-chough-542895.hostingersite.com/  
Hostinger GIT: https://hpanel.hostinger.com/websites/wheat-chough-542895.hostingersite.com/advanced/git

El push a GitHub no equivale a publicación confirmada. Verificar la hora del último despliegue, usar **Redeploy** si hace falta y recargar con \`Ctrl+F5\`.
