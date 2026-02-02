import React from "react";
import { useAudioPlayer } from "../contexts/AudioPlayerContext";
import "../component_styles/song-list.css";

const SongList = () => {
    const { 
        songs, 
        currentPlayingId, 
        isPlaying, 
        togglePlayPause, 
        refreshSongs
    } = useAudioPlayer();

    // funkciq za iztrivane na pesen
    const deleteSong = async (songId) => {
        try {
            const response = await fetch(`http://localhost:8000/delete-song/${songId}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }
            const result = await response.json();
            console.log("Success:", result);
            // Update the song list after deletion
            refreshSongs();
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to delete song. Please try again.");
        }
    };

  return (
    <div className="song-list">
      <h2>Songs</h2>
        <ul>
        {songs.map((song) => (
            <li key={song.id} className="song-item">
                <img src={`../../src-backend/${song.cover_path}`} alt={`${song.title} cover`} className="cover-image"/>
                <div className="song-details">
                    <h3>{song.title}</h3>
                    <p>{song.artist}</p>
                    <button 
                        onClick={() => togglePlayPause(song.id)}
                        className="play-button"
                    >
                        {currentPlayingId === song.id && isPlaying ? 'Pause' : 'Play'}
                    </button>
                    <button 
                        onClick={() => deleteSong(song.id)}
                        className="delete-button"
                    >
                        Delete
                    </button>
                </div>
            </li>
        ))}
        </ul>
        
    </div>
    
    
  );
};

export default SongList;
