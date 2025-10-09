<?php

class AchievementSystem {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    
    /**
     * Check and award achievements for a user after completing a game
     */
    public function checkAndAwardAchievements($userId, $gameData = []) {
        $newAchievements = [];
        
        try {
            // Get user statistics
            $userStats = $this->getUserStats($userId);
            
            // Get all achievements
            $achievements = $this->getAllAchievements();
            
            // Check each achievement
            foreach ($achievements as $achievement) {
                if (!$this->hasAchievement($userId, $achievement['id'])) {
                    if ($this->checkAchievementCondition($userId, $achievement, $userStats, $gameData)) {
                        $this->awardAchievement($userId, $achievement['id']);
                        $newAchievements[] = $achievement;
                    }
                }
            }
            
            return $newAchievements;
        } catch (Exception $e) {
            error_log("Achievement system error: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get user statistics for achievement checking
     */
    private function getUserStats($userId) {
        $stmt = $this->pdo->prepare("
            SELECT 
                us.*,
                COALESCE(ds.current_streak, 0) as current_play_streak,
                COALESCE(ds.longest_streak, 0) as longest_play_streak,
                (SELECT COUNT(*) FROM leaderboards WHERE user_id = ?) as total_games_from_leaderboard,
                (SELECT SUM(score) FROM leaderboards WHERE user_id = ?) as total_score_from_leaderboard,
                (SELECT MAX(score) FROM leaderboards WHERE user_id = ?) as best_score_from_leaderboard,
                (SELECT SUM(total_rounds) FROM leaderboards WHERE user_id = ?) as total_rounds_from_leaderboard
            FROM user_statistics us
            LEFT JOIN daily_streaks ds ON us.user_id = ds.user_id AND ds.streak_type = 'play_game'
            WHERE us.user_id = ?
        ");
        $stmt->execute([$userId, $userId, $userId, $userId, $userId]);
        $stats = $stmt->fetch();
        
        if (!$stats) {
            // Create default stats if none exist
            $this->createDefaultUserStats($userId);
            return $this->getUserStats($userId);
        }
        
        return $stats;
    }
    
    /**
     * Create default user statistics
     */
    private function createDefaultUserStats($userId) {
        $stmt = $this->pdo->prepare("
            INSERT IGNORE INTO user_statistics (user_id) VALUES (?)
        ");
        $stmt->execute([$userId]);
        
        $stmt = $this->pdo->prepare("
            INSERT IGNORE INTO daily_streaks (user_id, streak_type) VALUES (?, 'play_game')
        ");
        $stmt->execute([$userId]);
    }
    
    /**
     * Get all achievements from database
     */
    private function getAllAchievements() {
        $stmt = $this->pdo->prepare("SELECT * FROM achievements ORDER BY category, condition_value ASC");
        $stmt->execute();
        return $stmt->fetchAll();
    }
    
    /**
     * Check if user already has a specific achievement
     */
    private function hasAchievement($userId, $achievementId) {
        $stmt = $this->pdo->prepare("
            SELECT COUNT(*) FROM user_achievements 
            WHERE user_id = ? AND achievement_id = ?
        ");
        $stmt->execute([$userId, $achievementId]);
        return $stmt->fetchColumn() > 0;
    }
    
    /**
     * Check if achievement condition is met
     */
    private function checkAchievementCondition($userId, $achievement, $userStats, $gameData) {
        $type = $achievement['type'];
        $thresholdType = $achievement['threshold_type'];
        $thresholdValue = $achievement['threshold_value'];
        
        switch ($type) {
            case 'score':
                if ($thresholdType === 'single_game') {
                    return isset($gameData['score']) && $gameData['score'] >= $thresholdValue;
                } elseif ($thresholdType === 'total') {
                    return ($userStats['total_score_from_leaderboard'] ?? 0) >= $thresholdValue;
                }
                break;
                
            case 'games':
                if ($thresholdType === 'total') {
                    return ($userStats['total_games_from_leaderboard'] ?? 0) >= $thresholdValue;
                }
                break;
                
            case 'accuracy':
                if ($thresholdType === 'single_game') {
                    return isset($gameData['accuracy']) && $gameData['accuracy'] >= $thresholdValue;
                }
                break;
                
            case 'streak':
                return ($userStats['current_play_streak'] ?? 0) >= $thresholdValue;
                
            case 'rounds':
                return ($userStats['total_rounds_from_leaderboard'] ?? 0) >= $thresholdValue;
        }
        
        return false;
    }
    
    /**
     * Award achievement to user
     */
    private function awardAchievement($userId, $achievementId) {
        $stmt = $this->pdo->prepare("
            INSERT IGNORE INTO user_achievements (user_id, achievement_id, earned_at)
            VALUES (?, ?, NOW())
        ");
        $stmt->execute([$userId, $achievementId]);
    }
    
    /**
     * Update daily streak for user
     */
    public function updateDailyStreak($userId, $streakType = 'play_game') {
        try {
            $today = date('Y-m-d');
            
            // Get current streak info
            $stmt = $this->pdo->prepare("
                SELECT * FROM daily_streaks 
                WHERE user_id = ? AND streak_type = ?
            ");
            $stmt->execute([$userId, $streakType]);
            $streakData = $stmt->fetch();
            
        if (!$streakData) {
            // Create new streak record - start with streak of 1
            $stmt = $this->pdo->prepare("
                INSERT INTO daily_streaks (user_id, streak_type, current_streak, longest_streak, last_activity_date)
                VALUES (?, ?, 1, 1, ?)
            ");
            $stmt->execute([$userId, $streakType, $today]);
            return ['current_streak' => 1, 'longest_streak' => 1, 'streak_continued' => true, 'is_new_streak' => true];
        }
            
            $lastActivityDate = $streakData['last_activity_date'];
            $currentStreak = $streakData['current_streak'];
            $longestStreak = $streakData['longest_streak'];
            
        // If already active today, no update needed
        if ($lastActivityDate === $today) {
            return [
                'current_streak' => $currentStreak,
                'longest_streak' => $longestStreak,
                'streak_continued' => false,
                'already_active_today' => true
            ];
        }
            
            // Calculate days difference
            $lastDate = new DateTime($lastActivityDate);
            $currentDate = new DateTime($today);
            $daysDiff = $lastDate->diff($currentDate)->days;
            
            if ($daysDiff == 1) {
                // Consecutive day - continue streak
                $newCurrentStreak = $currentStreak + 1;
                $newLongestStreak = max($longestStreak, $newCurrentStreak);
            } else {
                // Streak broken - start new streak
                $newCurrentStreak = 1;
                $newLongestStreak = $longestStreak;
            }
            
            // Update streak
            $stmt = $this->pdo->prepare("
                UPDATE daily_streaks 
                SET current_streak = ?, longest_streak = ?, last_activity_date = ?, updated_at = NOW()
                WHERE user_id = ? AND streak_type = ?
            ");
            $stmt->execute([$newCurrentStreak, $newLongestStreak, $today, $userId, $streakType]);
            
            return [
                'current_streak' => $newCurrentStreak,
                'longest_streak' => $newLongestStreak,
                'streak_continued' => $daysDiff == 1
            ];
            
        } catch (Exception $e) {
            error_log("Streak update error: " . $e->getMessage());
            return ['current_streak' => 0, 'longest_streak' => 0, 'streak_continued' => false];
        }
    }
    
    /**
     * Get user's achievements with progress
     */
    public function getUserAchievements($userId) {
        try {
            $stmt = $this->pdo->prepare("
                SELECT 
                    a.*,
                    ua.earned_at,
                    CASE WHEN ua.id IS NOT NULL THEN TRUE ELSE FALSE END as is_completed
                FROM achievements a
                LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
                ORDER BY 
                    CASE WHEN ua.id IS NOT NULL THEN 1 ELSE 0 END,
                    a.type, 
                    a.threshold_value ASC
            ");
            $stmt->execute([$userId]);
            $achievements = $stmt->fetchAll();
            
            // Calculate progress for incomplete achievements
            $userStats = $this->getUserStats($userId);
            
            foreach ($achievements as &$achievement) {
                if (!$achievement['is_completed']) {
                    $achievement['progress'] = $this->calculateAchievementProgress($achievement, $userStats);
                    $achievement['progress_percentage'] = min(100, ($achievement['progress'] / $achievement['threshold_value']) * 100);
                } else {
                    $achievement['progress'] = $achievement['threshold_value'];
                    $achievement['progress_percentage'] = 100;
                }
            }
            
            return $achievements;
        } catch (Exception $e) {
            error_log("Get user achievements error: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Calculate current progress towards an achievement
     */
    private function calculateAchievementProgress($achievement, $userStats) {
        $type = $achievement['type'];
        $thresholdType = $achievement['threshold_type'];
        
        switch ($type) {
            case 'games':
                if ($thresholdType === 'total') {
                    return $userStats['total_games_from_leaderboard'] ?? 0;
                }
                break;
                
            case 'score':
                if ($thresholdType === 'total') {
                    return $userStats['total_score_from_leaderboard'] ?? 0;
                } elseif ($thresholdType === 'single_game') {
                    return $userStats['best_score_from_leaderboard'] ?? 0;
                }
                break;
                
            case 'streak':
                return $userStats['current_play_streak'] ?? 0;
                
            case 'rounds':
                return $userStats['total_rounds_from_leaderboard'] ?? 0;
                
            case 'accuracy':
                return $userStats['best_accuracy'] ?? 0;
        }
        
        return 0;
    }
    
    /**
     * Get user's current streak info
     */
    public function getUserStreakInfo($userId, $streakType = 'play_game') {
        try {
            $stmt = $this->pdo->prepare("
                SELECT 
                    current_streak,
                    longest_streak,
                    last_activity_date,
                    CASE 
                        WHEN last_activity_date = CURDATE() THEN TRUE 
                        ELSE FALSE 
                    END as played_today
                FROM daily_streaks 
                WHERE user_id = ? AND streak_type = ?
            ");
            $stmt->execute([$userId, $streakType]);
            $result = $stmt->fetch();
            
            if (!$result) {
                return [
                    'current_streak' => 0,
                    'longest_streak' => 0,
                    'last_activity_date' => null,
                    'played_today' => false
                ];
            }
            
            return $result;
        } catch (Exception $e) {
            error_log("Get user streak info error: " . $e->getMessage());
            return [
                'current_streak' => 0,
                'longest_streak' => 0,
                'last_activity_date' => null,
                'played_today' => false
            ];
        }
    }
}

?>