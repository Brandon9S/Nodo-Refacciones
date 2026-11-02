"use strict";

// Fecha de hoy en la página de inicio
const elementoFecha = document.querySelector("#fechaActual");
if (elementoFecha) {
    elementoFecha.textContent = new Date().toLocaleDateString("es-MX", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
    });
}

// Año actual en el pie de página
const elementosAnio = document.querySelectorAll(".current-year");
for (let i = 0; i < elementosAnio.length; i++) {
    elementosAnio[i].textContent = new Date().getFullYear();
}

// Calculadora
const calculadora = document.querySelector("#calculadora");
if (calculadora) {
    const pantalla = document.querySelector("#calculadoraPantalla");
    let actual = "0";           // número que se está escribiendo
    let anterior = null;        // primer número de la operación
    let operador = null;        // operación pendiente: + - * /
    let empezarNuevo = false;   // true cuando el siguiente dígito empieza un número nuevo

    function mostrar() {
        pantalla.textContent = actual;
    }

    function agregarDigito(digito) {
        if (empezarNuevo || actual === "0" || actual === "Error") {
            actual = digito;
            empezarNuevo = false;
        } else if (actual.length < 14) {
            actual = actual + digito;
        }
        mostrar();
    }

    function agregarPunto() {
        if (empezarNuevo || actual === "Error") {
            actual = "0.";
            empezarNuevo = false;
        } else if (!actual.includes(".")) {
            actual = actual + ".";
        }
        mostrar();
    }

    // Hace la operación pendiente y regresa el resultado como texto
    function resolver() {
        const b = Number(actual);
        let resultado = 0;

        if (operador === "+") resultado = anterior + b;
        if (operador === "-") resultado = anterior - b;
        if (operador === "*") resultado = anterior * b;
        if (operador === "/") {
            if (b === 0) return "Error";
            resultado = anterior / b;
        }

        // toFixed quita errores como 0.30000000000000004
        return String(parseFloat(resultado.toFixed(10)));
    }

    function presionarOperador(nuevoOperador) {
        if (actual === "Error") return;

        // Si ya había una operación pendiente (2 + 3 + ...), se resuelve primero
        if (operador !== null && !empezarNuevo) {
            actual = resolver();
            if (actual === "Error") {
                anterior = null;
                operador = null;
                empezarNuevo = true;
                mostrar();
                return;
            }
        }

        anterior = Number(actual);
        operador = nuevoOperador;
        empezarNuevo = true;
        mostrar();
    }

    function presionarIgual() {
        if (operador === null || empezarNuevo) return;

        actual = resolver();
        anterior = null;
        operador = null;
        empezarNuevo = true;
        mostrar();
    }

    function borrarTodo() {
        actual = "0";
        anterior = null;
        operador = null;
        empezarNuevo = false;
        mostrar();
    }

    function borrarUltimo() {
        if (empezarNuevo || actual === "Error") return;
        actual = actual.slice(0, -1);
        if (actual === "" || actual === "-") actual = "0";
        mostrar();
    }

    function cambiarSigno() {
        if (actual === "0" || actual === "Error") return;
        if (actual.startsWith("-")) {
            actual = actual.slice(1);
        } else {
            actual = "-" + actual;
        }
        mostrar();
    }

    // Un solo listener para todos los botones: cada uno trae su acción en data-*
    calculadora.addEventListener("click", (evento) => {
        const boton = evento.target.closest("button");
        if (!boton) return;

        if (boton.dataset.calculatorDigit !== undefined) {
            agregarDigito(boton.dataset.calculatorDigit);
        } else if (boton.dataset.calculatorOperator) {
            presionarOperador(boton.dataset.calculatorOperator);
        } else if (boton.dataset.calculatorAction === "decimal") {
            agregarPunto();
        } else if (boton.dataset.calculatorAction === "equals") {
            presionarIgual();
        } else if (boton.dataset.calculatorAction === "clear") {
            borrarTodo();
        } else if (boton.dataset.calculatorAction === "backspace") {
            borrarUltimo();
        } else if (boton.dataset.calculatorAction === "sign") {
            cambiarSigno();
        }
    });

    // Teclado: números, operadores, Enter, Backspace y Escape
    document.addEventListener("keydown", (evento) => {
        if (evento.target.matches("input, textarea, select")) return;
        if (evento.ctrlKey || evento.altKey || evento.metaKey) return;

        const tecla = evento.key;
        if ("0123456789".includes(tecla)) {
            agregarDigito(tecla);
        } else if (tecla === "." || tecla === ",") {
            agregarPunto();
        } else if (["+", "-", "*", "/"].includes(tecla)) {
            presionarOperador(tecla);
        } else if (tecla === "Enter" || tecla === "=") {
            evento.preventDefault();
            presionarIgual();
        } else if (tecla === "Backspace") {
            borrarUltimo();
        } else if (tecla === "Escape") {
            borrarTodo();
        }
    });

    mostrar();
}

