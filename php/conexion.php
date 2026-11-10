<?php
// conexion.php
// Lo incluyen todos los scripts de esta carpeta. Hace tres cosas:
//   1. Abre la sesión de PHP (ahí se recuerda quién inició sesión).
//   2. Conecta con MySQL (usuario "root" sin contraseña: valores por defecto de XAMPP).
//   3. Define funciones para contestar en formato JSON.

mysqli_report(MYSQLI_REPORT_OFF);   // los errores se revisan a mano con if
session_start();
header("Content-Type: application/json; charset=utf-8");

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
        responder(array("ok" => false, "error" => "Debes iniciar sesión."), 401);
    }
    return $_SESSION["usuario"];
}

$conexion = @mysqli_connect("localhost", "root", "", "nodo_refacciones");
if (!$conexion) {
    responder(array("ok" => false, "error" => "No se pudo conectar a la base de datos. ¿Está encendido MySQL?"), 500);
}
mysqli_set_charset($conexion, "utf8mb4");
