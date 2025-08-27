import React, { useEffect, useRef, useState } from 'react';
import AvatarWebm from '../../../../../assets/Avatar_FunFacts/Avatar_Copilot_001.webm';
import AvatarMp3 from '../../../../../assets/Avatar_FunFacts/Avatar_Copilot_001.mp3';
import './AvatarMain.css';

const AvatarMain = () => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Ensure both media are reset on unmount
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  // Handle video and audio end events
  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

  const handleAudioEnd = () => {
    // Audio ended, video should also be done
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio) return;

    if (isPlaying) {
      // Stop playback
      video.pause();
      audio.pause();
      video.currentTime = 0;
      audio.currentTime = 0;
      setIsPlaying(false);
    } else {
      // Start playback
      video.currentTime = 0;
      audio.currentTime = 0;
      video.play();
      audio.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className='AvatarMain' onClick={togglePlay} title={isPlaying ? 'Stop' : 'Play'}>
      <video
        ref={videoRef}
        className='avatar-video'
        src={AvatarWebm}
        muted
        playsInline
        preload='auto'
        onEnded={handleVideoEnd}
      />
      <audio 
        ref={audioRef} 
        src={AvatarMp3} 
        preload='auto' 
        onEnded={handleAudioEnd}
      />
    </div>
  );
};

export default AvatarMain;