
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Settings, Bell, Eye, Lock, Palette, Save } from 'lucide-react';

interface UserSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    gradeNotifications: true,
    systemNotifications: false,
    theme: 'light',
    language: 'es',
    autoSave: true,
    privateProfile: false,
  });

  const handleSave = () => {
    // Aquí se guardarían las configuraciones del usuario
    toast({
      title: "Configuración guardada",
      description: "Tus preferencias han sido actualizadas",
    });
    onOpenChange(false);
  };

  const toggleSetting = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-montserrat flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Configuración de Usuario
          </DialogTitle>
          <DialogDescription className="font-opensans">
            Personaliza tu experiencia en el sistema
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notificaciones
              </CardTitle>
              <CardDescription>
                Configura cómo y cuándo recibir notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificaciones por Email</Label>
                  <p className="text-sm text-gray-600">Recibir actualizaciones importantes por correo</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={() => toggleSetting('emailNotifications')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificaciones Push</Label>
                  <p className="text-sm text-gray-600">Notificaciones en tiempo real en el navegador</p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={() => toggleSetting('pushNotifications')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificaciones de Calificaciones</Label>
                  <p className="text-sm text-gray-600">Avisos cuando se publiquen nuevas calificaciones</p>
                </div>
                <Switch
                  checked={settings.gradeNotifications}
                  onCheckedChange={() => toggleSetting('gradeNotifications')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificaciones del Sistema</Label>
                  <p className="text-sm text-gray-600">Actualizaciones y mantenimientos del sistema</p>
                </div>
                <Switch
                  checked={settings.systemNotifications}
                  onCheckedChange={() => toggleSetting('systemNotifications')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Palette className="mr-2 h-5 w-5" />
                Apariencia
              </CardTitle>
              <CardDescription>
                Personaliza la interfaz del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tema</Label>
                <Select value={settings.theme} onValueChange={(value) => setSettings(prev => ({ ...prev, theme: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Oscuro</SelectItem>
                    <SelectItem value="auto">Automático</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select value={settings.language} onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Lock className="mr-2 h-5 w-5" />
                Privacidad
              </CardTitle>
              <CardDescription>
                Controla la visibilidad de tu información
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Guardar Automáticamente</Label>
                  <p className="text-sm text-gray-600">Guardar cambios automáticamente mientras trabajas</p>
                </div>
                <Switch
                  checked={settings.autoSave}
                  onCheckedChange={() => toggleSetting('autoSave')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Perfil Privado</Label>
                  <p className="text-sm text-gray-600">Limitar la visibilidad de tu perfil a otros usuarios</p>
                </div>
                <Switch
                  checked={settings.privateProfile}
                  onCheckedChange={() => toggleSetting('privateProfile')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex space-x-2">
            <Button 
              onClick={handleSave}
              className="flex-1 bg-minerd-blue hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar Configuración
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserSettingsModal;
