-- Create activity_logs table for system monitoring
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT,
  action TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create visual_settings table for UI customization
CREATE TABLE public.visual_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_global BOOLEAN DEFAULT false,
  primary_color TEXT DEFAULT '#1e40af',
  secondary_color TEXT DEFAULT '#059669',
  accent_color TEXT DEFAULT '#dc2626',
  font_family TEXT DEFAULT 'Inter',
  font_size TEXT DEFAULT '16',
  theme TEXT DEFAULT 'light',
  logo_url TEXT,
  site_name TEXT DEFAULT 'Sistema Educativo MINERD',
  subtitle TEXT DEFAULT 'Gestión Escolar Integral',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create security_settings table
CREATE TABLE public.security_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  two_factor_auth BOOLEAN DEFAULT false,
  session_timeout INTEGER DEFAULT 30,
  ip_whitelist BOOLEAN DEFAULT false,
  allowed_ips TEXT[],
  location_restriction BOOLEAN DEFAULT false,
  activity_logging BOOLEAN DEFAULT true,
  login_attempts INTEGER DEFAULT 5,
  require_strong_password BOOLEAN DEFAULT true,
  password_expiry INTEGER DEFAULT 90,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create module_settings table
CREATE TABLE public.module_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name TEXT NOT NULL UNIQUE,
  enabled BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create export_requests table for tracking export operations
CREATE TABLE public.export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL, -- 'attendance', 'students', 'grades', etc.
  format TEXT NOT NULL, -- 'pdf', 'excel', 'csv'
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  file_url TEXT,
  parameters JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Create backup_logs table
CREATE TABLE public.backup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  backup_type TEXT NOT NULL, -- 'full', 'incremental'
  status TEXT DEFAULT 'pending',
  file_url TEXT,
  file_size BIGINT,
  tables_included TEXT[],
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Enable Row Level Security on all tables
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visual_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activity_logs (admins can see all, users can see their own)
CREATE POLICY "view_activity_logs" ON public.activity_logs
FOR SELECT
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY "insert_activity_logs" ON public.activity_logs
FOR INSERT
WITH CHECK (true); -- Edge functions can insert logs

-- RLS Policies for visual_settings
CREATE POLICY "view_visual_settings" ON public.visual_settings
FOR SELECT
USING (user_id = auth.uid() OR is_global = true);

CREATE POLICY "manage_visual_settings" ON public.visual_settings
FOR ALL
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- RLS Policies for security_settings (admin only)
CREATE POLICY "admin_security_settings" ON public.security_settings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- RLS Policies for module_settings (admin only)
CREATE POLICY "admin_module_settings" ON public.module_settings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- RLS Policies for export_requests
CREATE POLICY "view_own_exports" ON public.export_requests
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "create_own_exports" ON public.export_requests
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- RLS Policies for backup_logs (admin only)
CREATE POLICY "admin_backup_logs" ON public.backup_logs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- Insert default module settings
INSERT INTO public.module_settings (module_name, enabled, settings) VALUES
('attendance', true, '{"teacherCanModify": true, "showHistory": true, "defaultPresent": true, "autoSave": false}'),
('exports', true, '{"allowPDF": true, "allowExcel": true, "requireApproval": false}'),
('customization', true, '{"teacherAccess": false, "studentAccess": false}'),
('statistics', true, '{"realTime": true, "teacherAccess": true, "detailedReports": true}'),
('users', true, '{"selfRegistration": false, "passwordReset": true, "profileEdit": true}');

-- Insert default security settings
INSERT INTO public.security_settings (
  two_factor_auth, session_timeout, ip_whitelist, location_restriction,
  activity_logging, login_attempts, require_strong_password, password_expiry
) VALUES (false, 30, false, false, true, 5, true, 90);

-- Create indexes for better performance
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_visual_settings_user_id ON public.visual_settings(user_id);
CREATE INDEX idx_export_requests_user_id ON public.export_requests(user_id);
CREATE INDEX idx_export_requests_status ON public.export_requests(status);
CREATE INDEX idx_backup_logs_created_at ON public.backup_logs(created_at DESC);