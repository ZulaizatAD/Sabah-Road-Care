// FunFactCard.jsx
import React from 'react';
import './FunFactPage.css';

// Reusable component for a single fun fact card
const FunFactCard = ({ card, onClick }) => {
  return (
    <div className="fun-fact-card" onClick={onClick}>
      <h3>{card.title}</h3>
      <p>{card.text}</p>
    </div>
  );
};

export default FunFactCard;
