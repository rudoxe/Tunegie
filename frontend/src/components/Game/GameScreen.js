import React from 'react';
import TrackPlayer from '../TrackPlayer';

const GameScreen = ({
  gameData,
  currentTrack,
  difficulty,
  userGuess,
  setUserGuess,
  showAnswer,
  isCorrect,
  cheatMode,
  onToggleCheatMode,
  onSubmitGuess,
  onNextQuestion
}) => {
  const renderAnswer = () => (
    <div className="space-y-6">
      {/* Result */}
      <div className={`rounded-xl p-6 text-center ${
        isCorrect 
          ? 'bg-green-600 bg-opacity-20 border border-green-500 border-opacity-30' 
          : 'bg-red-600 bg-opacity-20 border border-red-500 border-opacity-30'
      }`}>
        <div className="text-4xl mb-3">{isCorrect ? '🎉' : '❌'}</div>
        <h3 className={`text-2xl font-bold mb-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
          {isCorrect ? 'Correct!' : 'Not quite...'}
        </h3>
        <p className="text-green-200 text-opacity-80 mb-4">
          Your guess: <span className="font-semibold">"{userGuess}"</span>
        </p>
        <p className="text-green-300 font-semibold mb-6">
          Correct answer: {currentTrack.title} - {currentTrack.artists[0].name}
        </p>
        
        {/* Album Cover and Info */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            {currentTrack.artworkUrl ? (
              <img 
                src={currentTrack.artworkUrl.replace('100x100', '300x300')}
                alt={`${currentTrack.album?.title} album cover`}
                className="w-48 h-48 rounded-xl shadow-lg border-2 border-green-500 border-opacity-30 object-cover"
                onError={(e) => {
                  e.target.src = currentTrack.artworkUrl;
                }}
              />
            ) : (
              <div className="w-48 h-48 rounded-xl shadow-lg border-2 border-green-500 border-opacity-30 bg-gradient-to-br from-green-600 from-opacity-30 to-green-800 to-opacity-30 flex items-center justify-center">
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
          
          <div className="bg-black bg-opacity-30 rounded-lg p-4 max-w-md">
            {(() => {
              const albumTitle = currentTrack.album?.title || 'Unknown Album';
              const trackTitle = currentTrack.title;
              
              const isSingle = 
                albumTitle.toLowerCase().includes('single') ||
                albumTitle.toLowerCase() === trackTitle.toLowerCase() ||
                albumTitle.toLowerCase().includes(' - single') ||
                albumTitle.toLowerCase().includes('(single)') ||
                albumTitle.toLowerCase().includes('- ep') ||
                albumTitle.toLowerCase().includes('(ep)') ||
                albumTitle.toLowerCase().includes(trackTitle.toLowerCase()) ||
                trackTitle.toLowerCase().includes(albumTitle.toLowerCase()) ||
                albumTitle.toLowerCase().includes('remix') ||
                albumTitle.toLowerCase().includes('feat.') ||
                albumTitle.toLowerCase().includes('featuring') ||
                albumTitle.split(' ').length <= 3;
              
              return (
                <>
                  <p className="text-green-200 text-opacity-60 text-sm mb-1">
                    Release
                  </p>
                  <p className="text-green-300 font-semibold text-lg">
                    {isSingle ? 'Single Release' : albumTitle}
                  </p>
                  {currentTrack.album?.releaseDate && (
                    <p className="text-green-200 text-opacity-80 text-sm mt-1">
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
          onClick={onNextQuestion}
          className="bg-green-600 text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-500 transition"
        >
          {gameData.currentIndex + 1 >= gameData.totalQuestions ? 'Finish Game' : 'Next Question'}
        </button>
      </div>
    </div>
  );

  const renderGuessInput = () => (
    <div className="bg-gray-900 bg-opacity-30 rounded-xl p-8">
      <label className="block text-green-300 font-semibold mb-4 text-center">
        Enter your guess (song title or artist name):
      </label>
      <div className="flex gap-4">
        <input
          type="text"
          value={userGuess}
          onChange={(e) => setUserGuess(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSubmitGuess()}
          placeholder="Type song title or artist name (min 3 characters)..."
          className="flex-1 px-4 py-3 bg-black bg-opacity-50 border border-gray-700 rounded-lg text-green-300 placeholder-green-200 placeholder-opacity-40 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
        />
        <button
          onClick={onSubmitGuess}
          disabled={!userGuess.trim()}
          className="bg-green-600 text-black px-6 py-3 rounded-lg font-bold hover:bg-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto py-12">
      {/* Game Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="text-green-400 font-semibold">
          Question {gameData.currentIndex + 1} of {gameData.totalQuestions}
        </div>
        <div className="text-green-400 font-semibold">
          Score: {gameData.score} points
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
          onClick={onToggleCheatMode}
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
        <div className="bg-yellow-600 bg-opacity-20 border border-yellow-500 border-opacity-30 rounded-xl p-4 mb-6 text-center">
          <div className="text-2xl mb-2">🕵️‍♂️</div>
          <h4 className="text-yellow-400 font-bold text-lg mb-2">Cheat Mode Active!</h4>
          <p className="text-yellow-300 font-semibold text-xl">
            {currentTrack.title} - {currentTrack.artists[0].name}
          </p>
          <p className="text-yellow-200 text-opacity-80 text-sm mt-2">
            This will automatically turn off when you go to the next question.
          </p>
        </div>
      )}

      {/* Track Information */}
      {currentTrack && (
        <div className="bg-gray-900 bg-opacity-30 rounded-xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-green-400 mb-6 text-center">
            Guess This Track!
          </h3>
          
          <div className="space-y-4">
            {/* Audio Player */}
            <TrackPlayer 
              track={currentTrack} 
              difficulty={difficulty}
              onSnippetEnd={() => console.log('Snippet finished playing')}
            />
            
            {/* Track Info Grid */}
            <div className="grid md:grid-cols-2 gap-4 text-center">
              <div className="bg-black bg-opacity-50 rounded-lg p-4">
                <p className="text-green-200 text-opacity-60 text-sm mb-1">Full Song Duration</p>
                <p className="text-green-300 font-semibold">
                  {Math.floor(currentTrack.duration / 60)}:{(currentTrack.duration % 60).toString().padStart(2, '0')}
                </p>
              </div>

              <div className="bg-black bg-opacity-50 rounded-lg p-4">
                <p className="text-green-200 text-opacity-60 text-sm mb-1">Release Year</p>
                <p className="text-green-300 font-semibold">
                  {currentTrack.album?.releaseDate ? new Date(currentTrack.album.releaseDate).getFullYear() : 'Unknown'}
                </p>
              </div>
            </div>
            
            {/* Additional Album Info */}
            <div className="text-center mt-4">
              <div className="bg-black bg-opacity-30 rounded-lg p-3 inline-block">
                <p className="text-green-200 text-opacity-60 text-xs mb-1">💿 Album Information</p>
                <p className="text-green-400 text-sm font-semibold">
                  From: {(() => {
                    const albumTitle = currentTrack.album?.title || 'Unknown Album';
                    const trackTitle = currentTrack.title;
                    
                    const isSingle = 
                      albumTitle.toLowerCase().includes('single') ||
                      albumTitle.toLowerCase() === trackTitle.toLowerCase() ||
                      albumTitle.toLowerCase().includes(' - single') ||
                      albumTitle.toLowerCase().includes('(single)') ||
                      albumTitle.toLowerCase().includes('- ep') ||
                      albumTitle.toLowerCase().includes('(ep)') ||
                      albumTitle.toLowerCase().includes(trackTitle.toLowerCase()) ||
                      trackTitle.toLowerCase().includes(albumTitle.toLowerCase()) ||
                      albumTitle.toLowerCase().includes('remix') ||
                      albumTitle.toLowerCase().includes('feat.') ||
                      albumTitle.toLowerCase().includes('featuring') ||
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
      {!showAnswer ? renderGuessInput() : renderAnswer()}
    </div>
  );
};

export default GameScreen;
