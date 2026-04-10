import React, { useEffect, useState } from "react";
import { useAudioPlayer } from "../contexts/AudioPlayerContext";
import Modal_Add_Song from "./utils/Modal_Add_Song";
import "../component_styles/song-list.css";

const SongList = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedSongId, setSelectedSongId] = useState(null);
    const [playlists, setPlaylists] = useState([]);
    const [openMenuSongId, setOpenMenuSongId] = useState(null);

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
        setOpenMenuSongId(null);
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
            setOpenMenuSongId(null);
            refreshSongs();
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to delete song. Please try again.");
        }
    };

    const formatSongDuration = (durationInSeconds) => {
        const safeDuration = Math.max(0, Number(durationInSeconds) || 0);
        const minutes = Math.floor(safeDuration / 60);
        const seconds = Math.floor(safeDuration % 60);
        return `${minutes}:${String(seconds).padStart(2, "0")}`;
    };

    return (
        <div className="song-list">
            <h1>Songs</h1>

            <div className="songs-container">
                {songs.map((song) => (
                    <article key={song.id} className="song-item" onClick={() => setOpenMenuSongId(null)}>
                        <div className="song-main">
                            <img src={`../../src-backend/${song.cover_path}`} alt={`${song.title} cover`} className="cover-image" />

                            <div className="song-details">
                                <p className="title">{song.title}</p>
                                <p className="artist">{song.artist}</p>
                            </div>
                        </div>

                        <div className="song-actions">
                            <p className="duration">{formatSongDuration(song.duration)}</p>

                            <button
                                onClick={() => togglePlayPause(song.id)}
                                className="play-button"
                                type="button"
                            >
                                {currentPlayingId === song.id && isPlaying ? "Pause" : "Play"}
                            </button>

                            <div className="song-menu-wrap" onClick={(event) => event.stopPropagation()}>
                                <button
                                    type="button"
                                    className="song-menu-toggle"
                                    onClick={() => setOpenMenuSongId((prev) => (prev === song.id ? null : song.id))}
                                    aria-label="Open song actions"
                                >
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </button>

                                {openMenuSongId === song.id && (
                                    <div className="song-menu-dropdown">
                                        <button className="song-menu-item" onClick={() => handleAddToPlaylist(song.id)}>
                                            Add to Playlist
                                        </button>
                                        <button className="song-menu-item danger" onClick={() => deleteSong(song.id)}>
                                            Delete Song
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {showModal && (
                <Modal_Add_Song isOpen={showModal} onClose={() => setShowModal(false)}>
                    <h3>Add to Playlist</h3>
                    <div className="playlist-options">
                        {playlists.length === 0 ? (<p>No playlists available</p>)
                            : (
                                playlists.map((playlist) => (
                                    <button key={playlist.id} className="playlist-option-btn" onClick={() => addSongToPlaylist(playlist.id)}>
                                        <div className="modal-info">
                                            {playlist.cover_path && (
                                                <img src={`http://localhost:8000/playlist-cover/${playlist.cover_name}`} alt={`${playlist.name} cover`} className="playlist-cover" />
                                            )}
                                            <h2>{playlist.name}</h2>
                                        </div>
                                        <div className="modal-continue"> <span>Add To Playlist</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 74 74" height="34" width="34">
                                                <circle strokeWidth="3" stroke="black" r="35.5" cy="37" cx="37"></circle>
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
