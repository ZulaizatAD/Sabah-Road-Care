import React, { useState, useEffect, useRef } from "react";
import { MapPin, Camera, BarChart3, Users } from "lucide-react";

const FeaturesSection = () => {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);

  const features = [
    {
      icon: Camera,
      title: "Easy Reporting",
      desc: "Snap photos of road damage and submit reports in minutes",
    },
    {
      icon: MapPin,
      title: "GPS Location",
      desc: "Automatic location tagging for precise damage reporting",
    },
    {
      icon: BarChart3,
      title: "AI Analysis",
      desc: "Smart severity assessment using advanced AI technology",
    },
    {
      icon: Users,
      title: "Community Impact",
      desc: "Join thousands making Sabah's roads safer",
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="py-16 lg:py-20 bg-gradient-to-b from-asphalt-medium to-asphalt-light"
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div
          className={`text-center mb-12 lg:mb-16 transition-all duration-1000 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-road-white mb-4 lg:mb-6">
            Why Choose
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-700">
              {" "}
              Sabah Road Care?
            </span>
          </h2>
          <p className="text-lg lg:text-xl text-concrete-gray max-w-2xl mx-auto">
            Experience the perfect blend of citizen engagement and smart
            technology for better roads
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group glass p-6 lg:p-8 rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-road-white/20 ${
                inView ? "animate-slide-in-up" : "opacity-0 translate-y-10"
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-xl lg:rounded-2xl mb-4 lg:mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <feature.icon
                  className="text-stone-900"
                  size={
                    typeof window !== "undefined" && window.innerWidth < 768
                      ? 20
                      : 28
                  }
                />
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-road-white mb-2 lg:mb-3">
                {feature.title}
              </h3>
              <p className="text-concrete-gray leading-relaxed text-sm lg:text-base">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
