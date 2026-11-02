"use strict";

// Muestra las 3 publicaciones más recientes en el inicio
const contenedorRecientes = document.querySelector("#publicacionesRecientes");
const recientes = NodoApp.obtenerPublicaciones().slice(0, 3);
contenedorRecientes.innerHTML = recientes.map((p) => NodoApp.crearTarjeta(p)).join("");
