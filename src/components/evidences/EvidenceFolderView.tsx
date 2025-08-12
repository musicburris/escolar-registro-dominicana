
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Folder,
  FolderOpen,
  FileImage,
  FileVideo,
  FileText,
  Users,
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type FolderItem = {
  id: string;
  title: string;
  description: string;
  competenceBlock: 'pc1' | 'pc2' | 'pc3' | 'pc4';
  studentsCount: number;
  evidencesCount: number;
  completedCount: number;
  pendingCount: number;
  date: string;
  recentActivity: string;
  files: { type: 'image' | 'video' | 'document' | 'audio'; count: number }[];
};

interface EvidenceFolderViewProps {
  period: 'p1' | 'p2' | 'p3' | 'p4';
  onCreateFolder: () => void;
  folders?: FolderItem[];
}

const EvidenceFolderView: React.FC<EvidenceFolderViewProps> = ({
  period,
  onCreateFolder,
  folders: foldersData
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompetence, setSelectedCompetence] = useState<string>('all');

  // Mock data - carpetas de evidencias
  const defaultFolders = [
    {
      id: '1',
      title: 'Proyecto de Volcanes',
      description: 'Investigación sobre volcanes y actividad geológica',
      competenceBlock: 'pc1',
      studentsCount: 25,
      evidencesCount: 47,
      completedCount: 22,
      pendingCount: 3,
      date: '2024-03-15',
      recentActivity: '2024-03-20',
      files: [
        { type: 'image', count: 23 },
        { type: 'video', count: 8 },
        { type: 'document', count: 16 }
      ]
    },
    {
      id: '2',
      title: 'Experimentos de Química',
      description: 'Reacciones químicas básicas y observaciones',
      competenceBlock: 'pc2',
      studentsCount: 25,
      evidencesCount: 38,
      completedCount: 20,
      pendingCount: 5,
      date: '2024-03-10',
      recentActivity: '2024-03-18',
      files: [
        { type: 'image', count: 15 },
        { type: 'video', count: 12 },
        { type: 'document', count: 11 }
      ]
    },
    {
      id: '3',
      title: 'Matemáticas Aplicadas',
      description: 'Resolución de problemas matemáticos del entorno',
      competenceBlock: 'pc1',
      studentsCount: 25,
      evidencesCount: 52,
      completedCount: 25,
      pendingCount: 0,
      date: '2024-03-05',
      recentActivity: '2024-03-19',
      files: [
        { type: 'image', count: 30 },
        { type: 'video', count: 5 },
        { type: 'document', count: 17 }
      ]
    }
  ];

  const competenceBlocks = [
    { value: 'all', label: 'Todos los Bloques' },
    { value: 'pc1', label: 'PC1 - Primer Bloque' },
    { value: 'pc2', label: 'PC2 - Segundo Bloque' },
    { value: 'pc3', label: 'PC3 - Tercer Bloque' },
    { value: 'pc4', label: 'PC4 - Cuarto Bloque' }
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <FileImage className="w-4 h-4" />;
      case 'video': return <FileVideo className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getCompletionColor = (completed: number, total: number) => {
    const percentage = (completed / total) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const handleViewFolder = (folderId: string) => {
    toast({
      title: "Abriendo carpeta",
      description: "Cargando evidencias de la carpeta seleccionada",
    });
  };

  const handleEditFolder = (folderId: string) => {
    toast({
      title: "Editar carpeta",
      description: "Función de edición disponible próximamente",
    });
  };

  const handleDeleteFolder = (folderId: string) => {
    toast({
      title: "Eliminar carpeta",
      description: "¿Estás seguro de que deseas eliminar esta carpeta?",
      variant: "destructive"
    });
  };

  const dataFolders = foldersData ?? defaultFolders;
  const filteredFolders = dataFolders.filter(folder => {
    const matchesSearch = folder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         folder.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompetence = selectedCompetence === 'all' || folder.competenceBlock === selectedCompetence;
    return matchesSearch && matchesCompetence;
  });

  return (
    <div className="space-y-6">
      {/* Controles de Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar carpetas de evidencias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCompetence}
          onChange={(e) => setSelectedCompetence(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background"
        >
          {competenceBlocks.map(block => (
            <option key={block.value} value={block.value}>
              {block.label}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de Carpetas */}
      {filteredFolders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-20">
            <Folder className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No hay carpetas</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'No se encontraron carpetas que coincidan con tu búsqueda' : 'Crea tu primera carpeta de evidencias'}
            </p>
            <Button onClick={onCreateFolder} className="gap-2">
              <Folder className="w-4 h-4" />
              Nueva Carpeta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFolders.map((folder) => (
            <Card key={folder.id} className="hover:shadow-lg transition-all hover:scale-105 group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 flex items-center gap-2">
                      <FolderOpen className="w-5 h-5 text-primary" />
                      {folder.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {folder.description}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {folder.competenceBlock.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Estadísticas */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{folder.studentsCount} estudiantes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{new Date(folder.date).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Progreso */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso</span>
                    <span className={getCompletionColor(folder.completedCount, folder.studentsCount)}>
                      {folder.completedCount}/{folder.studentsCount}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(folder.completedCount / folder.studentsCount) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      {folder.completedCount} completados
                    </span>
                    {folder.pendingCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-orange-600" />
                        {folder.pendingCount} pendientes
                      </span>
                    )}
                  </div>
                </div>

                {/* Tipos de Archivos */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Archivos:</span>
                  <div className="flex items-center gap-3">
                    {folder.files.map((fileType, index) => (
                      <div key={index} className="flex items-center gap-1">
                        {getFileIcon(fileType.type)}
                        <span>{fileType.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-2"
                    onClick={() => handleViewFolder(folder.id)}
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => handleEditFolder(folder.id)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteFolder(folder.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EvidenceFolderView;
