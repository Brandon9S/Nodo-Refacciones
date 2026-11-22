<?php
// sesion.php
// Dice si hay una sesión activa en el servidor y de quién es.
// Las páginas lo consultan al cargar para que el navegador nunca crea
// que hay sesión cuando el servidor ya la cerró (por ejemplo, por inactividad).

require "conexion.php";

if (!isset($_SESSION["usuario"])) {
    responder(array("ok" => true, "activa" => false));
}
responder(array("ok" => true, "activa" => true, "sesion" => $_SESSION["usuario"]));
