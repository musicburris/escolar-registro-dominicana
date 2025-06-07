import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { 
  Settings, 
  School, 
  Calendar, 
  GraduationCap, 
  UserCheck, 
  Bell, 
  Shield,
  Save,
  Clock,
  Plus,
  Trash2,
  User
} from 'lucide-react';

const SystemSettings: React.FC = () => {
  const { user } = useAuth();
  
  // Estados para la configuración del sistema
  const [systemName, setSystemName] = useState('Registro Escolar');
  const [systemSubtitle, setSystemSubtitle] = useState('1er Ciclo Secundaria - RD');
  const [schoolName, setSchoolName] = useState('Centro Educativo Ejemplo');
  const [currentYear, setCurrentYear] = useState('2024-2025');
  const [currentPeriod, setCurrentPeriod] = useState('Q3');
  const [gradeEditTime, setGradeEditTime] = useState('24'); // horas
  const [minGrade, setMinGrade] = useState('0');
  const [maxGrade, setMaxGrade] = useState('100');
  const [passGrade, setPassGrade] = useState('70');
  const [autoBackup, setAutoBackup] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);
  
  // Nuevos estados
  const [schoolYears, setSchoolYears] = useState([
    '2022-2023',
    '2023-2024', 
    '2024-2025',
    '2025-2026'
  ]);
  const [newYear, setNewYear] = useState('');
  const [developerName, setDeveloperName] = useState('Tu Nombre Aquí');
  const [developerContact, setDeveloperContact] = useState('contacto@ejemplo.com');

  const addSchoolYear = () => {
    if (newYear && !schoolYears.includes(newYear)) {
      setSchoolYears([...schoolYears, newYear]);
      setNewYear('');
      toast({
        title: "Año escolar agregado",
        description: `El año ${newYear} ha sido agregado exitosamente`,
      });
    }
  };

  const removeSchoolYear = (year: string) => {
    if (year === currentYear) {
      toast({
        title: "Error",
        description: "No puedes eliminar el año académico actual",
        variant: "destructive"
      });
      return;
    }
    setSchoolYears(schoolYears.filter(y => y !== year));
    toast({
      title: "Año escolar eliminado",
      description: `El año ${year} ha sido eliminado`,
    });
  };

  const saveSettings = () => {
    // Aquí se guardarían las configuraciones
    toast({
      title: "Configuración guardada",
      description: "Todas las configuraciones del sistema han sido actualizadas exitosamente",
    });
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-title font-montserrat text-minerd-blue">
            Configuración del Sistema
          </h1>
          <p className="text-body font-opensans text-gray-600">
            Administra las configuraciones generales del sistema escolar
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Administrador
        </Badge>
      </div>

      {/* Información del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="font-montserrat flex items-center">
            <School className="mr-2 h-5 w-5" />
            Información del Sistema
          </CardTitle>
          <CardDescription className="font-opensans">
            Configura la información básica que se muestra en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="systemName">Nombre del Sistema</Label>
              <Input
                id="systemName"
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                placeholder="Registro Escolar"
                disabled={!isAdmin}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="systemSubtitle">Subtítulo del Sistema</Label>
              <Input
                id="systemSubtitle"
                value={systemSubtitle}
                onChange={(e) => setSystemSubtitle(e.target.value)}
                placeholder="1er Ciclo Secundaria - RD"
                disabled={!isAdmin}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="schoolName">Nombre del Centro Educativo</Label>
            <Input
              id="schoolName"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="Centro Educativo Ejemplo"
              disabled={!isAdmin}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configuración Académica */}
      <Card>
        <CardHeader>
          <CardTitle className="font-montserrat flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Configuración Académica
          </CardTitle>
          <CardDescription className="font-opensans">
            Establece los parámetros del año académico actual y gestiona años escolares
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentYear">Año Académico</Label>
              <Select value={currentYear} onValueChange={setCurrentYear} disabled={!isAdmin}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar año" />
                </SelectTrigger>
                <SelectContent>
                  {schoolYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentPeriod">Período Actual</Label>
              <Select value={currentPeriod} onValueChange={setCurrentPeriod} disabled={!isAdmin}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Q1">Primer Trimestre (Q1)</SelectItem>
                  <SelectItem value="Q2">Segundo Trimestre (Q2)</SelectItem>
                  <SelectItem value="Q3">Tercer Trimestre (Q3)</SelectItem>
                  <SelectItem value="Q4">Cuarto Trimestre (Q4)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Gestión de Años Escolares */}
          <div className="space-y-4 border-t pt-4">
            <Label className="text-lg font-semibold">Gestión de Años Escolares</Label>
            
            <div className="flex gap-2">
              <Input
                placeholder="Ej: 2026-2027"
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
                disabled={!isAdmin}
              />
              <Button 
                onClick={addSchoolYear}
                disabled={!isAdmin || !newYear}
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Año
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {schoolYears.map(year => (
                <div key={year} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm">{year}</span>
                  {year !== currentYear && isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSchoolYear(year)}
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                  {year === currentYear && (
                    <Badge variant="outline" className="text-xs">Actual</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de Calificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="font-montserrat flex items-center">
            <GraduationCap className="mr-2 h-5 w-5" />
            Configuración de Calificaciones
          </CardTitle>
          <CardDescription className="font-opensans">
            Establece los parámetros para el sistema de calificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minGrade">Calificación Mínima</Label>
              <Input
                id="minGrade"
                type="number"
                value={minGrade}
                onChange={(e) => setMinGrade(e.target.value)}
                min="0"
                max="100"
                disabled={!isAdmin}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxGrade">Calificación Máxima</Label>
              <Input
                id="maxGrade"
                type="number"
                value={maxGrade}
                onChange={(e) => setMaxGrade(e.target.value)}
                min="0"
                max="100"
                disabled={!isAdmin}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passGrade">Nota de Aprobación</Label>
              <Input
                id="passGrade"
                type="number"
                value={passGrade}
                onChange={(e) => setPassGrade(e.target.value)}
                min="0"
                max="100"
                disabled={!isAdmin}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="gradeEditTime" className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              Tiempo para Editar Calificaciones Publicadas (horas)
            </Label>
            <div className="flex items-center space-x-4">
              <Input
                id="gradeEditTime"
                type="number"
                value={gradeEditTime}
                onChange={(e) => setGradeEditTime(e.target.value)}
                min="0"
                max="168"
                className="w-32"
                disabled={!isAdmin}
              />
              <span className="text-sm text-gray-600">
                Los docentes podrán editar las calificaciones hasta {gradeEditTime} horas después de publicarlas
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de Notificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="font-montserrat flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Configuración de Notificaciones
          </CardTitle>
          <CardDescription className="font-opensans">
            Gestiona las notificaciones del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificaciones por Email</Label>
              <p className="text-sm text-gray-600">Enviar notificaciones importantes por correo electrónico</p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
              disabled={!isAdmin}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificaciones del Sistema</Label>
              <p className="text-sm text-gray-600">Mostrar notificaciones en tiempo real en la aplicación</p>
            </div>
            <Switch
              checked={systemNotifications}
              onCheckedChange={setSystemNotifications}
              disabled={!isAdmin}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configuración de Seguridad */}
      <Card>
        <CardHeader>
          <CardTitle className="font-montserrat flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Configuración de Seguridad
          </CardTitle>
          <CardDescription className="font-opensans">
            Gestiona la seguridad y respaldos del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Respaldo Automático</Label>
              <p className="text-sm text-gray-600">Realizar respaldos automáticos diarios del sistema</p>
            </div>
            <Switch
              checked={autoBackup}
              onCheckedChange={setAutoBackup}
              disabled={!isAdmin}
            />
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Información del Sistema</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Versión:</span> 1.0.0
              </div>
              <div>
                <span className="font-medium">Último respaldo:</span> {new Date().toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Estado:</span> 
                <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                  Operativo
                </Badge>
              </div>
              <div>
                <span className="font-medium">Usuarios activos:</span> 18
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información del Desarrollador */}
      <Card>
        <CardHeader>
          <CardTitle className="font-montserrat flex items-center">
            <User className="mr-2 h-5 w-5" />
            Información del Desarrollador
          </CardTitle>
          <CardDescription className="font-opensans">
            Configura la información del desarrollador que aparece en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="developerName">Nombre del Desarrollador</Label>
              <Input
                id="developerName"
                value={developerName}
                onChange={(e) => setDeveloperName(e.target.value)}
                placeholder="Tu Nombre Aquí"
                disabled={!isAdmin}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="developerContact">Contacto del Desarrollador</Label>
              <Input
                id="developerContact"
                value={developerContact}
                onChange={(e) => setDeveloperContact(e.target.value)}
                placeholder="contacto@ejemplo.com"
                disabled={!isAdmin}
              />
            </div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              Esta información aparecerá en el pie de página del sistema.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Botón de Guardar */}
      {isAdmin && (
        <div className="flex justify-center">
          <Button 
            onClick={saveSettings}
            className="bg-minerd-green hover:bg-green-700 flex items-center px-8"
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar Configuración
          </Button>
        </div>
      )}
    </div>
  );
};

export default SystemSettings;
