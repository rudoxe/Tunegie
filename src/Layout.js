import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { useTheme } from "./contexts/ThemeContext";
import AuthModal from "./components/Auth/AuthModal";

export default function Layout() {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const navigate = useNavigate();

  const handleLogin = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleRegister = () => {
    setAuthMode('register');
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    logout();
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.background} text-${theme.textMuted} flex flex-col transition-all duration-500`}>
      <header className="flex items-center justify-between p-6 backdrop-blur-sm">
        <h1 className={`text-3xl font-bold flex items-center gap-3 text-${theme.text} transition-colors duration-300`}>
          <span className={`w-10 h-10 rounded-full bg-${theme.primary} flex items-center justify-center text-gray-900 font-black transition-all duration-300 hover:scale-110 hover:${theme.glow}`}>
            T
          </span>
          <span className="hover:scale-105 transition-transform duration-200">Tunegie</span>
        </h1>
        <div className="flex items-center gap-6">
          <nav className={`flex gap-6 text-${theme.textNav}`}>
            <Link to="/" className={`hover:text-${theme.text} transition-all duration-200 hover:scale-105 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-${theme.primary} hover:after:w-full after:transition-all after:duration-300`}>Home</Link>
            <Link to="/about" className={`hover:text-${theme.text} transition-all duration-200 hover:scale-105 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-${theme.primary} hover:after:w-full after:transition-all after:duration-300`}>About</Link>
            <Link to="/contact" className={`hover:text-${theme.text} transition-all duration-200 hover:scale-105 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-${theme.primary} hover:after:w-full after:transition-all after:duration-300`}>Contact</Link>
            <Link to="/game" className={`hover:text-${theme.text} transition-all duration-200 hover:scale-105 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-${theme.primary} hover:after:w-full after:transition-all after:duration-300`}>Play</Link>
            <Link to="/leaderboard" className={`hover:text-${theme.text} transition-all duration-200 hover:scale-105 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-${theme.primary} hover:after:w-full after:transition-all after:duration-300`}>Leaderboard</Link>
            {isAuthenticated() && <Link to="/history" className={`hover:text-${theme.text} transition-all duration-200 hover:scale-105 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-${theme.primary} hover:after:w-full after:transition-all after:duration-300`}>History</Link>}
            {isAuthenticated() && <Link to="/profile" className={`hover:text-${theme.text} transition-all duration-200 hover:scale-105 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-${theme.primary} hover:after:w-full after:transition-all after:duration-300`}>Profile</Link>}
          </nav>
          
          <div className={`flex items-center gap-4 border-l border-${theme.border} pl-6`}>
            {loading ? (
              <div className={`text-${theme.text} animate-pulse`}>Loading...</div>
            ) : isAuthenticated() ? (
              <div className="flex items-center gap-4">
                <div 
                  onClick={handleProfileClick}
                  className={`w-10 h-10 rounded-full cursor-pointer transition-all duration-300 hover:${theme.glow} hover:ring-2 hover:ring-${theme.primary}/50 hover:scale-110 overflow-hidden flex items-center justify-center bg-gray-700 border-2 border-${theme.border}`}
                >
                  {user?.profile_picture ? (
                    <img
                      src={`http://localhost:8000/${user.profile_picture}`}
                      alt="Profile"
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  ) : (
                    <svg className={`w-6 h-6 text-${theme.textMuted} transition-colors duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm transition-all duration-200 hover:scale-105"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLogin}
                  className={`bg-${theme.primary} hover:bg-${theme.primaryHover} text-gray-900 px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105 hover:${theme.glow}`}
                >
                  Login
                </button>
                <button
                  onClick={handleRegister}
                  className={`border border-${theme.primary} text-${theme.text} hover:bg-${theme.primary} hover:text-gray-900 px-3 py-1 rounded-md text-sm transition-all duration-200 hover:scale-105`}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Render matched child route */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <Outlet />
      </main>

      <footer className={`p-6 text-center text-${theme.textMuted} text-sm transition-colors duration-300`}>
        <div className="animate-pulse">
          © {new Date().getFullYear()} Tunegie - Guess. Play. Compete.
        </div>
      </footer>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        initialMode={authMode} 
      />
    </div>
  );
}
