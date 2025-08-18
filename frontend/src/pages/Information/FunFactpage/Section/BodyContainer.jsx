const BodyContainer = ({ onCardClick }) => {
  return (
    <div className="body-container">
      <div className="text-section">
        <h1>Welcome to Fun Facts!</h1>
        <p>
          Discover amazing and surprising tidbits of information. Click on the cards to explore more.
        </p>
      </div>
      <div className="cards-section">
        <FunFactCard 
          id={1} 
          title="Fun Facts A" 
          description="Explore a collection of interesting facts about history and science." 
          onClick={onCardClick} 
        />
        <FunFactCard 
          id={2} 
          title="Fun Facts B" 
          description="Dive into surprising facts about nature and everyday life." 
          onClick={onCardClick} 
        />
      </div>
    </div>
  );
};