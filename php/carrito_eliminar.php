<?php
// carrito_eliminar.php
// Quita una refacción del carrito.
// Recibe JSON: { id }

require "conexion.php";

exigirSesion();
$d  = leerJSON();
$id = (int) ($d["id"] ?? 0);

if (!isset($_SESSION["carrito"][$id])) {
    responder(array("ok" => false, "error" => "Esa refacción no está en tu carrito."), 404);
}

unset($_SESSION["carrito"][$id]);

responder(array("ok" => true, "piezas" => array_sum($_SESSION["carrito"])));
