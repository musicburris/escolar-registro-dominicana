
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';
import SectionsManagement from '@/components/sections/SectionsManagement';
import StudentsManagement from '@/components/students/StudentsManagement';
import UsersManagement from '@/components/users/UsersManagement';
import AttendanceManagement from '@/components/attendance/AttendanceManagement';
import GradesManagement from '@/components/grades/GradesManagement';
import ReportsManagement from '@/components/reports/ReportsManagement';
import CurriculumManagement from '@/components/curriculum/CurriculumManagement';
import ObservationsManagement from '@/components/observations/ObservationsManagement';
import AuditManagement from '@/components/audit/AuditManagement';
import SystemSettings from '@/components/settings/SystemSettings';
import RealTimeClock from '@/components/common/RealTimeClock';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-minerd-light">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-minerd-blue" />
          <p className="text-gray-600 font-opensans">Cargando sistema...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'teacher':
        return <TeacherDashboard />;
      case 'auxiliary':
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-montserrat text-minerd-blue mb-4">
              Panel Auxiliar Administrativo
            </h2>
            <p className="text-gray-600 font-opensans">
              Gestión de estudiantes y secciones - Próximamente
            </p>
          </div>
        );
      case 'parent':
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-montserrat text-minerd-blue mb-4">
              Portal de Padres
            </h2>
            <p className="text-gray-600 font-opensans">
              Consulta de boletas y asistencia - Próximamente
            </p>
          </div>
        );
      case 'student':
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-montserrat text-minerd-blue mb-4">
              Portal Estudiantil
            </h2>
            <p className="text-gray-600 font-opensans">
              Consulta de calificaciones y anuncios - Próximamente
            </p>
          </div>
        );
      default:
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-montserrat text-minerd-blue mb-4">
              Bienvenido al Sistema
            </h2>
            <p className="text-gray-600 font-opensans">
              Panel no configurado para este rol
            </p>
          </div>
        );
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'sections':
        return <SectionsManagement />;
      case 'students':
        return <StudentsManagement />;
      case 'users':
        return <UsersManagement />;
      case 'attendance':
        return <AttendanceManagement />;
      case 'grades':
        return <GradesManagement />;
      case 'reports':
        return <ReportsManagement />;
      case 'curriculum':
        return <CurriculumManagement />;
      case 'observations':
        return <ObservationsManagement />;
      case 'audit':
        return <AuditManagement />;
      case 'settings':
        return <SystemSettings />;
      default:
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-montserrat text-minerd-blue mb-4">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </h2>
            <p className="text-gray-600 font-opensans">
              Esta sección estará disponible próximamente
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-minerd-light">
      <Header 
        onMenuToggle={toggleSidebar}
        isMobileMenuOpen={isSidebarOpen}
      />
      
      <div className="flex">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        
        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Real Time Clock */}
      <RealTimeClock />
    </div>
  );
};

export default Index;
