<?php
// guardar_publicacion.php  (CREATE)
// Guarda una refacción nueva en la tabla publicaciones.
// Solo funciona con sesión iniciada: la publicación queda ligada a esa cuenta.
// Recibe JSON con los campos del formulario de publicar.html.

require "conexion.php";
require "validar_publicacion.php";

$sesion = exigirSesion();
$p = validarPublicacion(leerJSON());
$vendedor = $sesion["nombre"];   // el vendedor es siempre la cuenta con sesión

$insertar = mysqli_prepare($conexion,
    "INSERT INTO publicaciones (id_usuario, titulo, categoria, condicion, precio, codigo_pieza, descripcion,
                                marca_moto, modelo_moto, anio_moto, version_moto, color_moto, modalidad,
                                vendedor, contacto, enlace_externo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
mysqli_stmt_bind_param($insertar, "isssdssssissssss",
    $sesion["idUsuario"], $p["titulo"], $p["categoria"], $p["condicion"], $p["precio"], $p["codigo"],
    $p["descripcion"], $p["marca"], $p["modelo"], $p["anio"], $p["version"], $p["color"], $p["modalidad"],
    $vendedor, $p["contacto"], $p["enlace"]);

if (!mysqli_stmt_execute($insertar)) {
    responder(array("ok" => false, "error" => "No se pudo guardar la publicación."), 500);
}
responder(array("ok" => true, "id" => mysqli_insert_id($conexion)));
