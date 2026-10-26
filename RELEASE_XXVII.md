# Próximo release — Fase XXVII: Los cazadores de la noche

**Estado: fase XXVII parcialmente implementada (XXVII-A, XXVII-B y primera interacción XXVII-C). Ya existen seguimiento físico y diálogo o retirada voluntaria ante observadores sin identificar; la célula de cazadores identificados y el combate propio siguen pendientes.** Base auditada: rama `main`, fase XXVI, 25 de octubre de 2026. El número de fase es una propuesta de continuidad; no cambiar la portada ni anunciar lanzamiento hasta superar la aceptación.

## 1. Auditoría y continuidad

Se revisaron los mensajes y fechas de los **625 commits** disponibles de `main` (siete páginas del historial), profundizando en los módulos y pruebas vigentes relacionados con el alcance. Esta revisión histórica no equivale a reejecutar cada revisión antigua. La referencia ejecutable es el código actual de `main`.

| Sistema vigente | Referencia y estado | Restricción de integración |
| --- | --- | --- |
| Ciudad y rumores | `vtm-city-life.js`, `vtm-reactive-city.js`, `vtm-reactive-districts.js` | No convertir rumores en evidencia ni revelar fuentes ocultas |
| Reputación comercial y memoria social | `vtm-contacts.js`, `vtm-city-life.js` | Conservar relaciones previas y limitar las reacciones al barrio correcto |
| Exposición, testigos y atención policial | `vtm-city-consequences.js` | La vigilancia policial **no** significa automáticamente actividad de cazadores |
| Sigilo y persecución de patrullas | `vtm-stealth-chase.js`, `vtm-physics.js` | Reutilizar geometría, línea de visión y técnicas; no convertir patrullas en cazadores |
| Combate y equipo | `vtm-tactics.js`, `vtm-tactics-ui.js`, `vtm-advanced-tactics.js` | El combate actual usa enemigos fijos por lugar, registros de victoria y PX: no reutilizar sin adaptar encuentros recurrentes |
| Progresión y mundo político | `vtm-vitae.js`, `vtm-conspiracy.js`, `vtm-principado.js`, `vtm-court.js` | Respeto al estado ghoul o Vástago, Humanidad, Mascarada y desbloqueo gradual de revelaciones |
| Expedientes coexistentes | `vtm-elizabeth.js`, `vtm-parker-dossier.js`, `vtm-parker-politics.js`, `vtm-local-cases.js` | No reemplazar ni reiniciar pistas, testigos, audiencias, protección o consecuencias |
| Partidas | `vtm-save.js` | Mantener `version: 1`, principal y respaldo, confirmaciones y recuperación compatibles |
| Validación | `.github/workflows/quality.yml`, `tests/`, `production-smoke.yml` | Sintaxis, todas las regresiones, Chromium local, navegador público y huellas de recursos |

**Conclusión de la auditoría:** la policía, las persecuciones y el combate existen; una **célula de cazadores independiente todavía no**. El siguiente release debe profundizar estos sistemas, no crear un minijuego ajeno a París.

## 2. Canon y presentación sin spoilers

- Existe una célula activa de **cazadores mortales organizados**, no omniscientes ni necesariamente coordinados con la policía ordinaria. Tienen recursos, armas, vigilancia y capacidad de seguir indicios; también pueden equivocarse.
- Han recibido **información anónima** sobre objetivos y desplazamientos; están especialmente atentos al entorno de Bapthiste. En el juego, la procedencia de esos datos **no se identifica ni se infiere automáticamente**.
- La célula toma decisiones propias. No todos los incidentes son ataques dirigidos ni todas las desapariciones deben atribuirse a ella.
- El protagonista comienza como **ghoul**; no puede ser reconocido automáticamente como Vástago. La persecución directa requiere indicios razonables de vinculación o exposición visible.
- Nunca adelantar identidad, naturaleza u objetivos del responsable de la conspiración central. Respetar los requisitos de pruebas y el cierre del tercer acto de `vtm-conspiracy.js`.
- **Caso 03 previsto — «Los cazadores de la noche»:** desaparición de un Vástago y refugio destruido. Investigación de material especializado, fotografías tomadas desde vehículos, lista incompleta de personas vigiladas, comunicaciones anónimas y documentación policial irregular. La fuente de las filtraciones se debe descubrir mediante pruebas, no por textos de ambientación.

## 3. Encuentros casuales, atención y escalada

**Modelo propuesto, pendiente de calibración y pruebas; no son probabilidades implementadas:**

