"use strict";

const formulario = document.querySelector("#formPublicacion");
const avisoCuenta = document.querySelector("#avisoCuentaPublicar");
const contenidoPublicar = document.querySelector("#contenidoPublicacion");
const campoTitulo = document.querySelector("#titulo");
const campoCategoria = document.querySelector("#categoria");
const grupoCondicion = document.querySelector("#grupoCondicion");
const campoPrecio = document.querySelector("#precio");
const campoDescripcion = document.querySelector("#descripcion");
const campoMarca = document.querySelector("#marcaMoto");
const campoModelo = document.querySelector("#modeloMoto");
const campoAnio = document.querySelector("#anioMoto");
const campoModalidad = document.querySelector("#modalidad");
const campoVendedor = document.querySelector("#vendedor");
const campoContacto = document.querySelector("#contacto");
const campoEnlace = document.querySelector("#enlaceExterno");
const grupoEnlace = document.querySelector("#grupoEnlace");
const campoConfirmacion = document.querySelector("#confirmacion");
const mensajeExito = document.querySelector("#mensajeExito");
const sesion = NodoAuth.obtenerSesion();
let intentoEnvio = false;   // true después de pulsar "Publicar" por primera vez

// Regresa el texto de un campo sin espacios al inicio ni al final
function valor(id) {
    return document.querySelector("#" + id).value.trim();
}

// Regresa la condición marcada ("Nuevo", "Usado"...) o "" si no hay ninguna
function condicionElegida() {
    const marcada = document.querySelector('input[name="condicion"]:checked');
    if (marcada === null) return "";
    return marcada.value;
}

// El campo del enlace solo aparece si la modalidad es "externa"
function actualizarModalidad() {
    if (campoModalidad.value === "externa") {
        grupoEnlace.classList.remove("d-none");
    } else {
        grupoEnlace.classList.add("d-none");
        campoEnlace.value = "";
    }
}

// Revisa todos los campos y controles del formulario.
// Regresa true si todo está correcto; si no, muestra un mensaje en cada campo con error.
function validarFormulario(enfocar) {
    let correcto = true;
    let primerError = null;   // primer campo con error, para darle el foco
    let mensaje = "";

    // Muestra (o quita) el error de un campo y recuerda si algo falló
    function revisar(campo, campoParaFoco) {
        if (!NodoApp.mostrarError(campo, mensaje)) {
            correcto = false;
            if (primerError === null) primerError = campoParaFoco || campo;
        }
        mensaje = "";
    }

    // Campo de texto: nombre de la refacción
    const titulo = valor("titulo");
    if (titulo === "") {
        mensaje = "Escribe el nombre de la refacción.";
    } else if (titulo.length < 4) {
        mensaje = "El nombre debe tener al menos 4 caracteres.";
    }
    revisar(campoTitulo);

    // Lista desplegable: categoría
    if (campoCategoria.value === "") {
        mensaje = "Selecciona una categoría.";
    }
    revisar(campoCategoria);

    // Botones de opción: condición
    if (condicionElegida() === "") {
        mensaje = "Selecciona la condición de la pieza.";
    }
    revisar(grupoCondicion, document.querySelector('input[name="condicion"]'));

    // Número: precio
    const precio = Number(valor("precio"));
    if (valor("precio") === "") {
        mensaje = "Ingresa el precio.";
    } else if (isNaN(precio) || precio < 0) {
        mensaje = "El precio debe ser un número mayor o igual a 0.";
    } else if (precio > 10000000) {
        mensaje = "El precio no puede ser mayor a $10,000,000.";
    }
    revisar(campoPrecio);

    // Texto largo: descripción
    if (valor("descripcion").length < 15) {
        mensaje = "Escribe una descripción de al menos 15 caracteres.";
    }
    revisar(campoDescripcion);

    // Datos de la motocicleta
    if (valor("marcaMoto") === "") {
        mensaje = "Indica la marca de la motocicleta.";
    }
    revisar(campoMarca);

    if (valor("modeloMoto") === "") {
        mensaje = "Indica el modelo.";
    }
    revisar(campoModelo);

    const anioMaximo = new Date().getFullYear() + 1;
    const anio = Number(valor("anioMoto"));
    if (valor("anioMoto") === "") {
        mensaje = "Ingresa el año de la motocicleta.";
    } else if (isNaN(anio) || anio % 1 !== 0 || anio < 1950 || anio > anioMaximo) {
        mensaje = "El año debe ser un número entre 1950 y " + anioMaximo + ".";
    }
    revisar(campoAnio);

    // Lista desplegable: modalidad
    if (campoModalidad.value === "") {
        mensaje = "Selecciona una modalidad.";
    }
    revisar(campoModalidad);

    // Contacto: un correo válido o un teléfono con al menos 8 dígitos
    const contacto = valor("contacto");
    const digitos = contacto.replace(/\D/g, "");
    if (contacto === "") {
        mensaje = "Ingresa un correo o teléfono de contacto.";
    } else if (!NodoApp.esCorreo(contacto) && digitos.length < 8) {
        mensaje = "Ingresa un correo válido o un teléfono de al menos 8 dígitos.";
    }
    revisar(campoContacto);

    // El enlace solo se revisa si la modalidad es "externa"
    if (campoModalidad.value === "externa") {
        const enlace = valor("enlaceExterno");
        if (!enlace.startsWith("http://") && !enlace.startsWith("https://")) {
            mensaje = "Ingresa una dirección web que comience con http:// o https://.";
        } else if (!enlace.includes(".")) {
            mensaje = "La dirección web no parece válida.";
        }
        revisar(campoEnlace);
    } else {
        NodoApp.mostrarError(campoEnlace, "");
    }

    // Casilla de verificación: confirmación
    if (!campoConfirmacion.checked) {
        mensaje = "Debes confirmar la información antes de publicar.";
    }
    revisar(campoConfirmacion);

    if (enfocar && primerError !== null) {
        primerError.focus();
    }
    return correcto;
}

