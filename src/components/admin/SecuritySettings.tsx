import React, { useState } from 'react';
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

  const [activityLogs] = useState([
    {
      id: '1',
      user: 'Juan Pérez',
      action: 'Inicio de sesión',
      timestamp: '2024-01-15 09:30:25',
      ip: '192.168.1.100',
      status: 'success'
    },
    {
      id: '2',
      user: 'María García',
      action: 'Modificó asistencia',
      timestamp: '2024-01-15 09:15:45',
      ip: '192.168.1.101',
      status: 'success'
    },
    {
      id: '3',
      user: 'Desconocido',
      action: 'Intento de login fallido',
      timestamp: '2024-01-15 08:45:12',
      ip: '203.45.67.89',
      status: 'failed'
    }
  ]);

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSecuritySettings({
      ...securitySettings,
      [key]: value
    });
  };

  const handleSaveSettings = () => {
    // Guardar configuraciones de seguridad
    localStorage.setItem('securitySettings', JSON.stringify(securitySettings));
    toast({
      title: "Configuración de seguridad actualizada",
      description: "Los cambios han sido aplicados al sistema.",
    });
  };

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

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> La implementación completa de 2FA y gestión de contraseñas 
              requiere integración con Supabase para autenticación segura.
            </AlertDescription>
          </Alert>
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

          {securitySettings.activityLogging && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Actividad Reciente</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {activityLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {log.status === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{log.user}</p>
                        <p className="text-xs text-gray-500">{log.action}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{log.timestamp}</p>
                      <p className="text-xs text-gray-400">{log.ip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Alert>
            <Eye className="h-4 w-4" />
            <AlertDescription>
              Los logs completos de actividades requieren integración con Supabase 
              para almacenamiento persistente y análisis avanzado.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Save Settings */}
      <Card>
        <CardContent className="pt-6">
          <Button onClick={handleSaveSettings} className="bg-minerd-blue hover:bg-blue-700">
            <Shield className="w-4 h-4 mr-2" />
            Aplicar Configuración de Seguridad
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;