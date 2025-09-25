import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const UserSearch = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const searchUsers = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/search-users.php?q=${encodeURIComponent(searchQuery)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok && !data.error) {
        setResults(data.users || []);
        setShowResults(true);
      } else {
        setResults([]);
        setShowResults(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setShowResults(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce
    debounceRef.current = setTimeout(() => {
      searchUsers(value);
    }, 300);
  };

  const handleUserClick = (userId) => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    navigate(`/user/${userId}`);
  };

  const handleFocus = () => {
    if (results.length > 0) {
      setShowResults(true);
    }
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder="Search users..."
          className={`w-full px-4 py-2 pl-10 rounded-lg bg-gray-800/50 border border-${theme.border} text-${theme.text} placeholder-${theme.textMuted} focus:outline-none focus:ring-2 focus:ring-${theme.primary} focus:border-transparent transition-all duration-200`}
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <div className={`w-4 h-4 border-2 border-${theme.primary} border-t-transparent rounded-full animate-spin`}></div>
          ) : (
            <svg className={`w-5 h-5 text-${theme.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      {showResults && results.length > 0 && (
        <div className={`absolute top-full left-0 right-0 mt-1 bg-${theme.surface} border border-${theme.surfaceBorder} rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto`}>
          {results.map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserClick(user.id)}
              className={`flex items-center gap-3 p-3 hover:bg-${theme.surfaceBorder}/20 cursor-pointer transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg`}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                {user.profile_picture ? (
                  <img
                    src={`http://localhost:8000/${user.profile_picture}`}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-700">
                    <svg className={`w-4 h-4 text-${theme.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium text-${theme.text} truncate`}>
                  {user.username}
                </p>
                <p className={`text-xs text-${theme.textMuted} truncate`}>
                  Member since {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showResults && query && results.length === 0 && !isLoading && (
        <div className={`absolute top-full left-0 right-0 mt-1 bg-${theme.surface} border border-${theme.surfaceBorder} rounded-lg shadow-lg z-50 p-4 text-center`}>
          <p className={`text-sm text-${theme.textMuted}`}>No users found</p>
        </div>
      )}
    </div>
  );
};

export default UserSearch;