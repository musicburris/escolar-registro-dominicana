import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, Save, Target } from 'lucide-react';
import { BloqueCompetencias } from '@/types/academic';

interface CompetenciaConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bloquesCompetencias: BloqueCompetencias[];
  onUpdateBloques: (bloques: BloqueCompetencias[]) => void;
  selectedSubject: string;
}

const CompetenciaConfigModal: React.FC<CompetenciaConfigModalProps> = ({
  open,
  onOpenChange,
  bloquesCompetencias,
  onUpdateBloques,
  selectedSubject
}) => {
  const [localBloques, setLocalBloques] = useState<BloqueCompetencias[]>(bloquesCompetencias);

  const addNewBloque = () => {
    const newBloque: BloqueCompetencias = {
      id: `bloque-${Date.now()}`,
      nombre: 'Nueva Competencia',
      codigo: `PC${localBloques.length + 1}`,
      subjectId: selectedSubject.toLowerCase(),
      descripcionCompetencias: 'Describe aquí las competencias específicas de este bloque...'
    };
    
    setLocalBloques([...localBloques, newBloque]);
    
    toast({
      title: "Nuevo bloque agregado",
      description: "Se ha agregado un nuevo bloque de competencias",
    });
  };

  const updateBloque = (bloqueId: string, updates: Partial<BloqueCompetencias>) => {
    setLocalBloques(prev => prev.map(bloque => 
      bloque.id === bloqueId 
        ? { ...bloque, ...updates }
        : bloque
    ));
  };

  const removeBloque = (bloqueId: string) => {
    if (localBloques.length <= 1) {
      toast({
        title: "Error",
        description: "Debe mantener al menos un bloque de competencias",
        variant: "destructive"
      });
      return;
    }

    setLocalBloques(prev => prev.filter(bloque => bloque.id !== bloqueId));
    
    toast({
      title: "Bloque eliminado",
      description: "El bloque de competencias ha sido eliminado",
    });
  };

  const handleSave = () => {
    // Validar que no haya campos vacíos
    const hasEmptyFields = localBloques.some(bloque => 
      !bloque.nombre.trim() || 
      !bloque.codigo.trim() || 
      !bloque.descripcionCompetencias.trim()
    );

    if (hasEmptyFields) {
      toast({
        title: "Error de validación",
        description: "Todos los campos son obligatorios",
        variant: "destructive"
      });
      return;
    }

    // Validar códigos únicos
    const codigos = localBloques.map(b => b.codigo);
    const codigosUnicos = new Set(codigos);
    if (codigos.length !== codigosUnicos.size) {
      toast({
        title: "Error de validación",
        description: "Los códigos de los bloques deben ser únicos",
        variant: "destructive"
      });
      return;
    }

    onUpdateBloques(localBloques);
    onOpenChange(false);
    
    toast({
      title: "Configuración guardada",
      description: "Los bloques de competencias han sido actualizados exitosamente",
    });
  };

  const handleCancel = () => {
    setLocalBloques(bloquesCompetencias); // Restaurar estado original
    onOpenChange(false);
  };

  React.useEffect(() => {
    setLocalBloques(bloquesCompetencias);
  }, [bloquesCompetencias]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Configuración de Bloques de Competencias - {selectedSubject}
          </DialogTitle>
          <DialogDescription>
            Configure los bloques de competencias para esta asignatura. Cada bloque representa un área específica de evaluación.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Botón para agregar nuevo bloque */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Bloques de Competencias ({localBloques.length})</h3>
            <Button 
              onClick={addNewBloque}
              className="flex items-center"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Bloque
            </Button>
          </div>

          {/* Lista de bloques */}
          <div className="space-y-4">
            {localBloques.map((bloque, index) => (
              <Card key={bloque.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">
                      Bloque {index + 1}: {bloque.codigo}
                    </CardTitle>
                    <Button
                      onClick={() => removeBloque(bloque.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-800"
                      disabled={localBloques.length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`codigo-${bloque.id}`}>Código del Bloque *</Label>
                      <Input
                        id={`codigo-${bloque.id}`}
                        value={bloque.codigo}
                        onChange={(e) => updateBloque(bloque.id, { codigo: e.target.value.toUpperCase() })}
                        placeholder="Ej: PC1, CE1, BL1"
                        maxLength={10}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`nombre-${bloque.id}`}>Nombre del Bloque *</Label>
                      <Input
                        id={`nombre-${bloque.id}`}
                        value={bloque.nombre}
                        onChange={(e) => updateBloque(bloque.id, { nombre: e.target.value })}
                        placeholder="Ej: Comprensión Lectora"
                        maxLength={100}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`descripcion-${bloque.id}`}>
                      Descripción de Competencias Específicas *
                    </Label>
                    <Textarea
                      id={`descripcion-${bloque.id}`}
                      value={bloque.descripcionCompetencias}
                      onChange={(e) => updateBloque(bloque.id, { descripcionCompetencias: e.target.value })}
                      placeholder="Describe las competencias específicas que se evalúan en este bloque. Ejemplo:&#10;CE1: Analiza textos narrativos identificando personajes y trama.&#10;CE2: Identifica ideas principales y secundarias.&#10;CE3: Comprende vocabulario contextual."
                      className="min-h-[120px]"
                      maxLength={1000}
                    />
                    <div className="text-xs text-gray-500 text-right">
                      {bloque.descripcionCompetencias.length}/1000 caracteres
                    </div>
                  </div>

                  {/* Vista previa de cómo se verá */}
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Vista Previa:</h4>
                    <div className="text-sm">
                      <span className="font-medium text-blue-600">{bloque.codigo}</span> - 
                      <span className="ml-1 font-medium">{bloque.nombre}</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">
                      {bloque.descripcionCompetencias || 'Sin descripción'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Información importante */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Información Importante:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Cada bloque debe tener un código único (ej: PC1, PC2, PC3, PC4)</li>
              <li>• La descripción debe detallar las competencias específicas evaluadas</li>
              <li>• Recomendamos usar la nomenclatura oficial del MINERD</li>
              <li>• Los cambios afectarán futuras calificaciones de esta asignatura</li>
            </ul>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex items-center">
              <Save className="w-4 h-4 mr-2" />
              Guardar Configuración
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompetenciaConfigModal;