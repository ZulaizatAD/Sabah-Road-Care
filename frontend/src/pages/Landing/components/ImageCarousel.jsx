import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import assets from "../../../assets/assets";

const ImageCarousel = ({ onSlideChange }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Road infrastructure Images
  const images = [
    assets.historyMain,
    assets.history1,
    assets.history2,
    assets.history3,
    assets.history4,
    assets.history5,
    assets.history6,
    assets.history7,
    assets.history8,
    assets.history9,
    assets.history10,
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const newSlide = (currentSlide + 1) % images.length;
      setCurrentSlide(newSlide);
      onSlideChange?.(newSlide); // Notify parent component
    }, 8000);

    return () => clearInterval(interval);
  }, [currentSlide, images.length, onSlideChange]);

  const nextSlide = () => {
    const newSlide = (currentSlide + 1) % images.length;
    setCurrentSlide(newSlide);
    onSlideChange?.(newSlide);
  };

  const prevSlide = () => {
    const newSlide = (currentSlide - 1 + images.length) % images.length;
    setCurrentSlide(newSlide);
    onSlideChange?.(newSlide);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    onSlideChange?.(index);
  };

  return (
    <>
      {/* Full Background Carousel*/}
      <div className="absolute inset-0">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105"
            }`}
          >
            {/* Clear background image */}
            <img
              src={image}
              alt={`Sabah road ${index + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Light overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-stone-900/30 via-stone-800/20 to-green-900/30"></div>
          </div>
        ))}
      </div>

      {/* Navigation Controls with Glassmorphism */}
      <button
        onClick={prevSlide}
        className="absolute left-8 top-1/2 -translate-y-1/2 z-30 
                   bg-white/10 backdrop-blur-md border border-white/20 
                   hover:bg-white/20 hover:border-white/30
                   text-white hover:text-green-300 
                   p-5 rounded-full transition-all duration-300 
                   transform hover:scale-110 shadow-2xl group"
      >
        <ChevronLeft
          size={32}
          className="group-hover:-translate-x-1 transition-transform duration-300"
        />
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-8 top-1/2 -translate-y-1/2 z-30 
                   bg-white/10 backdrop-blur-md border border-white/20 
                   hover:bg-white/20 hover:border-white/30
                   text-white hover:text-green-300 
                   p-5 rounded-full transition-all duration-300 
                   transform hover:scale-110 shadow-2xl group"
      >
        <ChevronRight
          size={32}
          className="group-hover:translate-x-1 transition-transform duration-300"
        />
        <div className="absolute inset-0 rounded-full bg-gradient-to-l from-green-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </button>

      {/* Progress Indicators with Glassmorphism */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
        <div className="flex space-x-4 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-4 rounded-full shadow-2xl">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`relative w-5 h-5 rounded-full transition-all duration-500 ${
                currentSlide === index
                  ? "bg-gradient-to-r from-green-400 to-green-500 scale-150 shadow-lg shadow-green-400/60"
                  : "bg-white/50 hover:bg-green-300 hover:scale-125"
              }`}
            >
              {currentSlide === index && (
                <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Ambient Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-3 h-3 bg-green-400/20 rounded-full ${
              i % 3 === 0
                ? "animate-float-1"
                : i % 3 === 1
                ? "animate-float-2"
                : "animate-float-3"
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Corner Accent Elements */}
      <div className="absolute top-32 right-12 w-6 h-6 bg-green-400/60 rounded-full animate-pulse z-10"></div>
      <div className="absolute bottom-32 left-12 w-4 h-4 bg-green-300/50 rounded-full animate-pulse z-10"></div>
      <div className="absolute top-1/3 left-16 w-2 h-2 bg-green-500/70 rounded-full animate-pulse z-10"></div>
    </>
  );
};

export default ImageCarousel;