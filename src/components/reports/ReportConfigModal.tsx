
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Settings, Save, RotateCcw } from 'lucide-react';

interface ReportConfig {
  institutionName: string;
  institutionSubtitle: string;
  academicYear: string;
  centerName: string;
  logoUrl?: string;
  footerText: string;
  directorName: string;
  directorTitle: string;
}

interface ReportConfigModalProps {
  config: ReportConfig;
  onConfigChange: (config: ReportConfig) => void;
}

const ReportConfigModal: React.FC<ReportConfigModalProps> = ({ config, onConfigChange }) => {
  const [localConfig, setLocalConfig] = useState<ReportConfig>(config);
  const [isOpen, setIsOpen] = useState(false);

  const defaultConfig: ReportConfig = {
    institutionName: 'MINISTERIO DE EDUCACIÓN',
    institutionSubtitle: 'REGISTRO ESCOLAR 1ER CICLO SECUNDARIA',
    academicYear: '2024-2025',
    centerName: 'Centro Educativo Demo',
    footerText: 'Generado automáticamente por Registro Escolar 1er Ciclo Secundaria – RD',
    directorName: 'Director(a)',
    directorTitle: 'Director(a) del Centro'
  };

  const handleSave = () => {
    onConfigChange(localConfig);
    toast({
      title: "Configuración guardada",
      description: "Los cambios se aplicarán a las próximas boletas generadas",
    });
    setIsOpen(false);
  };

  const handleReset = () => {
    setLocalConfig(defaultConfig);
    toast({
      title: "Configuración restablecida",
      description: "Se han restaurado los valores por defecto",
    });
  };

  const handleInputChange = (field: keyof ReportConfig, value: string) => {
    setLocalConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center">
          <Settings className="w-4 h-4 mr-2" />
          Configurar Boletas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuración de Boletas</DialogTitle>
          <DialogDescription>
            Personaliza la información que aparece en las boletas generadas
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulario de configuración */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información Institucional</CardTitle>
                <CardDescription>
                  Datos que aparecen en el encabezado de la boleta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="institutionName">Nombre de la Institución</Label>
                  <Input
                    id="institutionName"
                    value={localConfig.institutionName}
                    onChange={(e) => handleInputChange('institutionName', e.target.value)}
                    placeholder="MINISTERIO DE EDUCACIÓN"
                  />
                </div>

                <div>
                  <Label htmlFor="institutionSubtitle">Subtítulo Institucional</Label>
                  <Input
                    id="institutionSubtitle"
                    value={localConfig.institutionSubtitle}
                    onChange={(e) => handleInputChange('institutionSubtitle', e.target.value)}
                    placeholder="REGISTRO ESCOLAR 1ER CICLO SECUNDARIA"
                  />
                </div>

                <div>
                  <Label htmlFor="centerName">Nombre del Centro</Label>
                  <Input
                    id="centerName"
                    value={localConfig.centerName}
                    onChange={(e) => handleInputChange('centerName', e.target.value)}
                    placeholder="Centro Educativo Demo"
                  />
                </div>

                <div>
                  <Label htmlFor="academicYear">Año Escolar</Label>
                  <Input
                    id="academicYear"
                    value={localConfig.academicYear}
                    onChange={(e) => handleInputChange('academicYear', e.target.value)}
                    placeholder="2024-2025"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Autoridades</CardTitle>
                <CardDescription>
                  Información de las autoridades del centro
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="directorName">Nombre del Director(a)</Label>
                  <Input
                    id="directorName"
                    value={localConfig.directorName}
                    onChange={(e) => handleInputChange('directorName', e.target.value)}
                    placeholder="Nombre completo del director"
                  />
                </div>

                <div>
                  <Label htmlFor="directorTitle">Título del Director(a)</Label>
                  <Input
                    id="directorTitle"
                    value={localConfig.directorTitle}
                    onChange={(e) => handleInputChange('directorTitle', e.target.value)}
                    placeholder="Director(a) del Centro"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Otros</CardTitle>
                <CardDescription>
                  Configuraciones adicionales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="footerText">Texto del Pie de Página</Label>
                  <Textarea
                    id="footerText"
                    value={localConfig.footerText}
                    onChange={(e) => handleInputChange('footerText', e.target.value)}
                    placeholder="Texto que aparece al final de la boleta"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="logoUrl">URL del Logo (opcional)</Label>
                  <Input
                    id="logoUrl"
                    value={localConfig.logoUrl || ''}
                    onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                    placeholder="https://ejemplo.com/logo.png"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vista previa */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vista Previa</CardTitle>
                <CardDescription>
                  Así se verá el encabezado de la boleta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 border rounded-lg text-center space-y-2">
                  <div className="flex justify-between items-center mb-4">
                    <div className="w-12 h-12 bg-minerd-blue rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">RD</span>
                    </div>
                    <div className="text-center flex-1">
                      <h3 className="text-sm font-bold text-minerd-blue">
                        {localConfig.institutionName}
                      </h3>
                      <h4 className="text-xs font-semibold">
                        {localConfig.institutionSubtitle}
                      </h4>
                      <p className="text-xs">
                        {localConfig.centerName} • Año Escolar {localConfig.academicYear}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs text-gray-500">Logo</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-600 mt-4 pt-4 border-t">
                    <p><strong>Director(a):</strong> {localConfig.directorName}</p>
                    <p><strong>Cargo:</strong> {localConfig.directorTitle}</p>
                  </div>

                  <div className="text-xs text-gray-500 mt-4 pt-2 border-t">
                    {localConfig.footerText}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-2">
              <Button onClick={handleSave} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </Button>
              <Button onClick={handleReset} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Restablecer
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportConfigModal;
