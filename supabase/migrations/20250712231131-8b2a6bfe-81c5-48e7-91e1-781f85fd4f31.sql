-- Actualizar contraseñas para los usuarios de prueba usando el hash correcto
-- El hash para 'demo123' que funciona con Supabase auth

UPDATE auth.users 
SET encrypted_password = '$2a$10$N9qo8uLOickgx2ZMRZoMye/Xr8y8Bh8qWYNlX5D8F3yUZjAhfFVD.' 
WHERE email IN ('director@ejemplo.edu.do', 'profesor@ejemplo.edu.do', 'auxiliar@ejemplo.edu.do', 'padre@ejemplo.com', '202300001');