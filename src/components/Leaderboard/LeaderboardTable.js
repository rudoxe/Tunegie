import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const LeaderboardTable = ({ data, loading, activeTab }) => {
  const { theme } = useTheme();

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

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '1st';
      case 2: return '2nd';
      case 3: return '3rd';
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

  const getTableHeaders = () => {
    switch (activeTab) {
      case 'accuracy':
        return ['Rank', 'Player', 'Accuracy', 'Score', 'Rounds', 'Date'];
      case 'recent':
        return ['Player', 'Score', 'Accuracy', 'Rounds', 'Date'];
      default:
        return ['Rank', 'Player', 'Score', 'Accuracy', 'Rounds', 'Date'];
    }
  };

  return (
    <div className={`bg-${theme.cardBg} rounded-lg overflow-hidden border border-${theme.accent}/20 animate-slide-in transition-all duration-300 hover:glow`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b border-${theme.accent}/30`}>
        <div className="flex items-center justify-between">
          <h2 className={`text-xl font-bold text-${theme.accent}`}>
            {data.type === 'top_scores' && 'Top Scores'}
            {data.type === 'accuracy' && 'Best Accuracy'}
            {data.type === 'recent' && 'Recent Games'}
          </h2>
          <div className={`text-${theme.textMuted} text-sm`}>
            Showing {data.showing} of {data.total_entries} players
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={`bg-${theme.bgDark}`}>
            <tr>
              {getTableHeaders().map((header, index) => (
                <th
                  key={index}
                  className={`px-6 py-3 text-left text-xs font-medium text-${theme.text} uppercase tracking-wider`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y divide-${theme.accent}/10`}>
            {data.leaderboard.map((entry, index) => (
              <tr
                key={entry.user_id + entry.achieved_at}
                className={`hover:bg-${theme.accent}/5 transition-colors ${
                  entry.rank <= 3 ? `bg-${theme.accent}/10` : ''
                }`}
              >
                {/* Rank (except for recent) */}
                {activeTab !== 'recent' && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`text-lg font-bold ${entry.rank <= 3 ? `text-${theme.accent} animate-glow-pulse` : `text-${theme.text}`}`}>
                        {getRankIcon(entry.rank)}
                      </span>
                    </div>
                  </td>
                )}
                
                {/* Player */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className={`text-sm font-medium text-${theme.text}`}>
                        {entry.username}
                      </div>
                      <div className={`text-xs ${getPerformanceColor(entry.performance)}`}>
                        {entry.performance}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Score or Accuracy (depending on tab) */}
                {activeTab === 'accuracy' ? (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-bold text-${theme.accent}`}>
                        {entry.accuracy_formatted}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm text-${theme.text}`}>
                        {entry.score.toLocaleString()} pts
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-bold text-${theme.accent}`}>
                        {entry.score.toLocaleString()} pts
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm text-${theme.text}`}>
                        {entry.accuracy_formatted}
                      </div>
                    </td>
                  </>
                )}

                {/* Rounds */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm text-${theme.text}`}>
                    {entry.correct_answers}/{entry.total_rounds}
                  </div>
                </td>

                {/* Date */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm text-${theme.textMuted}`}>
                    {entry.achieved_at_formatted}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className={`px-6 py-3 bg-${theme.bgDark} border-t border-${theme.accent}/30`}>
        <div className={`text-center text-${theme.textMuted} text-sm`}>
          {data.type === 'top_scores' && 'Showing highest scores across all players'}
          {data.type === 'accuracy' && 'Showing most accurate players (minimum 5 rounds)'}
          {data.type === 'recent' && 'Showing most recent completed games'}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardTable;
