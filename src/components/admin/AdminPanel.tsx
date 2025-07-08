import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Download, 
  Upload, 
  Shield, 
  Eye,
  EyeOff,
  FileText,
  Database,
  Clock,
  Monitor,
  Moon,
  Sun,
  Paintbrush
} from 'lucide-react';

import ImportExportTools from './ImportExportTools';
import SecuritySettings from './SecuritySettings';
import ModuleControl from './ModuleControl';
import { toast } from '@/hooks/use-toast';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();

  // Verificar que solo administradores puedan acceder
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
            <p className="text-gray-600">Solo los administradores pueden acceder a este panel.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-title font-montserrat text-minerd-blue flex items-center">
            <Settings className="mr-3 h-8 w-8" />
            Panel de Administración
          </h1>
          <p className="text-body font-opensans text-gray-600">
            Configuración y control total del sistema escolar
          </p>
        </div>
        <Badge variant="default" className="bg-minerd-blue">
          Administrador: {user.firstName} {user.lastName}
        </Badge>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="modules" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Módulos
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Seguridad
          </TabsTrigger>
          <TabsTrigger value="import-export" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Datos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="modules">
          <ModuleControl />
        </TabsContent>

        <TabsContent value="import-export">
          <ImportExportTools />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default AdminPanel;