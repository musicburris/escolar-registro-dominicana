
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Calendar, 
  FileText, 
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  FolderOpen
} from 'lucide-react';

interface TeacherDashboardProps {
  onSectionChange: (section: string) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onSectionChange }) => {
  const myStats = [
    { title: 'Mis Estudiantes', value: '156', icon: Users },
    { title: 'Secciones a Cargo', value: '6', icon: BookOpen },
    { title: 'Asistencia Hoy', value: '92%', icon: Calendar },
    { title: 'Por Calificar', value: '12', icon: FileText }
  ];

  const recentActivities = [
    { type: 'grade', title: 'Calificaciones pendientes', description: 'Matemática - 2° A', urgent: true },
    { type: 'attendance', title: 'Asistencia registrada', description: 'Lengua Española - 1° B', urgent: false },
    { type: 'evidence', title: 'Evidencias subidas', description: '5 nuevas evidencias por revisar', urgent: false }
  ];

  const quickActions = [
    { title: 'Tomar Asistencia', action: () => onSectionChange('attendance'), icon: Calendar },
    { title: 'Registrar Calificaciones', action: () => onSectionChange('grades'), icon: FileText },
    { title: 'Subir Evidencias', action: () => onSectionChange('evidences'), icon: FolderOpen },
    { title: 'Ver Mis Estudiantes', action: () => onSectionChange('students'), icon: Users }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel del Profesor</h1>
        <p className="text-gray-600 mt-2">Gestiona tus clases y estudiantes</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {myStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
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
              <Button 
                key={index}
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={action.action}
              >
                <Icon className="w-6 h-6" />
                <span>{action.title}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Actividades Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-full ${
                  activity.urgent ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  {activity.urgent ? (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                </div>
                {activity.urgent && (
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                    Urgente
                  </span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* My Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Mi Horario de Hoy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium">Matemática - 1° A</p>
                <p className="text-sm text-gray-600">8:00 AM - 9:00 AM</p>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                En curso
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Lengua Española - 2° B</p>
                <p className="text-sm text-gray-600">10:00 AM - 11:00 AM</p>
              </div>
              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                Siguiente
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDashboard;
