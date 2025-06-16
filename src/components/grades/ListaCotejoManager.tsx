
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { CheckSquare, Save, Target } from 'lucide-react';
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
  const [listaCotejo, setListaCotejo] = useState<{
    studentId: string;
    indicadorId: string;
    logrado: boolean;
    observaciones: string;
  }[]>([]);

  // Mock data - en producción vendría de la API
  React.useEffect(() => {
    if (selectedSubject && selectedGrade) {
      const mockIndicadores: IndicadorLogro[] = [
        {
          id: 'ind-1',
          codigo: 'IL-PC1-001',
          descripcion: 'Identifica personajes principales y secundarios en textos narrativos',
          bloqueCompetenciaId: '1',
          subjectId: selectedSubject,
          grado: selectedGrade,
          createdBy: 'admin',
          createdAt: new Date()
        },
        {
          id: 'ind-2',
          codigo: 'IL-PC1-002',
          descripcion: 'Comprende la secuencia cronológica de eventos en la narración',
          bloqueCompetenciaId: '1',
          subjectId: selectedSubject,
          grado: selectedGrade,
          createdBy: 'admin',
          createdAt: new Date()
        },
        {
          id: 'ind-3',
          codigo: 'IL-PC2-001',
          descripcion: 'Redacta párrafos con coherencia y cohesión textual',
          bloqueCompetenciaId: '2',
          subjectId: selectedSubject,
          grado: selectedGrade,
          createdBy: 'admin',
          createdAt: new Date()
        },
        {
          id: 'ind-4',
          codigo: 'IL-PC2-002',
          descripcion: 'Utiliza conectores lógicos para enlazar ideas',
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
          id: 'trab-1',
          indicadorLogroId: 'ind-1',
          periodo: 'p1',
          sectionId: selectedSection,
          subjectId: selectedSubject,
          trabajado: true,
          registradoPor: 'teacher',
          fecha: new Date()
        },
        {
          id: 'trab-2',
          indicadorLogroId: 'ind-2',
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
          id: `trab-${Date.now()}`,
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

  const handleSelectIndicadorForStudent = (studentId: string, indicadorId: string) => {
    setListaCotejo(prev => {
      const existing = prev.find(item => item.studentId === studentId);
      if (existing) {
        return prev.map(item => 
          item.studentId === studentId 
            ? { ...item, indicadorId, logrado: false, observaciones: '' }
            : item
        );
      } else {
        return [...prev, {
          studentId,
          indicadorId,
          logrado: false,
          observaciones: ''
        }];
      }
    });
  };

  const handleToggleLogrado = (studentId: string, logrado: boolean) => {
    setListaCotejo(prev => prev.map(item => 
      item.studentId === studentId 
        ? { ...item, logrado }
        : item
    ));
  };

  const handleObservacionChange = (studentId: string, observaciones: string) => {
    setListaCotejo(prev => prev.map(item => 
      item.studentId === studentId 
        ? { ...item, observaciones }
        : item
    ));
  };

  const saveIndicadoresTrabajados = () => {
    toast({
      title: "Indicadores guardados",
      description: `Se han guardado los indicadores trabajados para el período ${selectedPeriodo.toUpperCase()}`,
    });
  };

  const saveCotejo = () => {
    const cotejoData: ListaCotejo[] = listaCotejo.map(item => ({
      id: `cotejo-${Date.now()}-${item.studentId}`,
      studentId: item.studentId,
      sectionId: selectedSection,
      subjectId: selectedSubject,
      periodo: selectedPeriodo,
      indicadoresLogro: [{
        indicadorId: item.indicadorId,
        logrado: item.logrado,
        observaciones: item.observaciones
      }],
      registradoPor: 'teacher',
      updatedAt: new Date()
    }));

    toast({
      title: "Lista de cotejo guardada",
      description: `Se ha guardado la evaluación para ${listaCotejo.length} estudiantes`,
    });
  };

  const indicadoresTrabajos = getIndicadoresTrabajos();
  const indicadoresParaCotejo = indicadoresDisponibles.filter(ind => 
    indicadoresTrabajos.includes(ind.id)
  );

  const getSelectedIndicadorForStudent = (studentId: string) => {
    return listaCotejo.find(item => item.studentId === studentId);
  };

  const getIndicadorById = (indicadorId: string) => {
    return indicadoresDisponibles.find(ind => ind.id === indicadorId);
  };

  return (
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
                  Lista de Cotejo por Estudiante
                </CardTitle>
                <CardDescription>
                  Selecciona el indicador trabajado por cada estudiante y evalúa su logro
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students.map(student => {
                    const selectedItem = getSelectedIndicadorForStudent(student.id);
                    const selectedIndicador = selectedItem ? getIndicadorById(selectedItem.indicadorId) : null;
                    
                    return (
                      <div key={student.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-gray-600">RNE: {student.rne}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Indicador de Logro:</label>
                            <Select 
                              value={selectedItem?.indicadorId || "placeholder"} 
                              onValueChange={(value) => {
                                if (value !== "placeholder") {
                                  handleSelectIndicadorForStudent(student.id, value);
                                }
                              }}
                            >
                              <SelectTrigger className="w-full bg-white">
                                <SelectValue placeholder="Seleccionar indicador trabajado..." />
                              </SelectTrigger>
                              <SelectContent className="bg-white border shadow-lg z-50">
                                <SelectItem value="placeholder" disabled>
                                  Seleccionar indicador trabajado...
                                </SelectItem>
                                {indicadoresParaCotejo.map(indicador => (
                                  <SelectItem key={indicador.id} value={indicador.id}>
                                    <div className="flex flex-col">
                                      <span className="font-medium">{indicador.codigo}</span>
                                      <span className="text-xs text-gray-600">{indicador.descripcion}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {selectedIndicador && (
                            <>
                              <div className="p-3 bg-blue-50 rounded border-l-4 border-l-blue-500">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {selectedIndicador.codigo}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-700">{selectedIndicador.descripcion}</p>
                              </div>

                              <div className="flex items-center space-x-3">
                                <Checkbox
                                  checked={selectedItem?.logrado || false}
                                  onCheckedChange={(checked) => handleToggleLogrado(student.id, checked as boolean)}
                                />
                                <span className="text-sm font-medium">
                                  {selectedItem?.logrado ? 'Logrado' : 'No logrado'}
                                </span>
                              </div>

                              <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-600">Observaciones:</label>
                                <Textarea
                                  value={selectedItem?.observaciones || ''}
                                  onChange={(e) => handleObservacionChange(student.id, e.target.value)}
                                  placeholder="Observaciones opcionales..."
                                  className="text-sm bg-white"
                                  rows={2}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={saveCotejo} className="bg-minerd-green hover:bg-green-700">
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Lista de Cotejo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ListaCotejoManager;
