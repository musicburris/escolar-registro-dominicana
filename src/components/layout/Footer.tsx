
import React from 'react';

const Footer: React.FC = () => {
  // En una implementación real, estos valores vendrían del contexto de configuración
  const developerName = "Tu Nombre Aquí";
  const developerContact = "contacto@ejemplo.com";

  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6 mt-auto">
      <div className="text-center text-sm text-gray-600">
        <p>
          Desarrollado por{' '}
          <span className="font-semibold text-minerd-blue">{developerName}</span>
          {' - '}
          <a 
            href={`mailto:${developerContact}`} 
            className="text-minerd-blue hover:underline"
          >
            {developerContact}
          </a>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Sistema de Registro Escolar © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
