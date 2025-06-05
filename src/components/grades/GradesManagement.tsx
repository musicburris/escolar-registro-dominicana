
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Award, Calculator, Save, BookOpen, Target, Settings, Plus, Trash2, FileText, History } from 'lucide-react';
import { BloqueCompetencias, RegistroAnecdotico } from '@/types/academic';

interface BloquePeriodos {
  p1?: number;
  p2?: number;
  p3?: number;
  p4?: number;
  rp1?: number;
  rp2?: number;
  rp3?: number;
  rp4?: number;
}

interface StudentGrade {
  id: string;
  studentId: string;
  name: string;
  rne: string;
  avatar?: string;
  pc1: BloquePeriodos;
  pc2: BloquePeriodos;
  pc3: BloquePeriodos;
  pc4: BloquePeriodos;
  promedioPC1: number;
  promedioPC2: number;
  promedioPC3: number;
  promedioPC4: number;
  calificacionFinal: number;
}

const GradesManagement: React.FC = () => {
  const { user } = useAuth();
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [bloquesCompetencias, setBloquesCompetencias] = useState<BloqueCompetencias[]>([]);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [anecdoticoModal, setAnecdoticoModal] = useState<{
    open: boolean;
    studentId: string;
    registros: RegistroAnecdotico[];
  }>({ open: false, studentId: '', registros: [] });
  const [auditModalOpen, setAuditModalOpen] = useState(false);

  // Mock data
  const sections = [
    { id: '1A', name: '1° A' },
    { id: '1B', name: '1° B' },
    { id: '2A', name: '2° A' },
    { id: '2B', name: '2° B' },
    { id: '3A', name: '3° A' },
    { id: '3B', name: '3° B' }
  ];

  const subjects = [
    'Lengua Española',
    'Matemática',
    'Ciencias Sociales',
    'Ciencias de la Naturaleza',
    'Inglés',
    'Educación Física',
    'Educación Artística',
    'Formación Integral'
  ];

  // Mock bloques de competencias con descripción libre
  const mockBloques: BloqueCompetencias[] = [
    {
      id: '1',
      nombre: 'Comprensión Lectora',
      codigo: 'PC1',
      subjectId: 'lengua',
      descripcionCompetencias: 'CE1: Analiza textos narrativos identificando personajes, trama y contexto.\nCE2: Identifica ideas principales y secundarias en diferentes tipos de texto.\nCE3: Comprende vocabulario contextual y deduce significados.'
    },
    {
      id: '2',
      nombre: 'Producción Escrita',
      codigo: 'PC2',
      subjectId: 'lengua',
      descripcionCompetencias: 'CE1: Redacta ideas con coherencia y cohesión textual.\nCE2: Utiliza conectores apropiados para organizar el discurso.\nCE3: Aplica reglas ortográficas y de puntuación correctamente.'
    },
    {
      id: '3',
      nombre: 'Literatura',
      codigo: 'PC3',
      subjectId: 'lengua',
      descripcionCompetencias: 'CE1: Interpreta textos poéticos y narrativos dominicanos.\nCE2: Reconoce figuras literarias y recursos estilísticos.\nCE3: Expresa creatividad escrita mediante textos literarios.'
    },
    {
      id: '4',
      nombre: 'Comunicación Oral',
      codigo: 'PC4',
      subjectId: 'lengua',
      descripcionCompetencias: 'CE1: Argumenta puntos de vista de forma clara y estructurada.\nCE2: Estructura discursos argumentativos coherentes.\nCE3: Defiende posiciones críticas con respeto y fundamentación.'
    }
  ];

  const mockStudents: StudentGrade[] = [
    {
      id: '1',
      studentId: 'EST001',
      name: 'Ana María González',
      rne: '20240001',
      pc1: { p1: 85, p2: 78, p3: 92, p4: 88 },
      pc2: { p1: 80, p2: 85, p3: 88, p4: 90 },
      pc3: { p1: 90, p2: 87, p3: 85, p4: 92 },
      pc4: { p1: 88, p2: 90, p3: 92, p4: 85 },
      promedioPC1: 85.75,
      promedioPC2: 85.75,
      promedioPC3: 88.5,
      promedioPC4: 88.75,
      calificacionFinal: 87.19
    },
    {
      id: '2',
      studentId: 'EST002',
      name: 'Carlos Rodríguez Pérez',
      rne: '20240002',
      pc1: { p1: 72, p2: 68, p3: 75, p4: 70, rp2: 78 },
      pc2: { p1: 70, p2: 75, p3: 72, p4: 80 },
      pc3: { p1: 78, p2: 70, p3: 73, p4: 75 },
      pc4: { p1: 75, p2: 77, p3: 80, p4: 78 },
      promedioPC1: 71.25,
      promedioPC2: 74.25,
      promedioPC3: 74,
      promedioPC4: 77.5,
      calificacionFinal: 74.25
    }
  ];

  const mockRegistrosAnecdoticos: RegistroAnecdotico[] = [
    {
      id: '1',
      studentId: 'EST001',
      fecha: new Date('2024-11-15'),
      incidencia: 'Participación destacada',
      tipoIncidencia: 'positiva',
      descripcion: 'Ana participó activamente en la discusión sobre literatura dominicana, demostrando comprensión profunda de los temas.',
      accionesTomadas: 'Se felicitó públicamente y se sugirió para representar la clase en el concurso de literatura.',
      registradoPor: 'Prof. María González',
      createdAt: new Date('2024-11-15')
    }
  ];

  const loadGrades = () => {
    if (selectedSection && selectedSubject) {
      setGrades(mockStudents);
      setBloquesCompetencias(mockBloques);
      toast({
        title: "Calificaciones cargadas",
        description: `Datos de ${selectedSubject} - ${sections.find(s => s.id === selectedSection)?.name}`,
      });
    }
  };

  const calculatePromedioPeriodos = (bloque: BloquePeriodos): number => {
    const periodos = ['p1', 'p2', 'p3', 'p4'] as const;
    const recuperaciones = ['rp1', 'rp2', 'rp3', 'rp4'] as const;
    
    let suma = 0;
    let count = 0;
    
    periodos.forEach((periodo, index) => {
      const valorPeriodo = bloque[periodo];
      const valorRP = bloque[recuperaciones[index]];
      
      if (valorPeriodo !== undefined) {
        const valorFinal = (valorRP !== undefined && valorRP > valorPeriodo) ? valorRP : valorPeriodo;
        suma += valorFinal;
        count++;
      }
    });
    
    return count > 0 ? Math.round((suma / count) * 100) / 100 : 0;
  };

  const calculateCalificacionFinal = (grade: StudentGrade): number => {
    const promedios = [
      grade.promedioPC1,
      grade.promedioPC2,
      grade.promedioPC3,
      grade.promedioPC4
    ].filter(p => p > 0);
    
    if (promedios.length === 0) return 0;
    return Math.round((promedios.reduce((sum, p) => sum + p, 0) / promedios.length) * 100) / 100;
  };

  const updatePeriodoGrade = (studentId: string, bloque: 'pc1' | 'pc2' | 'pc3' | 'pc4', periodo: string, value: number | undefined) => {
    if (value !== undefined && (value < 0 || value > 100)) {
      toast({
        title: "Error",
        description: "Las calificaciones deben estar entre 0 y 100",
        variant: "destructive"
      });
      return;
    }

    setGrades(prev => prev.map(grade => {
      if (grade.id === studentId) {
        const updated = { ...grade };
        updated[bloque] = { ...updated[bloque], [periodo]: value };
        
        // Recalcular promedios
        updated.promedioPC1 = calculatePromedioPeriodos(updated.pc1);
        updated.promedioPC2 = calculatePromedioPeriodos(updated.pc2);
        updated.promedioPC3 = calculatePromedioPeriodos(updated.pc3);
        updated.promedioPC4 = calculatePromedioPeriodos(updated.pc4);
        
        // Recalcular calificación final
        updated.calificacionFinal = calculateCalificacionFinal(updated);
        
        return updated;
      }
      return grade;
    }));
  };

  const updateCompetenciasBloque = (bloqueId: string, descripcion: string) => {
    if (descripcion.length > 1000) {
      toast({
        title: "Error",
        description: "La descripción no puede exceder 1000 caracteres",
        variant: "destructive"
      });
      return;
    }

    setBloquesCompetencias(prev => prev.map(bloque => 
      bloque.id === bloqueId 
        ? { ...bloque, descripcionCompetencias: descripcion }
        : bloque
    ));
  };

  const saveGrades = () => {
    toast({
      title: "Calificaciones guardadas",
      description: "Todas las calificaciones han sido guardadas exitosamente",
    });
  };

  const openRegistroAnecdotico = (studentId: string) => {
    const registros = mockRegistrosAnecdoticos.filter(r => r.studentId === studentId);
    setAnecdoticoModal({
      open: true,
      studentId,
      registros
    });
  };

  const addRegistroAnecdotico = (registro: Omit<RegistroAnecdotico, 'id' | 'createdAt'>) => {
    // Aquí se agregaría el nuevo registro
    toast({
      title: "Registro agregado",
      description: "El registro anecdótico ha sido guardado",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-title font-montserrat text-minerd-blue">
            Gestión de Calificaciones por Bloques de Competencias
          </h1>
          <p className="text-body font-opensans text-gray-600">
            Sistema de calificaciones por períodos y recuperaciones pedagógicas
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Período Q3 Activo
          </Badge>
          {user?.role === 'admin' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfigModalOpen(true)}
              className="flex items-center"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configurar Competencias
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAuditModalOpen(true)}
            className="flex items-center"
          >
            <History className="w-4 h-4 mr-2" />
            Auditoría
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="font-montserrat flex items-center">
            <Award className="mr-2 h-5 w-5" />
            Selección de Sección y Asignatura
          </CardTitle>
          <CardDescription className="font-opensans">
            Selecciona la sección y asignatura para gestionar las calificaciones por competencias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sección</label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar sección" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map(section => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name}
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
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={loadGrades}
                disabled={!selectedSection || !selectedSubject}
                className="w-full bg-minerd-blue hover:bg-blue-700"
              >
                Cargar Calificaciones
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      {grades.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Sistema de Calificación por Períodos</h4>
                <p className="text-blue-800">
                  Cada bloque (PC1-PC4) tiene 4 períodos (P1, P2, P3, P4) con opción de recuperación pedagógica (RP1-RP4). 
                  El promedio del bloque considera la mejor nota entre período y recuperación.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Calificación Final</h4>
                <p className="text-blue-800">
                  La calificación final es el promedio de los 4 bloques de competencias (PC1 + PC2 + PC3 + PC4) ÷ 4.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grades by Student */}
      {grades.length > 0 && (
        <div className="space-y-6">
          {grades.map((grade) => (
            <Card key={grade.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={grade.avatar} />
                      <AvatarFallback>
                        {grade.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{grade.name}</CardTitle>
                      <CardDescription>RNE: {grade.rne}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openRegistroAnecdotico(grade.id)}
                      className="flex items-center"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Registro Anecdótico
                    </Button>
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <p className="text-sm text-blue-700 font-medium">Calificación Final</p>
                      <p className="text-2xl font-bold text-blue-900">{grade.calificacionFinal.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                  {bloquesCompetencias.map((bloque, bloqueIndex) => {
                    const bloqueProp = `pc${bloqueIndex + 1}` as 'pc1' | 'pc2' | 'pc3' | 'pc4';
                    const promedioProp = `promedioPC${bloqueIndex + 1}` as 'promedioPC1' | 'promedioPC2' | 'promedioPC3' | 'promedioPC4';
                    
                    return (
                      <Card key={bloque.id} className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center">
                            <Target className="w-4 h-4 mr-1" />
                            {bloque.codigo} - {bloque.nombre}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Competencias */}
                          <div className="space-y-2">
                            <h5 className="text-xs font-semibold text-gray-600">Competencias:</h5>
                            <div className="bg-gray-50 p-2 rounded text-xs text-gray-700 max-h-20 overflow-y-auto">
                              {bloque.descripcionCompetencias}
                            </div>
                          </div>
                          
                          {/* Períodos */}
                          <div className="space-y-2">
                            <h5 className="text-xs font-semibold text-gray-600">Períodos:</h5>
                            <div className="grid grid-cols-2 gap-2">
                              {['p1', 'p2', 'p3', 'p4'].map((periodo) => (
                                <div key={periodo} className="space-y-1">
                                  <label className="text-xs font-medium">{periodo.toUpperCase()}:</label>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="0-100"
                                    value={grade[bloqueProp][periodo as keyof BloquePeriodos] || ''}
                                    onChange={(e) => updatePeriodoGrade(
                                      grade.id, 
                                      bloqueProp, 
                                      periodo, 
                                      e.target.value ? Number(e.target.value) : undefined
                                    )}
                                    className="h-8 text-sm"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Recuperaciones */}
                          <div className="space-y-2">
                            <h5 className="text-xs font-semibold text-gray-600">Recuperaciones:</h5>
                            <div className="grid grid-cols-2 gap-2">
                              {['rp1', 'rp2', 'rp3', 'rp4'].map((rp) => (
                                <div key={rp} className="space-y-1">
                                  <label className="text-xs font-medium">{rp.toUpperCase()}:</label>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="Opcional"
                                    value={grade[bloqueProp][rp as keyof BloquePeriodos] || ''}
                                    onChange={(e) => updatePeriodoGrade(
                                      grade.id, 
                                      bloqueProp, 
                                      rp, 
                                      e.target.value ? Number(e.target.value) : undefined
                                    )}
                                    className="h-8 text-sm"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Promedio del Bloque */}
                          <div className="bg-green-50 p-2 rounded border border-green-200">
                            <label className="text-xs font-semibold text-green-700">Promedio {bloque.codigo}:</label>
                            <div className="text-lg font-bold text-green-800">
                              {grade[promedioProp].toFixed(2)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Save Button */}
          <div className="flex justify-center">
            <Button 
              onClick={saveGrades}
              className="bg-minerd-green hover:bg-green-700 flex items-center px-8"
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar Todas las Calificaciones
            </Button>
          </div>
        </div>
      )}

      {/* Configuration Modal - Solo para administradores */}
      {user?.role === 'admin' && (
        <Dialog open={configModalOpen} onOpenChange={setConfigModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Configuración Curricular - Bloques de Competencias</DialogTitle>
              <DialogDescription>
                Configura las competencias para cada bloque de la asignatura seleccionada (máximo 1000 caracteres por bloque)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {bloquesCompetencias.map((bloque) => (
                <Card key={bloque.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{bloque.codigo} - {bloque.nombre}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Competencias del Bloque:</label>
                      <Textarea
                        value={bloque.descripcionCompetencias}
                        onChange={(e) => updateCompetenciasBloque(bloque.id, e.target.value)}
                        placeholder="Describe las competencias de este bloque..."
                        className="min-h-[120px]"
                        maxLength={1000}
                      />
                      <div className="text-xs text-gray-500">
                        {bloque.descripcionCompetencias.length}/1000 caracteres
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setConfigModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => {
                  setConfigModalOpen(false);
                  toast({
                    title: "Configuración guardada",
                    description: "Los bloques de competencias han sido actualizados",
                  });
                }}>
                  Guardar Configuración
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Resto de modales... */}
    </div>
  );
};

export default GradesManagement;
