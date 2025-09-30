import React from 'react';
import './BackendStatus.css';

const BackendStatus = ({ isConnected, isChecking }) => {
  const getStatusInfo = () => {
    if (isChecking) {
      return {
        className: 'checking',
        text: 'Checking...',
        icon: '🔄'
      };
    }
    
    if (isConnected) {
      return {
        className: 'connected',
        text: 'Backend Connected',
        icon: '🟢'
      };
    }
    
    return {
      className: 'disconnected',
      text: 'Backend Offline',
      icon: '🔴'
    };
  };

  const status = getStatusInfo();

  return (
    <div className={`backend-status-indicator ${status.className}`}>
      <span className="backend-status-icon">{status.icon}</span>
      <span className="backend-status-text">{status.text}</span>
    </div>
  );
};

export default BackendStatus;