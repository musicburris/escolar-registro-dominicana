import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: string;
  theme: string;
  logoUrl: string;
  siteName: string;
  subtitle: string;
}

interface ThemeContextType {
  settings: ThemeSettings;
  updateSettings: (newSettings: Partial<ThemeSettings>) => void;
  applySettings: (settings: ThemeSettings) => void;
  isLoading: boolean;
}

const defaultSettings: ThemeSettings = {
  primaryColor: '#0D3B66',
  secondaryColor: '#137547',
  accentColor: '#DC2626',
  fontFamily: 'Inter',
  fontSize: '16',
  theme: 'light',
  logoUrl: '',
  siteName: 'Sistema Educativo MINERD',
  subtitle: 'Gestión Escolar Integral'
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Convertir HEX a HSL
const hexToHsl = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0 0% 0%';
  
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Aplicar configuraciones al DOM
  const applySettings = (newSettings: ThemeSettings) => {
    const root = document.documentElement;
    
    // Aplicar colores (convertir HEX a HSL)
    const primaryHsl = hexToHsl(newSettings.primaryColor);
    const secondaryHsl = hexToHsl(newSettings.secondaryColor);
    const accentHsl = hexToHsl(newSettings.accentColor);
    
    root.style.setProperty('--primary', primaryHsl);
    root.style.setProperty('--primary-foreground', '0 0% 100%');
    root.style.setProperty('--secondary', secondaryHsl);
    root.style.setProperty('--secondary-foreground', '0 0% 100%');
    root.style.setProperty('--accent', accentHsl);
    root.style.setProperty('--accent-foreground', '0 0% 100%');
    
    // Aplicar fuente y tamaño
    root.style.setProperty('--font-family', newSettings.fontFamily);
    root.style.setProperty('--font-size', `${newSettings.fontSize}px`);
    document.body.style.fontFamily = newSettings.fontFamily;
    document.body.style.fontSize = `${newSettings.fontSize}px`;
    
    // Aplicar tema
    if (newSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Aplicar título del sitio
    document.title = newSettings.siteName;
    
    console.log('Settings applied:', {
      primaryHsl,
      secondaryHsl,
      accentHsl,
      font: newSettings.fontFamily,
      size: newSettings.fontSize
    });
  };

  // Cargar configuraciones guardadas
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Cargar desde localStorage
        const localSettings = localStorage.getItem('themeSettings');
        if (localSettings) {
          const parsed = JSON.parse(localSettings);
          const mergedSettings = { ...defaultSettings, ...parsed };
          setSettings(mergedSettings);
          applySettings(mergedSettings);
        } else {
          applySettings(defaultSettings);
        }
      } catch (error) {
        console.error('Error loading theme settings:', error);
        applySettings(defaultSettings);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  const updateSettings = (newSettings: Partial<ThemeSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    applySettings(updatedSettings);
    
    // Guardar en localStorage
    localStorage.setItem('themeSettings', JSON.stringify(updatedSettings));
    
    console.log('Settings updated:', updatedSettings);
  };

  return (
    <ThemeContext.Provider value={{ settings, updateSettings, applySettings, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};