import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Monitor, 
  Calendar, 
  Download, 
  Settings, 
  BarChart3,
  Users,
  Eye,
  EyeOff,
  Edit,
  Lock,
  Unlock,
  CheckSquare,
  Info
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ModuleControl: React.FC = () => {
  const [moduleSettings, setModuleSettings] = useState({
    attendance: {
      enabled: true,
      teacherCanModify: true,
      showHistory: true,
      defaultPresent: true,
      autoSave: false
    },
    exports: {
      enabled: true,
      allowPDF: true,
      allowExcel: true,
      requireApproval: false
    },
    statistics: {
      enabled: true,
      realTime: true,
      teacherAccess: true,
      detailedReports: true
    },
    users: {
      enabled: true,
      selfRegistration: false,
      passwordReset: true,
      profileEdit: true
    }
  });

  const handleModuleToggle = (module: string, setting: string, value: boolean) => {
    setModuleSettings(prev => ({
      ...prev,
      [module]: {
        ...prev[module as keyof typeof prev],
        [setting]: value
      }
    }));
  };

  const handleSaveSettings = () => {
    localStorage.setItem('moduleSettings', JSON.stringify(moduleSettings));
    toast({
      title: "Configuración de módulos actualizada",
      description: "Los cambios han sido aplicados al sistema.",
    });
  };

  const getModuleStatus = (enabled: boolean) => (
    <Badge variant={enabled ? "default" : "secondary"}>
      {enabled ? "Activo" : "Inactivo"}
    </Badge>
  );

  return (
    <div className="space-y-6">
      {/* Attendance Module */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Módulo de Asistencia
            </div>
            {getModuleStatus(moduleSettings.attendance.enabled)}
          </CardTitle>
          <CardDescription>
            Controla la funcionalidad del sistema de pase de lista
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Activar Módulo</Label>
              <p className="text-sm text-gray-500">Habilita/deshabilita todo el sistema de asistencia</p>
            </div>
            <Switch
              checked={moduleSettings.attendance.enabled}
              onCheckedChange={(checked) => handleModuleToggle('attendance', 'enabled', checked)}
            />
          </div>

          {moduleSettings.attendance.enabled && (
            <div className="space-y-4 pl-4 border-l-2 border-gray-200">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Docentes pueden modificar asistencia</Label>
                  <p className="text-sm text-gray-500">Permite editar asistencia después de enviarla</p>
                </div>
                <Switch
                  checked={moduleSettings.attendance.teacherCanModify}
                  onCheckedChange={(checked) => handleModuleToggle('attendance', 'teacherCanModify', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Mostrar historial de asistencia</Label>
                  <p className="text-sm text-gray-500">Los docentes pueden ver el historial completo</p>
                </div>
                <Switch
                  checked={moduleSettings.attendance.showHistory}
                  onCheckedChange={(checked) => handleModuleToggle('attendance', 'showHistory', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Marcar como presente por defecto</Label>
                  <p className="text-sm text-gray-500">El pase de lista inicia con todos presentes</p>
                </div>
                <Switch
                  checked={moduleSettings.attendance.defaultPresent}
                  onCheckedChange={(checked) => handleModuleToggle('attendance', 'defaultPresent', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Guardado automático</Label>
                  <p className="text-sm text-gray-500">Guarda automáticamente cada cambio</p>
                </div>
                <Switch
                  checked={moduleSettings.attendance.autoSave}
                  onCheckedChange={(checked) => handleModuleToggle('attendance', 'autoSave', checked)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Module */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Download className="mr-2 h-5 w-5" />
              Módulo de Exportaciones
            </div>
            {getModuleStatus(moduleSettings.exports.enabled)}
          </CardTitle>
          <CardDescription>
            Configura las opciones de exportación de datos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Activar Exportaciones</Label>
              <p className="text-sm text-gray-500">Habilita/deshabilita todas las exportaciones</p>
            </div>
            <Switch
              checked={moduleSettings.exports.enabled}
              onCheckedChange={(checked) => handleModuleToggle('exports', 'enabled', checked)}
            />
          </div>

          {moduleSettings.exports.enabled && (
            <div className="space-y-4 pl-4 border-l-2 border-gray-200">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Permitir exportación PDF</Label>
                  <p className="text-sm text-gray-500">Los usuarios pueden generar reportes en PDF</p>
                </div>
                <Switch
                  checked={moduleSettings.exports.allowPDF}
                  onCheckedChange={(checked) => handleModuleToggle('exports', 'allowPDF', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Permitir exportación Excel</Label>
                  <p className="text-sm text-gray-500">Los usuarios pueden generar archivos Excel</p>
                </div>
                <Switch
                  checked={moduleSettings.exports.allowExcel}
                  onCheckedChange={(checked) => handleModuleToggle('exports', 'allowExcel', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Requerir aprobación admin</Label>
                  <p className="text-sm text-gray-500">Las exportaciones necesitan aprobación</p>
                </div>
                <Switch
                  checked={moduleSettings.exports.requireApproval}
                  onCheckedChange={(checked) => handleModuleToggle('exports', 'requireApproval', checked)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Module */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Módulo de Estadísticas
            </div>
            {getModuleStatus(moduleSettings.statistics.enabled)}
          </CardTitle>
          <CardDescription>
            Configura la visualización de estadísticas y reportes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Activar Estadísticas</Label>
              <p className="text-sm text-gray-500">Habilita/deshabilita todos los reportes estadísticos</p>
            </div>
            <Switch
              checked={moduleSettings.statistics.enabled}
              onCheckedChange={(checked) => handleModuleToggle('statistics', 'enabled', checked)}
            />
          </div>

          {moduleSettings.statistics.enabled && (
            <div className="space-y-4 pl-4 border-l-2 border-gray-200">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Estadísticas en tiempo real</Label>
                  <p className="text-sm text-gray-500">Actualiza automáticamente los gráficos</p>
                </div>
                <Switch
                  checked={moduleSettings.statistics.realTime}
                  onCheckedChange={(checked) => handleModuleToggle('statistics', 'realTime', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Acceso para docentes</Label>
                  <p className="text-sm text-gray-500">Los docentes pueden ver estadísticas de sus secciones</p>
                </div>
                <Switch
                  checked={moduleSettings.statistics.teacherAccess}
                  onCheckedChange={(checked) => handleModuleToggle('statistics', 'teacherAccess', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Reportes detallados</Label>
                  <p className="text-sm text-gray-500">Incluye análisis avanzados y tendencias</p>
                </div>
                <Switch
                  checked={moduleSettings.statistics.detailedReports}
                  onCheckedChange={(checked) => handleModuleToggle('statistics', 'detailedReports', checked)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users Module */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Módulo de Usuarios
            </div>
            {getModuleStatus(moduleSettings.users.enabled)}
          </CardTitle>
          <CardDescription>
            Controla las funcionalidades relacionadas con la gestión de usuarios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Activar Gestión de Usuarios</Label>
              <p className="text-sm text-gray-500">Habilita/deshabilita toda la gestión de usuarios</p>
            </div>
            <Switch
              checked={moduleSettings.users.enabled}
              onCheckedChange={(checked) => handleModuleToggle('users', 'enabled', checked)}
            />
          </div>

          {moduleSettings.users.enabled && (
            <div className="space-y-4 pl-4 border-l-2 border-gray-200">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Auto-registro de usuarios</Label>
                  <p className="text-sm text-gray-500">Los usuarios pueden registrarse sin aprobación</p>
                </div>
                <Switch
                  checked={moduleSettings.users.selfRegistration}
                  onCheckedChange={(checked) => handleModuleToggle('users', 'selfRegistration', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Recuperación de contraseña</Label>
                  <p className="text-sm text-gray-500">Los usuarios pueden restablecer su contraseña</p>
                </div>
                <Switch
                  checked={moduleSettings.users.passwordReset}
                  onCheckedChange={(checked) => handleModuleToggle('users', 'passwordReset', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Edición de perfil</Label>
                  <p className="text-sm text-gray-500">Los usuarios pueden editar su información personal</p>
                </div>
                <Switch
                  checked={moduleSettings.users.profileEdit}
                  onCheckedChange={(checked) => handleModuleToggle('users', 'profileEdit', checked)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Nota:</strong> Los cambios en la configuración de módulos se aplicarán 
          inmediatamente. Algunas funcionalidades avanzadas requieren integración con Supabase.
        </AlertDescription>
      </Alert>

      {/* Save Settings */}
      <Card>
        <CardContent className="pt-6">
          <Button onClick={handleSaveSettings} className="bg-minerd-green hover:bg-green-700">
            <Settings className="w-4 h-4 mr-2" />
            Guardar Configuración de Módulos
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModuleControl;