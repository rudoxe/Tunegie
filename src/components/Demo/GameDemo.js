import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useAuth } from '../../contexts/AuthContext';

const GameDemo = () => {
  const { startGame, addRound, endGame, getCurrentStats, calculatePoints } = useGame();
  const { isAuthenticated } = useAuth();
  const [gameResult, setGameResult] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedMode, setSelectedMode] = useState('random');

  const demoData = {
    random: {
      tracks: [
        { id: '1', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours' },
        { id: '2', title: 'Watermelon Sugar', artist: 'Harry Styles', album: 'Fine Line' },
        { id: '3', title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia' },
        { id: '4', title: 'Good 4 U', artist: 'Olivia Rodrigo', album: 'SOUR' },
        { id: '5', title: 'Stay', artist: 'The Kid LAROI & Justin Bieber', album: 'F*CK LOVE 3' }
      ],
      options: ['After Hours', 'Fine Line', 'Future Nostalgia', 'SOUR', 'F*CK LOVE 3', 'Positions', 'folklore']
    },
    artist: {
      tracks: [
        { id: '1', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours' },
        { id: '2', title: 'The Hills', artist: 'The Weeknd', album: 'Beauty Behind the Madness' },
        { id: '3', title: 'Can\'t Feel My Face', artist: 'The Weeknd', album: 'Beauty Behind the Madness' },
        { id: '4', title: 'Starboy', artist: 'The Weeknd', album: 'Starboy' },
        { id: '5', title: 'Die For You', artist: 'The Weeknd', album: 'Starboy' }
      ],
      options: ['After Hours', 'Beauty Behind the Madness', 'Starboy', 'My Dear Melancholy', 'Dawn FM']
    },
    genre: {
      tracks: [
        { id: '1', title: 'Good as Hell', artist: 'Lizzo', album: 'Cuz I Love You' },
        { id: '2', title: 'Truth Hurts', artist: 'Lizzo', album: 'Cuz I Love You' },
        { id: '3', title: 'Thank U, Next', artist: 'Ariana Grande', album: 'Thank U, Next' },
        { id: '4', title: 'Don\'t Start Now', artist: 'Dua Lipa', album: 'Future Nostalgia' },
        { id: '5', title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia' }
      ],
      options: ['Cuz I Love You', 'Thank U, Next', 'Future Nostalgia', 'Positions', 'folklore']
    }
  };

  const playDemoGame = async () => {
    setIsPlaying(true);
    setGameResult(null);
    
    try {
      // Start new game with selected mode
      const gameSession = startGame(selectedMode);
      console.log('Started game session:', gameSession);
      
      if (!gameSession) {
        throw new Error('Failed to start game session');
      }
      
      // Get data for selected mode
      const modeData = demoData[selectedMode];
      
      // Add a small delay to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Simulate 5 rounds
      for (let i = 0; i < 5; i++) {
        const track = modeData.tracks[i];
        const correctAnswer = track.album;
        const randomChoice = modeData.options[Math.floor(Math.random() * modeData.options.length)];
        
        // 70% chance of correct answer for demo
        const userGuess = Math.random() < 0.7 ? correctAnswer : randomChoice;
        const isCorrect = userGuess === correctAnswer;
        
        // Random time between 2-15 seconds
        const timeTaken = Math.floor(Math.random() * 13) + 2;
        const pointsEarned = calculatePoints(isCorrect, timeTaken);
        
        const updatedGame = addRound({
          track: {
            id: track.id,
            title: track.title,
            artists: [{ name: track.artist }],
            album: { title: track.album }
          },
          userGuess,
          correctAnswer,
          isCorrect,
          timeTaken,
          pointsEarned
        });
        
        console.log(`Round ${i + 1} added:`, {
          isCorrect,
          pointsEarned,
          totalScore: updatedGame?.score,
          totalRounds: updatedGame?.rounds?.length
        });
        
        if (!updatedGame) {
          console.error(`Failed to add round ${i + 1}`);
        }
        
        // Small delay for demo effect
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      console.log('About to end game...');
      
      // End game and save score
      const result = await endGame();
      console.log('Game ended with result:', result);
      
      if (result) {
        setGameResult(result);
      } else {
        setGameResult({
          error: 'Failed to end game properly'
        });
      }
    } catch (error) {
      console.error('Demo game error:', error);
      setGameResult({
        error: error.message || 'An error occurred during the demo game'
      });
    } finally {
      setIsPlaying(false);
    }
  };

  const currentStats = getCurrentStats();

  return (
    <div className="bg-black/50 rounded-lg p-6 border border-green-500/30">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-green-400 mb-2">🎮 Demo Game</h3>
        <p className="text-green-200/80 mb-4">
          Test the leaderboard system with a simulated game
        </p>
        
        {/* Game Mode Selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {[
            { value: 'random', icon: '🎲', name: 'Random Mix' },
            { value: 'artist', icon: '🎤', name: 'Artist Challenge' },
            { value: 'genre', icon: '🎼', name: 'Genre Expert' }
          ].map((mode) => (
            <button
              key={mode.value}
              onClick={() => setSelectedMode(mode.value)}
              disabled={isPlaying}
              className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                selectedMode === mode.value
                  ? 'bg-green-600 text-black'
                  : 'bg-gray-700 text-green-300 hover:bg-gray-600'
              } ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span>{mode.icon}</span>
              <span className="hidden sm:inline">{mode.name}</span>
            </button>
          ))}
        </div>
        
        {!isAuthenticated() && (
          <p className="text-yellow-300 text-sm mt-2">
            ⚠️ Sign in to save your demo scores to the leaderboard!
          </p>
        )}
      </div>

      {/* Current Game Stats */}
      {currentStats && (
        <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4 mb-4">
          <h4 className="text-blue-300 font-medium mb-2">Current Game Progress</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">{currentStats.rounds}</div>
              <div className="text-blue-200/80">Rounds</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">{currentStats.correct}</div>
              <div className="text-blue-200/80">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">{currentStats.score}</div>
              <div className="text-blue-200/80">Score</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">{currentStats.accuracy}%</div>
              <div className="text-blue-200/80">Accuracy</div>
            </div>
          </div>
        </div>
      )}

      {/* Game Result */}
      {gameResult && (
        <div className={`rounded-lg p-4 mb-4 border ${
          gameResult.error 
            ? 'bg-red-600/20 border-red-500/30' 
            : 'bg-green-600/20 border-green-500/30'
        }`}>
          {gameResult.error ? (
            <div>
              <h4 className="text-red-300 font-medium mb-3">❌ Demo Game Error</h4>
              <p className="text-red-200 text-sm">{gameResult.error}</p>
            </div>
          ) : (
            <div>
              <h4 className="text-green-300 font-medium mb-3">🎉 Game Completed!</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{gameResult.totalRounds}</div>
                  <div className="text-green-200/80">Total Rounds</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{gameResult.correctAnswers}</div>
                  <div className="text-green-200/80">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{gameResult.score}</div>
                  <div className="text-green-200/80">Final Score</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">
                    {Math.round((gameResult.correctAnswers / gameResult.totalRounds) * 100)}%
                  </div>
                  <div className="text-green-200/80">Accuracy</div>
                </div>
              </div>
            </div>
          )}
          
          {gameResult.serverResult && isAuthenticated() && (
            <div className="bg-green-700/20 rounded p-3">
              <p className="text-green-300 text-sm">
                ✅ Score saved to leaderboard! 
                {gameResult.serverResult.personal_best && (
                  <span className="text-yellow-300"> 🏆 New personal best!</span>
                )}
              </p>
              <p className="text-green-200/80 text-xs mt-1">
                Leaderboard position: #{gameResult.serverResult.leaderboard_position}
              </p>
            </div>
          )}
          
          {gameResult.saveError && (
            <div className="bg-red-600/20 border border-red-500/30 rounded p-3">
              <p className="text-red-300 text-sm">❌ Failed to save score: {gameResult.saveError}</p>
            </div>
          )}
          
          {!isAuthenticated() && (
            <div className="bg-yellow-600/20 border border-yellow-500/30 rounded p-3">
              <p className="text-yellow-300 text-sm">
                💡 Sign in to save this score and compete on the leaderboard!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action Button */}
      <div className="text-center">
        <button
          onClick={playDemoGame}
          disabled={isPlaying}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            isPlaying
              ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-black'
          }`}
        >
          {isPlaying ? 'Playing Demo Game...' : '🎲 Play Demo Game'}
        </button>
      </div>

      <div className="mt-4 text-center text-green-200/60 text-sm">
        <p>This demo simulates a 5-round music guessing game.</p>
        <p>Test different game modes and see how they appear on the leaderboard!</p>
        <p>Current mode: <span className="text-green-400 font-medium">
          {selectedMode === 'random' ? '🎲 Random Mix' :
           selectedMode === 'artist' ? '🎤 Artist Challenge (The Weeknd)' :
           '🎼 Genre Expert (Pop)'
          }
        </span></p>
      </div>
    </div>
  );
};

export default GameDemo;
