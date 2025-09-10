import React, { useState, useEffect } from "react";
import assets from "../../../assets/assets";

const Navigation = ({ showNav, onGetStarted }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!showNav) {
      setIsMobileMenuOpen(false);
    }
  }, [showNav]);

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className={`fixed top-0 w-full z-50 transition-all duration-500 ease-out ${
        showNav
          ? "transform translate-y-0 opacity-100"
          : "transform -translate-y-full opacity-0"
      }`}
    >
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-safety-green text-asphalt-black px-4 py-2 rounded z-50"
      >
        Skip to main content
      </a>

      <div className="container mx-auto px-12 py-6">
        <div className="flex items-center justify-between">
          <div
            className={`flex items-center space-x-4 transition-all duration-500 ${
              showNav
                ? "transform translate-x-0 opacity-100"
                : "transform -translate-x-4 opacity-0"
            }`}
          >
            {/* Brand Logo */}
            <div className="w-12 h-12 flex items-center justify-center transform hover:scale-110 hover:rotate-6 transition-all duration-300">
              <img
                src={assets.TransparentLogo}
                alt="Sabah Road Care Logo"
              />
            </div>
            <div className="text-road-white font-bold text-xl tracking-wide">
              Sabah Road Care
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-road-white hover:text-safety-green transition-colors duration-300 p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isMobileMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>

          {/* Desktop Get Started Button */}
          <button
            onClick={onGetStarted}
            className={`hidden md:block bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-stone-900 px-6 py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/30 ${
              showNav
                ? "transform translate-x-0 opacity-100 delay-300"
                : "transform translate-x-4 opacity-0"
            }`}
          >
            Get Started
          </button>
        </div>

        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-asphalt-dark/98 backdrop-blur-xl border-b border-safety-green/30 shadow-2xl">
            <div className="px-12 py-6">
              <button
                onClick={() => {
                  onGetStarted();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-stone-900 px-6 py-3 rounded-full font-semibold transition-all duration-300"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-stone-900/95 via-stone-900/25 to-stone-900/95 backdrop-blur-md -z-10"></div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400/50 to-transparent"></div>
    </nav>
  );
};

export default Navigation;
