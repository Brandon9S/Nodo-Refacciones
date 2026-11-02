"use strict";

// Cuentas en LocalStorage; la sesión en SessionStorage (se cierra al cerrar la pestaña)
const NodoAuth = {
    claveUsuarios: "nodoUsuarios",
    claveSesion: "nodoSesion",

    leerUsuarios() {
        const texto = localStorage.getItem(this.claveUsuarios);
        if (texto === null) return [];
        return JSON.parse(texto);
    },

    obtenerSesion() {
        const texto = sessionStorage.getItem(this.claveSesion);
        if (texto === null) return null;
        return JSON.parse(texto);
    },

    guardarSesion(usuario) {
        const sesion = { idUsuario: usuario.id, nombre: usuario.nombre, correo: usuario.correo };
        sessionStorage.setItem(this.claveSesion, JSON.stringify(sesion));
    },

    // Regresa el texto del error, o "" si todo salió bien
    registrar(nombre, correo, contrasena) {
        const usuarios = this.leerUsuarios();
        const correoLimpio = correo.trim().toLowerCase();

        for (let i = 0; i < usuarios.length; i++) {
            if (usuarios[i].correo === correoLimpio) {
                return "Ya existe una cuenta con ese correo en este navegador.";
            }
        }

        const usuario = {
            id: "u" + Date.now(),
            nombre: nombre.trim(),
            correo: correoLimpio,
            contrasena: contrasena
        };
        usuarios.push(usuario);
        localStorage.setItem(this.claveUsuarios, JSON.stringify(usuarios));
        this.guardarSesion(usuario);
        return "";
    },

    // Regresa el texto del error, o "" si los datos son correctos
    iniciarSesion(correo, contrasena) {
        const usuarios = this.leerUsuarios();
        const correoLimpio = correo.trim().toLowerCase();

        for (let i = 0; i < usuarios.length; i++) {
            if (usuarios[i].correo === correoLimpio) {
                if (usuarios[i].contrasena !== contrasena) {
                    return "La contraseña no es correcta.";
                }
                this.guardarSesion(usuarios[i]);
                return "";
            }
        }
        return "No encontramos una cuenta con ese correo en este navegador.";
    },

    cerrarSesion() {
        sessionStorage.removeItem(this.claveSesion);
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

NodoAuth.actualizarEnlaces();
