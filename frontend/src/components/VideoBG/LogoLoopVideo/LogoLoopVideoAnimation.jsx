import React from 'react';
import './LogoLoopVideoAnimation.css';

const LogoLoopVideoAnimation = () => {
  return (
    <div className="logo-loop-container">
      <video
        className="logo-loop-video"
        src="/assets/VideoFiles/Logo turntable_V2.webm"
        autoPlay
        loop
        muted
        playsInline
        style={{ 
          width: '100%', 
          height: 'auto', 
          maxWidth: '240px',
          objectFit: 'contain'
        }}
      />
    </div>
  );
};

export default LogoLoopVideoAnimation;
