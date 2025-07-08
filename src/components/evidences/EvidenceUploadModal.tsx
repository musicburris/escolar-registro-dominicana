
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  FileImage,
  FileVideo,
  FileText,
  File,
  X,
  Plus,
  Users,
  CheckCircle,
  XCircle,
  Calendar
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EvidenceUploadModalProps {
  period: 'p1' | 'p2' | 'p3' | 'p4';
  onClose: () => void;
  onSuccess: () => void;
}

const EvidenceUploadModal: React.FC<EvidenceUploadModalProps> = ({
  period,
  onClose,
  onSuccess
}) => {
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  const [competenceBlock, setCompetenceBlock] = useState<'pc1' | 'pc2' | 'pc3' | 'pc4'>('pc1');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data - estudiantes
  const students = [
    { id: '1', name: 'Ana María García', status: 'active' },
    { id: '2', name: 'Carlos López', status: 'active' },
    { id: '3', name: 'María José Rodríguez', status: 'active' },
    { id: '4', name: 'Juan Carlos Pérez', status: 'active' },
    { id: '5', name: 'Sofia Martínez', status: 'active' }
  ];

  const competenceBlocks = [
    { value: 'pc1', label: 'PC1 - Primer Bloque' },
    { value: 'pc2', label: 'PC2 - Segundo Bloque' },
    { value: 'pc3', label: 'PC3 - Tercer Bloque' },
    { value: 'pc4', label: 'PC4 - Cuarto Bloque' }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      const validTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain', 'audio/mp3', 'audio/wav'
      ];
      return validTypes.includes(file.type) && file.size <= 50 * 1024 * 1024; // 50MB max
    });

    if (validFiles.length !== newFiles.length) {
      toast({
        title: "Algunos archivos no son compatibles",
        description: "Solo se admiten imágenes, videos, documentos y audios menores a 50MB",
        variant: "destructive"
      });
    }

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <FileImage className="w-4 h-4" />;
    if (fileType.startsWith('video/')) return <FileVideo className="w-4 h-4" />;
    if (fileType.includes('pdf') || fileType.includes('document')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAllStudents = () => {
    setSelectedStudents(students.map(s => s.id));
  };

  const clearStudentSelection = () => {
    setSelectedStudents([]);
  };

  const handleSubmit = async () => {
    if (!activityTitle.trim()) {
      toast({
        title: "Campo requerido",
        description: "El título de la actividad es obligatorio",
        variant: "destructive"
      });
      return;
    }

    if (selectedStudents.length === 0) {
      toast({
        title: "Selecciona estudiantes",
        description: "Debes seleccionar al menos un estudiante",
        variant: "destructive"
      });
      return;
    }

    // Simular la creación de evidencias
    toast({
      title: "Creando evidencias...",
      description: `Procesando ${files.length} archivos para ${selectedStudents.length} estudiantes`,
    });

    // Simular tiempo de procesamiento
    setTimeout(() => {
      onSuccess();
      toast({
        title: "¡Evidencias creadas exitosamente!",
        description: `Se crearon evidencias para ${selectedStudents.length} estudiantes en ${period.toUpperCase()}`,
      });
    }, 2000);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-montserrat flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Nueva Carpeta de Evidencias - {period.toUpperCase()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información de la Actividad */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información de la Actividad</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título de la Actividad *</Label>
                <Input
                  id="title"
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  placeholder="Ej: Proyecto de Ciencias - Volcanes"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="block">Bloque de Competencias</Label>
                <Select value={competenceBlock} onValueChange={(value: 'pc1' | 'pc2' | 'pc3' | 'pc4') => setCompetenceBlock(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {competenceBlocks.map(block => (
                      <SelectItem key={block.value} value={block.value}>
                        {block.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción de la Actividad</Label>
              <Textarea
                id="description"
                value={activityDescription}
                onChange={(e) => setActivityDescription(e.target.value)}
                placeholder="Describe la actividad y los objetivos de aprendizaje..."
                rows={3}
              />
            </div>
          </div>

          {/* Subida de Archivos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Archivos de Evidencia</h3>
            
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-primary bg-primary/10' 
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                Arrastra archivos aquí o haz clic para seleccionar
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Soporta imágenes, videos, documentos y audios (máx. 50MB por archivo)
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Seleccionar Archivos
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx,.txt,audio/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>

            {/* Lista de Archivos */}
            {files.length > 0 && (
              <div className="space-y-2">
                <Label>Archivos Seleccionados ({files.length})</Label>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        {getFileIcon(file.type)}
                        <span className="text-sm">{file.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {(file.size / 1024 / 1024).toFixed(1)} MB
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Selección de Estudiantes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Estudiantes</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllStudents}>
                  Seleccionar Todos
                </Button>
                <Button variant="outline" size="sm" onClick={clearStudentSelection}>
                  Limpiar
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {students.map(student => (
                <div
                  key={student.id}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedStudents.includes(student.id)
                      ? 'border-primary bg-primary/10'
                      : 'border-muted hover:border-primary/50'
                  }`}
                  onClick={() => toggleStudent(student.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      selectedStudents.includes(student.id)
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    }`}>
                      {selectedStudents.includes(student.id) && (
                        <CheckCircle className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="font-medium">{student.name}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {selectedStudents.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                {selectedStudents.length} estudiantes seleccionados
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Crear Evidencias
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EvidenceUploadModal;
