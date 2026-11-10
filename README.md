# Nodo Refacciones — ADA 4 (servidor local, PHP y MariaDB)

Sitio web de refacciones para motocicleta desarrollado con HTML, CSS, JavaScript, Bootstrap 5.3.8, PHP y MySQL. En la ADA 3 los datos se guardaban en el navegador; en esta versión se guardan en una base de datos y los procesa un servidor local.

## Cómo ejecutarlo con XAMPP

1. Instala XAMPP y abre su Panel de Control. Inicia **Apache** y **MySQL**.
2. Copia la carpeta completa del proyecto en `C:\xampp\htdocs\` (queda `C:\xampp\htdocs\nodo-refacciones-ada4\`).
3. Entra a `http://localhost/phpmyadmin`, abre la pestaña **Importar**, elige `database.sql` y pulsa **Continuar**. Se crea la base `nodo_refacciones` con sus dos tablas.
4. Abre `http://localhost/NodoRefacciones-ADA4/` en el navegador. No abran `index.html` con doble clic: sin el servidor, PHP no se ejecuta.
5. Bootstrap se carga desde jsDelivr, por lo que necesitas conexión a Internet.

Si Apache no inicia porque el puerto 80 está ocupado, cambia el puerto en XAMPP (por ejemplo a 8080) y abre `http://localhost:8080/nodo-refacciones-ada4/`.

## Estructura

- `index.html`, `historia.html`, `catalogo.html`, `publicar.html`, `cuenta.html`: las cinco páginas del sitio.
- `css/styles.css`: estilos propios y paleta grafito/carmesí.
- `js/`: `main.js` (fecha, calculadora y funciones compartidas), `auth.js` (cuentas y sesión), `publicar.js` (validación y envío del formulario), `catalogo.js`, `home.js`, `cuenta.js` y `data.js` (publicaciones de ejemplo).
- `php/`: scripts que se ejecutan en el servidor (ver abajo).
- `database.sql`: crea la base de datos y las tablas.
- `assets/img/`: favicon, banner e imagen de las publicaciones.

## Scripts del lado del servidor (`php/`)

El JavaScript les envía y recibe datos en formato JSON con `fetch()` (AJAX). Todos usan consultas preparadas de MySQLi.

| Script | Qué hace |
|---|---|
| `conexion.php` | Abre la sesión de PHP, conecta con MySQL y define funciones para responder en JSON. Lo incluyen todos los demás. |
| `registrar.php` | Valida los datos, crea la cuenta en `usuarios` e inicia sesión. Rechaza correos repetidos. |
| `login.php` | Comprueba correo y contraseña en `usuarios` e inicia sesión. |
| `logout.php` | Cierra la sesión del servidor. |
| `guardar_publicacion.php` | Con sesión iniciada, valida el formulario por segunda vez y guarda la refacción en `publicaciones`. |
| `publicaciones.php` | Regresa las publicaciones de la base de datos (todas, o solo las propias con `?mias=1`). |
| `eliminar_publicacion.php` | Borra una publicación, solo si es de la cuenta con sesión. |

La validación de JavaScript sigue en el navegador para dar mensajes rápidos; PHP vuelve a validar porque lo que llega al servidor siempre puede venir de fuera del formulario.

## Base de datos `nodo_refacciones`

**Tabla `usuarios`** (formulario de `cuenta.html`)

| Columna | Tipo | Nota |
|---|---|---|
| `id_usuario` | INT, AUTO_INCREMENT | clave primaria |
| `nombre` | VARCHAR(70) | |
| `correo` | VARCHAR(100) | único |
| `contrasena` | VARCHAR(100) | |

**Tabla `publicaciones`** (formulario de `publicar.html`)

| Columna | Tipo | Campo del formulario |
|---|---|---|
| `id_publicacion` | INT, AUTO_INCREMENT | clave primaria |
| `id_usuario` | INT | clave foránea a `usuarios` (sesión activa) |
| `titulo` | VARCHAR(90) | Nombre de la refacción |
| `categoria` | VARCHAR(30) | Categoría |
| `condicion` | VARCHAR(20) | Condición |
| `precio` | DECIMAL(10,2) | Precio |
| `codigo_pieza` | VARCHAR(50) | Número o código de pieza |
| `descripcion` | VARCHAR(600) | Descripción |
| `marca_moto` | VARCHAR(50) | Marca |
| `modelo_moto` | VARCHAR(70) | Modelo |
| `anio_moto` | SMALLINT | Año |
| `version_moto` | VARCHAR(50) | Versión |
| `color_moto` | VARCHAR(40) | Color |
| `modalidad` | VARCHAR(10) | Modalidad |
| `vendedor` | VARCHAR(70) | Nombre de la cuenta |
| `contacto` | VARCHAR(100) | Correo o teléfono |
| `enlace_externo` | VARCHAR(255) | Enlace de la publicación original |
| `fecha_publicacion` | DATETIME | se llena sola |

Una cuenta puede tener muchas publicaciones; cada publicación pertenece a una sola cuenta.

## Almacenamiento

- **MySQL:** cuentas y publicaciones.
- **Sesión de PHP:** quién tiene la sesión iniciada (la valida el servidor en cada petición).
- **`sessionStorage`:** copia del nombre y correo de la sesión, solo para que el menú muestre "Mi panel" sin esperar al servidor.

Las contraseñas se guardan sin cifrar porque es un proyecto académico; usa contraseñas de prueba. Las tres publicaciones de `js/data.js` son ejemplos demostrativos y no están en la base de datos.

## Funcionalidades

- Navegación entre cinco páginas.
- Fecha actual y calculadora con JavaScript.
- Validación con JavaScript de todos los campos y controles de los formularios, más validación en el servidor.
- Registro, inicio y cierre de sesión con cuentas guardadas en MySQL.
- Publicar refacciones, verlas en el catálogo y en el inicio, y eliminar las propias desde el panel.
- Filtros de catálogo por texto, categoría, condición y marca.
- Bootstrap 5.3.8 para componentes y diseño adaptable.
