import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

// Loading Screen Component
export const LoadingScreen = () => (
  <div className="text-center py-20">
    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mb-6"></div>
    <h2 className="text-2xl font-semibold text-green-400 mb-4">Loading Tunegie...</h2>
    <p className="text-green-200 text-opacity-80">
      Connecting to iTunes API and loading real songs with previews...
    </p>
  </div>
);

// Error Screen Component
export const ErrorScreen = ({ errorMessage, onRetry }) => (
  <div className="text-center py-20 max-w-2xl mx-auto">
    <div className="text-6xl mb-6">❌</div>
    <h2 className="text-3xl font-bold text-red-400 mb-4">Connection Error</h2>
    <p className="text-green-200 text-opacity-80 mb-6">{errorMessage}</p>
    <div className="bg-gray-900 bg-opacity-30 rounded-xl p-6 mb-6">
      <h3 className="text-lg font-semibold text-green-400 mb-3">Troubleshooting:</h3>
      <ul className="text-left text-green-200 text-opacity-80 space-y-2">
        <li>• Check your internet connection</li>
        <li>• Make sure iTunes Store is accessible in your region</li>
        <li>• Try refreshing the page</li>
        <li>• Check browser console for detailed error messages</li>
      </ul>
    </div>
    <button
      onClick={onRetry}
      className="bg-green-600 text-black px-6 py-3 rounded-xl font-bold hover:bg-green-500 transition"
    >
      Try Again
    </button>
  </div>
);

// Ready Screen Component
export const ReadyScreen = ({ gameData, onStart }) => {
  const getModeInfo = () => {
    if (gameData.gameMode === 'artist') {
      return { 
        icon: '🎤', 
        title: `${gameData.selectedArtist} Challenge`, 
        desc: `Test your knowledge of ${gameData.selectedArtist}'s songs!` 
      };
    } else if (gameData.gameMode === 'genre') {
      return { 
        icon: '🎼', 
        title: `${gameData.selectedGenre.charAt(0).toUpperCase() + gameData.selectedGenre.slice(1)} Challenge`, 
        desc: `How well do you know ${gameData.selectedGenre} music?` 
      };
    } else {
      return { 
        icon: '🎵', 
        title: 'Random Mix Challenge', 
        desc: 'Test your overall music knowledge!' 
      };
    }
  };

  const modeInfo = getModeInfo();

  return (
    <div className="text-center py-20 max-w-2xl mx-auto">
      <div className="text-6xl mb-6">{modeInfo.icon}</div>
      <h2 className="text-4xl font-bold text-green-400 mb-6">Ready to Play!</h2>
      <h3 className="text-2xl font-semibold text-green-300 mb-4">{modeInfo.title}</h3>
      <p className="text-lg text-green-200 text-opacity-80 mb-8">
        {modeInfo.desc} We've loaded {gameData.tracks.length} tracks for your guessing challenge.
      </p>
      
      <div className="bg-gray-900 bg-opacity-30 rounded-xl p-6 mb-8">
        <h3 className="text-xl font-semibold text-green-400 mb-4">How to Play:</h3>
        <div className="space-y-3 text-green-200 text-opacity-80">
          <p>Listen to 5-second audio snippets</p>
          <p>Guess the song title or artist name</p>
          <p>No time limit - replay snippets anytime!</p>
          <p>Score points for each correct guess</p>
          <p>See your final score at the end</p>
        </div>
      </div>

      <button
        onClick={onStart}
        className="bg-green-600 text-black px-8 py-4 rounded-2xl font-bold text-xl shadow-lg hover:bg-green-500 transition"
      >
        Start Playing
      </button>
    </div>
  );
};

// Finished Screen Component
export const FinishedScreen = ({ gameData, onRestart }) => {
  const { isAuthenticated } = useAuth();

  const getPerformanceMessage = () => {
    const correctAnswers = gameData.answers.filter(answer => answer.correct).length;
    if (correctAnswers === gameData.totalQuestions) return '🎊 Perfect score! You\'re a music master!';
    if (correctAnswers >= gameData.totalQuestions * 0.8) return '🎉 Excellent! You know your music!';
    if (correctAnswers >= gameData.totalQuestions * 0.6) return '👍 Good job! Keep practicing!';
    return '🎵 Nice try! Music discovery awaits!';
  };

  const correctAnswers = gameData.answers.filter(answer => answer.correct).length;
  const accuracy = Math.round((correctAnswers / gameData.totalQuestions) * 100);

  return (
    <div className="text-center py-20 max-w-2xl mx-auto">
      <div className="text-6xl mb-6">🏆</div>
      <h2 className="text-4xl font-bold text-green-400 mb-6">Game Complete!</h2>
      <p className="text-2xl text-green-300 mb-8">
        Final Score: {gameData.score} points
      </p>
      
      <div className="bg-gray-900 bg-opacity-30 rounded-xl p-6 mb-8">
        <h3 className="text-xl font-semibold text-green-400 mb-4">Your Performance:</h3>
        <div className="text-green-200 text-opacity-80">
          <p>Correct Answers: {correctAnswers} out of {gameData.totalQuestions}</p>
          <p>Accuracy: {accuracy}%</p>
          <p className="mt-2">{getPerformanceMessage()}</p>
          
          {isAuthenticated() && (
            <div className="mt-4 p-3 bg-green-600 bg-opacity-20 border border-green-500 border-opacity-30 rounded-lg">
              <p className="text-green-300 text-sm">
                ✅ Your score has been saved to the leaderboard!
              </p>
              <div className="mt-2">
                <a href="/leaderboard" className="text-green-400 hover:text-green-300 text-sm">
                  View Leaderboard →
                </a>
                <span className="mx-2 text-green-200 text-opacity-40">•</span>
                <a href="/history" className="text-green-400 hover:text-green-300 text-sm">
                  View Your History →
                </a>
              </div>
            </div>
          )}
          
          {!isAuthenticated() && (
            <div className="mt-4 p-4 bg-yellow-600 bg-opacity-20 border border-yellow-500 border-opacity-30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-lg">⚠️</div>
                <p className="text-yellow-300 font-medium text-sm">Score Not Saved - Playing as Guest</p>
              </div>
              <p className="text-yellow-200 text-opacity-90 text-sm mb-3">
                Your score of <strong>{gameData.score} points</strong> ({correctAnswers}/{gameData.totalQuestions} correct) won't appear on the leaderboard or in your game history.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => window.location.href = '/login'}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black px-3 py-1 rounded text-xs font-medium transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => window.location.href = '/register'}
                  className="border border-yellow-500 text-yellow-300 hover:bg-yellow-500 hover:bg-opacity-10 px-3 py-1 rounded text-xs font-medium transition"
                >
                  Register
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <button
          onClick={onRestart}
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
};