import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import ApiTest from '../components/ApiTest';

export default function Home() {
  const { theme } = useTheme();
  
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <h2 className={`text-5xl md:text-6xl font-extrabold mb-6 text-${theme.text} animate-fade-in`}>
          Guess the Beat, Climb the Charts
        </h2>
        <p className={`text-lg md:text-xl text-${theme.textMuted} max-w-2xl mb-8 animate-slide-in`}>
          Welcome to <span className={`font-semibold text-${theme.text}`}>Tunegie</span> - a song guessing game. Listen to short snippets, guess the track, and see how you rank on the leaderboard.
        </p>
        <Link
          to="/game"
          className={`bg-${theme.primary} text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-lg hover:bg-${theme.primaryHover} transition-all duration-300 hover:scale-105 hover:${theme.glow} animate-fade-in`}
        >
          Start Playing
        </Link>
      </section>

      {/* Features Section */}
      <section id="features" className={`bg-${theme.surface}/30 py-20 px-6 text-center`}>
        <h3 className={`text-3xl font-semibold mb-6 text-${theme.text}`}>Features</h3>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className={`bg-${theme.surface} p-6 rounded-xl border border-${theme.surfaceBorder} transition-all duration-300 hover:scale-105 hover:${theme.glow}/30`}>
            <h4 className={`text-xl font-bold mb-2 text-${theme.text}`}>Song Snippets</h4>
            <p className={`text-${theme.textMuted}`}>Hear short previews and test your music knowledge.</p>
          </div>
          <div className={`bg-${theme.surface} p-6 rounded-xl border border-${theme.surfaceBorder} transition-all duration-300 hover:scale-105 hover:${theme.glow}/30`}>
            <h4 className={`text-xl font-bold mb-2 text-${theme.text}`}>Leaderboards</h4>
            <p className={`text-${theme.textMuted}`}>Compete with friends and climb to the top of the charts.</p>
          </div>
          <div className={`bg-${theme.surface} p-6 rounded-xl border border-${theme.surfaceBorder} transition-all duration-300 hover:scale-105 hover:${theme.glow}/30`}>
            <h4 className={`text-xl font-bold mb-2 text-${theme.text}`}>Quick Play</h4>
            <p className={`text-${theme.textMuted}`}>Jump right in - no account required, instant fun.</p>
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section id="leaderboard" className="py-20 px-6 text-center">
        <h3 className={`text-3xl font-semibold mb-6 text-${theme.text}`}>Leaderboard Preview</h3>
        <p className={`text-${theme.textMuted} mb-4`}>Track your high scores once you start playing.</p>
        <div className={`bg-${theme.surface}/30 border border-${theme.surfaceBorder} rounded-xl p-6 max-w-lg mx-auto text-${theme.textMuted} animate-pulse`}>
          Coming soon...
        </div>
      </section>

      {/* API Test Section (Development Only) */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <ApiTest />
        </div>
      </section>

      {/* About Section Preview */}
      <section id="about" className={`bg-${theme.surface}/30 py-20 px-6 text-center`}>
        <h3 className={`text-3xl font-semibold mb-6 text-${theme.text}`}>About Tunegie</h3>
        <p className={`max-w-3xl mx-auto text-${theme.textMuted} mb-6`}>
          Tunegie is a lightweight music guessing game inspired by Spotify's design. It's built with React + Tailwind CSS and made for music lovers everywhere.
        </p>
        <Link
          to="/about"
          className={`bg-${theme.primary}/20 text-${theme.text} px-6 py-3 rounded-xl font-semibold hover:bg-${theme.primary}/30 transition-all duration-200 border border-${theme.primary}/30 hover:scale-105`}
        >
          Learn More About Us
        </Link>
      </section>
    </div>
  );
}
