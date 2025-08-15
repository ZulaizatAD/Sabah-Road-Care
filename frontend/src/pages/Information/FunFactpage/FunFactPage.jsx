import React, { useState, useEffect } from 'react';
import GradientOverlay from './src/assets/FunFacts/GradientOverlay';
import FunFactCard from './src/assets/FunFacts/FunFactCard';
import DetailModal from './src/assets/FunFacts/DetailModal';
import './FunFactPage.css';

const FunFactPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  // Hide app-level elements when component mounts
  useEffect(() => {
    const appContainer = document.querySelector('.app-container');
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    const backgroundVideo = document.querySelector('#background-video');
    const backgroundOverlay = document.querySelector('.background-overlay');

    // Hide elements
    if (header) header.style.display = 'none';
    if (footer) footer.style.display = 'none';
    if (backgroundVideo) backgroundVideo.style.display = 'none';
    if (backgroundOverlay) backgroundOverlay.style.display = 'none';

    // Cleanup function to restore elements when component unmounts
    return () => {
      if (header) header.style.display = '';
      if (footer) footer.style.display = '';
      if (backgroundVideo) backgroundVideo.style.display = '';
      if (backgroundOverlay) backgroundOverlay.style.display = '';
    };
  }, []);

  const funFactsData = [
    {
      id: 1,
      title: "Sabah Road Facts",
      preview: "Discover amazing facts about Sabah's roads and transportation",
      facts: [
        {
          title: "Gravity-Defying Road",
          content: "There's a local optical illusion in Sabah where a road appears to roll uphill.",
          audioFile: "/audio/gravity-road.mp3"
        },
        {
          title: "No Freeways",
          content: "Sabah lacks interstate freeways; major roads are federal two-lane highways or expanded urban routes like Kota Kinabalu's eight-lane coastal highway.",
          audioFile: "/audio/no-freeways.mp3"
        },
        {
          title: "1950s–60s Transport",
          content: "Before road expansion, rivers were the main transport network, supplemented by early British-era roads.",
          audioFile: "/audio/1950s-transport.mp3"
        },
        {
          title: "Adventure Road Trip",
          content: "Sabah's logging roads and plantation tracks offer a rugged road-trip challenge, often tackled with 4x4 convoys.",
          audioFile: "/audio/adventure-road.mp3"
        },
        {
          title: "Road Paving",
          content: "As of 2016, around 51.8% of Sabah's 21,934 km road network was sealed (11,355 km).",
          audioFile: "/audio/road-paving.mp3"
        },
        {
          title: "Road Maintenance",
          content: "Federal trunk roads are managed by Malaysia's JKR (Public Works Department), while Sabah JKR handles state and rural roads.",
          audioFile: "/audio/road-maintenance.mp3"
        },
        {
          title: "Pan-Borneo Highway",
          content: "A major project ~2,083 km long, linking Sabah with Sarawak & Brunei, modernizing two-lane roads into multi-lane highways.",
          audioFile: "/audio/pan-borneo.mp3"
        },
        {
          title: "Road Damage Causes",
          content: "Aging infrastructure, heavy usage, tropical rains, and under-maintenance contribute to road deterioration.",
          audioFile: "/audio/road-damage.mp3"
        },
        {
          title: "Tunnels in Sabah",
          content: "Proposed tunnel projects have been considered since 2014 to bypass landslide-prone highland stretches.",
          audioFile: "/audio/tunnels.mp3"
        },
        {
          title: "Future Outlook",
          content: "With initiatives like the Sabah Development Corridor and Pan-Borneo Highway, Sabah aims for a fully modern highway network by 2029.",
          audioFile: "/audio/future-outlook.mp3"
        }
      ]
    },
    {
      id: 2,
      title: "Sabah History",
      preview: "Explore the rich historical heritage of Sabah",
      facts: [
        {
          title: "Ancient Kingdoms",
          content: "Sabah was once part of the Brunei Sultanate and had various local chieftains ruling different areas.",
          audioFile: "/audio/ancient-kingdoms.mp3"
        },
        {
          title: "British North Borneo",
          content: "In 1881, the British North Borneo Company established colonial rule over Sabah.",
          audioFile: "/audio/british-borneo.mp3"
        },
        {
          title: "World War II",
          content: "Sabah was occupied by Japanese forces from 1942 to 1945, causing significant hardship to locals.",
          audioFile: "/audio/wwii.mp3"
        },
        {
          title: "Independence",
          content: "Sabah gained independence and joined Malaysia in 1963 as one of the founding states.",
          audioFile: "/audio/independence.mp3"
        },
        {
          title: "Cultural Diversity",
          content: "Sabah is home to over 30 ethnic groups, making it one of Malaysia's most diverse states.",
          audioFile: "/audio/cultural-diversity.mp3"
        },
        {
          title: "Mount Kinabalu",
          content: "Sacred to the Kadazan-Dusun people, Mount Kinabalu is believed to be the resting place of spirits.",
          audioFile: "/audio/mount-kinabalu.mp3"
        },
        {
          title: "Trading Hub",
          content: "Historically, Sabah was an important trading post for Chinese, Arab, and European merchants.",
          audioFile: "/audio/trading-hub.mp3"
        },
        {
          title: "Headhunting Tribes",
          content: "Some indigenous tribes in Sabah practiced headhunting as part of their warrior culture until the early 20th century.",
          audioFile: "/audio/headhunting.mp3"
        },
        {
          title: "Sandakan Death Marches",
          content: "During WWII, the infamous Sandakan Death Marches resulted in the deaths of thousands of POWs.",
          audioFile: "/audio/death-marches.mp3"
        },
        {
          title: "Modern Development",
          content: "Since joining Malaysia, Sabah has transformed from a primarily agricultural state to a modern economy with tourism and palm oil industries.",
          audioFile: "/audio/modern-development.mp3"
        }
      ]
    }
  ];

  const handleCardClick = (cardData) => {
    setSelectedCard(cardData);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
  };

  return (
    <div className="funfact-page">
      {/* Layer 1: Background Video */}
      <video 
        className="background-video" 
        autoPlay 
        muted 
        loop 
        playsInline
      >
        <source src="/assets/VideoFiles/GreyBackgroundAE_Loop_002.webm" type="video/webm" />
        Your browser does not support the video tag.
      </video>

      {/* Layer 2: Gradient Overlay */}
      <GradientOverlay />

      {/* Layer 3: Fun Fact Cards */}
      <div className="cards-container">
        {funFactsData.map((cardData) => (
          <FunFactCard 
            key={cardData.id}
            data={cardData}
            onClick={() => handleCardClick(cardData)}
          />
        ))}
      </div>

      {/* Detail Modal */}
      {isModalOpen && selectedCard && (
        <DetailModal 
          data={selectedCard}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default FunFactPage;