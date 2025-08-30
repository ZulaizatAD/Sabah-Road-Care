import React, { useState, useEffect } from "react";
import { ArrowRight, Calendar, MapPin, Clock } from "lucide-react";
import ImageCarousel from "./ImageCarousel";

const HeroSection = ({ onGetStarted }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Historical content for each slide based on Sabah's road development
  const historicalContent = [
    {
      // Default content for first image (existing)
      era: "Present Day",
      title: "Report",
      subtitle: "Road Issues",
      description:
        "Help improve Sabah's road infrastructure by reporting potholes and road damage.",
      highlight: "Your reports make a difference",
      showHistoricalInfo: false,
      showBrandIcon: true,
      showTimeline: false,
    },
    {
      // Pre-Colonial to Early 1900s
      era: "Pre-Colonial to Early 1900s",
      title: "Rivers & Trails",
      subtitle: "Before Roads",
      description:
        "Transportation was primarily river-based due to dense jungles and mountainous terrain.",
      details: [
        "Indigenous people used trails between villages",
        "No formal road networks existed",
        "Rivers served as main transportation routes",
        "Dense jungles made overland travel difficult",
      ],
      showHistoricalInfo: true,
      showBrandIcon: false,
      timeframe: "Before 1881",
      showTimeline: false,
    },
    {
      // British North Borneo Company Era
      era: "British North Borneo Company Era",
      title: "First Plantation",
      subtitle: "Roads",
      description:
        "Built for plantation access, mainly on the west coast to support rubber and tobacco plantations.",
      details: [
        "First roads built for plantation access",
        "Mainly concentrated on the west coast",
        "Supported rubber and tobacco plantations",
        "Roads were coastal and short, leaving inland regions isolated",
      ],
      showHistoricalInfo: true,
      showBrandIcon: false,
      timeframe: "1881 - 1946",
      showTimeline: false,
    },
    {
      // Post-War British Crown Colony
      era: "Post-War British Crown Colony",
      title: "Rebuilding After",
      subtitle: "WWII Destruction",
      description:
        "Roads and bridges were destroyed during the war, requiring extensive rebuilding efforts.",
      details: [
        "WWII destroyed existing roads and bridges",
        "Key roads like Jesselton–Tenom were rebuilt",
        "Tawau–Keningau connection was restored",
        "Focus on reconnecting major settlements",
      ],
      showHistoricalInfo: true,
      showBrandIcon: false,
      timeframe: "1946 - 1963",
      showTimeline: false,
    },
    {
      // Formation of Malaysia
      era: "Formation of Malaysia",
      title: "Federal Investment",
      subtitle: "& Expansion",
      description:
        "Road development expanded with federal investments to unify Sabah with Peninsular Malaysia and Sarawak.",
      details: [
        "Federal investments boosted road development",
        "Unified Sabah with Peninsular Malaysia and Sarawak",
        "Major north-south connections established",
        "East-west trunk roads were built",
      ],
      showHistoricalInfo: true,
      showBrandIcon: false,
      timeframe: "1963 - 1970",
      showTimeline: false,
    },
    {
      // World Bank Era
      era: "World Bank Era",
      title: "Rural Access",
      subtitle: "& Modernization",
      description:
        "Funded by the World Bank and Asian Development Bank to support rural access and logging operations.",
      details: [
        "World Bank loans enabled major expansion",
        "Asian Development Bank provided funding",
        "Improved rural access and logging roads",
        "Bitumen-sealed roads replaced gravel tracks",
      ],
      showHistoricalInfo: true,
      showBrandIcon: false,
      timeframe: "1970s - 1980s",
      showTimeline: false,
    },
    {
      // 1990s-2000s
      era: "Road Classification Era",
      title: "Malaysian Road",
      subtitle: "Numbering System",
      description:
        "Adoption of the Malaysian road numbering system with Federal Route 1 formation and economic corridor development.",
      details: [
        "Malaysian road numbering system adopted",
        "Federal Route 1 was established",
        "Economic corridors were proposed",
        "New roads to industrial areas, ports, and tourism spots",
      ],
      showHistoricalInfo: true,
      showBrandIcon: false,
      timeframe: "1990s - 2000s",
      showTimeline: false,
    },
    {
      // Sabah Development Corridor
      era: "Sabah Development Corridor",
      title: "Rural Connectivity",
      subtitle: "Focus",
      description:
        "Focused on improving connectivity in rural and interior areas with extensive sealed network expansion.",
      details: [
        "Rural road building prioritized",
        "Interior areas connectivity improved",
        "Sealed network expansion accelerated",
        "Over 11,000 km of roads sealed by 2016",
      ],
      showHistoricalInfo: true,
      showBrandIcon: false,
      timeframe: "2008 - 2016",
      showTimeline: false,
    },
    {
      // Pan-Borneo Highway
      era: "Pan-Borneo Highway",
      title: "Mega Infrastructure",
      subtitle: "Project",
      description:
        "Connects Sabah with Sarawak and Brunei via modern highways, targeting full completion by 2029.",
      details: [
        "Mega project connecting Sabah, Sarawak, and Brunei",
        "Modern highway infrastructure",
        "Phase 1A & 1B include major upgrades",
        "Target completion by 2029",
      ],
      showHistoricalInfo: true,
      showBrandIcon: false,
      timeframe: "2016 - Present",
      showTimeline: false,
    },
    {
      // Current Issues & Modernization
      era: "Digital Age & Sustainability",
      title: "Smart Road",
      subtitle: "Management",
      description:
        "Modern challenges with aging infrastructure and innovative solutions using AI, IoT, and sustainable practices.",
      details: [
        "Many roads exceed their design lifespan",
        "Cold In-Place Recycling (CIPR) for sustainability",
        "AI and IoT for maintenance monitoring",
        "RM285m allocated for road recycling upgrades in 2024",
      ],
      showHistoricalInfo: true,
      showBrandIcon: false,
      timeframe: "2020s - Future",
      showTimeline: false,
    },
    {
      // Summary Timeline Slide
      era: "Complete Timeline",
      title: "Sabah's Road",
      subtitle: "Development Journey",
      description:
        "From jungle trails to modern highways - 140+ years of infrastructure evolution",
      showHistoricalInfo: false,
      showBrandIcon: false,
      showTimeline: true,
      timelineData: [
        {
          year: "1881",
          event: "First plantation roads under British North Borneo Company",
          icon: "🌱",
        },
        { year: "1946", event: "Post-WWII reconstruction begins", icon: "🔨" },
        {
          year: "1963",
          event: "Road expansion after Malaysia's formation",
          icon: "🇲🇾",
        },
        {
          year: "1970s",
          event: "World Bank loans enable rural connectivity",
          icon: "🏦",
        },
        {
          year: "1996",
          event: "Federal Route 1 system introduced",
          icon: "🛣️",
        },
        {
          year: "2008",
          event: "Launch of Sabah Development Corridor",
          icon: "🌉",
        },
        {
          year: "2016",
          event: "Start of Pan-Borneo Highway Sabah section",
          icon: "🛤️",
        },
        {
          year: "2024",
          event: "RM285m allocated for road recycling upgrades",
          icon: "🤖",
        },
      ],
    },
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Function to receive current slide from ImageCarousel
  const handleSlideChange = (slideIndex) => {
    setCurrentSlide(slideIndex);
  };

  const currentContent =
    historicalContent[currentSlide] || historicalContent[0];

  return (
    <section id="home" className="pt-20 min-h-screen relative overflow-hidden">
      {/* Background Carousel */}
      <ImageCarousel onSlideChange={handleSlideChange} />

      {/* Content Overlay */}
      <div className="relative z-20 container mx-auto px-6 py-20 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto">
          {/* Timeline View */}
          {currentContent.showTimeline ? (
            <div className="text-center">
              {/* Timeline Header */}
              <div
                className={`transition-all duration-1000 delay-200 transform ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
              >
                <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full mb-8">
                  <Clock size={20} className="text-green-400" />
                  <span className="text-green-300 font-medium">
                    Historical Overview
                  </span>
                </div>

                <h1 className="text-4xl lg:text-6xl font-bold text-green-100 mb-8 leading-tight drop-shadow-2xl">
                  {currentContent.title}
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-green-500 to-green-600 animate-pulse">
                    {currentContent.subtitle}
                  </span>
                </h1>

                <p className="text-xl text-stone-200 mb-12 leading-relaxed max-w-3xl mx-auto font-light drop-shadow-lg">
                  {currentContent.description}
                </p>
              </div>

              {/* Timeline Grid */}
              <div
                className={`transition-all duration-1000 delay-400 transform ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                  {currentContent.timelineData?.map((item, index) => (
                    <div
                      key={index}
                      className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-white/15 transition-all duration-300 transform hover:scale-105 ${
                        index % 2 === 0 ? "hover:rotate-1" : "hover:-rotate-1"
                      }`}
                      style={{
                        animationDelay: `${index * 0.1}s`,
                      }}
                    >
                      {/* Year & Icon */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-gradient-to-r from-green-400 to-green-600 px-4 py-2 rounded-full">
                          <span className="text-white font-bold text-lg">
                            {item.year}
                          </span>
                        </div>
                        <div className="text-3xl">{item.icon}</div>
                      </div>

                      {/* Event Description */}
                      <p className="text-white/90 text-sm leading-relaxed">
                        {item.event}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline CTA */}
              <div
                className={`mt-12 transition-all duration-1000 delay-600 transform ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
              >
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 max-w-2xl mx-auto">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Be Part of Sabah's Road Future
                  </h3>
                  <p className="text-stone-300 mb-6">
                    Help us continue this legacy by reporting road issues and
                    contributing to safer infrastructure.
                  </p>
                  <button
                    onClick={onGetStarted}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/30"
                  >
                    Start Reporting Today
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Regular Historical Content */
            <div
              className={`grid ${
                currentContent.showHistoricalInfo
                  ? "lg:grid-cols-2"
                  : "grid-cols-1"
              } gap-12 items-center`}
            >
              {/* Main Content Column */}
              <div
                className={`${
                  currentContent.showHistoricalInfo
                    ? "text-center lg:text-left"
                    : "text-center mx-auto max-w-4xl"
                }`}
              >
                {/* Era Badge - only for historical content */}
                {currentContent.showHistoricalInfo && (
                  <div
                    className={`inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full mb-6 transition-all duration-1000 transform ${
                      isVisible
                        ? "translate-y-0 opacity-100"
                        : "translate-y-10 opacity-0"
                    }`}
                  >
                    <Calendar size={16} className="text-green-400" />
                    <span className="text-green-300 font-medium text-sm">
                      {currentContent.timeframe}
                    </span>
                  </div>
                )}

                {/* Brand Icon - only for default content */}
                {currentContent.showBrandIcon && (
                  <div
                    className={`inline-flex w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-8 items-center justify-center animate-bounce transition-all duration-1000 transform ${
                      isVisible
                        ? "translate-y-0 opacity-100"
                        : "translate-y-10 opacity-0"
                    }`}
                  >
                    <span className="text-stone-900 font-bold text-3xl">
                      🛣️
                    </span>
                  </div>
                )}

                {/* Main Heading */}
                <div
                  className={`transition-all duration-1000 delay-200 transform ${
                    isVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-10 opacity-0"
                  }`}
                >
                  <h1
                    className={`${
                      currentContent.showHistoricalInfo
                        ? "text-4xl lg:text-6xl"
                        : "text-6xl lg:text-8xl"
                    } font-bold text-green-100 mb-8 leading-tight drop-shadow-2xl`}
                  >
                    {currentContent.title}
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-green-500 to-green-600 animate-pulse">
                      {currentContent.subtitle}
                    </span>
                  </h1>
                </div>

                {/* Description */}
                <div
                  className={`transition-all duration-1000 delay-400 transform ${
                    isVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-10 opacity-0"
                  }`}
                >
                  <p
                    className={`${
                      currentContent.showHistoricalInfo
                        ? "text-lg lg:text-xl"
                        : "text-2xl lg:text-3xl"
                    } text-stone-200 mb-12 leading-relaxed ${
                      !currentContent.showHistoricalInfo
                        ? "max-w-3xl mx-auto"
                        : ""
                    } font-light drop-shadow-lg`}
                  >
                    {currentContent.description}
                    {currentContent.highlight && (
                      <span className="text-green-300 font-medium">
                        {" "}
                        {currentContent.highlight}
                      </span>
                    )}{" "}
                    {!currentContent.showHistoricalInfo &&
                      " in keeping our roads safe for everyone."}
                  </p>
                </div>

                {/* CTA Buttons - only for default content */}
                {!currentContent.showHistoricalInfo && (
                  <div
                    className={`flex flex-col sm:flex-row gap-6 justify-center mb-16 transition-all duration-1000 delay-600 transform ${
                      isVisible
                        ? "translate-y-0 opacity-100"
                        : "translate-y-10 opacity-0"
                    }`}
                  >
                    <button
                      onClick={onGetStarted}
                      className="group bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:from-green-600 hover:via-green-700 hover:to-green-800 text-stone-900 px-12 py-5 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center shadow-xl shadow-green-500/30"
                    >
                      Start Reporting
                      <ArrowRight
                        className="ml-3 group-hover:translate-x-2 transition-transform duration-300"
                        size={24}
                      />
                    </button>

                    <button className="border-4 border-green-400 text-green-300 hover:bg-green-400/20 hover:text-green-200 hover:border-green-300 px-12 py-5 rounded-full font-bold text-lg transition-all duration-300 backdrop-blur-sm">
                      Learn More
                    </button>
                  </div>
                )}
              </div>

              {/* Historical Information Panel - only for historical content */}
              {currentContent.showHistoricalInfo && (
                <div
                  className={`transition-all duration-1000 delay-600 transform ${
                    isVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-10 opacity-0"
                  }`}
                >
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">
                    {/* Era Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                        <MapPin size={24} className="text-stone-900" />
                      </div>
                      <div>
                        <h3 className="text-xl lg:text-2xl font-bold text-white">
                          {currentContent.era}
                        </h3>
                        <p className="text-green-300 text-sm lg:text-base">
                          {currentContent.timeframe}
                        </p>
                      </div>
                    </div>

                    {/* Historical Details */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-green-300 mb-3">
                        Key Developments:
                      </h4>
                      <ul className="space-y-3">
                        {currentContent.details?.map((detail, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-3 text-white/90 text-sm lg:text-base"
                          >
                            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Learn More Button */}
                    <div className="mt-8">
                      <button
                        onClick={onGetStarted}
                        className="w-full bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 border-2 border-green-400/50 hover:border-green-400/70 text-green-300 hover:text-green-200 px-6 py-4 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm"
                      >
                        Explore Modern Road Reporting
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Scroll Indicator - only for default content */}
          {!currentContent.showHistoricalInfo &&
            !currentContent.showTimeline && (
              <div
                className={`text-center mt-16 transition-all duration-1000 delay-800 transform ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
              >
                <div className="flex flex-col items-center text-green-300">
                  <span className="text-sm font-medium mb-3 tracking-widest uppercase">
                    Scroll to Explore
                  </span>
                  <div className="w-px h-16 bg-gradient-to-b from-green-400 to-transparent animate-pulse"></div>
                </div>
              </div>
            )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
