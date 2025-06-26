import { motion } from "framer-motion";
import { FaInstagram, FaEnvelope, FaPhone } from "react-icons/fa";

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="bg-[#736871]  py-20 px-6"
    >
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          className="text-4xl font-bold text-gray-800 mb-4"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Get in Touch
        </motion.h2>

        <motion.p
          className="text-white text-lg mb-10 max-w-xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          We’d love to hear from you! Whether it's a question, a custom order,
          or just to say hi — feel free to reach out.
        </motion.p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
          <motion.a
            href="https://www.instagram.com/your_instagram_here"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-pink-500 text-white px-6 py-3 rounded-full flex items-center gap-2 hover:bg-pink-600 transition"
            whileHover={{ scale: 1.05 }}
          >
            <FaInstagram />
            Follow on Instagram
          </motion.a>

          <motion.div
            className="flex items-center gap-2 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <FaEnvelope />
            <span>customizegifts@example.com</span>
          </motion.div>

          <motion.div
            className="flex items-center gap-2 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <FaPhone />
            <span>+91 9876543210</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
