
-- Crear tabla de perfiles de usuario
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'auxiliary', 'parent', 'student')),
  is_active BOOLEAN DEFAULT true,
  assigned_sections TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de logs de actividad
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  user_name TEXT,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de configuraciones de seguridad
CREATE TABLE public.security_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  two_factor_auth BOOLEAN DEFAULT false,
  session_timeout INTEGER DEFAULT 30,
  ip_whitelist BOOLEAN DEFAULT false,
  allowed_ips TEXT[] DEFAULT '{}',
  location_restriction BOOLEAN DEFAULT false,
  activity_logging BOOLEAN DEFAULT true,
  login_attempts INTEGER DEFAULT 5,
  require_strong_password BOOLEAN DEFAULT true,
  password_expiry INTEGER DEFAULT 90,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Crear tabla de configuraciones visuales
CREATE TABLE public.visual_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_global BOOLEAN DEFAULT false,
  primary_color TEXT DEFAULT '#0D3B66',
  secondary_color TEXT DEFAULT '#137547',
  accent_color TEXT DEFAULT '#DC2626',
  font_family TEXT DEFAULT 'Inter',
  font_size TEXT DEFAULT '16',
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  logo_url TEXT,
  site_name TEXT DEFAULT 'Sistema Educativo MINERD',
  subtitle TEXT DEFAULT 'Gestión Escolar Integral',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visual_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Los usuarios pueden ver su propio perfil" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Los administradores pueden ver todos los perfiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para activity_logs
CREATE POLICY "Los administradores pueden ver todos los logs" ON public.activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Los usuarios pueden crear logs de actividad" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para security_settings
CREATE POLICY "Solo administradores pueden ver configuraciones de seguridad" ON public.security_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para visual_settings
CREATE POLICY "Los usuarios pueden ver configuraciones visuales" ON public.visual_settings
  FOR SELECT USING (
    is_global = true OR user_id = auth.uid()
  );

CREATE POLICY "Los usuarios pueden crear/actualizar sus configuraciones visuales" ON public.visual_settings
  FOR ALL USING (user_id = auth.uid());

-- Función para manejar nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'firstName',
    NEW.raw_user_meta_data->>'lastName',
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insertar configuración de seguridad por defecto
INSERT INTO public.security_settings (
  two_factor_auth,
  session_timeout,
  ip_whitelist,
  location_restriction,
  activity_logging,
  login_attempts,
  require_strong_password,
  password_expiry
) VALUES (
  false,
  30,
  false,
  false,
  true,
  5,
  true,
  90
);

-- Insertar configuración visual global por defecto
INSERT INTO public.visual_settings (
  is_global,
  primary_color,
  secondary_color,
  accent_color,
  font_family,
  font_size,
  theme,
  site_name,
  subtitle
) VALUES (
  true,
  '#0D3B66',
  '#137547',
  '#DC2626',
  'Inter',
  '16',
  'light',
  'Sistema Educativo MINERD',
  'Gestión Escolar Integral'
);
