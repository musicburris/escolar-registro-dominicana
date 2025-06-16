
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Save, Target } from 'lucide-react';
import { IndicadorLogro, BloqueCompetencias } from '@/types/academic';

interface IndicadoresLogroManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSubject: string;
  selectedGrade: string;
  bloquesCompetencias: BloqueCompetencias[];
}

const IndicadoresLogroManager: React.FC<IndicadoresLogroManagerProps> = ({
  open,
  onOpenChange,
  selectedSubject,
  selectedGrade,
  bloquesCompetencias
}) => {
  const [indicadores, setIndicadores] = useState<IndicadorLogro[]>([]);
  const [editingIndicador, setEditingIndicador] = useState<IndicadorLogro | null>(null);
  const [indicadorModalOpen, setIndicadorModalOpen] = useState(false);

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
        }
      ];
      setIndicadores(mockIndicadores);
    }
  }, [selectedSubject, selectedGrade]);

  const handleSaveIndicador = (indicador: Omit<IndicadorLogro, 'id' | 'createdAt' | 'createdBy'>) => {
    if (editingIndicador) {
      setIndicadores(prev => prev.map(ind => 
        ind.id === editingIndicador.id 
          ? { ...indicador, id: editingIndicador.id, createdAt: editingIndicador.createdAt, createdBy: editingIndicador.createdBy }
          : ind
      ));
      toast({
        title: "Indicador actualizado",
        description: "El indicador de logro ha sido actualizado exitosamente",
      });
    } else {
      const newIndicador: IndicadorLogro = {
        ...indicador,
        id: Date.now().toString(),
        createdBy: 'admin',
        createdAt: new Date()
      };
      setIndicadores(prev => [...prev, newIndicador]);
      toast({
        title: "Indicador creado",
        description: "El indicador de logro ha sido creado exitosamente",
      });
    }
    setIndicadorModalOpen(false);
    setEditingIndicador(null);
  };

  const deleteIndicador = (id: string) => {
    setIndicadores(prev => prev.filter(ind => ind.id !== id));
    toast({
      title: "Indicador eliminado",
      description: "El indicador de logro ha sido eliminado",
    });
  };

  const groupedIndicadores = indicadores.reduce((acc, indicador) => {
    const bloque = bloquesCompetencias.find(b => b.id === indicador.bloqueCompetenciaId);
    const bloqueKey = bloque ? `${bloque.codigo} - ${bloque.nombre}` : 'Sin bloque';
    if (!acc[bloqueKey]) {
      acc[bloqueKey] = [];
    }
    acc[bloqueKey].push(indicador);
    return acc;
  }, {} as Record<string, IndicadorLogro[]>);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestión de Indicadores de Logro</DialogTitle>
            <DialogDescription>
              Administra los indicadores de logro para {selectedSubject} - Grado {selectedGrade}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Total: {indicadores.length} indicadores
              </Badge>
              <Button
                onClick={() => {
                  setEditingIndicador(null);
                  setIndicadorModalOpen(true);
                }}
                className="bg-minerd-blue hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Indicador
              </Button>
            </div>

            {Object.entries(groupedIndicadores).map(([bloqueNombre, indicadoresBloque]) => (
              <Card key={bloqueNombre} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    {bloqueNombre}
                  </CardTitle>
                  <CardDescription>
                    {indicadoresBloque.length} indicadores en este bloque
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {indicadoresBloque.map(indicador => (
                      <div key={indicador.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">
                              {indicador.codigo}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700">{indicador.descripcion}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingIndicador(indicador);
                              setIndicadorModalOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteIndicador(indicador.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <IndicadorModal
        open={indicadorModalOpen}
        onOpenChange={setIndicadorModalOpen}
        onSave={handleSaveIndicador}
        editingIndicador={editingIndicador}
        bloquesCompetencias={bloquesCompetencias}
        selectedSubject={selectedSubject}
        selectedGrade={selectedGrade}
      />
    </>
  );
};

// Modal para crear/editar indicadores
interface IndicadorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (indicador: Omit<IndicadorLogro, 'id' | 'createdAt' | 'createdBy'>) => void;
  editingIndicador: IndicadorLogro | null;
  bloquesCompetencias: BloqueCompetencias[];
  selectedSubject: string;
  selectedGrade: string;
}

const IndicadorModal: React.FC<IndicadorModalProps> = ({
  open,
  onOpenChange,
  onSave,
  editingIndicador,
  bloquesCompetencias,
  selectedSubject,
  selectedGrade
}) => {
  const [formData, setFormData] = useState({
    codigo: '',
    descripcion: '',
    bloqueCompetenciaId: ''
  });

  React.useEffect(() => {
    if (editingIndicador) {
      setFormData({
        codigo: editingIndicador.codigo,
        descripcion: editingIndicador.descripcion,
        bloqueCompetenciaId: editingIndicador.bloqueCompetenciaId
      });
    } else {
      setFormData({
        codigo: '',
        descripcion: '',
        bloqueCompetenciaId: ''
      });
    }
  }, [editingIndicador, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.codigo || !formData.descripcion || !formData.bloqueCompetenciaId) return;
    
    onSave({
      ...formData,
      subjectId: selectedSubject,
      grado: selectedGrade
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingIndicador ? 'Editar Indicador de Logro' : 'Nuevo Indicador de Logro'}
          </DialogTitle>
          <DialogDescription>
            Configura el indicador de logro para la asignatura seleccionada
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Código del Indicador</label>
              <Input
                value={formData.codigo}
                onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                placeholder="Ej: IL-PC1-001"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bloque de Competencias</label>
              <Select value={formData.bloqueCompetenciaId} onValueChange={(value) => setFormData(prev => ({ ...prev, bloqueCompetenciaId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar bloque" />
                </SelectTrigger>
                <SelectContent>
                  {bloquesCompetencias.map(bloque => (
                    <SelectItem key={bloque.id} value={bloque.id}>
                      {bloque.codigo} - {bloque.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción del Indicador</label>
            <Textarea
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Describe qué debe lograr el estudiante..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-minerd-blue hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {editingIndicador ? 'Actualizar' : 'Crear'} Indicador
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default IndicadoresLogroManager;
