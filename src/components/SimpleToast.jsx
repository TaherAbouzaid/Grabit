import React, { useState, useEffect } from 'react';

const SimpleToast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const bgColor = type === 'success' ? '#4caf50' : 
                 type === 'error' ? '#f44336' : 
                 type === 'warning' ? '#ff9800' : '#2196f3';

  return (
    <div 
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: bgColor,
        color: 'white',
        padding: '10px 20px',
        borderRadius: '4px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        zIndex: 9999,
        maxWidth: '300px'
      }}
    >
      {message}
    </div>
  );
};

export default SimpleToast;

