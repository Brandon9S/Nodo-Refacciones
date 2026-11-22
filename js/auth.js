"use strict";

// Las cuentas viven en MySQL (tabla usuarios) y la sesión se valida en el servidor (php/login.php).
// Aquí solo se guarda en SessionStorage una copia de los datos de la sesión
// para que el menú y las páginas sepan al instante si hay alguien conectado.
const NodoAuth = {
    claveSesion: "nodoSesion",

    obtenerSesion() {
        const texto = sessionStorage.getItem(this.claveSesion);
        if (texto === null) return null;
        return JSON.parse(texto);
    },

    guardarSesion(sesion) {
        sessionStorage.setItem(this.claveSesion, JSON.stringify(sesion));
    },

    // Regresa el texto del error, o "" si todo salió bien
    async registrar(nombre, correo, contrasena) {
        const respuesta = await NodoApp.pedirJSON("php/registrar.php", {
            nombre: nombre.trim(),
            correo: correo.trim(),
            contrasena: contrasena
        });
        if (!respuesta.ok) return respuesta.error;

        this.guardarSesion(respuesta.sesion);
        return "";
    },

    // Regresa el texto del error, o "" si los datos son correctos
    async iniciarSesion(correo, contrasena) {
        const respuesta = await NodoApp.pedirJSON("php/login.php", {
            correo: correo.trim(),
            contrasena: contrasena
        });
        if (!respuesta.ok) return respuesta.error;

        this.guardarSesion(respuesta.sesion);
        return "";
    },

    // Pregunta al servidor (php/sesion.php) si la sesión sigue activa y actualiza la copia local.
    // La sesión de PHP es la que manda: si el servidor la cerró, aquí también se borra.
    async verificarSesion() {
        const respuesta = await NodoApp.pedirJSON("php/sesion.php");
        if (!respuesta.ok) return this.obtenerSesion();   // sin servidor no se cambia nada
        if (respuesta.activa) {
            this.guardarSesion(respuesta.sesion);
        } else {
            sessionStorage.removeItem(this.claveSesion);
        }
        this.actualizarEnlaces();
        return this.obtenerSesion();
    },

    async cerrarSesion() {
        await NodoApp.pedirJSON("php/logout.php", {});
        sessionStorage.removeItem(this.claveSesion);
    },

    // Muestra en el menú cuántas piezas hay en el carrito (se oculta cuando son 0)
    mostrarContador(piezas) {
        const marcas = document.querySelectorAll("[data-carrito-contador]");
        for (let i = 0; i < marcas.length; i++) {
            marcas[i].textContent = piezas;
            if (piezas > 0) {
                marcas[i].classList.remove("d-none");
            } else {
                marcas[i].classList.add("d-none");
            }
        }
    },

    // Le pregunta al servidor cuántas piezas lleva el carrito de la sesión
    async actualizarContador() {
        if (this.obtenerSesion() === null) return;
        const respuesta = await NodoApp.pedirJSON("php/carrito_listar.php");
        if (respuesta.ok) {
            this.mostrarContador(respuesta.piezas);
        }
    },

    // El enlace del menú dice "Mi panel" si hay sesión y "Mi cuenta" si no
    actualizarEnlaces() {
        const hayEnlace = this.obtenerSesion() !== null;
        const enlaces = document.querySelectorAll("[data-account-link]");
        for (let i = 0; i < enlaces.length; i++) {
            if (hayEnlace) {
                enlaces[i].textContent = "Mi panel";
            } else {
                enlaces[i].textContent = "Mi cuenta";
            }
        }
    }
};

// Al cargar cualquier página: primero se confirma la sesión con el servidor y luego el contador del carrito.
// Las páginas que dependen de la sesión esperan esta promesa.
NodoAuth.actualizarEnlaces();
NodoAuth.listo = NodoAuth.verificarSesion().then((sesion) => {
    NodoAuth.actualizarContador();
    return sesion;
});
