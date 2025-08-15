import React, { useState } from 'react';
import config from '../../config/environment';

const DevTools = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Only show in development
  if (config.app.environment !== 'development') {
    return null;
  }

  const envVars = {
    'Google Maps API': config.googleMaps.apiKey ? '✅ Configured' : '❌ Missing',
    'API Base URL': config.api.baseUrl,
    'Environment': config.app.environment,
    'Version': config.app.version
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      zIndex: 9999
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: '#374151',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          cursor: 'pointer',
          fontSize: '20px'
        }}
      >
        🔧
      </button>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          bottom: '60px',
          left: '0',
          background: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          padding: '16px',
          minWidth: '250px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>Dev Tools</h4>
          {Object.entries(envVars).map(([key, value]) => (
            <div key={key} style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              <span style={{ color: '#6b7280' }}>{key}:</span>
              <span style={{ 
                color: value.includes('✅') ? '#059669' : 
                      value.includes('❌') ? '#dc2626' : '#374151',
                fontWeight: '500'
              }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DevTools;