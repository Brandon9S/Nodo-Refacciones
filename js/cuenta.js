"use strict";

const zonaAcceso = document.querySelector("#zonaAcceso");
const panelCuenta = document.querySelector("#panelCuenta");
const formRegistro = document.querySelector("#formRegistro");
const formLogin = document.querySelector("#formLogin");
const mensajeRegistro = document.querySelector("#mensajeRegistro");
const mensajeLogin = document.querySelector("#mensajeLogin");
const listaPanel = document.querySelector("#misPublicaciones");
const panelVacio = document.querySelector("#sinPublicacionesCuenta");
const cantidad = document.querySelector("#cantidadPublicaciones");

const campoRegNombre = document.querySelector("#registroNombre");
const campoRegCorreo = document.querySelector("#registroCorreo");
const campoRegPassword = document.querySelector("#registroPassword");
const campoLoginCorreo = document.querySelector("#loginCorreo");
const campoLoginPassword = document.querySelector("#loginPassword");
let intentoRegistro = false;   // true después del primer intento de crear cuenta
let intentoLogin = false;      // true después del primer intento de entrar

// Muestra un aviso general debajo del formulario
function mostrarAviso(caja, texto) {
    caja.textContent = texto;
    caja.classList.add("alert-danger");
    caja.classList.remove("d-none");
}

// Revisa el formulario de crear cuenta. Regresa true si todo está bien
function validarRegistro() {
    const nombre = campoRegNombre.value.trim();
    const correo = campoRegCorreo.value.trim();
    const password = campoRegPassword.value;
    let correcto = true;
    let mensaje = "";

    if (nombre.length < 2) {
        mensaje = "Escribe un nombre de al menos 2 caracteres.";
    }
    if (!NodoApp.mostrarError(campoRegNombre, mensaje)) correcto = false;

    mensaje = "";
    if (correo === "") {
        mensaje = "Escribe tu correo electrónico.";
    } else if (!NodoApp.esCorreo(correo)) {
        mensaje = "Ingresa un correo válido, por ejemplo tu@correo.com.";
    }
    if (!NodoApp.mostrarError(campoRegCorreo, mensaje)) correcto = false;

    mensaje = "";
    if (password.length < 8) {
        mensaje = "La contraseña debe tener al menos 8 caracteres.";
    }
    if (!NodoApp.mostrarError(campoRegPassword, mensaje)) correcto = false;

    return correcto;
}

// Revisa el formulario de inicio de sesión. Regresa true si todo está bien
function validarLogin() {
    const correo = campoLoginCorreo.value.trim();
    let correcto = true;
    let mensaje = "";

    if (correo === "") {
        mensaje = "Ingresa el correo con el que te registraste.";
    } else if (!NodoApp.esCorreo(correo)) {
        mensaje = "Ingresa un correo válido, por ejemplo tu@correo.com.";
    }
    if (!NodoApp.mostrarError(campoLoginCorreo, mensaje)) correcto = false;

    mensaje = "";
    if (campoLoginPassword.value === "") {
        mensaje = "Escribe tu contraseña.";
    }
    if (!NodoApp.mostrarError(campoLoginPassword, mensaje)) correcto = false;

    return correcto;
}

// Si hay sesión se muestra el panel; si no, los formularios
async function mostrarPanel() {
    const sesion = NodoAuth.obtenerSesion();

    if (sesion === null) {
        zonaAcceso.classList.remove("d-none");
        panelCuenta.classList.add("d-none");
        return;
    }

    zonaAcceso.classList.add("d-none");
    panelCuenta.classList.remove("d-none");
    document.querySelector("#nombreCuenta").textContent = sesion.nombre;
    document.querySelector("#correoCuenta").textContent = sesion.correo;

    // Solo las publicaciones de esta cuenta (el servidor filtra por la sesión)
    const propias = await NodoApp.leerMias();

    if (propias.length === 1) {
        cantidad.textContent = "1 publicación";
    } else {
        cantidad.textContent = propias.length + " publicaciones";
    }

    if (propias.length === 0) {
        panelVacio.classList.remove("d-none");
    } else {
        panelVacio.classList.add("d-none");
    }

    const e = NodoApp.escaparHtml;
    let html = "";
    for (let i = 0; i < propias.length; i++) {
        const p = propias[i];
        html += `
            <article class="account-listing">
                <img class="account-listing-image" src="${e(p.imagen)}" alt="Imagen de ${e(p.titulo)}">
                <div class="account-listing-info">
                    <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
                        <h3>${e(p.titulo)}</h3>
                        <span class="condition-tag">${e(p.condicion)}</span>
                    </div>
                    <p>${e(p.marca)} · ${e(p.modelo)} · ${e(p.anio)}</p>
                    <strong>${NodoApp.formatearPrecio(p.precio)}</strong>
                    <small>${e(p.categoria)} · ${e(NodoApp.nombreModalidad(p.modalidad))}</small>
                </div>
                <button class="btn btn-outline-danger btn-sm account-delete" type="button" data-eliminar="${e(p.id)}" aria-label="Eliminar ${e(p.titulo)}">Eliminar</button>
            </article>`;
    }
    listaPanel.innerHTML = html;
}

// Crear cuenta
formRegistro.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    mensajeRegistro.classList.add("d-none");
    intentoRegistro = true;
    if (!validarRegistro()) return;

    const error = await NodoAuth.registrar(campoRegNombre.value, campoRegCorreo.value, campoRegPassword.value);
    if (error !== "") {
        mostrarAviso(mensajeRegistro, error);
        return;
    }

    formRegistro.reset();
    intentoRegistro = false;
    NodoAuth.actualizarEnlaces();
    mostrarPanel();
});

// Iniciar sesión
formLogin.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    mensajeLogin.classList.add("d-none");
    intentoLogin = true;
    if (!validarLogin()) return;

    const error = await NodoAuth.iniciarSesion(campoLoginCorreo.value, campoLoginPassword.value);
    if (error !== "") {
        mostrarAviso(mensajeLogin, error);
        return;
    }

    formLogin.reset();
    intentoLogin = false;
    NodoAuth.actualizarEnlaces();
    mostrarPanel();
});

// Después del primer intento, los mensajes se actualizan mientras el usuario corrige
formRegistro.addEventListener("input", () => {
    if (intentoRegistro) validarRegistro();
});
formLogin.addEventListener("input", () => {
    if (intentoLogin) validarLogin();
});

// Cerrar sesión
document.querySelector("#cerrarSesion").addEventListener("click", async () => {
    await NodoAuth.cerrarSesion();
    NodoAuth.actualizarEnlaces();
    mostrarPanel();
});

// Eliminar una publicación propia (un solo listener para toda la lista)
listaPanel.addEventListener("click", async (evento) => {
    const id = evento.target.dataset.eliminar;
    if (id === undefined) return;
    if (!confirm("¿Quieres eliminar esta publicación de tu panel?")) return;

    await NodoApp.pedirJSON("php/eliminar_publicacion.php", { id: Number(id) });
    mostrarPanel();
});

mostrarPanel();
