
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Lock, 
  Activity, 
  Clock,
  MapPin,
  Eye,
  AlertTriangle,
  CheckCircle,
  UserCheck
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const SecuritySettings: React.FC = () => {
  const { session } = useAuth();
  const { logActivity } = useActivityLogger();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30',
    ipWhitelist: false,
    locationRestriction: false,
    activityLogging: true,
    loginAttempts: '5',
    requireStrongPassword: true,
    passwordExpiry: '90'
  });

  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  // Cargar configuraciones desde Supabase
  useEffect(() => {
    const loadSettings = async () => {
      try {
        if (!session) return;

        const response = await fetch('https://afkieiblgauopgtuzqdp.supabase.co/functions/v1/get-security-settings', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setSecuritySettings({
              twoFactorAuth: result.data.two_factor_auth,
              sessionTimeout: result.data.session_timeout?.toString() || '30',
              ipWhitelist: result.data.ip_whitelist,
              locationRestriction: result.data.location_restriction,
              activityLogging: result.data.activity_logging,
              loginAttempts: result.data.login_attempts?.toString() || '5',
              requireStrongPassword: result.data.require_strong_password,
              passwordExpiry: result.data.password_expiry?.toString() || '90'
            });
          }
        }

        // Load activity logs
        const logsResponse = await fetch('https://afkieiblgauopgtuzqdp.supabase.co/functions/v1/get-activity-logs', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (logsResponse.ok) {
          const logsResult = await logsResponse.json();
          if (logsResult.success && logsResult.data) {
            setActivityLogs(logsResult.data.slice(0, 10)); // Show last 10 logs
          }
        }
      } catch (error) {
        console.error('Error loading security settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [session]);

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSecuritySettings({
      ...securitySettings,
      [key]: value
    });
  };

  const handleSaveSettings = async () => {
    try {
      if (!session) {
        toast({
          title: "Error",
          description: "Debe estar autenticado para guardar configuraciones.",
          variant: "destructive"
        });
        return;
      }

      setIsSaving(true);

      const response = await fetch('https://afkieiblgauopgtuzqdp.supabase.co/functions/v1/save-security-settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          twoFactorAuth: securitySettings.twoFactorAuth,
          sessionTimeout: parseInt(securitySettings.sessionTimeout),
          ipWhitelist: securitySettings.ipWhitelist,
          locationRestriction: securitySettings.locationRestriction,
          activityLogging: securitySettings.activityLogging,
          loginAttempts: parseInt(securitySettings.loginAttempts),
          requireStrongPassword: securitySettings.requireStrongPassword,
          passwordExpiry: parseInt(securitySettings.passwordExpiry)
        }),
      });

      if (response.ok) {
        toast({
          title: "Configuración de seguridad actualizada",
          description: "Los cambios han sido aplicados al sistema.",
        });
        logActivity('Configuración de seguridad actualizada');
      } else {
        throw new Error('Error al guardar configuraciones');
      }
    } catch (error) {
      console.error('Error saving security settings:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar las configuraciones de seguridad.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-minerd-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando configuraciones de seguridad...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Authentication Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="mr-2 h-5 w-5" />
            Configuración de Autenticación
          </CardTitle>
          <CardDescription>
            Controla los métodos de autenticación y seguridad de acceso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Autenticación de Dos Factores (2FA)</Label>
                <p className="text-sm text-gray-500">Requiere código adicional para iniciar sesión</p>
              </div>
              <Switch
                checked={securitySettings.twoFactorAuth}
                onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Contraseñas Seguras</Label>
                <p className="text-sm text-gray-500">Requiere contraseñas con mayúsculas, números y símbolos</p>
              </div>
              <Switch
                checked={securitySettings.requireStrongPassword}
                onCheckedChange={(checked) => handleSettingChange('requireStrongPassword', checked)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Intentos de Login Máximos</Label>
                <Select 
                  value={securitySettings.loginAttempts} 
                  onValueChange={(value) => handleSettingChange('loginAttempts', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 intentos</SelectItem>
                    <SelectItem value="5">5 intentos</SelectItem>
                    <SelectItem value="10">10 intentos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Expiración de Contraseña (días)</Label>
                <Select 
                  value={securitySettings.passwordExpiry} 
                  onValueChange={(value) => handleSettingChange('passwordExpiry', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 días</SelectItem>
                    <SelectItem value="60">60 días</SelectItem>
                    <SelectItem value="90">90 días</SelectItem>
                    <SelectItem value="never">Nunca</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Gestión de Sesiones
          </CardTitle>
          <CardDescription>
            Controla el tiempo de vida de las sesiones de usuario
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tiempo de Inactividad (minutos)</Label>
            <Select 
              value={securitySettings.sessionTimeout} 
              onValueChange={(value) => handleSettingChange('sessionTimeout', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutos</SelectItem>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="60">1 hora</SelectItem>
                <SelectItem value="120">2 horas</SelectItem>
                <SelectItem value="never">Sin límite</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Access Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            Control de Acceso
          </CardTitle>
          <CardDescription>
            Restricciones de ubicación y direcciones IP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Lista Blanca de IPs</Label>
              <p className="text-sm text-gray-500">Solo permite acceso desde IPs autorizadas</p>
            </div>
            <Switch
              checked={securitySettings.ipWhitelist}
              onCheckedChange={(checked) => handleSettingChange('ipWhitelist', checked)}
            />
          </div>

          {securitySettings.ipWhitelist && (
            <div className="space-y-2">
              <Label>Direcciones IP Autorizadas</Label>
              <Input placeholder="192.168.1.0/24, 10.0.0.1" />
              <Button size="sm" variant="outline">Agregar IP</Button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Restricción Geográfica</Label>
              <p className="text-sm text-gray-500">Permite acceso solo desde ubicaciones específicas</p>
            </div>
            <Switch
              checked={securitySettings.locationRestriction}
              onCheckedChange={(checked) => handleSettingChange('locationRestriction', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Activity Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            Monitoreo de Actividad
          </CardTitle>
          <CardDescription>
            Registra y monitorea todas las actividades del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Registro de Actividades</Label>
              <p className="text-sm text-gray-500">Guarda un log de todas las acciones de los usuarios</p>
            </div>
            <Switch
              checked={securitySettings.activityLogging}
              onCheckedChange={(checked) => handleSettingChange('activityLogging', checked)}
            />
          </div>

          {securitySettings.activityLogging && activityLogs.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Actividad Reciente</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {activityLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">{log.user_name || log.user_email}</p>
                        <p className="text-xs text-gray-500">{log.action}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(log.created_at).toLocaleDateString('es-DO')}
                      </p>
                      <p className="text-xs text-gray-400">{log.ip_address || 'IP no disponible'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Settings */}
      <Card>
        <CardContent className="pt-6">
          <Button 
            onClick={handleSaveSettings} 
            className="bg-minerd-blue hover:bg-blue-700"
            disabled={isSaving}
          >
            <Shield className="w-4 h-4 mr-2" />
            {isSaving ? 'Guardando...' : 'Aplicar Configuración de Seguridad'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;
