
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
} from '@/components/ui/dialog';
import { Calendar, Save, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const AttendanceManagement: React.FC = () => {
  const { toast } = useToast();
  const [selectedSection, setSelectedSection] = useState('1');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reasonDialog, setReasonDialog] = useState<{isOpen: boolean, studentId: string}>({isOpen: false, studentId: ''});
  const [absenceReason, setAbsenceReason] = useState('');

  // Mock data
  const sections = [
    { id: '1', name: '1° A', studentCount: 28 },
    { id: '2', name: '2° B', studentCount: 26 },
    { id: '3', name: '3° A', studentCount: 24 }
  ];

  const [students, setStudents] = useState([
    {
      id: '1',
      rne: '202300001',
      firstName: 'Juan',
      lastName: 'Pérez García',
      avatar: null,
      attendance: {
        isPresent: true,
        isLate: false,
        reason: ''
      }
    },
    {
      id: '2',
      rne: '202300002',
      firstName: 'Ana',
      lastName: 'Rodríguez López',
      avatar: null,
      attendance: {
        isPresent: false,
        isLate: false,
        reason: 'Cita médica'
      }
    },
    {
      id: '3',
      rne: '202300003',
      firstName: 'Carlos',
      lastName: 'Martínez Silva',
      avatar: null,
      attendance: {
        isPresent: true,
        isLate: true,
        reason: ''
      }
    },
    {
      id: '4',
      rne: '202300004',
      firstName: 'María',
      lastName: 'González Pérez',
      avatar: null,
      attendance: {
        isPresent: true,
        isLate: false,
        reason: ''
      }
    }
  ]);

  const updateAttendance = (studentId: string, field: 'isPresent' | 'isLate', value: boolean) => {
    setStudents(students.map(student => 
      student.id === studentId 
        ? { 
            ...student, 
            attendance: { 
              ...student.attendance, 
              [field]: value,
              ...(field === 'isPresent' && !value ? { isLate: false } : {})
            }
          }
        : student
    ));
  };

  const handleAbsentReason = (studentId: string) => {
    setReasonDialog({ isOpen: true, studentId });
    const student = students.find(s => s.id === studentId);
    setAbsenceReason(student?.attendance.reason || '');
  };

  const saveAbsenceReason = () => {
    setStudents(students.map(student => 
      student.id === reasonDialog.studentId 
        ? { ...student, attendance: { ...student.attendance, reason: absenceReason } }
        : student
    ));
    setReasonDialog({ isOpen: false, studentId: '' });
    setAbsenceReason('');
  };

  const handleSaveAttendance = () => {
    toast({
      title: "Asistencia guardada",
      description: `Asistencia del ${new Date(selectedDate).toLocaleDateString()} guardada exitosamente.`,
    });
  };

  const getAttendanceStats = () => {
    const present = students.filter(s => s.attendance.isPresent).length;
    const absent = students.filter(s => !s.attendance.isPresent).length;
    const late = students.filter(s => s.attendance.isLate).length;
    return { present, absent, late, total: students.length };
  };

  const stats = getAttendanceStats();
  const selectedSectionData = sections.find(s => s.id === selectedSection);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-title font-montserrat text-minerd-blue">
            Registro de Asistencia
          </h1>
          <p className="text-body font-opensans text-gray-600">
            Control diario de asistencia por sección
          </p>
        </div>
        <Button onClick={handleSaveAttendance} className="bg-minerd-green hover:bg-green-700">
          <Save className="w-4 h-4 mr-2" />
          Guardar Asistencia
        </Button>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="space-y-2">
              <Label htmlFor="section">Sección</Label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Seleccionar sección" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name} ({section.studentCount} estudiantes)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Presentes</p>
                <p className="text-2xl font-bold text-green-500">{stats.present}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Ausentes</p>
                <p className="text-2xl font-bold text-red-500">{stats.absent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Tardanzas</p>
                <p className="text-2xl font-bold text-yellow-500">{stats.late}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-minerd-blue" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-minerd-blue">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance List */}
      <Card>
        <CardHeader>
          <CardTitle className="font-montserrat flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            {selectedSectionData?.name} - {new Date(selectedDate).toLocaleDateString()}
          </CardTitle>
          <CardDescription className="font-opensans">
            Marque la asistencia de cada estudiante
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {students.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={student.avatar} />
                    <AvatarFallback>
                      {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{student.firstName} {student.lastName}</p>
                    <p className="text-sm text-gray-500 font-mono">{student.rne}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  {/* Present Checkbox */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`present-${student.id}`}
                      checked={student.attendance.isPresent}
                      onCheckedChange={(checked) => updateAttendance(student.id, 'isPresent', !!checked)}
                    />
                    <Label htmlFor={`present-${student.id}`} className="text-sm font-medium">
                      Presente
                    </Label>
                  </div>

                  {/* Late Switch */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`late-${student.id}`}
                      checked={student.attendance.isLate}
                      onCheckedChange={(checked) => updateAttendance(student.id, 'isLate', checked)}
                      disabled={!student.attendance.isPresent}
                    />
                    <Label htmlFor={`late-${student.id}`} className="text-sm font-medium">
                      Tardanza
                    </Label>
                  </div>

                  {/* Absence Reason */}
                  {!student.attendance.isPresent && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAbsentReason(student.id)}
                      className="text-xs"
                    >
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {student.attendance.reason ? 'Ver razón' : 'Agregar razón'}
                    </Button>
                  )}

                  {/* Status Badge */}
                  <Badge 
                    variant={
                      student.attendance.isPresent 
                        ? student.attendance.isLate ? "secondary" : "default"
                        : "destructive"
                    }
                  >
                    {student.attendance.isPresent 
                      ? student.attendance.isLate ? "Tardanza" : "Presente"
                      : "Ausente"
                    }
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Absence Reason Dialog */}
      <Dialog open={reasonDialog.isOpen} onOpenChange={(open) => setReasonDialog({...reasonDialog, isOpen: open})}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Razón de Ausencia</DialogTitle>
            <DialogDescription>
              Ingrese la razón por la cual el estudiante está ausente (opcional)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Ejemplo: Cita médica, enfermedad, asunto familiar..."
              value={absenceReason}
              onChange={(e) => setAbsenceReason(e.target.value)}
              rows={3}
              maxLength={200}
            />
            <p className="text-sm text-gray-500">
              {absenceReason.length}/200 caracteres
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReasonDialog({isOpen: false, studentId: ''})}>
              Cancelar
            </Button>
            <Button onClick={saveAbsenceReason} className="bg-minerd-green hover:bg-green-700">
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttendanceManagement;
