"use strict";

const cuerpoCarrito = document.querySelector("#cuerpoCarrito");
const zonaCarrito = document.querySelector("#zonaCarrito");
const carritoVacio = document.querySelector("#carritoVacio");
const sinSesion = document.querySelector("#carritoSinSesion");
const nombreUsuario = document.querySelector("#nombreUsuarioCarrito");
const totalCarrito = document.querySelector("#totalCarrito");
const avisoCarrito = document.querySelector("#avisoCarrito");

// Muestra un mensaje arriba de la tabla
function mostrarAviso(texto, tipo) {
    avisoCarrito.textContent = texto;
    avisoCarrito.className = "alert alert-" + tipo;
}

// Pide el carrito al servidor y lo dibuja en la tabla
async function cargarCarrito() {
    const respuesta = await NodoApp.pedirJSON("php/carrito_listar.php");

    // Si no hay sesión iniciada, solo se muestra el aviso para entrar
    if (!respuesta.ok) {
        zonaCarrito.classList.add("d-none");
        carritoVacio.classList.add("d-none");
        sinSesion.classList.remove("d-none");
        return;
    }

    sinSesion.classList.add("d-none");
    nombreUsuario.textContent = respuesta.usuario;   // nombre que viene de la sesión de PHP
    NodoAuth.mostrarContador(respuesta.piezas);

    if (respuesta.productos.length === 0) {
        zonaCarrito.classList.add("d-none");
        carritoVacio.classList.remove("d-none");
        return;
    }

    carritoVacio.classList.add("d-none");
    zonaCarrito.classList.remove("d-none");

    let filas = "";
    for (let i = 0; i < respuesta.productos.length; i++) {
        const p = respuesta.productos[i];
        const e = NodoApp.escaparHtml;
        filas += `
            <tr>
                <td>
                    <strong>${e(p.titulo)}</strong><br>
                    <small class="text-muted">${e(p.categoria)} · ${e(p.condicion)} · Vende: ${e(p.vendedor)}</small>
                </td>
                <td>${NodoApp.formatearPrecio(p.precio)}</td>
                <td>
                    <input class="form-control form-control-sm cantidad-carrito" type="number" min="1" max="99" value="${p.cantidad}" data-id="${p.id}" aria-label="Cantidad de ${e(p.titulo)}">
                </td>
                <td>${NodoApp.formatearPrecio(p.subtotal)}</td>
                <td class="text-nowrap">
                    <button class="btn btn-outline-light btn-sm" type="button" data-accion="modificar" data-id="${p.id}">Actualizar</button>
                    <button class="btn btn-outline-light btn-sm" type="button" data-accion="eliminar" data-id="${p.id}">Quitar</button>
                </td>
            </tr>`;
    }
    cuerpoCarrito.innerHTML = filas;
    totalCarrito.textContent = NodoApp.formatearPrecio(respuesta.total);
}

// Un solo listener para todos los botones de la tabla
cuerpoCarrito.addEventListener("click", async (evento) => {
    const boton = evento.target.closest("button");
    if (!boton) return;

    const id = Number(boton.dataset.id);

    if (boton.dataset.accion === "modificar") {
        // Buscamos el campo de cantidad de esa misma fila
        const campo = boton.closest("tr").querySelector(".cantidad-carrito");
        const cantidad = Number(campo.value);

        // Validación sencilla: entero entre 1 y 99
        if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 99) {
            mostrarAviso("La cantidad debe ser un número entero entre 1 y 99.", "danger");
            return;
        }

        const respuesta = await NodoApp.pedirJSON("php/carrito_modificar.php", { id: id, cantidad: cantidad });
        if (!respuesta.ok) {
            mostrarAviso(respuesta.error, "danger");
            return;
        }
        mostrarAviso("Cantidad actualizada.", "success");
        cargarCarrito();
    }

    if (boton.dataset.accion === "eliminar") {
        const respuesta = await NodoApp.pedirJSON("php/carrito_eliminar.php", { id: id });
        if (!respuesta.ok) {
            mostrarAviso(respuesta.error, "danger");
            return;
        }
        mostrarAviso("Refacción quitada del carrito.", "success");
        cargarCarrito();
    }
});

cargarCarrito();
