import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "../component_styles/songs.css"

export default function SongsList() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    try {
      const result = await invoke("get_all_songs");
      const data = JSON.parse(result);
      setSongs(data.songs);
    } catch (error) {
      console.error("Failed to load songs:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="songs-list">
      <h2>My Songs ({songs.length})</h2>
      {songs.length === 0 ? (
        <p>No songs yet. Add your first song!</p>
      ) : (
        <ul>
          {songs.map((song) => (
            <li key={song.id}>
              <h3>{song.title}</h3>
              <p>Artist: {song.artist}</p>
              <p>File: {song.song_file}</p>
              {song.cover_file && <p>Cover: {song.cover_file}</p>}
              <p>Added: {new Date(song.uploaded_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}