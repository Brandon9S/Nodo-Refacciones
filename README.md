# Nodo Refacciones — ADA 6 (CRUD, base de datos y autenticación)

Sitio web de refacciones para motocicleta desarrollado con HTML, CSS, JavaScript, Bootstrap 5.3.8, PHP y MySQL. En la ADA 3 los datos se guardaban en el navegador; en la ADA 4 pasaron a una base de datos con un servidor local; en la ADA 5 se agregó un carrito de compras que se guarda en la sesión de PHP; en la ADA 6 se completó el CRUD de publicaciones (ahora también se pueden editar), las contraseñas se guardan cifradas y la sesión se valida contra el servidor.

- **Manual de usuario:** [`docs/manual_usuario.md`](docs/manual_usuario.md)
- **Manual técnico:** [`docs/manual_tecnico.md`](docs/manual_tecnico.md)

## Cómo ejecutarlo con XAMPP

1. Instala XAMPP y abre su Panel de Control. Inicia **Apache** y **MySQL**.
2. Copia la carpeta completa del proyecto en `C:\xampp\htdocs\` (queda `C:\xampp\htdocs\NodoRefacciones\`).
3. Entra a `http://localhost/phpmyadmin`, crea la base `nodo_refacciones` (cotejamiento `utf8mb4_general_ci`), ábrela, ve a **Importar**, elige `database.sql` y pulsa **Continuar**. Se crean las dos tablas.
   Si tu base viene de la ADA 4 o 5, en lugar de `database.sql` importa `ampliar_contrasena.sql`.
4. Abre `http://localhost/NodoRefacciones/` en el navegador. No abras `index.html` con doble clic: sin el servidor, PHP no se ejecuta.
5. Bootstrap se carga desde jsDelivr, por lo que necesitas conexión a Internet.

Si Apache no inicia porque el puerto 80 está ocupado, cambia el puerto en XAMPP (por ejemplo a 8080) y abre `http://localhost:8080/NodoRefacciones/`.

## Estructura

- `index.html`, `historia.html`, `catalogo.html`, `publicar.html`, `cuenta.html`, `carrito.html`: las seis páginas del sitio.
- `css/styles.css`: estilos propios y paleta grafito/carmesí.
- `js/`: `main.js` (fecha, calculadora y funciones compartidas), `auth.js` (cuentas y sesión), `publicar.js` (validación y envío del formulario), `catalogo.js`, `home.js`, `cuenta.js`, `carrito.js` y `data.js` (publicaciones de ejemplo).
- `php/`: scripts que se ejecutan en el servidor.
- `database.sql`, `ampliar_contrasena.sql`: estructura de la base y actualización desde la ADA 5.
- `docs/`: manual de usuario y manual técnico.
- `assets/img/`: favicon, banner e imagen de las publicaciones.

## Scripts del lado del servidor (`php/`)

El JavaScript les envía y recibe datos en formato JSON con `fetch()` (AJAX). Todos usan consultas preparadas de MySQLi.

| Script | Qué hace |
|---|---|
| `conexion.php` | Abre la sesión de PHP (cookie `httponly`, cierre tras 30 min sin actividad), conecta con MySQL con los datos de `config.php` y define funciones compartidas. Lo incluyen todos los demás. |
| `config.ejemplo.php` | Plantilla de `config.php` con los datos de la base del hosting. `config.php` no se sube a GitHub. |
| `registrar.php` | Valida los datos, crea la cuenta con la contraseña cifrada (`password_hash`) e inicia sesión. Rechaza correos repetidos. |
| `login.php` | **Autenticación:** comprueba la contraseña con `password_verify` e inicia sesión (`session_regenerate_id`). |
| `sesion.php` | Dice si la sesión del servidor sigue activa y de quién es. |
| `logout.php` | Cierra la sesión del servidor. |
| `validar_publicacion.php` | Validación del lado del servidor compartida por CREATE y UPDATE. |
| `guardar_publicacion.php` | **CREATE:** guarda una refacción nueva ligada a la cuenta con sesión. |
| `publicaciones.php` | **READ:** todas las publicaciones, las propias (`?mias=1`) o una propia (`?id=N`). |
| `actualizar_publicacion.php` | **UPDATE:** modifica una publicación, solo si es de la cuenta con sesión. |
| `eliminar_publicacion.php` | **DELETE:** borra una publicación, solo si es de la cuenta con sesión. |
| `carrito_agregar.php` | Agrega una refacción al carrito (o suma 1 si ya estaba). |
| `carrito_modificar.php` | Cambia la cantidad de una refacción del carrito (1 a 99). |
| `carrito_eliminar.php` | Quita una refacción del carrito. |
| `carrito_listar.php` | Regresa el contenido del carrito con precios de MySQL, el total y el nombre del usuario de la sesión. |

La validación de JavaScript sigue en el navegador para dar mensajes rápidos; PHP vuelve a validar porque lo que llega al servidor siempre puede venir de fuera del formulario.

## Base de datos `nodo_refacciones`

**Tabla `usuarios`** (formulario de `cuenta.html`)

| Columna | Tipo | Nota |
|---|---|---|
| `id_usuario` | INT, AUTO_INCREMENT | clave primaria |
| `nombre` | VARCHAR(70) | |
| `correo` | VARCHAR(100) | único |
| `contrasena` | VARCHAR(255) | hash de `password_hash()` |

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

## Carrito de compras (ADA 5)

- El carrito vive en la sesión de PHP: `$_SESSION["carrito"]` es un arreglo con el id de la publicación como llave y la cantidad como valor. No usa una tabla nueva; los datos y precios se consultan en `publicaciones` cada vez que se muestra el carrito.
- Se necesita sesión iniciada para usarlo. Al cerrar sesión, el carrito se vacía.
- `carrito.html` + `js/carrito.js` muestran el carrito, con el nombre del usuario tomado de la sesión del servidor.
- En `catalogo.html` cada publicación de la base de datos tiene el botón "Agregar al carrito" (las publicaciones demostrativas de `data.js` no, porque no están en la base de datos).

## Almacenamiento

- **MySQL:** cuentas y publicaciones.
- **Sesión de PHP:** quién tiene la sesión iniciada y el contenido del carrito (los valida el servidor en cada petición).
- **`sessionStorage`:** copia del nombre y correo de la sesión, solo para que el menú muestre "Mi panel" sin esperar al servidor.

Las contraseñas se guardan cifradas con `password_hash()` (bcrypt). Las cuentas creadas antes de la ADA 6 se cifran solas la próxima vez que inician sesión. Las tres publicaciones de `js/data.js` son ejemplos demostrativos y no están en la base de datos.

## Funcionalidades

- Navegación entre seis páginas.
- Fecha actual y calculadora con JavaScript.
- Validación con JavaScript de todos los campos y controles de los formularios, más validación en el servidor.
- Registro, inicio y cierre de sesión con cuentas guardadas en MySQL.
- CRUD de publicaciones: publicar refacciones, verlas en el catálogo y en el inicio, y editar o eliminar las propias desde el panel.
- Filtros de catálogo por texto, categoría, condición y marca.
- Carrito de compras: agregar, modificar cantidad, quitar y listar refacciones, guardado en la sesión de PHP.
- Bootstrap 5.3.8 para componentes y diseño adaptable.
