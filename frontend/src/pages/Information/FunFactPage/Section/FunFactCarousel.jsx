import React, { useState, useEffect, useRef } from 'react';
import '../FunFactMainPage.css';
import { FaPlay, FaPause, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

// Enhanced FunFactCarousel Component
// This component displays a modern carousel of cards with audio playback and category badges.
const FunFactCarousel = ({ cards, goBack, title, onCardClick }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const audioRefs = useRef({});
  const touchStartX = useRef(null);

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
      <div className="carousel-header">
        <button className="glass-button back-button" onClick={goBack}>
          <FaArrowLeft size={16} />
          <span>Back</span>
        </button>
        <h2 className="carousel-title">{title || 'Explore'}</h2>
        <div className="header-spacer" />
      </div>
      
      <div
        className="carousel-wrapper"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        onTouchStart={(e) => { touchStartX.current = e.changedTouches[0].clientX; }}
        onTouchEnd={(e) => {
          const endX = e.changedTouches[0].clientX;
          if (touchStartX.current !== null) {
            const delta = endX - touchStartX.current;
            if (Math.abs(delta) > 50) {
              if (delta < 0) { nextCard(); } else { prevCard(); }
            }
          }
          touchStartX.current = null;
        }}
      >
        {cards.map((card) => (
          <div key={card.id} className="carousel-card" onClick={() => onCardClick && onCardClick(card)}>
            <audio ref={el => audioRefs.current[card.id] = el} src={card.audio}></audio>
            
            {/* Category Badge */}
            {card.category && (
              <div className="category-badge">
                {card.category}
              </div>
            )}
            
            {/* Audio Control */}
            <div className="audio-control">
              <button
                onClick={(e) => { e.stopPropagation(); toggleAudio(card.id, card.audio); }}
                className="play-button"
                aria-label={playingAudioId === card.id ? 'Pause audio' : 'Play audio'}
              >
                {playingAudioId === card.id ? <FaPause size={20} /> : <FaPlay size={20} />}
              </button>
            </div>
            
            {/* Card Image */}
            {card.image && (
              <div className="card-image-container">
                <img src={card.image} alt={card.title} className="card-image" />
                <div className="image-overlay"></div>
              </div>
            )}
            
            {/* Card Content */}
            <div className="card-content">
              <h3 className="card-title">{card.title}</h3>
              <p className="card-text">{card.text}</p>
            </div>
            
            {/* Card Number Indicator */}
            <div className="card-number">
              {card.id} / {cards.length}
            </div>
          </div>
        ))}
      </div>
      
      {/* Navigation Buttons */}
      <button className="carousel-button prev" onClick={prevCard} aria-label="Previous card">
        <FaArrowLeft size={24} />
      </button>
      <button className="carousel-button next" onClick={nextCard} aria-label="Next card">
        <FaArrowRight size={24} />
      </button>
      
      {/* Progress Dots */}
      <div className="carousel-dots">
        {cards.map((c, idx) => (
          <button
            key={c.id}
            className={`dot ${idx === activeIndex ? 'active' : ''}`}
            onClick={() => setActiveIndex(idx)}
            aria-label={`Go to card ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default FunFactCarousel;
