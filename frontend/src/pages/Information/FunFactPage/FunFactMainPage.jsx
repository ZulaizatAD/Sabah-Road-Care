import React, { useState } from 'react';
import FunFactCarousel from './Section/FunFactCarousel';
import SabahHistoryCarousel from './Section/SabahHistoryCarousel';
import SabahRoadsCarousel from './Section/SabahRoadsCarousel';
import FunFactCardPopup from './Section/FunFactCardPopup';
import AvatarMain from './Section/Avatar/AvatarMain';
import './FunFactMainPage.css';

export default function FunFactMainPage() {
  const [currentPage, setCurrentPage] = useState('main');
  const [selectedCard, setSelectedCard] = useState(null);

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  const handleClosePopup = () => {
    setSelectedCard(null);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'main':
        return (
          <div className="body-container">
            <div className="text-section">
              <h1>Sabah Fun Facts and History</h1>
              <p>Choose a section to explore, or tap the avatar to hear a brief intro.</p>
            </div>
            <div className="cards-section">
              <div className="fun-fact-card top" onClick={() => setCurrentPage('funFacts')}>
                <h2>Fun Facts</h2>
                <p>Interesting and surprising facts related to Sabah roads.</p>
                <button>Open</button>
              </div>
              <div className="fun-fact-card bottom" onClick={() => setCurrentPage('sabahHistory')}>
                <h2>History of Sabah Road</h2>
                <p>From the early days to modern highways.</p>
                <button>Open</button>
              </div>
            </div>
          </div>
        );
        
      case 'funFacts':
        return <SabahRoadsCarousel goBack={() => setCurrentPage('main')} onCardClick={handleCardClick} />;
      case 'sabahHistory':
        return <SabahHistoryCarousel goBack={() => setCurrentPage('main')} onCardClick={handleCardClick} />;
      case 'sabahRoads':
        return <SabahRoadsCarousel goBack={() => setCurrentPage('sabahHistory')} onCardClick={handleCardClick} />;
      default:
        return null;
    }
  };

  return (
    <div className="fun-fact-page">
      <div className="ff-main-content">
        {renderContent()}
        {currentPage === 'main' && (
          <div className="avatar-overlay">
            <AvatarMain />
          </div>
        )}
      </div>
      {selectedCard && <FunFactCardPopup card={selectedCard} onClose={handleClosePopup} />}
    </div>
  );
}

                                                          