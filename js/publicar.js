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
const botonEnviar = document.querySelector("#botonEnviar");
let sesion = null;
let intentoEnvio = false;   // true después de pulsar "Publicar" por primera vez

// Si la dirección es publicar.html?editar=5, el formulario edita la publicación 5 (UPDATE)
const idEditar = Number(new URLSearchParams(location.search).get("editar")) || 0;
const modoEdicion = idEditar > 0;

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

// Muestra un mensaje de error o de éxito debajo del formulario
function mostrarMensaje(html, tipo) {
    mensajeExito.innerHTML = html;
    mensajeExito.classList.remove("alert-success", "alert-danger");
    mensajeExito.classList.add("alert-" + tipo);
    mensajeExito.classList.remove("d-none");
}

// Modo edición: pide la publicación al servidor y llena el formulario con sus datos
async function cargarParaEditar() {
    const respuesta = await NodoApp.pedirJSON("php/publicaciones.php?id=" + idEditar);
    if (!respuesta.ok || respuesta.publicaciones.length === 0) {
        mostrarMensaje('No se encontró esa publicación en tu cuenta. <a class="alert-link" href="cuenta.html">Volver a mi panel</a>.', "danger");
        botonEnviar.disabled = true;
        return;
    }
    const p = respuesta.publicaciones[0];

    document.querySelector("#tituloPagina").textContent = "Editar publicación";
    document.querySelector("#introPagina").textContent = "Modifica los datos de tu refacción y guarda los cambios.";
    document.title = "Editar publicación | Nodo Refacciones";
    botonEnviar.textContent = "Guardar cambios";

    campoTitulo.value = p.titulo;
    campoCategoria.value = p.categoria;
    const radio = document.querySelector('input[name="condicion"][value="' + p.condicion + '"]');
    if (radio) radio.checked = true;
    campoPrecio.value = p.precio;
    document.querySelector("#codigoPieza").value = p.codigo;
    campoDescripcion.value = p.descripcion;
    campoMarca.value = p.marca;
    campoModelo.value = p.modelo;
    campoAnio.value = p.anio;
    document.querySelector("#versionMoto").value = p.version;
    document.querySelector("#colorMoto").value = p.color;
    campoModalidad.value = p.modalidad;
    actualizarModalidad();
    campoContacto.value = p.contacto;
    campoEnlace.value = p.enlace;
}

// Arma el objeto que se envía al servidor
// (el servidor pone el id del usuario y el vendedor a partir de la sesión)
function datosFormulario() {
    return {
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
        contacto: valor("contacto"),
        enlace: valor("enlaceExterno")
    };
}

async function iniciarPagina() {
    // La sesión se confirma con el servidor antes de mostrar el formulario
    sesion = await NodoAuth.listo;

    if (sesion === null) {
        // Sin sesión no se puede publicar ni editar
        avisoCuenta.classList.remove("d-none");
        return;
    }

    contenidoPublicar.classList.remove("d-none");
    campoVendedor.value = sesion.nombre;
    campoVendedor.readOnly = true;
    actualizarModalidad();

    if (modoEdicion) {
        await cargarParaEditar();
    }

    campoModalidad.addEventListener("change", actualizarModalidad);
    document.querySelector("#limpiarFormulario").addEventListener("click", () => {
        limpiarFormulario();
        if (modoEdicion) cargarParaEditar();   // al editar, "limpiar" regresa a los datos guardados
    });

    // Después del primer intento, los mensajes se actualizan mientras el usuario corrige
    formulario.addEventListener("input", () => {
        if (intentoEnvio) validarFormulario(false);
    });
    formulario.addEventListener("change", () => {
        if (intentoEnvio) validarFormulario(false);
    });

    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        mensajeExito.classList.add("d-none");
        intentoEnvio = true;

        // Si hay errores, no se guarda nada
        if (!validarFormulario(true)) return;

        const datos = datosFormulario();
        let url = "php/guardar_publicacion.php";        // CREATE
        if (modoEdicion) {
            url = "php/actualizar_publicacion.php";     // UPDATE
            datos.id = idEditar;
        }

        botonEnviar.disabled = true;
        const respuesta = await NodoApp.pedirJSON(url, datos);
        botonEnviar.disabled = false;

        if (!respuesta.ok) {
            // Si el servidor rechaza los datos, el formulario se queda como está
            mostrarMensaje(NodoApp.escaparHtml(respuesta.error), "danger");
            return;
        }

        if (modoEdicion) {
            mostrarMensaje('Los cambios se guardaron. <a class="alert-link" href="cuenta.html">Volver a mi panel</a> o <a class="alert-link" href="catalogo.html">ver el catálogo</a>.', "success");
            return;
        }

        limpiarFormulario();
        mostrarMensaje('Tu artículo se ha publicado. <a class="alert-link" href="cuenta.html">Ver mi panel</a> o <a class="alert-link" href="catalogo.html">explorar el catálogo</a>.', "success");
    });
}

iniciarPagina();
