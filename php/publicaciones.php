<?php
// publicaciones.php
// Regresa las publicaciones guardadas en MySQL, de la más nueva a la más antigua.
//   publicaciones.php          -> todas (catálogo e inicio)
//   publicaciones.php?mias=1   -> solo las de la cuenta con sesión (panel)
// Cada publicación sale con los mismos nombres de campo que ya usa el JavaScript.

require "conexion.php";

$columnas = "id_publicacion, id_usuario, titulo, categoria, condicion, precio, codigo_pieza, descripcion,
             marca_moto, modelo_moto, anio_moto, version_moto, color_moto, modalidad, vendedor, contacto, enlace_externo";
$orden = "ORDER BY fecha_publicacion DESC, id_publicacion DESC";

if (isset($_GET["mias"])) {
    $sesion = exigirSesion();
    $consulta = mysqli_prepare($conexion, "SELECT $columnas FROM publicaciones WHERE id_usuario = ? $orden");
    mysqli_stmt_bind_param($consulta, "i", $sesion["idUsuario"]);
} else {
    $consulta = mysqli_prepare($conexion, "SELECT $columnas FROM publicaciones $orden");
}
mysqli_stmt_execute($consulta);
$resultado = mysqli_stmt_get_result($consulta);

$lista = array();
while ($fila = mysqli_fetch_assoc($resultado)) {
    $lista[] = array(
        "id"          => (int) $fila["id_publicacion"],
        "idUsuario"   => (int) $fila["id_usuario"],
        "titulo"      => $fila["titulo"],
        "categoria"   => $fila["categoria"],
        "condicion"   => $fila["condicion"],
        "precio"      => (float) $fila["precio"],
        "codigo"      => $fila["codigo_pieza"],
        "descripcion" => $fila["descripcion"],
        "marca"       => $fila["marca_moto"],
        "modelo"      => $fila["modelo_moto"],
        "anio"        => (string) $fila["anio_moto"],
        "version"     => $fila["version_moto"],
        "color"       => $fila["color_moto"],
        "modalidad"   => $fila["modalidad"],
        "vendedor"    => $fila["vendedor"],
        "contacto"    => $fila["contacto"],
        "enlace"      => $fila["enlace_externo"],
        "imagen"      => "assets/img/refaccion.png",
        "ejemplo"     => false
    );
}
responder(array("ok" => true, "publicaciones" => $lista));
