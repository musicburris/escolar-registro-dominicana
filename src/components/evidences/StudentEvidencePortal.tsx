
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FolderOpen,
  FileImage,
  FileVideo,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Eye,
  Award,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const StudentEvidencePortal: React.FC = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'p1' | 'p2' | 'p3' | 'p4'>('p1');

  // Mock data - evidencias del estudiante
  const studentEvidences = {
    p1: [
      {
        id: '1',
        title: 'Proyecto de Volcanes',
        subject: 'Ciencias Naturales',
        competenceBlock: 'pc1',
        status: 'completed',
        submittedDate: '2024-03-15',
        teacherNotes: 'Excelente trabajo, muy creativo y bien documentado.',
        files: [
          { id: '1', name: 'volcan_maqueta.jpg', type: 'image', url: '#' },
          { id: '2', name: 'explicacion_video.mp4', type: 'video', url: '#' },
          { id: '3', name: 'investigacion.pdf', type: 'document', url: '#' }
        ],
        grade: 'A'
      },
      {
        id: '2',
        title: 'Experimentos de Química',
        subject: 'Ciencias Naturales',
        competenceBlock: 'pc2',
        status: 'completed',
        submittedDate: '2024-03-10',
        teacherNotes: 'Buen trabajo en equipo, observaciones detalladas.',
        files: [
          { id: '4', name: 'experimento1.jpg', type: 'image', url: '#' },
          { id: '5', name: 'reporte.docx', type: 'document', url: '#' }
        ],
        grade: 'B+'
      },
      {
        id: '3',
        title: 'Matemáticas del Entorno',
        subject: 'Matemática',
        competenceBlock: 'pc1',
        status: 'not_completed',
        dueDate: '2024-03-25',
        teacherNotes: 'Actividad pendiente de entrega.',
        files: [],
        grade: null
      }
    ]
  };

  const periods = [
    { value: 'p1', label: 'Período 1', color: 'bg-blue-500' },
    { value: 'p2', label: 'Período 2', color: 'bg-green-500' },
    { value: 'p3', label: 'Período 3', color: 'bg-orange-500' },
    { value: 'p4', label: 'Período 4', color: 'bg-purple-500' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'not_completed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-orange-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'not_completed':
        return 'No Realizado';
      default:
        return 'En Progreso';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'not_completed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <FileImage className="w-4 h-4" />;
      case 'video': return <FileVideo className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleDownloadFile = (fileId: string, fileName: string) => {
    toast({
      title: "Descargando archivo",
      description: `Iniciando descarga de ${fileName}`,
    });
  };

  const handleViewFile = (fileId: string, fileName: string) => {
    toast({
      title: "Abriendo archivo",
      description: `Visualizando ${fileName}`,
    });
  };

  const currentEvidences = studentEvidences[selectedPeriod] || [];
  const completedCount = currentEvidences.filter(e => e.status === 'completed').length;
  const pendingCount = currentEvidences.filter(e => e.status === 'not_completed').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-title font-montserrat text-primary">
          Mi Carpeta de Evidencias
        </h1>
        <p className="text-body font-opensans text-muted-foreground">
          Revisa todas tus actividades y trabajos realizados durante el año escolar
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-all hover:scale-105">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{completedCount}</div>
            <div className="text-sm text-muted-foreground">Completadas</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all hover:scale-105">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">{pendingCount}</div>
            <div className="text-sm text-muted-foreground">Pendientes</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all hover:scale-105">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {currentEvidences.reduce((acc, e) => acc + e.files.length, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Archivos</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all hover:scale-105">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {Math.round((completedCount / Math.max(currentEvidences.length, 1)) * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Progreso</div>
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

      {/* Evidence List */}
      <div className="space-y-6">
        {currentEvidences.length === 0 ? (
          <Card>
            <CardContent className="text-center py-20">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No hay evidencias</h3>
              <p className="text-muted-foreground">
                No tienes actividades registradas en este período
              </p>
            </CardContent>
          </Card>
        ) : (
          currentEvidences.map((evidence) => (
            <Card key={evidence.id} className="hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 flex items-center gap-3">
                      {getStatusIcon(evidence.status)}
                      {evidence.title}
                      {evidence.grade && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          <Award className="w-3 h-3 mr-1" />
                          {evidence.grade}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span>{evidence.subject}</span>
                      <Badge variant="outline">{evidence.competenceBlock.toUpperCase()}</Badge>
                      <Badge className={getStatusColor(evidence.status)}>
                        {getStatusText(evidence.status)}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Dates */}
                <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
                  {evidence.submittedDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Entregado: {new Date(evidence.submittedDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {evidence.dueDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Fecha límite: {new Date(evidence.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Teacher Notes */}
                {evidence.teacherNotes && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Comentarios del Docente:</p>
                    <p className="text-sm text-muted-foreground">{evidence.teacherNotes}</p>
                  </div>
                )}

                {/* Files */}
                {evidence.files.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Archivos ({evidence.files.length}):</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {evidence.files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                          <div className="flex items-center gap-2">
                            {getFileIcon(file.type)}
                            <span className="text-sm font-medium">{file.name}</span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewFile(file.id, file.name)}
                              className="gap-1"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadFile(file.id, file.name)}
                              className="gap-1"
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentEvidencePortal;
