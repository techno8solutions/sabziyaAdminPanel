import React from "react";
import { motion } from "framer-motion";

const products = [
  {
    id: 1,
    title: "Gold Necklace",
    image:
      "https://res.cloudinary.com/dxscy1ixg/image/upload/v1749451466/pexels-leeloothefirst-6675837_ohcr0x.jpg",
    size: "row-span-2",
  },
  {
    id: 2,
    title: "Silver Earrings",
    image:
      "https://res.cloudinary.com/dxscy1ixg/image/upload/v1749449531/3_wdk9am.png",
    size: "col-span-2 row-span-2",
  },
  {
    id: 3,
    title: "Diamond Ring",
    image:
      "https://res.cloudinary.com/dxscy1ixg/image/upload/v1749451463/pexels-alleksana-6478824_wu9r5q.jpg",
    size: "row-span-1",
  },
  {
    id: 4,
    title: "Bracelet",
    image:
      "https://res.cloudinary.com/dxscy1ixg/image/upload/v1749451473/pexels-koolshooters-6087540_rerw6m.jpg",
    size: "row-span-2",
  },
  {
    id: 5,
    title: "Anklet",
    image:
      "https://res.cloudinary.com/dxscy1ixg/image/upload/v1749451465/pexels-pixabay-264771_nt6txh.jpg",
    size: "col-span-1",
  },
  {
    id: 6,
    title: "Brooch",
    image:
      "https://res.cloudinary.com/dxscy1ixg/image/upload/v1749449530/4_gqobpb.png",
    size: "col-span-2 row-span-1",
  },
];

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export default function FeaturedProducts() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-14">
      <h2 className="text-4xl font-bold text-center mb-10 text-gray-800">
        Featured Products
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            className={`relative overflow-hidden rounded-xl shadow-md ${product.size} group`}
            style={{
              backgroundImage: `url(${product.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />

            {/* Text & Button */}
            <div className="relative z-10 h-full w-full flex flex-col justify-end items-start p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <motion.h3
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="text-xl font-semibold text-white mb-4"
              >
                {product.title}
              </motion.h3>

              {/* Slide-in Button */}
              <motion.button
                initial={{ y: 40, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-white text-black font-medium px-5 py-2 rounded-full hover:bg-gray-200 transition-all shadow-md"
              >
                Explore Gift
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
