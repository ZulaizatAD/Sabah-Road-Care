import { useState, useEffect } from 'react';

const useBackendStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        setIsChecking(true);
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/health`, {
          method: 'GET',
          timeout: 5000, // 5 second timeout
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsConnected(data.status === 'ok');
        } else {
          setIsConnected(false);
        }
      } catch (error) {
        console.log('Backend connection check failed:', error);
        setIsConnected(false);
      } finally {
        setIsChecking(false);
      }
    };

    // Check immediately
    checkBackendStatus();

    // Check every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  return { isConnected, isChecking };
};

export default useBackendStatus;