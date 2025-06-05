
import React, { useState } from 'react';
import AuditoriaModal from '@/components/grades/AuditoriaModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, Activity, Users, Database, FileText, Settings } from 'lucide-react';

const AuditManagement: React.FC = () => {
  const [auditModalOpen, setAuditModalOpen] = useState(false);

  // Estadísticas mock
  const stats = {
    totalActivities: 1247,
    todayActivities: 23,
    activeUsers: 18,
    lastBackup: new Date('2024-12-05T02:00:00')
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-title font-montserrat text-minerd-blue">
            Histórico y Auditoría del Sistema
          </h1>
          <p className="text-body font-opensans text-gray-600">
            Registro completo de actividades y monitoreo del sistema
          </p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Sistema Activo
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Actividades</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalActivities.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Actividades Hoy</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayActivities}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Último Respaldo</p>
                <p className="text-sm font-bold text-gray-900">{stats.lastBackup.toLocaleDateString()}</p>
                <p className="text-xs text-gray-600">{stats.lastBackup.toLocaleTimeString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="font-montserrat flex items-center">
            <History className="mr-2 h-5 w-5" />
            Acciones Rápidas de Auditoría
          </CardTitle>
          <CardDescription className="font-opensans">
            Accede a diferentes vistas y reportes del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              onClick={() => setAuditModalOpen(true)}
              className="bg-minerd-blue hover:bg-blue-700 h-auto py-4 flex flex-col items-center space-y-2"
            >
              <History className="w-6 h-6" />
              <span>Ver Histórico Completo</span>
              <span className="text-xs opacity-80">Registro detallado de actividades</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center space-y-2"
              onClick={() => {
                // Implementar filtro por usuario
                setAuditModalOpen(true);
              }}
            >
              <Users className="w-6 h-6" />
              <span>Actividades por Usuario</span>
              <span className="text-xs opacity-60">Filtrar por usuario específico</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center space-y-2"
              onClick={() => {
                // Implementar filtro por módulo
                setAuditModalOpen(true);
              }}
            >
              <Settings className="w-6 h-6" />
              <span>Actividades por Módulo</span>
              <span className="text-xs opacity-60">Filtrar por área del sistema</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="font-montserrat flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            Resumen de Actividad Reciente
          </CardTitle>
          <CardDescription className="font-opensans">
            Últimas actividades registradas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Calificación actualizada por Prof. María González</span>
              </div>
              <span className="text-xs text-gray-500">Hace 5 min</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Nuevo estudiante registrado por Aux. Carmen López</span>
              </div>
              <span className="text-xs text-gray-500">Hace 12 min</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Configuración de competencias por Admin</span>
              </div>
              <span className="text-xs text-gray-500">Hace 25 min</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Reporte generado por Prof. Juan Pérez</span>
              </div>
              <span className="text-xs text-gray-500">Hace 1 hora</span>
            </div>

            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={() => setAuditModalOpen(true)}
                className="flex items-center"
              >
                <History className="w-4 h-4 mr-2" />
                Ver Histórico Completo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="font-montserrat flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Estado del Sistema
          </CardTitle>
          <CardDescription className="font-opensans">
            Información sobre el estado y rendimiento del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
                <div className="w-6 h-6 bg-green-500 rounded-full"></div>
              </div>
              <h3 className="font-semibold text-green-800">Sistema Operativo</h3>
              <p className="text-sm text-green-600">Funcionando correctamente</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-blue-800">Base de Datos</h3>
              <p className="text-sm text-blue-600">Conectada y sincronizada</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-2">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-purple-800">Rendimiento</h3>
              <p className="text-sm text-purple-600">Óptimo</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Modal */}
      <AuditoriaModal
        open={auditModalOpen}
        onOpenChange={setAuditModalOpen}
      />
    </div>
  );
};

export default AuditManagement;
