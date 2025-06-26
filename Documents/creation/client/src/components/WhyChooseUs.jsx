import { motion } from "framer-motion";
import { FaGift, FaHeart, FaStar, FaLeaf } from "react-icons/fa";
import TestimonialSection from "./Testimonial";

const features = [
  {
    icon: <FaGift size={28} />,
    title: "Thoughtfully Customized",
    description:
      "Every gift is crafted with care, based on your story and needs.",
  },
  {
    icon: <FaHeart size={28} />,
    title: "Made with Love",
    description:
      "Each item is handmade or handpicked to create lasting memories.",
  },
  {
    icon: <FaStar size={28} />,
    title: "Premium Quality",
    description:
      "We use only the best materials — no compromise on look or feel.",
  },
  {
    icon: <FaLeaf size={28} />,
    title: "Eco-Conscious Packaging",
    description:
      "Packed with care using sustainable, aesthetic-friendly materials.",
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6 },
  }),
};

export default function WhyChooseUs() {
  return (
    <>
    <section className="bg-gradient-to-br from-[#fef6f9] to-[#f7faff] py-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <motion.h2
          className="text-4xl font-bold text-gray-800 mb-6"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Why Choose Us?
        </motion.h2>
        <motion.p
          className="text-gray-600 text-lg mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          We turn your feelings into beautiful, customized gifts that speak for
          you. Here's what makes us special:
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {features.map((item, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-2xl transition"
              custom={index}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="text-pink-600 mb-4">{item.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
      <motion.div
        className="mt-16 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <p className="text-gray-500 text-sm uppercase tracking-wide mb-2">
          Don’t just take our word for it
        </p>
        <h3 className="text-2xl font-bold text-gray-800">
          What Our Customers Say
        </h3>
      </motion.div>
    </section>
    <TestimonialSection />
    </>
  );
}
