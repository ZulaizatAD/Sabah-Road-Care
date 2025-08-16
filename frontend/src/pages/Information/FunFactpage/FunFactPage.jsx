// import React, { useState } from 'react';
// import './FunFactPage.css';


// export default function FunFactPage() {
//     const [isPanelVisible, setPanelVisible] = useState(false);
//     const [selectedCardId, setSelectedCardId] = useState(null);

//     // Fun Fact data for the scrolling panel
//     const funFacts = [
//         { id: 1, text: "The Great Wall of China is not a single, continuous wall; it's a system of fortifications.", audio: "audio-placeholder-1.mp3" },
//         // ... rest of the facts
//     ];

//     const handleCardClick = (cardId) => {
//         setSelectedCardId(cardId);
//         setPanelVisible(true);
//     };

//     const handleClosePanel = () => {
//         setPanelVisible(false);
//         setSelectedCardId(null);
//     };

//     const card1Facts = funFacts.slice(0, 5);
//     const card2Facts = funFacts.slice(5, 10);

//     return (
//         <>
//             {/* The style tag and other component calls */}
//             {/* ... */}
//             <div className="fun-fact-page">
//                 {/* ... */}
//             </div>
//         </>
//     );
// }
import React, { useState } from 'react';
import FunFactCarousel from './FunFactCarousel';
import SabahHistoryCarousel from './SabahHistoryCarousel';
import SabahRoadsCarousel from './SabahRoadsCarousel'; // Import the new component
import FunFactCardPopup from '../Section/FunFactCardPopup'; // Path is correct as per the image
import './FunFactPage.css';

// Fun Fact data
const funFactsData = [
  { id: 1, title: "Great Wall of China", text: "The Great Wall of China is not a single, continuous wall; it's a system of fortifications.", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", image: "https://placehold.co/400x200/5C6BC0/FFFFFF?text=Great+Wall" },
  { id: 2, title: "Mount Everest", text: "Mauna Kea is taller than Mount Everest when measured from its underwater base.", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", image: "https://placehold.co/400x200/4CAF50/FFFFFF?text=Mount+Everest" },
  { id: 3, title: "Mariana Trench", text: "More people have visited the moon than the deepest part of the ocean, the Mariana Trench.", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", image: "https://placehold.co/400x200/2196F3/FFFFFF?text=Ocean+Trench" },
  { id: 4, title: "The Banana", text: "Bananas are berries, but a strawberry is not.", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", image: "https://placehold.co/400x200/FFC107/FFFFFF?text=Bananas" },
  { id: 5, title: "Nocturnal Animals", text: "Owls cannot move their eyeballs. Instead, they can rotate their necks up to 270 degrees.", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", image: "https://placehold.co/400x200/795548/FFFFFF?text=Owls" },
];

export default function FunFactPage() {
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
              <h1>Explore Our Facts</h1>
              <p>Discover interesting facts about various topics or dive into the history of Sabah.</p>
            </div>
            <div className="cards-section">
              <div className="fun-fact-card" onClick={() => setCurrentPage('funFacts')}>
                <h2>Fun Facts</h2>
                <p>Curated list of interesting tidbits from around the world.</p>
                <button>Explore</button>
              </div>
              <div className="fun-fact-card" onClick={() => setCurrentPage('sabahHistory')}>
                <h2>Sabah History</h2>
                <p>Learn about the rich and unique history of the state of Sabah.</p>
                <button>Explore</button>
              </div>
            </div>
          </div>
        );
      case 'funFacts':
        return <FunFactCarousel cards={funFactsData} goBack={() => setCurrentPage('main')} title="Fun Facts" onCardClick={handleCardClick} />;
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
      <video autoPlay muted loop className="video-background">
        <source src="https://assets.mixkit.co/videos/preview/mixkit-starry-night-sky-loop-animation-5926-large.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="main-content">
        {renderContent()}
      </div>
      {selectedCard && <FunFactCardPopup card={selectedCard} onClose={handleClosePopup} />}
    </div>
  );
}