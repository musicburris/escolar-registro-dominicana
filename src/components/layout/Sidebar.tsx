
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  Home,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  Shield,
  X,
  FolderOpen
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeSection,
  onSectionChange
}) => {
  const { user } = useAuth();

  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['admin', 'teacher', 'auxiliary', 'parent', 'student'] }
    ];

    const adminItems = [
      { id: 'sections', label: 'Secciones', icon: BookOpen, roles: ['admin', 'teacher'] },
      { id: 'students', label: 'Estudiantes', icon: GraduationCap, roles: ['admin', 'teacher', 'auxiliary'] },
      { id: 'users', label: 'Usuarios', icon: Users, roles: ['admin'] },
      { id: 'attendance', label: 'Asistencia', icon: Calendar, roles: ['admin', 'teacher'] },
      { id: 'grades', label: 'Calificaciones', icon: FileText, roles: ['admin', 'teacher'] },
      { id: 'evidences', label: 'Evidencias', icon: FolderOpen, roles: ['admin', 'teacher', 'student'] },
      { id: 'reports', label: 'Reportes', icon: BarChart3, roles: ['admin', 'teacher'] },
      { id: 'settings', label: 'Configuración', icon: Settings, roles: ['admin'] },
      { id: 'admin-panel', label: 'Panel Admin', icon: Shield, roles: ['admin'] }
    ];

    const allItems = [...baseItems, ...adminItems];
    
    // Si no hay usuario autenticado, mostrar funciones de administración para configuración inicial
    if (!user) {
      return allItems.filter(item => item.roles.includes('admin'));
    }
    
    return allItems.filter(item => 
      item.roles.includes(user.role)
    );
  };

  const menuItems = getMenuItems();

  const handleItemClick = (sectionId: string) => {
    onSectionChange(sectionId);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Mobile close button */}
          <div className="flex justify-end p-4 lg:hidden">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 pb-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-10",
                    isActive && "bg-blue-600 text-white hover:bg-blue-700"
                  )}
                  onClick={() => handleItemClick(item.id)}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-sm">
              <p className="font-medium text-gray-900">{user ? `${user.firstName} ${user.lastName}` : 'Usuario'}</p>
              <p className="text-gray-500">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
