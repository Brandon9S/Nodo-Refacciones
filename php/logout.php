<?php
// logout.php
// Cierra la sesión del servidor.

require "conexion.php";

$_SESSION = array();
session_destroy();
responder(array("ok" => true));
