
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Plus, Edit, Trash2, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SectionsManagement: React.FC = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);

  // Mock data
  const [sections, setSections] = useState([
    {
      id: '1',
      grade: 1,
      name: 'A',
      coordinatorId: '2',
      coordinatorName: 'Carlos Martínez',
      studentCount: 28,
      academicYear: '2024-2025',
      isActive: true
    },
    {
      id: '2',
      grade: 2,
      name: 'B',
      coordinatorId: '2',
      coordinatorName: 'Carlos Martínez',
      studentCount: 26,
      academicYear: '2024-2025',
      isActive: true
    },
    {
      id: '3',
      grade: 3,
      name: 'A',
      coordinatorId: '2',
      coordinatorName: 'Carlos Martínez',
      studentCount: 24,
      academicYear: '2024-2025',
      isActive: true
    }
  ]);

  const teachers = [
    { id: '2', name: 'Carlos Martínez' },
    { id: '4', name: 'Ana Rodríguez' },
    { id: '5', name: 'Luis García' }
  ];

  const handleCreateSection = () => {
    setEditingSection(null);
    setIsDialogOpen(true);
  };

  const handleEditSection = (section: any) => {
    setEditingSection(section);
    setIsDialogOpen(true);
  };

  const handleDeleteSection = (sectionId: string) => {
    setSections(sections.filter(s => s.id !== sectionId));
    toast({
      title: "Sección eliminada",
      description: "La sección ha sido eliminada exitosamente.",
    });
  };

  const handleSaveSection = (formData: any) => {
    if (editingSection) {
      setSections(sections.map(s => 
        s.id === editingSection.id 
          ? { ...s, ...formData, coordinatorName: teachers.find(t => t.id === formData.coordinatorId)?.name }
          : s
      ));
      toast({
        title: "Sección actualizada",
        description: "Los datos de la sección han sido actualizados.",
      });
    } else {
      const newSection = {
        id: Date.now().toString(),
        ...formData,
        coordinatorName: teachers.find(t => t.id === formData.coordinatorId)?.name,
        studentCount: 0,
        academicYear: '2024-2025',
        isActive: true
      };
      setSections([...sections, newSection]);
      toast({
        title: "Sección creada",
        description: "La nueva sección ha sido creada exitosamente.",
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
            Gestión de Secciones
          </h1>
          <p className="text-body font-opensans text-gray-600">
            Administra las secciones del centro educativo
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateSection} className="bg-minerd-green hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Sección
            </Button>
          </DialogTrigger>
          <SectionDialog
            section={editingSection}
            teachers={teachers}
            onSave={handleSaveSection}
            onCancel={() => setIsDialogOpen(false)}
          />
        </Dialog>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Card key={section.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-minerd-blue" />
                  <CardTitle className="text-lg font-montserrat">
                    {section.grade}° - Sección {section.name}
                  </CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {section.studentCount} estudiantes
                </Badge>
              </div>
              <CardDescription className="font-opensans">
                Coordinador: {section.coordinatorName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Año escolar:</span>
                <span className="font-medium">{section.academicYear}</span>
              </div>
              <div className="flex justify-between items-center">
                <Badge variant={section.isActive ? "default" : "secondary"}>
                  {section.isActive ? "Activa" : "Inactiva"}
                </Badge>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditSection(section)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteSection(section.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const SectionDialog: React.FC<{
  section: any;
  teachers: any[];
  onSave: (data: any) => void;
  onCancel: () => void;
}> = ({ section, teachers, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    grade: section?.grade || 1,
    name: section?.name || '',
    coordinatorId: section?.coordinatorId || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.coordinatorId) return;
    onSave(formData);
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="font-montserrat">
          {section ? 'Editar Sección' : 'Nueva Sección'}
        </DialogTitle>
        <DialogDescription className="font-opensans">
          {section ? 'Modifica los datos de la sección' : 'Completa los datos para crear una nueva sección'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="grade">Grado</Label>
          <Select value={formData.grade.toString()} onValueChange={(value) => setFormData({...formData, grade: parseInt(value)})}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar grado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1er Grado</SelectItem>
              <SelectItem value="2">2do Grado</SelectItem>
              <SelectItem value="3">3er Grado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Nombre de Sección</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="A, B, C..."
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="coordinator">Docente Coordinador</Label>
          <Select value={formData.coordinatorId} onValueChange={(value) => setFormData({...formData, coordinatorId: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar docente" />
            </SelectTrigger>
            <SelectContent>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-minerd-green hover:bg-green-700">
            {section ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default SectionsManagement;
