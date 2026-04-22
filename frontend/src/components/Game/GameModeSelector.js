import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

// Artist Selector Component
const ArtistSelector = ({ onSelect }) => {
  const [selectedArtist, setSelectedArtist] = useState('');
  const [customArtist, setCustomArtist] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  
  const popularArtists = [
    'Ed Sheeran', 'Taylor Swift', 'The Weeknd', 'Billie Eilish', 'Harry Styles',
    'Dua Lipa', 'Post Malone', 'Ariana Grande', 'Drake', 'Olivia Rodrigo',
    'Travis Scott', 'Playboi Carti', 'Ken Carson', 'Lucki', 'Lil Baby',
    'Kendrick Lamar', 'J. Cole', 'Future', 'Metro Boomin', 'Tyler, The Creator',
    'Frank Ocean', 'SZA', 'The Weeknd', 'Bad Bunny', 'Doja Cat',
    'Lil Uzi Vert', '21 Savage', 'Gunna', 'Young Thug', 'Kanye West',
    'Juice WRLD', 'XXXTentacion', 'Lil Peep', 'Mac Miller', 'Kid Cudi'
  ];

  const handleSubmit = () => {
    const artist = showCustom ? customArtist : selectedArtist;
    if (artist.trim()) {
      onSelect(artist.trim());
    }
  };

  return (
    <div className="space-y-4">
      {!showCustom ? (
        <>
          <select
            value={selectedArtist}
            onChange={(e) => setSelectedArtist(e.target.value)}
            className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-green-300 focus:outline-none focus:border-green-500"
          >
            <option value="">Choose an artist...</option>
            {popularArtists.map(artist => (
              <option key={artist} value={artist}>{artist}</option>
            ))}
          </select>
          <button
            onClick={() => setShowCustom(true)}
            className="text-green-400 text-sm hover:text-green-300 transition"
          >
            Or enter custom artist
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            value={customArtist}
            onChange={(e) => setCustomArtist(e.target.value)}
            placeholder="Enter artist name..."
            className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-green-300 placeholder-green-200/40 focus:outline-none focus:border-green-500"
          />
          <button
            onClick={() => setShowCustom(false)}
            className="text-green-400 text-sm hover:text-green-300 transition"
          >
            ← Back to popular artists
          </button>
        </>
      )}
      
      <button
        onClick={handleSubmit}
        disabled={!(selectedArtist || customArtist.trim())}
        className="bg-green-600 text-black px-6 py-3 rounded-xl font-bold hover:bg-green-500 transition w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Start Artist Challenge
      </button>
    </div>
  );
};

// Genre Selector Component
const GenreSelector = ({ onSelect }) => {
  const [selectedGenre, setSelectedGenre] = useState('');
  
  const genres = [
    { id: 'pop', name: 'Pop', icon: '🎵' },
    { id: 'rock', name: 'Rock', icon: '🎸' },
    { id: 'hip-hop', name: 'Hip-Hop', icon: '🎤' },
    { id: 'r&b', name: 'R&B', icon: '🎧' },
    { id: 'electronic', name: 'Electronic', icon: '🎹' },
    { id: 'country', name: 'Country', icon: '🤠' },
    { id: 'indie', name: 'Indie', icon: '🎆' },
    { id: 'alternative', name: 'Alternative', icon: '🌋' }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {genres.map(genre => (
          <button
            key={genre.id}
            onClick={() => setSelectedGenre(genre.id)}
            className={`p-3 rounded-lg text-sm font-medium transition ${
              selectedGenre === genre.id
                ? 'bg-green-600 text-black'
                : 'bg-black/50 text-green-300 hover:bg-green-600/20'
            }`}
          >
            <div>{genre.icon}</div>
            <div>{genre.name}</div>
          </button>
        ))}
      </div>
      
      <button
        onClick={() => onSelect(selectedGenre)}
        disabled={!selectedGenre}
        className="bg-green-600 text-black px-6 py-3 rounded-xl font-bold hover:bg-green-500 transition w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Start Genre Challenge
      </button>
    </div>
  );
};

