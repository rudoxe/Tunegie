import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const { isAuthenticated, API_BASE } = useAuth();
  const [currentGame, setCurrentGame] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  
  // Keep a ref to the current game for immediate access
  const currentGameRef = { current: null };

  // Start a new game session
  const startGame = (gameMode = 'standard') => {
    const newGame = {
      id: Date.now(),
      gameMode,
      startTime: new Date(),
      rounds: [],
      currentRound: 0,
      score: 0,
      correctAnswers: 0,
      status: 'active'
    };
    currentGameRef.current = newGame;
    setCurrentGame(newGame);
    console.log('Started game and set ref:', newGame.id);
    return newGame;
  };

  // Add a round result to the current game
  const addRound = (roundData) => {
    const gameToUpdate = currentGameRef.current || currentGame;
    
    console.log('addRound called with game:', gameToUpdate ? {
      id: gameToUpdate.id,
      rounds: gameToUpdate.rounds.length,
      score: gameToUpdate.score
    } : null);
    
    if (!gameToUpdate) {
      console.error('No active game session');
      return null;
    }

    const round = {
      roundNumber: gameToUpdate.rounds.length + 1,
      track_id: roundData.track?.id || '',
      track_title: roundData.track?.title || '',
      track_artist: roundData.track?.artists?.[0]?.name || '',
      album_title: roundData.track?.album?.title || '',
      user_guess: roundData.userGuess || '',
      correct_answer: roundData.correctAnswer || '',
      is_correct: roundData.isCorrect || false,
      time_taken: roundData.timeTaken || 0,
      points_earned: roundData.pointsEarned || 0,
      timestamp: new Date()
    };

    const updatedGame = {
      ...gameToUpdate,
      rounds: [...gameToUpdate.rounds, round],
      currentRound: gameToUpdate.currentRound + 1,
      score: gameToUpdate.score + (round.points_earned || 0),
      correctAnswers: gameToUpdate.correctAnswers + (round.is_correct ? 1 : 0)
    };

    // Update both ref and state
    currentGameRef.current = updatedGame;
    setCurrentGame(updatedGame);
    
    console.log('Updated game state:', {
      id: updatedGame.id,
      rounds: updatedGame.rounds.length,
      score: updatedGame.score,
      correctAnswers: updatedGame.correctAnswers
    });
    
    return updatedGame;
  };

  // End the current game and save score
  const endGame = async () => {
    const gameToEnd = currentGameRef.current || currentGame;
    
    if (!gameToEnd) {
      console.error('No active game session to end');
      return null;
    }

    console.log('Ending game with current state:', {
      id: gameToEnd.id,
      rounds: gameToEnd.rounds.length,
      score: gameToEnd.score,
      correctAnswers: gameToEnd.correctAnswers
    });

    const finalGame = {
      ...gameToEnd,
      status: 'completed',
      endTime: new Date(),
      totalRounds: gameToEnd.rounds.length
    };

    // Save score if user is authenticated (before clearing currentGame)
    let result = null;
    if (isAuthenticated()) {
      try {
        result = await saveScore(finalGame);
      } catch (error) {
        console.error('Failed to save score:', error);
        result = { saveError: error.message };
      }
    }

    // Clear current game and update history after saving
    currentGameRef.current = null;
    setCurrentGame(null);
    setGameHistory(prev => [finalGame, ...prev.slice(0, 9)]); // Keep last 10 games

    return result ? { ...finalGame, serverResult: result } : finalGame;
  };

  // Save score to server
  const saveScore = async (gameData) => {
    if (!isAuthenticated()) {
      throw new Error('User not authenticated');
    }

    const token = localStorage.getItem('tunegie_token');
    if (!token) {
      throw new Error('No authentication token');
    }

    const payload = {
      total_rounds: gameData.totalRounds || gameData.rounds.length,
      correct_answers: gameData.correctAnswers,
      score: gameData.score,
      game_mode: gameData.gameMode,
      rounds: gameData.rounds.map(round => ({
        track_id: round.track_id,
        track_title: round.track_title,
        track_artist: round.track_artist,
        album_title: round.album_title,
        user_guess: round.user_guess,
        is_correct: round.is_correct,
        time_taken: round.time_taken,
        points_earned: round.points_earned
      }))
    };
    
    console.log('Sending score payload:', payload);

    const response = await fetch(`${API_BASE}/save_score.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    console.log('Save score response:', { status: response.status, result });
    
    if (!response.ok) {
      console.error('Save score error:', result);
      throw new Error(result.error || `Failed to save score (${response.status})`);
    }

    return result;
  };

  // Calculate points for a round
  const calculatePoints = (isCorrect, timeTaken, difficulty = 1) => {
    if (!isCorrect) return 0;
    
    // Base points for correct answer
    let points = 100 * difficulty;
    
    // Time bonus (faster = more points)
    if (timeTaken <= 3) points += 50; // Very fast
    else if (timeTaken <= 5) points += 30; // Fast
    else if (timeTaken <= 10) points += 10; // Normal
    
    return Math.round(points);
  };

  // Get current game stats
  const getCurrentStats = () => {
    if (!currentGame) return null;
    
    const totalRounds = currentGame.rounds.length;
    const accuracy = totalRounds > 0 ? (currentGame.correctAnswers / totalRounds) * 100 : 0;
    
    return {
      rounds: totalRounds,
      correct: currentGame.correctAnswers,
      score: currentGame.score,
      accuracy: Math.round(accuracy * 10) / 10 // Round to 1 decimal
    };
  };

  // Abandon current game
  const abandonGame = () => {
    const gameToAbandon = currentGameRef.current || currentGame;
    if (gameToAbandon) {
      const abandonedGame = {
        ...gameToAbandon,
        status: 'abandoned',
        endTime: new Date()
      };
      setGameHistory(prev => [abandonedGame, ...prev.slice(0, 9)]);
    }
    currentGameRef.current = null;
    setCurrentGame(null);
  };

  const value = {
    currentGame,
    gameHistory,
    startGame,
    addRound,
    endGame,
    abandonGame,
    calculatePoints,
    getCurrentStats,
    saveScore,
    isGameActive: () => {
      const game = currentGameRef.current || currentGame;
      return game && game.status === 'active';
    }
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
