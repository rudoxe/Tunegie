import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeSelector = () => {
  const { theme, themes, currentTheme, changeTheme } = useTheme();

  return (
    <div className={`bg-${theme.surface} rounded-lg p-6 border border-${theme.surfaceBorder} transition-all duration-300`}>
      <h3 className={`text-xl font-semibold text-${theme.text} mb-4`}>Choose Your Style</h3>
      <p className={`text-${theme.textMuted} text-sm mb-6`}>
        Select a theme that matches your vibe
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(themes).map(([themeKey, themeData]) => (
          <div
            key={themeKey}
            onClick={() => changeTheme(themeKey)}
            className={`relative cursor-pointer rounded-lg p-4 transition-all duration-300 hover:scale-105 border-2 ${
              currentTheme === themeKey 
                ? `border-${themeData.primary} ${themeData.glow}` 
                : `border-gray-600 hover:border-${themeData.primary}/50`
            }`}
          >
            {/* Theme Preview */}
            <div className={`bg-gradient-to-br ${themeData.background} rounded-md p-3 mb-3 h-16 relative overflow-hidden`}>
              <div className={`w-4 h-4 rounded-full bg-${themeData.primary} absolute top-2 left-2 animate-pulse`}></div>
              <div className={`text-xs text-${themeData.text} absolute bottom-1 left-2`}>Aa</div>
              <div className={`w-2 h-2 rounded-full bg-${themeData.accent} absolute top-2 right-2`}></div>
            </div>
            
            {/* Theme Info */}
            <div className="text-center">
              <h4 className={`font-medium text-${theme.text} text-sm mb-1`}>
                {themeData.name}
              </h4>
              <div className="flex justify-center space-x-1">
                <div className={`w-2 h-2 rounded-full bg-${themeData.primary}`}></div>
                <div className={`w-2 h-2 rounded-full bg-${themeData.accent}`}></div>
                <div className={`w-2 h-2 rounded-full bg-${themeData.primaryLight}`}></div>
              </div>
            </div>
            
            {/* Active Indicator */}
            {currentTheme === themeKey && (
              <div className={`absolute -top-2 -right-2 w-6 h-6 bg-${themeData.primary} rounded-full flex items-center justify-center text-black text-xs font-bold animate-bounce`}>
                ✓
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Current Theme Info */}
      <div className={`mt-6 p-4 bg-${theme.primary}/10 border border-${theme.primary}/20 rounded-lg`}>
        <div className="flex items-center space-x-3">
          <div className={`w-4 h-4 rounded-full bg-${theme.primary} animate-pulse`}></div>
          <div>
            <p className={`text-${theme.text} font-medium`}>
              Current: {theme.name}
            </p>
            <p className={`text-${theme.textMuted} text-sm`}>
              Theme saved automatically
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
