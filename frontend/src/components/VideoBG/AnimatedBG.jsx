import React from 'react';
import { useLocation } from 'react-router-dom';

const AnimatedBG = () => {
  const location = useLocation();
  
  // Don't render on Landing page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <div className='AnimatedBG'>
      <video 
        src='/assets/VideoFiles/MainPageBG001.webm' 
        autoPlay 
        loop 
        muted 
        playsInline
      />
    </div>
  );
};

export default AnimatedBG;