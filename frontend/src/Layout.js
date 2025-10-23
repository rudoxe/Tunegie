import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { useTheme } from "./contexts/ThemeContext";
import AuthModal from "./components/Auth/AuthModal";
import UserSearch from "./components/UserSearch/UserSearch";

export default function Layout() {
  const { user, loading, logout, isAuthenticated, API_BASE } = useAuth();
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
      <header className={`sticky top-0 z-50 backdrop-blur-lg bg-${theme.surface}/80 border-b border-${theme.border}/50`}>
        <div className="flex items-center justify-between px-6 py-3">
          <h1 className="text-3xl font-bold transition-colors duration-300 py-1 px-1">
            <Link to="/" className="block">
              <span className={`hover:scale-105 transition-all duration-500 font-extrabold text-white cursor-pointer inline-block tracking-wide relative group overflow-visible`}>
                {/* Main visible text */}
                <span className={`relative z-10 group-hover:text-${theme.primary} transition-colors duration-300 drop-shadow-lg`}>Tunegie</span>
                {/* Background glow effect */}
                <span className={`absolute inset-0 text-${theme.primary} opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-sm`}>Tunegie</span>
                {/* Moving shimmer effect */}
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                  <span className={`absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-${theme.accent} to-transparent opacity-60 logo-shimmer-effect`}></span>
                </div>
              </span>
            </Link>
          </h1>
          <div className="flex items-center gap-6">
            <nav className={`hidden lg:flex gap-6 text-${theme.textNav} items-center`}>
              <Link to="/about" className={`px-2 py-1 rounded-lg hover:bg-${theme.primary}/10 hover:text-${theme.primary} transition-all duration-200 font-medium relative group text-sm`}>
                <span>About</span>
                <div className={`absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-${theme.primary} to-${theme.accent} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200`}></div>
              </Link>
              <Link to="/contact" className={`px-2 py-1 rounded-lg hover:bg-${theme.primary}/10 hover:text-${theme.primary} transition-all duration-200 font-medium relative group text-sm`}>
                <span>Contact</span>
                <div className={`absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-${theme.primary} to-${theme.accent} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200`}></div>
              </Link>
              <Link to="/game" className={`px-3 py-1 rounded-lg bg-gradient-to-r from-${theme.primary} to-${theme.accent} text-white font-semibold hover:scale-105 hover:${theme.glow} transition-all duration-200 shadow-lg text-sm`}>
                Play Now
              </Link>
              <Link to="/leaderboard" className={`px-2 py-1 rounded-lg hover:bg-${theme.primary}/10 hover:text-${theme.primary} transition-all duration-200 font-medium relative group text-sm`}>
                <span>Leaderboard</span>
                <div className={`absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-${theme.primary} to-${theme.accent} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200`}></div>
              </Link>
              {isAuthenticated() && (
                <Link to="/history" className={`px-2 py-1 rounded-lg hover:bg-${theme.primary}/10 hover:text-${theme.primary} transition-all duration-200 font-medium relative group text-sm`}>
                  <span>History</span>
                  <div className={`absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-${theme.primary} to-${theme.accent} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200`}></div>
                </Link>
              )}
            </nav>
            
            <div className="w-64 hidden md:block">
              <UserSearch />
            </div>
            
            <div className={`flex items-center gap-4 border-l border-${theme.border}/30 pl-4`}>
              {loading ? (
                <div className={`text-${theme.text} animate-pulse flex items-center gap-2`}>
                  <div className={`w-4 h-4 border-2 border-${theme.primary} border-t-transparent rounded-full animate-spin`}></div>
                  Loading...
                </div>
              ) : isAuthenticated() ? (
                <div className="flex items-center gap-4">
                  <div className={`text-${theme.text} font-medium hidden sm:block`}>
                    Welcome, {user?.username}!
                  </div>
                  <div 
                    onClick={handleProfileClick}
                    className={`w-11 h-11 rounded-full cursor-pointer transition-all duration-300 hover:${theme.glow} hover:ring-3 hover:ring-${theme.primary}/30 hover:scale-110 overflow-hidden flex items-center justify-center bg-gradient-to-br from-${theme.primary}/20 to-${theme.accent}/20 border-2 border-${theme.primary}/50`}
                  >
                    {user?.profile_picture ? (
                      <>
                        <img
                          src={`${API_BASE}/api/serve_image.php?path=${user.profile_picture}`}
                          alt="Profile"
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const fallback = e.target.parentNode.querySelector('.fallback-avatar');
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div className={`fallback-avatar w-6 h-6 text-${theme.primary} transition-colors duration-300`} style={{display: 'none'}}>
                          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </>
                    ) : (
                      <svg className={`w-6 h-6 text-${theme.primary} transition-colors duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLogin}
                    className={`bg-gradient-to-r from-${theme.primary} to-${theme.accent} hover:scale-105 text-white px-3 py-1 rounded-lg text-sm font-semibold transition-all duration-200 hover:${theme.glow} shadow-md hover:shadow-lg`}
                  >
                    Login
                  </button>
                  <button
                    onClick={handleRegister}
                    className={`border-2 border-${theme.primary} text-${theme.primary} hover:bg-${theme.primary} hover:text-white px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg`}
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
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


