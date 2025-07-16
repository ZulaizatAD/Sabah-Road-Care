import React from "react";

const Footer = () => (
  <footer className="bg-white border-t mt-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex justify-between items-center text-sm text-gray-600">
        <div>© Example2</div>
        <div className="flex space-x-4">
          <a href="#" className="hover:text-gray-900">
            Contact Us
          </a>
          <span>|</span>
          <a href="#" className="hover:text-gray-900">
            Privacy Policy
          </a>
          <span>|</span>
          <a href="#" className="hover:text-gray-900">
            Terms and Conditions
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
