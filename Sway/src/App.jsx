import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import SongList from "./components/song_list.jsx";
import Form from "./components/add_song_form.jsx";
import AddForm from "./pages/Add_Form.jsx";
import Home from "./pages/home.jsx";
import Sidenav from "./components/utils/sidenav.jsx";
import MiniPlayer from "./components/utils/mini_player.jsx";
import { AudioPlayerProvider } from "./contexts/AudioPlayerContext.jsx";
import { Playlists } from "./pages/Playlists.jsx";
import { PlaylistDetail } from "./pages/PlaylistDetail.jsx";

function App() {
  return (
    <div className="App">
      <AudioPlayerProvider>
        <Router>
          <Sidenav />
          <div className="app-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/playlists" element={<Playlists />} />
              <Route path="/playlist/:id" element={<PlaylistDetail />} />
              <Route path="/songs" element={<SongList />} />
              <Route path="/settings" element={<div>Settings</div>} />
              <Route path="/add-song" element={<AddForm />} />
            </Routes>
            <MiniPlayer />
          </div>
        </Router>
      </AudioPlayerProvider>
    </div>
  );
}

export default App;
