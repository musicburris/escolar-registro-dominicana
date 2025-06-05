
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RegistroAnecdotico } from '@/types/academic';
import { Calendar, Plus, User } from 'lucide-react';

interface RegistroAnecdoticoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  registros: RegistroAnecdotico[];
  onAddRegistro: (registro: Omit<RegistroAnecdotico, 'id' | 'createdAt'>) => void;
}

const RegistroAnecdoticoModal: React.FC<RegistroAnecdoticoModalProps> = ({
  open,
  onOpenChange,
  studentId,
  studentName,
  registros,
  onAddRegistro
}) => {
  const [nuevoRegistro, setNuevoRegistro] = useState({
    incidencia: '',
    tipoIncidencia: 'neutral' as 'positiva' | 'negativa' | 'neutral',
    descripcion: '',
    accionesTomadas: ''
  });

  const handleAgregarRegistro = () => {
    if (!nuevoRegistro.incidencia || !nuevoRegistro.descripcion) {
      return;
    }

    onAddRegistro({
      studentId,
      fecha: new Date(),
      incidencia: nuevoRegistro.incidencia,
      tipoIncidencia: nuevoRegistro.tipoIncidencia,
      descripcion: nuevoRegistro.descripcion,
      accionesTomadas: nuevoRegistro.accionesTomadas,
      registradoPor: 'Usuario Actual' // Aquí iría el usuario actual
    });

    setNuevoRegistro({
      incidencia: '',
      tipoIncidencia: 'neutral',
      descripcion: '',
      accionesTomadas: ''
    });
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'positiva': return 'bg-green-100 text-green-800 border-green-200';
      case 'negativa': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            Registro Anecdótico - {studentName}
          </DialogTitle>
          <DialogDescription>
            Registro de incidencias, observaciones y acciones pedagógicas del estudiante
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Nuevo Registro */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Agregar Nueva Incidencia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de Incidencia</label>
                  <Select 
                    value={nuevoRegistro.tipoIncidencia} 
                    onValueChange={(value: 'positiva' | 'negativa' | 'neutral') => 
                      setNuevoRegistro(prev => ({ ...prev, tipoIncidencia: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="positiva">Positiva</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="negativa">Negativa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Título de la Incidencia</label>
                  <Input
                    value={nuevoRegistro.incidencia}
                    onChange={(e) => setNuevoRegistro(prev => ({ ...prev, incidencia: e.target.value }))}
                    placeholder="Ej: Participación destacada en clase"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción Detallada</label>
                <Textarea
                  value={nuevoRegistro.descripcion}
                  onChange={(e) => setNuevoRegistro(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Describe detalladamente lo ocurrido..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Acciones Tomadas (Opcional)</label>
                <Textarea
                  value={nuevoRegistro.accionesTomadas}
                  onChange={(e) => setNuevoRegistro(prev => ({ ...prev, accionesTomadas: e.target.value }))}
                  placeholder="Describe las acciones pedagógicas realizadas..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleAgregarRegistro} className="bg-minerd-blue hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Registro
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Historial de Registros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Historial de Registros ({registros.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {registros.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay registros anecdóticos para este estudiante</p>
              ) : (
                <div className="space-y-4">
                  {registros.map((registro) => (
                    <Card key={registro.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center space-x-3">
                            <Badge className={getTipoColor(registro.tipoIncidencia)}>
                              {registro.tipoIncidencia.charAt(0).toUpperCase() + registro.tipoIncidencia.slice(1)}
                            </Badge>
                            <h4 className="font-semibold">{registro.incidencia}</h4>
                          </div>
                          <div className="text-sm text-gray-500">
                            {registro.fecha.toLocaleDateString()}
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-3">{registro.descripcion}</p>
                        
                        {registro.accionesTomadas && (
                          <div className="bg-blue-50 p-3 rounded">
                            <h5 className="font-medium text-blue-900 mb-1">Acciones Tomadas:</h5>
                            <p className="text-blue-800">{registro.accionesTomadas}</p>
                          </div>
                        )}
                        
                        <div className="mt-3 text-xs text-gray-500">
                          Registrado por: {registro.registradoPor}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegistroAnecdoticoModal;
