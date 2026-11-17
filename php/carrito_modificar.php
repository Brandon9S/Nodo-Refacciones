<?php
// carrito_modificar.php
// Cambia la cantidad de una refacción que ya está en el carrito.
// Recibe JSON: { id, cantidad }

require "conexion.php";

exigirSesion();
$d        = leerJSON();
$id       = (int) ($d["id"] ?? 0);
$cantidad = (int) ($d["cantidad"] ?? 0);

if (!isset($_SESSION["carrito"][$id])) {
    responder(array("ok" => false, "error" => "Esa refacción no está en tu carrito."), 404);
}
if ($cantidad < 1 || $cantidad > 99) {
    responder(array("ok" => false, "error" => "La cantidad debe ser un número entre 1 y 99."), 400);
}

$_SESSION["carrito"][$id] = $cantidad;

responder(array("ok" => true, "piezas" => array_sum($_SESSION["carrito"])));
