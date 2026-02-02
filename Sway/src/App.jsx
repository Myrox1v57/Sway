import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import SongList from "./components/song_list.jsx";
import Form from "./components/add_song_form.jsx";
import Home from "./pages/home.jsx";
import Sidenav from "./components/sidenav.jsx";
import MiniPlayer from "./components/mini_player.jsx";
import { AudioPlayerProvider } from "./contexts/AudioPlayerContext.jsx";

function App() {
  return (
    <div className="App">
      <AudioPlayerProvider>
        <Router>
          <Sidenav />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/playlists" element={<div>Playlists</div>} />
            <Route path="/songs" element={<SongList />} />
            <Route path="/settings" element={<div>Settings</div>} />
            <Route path="/add-song" element={<Form />} />
          </Routes>
          <MiniPlayer />
        </Router>
      </AudioPlayerProvider>
    </div>
  );
}

export default App;
