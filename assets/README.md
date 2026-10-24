# Recursos gráficos · Crónicas de París

## Hoja de personajes v2

\`personajes-paris-v2.svg\` es un **asset SVG local**, independiente del código de juego, renderizado en Canvas 2D mediante el recorte de imágenes. Está creado específicamente para este prototipo y puede reemplazarse por un PNG/WebP compatible o por sprites ilustrados de mayor resolución.

**Tamaño total:** 256 × 768 píxeles.  
**Celdas:** 32 × 48 píxeles, ocho columnas y dieciséis filas.  
**Columnas:** \`abajo 0–1\`, \`izquierda 2–3\`, \`derecha 4–5\`, \`arriba 6–7\`. Cada par contiene dos cuadros alternos de marcha.  
**Fondo:** transparente.  
**Interpolación:** desactivada; el juego usa \`imageSmoothingEnabled=false\`.

| Fila (desde 0) | Personaje / base |
|---|---|
| 0 | Toreador |
| 1 | Ventrue |
| 2 | Tremere |
| 3 | Nosferatu |
| 4 | Brujah |
| 5 | Gangrel |
| 6 | Malkavian |
| 7 | Ghoul (sin Abrazo) |
| 8 | Isabelle Dubois |
| 9 | Ingrid |
| 10 | Lucien |
| 11 | John Winthrop |
| 12 | Marcus von Württemberg |
| 13 | Pierre Dupont |
| 14 | Guardiana del Elíseo |
| 15 | Encargado del archivo policial |

### Uso por el motor

\`vtm-graphics.js\` carga el recurso local mediante \`Image\` y recorta usando \`drawImage(atlas, sx, sy, 32, 48, dx, dy, 32, 48)\`. Mientras la imagen se carga, o si no está disponible, usa los sprites básicos dibujados por Canvas. Cuando una imagen falla, el juego sigue siendo funcional.

La asignación de filas se resuelve según el clan o el identificador del PNJ y no se guarda en la partida. Esto permite actualizar o reemplazar la hoja de sprites sin alterar las partidas guardadas.

### Estado de arte

Los sprites SVG tienen capas de ropa, rostro, cabello, sombras, accesorios y colores de personajes, pero **siguen siendo un primer asset de pixel art vectorial**. No son un conjunto definitivo de ilustraciones profesionales. La siguiente iteración artística puede sustituirlos conservando las medidas, filas y columnas, o actualizar el mapeo en \`vtm-graphics.js\`.

No incorporar diseños canónicos de personajes no confirmados de la campaña ni revelar secretos de la Senescal mediante sus retratos.
