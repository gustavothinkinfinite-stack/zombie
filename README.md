# Último Refugio — Supervivencia zombi 2D

Juego web de supervivencia y construcción de base. Prototipo inicial para navegador, sin dependencias externas.

## Estado actual

- Movimiento y combate en vista cenital 2D.
- Recolección de madera, chatarra y botiquines.
- Construcción de muros, torretas y trampas.
- Defensa de un generador central ante oleadas de zombis.
- Controles para teclado, mouse y dispositivos táctiles.
- Récord local guardado por el navegador.

## Jugar localmente

Abrir `index.html` en Chrome, Firefox o Edge. No requiere instalar paquetes, ejecutar un servidor de desarrollo ni compilar.

## Publicar en Hostinger (sitio NUEVO, independiente de Semillería Durán)

**Sitio reservado en Hostinger:** https://wheat-chough-542895.hostingersite.com/ (creado el 2026-10-23; la publicación del juego no está confirmada).

**Panel GIT del sitio:** https://hpanel.hostinger.com/websites/wheat-chough-542895.hostingersite.com/advanced/git?redirectLocation=side_menu

1. Abrir el panel GIT del sitio enlazado arriba. **No** modificar `orchid-viper-129475.hostingersite.com` (Semillería Durán).
2. Elegir **Conectar con GitHub** / **Continuar con GitHub**. Autorizar en GitHub el acceso a **solo** `gustavothinkinfinite-stack/zombie` si se ofrece esta selección.
3. Seleccionar el repositorio `gustavothinkinfinite-stack/zombie` y la rama **`main`**.
4. Confirmar el directorio raíz de publicación **`public_html`** (o dejar la ruta de instalación vacía si la interfaz antigua así lo solicita). Verificar que el destino esté vacío antes de desplegar.
5. Ejecutar **Deploy / Desplegar** y verificar que el despliegue indique éxito.
6. Activar **Auto-deployment** para que nuevas versiones en `main` se publiquen automáticamente.
7. Abrir https://wheat-chough-542895.hostingersite.com/ y verificar pantalla de inicio de **Último Refugio**, movimiento, oleadas y construcción.

Para un sitio estático como este no se debe elegir el flujo Node.js/React, ni agregar comandos `npm`.

Documentación oficial:
- https://www.hostinger.com/support/1583302-how-to-deploy-a-git-repository-in-hostinger/
- https://www.hostinger.com/es/support/1583214-como-anadir-un-sitio-web-en-hostinger/

## Estructura

- `index.html`: juego completo, interfaz, estilos y código.
- `README.md`: documentación del proyecto y despliegue.

## Siguientes iteraciones

Separar CSS/JS en carpetas, agregar inventario y almacenamiento en la base, construcción de edificios, supervivientes aliados, mejoras y guardado de partidas completas.

## Aclaración

Este repositorio es código fuente. Crear el archivo o hacer push a GitHub no publica automáticamente un sitio en Hostinger hasta configurar una vez la integración en hPanel.
