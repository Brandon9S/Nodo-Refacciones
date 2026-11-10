-- Base de datos de Nodo Refacciones (ADA 4)
-- Importar desde phpMyAdmin: pestaña "Importar" -> elegir este archivo -> Continuar.

CREATE DATABASE IF NOT EXISTS nodo_refacciones
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE nodo_refacciones;

-- Tabla 1: cuentas (formulario de cuenta.html)
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre     VARCHAR(70)  NOT NULL,
  correo     VARCHAR(100) NOT NULL UNIQUE,
  contrasena VARCHAR(100) NOT NULL
);

-- Tabla 2: refacciones publicadas (formulario de publicar.html)
-- Cada publicación pertenece a un usuario (clave foránea id_usuario)
CREATE TABLE IF NOT EXISTS publicaciones (
  id_publicacion    INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario        INT           NOT NULL,
  titulo            VARCHAR(90)   NOT NULL,
  categoria         VARCHAR(30)   NOT NULL,
  condicion         VARCHAR(20)   NOT NULL,
  precio            DECIMAL(10,2) NOT NULL,
  codigo_pieza      VARCHAR(50)   NOT NULL DEFAULT '',
  descripcion       VARCHAR(600)  NOT NULL,
  marca_moto        VARCHAR(50)   NOT NULL,
  modelo_moto       VARCHAR(70)   NOT NULL,
  anio_moto         SMALLINT      NOT NULL,
  version_moto      VARCHAR(50)   NOT NULL DEFAULT '',
  color_moto        VARCHAR(40)   NOT NULL DEFAULT '',
  modalidad         VARCHAR(10)   NOT NULL,
  vendedor          VARCHAR(70)   NOT NULL,
  contacto          VARCHAR(100)  NOT NULL,
  enlace_externo    VARCHAR(255)  NOT NULL DEFAULT '',
  fecha_publicacion DATETIME      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);
