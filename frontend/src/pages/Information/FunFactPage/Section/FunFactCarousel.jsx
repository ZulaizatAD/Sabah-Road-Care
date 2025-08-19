import React, { useState, useEffect, useRef } from 'react';
import '../FunFactMainPage.css';
import { FaPlay, FaPause } from 'react-icons/fa';

// FunFactCarousel Component
// This component displays a carousel of cards and manages audio playback.
const FunFactCarousel = ({ cards, goBack, title, onCardClick }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const audioRefs = useRef({});

  // Effect to stop audio when the card changes
  useEffect(() => {
    if (playingAudioId !== null && playingAudioId !== cards[activeIndex]?.id) {
      if (audioRefs.current[playingAudioId]) {
        audioRefs.current[playingAudioId].pause();
        audioRefs.current[playingAudioId].currentTime = 0;
      }
      setPlayingAudioId(null);
    }
  }, [activeIndex, playingAudioId, cards]);

  const prevCard = () => {
    setActiveIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : cards.length - 1));
  };

  const nextCard = () => {
    setActiveIndex((prevIndex) => (prevIndex < cards.length - 1 ? prevIndex + 1 : 0));
  };

  const toggleAudio = (cardId, audioSrc) => {
    const audio = audioRefs.current[cardId];
    if (playingAudioId === cardId) {
      // Pause if this audio is already playing
      audio.pause();
      setPlayingAudioId(null);
    } else {
      // Stop any other playing audio
      if (playingAudioId !== null && audioRefs.current[playingAudioId]) {
        audioRefs.current[playingAudioId].pause();
        audioRefs.current[playingAudioId].currentTime = 0;
      }
      // Play the new audio
      audio.play();
      setPlayingAudioId(cardId);
    }
  };

  return (
    <div className="carousel-container">
      <div className="carousel-wrapper" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
        {cards.map((card) => (
          <div key={card.id} className="carousel-card" onClick={() => onCardClick(card)}>
            <audio ref={el => audioRefs.current[card.id] = el} src={card.audio}></audio>
            <div className="audio-control">
              <button
                onClick={(e) => { e.stopPropagation(); toggleAudio(card.id, card.audio); }}
                className="play-button"
              >
                {playingAudioId === card.id ? <FaPause size={24} /> : <FaPlay size={24} />}
              </button>
            </div>
            <img src={card.image} alt={card.title} className="card-image" />
            <div className="card-content">
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="carousel-button prev" onClick={prevCard}>
        &lt;
      </button>
      <button className="carousel-button next" onClick={nextCard}>
        &gt;
      </button>
      <button onClick={goBack} className="back-button">
        Go Back
      </button>
    </div>
  );
};

export default FunFactCarousel;
