<?php
// eliminar_publicacion.php
// Borra una publicación, pero solo si pertenece a la cuenta con sesión.
// Recibe JSON: { id }

require "conexion.php";

$sesion = exigirSesion();
$d  = leerJSON();
$id = (int) ($d["id"] ?? 0);

$borrar = mysqli_prepare($conexion, "DELETE FROM publicaciones WHERE id_publicacion = ? AND id_usuario = ?");
mysqli_stmt_bind_param($borrar, "ii", $id, $sesion["idUsuario"]);
mysqli_stmt_execute($borrar);

if (mysqli_stmt_affected_rows($borrar) < 1) {
    responder(array("ok" => false, "error" => "No se encontró la publicación."), 404);
}
responder(array("ok" => true));
