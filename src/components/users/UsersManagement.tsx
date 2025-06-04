
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Trash2, Search, Users, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const UsersManagement: React.FC = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showPassword, setShowPassword] = useState(false);

  // Mock data
  const [users, setUsers] = useState([
    {
      id: '1',
      email: 'director@ejemplo.edu.do',
      firstName: 'María',
      lastName: 'González',
      role: 'admin',
      phone: '809-555-0001',
      isActive: true,
      createdAt: '2024-01-15',
      assignedSections: []
    },
    {
      id: '2',
      email: 'profesor@ejemplo.edu.do',
      firstName: 'Carlos',
      lastName: 'Martínez',
      role: 'teacher',
      phone: '809-555-0002',
      isActive: true,
      createdAt: '2024-01-20',
      assignedSections: ['1A', '2B']
    },
    {
      id: '3',
      email: 'auxiliar@ejemplo.edu.do',
      firstName: 'Ana',
      lastName: 'Rodríguez',
      role: 'auxiliary',
      phone: '809-555-0003',
      isActive: true,
      createdAt: '2024-02-01',
      assignedSections: []
    }
  ]);

  const roleLabels = {
    admin: 'Administrador',
    teacher: 'Docente',
    auxiliary: 'Auxiliar',
    parent: 'Padre/Tutor',
    student: 'Estudiante'
  };

  const sections = [
    { id: '1A', name: '1° A' },
    { id: '2B', name: '2° B' },
    { id: '3A', name: '3° A' }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, isActive: !u.isActive } : u
    ));
    toast({
      title: "Estado actualizado",
      description: "El estado del usuario ha sido actualizado.",
    });
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
    toast({
      title: "Usuario eliminado",
      description: "El usuario ha sido eliminado exitosamente.",
    });
  };

  const handleSaveUser = (formData: any) => {
    if (editingUser) {
      setUsers(users.map(u => 
        u.id === editingUser.id ? { ...u, ...formData } : u
      ));
      toast({
        title: "Usuario actualizado",
        description: "Los datos del usuario han sido actualizados.",
      });
    } else {
      const newUser = {
        id: Date.now().toString(),
        ...formData,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setUsers([...users, newUser]);
      toast({
        title: "Usuario creado",
        description: "El nuevo usuario ha sido creado exitosamente.",
      });
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-title font-montserrat text-minerd-blue">
            Gestión de Usuarios
          </h1>
          <p className="text-body font-opensans text-gray-600">
            Administra las cuentas de usuarios del sistema
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateUser} className="bg-minerd-green hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Usuario
            </Button>
          </DialogTrigger>
          <UserDialog
            user={editingUser}
            sections={sections}
            onSave={handleSaveUser}
            onCancel={() => setIsDialogOpen(false)}
          />
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre o correo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por rol" />
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
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-montserrat flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Lista de Usuarios ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Secciones</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha de Creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-gray-500">{user.phone}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {roleLabels[user.role as keyof typeof roleLabels]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.assignedSections && user.assignedSections.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.assignedSections.map((section: string) => (
                          <Badge key={section} variant="outline" className="text-xs">
                            {section}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleUserStatus(user.id)}
                        title={user.isActive ? "Desactivar" : "Activar"}
                      >
                        {user.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const UserDialog: React.FC<{
  user: any;
  sections: any[];
  onSave: (data: any) => void;
  onCancel: () => void;
}> = ({ user, sections, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
    role: user?.role || 'teacher',
    phone: user?.phone || '',
    assignedSections: user?.assignedSections || []
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) return;
    if (!user && (!formData.password || formData.password !== formData.confirmPassword)) {
      return;
    }
    
    const submitData = { ...formData };
    if (user && !formData.password) {
      delete submitData.password;
      delete submitData.confirmPassword;
    }
    
    onSave(submitData);
  };

  return (
    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="font-montserrat">
          {user ? 'Editar Usuario' : 'Nuevo Usuario'}
        </DialogTitle>
        <DialogDescription className="font-opensans">
          {user ? 'Modifica los datos del usuario' : 'Completa los datos para crear un nuevo usuario'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Nombre</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Apellido</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Correo Electrónico</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password">
              {user ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required={!user}
                minLength={8}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required={!user || formData.password !== ''}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="teacher">Docente</SelectItem>
                <SelectItem value="auxiliary">Auxiliar</SelectItem>
                <SelectItem value="parent">Padre/Tutor</SelectItem>
                <SelectItem value="student">Estudiante</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="809-555-0000"
            />
          </div>
        </div>
        {formData.role === 'teacher' && (
          <div className="space-y-2">
            <Label>Secciones Asignadas</Label>
            <div className="flex flex-wrap gap-2">
              {sections.map((section) => (
                <Button
                  key={section.id}
                  type="button"
                  variant={formData.assignedSections.includes(section.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const newSections = formData.assignedSections.includes(section.id)
                      ? formData.assignedSections.filter((s: string) => s !== section.id)
                      : [...formData.assignedSections, section.id];
                    setFormData({...formData, assignedSections: newSections});
                  }}
                >
                  {section.name}
                </Button>
              ))}
            </div>
          </div>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-minerd-green hover:bg-green-700">
            {user ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default UsersManagement;
