# Crónicas de París — Juego web de Vampiro: La Mascarada (prototipo 0.8 · rediseño visual 2.0, fase IX)

RPG 2D narrativo de pixel art oscuro, ambientado en **el Principado de París** creado previamente para la campaña del usuario. El personaje comienza como **humano ghoul** al servicio de un Domitor vampiro. **No hay zombis ni oleadas** en esta versión.

- **Juego:** https://wheat-chough-542895.hostingersite.com/
- **GitHub:** https://github.com/gustavothinkinfinite-stack/zombie
- **Configuración de despliegue:** https://hpanel.hostinger.com/websites/wheat-chough-542895.hostingersite.com/advanced/git
- **Rama:** \`main\`
- **Ruta de alojamiento:** \`public_html\`
- **Tecnología:** HTML + CSS + JavaScript Canvas, sin compilación ni servidor.



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
