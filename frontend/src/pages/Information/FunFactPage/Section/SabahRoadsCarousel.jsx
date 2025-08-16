// SabahRoadsCarousel.jsx
import React from 'react';
import FunFactCarousel from './FunFactCarousel'; // Use the main carousel component
import '../FunFactPage.css';

// Data for Sabah Roads history
const sabahRoadsFacts = [
  {
    id: 1,
    title: "Gravity-Defying Road",
    text: "There's a local optical illusion in Sabah where a road appears to roll uphill, specifically on the Kimanis–Keningau Highway.",
    image: "https://placehold.co/400x300/F5F5DC/000000?text=Gravity-Defying+Road",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-18.mp3",
  },
  {
    id: 2,
    title: "No Freeways",
    text: "Sabah lacks interstate freeways; major roads are federal two-lane highways or expanded urban routes like Kota Kinabalu’s eight-lane coastal highway.",
    image: "https://placehold.co/400x300/B22222/FFFFFF?text=No+Freeways",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-19.mp3",
  },
  {
    id: 3,
    title: "1950s–60s Transport",
    text: "Before road expansion, rivers were the main transport network, supplemented by early British-era roads.",
    image: "https://placehold.co/400x300/A9A9A9/000000?text=1950s+Transport",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-20.mp3",
  },
  {
    id: 4,
    title: "Adventure Road Trip",
    text: "Sabah’s logging roads and plantation tracks offer a rugged road-trip challenge, often tackled with 4x4 convoys.",
    image: "https://placehold.co/400x300/4169E1/FFFFFF?text=Adventure+Road+Trip",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-21.mp3",
  },
  {
    id: 5,
    title: "Road Paving",
    text: "As of 2016, around 51.8% of Sabah's 21,934 km road network was sealed (11,355 km).",
    image: "https://placehold.co/400x300/228B22/FFFFFF?text=Road+Paving",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-22.mp3",
  },
  {
    id: 6,
    title: "Road Maintenance",
    text: "Federal trunk roads are managed by Malaysia’s JKR (Public Works Department), while Sabah JKR handles state and rural roads.",
    image: "https://placehold.co/400x300/8B008B/FFFFFF?text=Road+Maintenance",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-23.mp3",
  },
  {
    id: 7,
    title: "Pan-Borneo Highway",
    text: "A major project ~2,083 km long, linking Sabah with Sarawak & Brunei, modernizing two-lane roads into multi-lane highways.",
    image: "https://placehold.co/400x300/808080/FFFFFF?text=Pan-Borneo+Highway",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
  },
  {
    id: 8,
    title: "Road Damage Causes",
    text: "Aging infrastructure, heavy usage, tropical rains, and under-maintenance contribute to road deterioration.",
    image: "https://placehold.co/400x300/FF5722/FFFFFF?text=Road+Damage+Causes",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-24.mp3",
  },
  {
    id: 9,
    title: "Tunnels in Sabah",
    text: "Proposed tunnel projects have been considered since 2014 to bypass landslide-prone highland stretches.",
    image: "https://placehold.co/400x300/FFC107/FFFFFF?text=Tunnels+in+Sabah",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-25.mp3",
  },
  {
    id: 10,
    title: "Future Outlook",
    text: "With initiatives like the Sabah Development Corridor and Pan-Borneo Highway, Sabah aims for a fully modern highway network by 2029.",
    image: "https://placehold.co/400x300/4CAF50/FFFFFF?text=Future+Outlook",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-26.mp3",
  },
];

const SabahRoadsCarousel = ({ onCardClick, goBack }) => {
  return <FunFactCarousel cards={sabahRoadsFacts} goBack={goBack} title="Timeline of Roads in Sabah" onCardClick={onCardClick} />;
};

export default SabahRoadsCarousel;
