
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Award, Calculator, MessageSquare, Save, RefreshCw } from 'lucide-react';

interface StudentGrade {
  id: string;
  studentId: string;
  name: string;
  rne: string;
  avatar?: string;
  p1?: number;
  p2?: number;
  p3?: number;
  p4?: number;
  rp1?: number;
  rp2?: number;
  rp3?: number;
  rp4?: number;
  blockAverage: number;
  finalAverage: number;
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

  const mockStudents: StudentGrade[] = [
    {
      id: '1',
      studentId: 'EST001',
      name: 'Ana María González',
      rne: '20240001',
      p1: 85,
      p2: 78,
      p3: 92,
      p4: 88,
      rp1: undefined,
      rp2: 82,
      rp3: undefined,
      rp4: undefined,
      blockAverage: 86.75,
      finalAverage: 86.75,
      observations: 'Excelente participación en clase'
    },
    {
      id: '2',
      studentId: 'EST002',
      name: 'Carlos Rodríguez Pérez',
      rne: '20240002',
      p1: 72,
      p2: 68,
      p3: 75,
      p4: 70,
      rp1: undefined,
      rp2: 75,
      rp3: undefined,
      rp4: undefined,
      blockAverage: 72.5,
      finalAverage: 72.5,
      observations: 'Necesita refuerzo en comprensión lectora'
    },
    {
      id: '3',
      studentId: 'EST003',
      name: 'María José Martínez',
      rne: '20240003',
      p1: 95,
      p2: 90,
      p3: 88,
      p4: 93,
      rp1: undefined,
      rp2: undefined,
      rp3: undefined,
      rp4: undefined,
      blockAverage: 91.5,
      finalAverage: 91.5,
      observations: 'Estudiante destacada, líder natural'
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

  const updateGrade = (studentId: string, field: keyof StudentGrade, value: number) => {
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
        const updated = { ...grade, [field]: value };
        // Recalcular promedios
        updated.blockAverage = calculateBlockAverage(updated);
        updated.finalAverage = updated.blockAverage;
        return updated;
      }
      return grade;
    }));
  };

  const calculateBlockAverage = (grade: StudentGrade): number => {
    const periods = [
      grade.rp1 && grade.rp1 > (grade.p1 || 0) ? grade.rp1 : grade.p1 || 0,
      grade.rp2 && grade.rp2 > (grade.p2 || 0) ? grade.rp2 : grade.p2 || 0,
      grade.rp3 && grade.rp3 > (grade.p3 || 0) ? grade.rp3 : grade.p3 || 0,
      grade.rp4 && grade.rp4 > (grade.p4 || 0) ? grade.rp4 : grade.p4 || 0
    ];
    
    const validPeriods = periods.filter(p => p > 0);
    return validPeriods.length > 0 ? 
      Math.round((validPeriods.reduce((sum, p) => sum + p, 0) / validPeriods.length) * 100) / 100 : 0;
  };

  const calculateAllAverages = () => {
    setGrades(prev => prev.map(grade => ({
      ...grade,
      blockAverage: calculateBlockAverage(grade),
      finalAverage: calculateBlockAverage(grade)
    })));
    
    toast({
      title: "Promedios calculados",
      description: "Todos los promedios han sido recalculados automáticamente",
    });
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
            Gestión de Calificaciones
          </h1>
          <p className="text-body font-opensans text-gray-600">
            Sistema de calificaciones por bloques de competencias
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
            Selecciona la sección y asignatura para gestionar las calificaciones
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
                <h4 className="font-semibold text-blue-900 mb-2">¿Qué significa RP?</h4>
                <p className="text-blue-800">
                  <strong>RP (Recuperación Pedagógica):</strong> Si el estudiante no alcanza el mínimo en un período, 
                  puede realizar actividades de refuerzo. Si la nota RP es mayor que P, se usa RP para el cálculo.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Cálculo de Promedios</h4>
                <p className="text-blue-800">
                  El promedio se calcula automáticamente considerando la mejor nota entre P y RP para cada período.
                  Escala: 0-100 puntos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grades Table */}
      {grades.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="font-montserrat">
                  Calificaciones - {selectedSubject}
                </CardTitle>
                <CardDescription className="font-opensans">
                  {sections.find(s => s.id === selectedSection)?.name} • {grades.length} estudiantes
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={calculateAllAverages}
                  className="flex items-center"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Calcular Promedios
                </Button>
                <Button 
                  onClick={saveGrades}
                  className="bg-minerd-green hover:bg-green-700 flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 sticky left-0 bg-white z-10 min-w-[200px]">Estudiante</th>
                    <th className="text-center p-2 min-w-[80px]">P1</th>
                    <th className="text-center p-2 min-w-[80px]">RP1</th>
                    <th className="text-center p-2 min-w-[80px]">P2</th>
                    <th className="text-center p-2 min-w-[80px]">RP2</th>
                    <th className="text-center p-2 min-w-[80px]">P3</th>
                    <th className="text-center p-2 min-w-[80px]">RP3</th>
                    <th className="text-center p-2 min-w-[80px]">P4</th>
                    <th className="text-center p-2 min-w-[80px]">RP4</th>
                    <th className="text-center p-2 min-w-[100px] bg-blue-50">Promedio</th>
                    <th className="text-center p-2 min-w-[80px]">Obs.</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade, index) => (
                    <tr key={grade.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="p-2 sticky left-0 bg-inherit z-10">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={grade.avatar} />
                            <AvatarFallback className="text-xs">
                              {grade.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{grade.name}</p>
                            <p className="text-xs text-gray-500">RNE: {grade.rne}</p>
                          </div>
                        </div>
                      </td>
                      {['p1', 'rp1', 'p2', 'rp2', 'p3', 'rp3', 'p4', 'rp4'].map((field) => (
                        <td key={field} className="p-1">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={grade[field as keyof StudentGrade] || ''}
                            onChange={(e) => updateGrade(grade.id, field as keyof StudentGrade, Number(e.target.value))}
                            className="w-full text-center h-8"
                            placeholder="--"
                          />
                        </td>
                      ))}
                      <td className="p-2 text-center bg-blue-50">
                        <Badge variant="secondary" className="font-bold">
                          {grade.finalAverage.toFixed(1)}
                        </Badge>
                      </td>
                      <td className="p-1 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openObservationModal(grade.id, grade.observations)}
                          className="h-8 w-8 p-0"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
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
