import React from "react";
import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen bg-black text-green-300 flex flex-col">
      <header className="flex items-center justify-between p-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-black font-black">
            T
          </span>
          Tunegie
        </h1>
        <nav className="flex gap-6 text-green-200/80">
          <Link to="/" className="hover:text-green-400">Home</Link>
          <Link to="/about" className="hover:text-green-400">About</Link>
          <Link to="/contact" className="hover:text-green-400">Contact</Link>
          <Link to="/game" className="hover:text-green-400">Play</Link>
        </nav>
      </header>

      {/* Render matched child route */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <Outlet />
      </main>

      <footer className="p-6 text-center text-green-200/40 text-sm">
        © {new Date().getFullYear()} Tunegie — Guess. Play. Compete.
      </footer>
    </div>
  );
}