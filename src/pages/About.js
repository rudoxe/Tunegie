import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function About() {
  const { theme } = useTheme();
  
  return (
    <div className="text-center max-w-4xl mx-auto py-12">
      {/* Hero Section */}
      <div className="mb-16">
        <h1 className={`text-4xl md:text-5xl font-bold text-${theme.text} mb-6 animate-fade-in`}>
          About Tunegie
        </h1>
        <p className={`text-lg md:text-xl text-${theme.textMuted} max-w-3xl mx-auto animate-slide-in`}>
          Discover the story behind the ultimate music guessing game that's bringing music lovers together from around the world.
        </p>
      </div>

      {/* Mission Section */}
      <section className="mb-16">
        <div className={`rounded-xl p-8 animate-slide-in bg-${theme.cardBg} border border-${theme.accent}/20`}>
          <h2 className={`text-3xl font-semibold text-${theme.accent} mb-6`}>Our Mission</h2>
          <p className={`text-${theme.textMuted} text-lg leading-relaxed`}>
            At Tunegie, we believe music is a universal language that connects us all. Our mission is to create 
            an engaging platform where music enthusiasts can test their knowledge, discover new tracks, and 
            compete with friends in a fun, interactive environment.
          </p>
        </div>
      </section>

      {/* What Makes Us Special */}
      <section className="mb-16">
        <h2 className={`text-3xl font-semibold text-${theme.accent} mb-8`}>What Makes Us Special</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className={`bg-${theme.cardBg} p-6 rounded-xl transition-all duration-300 hover:glow-lg hover:scale-105 animate-fade-in`}>
            <h3 className={`text-xl font-bold mb-3 text-${theme.text}`}>Diverse Music Library</h3>
            <p className={`text-${theme.textMuted}`}>
              From classic hits to modern chart-toppers, our extensive library covers all genres and decades.
            </p>
          </div>

          <div className={`bg-${theme.cardBg} p-6 rounded-xl transition-all duration-300 hover:glow-lg hover:scale-105 animate-fade-in`}>
            <h3 className={`text-xl font-bold mb-3 text-${theme.text}`}>Instant Play</h3>
            <p className={`text-${theme.textMuted}`}>
              No lengthy sign-up processes. Jump straight into the action and start guessing songs immediately.
            </p>
          </div>

          <div className={`bg-${theme.cardBg} p-6 rounded-xl transition-all duration-300 hover:glow-lg hover:scale-105 animate-fade-in`}>
            <h3 className={`text-xl font-bold mb-3 text-${theme.text}`}>Competitive Spirit</h3>
            <p className={`text-${theme.textMuted}`}>
              Climb the leaderboards, challenge friends, and prove your music knowledge supremacy.
            </p>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="mb-16">
        <div className={`rounded-xl p-8 animate-slide-in bg-${theme.cardBg} border border-${theme.accent}/20`}>
          <h2 className={`text-3xl font-semibold text-${theme.accent} mb-6`}>Built with Modern Technology</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <span className={`bg-${theme.bgDark} px-4 py-2 rounded-lg text-${theme.text} font-medium transition-all duration-300 hover:scale-110 hover:glow`}>React</span>
            <span className={`bg-${theme.bgDark} px-4 py-2 rounded-lg text-${theme.text} font-medium transition-all duration-300 hover:scale-110 hover:glow`}>Tailwind CSS</span>
            <span className={`bg-${theme.bgDark} px-4 py-2 rounded-lg text-${theme.text} font-medium transition-all duration-300 hover:scale-110 hover:glow`}>JavaScript</span>
            <span className={`bg-${theme.bgDark} px-4 py-2 rounded-lg text-${theme.text} font-medium transition-all duration-300 hover:scale-110 hover:glow`}>Modern Web APIs</span>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="mb-16">
        <h2 className={`text-3xl font-semibold text-${theme.accent} mb-8`}>The Team</h2>
        <div className={`bg-${theme.cardBg} p-8 rounded-xl animate-fade-in`}>
          <p className={`text-${theme.textMuted} text-lg leading-relaxed`}>
            rudis
          </p>
        </div>
      </section>

      {/* Call to Action */}
      <section>
        <div className={`bg-gradient-to-r from-${theme.accent}/20 to-${theme.accent}/10 rounded-xl p-8 border border-${theme.accent}/30 animate-glow-pulse`}>
          <h2 className={`text-2xl font-bold text-${theme.accent} mb-4`}>Ready to Test Your Music Knowledge?</h2>
          <p className={`text-${theme.textMuted} mb-6`}>
            Join thousands of music lovers who are already enjoying the ultimate song guessing experience.
          </p>
          <Link
            to="/game"
            className={`bg-${theme.accent} text-gray-900 px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:bg-${theme.accent}/80 transition-all duration-300 hover:scale-105 hover:glow inline-block animate-float`}
          >
            Start Playing Now
          </Link>
        </div>
      </section>
    </div>
  );
}
