
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Award, Calculator, MessageSquare, Save, BookOpen, Target } from 'lucide-react';

interface Competencia {
  codigo: string;
  descripcion: string;
}

interface BloquePuntuaciones {
  ce1?: number;
  ce2?: number;
  ce3?: number;
}

interface StudentGrade {
  id: string;
  studentId: string;
  name: string;
  rne: string;
  avatar?: string;
  // Puntuaciones por competencia específica en cada bloque
  pc1: BloquePuntuaciones;
  pc2: BloquePuntuaciones;
  pc3: BloquePuntuaciones;
  pc4: BloquePuntuaciones;
  // Recuperaciones pedagógicas
  rp1?: number;
  rp2?: number;
  rp3?: number;
  rp4?: number;
  // Promedios calculados
  promedioPc1: number;
  promedioPc2: number;
  promedioPc3: number;
  promedioPc4: number;
  // Notas definitivas (considerando RP)
  definitivaP1: number;
  definitivaP2: number;
  definitivaP3: number;
  definitivaP4: number;
  promedioFinal: number;
  observations?: string;
}

const GradesManagement: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [observationModal, setObservationModal] = useState<{
    open: boolean;
    studentId: string;
    observations: string;
  }>({ open: false, studentId: '', observations: '' });

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

  // Competencias por asignatura (ejemplo para Lengua Española)
  const competenciasPorBloque = {
    'PC1': [
      { codigo: 'CE1', descripcion: 'Analiza textos narrativos' },
      { codigo: 'CE2', descripcion: 'Identifica ideas principales' },
      { codigo: 'CE3', descripcion: 'Comprende vocabulario contextual' }
    ],
    'PC2': [
      { codigo: 'CE1', descripcion: 'Redacta ideas con coherencia' },
      { codigo: 'CE2', descripcion: 'Utiliza conectores apropiados' },
      { codigo: 'CE3', descripcion: 'Aplica reglas ortográficas' }
    ],
    'PC3': [
      { codigo: 'CE1', descripcion: 'Interpreta textos poéticos' },
      { codigo: 'CE2', descripcion: 'Reconoce figuras literarias' },
      { codigo: 'CE3', descripcion: 'Expresa creatividad escrita' }
    ],
    'PC4': [
      { codigo: 'CE1', descripcion: 'Argumenta puntos de vista' },
      { codigo: 'CE2', descripcion: 'Estructura textos argumentativos' },
      { codigo: 'CE3', descripcion: 'Defiende posiciones críticas' }
    ]
  };

  const mockStudents: StudentGrade[] = [
    {
      id: '1',
      studentId: 'EST001',
      name: 'Ana María González',
      rne: '20240001',
      pc1: { ce1: 85, ce2: 78, ce3: 92 },
      pc2: { ce1: 80, ce2: 85, ce3: 88 },
      pc3: { ce1: 90, ce2: 87, ce3: 85 },
      pc4: { ce1: 88, ce2: 90, ce3: 92 },
      rp1: undefined,
      rp2: undefined,
      rp3: undefined,
      rp4: undefined,
      promedioPc1: 85,
      promedioPc2: 84.33,
      promedioPc3: 87.33,
      promedioPc4: 90,
      definitivaP1: 85,
      definitivaP2: 84.33,
      definitivaP3: 87.33,
      definitivaP4: 90,
      promedioFinal: 86.67,
      observations: 'Excelente participación en clase'
    },
    {
      id: '2',
      studentId: 'EST002',
      name: 'Carlos Rodríguez Pérez',
      rne: '20240002',
      pc1: { ce1: 72, ce2: 68, ce3: 75 },
      pc2: { ce1: 70, ce2: 75, ce3: 72 },
      pc3: { ce1: 78, ce2: 70, ce3: 73 },
      pc4: { ce1: 75, ce2: 77, ce3: 80 },
      rp1: undefined,
      rp2: 78,
      rp3: undefined,
      rp4: undefined,
      promedioPc1: 71.67,
      promedioPc2: 72.33,
      promedioPc3: 73.67,
      promedioPc4: 77.33,
      definitivaP1: 71.67,
      definitivaP2: 78,
      definitivaP3: 73.67,
      definitivaP4: 77.33,
      promedioFinal: 75.17,
      observations: 'Necesita refuerzo en comprensión lectora'
    }
  ];

  const loadGrades = () => {
    if (selectedSection && selectedSubject) {
      setGrades(mockStudents);
      toast({
        title: "Calificaciones cargadas",
        description: `Datos de ${selectedSubject} - ${sections.find(s => s.id === selectedSection)?.name}`,
      });
    }
  };

  const calculatePromedioBloque = (bloque: BloquePuntuaciones): number => {
    const values = Object.values(bloque).filter(v => v !== undefined && v !== null) as number[];
    if (values.length === 0) return 0;
    return Math.round((values.reduce((sum, v) => sum + v, 0) / values.length) * 100) / 100;
  };

  const calculateNotaDefinitiva = (promedioBloque: number, rp?: number): number => {
    if (rp !== undefined && rp > promedioBloque) {
      return rp;
    }
    return promedioBloque;
  };

  const calculatePromedioFinal = (grade: StudentGrade): number => {
    const definitivas = [
      grade.definitivaP1,
      grade.definitivaP2,
      grade.definitivaP3,
      grade.definitivaP4
    ].filter(d => d > 0);
    
    if (definitivas.length === 0) return 0;
    return Math.round((definitivas.reduce((sum, d) => sum + d, 0) / definitivas.length) * 100) / 100;
  };

  const updateCompetenciaGrade = (studentId: string, bloque: 'pc1' | 'pc2' | 'pc3' | 'pc4', competencia: 'ce1' | 'ce2' | 'ce3', value: number) => {
    if (value < 0 || value > 100) {
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
        updated[bloque] = { ...updated[bloque], [competencia]: value };
        
        // Recalcular promedios
        updated.promedioPc1 = calculatePromedioBloque(updated.pc1);
        updated.promedioPc2 = calculatePromedioBloque(updated.pc2);
        updated.promedioPc3 = calculatePromedioBloque(updated.pc3);
        updated.promedioPc4 = calculatePromedioBloque(updated.pc4);
        
        // Recalcular notas definitivas
        updated.definitivaP1 = calculateNotaDefinitiva(updated.promedioPc1, updated.rp1);
        updated.definitivaP2 = calculateNotaDefinitiva(updated.promedioPc2, updated.rp2);
        updated.definitivaP3 = calculateNotaDefinitiva(updated.promedioPc3, updated.rp3);
        updated.definitivaP4 = calculateNotaDefinitiva(updated.promedioPc4, updated.rp4);
        
        // Recalcular promedio final
        updated.promedioFinal = calculatePromedioFinal(updated);
        
        return updated;
      }
      return grade;
    }));
  };

  const updateRecuperacion = (studentId: string, bloque: 'rp1' | 'rp2' | 'rp3' | 'rp4', value: number | undefined) => {
    if (value !== undefined && (value < 0 || value > 100)) {
      toast({
        title: "Error",
        description: "Las calificaciones de recuperación deben estar entre 0 y 100",
        variant: "destructive"
      });
      return;
    }

    setGrades(prev => prev.map(grade => {
      if (grade.id === studentId) {
        const updated = { ...grade, [bloque]: value };
        
        // Recalcular notas definitivas
        updated.definitivaP1 = calculateNotaDefinitiva(updated.promedioPc1, updated.rp1);
        updated.definitivaP2 = calculateNotaDefinitiva(updated.promedioPc2, updated.rp2);
        updated.definitivaP3 = calculateNotaDefinitiva(updated.promedioPc3, updated.rp3);
        updated.definitivaP4 = calculateNotaDefinitiva(updated.promedioPc4, updated.rp4);
        
        // Recalcular promedio final
        updated.promedioFinal = calculatePromedioFinal(updated);
        
        return updated;
      }
      return grade;
    }));
  };

  const saveGrades = () => {
    toast({
      title: "Calificaciones guardadas",
      description: "Todas las calificaciones han sido guardadas exitosamente",
    });
  };

  const openObservationModal = (studentId: string, currentObservations: string = '') => {
    setObservationModal({
      open: true,
      studentId,
      observations: currentObservations
    });
  };

  const saveObservation = () => {
    setGrades(prev => prev.map(grade => 
      grade.id === observationModal.studentId 
        ? { ...grade, observations: observationModal.observations }
        : grade
    ));
    
    setObservationModal({ open: false, studentId: '', observations: '' });
    toast({
      title: "Observación guardada",
      description: "La observación ha sido actualizada",
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
            Sistema de calificaciones por competencias específicas
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Período Q3 Activo
        </Badge>
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
                <h4 className="font-semibold text-blue-900 mb-2">Sistema de Bloques de Competencias</h4>
                <p className="text-blue-800">
                  Cada bloque contiene competencias específicas (CE) que se evalúan individualmente. 
                  El promedio del bloque se calcula automáticamente.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Recuperación Pedagógica (RP)</h4>
                <p className="text-blue-800">
                  Si la RP es mayor que el promedio del bloque, se toma la RP como nota definitiva. 
                  El promedio final es el promedio de las 4 notas definitivas.
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
                  <div className="text-center">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <p className="text-sm text-blue-700 font-medium">Promedio Final</p>
                      <p className="text-2xl font-bold text-blue-900">{grade.promedioFinal.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                  {['PC1', 'PC2', 'PC3', 'PC4'].map((bloqueNombre, bloqueIndex) => {
                    const bloqueProp = `pc${bloqueIndex + 1}` as 'pc1' | 'pc2' | 'pc3' | 'pc4';
                    const rpProp = `rp${bloqueIndex + 1}` as 'rp1' | 'rp2' | 'rp3' | 'rp4';
                    const promedioProp = `promedioPc${bloqueIndex + 1}` as 'promedioPc1' | 'promedioPc2' | 'promedioPc3' | 'promedioPc4';
                    const definitivaProp = `definitivaP${bloqueIndex + 1}` as 'definitivaP1' | 'definitivaP2' | 'definitivaP3' | 'definitivaP4';
                    
                    return (
                      <Card key={bloqueNombre} className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center">
                            <Target className="w-4 h-4 mr-1" />
                            {bloqueNombre} - Bloque {bloqueIndex + 1}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Competencias */}
                          <div className="space-y-2">
                            <h5 className="text-xs font-semibold text-gray-600">Competencias Específicas:</h5>
                            {competenciasPorBloque[bloqueNombre as keyof typeof competenciasPorBloque].map((comp, compIndex) => (
                              <div key={comp.codigo} className="space-y-1">
                                <Badge variant="outline" className="text-xs mb-1">
                                  {comp.codigo}: {comp.descripcion}
                                </Badge>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  placeholder="0-100"
                                  value={grade[bloqueProp][`ce${compIndex + 1}` as 'ce1' | 'ce2' | 'ce3'] || ''}
                                  onChange={(e) => updateCompetenciaGrade(
                                    grade.id, 
                                    bloqueProp, 
                                    `ce${compIndex + 1}` as 'ce1' | 'ce2' | 'ce3', 
                                    Number(e.target.value)
                                  )}
                                  className="h-8 text-sm"
                                />
                              </div>
                            ))}
                          </div>
                          
                          {/* Promedio del Bloque */}
                          <div className="bg-gray-50 p-2 rounded">
                            <label className="text-xs font-semibold text-gray-600">Promedio {bloqueNombre}:</label>
                            <div className="text-lg font-bold text-blue-700">
                              {grade[promedioProp].toFixed(2)}
                            </div>
                          </div>
                          
                          {/* Recuperación Pedagógica */}
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600">RP{bloqueIndex + 1}:</label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="Opcional"
                              value={grade[rpProp] || ''}
                              onChange={(e) => updateRecuperacion(
                                grade.id, 
                                rpProp, 
                                e.target.value ? Number(e.target.value) : undefined
                              )}
                              className="h-8 text-sm"
                            />
                          </div>
                          
                          {/* Nota Definitiva */}
                          <div className="bg-green-50 p-2 rounded border border-green-200">
                            <label className="text-xs font-semibold text-green-700">Nota Definitiva:</label>
                            <div className="text-lg font-bold text-green-800">
                              {grade[definitivaProp].toFixed(2)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                
                {/* Observaciones */}
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openObservationModal(grade.id, grade.observations)}
                    className="flex items-center"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Observaciones
                  </Button>
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

      {/* Observations Modal */}
      <Dialog open={observationModal.open} onOpenChange={(open) => 
        setObservationModal(prev => ({ ...prev, open }))
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Observaciones del Estudiante</DialogTitle>
            <DialogDescription>
              Máximo 200 caracteres. Estas observaciones aparecerán en la boleta.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={observationModal.observations}
              onChange={(e) => setObservationModal(prev => ({ 
                ...prev, 
                observations: e.target.value.substring(0, 200) 
              }))}
              placeholder="Ingrese observaciones y recomendaciones..."
              className="min-h-[100px]"
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {observationModal.observations.length}/200 caracteres
              </span>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setObservationModal({ open: false, studentId: '', observations: '' })}
                >
                  Cancelar
                </Button>
                <Button onClick={saveObservation} className="bg-minerd-green hover:bg-green-700">
                  Guardar
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GradesManagement;
