
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AuditLog } from '@/types/academic';
import { History, User, Calendar, Filter } from 'lucide-react';

interface AuditoriaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialFilters?: {
    module?: string;
    userId?: string;
    filterType?: 'all' | 'user' | 'module';
  };
}

const AuditoriaModal: React.FC<AuditoriaModalProps> = ({ 
  open, 
  onOpenChange, 
  initialFilters = {} 
}) => {
  const [filtroModulo, setFiltroModulo] = useState<string>('all');
  const [filtroAccion, setFiltroAccion] = useState<string>('');
  const [filtroUsuario, setFiltroUsuario] = useState<string>('all');

  // Apply initial filters when modal opens
  useEffect(() => {
    if (open && initialFilters.filterType) {
      switch (initialFilters.filterType) {
        case 'module':
          setFiltroModulo(initialFilters.module || 'all');
          setFiltroUsuario('all');
          break;
        case 'user':
          setFiltroUsuario(initialFilters.userId || 'all');
          setFiltroModulo('all');
          break;
        case 'all':
        default:
          setFiltroModulo('all');
          setFiltroUsuario('all');
          break;
      }
      setFiltroAccion('');
    }
  }, [open, initialFilters]);

  // Mock data de auditoría - expanded with more users
  const auditLogs: AuditLog[] = [
    {
      id: '1',
      userId: 'USER001',
      userRole: 'teacher',
      accion: 'Actualizar calificación',
      modulo: 'calificaciones',
      detalles: 'Actualizó calificación P1 de Ana María González en PC1 de 80 a 85',
      entidadAfectada: 'Grade',
      entidadId: 'GRADE001',
      timestamp: new Date('2024-12-05T10:30:00'),
      ipAddress: '192.168.1.100'
    },
    {
      id: '2',
      userId: 'USER002',
      userRole: 'admin',
      accion: 'Configurar competencias',
      modulo: 'calificaciones',
      detalles: 'Actualizó descripción de competencias para PC1 - Comprensión Lectora',
      entidadAfectada: 'BloqueCompetencias',
      entidadId: 'BLOQUE001',
      timestamp: new Date('2024-12-05T09:15:00'),
      ipAddress: '192.168.1.101'
    },
    {
      id: '3',
      userId: 'USER001',
      userRole: 'teacher',
      accion: 'Agregar registro anecdótico',
      modulo: 'calificaciones',
      detalles: 'Agregó registro anecdótico positivo para Carlos Rodríguez Pérez',
      entidadAfectada: 'RegistroAnecdotico',
      entidadId: 'REG001',
      timestamp: new Date('2024-12-05T08:45:00'),
      ipAddress: '192.168.1.100'
    },
    {
      id: '4',
      userId: 'USER003',
      userRole: 'auxiliary',
      accion: 'Crear estudiante',
      modulo: 'estudiantes',
      detalles: 'Registró nuevo estudiante: María José Fernández',
      entidadAfectada: 'Student',
      entidadId: 'EST003',
      timestamp: new Date('2024-12-04T16:20:00'),
      ipAddress: '192.168.1.102'
    },
    {
      id: '5',
      userId: 'USER002',
      userRole: 'admin',
      accion: 'Crear usuario',
      modulo: 'usuarios',
      detalles: 'Creó nueva cuenta de profesor: Luis Méndez',
      entidadAfectada: 'User',
      entidadId: 'USER004',
      timestamp: new Date('2024-12-04T14:10:00'),
      ipAddress: '192.168.1.101'
    },
    {
      id: '6',
      userId: 'USER004',
      userRole: 'teacher',
      accion: 'Registrar asistencia',
      modulo: 'asistencia',
      detalles: 'Marcó asistencia para sección 1° A - 15 presentes, 2 ausentes',
      entidadAfectada: 'Attendance',
      entidadId: 'ATT001',
      timestamp: new Date('2024-12-04T08:30:00'),
      ipAddress: '192.168.1.103'
    }
  ];

  // Mock users data
  const users = [
    { id: 'USER001', name: 'Prof. María González' },
    { id: 'USER002', name: 'Admin Juan Pérez' },
    { id: 'USER003', name: 'Aux. Carmen López' },
    { id: 'USER004', name: 'Prof. Luis Méndez' }
  ];

  const getModuloColor = (modulo: string) => {
    switch (modulo) {
      case 'calificaciones': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'estudiantes': return 'bg-green-100 text-green-800 border-green-200';
      case 'usuarios': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'asistencia': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reportes': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'teacher': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'auxiliary': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const logsFilteredData = auditLogs.filter(log => {
    const moduloMatch = filtroModulo === 'all' || log.modulo === filtroModulo;
    const accionMatch = !filtroAccion || log.accion.toLowerCase().includes(filtroAccion.toLowerCase());
    const usuarioMatch = filtroUsuario === 'all' || log.userId === filtroUsuario;
    return moduloMatch && accionMatch && usuarioMatch;
  });

  const clearFilters = () => {
    setFiltroModulo('all');
    setFiltroAccion('');
    setFiltroUsuario('all');
  };

  return (
  <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto mx-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center text-xl">
            <History className="w-5 h-5 mr-2" />
            Histórico y Auditoría del Sistema
          </DialogTitle>
          <DialogDescription>
            Registro completo de todas las actividades realizadas en el sistema
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filtros - Más compacto */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Filtros de Búsqueda
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Usuario</label>
                  <Select value={filtroUsuario} onValueChange={setFiltroUsuario}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todos los usuarios" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los usuarios</SelectItem>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Módulo</label>
                  <Select value={filtroModulo} onValueChange={setFiltroModulo}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todos los módulos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los módulos</SelectItem>
                      <SelectItem value="calificaciones">Calificaciones</SelectItem>
                      <SelectItem value="estudiantes">Estudiantes</SelectItem>
                      <SelectItem value="usuarios">Usuarios</SelectItem>
                      <SelectItem value="asistencia">Asistencia</SelectItem>
                      <SelectItem value="reportes">Reportes</SelectItem>
                      <SelectItem value="secciones">Secciones</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Buscar Acción</label>
                  <input
                    type="text"
                    value={filtroAccion}
                    onChange={(e) => setFiltroAccion(e.target.value)}
                    placeholder="Buscar por acción..."
                    className="w-full h-9 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters} className="w-full h-9 text-sm">
                    Limpiar Filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas Rápidas - Más compactas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="text-center">
              <CardContent className="py-4">
                <div className="text-xl font-bold text-blue-600">{auditLogs.length}</div>
                <div className="text-xs text-gray-600">Total Actividades</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="py-4">
                <div className="text-xl font-bold text-green-600">
                  {auditLogs.filter(log => log.modulo === 'calificaciones').length}
                </div>
                <div className="text-xs text-gray-600">Calificaciones</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="py-4">
                <div className="text-xl font-bold text-purple-600">
                  {auditLogs.filter(log => log.userRole === 'admin').length}
                </div>
                <div className="text-xs text-gray-600">Admin</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="py-4">
                <div className="text-xl font-bold text-orange-600">
                  {auditLogs.filter(log => log.userRole === 'teacher').length}
                </div>
                <div className="text-xs text-gray-600">Profesores</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de Auditoría - Layout optimizado */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Registro de Actividades ({logsFilteredData.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[120px] text-xs">Fecha/Hora</TableHead>
                      <TableHead className="w-[140px] text-xs">Usuario</TableHead>
                      <TableHead className="w-[80px] text-xs">Rol</TableHead>
                      <TableHead className="w-[100px] text-xs">Módulo</TableHead>
                      <TableHead className="w-[140px] text-xs">Acción</TableHead>
                      <TableHead className="text-xs">Detalles</TableHead>
                      <TableHead className="w-[100px] text-xs">IP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logsFilteredData.map((log) => {
                      const user = users.find(u => u.id === log.userId);
                      return (
                        <TableRow key={log.id} className="hover:bg-gray-50">
                          <TableCell className="font-mono text-xs py-2">
                            <div>
                              <div>{log.timestamp.toLocaleDateString()}</div>
                              <div className="text-gray-500">{log.timestamp.toLocaleTimeString()}</div>
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="flex items-center text-xs">
                              <User className="w-3 h-3 mr-1 text-gray-400" />
                              <span className="truncate">{user?.name || log.userId}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            <Badge className={`text-xs px-2 py-1 ${getRoleColor(log.userRole)}`}>
                              {log.userRole}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2">
                            <Badge className={`text-xs px-2 py-1 ${getModuloColor(log.modulo)}`}>
                              {log.modulo}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-xs py-2">{log.accion}</TableCell>
                          <TableCell className="text-xs py-2">
                            <div className="max-w-xs truncate" title={log.detalles}>
                              {log.detalles}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs py-2">{log.ipAddress}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuditoriaModal;
