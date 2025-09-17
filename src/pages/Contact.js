import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function Contact() {
  const { theme } = useTheme();
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
      <div className="text-center mb-16 animate-fade-in">
        <h1 className={`text-4xl md:text-5xl font-bold text-${theme.accent} mb-6`}>
          Get in Touch
        </h1>
        <p className={`text-lg md:text-xl text-${theme.textMuted} max-w-2xl mx-auto`}>
          Have questions, suggestions, or feedback? We'd love to hear from you! 
          Reach out to the Tunegie team using any of the methods below.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div className="space-y-8 animate-slide-in">
          <div>
            <h2 className={`text-2xl font-bold text-${theme.accent} mb-6`}>Contact Information</h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 bg-${theme.accent} rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:scale-110 hover:glow`}>
                  <span className="text-gray-900 font-bold text-lg">@</span>
                </div>
                <div>
                  <h3 className={`text-lg font-semibold text-${theme.text} mb-1`}>Email Us</h3>
                  <p className={`text-${theme.accent}`}>hello@tunegie.com</p>
                  <p className={`text-${theme.textMuted} text-sm`}>We typically respond within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 bg-${theme.accent} rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:scale-110 hover:glow`}>
                  <span className="text-gray-900 font-bold text-lg">?</span>
                </div>
                <div>
                  <h3 className={`text-lg font-semibold text-${theme.text} mb-1`}>Support</h3>
                  <p className={`text-${theme.accent}`}>support@tunegie.com</p>
                  <p className={`text-${theme.textMuted} text-sm`}>Technical issues and bug reports</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 bg-${theme.accent} rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:scale-110 hover:glow`}>
                  <span className="text-gray-900 font-bold text-lg">♪</span>
                </div>
                <div>
                  <h3 className={`text-lg font-semibold text-${theme.text} mb-1`}>Music Suggestions</h3>
                  <p className={`text-${theme.accent}`}>music@tunegie.com</p>
                  <p className={`text-${theme.textMuted} text-sm`}>Song requests and playlist suggestions</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`bg-${theme.cardBg} rounded-xl p-6 border border-${theme.accent}/20 transition-all duration-300 hover:glow`}>
            <h3 className={`text-xl font-semibold text-${theme.accent} mb-4`}>Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className={`w-10 h-10 bg-${theme.accent} rounded-full flex items-center justify-center text-gray-900 font-bold hover:bg-${theme.accent}/80 transition-all duration-300 hover:scale-110 hover:glow`}>
                T
              </a>
              <a href="#" className={`w-10 h-10 bg-${theme.bgDark} rounded-full flex items-center justify-center text-${theme.text} hover:bg-${theme.accent}/20 transition-all duration-300 hover:scale-110`}>
                S
              </a>
              <a href="#" className={`w-10 h-10 bg-${theme.bgDark} rounded-full flex items-center justify-center text-${theme.text} hover:bg-${theme.accent}/20 transition-all duration-300 hover:scale-110`}>
                X
              </a>
            </div>
            <p className={`text-${theme.textMuted} text-sm mt-3`}>
              Stay updated with the latest features and announcements
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="animate-slide-in">
          <div className={`bg-${theme.cardBg} rounded-xl p-8 border border-${theme.accent}/20 transition-all duration-300 hover:glow`}>
            <h2 className={`text-2xl font-bold text-${theme.accent} mb-6`}>Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className={`block text-${theme.text} font-medium mb-2`}>
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 bg-${theme.bgDark} border border-${theme.accent}/30 rounded-lg text-${theme.text} placeholder-${theme.textMuted} focus:outline-none focus:border-${theme.accent} focus:ring-1 focus:ring-${theme.accent} transition-all duration-300`}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className={`block text-${theme.text} font-medium mb-2`}>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 bg-${theme.bgDark} border border-${theme.accent}/30 rounded-lg text-${theme.text} placeholder-${theme.textMuted} focus:outline-none focus:border-${theme.accent} focus:ring-1 focus:ring-${theme.accent} transition-all duration-300`}
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="message" className={`block text-${theme.text} font-medium mb-2`}>
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className={`w-full px-4 py-3 bg-${theme.bgDark} border border-${theme.accent}/30 rounded-lg text-${theme.text} placeholder-${theme.textMuted} focus:outline-none focus:border-${theme.accent} focus:ring-1 focus:ring-${theme.accent} resize-vertical transition-all duration-300`}
                  placeholder="Tell us what's on your mind..."
                />
              </div>

              <button
                type="submit"
                className={`w-full bg-${theme.accent} text-gray-900 px-6 py-3 rounded-lg font-bold text-lg shadow-lg hover:bg-${theme.accent}/80 transition-all duration-300 hover:scale-105 hover:glow animate-float`}
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16 animate-fade-in">
        <h2 className={`text-3xl font-bold text-${theme.accent} text-center mb-8`}>Frequently Asked Questions</h2>
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className={`bg-${theme.cardBg} rounded-lg p-6 transition-all duration-300 hover:scale-105 hover:glow border border-${theme.accent}/20`}>
            <h3 className={`text-lg font-semibold text-${theme.text} mb-2`}>How do I report a bug or technical issue?</h3>
            <p className={`text-${theme.textMuted}`}>
              Send us an email at support@tunegie.com with details about the issue, including your browser, 
              device, and steps to reproduce the problem.
            </p>
          </div>

          <div className={`bg-${theme.cardBg} rounded-lg p-6 transition-all duration-300 hover:scale-105 hover:glow border border-${theme.accent}/20`}>
            <h3 className={`text-lg font-semibold text-${theme.text} mb-2`}>Can I suggest songs to be added to the game?</h3>
            <p className={`text-${theme.textMuted}`}>
              Absolutely! We love music suggestions. Send your recommendations to music@tunegie.com 
              and we'll consider adding them to our library.
            </p>
          </div>

          <div className={`bg-${theme.cardBg} rounded-lg p-6 transition-all duration-300 hover:scale-105 hover:glow border border-${theme.accent}/20`}>
            <h3 className={`text-lg font-semibold text-${theme.text} mb-2`}>Is Tunegie available on mobile devices?</h3>
            <p className={`text-${theme.textMuted}`}>
              Yes! Tunegie is fully responsive and works great on all mobile devices through your web browser. 
              A dedicated mobile app is in development.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
