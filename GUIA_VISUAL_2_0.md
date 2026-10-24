# Crónicas de París — Guía visual 2.0

**Estado:** Fase I del rediseño incorporada en \`main\` (23 de octubre de 2026).  
**Alcance:** Interfaz, HUD, diálogos y retratos.  
**Archivos:** \`visual-2.css\` (sistema de presentación), \`index.html\` (composición), \`vtm-game.js\` (renderizado de retratos y sincronización del HUD).  
**Restricción:** No modificar las reglas de Vampiro, las misiones, el estado de las partidas guardadas ni la ambientación establecida para modernizar la apariencia.

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

## Próximos entregables de arte

### Fase II — Mundo y personajes
- Sprite de ghoul (hombre/mujer y personalización básica), cuatro direcciones de movimiento, animaciones de caminar/idle.
- Sprite propio de cada Domitor y PNJ importante.
- Reemplazar patrones urbanos procedurales por tileset de París: adoquín, asfalto mojado, aceras, mansardas, farolas, árboles, Sena, puentes y señalización de edificios.
- Calcular escala y colisiones antes de añadir animaciones complejas.

### Fase III — Residencias e interiores
- Siete residencias con identidad espacial y, al menos, una estancia característica de cada clan.
- St. July, Elíseo, Passy, túneles Nosferatu, Bastilla, comisaría y hemeroteca.
- Tres capas por sala: suelo, obstáculos y primer plano; iluminación dinámica por zona y objetos examinables claramente identificados.

### Fase IV — Efectos y pulido
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
