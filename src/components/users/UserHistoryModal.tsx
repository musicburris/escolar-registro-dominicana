
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface UserHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface HistoryEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error';
  ipAddress: string;
}

const mockHistory: HistoryEntry[] = [
  {
    id: '1',
    userId: '1',
    userName: 'María González',
    action: 'Inicio de sesión',
    module: 'Autenticación',
    details: 'Acceso exitoso al sistema',
    timestamp: new Date('2024-12-05T08:30:00'),
    status: 'success',
    ipAddress: '192.168.1.100'
  },
  {
    id: '2',
    userId: '2',
    userName: 'Carlos Martínez',
    action: 'Actualizar calificación',
    module: 'Calificaciones',
    details: 'Calificación actualizada para estudiante Ana López - Matemáticas',
    timestamp: new Date('2024-12-05T09:15:00'),
    status: 'success',
    ipAddress: '192.168.1.101'
  },
  {
    id: '3',
    userId: '3',
    userName: 'Ana Rodríguez',
    action: 'Registrar estudiante',
    module: 'Estudiantes',
    details: 'Nuevo estudiante registrado: Pedro Jiménez',
    timestamp: new Date('2024-12-05T10:00:00'),
    status: 'success',
    ipAddress: '192.168.1.102'
  },
  {
    id: '4',
    userId: '1',
    userName: 'María González',
    action: 'Intento de acceso fallido',
    module: 'Autenticación',
    details: 'Contraseña incorrecta',
    timestamp: new Date('2024-12-05T11:30:00'),
    status: 'warning',
    ipAddress: '192.168.1.100'
  },
  {
    id: '5',
    userId: '2',
    userName: 'Carlos Martínez',
    action: 'Error al subir archivo',
    module: 'Calificaciones',
    details: 'Error al procesar archivo de calificaciones: formato incorrecto',
    timestamp: new Date('2024-12-05T12:00:00'),
    status: 'error',
    ipAddress: '192.168.1.101'
  }
];

const UserHistoryModal: React.FC<UserHistoryModalProps> = ({ open, onOpenChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');

  const filteredHistory = mockHistory.filter(entry => {
    const matchesSearch = entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = selectedModule === 'all' || entry.module === selectedModule;
    const matchesStatus = selectedStatus === 'all' || entry.status === selectedStatus;
    const matchesUser = selectedUser === 'all' || entry.userId === selectedUser;
    
    return matchesSearch && matchesModule && matchesStatus && matchesUser;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      success: 'default',
      warning: 'outline',
      error: 'destructive'
    };
    const labels = {
      success: 'Exitoso',
      warning: 'Advertencia',
      error: 'Error'
    };
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="font-montserrat flex items-center">
            <History className="mr-2 h-5 w-5" />
            Histórico de Actividades de Usuarios
          </DialogTitle>
          <DialogDescription className="font-opensans">
            Registro completo de actividades realizadas por los usuarios del sistema
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Buscar actividades..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Usuario</label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los usuarios" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los usuarios</SelectItem>
                      <SelectItem value="1">María González</SelectItem>
                      <SelectItem value="2">Carlos Martínez</SelectItem>
                      <SelectItem value="3">Ana Rodríguez</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Módulo</label>
                  <Select value={selectedModule} onValueChange={setSelectedModule}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los módulos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los módulos</SelectItem>
                      <SelectItem value="Autenticación">Autenticación</SelectItem>
                      <SelectItem value="Calificaciones">Calificaciones</SelectItem>
                      <SelectItem value="Estudiantes">Estudiantes</SelectItem>
                      <SelectItem value="Configuración">Configuración</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Estado</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="success">Exitoso</SelectItem>
                      <SelectItem value="warning">Advertencia</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="border rounded-lg max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha/Hora</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Detalles</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No se encontraron actividades con los filtros seleccionados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHistory.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <div>
                            <div>{entry.timestamp.toLocaleDateString()}</div>
                            <div className="text-xs text-gray-500">
                              {entry.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{entry.userName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Activity className="h-4 w-4 text-gray-500" />
                          <span>{entry.action}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{entry.module}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={entry.details}>
                          {entry.details}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(entry.status)}
                          {getStatusBadge(entry.status)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {entry.ipAddress}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <div className="text-sm text-gray-600 text-center">
            Mostrando {filteredHistory.length} de {mockHistory.length} actividades
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserHistoryModal;
