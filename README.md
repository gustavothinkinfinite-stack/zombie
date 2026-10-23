# Último Refugio — Mundo abierto 2D

Prototipo jugable de supervivencia zombi con exploración, saqueo y construcción de refugio. **No tiene oleadas**.

**Juego:** https://wheat-chough-542895.hostingersite.com/  
**Hostinger GIT:** https://hpanel.hostinger.com/websites/wheat-chough-542895.hostingersite.com/advanced/git  
**Repositorio:** https://github.com/gustavothinkinfinite-stack/zombie

## Cambios de la versión 2

- Ciudad procedural de 20 × 15 sectores, **300 tramos de calle transitables**. No son todavía 300 calles distintas con nombres individuales.
- **1.196 edificios** distribuidos por la ciudad: casas, tiendas, farmacias, talleres, almacenes y comisarías; se puede entrar en cualquiera de ellos.
- Cada interior tiene **5 puntos de saqueo** con recursos según el tipo de edificio. El saqueo no se repite y se guarda.
- Infectados deambulando por el mapa: encuentros de 1 a 3 zombis; algunos interiores contienen 1 a 2 infectados.
- IA con visión, persecución y reacción al ruido. Disparar es mucho más ruidoso que caminar; correr también puede atraer zombis.
- Mochila limitada, hambre, salud, resistencia, comida, curación, munición y recarga.
- Base inicial en el sector central. Se pueden construir barricadas, trampas, torretas automáticas y puestos avanzados para extender el radio de construcción.
- Mapa de niebla exploratoria: revela los sectores visitados.
- Guardado automático cada 18 segundos y manual, mediante `localStorage` en el navegador.

## Controles

| Acción | Teclas |
|---|---|
| Moverse | WASD / flechas |
| Correr | Shift |
| Apuntar y disparar | Clic / Espacio |
| Golpe cuerpo a cuerpo | F |
| Abrir puerta / saquear / salir / guardar en base | E |
| Recargar | R |
| Usar botiquín | Q |
| Modo de construcción | B |
| Barricada / trampa / torreta / puesto | 1 / 2 / 3 / 4 |
| Mapa completo | M |
| Guardar | V |
| Pausa | Esc / P |

En pantallas táctiles hay cruceta y botones de acción. La selección de construcción se hace desde la barra inferior.

## Desarrollo

Proyecto estático sin dependencias ni proceso de compilación:

- `index.html`: interfaz y paneles.
- `style.css`: estilos responsivos.
- `game.js`: mundo, enemigos, interiores, persistencia, controles y renderizado Canvas.

Para probarlo en local basta abrir `index.html` en un navegador. Hostinger está conectado al repositorio de GitHub, rama `main`, directorio `public_html`. El despliegue automático figuraba como activado en el panel; **cada versión debe verificarse en la URL pública**, no basta con confirmar el push.

## Límites del prototipo

- Mapa procedural sin misiones, personajes no jugadores ni narrativa todavía.
- El arte es esquemático y los interiores comparten un diseño básico.
- No hay multijugador ni cuenta de usuario. La partida se guarda solamente en el navegador y dispositivo actual.
- La simulación mantiene activos a los enemigos del área cercana; no calcula físicamente a cada zombi de toda la ciudad cuando el jugador está lejos.
- Los 300 tramos son sectores conectados de una cuadrícula, no una topografía urbana realista ni 300 vías con nombres independientes.
- Es una versión inicial: no está ajustado definitivamente el equilibrio de hambre, combate, ruido, botín ni construcción.

## Próximas mejoras sugeridas

1. Calles y barrios con nombres, edificios reconocibles, obstáculos, vehículos, plazas y caminos no repetitivos.
2. Interior de cada edificio diferente, llaves, puertas cerradas y saqueo con tiempo/riesgo.
3. Sistema de inventario más detallado, almacenes, fabricación, reparaciones, iluminación y electricidad.
4. Estados de IA: oído/visión con línea de vista, agrupación, infestaciones persistentes y dificultad por barrio.
5. Múltiples supervivientes, asignación de tareas y progresión de refugio.
6. Guardado del mundo más completo y pruebas automatizadas del equilibrio.

## Seguridad del despliegue

El proyecto del juego usa el sitio independiente `wheat-chough-542895.hostingersite.com`. No modificar `orchid-viper-129475.hostingersite.com` (Semillería Durán).
