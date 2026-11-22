# Manual técnico — Nodo Refacciones (ADA 6)

## 1. Descripción general

Aplicación web de catálogo de refacciones de motocicleta. El FrontEnd (HTML, CSS, Bootstrap 5.3.8 y JavaScript) se comunica con un BackEnd en PHP mediante `fetch()` e intercambia datos en JSON. La información se guarda en MySQL/MariaDB y el estado del usuario autenticado en sesiones de PHP.

| Elemento | Tecnología |
|---|---|
| Servidor web local | Apache (XAMPP) |
| Servidor web en línea | InfinityFree (Apache + PHP + MySQL) |
| Lenguaje del servidor | PHP 8 con la extensión MySQLi |
| Base de datos | MySQL / MariaDB, base `nodo_refacciones` (en InfinityFree, `if0_…_nodo`) |
| Cliente | HTML5, CSS3, JavaScript (ES2017+), Bootstrap 5.3.8 por CDN |
| Control de versiones | Git + GitHub (`Brandon9S/Nodo-Refacciones`, rama `ada6`) |

## 2. Arquitectura

```
Navegador (HTML + JS)                       Servidor (Apache + PHP)                 MySQL
──────────────────────                      ───────────────────────                 ─────
cuenta.html  ── js/auth.js ── fetch JSON ──▶ php/registrar.php, login.php,  ──SQL──▶ usuarios
                                             sesion.php, logout.php
publicar.html ─ js/publicar.js ───────────▶ php/guardar_publicacion.php     ──SQL──▶ publicaciones
                                             php/actualizar_publicacion.php
cuenta.html  ── js/cuenta.js ─────────────▶ php/publicaciones.php
                                             php/eliminar_publicacion.php
catalogo.html, carrito.html ──────────────▶ php/carrito_*.php  ── $_SESSION["carrito"]
```

Todos los scripts PHP incluyen `php/conexion.php`, que abre la sesión, conecta con la base y define las funciones compartidas `responder()`, `leerJSON()`, `exigirSesion()` e `iniciarSesionUsuario()`.

## 3. Estructura de archivos

```
NodoRefacciones/
├── index.html, catalogo.html, publicar.html, cuenta.html, carrito.html, historia.html
├── css/styles.css
├── js/
│   ├── main.js        NodoApp: pedirJSON(), escaparHtml(), validaciones, tarjetas
│   ├── auth.js        NodoAuth: registrar, iniciarSesion, verificarSesion, cerrarSesion
│   ├── publicar.js    formulario de alta y edición (CREATE / UPDATE)
│   ├── cuenta.js      registro, login y panel (READ / DELETE)
│   ├── catalogo.js, home.js, carrito.js, data.js
├── php/
│   ├── conexion.php, config.ejemplo.php (config.php no se versiona)
│   ├── registrar.php, login.php, sesion.php, logout.php
│   ├── validar_publicacion.php
│   ├── guardar_publicacion.php, publicaciones.php, actualizar_publicacion.php, eliminar_publicacion.php
│   └── carrito_agregar.php, carrito_listar.php, carrito_modificar.php, carrito_eliminar.php
├── database.sql, actualizar_ada6.sql, datos_ejemplo.sql
└── docs/manual_usuario.md, docs/manual_tecnico.md
```

## 4. Base de datos

```
usuarios (1) ────────< (N) publicaciones
id_usuario PK              id_publicacion PK
nombre                     id_usuario FK → usuarios.id_usuario (ON DELETE CASCADE)
correo UNIQUE              titulo, categoria, condicion, precio, codigo_pieza, descripcion,
contrasena (hash)          marca_moto, modelo_moto, anio_moto, version_moto, color_moto,
                           modalidad, vendedor, contacto, enlace_externo, fecha_publicacion
```

- `database.sql` crea las dos tablas (se importa dentro de una base ya creada).
- `actualizar_ada6.sql` amplía `usuarios.contrasena` a `VARCHAR(255)` en bases que vienen de la ADA 4/5.
- `datos_ejemplo.sql` crea la cuenta `demo@nodo.com` / `demo12345` y tres publicaciones.

## 5. Operaciones CRUD

Todas usan **consultas preparadas** (`mysqli_prepare` + `mysqli_stmt_bind_param`), así los datos del usuario nunca se concatenan en el SQL y se evita la inyección SQL.

| Operación | Script | Método / datos | SQL principal | Restricción |
|---|---|---|---|---|
| **Create** | `guardar_publicacion.php` | POST JSON con los campos del formulario | `INSERT INTO publicaciones (...) VALUES (?, ...)` | Sesión obligatoria; `id_usuario` y `vendedor` salen de la sesión, no del formulario. |
| **Read** | `publicaciones.php` | GET; `?mias=1` o `?id=N` | `SELECT ... FROM publicaciones [WHERE id_usuario = ?] ORDER BY fecha_publicacion DESC` | Sin parámetros es público; con `mias` o `id` exige sesión y filtra por el dueño. |
| **Update** | `actualizar_publicacion.php` | POST JSON `{ id, ...campos }` | `UPDATE publicaciones SET ... WHERE id_publicacion = ? AND id_usuario = ?` | Solo el dueño. Responde 404 si la publicación no es suya. |
| **Delete** | `eliminar_publicacion.php` | POST JSON `{ id }` | `DELETE FROM publicaciones WHERE id_publicacion = ? AND id_usuario = ?` | Solo el dueño. Se eligió borrado físico; el carrito descarta solo las piezas que ya no existen. |

