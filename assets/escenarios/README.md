# Escenarios públicos — Crónicas de París

Ocho ilustraciones SVG de fondo, independientes de la lógica del juego:

| Archivo | Escenario | Dirección artística |
|---|---|---|
| `stjuly.svg` | St. July | Bar, botellas, reservados, iluminación borgoña y violeta |
| `elysee.svg` | Elíseo | Mármol, columnas, tapices y esculturas ceremoniales |
| `passy.svg` | Passy | Biblioteca Tremere, archivos y geometría ocultista |
| `tuneles.svg` | Refugio subterráneo | Tuberías, monitores, humedad y luces verde azulado |
| `bastilla.svg` | Bastilla | Carteles, ladrillos, mobiliario industrial y tonos óxido |
| `saintdenis.svg` | Saint-Denis | Edificios nocturnos, calle iluminada y vigilancia |
| `hemeroteca.svg` | Hemeroteca | Biblioteca de prensa, notas y equipos de archivo |
| `policia.svg` | Archivo policial | Archivadores, documentación y luz azul fría |

## Contrato de integración

- Todos usan `viewBox="0 0 480 300"`. Se escalan desde SVG a Canvas sin afectar coordenadas de interacción.
- Se renderizan **detrás** del personaje, PNJ, indicadores de misión y efectos ambientales.
- El personaje entra aproximadamente en `(240, 237)`, habla con el PNJ cerca de `(240,104)`, investiga a la izquierda cerca de `(130,143)`, observa a la derecha cerca de `(350,146)` y sale en `(240,270)`.
- Las zonas con muebles existentes continúan bloqueadas según `vtm-physics.js`, evitando modificar las misiones y las partidas antiguas.
- `vtm-graphics.js` los carga de forma asíncrona, y si fallan conserva los fondos Canvas procedurales anteriores.
- El apartado visual puede seguir evolucionando por archivo, sin modificar el motor.

Son ilustraciones vectoriales compuestas para este prototipo, no fotografías ni renders 3D.
