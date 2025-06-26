import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const offerings = [
  {
    title: "Balloon Hampers",
    image:
      "https://res.cloudinary.com/dxscy1ixg/image/upload/v1749454732/WhatsApp_Image_2025-06-08_at_7.30.15_PM_1_reusgh.jpg",
  },
  {
    title: "Customized Photo Frames",
    image:
      "https://res.cloudinary.com/dxscy1ixg/image/upload/v1749462782/1_zk3bpm.png",
  },
  {
    title: "Spotify Plaques",
    image:
      "https://res.cloudinary.com/dxscy1ixg/image/upload/v1749462786/2_zurhky.png",
  },
  {
    title: "Spotify Plaques",
    image:
      "https://res.cloudinary.com/dxscy1ixg/image/upload/v1749454732/WhatsApp_Image_2025-06-08_at_7.30.15_PM_em50pp.jpg",
  },
  {
    title: "Spotify Plaques",
    image:
      "https://res.cloudinary.com/dxscy1ixg/image/upload/v1749451465/pexels-pixabay-264771_nt6txh.jpg",
  },
  {
    title: "Spotify Plaques",
    image:
      "https://res.cloudinary.com/dxscy1ixg/image/upload/v1749454731/WhatsApp_Image_2025-06-08_at_7.30.17_PM_tgum5d.jpg",
  },
  {
    title: "Spotify Plaques",
    image:
      "https://res.cloudinary.com/dxscy1ixg/image/upload/v1749454731/WhatsApp_Image_2025-06-08_at_7.30.17_PM_tgum5d.jpg",
  },
  {
    title: "+ Many More...",
    image: "https://example.com/more.jpg",
    link: "/all-categories",
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const hoverVariants = {
  hover: {
    y: -10,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

export default function WhatWeOffer() {
  return (
    <section
      className="relative py-16 px-4 bg-cover bg-center bg-no-repeat bg-[#F2D0DD]"
    //   style={{
    //     backgroundImage:
    //       "url('https://www.transparenttextures.com/patterns/paper-fibers.png')",
    //   }}
    >
     
      <div className="absolute inset-0 bg-[#fffaf5]/70 backdrop-blur-sm"></div>

      <motion.div
        className="relative z-10 max-w-6xl mx-auto text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <motion.h2
          className="text-4xl font-bold mb-5 text-gray-800"
          variants={itemVariants}
        >
          What We Offer
        </motion.h2>
        <motion.p
          className="text-sm  mb-10 text-gray-800"
          variants={itemVariants}
        >
          Whether it's a birthday, anniversary, or just a way to say "you
          matter",<br/> we make handcrafted, customized gifts to suit every occasion.{" "}
        </motion.p>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
          variants={containerVariants}
        >
          {offerings.map((offer, index) => {
            const card = (
              <motion.div
                key={index}
                className="relative rounded-xl overflow-hidden shadow-lg group h-64"
                style={{
                  backgroundImage: `url(${offer.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                variants={itemVariants}
                whileHover="hover"
              >
                {/* <motion.div 
                  className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition duration-300"
                  variants={{
                    hover: { opacity: 0.6 }
                  }}
                ></motion.div> */}

                <motion.div
                  className="relative z-10 h-full flex flex-col justify-between p-4 text-white"
                  variants={{
                    hover: {
                      transition: { staggerChildren: 0.1 },
                    },
                  }}
                >
                  {/* <motion.h3 
                    className="text-xl font-semibold"
                    variants={{
                      hover: { 
                        y: -5,
                        transition: { duration: 0.3 }
                      }
                    }}
                  >
                    {offer.title}
                  </motion.h3> */}
                  {/* <motion.button 
                    className="self-start bg-white text-black font-medium px-4 py-2 rounded-full mt-auto hover:bg-gray-200 transition"
                    variants={{
                      hover: { 
                        scale: 1.05,
                        transition: { 
                          delay: 0.1,
                          type: "spring",
                          stiffness: 300
                        }
                      }
                    }}
                  >
                    {offer.title === "+ Many More..." ? "View All" : "Explore"}
                  </motion.button> */}
                </motion.div>
              </motion.div>
            );

            return offer.link ? (
              <Link to={offer.link} key={index}>
                <motion.div variants={hoverVariants}>{card}</motion.div>
              </Link>
            ) : (
              <motion.div variants={hoverVariants}>{card}</motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}
