# Crónicas de París — Juego web de Vampiro: La Mascarada (prototipo 0.1)

RPG 2D narrativo de pixel art oscuro, ambientado en **el Principado de París** creado previamente para la campaña del usuario. El personaje comienza como **humano ghoul** al servicio de un Domitor vampiro. **No hay zombis ni oleadas** en esta versión.

- **Juego:** https://wheat-chough-542895.hostingersite.com/
- **GitHub:** https://github.com/gustavothinkinfinite-stack/zombie
- **Configuración de despliegue:** https://hpanel.hostinger.com/websites/wheat-chough-542895.hostingersite.com/advanced/git
- **Rama:** \`main\`
- **Ruta de alojamiento:** \`public_html\`
- **Tecnología:** HTML + CSS + JavaScript Canvas, sin compilación ni servidor.

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
