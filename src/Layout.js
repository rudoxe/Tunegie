import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import AuthModal from "./components/Auth/AuthModal";

export default function Layout() {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

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

  return (
    <div className="min-h-screen bg-black text-green-300 flex flex-col">
      <header className="flex items-center justify-between p-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-black font-black">
            T
          </span>
          Tunegie
        </h1>
        <div className="flex items-center gap-6">
          <nav className="flex gap-6 text-green-200/80">
            <Link to="/" className="hover:text-green-400">Home</Link>
            <Link to="/about" className="hover:text-green-400">About</Link>
            <Link to="/contact" className="hover:text-green-400">Contact</Link>
            <Link to="/game" className="hover:text-green-400">Play</Link>
          </nav>
          
          <div className="flex items-center gap-4 border-l border-green-500/30 pl-6">
            {loading ? (
              <div className="text-green-400">Loading...</div>
            ) : isAuthenticated() ? (
              <div className="flex items-center gap-4">
                <div className="text-green-400">
                  Welcome, {user?.username}!
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLogin}
                  className="bg-green-600 hover:bg-green-700 text-black px-3 py-1 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={handleRegister}
                  className="border border-green-600 text-green-400 hover:bg-green-600 hover:text-black px-3 py-1 rounded-md text-sm transition-colors"
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

      <footer className="p-6 text-center text-green-200/40 text-sm">
        © {new Date().getFullYear()} Tunegie — Guess. Play. Compete.
      </footer>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        initialMode={authMode} 
      />
    </div>
  );
}
