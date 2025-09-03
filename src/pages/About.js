import React from 'react';

export default function About() {
  return (
    <div className="text-center max-w-4xl mx-auto py-12">
      {/* Hero Section */}
      <div className="mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-green-400 mb-6">
          About Tunegie
        </h1>
        <p className="text-lg md:text-xl text-green-200/80 max-w-3xl mx-auto">
          Discover the story behind the ultimate music guessing game that's bringing music lovers together from around the world.
        </p>
      </div>

      {/* Mission Section */}
      <section className="mb-16">
        <div className="bg-gray-900/30 rounded-xl p-8">
          <h2 className="text-3xl font-semibold text-green-400 mb-6">Our Mission</h2>
          <p className="text-green-200/80 text-lg leading-relaxed">
            At Tunegie, we believe music is a universal language that connects us all. Our mission is to create 
            an engaging platform where music enthusiasts can test their knowledge, discover new tracks, and 
            compete with friends in a fun, interactive environment.
          </p>
        </div>
      </section>

      {/* What Makes Us Special */}
      <section className="mb-16">
        <h2 className="text-3xl font-semibold text-green-400 mb-8">What Makes Us Special</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-black/50 p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-3 text-green-300">Diverse Music Library</h3>
            <p className="text-green-200/80">
              From classic hits to modern chart-toppers, our extensive library covers all genres and decades.
            </p>
          </div>

          <div className="bg-black/50 p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-3 text-green-300">Instant Play</h3>
            <p className="text-green-200/80">
              No lengthy sign-up processes. Jump straight into the action and start guessing songs immediately.
            </p>
          </div>

          <div className="bg-black/50 p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-3 text-green-300">Competitive Spirit</h3>
            <p className="text-green-200/80">
              Climb the leaderboards, challenge friends, and prove your music knowledge supremacy.
            </p>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="mb-16">
        <div className="bg-gray-900/30 rounded-xl p-8">
          <h2 className="text-3xl font-semibold text-green-400 mb-6">Built with Modern Technology</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="bg-black/50 px-4 py-2 rounded-lg text-green-300 font-medium">React</span>
            <span className="bg-black/50 px-4 py-2 rounded-lg text-green-300 font-medium">Tailwind CSS</span>
            <span className="bg-black/50 px-4 py-2 rounded-lg text-green-300 font-medium">JavaScript</span>
            <span className="bg-black/50 px-4 py-2 rounded-lg text-green-300 font-medium">Modern Web APIs</span>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-semibold text-green-400 mb-8">The Team</h2>
        <div className="bg-black/50 p-8 rounded-xl">
          <p className="text-green-200/80 text-lg leading-relaxed">
            rudis
          </p>
        </div>
      </section>

      {/* Call to Action */}
      <section>
        <div className="bg-gradient-to-r from-green-600/20 to-green-400/20 rounded-xl p-8 border border-green-500/30">
          <h2 className="text-2xl font-bold text-green-400 mb-4">Ready to Test Your Music Knowledge?</h2>
          <p className="text-green-200/80 mb-6">
            Join thousands of music lovers who are already enjoying the ultimate song guessing experience.
          </p>
          <a
            href="/game"
            className="bg-green-600 text-black px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:bg-green-500 transition inline-block"
          >
            Start Playing Now
          </a>
        </div>
      </section>
    </div>
  );
}