// Quita los mensajes de error que se hayan mostrado
function quitarErrores() {
    const campos = formulario.querySelectorAll(".is-invalid");
    for (let i = 0; i < campos.length; i++) {
        campos[i].classList.remove("is-invalid");
    }
    const avisos = formulario.querySelectorAll(".invalid-feedback");
    for (let i = 0; i < avisos.length; i++) {
        avisos[i].classList.remove("d-block");
    }
}

function limpiarFormulario() {
    formulario.reset();
    quitarErrores();
    intentoEnvio = false;
    mensajeExito.classList.add("d-none");
    campoVendedor.value = sesion.nombre;
    actualizarModalidad();
}

if (sesion === null) {
    // Sin sesión no se puede publicar
    avisoCuenta.classList.remove("d-none");
} else {
    contenidoPublicar.classList.remove("d-none");
    campoVendedor.value = sesion.nombre;
    campoVendedor.readOnly = true;
    actualizarModalidad();

    campoModalidad.addEventListener("change", actualizarModalidad);
    document.querySelector("#limpiarFormulario").addEventListener("click", limpiarFormulario);

    // Después del primer intento, los mensajes se actualizan mientras el usuario corrige
    formulario.addEventListener("input", () => {
        if (intentoEnvio) validarFormulario(false);
    });
    formulario.addEventListener("change", () => {
        if (intentoEnvio) validarFormulario(false);
    });

    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();
        mensajeExito.classList.add("d-none");
        intentoEnvio = true;

        // Si hay errores, no se guarda nada
        if (!validarFormulario(true)) return;

        const publicacion = {
            id: "local-" + Date.now(),
            idUsuario: sesion.idUsuario,
            titulo: valor("titulo"),
            categoria: valor("categoria"),
            condicion: condicionElegida(),
            precio: Number(valor("precio")),
            codigo: valor("codigoPieza"),
            descripcion: valor("descripcion"),
            marca: valor("marcaMoto"),
            modelo: valor("modeloMoto"),
            anio: valor("anioMoto"),
            version: valor("versionMoto"),
            color: valor("colorMoto"),
            modalidad: valor("modalidad"),
            vendedor: sesion.nombre,
            contacto: valor("contacto"),
            enlace: valor("enlaceExterno"),
            imagen: "assets/img/refaccion-placeholder.svg",
            ejemplo: false
        };

        // La publicación nueva va al principio de la lista
        const guardadas = NodoApp.leerGuardadas();
        guardadas.unshift(publicacion);
        NodoApp.guardar(guardadas);

        limpiarFormulario();
        mensajeExito.innerHTML = 'Tu artículo se ha publicado. <a class="alert-link" href="cuenta.html">Ver mi panel</a> o <a class="alert-link" href="catalogo.html">explorar el catálogo</a>.';
        mensajeExito.classList.remove("d-none");
    });
}
