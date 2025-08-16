// FunFactCardPopup.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaTimes } from 'react-icons/fa';
import '../FunFactPage.css';

// This component is the pop-up modal for displaying a single fun fact in detail.
const FunFactCardPopup = ({ card, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Effect to handle audio playback and cleanup
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      // Event listener to reset the state when audio ends
      audio.onended = () => {
        setIsPlaying(false);
      };
    }
    return () => {
      // Cleanup: pause audio and remove event listener on unmount
      if (audio) {
        audio.pause();
        audio.onended = null;
      }
    };
  }, []);

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="close-button" onClick={onClose}>
          <FaTimes size={20} />
        </button>

        {/* Image and Play Button Section */}
        <div className="modal-image-container">
          {/* Audio element for the fact */}
          <audio ref={audioRef} src={card.audio}></audio>
          {/* Play/Pause Button */}
          <div className="modal-audio-control">
            <button className="play-button" onClick={toggleAudio}>
              {isPlaying ? <FaPause size={24} /> : <FaPlay size={24} />}
            </button>
          </div>
          {/* Main image for the card */}
          <img src={card.image} alt={card.title} className="modal-image" />
        </div>
        
        {/* Text Information Section */}
        <div className="modal-text-content">
          <h2>{card.title}</h2>
          <p>{card.text}</p>
        </div>
      </div>
    </div>
  );
};

export default FunFactCardPopup;
