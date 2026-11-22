<?php
// validar_publicacion.php
// Función compartida por guardar_publicacion.php (CREATE) y actualizar_publicacion.php (UPDATE).
// Lee los campos que llegan del formulario, los valida del lado del servidor
// y regresa un arreglo listo para la base de datos. Si algo está mal, responde el error y termina.

function validarPublicacion($d) {
    // Leer los campos (los opcionales quedan como texto vacío)
    $p = array(
        "titulo"      => trim($d["titulo"] ?? ""),
        "categoria"   => $d["categoria"] ?? "",
        "condicion"   => $d["condicion"] ?? "",
        "precio"      => $d["precio"] ?? "",
        "codigo"      => trim($d["codigo"] ?? ""),
        "descripcion" => trim($d["descripcion"] ?? ""),
        "marca"       => trim($d["marca"] ?? ""),
        "modelo"      => trim($d["modelo"] ?? ""),
        "anio"        => $d["anio"] ?? "",
        "version"     => trim($d["version"] ?? ""),
        "color"       => trim($d["color"] ?? ""),
        "modalidad"   => $d["modalidad"] ?? "",
        "contacto"    => trim($d["contacto"] ?? ""),
        "enlace"      => trim($d["enlace"] ?? "")
    );

    $error = "";
    $digitos = preg_replace("/\D/", "", $p["contacto"]);
    $anioMaximo = (int) date("Y") + 1;

    if (mb_strlen($p["titulo"]) < 4 || mb_strlen($p["titulo"]) > 90) {
        $error = "El nombre debe tener entre 4 y 90 caracteres.";
    } elseif (!in_array($p["categoria"], array("Motor", "Frenos", "Carrocería", "Eléctrico", "Accesorios"), true)) {
        $error = "Categoría no válida.";
    } elseif (!in_array($p["condicion"], array("Nuevo", "Usado", "Reacondicionado"), true)) {
        $error = "Condición no válida.";
    } elseif (!is_numeric($p["precio"]) || $p["precio"] < 0 || $p["precio"] > 10000000) {
        $error = "El precio debe estar entre 0 y 10,000,000.";
    } elseif (mb_strlen($p["descripcion"]) < 15 || mb_strlen($p["descripcion"]) > 600) {
        $error = "La descripción debe tener entre 15 y 600 caracteres.";
    } elseif ($p["marca"] == "" || $p["modelo"] == "") {
        $error = "Indica la marca y el modelo de la motocicleta.";
    } elseif (mb_strlen($p["codigo"]) > 50 || mb_strlen($p["marca"]) > 50 || mb_strlen($p["modelo"]) > 70
              || mb_strlen($p["version"]) > 50 || mb_strlen($p["color"]) > 40 || mb_strlen($p["contacto"]) > 100
              || mb_strlen($p["enlace"]) > 255) {
        $error = "Uno de los campos es demasiado largo.";
    } elseif (!is_numeric($p["anio"]) || $p["anio"] < 1950 || $p["anio"] > $anioMaximo) {
        $error = "El año debe estar entre 1950 y $anioMaximo.";
    } elseif (!in_array($p["modalidad"], array("directa", "comercio", "externa"), true)) {
        $error = "Modalidad no válida.";
    } elseif (!filter_var($p["contacto"], FILTER_VALIDATE_EMAIL) && strlen($digitos) < 8) {
        $error = "Ingresa un correo válido o un teléfono de al menos 8 dígitos.";
    } elseif ($p["modalidad"] == "externa" && !preg_match("/^https?:\/\/\S+\.\S+$/", $p["enlace"])) {
        $error = "Ingresa un enlace que comience con http:// o https://.";
    }
    if ($error != "") {
        responder(array("ok" => false, "error" => $error), 400);
    }

    // El enlace solo se guarda si la modalidad es "externa"
    if ($p["modalidad"] != "externa") {
        $p["enlace"] = "";
    }
    $p["precio"] = (float) $p["precio"];
    $p["anio"]   = (int) $p["anio"];
    return $p;
}
