
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  BookOpen, 
  FileText, 
  Settings, 
  User, 
  Users,
  BarChart3,
  GraduationCap,
  ClipboardList,
  Award
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

interface MenuItem {
  id: string;
  title: string;
  icon: React.ElementType;
  roles: string[];
  badge?: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    title: 'Inicio',
    icon: BarChart3,
    roles: ['admin', 'teacher', 'auxiliary', 'parent', 'student'],
  },
  {
    id: 'sections',
    title: 'Secciones',
    icon: GraduationCap,
    roles: ['admin', 'teacher', 'auxiliary'],
  },
  {
    id: 'students',
    title: 'Estudiantes',
    icon: Users,
    roles: ['admin', 'auxiliary'],
  },
  {
    id: 'users',
    title: 'Usuarios',
    icon: User,
    roles: ['admin'],
  },
  {
    id: 'attendance',
    title: 'Asistencia',
    icon: Calendar,
    roles: ['admin', 'teacher'],
  },
  {
    id: 'grades',
    title: 'Calificaciones',
    icon: Award,
    roles: ['admin', 'teacher'],
  },
  {
    id: 'reports',
    title: 'Boletas',
    icon: FileText,
    roles: ['admin', 'teacher', 'parent', 'student'],
  },
  {
    id: 'curriculum',
    title: 'Configuración Curricular',
    icon: BookOpen,
    roles: ['admin'],
  },
  {
    id: 'observations',
    title: 'Observaciones',
    icon: ClipboardList,
    roles: ['admin', 'teacher'],
  },
  {
    id: 'audit',
    title: 'Histórico',
    icon: FileText,
    roles: ['admin'],
  },
  {
    id: 'admin-panel',
    title: 'Panel de Administración',
    icon: Settings,
    roles: ['admin'],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  activeSection, 
  onSectionChange 
}) => {
  const { user } = useAuth();

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  const handleItemClick = (itemId: string) => {
    onSectionChange(itemId);
    // Close mobile menu when item is selected
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out",
          "lg:relative lg:top-0 lg:h-screen lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "w-64"
        )}
      >
        <div className="flex flex-col h-full">
          {/* User Info */}
          <div className="p-4 border-b border-gray-200 bg-minerd-light">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-minerd-blue rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role === 'admin' && 'Administrador'}
                  {user?.role === 'teacher' && 'Docente'}
                  {user?.role === 'auxiliary' && 'Auxiliar'}
                  {user?.role === 'parent' && 'Padre/Tutor'}
                  {user?.role === 'student' && 'Estudiante'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start h-12 font-opensans",
                    isActive 
                      ? "bg-minerd-blue text-white hover:bg-blue-700" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={() => handleItemClick(item.id)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <span className="truncate">{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {item.badge}
                    </span>
                  )}
                </Button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-minerd-light">
            <div className="text-center">
              <p className="text-xs text-gray-500 font-opensans">
                Registro Escolar v1.0
              </p>
              <p className="text-xs text-gray-400">
                MINERD - República Dominicana
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
