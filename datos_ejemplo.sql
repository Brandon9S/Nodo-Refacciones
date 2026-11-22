-- datos_ejemplo.sql (opcional)
-- Crea una cuenta de prueba y tres publicaciones para la demostración.
-- Requiere las tablas de database.sql.
--   Correo:     demo@nodo.com
--   Contraseña: demo12345   (se guarda como hash bcrypt, igual que las cuentas nuevas)

SET NAMES utf8mb4;

INSERT INTO usuarios (nombre, correo, contrasena) VALUES
  ('Refacciones Demo', 'demo@nodo.com', '$2y$10$XuJUrNebSjpsDdHuZWiS9uwJKG/g3Tf0RUs/GYDJJFuI930o/E8LW');

SET @demo = LAST_INSERT_ID();

INSERT INTO publicaciones (id_usuario, titulo, categoria, condicion, precio, codigo_pieza, descripcion,
                           marca_moto, modelo_moto, anio_moto, version_moto, color_moto, modalidad,
                           vendedor, contacto, enlace_externo) VALUES
  (@demo, 'Kit de arrastre 428 (cadena y sprockets)', 'Motor', 'Nuevo', 690.00, 'KA-428-120',
   'Kit completo de cadena 428 de 120 eslabones con sprocket delantero y trasero. Nuevo en caja.',
   'Italika', 'FT150', 2022, 'TS', '', 'comercio', 'Refacciones Demo', 'demo@nodo.com', ''),
  (@demo, 'Balatas delanteras de disco', 'Frenos', 'Nuevo', 180.00, '',
   'Juego de balatas delanteras semimetálicas, compatibles con disco de 220 mm.',
   'Bajaj', 'Pulsar NS125', 2023, '', '', 'directa', 'Refacciones Demo', '9981234567', ''),
  (@demo, 'Faro delantero LED', 'Eléctrico', 'Usado', 450.00, '',
   'Faro LED usado en buen estado, sin golpes ni humedad. Se probó antes de retirarlo.',
   'Honda', 'CB190R', 2021, '', 'Negro', 'directa', 'Refacciones Demo', 'demo@nodo.com', '');
