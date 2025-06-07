
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, Activity, Users, Database, FileText, Settings } from 'lucide-react';

const AuditManagement: React.FC = () => {
  // Estadísticas mock
  const stats = {
    totalActivities: 1247,
    todayActivities: 23,
    activeUsers: 18,
    lastBackup: new Date('2024-12-05T02:00:00')
  };

  // Actividades recientes mock
  const recentActivities = [
    {
      id: 1,
      user: 'Prof. María González',
      action: 'Calificación actualizada',
      module: 'Calificaciones',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      status: 'success'
    },
    {
      id: 2,
      user: 'Aux. Carmen López',
      action: 'Estudiante registrado',
      module: 'Estudiantes',
      timestamp: new Date(Date.now() - 12 * 60 * 1000),
      status: 'success'
    },
    {
      id: 3,
      user: 'Admin',
      action: 'Configuración actualizada',
      module: 'Sistema',
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      status: 'warning'
    },
    {
      id: 4,
      user: 'Prof. Juan Pérez',
      action: 'Reporte generado',
      module: 'Reportes',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      status: 'success'
    }
  ];

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} h`;
    return `Hace ${Math.floor(diffInMinutes / 1440)} día(s)`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-title font-montserrat text-minerd-blue">
            Histórico del Sistema
          </h1>
          <p className="text-body font-opensans text-gray-600">
            Registro de actividades y estado del sistema
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

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="font-montserrat flex items-center">
            <History className="mr-2 h-5 w-5" />
            Actividad Reciente
          </CardTitle>
          <CardDescription className="font-opensans">
            Últimas actividades registradas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className={`flex items-center justify-between p-4 rounded-lg ${getStatusColor(activity.status)}`}>
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm opacity-80">por {activity.user} • {activity.module}</p>
                  </div>
                </div>
                <div className="text-sm opacity-80">
                  {formatTimeAgo(activity.timestamp)}
                </div>
              </div>
            ))}
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
    </div>
  );
};

export default AuditManagement;
