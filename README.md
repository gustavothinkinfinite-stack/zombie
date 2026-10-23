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

1. Entrar a [Sitios web de Hostinger](https://hpanel.hostinger.com/websites).
2. En el plan Business, seleccionar **Crear sitio** → **PHP/HTML** (sitio vacío / personalizado). **No** modificar el sitio `orchid-viper-129475.hostingersite.com`.
3. Elegir un dominio o subdominio disponible para el juego. No asumir una URL hasta que Hostinger confirme el alta.
4. En el panel del **nuevo sitio**, abrir **Avanzado → Git** (en algunas versiones: **Git**).
5. Elegir **Conectar GitHub** o **Continuar con GitHub**. Autorizar el acceso al repositorio `gustavothinkinfinite-stack/zombie` si Hostinger lo solicita.
6. Seleccionar **rama `main`** y la ruta de publicación `public_html` (o dejar la ruta de instalación vacía para la raíz según lo indique hPanel). La carpeta destino debe estar vacía.
7. Ejecutar **Deploy / Desplegar**. Habilitar el despliegue automático tras cada push si la opción aparece.
8. Abrir la URL que genere Hostinger y comprobar que se muestra **Último Refugio**, que se puede iniciar una partida y que las teclas y el canvas responden.

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
