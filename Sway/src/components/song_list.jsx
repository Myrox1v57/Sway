import React, { useEffect, useState } from "react";
import { useAudioPlayer } from "../contexts/AudioPlayerContext";
import Modal_Add_Song from "./utils/Modal_Add_Song";
import "../component_styles/song-list.css";




const SongList = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedSongId, setSelectedSongId] = useState(null);
    const [playlists, setPlaylists] = useState([]);
  
    const { 
        songs, 
        currentPlayingId, 
        isPlaying, 
        togglePlayPause, 
        refreshSongs
    } = useAudioPlayer();

    const handleAddToPlaylist = (songId) => {
        setSelectedSongId(songId);
        setShowModal(true);
    };

    const fetchPlaylists = async () => {
        try {
            const response = await fetch("http://localhost:8000/get-playlists");
            const data = await response.json();
            if (response.ok) {
                setPlaylists(data.playlists || []);
            }
        } catch (error) {
            console.error("Error fetching playlists:", error);
        }
    };

    const addSongToPlaylist = async (playlistId) => {
        try {
            const response = await fetch(`http://localhost:8000/add-song-to-playlist/${playlistId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ song_id: selectedSongId })
            });
            if (response.ok) {
                alert("Song added to playlist!");
                setShowModal(false);
            } else {
                const data = await response.json();
                alert(data.error || "Failed to add song to playlist.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred. Please try again.");
        }
    };

    useEffect(() => {
        fetchPlaylists();
    }, []);

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
      <h1>Songs</h1>
        <ul>
        {songs.map((song) => (
            <li key={song.id} className="song-item">
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
                <img src={`../../src-backend/${song.cover_path}`} alt={`${song.title} cover`} className="cover-image"/>
                    </div>
                
                <div className="song-details">
                    <p className="separator">-</p>
                    <p className="artist">{song.artist}</p>
                    <p className="separator">·</p>
                    <p className="title">{song.title}</p>
                    
                    
                    <button 
                        onClick={() => deleteSong(song.id)}
                        className="delete-button"
                    >
                        <svg width="64px" height="64px" viewBox="-2.4 -2.4 28.80 28.80" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#fb0909"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4 6H20L18.4199 20.2209C18.3074 21.2337 17.4512 22 16.4321 22H7.56786C6.54876 22 5.69264 21.2337 5.5801 20.2209L4 6Z" stroke="#f41010" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M7.34491 3.14716C7.67506 2.44685 8.37973 2 9.15396 2H14.846C15.6203 2 16.3249 2.44685 16.6551 3.14716L18 6H6L7.34491 3.14716Z" stroke="#f41010" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M2 6H22" stroke="#f41010" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M10 11V16" stroke="#f41010" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M14 11V16" stroke="#f41010" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                    </button>
                    <p className="duration">{Math.floor(song.duration / 60)}:{("0" + (song.duration % 60)).slice(-2)}</p>
                    <button className="Btn" onClick={() => handleAddToPlaylist(song.id)}>
                    <div className="sign">+</div>
                    <div className="text">Add to Playlist</div>
                    </button>
                </div>
            </li>
        ))}
        </ul>
        {showModal && (
            <Modal_Add_Song isOpen={showModal} onClose={() => setShowModal(false)}>
                <h3>Add to Playlist</h3>
                <div className="playlist-options">
                    {playlists.length === 0 ? (<p>No playlists available</p>)
                     : (
                        playlists.map((playlist) => (
                            <button key={playlist.id} className="playlist-option-btn"onClick={() => addSongToPlaylist(playlist.id)}>
                                <div className="modal-info">
                                    {playlist.cover_path && (
                                    <img src={`http://localhost:8000/playlist-cover/${playlist.cover_name}`} alt={`${playlist.name} cover`} className="playlist-cover"/>
                                )}
                                <h2>{playlist.name}</h2>
                                </div>
                                <div className="modal-continue"> <span>Add To Playlist</span>
                                <svg xmlns="http://www.w3.org/2000/svg"fill="none"viewBox="0 0 74 74"height="34"width="34">
                                <circle stroke-width="3" stroke="black" r="35.5" cy="37" cx="37"></circle>
                                <path
                                    fill="black"
                                    d="M25 35.5C24.1716 35.5 23.5 36.1716 23.5 37C23.5 37.8284 24.1716 38.5 25 38.5V35.5ZM49.0607 38.0607C49.6464 37.4749 49.6464 36.5251 49.0607 35.9393L39.5147 26.3934C38.9289 25.8076 37.9792 25.8076 37.3934 26.3934C36.8076 26.9792 36.8076 27.9289 37.3934 28.5147L45.8787 37L37.3934 45.4853C36.8076 46.0711 36.8076 47.0208 37.3934 47.6066C37.9792 48.1924 38.9289 48.1924 39.5147 47.6066L49.0607 38.0607ZM25 38.5L48 38.5V35.5L25 35.5V38.5Z"
                                ></path>
                                </svg>
                                </div>
                               
                              
                            </button>
                        ))
                    )}
                </div>  
            </Modal_Add_Song>
        )}
    </div>
    
    
  );
};

export default SongList;
