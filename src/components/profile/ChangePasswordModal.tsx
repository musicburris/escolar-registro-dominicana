
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { Lock, Save, AlertCircle } from 'lucide-react';

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ open, onOpenChange }) => {
  const { changePassword } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(formData.currentPassword, formData.newPassword);
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido cambiada exitosamente",
      });
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleClose = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-montserrat flex items-center">
            <Lock className="mr-2 h-5 w-5" />
            Cambiar Contraseña
          </DialogTitle>
          <DialogDescription className="font-opensans">
            Actualiza tu contraseña para mantener tu cuenta segura
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="currentPassword">Contraseña Actual</Label>
            <Input
              id="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={(e) => handleInputChange('currentPassword', e.target.value)}
              placeholder="Ingresa tu contraseña actual"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva Contraseña</Label>
            <Input
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              placeholder="Ingresa tu nueva contraseña"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="Confirma tu nueva contraseña"
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Requisitos de la contraseña:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Mínimo 6 caracteres</li>
              <li>• Se recomienda usar letras, números y símbolos</li>
              <li>• Evita usar información personal</li>
            </ul>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button 
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 bg-minerd-blue hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordModal;
