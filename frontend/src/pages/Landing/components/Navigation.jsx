import React, { useState } from "react";

const Navigation = ({ showNav, onGetStarted }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className={`fixed top-0 w-full z-50 transition-all duration-700 ease-out ${
        showNav
          ? "transform translate-y-0 opacity-100 bg-asphalt-dark/95 backdrop-blur-xl border-b border-safety-green/30 shadow-2xl"
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

      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div
            className={`flex items-center space-x-4 transition-all duration-500 ${
              showNav
                ? "transform translate-x-0 opacity-100"
                : "transform -translate-x-4 opacity-0"
            }`}
          >
            {/* Brand Logo */}
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center transform hover:scale-110 hover:rotate-6 transition-all duration-300 shadow-lg shadow-green-500/30">
              <span className="text-stone-900 font-bold text-xl">🛣️</span>
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
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
              />
            </svg>
          </button>

          {/* Desktop Navigation */}
          <div
            className={`hidden md:flex items-center space-x-8 transition-all duration-700 delay-200 ${
              showNav
                ? "transform translate-y-0 opacity-100"
                : "transform translate-y-4 opacity-0"
            }`}
          >
            <a
              href="#home"
              className="relative text-road-white hover:text-safety-green transition-colors duration-300 group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-safety-green to-pedestrian-green group-hover:w-full transition-all duration-300"></span>
            </a>
            <a
              href="#features"
              className="relative text-green-100 hover:text-green-400 transition-colors duration-300 group"
            >
              Features
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-400 to-green-500 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a
              href="#about"
              className="relative text-green-100 hover:text-green-400 transition-colors duration-300 group"
            >
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-400 to-green-500 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a
              href="#contact"
              className="relative text-green-100 hover:text-green-400 transition-colors duration-300 group"
            >
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-400 to-green-500 group-hover:w-full transition-all duration-300"></span>
            </a>
          </div>

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
            <div className="px-6 py-6 space-y-4">
              {[
                { name: 'Home', href: '#home' },
                { name: 'Features', href: '#features' },
                { name: 'About', href: '#about' },
                { name: 'Contact', href: '#contact' }
              ].map((item) => (
                <a 
                  key={item.name} 
                  href={item.href} 
                  className="block text-road-white hover:text-safety-green transition-colors duration-300 py-2 text-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <button 
                onClick={() => {
                  onGetStarted();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-stone-900 px-6 py-3 rounded-full font-semibold transition-all duration-300 mt-4"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-stone-900/10 via-green-900/5 to-stone-900/10 -z-10"></div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400/50 to-transparent"></div>
    </nav>
  );
};

export default Navigation;