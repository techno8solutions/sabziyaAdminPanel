import { motion } from "framer-motion";
import { FaQuoteLeft } from "react-icons/fa";

const testimonials = [
  {
    name: "Riya Mehta",
    comment:
      "Absolutely loved the personalized hamper! It was beautiful, thoughtful, and delivered on time. Highly recommend!",
    location: "Mumbai",
  },
  {
    name: "Aman Joshi",
    comment:
      "The Spotify plaque made my girlfriend so emotional. Thank you for helping me say what words couldn’t!",
    location: "Delhi",
  },
  {
    name: "Neha Verma",
    comment:
      "Beautifully packed, amazing quality, and such sweet communication. I’ll definitely order again.",
    location: "Pune",
  },
];

export default function TestimonialSection() {
  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-pink-50 rounded-xl p-6 shadow-md"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <FaQuoteLeft className="text-pink-500 text-2xl mb-4" />
              <p className="text-gray-700 mb-4">“{testimonial.comment}”</p>
              <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
              <p className="text-sm text-gray-500">{testimonial.location}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
