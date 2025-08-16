// SabahHistoryCarousel.jsx
import React from 'react';
import FunFactCarousel from './FunFactCarousel';
import '../FunFactPage.css';
import { Link } from 'react-router-dom'; // Import Link for navigation within the app

// Data for Sabah History with new image URLs
const sabahHistoryFacts = [
  {
    id: 1,
    title: "The Land Below the Wind",
    text: "Sabah is known as the 'Land Below the Wind' because it is located just south of the typhoon belt and is not affected by typhoons.",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    image: "https://placehold.co/400x200/FF5722/FFFFFF?text=Land+Below+the+Wind"
  },
  {
    id: 2,
    title: "Mount Kinabalu",
    text: "Mount Kinabalu is the highest peak in Borneo's Crocker Range and is a UNESCO World Heritage Site.",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    image: "https://placehold.co/400x200/795548/FFFFFF?text=Mount+Kinabalu"
  },
  {
    id: 3,
    title: "The British North Borneo Company",
    text: "From 1881 to 1946, Sabah was governed by the British North Borneo Company, a chartered company.",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    image: "https://placehold.co/400x200/009688/FFFFFF?text=British+North+Borneo+Co"
  },
  {
    id: 4,
    title: "Formation of Malaysia",
    text: "Sabah, along with Sarawak, Singapore, and the Federation of Malaya, formed Malaysia on September 16, 1963.",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    image: "https://placehold.co/400x200/3F51B5/FFFFFF?text=Formation+of+Malaysia"
  },
  {
    id: 5,
    title: "World War II",
    text: "During World War II, Sabah (then known as North Borneo) was occupied by Japanese forces from 1942 to 1945.",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    image: "https://placehold.co/400x200/607D8B/FFFFFF?text=World+War+II"
  },
];

// This component uses FunFactCarousel to display Sabah's history.
const SabahHistoryCarousel = ({ goBack, onCardClick }) => {
  return (
    <>
      <FunFactCarousel cards={sabahHistoryFacts} goBack={goBack} title="Sabah History" onCardClick={onCardClick} />
      <div className="section-link-container">
        <Link to="#" onClick={() => goBack('sabahRoads')} className="section-link">
          Explore Sabah's Roads Timeline 
        </Link>
      </div>
    </>
  );
};

export default SabahHistoryCarousel;