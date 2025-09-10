import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./contexts/AuthContext";
import { GameProvider } from "./contexts/GameContext";
import Layout from "./Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Game from "./pages/Game";
import Leaderboard from "./pages/Leaderboard";
import History from "./pages/History";

function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="game" element={<Game />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="history" element={<History />} />
          </Route>
        </Routes>
      </GameProvider>
    </AuthProvider>
  );
}

export default App;
