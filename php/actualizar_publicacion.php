<?php
// actualizar_publicacion.php  (UPDATE)
// Modifica una publicación existente, pero solo si pertenece a la cuenta con sesión.
// Recibe JSON: { id, ...los mismos campos que guardar_publicacion.php }

require "conexion.php";
require "validar_publicacion.php";

$sesion = exigirSesion();
$d  = leerJSON();
$id = (int) ($d["id"] ?? 0);

// ¿Existe la publicación y es de esta cuenta?
$buscar = mysqli_prepare($conexion, "SELECT id_publicacion FROM publicaciones WHERE id_publicacion = ? AND id_usuario = ?");
mysqli_stmt_bind_param($buscar, "ii", $id, $sesion["idUsuario"]);
mysqli_stmt_execute($buscar);
mysqli_stmt_store_result($buscar);
if (mysqli_stmt_num_rows($buscar) < 1) {
    responder(array("ok" => false, "error" => "No se encontró la publicación o no es tuya."), 404);
}
mysqli_stmt_close($buscar);

// Misma validación que al crear
$p = validarPublicacion($d);

// El WHERE vuelve a pedir id_usuario: aunque alguien mande otro id, solo cambia lo suyo
$actualizar = mysqli_prepare($conexion,
    "UPDATE publicaciones
        SET titulo = ?, categoria = ?, condicion = ?, precio = ?, codigo_pieza = ?, descripcion = ?,
            marca_moto = ?, modelo_moto = ?, anio_moto = ?, version_moto = ?, color_moto = ?,
            modalidad = ?, contacto = ?, enlace_externo = ?
      WHERE id_publicacion = ? AND id_usuario = ?");
mysqli_stmt_bind_param($actualizar, "sssdssssisssssii",
    $p["titulo"], $p["categoria"], $p["condicion"], $p["precio"], $p["codigo"], $p["descripcion"],
    $p["marca"], $p["modelo"], $p["anio"], $p["version"], $p["color"],
    $p["modalidad"], $p["contacto"], $p["enlace"], $id, $sesion["idUsuario"]);

if (!mysqli_stmt_execute($actualizar)) {
    responder(array("ok" => false, "error" => "No se pudo actualizar la publicación."), 500);
}
responder(array("ok" => true, "id" => $id));
