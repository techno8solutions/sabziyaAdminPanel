import React from "react";

export default function InstagramPreview() {
  return (
    <section className="bg-gradient-to-br from-[#fef6f9] to-[#f7faff] py-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">From Our Instagram</h2>
        <p className="text-gray-600 text-lg mb-10">
          A glimpse of the love, craft, and joy we create – straight from our Instagram!
        </p>

        {/* 👉 Replace the `src` with your own SnapWidget or LightWidget link */}
        <div className="flex justify-center">
          <iframe
            src="https://snapwidget.com/embed/123456" // 🔁 Replace with your widget embed URL
            className="w-full md:w-[700px] h-[500px] border-none overflow-hidden"
            scrolling="no"
            allowtransparency="true"
          ></iframe>
        </div>

        <a
          href="https://instagram.com/yourusername" // 🔁 Replace with your IG profile
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-8 bg-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-700 transition"
        >
          Follow Us on Instagram →
        </a>
      </div>
    </section>
  );
}
