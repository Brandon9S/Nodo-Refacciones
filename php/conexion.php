<?php
// conexion.php
// Lo incluyen todos los scripts de esta carpeta. Hace tres cosas:
//   1. Abre la sesión de PHP (ahí se recuerda quién inició sesión).
//   2. Conecta con MySQL usando los datos de config.php.
//   3. Define funciones para contestar en formato JSON.

mysqli_report(MYSQLI_REPORT_OFF);   // los errores se revisan a mano con if

// La cookie de sesión no se puede leer desde JavaScript (httponly)
// y solo se envía a este mismo sitio (samesite).
session_set_cookie_params(array(
    "lifetime" => 0,          // dura hasta que se cierra el navegador
    "path"     => "/",
    "httponly" => true,
    "samesite" => "Lax"
));
session_start();
header("Content-Type: application/json; charset=utf-8");

// La sesión se cierra sola después de 30 minutos sin actividad
$minutosInactividad = 30;
if (isset($_SESSION["ultimaActividad"]) && time() - $_SESSION["ultimaActividad"] > $minutosInactividad * 60) {
    $_SESSION = array();
    session_destroy();
    session_start();
}
$_SESSION["ultimaActividad"] = time();

// Envía la respuesta en JSON y termina el script
function responder($datos, $codigo = 200) {
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

// Lee el JSON que manda fetch() en el cuerpo de la petición
function leerJSON() {
    $datos = json_decode(file_get_contents("php://input"), true);
    if (!is_array($datos)) {
        $datos = array();
    }
    return $datos;
}

// Regresa los datos de la sesión activa o responde error si no hay sesión
function exigirSesion() {
    if (!isset($_SESSION["usuario"])) {
        responder(array("ok" => false, "error" => "Tu sesión terminó. Vuelve a iniciar sesión."), 401);
    }
    return $_SESSION["usuario"];
}

// Guarda en la sesión al usuario que acaba de entrar o registrarse
function iniciarSesionUsuario($idUsuario, $nombre, $correo) {
    session_regenerate_id(true);   // id de sesión nuevo al entrar (evita fijación de sesión)
    $_SESSION["usuario"] = array("idUsuario" => (int) $idUsuario, "nombre" => $nombre, "correo" => $correo);
    $_SESSION["carrito"] = array();
    return $_SESSION["usuario"];
}

// Datos de conexión: config.php (no se sube a GitHub).
// Si no existe, se usan los valores por defecto de XAMPP.
$bd = array("servidor" => "localhost", "usuario" => "root", "contrasena" => "", "base" => "nodo_refacciones");
if (file_exists(__DIR__ . "/config.php")) {
    $bd = require __DIR__ . "/config.php";
}

$conexion = @mysqli_connect($bd["servidor"], $bd["usuario"], $bd["contrasena"], $bd["base"]);
if (!$conexion) {
    responder(array("ok" => false, "error" => "No se pudo conectar a la base de datos."), 500);
}
mysqli_set_charset($conexion, "utf8mb4");
