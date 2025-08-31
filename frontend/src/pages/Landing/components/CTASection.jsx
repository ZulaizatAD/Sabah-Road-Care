import React from 'react';

const CTASection = ({ onGetStarted }) => {
  return (
    <section className="py-20 bg-gradient-to-r from-stone-900 via-stone-800 to-green-900">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl lg:text-5xl font-bold text-green-100 mb-6">
          Ready to Make Sabah's Roads Safer?
        </h2>
        <p className="text-xl text-stone-300 mb-8 max-w-2xl mx-auto">
          Join our community of citizens working together to improve road infrastructure across Sabah
        </p>
        <button 
          onClick={onGetStarted}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-stone-900 px-12 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl shadow-green-500/30"
        >
          Start Reporting Today
        </button>
      </div>
    </section>
  );
};

export default CTASection;