import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import SongList from "./components/song_list.jsx";
import Form from "./components/add_song_form.jsx";
import Home from "./pages/home.jsx";

import Sidenav from "./components/sidenav.jsx";

function App() {
  return (
    <div className="App">
        <Router>
        
        <Sidenav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/playlists" element={<div>Playlists</div>} />
          <Route path="/songs" element={<SongList />} />
          <Route path="/settings" element={<div>Settings</div>} />
          <Route path="/add-song" element={<Form />} />
        </Routes>
      </Router>
      
    </div>
  );
}

export default App;
