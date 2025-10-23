import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { API_BASE } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserProfile = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE}/backend/php/api/user/user-profile.php?id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok && !data.error) {
        setProfileData(data);
      } else {
        setError(data.error || 'Failed to load user profile');
      }
    } catch (error) {
      setError('Network error: Failed to load user profile');
      console.error('Profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.background} flex items-center justify-center p-4 transition-all duration-500`}>
        <div className="text-center">
          <div className={`w-12 h-12 border-4 border-${theme.primary} border-t-transparent rounded-full animate-spin mx-auto mb-4`}></div>
          <p className={`text-${theme.text} text-xl animate-pulse`}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.background} flex items-center justify-center p-4 transition-all duration-500`}>
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4`}>
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className={`bg-${theme.primary} hover:bg-${theme.primaryHover} text-white px-4 py-2 rounded-md transition-all duration-200`}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { user, stats, recent_games, leaderboard_position } = profileData;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.background} p-4 transition-all duration-500`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className={`text-${theme.primary} hover:text-${theme.primaryHover} mb-4 flex items-center gap-2 transition-colors duration-200`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className={`text-3xl font-bold text-${theme.text} animate-fade-in`}>
            {user.username}'s Profile
          </h1>
        </div>

        {/* Profile Overview */}
        <div className={`bg-${theme.surface} rounded-lg p-6 border border-${theme.surfaceBorder} mb-6 transition-all duration-300`}>
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              {user.profile_picture ? (
                <>
                  <img
                    src={`${API_BASE}/backend/php/serve_image.php?path=${user.profile_picture}`}
                    alt={user.username}
                    className={`w-24 h-24 rounded-full object-cover border-4 border-${theme.primary} transition-all duration-300 hover:scale-110`}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = e.target.parentNode.querySelector('.fallback-avatar');
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className={`fallback-avatar w-24 h-24 rounded-full bg-gray-700 border-4 border-${theme.primary} items-center justify-center`} style={{display: 'none'}}>
                    <svg className={`w-12 h-12 text-${theme.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </>
              ) : (
                <div className={`w-24 h-24 rounded-full bg-gray-700 border-4 border-${theme.primary} flex items-center justify-center`}>
                  <svg className={`w-12 h-12 text-${theme.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className={`text-2xl font-bold text-${theme.text} mb-2`}>{user.username}</h2>
              <p className={`text-${theme.textMuted} mb-1`}>
                Member since {formatDate(user.created_at)}
              </p>
              {leaderboard_position && (
                <p className={`text-${theme.primary} font-medium`}>
                  Leaderboard Rank: #{leaderboard_position}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className={`bg-${theme.surface} rounded-lg p-6 border border-${theme.surfaceBorder} text-center transition-all duration-300 hover:${theme.glow}/20`}>
              <div className={`text-3xl font-bold text-${theme.primary} mb-2`}>
                {stats.total_games_played || 0}
              </div>
              <div className={`text-${theme.textSecondary} text-sm`}>Games Played</div>
            </div>

            <div className={`bg-${theme.surface} rounded-lg p-6 border border-${theme.surfaceBorder} text-center transition-all duration-300 hover:${theme.glow}/20`}>
              <div className={`text-3xl font-bold text-${theme.accent} mb-2`}>
                {stats.best_score || 0}
              </div>
              <div className={`text-${theme.textSecondary} text-sm`}>Best Score</div>
            </div>

            <div className={`bg-${theme.surface} rounded-lg p-6 border border-${theme.surfaceBorder} text-center transition-all duration-300 hover:${theme.glow}/20`}>
              <div className={`text-3xl font-bold text-${theme.primaryLight} mb-2`}>
                {stats.best_accuracy ? `${parseFloat(stats.best_accuracy).toFixed(1)}%` : '0%'}
              </div>
              <div className={`text-${theme.textSecondary} text-sm`}>Best Accuracy</div>
            </div>
          </div>
        )}

        {/* Recent Games */}
        <div className={`bg-${theme.surface} rounded-lg p-6 border border-${theme.surfaceBorder} transition-all duration-300`}>
          <h3 className={`text-xl font-semibold text-${theme.text} mb-4`}>Recent Games</h3>
          
          {recent_games && recent_games.length > 0 ? (
            <div className="space-y-3">
              {recent_games.map((game, index) => (
                <div
                  key={game.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-${theme.surfaceBorder}/20 rounded-lg border border-${theme.surfaceBorder}/50 transition-all duration-200 hover:bg-${theme.surfaceBorder}/30`}
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-4 mb-2 sm:mb-0">
                      <span className={`text-${theme.text} font-medium`}>
                        Score: {game.score}
                      </span>
                      <span className={`text-${theme.textSecondary} text-sm`}>
                        {game.correct_answers}/{game.total_rounds} correct
                      </span>
                      <span className={`text-${theme.textSecondary} text-sm`}>
                        {game.game_mode}
                      </span>
                    </div>
                    <div className={`text-${theme.textMuted} text-xs`}>
                      {formatDate(game.session_started_at)}
                    </div>
                  </div>
                  <div className={`text-${theme.primary} font-bold text-lg mt-2 sm:mt-0`}>
                    {game.total_rounds > 0 ? `${Math.round((game.correct_answers / game.total_rounds) * 100)}%` : '0%'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className={`w-16 h-16 rounded-full bg-${theme.surfaceBorder}/20 flex items-center justify-center mx-auto mb-4`}>
                <svg className={`w-8 h-8 text-${theme.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className={`text-${theme.textMuted}`}>No games played yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;