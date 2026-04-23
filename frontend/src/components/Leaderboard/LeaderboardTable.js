import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const LeaderboardTable = ({ data, loading, activeTab }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleUserClick = (userId) => {
    navigate(`/user/${userId}`);
  };

  if (loading) {
    return (
      <div className={`bg-${theme.cardBg} rounded-lg p-6 animate-glow-pulse`}>
        <div className={`text-center text-${theme.accent}`}>Loading...</div>
      </div>
    );
  }

  if (!data || !data.leaderboard || data.leaderboard.length === 0) {
    return (
      <div className={`bg-${theme.cardBg} rounded-lg p-6 animate-fade-in`}>
        <div className={`text-center text-${theme.textMuted}`}>
          <p className={`text-xl mb-2 text-${theme.accent}`}>No games played yet</p>
          <p>Be the first to set a high score!</p>
        </div>
      </div>
    );
  }

  const getRankLabel = (rank) => {
    switch (rank) {
      case 1: return '🥇 1st';
      case 2: return '🥈 2nd';
      case 3: return '🥉 3rd';
      default: return `#${rank}`;
    }
  };

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case 'excellent': return `text-${theme.accent}`;
      case 'good': return `text-${theme.text}`;
      default: return `text-${theme.textMuted}`;
    }
  };

  return (
    <div className={`bg-${theme.cardBg} rounded-lg overflow-hidden border border-${theme.accent}/20 animate-slide-in transition-all duration-300`}>
      {/* Header */}
      <div className={`px-4 sm:px-6 py-4 border-b border-${theme.accent}/30`}>
        <div className="flex items-center justify-between">
          <h2 className={`text-lg sm:text-xl font-bold text-${theme.accent}`}>
            {data.type === 'top_scores' && '🏆 Top Scores'}
            {data.type === 'accuracy' && '🎯 Best Accuracy'}
            {data.type === 'recent' && '⏰ Recent Games'}
          </h2>
          <div className={`text-${theme.textMuted} text-xs sm:text-sm`}>
            {data.showing}/{data.total_entries}
          </div>
        </div>
      </div>

      {/* Desktop Table — hidden on mobile */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead className={`bg-${theme.bgDark}`}>
            <tr>
              {activeTab !== 'recent' && (
                <th className={`px-4 py-3 text-left text-xs font-medium text-${theme.text} uppercase tracking-wider`}>Rank</th>
              )}
              <th className={`px-4 py-3 text-left text-xs font-medium text-${theme.text} uppercase tracking-wider`}>Player</th>
              {activeTab === 'accuracy' ? (
                <>
                  <th className={`px-4 py-3 text-left text-xs font-medium text-${theme.text} uppercase tracking-wider`}>Accuracy</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium text-${theme.text} uppercase tracking-wider`}>Score</th>
                </>
              ) : (
                <>
                  <th className={`px-4 py-3 text-left text-xs font-medium text-${theme.text} uppercase tracking-wider`}>Score</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium text-${theme.text} uppercase tracking-wider`}>Accuracy</th>
                </>
              )}
              <th className={`px-4 py-3 text-left text-xs font-medium text-${theme.text} uppercase tracking-wider`}>Rounds</th>
              <th className={`px-4 py-3 text-left text-xs font-medium text-${theme.text} uppercase tracking-wider`}>Date</th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-${theme.accent}/10`}>
            {data.leaderboard.map((entry) => (
              <tr
                key={entry.user_id + entry.achieved_at}
                className={`hover:bg-${theme.accent}/5 transition-colors ${entry.rank <= 3 ? `bg-${theme.accent}/10` : ''}`}
              >
                {activeTab !== 'recent' && (
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`font-bold ${entry.rank <= 3 ? `text-${theme.accent}` : `text-${theme.text}`}`}>
                      {getRankLabel(entry.rank)}
                    </span>
                  </td>
                )}
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    onClick={() => handleUserClick(entry.user_id)}
                    className={`text-sm font-medium text-${theme.primary} hover:underline transition-colors`}
                  >
                    {entry.username}
                  </button>
                  <div className={`text-xs ${getPerformanceColor(entry.performance)}`}>{entry.performance}</div>
                </td>
                {activeTab === 'accuracy' ? (
                  <>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-sm font-bold text-${theme.accent}`}>{entry.accuracy_formatted}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-sm text-${theme.text}`}>{entry.score.toLocaleString()} pts</span>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-sm font-bold text-${theme.accent}`}>{entry.score.toLocaleString()} pts</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-sm text-${theme.text}`}>{entry.accuracy_formatted}</span>
                    </td>
                  </>
                )}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`text-sm text-${theme.text}`}>{entry.correct_answers}/{entry.total_rounds}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`text-sm text-${theme.textMuted}`}>{entry.achieved_at_formatted}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards — shown only on small screens */}
      <div className="sm:hidden divide-y divide-gray-700/50">
        {data.leaderboard.map((entry) => (
          <div
            key={entry.user_id + entry.achieved_at}
            className={`px-4 py-3 ${entry.rank <= 3 ? `bg-${theme.accent}/10` : ''}`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <button
                onClick={() => handleUserClick(entry.user_id)}
                className={`font-semibold text-${theme.primary} hover:underline text-sm`}
              >
                {entry.username}
              </button>
              {activeTab !== 'recent' && (
                <span className={`text-sm font-bold ${entry.rank <= 3 ? `text-${theme.accent}` : `text-${theme.textMuted}`}`}>
                  {getRankLabel(entry.rank)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs flex-wrap">
              {activeTab === 'accuracy' ? (
                <>
                  <span className={`font-bold text-${theme.accent}`}>{entry.accuracy_formatted}</span>
                  <span className={`text-${theme.textMuted}`}>{entry.score.toLocaleString()} pts</span>
                </>
              ) : (
                <>
                  <span className={`font-bold text-${theme.accent}`}>{entry.score.toLocaleString()} pts</span>
                  <span className={`text-${theme.textMuted}`}>{entry.accuracy_formatted}</span>
                </>
              )}
              <span className={`text-${theme.textMuted}`}>{entry.correct_answers}/{entry.total_rounds} correct</span>
              <span className={`text-${theme.textMuted} ml-auto`}>{new Date(entry.achieved_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className={`px-4 sm:px-6 py-3 bg-${theme.bgDark} border-t border-${theme.accent}/30`}>
        <div className={`text-center text-${theme.textMuted} text-xs sm:text-sm`}>
          {data.type === 'top_scores' && 'Highest scores across all players'}
          {data.type === 'accuracy' && 'Most accurate players (min. 5 rounds)'}
          {data.type === 'recent' && 'Most recent completed games'}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardTable;
