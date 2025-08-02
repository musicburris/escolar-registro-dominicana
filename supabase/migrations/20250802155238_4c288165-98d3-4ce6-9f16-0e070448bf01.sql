-- Crear política para que los usuarios puedan insertar su propio perfil
CREATE POLICY "Los usuarios pueden insertar su propio perfil" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Crear función para obtener el rol del usuario actual (evitar recursión en RLS)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Crear política para que los admins puedan hacer todo con perfiles
CREATE POLICY "Los administradores pueden gestionar todos los perfiles" ON public.profiles
  FOR ALL USING (public.get_current_user_role() = 'admin');