
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';

interface AdminDashboardProps {
  onSectionChange: (section: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSectionChange }) => {
  const stats = [
    { title: 'Total Estudiantes', value: '1,245', icon: GraduationCap, change: '+5%', trend: 'up' },
    { title: 'Profesores Activos', value: '48', icon: Users, change: '+2%', trend: 'up' },
    { title: 'Secciones', value: '24', icon: BookOpen, change: '0%', trend: 'stable' },
    { title: 'Asistencia Hoy', value: '94%', icon: Calendar, change: '-1%', trend: 'down' }
  ];

  const quickActions = [
    { title: 'Gestionar Estudiantes', description: 'Registrar y administrar estudiantes', action: () => onSectionChange('students'), icon: GraduationCap },
    { title: 'Ver Reportes', description: 'Consultar estadísticas y reportes', action: () => onSectionChange('reports'), icon: BarChart3 },
    { title: 'Configuración', description: 'Configurar el sistema', action: () => onSectionChange('settings'), icon: Activity },
    { title: 'Gestionar Usuarios', description: 'Administrar usuarios del sistema', action: () => onSectionChange('users'), icon: Users }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="text-gray-600 mt-2">Resumen general del sistema escolar</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      {stat.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      ) : stat.trend === 'down' ? (
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                      ) : (
                        <Activity className="w-4 h-4 text-gray-400 mr-1" />
                      )}
                      <span className={`text-sm ${
                        stat.trend === 'up' ? 'text-green-600' : 
                        stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={action.action}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                  </div>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="bg-green-100 p-2 rounded-full">
                <GraduationCap className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Nuevo estudiante registrado</p>
                <p className="text-sm text-gray-600">María García - 1° A</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="bg-blue-100 p-2 rounded-full">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Asistencia registrada</p>
                <p className="text-sm text-gray-600">2° B - 28/30 estudiantes presentes</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="bg-purple-100 p-2 rounded-full">
                <BarChart3 className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Reporte generado</p>
                <p className="text-sm text-gray-600">Calificaciones del primer período</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
