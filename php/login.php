<?php
// login.php
// Revisa el correo y la contraseña en la tabla usuarios e inicia sesión.
// Recibe JSON: { correo, contrasena }

require "conexion.php";

$datos      = leerJSON();
$correo     = strtolower(trim($datos["correo"] ?? ""));
$contrasena = $datos["contrasena"] ?? "";

$consulta = mysqli_prepare($conexion, "SELECT id_usuario, nombre, contrasena FROM usuarios WHERE correo = ?");
mysqli_stmt_bind_param($consulta, "s", $correo);
mysqli_stmt_execute($consulta);
mysqli_stmt_bind_result($consulta, $idUsuario, $nombre, $contrasenaGuardada);

if (!mysqli_stmt_fetch($consulta)) {
    responder(array("ok" => false, "error" => "No encontramos una cuenta con ese correo."), 404);
}
if ($contrasena !== $contrasenaGuardada) {
    responder(array("ok" => false, "error" => "La contraseña no es correcta."), 401);
}

$_SESSION["usuario"] = array("idUsuario" => $idUsuario, "nombre" => $nombre, "correo" => $correo);
responder(array("ok" => true, "sesion" => $_SESSION["usuario"]));
