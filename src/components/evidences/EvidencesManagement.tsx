
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FolderPlus,
  Upload,
  FileImage,
  FileVideo,
  FileText,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  Filter
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import EvidenceUploadModal from './EvidenceUploadModal';
import EvidenceFolderView from './EvidenceFolderView';
import StudentEvidencePortal from './StudentEvidencePortal';

const EvidencesManagement: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('folders');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'p1' | 'p2' | 'p3' | 'p4'>('p1');
  const [selectedSection, setSelectedSection] = useState<string>('');

  // Mock data - En producción vendría de la base de datos
  const evidenceStats = {
    totalFolders: 24,
    totalEvidences: 156,
    completedActivities: 134,
    pendingActivities: 18,
    notCompletedActivities: 4,
    recentUploads: 12
  };

  const periods = [
    { value: 'p1', label: 'Período 1', color: 'bg-blue-500' },
    { value: 'p2', label: 'Período 2', color: 'bg-green-500' },
    { value: 'p3', label: 'Período 3', color: 'bg-orange-500' },
    { value: 'p4', label: 'Período 4', color: 'bg-purple-500' }
  ];

  const competenceBlocks = [
    { value: 'pc1', label: 'PC1', description: 'Primer bloque de competencias' },
    { value: 'pc2', label: 'PC2', description: 'Segundo bloque de competencias' },
    { value: 'pc3', label: 'PC3', description: 'Tercer bloque de competencias' },
    { value: 'pc4', label: 'PC4', description: 'Cuarto bloque de competencias' }
  ];

  const handleCreateFolder = () => {
    setShowUploadModal(true);
    toast({
      title: "Crear nueva carpeta",
      description: "Iniciando creación de carpeta de evidencias",
    });
  };

  const handleQuickUpload = () => {
    toast({
      title: "Subida rápida",
      description: "Función de subida rápida disponible próximamente",
    });
  };

  if (user?.role === 'student') {
    return <StudentEvidencePortal />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-title font-montserrat text-primary">
            Carpetas de Evidencias
          </h1>
          <p className="text-body font-opensans text-muted-foreground">
            Gestiona y organiza las evidencias de trabajo de tus estudiantes
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleQuickUpload} variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Subida Rápida
          </Button>
          <Button onClick={handleCreateFolder} className="gap-2 bg-primary hover:bg-primary/90">
            <FolderPlus className="w-4 h-4" />
            Nueva Carpeta
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="hover:shadow-lg transition-all hover:scale-105">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">{evidenceStats.totalFolders}</div>
              <div className="text-sm text-muted-foreground">Carpetas</div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all hover:scale-105">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-secondary">{evidenceStats.totalEvidences}</div>
              <div className="text-sm text-muted-foreground">Evidencias</div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all hover:scale-105">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-green-600">{evidenceStats.completedActivities}</div>
              <div className="text-sm text-muted-foreground">Completadas</div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all hover:scale-105">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-orange-600">{evidenceStats.pendingActivities}</div>
              <div className="text-sm text-muted-foreground">Pendientes</div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all hover:scale-105">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-red-600">{evidenceStats.notCompletedActivities}</div>
              <div className="text-sm text-muted-foreground">No Realizadas</div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all hover:scale-105">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-blue-600">{evidenceStats.recentUploads}</div>
              <div className="text-sm text-muted-foreground">Recientes</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Seleccionar Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {periods.map((period) => (
              <Button
                key={period.value}
                variant={selectedPeriod === period.value ? "default" : "outline"}
                className={`h-16 flex-col gap-2 ${
                  selectedPeriod === period.value ? period.color + ' text-white' : ''
                }`}
                onClick={() => setSelectedPeriod(period.value as 'p1' | 'p2' | 'p3' | 'p4')}
              >
                <Calendar className="w-5 h-5" />
                <span>{period.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="folders" className="gap-2">
            <FolderPlus className="w-4 h-4" />
            Carpetas
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-2">
            <Clock className="w-4 h-4" />
            Línea de Tiempo
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <Eye className="w-4 h-4" />
            Análisis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="folders" className="space-y-6">
          <EvidenceFolderView 
            period={selectedPeriod}
            onCreateFolder={handleCreateFolder}
          />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Línea de Tiempo de Evidencias</CardTitle>
              <CardDescription>
                Visualiza cronológicamente todas las actividades y evidencias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-20">
                <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Línea de Tiempo</h3>
                <p className="text-muted-foreground">
                  Vista cronológica de evidencias - Próximamente
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análisis y Reportes</CardTitle>
              <CardDescription>
                Estadísticas detalladas del progreso de los estudiantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-20">
                <Eye className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Panel de Análisis</h3>
                <p className="text-muted-foreground">
                  Reportes y estadísticas avanzadas - Próximamente
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Modal */}
      {showUploadModal && (
        <EvidenceUploadModal
          period={selectedPeriod}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            toast({
              title: "Evidencia creada",
              description: "La carpeta de evidencias ha sido creada exitosamente",
            });
          }}
        />
      )}
    </div>
  );
};

export default EvidencesManagement;