**Validación.** `validar_publicacion.php` contiene la función `validarPublicacion($d)`, usada por Create y Update: revisa longitudes, listas permitidas (categoría, condición, modalidad), rango de precio (0 a 10,000,000) y de año (1950 al año siguiente), formato del contacto y del enlace. JavaScript (`publicar.js`) repite las reglas solo para dar mensajes inmediatos; la validación que cuenta es la del servidor.

**Flujo de edición.** `cuenta.html` muestra el botón *Editar* con el enlace `publicar.html?editar=ID`. `publicar.js` detecta el parámetro, pide `publicaciones.php?id=ID`, llena el formulario y al enviar llama a `actualizar_publicacion.php` en lugar de `guardar_publicacion.php`.

## 6. Autenticación

- **Registro (`registrar.php`):** valida nombre (2–70), correo (`FILTER_VALIDATE_EMAIL`) y contraseña (8–100), revisa que el correo no exista y guarda `password_hash($contrasena, PASSWORD_DEFAULT)` (bcrypt, 60 caracteres).
- **Inicio de sesión (`login.php`):** busca el correo y compara con `password_verify()`. Responde el mismo mensaje si el correo no existe o la contraseña está mal, para no revelar qué correos tienen cuenta.
- **Cuentas anteriores a la ADA 6:** si el valor guardado no es un hash (`password_get_info()["algo"] === null`) y coincide con la contraseña escrita (`hash_equals`), se acepta y se reemplaza por su hash en ese momento.

## 7. Sesiones

| Aspecto | Implementación |
|---|---|
| Inicio | `session_start()` en `conexion.php`, en cada petición. |
| Cookie | `session_set_cookie_params`: `httponly` (JavaScript no la lee), `samesite=Lax`, dura hasta cerrar el navegador. |
| Datos guardados | `$_SESSION["usuario"] = { idUsuario, nombre, correo }`, `$_SESSION["carrito"] = { id_publicacion: cantidad }`, `$_SESSION["ultimaActividad"]`. |
| Al entrar | `iniciarSesionUsuario()` llama a `session_regenerate_id(true)` para evitar fijación de sesión. |
| Expiración | Si pasan más de 30 minutos entre peticiones, `conexion.php` vacía y destruye la sesión. |
| Protección de scripts | `exigirSesion()` responde **401** si no hay `$_SESSION["usuario"]`. La usan Create, Update, Delete, `?mias`, `?id` y el carrito. |
| Cierre | `logout.php`: `$_SESSION = array(); session_destroy();` |
| Sincronización con el cliente | `sessionStorage` guarda una copia del usuario solo para pintar el menú rápido. Al cargar cada página, `NodoAuth.verificarSesion()` consulta `sesion.php` y borra la copia si el servidor ya cerró la sesión. |

## 8. Instalación local (XAMPP)

1. Copiar el proyecto en `C:\xampp\htdocs\NodoRefacciones\` e iniciar Apache y MySQL.
2. En `http://localhost/phpmyadmin` crear la base `nodo_refacciones` (`utf8mb4_general_ci`) e importar `database.sql` y, opcionalmente, `datos_ejemplo.sql`.
3. No se necesita `php/config.php`: sin él, `conexion.php` usa `localhost`, `root`, sin contraseña.
4. Abrir `http://localhost/NodoRefacciones/`.

## 9. Despliegue en InfinityFree

1. Crear la base en **MySQL Databases** y anotar servidor (`sqlXXX.infinityfree.com`), usuario, contraseña y nombre.
2. En su phpMyAdmin, importar `database.sql` (y `datos_ejemplo.sql` si se desea).
3. Copiar `php/config.ejemplo.php` como `php/config.php` y escribir los cuatro datos.
4. Subir el proyecto a `htdocs/` con el File Manager o FTP (sin la carpeta `.git`).
5. Verificar: crear cuenta, publicar, editar, eliminar, cerrar sesión.

`php/config.php` está en `.gitignore`, por lo que la contraseña de la base no se publica en GitHub.

## 10. Respuestas del API

Todas las respuestas son JSON con `ok: true|false` y, en caso de error, `error` con un mensaje para mostrar al usuario.

| Código | Significado |
|---|---|
| 200 | Correcto |
| 400 | Datos no válidos (validación del servidor) |
| 401 | Sin sesión o credenciales incorrectas |
| 404 | Registro inexistente o de otra cuenta |
| 409 | Correo ya registrado |
| 500 | Error de base de datos |

## 11. Pruebas realizadas

Probado con PHP 8.3 y MariaDB: registro y login con hash; login incorrecto; Create, Read (`?id`), Update y Delete propios; Update con año fuera de rango (400); otra cuenta intentando leer, editar y borrar una publicación ajena (rechazado); peticiones sin sesión (401); cierre de sesión; migración de una contraseña sin cifrar; carrito tras los cambios; y en el navegador, el flujo Panel → Editar → Guardar cambios y la detección de una sesión cerrada en el servidor.
