
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
import { Plus, Edit, Trash2, Search, Users, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const StudentsManagement: React.FC = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');

  // Mock data
  const [students, setStudents] = useState([
    {
      id: '1',
      rne: '202300001',
      firstName: 'Juan',
      lastName: 'Pérez García',
      dateOfBirth: '2010-05-15',
      gender: 'masculino',
      sectionId: '1',
      sectionName: '1° A',
      address: 'Calle Principal #123, Santo Domingo',
      emergencyPhone: '809-555-0101',
      representativeName: 'María García',
      representativePhone: '809-555-0102',
      avatar: null,
      isActive: true
    },
    {
      id: '2',
      rne: '202300002',
      firstName: 'Ana',
      lastName: 'Rodríguez López',
      dateOfBirth: '2009-08-22',
      gender: 'femenino',
      sectionId: '2',
      sectionName: '2° B',
      address: 'Av. Independencia #456, Santiago',
      emergencyPhone: '809-555-0201',
      representativeName: 'Carlos Rodríguez',
      representativePhone: '809-555-0202',
      avatar: null,
      isActive: true
    }
  ]);

  const sections = [
    { id: '1', name: '1° A' },
    { id: '2', name: '2° B' },
    { id: '3', name: '3° A' }
  ];

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rne.includes(searchTerm);
    const matchesSection = selectedSection === 'all' || student.sectionId === selectedSection;
    return matchesSearch && matchesSection;
  });

  const handleCreateStudent = () => {
    setEditingStudent(null);
    setIsDialogOpen(true);
  };

  const handleEditStudent = (student: any) => {
    setEditingStudent(student);
    setIsDialogOpen(true);
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents(students.filter(s => s.id !== studentId));
    toast({
      title: "Estudiante eliminado",
      description: "El estudiante ha sido eliminado exitosamente.",
    });
  };

  const handleSaveStudent = (formData: any) => {
    if (editingStudent) {
      setStudents(students.map(s => 
        s.id === editingStudent.id 
          ? { ...s, ...formData, sectionName: sections.find(sec => sec.id === formData.sectionId)?.name }
          : s
      ));
      toast({
        title: "Estudiante actualizado",
        description: "Los datos del estudiante han sido actualizados.",
      });
    } else {
      const newStudent = {
        id: Date.now().toString(),
        ...formData,
        sectionName: sections.find(sec => sec.id === formData.sectionId)?.name,
        avatar: null,
        isActive: true
      };
      setStudents([...students, newStudent]);
      toast({
        title: "Estudiante creado",
        description: "El nuevo estudiante ha sido registrado exitosamente.",
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
            Gestión de Estudiantes
          </h1>
          <p className="text-body font-opensans text-gray-600">
            Administra el registro de estudiantes del centro
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="text-minerd-blue border-minerd-blue">
            <Upload className="w-4 h-4 mr-2" />
            Importar CSV
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateStudent} className="bg-minerd-green hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Estudiante
              </Button>
            </DialogTrigger>
            <StudentDialog
              student={editingStudent}
              sections={sections}
              onSave={handleSaveStudent}
              onCancel={() => setIsDialogOpen(false)}
            />
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre o RNE..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por sección" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las secciones</SelectItem>
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-montserrat flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Lista de Estudiantes ({filteredStudents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>RNE</TableHead>
                <TableHead>Sección</TableHead>
                <TableHead>Género</TableHead>
                <TableHead>Representante</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback>
                          {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{student.firstName} {student.lastName}</div>
                        <div className="text-sm text-gray-500">{student.emergencyPhone}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{student.rne}</TableCell>
                  <TableCell>{student.sectionName}</TableCell>
                  <TableCell className="capitalize">{student.gender}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{student.representativeName}</div>
                      <div className="text-sm text-gray-500">{student.representativePhone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={student.isActive ? "default" : "secondary"}>
                      {student.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditStudent(student)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteStudent(student.id)}
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

const StudentDialog: React.FC<{
  student: any;
  sections: any[];
  onSave: (data: any) => void;
  onCancel: () => void;
}> = ({ student, sections, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: student?.firstName || '',
    lastName: student?.lastName || '',
    rne: student?.rne || '',
    dateOfBirth: student?.dateOfBirth || '',
    gender: student?.gender || 'masculino',
    sectionId: student?.sectionId || '',
    address: student?.address || '',
    emergencyPhone: student?.emergencyPhone || '',
    representativeName: student?.representativeName || '',
    representativePhone: student?.representativePhone || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.rne) return;
    onSave(formData);
  };

  return (
    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="font-montserrat">
          {student ? 'Editar Estudiante' : 'Nuevo Estudiante'}
        </DialogTitle>
        <DialogDescription className="font-opensans">
          {student ? 'Modifica los datos del estudiante' : 'Completa los datos para registrar un nuevo estudiante'}
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
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rne">RNE</Label>
            <Input
              id="rne"
              value={formData.rne}
              onChange={(e) => setFormData({...formData, rne: e.target.value})}
              placeholder="202300001"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gender">Género</Label>
            <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="femenino">Femenino</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="section">Sección</Label>
            <Select value={formData.sectionId} onValueChange={(value) => setFormData({...formData, sectionId: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar sección" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Dirección</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            placeholder="Calle, número, ciudad"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emergencyPhone">Teléfono de Emergencia</Label>
          <Input
            id="emergencyPhone"
            value={formData.emergencyPhone}
            onChange={(e) => setFormData({...formData, emergencyPhone: e.target.value})}
            placeholder="809-555-0000"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="representativeName">Nombre del Representante</Label>
            <Input
              id="representativeName"
              value={formData.representativeName}
              onChange={(e) => setFormData({...formData, representativeName: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="representativePhone">Teléfono del Representante</Label>
            <Input
              id="representativePhone"
              value={formData.representativePhone}
              onChange={(e) => setFormData({...formData, representativePhone: e.target.value})}
              placeholder="809-555-0000"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-minerd-green hover:bg-green-700">
            {student ? 'Actualizar' : 'Registrar'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default StudentsManagement;
