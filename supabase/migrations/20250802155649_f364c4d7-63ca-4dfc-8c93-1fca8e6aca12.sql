-- Crear función para insertar usuarios de demostración en auth.users
-- Nota: Normalmente esto se hace através del signup, pero para demostración lo hacemos directamente

-- Insertar usuarios de demostración en auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES 
-- Director/Admin
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'director@ejemplo.edu.do',
  crypt('demo123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"firstName": "Director", "lastName": "Sistema", "role": "admin"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
),
-- Profesor
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'profesor@ejemplo.edu.do',
  crypt('demo123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"firstName": "Profesor", "lastName": "Demostración", "role": "teacher"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
),
-- Auxiliar
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'auxiliar@ejemplo.edu.do',
  crypt('demo123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"firstName": "Auxiliar", "lastName": "Administrativo", "role": "auxiliary"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
),
-- Padre/Tutor
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'padre@ejemplo.com',
  crypt('demo123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"firstName": "Padre", "lastName": "Familia", "role": "parent"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
),
-- Estudiante
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  '202300001',
  crypt('demo123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"firstName": "Estudiante", "lastName": "Demo", "role": "student"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;