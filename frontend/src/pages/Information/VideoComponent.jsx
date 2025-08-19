import React from 'react';
import './VideoComponent.css'; // Make sure to create this CSS file
import transparentVideo from './public/assets/VideoFiles/GreybackgroundAE_Loop_002.webm';

const VideoComponent = () => {
  return (
    <div className="video-container">
      <video
        autoPlay
        loop
        muted
        playsInline
        src={transparentVideo}
        className="transparent-video"
      />
    </div>
  );
};

export default VideoComponent;