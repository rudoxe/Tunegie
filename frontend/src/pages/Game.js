import React, { useState, useEffect } from 'react';
import itunesApiService from '../services/itunesApi';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { validateGuess } from '../utils/gameUtils';

// Import organized components
import GameModeSelector from '../components/Game/GameModeSelector';
import GameScreen from '../components/Game/GameScreen';
import { LoadingScreen, ErrorScreen, ReadyScreen, FinishedScreen } from '../components/Game/GameScreens';

export default function Game() {
  const { startGame, addRound, endGame, calculatePoints } = useGame();
  const { isAuthenticated } = useAuth();
  const [gameState, setGameState] = useState('loading'); // selectMode, loading, ready, playing, finished, error
  const [currentTrack, setCurrentTrack] = useState(null);
  const [difficulty, setDifficulty] = useState('medium'); // easy (10s), medium (5s), hard (2s)
  const [gameData, setGameData] = useState({
    tracks: [],
    backupTracks: [],
    usedTrackIds: [],
    currentIndex: 0,
    score: 0,
    totalQuestions: 10,
    answers: [],
    gameMode: null, // 'random', 'artist', 'genre'
    selectedArtist: null,
    selectedGenre: null,
    difficulty: 'medium'
  });
  const [userGuess, setUserGuess] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
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
      console.log('🎵 Using iTunes API for real music tracks');
      
      // Test iTunes API connection
      const connected = await itunesApiService.testConnection();

      if (!connected) {
        throw new Error('Unable to connect to iTunes API. Please check your internet connection.');
      }

      // Load tracks based on game mode
      let tracks = [];
      console.log(`🎵 Loading ${gameMode} tracks...`);
      
      // Load more tracks than needed to avoid duplicates and have variety
      const tracksToLoad = Math.max(gameData.totalQuestions * 3, 50); // Load 3x more tracks for variety
      
      if (gameMode === 'artist' && selectedOption) {
        tracks = await itunesApiService.getTracksByArtist(selectedOption, tracksToLoad);
        console.log(`🎤 Loaded ${tracks.length} tracks for artist: ${selectedOption}`);
      } else if (gameMode === 'genre' && selectedOption) {
        tracks = await itunesApiService.getTracksByGenre(selectedOption, tracksToLoad);
        console.log(`🎼 Loaded ${tracks.length} tracks for genre: ${selectedOption}`);
      } else {
        tracks = await itunesApiService.getRandomTracksForGame(tracksToLoad);
        console.log(`🎲 Loaded ${tracks.length} random tracks`);
      }
      
      if (tracks.length === 0) {
        throw new Error(`No tracks available for ${gameMode} mode. Please try a different option.`);
      }

      // Shuffle all tracks to ensure randomness
      const shuffledTracks = tracks.sort(() => 0.5 - Math.random());
      
      // Select only the number we need for the game (but keep extras as backups)
      const gameTracks = shuffledTracks.slice(0, gameData.totalQuestions);
      const backupTracks = shuffledTracks.slice(gameData.totalQuestions);
      
      console.log(`✅ Selected ${gameTracks.length} tracks for the game (${backupTracks.length} backup tracks available)`);
      
      setGameData(prev => ({
        ...prev,
        tracks: gameTracks,
        backupTracks: backupTracks, // Store backup tracks for replacement if needed
        usedTrackIds: [], // Track which songs have been used
        currentIndex: 0,
        score: 0,
        answers: [],
        gameMode: gameMode,
        selectedArtist: gameMode === 'artist' ? selectedOption : null,
        selectedGenre: gameMode === 'genre' ? selectedOption : null,
        difficulty: difficulty
      }));

      setCurrentTrack(gameTracks[0]);
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

    const result = validateGuess(userGuess, currentTrack);
    const { correct, correctAnswer } = result;
    
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

    // Mark current track as used
    const currentTrackId = currentTrack?.id;
    const updatedUsedTrackIds = currentTrackId ? [...gameData.usedTrackIds, currentTrackId] : gameData.usedTrackIds;
    
    setGameData(prev => ({
      ...prev,
      currentIndex: nextIndex,
      usedTrackIds: updatedUsedTrackIds
    }));
    
    const nextTrack = gameData.tracks[nextIndex];
    setCurrentTrack(nextTrack);
    setUserGuess('');
    setShowAnswer(false);
    setCheatMode(false); // Auto-disable cheat mode on next question
    
    console.log(`🎵 Playing track ${nextIndex + 1}/${gameData.totalQuestions}: "${nextTrack?.title}" by ${nextTrack?.artists?.[0]?.name}`);
  };

  const restartGame = () => {
    setGameState('selectMode');
  };


  const selectGameMode = (mode, option = null) => {
    initializeGame(mode, option);
  };

  // Handlers for the components
  const handleModeSelection = (mode, option = null) => {
    selectGameMode(mode, option);
  };

  const handleToggleCheatMode = () => {
    setCheatMode(prev => !prev);
  };

  const handleRetry = () => {
    setGameState('selectMode');
  };
  
  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty);
    setGameData(prev => ({
      ...prev,
      difficulty: newDifficulty
    }));
  };

  return (
    <div className="w-full min-h-screen py-8">
      {gameState === 'selectMode' && (
        <GameModeSelector onSelectMode={handleModeSelection} />
      )}
      {gameState === 'loading' && <LoadingScreen />}
      {gameState === 'error' && (
        <ErrorScreen 
          errorMessage={errorMessage} 
          onRetry={handleRetry} 
        />
      )}
      {gameState === 'ready' && (
        <ReadyScreen 
          gameData={gameData} 
          difficulty={difficulty}
          onDifficultyChange={handleDifficultyChange}
          onStart={startGameSession} 
        />
      )}
      {gameState === 'playing' && (
        <GameScreen
          gameData={gameData}
          currentTrack={currentTrack}
          difficulty={difficulty}
          userGuess={userGuess}
          setUserGuess={setUserGuess}
          showAnswer={showAnswer}
          isCorrect={isCorrect}
          cheatMode={cheatMode}
          onToggleCheatMode={handleToggleCheatMode}
          onSubmitGuess={submitGuess}
          onNextQuestion={nextQuestion}
        />
      )}
      {gameState === 'finished' && (
        <FinishedScreen 
          gameData={gameData} 
          onRestart={restartGame} 
        />
      )}
    </div>
  );
}

