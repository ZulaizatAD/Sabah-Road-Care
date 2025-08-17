// SabahHistoryCarousel.jsx
import React from 'react';
import FunFactCarousel from './FunFactCarousel';
import '../FunFactMainPage.css';
import { Link } from 'react-router-dom'; // Import Link for navigation within the app

// Data for Sabah History with new image URLs
const sabahHistoryFacts = [
  {
    id: 1,
    title: "Pre-Colonial to Early 1900s",
    text: "Transportation was primarily river-based due to dense jungles and mountainous terrain. No formal road networks existed.",
    audio: "/Audio/SabahHistoryAudio/Pre-Colonial to Early 1900s_V1.wav",
    image: "https://placehold.co/400x200/FF5722/FFFFFF?text=Pre-Colonial+Era"
  },
  {
    id: 2,
    title: "British North Borneo Company Era (1881–1946)",
    text: "The first roads were built for plantation access, mainly on the west coast to support rubber and tobacco plantations, with limited reach.",
    audio: "/Audio/SabahHistoryAudio/British North Borneo Company Era (1881–1946)_V1.wav",
    image: "https://placehold.co/400x200/795548/FFFFFF?text=British+North+Borneo+Co"
  },
  {
    id: 3,
    title: "Post-War British Crown Colony (1946–1963)",
    text: "Roads and bridges were destroyed during WWII, leading to major rebuilding efforts on key routes like Jesselton–Tenom and Tawau–Keningau.",
    audio: "/Audio/SabahHistoryAudio/Post-War British Crown Colony (1946–1963)_V1.wav",
    image: "https://placehold.co/400x200/009688/FFFFFF?text=Post-War+Era"
  },
  {
    id: 4,
    title: "Formation of Malaysia (1963)",
    text: "With federal investments to unify Sabah, road development expanded, and major north-south and east-west trunk roads were established.",
    audio: "/Audio/SabahHistoryAudio/Formation of Malaysia (1963)_V1.wav",
    image: "https://placehold.co/400x200/3F51B5/FFFFFF?text=Formation+of+Malaysia"
  },
  {
    id: 5,
    title: "World Bank Era (1970s–1980s)",
    text: "Road expansion was funded by the World Bank and Asian Development Bank to improve rural access and support logging, with sealed roads replacing gravel tracks.",
    audio: "/Audio/SabahHistoryAudio/World Bank Era (1970s–1980s)_V1.wav",
    image: "https://placehold.co/400x200/607D8B/FFFFFF?text=World+Bank+Era"
  },
  {
    id: 6,
    title: "1990s–2000s",
    text: "Malaysia's road numbering system was adopted, with Federal Route 1 being formed, and new roads were proposed to connect to industrial and tourism sites.",
    audio: "/Audio/SabahHistoryAudio/1990s–2000s_V1.wav",
    image: "https://placehold.co/400x200/673AB7/FFFFFF?text=1990s-2000s"
  },
  {
    id: 7,
    title: "Sabah Development Corridor (2008 Onward)",
    text: "This initiative focused on building rural roads to improve connectivity, leading to a significant expansion of the sealed road network.",
    audio: "/Audio/SabahHistoryAudio/Sabah Development Corridor (2008 Onward)_V1.wav",
    image: "https://placehold.co/400x200/FF9800/FFFFFF?text=SDC"
  },
  {
    id: 8,
    title: "Pan-Borneo Highway (2016–Present)",
    text: "A major project to connect Sabah with Sarawak and Brunei via modern highways. It aims for full completion by 2029.",
    audio: "/Audio/SabahHistoryAudio/Pan-Borneo Highway (2016–Present)_V1.wav",
    image: "https://placehold.co/400x200/FFC107/FFFFFF?text=Pan-Borneo+Highway"
  },
  {
    id: 9,
    title: "Current Issues & Modernization (2020s)",
    text: "Sabah is dealing with aging roads by introducing sustainable resurfacing methods like CIPR and exploring new digital monitoring technologies for maintenance.",
    audio: "/Audio/SabahHistoryAudio/Current Issues & Modernization (2020s)_V1.wav",
    image: "https://placehold.co/400x200/E91E63/FFFFFF?text=Modernization"
  },
];

// This component uses FunFactCarousel to display Sabah's history.
const SabahHistoryCarousel = ({ goBack, onCardClick }) => {
  return (
    <>
      <FunFactCarousel cards={sabahHistoryFacts} goBack={goBack} title="Timeline of Roads in Sabah" onCardClick={onCardClick} />
      <div className="section-link-container">
        <Link to="#" onClick={() => goBack('sabahRoads')} className="section-link">
          Explore Sabah's Roads Timeline 
        </Link>
      </div>
    </>
  );
};

export default SabahHistoryCarousel;