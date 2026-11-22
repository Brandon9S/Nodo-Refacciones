-- ampliar_contrasena.sql
-- Solo para una base que ya existía desde la ADA 4/5 (en XAMPP o en InfinityFree).
-- Amplía la columna de la contraseña para guardar el hash de password_hash().
-- Las cuentas viejas siguen funcionando: al iniciar sesión, su contraseña se cifra sola.
ALTER TABLE usuarios MODIFY contrasena VARCHAR(255) NOT NULL;
