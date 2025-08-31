import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-stone-900 py-12 border-t border-green-200/20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-stone-900 font-bold">🛣️</span>
            </div>
            <div className="text-green-100 font-bold">Sabah Road Care</div>
          </div>
          <p className="text-stone-400">© 2025 Sabah Road Care. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;