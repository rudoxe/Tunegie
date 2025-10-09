import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const PersonalStats = ({ stats }) => {
  const { theme } = useTheme();

  if (!stats || !stats.statistics) {
    return (
      <div className={`bg-${theme.cardBg} border border-${theme.accent}/30 rounded-lg p-4 mb-6 animate-fade-in`}>
        <div className="text-center">
          <h3 className={`text-${theme.accent} font-medium mb-2`}>Ready to start tracking?</h3>
          <p className={`text-${theme.textMuted} text-sm`}>
            Play your first game to see your personal statistics here!
          </p>
        </div>
      </div>
    );
  }

  const { statistics, global_rank, performance_trend, recent_games } = stats;

  const getTrendIcon = (value) => {
    if (value > 0) return '↗';
    if (value < 0) return '↘';
    return '→';
  };

  const getTrendColor = (value) => {
    if (value > 0) return `text-${theme.accent}`;
    if (value < 0) return `text-${theme.accent}`;
    return `text-${theme.textMuted}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Personal Stats Overview */}
      <div className={`lg:col-span-2 bg-gradient-to-r from-${theme.accent}/20 to-${theme.accent}/10 border border-${theme.accent}/30 rounded-lg p-6 animate-slide-in transition-all duration-300 hover:glow`}>
        <h3 className={`text-xl font-bold text-${theme.accent} mb-4`}>Your Statistics</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold text-${theme.accent} animate-glow-pulse`}>
              {statistics.total_games_played}
            </div>
            <div className={`text-sm text-${theme.textMuted}`}>Games Played</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold text-${theme.accent} animate-glow-pulse`}>
              {statistics.best_score.toLocaleString()}
            </div>
            <div className={`text-sm text-${theme.textMuted}`}>Best Score</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold text-${theme.accent} animate-glow-pulse`}>
              {statistics.best_accuracy}%
            </div>
            <div className={`text-sm text-${theme.textMuted}`}>Best Accuracy</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold text-${theme.accent} animate-glow-pulse`}>
              #{global_rank}
            </div>
            <div className={`text-sm text-${theme.textMuted}`}>Global Rank</div>
          </div>
        </div>

        <div className={`mt-4 pt-4 border-t border-${theme.accent}/30`}>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className={`text-${theme.textMuted}`}>Total Rounds: </span>
              <span className={`text-${theme.text} font-medium`}>{statistics.total_rounds_played}</span>
            </div>
            <div>
              <span className={`text-${theme.textMuted}`}>Correct Answers: </span>
              <span className={`text-${theme.text} font-medium`}>{statistics.total_correct_answers}</span>
            </div>
            <div>
              <span className={`text-${theme.textMuted}`}>Average Accuracy: </span>
              <span className={`text-${theme.text} font-medium`}>{statistics.average_accuracy}%</span>
            </div>
            <div>
              <span className={`text-${theme.textMuted}`}>Last Played: </span>
              <span className={`text-${theme.text} font-medium`}>
                {statistics.last_played_at ? new Date(statistics.last_played_at).toLocaleDateString() : 'Never'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Trend */}
      <div className={`bg-${theme.cardBg} border border-${theme.accent}/30 rounded-lg p-6 animate-slide-in transition-all duration-300 hover:glow`}>
        <h3 className={`text-lg font-bold text-${theme.accent} mb-4`}>Recent Trend</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className={`text-${theme.textMuted} text-sm`}>Score Improvement</span>
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
            <span className={`text-${theme.textMuted} text-sm`}>Accuracy Change</span>
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
          
          <div className={`pt-3 border-t border-${theme.accent}/30`}>
            <div className={`text-xs text-${theme.textMuted}`}>Recent Average</div>
            <div className="text-sm">
              <span className={`text-${theme.text}`}>Score: </span>
              <span className="font-medium">{performance_trend.recent_avg_score}</span>
            </div>
            <div className="text-sm">
              <span className={`text-${theme.text}`}>Accuracy: </span>
              <span className="font-medium">{performance_trend.recent_avg_accuracy}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Games */}
      {recent_games && recent_games.length > 0 && (
        <div className={`lg:col-span-3 bg-${theme.cardBg} border border-${theme.accent}/30 rounded-lg p-6 animate-slide-in transition-all duration-300 hover:glow`}>
          <h3 className={`text-lg font-bold text-${theme.accent} mb-4`}>Recent Games</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-${theme.text} border-b border-${theme.accent}/30`}>
                  <th className="text-left py-2">Score</th>
                  <th className="text-left py-2">Accuracy</th>
                  <th className="text-left py-2">Rounds</th>
                  <th className="text-left py-2">Mode</th>
                  <th className="text-left py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {recent_games.slice(0, 5).map((game, index) => (
                  <tr key={index} className={`border-b border-${theme.accent}/10 hover:bg-${theme.accent}/5 transition-colors`}>
                    <td className={`py-2 font-medium text-${theme.accent}`}>
                      {game.score.toLocaleString()}
                    </td>
                    <td className={`py-2 text-${theme.text}`}>{game.accuracy_formatted}</td>
                    <td className={`py-2 text-${theme.text}`}>
                      {game.correct_answers}/{game.total_rounds}
                    </td>
                    <td className={`py-2 text-${theme.text} capitalize`}>{game.game_mode}</td>
                    <td className={`py-2 text-${theme.textMuted}`}>
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
