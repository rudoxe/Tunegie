import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LeaderboardTable from '../components/Leaderboard/LeaderboardTable';
import PersonalStats from '../components/Leaderboard/PersonalStats';
import AuthModal from '../components/Auth/AuthModal';
import GameDemo from '../components/Demo/GameDemo';

const Leaderboard = () => {
  const { isAuthenticated, API_BASE } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [personalStats, setPersonalStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('top_scores'); // top_scores, accuracy, recent
  const [gameMode, setGameMode] = useState('random');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/leaderboard.php?type=${activeTab}&game_mode=${gameMode}&limit=25`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch leaderboard');
      }
      
      setLeaderboardData(data);
    } catch (err) {
      setError(err.message);
      console.error('Leaderboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonalStats = async () => {
    if (!isAuthenticated()) return;
    
    try {
      const token = localStorage.getItem('tunegie_token');
      const response = await fetch(`${API_BASE}/user_stats.php`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setPersonalStats(data);
      }
    } catch (err) {
      console.error('Personal stats fetch error:', err);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab, gameMode]);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchPersonalStats();
    }
  }, [isAuthenticated()]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const getTabTitle = (tab) => {
    switch (tab) {
      case 'top_scores': return '🏆 Top Scores';
      case 'accuracy': return '🎯 Best Accuracy';
      case 'recent': return '⏰ Recent Games';
      default: return 'Leaderboard';
    }
  };

  if (loading && !leaderboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-green-400 text-xl">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-400 mb-2">🏆 Leaderboard</h1>
        <p className="text-green-200/80">See how you rank among other players</p>
      </div>

      {/* Authentication Prompt */}
      {!isAuthenticated() && (
        <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-yellow-300 font-medium">Want to see your stats?</h3>
              <p className="text-yellow-200/80 text-sm mt-1">
                Sign in to track your progress and compete on the leaderboard!
              </p>
            </div>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-green-600 hover:bg-green-700 text-black px-4 py-2 rounded-md font-medium transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      )}

      {/* Demo Game Section */}
      <div className="mb-8">
        <GameDemo />
      </div>

      {/* Personal Stats */}
      {isAuthenticated() && personalStats && (
        <PersonalStats stats={personalStats} />
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['top_scores', 'accuracy', 'recent'].map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === tab
                ? 'bg-green-600 text-black'
                : 'bg-gray-700 text-green-300 hover:bg-gray-600'
            }`}
          >
            {getTabTitle(tab)}
          </button>
        ))}
      </div>

      {/* Game Mode Filter */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <label className="text-green-300 font-medium">Game Mode:</label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'random', label: '🎲 Random Mix', icon: '🎲' },
            { value: 'artist', label: '🎤 Artist Challenge', icon: '🎤' },
            { value: 'genre', label: '🎼 Genre Expert', icon: '🎼' }
          ].map((mode) => (
            <button
              key={mode.value}
              onClick={() => setGameMode(mode.value)}
              className={`px-3 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                gameMode === mode.value
                  ? 'bg-green-600 text-black'
                  : 'bg-gray-700 text-green-300 hover:bg-gray-600'
              }`}
            >
              <span>{mode.icon}</span>
              <span className="hidden sm:inline">{mode.label.split(' ').slice(1).join(' ')}</span>
              <span className="sm:hidden">{mode.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-4 mb-6">
          <p className="text-red-300">❌ {error}</p>
          <button
            onClick={fetchLeaderboard}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Leaderboard Table */}
      {leaderboardData && (
        <LeaderboardTable 
          data={leaderboardData}
          loading={loading}
          activeTab={activeTab}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="register"
      />
    </div>
  );
};

export default Leaderboard;
