import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const AchievementView = () => {
  const { token, API_BASE, isAuthenticated, user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, earned, locked
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    console.log('AchievementView auth state:', {
      authLoading,
      hasUser: !!user,
      hasToken: !!token,
      isAuth: isAuthenticated()
    });
    
    // Wait for auth loading to complete
    if (authLoading) {
      console.log('Auth still loading, waiting...');
      return;
    }
    
    // Redirect if not authenticated
    if (!user || !isAuthenticated()) {
      console.log('Not authenticated, redirecting to profile...');
      window.location.href = '/profile';
      return;
    }
    
    console.log('User authenticated, fetching achievements...');
    fetchAchievements();
  }, [user, authLoading, isAuthenticated, token]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      // Use the same API base pattern as other components
      const apiUrl = `${API_BASE}/backend/php/api/user/achievements.php`;
      console.log('Fetching achievements from:', apiUrl);
      console.log('User authenticated:', !!user);
      console.log('Token exists:', !!token);
      console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'No token');
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status, response.statusText);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed - please log in again');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Achievement data received:', data);
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setAchievements(data.achievements || []);
    } catch (err) {
      console.error('Achievement fetch error:', err);
      
      // If authentication failed, try the public endpoint as fallback
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        console.log('Auth failed, trying public endpoint...');
        try {
          const publicUrl = `${API_BASE}/backend/php/api/user/achievements-public.php`;
          const publicResponse = await fetch(publicUrl);
          
          if (publicResponse.ok) {
            const publicData = await publicResponse.json();
            setAchievements(publicData.achievements || []);
            setError('Viewing public achievements (no progress data). Please log in for personalized achievements.');
            return;
          }
        } catch (publicErr) {
          console.error('Public endpoint also failed:', publicErr);
        }
      }
      
      setError(err.message || 'Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const getAchievementColor = (color, isEarned) => {
    const colors = {
      'bronze': isEarned ? 'from-amber-700 to-amber-800' : 'from-gray-600 to-gray-700',
      'silver': isEarned ? 'from-gray-300 to-gray-500' : 'from-gray-600 to-gray-700', 
      'gold': isEarned ? 'from-yellow-400 to-yellow-600' : 'from-gray-600 to-gray-700',
      'purple': isEarned ? 'from-purple-500 to-purple-700' : 'from-gray-600 to-gray-700',
      'blue': isEarned ? 'from-blue-500 to-blue-700' : 'from-gray-600 to-gray-700',
      'green': isEarned ? 'from-green-500 to-green-700' : 'from-gray-600 to-gray-700',
      'red': isEarned ? 'from-red-500 to-red-700' : 'from-gray-600 to-gray-700'
    };
    return colors[color] || colors['bronze'];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not earned';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const filteredAchievements = achievements.filter(achievement => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'earned' && achievement.is_earned) ||
                         (filter === 'locked' && !achievement.is_earned);
    
    const matchesSearch = !searchTerm || 
                         achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const earnedCount = achievements.filter(a => a.is_earned).length;
  const totalPoints = achievements.filter(a => a.is_earned).reduce((sum, a) => sum + (a.points || 0), 0);

  // Show loading while auth is loading or while we're fetching achievements
  if (authLoading || loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.background} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`w-12 h-12 border-4 border-${theme.primary} border-t-transparent rounded-full animate-spin mx-auto mb-4`}></div>
          <p className={`text-${theme.text} text-lg`}>
            {authLoading ? 'Checking authentication...' : 'Loading achievements...'}
          </p>
        </div>
      </div>
    );
  }

  // Only show error screen if we have a real error AND no achievements to show
  if (error && achievements.length === 0 && !error.includes('public achievements')) {
    const isAuthError = error.includes('log in') || error.includes('Unauthorized') || error.includes('token');
    
    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.background} flex items-center justify-center`}>
        <div className="text-center max-w-md mx-auto">
          <div className="text-6xl mb-4">{isAuthError ? '🔒' : '❌'}</div>
          <h2 className="text-red-400 text-2xl font-bold mb-2">
            {isAuthError ? 'Authentication Required' : 'Error Loading Achievements'}
          </h2>
          <p className={`text-${theme.textMuted} mb-4`}>{error}</p>
          
          {isAuthError ? (
            <div className="space-y-3">
              <button 
                onClick={() => window.location.href = '/login'}
                className={`bg-${theme.primary} hover:bg-${theme.primaryHover} text-white px-6 py-2 rounded-lg transition w-full`}
              >
                Go to Login
              </button>
              <button 
                onClick={() => window.history.back()}
                className={`bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg transition w-full`}
              >
                Back to Profile
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button 
                onClick={fetchAchievements}
                className={`bg-${theme.primary} hover:bg-${theme.primaryHover} text-white px-6 py-2 rounded-lg transition w-full`}
              >
                Try Again
              </button>
              <button 
                onClick={() => window.history.back()}
                className={`bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg transition w-full`}
              >
                Back to Profile
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.background} p-4`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className={`text-4xl font-bold text-${theme.text} mb-2`}>🏆 Achievements</h1>
            <p className={`text-${theme.textMuted}`}>
              Track your progress and unlock rewards
            </p>
          </div>
          
          {/* Stats Summary */}
          <div className="flex gap-4 mt-4 md:mt-0">
            <div className={`bg-${theme.surface} rounded-lg p-4 text-center border border-${theme.surfaceBorder}`}>
              <div className={`text-2xl font-bold text-${theme.primary}`}>{earnedCount}</div>
              <div className={`text-${theme.textMuted} text-sm`}>Earned</div>
            </div>
            <div className={`bg-${theme.surface} rounded-lg p-4 text-center border border-${theme.surfaceBorder}`}>
              <div className="text-2xl font-bold text-yellow-500">{totalPoints}</div>
              <div className={`text-${theme.textMuted} text-sm`}>Points</div>
            </div>
          </div>
        </div>

        {/* Auth Warning Banner */}
        {error && error.includes('public achievements') && (
          <div className="bg-yellow-600/20 border border-yellow-500/40 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl">⚠️</div>
              <h3 className="text-yellow-300 font-bold text-lg">Limited View</h3>
            </div>
            <div className="text-yellow-200/90">
              <p className="font-medium mb-1">You're viewing public achievements without progress data.</p>
              <p className="text-sm">Log in to see your personal progress, earned achievements, and unlock rewards!</p>
            </div>
            <div className="flex gap-3 mt-3">
              <button
                onClick={() => window.location.href = '/login'}
                className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-medium text-sm transition"
              >
                Log In Now
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

        {/* Progress Bar */}
        <div className={`bg-${theme.surface} rounded-lg p-6 border border-${theme.surfaceBorder} mb-6`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className={`text-lg font-semibold text-${theme.text}`}>Overall Progress</h3>
            <span className={`text-${theme.textMuted} text-sm`}>
              {Math.round((earnedCount / Math.max(achievements.length, 1)) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className={`bg-gradient-to-r from-${theme.primary} to-${theme.primaryHover} h-3 rounded-full transition-all duration-500`}
              style={{ width: `${(earnedCount / Math.max(achievements.length, 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className={`bg-${theme.surface} rounded-lg p-6 border border-${theme.surfaceBorder} mb-6`}>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Filter Buttons */}
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'All', count: achievements.length },
                { id: 'earned', label: 'Earned', count: earnedCount },
                { id: 'locked', label: 'Locked', count: achievements.length - earnedCount }
              ].map((filterOption) => (
                <button
                  key={filterOption.id}
                  onClick={() => setFilter(filterOption.id)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                    filter === filterOption.id
                      ? `bg-${theme.primary} text-white`
                      : `bg-gray-700 text-${theme.textMuted} hover:bg-gray-600`
                  }`}
                >
                  {filterOption.label} ({filterOption.count})
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="w-full md:w-64">
              <input
                type="text"
                placeholder="Search achievements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-${theme.primary} focus:border-transparent`}
              />
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAchievements.length > 0 ? (
            filteredAchievements.map((achievement) => (
              <div 
                key={achievement.id}
                className={`bg-gradient-to-br ${getAchievementColor(achievement.color, achievement.is_earned)} 
                          p-6 rounded-xl border border-white/20 text-center transition-all duration-300 
                          hover:scale-105 hover:shadow-lg ${achievement.is_earned ? '' : 'opacity-60'}`}
              >
                {/* Achievement Icon */}
                <div className={`text-5xl mb-3 ${achievement.is_earned ? '' : 'grayscale'}`}>
                  {achievement.icon || '🏆'}
                </div>

                {/* Achievement Name */}
                <h3 className="text-white font-bold text-lg mb-2">
                  {achievement.name}
                </h3>

                {/* Achievement Description */}
                <p className="text-white/90 text-sm mb-3">
                  {achievement.description}
                </p>

                {/* Points */}
                <div className="text-yellow-300 font-bold text-sm mb-2">
                  +{achievement.points} points
                </div>

                {/* Status */}
                {achievement.is_earned ? (
                  <div className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-medium">
                    ✓ Earned {formatDate(achievement.earned_at)}
                  </div>
                ) : (
                  <div className="bg-gray-500/20 text-gray-300 px-3 py-1 rounded-full text-xs font-medium">
                    🔒 Not unlocked yet
                  </div>
                )}

                {/* Progress (if available) */}
                {achievement.progress !== undefined && !achievement.is_earned && (
                  <div className="mt-3">
                    <div className="text-white/70 text-xs mb-1">
                      Progress: {achievement.progress}/{achievement.target}
                    </div>
                    <div className="w-full bg-black/30 rounded-full h-2">
                      <div 
                        className="bg-white/50 h-2 rounded-full transition-all"
                        style={{ 
                          width: `${Math.min((achievement.progress / achievement.target) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className={`text-${theme.text} text-xl font-bold mb-2`}>No achievements found</h3>
              <p className={`text-${theme.textMuted}`}>
                {searchTerm 
                  ? `No achievements match "${searchTerm}"`
                  : filter === 'earned' 
                    ? "You haven't earned any achievements yet. Start playing to unlock them!"
                    : filter === 'locked' 
                      ? "All achievements unlocked! You're amazing!"
                      : "No achievements available at the moment."
                }
              </p>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => window.history.back()}
            className={`bg-${theme.surface} hover:bg-gray-700 text-${theme.text} px-6 py-3 rounded-lg font-medium border border-${theme.surfaceBorder} transition`}
          >
            ← Back to Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default AchievementView;