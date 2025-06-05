import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { BookOpen, Settings, Plus, Edit, Trash2, Save, Target } from 'lucide-react';
import { BloqueCompetencias } from '@/types/academic';

interface Subject {
  id: string;
  name: string;
  code: string;
  grade: string;
  description: string;
  hoursPerWeek: number;
}

const CurriculumManagement: React.FC = () => {
  const { user } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [competenciaModalOpen, setCompetenciaModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingCompetencia, setEditingCompetencia] = useState<BloqueCompetencias | null>(null);

  // Solo administradores pueden acceder
  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-montserrat text-minerd-blue mb-4">
          Acceso Restringido
        </h2>
        <p className="text-gray-600 font-opensans">
          Solo los administradores pueden acceder a la configuración curricular
        </p>
      </div>
    );
  }

  const grades = ['1°', '2°', '3°', '4°', '5°', '6°'];
  
  const mockSubjects: Subject[] = [
    {
      id: '1',
      name: 'Lengua Española',
      code: 'LE',
      grade: '1°',
      description: 'Desarrollo de competencias comunicativas y lingüísticas',
      hoursPerWeek: 8
    },
    {
      id: '2',
      name: 'Matemática',
      code: 'MAT',
      grade: '1°',
      description: 'Desarrollo del pensamiento lógico-matemático',
      hoursPerWeek: 8
    },
    {
      id: '3',
      name: 'Ciencias Sociales',
      code: 'CS',
      grade: '1°',
      description: 'Comprensión del entorno social y cultural',
      hoursPerWeek: 4
    },
    {
      id: '4',
      name: 'Ciencias de la Naturaleza',
      code: 'CN',
      grade: '1°',
      description: 'Exploración y comprensión del mundo natural',
      hoursPerWeek: 4
    }
  ];

  const mockCompetencias: BloqueCompetencias[] = [
    {
      id: '1',
      nombre: 'Comprensión Lectora',
      codigo: 'PC1',
      subjectId: '1',
      descripcionCompetencias: 'Desarrolla la capacidad de leer, comprender e interpretar diferentes tipos de textos, identificando ideas principales, secundarias y elementos implícitos.'
    },
    {
      id: '2',
      nombre: 'Producción Escrita',
      codigo: 'PC2',
      subjectId: '1',
      descripcionCompetencias: 'Produce textos escritos coherentes y cohesivos, aplicando las reglas ortográficas y gramaticales, expresando ideas con claridad y creatividad.'
    },
    {
      id: '3',
      nombre: 'Literatura',
      codigo: 'PC3',
      subjectId: '1',
      descripcionCompetencias: 'Aprecia y analiza textos literarios dominicanos y universales, reconociendo géneros, figuras literarias y contextos histórico-culturales.'
    },
    {
      id: '4',
      nombre: 'Comunicación Oral',
      codigo: 'PC4',
      subjectId: '1',
      descripcionCompetencias: 'Desarrolla habilidades de expresión oral, argumentación y debate, comunicándose de manera efectiva en diferentes contextos.'
    }
  ];

  const [subjects, setSubjects] = useState<Subject[]>(mockSubjects);
  const [competencias, setCompetencias] = useState<BloqueCompetencias[]>(mockCompetencias);

  const filteredSubjects = selectedGrade 
    ? subjects.filter(s => s.grade === selectedGrade)
    : subjects;

  const filteredCompetencias = selectedSubject
    ? competencias.filter(c => c.subjectId === selectedSubject)
    : [];

  const handleSaveSubject = (subject: Omit<Subject, 'id'>) => {
    if (editingSubject) {
      setSubjects(prev => prev.map(s => 
        s.id === editingSubject.id 
          ? { ...subject, id: editingSubject.id }
          : s
      ));
      toast({
        title: "Asignatura actualizada",
        description: "La asignatura ha sido actualizada exitosamente",
      });
    } else {
      const newSubject: Subject = {
        ...subject,
        id: Date.now().toString()
      };
      setSubjects(prev => [...prev, newSubject]);
      toast({
        title: "Asignatura creada",
        description: "La asignatura ha sido creada exitosamente",
      });
    }
    setSubjectModalOpen(false);
    setEditingSubject(null);
  };

  const handleSaveCompetencia = (competencia: Omit<BloqueCompetencias, 'id'>) => {
    if (editingCompetencia) {
      setCompetencias(prev => prev.map(c => 
        c.id === editingCompetencia.id 
          ? { ...competencia, id: editingCompetencia.id }
          : c
      ));
      toast({
        title: "Competencia actualizada",
        description: "La competencia ha sido actualizada exitosamente",
      });
    } else {
      const newCompetencia: BloqueCompetencias = {
        ...competencia,
        id: Date.now().toString()
      };
      setCompetencias(prev => [...prev, newCompetencia]);
      toast({
        title: "Competencia creada",
        description: "La competencia ha sido creada exitosamente",
      });
    }
    setCompetenciaModalOpen(false);
    setEditingCompetencia(null);
  };

  const deleteSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    setCompetencias(prev => prev.filter(c => c.subjectId !== id));
    toast({
      title: "Asignatura eliminada",
      description: "La asignatura y sus competencias han sido eliminadas",
    });
  };

  const deleteCompetencia = (id: string) => {
    setCompetencias(prev => prev.filter(c => c.id !== id));
    toast({
      title: "Competencia eliminada",
      description: "La competencia ha sido eliminada",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-title font-montserrat text-minerd-blue">
            Configuración Curricular
          </h1>
          <p className="text-body font-opensans text-gray-600">
            Gestión de asignaturas y competencias por grado
          </p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Configuración Activa
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="font-montserrat flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Filtros de Configuración
          </CardTitle>
          <CardDescription className="font-opensans">
            Selecciona el grado y asignatura para configurar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Grado</label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar grado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los grados</SelectItem>
                  {grades.map(grade => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Asignatura</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar asignatura" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las asignaturas</SelectItem>
                  {filteredSubjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subjects Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-montserrat flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Asignaturas ({filteredSubjects.length})
              </CardTitle>
              <CardDescription className="font-opensans">
                Configuración de asignaturas por grado
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                setEditingSubject(null);
                setSubjectModalOpen(true);
              }}
              className="bg-minerd-blue hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Asignatura
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {filteredSubjects.map(subject => (
              <Card key={subject.id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{subject.name}</h3>
                        <Badge variant="outline">{subject.code}</Badge>
                        <Badge variant="secondary">{subject.grade}</Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{subject.description}</p>
                      <p className="text-sm text-gray-500">
                        {subject.hoursPerWeek} horas por semana
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingSubject(subject);
                          setSubjectModalOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteSubject(subject.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Competencias Management */}
      {selectedSubject && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="font-montserrat flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  Bloques de Competencias ({filteredCompetencias.length})
                </CardTitle>
                <CardDescription className="font-opensans">
                  Configuración de competencias para {filteredSubjects.find(s => s.id === selectedSubject)?.name}
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  setEditingCompetencia(null);
                  setCompetenciaModalOpen(true);
                }}
                className="bg-minerd-green hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Competencia
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {filteredCompetencias.map(competencia => (
                <Card key={competencia.id} className="border-l-4 border-l-green-500">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{competencia.nombre}</h3>
                          <Badge variant="outline">{competencia.codigo}</Badge>
                        </div>
                        <p className="text-gray-600 text-sm">{competencia.descripcionCompetencias}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingCompetencia(competencia);
                            setCompetenciaModalOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteCompetencia(competencia.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subject Modal */}
      <SubjectModal
        open={subjectModalOpen}
        onOpenChange={setSubjectModalOpen}
        onSave={handleSaveSubject}
        editingSubject={editingSubject}
        grades={grades}
      />

      {/* Competencia Modal */}
      <CompetenciaModal
        open={competenciaModalOpen}
        onOpenChange={setCompetenciaModalOpen}
        onSave={handleSaveCompetencia}
        editingCompetencia={editingCompetencia}
        subjectId={selectedSubject}
      />
    </div>
  );
};

// Subject Modal Component
interface SubjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (subject: Omit<Subject, 'id'>) => void;
  editingSubject: Subject | null;
  grades: string[];
}

const SubjectModal: React.FC<SubjectModalProps> = ({
  open,
  onOpenChange,
  onSave,
  editingSubject,
  grades
}) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    grade: '',
    description: '',
    hoursPerWeek: 4
  });

  React.useEffect(() => {
    if (editingSubject) {
      setFormData({
        name: editingSubject.name,
        code: editingSubject.code,
        grade: editingSubject.grade,
        description: editingSubject.description,
        hoursPerWeek: editingSubject.hoursPerWeek
      });
    } else {
      setFormData({
        name: '',
        code: '',
        grade: '',
        description: '',
        hoursPerWeek: 4
      });
    }
  }, [editingSubject, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.grade) return;
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingSubject ? 'Editar Asignatura' : 'Nueva Asignatura'}
          </DialogTitle>
          <DialogDescription>
            Configura los datos de la asignatura
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre de la Asignatura</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Lengua Española"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Código</label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                placeholder="Ej: LE"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Grado</label>
              <Select value={formData.grade} onValueChange={(value) => setFormData(prev => ({ ...prev, grade: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar grado" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map(grade => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Horas por Semana</label>
              <Input
                type="number"
                min="1"
                max="20"
                value={formData.hoursPerWeek}
                onChange={(e) => setFormData(prev => ({ ...prev, hoursPerWeek: Number(e.target.value) }))}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción de la asignatura..."
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-minerd-blue hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {editingSubject ? 'Actualizar' : 'Crear'} Asignatura
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Competencia Modal Component
interface CompetenciaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (competencia: Omit<BloqueCompetencias, 'id'>) => void;
  editingCompetencia: BloqueCompetencias | null;
  subjectId: string;
}

const CompetenciaModal: React.FC<CompetenciaModalProps> = ({
  open,
  onOpenChange,
  onSave,
  editingCompetencia,
  subjectId
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    descripcionCompetencias: ''
  });

  React.useEffect(() => {
    if (editingCompetencia) {
      setFormData({
        nombre: editingCompetencia.nombre,
        codigo: editingCompetencia.codigo,
        descripcionCompetencias: editingCompetencia.descripcionCompetencias
      });
    } else {
      setFormData({
        nombre: '',
        codigo: '',
        descripcionCompetencias: ''
      });
    }
  }, [editingCompetencia, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.codigo || !formData.descripcionCompetencias) return;
    onSave({
      ...formData,
      subjectId
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingCompetencia ? 'Editar Competencia' : 'Nueva Competencia'}
          </DialogTitle>
          <DialogDescription>
            Configura el bloque de competencias
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre del Bloque</label>
              <Input
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Ej: Comprensión Lectora"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Código</label>
              <Input
                value={formData.codigo}
                onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                placeholder="Ej: PC1"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción de Competencias (máx. 1000 caracteres)</label>
            <Textarea
              value={formData.descripcionCompetencias}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcionCompetencias: e.target.value }))}
              placeholder="Describe las competencias que se desarrollarán en este bloque..."
              className="min-h-[150px]"
              maxLength={1000}
              required
            />
            <div className="text-xs text-gray-500">
              {formData.descripcionCompetencias.length}/1000 caracteres
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-minerd-green hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              {editingCompetencia ? 'Actualizar' : 'Crear'} Competencia
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CurriculumManagement;
