
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Calendar, 
  Award, 
  FileText, 
  Users, 
  Clock,
  BookOpen,
  AlertCircle
} from 'lucide-react';

const TeacherDashboard: React.FC = () => {
  // Mock data for demonstration
  const assignedSections = [
    {
      id: '1A',
      grade: 1,
      section: 'A',
      students: 28,
      subject: 'Lengua Española',
      nextClass: '8:00 AM',
      attendance: 96.4
    },
    {
      id: '2B',
      grade: 2,
      section: 'B',
      students: 26,
      subject: 'Matemática',
      nextClass: '10:00 AM',
      attendance: 94.2
    },
    {
      id: '3A',
      grade: 3,
      section: 'A',
      students: 24,
      subject: 'Ciencias Sociales',
      nextClass: '2:00 PM',
      attendance: 98.1
    }
  ];

  const pendingTasks = [
    {
      id: 1,
      task: 'Registrar asistencia',
      section: '1er A',
      deadline: 'Hoy, 5:00 PM',
      priority: 'high'
    },
    {
      id: 2,
      task: 'Calificaciones P3',
      section: '2do B',
      deadline: 'Mañana',
      priority: 'medium'
    },
    {
      id: 3,
      task: 'Observaciones trimestrales',
      section: '3er A',
      deadline: 'En 3 días',
      priority: 'low'
    }
  ];

  const quickActions = [
    {
      title: 'Registrar Asistencia',
      description: 'Marcar presente/ausente',
      icon: Calendar,
      color: 'bg-blue-500',
      action: 'attendance'
    },
    {
      title: 'Ingresar Calificaciones',
      description: 'Bloques de competencias',
      icon: Award,
      color: 'bg-green-500',
      action: 'grades'
    },
    {
      title: 'Generar Boletas',
      description: 'Reportes en PDF',
      icon: FileText,
      color: 'bg-purple-500',
      action: 'reports'
    },
    {
      title: 'Observaciones',
      description: 'Notas y recomendaciones',
      icon: BookOpen,
      color: 'bg-orange-500',
      action: 'observations'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-title font-montserrat text-minerd-blue">
            Panel Docente
          </h1>
          <p className="text-body font-opensans text-gray-600">
            Gestión de secciones asignadas
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Clock className="w-3 h-3 mr-1" />
            Período Q3 Activo
          </Badge>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-all cursor-pointer group hover:scale-105">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={`p-3 rounded-full ${action.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm font-montserrat">
                      {action.title}
                    </h3>
                    <p className="text-xs text-gray-500 font-opensans">
                      {action.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Assigned Sections */}
      <Card>
        <CardHeader>
          <CardTitle className="font-montserrat flex items-center">
            <GraduationCap className="mr-2 h-5 w-5" />
            Mis Secciones Asignadas
          </CardTitle>
          <CardDescription className="font-opensans">
            Gestiona tus secciones y estudiantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedSections.map((section) => (
              <Card key={section.id} className="border-l-4 border-l-minerd-blue hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-montserrat">
                        {section.grade}° Grado - Sección {section.section}
                      </CardTitle>
                      <CardDescription className="font-opensans">
                        {section.subject}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {section.students} estudiantes
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Próxima clase:</span>
                    <span className="text-sm font-medium text-minerd-blue">
                      {section.nextClass}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Asistencia:</span>
                    <span className="text-sm font-medium text-green-600">
                      {section.attendance}%
                    </span>
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1 text-xs">
                      <Users className="w-3 h-3 mr-1" />
                      Ver Lista
                    </Button>
                    <Button size="sm" className="flex-1 text-xs bg-minerd-green hover:bg-green-700">
                      <Calendar className="w-3 h-3 mr-1" />
                      Asistencia
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="font-montserrat flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" />
              Tareas Pendientes
            </CardTitle>
            <CardDescription className="font-opensans">
              Actividades por completar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {task.task}
                    </p>
                    <p className="text-sm text-gray-500">
                      {task.section} • {task.deadline}
                    </p>
                  </div>
                  <Badge 
                    variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {task.priority === 'high' ? 'Urgente' : task.priority === 'medium' ? 'Normal' : 'Baja'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="font-montserrat">Actividad Reciente</CardTitle>
            <CardDescription className="font-opensans">
              Últimas acciones realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Asistencia registrada
                  </p>
                  <p className="text-sm text-gray-500">
                    2do B - 26 estudiantes presentes
                  </p>
                  <p className="text-xs text-gray-400">Hace 2 horas</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Calificaciones actualizadas
                  </p>
                  <p className="text-sm text-gray-500">
                    1er A - Lengua Española P3
                  </p>
                  <p className="text-xs text-gray-400">Ayer</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Boleta generada
                  </p>
                  <p className="text-sm text-gray-500">
                    Juan Pérez - 3er A
                  </p>
                  <p className="text-xs text-gray-400">Hace 2 días</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;
