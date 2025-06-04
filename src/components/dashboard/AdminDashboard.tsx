
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Users, 
  GraduationCap, 
  TrendingUp, 
  Bell, 
  Settings, 
  FileText,
  Calendar
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  // Mock data for demonstration
  const stats = {
    totalStudents: 245,
    totalTeachers: 12,
    totalSections: 9,
    attendanceRate: 94.2,
    averageGrade: 82.5,
    pendingReports: 5
  };

  const recentActivities = [
    {
      id: 1,
      action: 'Boleta generada',
      description: 'Juan Pérez - 2do A',
      time: 'Hace 2 horas',
      type: 'report'
    },
    {
      id: 2,
      action: 'Asistencia registrada',
      description: '1er A - Prof. María González',
      time: 'Hace 3 horas',
      type: 'attendance'
    },
    {
      id: 3,
      action: 'Nuevo estudiante',
      description: 'Ana Rodríguez inscrita en 3er B',
      time: 'Hace 1 día',
      type: 'student'
    }
  ];

  const notifications = [
    {
      id: 1,
      title: 'Cierre de período académico',
      description: 'Recordatorio: El período Q2 cierra en 3 días',
      priority: 'high',
      time: 'Hace 1 hora'
    },
    {
      id: 2,
      title: 'Reunión de coordinadores',
      description: 'Programada para mañana a las 9:00 AM',
      priority: 'medium',
      time: 'Hace 2 horas'
    }
  ];

  const quickActions = [
    {
      title: 'Gestionar Usuarios',
      description: 'Crear y administrar cuentas',
      icon: Users,
      action: 'users'
    },
    {
      title: 'Configurar Centro',
      description: 'Datos institucionales',
      icon: Settings,
      action: 'settings'
    },
    {
      title: 'Ver Reportes',
      description: 'Informes y estadísticas',
      icon: FileText,
      action: 'reports'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-title font-montserrat text-minerd-blue">
            Panel de Administración
          </h1>
          <p className="text-body font-opensans text-gray-600">
            Gestión integral del centro educativo
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <TrendingUp className="w-3 h-3 mr-1" />
            Sistema Activo
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Estudiantes
            </CardTitle>
            <Users className="h-4 w-4 text-minerd-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-minerd-blue">
              {stats.totalStudents}
            </div>
            <p className="text-xs text-gray-500">
              +12 desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Docentes Activos
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-minerd-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-minerd-green">
              {stats.totalTeachers}
            </div>
            <p className="text-xs text-gray-500">
              3 secciones por docente
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tasa de Asistencia
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.attendanceRate}%
            </div>
            <p className="text-xs text-gray-500">
              +2.1% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Promedio General
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.averageGrade}
            </div>
            <p className="text-xs text-gray-500">
              Escala 0-100
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-minerd-blue/10 rounded-lg group-hover:bg-minerd-blue/20 transition-colors">
                    <Icon className="h-5 w-5 text-minerd-blue" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-montserrat">
                      {action.title}
                    </CardTitle>
                    <CardDescription className="font-opensans">
                      {action.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="font-montserrat">Actividad Reciente</CardTitle>
            <CardDescription className="font-opensans">
              Últimas acciones en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-minerd-blue rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="font-montserrat flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notificaciones
            </CardTitle>
            <CardDescription className="font-opensans">
              Alertas importantes del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="border-l-4 border-minerd-blue pl-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {notification.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {notification.time}
                      </p>
                    </div>
                    <Badge 
                      variant={notification.priority === 'high' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {notification.priority === 'high' ? 'Urgente' : 'Normal'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
