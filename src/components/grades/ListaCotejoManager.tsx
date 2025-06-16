
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { CheckSquare, Save, FileCheck, Target } from 'lucide-react';
import { IndicadorLogro, ListaCotejo, IndicadorLogroPeriodo } from '@/types/academic';

interface ListaCotejoManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSection: string;
  selectedSubject: string;
  selectedGrade: string;
  students: Array<{ id: string; name: string; rne: string }>;
}

const ListaCotejoManager: React.FC<ListaCotejoManagerProps> = ({
  open,
  onOpenChange,
  selectedSection,
  selectedSubject,
  selectedGrade,
  students
}) => {
  const [selectedPeriodo, setSelectedPeriodo] = useState<'p1' | 'p2' | 'p3' | 'p4'>('p1');
  const [indicadoresDisponibles, setIndicadoresDisponibles] = useState<IndicadorLogro[]>([]);
  const [indicadoresTrabajados, setIndicadoresTrabajados] = useState<IndicadorLogroPeriodo[]>([]);
  const [listaCotejo, setListaCotejo] = useState<ListaCotejo[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [cotejoModalOpen, setCotejoModalOpen] = useState(false);

  // Mock data - en producción vendría de la API
  React.useEffect(() => {
    if (selectedSubject && selectedGrade) {
      const mockIndicadores: IndicadorLogro[] = [
        {
          id: '1',
          codigo: 'IL-PC1-001',
          descripcion: 'Identifica personajes principales y secundarios en textos narrativos',
          bloqueCompetenciaId: '1',
          subjectId: selectedSubject,
          grado: selectedGrade,
          createdBy: 'admin',
          createdAt: new Date()
        },
        {
          id: '2',
          codigo: 'IL-PC1-002',
          descripcion: 'Comprende la secuencia cronológica de eventos en la narración',
          bloqueCompetenciaId: '1',
          subjectId: selectedSubject,
          grado: selectedGrade,
          createdBy: 'admin',
          createdAt: new Date()
        },
        {
          id: '3',
          codigo: 'IL-PC2-001',
          descripcion: 'Redacta párrafos con coherencia y cohesión textual',
          bloqueCompetenciaId: '2',
          subjectId: selectedSubject,
          grado: selectedGrade,
          createdBy: 'admin',
          createdAt: new Date()
        }
      ];
      setIndicadoresDisponibles(mockIndicadores);

      // Mock indicadores trabajados
      const mockTrabajados: IndicadorLogroPeriodo[] = [
        {
          id: '1',
          indicadorLogroId: '1',
          periodo: 'p1',
          sectionId: selectedSection,
          subjectId: selectedSubject,
          trabajado: true,
          registradoPor: 'teacher',
          fecha: new Date()
        }
      ];
      setIndicadoresTrabajados(mockTrabajados);
    }
  }, [selectedSubject, selectedGrade, selectedSection]);

  const handleToggleIndicadorTrabajado = (indicadorId: string, trabajado: boolean) => {
    setIndicadoresTrabajados(prev => {
      const existing = prev.find(it => 
        it.indicadorLogroId === indicadorId && 
        it.periodo === selectedPeriodo &&
        it.sectionId === selectedSection &&
        it.subjectId === selectedSubject
      );

      if (existing) {
        return prev.map(it => 
          it.id === existing.id 
            ? { ...it, trabajado, fecha: new Date() }
            : it
        );
      } else {
        const newIndicadorTrabajado: IndicadorLogroPeriodo = {
          id: Date.now().toString(),
          indicadorLogroId: indicadorId,
          periodo: selectedPeriodo,
          sectionId: selectedSection,
          subjectId: selectedSubject,
          trabajado,
          registradoPor: 'teacher',
          fecha: new Date()
        };
        return [...prev, newIndicadorTrabajado];
      }
    });
  };

  const getIndicadoresTrabajos = () => {
    return indicadoresTrabajados.filter(it => 
      it.periodo === selectedPeriodo &&
      it.sectionId === selectedSection &&
      it.subjectId === selectedSubject &&
      it.trabajado
    ).map(it => it.indicadorLogroId);
  };

  const isIndicadorTrabajado = (indicadorId: string) => {
    return getIndicadoresTrabajos().includes(indicadorId);
  };

  const openCotejoForStudent = (studentId: string) => {
    setSelectedStudent(studentId);
    setCotejoModalOpen(true);
  };

  const saveIndicadoresTrabajados = () => {
    toast({
      title: "Indicadores guardados",
      description: `Se han guardado los indicadores trabajados para el período ${selectedPeriodo.toUpperCase()}`,
    });
  };

  const indicadoresTrabajos = getIndicadoresTrabajos();
  const indicadoresParaCotejo = indicadoresDisponibles.filter(ind => 
    indicadoresTrabajos.includes(ind.id)
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lista de Cotejo - Indicadores de Logro</DialogTitle>
            <DialogDescription>
              Selecciona los indicadores trabajados y evalúa a los estudiantes
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Selector de período */}
            <div className="flex items-center gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Período</label>
                <Select value={selectedPeriodo} onValueChange={(value: 'p1' | 'p2' | 'p3' | 'p4') => setSelectedPeriodo(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="p1">P1</SelectItem>
                    <SelectItem value="p2">P2</SelectItem>
                    <SelectItem value="p3">P3</SelectItem>
                    <SelectItem value="p4">P4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {indicadoresTrabajos.length} indicadores trabajados
              </Badge>
            </div>

            {/* Selección de indicadores trabajados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Indicadores de Logro Disponibles
                </CardTitle>
                <CardDescription>
                  Marca los indicadores que has trabajado en el período {selectedPeriodo.toUpperCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {indicadoresDisponibles.map(indicador => (
                    <div key={indicador.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Checkbox
                        checked={isIndicadorTrabajado(indicador.id)}
                        onCheckedChange={(checked) => handleToggleIndicadorTrabajado(indicador.id, checked as boolean)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {indicador.codigo}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700">{indicador.descripcion}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button onClick={saveIndicadoresTrabajados} className="bg-minerd-blue hover:bg-blue-700">
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Indicadores Trabajados
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Lista de estudiantes para evaluación */}
            {indicadoresParaCotejo.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckSquare className="w-5 h-5 mr-2" />
                    Evaluación de Estudiantes
                  </CardTitle>
                  <CardDescription>
                    Evalúa el logro de los indicadores trabajados por cada estudiante
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {students.map(student => (
                      <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-gray-600">RNE: {student.rne}</p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => openCotejoForStudent(student.id)}
                          className="flex items-center"
                        >
                          <FileCheck className="w-4 h-4 mr-2" />
                          Evaluar
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <CotejoStudentModal
        open={cotejoModalOpen}
        onOpenChange={setCotejoModalOpen}
        studentId={selectedStudent}
        student={students.find(s => s.id === selectedStudent)}
        indicadores={indicadoresParaCotejo}
        periodo={selectedPeriodo}
        sectionId={selectedSection}
        subjectId={selectedSubject}
      />
    </>
  );
};

// Modal para evaluar un estudiante específico
interface CotejoStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  student?: { id: string; name: string; rne: string };
  indicadores: IndicadorLogro[];
  periodo: 'p1' | 'p2' | 'p3' | 'p4';
  sectionId: string;
  subjectId: string;
}

const CotejoStudentModal: React.FC<CotejoStudentModalProps> = ({
  open,
  onOpenChange,
  studentId,
  student,
  indicadores,
  periodo,
  sectionId,
  subjectId
}) => {
  const [evaluacion, setEvaluacion] = useState<{
    indicadorId: string;
    logrado: boolean;
    observaciones?: string;
  }[]>([]);

  React.useEffect(() => {
    if (open && indicadores.length > 0) {
      // Inicializar evaluación
      setEvaluacion(indicadores.map(ind => ({
        indicadorId: ind.id,
        logrado: false,
        observaciones: ''
      })));
    }
  }, [open, indicadores]);

  const handleToggleLogrado = (indicadorId: string, logrado: boolean) => {
    setEvaluacion(prev => prev.map(evaluacionItem => 
      evaluacionItem.indicadorId === indicadorId 
        ? { ...evaluacionItem, logrado }
        : evaluacionItem
    ));
  };

  const handleObservacionChange = (indicadorId: string, observaciones: string) => {
    setEvaluacion(prev => prev.map(evaluacionItem => 
      evaluacionItem.indicadorId === indicadorId 
        ? { ...evaluacionItem, observaciones }
        : evaluacionItem
    ));
  };

  const handleSave = () => {
    const listaCotejo: ListaCotejo = {
      id: Date.now().toString(),
      studentId,
      sectionId,
      subjectId,
      periodo,
      indicadoresLogro: evaluacion,
      registradoPor: 'teacher',
      updatedAt: new Date()
    };

    toast({
      title: "Evaluación guardada",
      description: `Se ha guardado la lista de cotejo para ${student?.name}`,
    });
    onOpenChange(false);
  };

  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lista de Cotejo - {student.name}</DialogTitle>
          <DialogDescription>
            RNE: {student.rne} | Período: {periodo.toUpperCase()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {indicadores.map(indicador => {
            const evaluacionItem = evaluacion.find(ev => ev.indicadorId === indicador.id);
            return (
              <Card key={indicador.id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Badge variant="secondary" className="text-xs mb-2">
                          {indicador.codigo}
                        </Badge>
                        <p className="text-sm text-gray-700">{indicador.descripcion}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={evaluacionItem?.logrado || false}
                          onCheckedChange={(checked) => handleToggleLogrado(indicador.id, checked as boolean)}
                        />
                        <span className="text-sm font-medium">
                          {evaluacionItem?.logrado ? 'Logrado' : 'No logrado'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-600">Observaciones:</label>
                      <Textarea
                        value={evaluacionItem?.observaciones || ''}
                        onChange={(e) => handleObservacionChange(indicador.id, e.target.value)}
                        placeholder="Observaciones opcionales..."
                        className="text-sm"
                        rows={2}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-minerd-green hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              Guardar Evaluación
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ListaCotejoManager;
