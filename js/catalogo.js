"use strict";

const lista = document.querySelector("#listaPublicaciones");
const campoTexto = document.querySelector("#filtroTexto");
const campoCategoria = document.querySelector("#filtroCategoria");
const campoCondicion = document.querySelector("#filtroCondicion");
const campoMarca = document.querySelector("#filtroMarca");
const contador = document.querySelector("#contadorResultados");
const sinResultados = document.querySelector("#sinResultados");

// Si venimos del inicio, la URL trae la búsqueda: catalogo.html?q=espejo
const parametros = new URLSearchParams(window.location.search);
campoTexto.value = parametros.get("q") || "";
campoCategoria.value = parametros.get("categoria") || "";

function filtrar() {
    const texto = campoTexto.value.trim().toLowerCase();
    const categoria = campoCategoria.value;
    const condicion = campoCondicion.value;
    const marca = campoMarca.value.toLowerCase();

    // Se quedan las publicaciones que cumplen todos los filtros
    const resultado = NodoApp.obtenerPublicaciones().filter((p) => {
        const todoElTexto = (p.titulo + " " + p.categoria + " " + p.marca + " " + p.modelo + " "
            + p.anio + " " + p.descripcion + " " + p.vendedor).toLowerCase();

        const coincideTexto = todoElTexto.includes(texto);
        const coincideCategoria = categoria === "" || p.categoria === categoria;
        const coincideCondicion = condicion === "" || p.condicion === condicion;
        const coincideMarca = marca === "" || p.marca.toLowerCase() === marca;

        return coincideTexto && coincideCategoria && coincideCondicion && coincideMarca;
    });

    lista.innerHTML = resultado.map((p) => NodoApp.crearTarjeta(p)).join("");

    if (resultado.length === 1) {
        contador.textContent = "1 publicación encontrada";
    } else {
        contador.textContent = resultado.length + " publicaciones encontradas";
    }

    if (resultado.length === 0) {
        sinResultados.classList.remove("d-none");
    } else {
        sinResultados.classList.add("d-none");
    }
}

function limpiar() {
    campoTexto.value = "";
    campoCategoria.value = "";
    campoCondicion.value = "";
    campoMarca.value = "";
    filtrar();
}

campoTexto.addEventListener("input", filtrar);
campoCategoria.addEventListener("change", filtrar);
campoCondicion.addEventListener("change", filtrar);
campoMarca.addEventListener("change", filtrar);
document.querySelector("#limpiarFiltros").addEventListener("click", limpiar);
document.querySelector("#limpiarDesdeVacio").addEventListener("click", limpiar);

filtrar();
