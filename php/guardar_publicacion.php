<?php
// guardar_publicacion.php
// Guarda una refacción nueva en la tabla publicaciones.
// Solo funciona con sesión iniciada: la publicación queda ligada a esa cuenta.
// Recibe JSON con los campos del formulario de publicar.html.

require "conexion.php";

$sesion = exigirSesion();
$d = leerJSON();

// Leer los campos (los opcionales quedan como texto vacío)
$titulo      = trim($d["titulo"] ?? "");
$categoria   = $d["categoria"] ?? "";
$condicion   = $d["condicion"] ?? "";
$precio      = $d["precio"] ?? "";
$codigo      = trim($d["codigo"] ?? "");
$descripcion = trim($d["descripcion"] ?? "");
$marca       = trim($d["marca"] ?? "");
$modelo      = trim($d["modelo"] ?? "");
$anio        = $d["anio"] ?? "";
$version     = trim($d["version"] ?? "");
$color       = trim($d["color"] ?? "");
$modalidad   = $d["modalidad"] ?? "";
$contacto    = trim($d["contacto"] ?? "");
$enlace      = trim($d["enlace"] ?? "");
$vendedor    = $sesion["nombre"];   // el vendedor es siempre la cuenta con sesión

// Validación del lado del servidor
$error = "";
$digitos = preg_replace("/\D/", "", $contacto);
$anioMaximo = (int) date("Y") + 1;

if (mb_strlen($titulo) < 4 || mb_strlen($titulo) > 90) {
    $error = "El nombre debe tener entre 4 y 90 caracteres.";
} elseif (!in_array($categoria, array("Motor", "Frenos", "Carrocería", "Eléctrico", "Accesorios"))) {
    $error = "Categoría no válida.";
} elseif (!in_array($condicion, array("Nuevo", "Usado", "Reacondicionado"))) {
    $error = "Condición no válida.";
} elseif (!is_numeric($precio) || $precio < 0 || $precio > 10000000) {
    $error = "El precio debe estar entre 0 y 10,000,000.";
} elseif (mb_strlen($descripcion) < 15 || mb_strlen($descripcion) > 600) {
    $error = "La descripción debe tener entre 15 y 600 caracteres.";
} elseif ($marca == "" || $modelo == "") {
    $error = "Indica la marca y el modelo de la motocicleta.";
} elseif (!is_numeric($anio) || $anio < 1950 || $anio > $anioMaximo) {
    $error = "El año debe estar entre 1950 y $anioMaximo.";
} elseif (!in_array($modalidad, array("directa", "comercio", "externa"))) {
    $error = "Modalidad no válida.";
} elseif (!filter_var($contacto, FILTER_VALIDATE_EMAIL) && strlen($digitos) < 8) {
    $error = "Ingresa un correo válido o un teléfono de al menos 8 dígitos.";
} elseif ($modalidad == "externa" && !preg_match("/^https?:\/\/\S+\.\S+$/", $enlace)) {
    $error = "Ingresa un enlace que comience con http:// o https://.";
}
if ($error != "") {
    responder(array("ok" => false, "error" => $error), 400);
}

// El enlace solo se guarda si la modalidad es "externa"
if ($modalidad != "externa") {
    $enlace = "";
}
$precio = (float) $precio;
$anio   = (int) $anio;

$insertar = mysqli_prepare($conexion,
    "INSERT INTO publicaciones (id_usuario, titulo, categoria, condicion, precio, codigo_pieza, descripcion,
                                marca_moto, modelo_moto, anio_moto, version_moto, color_moto, modalidad,
                                vendedor, contacto, enlace_externo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
mysqli_stmt_bind_param($insertar, "isssdssssissssss",
    $sesion["idUsuario"], $titulo, $categoria, $condicion, $precio, $codigo, $descripcion,
    $marca, $modelo, $anio, $version, $color, $modalidad, $vendedor, $contacto, $enlace);

if (!mysqli_stmt_execute($insertar)) {
    responder(array("ok" => false, "error" => "No se pudo guardar la publicación. Revisa la longitud de los campos."), 500);
}
responder(array("ok" => true, "id" => mysqli_insert_id($conexion)));
