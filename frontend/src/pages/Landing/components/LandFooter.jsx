import React from "react";

const LandFooter = () => {
  return (
    <footer className="bg-asphalt-black py-8 lg:py-12 border-t border-safety-green/20">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-safety-green to-pedestrian-green rounded-lg flex items-center justify-center">
              <span className="text-asphalt-black font-bold text-sm lg:text-base">🛣️</span>
            </div>
            <div className="text-road-white font-bold text-sm lg:text-base">
              Sabah Road Care
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <p className="text-concrete-gray text-xs lg:text-sm">
              © 2025 Sabah Road Care. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs lg:text-sm">
              <a href="#privacy" className="text-concrete-gray hover:text-safety-green transition-colors duration-300">
                Privacy Policy
              </a>
              <span className="text-concrete-gray">•</span>
              <a href="#terms" className="text-concrete-gray hover:text-safety-green transition-colors duration-300">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
        
        {/* Additional footer content for presentation */}
        <div className="mt-6 pt-6 border-t border-safety-green/10">
          <div className="text-center">
            <p className="text-concrete-gray text-xs lg:text-sm">
              Built with ❤️ for safer roads in Sabah • Powered by AI & Community
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandFooter;