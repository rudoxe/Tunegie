import React from 'react';

const LeaderboardTable = ({ data, loading, activeTab }) => {
  if (loading) {
    return (
      <div className="bg-black/50 rounded-lg p-6">
        <div className="text-center text-green-400">Loading...</div>
      </div>
    );
  }

  if (!data || !data.leaderboard || data.leaderboard.length === 0) {
    return (
      <div className="bg-black/50 rounded-lg p-6">
        <div className="text-center text-green-200/60">
          <p className="text-xl mb-2">🎵 No games played yet</p>
          <p>Be the first to set a high score!</p>
        </div>
      </div>
    );
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-yellow-400';
      default: return 'text-gray-400';
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
    <div className="bg-black/50 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-green-500/30">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-green-400">
            {data.type === 'top_scores' && '🏆 Top Scores'}
            {data.type === 'accuracy' && '🎯 Best Accuracy'}
            {data.type === 'recent' && '⏰ Recent Games'}
          </h2>
          <div className="text-green-200/60 text-sm">
            Showing {data.showing} of {data.total_entries} players
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800/50">
            <tr>
              {getTableHeaders().map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-green-300 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/30">
            {data.leaderboard.map((entry, index) => (
              <tr
                key={entry.user_id + entry.achieved_at}
                className={`hover:bg-gray-800/30 transition-colors ${
                  entry.rank <= 3 ? 'bg-yellow-600/10' : ''
                }`}
              >
                {/* Rank (except for recent) */}
                {activeTab !== 'recent' && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-green-400">
                        {getRankIcon(entry.rank)}
                      </span>
                    </div>
                  </td>
                )}
                
                {/* Player */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-green-200">
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
                      <div className="text-sm font-bold text-green-400">
                        {entry.accuracy_formatted}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-green-200">
                        {entry.score.toLocaleString()} pts
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-400">
                        {entry.score.toLocaleString()} pts
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-green-200">
                        {entry.accuracy_formatted}
                      </div>
                    </td>
                  </>
                )}

                {/* Rounds */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-green-200">
                    {entry.correct_answers}/{entry.total_rounds}
                  </div>
                </td>

                {/* Date */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-green-200/60">
                    {entry.achieved_at_formatted}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-800/30 border-t border-green-500/30">
        <div className="text-center text-green-200/60 text-sm">
          {data.type === 'top_scores' && '🏆 Showing highest scores across all players'}
          {data.type === 'accuracy' && '🎯 Showing most accurate players (minimum 5 rounds)'}
          {data.type === 'recent' && '⏰ Showing most recent completed games'}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardTable;
