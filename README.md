# Nodo Refacciones — FrontEnd ADA 3

Sitio web de refacciones para motocicleta desarrollado con HTML, CSS, JavaScript y Bootstrap 5.3.8.

## Cómo abrir el proyecto

1. Descarga y extrae la carpeta completa.
2. Abre `index.html` en un navegador.
3. Bootstrap se carga desde jsDelivr, por lo que necesitas conexión a Internet para que se apliquen sus estilos y componentes.

## Estructura

- `index.html`: inicio, búsqueda, fecha actual, publicaciones recientes y calculadora.
- `historia.html`: por qué creé el proyecto y cuál es su propuesta.
- `catalogo.html`: catálogo con filtros de texto, categoría, condición y marca.
- `publicar.html`: formulario de publicación con validación JavaScript.
- `cuenta.html`: registro, inicio de sesión y panel con las publicaciones del usuario.
- `css/styles.css`: estilos propios y paleta grafito/carmesí.
- `js/data.js`: publicaciones de ejemplo.
- `js/main.js`: fecha, año del pie, calculadora y funciones compartidas (objeto `NodoApp`).
- `js/home.js`: publicaciones recientes de la página principal.
- `js/catalogo.js`: filtros y lista del catálogo.
- `js/publicar.js`: validación del formulario y guardado de publicaciones.
- `js/auth.js`: registro, inicio y cierre de sesión (objeto `NodoAuth`).
- `js/cuenta.js`: panel del usuario y eliminación de publicaciones propias.
- `assets/img/`: favicon, banner e imagen de las publicaciones.

## Funcionalidades

- Navegación entre cinco páginas.
- Fecha actual generada con JavaScript.
- Calculadora básica con suma, resta, multiplicación y división, con botones y teclado.
- Validación con JavaScript de todos los campos y controles de los formularios: texto, número, lista desplegable, botones de opción y casilla de verificación. Cada error muestra un mensaje claro debajo del campo y el envío se detiene hasta corregirlos.
- El formulario de publicación revisa nombre, categoría, condición, precio, descripción, marca, modelo, año, modalidad, contacto (correo o teléfono), enlace externo y confirmación.
- El campo de enlace externo aparece y se revisa solo al elegir esa modalidad.
- Filtros de catálogo por texto, categoría, condición y marca.
- Registro e inicio de sesión; el panel muestra las publicaciones de la cuenta y permite eliminarlas.
- Bootstrap 5.3.8 para componentes y diseño adaptable.

## Almacenamiento

- `localStorage`: publicaciones y cuentas creadas en este navegador.
- `sessionStorage`: la sesión activa, que se cierra al cerrar la pestaña.

No hay servidor ni base de datos, así que los datos no se comparten entre personas ni dispositivos. Las contraseñas se guardan sin cifrar, por lo que debes usar una contraseña de prueba. Las publicaciones precargadas son ejemplos y no ofertas reales.

## Preparación para la base de datos

Todavía no hay base de datos, pero la interfaz ya trabaja con datos organizados como las tablas que se usarán después. Cada publicación y cada cuenta es un objeto con los mismos campos que tendrá una fila.

**Tabla `usuarios`** (formulario de `cuenta.html`)

| Campo del formulario | Columna prevista |
|---|---|
| (se genera) | `id_usuario` (clave primaria) |
| Nombre | `nombre` |
| Correo electrónico | `correo` (único) |
| Contraseña | `contrasena` |

**Tabla `publicaciones`** (formulario de `publicar.html`)

| Campo del formulario | Columna prevista |
|---|---|
| (se genera) | `id_publicacion` (clave primaria) |
| (sesión activa) | `id_usuario` (clave foránea a `usuarios`) |
| Nombre de la refacción | `titulo` |
| Categoría | `categoria` |
| Condición | `condicion` |
| Precio | `precio` |
| Número o código de pieza | `codigo_pieza` |
| Descripción | `descripcion` |
| Marca | `marca_moto` |
| Modelo | `modelo_moto` |
| Año | `anio_moto` |
| Versión | `version_moto` |
| Color | `color_moto` |
| Modalidad | `modalidad` |
| Nombre del vendedor | `vendedor` |
| Correo o teléfono de contacto | `contacto` |
| Enlace de la publicación original | `enlace_externo` |

Hoy los datos se guardan en el navegador. Todo el acceso a ellos pasa por dos funciones de `js/main.js` (`NodoApp.leerGuardadas()` y `NodoApp.guardar()`) y por `js/auth.js`. Cuando exista la base de datos, solo esas funciones cambiarán para pedir y enviar la información al servidor; los formularios, las validaciones y las tarjetas seguirán igual.

## Publicación en GitHub Pages

Sube el contenido de esta carpeta a la raíz de un repositorio GitHub. En el repositorio, entra a **Settings → Pages**, selecciona la rama principal y la carpeta `/ (root)`, y guarda. La publicación puede tardar unos minutos en estar disponible. Verifica que todos los nombres y rutas respeten mayúsculas y minúsculas.
