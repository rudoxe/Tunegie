import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import AuthModal from '../components/Auth/AuthModal';

const History = () => {
  const { isAuthenticated, API_BASE } = useAuth();
  const { theme } = useTheme();
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedGameMode, setSelectedGameMode] = useState('all');

  const fetchUserStats = useCallback(async () => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('tunegie_token');
      const response = await fetch(`${API_BASE}/backend/php/api/user/user_stats.php`, {
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
  }, [isAuthenticated, API_BASE]);

  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);

  const getGameModeIcon = (mode) => {
    switch (mode) {
      case 'random': return 'R';
      case 'artist': return 'A';
      case 'genre': return 'G';
      default: return 'M';
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
        <div className="text-center max-w-md animate-fade-in">
          <div className={`text-6xl mb-6 text-${theme.accent}`}>H</div>
          <h1 className={`text-3xl font-bold text-${theme.accent} mb-4`}>Game History</h1>
          <p className={`text-${theme.textMuted} mb-6`}>
            Sign in to view your game history and detailed statistics
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className={`bg-${theme.accent} hover:bg-${theme.accent}/80 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:glow`}
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
        <div className={`text-${theme.accent} text-xl animate-glow-pulse`}>Loading your game history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center animate-fade-in">
          <div className={`text-6xl mb-6 text-${theme.accent}`}>!</div>
          <h2 className={`text-2xl font-bold text-${theme.accent} mb-4`}>Error Loading History</h2>
          <p className={`text-${theme.textMuted} mb-6`}>{error}</p>
          <button
            onClick={fetchUserStats}
            className={`bg-${theme.accent} hover:bg-${theme.accent}/80 text-white px-4 py-2 rounded-md transition-all duration-300 hover:scale-105 hover:glow`}
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
        <div className="text-center animate-fade-in">
          <div className={`text-6xl mb-6 text-${theme.accent}`}>G</div>
          <h2 className={`text-3xl font-bold text-${theme.accent} mb-4`}>No Games Played Yet</h2>
          <p className={`text-${theme.textMuted} mb-6`}>
            Start playing games to see your history and statistics here!
          </p>
          <a
            href="/game"
            className={`bg-${theme.accent} hover:bg-${theme.accent}/80 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:glow animate-float`}
          >
            Play Your First Game
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto">
      <div className="text-center mb-8 animate-fade-in">
        <h1 className={`text-4xl font-bold text-${theme.accent} mb-2`}>Game History</h1>
        <p className={`text-${theme.textMuted}`}>Your gaming journey and statistics</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className={`bg-${theme.cardBg} rounded-xl p-6 text-center transition-all duration-300 hover:scale-105 hover:glow animate-slide-in`}>
          <div className={`text-3xl font-bold text-${theme.accent} mb-2`}>
            {userStats.statistics.total_games_played}
          </div>
          <div className={`text-${theme.textMuted} text-sm`}>Total Games</div>
        </div>
        <div className={`bg-${theme.cardBg} rounded-xl p-6 text-center transition-all duration-300 hover:scale-105 hover:glow animate-slide-in`}>
          <div className={`text-3xl font-bold text-${theme.text} mb-2`}>
            {userStats.statistics.total_rounds_played}
          </div>
          <div className={`text-${theme.textMuted} text-sm`}>Total Rounds</div>
        </div>
        <div className={`bg-${theme.cardBg} rounded-xl p-6 text-center transition-all duration-300 hover:scale-105 hover:glow animate-slide-in`}>
          <div className={`text-3xl font-bold text-${theme.accent} mb-2`}>
            {userStats.statistics.best_score}
          </div>
          <div className={`text-${theme.textMuted} text-sm`}>Best Score</div>
        </div>
        <div className={`bg-${theme.cardBg} rounded-xl p-6 text-center transition-all duration-300 hover:scale-105 hover:glow animate-slide-in`}>
          <div className={`text-3xl font-bold text-${theme.text} mb-2`}>
            {userStats.statistics.average_accuracy}%
          </div>
          <div className={`text-${theme.textMuted} text-sm`}>Average Accuracy</div>
        </div>
      </div>

      {/* Personal Bests by Game Mode */}
      {userStats.personal_bests && userStats.personal_bests.length > 0 && (
        <div className={`bg-${theme.cardBg} rounded-xl p-6 mb-8 border border-${theme.accent}/20 animate-slide-in`}>
          <h2 className={`text-2xl font-bold text-${theme.accent} mb-4`}>Personal Bests</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {userStats.personal_bests.map((best) => (
              <div key={best.game_mode} className={`bg-${theme.bgDark} rounded-lg p-4 transition-all duration-300 hover:scale-105 hover:glow`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-2xl font-bold text-${theme.accent} w-8 h-8 flex items-center justify-center rounded-full bg-${theme.accent}/20`}>{getGameModeIcon(best.game_mode)}</span>
                  <span className={`font-semibold text-${theme.text}`}>{getGameModeName(best.game_mode)}</span>
                </div>
                <div className={`text-lg font-bold text-${theme.accent} mb-1`}>
                  {best.best_score} points
                </div>
                <div className={`text-sm text-${theme.textMuted}`}>
                  {best.best_accuracy}% accuracy
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Trend */}
      {userStats.performance_trend && (
        <div className={`bg-${theme.cardBg} rounded-xl p-6 mb-8 border border-${theme.accent}/20 animate-slide-in`}>
          <h2 className={`text-2xl font-bold text-${theme.accent} mb-4`}>Performance Trend</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`bg-${theme.bgDark} rounded-lg p-4 transition-all duration-300 hover:glow`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-${theme.text}`}>Recent Average Score</span>
                <span className={`text-lg font-bold text-${theme.accent}`}>
                  {userStats.performance_trend.recent_avg_score}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-${theme.textMuted} text-sm`}>Trend:</span>
                <span className={`text-sm font-semibold ${
                  userStats.performance_trend.score_improvement_percentage > 0 
                    ? `text-${theme.accent}` 
                    : userStats.performance_trend.score_improvement_percentage < 0 
                    ? `text-${theme.accent}` 
                    : `text-${theme.textMuted}`
                }`}>
                  {userStats.performance_trend.score_improvement_percentage > 0 ? '↗' : 
                   userStats.performance_trend.score_improvement_percentage < 0 ? '↘' : '→'}
                  {Math.abs(userStats.performance_trend.score_improvement_percentage)}%
                </span>
              </div>
            </div>
            <div className={`bg-${theme.bgDark} rounded-lg p-4 transition-all duration-300 hover:glow`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-${theme.text}`}>Recent Average Accuracy</span>
                <span className={`text-lg font-bold text-${theme.accent}`}>
                  {userStats.performance_trend.recent_avg_accuracy}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-${theme.textMuted} text-sm`}>Change:</span>
                <span className={`text-sm font-semibold ${
                  userStats.performance_trend.accuracy_improvement > 0 
                    ? `text-${theme.accent}` 
                    : userStats.performance_trend.accuracy_improvement < 0 
                    ? `text-${theme.accent}` 
                    : `text-${theme.textMuted}`
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
      <div className={`bg-${theme.cardBg} rounded-xl p-6 border border-${theme.accent}/20 animate-slide-in`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-2xl font-bold text-${theme.accent}`}>Recent Games</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedGameMode('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-300 ${
                selectedGameMode === 'all'
                  ? `bg-${theme.accent} text-white`
                  : `bg-${theme.bgDark} text-${theme.text} hover:bg-${theme.accent}/20`
              }`}
            >
              All
            </button>
            {['random', 'artist', 'genre'].map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedGameMode(mode)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-300 flex items-center gap-1 ${
                  selectedGameMode === mode
                    ? `bg-${theme.accent} text-white`
                    : `bg-${theme.bgDark} text-${theme.text} hover:bg-${theme.accent}/20`
                }`}
              >
                <span className="font-bold">{getGameModeIcon(mode)}</span>
                <span className="hidden sm:inline">{getGameModeName(mode)}</span>
              </button>
            ))}
          </div>
        </div>

        {filteredRecentGames.length > 0 ? (
          <div className="space-y-4">
            {filteredRecentGames.map((game, index) => (
              <div key={game.session_id || index} className={`bg-${theme.bgDark} rounded-lg p-4 transition-all duration-300 hover:glow animate-fade-in`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xl font-bold text-${theme.accent} w-8 h-8 flex items-center justify-center rounded-full bg-${theme.accent}/20`}>{getGameModeIcon(game.game_mode)}</span>
                    <span className={`font-semibold text-${theme.text}`}>
                      {getGameModeName(game.game_mode)}
                    </span>
                    <span className={`text-${theme.textMuted} text-sm`}>
                      {game.achieved_at_formatted || game.achieved_at}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold text-${theme.accent}`}>
                      {game.score} points
                    </div>
                  </div>
                </div>
                <div className={`flex items-center justify-between text-sm text-${theme.textMuted}`}>
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
          <div className={`text-center py-8 text-${theme.textMuted} animate-fade-in`}>
            <div className={`text-4xl mb-2 text-${theme.accent}`}>G</div>
            <p>No games found for the selected filter</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
