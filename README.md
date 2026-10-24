# Crónicas de París — Juego web de Vampiro: La Mascarada (prototipo 0.2)

RPG 2D narrativo de pixel art oscuro, ambientado en **el Principado de París** creado previamente para la campaña del usuario. El personaje comienza como **humano ghoul** al servicio de un Domitor vampiro. **No hay zombis ni oleadas** en esta versión.

- **Juego:** https://wheat-chough-542895.hostingersite.com/
- **GitHub:** https://github.com/gustavothinkinfinite-stack/zombie
- **Configuración de despliegue:** https://hpanel.hostinger.com/websites/wheat-chough-542895.hostingersite.com/advanced/git
- **Rama:** \`main\`
- **Ruta de alojamiento:** \`public_html\`
- **Tecnología:** HTML + CSS + JavaScript Canvas, sin compilación ni servidor.

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
