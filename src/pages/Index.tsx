import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import SystemSetup from '@/components/setup/SystemSetup';
import { NotificationProvider } from '@/contexts/NotificationContext';
import LoginForm from '@/components/auth/LoginForm';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';
import SectionsManagement from '@/components/sections/SectionsManagement';
import StudentsManagement from '@/components/students/StudentsManagement';
import UsersManagement from '@/components/users/UsersManagement';
import AttendanceManagement from '@/components/attendance/AttendanceManagement';
import GradesManagement from '@/components/grades/GradesManagement';
import EvidencesManagement from '@/components/evidences/EvidencesManagement';
import ReportsManagement from '@/components/reports/ReportsManagement';
import CurriculumManagement from '@/components/curriculum/CurriculumManagement';
import ObservationsManagement from '@/components/observations/ObservationsManagement';
import AuditManagement from '@/components/audit/AuditManagement';
import SystemSettings from '@/components/settings/SystemSettings';
import AdminPanel from '@/components/admin/AdminPanel';
import RealTimeClock from '@/components/common/RealTimeClock';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showSystemSetup, setShowSystemSetup] = useState(false);

  // Escuchar evento para abrir configuración del sistema
  React.useEffect(() => {
    const handleOpenSystemConfig = () => {
      setShowSystemSetup(true);
    };

    window.addEventListener('openSystemConfig', handleOpenSystemConfig);
    return () => {
      window.removeEventListener('openSystemConfig', handleOpenSystemConfig);
    };
  }, []);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Cargando sistema...</p>
        </div>
      </div>
    );
  }

  // Mostrar login si no está autenticado
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
    // Si no hay usuario autenticado, mostrar panel de configuración inicial
    if (!user) {
      return (
        <div className="text-center py-20">
          <h2 className="text-2xl font-montserrat text-minerd-blue mb-4">
            Configuración Inicial del Sistema
          </h2>
          <p className="text-gray-600 font-opensans mb-6">
            Bienvenido al Sistema Escolar MINERD. Para comenzar, configura los usuarios y las secciones del sistema.
          </p>
          <div className="max-w-2xl mx-auto text-left bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold text-minerd-blue mb-4">Pasos recomendados:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Crear usuarios del sistema (Administradores, Profesores, etc.)</li>
              <li>Configurar las secciones y grados</li>
              <li>Registrar estudiantes</li>
              <li>Configurar el currículo académico</li>
            </ol>
          </div>
        </div>
      );
    }
    
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard onSectionChange={setActiveSection} />;
      case 'teacher':
        return <TeacherDashboard onSectionChange={setActiveSection} />;
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
      case 'evidences':
        return <EvidencesManagement />;
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
      case 'admin-panel':
        return <AdminPanel />;
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
    <NotificationProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <Header 
          onMenuToggle={toggleSidebar}
          isMobileMenuOpen={isSidebarOpen}
        />
        
        <div className="flex flex-1">
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={closeSidebar}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
          
          {/* Main Content */}
          <main className="flex-1 lg:ml-64 flex flex-col">
            <div className="p-6 flex-1">
              {showSystemSetup ? (
                <div>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowSystemSetup(false)}
                    className="mb-4"
                  >
                    ← Volver al Dashboard
                  </Button>
                  <SystemSetup />
                </div>
              ) : (
                renderContent()
              )}
            </div>
            <Footer />
          </main>
        </div>

        {/* Real Time Clock */}
        <RealTimeClock />
      </div>
    </NotificationProvider>
  );
};

export default Index;
