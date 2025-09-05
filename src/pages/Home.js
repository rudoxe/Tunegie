import React from 'react';
import { Link } from 'react-router-dom';
import ApiTest from '../components/ApiTest';

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <h2 className="text-5xl md:text-6xl font-extrabold mb-6 text-green-400">
          Guess the Beat, Climb the Charts
        </h2>
        <p className="text-lg md:text-xl text-green-200/80 max-w-2xl mb-8">
          Welcome to <span className="font-semibold text-green-400">Tunegie</span> — a song guessing game. Listen to short snippets, guess the track, and see how you rank on the leaderboard.
        </p>
        <Link
          to="/game"
          className="bg-green-600 text-black px-8 py-4 rounded-2xl font-bold text-xl shadow-lg hover:bg-green-500 transition"
        >
          Start Playing
        </Link>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-900/30 py-20 px-6 text-center">
        <h3 className="text-3xl font-semibold mb-6">Features</h3>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-black/50 p-6 rounded-xl">
            <h4 className="text-xl font-bold mb-2">Song Snippets</h4>
            <p className="text-green-200/80">Hear short previews and test your music knowledge.</p>
          </div>
          <div className="bg-black/50 p-6 rounded-xl">
            <h4 className="text-xl font-bold mb-2">Leaderboards</h4>
            <p className="text-green-200/80">Compete with friends and climb to the top of the charts.</p>
          </div>
          <div className="bg-black/50 p-6 rounded-xl">
            <h4 className="text-xl font-bold mb-2">Quick Play</h4>
            <p className="text-green-200/80">Jump right in — no account required, instant fun.</p>
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section id="leaderboard" className="py-20 px-6 text-center">
        <h3 className="text-3xl font-semibold mb-6">Leaderboard Preview</h3>
        <p className="text-green-200/80 mb-4">Track your high scores once you start playing.</p>
        <div className="bg-gray-900/30 rounded-xl p-6 max-w-lg mx-auto text-green-200/60">
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
      <section id="about" className="bg-gray-900/30 py-20 px-6 text-center">
        <h3 className="text-3xl font-semibold mb-6">About Tunegie</h3>
        <p className="max-w-3xl mx-auto text-green-200/80 mb-6">
          Tunegie is a lightweight music guessing game inspired by Spotify's design. It's built with React + Tailwind CSS and made for music lovers everywhere.
        </p>
        <Link
          to="/about"
          className="bg-green-600/20 text-green-400 px-6 py-3 rounded-xl font-semibold hover:bg-green-600/30 transition border border-green-600/30"
        >
          Learn More About Us
        </Link>
      </section>
    </div>
  );
}