| Situación | Experiencia prevista | Requisitos |
| --- | --- | --- |
| Tránsito nocturno normal | Raro avistamiento ambiental de alguien vigilando; puede no ser un cazador | Sin ataque aleatorio inevitable, especialmente para un ghoul desconocido |
| Rumores recientes o incidentes cerca del jugador | Señales observables de vigilancia: vehículo estacionado, fotografía, persona siguiendo a otra | Información pública compatible con las fuentes existentes |
| Exposición elevada **junto con** testimonios o rastros relevantes | Seguimiento del protagonista, intento de reconocimiento, posible intercepción | No inferir identidad sobrenatural solo a partir del calor policial |
| Reincidencia, identificación o investigación de la célula | Persecución, escape o negociación defensiva; combate si no se desescala | Dar advertencias y oportunidad real de retirarse |
| Caso 03 avanzado | Encontrar una célula o uno de sus integrantes y obtener pruebas relacionadas | Capturar, seguir, interrogar o neutralizar con resultados persistentes y sin revelaciones precoces |

**Balance inicial a validar:** máximo un episodio nuevo por noche para la partida completa; período de enfriamiento después de un enfrentamiento; no volver a sortear al entrar y salir de un barrio o recargar una partida; probabilidad dependiente de contexto y no de una tirada cada fotograma. Los sucesos de observación pueden ocurrir con bajo riesgo; una emboscada letal no debería surgir sin avisos o decisiones previas.

### Flujo jugable

1. **Advertencia:** silueta, coche, rumor, seguimiento o testigo; pistas ambiguas.
2. **Elección:** investigar discretamente, cambiar de ruta, buscar refugio o ignorarlo. Registrar consecuencias sin duplicarlas.
3. **Seguimiento:** ruta y campo de visión sobre `vtm-physics.js`; distintos del patrullaje policial. Sigilo y carrera permiten perder el rastro.
4. **Intercepción:** explicar, confundir, negociar una retirada, escapar o defenderse. Un ghoul puede evitar el enfrentamiento; el combate nunca debe ser requisito para investigar.
5. **Combate opcional:** usar salud, armas, munición, daño, absorción, iniciativa y Humanidad actuales. Diseñar adversarios humanos propios de cazadores; no sustituir un enemigo fijo de otro escenario. No duplicar PX ni recompensas por repetir el evento.
6. **Desenlace y persistencia:** retirar/neutralizar/reconocer un objetivo, vigilancia futura, relación con testigos, pistas y repercusiones policiales. Ninguna victoria descubre automáticamente la conspiración.

## 4. Arquitectura propuesta

- Módulo aislado `vtm-hunters.js`, **ya integrado para XXVII-B** y cargado antes de `vtm-game.js`. Su alcance actual es un observador sin identificar, con desplazamiento físico, sigilo y desenlace persistente; ampliar el módulo sin exponer nombres de personajes secretos ni identidades de informantes en textos visibles.
- Estado opcional `game.hunters` con `lastCheckNight`, `cooldownUntilNight`, `episodes`, `history`, `surveillance` y `case03` u otra estructura compatible. **No cambiar la versión de guardado ni la clave** `cronicas-paris-ghoul-v1`.
- Evaluación idempotente por noche, con semilla persistente o selección estable; sincronizar solo en puntos del reloj/cambio de noche pertinentes, **no** en cada frame.
- No modificar `vtm-stealth-chase.js` para que las patrullas policiales se comporten como cazadores. Se pueden compartir utilidades físicas, no la identidad ni los textos de captura.
- Al integrar combate, revisar cuidadosamente `combat.records[place]`, `combat.rewards[place]`, `battleEntry(place)` y los enlaces con encargos. Un encuentro repetible requiere una identidad de evento acotada, sin recompensas cultivables ni cierres falsos de misión.
- Ningún estado nuevo debe borrar `elizabeth`, `localCases`, `principado`, `conspiracy`, `parkerDossier`, `parkerPolitics`, `contactMemory`, `cityConsequences` o `stealthChase`. Preservar partidas con combate o persecución en curso.
- No incluir lógica de red, telemetría personal, NPC omniscientes ni generación libre de secretos.

## Primera entrega XXVII-A — avance implementado

La vigilancia civil ambiental ya existente ahora habilita **observar discretamente** (Percepción + Investigación, dificultad 7) o **cambiar de ruta**. Una observación fallida incrementa la exposición 5 puntos; una exitosa solo aporta información no verificada. La decisión se almacena en `cityLife.surveillanceEpisodes`, se limita a **un episodio por noche** para la partida y repercute en conversaciones del barrio durante las **dos noches posteriores**. Partidas antiguas no generan encuentros automáticos. No se añadió ningún cazador confirmado ni un combate.

Referencia: `vtm-city-life.js`, conexión de `dicePool` y `exposure` en `vtm-game.js`, regresión `tests/surveillance-choices.test.js`. La cabecera pública continúa indicando fase XXVI hasta completar toda la fase XXVII.

