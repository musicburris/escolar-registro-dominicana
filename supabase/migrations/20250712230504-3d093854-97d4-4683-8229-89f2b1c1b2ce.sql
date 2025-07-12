
-- Insertar usuarios de prueba en auth.users y profiles
-- Nota: Estas son credenciales de DEMOSTRACIÓN, cambiar en producción

-- 1. Director/Administrador
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'director@ejemplo.edu.do',
  crypt('demo123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"firstName": "Director", "lastName": "Escuela"}',
  false,
  '',
  '',
  '',
  ''
);

-- 2. Profesor
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'profesor@ejemplo.edu.do',
  crypt('demo123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"firstName": "María", "lastName": "Docente"}',
  false,
  '',
  '',
  '',
  ''
);

-- 3. Auxiliar
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'auxiliar@ejemplo.edu.do',
  crypt('demo123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"firstName": "Carlos", "lastName": "Auxiliar"}',
  false,
  '',
  '',
  '',
  ''
);

-- 4. Padre/Tutor
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'padre@ejemplo.com',
  crypt('demo123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"firstName": "Ana", "lastName": "Madre"}',
  false,
  '',
  '',
  '',
  ''
);

-- 5. Estudiante (con RNE como identificador)
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  '202300001',
  crypt('demo123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"firstName": "Juan", "lastName": "Estudiante"}',
  false,
  '',
  '',
  '',
  ''
);

-- Crear perfiles correspondientes (se crearán automáticamente por el trigger handle_new_user)
-- Pero vamos a actualizar los roles específicos

-- Actualizar rol del director
UPDATE public.profiles 
SET role = 'admin', first_name = 'Director', last_name = 'Escuela'
WHERE id = (SELECT id FROM auth.users WHERE email = 'director@ejemplo.edu.do');

-- Actualizar rol del profesor
UPDATE public.profiles 
SET role = 'teacher', first_name = 'María', last_name = 'Docente'
WHERE id = (SELECT id FROM auth.users WHERE email = 'profesor@ejemplo.edu.do');

-- Actualizar rol del auxiliar
UPDATE public.profiles 
SET role = 'auxiliary', first_name = 'Carlos', last_name = 'Auxiliar'
WHERE id = (SELECT id FROM auth.users WHERE email = 'auxiliar@ejemplo.edu.do');

-- Actualizar rol del padre/tutor
UPDATE public.profiles 
SET role = 'parent', first_name = 'Ana', last_name = 'Madre'
WHERE id = (SELECT id FROM auth.users WHERE email = 'padre@ejemplo.com');

-- Actualizar rol del estudiante
UPDATE public.profiles 
SET role = 'student', first_name = 'Juan', last_name = 'Estudiante'
WHERE id = (SELECT id FROM auth.users WHERE email = '202300001');
