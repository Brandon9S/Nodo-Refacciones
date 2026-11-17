<?php
// carrito_agregar.php
// Agrega una refacción al carrito. El carrito vive en la sesión de PHP: $_SESSION["carrito"].
// Es un arreglo donde la llave es el id de la publicación y el valor es la cantidad.
// Recibe JSON: { id }

require "conexion.php";

exigirSesion();
$d  = leerJSON();
$id = (int) ($d["id"] ?? 0);

// Revisamos que la publicación exista en la base de datos
$consulta = mysqli_prepare($conexion, "SELECT id_publicacion FROM publicaciones WHERE id_publicacion = ?");
mysqli_stmt_bind_param($consulta, "i", $id);
mysqli_stmt_execute($consulta);
mysqli_stmt_store_result($consulta);

if (mysqli_stmt_num_rows($consulta) < 1) {
    responder(array("ok" => false, "error" => "Esa publicación ya no existe."), 404);
}

if (!isset($_SESSION["carrito"])) {
    $_SESSION["carrito"] = array();
}

// Si ya estaba en el carrito sumamos 1; si no, la agregamos con cantidad 1
if (isset($_SESSION["carrito"][$id])) {
    if ($_SESSION["carrito"][$id] >= 99) {
        responder(array("ok" => false, "error" => "Máximo 99 piezas de la misma refacción."), 400);
    }
    $_SESSION["carrito"][$id]++;
} else {
    $_SESSION["carrito"][$id] = 1;
}

responder(array("ok" => true, "piezas" => array_sum($_SESSION["carrito"])));
