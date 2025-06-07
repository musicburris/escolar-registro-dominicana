
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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

const UserHistoryModal: React.FC<UserHistoryModalProps> = ({ open, onOpenChange }) => {
  const { getUserHistory, getAllUsers } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Definir módulos válidos con valores seguros
  const moduleOptions = [
    { value: 'autenticacion', label: 'Autenticación' },
    { value: 'perfil', label: 'Perfil' },
    { value: 'usuarios', label: 'Usuarios' },
    { value: 'seguridad', label: 'Seguridad' },
    { value: 'calificaciones', label: 'Calificaciones' },
    { value: 'estudiantes', label: 'Estudiantes' },
    { value: 'configuracion', label: 'Configuración' }
  ];

  // Definir estados válidos con valores seguros
  const statusOptions = [
    { value: 'success', label: 'Exitoso' },
    { value: 'warning', label: 'Advertencia' },
    { value: 'error', label: 'Error' }
  ];

  useEffect(() => {
    if (open) {
      const historyData = getUserHistory();
      const usersData = getAllUsers();
      
      console.log('Raw users data:', usersData);
      
      // Convert timestamp strings to Date objects if needed
      const processedHistory = historyData.map((entry: any) => ({
        ...entry,
        timestamp: typeof entry.timestamp === 'string' ? new Date(entry.timestamp) : entry.timestamp
      }));
      
      setHistory(processedHistory);
      setUsers(usersData);
    }
  }, [open, getUserHistory, getAllUsers]);

  const filteredHistory = history.filter(entry => {
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

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedModule('all');
    setSelectedStatus('all');
    setSelectedUser('all');
  };

  // Filter and validate users with the most strict validation possible
  const validUsers = users.filter(user => {
    console.log('Checking user:', user);
    
    // Check if user exists
    if (!user) {
      console.log('User is null/undefined');
      return false;
    }
    
    // Check if ID is valid and not empty
    if (!user.id || 
        typeof user.id !== 'string' || 
        user.id.trim() === '' || 
        user.id === 'undefined' || 
        user.id === 'null') {
      console.log('User has invalid ID:', user.id);
      return false;
    }
    
    // Check if user has a name
    const hasValidName = (user.firstName && typeof user.firstName === 'string' && user.firstName.trim() !== '') || 
                        (user.lastName && typeof user.lastName === 'string' && user.lastName.trim() !== '');
    
    if (!hasValidName) {
      console.log('User has no valid name:', user);
      return false;
    }
    
    console.log('User is valid:', user.id, user.firstName, user.lastName);
    return true;
  });

  console.log('Valid users for select:', validUsers);

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                      {validUsers.map((user) => {
                        // Additional validation just before rendering
                        if (!user?.id || user.id.trim() === '') {
                          console.error('Attempting to render SelectItem with invalid user:', user);
                          return null;
                        }
                        
                        const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuario sin nombre';
                        
                        return (
                          <SelectItem key={user.id} value={user.id}>
                            {displayName}
                          </SelectItem>
                        );
                      })}
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
                      {moduleOptions.map((module) => (
                        <SelectItem key={module.value} value={module.value}>
                          {module.label}
                        </SelectItem>
                      ))}
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
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button variant="outline" className="w-full" onClick={clearFilters}>
                    <Filter className="w-4 h-4 mr-2" />
                    Limpiar Filtros
                  </Button>
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
                            <div>{entry.timestamp.toLocaleDateString('es-DO')}</div>
                            <div className="text-xs text-gray-500">
                              {entry.timestamp.toLocaleTimeString('es-DO')}
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
            Mostrando {filteredHistory.length} de {history.length} actividades
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
