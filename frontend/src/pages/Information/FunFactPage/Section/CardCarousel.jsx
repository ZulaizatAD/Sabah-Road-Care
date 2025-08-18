import React, { useState } from 'react';
import './CardCarousel.css';

const CardCarousel = ({ cards }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const prevCard = () => {
    setActiveIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : cards.length - 1));
  };

  const nextCard = () => {
    setActiveIndex((prevIndex) => (prevIndex < cards.length - 1 ? prevIndex + 1 : 0));
  };

  return (
    <div className="carousel-container">
      <div className="carousel-wrapper" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
        {cards.map((card, index) => (
          <div key={index} className="carousel-card">
            {card}
          </div>
        ))}
      </div>
      <button className="carousel-button prev" onClick={prevCard}>
        &lt;
      </button>
      <button className="carousel-button next" onClick={nextCard}>
        &gt;
      </button>
    </div>
  );
};

export default CardCarousel;