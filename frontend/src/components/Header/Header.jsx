import React from "react";

const Header = () => (
  <header className="bg-white shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center py-4">
        <div className="flex items-center space-x-8">
          <div className="bg-gray-200 px-4 py-2 rounded">
            <span className="font-medium text-gray-800">Sabah Road Care</span>
          </div>
        </div>
        <nav className="flex space-x-8">
          <a href="#" className="text-gray-900 font-medium">
            Dashboard
          </a>
          <a href="#" className="text-gray-600 hover:text-gray-900">
            Information
          </a>
          <a href="#" className="text-gray-600 hover:text-gray-900">
            Profile
          </a>
        </nav>
      </div>
    </div>
  </header>
);

export default Header;
