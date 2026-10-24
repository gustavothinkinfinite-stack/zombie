# Crónicas de París — Juego web de Vampiro: La Mascarada (prototipo 1.1 · rediseño visual 2.0, fase XVII)

RPG 2D narrativo de pixel art oscuro, ambientado en **el Principado de París** creado previamente para la campaña del usuario. El personaje comienza como **humano ghoul** al servicio de un Domitor vampiro. **No hay zombis ni oleadas** en esta versión.

- **Juego:** https://wheat-chough-542895.hostingersite.com/
- **GitHub:** https://github.com/gustavothinkinfinite-stack/zombie
- **Configuración de despliegue:** https://hpanel.hostinger.com/websites/wheat-chough-542895.hostingersite.com/advanced/git
- **Rama:** \`main\`
- **Ruta de alojamiento:** \`public_html\`
- **Tecnología:** HTML + CSS + JavaScript Canvas, sin compilación ni servidor.

### Protección de partidas y respaldo recuperable (24 de octubre de 2026)

- El formato del personaje sigue siendo **versión 1**, compatible con las partidas anteriores. El guardado principal mantiene la clave `cronicas-paris-ghoul-v1`.
- El módulo `vtm-save.js` conserva una copia de respaldo local bajo `cronicas-paris-ghoul-v1-backup`; no copia un guardado corrupto sobre un respaldo válido. Antes de reemplazar la partida principal se guarda o verifica la copia anterior.
- Si el guardado principal está ausente o ilegible, **Continuar partida** ofrece recuperar el respaldo válido después de pedir confirmación; al entrar intenta consolidarlo en el almacenamiento principal.
- Los errores de almacenamiento no generan un mensaje falso de éxito. Empezar un personaje nuevo exige confirmación si existe un guardado principal o una copia de respaldo, incluso cuando sus datos sean ilegibles.
- Pruebas de recuperación y rechazo del almacenamiento: `node tests/save-backup.test.js`, `node tests/save-feedback.test.js`, `node tests/new-game-protection.test.js` y `node tests/menu-save-guard.test.js`; se incluyen en GitHub Actions.
- **Limitación:** ambos guardados permanecen en el mismo navegador/dispositivo mediante `localStorage`. Borrar los datos del sitio o perder el dispositivo elimina ambas copias; no constituye una copia externa ni sincronización en la nube.




## Fase XVII — Siete barrios reactivos y regresión de navegador (octubre de 2026)

### Estabilización posterior a la Fase XVII

- **Verificación de Hostinger:** una pestaña del navegador conectado mostró `EXPLORACIÓN · FASE XVII` con una partida de Nosferatu existente y su progreso visible. Esto confirma que esa versión aparece en dicha sesión, **no** que todas las pruebas de Chromium hayan aprobado ni que todos los assets coincidan con el último commit.
- **Espera de contactos corregida:** `waitForNPC` ya distingue una espera dentro de la misma noche de otra hasta la noche siguiente. Sincroniza la simulación reactiva y los sucesos comerciales antes de adelantar el reloj, y concede ingresos/renueva condiciones nocturnas sólo si realmente cambió de noche.
- **Nueva regresión:** `node tests/npc-wait-reactivity.test.js` cubre ambas esperas y un salto desde la madrugada.
- **Contrato del test de Chromium:** `node tests/browser-contract.test.js` comprueba selectores de la interfaz, títulos de las siete investigaciones, contexto aislado y archivos diagnósticos. Es una prueba estática complementaria y no sustituye la ejecución real del navegador.
- **Prueba de navegador reforzada:** `tests/browser-smoke.cjs` comprueba ahora el **título preciso del incidente** correspondiente a cada uno de los siete barrios.
- **Validación de producción:** `.github/workflows/production-smoke.yml` comprueba Hostinger con Playwright y una partida aislada. Se puede lanzar manualmente y también se activa al cambiar la prueba del navegador o el propio workflow en `main`. No utiliza ni modifica partidas de jugadores reales. Cada ejecución adjunta `browser-smoke-report.json` y `browser-smoke-trace.zip`; si falla, incorpora `browser-smoke-failure.png`. El resultado real debe consultarse en GitHub Actions: el código del workflow no confirma que haya aprobado.



La lógica de **Bastilla** sigue en \`vtm-reactive-city.js\`. Se agregó el módulo independiente \`vtm-reactive-districts.js\`, que extiende el sistema narrativo reactivo a los siete barrios restantes con hechos distintos, testigos, responsables, pistas verificables, memoria social y rumores que circulan entre barrios. Es una extensión de primera escala: **ocho casos reactivos en total**, uno por barrio, además de los dieciséis sucesos ambientales recurrentes de Fase XV.

| Barrio | Incidente reactivo | Actores / repercusiones |
| --- | --- | --- |
| Passy | **La valija del mensajero** | Portera y encargado de finca, numeración de entrega, rumores en St. July y Elíseo |
| St. July | **Una invitación falsificada** | Camarera, jefe de seguridad, invitado rechazado, registros del café |
| Elíseo | **El pase extraviado** | Chofer, seguridad civil, pase de acceso a un edificio oficial (no revela secretos vampíricos) |
| Hemeroteca | **Un legajo alterado** | Auxiliar y responsable de sala, firmas y préstamos, vínculos con prensa y archivos |
| Saint-Denis | **El cargamento desviado** | Conductor, capataz y operario, discrepancias del precinto y manifiesto |
| Barrio policial | **La carpeta extraviada** | Mensajera, responsable de recepción y oficinista, sello y hoja de entregas |
| Túneles | **La avería del conducto** | Operaria de mantenimiento, jefe de cuadrilla y peatón, válvulas y aislamiento de la zona |

### Avance independiente y consecuencias

- Cada caso tiene momentos de inicio, respuesta de una autoridad, búsqueda y desenlace durante la noche. El avance ocurre **por el reloj del juego**, aunque el PJ esté en otro barrio, dentro de un comercio o descansando.
- Los personajes aparecen solo durante las fases pertinentes. Acercarse y pulsar **E** abre la investigación: \`Percepción + Investigación\` para indicios, \`Carisma + Empatía\` para testigos, \`Destreza + Atletismo\` para asistir y \`Manipulación + Intimidación\` para amenazas. Las tiradas no pueden repetirse varias veces durante la misma noche.
- Con pruebas contrastadas se puede informar al responsable; también se puede ayudar sin esclarecer, no entregar información o **ocultar pruebas**. Los cinco resultados por caso son: esclarecido, auxilio sin esclarecimiento, pista tardía, encubrimiento o sin resolver.
- Los testigos intimidados abandonan la escena. Se conservan relaciones de confianza con testigos, autoridades y vecinos y una cronología del incidente.
- Las conversaciones en comercios distinguen **rumores del propio barrio** de los que llegan desde fuera; las pistas comerciales están vinculadas solo a un caso concreto y se obtienen una vez. No se inventa conocimiento de la Mascarada para civiles ni se revela el secreto de Etienne.
- Los siete casos se guardan bajo \`reactiveDistricts\`. La migración añade solo ese campo; no sustituye el guardado \`cronicas-paris-ghoul-v1\`, ni las misiones de Elizabeth, la investigación de Bastilla, la economía, la corte o los contactos.

### Pruebas y alojamiento

- \`node tests/reactive-districts.test.js\` verifica los siete incidentes, el avance fuera de pantalla, rutas accesibles, distintos desenlaces, memoria de testigos, difusión de rumores y persistencia.
- \`tests/browser-smoke.cjs\` y \`.github/workflows/browser-smoke.yml\` añaden **un smoke test en Chromium real**, en un navegador aislado que usa una partida sintética de prueba. Visita los siete barrios, comprueba diálogos, menú, diario y recarga del guardado. Se ejecuta en GitHub Actions en pushes y pull requests.
- **Importante:** crear una prueba automatizada no equivale a haber observado su resultado. La verificación del navegador conectado de la sesión del 24/10/2026 mostró **Fase XV en Hostinger**, mientras que el repositorio ya había avanzado a Fase XVI. Por tanto, Hostinger requiere verificar/publicar el código actualizado y después probar esa versión real en producción.
- Los siete incidentes tienen guiones finitos y no son una simulación ilimitada o con aprendizaje generativo; los transeúntes y el tráfico preexistentes conservan sus limitaciones.

## Fase XVI — París reactivo, primer caso jugable en Bastilla (octubre de 2026)

La primera misión sistémica integra **acontecimientos que evolucionan independientemente del jugador, memoria social y consecuencias policiales**. Es una **implementación vertical de prueba**, no una simulación ya extendida a los ocho barrios.

### Robo nocturno de Bastilla

- **22:15:** sucede un robo cerca del cruce. Un sospechoso puede ser perseguido; quedan una testigo y pistas en la vía pública.
- **22:30:** llega la policía y comienza a recoger testimonios; el sospechoso ya ha abandonado el lugar.
- **23:00:** la investigación policial prosigue. Los relatos del caso se difunden por comercios de Bastilla, el St. July y el barrio policial.
- **00:10:** la investigación tiene un desenlace según las acciones realizadas. Si se descansa antes del acontecimiento, el caso también se desarrolla y se resuelve sin intervención del PJ.

### Decisiones que cambian el resultado

- Hablar con la testigo mediante **Carisma + Empatía**, seguir al sospechoso con **Destreza + Atletismo**, revisar las pruebas con **Percepción + Investigación** o pedir una corroboración comercial en **Le Verre Fêlé**.
- Acercarse al agente, explicar lo que se sabe y **entregar pruebas contrastables** para facilitar una detención. La culpabilidad definitiva sigue sujeta a verificación; no se dicta sentencia automática.
- Intimidar a la testigo puede hacerla huir y disminuye su confianza y la de la policía; ocultar pruebas perjudica el caso y cambia su desenlace.
- Son posibles **cinco resultados**: sospechoso detenido, escapado, caso sin resolver, encubrimiento o pertenencias recuperadas sin detención. Los comerciantes y PNJ mantienen memoria de las decisiones en la partida guardada.
- Los testimonios se intentan una vez por noche, los hitos de la investigación no se duplican y las amenazas dejan consecuencias aunque el jugador cambie de barrio.

### Interfaz y acceso

- En **Bastilla** se muestran la escena, la testigo, la policía y el sospechoso según el horario. Aproximarse a una marca y pulsar **E** permite interactuar. Los nuevos puntos se colocaron en zonas navegables, evitando interferir con edificios y accesos del mapa.
- Los encargados de comercios de los barrios donde circula el rumor ofrecen una opción relacionada con el caso.
- **Acciones → París reactivo · investigar el robo de Bastilla** abre el estado del expediente y los efectos de los hechos. El diario incorpora su cronología y el panel de exploración indica el estado del caso.

### Arquitectura y estabilidad

- Nuevo módulo \`vtm-reactive-city.js\` con estado opcional persistido en \`reactiveCity\`, sin cambiar la clave del guardado \`cronicas-paris-ghoul-v1\`.
- Nuevo conjunto de pruebas \`tests/reactive-city.test.js\`; incluido automáticamente en el flujo existente de GitHub Actions (\`.github/workflows/quality.yml\`), que ejecuta \`tests/*.test.js\`.
- No se alteraron ni eliminaron las misiones de Elizabeth Parker, los expedientes locales, los contactos, los comercios ni la corte.
- **Pendientes:** pruebas en navegador real y confirmación del despliegue en Hostinger, profundidad de IA urbana más allá del primer caso, persecución física generalizada y consecuencias sistémicas entre múltiples casos. No anunciar la Fase XVI como publicada en producción hasta verificar Hostinger.

## Fase XV — París continúa viviendo (octubre de 2026)

Se añadió \`vtm-city-life.js\`, una simulación nocturna **independiente de las acciones del jugador** que aprovecha los ocho barrios y los dieciséis comercios ya existentes.

### Calles con vida

- Cada barrio recibe peatones con distintas descripciones y rutas visibles por las avenidas. Se los puede abordar pulsando **E** cuando no hay una puerta u objeto de misión prioritario cerca; el contacto deja un registro de la conversación de esa noche, sin convertirlos en informantes sobrenaturales.
- El tránsito aparece en carriles y modifica su densidad con la hora: hasta tres vehículos durante las horas concurridas, menos después de medianoche y solo uno de madrugada. Es tráfico de ambientación y no agrega colisiones nuevas con los vehículos.
- Se producen **16 sucesos por noche** (dos por cada barrio), en horarios calculados a partir de la noche. Ejemplos: entrega fuera de horario, cambio de guardia, taxis detenidos, alarma industrial y actividad en los archivos. Se desarrollan **también fuera del barrio visitado**.
- Los incidentes permanecen en una ventana de tiempo determinada; acercarse y presionar **E** permite registrar la observación una sola vez. Cuando termina la ventana, se conserva un resumen en el diario, no un encuentro repetible.
- El sistema conserva los últimos 64 incidentes, limpia datos obsoletos y admite guardados antiguos. Los sucesos son de escala humana; no revelan el secreto de Etienne Moreau ni alteran automáticamente los hechos de la campaña.

### Comercio y horarios

- Los dieciséis locales utilizan turnos calculados según la actividad (cafés, talleres, librerías, oficinas, etc.). Señales de color muestran cuándo atienden al público.
- En el interior puede verse clientela que se desplaza de manera autónoma. Se les puede hablar una vez por noche, sin recompensas acumulables.
- La conversación con el encargado muestra el **horario** y si se trata de atención abierta o fuera de horario. Para proteger las campañas existentes, **no se bloquea el acceso a comercios, contactos ni investigaciones por un cierre horario**: el jugador puede entrar por las rutas narrativas ya definidas.

### Paso del tiempo y acceso a información

- En la pantalla jugable el tiempo transcurre **un minuto del juego cada 30 segundos reales**, aunque el jugador permanezca quieto. El contador se pausa al abrir diálogos o iniciar un combate; las acciones también pueden adelantar el reloj como antes.
- Descansar una noche da por ocurridos los sucesos de la noche anterior, incluso si no se visitaron sus barrios.
- Consultar **Acciones → París nocturno · sucesos, tránsito y horarios comerciales** abre un boletín de acontecimientos recientes. El diario muestra también los últimos registros y el panel lateral indica cuántos sucesos se produjeron y cuántos establecimientos están abiertos.

### Compatibilidad, pruebas y límites

- Script agregado: \`vtm-city-life.js\`; pruebas: \`node tests/city-life.test.js\`.
- El guardado sigue utilizando \`cronicas-paris-ghoul-v1\`, con nuevo campo opcional \`cityLife\`, sin reemplazar expedientes, la política de la corte ni el sistema del Domitor.
- La circulación de vehículos es visual y **no es una simulación de tráfico con accidentes ni tráfico urbano completo**. Los peatones son personajes ambientales con desplazamiento y conversación breve, no IA generativa con diálogos libres. Los sucesos siguen guiones escritos para conservar la coherencia de la crónica.
- Verificar la experiencia visual en un navegador real y el despliegue de Hostinger por separado: el código del repositorio no confirma que el alojamiento ya esté actualizado.

## Fase XIV — Interiores con ambientación avanzada y PNJ autónomos (octubre de 2026)

La investigación de Elizabeth Parker incorpora **cinco personajes con movimiento autónomo** y una capa visual animada en los tres interiores existentes. No son agentes conversacionales generativos: son personajes de mundo con **rutinas y estados deterministas**, compatibles con el juego offline.

### Comportamiento jugable

- **Apartamento de Elizabeth:** Madeleine Roche se desplaza cerca de la puerta y recuerda si ya dio su testimonio; Claire Renaud recorre el apartamento examinando detalles. Sus conversaciones ofrecen contexto y tiradas únicas; no sustituyen los indicios obligatorios de la misión.
- **Garaje de Vasseur:** Adrien Vasseur patrulla entre la oficina y el acceso de servicio. Si la investigación tiene una alerta alta, evita al jugador y huye cuando se le acerca; su retirada se recuerda durante el resto de esa noche.
- **Refugio de Bapthiste:** Bapthiste se mueve y puede detenerse a observar al jugador. Para confrontarlo hay que aproximarse al **personaje en movimiento**, no a una marca fija del mapa. Un vigilante mortal recorre la zona y, con una alerta elevada, avisa de la presencia del jugador una vez por noche.
- **Interacciones persistentes:** las entrevistas requieren tiradas de Atributo + Habilidad; los resultados, posiciones, sospechas y decisiones se guardan en \`caseActors\` junto a la partida. No existen recompensas infinitas al repetir los diálogos.
- **Camino y seguridad:** los PNJ usan \`vtm-physics.js\` para evitar muebles; el jugador conserva acceso directo a las salidas y las investigaciones ya existentes. Las conversaciones y movimientos se detienen durante diálogos y combates.

### Arte y presentación

\`vtm-case-visuals.js\` agrega efectos de iluminación, marcos, fotografías, papeles, polvo, reflejos de lluvia, aceite, marcas industriales, lámparas y sombras. Son capas **pixel art Canvas** independientes de \`vtm-case-interiors.js\`. Los sprites PNJ se apoyan en el render existente \`vtm-graphics.js\`. El botón **FX** conserva el control de los efectos animados.

### Código, pruebas y límites

- Módulos nuevos: \`vtm-case-actors.js\`, \`vtm-case-visuals.js\` y \`tests/case-actors-visuals.test.js\`.
- Compatible con guardados anteriores (\`cronicas-paris-ghoul-v1\`) y el respaldo local existente. Se conserva el progreso del expediente Elizabeth y de las investigaciones secundarias. El guardado automático dentro de los interiores se realiza periódicamente, además de los guardados al salir, conversar o cambiar de aplicación.
- Ejecutar \`node tests/case-actors-visuals.test.js\`, \`node tests/case-interiors.test.js\` y \`node tests/elizabeth-case.test.js\`. La comprobación final de experiencia visual en navegador real y el despliegue público en Hostinger deben verificarse por separado.
- Limitaciones: los PNJ no simulan una ciudad entera ni caminan autónomamente entre barrios; no tienen IA de conversación libre. La estética es arte 2D procedural y no una colección de ilustraciones externas.

## Fase XIII — Interiores 2D y confrontación de Bapthiste (octubre de 2026)

El expediente **La sangre de los inocentes** ahora incorpora tres mapas interiores top-down de 480×300 píxeles, con decoración procedimental, paredes y obstáculos físicos compatibles con navegación WASD, controles táctiles y clic para caminar:

1. **Apartamento de Elizabeth Parker**, accesible desde la hemeroteca tras abrir el expediente en Passy. Examiná su escritorio para realizar la tirada original del apartamento, y explorá mensajes, fotografías y ventana.
2. **Garaje de Adrien Vasseur**, accesible desde Saint-Denis después de obtener una pista a través de Mathieu, Lucien o Erebos. Examiná los registros físicos para investigar el garaje; también se pueden explorar el vehículo, las cámaras y la salida de servicio.
3. **Refugio de Bapthiste**, accesible desde Bastilla al reunir cuatro pruebas, incluyendo el garaje. El Brujah aparece como personaje visible. Podés presentar las contradicciones, retirarte o entrar en combate por turnos. Si lo neutralizás, elegís entregarlo vivo al Sheriff o retirarte sin custodiarlo. **No hay ejecución automática.**

**Cómo acceder:** entrar al edificio principal del barrio → examinar archivos/objetos → «Investigar el asesinato de Elizabeth Parker» → «Entrar al apartamento / garaje / refugio». Dentro de cada mapa, acercate a los objetos señalados y presioná **E**; la salida inferior devuelve al personaje exactamente al escenario de origen. También se conserva el acceso desde **Acciones → Expediente Elizabeth Parker**.

- Archivos añadidos: \`vtm-case-interiors.js\` y \`tests/case-interiors.test.js\`. Geometría integrada con \`vtm-physics.js\`; combates de Bapthiste integrados con \`vtm-tactics.js\` y \`vtm-tactics-ui.js\`.
- **Compatibilidad:** la partida continúa usando \`cronicas-paris-ghoul-v1\`; \`caseReturn\` sólo se agrega al entrar en un nuevo interior. Los indicios anteriores y los expedientes secundarios no se reinician.
- **Límite:** el combate de Bapthiste utiliza una ficha simplificada del videojuego (no sustituye su ficha oficial de mesa), y los mapas son arte Canvas procedimental, no ilustraciones artesanales. Todavía no se ha confirmado el despliegue en Hostinger ni una revisión interactiva visual en navegador real.
- **Pruebas:** \`node tests/case-interiors.test.js\` verifica colisiones, rutas, mapas, condiciones de acceso e integración. También conviene ejecutar \`node tests/elizabeth-case.test.js\` para comprobar regresiones de la investigación.

## Fase XII — La sangre de los inocentes (octubre de 2026)

Se incorporó **el expediente Elizabeth Parker** como investigación principal jugable y persistente, sin sustituir la progresión del ghoul, las misiones del Domitor ni los cuatro expedientes secundarios. El contenido es una **adaptación narrativa para el videojuego** de la crónica de París; no revela al jugador que Etienne Moreau es una impostora.

- Accedé desde **Acciones → Expediente Elizabeth Parker**. Para iniciar el caso, visitá **Passy** y examiná el lugar principal: un contacto del Sheriff presenta el encargo.
- **Ocho pistas jugables:** John en Passy, apartamento cerca de la hemeroteca, Claire Renaud en la policía, Élodie en el Elíseo (respeta el acceso existente), Mathieu y el garaje de Vasseur en Saint-Denis, Lucien en Bastilla y contactos de Erebos en los túneles. Cada investigación utiliza Atributo + Habilidad y dificultad 6–8.
- **Progreso sin bloqueos:** el garaje admite tres rutas de acceso alternativas (Mathieu, Lucien o Erebos); un fracaso no borra la información contextual y permite un nuevo intento durante otra noche.
- **Segundo acto:** al reunir cuatro pruebas incluyendo el garaje, se puede confrontar a Bapthiste en Bastilla, presentar el caso mediante Wyndham, Lucien o Etienne desde Passy, pedir medidas al Príncipe en el Elíseo y descubrir una vigilancia humana cerca de los túneles. No se captura ni destruye automáticamente a Bapthiste mediante un diálogo.
- **Persistencia:** todo se guarda dentro de \`game.elizabeth\`, con migración no destructiva de partidas anteriores; diario, panel de asuntos pendientes, alerta de Bapthiste (0–6), decisiones políticas y resultados únicos.
- **Localización y límites:** los puntos investigables reutilizan los ocho lugares existentes; apartamento, garaje y refugio aún son escenas narrativas dentro de esos escenarios, **no mapas interiores independientes en la fase XII original (añadidos en la fase XIII)**. El sistema de tiradas, puntos de experiencia y consecuencias políticas son adaptaciones del videojuego, no procedimientos literales del manual.

Pruebas del módulo: \`node tests/elizabeth-case.test.js\`. El despliegue en Hostinger y la revisión visual interactiva requieren comprobación independiente.

## Fase XI — Cuatro expedientes de investigación interbarrial (octubre de 2026)

Se añadieron **cuatro investigaciones secundarias independientes**, cada una con **cuatro pruebas** repartidas entre distintos comercios. Las dieciséis tiendas creadas en la fase IX participan en exactamente un expediente. **Estos casos son ficción ambiental nueva del videojuego**, no revelaciones anticipadas de la conspiración principal de la campaña.

| Expediente | Ruta de cuatro fuentes |
|---|---|
| Entregas sin destinatario | Conserjería de Passy → Floristería St. July → Lavandería Saint-Denis → Almacén de los túneles |
| Las páginas extraviadas | Librería de la Hemeroteca → Encuadernación → Copistería policial → Estudio de documentos del Elíseo |
| La ruta de los coches | Café St. July → Taller Saint-Denis → Cafetería policial → Bar de Bastilla |
| Objetos fuera de lugar | Anticuario Passy → Galería Elíseo → Estudio de música Bastilla → Electrónica de los túneles |

### Reglas de investigación

- Hablá con el encargado de la **siguiente fuente indicada** y seleccioná **Contrastar indicios**. Los diálogos y el diario indican el progreso, el comercio y el barrio siguientes.
- Cada investigación usa una tirada de **Percepción + Investigación**; su dificultad incorpora los modificadores vecinales y las referencias de la fase X, entre 5 y 9. Si fallás, aumenta ligeramente la exposición y no podés repetir ese intento en el mismo comercio hasta otra noche.
- La evidencia obtenida previamente en partidas anteriores se reconoce automáticamente y se valida en el orden correspondiente, sin volver a pagar bonificaciones.
- Al reunir las cuatro pruebas, volvé al último comercio y elegí una **resolución definitiva**: entregar informe político (pequeño aumento de reputación y riesgo), archivar discretamente (reducir exposición) o advertir a los testigos (pequeño reconocimiento social).
- Cada expediente sólo se resuelve **una vez** y no concede pistas ficticias de la trama central ni crea accesos ilegítimos al Elíseo.

### Implementación, compatibilidad y límites

\`vtm-local-cases.js\` contiene las cuatro rutas, comprobación estricta de etapas, estado \`localCases\`, guardado y migración, y efectos de las tres salidas. \`vtm-game.js\` integra diálogos, tiradas, tiempos y diario; \`index.html\` añade **Expedientes resueltos (0/4)** y **Pruebas contrastadas (0/16)**. El archivo \`tests/local-cases.test.js\` contiene regresiones para cadena, reintentos nocturnos, migración, guardado y resolución única; ejecutalo con \`node tests/local-cases.test.js\`.

Se probaron directamente dieciséis condiciones del módulo, incluidos los cuatro pasos de un expediente, las tres variantes de cierre y la recuperación de pistas anteriores. La sintaxis y los elementos HTML de la integración fueron comprobados. Aún falta una revisión interactiva visual completa en un navegador y verificar el despliegue en Hostinger.

## Fase X — Memoria social y consecuencias entre noches (octubre de 2026)

Se desarrolló un sistema de relaciones con los **16 encargados de los comercios secundarios**. Los personajes recuerdan cómo se los trató y pueden reaccionar en noches posteriores. No altera el canon de los personajes principales ni sustituye las misiones existentes.

### Novedades jugables

- **Relaciones persistentes:** después de ayudar, investigar o intimidar, cada contacto registra la acción, nivel de confianza, noche de la decisión y consecuencias aún pendientes.
- **Consecuencias diferidas:** desde la siguiente noche, ayudar puede habilitar un favor para reducir hasta 6 puntos de exposición o recibir una presentación para otro establecimiento. Una investigación exitosa puede generar una referencia comercial adicional; una fallida permite aclarar el malentendido. Amenazar causa una consecuencia adicional sobre la exposición (una sola vez) y mantiene la hostilidad.
- **Efectos entre negocios:** ayudar a un vecino disminuye en 1 la dificultad de investigar en el otro negocio del barrio; intimidarlo la aumenta en 1. Las presentaciones y referencias pueden reducirla adicionalmente. La dificultad final se mantiene entre **5 y 9**, por lo que nunca se garantiza automáticamente una pista.
- **Rumores nocturnos:** los contactos pueden compartir una de seis novedades ambientales de rotación determinista, en noches posteriores a la primera decisión, como máximo una vez por contacto y por noche. Las novedades cambian según la noche y quedan reflejadas en el diario, pero no conceden puntos ni pistas concluyentes del caso central.
- **Paso del tiempo:** botón **Descansar hasta la próxima noche**, disponible sólo en el refugio. Es una acción voluntaria, confirmada mediante diálogo, que actualiza la noche y permite activar acontecimientos sociales pendientes.
- **Información visible:** contadores de contactos con asuntos pendientes, contactos cordiales y rumores escuchados en el HUD, indicadores sobre sus locales, y resumen de contactos y referencias en el diario.

### Compatibilidad, persistencia y pruebas

El nuevo módulo es \`vtm-contacts.js\`. Sus datos se guardan con la partida en \`contactMemory\`, \`contactIntroductions\` y \`contactLeads\`. Los eventos y favores son consumibles una sola vez y no se duplican al cargar una partida.

La migración reconoce decisiones previas de la fase IX como ya resueltas, **sin volver a cobrar sus recompensas**. El resto de la ficha (Atributos, Disciplinas, combate, aprecio, misiones, facciones y estado ghoul/Vástago) se preserva.

Se realizaron pruebas del módulo de relaciones (ayuda, amenazas, investigación, migración y consecuencias no repetibles) y una prueba integrada de juego para el flujo: elegir ayuda → descansar en el refugio → volver al comercio al día siguiente → recibir una presentación → intentar reclamarla de nuevo. La presentación se reclamó exactamente una vez.

Las regresiones de migración, favores, rumores, intimidación, dificultad vecinal y persistencia del guardado también están documentadas en `tests/social-relationships.test.js`, que puede ejecutarse desde la raíz del proyecto con `node tests/social-relationships.test.js`. Las comprobaciones de integración de esta actualización se hicieron con Canvas y DOM simulados.

**Límites actuales:** los encargados no tienen todavía desplazamiento físico autónomo por toda la ciudad ni IA conversacional libre. La memoria social es un sistema narrativo determinista diseñado para el prototipo. La validación en navegador real y el despliegue público de esta fase siguen siendo tareas separadas.

## Fase IX — Dieciséis locales secundarios visitables (octubre de 2026)

Se añadieron **dos establecimientos secundarios por cada uno de los ocho barrios**. En cada barrio se muestran dos puertas nuevas, independientes del edificio principal y de los rincones de observación.

### Lugares por barrio

| Barrio | Local 1 | Local 2 |
|---|---|---|
| Passy | Anticuario de Passy | Conserjería nocturna |
| St. July | Floristería de madrugada | Café des Lanternes |
| Elíseo | Galería Saint-Honoré | Estudio de documentos |
| Hemeroteca | Librería de la Rue des Archives | Taller de encuadernación |
| Bastilla | Le Verre Fêlé | Estudio de música |
| Saint-Denis | Lavandería Saint-Denis | Taller de reparaciones |
| Archivo policial | Cafetería del turno de noche | Copistería de expedientes |
| Acceso a los túneles | Almacén subterráneo | Reparación de aparatos usados |

### Interacción

- Cada local dispone de interior 2D procedimental, encargado secundario con nombre, punto de conversación, objetos, observaciones y puerta de salida.
- En la conversación inicial se puede ofrecer ayuda (aumenta ligeramente la reputación de una facción local), investigar con **Percepción + Investigación, dificultad 7** (si hay éxito, se registra una información) o presionar al encargado (obtiene información pero genera exposición de la Mascarada y empeora la reputación).
- Las decisiones tienen resultado persistente y **sólo pueden ejecutarse una vez por local**. La inspección ambiental no concede pistas sin la investigación correspondiente.
- Se conserva el punto de entrada al abandonar el local. Hay 16 posibilidades de información secundaria, registradas aparte de la investigación principal.
- El diario y el panel lateral indican los locales visitados y las informaciones conseguidas.
- Se pueden visitar como ghoul o como Vástago sin alterar las reglas del Abrazo.

### Implementación y límites

\`vtm-shops.js\` registra los 16 establecimientos, descripciones, dueños, rumores, diseños interiores y estado. \`vtm-districts.js\` muestra las entradas y detecta la proximidad; \`vtm-game.js\` incorpora la escena \`sidevenue\`, los diálogos y las consecuencias; \`vtm-physics.js\` reutiliza las colisiones de interiores. El guardado incorpora \`localPlaces\`, \`localClues\` y \`sideReturn\`, con migración para partidas anteriores.

Los rumores de estos comercios **son contenido ambiental original**, no pruebas que revelen automáticamente a la Senescal impostora ni cambien los secretos preestablecidos de la crónica.

Se realizaron pruebas de sintaxis de los 14 scripts cargados, puertas y rutas de acceso a los 16 locales, renderizado de 16 interiores y de sus puntos de interacción; ejecución completa de una visita con conversación, recompensa no repetible, guardado y retorno a la misma calle.

**Pendiente:** diversidad de interiores ilustrados manualmente, más personajes realmente autónomos, cadenas de investigación secundaria más profundas, economía y favores elaborados, ciudades de mayor escala y pruebas funcionales visuales en navegadores reales.


## Renovación visual — Personajes e interiores (24 de octubre de 2026)

Esta etapa añade **acabados gráficos a los personajes y escenarios reales**, conservando la lógica y el formato de las partidas. Se creó el módulo puramente visual \`vtm-art-polish.js\`.

- **Personajes:** detalles de chaquetas, costuras, solapas, botones, botas, mantos y paletas diferenciadas para los siete clanes principales, así como acentos para Isabelle, Ingrid, Lucien, John, Marcus, Dupont y la Guardiana. La capa se dibuja encima del atlas SVG ya existente y del sprite procedural de reserva, preservando el selector de Apariencia y las cuatro direcciones. Las piernas, mangas y abrigo responden al ciclo de caminar.
- **Residencias:** las siete casas se decoran con marcos, tapices y acentos particulares por clan. Sus tres tipos de estancia —salón, despacho y habitación privada— reciben variaciones de biblioteca, escritorio, dormitorio y lámparas. La iluminación tiene tonos distintos según el clan.
- **Salones públicos:** los ocho escenarios existentes (St. July, Elíseo, Passy, túneles, Bastilla, Saint-Denis, Hemeroteca y Archivo Policial) reciben elementos arquitectónicos y mobiliario secundarios propios: panelados, vitrinas, libros, conductos y zócalos.
- **Comercios:** la capa decorativa incorpora estantes, productos y efectos lumínicos según el tipo de establecimiento, sin mover el encargado, la salida ni los objetos examinables.
- **Rendimiento:** los SVG y el Canvas de 480 × 300 píxeles se mantienen. Las capas de decoración son pequeñas instrucciones de dibujo que no alteran rutas, posiciones, NPC, diálogos, encargos, recursos ni guardados.
- **Interruptor FX:** permite apagar las nuevas fuentes de luz dinámicas sin eliminar la decoración estática.
- **Integración:** se incorporó \`vtm-art-polish.js\` a \`index.html\` antes de \`vtm-graphics.js\` y se actualizaron los identificadores de caché. Las llamadas de \`vtm-game.js\` pasan únicamente el estado del interruptor FX a los dibujantes de habitaciones y salones.
- **Regresión:** \`node tests/interior-art-smoke.js\` valida los siete clanes, sus 21 combinaciones de habitación, ocho salones y siete categorías de comercio, así como el cambio de fotogramas y la invariancia del estado guardado. También se verificaron las pruebas ya existentes de iluminación de barrios, accesos y mapa de París.

**Alcance:** este trabajo pule los **sprites y SVG existentes** mediante una nueva capa de dibujo; todavía no es una sustitución de todo el atlas por ilustraciones diseñadas individualmente. Los archivos están confirmados en GitHub, pero **no se ha verificado que Hostinger haya publicado esta actualización**.

## Renovación visual — Fachadas, luces y animación (24 de octubre de 2026)

**Actualización visual implementada en el videojuego web**, sin nuevas imágenes conceptuales ni cambios a misiones, acciones, coordenadas, combate, reglas de la Mascarada o formato de partidas guardadas.

- **Fachadas:** `vtm-districts.js` añade cornisas, frisos, contrafuertes, balcones, respiraderos industriales, entradas con pórticos y detalles distintos según la arquitectura de cada uno de los ocho barrios. Los edificios se conservan en el fondo cacheado para evitar recalcular su geometría en cada cuadro.
- **Iluminación nocturna:** la misma capa del distrito añade fuentes de luz animadas, tonalidades específicas para Passy, Elíseo, St. July, Bastilla, Archivo Policial, Hemeroteca, Saint-Denis y los túneles, y reflejos segmentados sobre calles mojadas. Se desactiva cuando el jugador apaga los FX.
- **Profundidad:** `vtm-ambience.js` dibuja efectos de farolas sobre el personaje y, al pasar por detrás de ciertas copas de árboles, una capa de vegetación que lo oculta parcialmente. Esta prueba de oclusión sólo consulta las coordenadas gráficas del jugador: no crea obstáculos, rutas ni colisiones.
- **Animación:** `vtm-graphics.js` mejora la alternancia de cuadros al caminar con el atlas actual, ancla la sombra al suelo, añade un ligero movimiento del abrigo y una respiración casi imperceptible al quedarse quieto. El sprite de reserva recibe animaciones equivalentes; se mantienen las escalas de 46 % en mapa y 68 % en barrios y el tamaño original en interiores.
- **Integración:** la llamada de `vtm-game.js` al renderizador de primer plano recibe escena, barrio y posición del personaje sólo para visualizar profundidad. Las estructuras de juego no se modificaron.
- **Caché:** los cuatro archivos gráficos y el punto de integración reciben referencias nuevas en `index.html` (`gfx-night-2-20261024`).
- **Pruebas:** `node tests/night-visual-smoke.js` verifica ocho barrios, nuevos reflejos y gradientes, que FX puede desactivarse, que las copas de árboles ocultan al personaje sólo al pasar detrás, que caminar genera fotogramas diferentes, que las escalas se mantienen y que los estados guardados quedan idénticos. Las comprobaciones de código finalizaron correctamente.

**Pendiente de confirmación:** GitHub contiene los cambios, pero no se ha verificado su despliegue en Hostinger ni su apariencia definitiva en el navegador del usuario. Los sprites detallados siguen siendo arte procedural y atlas SVG existente, no un nuevo paquete de sprites dibujados a mano.

## Refinamiento gráfico — Barrios y mapa de París (24 de octubre de 2026)

Se trabajó directamente sobre las escenas que el usuario mostró funcionando en Hostinger, en especial el **Barrio del Archivo Policial** y el **mapa general del Principado**. Se modificó el código renderizado; no se generaron imágenes de ejemplo.

- **Ocho barrios con edificios diferenciados:** variantes por zona de fachadas históricas, piedra noble, oficinas públicas, comercios con toldos, edificios industriales y cristales iluminados. Se eliminaron numerosas repeticiones visuales de la misma fachada.
- **Accesos principales personalizados:** fachada administrativa del Archivo Policial; pórtico del Elíseo; reja de los túneles; depósito de Saint-Denis; fachada nocturna del St. July y Bastilla; mansión de Passy y biblioteca de la Hemeroteca.
- **Cruces a escala de calle:** aceras separadas, pasos peatonales, zonas asfaltadas, parches de calzada, alcantarillas, bancos y mobiliario específico en los barrios. Son decoraciones: no modifican las rutas ni la detección de las tiendas.
- **Texto de barrios:** se sustituyó el encabezado excesivamente largo por variantes breves, de 8 píxeles, que entran en el espacio libre entre la insignia del jugador y el reloj.
- **Protagonista:** sprite al 68 % dentro de los barrios y al 46 % en el plano general. Interiores conservan tamaño original. Las zonas de interacción y la posición lógica del personaje no cambian.
- **Residencia:** en el mapa general se movió el rótulo hacia arriba (cerca del edificio) para impedir que lo tape la interfaz inferior.
- **Caché de archivos:** `index.html` apunta a nuevas versiones de `vtm-districts.js`, `vtm-graphics.js` y `vtm-game.js`. De ser necesario, refrescar la pestaña tras un redeploy de Hostinger.
- **Pruebas:** `node tests/district-visual-smoke.js` valida los ocho barrios, rótulos, centros de entrada y salida, escalas diferenciadas y no modificación de las partidas guardadas. Las pruebas sintácticas y de lógica realizadas finalizaron correctamente.

**Estado:** modificaciones confirmadas en GitHub `main`. No se ha comprobado visualmente el redeploy efectivo de Hostinger. El renderizado es todavía pixel art procedural: no debe confundirse con una ciudad completamente dibujada a mano o con una nueva cámara por distritos.

## Renovación gráfica — Etapa 1: reconstrucción de París (24 de octubre de 2026)

**Entregado en GitHub `main`:** el lienzo general de la ciudad fue sustituido por una base urbana procedural más detallada. No se han generado capturas ni imágenes estáticas; los cambios modifican el motor de dibujo que ejecuta la propia web.

- **Tejido urbano diferenciable:** las manzanas ya no son copias idénticas. Ahora presentan fachadas y techos mansarda, claraboyas, chimeneas, patios, comercios, plazas arboladas, pequeñas zonas industriales y materiales distintos por barrio.
- **Calles con escala coherente:** nuevos bulevares, aceras, pasos peatonales, bancos, lámparas, árboles, coches estacionados y bordillos. La animación previa de peatones, taxis y lluvia sigue funcionando por encima del fondo.
- **Sena:** ribera sinuosa con piedras, reflejos sobre el agua y tres puentes dibujados con barandas.
- **Ocho destinos visualmente distintos:** Hemeroteca de piedra con pórtico; St. July art déco; Elíseo palaciego; Saint-Denis industrial; túneles Nosferatu con reja; archivo policial administrativo; mansión ajardinada de Passy; locales rojizos de Bastilla. Todos conservan sus centros interactivos originales y sus nombres.
- **Tamaño de personajes:** el protagonista se dibuja al **46 % de su escala de interior únicamente en la vista general de París**, coherente con los transeúntes y los nuevos edificios.
- **Rendimiento y compatibilidad:** el fondo se pinta una sola vez por caché Canvas de 480 × 300 píxeles lógicos. Los edificios distintivos se dibujan por encima y el estado de la partida no cambia; no se alteraron hitboxes, misiones, scripts de movimiento ni partidas guardadas.
- **Control de regresión:** `node tests/paris-visual-smoke.js` verifica los ocho destinos, la residencia, la escala del personaje, el caché, la ausencia de paneles gigantes y que el dibujado no modifique la partida.

**Alcance:** esta es la **primera etapa** de la reconstrucción gráfica del juego. La iluminación dinámica por lugar, el rediseño completo de interiores, una cámara por distritos y sprites de personajes más expresivos quedan para las siguientes etapas. El cambio de código en GitHub no demuestra por sí solo que Hostinger lo haya desplegado.

## Corrección visual 1.1.1 — Proporciones del juego

Esta corrección **modifica el juego real**, sin generar ni sustituir capturas, imágenes o escenarios. En la vista general de París:

- Los ocho destinos se dibujan como **edificios de escala urbana y rótulos compactos**, ubicados en los mismos centros interactivos del mapa, en vez de enormes rectángulos que cubrían varias manzanas.
- La **residencia** deja de ocupar un bloque desproporcionado en la esquina inferior; ahora aparece como una fachada discreta y un rótulo pequeño.
- El **personaje** se dibuja al **58 % de su tamaño original exclusivamente en el mapa general**, conservando su tamaño completo en interiores, barrios y encuentros.
- El juego en escritorio tiene **un ancho máximo de 1290 px**, con columna lateral de 310 px y paneles más compactos. El mapa conserva proporción 8:5, sin deformar píxeles, ni cambiar el canvas lógico 480 × 300.
- El diseño se adapta a pantallas intermedias y móviles. Las coordenadas de interacción, desplazamiento, misiones y **partidas guardadas** se mantienen sin cambios.

La corrección se encuentra en `vtm-graphics.js`, `vtm-game.js`, `visual-2.css` e `index.html`. Se modificaron las versiones de las referencias de caché en HTML para que el navegador vuelva a cargar el arte y los estilos. La publicación en Hostinger debe verificarse independientemente del commit de GitHub.

## Versión 1.1 — Las audiencias y las Seis Tradiciones

**Política del Principado de París:** se incorporó un módulo jugable de audiencias ante el príncipe **Pierre Duvalier**, respetando los papeles públicos del Sheriff **Lord Thomas Wyndham**, la Guardiana del Elíseo, los Tremere, los Brujah y la red Nosferatu. Se mantienen los secretos de la Senescal **Etienne Moreau**: sus motivos, naturaleza y secretos no aparecen en descripciones, diálogos, pistas automáticas, acusaciones ni fallos de esta expansión.

**Accesos:** desde **Acciones → Corte del príncipe · audiencias, Tradiciones y expedientes** se puede consultar el estado político y el código de la Camarilla. Una vez admitido en el Elíseo, el jugador puede hablar con la Guardiana o investigar el lugar para acceder a las comparecencias.

**Audiencias ante Duvalier:**
- **Presentación formal:** un Vástago admitido en el Elíseo puede solicitar reconocimiento mediante Etiqueta. Ser recibido no equivale a obtener un cargo, un dominio ni permiso para crear progenie. Una petición fallida puede repetirse otra noche.
- **Licencia de caza:** después del reconocimiento, se puede solicitar autorización provisional para alimentarse en dominios identificados (Bastilla, St. July, Passy, Elíseo, túneles), con duración limitada y requisitos de Política.
- **Investigación reservada:** una petición de pesquisa formal exige contrastar primero **dos irregularidades documentales** entre archivo policial, St. July, Passy y túneles Nosferatu. Estas irregularidades no identifican culpables ni revelan secretos.
- **Reconsideración de amonestaciones:** las restricciones y advertencias pueden revisarse mediante nuevas comparecencias y decisiones.

**Disputas disponibles:**
- **Saint-Denis y Bastilla:** acusaciones cruzadas tras los altercados Brujah; tomar partido sin pruebas repercute en la corte.
- **Passy y St. July:** la trazabilidad administrativa de una correspondencia de la Casa Tremere.
- **Túneles y archivo policial:** referencias de accesos subterráneos en documentación mortal.

Cada disputa admite **mediación, expediente contrastado o acusación formal**, con tiradas distintas, requisitos reales de pruebas y consecuencias en reputación, prestigio y referencias. Una acusación sin pruebas suficientes perjudica al personaje, pero no convierte automáticamente al acusado en culpable. Los acuerdos se registran una sola vez para impedir recompensas repetidas.

**Seis Tradiciones de la Camarilla:** La Mascarada, El Dominio, La Progenie, La Responsabilidad, La Hospitalidad y La Destrucción. Se presentan en un códice contextual. Las reglas narrativas se inspiran en *Vampiro: La Mascarada, tercera edición (Revised)*, pero las pruebas, sanciones, umbrales y procedimientos de juego son una **adaptación del prototipo**. **No son una tabla oficial de castigos.**
- Cuando la exposición a mortales alcanza niveles crecientes, la corte puede abrir una **investigación preliminar** sobre la Mascarada; los rumores **no constituyen condena**.
- Cazar con éxito en un dominio custodiado sin autorización puede abrir un expediente por Dominio; si el personaje no ha sido reconocido, también puede revisarse su presentación conforme a Hospitalidad.
- El personaje puede responder con **testimonio, descargo documental o reparación verificable**. El fallo puede archivar la investigación, registrar una advertencia o imponer una censura política limitada; no hay destrucción arbitraria o Caza de Sangre automática.
- Si un Vástago aún bajo tutela recibe una censura fundada, el Domitor es informado y su aprecio se resiente. No se presume la culpa del sire ni se crea una segunda condena sin prueba.
- Las Tradiciones de Progenie y Destrucción quedan representadas en el código y el modelo de infracciones, pero **no se inventa la creación ni la destrucción de personajes** donde la jugabilidad actual no ofrece tales acciones. En particular, el enfrentamiento con Bapthiste sigue distinguiendo incapacitación, custodia y autorización.

**Guardados:** el estado adicional se guarda en \`game.court\` (audiencias, reconocimiento, licencias, expedientes, pruebas, disputas, restricciones e historial). Se inicializa en partidas anteriores conservando todos los demás estados, y se integra con los guardados locales y la copia de respaldo existentes. Los fallos de las audiencias, las investigaciones y las acciones políticas quedan persistidos.

**Pruebas:** validación sintáctica, pruebas de reglas para presentaciones, restricciones a ghouls, licencias, investigación documental, disputas, acusaciones sin pruebas, descargos, sanciones, cobros únicos y migraciones; prueba simulada de la interfaz desde una partida guardada del Elíseo hasta el diálogo de la Guardiana y la primera audiencia. **No se ha verificado el despliegue efectivo en Hostinger**: los cambios se confirmaron en GitHub \`main\`.


## Versión 1.0 — La política tiene consecuencias

Esta versión incorpora **favores a cobrar, compromisos contraídos, servicios políticos, vencimientos y encargos para los Vástagos**. Los sistemas funcionan directamente con **Ingrid, Lucien, Isabelle Dubois, Marcus von Württemberg, John Winthrop y la Guardiana del Elíseo**, sin cambiar el trasfondo de los personajes ni revelar prematuramente los secretos de la Senescal Etienne Moreau.

**Favores en lugar de simples bonificaciones:**
- Al hablar con estos PNJ **después del Abrazo**, aparece **«Negociar favores, deudas y servicios políticos»**. Cada Vástago mantiene una relación y un saldo propios; no son créditos universales intercambiables.
- Podés ganar un favor **cumpliendo una vez** un pequeño encargo específico del PNJ (obtener pruebas en otro escenario y regresar a informar). Los encargos personales previamente completados con éxito se reconocen en las partidas anteriores, una sola vez. Las investigaciones fallidas pueden intentarse de nuevo la noche siguiente.
- Un favor ganado puede gastarse en **información, protección, discreción, mediación, una recomendación a la corte o apoyo logístico**, según quién te lo deba. Estos servicios modifican las referencias disponibles, las ventajas de Habilidades, el riesgo de Mascarada o la reputación de una facción.
- Si gozás de la confianza suficiente podés **pedir un favor a crédito**. La obligación vence tres noches después; una deuda impaga provoca disminución de relación y reputación, incrementa la exposición y bloquea determinadas negociaciones. El castigo no se duplica por volver a cargar la partida.
- Las deudas se saldan **entregando un servicio pendiente** al acreedor o mediante un favor ganado disponible. Sólo se permiten dos obligaciones abiertas en total y una con cada PNJ. Los servicios tienen límites por personaje y noche.
- El prestigio que muestra el sistema deriva de reputación con la Camarilla, relaciones y servicios completados. Es un **indicador local del videojuego, no el Trasfondo Posición oficial ni un cargo político otorgado por Pierre Duvalier**.

**Dónde verlo:** desde **Acciones → Política · libro de favores y deudas**, en el diálogo de los PNJ políticos y en el diario del personaje. Los encargos aceptados se investigan en los lugares de París correspondientes con su propio requisito de Atributo, Habilidad y dificultad.

**Compatibilidad y pruebas:** el nuevo estado \`game.politics\` se crea al continuar partidas existentes, sin reemplazar las misiones actuales, el inventario o la economía. Las pruebas unitarias comprobaron entrega y repetición de encargos, gasto de favores, deuda y vencimiento, sanciones únicas, liquidación de obligaciones, restricciones para ghouls y migración de encargos antiguos. Una prueba simulada de interfaz confirmó la carga de una partida, el diálogo con Lucien, la opción de negociación y la aceptación/guardado de un encargo político.

**Limitaciones:** se trata de una implementación original para el videojuego, inspirada en las relaciones políticas de Vampiro: La Mascarada. No es una reproducción literal de todos los sistemas de Prestation, Harpías, Posición o Boons del manual. Todavía faltan ceremonias formales de deuda ante Harpías, favores intercambiables y audiencias de corte complejas.

**Despliegue:** los cambios se confirmaron en el repositorio GitHub, rama \`main\`. El estado de publicación en Hostinger no está confirmado.


## Versión 0.9 — Economía nocturna y Disciplinas en el mundo

La economía deja de depender exclusivamente de tiradas abstractas de Trasfondos y conecta los **comercios secundarios ya existentes** con el inventario de equipo. Además, las Disciplinas poseen aplicaciones narrativas fuera de los combates.

**Comercios y dinero.** La partida conserva \`economy.cash\`, historial de pagos y existencias consumidas. Los fondos iniciales se calculan una sola vez a partir del Trasfondo **Recursos** y las partidas previas se migran sin perder equipo ni historia. Recursos otorga un pequeño ingreso al comenzar una noche nueva, nunca dos veces en la misma noche. Completar encargos del Domitor, informes personales y ayudar una vez a cada establecimiento genera honorarios. Los precios son **euros ficticios del videojuego**; no representan una tabla oficial de economía de la tercera edición.

- En tiendas de cada barrio, hablar con el encargado permite **comprar o vender**. Sus mercancías dependen de la clase de local: taller, café, librería, galería, oficina, floristería, almacén o anticuario.
- Se pueden adquirir objetos persistentes del inventario ya existente —armas cuerpo a cuerpo, chalecos, botiquines y munición— y pagar por **rumores**, **servicios de discreción** o **presentaciones comerciales**. Las compras afectan dinero, inventario o ventajas reales para las tiradas.
- **Finanzas**, el Trasfondo Recursos y haber ayudado al comerciante modifican los precios. Los objetos equipados no se pueden vender y el valor de reventa evita comprar/vender indefinidamente con ganancia. Existencias y servicios tienen límites por noche o por comercio.
- El apartado **Acciones → Fondos** permite consultar saldo, ingresos esperados e historial. El saldo también aparece en el panel y en el diario.

**Disciplinas fuera del combate.** Aparece **Acciones → Disciplinas aplicadas a personas y lugares** mientras se exploran espacios compatibles; los locales y escenarios ofrecen acceso contextual. Los ghouls no pueden utilizar estos poderes.

- **Animalismo, Auspex y Protean** pueden revelar indicios ambientales mediante tiradas concretas.
- **Presencia y Dominación** pueden influir en un encargado mortal y ofrecer mejores condiciones comerciales durante la noche; el objetivo puede resistir, se gasta Sangre y la coacción puede perjudicar Humanidad o Mascarada.
- **Dementación** puede distraer a un interlocutor, **Ofuscación** reduce exposición y genera cobertura, **Potencia** supera una dificultad física con riesgo, y **Taumaturgia** permite buscar señales ocultas con coste de Sangre.
- **Celeridad** puede mejorar el desplazamiento por el mapa durante el resto de la noche, mientras que **Fortaleza** permanece pasiva.
- Cada acción requiere haber adquirido círculos en la Disciplina, verifica el contexto, consume recursos correspondientes y no puede repetirse ilimitadamente en el mismo lugar durante la misma noche.

**Integración, migración y pruebas.** Los nuevos módulos son \`vtm-economy.js\`, \`vtm-economy-ui.js\`, \`vtm-world-powers.js\` y \`vtm-world-powers-ui.js\`. Se cargan antes del motor principal en \`index.html\`. Se realizó una prueba simulada del flujo completo desde una partida previa: conversar con el encargado de un café, abrir su tienda, adquirir información, comprobar el descuento de dinero y guardar una pista; a continuación, activar Auspex fuera de combate, consumir Sangre y verificar el registro persistente. También se comprobaron los límites de compras, el ingreso nocturno único y las condiciones que impiden el uso de poderes por ghouls.

**Limitaciones:** los procedimientos de compra, rentas, precios, efectos comerciales y varias aplicaciones de poderes son **adaptaciones del videojuego**, no reglas reproducidas literalmente del manual de tercera edición. Quedan por diseñar la economía de favores vampíricos, comerciantes con inventarios más variados, tiradas resistidas completas según poder y una gestión más profunda de los efectos narrativos.

**Despliegue:** los archivos de esta versión se subieron a GitHub \`main\`. El despliegue efectivo en Hostinger debe verificarse por separado.


## Versión 0.8 — Inventario real, munición y Disciplinas enfrentadas

**Equipo que existe en la partida.** Inventario persistente de **barra metálica, cuchillo, pistola compacta, munición, chaleco protector y botiquines**. Cada arma debe obtenerse y equiparse antes de usarla. Las adquisiciones ocurren en lugares concretos (Saint-Denis, Bastilla, Passy, policía y St. July), exigen Habilidades y, a menudo, Trasfondos como Recursos, Contactos, Aliados o Influencia. Cada objeto sólo puede intentarse conseguir una vez por noche; no hay tiradas infinitas. Entrá por **Acciones → Inventario** o **«Conseguir suministros o preparar equipamiento»** en las escenas apropiadas.

**Disparos y protección.** La pistola posee cargador de seis cartuchos; cada disparo consume uno y las recargas gastan un turno durante el cual el enemigo puede atacar. Sólo podés disparar si tenés la pistola equipada, cargada y conocés Armas de Fuego. Los suministros de munición son finitos. El chaleco suma dos dados a la absorción de daño contundente y letal (no agravado), y los botiquines requieren Medicina, no curan daño agravado y se consumen al utilizarlos. Estos objetos se guardan con el mismo personaje entre sesiones.

**Adversarios diferenciados.** El matón de Saint-Denis se vuelve más agresivo al estar herido; el provocador de Bastilla comienza a esquivar cuando se siente superado; el custodio de Passy posee protección y una cantidad limitada de disparos. Los enemigos guardan **Voluntad, Astucia, protección y munición**, además de Salud, habilidades, fuerza y resistencia.

**Tiradas enfrentadas sobrenaturales.** Dominación, efectos de terror, influencias emocionales y ciertos poderes de lectura de mente activados **contra un oponente presente en combate** se enfrentan a una tirada de Voluntad + Astucia del objetivo. La acción del vampiro tira el Atributo + Habilidad correspondiente; sólo si supera los éxitos netos del adversario se aplica el efecto. Fracasar sigue consumiendo la Sangre comprometida, la intervención queda limitada y puede provocar exposición. El resultado muestra ambos grupos de dados y los éxitos.

**Compatibilidad y pruebas.** Los nuevos campos \`equipment\` y datos de combate se inicializan automáticamente al continuar partidas anteriores. Se validó la sintaxis de JavaScript y una continuación de partida simulada en la que un ghoul encuentra una barra, la equipa y la conserva en el guardado. Otras pruebas cubren munición, consumición de cartuchos, restricciones de inventario, guardados antiguos y poderes mentales resistidos.

**Adaptación, no reproducción exacta:** la adquisición de objetos, efectos simplificados y progresión de equipamiento son sistemas originales del videojuego. Las tiradas enfrentadas y características de armas son una simplificación; todavía falta implementar objetivos diversos fuera del combate, cargadores por arma, compra por dinero y todas las excepciones del manual de tercera edición.

**Publicación:** estos cambios se han guardado en la rama \`main\` de GitHub. El despliegue efectivo en Hostinger se verifica por separado.


## Versión 0.7 — Combate por turnos y poderes por círculo (octubre de 2026)

**Combate táctico jugable en tres escenarios:** Saint-Denis, Bastilla y Passy. Al examinar el punto principal del lugar se ofrece **«Enfrentar físicamente una amenaza del lugar»**, además de los caminos sociales e investigadores anteriores. Podés iniciar una pelea, intentar una solución pacífica o retirarte. En combate se habilitan: Pelea, arma improvisada, Armas de Fuego (con preparación y acceso a equipamiento), Esquivar, huir y activar una Disciplina.

**Secuencia y daños:** iniciativa = Destreza + Astucia + d10; tirada de ataque → daño → absorción; tipos de daño **contundente, letal y agravado**. El sistema registra heridas y aplica penalizadores al disminuir la Salud. Los mortales no absorben letal con Resistencia; Fortaleza vampírica permite absorber agravado. El contundente recibido por un Vástago se reduce después de la absorción. La victoria concluye el encuentro y otorga PX **una sola vez**, pudiendo resolver un encargo principal y preparar uno secundario. La derrota causa costes de Mascarada y reputación, con un rescate básico para evitar partidas inutilizables.

**Disciplinas:**
- Los siete clanes presentan 11 Disciplinas en total; el catálogo cubre niveles 1 a 5, con el Abrazo como requisito de uso.
- **Celeridad** funciona como acciones físicas adicionales financiadas con Sangre durante un turno de combate (no como una bonificación social genérica).
- **Potencia** añade éxitos de fuerza de forma pasiva al daño físico.
- **Fortaleza** aporta dados pasivos de absorción, incluido daño agravado.
- **Auspex, Animalismo, Dementación, Dominación, Ofuscación, Presencia, Protean y Taumaturgia** ofrecen efectos distintos según nivel: información, cobertura, influencia, perturbación de enemigos, garras agravadas y otros recursos. Sus costes y restricciones se verifican antes de activarlos.
- Cada poder/turno tiene limitaciones para evitar activación ilimitada; la sangre se consume y queda registrada. Algunos poderes elevan la exposición.

**Guardados y pruebas:** se mantienen la misma clave y estructura de partida. Los campos de combate, daño y poderes se inicializan al continuar partidas viejas; no se pierden los datos previos de Habilidades, Trasfondos, facciones, escenas o misiones. Probado con ejecución simulada de la interfaz: continuar una partida, abrir una escena, iniciar combate, elegir ataque, calcular iniciativa, daño y absorción, guardar una ronda; validación sintáctica de JavaScript y pruebas unitarias del motor.

**Fidelidad y limitaciones:** el sistema de iniciativa, clases de daño y absorción se inspira en *Vampiro: La Mascarada, tercera edición*, capítulo «Sistemas y Drama», sección «Sistemas de Combate» (págs. impresas 207–211 del manual proporcionado). La interfaz, simplificación de poderes, enemigos concretos, rescate, duración/coste de efectos y sistema de PX por encuentro son **adaptaciones del videojuego**, no una transcripción completa de las reglas de mesa. Los primeros cinco círculos están representados, pero varios poderes necesitan todavía tiradas resistidas específicas, objetivos detallados, duraciones completas y representación gráfica. El combate todavía no simula armas, munición o salud de cada PNJ con toda la complejidad del juego de mesa.

**Despliegue:** los cambios se implementaron en GitHub \`main\`, pero debe comprobarse por separado el redeploy de Hostinger para afirmar que están visibles en la web pública.

## Versión 0.6 — Los rasgos determinan cómo jugás

**Nueva integración narrativa.** Al examinar el puesto principal de los ocho interiores (Archivo policial, St. July, Elíseo, Saint-Denis, túneles Nosferatu, Passy, Bastilla y Hemeroteca), aparece **«Resolver una situación del lugar según mi ficha»**. Cada escenario ofrece cinco enfoques distintos: **40 rutas** en total, con requisitos de Habilidades, Trasfondos o Disciplinas adquiridas después del Abrazo.

- **Consecuencias concretas:** diferentes caminos producen pruebas para el caso Pierre Dupont, referencias reconocidas en la corte, ayudas Tremere/Nosferatu/Brujah, confianza con interlocutores, reputación de facción, heridas o exposición de la Mascarada. Se almacena qué ruta se intentó, en qué noche y si se resolvió. Un éxito no se puede repetir para obtener PX o favores ilimitados.
- **Diferenciación de personajes:** un experto en Leyes puede tramitar un expediente; alguien con Informática puede examinar registros; Influencia ofrece alternativas institucionales y un Vástago con Ofuscación puede intentar eludir miradas, gastando Sangre. Las rutas sin requisitos especiales tienen dificultades más altas.
- **Interacción con las misiones:** un desenlace exitoso en el lugar correspondiente reduce la dificultad y aumenta las recompensas de encargos principales; en los personales prepara la operación y disminuye su riesgo. Las escenas pertinentes también aportan evidencias al caso Dupont sin duplicar pistas.
- **Virtudes y Humanidad:** decisiones coercitivas o amenazantes pueden requerir Conciencia y reducir Humanidad; el horror puede poner a prueba Coraje; la caza desesperada exige Autocontrol y puede agravar la exposición. La Humanidad actual se muestra en el panel y el diario.
- **Experiencia:** cada lugar resuelto otorga 2 PX la primera vez. Desde **Ficha → Mejorar rasgos con experiencia** se pueden mejorar Atributos, Habilidades, Virtudes, Humanidad, Voluntad y, tras el Abrazo, Disciplinas propias del clan. Los precios están inspirados en la tabla de experiencia de la tercera edición, con simplificaciones para el prototipo. No se permite superar los límites previstos de rasgos.
- **Elíseo:** Aliados, Fama o Influencia suficientes abren nuevas formas de negociar el acceso, con tiradas y posibles costes políticos y de exposición.
- **Continuación de partida:** el guardado sigue usando la misma clave y versión estructural. Los nuevos campos (experiencia, historial de escenas y comprobaciones) se inicializan al cargar partidas anteriores.

**Verificación técnica:** todos los módulos pasan validación sintáctica; prueba simulada de continuación de partida, menú de rutas, condiciones de disponibilidad, tirada, pista ganada, referencia obtenida y persistencia del resultado. El desarrollo de las escenas es contenido original del videojuego. Esta entrega no implementa todavía todas las opciones exactas de cada nivel de Disciplina ni un combate completo con las reglas del manual.

**Publicación:** cambios realizados en la rama \`main\` de GitHub. El despliegue automático en Hostinger es independiente; comprobar su estado antes de darlo por publicado.


## Versión 0.5 — La ficha funciona en el juego (octubre de 2026)

Se incorpora **ACCIONES** junto al botón **Ficha**. Esta versión conserva la creación 7/5/3 de Atributos, 13/9/5 de Habilidades, 5 puntos de Trasfondos mortales, Virtudes, puntos gratuitos, misiones, facciones y guardados de la versión anterior.

- **Nueve Atributos y treinta Habilidades:** todos los rasgos tienen combinaciones jugables. El botón ACCIONES ofrece 10 Talentos, 10 Técnicas y 10 Conocimientos con dificultades, resultados y consecuencias; las tiradas del argumento existente también pasan por el mismo motor de bonificadores. Las acciones dependen del lugar, consumen tiempo y tienen límite de un intento por habilidad, lugar y noche.
- **Seis Trasfondos mortales:** Aliados, Contactos, Criados, Fama, Influencia y Recursos ofrecen favores activos (uno por noche) y ventajas automáticas en contextos apropiados. A partir de 2/4 círculos aplican +1/+2 dados; las acciones del Trasfondo pueden generar preparación, pistas, influencia o cobertura. Fama puede generar exposición.
- **Ventajas consumibles:** pista, cobertura, influencia y preparación; máximo 3 de cada una. Se gastan al realizar una tirada apropiada o para disminuir una consecuencia de exposición; no permiten repetir recompensas sin límite.
- **Atributos físicos y estado:** Destreza influye en la velocidad; Pelea y armas pueden causar lesiones; Medicina y Supervivencia permiten recuperar Salud. Las heridas graves y la incapacitación penalizan las tiradas.
- **Voluntad:** se gasta para obtener preparación para futuras tiradas y se recupera parcialmente al pasar a una nueva noche.
- **Disciplinas:** sólo se activan **después del Abrazo**, con círculos adquiridos. Son efectos contextualizados por Disciplina (Animalismo, Auspex, Celeridad, Dementación, Dominación, Fortaleza, Ofuscación, Potencia, Presencia, Protean y Taumaturgia), requieren Sangre y potencian tiradas relacionadas; algunos dones comprometen la Mascarada.
- **Alimentación:** una vez por noche y por lugar se puede intentar una caza para reponer Sangre; un fracaso aumenta la exposición y reduce Voluntad. Con la reserva agotada, la sed penaliza tiradas.
- **Ficha y Diario:** muestran Salud, Voluntad, Sangre y ventajas preparadas. Los valores se guardan con la partida anterior, con migración automática de campos ausentes.

**Adaptaciones explícitas:** el menú de acciones, fichas de ventajas, límite de uso, costes resumidos de sangre y reglas de caza son mecánicas originales del videojuego inspiradas en la 3.ª edición; no son una transcripción literal del manual. La implementación prioriza consecuencias narrativas y no representa aún un sistema táctico completo de combate o todas las opciones individuales de cada círculo de Disciplina.

**Pruebas de desarrollo:** sintaxis, correspondencia exacta de las 30 Habilidades y los dones de los siete clanes, continuidad de guardados previos y simulación del menú y una acción completa de Talentos. **La publicación efectiva en Hostinger debe comprobarse por separado.**

## Rediseño visual 2.0 — Fase VIII: barrios conectados y exploración a pie (octubre de 2026)

Se incorporó un segundo nivel de exploración que **no reemplaza el mapa esquemático original** ni modifica misiones, PNJ o accesos a los ocho locales.

### Cómo funciona

1. En el mapa general de París, acercate al destino que prefieras y pulsá **E**. Elegí **Explorar las calles** para entrar a ese barrio, **Entrar directamente al lugar** para mantener el flujo original o **Continuar** para permanecer en el mapa.
2. En el barrio, movete con WASD/flechas o haciendo clic. Hay una **puerta principal** del lugar correspondiente, dos **rincones observables**, accesos cardinales a barrios vecinos y un acceso al mapa general.
3. Podés entrar al mismo local de siempre para continuar sus misiones y volver a **la posición en el barrio desde la que entraste**. Desde un barrio también podés cruzar a otros barrios conectados a pie.
4. El HUD y el diario muestran **barrios recorridos (0/8)** y **rincones descubiertos (0/16)**. Las observaciones dan contexto narrativo y se registran una sola vez, sin pistas falsas de misiones ni recompensas automáticas.

### Barrios de la expansión

- Passy, barrio del St. July y distrito del Elíseo.
- Barrio de la Hemeroteca, Bastilla y Saint-Denis.
- Barrio del Archivo Policial y accesos a los túneles Nosferatu.

Las ocho zonas forman una red **abstracta de navegación para el videojuego**, no una representación fiel de las distancias y adyacencias geográficas de París. Cada sector utiliza manzanas, calles transitables, aceras y entradas separadas, con iluminación acorde a su ambiente. Hay **20 conexiones dirigidas (10 bidireccionales)** entre los ocho barrios. No se han creado todavía centenares de calles ni un mundo abierto continuo.

### Implementación técnica y compatibilidad

- \`vtm-districts.js\`: topología de ocho barrios, fondos Canvas cacheados, 16 observaciones, portales, objetos de entorno y detección de interacciones.
- \`vtm-physics.js\`: colisiones con las cuatro manzanas de los barrios, navegación y rutas alrededor de las fachadas. Hay espacio libre hacia la puerta principal y el mapa.
- \`vtm-game.js\`: nueva escena \`district\`, menú de elección desde el mapa original, retorno a la misma posición tras entrar en un local, reloj y visitas persistentes. El estado de exploración se almacena en \`game.districtVisited\` y \`game.districtNotes\`; las partidas antiguas reciben valores vacíos.
- \`index.html\` y \`visual-2.css\`: panel lateral de exploración, botón contextual para regresar al mapa y presentación de la fase VIII.
- En ausencia del módulo de barrios, los accesos directos a los locales siguen disponibles y las partidas guardadas en una escena de barrio vuelven al mapa general sin bloquearse.

**Pruebas:** análisis sintáctico del conjunto JS; grafo de ocho sectores totalmente conectado; 52 rutas físicas de llegada a puertas, salidas, rincones y fronteras realizadas mediante pasos simulados sin atascos; carga de una partida anterior; ciclo mapa → barrio → local → barrio → barrio vecino → mapa con aprecio preservado.

**Limitaciones:** los barrios reutilizan un esquema de calles y edificios con paleta y ambiente diferentes. Este primer sistema no incluye todavía comercios secundarios con inventarios, circulación de PNJ persistente, combate de calle ni zonas de tamaño ilimitado. El despliegue en Hostinger debe verificarse aparte.

## Rediseño visual 2.0 — Fase VII: una ciudad que se mueve (octubre de 2026)

Se integró `vtm-ambience.js`, un módulo visual y narrativo desacoplado de la lógica de tiradas, misiones y guardados.

- **Ciudad activa:** peatones con ropa y siluetas distintas, algunos con paraguas; tres taxis circulan por las vías; reflejos y pequeños destellos de iluminación. El movimiento y la densidad cambian según la hora nocturna, sin introducir PNJ ficticios en la política de la crónica.
- **Interiores habitados:** extras ambientales en St. July, Elíseo, Bastilla, Saint-Denis, hemeroteca y comisaría; monitores y focos sutiles en Passy y túneles.
- **Capas de profundidad:** columnas y bordes delanteros, sombras discretas en los bordes de pantalla y luz ambiental que fluctúa. Ninguna capa bloquea el centro de la pantalla ni la salida.
- **Cuatro observaciones opcionales en París:** carteles bajo la lluvia, quiosco cerrado, parada de taxis y reflejos del Sena. Se activan con la tecla E, se describen en un cuadro narrativo y se registran una sola vez en el diario, sin recompensas, nuevas misiones ni revelaciones de la trama central.
- **Rendimiento:** sin imágenes adicionales, librerías ni solicitudes de red. Los extras son deterministas y no se guardan; sólo el registro de exploración persiste en `game.flags["street:<id>"]`. El botón FX desactiva los elementos animados, respetando preferencias de movimiento reducido. El renderizador anterior sigue funcionando si el módulo opcional falta.

**Pruebas:** sintaxis de diez archivos JS; carga de una partida guardada anterior; interacción inicial y repetida con una observación, sin duplicar registro; FX encendidos y apagados; y entrada al St. July sin pérdida de aprecio. Los resultados provienen de ejecución simulada, no de un navegador gráfico verificado. La publicación en Hostinger sigue siendo independiente de los commits.

## Rediseño visual 2.0 — Fase VI: apariencia del protagonista y animación (octubre de 2026)

**Cambios implementados**

- **Creador de personaje:** dentro del paso Concepto, nuevo selector visual con vista previa para tono de piel (5), color de cabello (5), peinado (3), vestimenta (5) y accesorio (4). Son elecciones cosméticas sin coste en puntos y no alteran las reglas de la tercera edición.
- **Editor durante la partida:** botón **Apariencia**, vista previa, **Guardar apariencia** y **Cancelar**. El aspecto se conserva en el guardado junto con la ficha. Se pueden conservar estilos elegidos antes del Abrazo.
- **Ghoul y Vástago distintos:** antes del Abrazo el sprite es humano. Después aparece un acabado más pálido y un acento visual discreto del clan. Nosferatu recibe rasgos físicos adicionales. Las peculiaridades gráficas no representan automáticamente poderes o Disciplinas.
- **Nuevo atlas `assets/personajes-paris-v3.svg`:** 16 personajes o variantes × 4 orientaciones × 4 cuadros de marcha = **256 cuadros**, de 32 × 48 píxeles. Sustituye al atlas de 128 cuadros; se mantiene la compatibilidad con el fallback programático si la imagen no carga.
- **Animación complementaria:** parpadeo ocasional, detalles de respiración en reposo y movimiento de bufanda. Durante el Abrazo se muestra una animación breve alrededor del personaje (sólo con FX activos), que no permanece después.
- **Guardados antiguos:** reciben un conjunto de apariencia predeterminado al continuar, sin modificar Atributos, misiones, pistas, aprecio, clan o Disciplinas.
- **Corrección del HUD:** el indicador de Ghoul/Vástago cambia en el momento del Abrazo; también se refrescan reloj e indicador de exposición.

**Pruebas realizadas:** análisis de sintaxis y referencias HTML; migración de partida anterior; editor y cancelación; vista previa del creador; persistencia del aspecto después del Abrazo; render del atlas de 256 cuadros; ceremonia del Abrazo y asignación de las tres Disciplinas iniciales. Pendiente inspección visual exhaustiva en navegador y despliegue confirmado en Hostinger.

## Rediseño visual 2.0 — Fase V: despachos y dormitorios de los siete clanes (octubre de 2026)

**Se completaron las 21 salas privadas del prototipo con fondos SVG propios**:

- Los **siete despachos** tienen bibliotecas y documentación con decoración específica para Toreador, Ventrue, Tremere, Nosferatu, Brujah, Gangrel y Malkavian.
- Los **siete dormitorios** tienen camas, vestidores, cuadernos de servicio, ventanas y detalles decorativos relacionados con el clan. Se suman a los siete salones ya realizados.
- `assets/residencias/<clan>-despacho.svg` y `<clan>-habitaciones.svg` son recursos locales con `viewBox="0 0 480 300"`. El contenido se ha creado sin cambiar posiciones interactivas.
- `vtm-graphics.js` registra ahora **29 fondos SVG** entre lugares públicos y residencias. Los carga **bajo demanda** al visitar cada escena, en vez de solicitar todos al abrir el juego. Mientras se carga una imagen, o si falla, se utiliza el antiguo renderizador Canvas.
- **Iluminación animada por sala**: los despachos tienen luz cálida sobre documentos; los dormitorios, reflejos nocturnos fríos; salones, clubes y lugares de París mantienen sus efectos temáticos. Los efectos respetan la opción FX del jugador.
- **Compatible con el guardado anterior**: se mantienen atributos, misiones, pistas, aprecio, clanes y Abrazo. Se reutilizan colisiones, rutas y accesos de la versión anterior.

**Pruebas de la fase V**: presencia y estructura de los 14 nuevos SVG; renderizado de 21 combinaciones de sala/clan y ocho lugares públicos (29 recursos); carga diferida y respaldo tras error simulado; integración con una partida anterior, movimiento por clic, guardado y FX, sin excepciones observadas.

**Limitación**: los SVG son ilustraciones vectoriales originales para el prototipo. No equivalen todavía a escenografía pintada a mano, motores 3D o iluminación física. El despliegue en Hostinger debe verificarse aparte.

## Rediseño visual 2.0 — Fase IV: escenarios ilustrados (octubre de 2026)

**Nueva entrega de fondos originales e independientes:**

- **Ocho escenarios públicos:** St. July, Elíseo, Passy, túneles Nosferatu, Bastilla, Saint-Denis, hemeroteca y archivo policial. Cada fondo SVG tiene composición arquitectónica, mobiliario e iluminación específicos.
- **Siete salones de Domitores:** Toreador, Ventrue, Tremere, Nosferatu, Brujah, Gangrel y Malkavian. Se respetan las posiciones de maestro, puertas y objetos.
- **Integración:** `vtm-graphics.js` carga los quince SVG locales de forma asíncrona y los dibuja en Canvas detrás de los personajes. Si falla algún archivo, recurre a los fondos anteriores.
- **Luz ambiental:** variaciones de brillo y temperatura por escenario y clan, respetando la opción existente de desactivar FX.
- **Sin cambios de reglas:** ficha de creación, aprecio, tiradas, encargos, secretos y guardados se conservan.
- **Recursos documentados:** [escenarios](assets/escenarios/README.md) y [residencias](assets/residencias/README.md).

**Pruebas:** verificación de sintaxis JS, presencia de los 15 archivos SVG, carga simulada de los siete salones y ocho escenarios con gráficos externos, fallback de despacho/habitaciones, navegación y guardado previo sin pérdida de aprecio. No se confirmó todavía el resultado visual en todos los navegadores reales ni la actualización del despliegue de Hostinger.

**Limitaciones:** los nuevos fondos son ilustraciones vectoriales 2D para el prototipo, no modelos 3D ni ilustraciones detalladas pintadas a mano. Las salas secundarias siguen siendo procedurales y comparten algunas disposiciones básicas.

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
