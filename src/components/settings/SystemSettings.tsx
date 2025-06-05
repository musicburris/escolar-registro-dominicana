
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { 
  Settings, 
  School, 
  Calendar, 
  GraduationCap, 
  Users, 
  Bell, 
  Shield,
  Save,
  Upload,
  Info
} from 'lucide-react';

interface SystemConfig {
  centerInfo: {
    name: string;
    code: string;
    address: string;
    phone: string;
    email: string;
    director: string;
    viceDirector: string;
    logo?: string;
  };
  academicYear: {
    start: string;
    end: string;
    current: string;
    periods: number;
  };
  gradeSettings: {
    minPassingGrade: number;
    maxGrade: number;
    gradeScale: 'numeric' | 'letters';
  };
  attendance: {
    tardyMinutes: number;
    absenceThreshold: number;
    notifyParents: boolean;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    parentalNotifications: boolean;
  };
  security: {
    sessionTimeout: number;
    passwordRequirements: {
      minLength: number;
      requireUppercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
    };
  };
}

const SystemSettings: React.FC = () => {
  const { user } = useAuth();

  // Solo administradores pueden acceder
  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-20">
        <Shield className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-montserrat text-minerd-blue mb-4">
          Acceso Restringido
        </h2>
        <p className="text-gray-600 font-opensans">
          Solo los administradores pueden acceder a la configuración del sistema
        </p>
      </div>
    );
  }

  const [config, setConfig] = useState<SystemConfig>({
    centerInfo: {
      name: 'Centro Educativo Modelo',
      code: 'CEM001',
      address: 'Av. Principal #123, Santo Domingo',
      phone: '(809) 123-4567',
      email: 'info@centroeducativo.edu.do',
      director: 'Dr. Juan Pérez',
      viceDirector: 'Lic. María García'
    },
    academicYear: {
      start: '2024-08-15',
      end: '2025-06-15',
      current: '2024-2025',
      periods: 4
    },
    gradeSettings: {
      minPassingGrade: 70,
      maxGrade: 100,
      gradeScale: 'numeric'
    },
    attendance: {
      tardyMinutes: 15,
      absenceThreshold: 20,
      notifyParents: true
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      parentalNotifications: true
    },
    security: {
      sessionTimeout: 60,
      passwordRequirements: {
        minLength: 8,
        requireUppercase: true,
        requireNumbers: true,
        requireSymbols: false
      }
    }
  });

  const [activeTab, setActiveTab] = useState('center');

  const handleSave = () => {
    // Aquí se guardaría la configuración en la base de datos
    console.log('Saving configuration:', config);
    toast({
      title: "Configuración guardada",
      description: "Los cambios han sido guardados exitosamente",
    });
  };

  const updateConfig = (section: keyof SystemConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateNestedConfig = (section: keyof SystemConfig, subsection: string, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...(prev[section] as any)[subsection],
          [field]: value
        }
      }
    }));
  };

  const tabs = [
    { id: 'center', label: 'Centro Educativo', icon: School },
    { id: 'academic', label: 'Año Académico', icon: Calendar },
    { id: 'grades', label: 'Calificaciones', icon: GraduationCap },
    { id: 'attendance', label: 'Asistencia', icon: Users },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'security', label: 'Seguridad', icon: Shield }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-title font-montserrat text-minerd-blue">
            Configuración del Sistema
          </h1>
          <p className="text-body font-opensans text-gray-600">
            Configuración general del centro educativo
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Sistema Activo
          </Badge>
          <Button onClick={handleSave} className="bg-minerd-blue hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className={activeTab === tab.id ? "bg-minerd-blue" : ""}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Center Information */}
      {activeTab === 'center' && (
        <Card>
          <CardHeader>
            <CardTitle className="font-montserrat flex items-center">
              <School className="mr-2 h-5 w-5" />
              Información del Centro
            </CardTitle>
            <CardDescription>
              Datos generales del centro educativo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre del Centro</label>
                <Input
                  value={config.centerInfo.name}
                  onChange={(e) => updateConfig('centerInfo', 'name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Código del Centro</label>
                <Input
                  value={config.centerInfo.code}
                  onChange={(e) => updateConfig('centerInfo', 'code', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Dirección</label>
              <Textarea
                value={config.centerInfo.address}
                onChange={(e) => updateConfig('centerInfo', 'address', e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Teléfono</label>
                <Input
                  value={config.centerInfo.phone}
                  onChange={(e) => updateConfig('centerInfo', 'phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={config.centerInfo.email}
                  onChange={(e) => updateConfig('centerInfo', 'email', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Director(a)</label>
                <Input
                  value={config.centerInfo.director}
                  onChange={(e) => updateConfig('centerInfo', 'director', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subdirector(a)</label>
                <Input
                  value={config.centerInfo.viceDirector}
                  onChange={(e) => updateConfig('centerInfo', 'viceDirector', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Logo del Centro</label>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Logo
                </Button>
                <span className="text-sm text-gray-500">Formatos: PNG, JPG (máx. 2MB)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Academic Year */}
      {activeTab === 'academic' && (
        <Card>
          <CardHeader>
            <CardTitle className="font-montserrat flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Año Académico
            </CardTitle>
            <CardDescription>
              Configuración del calendario académico
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha de Inicio</label>
                <Input
                  type="date"
                  value={config.academicYear.start}
                  onChange={(e) => updateConfig('academicYear', 'start', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha de Finalización</label>
                <Input
                  type="date"
                  value={config.academicYear.end}
                  onChange={(e) => updateConfig('academicYear', 'end', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Año Actual</label>
                <Input
                  value={config.academicYear.current}
                  onChange={(e) => updateConfig('academicYear', 'current', e.target.value)}
                  placeholder="2024-2025"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Número de Períodos</label>
              <Select 
                value={config.academicYear.periods.toString()} 
                onValueChange={(value) => updateConfig('academicYear', 'periods', parseInt(value))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Períodos (Semestres)</SelectItem>
                  <SelectItem value="3">3 Períodos (Trimestres)</SelectItem>
                  <SelectItem value="4">4 Períodos (Bimestres)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grades Settings */}
      {activeTab === 'grades' && (
        <Card>
          <CardHeader>
            <CardTitle className="font-montserrat flex items-center">
              <GraduationCap className="mr-2 h-5 w-5" />
              Sistema de Calificaciones
            </CardTitle>
            <CardDescription>
              Configuración del sistema de evaluación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Calificación Mínima</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={config.gradeSettings.minPassingGrade}
                  onChange={(e) => updateConfig('gradeSettings', 'minPassingGrade', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Calificación Máxima</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={config.gradeSettings.maxGrade}
                  onChange={(e) => updateConfig('gradeSettings', 'maxGrade', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Escala de Calificación</label>
                <Select 
                  value={config.gradeSettings.gradeScale} 
                  onValueChange={(value) => updateConfig('gradeSettings', 'gradeScale', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="numeric">Numérica (0-100)</SelectItem>
                    <SelectItem value="letters">Letras (A, B, C, D, F)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Información importante</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Los cambios en el sistema de calificaciones afectarán todas las evaluaciones futuras. 
                    Las calificaciones existentes mantendrán su formato original.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance Settings */}
      {activeTab === 'attendance' && (
        <Card>
          <CardHeader>
            <CardTitle className="font-montserrat flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Configuración de Asistencia
            </CardTitle>
            <CardDescription>
              Parámetros para el control de asistencia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Minutos de Tardanza</label>
                <Input
                  type="number"
                  min="1"
                  max="60"
                  value={config.attendance.tardyMinutes}
                  onChange={(e) => updateConfig('attendance', 'tardyMinutes', parseInt(e.target.value))}
                />
                <p className="text-xs text-gray-500">Después de cuántos minutos se considera tardanza</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Umbral de Ausencias (%)</label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={config.attendance.absenceThreshold}
                  onChange={(e) => updateConfig('attendance', 'absenceThreshold', parseInt(e.target.value))}
                />
                <p className="text-xs text-gray-500">Porcentaje máximo de ausencias permitidas</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Notificar a Padres</label>
                  <p className="text-xs text-gray-500">Enviar notificaciones automáticas por ausencias</p>
                </div>
                <Switch
                  checked={config.attendance.notifyParents}
                  onCheckedChange={(checked) => updateConfig('attendance', 'notifyParents', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle className="font-montserrat flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Sistema de Notificaciones
            </CardTitle>
            <CardDescription>
              Configuración de notificaciones y comunicaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Notificaciones por Email</label>
                  <p className="text-xs text-gray-500">Enviar notificaciones vía correo electrónico</p>
                </div>
                <Switch
                  checked={config.notifications.emailEnabled}
                  onCheckedChange={(checked) => updateConfig('notifications', 'emailEnabled', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Notificaciones por SMS</label>
                  <p className="text-xs text-gray-500">Enviar notificaciones vía mensajes de texto</p>
                </div>
                <Switch
                  checked={config.notifications.smsEnabled}
                  onCheckedChange={(checked) => updateConfig('notifications', 'smsEnabled', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Notificaciones a Padres</label>
                  <p className="text-xs text-gray-500">Notificar automáticamente a padres sobre eventos importantes</p>
                </div>
                <Switch
                  checked={config.notifications.parentalNotifications}
                  onCheckedChange={(checked) => updateConfig('notifications', 'parentalNotifications', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <Card>
          <CardHeader>
            <CardTitle className="font-montserrat flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Configuración de Seguridad
            </CardTitle>
            <CardDescription>
              Parámetros de seguridad y acceso al sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tiempo de Sesión (minutos)</label>
              <Input
                type="number"
                min="15"
                max="480"
                value={config.security.sessionTimeout}
                onChange={(e) => updateConfig('security', 'sessionTimeout', parseInt(e.target.value))}
                className="w-48"
              />
              <p className="text-xs text-gray-500">Tiempo antes de cerrar sesión automáticamente</p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Requisitos de Contraseña</h4>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Longitud Mínima</label>
                <Input
                  type="number"
                  min="6"
                  max="20"
                  value={config.security.passwordRequirements.minLength}
                  onChange={(e) => updateNestedConfig('security', 'passwordRequirements', 'minLength', parseInt(e.target.value))}
                  className="w-32"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Requerir Mayúsculas</label>
                  <Switch
                    checked={config.security.passwordRequirements.requireUppercase}
                    onCheckedChange={(checked) => updateNestedConfig('security', 'passwordRequirements', 'requireUppercase', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Requerir Números</label>
                  <Switch
                    checked={config.security.passwordRequirements.requireNumbers}
                    onCheckedChange={(checked) => updateNestedConfig('security', 'passwordRequirements', 'requireNumbers', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Requerir Símbolos</label>
                  <Switch
                    checked={config.security.passwordRequirements.requireSymbols}
                    onCheckedChange={(checked) => updateNestedConfig('security', 'passwordRequirements', 'requireSymbols', checked)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SystemSettings;
