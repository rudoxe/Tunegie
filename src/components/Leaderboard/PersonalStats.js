import React from 'react';

const PersonalStats = ({ stats }) => {
  if (!stats || !stats.statistics) {
    return (
      <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4 mb-6">
        <div className="text-center">
          <h3 className="text-blue-300 font-medium mb-2">🎯 Ready to start tracking?</h3>
          <p className="text-blue-200/80 text-sm">
            Play your first game to see your personal statistics here!
          </p>
        </div>
      </div>
    );
  }

  const { statistics, global_rank, performance_trend, recent_games } = stats;

  const getTrendIcon = (value) => {
    if (value > 0) return '📈';
    if (value < 0) return '📉';
    return '➖';
  };

  const getTrendColor = (value) => {
    if (value > 0) return 'text-green-400';
    if (value < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Personal Stats Overview */}
      <div className="lg:col-span-2 bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-lg p-6">
        <h3 className="text-xl font-bold text-green-400 mb-4">📊 Your Statistics</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {statistics.total_games_played}
            </div>
            <div className="text-sm text-green-200/80">Games Played</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {statistics.best_score.toLocaleString()}
            </div>
            <div className="text-sm text-green-200/80">Best Score</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {statistics.best_accuracy}%
            </div>
            <div className="text-sm text-green-200/80">Best Accuracy</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              #{global_rank}
            </div>
            <div className="text-sm text-green-200/80">Global Rank</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-green-500/30">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-green-200/80">Total Rounds: </span>
              <span className="text-green-200 font-medium">{statistics.total_rounds_played}</span>
            </div>
            <div>
              <span className="text-green-200/80">Correct Answers: </span>
              <span className="text-green-200 font-medium">{statistics.total_correct_answers}</span>
            </div>
            <div>
              <span className="text-green-200/80">Average Accuracy: </span>
              <span className="text-green-200 font-medium">{statistics.average_accuracy}%</span>
            </div>
            <div>
              <span className="text-green-200/80">Last Played: </span>
              <span className="text-green-200 font-medium">
                {statistics.last_played_at ? new Date(statistics.last_played_at).toLocaleDateString() : 'Never'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Trend */}
      <div className="bg-black/50 border border-green-500/30 rounded-lg p-6">
        <h3 className="text-lg font-bold text-green-400 mb-4">📈 Recent Trend</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-green-200/80 text-sm">Score Improvement</span>
            <div className="flex items-center gap-2">
              <span className={getTrendColor(performance_trend.score_improvement_percentage)}>
                {getTrendIcon(performance_trend.score_improvement_percentage)}
              </span>
              <span className={`font-medium ${getTrendColor(performance_trend.score_improvement_percentage)}`}>
                {performance_trend.score_improvement_percentage > 0 ? '+' : ''}
                {performance_trend.score_improvement_percentage}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-green-200/80 text-sm">Accuracy Change</span>
            <div className="flex items-center gap-2">
              <span className={getTrendColor(performance_trend.accuracy_improvement)}>
                {getTrendIcon(performance_trend.accuracy_improvement)}
              </span>
              <span className={`font-medium ${getTrendColor(performance_trend.accuracy_improvement)}`}>
                {performance_trend.accuracy_improvement > 0 ? '+' : ''}
                {performance_trend.accuracy_improvement}%
              </span>
            </div>
          </div>
          
          <div className="pt-3 border-t border-green-500/30">
            <div className="text-xs text-green-200/60">Recent Average</div>
            <div className="text-sm">
              <span className="text-green-200">Score: </span>
              <span className="font-medium">{performance_trend.recent_avg_score}</span>
            </div>
            <div className="text-sm">
              <span className="text-green-200">Accuracy: </span>
              <span className="font-medium">{performance_trend.recent_avg_accuracy}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Games */}
      {recent_games && recent_games.length > 0 && (
        <div className="lg:col-span-3 bg-black/50 border border-green-500/30 rounded-lg p-6">
          <h3 className="text-lg font-bold text-green-400 mb-4">🎮 Recent Games</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-green-300 border-b border-green-500/30">
                  <th className="text-left py-2">Score</th>
                  <th className="text-left py-2">Accuracy</th>
                  <th className="text-left py-2">Rounds</th>
                  <th className="text-left py-2">Mode</th>
                  <th className="text-left py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {recent_games.slice(0, 5).map((game, index) => (
                  <tr key={index} className="border-b border-gray-700/30">
                    <td className="py-2 font-medium text-green-400">
                      {game.score.toLocaleString()}
                    </td>
                    <td className="py-2 text-green-200">{game.accuracy_formatted}</td>
                    <td className="py-2 text-green-200">
                      {game.correct_answers}/{game.total_rounds}
                    </td>
                    <td className="py-2 text-green-200 capitalize">{game.game_mode}</td>
                    <td className="py-2 text-green-200/60">
                      {new Date(game.achieved_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalStats;
