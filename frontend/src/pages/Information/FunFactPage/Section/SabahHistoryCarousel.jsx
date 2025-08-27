// SabahHistoryCarousel.jsx
import React from 'react';
import FunFactCarousel from './FunFactCarousel';
import '../FunFactMainPage.css';

// Modern data structure for Sabah History Timeline
const sabahHistoryFacts = [
  {
    id: 1,
    title: "Pre-Colonial to Early 1900s",
    text: "Transportation was primarily river-based due to dense jungles and mountainous terrain. Indigenous communities used footpaths and trails between villages, with no formal road networks existing in the region.",
    audio: "/Audio/SabahHistoryAudio/Pre-Colonial to Early 1900sTransportation.wav",
    image: "https://placehold.co/600x300/2C3E50/FFFFFF?text=Pre-Colonial+Era",
    category: "Pre-Colonial"
  },
  {
    id: 2,
    title: "British North Borneo Company Era (1881–1946)",
    text: "The first systematic roads were built for plantation access, mainly on the west coast to support rubber and tobacco plantations. These roads had limited reach, leaving inland regions largely isolated from coastal developments.",
    audio: "/Audio/SabahHistoryAudio/British North Borneo Company Era (1881–1946).wav",
    image: "https://placehold.co/600x300/34495E/FFFFFF?text=British+North+Borneo+Co",
    category: "Colonial Era"
  },
  {
    id: 3,
    title: "Post-War British Crown Colony (1946–1963)",
    text: "World War II devastated Sabah's infrastructure, destroying roads and bridges. Major rebuilding efforts focused on key routes like Jesselton–Tenom and Tawau–Keningau, marking the beginning of modern road development.",
    audio: "/Audio/SabahHistoryAudio/Post-War British Crown Colony (1946–1963).wav",
    image: "https://placehold.co/600x300/7F8C8D/FFFFFF?text=Post-War+Era",
    category: "Post-War"
  },
  {
    id: 4,
    title: "Formation of Malaysia (1963)",
    text: "With federal investments to unify Sabah with Peninsular Malaysia and Sarawak, road development expanded significantly. Major north-south and east-west trunk roads were established, creating the foundation for modern connectivity.",
    audio: "/Audio/SabahHistoryAudio/Formation of Malaysia (1963).wav",
    image: "https://placehold.co/600x300/27AE60/FFFFFF?text=Formation+of+Malaysia",
    category: "Independence"
  },
  {
    id: 5,
    title: "World Bank Era (1970s–1980s)",
    text: "Road expansion was funded by international institutions including the World Bank and Asian Development Bank. These projects improved rural access and supported logging activities, with bitumen-sealed roads replacing gravel tracks.",
    audio: "/Audio/SabahHistoryAudio/World Bank Era (1970s–1980s).wav",
    image: "https://placehold.co/600x300/2980B9/FFFFFF?text=World+Bank+Era",
    category: "Development Era"
  },
  {
    id: 6,
    title: "1990s–2000s Modernization",
    text: "Malaysia's comprehensive road numbering system was adopted, with Federal Route 1 being established. New roads were proposed to connect industrial areas, ports, and tourism destinations, marking a shift toward economic corridor development.",
    audio: "/Audio/SabahHistoryAudio/1990s–2000sRoad Classification.wav",
    image: "https://placehold.co/600x300/8E44AD/FFFFFF?text=1990s-2000s+Modernization",
    category: "Modernization"
  },
  {
    id: 7,
    title: "Sabah Development Corridor (2008 Onward)",
    text: "This strategic initiative focused on building rural roads to improve connectivity in interior areas. By 2016, over 11,000 km of roads were sealed, representing a significant expansion of the modern road network.",
    audio: "/Audio/SabahHistoryAudio/Sabah Development Corridor (2008 Onward)Rural Road Building.wav",
    image: "https://placehold.co/600x300/E67E22/FFFFFF?text=SDC+Initiative",
    category: "Strategic Development"
  },
  {
    id: 8,
    title: "Pan-Borneo Highway (2016–Present)",
    text: "This mega project connects Sabah with Sarawak and Brunei via modern highways. Phase 1A and 1B include major upgrades, with construction resumed after delays. The project targets full completion by 2029.",
    audio: "/Audio/SabahHistoryAudio/Pan-Borneo Highway (2016–Present)Mega Project.wav",
    image: "https://placehold.co/600x300/E74C3C/FFFFFF?text=Pan-Borneo+Highway",
    category: "Mega Project"
  },
  {
    id: 9,
    title: "Current Issues & Modernization (2020s)",
    text: "Sabah faces challenges with aging roads exceeding their design lifespan. Innovative solutions include Cold In-Place Recycling (CIPR) for sustainable resurfacing and digital monitoring technologies for maintenance and traffic management.",
    audio: "/Audio/SabahHistoryAudio/Current Issues & Modernization (2020s).wav",
    image: "https://placehold.co/600x300/F39C12/FFFFFF?text=Current+Modernization",
    category: "Contemporary"
  },
  {
    id: 10,
    title: "Summary Timeline",
    text: "1881: First plantation roads under British North Borneo Company. 1946: Post-WWII reconstruction begins. 1963: Road expansion after Malaysia's formation. 1970s: World Bank loans enable rural connectivity. 1996: Federal Route 1 system introduced. 2008: Launch of Sabah Development Corridor. 2016: Start of Pan-Borneo Highway Sabah section. 2024: RM285m allocated for road recycling upgrades.",
    audio: "/Audio/SabahHistoryAudio/Summary Timeline1881.wav",
    image: "https://placehold.co/600x300/16A085/FFFFFF?text=Summary+Timeline",
    category: "Timeline"
  }
];

const SabahHistoryCarousel = ({ goBack, onCardClick }) => {
  return (
    <FunFactCarousel 
      cards={sabahHistoryFacts} 
      goBack={goBack} 
      title="Timeline of Roads in Sabah" 
      onCardClick={onCardClick} 
    />
  );
};

export default SabahHistoryCarousel;