-- Limpiar usuarios de prueba existentes y crear solo un administrador
-- Eliminar usuarios de prueba anteriores
DELETE FROM auth.users WHERE email IN ('director@ejemplo.edu.do', 'profesor@ejemplo.edu.do', 'auxiliar@ejemplo.edu.do', 'padre@ejemplo.com', '202300001');

-- Crear el usuario administrador principal
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'johnfamiliara@gmail.com',
    crypt('demo123123', gen_salt('bf')),
    now(),
    null,
    null,
    '{"provider":"email","providers":["email"]}',
    '{"firstName":"John","lastName":"Familiara","role":"admin"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
);

-- Verificar que el perfil se creará automáticamente por el trigger
-- (El trigger handle_new_user() debería crear el perfil automáticamente)