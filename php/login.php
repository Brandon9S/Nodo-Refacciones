<?php
// login.php
// Autenticación: revisa el correo y la contraseña en la tabla usuarios e inicia sesión.
// Recibe JSON: { correo, contrasena }

require "conexion.php";

$datos      = leerJSON();
$correo     = strtolower(trim($datos["correo"] ?? ""));
$contrasena = $datos["contrasena"] ?? "";

if ($correo === "" || $contrasena === "") {
    responder(array("ok" => false, "error" => "Escribe tu correo y tu contraseña."), 400);
}

$consulta = mysqli_prepare($conexion, "SELECT id_usuario, nombre, contrasena FROM usuarios WHERE correo = ?");
mysqli_stmt_bind_param($consulta, "s", $correo);
mysqli_stmt_execute($consulta);
mysqli_stmt_bind_result($consulta, $idUsuario, $nombre, $contrasenaGuardada);
$existe = mysqli_stmt_fetch($consulta);
mysqli_stmt_close($consulta);

// password_verify() compara la contraseña escrita con el hash guardado.
// Las cuentas creadas antes de la ADA 6 tienen la contraseña sin cifrar: si coincide,
// se acepta una sola vez y se reemplaza por su hash.
$correcta = false;
if ($existe) {
    if (password_verify($contrasena, $contrasenaGuardada)) {
        $correcta = true;
    } elseif (password_get_info($contrasenaGuardada)["algo"] === null && hash_equals($contrasenaGuardada, $contrasena)) {
        $correcta = true;
        $hash = password_hash($contrasena, PASSWORD_DEFAULT);
        $cambiar = mysqli_prepare($conexion, "UPDATE usuarios SET contrasena = ? WHERE id_usuario = ?");
        mysqli_stmt_bind_param($cambiar, "si", $hash, $idUsuario);
        mysqli_stmt_execute($cambiar);
    }
}

// El mismo mensaje para correo inexistente y contraseña incorrecta:
// así no se revela qué correos tienen cuenta.
if (!$correcta) {
    responder(array("ok" => false, "error" => "El correo o la contraseña no son correctos."), 401);
}

$sesion = iniciarSesionUsuario($idUsuario, $nombre, $correo);
responder(array("ok" => true, "sesion" => $sesion));
