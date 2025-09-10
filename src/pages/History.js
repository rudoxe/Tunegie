import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/Auth/AuthModal';

const History = () => {
  const { isAuthenticated, API_BASE } = useAuth();
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedGameMode, setSelectedGameMode] = useState('all');

  const fetchUserStats = async () => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('tunegie_token');
      const response = await fetch(`${API_BASE}/user_stats.php`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch user statistics');
      }

      setUserStats(data);
    } catch (err) {
      setError(err.message);
      console.error('User stats fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, [isAuthenticated()]);

  const getGameModeIcon = (mode) => {
    switch (mode) {
      case 'random': return '🎲';
      case 'artist': return '🎤';
      case 'genre': return '🎼';
      default: return '🎵';
    }
  };

  const getGameModeName = (mode) => {
    switch (mode) {
      case 'random': return 'Random Mix';
      case 'artist': return 'Artist Challenge';
      case 'genre': return 'Genre Expert';
      default: return mode;
    }
  };

  const filteredRecentGames = userStats?.recent_games?.filter(game => 
    selectedGameMode === 'all' || game.game_mode === selectedGameMode
  ) || [];

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">📊</div>
          <h1 className="text-3xl font-bold text-green-400 mb-4">Game History</h1>
          <p className="text-green-200/80 mb-6">
            Sign in to view your game history and detailed statistics
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-green-600 hover:bg-green-700 text-black px-6 py-3 rounded-xl font-bold transition-colors"
          >
            Sign In to View History
          </button>
          <AuthModal 
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            initialMode="login"
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-green-400 text-xl">Loading your game history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-6">❌</div>
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading History</h2>
          <p className="text-red-300 mb-6">{error}</p>
          <button
            onClick={fetchUserStats}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!userStats || !userStats.statistics) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-6">🎮</div>
          <h2 className="text-3xl font-bold text-green-400 mb-4">No Games Played Yet</h2>
          <p className="text-green-200/80 mb-6">
            Start playing games to see your history and statistics here!
          </p>
          <a
            href="/game"
            className="bg-green-600 hover:bg-green-700 text-black px-6 py-3 rounded-xl font-bold transition-colors"
          >
            Play Your First Game
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-400 mb-2">📊 Game History</h1>
        <p className="text-green-200/80">Your gaming journey and statistics</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-black/50 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">
            {userStats.statistics.total_games_played}
          </div>
          <div className="text-green-200/80 text-sm">Total Games</div>
        </div>
        <div className="bg-black/50 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-blue-400 mb-2">
            {userStats.statistics.total_rounds_played}
          </div>
          <div className="text-green-200/80 text-sm">Total Rounds</div>
        </div>
        <div className="bg-black/50 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">
            {userStats.statistics.best_score}
          </div>
          <div className="text-green-200/80 text-sm">Best Score</div>
        </div>
        <div className="bg-black/50 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-yellow-400 mb-2">
            {userStats.statistics.average_accuracy}%
          </div>
          <div className="text-green-200/80 text-sm">Average Accuracy</div>
        </div>
      </div>

      {/* Personal Bests by Game Mode */}
      {userStats.personal_bests && userStats.personal_bests.length > 0 && (
        <div className="bg-gray-900/50 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-green-400 mb-4">🏆 Personal Bests</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {userStats.personal_bests.map((best) => (
              <div key={best.game_mode} className="bg-black/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{getGameModeIcon(best.game_mode)}</span>
                  <span className="font-semibold text-green-300">{getGameModeName(best.game_mode)}</span>
                </div>
                <div className="text-lg font-bold text-yellow-400 mb-1">
                  {best.best_score} points
                </div>
                <div className="text-sm text-green-200/80">
                  {best.best_accuracy}% accuracy
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Trend */}
      {userStats.performance_trend && (
        <div className="bg-gray-900/50 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-green-400 mb-4">📈 Performance Trend</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-300">Recent Average Score</span>
                <span className="text-lg font-bold text-blue-400">
                  {userStats.performance_trend.recent_avg_score}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-200/80 text-sm">Trend:</span>
                <span className={`text-sm font-semibold ${
                  userStats.performance_trend.score_improvement_percentage > 0 
                    ? 'text-green-400' 
                    : userStats.performance_trend.score_improvement_percentage < 0 
                    ? 'text-red-400' 
                    : 'text-gray-400'
                }`}>
                  {userStats.performance_trend.score_improvement_percentage > 0 ? '↗️' : 
                   userStats.performance_trend.score_improvement_percentage < 0 ? '↘️' : '➡️'}
                  {Math.abs(userStats.performance_trend.score_improvement_percentage)}%
                </span>
              </div>
            </div>
            <div className="bg-black/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-300">Recent Average Accuracy</span>
                <span className="text-lg font-bold text-purple-400">
                  {userStats.performance_trend.recent_avg_accuracy}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-200/80 text-sm">Change:</span>
                <span className={`text-sm font-semibold ${
                  userStats.performance_trend.accuracy_improvement > 0 
                    ? 'text-green-400' 
                    : userStats.performance_trend.accuracy_improvement < 0 
                    ? 'text-red-400' 
                    : 'text-gray-400'
                }`}>
                  {userStats.performance_trend.accuracy_improvement > 0 ? '+' : ''}
                  {userStats.performance_trend.accuracy_improvement}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Games */}
      <div className="bg-gray-900/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-green-400">🕒 Recent Games</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedGameMode('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedGameMode === 'all'
                  ? 'bg-green-600 text-black'
                  : 'bg-gray-700 text-green-300 hover:bg-gray-600'
              }`}
            >
              All
            </button>
            {['random', 'artist', 'genre'].map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedGameMode(mode)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                  selectedGameMode === mode
                    ? 'bg-green-600 text-black'
                    : 'bg-gray-700 text-green-300 hover:bg-gray-600'
                }`}
              >
                <span>{getGameModeIcon(mode)}</span>
                <span className="hidden sm:inline">{getGameModeName(mode)}</span>
              </button>
            ))}
          </div>
        </div>

        {filteredRecentGames.length > 0 ? (
          <div className="space-y-4">
            {filteredRecentGames.map((game, index) => (
              <div key={game.session_id || index} className="bg-black/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getGameModeIcon(game.game_mode)}</span>
                    <span className="font-semibold text-green-300">
                      {getGameModeName(game.game_mode)}
                    </span>
                    <span className="text-green-200/60 text-sm">
                      {game.achieved_at_formatted || game.achieved_at}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-yellow-400">
                      {game.score} points
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-green-200/80">
                  <div>
                    {game.correct_answers}/{game.total_rounds} correct 
                    ({game.accuracy_formatted || `${Math.round(game.accuracy_percentage)}%`})
                  </div>
                  <div className="flex items-center gap-4">
                    <span>#{userStats.global_rank} Global</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-green-200/60">
            <div className="text-4xl mb-2">🎮</div>
            <p>No games found for the selected filter</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
