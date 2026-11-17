<?php
// carrito_listar.php
// Regresa lo que hay en el carrito de la sesión, con los datos y precios que están en MySQL,
// además del nombre de quien tiene la sesión iniciada.

require "conexion.php";

$sesion = exigirSesion();

if (!isset($_SESSION["carrito"])) {
    $_SESSION["carrito"] = array();
}

$productos = array();
$total     = 0;

// Recorremos el carrito de la sesión y buscamos cada refacción en la tabla publicaciones
foreach ($_SESSION["carrito"] as $id => $cantidad) {
    $consulta = mysqli_prepare($conexion, "SELECT titulo, categoria, condicion, precio, vendedor FROM publicaciones WHERE id_publicacion = ?");
    mysqli_stmt_bind_param($consulta, "i", $id);
    mysqli_stmt_execute($consulta);
    $resultado = mysqli_stmt_get_result($consulta);
    $fila = mysqli_fetch_assoc($resultado);

    // Si la publicación ya la borraron, la quitamos del carrito
    if (!$fila) {
        unset($_SESSION["carrito"][$id]);
        continue;
    }

    $subtotal = $fila["precio"] * $cantidad;
    $total    = $total + $subtotal;

    $productos[] = array(
        "id"        => (int) $id,
        "titulo"    => $fila["titulo"],
        "categoria" => $fila["categoria"],
        "condicion" => $fila["condicion"],
        "vendedor"  => $fila["vendedor"],
        "precio"    => (float) $fila["precio"],
        "cantidad"  => (int) $cantidad,
        "subtotal"  => (float) $subtotal
    );
}

responder(array(
    "ok"        => true,
    "usuario"   => $sesion["nombre"],
    "productos" => $productos,
    "piezas"    => array_sum($_SESSION["carrito"]),
    "total"     => (float) $total
));
