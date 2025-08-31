import React, { useState, useEffect, useRef } from "react";

const CTASection = ({ onGetStarted }) => {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-16 lg:py-20 bg-gradient-to-r from-asphalt-black via-asphalt-dark to-asphalt-medium overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-asphalt-black/50 via-transparent to-asphalt-black/50"></div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-green-400/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-green-500/10 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-3/4 w-16 h-16 bg-green-300/10 rounded-full animate-pulse delay-2000"></div>
      </div>

      <div
        className={`relative z-10 container mx-auto px-4 lg:px-6 text-center transition-all duration-1000 ${
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-road-white mb-4 lg:mb-6">
          Ready to Make Sabah's Roads Safer?
        </h2>
        <p className="text-lg lg:text-xl text-concrete-gray mb-6 lg:mb-8 max-w-2xl mx-auto">
          Join our community of citizens working together to improve road
          infrastructure across Sabah
        </p>
        <button
          onClick={onGetStarted}
          className={`bg-gradient-to-r from-safety-green to-pedestrian-green hover:from-pedestrian-green hover:to-safety-green text-asphalt-black px-8 lg:px-12 py-3 lg:py-4 rounded-full font-bold text-base lg:text-lg transition-all duration-300 transform hover:scale-105 shadow-xl shadow-safety-green/30 ${
            inView ? "animate-bounce-in delay-500" : ""
          }`}
        >
          Start Reporting Today
        </button>
      </div>
    </section>
  );
};

export default CTASection;
