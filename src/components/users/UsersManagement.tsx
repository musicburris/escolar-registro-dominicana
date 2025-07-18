import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import UserHistoryModal from '@/components/users/UserHistoryModal';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  History,
  Shield,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const UsersManagement: React.FC = () => {
  const { user, getAllUsers } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [columnEditMode, setColumnEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [columnWidths, setColumnWidths] = useState({
    user: '250px',
    role: '120px',
    contact: '200px',
    status: '120px',
    date: '140px',
    actions: '100px'
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        const allUsers = await getAllUsers();
        setUsers(allUsers);
      } catch (error) {
        console.error('Error loading users:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [getAllUsers]);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: 'Administrador',
      teacher: 'Docente',
      auxiliary: 'Auxiliar',
      parent: 'Padre/Tutor',
      student: 'Estudiante'
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getRoleBadgeVariant = (role: string): "default" | "destructive" | "outline" | "secondary" => {
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      admin: 'default',
      teacher: 'secondary',
      auxiliary: 'outline',
      parent: 'destructive',
      student: 'secondary'
    };
    return variants[role] || 'default';
  };

  const toggleUserStatus = (userId: string) => {
    if (user?.role !== 'admin') {
      toast({
        title: "Sin permisos",
        description: "Solo los administradores pueden cambiar el estado de usuarios",
        variant: "destructive",
      });
      return;
    }

    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, isActive: !u.isActive } : u
    ));
    toast({
      title: "Estado de usuario actualizado",
      description: "El estado del usuario ha sido cambiado exitosamente",
    });
  };

  const deleteUser = (userId: string) => {
    if (user?.role !== 'admin') {
      toast({
        title: "Sin permisos",
        description: "Solo los administradores pueden eliminar usuarios",
        variant: "destructive",
      });
      return;
    }

    if (userId === user?.id) {
      toast({
        title: "Error",
        description: "No puedes eliminar tu propio usuario",
        variant: "destructive",
      });
      return;
    }
    
    setUsers(prev => prev.filter(u => u.id !== userId));
    toast({
      title: "Usuario eliminado",
      description: "El usuario ha sido eliminado del sistema",
    });
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'No disponible';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('es-DO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedRole('all');
  };

  const handleCreateUser = () => {
    if (user?.role !== 'admin') {
      toast({
        title: "Sin permisos",
        description: "Solo los administradores pueden crear usuarios",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Funcionalidad en desarrollo",
      description: "El modal de creación de usuarios estará disponible próximamente",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-minerd-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando usuarios...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-title font-montserrat text-minerd-blue">
            Gestión de Usuarios
          </h1>
          <p className="text-body font-opensans text-gray-600">
            Administra los usuarios del sistema escolar
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setHistoryModalOpen(true)}
            variant="outline"
            className="flex items-center"
          >
            <History className="w-4 h-4 mr-2" />
            Ver Histórico
          </Button>
          {user?.role === 'admin' && (
            <>
              <Button 
                onClick={() => setColumnEditMode(!columnEditMode)}
                variant="outline"
                className="flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                {columnEditMode ? 'Finalizar Edición' : 'Editar Columnas'}
              </Button>
              <Button 
                onClick={handleCreateUser}
                className="bg-minerd-green hover:bg-green-700 flex items-center"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Nuevo Usuario
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Docentes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'teacher').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Administradores</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Buscar usuario</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Nombre, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Filtrar por rol</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="teacher">Docente</SelectItem>
                  <SelectItem value="auxiliary">Auxiliar</SelectItem>
                  <SelectItem value="parent">Padre/Tutor</SelectItem>
                  <SelectItem value="student">Estudiante</SelectItem>
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

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-montserrat">Lista de Usuarios</CardTitle>
          <CardDescription className="font-opensans">
            {filteredUsers.length} usuarios encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead 
                    className="px-3 py-2"
                    style={{ width: columnWidths.user }}
                  >
                    Usuario
                    {columnEditMode && user?.role === 'admin' && (
                      <input
                        type="range"
                        min="200"
                        max="400"
                        step="10"
                        value={parseInt(columnWidths.user)}
                        onChange={(e) => setColumnWidths({...columnWidths, user: `${e.target.value}px`})}
                        className="block w-full mt-1 h-1"
                      />
                    )}
                  </TableHead>
                  <TableHead 
                    className="px-3 py-2"
                    style={{ width: columnWidths.role }}
                  >
                    Rol
                    {columnEditMode && user?.role === 'admin' && (
                      <input
                        type="range"
                        min="80"
                        max="200"
                        step="10"
                        value={parseInt(columnWidths.role)}
                        onChange={(e) => setColumnWidths({...columnWidths, role: `${e.target.value}px`})}
                        className="block w-full mt-1 h-1"
                      />
                    )}
                  </TableHead>
                  <TableHead 
                    className="px-3 py-2"
                    style={{ width: columnWidths.contact }}
                  >
                    Contacto
                    {columnEditMode && user?.role === 'admin' && (
                      <input
                        type="range"
                        min="150"
                        max="300"
                        step="10"
                        value={parseInt(columnWidths.contact)}
                        onChange={(e) => setColumnWidths({...columnWidths, contact: `${e.target.value}px`})}
                        className="block w-full mt-1 h-1"
                      />
                    )}
                  </TableHead>
                  <TableHead 
                    className="px-3 py-2"
                    style={{ width: columnWidths.status }}
                  >
                    Estado
                    {columnEditMode && user?.role === 'admin' && (
                      <input
                        type="range"
                        min="80"
                        max="200"
                        step="10"
                        value={parseInt(columnWidths.status)}
                        onChange={(e) => setColumnWidths({...columnWidths, status: `${e.target.value}px`})}
                        className="block w-full mt-1 h-1"
                      />
                    )}
                  </TableHead>
                  <TableHead 
                    className="px-3 py-2"
                    style={{ width: columnWidths.date }}
                  >
                    Fecha de Registro
                    {columnEditMode && user?.role === 'admin' && (
                      <input
                        type="range"
                        min="120"
                        max="250"
                        step="10"
                        value={parseInt(columnWidths.date)}
                        onChange={(e) => setColumnWidths({...columnWidths, date: `${e.target.value}px`})}
                        className="block w-full mt-1 h-1"
                      />
                    )}
                  </TableHead>
                  <TableHead 
                    className="px-3 py-2 text-center"
                    style={{ width: columnWidths.actions }}
                  >
                    Acciones
                    {columnEditMode && user?.role === 'admin' && (
                      <input
                        type="range"
                        min="80"
                        max="150"
                        step="10"
                        value={parseInt(columnWidths.actions)}
                        onChange={(e) => setColumnWidths({...columnWidths, actions: `${e.target.value}px`})}
                        className="block w-full mt-1 h-1"
                      />
                    )}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {filteredUsers.map((userItem) => (
                  <TableRow key={userItem.id} className="hover:bg-gray-50">
                    <TableCell className="px-3 py-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-minerd-blue rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs">
                            {userItem.firstName?.charAt(0)}{userItem.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">
                            {userItem.firstName} {userItem.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{userItem.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <Badge variant={getRoleBadgeVariant(userItem.role)}>
                        {getRoleLabel(userItem.role)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="w-3 h-3 mr-1 text-gray-500" />
                          {userItem.email}
                        </div>
                        {userItem.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-3 h-3 mr-1 text-gray-500" />
                            {userItem.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={userItem.isActive}
                          onCheckedChange={() => toggleUserStatus(userItem.id)}
                          disabled={userItem.id === user?.id || user?.role !== 'admin'}
                        />
                        <span className="text-sm">
                          {userItem.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="w-3 h-3 mr-1 text-gray-500" />
                        {formatDate(userItem.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user?.role === 'admin' && (
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <History className="mr-2 h-4 w-4" />
                            Ver Actividad
                          </DropdownMenuItem>
                          {userItem.id !== user?.id && user?.role === 'admin' && (
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => deleteUser(userItem.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* User History Modal */}
      <UserHistoryModal
        open={historyModalOpen}
        onOpenChange={setHistoryModalOpen}
      />
    </div>
  );
};

export default UsersManagement;
