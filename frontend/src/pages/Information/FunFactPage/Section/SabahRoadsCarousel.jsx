// SabahRoadsCarousel.jsx
import React from 'react';
import FunFactCarousel from './FunFactCarousel';
import '../FunFactMainPage.css';

// Modern data structure for Sabah Fun & Interesting Facts
const sabahRoadsFacts = [
  {
    id: 1,
    title: "Gravity-Defying Road",
    text: "Experience the fascinating optical illusion on the Kimanis–Keningau Highway where roads appear to roll uphill, creating a mind-bending driving experience that defies gravity.",
    image: "https://placehold.co/600x300/2C3E50/FFFFFF?text=Gravity-Defying+Road",
    audio: "/Audio/FunFactAudio/Gravity Roads_V2.wav",
    category: "Natural Phenomena"
  },
  {
    id: 2,
    title: "No Freeways Policy",
    text: "Unlike other states, Sabah maintains a unique road network without interstate freeways, relying on federal two-lane highways and urban routes like Kota Kinabalu's impressive eight-lane coastal highway.",
    image: "https://placehold.co/600x300/34495E/FFFFFF?text=No+Freeways+Policy",
    audio: "/Audio/FunFactAudio/No Freeways_2.wav",
    category: "Infrastructure"
  },
  {
    id: 3,
    title: "1950s–60s Transport Revolution",
    text: "Before modern road expansion, Sabah's transportation relied heavily on river networks, with early British-era roads serving as supplementary routes through the challenging terrain.",
    image: "https://placehold.co/600x300/7F8C8D/FFFFFF?text=1950s+Transport+Revolution",
    audio: "/Audio/FunFactAudio/1950s–60s Transport.wav",
    category: "Historical"
  },
  {
    id: 4,
    title: "Adventure Road Trip Paradise",
    text: "Sabah's rugged logging roads and plantation tracks offer the ultimate 4x4 adventure challenge, attracting thrill-seekers who tackle these demanding routes in organized convoys.",
    image: "https://placehold.co/600x300/27AE60/FFFFFF?text=Adventure+Road+Trip+Paradise",
    audio: "/Audio/FunFactAudio/Adventure Road Trip.wav",
    category: "Adventure"
  },
  {
    id: 5,
    title: "Road Paving Progress",
    text: "As of 2016, Sabah achieved a significant milestone with 51.8% of its 21,934 km road network being sealed, totaling 11,355 km of paved roads connecting communities across the state.",
    image: "https://placehold.co/600x300/2980B9/FFFFFF?text=Road+Paving+Progress",
    audio: "/Audio/FunFactAudio/Road Paving.wav",
    category: "Development"
  },
  {
    id: 6,
    title: "Dual Management System",
    text: "Sabah's road network operates under a sophisticated dual management system: federal trunk roads managed by Malaysia's JKR, while Sabah JKR handles state and rural road infrastructure.",
    image: "https://placehold.co/600x300/8E44AD/FFFFFF?text=Dual+Management+System",
    audio: "/Audio/FunFactAudio/Road Maintenance.wav",
    category: "Governance"
  },
  {
    id: 7,
    title: "Pan-Borneo Highway Mega Project",
    text: "The ambitious 2,083 km Pan-Borneo Highway represents a transformative project linking Sabah with Sarawak and Brunei, modernizing two-lane roads into multi-lane highways for regional connectivity.",
    image: "https://placehold.co/600x300/E67E22/FFFFFF?text=Pan-Borneo+Highway+Mega+Project",
    audio: "/Audio/FunFactAudio/Pan-Borneo Highway.wav",
    category: "Mega Project"
  },
  {
    id: 8,
    title: "Road Damage Factors",
    text: "Sabah's roads face multiple challenges including aging infrastructure, heavy commercial usage, intense tropical rainfall, and maintenance gaps, all contributing to road deterioration patterns.",
    image: "https://placehold.co/600x300/E74C3C/FFFFFF?text=Road+Damage+Factors",
    audio: "/Audio/FunFactAudio/Road Damage Causes.wav",
    category: "Challenges"
  },
  {
    id: 9,
    title: "Tunnel Vision for the Future",
    text: "Since 2014, innovative tunnel projects have been proposed to bypass landslide-prone highland stretches, representing a forward-thinking approach to Sabah's challenging terrain.",
    image: "https://placehold.co/600x300/F39C12/FFFFFF?text=Tunnel+Vision+for+the+Future",
    audio: "/Audio/FunFactAudio/Tunnels in Saabah.wav",
    category: "Innovation"
  },
  {
    id: 10,
    title: "Future Highway Network Vision",
    text: "Through strategic initiatives like the Sabah Development Corridor and Pan-Borneo Highway, Sabah is on track to achieve a fully modern highway network by 2029, revolutionizing regional connectivity.",
    image: "https://placehold.co/600x300/16A085/FFFFFF?text=Future+Highway+Network+Vision",
    audio: "/Audio/FunFactAudio/Future Outlook.wav",
    category: "Future Vision"
  },
];

const SabahRoadsCarousel = ({ onCardClick, goBack }) => {
  return (
    <FunFactCarousel 
      cards={sabahRoadsFacts} 
      goBack={goBack} 
      title="Fun & Interesting Facts About Sabah Roads" 
      onCardClick={onCardClick} 
    />
  );
};

export default SabahRoadsCarousel;
