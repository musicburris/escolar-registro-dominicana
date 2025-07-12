
import React, { useState, useEffect } from 'react';

const RealTimeClock: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-DO', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-DO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-3 border border-gray-200 z-30">
      <div className="text-right">
        <div className="text-lg font-bold text-gray-900">
          {formatTime(currentTime)}
        </div>
        <div className="text-xs text-gray-600">
          {formatDate(currentTime)}
        </div>
      </div>
    </div>
  );
};

export default RealTimeClock;
