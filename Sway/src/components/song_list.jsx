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
                    <p className="separator">-</p>
                    <p className="artist">{song.artist}</p>
                    <p className="separator">·</p>
                    <p className="title">{song.title}</p>
                    
                    <div className="controls">
                    <button 
                        onClick={() => togglePlayPause(song.id)}
                        className="play-button"
                    >
                        {currentPlayingId === song.id && isPlaying ? (
                        <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#000000ff"><path d="M320-240v-480h80v480h-80Zm240 0v-480h80v480h-80Z"/></svg>
                        ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#000000ff"><path d="M320-240v-480l360 240-360 240Zm80-240Zm0 90 136-90-136-90v180Z"/></svg>
                        )}
                    </button>
                    </div>
                    <button 
                        onClick={() => deleteSong(song.id)}
                        className="delete-button"
                    >
                        <svg width="64px" height="64px" viewBox="-2.4 -2.4 28.80 28.80" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#fb0909"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4 6H20L18.4199 20.2209C18.3074 21.2337 17.4512 22 16.4321 22H7.56786C6.54876 22 5.69264 21.2337 5.5801 20.2209L4 6Z" stroke="#f41010" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M7.34491 3.14716C7.67506 2.44685 8.37973 2 9.15396 2H14.846C15.6203 2 16.3249 2.44685 16.6551 3.14716L18 6H6L7.34491 3.14716Z" stroke="#f41010" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M2 6H22" stroke="#f41010" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M10 11V16" stroke="#f41010" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M14 11V16" stroke="#f41010" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                    </button>
                    <p className="duration">{Math.floor(song.duration / 60)}:{("0" + (song.duration % 60)).slice(-2)}</p>
                </div>
            </li>
        ))}
        </ul>
        
    </div>
    
    
  );
};

export default SongList;
