import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const heroContent = [
  {
    image:
      "https://res.cloudinary.com/dxscy1ixg/image/upload/v1749451473/pexels-ozge-k-2150194444-31038771_natxdg.jpg",
    title: "Gifts That Speak Your Heart",
    subtitle: "Custom-Made Surprises for Every Special Moment",
    cta: "Explore Our Portfolio",
    // features: [
    //   "✓ Custom Steel Solutions",
    //   "✓ Precision Engineering",
    //   "✓ 10+ Years Experience"
    // ]
  },
  {
    image:
      "https://res.cloudinary.com/dxscy1ixg/image/upload/v1749451465/pexels-pixabay-264771_nt6txh.jpg",
    title: "Made Just for You",
    subtitle: "Thoughtfully Personalized • Beautifully Delivered",
    cta: "View Our Projects",
    // features: [
    //   "✓ Architectural Metalwork",
    //   "✓ Structural Integrity",
    //   "✓ Sustainable Materials"
    // ]
  },
  {
    image:
      "https://res.cloudinary.com/dxscy1ixg/image/upload/v1749451455/pexels-murugan-ettiyan-2283025-5402562_pcww2x.jpg",
    title: "Where Memories Become Gifts",
    subtitle: "Crafted With Care • Wrapped With Emotion",
    cta: "Get a Free Quote",
    // features: [
    //   "✓ Security Integration",
    //   "✓ On-Time Delivery",
    //   "✓ Quality Assurance"
    // ]
  },
  {
    image:
      "https://res.cloudinary.com/dxscy1ixg/image/upload/v1749451455/pexels-tamanna-rumee-52377920-7985010_womqf8.jpg",
    title: "Gifts as Unique as Your Love",
    subtitle: "From Birthdays to Weddings, We Personalize It All",
    cta: "Get a Free Quote",
    // features: [
    //   "✓ Security Integration",
    //   "✓ On-Time Delivery",
    //   "✓ Quality Assurance"
    // ]
  },
];

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % heroContent.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentContent = heroContent[currentIndex];

  // Enhanced animation variants
  const textVariants = {
    enter: (dir) => ({
      y: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.2, 0.65, 0.3, 0.9],
      },
    },
    exit: (dir) => ({
      y: dir > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.8,
        ease: [0.2, 0.65, 0.3, 0.9],
      },
    }),
  };

  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1 + 0.5,
        duration: 0.6,
      },
    }),
  };

  const bgVariants = {
    enter: { opacity: 0 },
    center: {
      opacity: 1,
      transition: { duration: 1.2, ease: "easeInOut" },
    },
    exit: {
      opacity: 0,
      transition: { duration: 1.2, ease: "easeInOut" },
    },
  };

  return (
    <section
      className="relative h-screen min-h-[90vh] overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background images with enhanced transition */}
      <AnimatePresence custom={direction} initial={false}>
        <motion.div
          key={currentIndex}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${currentContent.image})`,
            backgroundPosition: "center center",
          }}
          variants={bgVariants}
          initial="enter"
          animate="center"
          exit="exit"
        />
      </AnimatePresence>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/70 z-0"></div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center flex-col text-center text-white px-4">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={`text-${currentIndex}`}
            custom={direction}
            variants={textVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="max-w-4xl mx-auto px-4"
          >
            <motion.h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              {currentContent.title}
            </motion.h1>
            <motion.p className="text-xl md:text-2xl mb-8 font-light">
              {currentContent.subtitle}
            </motion.p>

            {/* Feature list */}
            {/* <motion.div className="mb-8 flex flex-col items-center">
              {currentContent.features.map((feature, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={featureVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-lg md:text-xl mb-2 flex items-center"
                >
                  <span className="mr-2 text-yellow-400">{feature.split('✓')[0]}</span>
                  {feature.split('✓')[1]}
                </motion.div>
              ))}
            </motion.div> */}

            {/* <motion.a
              href="#contact"
              className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-300 shadow-lg"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 5px 15px rgba(255, 214, 0, 0.4)"
              }}
              whileTap={{ scale: 0.98 }}
            >
              {currentContent.cta}
            </motion.a> */}
          </motion.div>
        </AnimatePresence>

        {/* Navigation dots with improved interaction */}
        <div className="absolute bottom-12 flex space-x-3 z-20">
          {heroContent.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`w-4 h-4 rounded-full transition-colors ${
                index === currentIndex
                  ? "bg-yellow-500"
                  : "bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              animate={{
                width: index === currentIndex ? 24 : 16,
              }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          ))}
        </div>

        {/* Scroll indicator */}
        {/* <motion.div 
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div> */}
      </div>
    </section>
  );
};

export default Hero;
