import React, { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="max-w-4xl mx-auto py-12">
      {/* Header Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-green-400 mb-6">
          Get in Touch
        </h1>
        <p className="text-lg md:text-xl text-green-200/80 max-w-2xl mx-auto">
          Have questions, suggestions, or feedback? We'd love to hear from you! 
          Reach out to the Tunegie team using any of the methods below.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-green-400 mb-6">Contact Information</h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-black font-bold text-lg">📧</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-300 mb-1">Email Us</h3>
                  <p className="text-green-200/80">hello@tunegie.com</p>
                  <p className="text-green-200/60 text-sm">We typically respond within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-black font-bold text-lg">💬</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-300 mb-1">Support</h3>
                  <p className="text-green-200/80">support@tunegie.com</p>
                  <p className="text-green-200/60 text-sm">Technical issues and bug reports</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-black font-bold text-lg">🎵</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-300 mb-1">Music Suggestions</h3>
                  <p className="text-green-200/80">music@tunegie.com</p>
                  <p className="text-green-200/60 text-sm">Song requests and playlist suggestions</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/30 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-green-400 mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-black font-bold hover:bg-green-500 transition">
                T
              </a>
              <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-green-300 hover:bg-gray-600 transition">
                📱
              </a>
              <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-green-300 hover:bg-gray-600 transition">
                🐦
              </a>
            </div>
            <p className="text-green-200/60 text-sm mt-3">
              Stay updated with the latest features and announcements
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <div className="bg-gray-900/30 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-green-400 mb-6">Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-green-300 font-medium mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-green-300 placeholder-green-200/40 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-green-300 font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-green-300 placeholder-green-200/40 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-green-300 font-medium mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-green-300 placeholder-green-200/40 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-vertical"
                  placeholder="Tell us what's on your mind..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-black px-6 py-3 rounded-lg font-bold text-lg shadow-lg hover:bg-green-500 transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-green-400 text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="bg-black/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-300 mb-2">How do I report a bug or technical issue?</h3>
            <p className="text-green-200/80">
              Send us an email at support@tunegie.com with details about the issue, including your browser, 
              device, and steps to reproduce the problem.
            </p>
          </div>

          <div className="bg-black/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-300 mb-2">Can I suggest songs to be added to the game?</h3>
            <p className="text-green-200/80">
              Absolutely! We love music suggestions. Send your recommendations to music@tunegie.com 
              and we'll consider adding them to our library.
            </p>
          </div>

          <div className="bg-black/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-300 mb-2">Is Tunegie available on mobile devices?</h3>
            <p className="text-green-200/80">
              Yes! Tunegie is fully responsive and works great on all mobile devices through your web browser. 
              A dedicated mobile app is in development.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
