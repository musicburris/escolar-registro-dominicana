import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Type, 
  Image as ImageIcon, 
  Monitor, 
  Moon, 
  Sun,
  Save,
  RotateCcw,
  Eye
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const VisualCustomization: React.FC = () => {
  const [settings, setSettings] = useState({
    primaryColor: '#1e40af',
    secondaryColor: '#059669',
    accentColor: '#dc2626',
    fontFamily: 'Inter',
    fontSize: '16',
    logoUrl: '',
    siteName: 'Sistema Educativo MINERD',
    subtitle: 'Gestión Escolar Integral',
    theme: 'light'
  });

  const [previewMode, setPreviewMode] = useState(false);

  const colorPresets = [
    { name: 'MINERD Oficial', primary: '#1e40af', secondary: '#059669', accent: '#dc2626' },
    { name: 'Escolar Clásico', primary: '#3b82f6', secondary: '#10b981', accent: '#f59e0b' },
    { name: 'Moderno', primary: '#6366f1', secondary: '#8b5cf6', accent: '#ec4899' },
    { name: 'Corporativo', primary: '#1f2937', secondary: '#6b7280', accent: '#ef4444' },
    { name: 'Educativo', primary: '#0ea5e9', secondary: '#22c55e', accent: '#f97316' }
  ];

  const fontOptions = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Montserrat',
    'Lato',
    'Poppins',
    'Source Sans Pro',
    'Nunito'
  ];

  const handleColorPreset = (preset: typeof colorPresets[0]) => {
    setSettings({
      ...settings,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent
    });
  };

  const handleSave = () => {
    // Aquí se guardarían las configuraciones en localStorage o base de datos
    localStorage.setItem('adminVisualSettings', JSON.stringify(settings));
    toast({
      title: "Configuración guardada",
      description: "Los cambios visuales han sido aplicados al sistema.",
    });
  };

  const handleReset = () => {
    setSettings({
      primaryColor: '#1e40af',
      secondaryColor: '#059669',
      accentColor: '#dc2626',
      fontFamily: 'Inter',
      fontSize: '16',
      logoUrl: '',
      siteName: 'Sistema Educativo MINERD',
      subtitle: 'Gestión Escolar Integral',
      theme: 'light'
    });
    toast({
      title: "Configuración restablecida",
      description: "Se han restaurado los valores predeterminados.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Monitor className="mr-2 h-5 w-5" />
            Tema del Sistema
          </CardTitle>
          <CardDescription>
            Selecciona el tema base para todo el sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Button
              variant={settings.theme === 'light' ? 'default' : 'outline'}
              onClick={() => setSettings({...settings, theme: 'light'})}
              className="flex items-center gap-2"
            >
              <Sun className="h-4 w-4" />
              Claro
            </Button>
            <Button
              variant={settings.theme === 'dark' ? 'default' : 'outline'}
              onClick={() => setSettings({...settings, theme: 'dark'})}
              className="flex items-center gap-2"
            >
              <Moon className="h-4 w-4" />
              Oscuro
            </Button>
            <Button
              variant={settings.theme === 'auto' ? 'default' : 'outline'}
              onClick={() => setSettings({...settings, theme: 'auto'})}
              className="flex items-center gap-2"
            >
              <Monitor className="h-4 w-4" />
              Automático
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Color Customization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="mr-2 h-5 w-5" />
            Colores del Sistema
          </CardTitle>
          <CardDescription>
            Personaliza los colores principales de la interfaz
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Color Presets */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Paletas Prediseñadas</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {colorPresets.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  onClick={() => handleColorPreset(preset)}
                  className="h-auto p-3 flex flex-col items-start space-y-2"
                >
                  <span className="text-sm font-medium">{preset.name}</span>
                  <div className="flex space-x-1">
                    <div 
                      className="w-4 h-4 rounded-full border" 
                      style={{ backgroundColor: preset.primary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border" 
                      style={{ backgroundColor: preset.secondary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border" 
                      style={{ backgroundColor: preset.accent }}
                    />
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Custom Colors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Color Primario</Label>
              <div className="flex space-x-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                  placeholder="#1e40af"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Color Secundario</Label>
              <div className="flex space-x-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) => setSettings({...settings, secondaryColor: e.target.value})}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={settings.secondaryColor}
                  onChange={(e) => setSettings({...settings, secondaryColor: e.target.value})}
                  placeholder="#059669"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accentColor">Color de Acento</Label>
              <div className="flex space-x-2">
                <Input
                  id="accentColor"
                  type="color"
                  value={settings.accentColor}
                  onChange={(e) => setSettings({...settings, accentColor: e.target.value})}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={settings.accentColor}
                  onChange={(e) => setSettings({...settings, accentColor: e.target.value})}
                  placeholder="#dc2626"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Type className="mr-2 h-5 w-5" />
            Tipografía
          </CardTitle>
          <CardDescription>
            Configura las fuentes y tamaños del texto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fontFamily">Fuente Principal</Label>
              <Select value={settings.fontFamily} onValueChange={(value) => setSettings({...settings, fontFamily: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar fuente" />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((font) => (
                    <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fontSize">Tamaño Base (px)</Label>
              <Select value={settings.fontSize} onValueChange={(value) => setSettings({...settings, fontSize: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Tamaño" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="14">14px - Pequeño</SelectItem>
                  <SelectItem value="16">16px - Normal</SelectItem>
                  <SelectItem value="18">18px - Grande</SelectItem>
                  <SelectItem value="20">20px - Muy Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Font Preview */}
          <div className="p-4 border rounded-lg" style={{ fontFamily: settings.fontFamily, fontSize: `${settings.fontSize}px` }}>
            <h3 className="text-lg font-semibold mb-2">Vista Previa de Tipografía</h3>
            <p>Este es un ejemplo de cómo se verá el texto en el sistema con la fuente seleccionada.</p>
            <p className="text-sm text-gray-600 mt-2">Texto secundario y descripciones.</p>
          </div>
        </CardContent>
      </Card>

      {/* Logo and Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ImageIcon className="mr-2 h-5 w-5" />
            Logo y Marca
          </CardTitle>
          <CardDescription>
            Personaliza el logo institucional y textos principales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Nombre del Sistema</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                placeholder="Sistema Educativo MINERD"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtítulo</Label>
              <Input
                id="subtitle"
                value={settings.subtitle}
                onChange={(e) => setSettings({...settings, subtitle: e.target.value})}
                placeholder="Gestión Escolar Integral"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="logoUrl">URL del Logo</Label>
            <div className="flex space-x-2">
              <Input
                id="logoUrl"
                value={settings.logoUrl}
                onChange={(e) => setSettings({...settings, logoUrl: e.target.value})}
                placeholder="https://ejemplo.com/logo.png"
                className="flex-1"
              />
              <Button variant="outline">
                Subir Logo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleSave} className="bg-minerd-green hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Restablecer
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center"
            >
              <Eye className="w-4 h-4 mr-2" />
              {previewMode ? 'Salir de Vista Previa' : 'Vista Previa'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisualCustomization;