"use strict";

// Muestra las 3 publicaciones más recientes en el inicio
const contenedorRecientes = document.querySelector("#publicacionesRecientes");
NodoApp.obtenerPublicaciones().then((publicaciones) => {
    const recientes = publicaciones.slice(0, 3);
    contenedorRecientes.innerHTML = recientes.map((p) => NodoApp.crearTarjeta(p)).join("");
});