## 5. Entregas incrementales (orden sugerido)

- **XXVII-A · Presencia (parcial):** advertencias, elección de observar/evitar y memoria persistente de las decisiones integradas. La presencia física inicial corresponde a XXVII-B; siguen pendientes una célula identificada y señales ambientales adicionales.
- **XXVII-B · Vigilancia (primera integración):** `vtm-hunters.js` incorpora un observador sin identificar después de investigar sin éxito una vigilancia previa: rutas físicas por `vtm-physics.js`, visión bloqueada, sigilo, pérdida del seguimiento, resolución persistida e independencia de `vtm-stealth-chase.js`. El enlace visual y de simulación está en `vtm-game.js`, con regresión `tests/hunters-tail.test.js`. Los seguimientos de noches anteriores caducan sin bloquear episodios nuevos; el historial y la resolución permanecen en el guardado. El diario muestra el estado del observador y los cinco últimos acontecimientos de vigilancia sin revelar su identidad; esta integración está cubierta por `tests/surveillance-journal.test.js`. **Pendiente:** equilibrar situaciones, ampliar señales e incorporar una célula de cazadores identificados; el primer diálogo civil voluntario se implementó en XXVII-C, pero todavía no existe combate propio.
- **XXVII-C · Confrontación (primera entrega):** diálogo voluntario mediante Carisma + Empatía, retirada pacífica y opción de continuar sin intervenir frente a un observador sin identificar. Requiere proximidad y línea de visión, no se activa durante combates, conserva desenlaces en el guardado y no permite repetir recompensas (`vtm-hunters.js`, `vtm-game.js`, `tests/hunters-confrontation.test.js`). **Implementado adicionalmente:** forcejeo defensivo voluntario con Fuerza + Pelea (dif. 7), absorción de un posible nivel de daño contundente mediante `vtm-tactics.js`, exposición por testigos y protección contra incapacitación (requiere Salud 2 o más). El resultado se registra y no da PX. **Pendiente:** combate táctico opcional por turnos con cazadores humanos identificables mediante pruebas, armas, munición, consecuencias morales y recuperación segura, sin granjas de PX ni partida bloqueada.
- **XXVII-D · Caso 03:** investigación documental y callejera, alternativas a la violencia, rastros falsificables e información anónima; proteger la identidad de la fuente hasta el desbloqueo narrativo correspondiente.
- **XXVII-E · Pulido:** test interactivo completo, guías, accesibilidad, arte discreto, equilibrio de probabilidad y verificación pública.

## 6. Criterios obligatorios para publicar XXVII

- [ ] Todas las pruebas actuales `tests/**/*.test.js` y `tests/**/*.test.cjs`, incluyendo `elizabeth-case.test.js`, `save-backup.test.js`, `phase19.test.js` y pruebas de EP/47, siguen aprobadas.
- [ ] Prueba nueva de **ghoul inocente:** ninguna emboscada por simple presencia; no se afirma conocer su identidad sobrenatural.
- [ ] Prueba nueva de **alerta contextual:** un acto llamativo verificable puede desencadenar vigilancia, sin transformar vigilancia policial ordinaria en cazadores.
- [ ] Pruebas de **determinismo e idempotencia:** un solo sorteo por período, enfriamiento, no repetir escenas al recargar.
- [ ] Prueba de **persecución:** obstáculos, rutas, sigilo, escape y persecución separada de la policía; retoma tras guardar.
- [ ] Pruebas de **confrontación y combate:** posibilidad de huir, guardados en combate, derrota recuperable, munición y PX no duplicables.
- [ ] Pruebas de **secretos:** ninguna conversación, diario, pista casual o caso abierto revela anticipadamente la fuente anónima o el secreto de la campaña.
- [ ] Recuperación completa de principal/respaldo (confirmación al restaurar) sin pérdida de expedientes ni de una partida vieja.
- [ ] `node tools/refresh-cache.cjs --check` comprueba todas las referencias SHA-256; la integración renueva versiones únicamente de los recursos cambiados.
- [ ] Chromium local aprobado; Hostinger público aprobado y todos los recursos verificados por SHA-256. Un commit no se considera un despliegue confirmado.
- [ ] Portada, README y `GUIA_VISUAL_2_0.md` actualizados **solo después** de completar y validar la implementación.

**Alcance actual:** XXVII-A jugable y seguimiento físico inicial XXVII-B integrado, separado de las patrullas policiales. **Ya existe interacción dialogada voluntaria con un observador sin identificar; todavía no hay cazadores identificados ni combate propio de cazadores. El encabezado público continúa en fase XXVI.**
