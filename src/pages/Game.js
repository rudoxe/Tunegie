import React, { useState, useEffect } from 'react';
import tidalApiService from '../services/tidalApi';
import TrackPlayer from '../components/TrackPlayer';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';

export default function Game() {
  const { startGame, addRound, endGame, calculatePoints } = useGame();
  const { isAuthenticated } = useAuth();
  const [gameState, setGameState] = useState('loading'); // selectMode, loading, ready, playing, finished, error
  const [currentTrack, setCurrentTrack] = useState(null);
  const [gameData, setGameData] = useState({
    tracks: [],
    currentIndex: 0,
    score: 0,
    totalQuestions: 10,
    answers: [],
    gameMode: null, // 'random', 'artist', 'genre'
    selectedArtist: null,
    selectedGenre: null
  });
  const [userGuess, setUserGuess] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cheatMode, setCheatMode] = useState(false);

  // Initialize game - start with mode selection
  useEffect(() => {
    setGameState('selectMode');
  }, []);

  const initializeGame = async (gameMode, selectedOption = null) => {
    setGameState('loading');
    setErrorMessage('');

    try {
      console.log(`🎮 Initializing Tunegie Game (${gameMode} mode)...`);
      
      // Test TIDAL API connection
      const connected = await tidalApiService.testConnection();
      setApiConnected(connected);

      if (!connected) {
        throw new Error('Unable to connect to TIDAL API. Please check your credentials.');
      }

      // Load tracks based on game mode
      let tracks = [];
      console.log(`🎵 Loading ${gameMode} tracks...`);
      
      if (gameMode === 'artist' && selectedOption) {
        tracks = await tidalApiService.getTracksByArtist(selectedOption, gameData.totalQuestions);
        console.log(`🎤 Loaded tracks for artist: ${selectedOption}`);
      } else if (gameMode === 'genre' && selectedOption) {
        tracks = await tidalApiService.getTracksByGenre(selectedOption, gameData.totalQuestions);
        console.log(`🎼 Loaded tracks for genre: ${selectedOption}`);
      } else {
        tracks = await tidalApiService.getRandomTracksForGame(gameData.totalQuestions);
        console.log('🎲 Loaded random tracks');
      }
      
      if (tracks.length === 0) {
        throw new Error(`No tracks available for ${gameMode} mode. Please try a different option.`);
      }

      console.log(`✅ Loaded ${tracks.length} tracks for the game`);
      
      setGameData(prev => ({
        ...prev,
        tracks: tracks,
        currentIndex: 0,
        score: 0,
        answers: [],
        gameMode: gameMode,
        selectedArtist: gameMode === 'artist' ? selectedOption : null,
        selectedGenre: gameMode === 'genre' ? selectedOption : null
      }));

      setCurrentTrack(tracks[0]);
      setGameState('ready');

    } catch (error) {
      console.error('❌ Game initialization failed:', error);
      setErrorMessage(error.message);
      setGameState('error');
    }
  };

  const startGameSession = () => {
    setGameState('playing');
    setShowAnswer(false);
    setUserGuess('');
    
    // Start game session in GameContext
    const gameMode = gameData.gameMode || 'random';
    startGame(gameMode);
  };

  const submitGuess = () => {
    if (!userGuess.trim()) return;

    const correctAnswer = `${currentTrack.title} - ${currentTrack.artists[0].name}`;
    const guessLower = userGuess.toLowerCase().trim();
    const titleLower = currentTrack.title.toLowerCase();
    const artistLower = currentTrack.artists[0].name.toLowerCase();

    // Check if guess contains both title and artist or just title
    const titleMatch = titleLower.includes(guessLower) || guessLower.includes(titleLower);
    const artistMatch = artistLower.includes(guessLower) || guessLower.includes(artistLower);
    const correct = titleMatch || artistMatch;

    setIsCorrect(correct);
    setShowAnswer(true);

    // Calculate time taken (for now use a random value, in real game you'd track actual time)
    const timeTaken = Math.floor(Math.random() * 20) + 5; // 5-25 seconds
    const pointsEarned = calculatePoints(correct, timeTaken);

    // Add round to GameContext
    addRound({
      track: {
        id: currentTrack.id || currentTrack.title,
        title: currentTrack.title,
        artists: currentTrack.artists,
        album: currentTrack.album
      },
      userGuess,
      correctAnswer,
      isCorrect: correct,
      timeTaken,
      pointsEarned
    });

    // Update local game state
    const newAnswer = {
      track: currentTrack,
      guess: userGuess,
      correct: correct,
      correctAnswer: correctAnswer
    };

    setGameData(prev => ({
      ...prev,
      score: correct ? prev.score + pointsEarned : prev.score,
      answers: [...prev.answers, newAnswer]
    }));
  };

  const nextQuestion = async () => {
    const nextIndex = gameData.currentIndex + 1;
    
    if (nextIndex >= gameData.tracks.length) {
      // Game is finished, end the game session and save score
      if (isAuthenticated()) {
        try {
          const result = await endGame();
          console.log('Game ended and score saved:', result);
        } catch (error) {
          console.error('Failed to save game score:', error);
        }
      }
      setGameState('finished');
      return;
    }

    setGameData(prev => ({
      ...prev,
      currentIndex: nextIndex
    }));
    setCurrentTrack(gameData.tracks[nextIndex]);
    setUserGuess('');
    setShowAnswer(false);
    setCheatMode(false); // Auto-disable cheat mode on next question
  };

  const restartGame = () => {
    setGameState('selectMode');
  };

  const toggleCheatMode = () => {
    setCheatMode(prev => !prev);
  };

  const selectGameMode = (mode, option = null) => {
    initializeGame(mode, option);
  };

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

  const renderModeSelection = () => (
    <div className="max-w-4xl mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-green-400 mb-6">
          Choose Your Game Mode
        </h1>
        <p className="text-lg md:text-xl text-green-200/80 max-w-2xl mx-auto">
          Select how you want to test your music knowledge!
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Random Mode */}
        <div className="bg-gray-900/30 rounded-xl p-6 text-center">
          <div className="text-4xl mb-4">🎲</div>
          <h3 className="text-xl font-bold text-green-400 mb-3">Random Mix</h3>
          <p className="text-green-200/80 mb-6">
            Guess songs from a variety of popular artists and genres. Perfect for testing your overall music knowledge!
          </p>
          <button
            onClick={() => selectGameMode('random')}
            className="bg-green-600 text-black px-6 py-3 rounded-xl font-bold hover:bg-green-500 transition w-full"
          >
            Start Random Game
          </button>
        </div>

        {/* Artist Mode */}
        <div className="bg-gray-900/30 rounded-xl p-6 text-center">
          <div className="text-4xl mb-4">🎤</div>
          <h3 className="text-xl font-bold text-green-400 mb-3">Artist Challenge</h3>
          <p className="text-green-200/80 mb-6">
            Focus on songs from your favorite artist. How well do you know their discography?
          </p>
          <ArtistSelector onSelect={(artist) => selectGameMode('artist', artist)} />
        </div>

        {/* Genre Mode */}
        <div className="bg-gray-900/30 rounded-xl p-6 text-center">
          <div className="text-4xl mb-4">🎼</div>
          <h3 className="text-xl font-bold text-green-400 mb-3">Genre Expert</h3>
          <p className="text-green-200/80 mb-6">
            Test your knowledge of a specific music genre. From pop to rock to hip-hop!
          </p>
          <GenreSelector onSelect={(genre) => selectGameMode('genre', genre)} />
        </div>
      </div>

      <div className="text-center mt-8">
        <a
          href="/"
          className="text-green-400 hover:text-green-300 transition"
        >
          ← Back to Home
        </a>
      </div>
    </div>
  );

  const renderLoadingScreen = () => (
    <div className="text-center py-20">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mb-6"></div>
      <h2 className="text-2xl font-semibold text-green-400 mb-4">Loading Tunegie...</h2>
      <p className="text-green-200/80">
        Connecting to TIDAL API and preparing your music challenge...
      </p>
    </div>
  );

  const renderErrorScreen = () => (
    <div className="text-center py-20 max-w-2xl mx-auto">
      <div className="text-6xl mb-6">❌</div>
      <h2 className="text-3xl font-bold text-red-400 mb-4">Connection Error</h2>
      <p className="text-green-200/80 mb-6">{errorMessage}</p>
      <div className="bg-gray-900/30 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-green-400 mb-3">Troubleshooting:</h3>
        <ul className="text-left text-green-200/80 space-y-2">
          <li>• Check your internet connection</li>
          <li>• Verify TIDAL API credentials are correct</li>
          <li>• Make sure your TIDAL app is approved for production</li>
          <li>• Check browser console for detailed error messages</li>
        </ul>
      </div>
      <button
        onClick={() => setGameState('selectMode')}
        className="bg-green-600 text-black px-6 py-3 rounded-xl font-bold hover:bg-green-500 transition"
      >
        Try Again
      </button>
    </div>
  );

  const renderReadyScreen = () => {
    const getModeInfo = () => {
      if (gameData.gameMode === 'artist') {
        return { icon: '🎤', title: `${gameData.selectedArtist} Challenge`, desc: `Test your knowledge of ${gameData.selectedArtist}'s songs!` };
      } else if (gameData.gameMode === 'genre') {
        return { icon: '🎼', title: `${gameData.selectedGenre.charAt(0).toUpperCase() + gameData.selectedGenre.slice(1)} Challenge`, desc: `How well do you know ${gameData.selectedGenre} music?` };
      } else {
        return { icon: '🎵', title: 'Random Mix Challenge', desc: 'Test your overall music knowledge!' };
      }
    };

    const modeInfo = getModeInfo();

    return (
      <div className="text-center py-20 max-w-2xl mx-auto">
        <div className="text-6xl mb-6">{modeInfo.icon}</div>
        <h2 className="text-4xl font-bold text-green-400 mb-6">Ready to Play!</h2>
        <h3 className="text-2xl font-semibold text-green-300 mb-4">{modeInfo.title}</h3>
        <p className="text-lg text-green-200/80 mb-8">
          {modeInfo.desc} We've loaded {gameData.tracks.length} tracks for your guessing challenge.
        </p>
        
        <div className="bg-gray-900/30 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-green-400 mb-4">How to Play:</h3>
          <div className="space-y-3 text-green-200/80">
            <p>🎧 Listen to 5-second audio snippets</p>
            <p>🎯 Guess the song title or artist name</p>
            <p>⏱️ No time limit - replay snippets anytime!</p>
            <p>🏆 Score points for each correct guess</p>
            <p>📈 See your final score at the end</p>
          </div>
        </div>

        <button
          onClick={startGameSession}
          className="bg-green-600 text-black px-8 py-4 rounded-2xl font-bold text-xl shadow-lg hover:bg-green-500 transition"
        >
          Start Playing
        </button>
      </div>
    );
  };

  const renderGameScreen = () => (
    <div className="max-w-3xl mx-auto py-12">
      {/* Game Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="text-green-400 font-semibold">
          Question {gameData.currentIndex + 1} of {gameData.totalQuestions}
        </div>
        <div className="text-green-400 font-semibold">
          Score: {gameData.score}/{gameData.currentIndex + (showAnswer ? 1 : 0)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-700 rounded-full h-2 mb-8">
        <div 
          className="bg-green-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((gameData.currentIndex) / gameData.totalQuestions) * 100}%` }}
        ></div>
      </div>

      {/* Cheat Mode Toggle */}
      <div className="flex justify-center mb-6">
        <button
          onClick={toggleCheatMode}
          className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
            cheatMode 
              ? 'bg-yellow-600 hover:bg-yellow-500 text-black' 
              : 'bg-gray-600 hover:bg-gray-500 text-white'
          }`}
          title={cheatMode ? 'Disable cheat mode' : 'Enable cheat mode to see the answer'}
        >
          {cheatMode ? '👁️ Cheat Mode ON' : '👁️‍🗨️ Cheat Mode OFF'}
        </button>
      </div>

      {/* Cheat Mode Answer Display */}
      {cheatMode && !showAnswer && currentTrack && (
        <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-xl p-4 mb-6 text-center">
          <div className="text-2xl mb-2">🕵️‍♂️</div>
          <h4 className="text-yellow-400 font-bold text-lg mb-2">Cheat Mode Active!</h4>
          <p className="text-yellow-300 font-semibold text-xl">
            {currentTrack.title} - {currentTrack.artists[0].name}
          </p>
          <p className="text-yellow-200/80 text-sm mt-2">
            This will automatically turn off when you go to the next question.
          </p>
        </div>
      )}

      {/* Track Information */}
      {currentTrack && (
        <div className="bg-gray-900/30 rounded-xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-green-400 mb-6 text-center">
            Guess This Track!
          </h3>
          
          <div className="space-y-4">
            {/* Audio Player - Most Important */}
            <TrackPlayer 
              track={currentTrack} 
              onSnippetEnd={() => console.log('Snippet finished playing')}
            />
            
            {/* Track Info Grid */}
            <div className="grid md:grid-cols-2 gap-4 text-center">
              <div className="bg-black/50 rounded-lg p-4">
                <p className="text-green-200/60 text-sm mb-1">Full Song Duration</p>
                <p className="text-green-300 font-semibold">
                  {Math.floor(currentTrack.duration / 60)}:{(currentTrack.duration % 60).toString().padStart(2, '0')}
                </p>
              </div>

              <div className="bg-black/50 rounded-lg p-4">
                <p className="text-green-200/60 text-sm mb-1">Release Year</p>
                <p className="text-green-300 font-semibold">
                  {currentTrack.album?.releaseDate ? new Date(currentTrack.album.releaseDate).getFullYear() : 'Unknown'}
                </p>
              </div>
            </div>
            
            {/* Additional Album Info */}
            <div className="text-center mt-4">
              <div className="bg-black/30 rounded-lg p-3 inline-block">
                <p className="text-green-200/60 text-xs mb-1">💿 Album Information</p>
                <p className="text-green-400 text-sm font-semibold">
                  From: {(() => {
                    const albumTitle = currentTrack.album?.title || 'Unknown Album';
                    const trackTitle = currentTrack.title;
                    
                    // Enhanced single detection - same logic as in result section
                    const isSingle = 
                      albumTitle.toLowerCase().includes('single') ||
                      albumTitle.toLowerCase() === trackTitle.toLowerCase() ||
                      albumTitle.toLowerCase().includes(' - single') ||
                      albumTitle.toLowerCase().includes('(single)') ||
                      albumTitle.toLowerCase().includes('- ep') ||
                      albumTitle.toLowerCase().includes('(ep)') ||
                      // Check if album title contains the track title (likely a single)
                      albumTitle.toLowerCase().includes(trackTitle.toLowerCase()) ||
                      // Check if track title contains album title (reverse case)
                      trackTitle.toLowerCase().includes(albumTitle.toLowerCase()) ||
                      // Common single indicators
                      albumTitle.toLowerCase().includes('remix') ||
                      albumTitle.toLowerCase().includes('feat.') ||
                      albumTitle.toLowerCase().includes('featuring') ||
                      // If album has very few tracks, likely a single/EP
                      albumTitle.split(' ').length <= 3;
                    
                    return isSingle ? 'Single Release' : albumTitle;
                  })()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Answer Section */}
      {!showAnswer ? (
        <div className="bg-gray-900/30 rounded-xl p-8">
          <label className="block text-green-300 font-semibold mb-4 text-center">
            Enter your guess (song title or artist name):
          </label>
          <div className="flex gap-4">
            <input
              type="text"
              value={userGuess}
              onChange={(e) => setUserGuess(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && submitGuess()}
              placeholder="Type your guess here..."
              className="flex-1 px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-green-300 placeholder-green-200/40 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
            <button
              onClick={submitGuess}
              disabled={!userGuess.trim()}
              className="bg-green-600 text-black px-6 py-3 rounded-lg font-bold hover:bg-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Result */}
          <div className={`rounded-xl p-6 text-center ${isCorrect ? 'bg-green-600/20 border border-green-500/30' : 'bg-red-600/20 border border-red-500/30'}`}>
            <div className="text-4xl mb-3">{isCorrect ? '🎉' : '❌'}</div>
            <h3 className={`text-2xl font-bold mb-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {isCorrect ? 'Correct!' : 'Not quite...'}
            </h3>
            <p className="text-green-200/80 mb-4">
              Your guess: <span className="font-semibold">\"{userGuess}\"</span>
            </p>
            <p className="text-green-300 font-semibold mb-6">
              Correct answer: {currentTrack.title} - {currentTrack.artists[0].name}
            </p>
            
            {/* Album Cover and Info */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {currentTrack.artworkUrl ? (
                  <img 
                    src={currentTrack.artworkUrl.replace('100x100', '300x300')} // Get higher resolution
                    alt={`${currentTrack.album?.title} album cover`}
                    className="w-48 h-48 rounded-xl shadow-lg border-2 border-green-500/30 object-cover"
                    onError={(e) => {
                      // Fallback to original size if higher resolution fails
                      e.target.src = currentTrack.artworkUrl;
                    }}
                  />
                ) : (
                  // Fallback when no artwork is available
                  <div className="w-48 h-48 rounded-xl shadow-lg border-2 border-green-500/30 bg-gradient-to-br from-green-600/30 to-green-800/30 flex items-center justify-center">
                    <div className="text-center text-green-300">
                      <div className="text-6xl mb-2">🎵</div>
                      <p className="text-sm font-semibold">{currentTrack.album?.title || 'Album'}</p>
                    </div>
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                  💿
                </div>
              </div>
              
              <div className="bg-black/30 rounded-lg p-4 max-w-md">
                {(() => {
                  const albumTitle = currentTrack.album?.title || 'Unknown Album';
                  const trackTitle = currentTrack.title;
                  
                  // Enhanced single detection
                  const isSingle = 
                    albumTitle.toLowerCase().includes('single') ||
                    albumTitle.toLowerCase() === trackTitle.toLowerCase() ||
                    albumTitle.toLowerCase().includes(' - single') ||
                    albumTitle.toLowerCase().includes('(single)') ||
                    albumTitle.toLowerCase().includes('- ep') ||
                    albumTitle.toLowerCase().includes('(ep)') ||
                    // Check if album title contains the track title (likely a single)
                    albumTitle.toLowerCase().includes(trackTitle.toLowerCase()) ||
                    // Check if track title contains album title (reverse case)
                    trackTitle.toLowerCase().includes(albumTitle.toLowerCase()) ||
                    // Common single indicators
                    albumTitle.toLowerCase().includes('remix') ||
                    albumTitle.toLowerCase().includes('feat.') ||
                    albumTitle.toLowerCase().includes('featuring') ||
                    // If album has very few tracks, likely a single/EP
                    albumTitle.split(' ').length <= 3;
                  
                  return (
                    <>
                      <p className="text-green-200/60 text-sm mb-1">
                        Release
                      </p>
                      <p className="text-green-300 font-semibold text-lg">
                        {isSingle ? 'Single Release' : albumTitle}
                      </p>
                      {currentTrack.album?.releaseDate && (
                        <p className="text-green-200/80 text-sm mt-1">
                          Released: {new Date(currentTrack.album.releaseDate).getFullYear()}
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Next Button */}
          <div className="text-center">
            <button
              onClick={nextQuestion}
              className="bg-green-600 text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-500 transition"
            >
              {gameData.currentIndex + 1 >= gameData.totalQuestions ? 'Finish Game' : 'Next Question'}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderFinishedScreen = () => (
    <div className="text-center py-20 max-w-2xl mx-auto">
      <div className="text-6xl mb-6">🏆</div>
      <h2 className="text-4xl font-bold text-green-400 mb-6">Game Complete!</h2>
      <p className="text-2xl text-green-300 mb-8">
        Final Score: {gameData.score} out of {gameData.totalQuestions}
      </p>
      
      <div className="bg-gray-900/30 rounded-xl p-6 mb-8">
        <h3 className="text-xl font-semibold text-green-400 mb-4">Your Performance:</h3>
        <div className="text-green-200/80">
          <p>Accuracy: {Math.round((gameData.score / gameData.totalQuestions) * 100)}%</p>
          <p className="mt-2">
            {gameData.score === gameData.totalQuestions ? '🎊 Perfect score! You\'re a music master!' :
             gameData.score >= gameData.totalQuestions * 0.8 ? '🎉 Excellent! You know your music!' :
             gameData.score >= gameData.totalQuestions * 0.6 ? '👍 Good job! Keep practicing!' :
             '🎵 Nice try! Music discovery awaits!'}
          </p>
          {isAuthenticated() && (
            <div className="mt-4 p-3 bg-green-600/20 border border-green-500/30 rounded-lg">
              <p className="text-green-300 text-sm">
                ✅ Your score has been saved to the leaderboard!
              </p>
              <div className="mt-2">
                <a href="/leaderboard" className="text-green-400 hover:text-green-300 text-sm">
                  View Leaderboard →
                </a>
                <span className="mx-2 text-green-200/40">•</span>
                <a href="/history" className="text-green-400 hover:text-green-300 text-sm">
                  View Your History →
                </a>
              </div>
            </div>
          )}
          {!isAuthenticated() && (
            <div className="mt-4 p-3 bg-yellow-600/20 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-300 text-sm">
                💡 Sign in to save your scores and compete on the leaderboard!
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <button
          onClick={restartGame}
          className="bg-green-600 text-black px-6 py-3 rounded-xl font-bold hover:bg-green-500 transition"
        >
          Play Again
        </button>
        <a
          href="/"
          className="bg-gray-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-500 transition"
        >
          Back to Home
        </a>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen py-8">
      {gameState === 'selectMode' && renderModeSelection()}
      {gameState === 'loading' && renderLoadingScreen()}
      {gameState === 'error' && renderErrorScreen()}
      {gameState === 'ready' && renderReadyScreen()}
      {gameState === 'playing' && renderGameScreen()}
      {gameState === 'finished' && renderFinishedScreen()}
    </div>
  );
}