// Funciones compartidas por las páginas que muestran publicaciones
const NodoApp = {
    claveGuardadas: "nodoPublicaciones",

    // Publicaciones que crea el usuario (se guardan en LocalStorage)
    leerGuardadas() {
        const texto = localStorage.getItem(this.claveGuardadas);
        if (texto === null) return [];
        return JSON.parse(texto);
    },

    guardar(lista) {
        localStorage.setItem(this.claveGuardadas, JSON.stringify(lista));
    },

    // Publicaciones guardadas + publicaciones de ejemplo
    obtenerPublicaciones() {
        return this.leerGuardadas().concat(publicacionesEjemplo);
    },

    // Cambia símbolos como < y & por texto seguro para mostrarlos en la página
    escaparHtml(texto) {
        return String(texto)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    },

    // Revisa de forma sencilla si un texto parece un correo: algo@dominio.com
    esCorreo(texto) {
        const arroba = texto.indexOf("@");
        const punto = texto.lastIndexOf(".");
        return arroba > 0 && punto > arroba + 1 && punto < texto.length - 1 && !texto.includes(" ");
    },

    // Muestra el mensaje de error de un campo, o lo quita si el mensaje es ""
    // Regresa true si el campo está bien
    mostrarError(campo, mensaje) {
        const aviso = campo.parentElement.querySelector(".invalid-feedback");
        if (mensaje === "") {
            campo.classList.remove("is-invalid");
            aviso.classList.remove("d-block");
            return true;
        }
        campo.classList.add("is-invalid");
        aviso.textContent = mensaje;
        aviso.classList.add("d-block");
        return false;
    },

    formatearPrecio(valor) {
        return "$" + Number(valor).toLocaleString("es-MX", { minimumFractionDigits: 2 });
    },

    nombreModalidad(modalidad) {
        if (modalidad === "directa") return "Contacto directo";
        if (modalidad === "comercio") return "Comercio";
        if (modalidad === "externa") return "Enlace externo";
        return "Publicación";
    },

    // Convierte el contacto en enlace de correo o de teléfono
    enlaceContacto(contacto) {
        const texto = contacto.trim();
        if (texto.includes("@")) return "mailto:" + texto;
        const digitos = texto.replace(/\D/g, "");
        if (digitos.length >= 8) return "tel:" + digitos;
        return "";
    },

    // Arma el HTML de una tarjeta de publicación
    crearTarjeta(p) {
        const e = this.escaparHtml;
        const enlaceContacto = this.enlaceContacto(p.contacto);

        let accion = "";
        if (p.modalidad === "externa" && p.enlace !== "") {
            accion = `<a class="btn btn-outline-light btn-sm" href="${e(p.enlace)}" target="_blank" rel="noopener noreferrer">Ver publicación ↗</a>`;
        } else if (enlaceContacto !== "") {
            accion = `<a class="btn btn-outline-light btn-sm" href="${e(enlaceContacto)}">Contactar vendedor</a>`;
        } else {
            accion = `<span class="small text-muted">Contacto no disponible</span>`;
        }

        let nota = "";
        if (p.ejemplo) {
            nota = `<small class="demo-note">Publicación demostrativa</small>`;
        }

        return `
            <div class="col-md-6 col-xl-4">
                <article class="listing-card h-100">
                    <div class="listing-image-wrap">
                        <img src="${e(p.imagen)}" alt="Imagen ilustrativa de ${e(p.titulo)}" class="listing-image">
                        <span class="listing-category">${e(p.categoria)}</span>
                    </div>
                    <div class="listing-body">
                        <div class="d-flex justify-content-between gap-2 align-items-start"><h3>${e(p.titulo)}</h3><span class="condition-tag">${e(p.condicion)}</span></div>
                        <p class="listing-fit">${e(p.marca)} · ${e(p.modelo)} · ${e(p.anio)}</p>
                        <p class="listing-description">${e(p.descripcion)}</p>
                        <div class="listing-meta"><span>${e(this.nombreModalidad(p.modalidad))}</span><span>${e(p.vendedor)}</span></div>
                        <div class="listing-bottom"><strong>${this.formatearPrecio(p.precio)}</strong>${accion}</div>
                        ${nota}
                    </div>
                </article>
            </div>`;
    }
};
