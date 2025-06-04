import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Users, Plus, Search, Edit, Trash2, Eye, EyeOff } from 'lucide-react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  assignedSections: string[];
  avatar?: string;
}

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Omit<User, 'id' | 'createdAt' | 'avatar'>>({
    email: '',
    firstName: '',
    lastName: '',
    role: 'student',
    phone: '',
    isActive: true,
    assignedSections: [],
  });

  const roles = ['admin', 'teacher', 'auxiliary', 'parent', 'student'];
  const sections = [
    { id: '1A', name: '1° A' },
    { id: '1B', name: '1° B' },
    { id: '2A', name: '2° A' },
    { id: '2B', name: '2° B' },
    { id: '3A', name: '3° A' },
    { id: '3B', name: '3° B' }
  ];

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'teacher':
        return 'Docente';
      case 'auxiliary':
        return 'Auxiliar';
      case 'parent':
        return 'Padre/Madre';
      case 'student':
        return 'Estudiante';
      default:
        return 'Desconocido';
    }
  };

  const filteredUsers = users.filter(user =>
    user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const createUser = (user: Omit<User, 'id' | 'createdAt' | 'avatar'>) => {
    const newUser = { ...user, id: String(Date.now()), createdAt: new Date().toISOString(), avatar: undefined };
    setUsers([...users, newUser]);
    toast({
      title: "Usuario creado",
      description: `El usuario ${user.firstName} ${user.lastName} ha sido creado exitosamente`,
    });
  };

  const updateUser = (id: string, updatedUser: Omit<User, 'createdAt' | 'avatar'>) => {
    setUsers(users.map(user => user.id === id ? { ...user, ...updatedUser } : user));
    toast({
      title: "Usuario actualizado",
      description: `El usuario ${updatedUser.firstName} ${updatedUser.lastName} ha sido actualizado exitosamente`,
    });
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
    toast({
      title: "Usuario eliminado",
      description: "El usuario ha sido eliminado exitosamente",
      variant: "destructive"
    });
  };

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
    setNewUser({
      email: '',
      firstName: '',
      lastName: '',
      role: 'student',
      phone: '',
      isActive: true,
      assignedSections: [],
    });
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  // Mock data
  const mockUsers: User[] = [
    {
      id: '1',
      email: 'admin@escuela.edu.do',
      firstName: 'María',
      lastName: 'González',
      role: 'admin',
      phone: '809-555-0001',
      isActive: true,
      createdAt: '2024-01-15',
      assignedSections: [],
      avatar: undefined
    },
    {
      id: '2',
      email: 'teacher1@escuela.edu.do',
      firstName: 'Juan',
      lastName: 'Pérez',
      role: 'teacher',
      phone: '809-555-0002',
      isActive: true,
      createdAt: '2024-01-20',
      assignedSections: ['1A', '2B'],
      avatar: undefined
    },
    {
      id: '3',
      email: 'aux1@escuela.edu.do',
      firstName: 'Ana',
      lastName: 'Jiménez',
      role: 'auxiliary',
      phone: '809-555-0003',
      isActive: false,
      createdAt: '2024-02-01',
      assignedSections: [],
      avatar: undefined
    },
    {
      id: '4',
      email: 'parent1@escuela.edu.do',
      firstName: 'Pedro',
      lastName: 'Ramírez',
      role: 'parent',
      phone: '809-555-0004',
      isActive: true,
      createdAt: '2024-02-10',
      assignedSections: [],
      avatar: undefined
    },
    {
      id: '5',
      email: 'student1@escuela.edu.do',
      firstName: 'Sofía',
      lastName: 'Martínez',
      role: 'student',
      phone: '809-555-0005',
      isActive: true,
      createdAt: '2024-02-15',
      assignedSections: ['3A'],
      avatar: undefined
    }
  ];

  React.useEffect(() => {
    setUsers(mockUsers);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-title font-montserrat text-minerd-blue">
            Gestión de Usuarios
          </h1>
          <p className="text-body font-opensans text-gray-600">
            Administración y control de acceso al sistema
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="search"
            placeholder="Buscar usuario..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sm:w-64"
          />
          <Button
            onClick={openCreateModal}
            className="bg-minerd-blue hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear Usuario
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-montserrat flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Lista de Usuarios
          </CardTitle>
          <CardDescription className="font-opensans">
            Usuarios registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Secciones</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="text-xs">
                            {user.firstName[0]}{user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-gray-500">ID: {user.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.assignedSections.length > 0 ? (
                          user.assignedSections.map(section => (
                            <Badge key={section} variant="outline" className="text-xs">
                              {section}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">Sin asignar</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
                              deleteUser(user.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create User Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Ingrese la información del nuevo usuario.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                type="email"
                id="email"
                placeholder="ejemplo@escuela.edu.do"
                className="col-span-3"
                value={newUser?.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="text-right">
                Nombre
              </Label>
              <Input
                type="text"
                id="firstName"
                placeholder="Nombre"
                className="col-span-3"
                value={newUser?.firstName}
                onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="text-right">
                Apellido
              </Label>
              <Input
                type="text"
                id="lastName"
                placeholder="Apellido"
                className="col-span-3"
                value={newUser?.lastName}
                onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Rol
              </Label>
              <Select value={newUser?.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role} value={role}>
                      {getRoleLabel(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Teléfono
              </Label>
              <Input
                type="tel"
                id="phone"
                placeholder="809-555-5555"
                className="col-span-3"
                value={newUser?.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isActive" className="text-right">
                Estado
              </Label>
              <div className="col-span-3 flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  className="mr-2 h-5 w-5"
                  checked={newUser?.isActive}
                  onChange={(e) => setNewUser({ ...newUser, isActive: e.target.checked })}
                />
                <Label htmlFor="isActive">Activo</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={closeCreateModal}>
              Cancelar
            </Button>
            <Button type="submit" onClick={() => {
              createUser(newUser);
              closeCreateModal();
            }}>
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifique la información del usuario.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                type="email"
                id="email"
                placeholder="ejemplo@escuela.edu.do"
                className="col-span-3"
                value={selectedUser?.email}
                onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value } as User)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="text-right">
                Nombre
              </Label>
              <Input
                type="text"
                id="firstName"
                placeholder="Nombre"
                className="col-span-3"
                value={selectedUser?.firstName}
                onChange={(e) => setSelectedUser({ ...selectedUser, firstName: e.target.value } as User)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="text-right">
                Apellido
              </Label>
              <Input
                type="text"
                id="lastName"
                placeholder="Apellido"
                className="col-span-3"
                value={selectedUser?.lastName}
                onChange={(e) => setSelectedUser({ ...selectedUser, lastName: e.target.value } as User)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Rol
              </Label>
              <Select value={selectedUser?.role} onValueChange={(value) => setSelectedUser({ ...selectedUser, role: value } as User)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role} value={role}>
                      {getRoleLabel(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Teléfono
              </Label>
              <Input
                type="tel"
                id="phone"
                placeholder="809-555-5555"
                className="col-span-3"
                value={selectedUser?.phone}
                onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value } as User)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isActive" className="text-right">
                Estado
              </Label>
              <div className="col-span-3 flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  className="mr-2 h-5 w-5"
                  checked={selectedUser?.isActive}
                  onChange={(e) => setSelectedUser({ ...selectedUser, isActive: e.target.checked } as User)}
                />
                <Label htmlFor="isActive">Activo</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={closeEditModal}>
              Cancelar
            </Button>
            <Button type="submit" onClick={() => {
              updateUser(selectedUser!.id, selectedUser!);
              closeEditModal();
            }}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManagement;
