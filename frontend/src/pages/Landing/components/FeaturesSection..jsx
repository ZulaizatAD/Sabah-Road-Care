import React from 'react';
import { MapPin, Camera, BarChart3, Users } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    { 
      icon: Camera, 
      title: "Easy Reporting", 
      desc: "Snap photos of road damage and submit reports in minutes" 
    },
    { 
      icon: MapPin, 
      title: "GPS Location", 
      desc: "Automatic location tagging for precise damage reporting" 
    },
    { 
      icon: BarChart3, 
      title: "AI Analysis", 
      desc: "Smart severity assessment using advanced AI technology" 
    },
    { 
      icon: Users, 
      title: "Community Impact", 
      desc: "Join thousands making Sabah's roads safer" 
    }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-stone-50 to-stone-100">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-stone-900 mb-6">
            Why Choose 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-700"> Sabah Road Care?</span>
          </h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
            Experience the perfect blend of citizen engagement and smart technology for better roads
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-stone-200"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="text-stone-900" size={28} />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3">{feature.title}</h3>
              <p className="text-stone-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;