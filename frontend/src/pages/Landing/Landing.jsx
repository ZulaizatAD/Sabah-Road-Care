import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "./components/HeroSection";
import Navigation from "./components/Navigation";
import FeaturesSection from "./components/FeaturesSection";
import CTASection from "./components/CTASection";
import LandFooter from "./components/LandFooter";
import assets from "../../assets/assets";

const Landing = () => {
  const navigate = useNavigate();
  const [showNav, setShowNav] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading for better presentation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.getElementById("main-content");
      if (heroSection) {
        const heroHeight = heroSection.offsetHeight;
        const scrollPosition = window.scrollY;
        setShowNav(scrollPosition > heroHeight * 0.8);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleGetStarted = () => {
    navigate("/login");
  };

  // Loading screen for presentation
  if (isLoading) {
    return (
      <div className="min-h-screen bg-asphalt-black flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6 flex items-center justify-center animate-bounce mx-auto">
            <img
              src={assets.TransparentLogo}
              alt="Sabah Road Care Logo"
              className="w-28 h-28 lg:w-36 lg:h-36 object-contain"
            />
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-road-white mb-4">
            Sabah Road Care
          </h2>
          <p className="text-concrete-gray mb-6 text-sm lg:text-base">
            Loading historical road development...
          </p>
          <div className="loading-spinner primary large mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-asphalt-black font-['Inter',sans-serif] overflow-x-hidden">
      <Navigation showNav={showNav} onGetStarted={handleGetStarted} />
      <HeroSection onGetStarted={handleGetStarted} />
      <FeaturesSection />
      <CTASection onGetStarted={handleGetStarted} />
      <LandFooter />
    </div>
  );
};

export default Landing;