// Main GameModeSelector Component
const GameModeSelector = ({ onSelectMode }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="w-full max-w-4xl mx-auto py-6 sm:py-12">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-400 mb-4 sm:mb-6">
          Choose Your Game Mode
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-green-200/80 max-w-2xl mx-auto px-2">
          Select how you want to test your music knowledge!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Random Mode */}
        <div className="bg-gray-900/30 rounded-xl p-5 sm:p-6 text-center">
          <div className="text-4xl mb-3 sm:mb-4">🎲</div>
          <h3 className="text-xl font-bold text-green-400 mb-2 sm:mb-3">Random Mix</h3>
          <p className="text-green-200/80 mb-5 sm:mb-6 text-sm sm:text-base">
            Guess songs from a variety of popular artists and genres. Perfect for testing your overall music knowledge!
          </p>
          <button
            onClick={() => onSelectMode('random')}
            className="bg-green-600 text-black px-6 py-3 rounded-xl font-bold hover:bg-green-500 transition w-full text-sm sm:text-base"
          >
            Start Random Game
          </button>
        </div>

        {/* Artist Mode */}
        <div className="bg-gray-900/30 rounded-xl p-5 sm:p-6 text-center">
          <div className="text-4xl mb-3 sm:mb-4">🎤</div>
          <h3 className="text-xl font-bold text-green-400 mb-2 sm:mb-3">Artist Challenge</h3>
          <p className="text-green-200/80 mb-5 sm:mb-6 text-sm sm:text-base">
            Focus on songs from your favorite artist. How well do you know their discography?
          </p>
          <ArtistSelector onSelect={(artist) => onSelectMode('artist', artist)} />
        </div>

        {/* Genre Mode */}
        <div className="bg-gray-900/30 rounded-xl p-5 sm:p-6 text-center sm:col-span-2 lg:col-span-1">
          <div className="text-4xl mb-3 sm:mb-4">🎼</div>
          <h3 className="text-xl font-bold text-green-400 mb-2 sm:mb-3">Genre Expert</h3>
          <p className="text-green-200/80 mb-5 sm:mb-6 text-sm sm:text-base">
            Test your knowledge of a specific music genre. From pop to rock to hip-hop!
          </p>
          <GenreSelector onSelect={(genre) => onSelectMode('genre', genre)} />
        </div>
      </div>

      {/* Login Warning for Non-Authenticated Users */}
      {!isAuthenticated() && (
        <div className="bg-yellow-600/20 border border-yellow-500/40 rounded-xl p-4 sm:p-6 mt-6 sm:mt-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl">⚠️</div>
            <h3 className="text-yellow-300 font-bold text-base sm:text-lg">Playing as Guest</h3>
          </div>
          <div className="text-yellow-200/90 space-y-2">
            <p className="font-medium text-sm sm:text-base">Your game stats will not be saved or appear on the leaderboard.</p>
            <p className="text-xs sm:text-sm">
              <span className="font-medium">Sign in to:</span> Save your scores • Compete on leaderboards • Track your progress • View game history
            </p>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-medium text-sm transition"
            >
              Sign In Now
            </button>
            <button
              onClick={() => window.location.href = '/register'}
              className="border border-yellow-500 text-yellow-300 hover:bg-yellow-500 hover:bg-opacity-10 px-4 py-2 rounded-lg font-medium text-sm transition"
            >
              Create Account
            </button>
          </div>
        </div>
      )}

      <div className="text-center mt-6 sm:mt-8">
        <a
          href="/"
          className="text-green-400 hover:text-green-300 transition text-sm sm:text-base"
        >
          ← Back to Home
        </a>
      </div>
    </div>
  );
};

export default GameModeSelector;

