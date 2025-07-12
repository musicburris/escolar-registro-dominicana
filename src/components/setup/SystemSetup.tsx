import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Settings, 
  Shield, 
  School, 
  Plus,
  Save,
  Key,
  Palette
} from 'lucide-react';

const SystemSetup: React.FC = () => {
  const { signup } = useAuth();
  const { toast } = useToast();
  
  // Estado para crear usuario
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'admin' as const
  });

  // Estado para configuración del sistema
  const [systemConfig, setSystemConfig] = useState({
    siteName: 'Sistema Educativo MINERD',
    subtitle: 'Gestión Escolar Integral',
    primaryColor: '#0D3B66',
    secondaryColor: '#137547',
    requireAuth: true,
    allowRegistration: false
  });

  const handleCreateUser = async () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.password) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }

    try {
      const success = await signup(
        newUser.email, 
        newUser.password, 
        newUser.firstName, 
        newUser.lastName, 
        newUser.role
      );

      if (success) {
        toast({
          title: "Usuario creado",
          description: `Usuario ${newUser.firstName} ${newUser.lastName} creado exitosamente`
        });
        setNewUser({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          role: 'admin'
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo crear el usuario",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al crear el usuario",
        variant: "destructive"
      });
    }
  };

  const handleSaveSystemConfig = () => {
    // Aquí puedes implementar la lógica para guardar la configuración del sistema
    toast({
      title: "Configuración guardada",
      description: "La configuración del sistema ha sido actualizada"
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-minerd-blue flex items-center justify-center gap-3">
          <Settings className="w-8 h-8" />
          Configuración Inicial del Sistema
        </h1>
        <p className="text-gray-600 mt-2">
          Configura tu sistema escolar antes de comenzar a usarlo
        </p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <School className="w-4 h-4" />
            Sistema
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Seguridad
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Crear Primer Usuario Administrador
              </CardTitle>
              <CardDescription>
                Crea el usuario administrador principal que gestionará el sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                    placeholder="Ingresa el nombre"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                    placeholder="Ingresa el apellido"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="administrador@escuela.edu.do"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select value={newUser.role} onValueChange={(value: any) => setNewUser({...newUser, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="teacher">Profesor</SelectItem>
                    <SelectItem value="auxiliary">Auxiliar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleCreateUser} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Crear Usuario
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Configuración Visual
              </CardTitle>
              <CardDescription>
                Personaliza la apariencia de tu sistema escolar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Nombre del Sistema</Label>
                <Input
                  id="siteName"
                  value={systemConfig.siteName}
                  onChange={(e) => setSystemConfig({...systemConfig, siteName: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtítulo</Label>
                <Input
                  id="subtitle"
                  value={systemConfig.subtitle}
                  onChange={(e) => setSystemConfig({...systemConfig, subtitle: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Color Primario</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={systemConfig.primaryColor}
                      onChange={(e) => setSystemConfig({...systemConfig, primaryColor: e.target.value})}
                      className="w-16 h-10"
                    />
                    <Input
                      value={systemConfig.primaryColor}
                      onChange={(e) => setSystemConfig({...systemConfig, primaryColor: e.target.value})}
                      placeholder="#0D3B66"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Color Secundario</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={systemConfig.secondaryColor}
                      onChange={(e) => setSystemConfig({...systemConfig, secondaryColor: e.target.value})}
                      className="w-16 h-10"
                    />
                    <Input
                      value={systemConfig.secondaryColor}
                      onChange={(e) => setSystemConfig({...systemConfig, secondaryColor: e.target.value})}
                      placeholder="#137547"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Configuración de Autenticación
              </CardTitle>
              <CardDescription>
                Define cómo los usuarios accederán al sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Requerir Autenticación</Label>
                  <p className="text-sm text-gray-500">Los usuarios deben iniciar sesión para acceder</p>
                </div>
                <Button
                  variant={systemConfig.requireAuth ? "default" : "outline"}
                  onClick={() => setSystemConfig({...systemConfig, requireAuth: !systemConfig.requireAuth})}
                >
                  {systemConfig.requireAuth ? "Activado" : "Desactivado"}
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Permitir Auto-registro</Label>
                  <p className="text-sm text-gray-500">Los usuarios pueden crear cuentas por sí mismos</p>
                </div>
                <Button
                  variant={systemConfig.allowRegistration ? "default" : "outline"}
                  onClick={() => setSystemConfig({...systemConfig, allowRegistration: !systemConfig.allowRegistration})}
                >
                  {systemConfig.allowRegistration ? "Activado" : "Desactivado"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center">
        <Button onClick={handleSaveSystemConfig} size="lg" className="px-8">
          <Save className="w-4 h-4 mr-2" />
          Guardar Configuración
        </Button>
      </div>
    </div>
  );
};

export default SystemSetup;