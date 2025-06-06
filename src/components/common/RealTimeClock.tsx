
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const RealTimeClock: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-DO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-DO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-3 border border-gray-200 z-50 min-w-[200px]">
      <div className="flex items-center space-x-2">
        <Clock className="w-4 h-4 text-minerd-blue" />
        <div className="text-sm">
          <div className="font-semibold text-gray-800">{formatTime(currentTime)}</div>
          <div className="text-xs text-gray-600 capitalize">{formatDate(currentTime)}</div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeClock;
