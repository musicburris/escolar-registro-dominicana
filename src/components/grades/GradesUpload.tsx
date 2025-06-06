
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Upload, FileSpreadsheet, Download, AlertCircle } from 'lucide-react';

interface GradesUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGradesUploaded: (grades: any[]) => void;
}

const GradesUpload: React.FC<GradesUploadProps> = ({ open, onOpenChange, onGradesUploaded }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "Solo se permiten archivos Excel (.xlsx, .xls) o CSV",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const downloadTemplate = () => {
    // Simular descarga de plantilla
    toast({
      title: "Plantilla descargada",
      description: "La plantilla de calificaciones ha sido descargada",
    });
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      // Simular procesamiento del archivo
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock de datos procesados
      const mockProcessedGrades = [
        {
          id: '1',
          studentId: 'EST001',
          name: 'Ana María González',
          rne: '20240001',
          pc1: { p1: 85, p2: 78, p3: 92, p4: 88 },
          pc2: { p1: 80, p2: 85, p3: 88, p4: 90 },
          pc3: { p1: 90, p2: 87, p3: 85, p4: 92 },
          pc4: { p1: 88, p2: 90, p3: 92, p4: 85 },
          promedioPC1: 85.75,
          promedioPC2: 85.75,
          promedioPC3: 88.5,
          promedioPC4: 88.75,
          calificacionFinal: 87.19
        }
      ];

      onGradesUploaded(mockProcessedGrades);
      
      toast({
        title: "Archivo procesado exitosamente",
        description: `Se han cargado las calificaciones de ${mockProcessedGrades.length} estudiantes`,
      });

      setSelectedFile(null);
      onOpenChange(false);

    } catch (error) {
      toast({
        title: "Error al procesar archivo",
        description: "Hubo un error al procesar el archivo. Verifique el formato.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Subir Calificaciones desde Archivo
          </DialogTitle>
          <DialogDescription>
            Carga masiva de calificaciones mediante archivo Excel o CSV
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información importante */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-2">Instrucciones importantes:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>El archivo debe contener las columnas: RNE, Nombre, PC1-P1, PC1-P2, PC1-P3, PC1-P4, etc.</li>
                    <li>Las calificaciones deben estar entre 0 y 100</li>
                    <li>Los campos de recuperación (RP1, RP2, etc.) son opcionales</li>
                    <li>Se recomienda usar la plantilla oficial para evitar errores</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Descargar plantilla */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Plantilla de Calificaciones</CardTitle>
              <CardDescription>
                Descarga la plantilla oficial para asegurar el formato correcto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                onClick={downloadTemplate}
                className="flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar Plantilla Excel
              </Button>
            </CardContent>
          </Card>

          {/* Subir archivo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Seleccionar Archivo</CardTitle>
              <CardDescription>
                Formatos permitidos: .xlsx, .xls, .csv
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="flex-1"
                />
                <FileSpreadsheet className="w-6 h-6 text-gray-400" />
              </div>

              {selectedFile && (
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    <strong>Archivo seleccionado:</strong> {selectedFile.name}
                  </p>
                  <p className="text-xs text-green-600">
                    Tamaño: {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={uploadFile}
              disabled={!selectedFile || isUploading}
              className="bg-minerd-blue hover:bg-blue-700"
            >
              {isUploading ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Calificaciones
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GradesUpload;
