<?php
// registrar.php
// Crea una cuenta nueva en la tabla usuarios e inicia sesión.
// Recibe JSON: { nombre, correo, contrasena }

require "conexion.php";

$datos      = leerJSON();
$nombre     = trim($datos["nombre"] ?? "");
$correo     = strtolower(trim($datos["correo"] ?? ""));
$contrasena = $datos["contrasena"] ?? "";

// Validación del lado del servidor (la del navegador no basta)
if (mb_strlen($nombre) < 2 || mb_strlen($nombre) > 70) {
    responder(array("ok" => false, "error" => "El nombre debe tener entre 2 y 70 caracteres."), 400);
}
if (!filter_var($correo, FILTER_VALIDATE_EMAIL) || strlen($correo) > 100) {
    responder(array("ok" => false, "error" => "Ingresa un correo válido."), 400);
}
if (strlen($contrasena) < 8 || strlen($contrasena) > 100) {
    responder(array("ok" => false, "error" => "La contraseña debe tener entre 8 y 100 caracteres."), 400);
}

// ¿Ya existe una cuenta con ese correo?
$buscar = mysqli_prepare($conexion, "SELECT id_usuario FROM usuarios WHERE correo = ?");
mysqli_stmt_bind_param($buscar, "s", $correo);
mysqli_stmt_execute($buscar);
mysqli_stmt_store_result($buscar);
if (mysqli_stmt_num_rows($buscar) > 0) {
    responder(array("ok" => false, "error" => "Ya existe una cuenta con ese correo."), 409);
}
mysqli_stmt_close($buscar);

// Guardar el usuario
$insertar = mysqli_prepare($conexion, "INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?, ?, ?)");
mysqli_stmt_bind_param($insertar, "sss", $nombre, $correo, $contrasena);
if (!mysqli_stmt_execute($insertar)) {
    responder(array("ok" => false, "error" => "No se pudo crear la cuenta."), 500);
}
$idUsuario = mysqli_insert_id($conexion);

// Iniciar sesión con la cuenta recién creada
$_SESSION["usuario"] = array("idUsuario" => $idUsuario, "nombre" => $nombre, "correo" => $correo);
responder(array("ok" => true, "sesion" => $_SESSION["usuario"]));
