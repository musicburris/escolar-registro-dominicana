-- Insertar usuario administrador de ejemplo
-- Primero insertamos en auth.users (esto normalmente se hace a través del signup)
-- Pero para propósitos de demostración, insertaremos directamente

-- Insertar en la tabla profiles un usuario administrador
INSERT INTO public.profiles (
  id,
  first_name,
  last_name,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Administrador',
  'Sistema',
  'admin',
  true,
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Crear políticas RLS para la tabla profiles si no existen
CREATE POLICY IF NOT EXISTS "Los usuarios pueden ver su propio perfil" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Los usuarios pueden insertar su propio perfil" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Habilitar RLS en profiles si no está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Crear política para que los admins puedan ver todos los perfiles
CREATE POLICY IF NOT EXISTS "Los administradores pueden ver todos los perfiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );