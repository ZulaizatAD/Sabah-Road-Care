import React, { useRef, useState } from 'react';
import Avatar_Copilot_001_video from '../../../../../assets/Avatar_FunFacts/Avatar_Copilot_001.webm';
import Avatar_Copilot_001_audio from '../../../../../assets/Avatar_FunFacts/Avatar_Copilot_001.mp3';

const AvatarMain = () => {
    const videoRef = useRef(null);
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const handleAvatarClick = () => {
        if (isPlaying) {
            // If already playing, stop and reset both video and audio
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.currentTime = 0; // Reset video to the beginning
            }
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0; // Reset audio to the beginning
            }
            setIsPlaying(false);
        } else {
            // If not playing, start playing
            setIsPlaying(true);
            if (videoRef.current) {
                videoRef.current.play();
            }
            if (audioRef.current) {
                audioRef.current.play();
            }
        }
    };

    const handleVideoEnded = () => {
        setIsPlaying(false);
    };

    return (
        <div className='AvatarMain' onClick={handleAvatarClick} style={{ cursor: 'pointer' }}>
            <video
                ref={videoRef}
                src={Avatar_Copilot_001_video}
                muted={!isPlaying}
                onEnded={handleVideoEnded}
            />
            <audio
                ref={audioRef}
                src={Avatar_Copilot_001_audio}
            />
        </div>
    );
};

export default AvatarMain;