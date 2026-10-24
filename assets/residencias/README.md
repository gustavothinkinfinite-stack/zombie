# Residencias de los Domitores — Crónicas de París

**21 fondos SVG originales:** siete clanes de la Camarilla por tres estancias.

| Clan | Salón | Despacho | Dormitorio |
|---|---|---|---|
| Toreador | `toreador.svg` | `toreador-despacho.svg` | `toreador-habitaciones.svg` |
| Ventrue | `ventrue.svg` | `ventrue-despacho.svg` | `ventrue-habitaciones.svg` |
| Tremere | `tremere.svg` | `tremere-despacho.svg` | `tremere-habitaciones.svg` |
| Nosferatu | `nosferatu.svg` | `nosferatu-despacho.svg` | `nosferatu-habitaciones.svg` |
| Brujah | `brujah.svg` | `brujah-despacho.svg` | `brujah-habitaciones.svg` |
| Gangrel | `gangrel.svg` | `gangrel-despacho.svg` | `gangrel-habitaciones.svg` |
| Malkavian | `malkavian.svg` | `malkavian-despacho.svg` | `malkavian-habitaciones.svg` |

Cada imagen usa `viewBox="0 0 480 300"`. Los muebles se ubican para conservar el alcance de documentos, armarios, ventanas, baúles y las puertas; el recorrido y las colisiones siguen a cargo de `vtm-physics.js`. Los detalles reflejan cada clan: arte refinado Toreador, autoridad Ventrue, biblioteca Tremere, tecnología húmeda Nosferatu, decoraciones industriales Brujah, vegetación Gangrel y espejos Malkavian.

`vtm-graphics.js` carga bajo demanda el fondo correspondiente a la escena. Mientras descarga, o si falla, dibuja el fondo Canvas procedimental de respaldo. El sistema no afecta las fichas ni las partidas guardadas.

Las ilustraciones son vectoriales y editables. Siguen siendo recursos de prototipo, no un tileset final de ilustración manual.
