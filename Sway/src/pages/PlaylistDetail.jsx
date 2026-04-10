import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAudioPlayer } from "../contexts/AudioPlayerContext";
import "../component_styles/playlist_detail.css";
import "../component_styles/song-list.css";

export const PlaylistDetail = () => {
    const { id } = useParams();
    const [playlist, setPlaylist] = useState(null);
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openMenuSongId, setOpenMenuSongId] = useState(null);
    const { playCurrentPlaylist, togglePlayPause, currentSong, isPlaying } = useAudioPlayer();

    useEffect(() => {
        const fetchPlaylistDetails = async () => {
            try {
                // Fetch playlist data
                const playlistResponse = await fetch(`http://localhost:8000/get-playlist/${id}`);
                const playlistData = await playlistResponse.json();
                
                if (playlistResponse.ok) {
                    setPlaylist(playlistData);
                    
                    // Fetch all songs and filter by playlist's song IDs
                    if (playlistData.songs && playlistData.songs.length > 0) {
                        const songsResponse = await fetch("http://localhost:8000/get-songs");
                        const songsData = await songsResponse.json();
                        if (songsResponse.ok) {
                            const playlistSongs = songsData.songs.filter(song => 
                                playlistData.songs.includes(song.id)
                            );
                            setSongs(playlistSongs);
                        }
                    }
                } else {
                    console.error(playlistData.error);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlaylistDetails();
    }, [id]);

    const removeSongFromPlaylist = async (songId) => {
        try {
            const response = await fetch(`http://localhost:8000/remove-song-from-playlist`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ playlistId: parseFloat(id), songId })
            });
            if (response.ok) {
                setSongs(songs.filter(song => song.id !== songId));
                setOpenMenuSongId(null);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const formatSongDuration = (durationInSeconds) => {
        const safeDuration = Math.max(0, Number(durationInSeconds) || 0);
        const minutes = Math.floor(safeDuration / 60);
        const seconds = Math.floor(safeDuration % 60);
        return `${minutes}:${String(seconds).padStart(2, "0")}`;
    };

    if (loading) {
        return <div className="playlist-detail-loading">Loading playlist...</div>;
    }

    if (!playlist) {
        return (
            <div className="playlist-not-found">
                <h2>Playlist not found</h2>
                <Link to="/playlists">Back to playlists</Link>
            </div>
        );
    }

    return (
        <div className="playlist-detail-page">
            <div className="playlist-detail-header">
                <Link to="/playlists" className="back-button-detail">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                        <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"/>
                    </svg>
                    Back
                </Link>
                <div className="playlist-detail-info">
                    <div className="playlist-detail-cover">
                        {playlist.cover_path ? (
                            <img src={`http://localhost:8000/playlist-cover/${playlist.cover_name}`} alt={playlist.name} />
                        ) : (
                            <div className="default-cover-large">
                                 <div className="default-cover"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-playlist"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11 17a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M17 17v-13h4" /><path d="M13 5h-10" /><path d="M3 9l10 0" /><path d="M9 13h-6" /></svg></div>
                            </div>
                        )}
                    </div>
                    <div className="playlist-detail-text">
                        <div className="playlist-name-row">
                            <h1>{playlist.name}</h1>
                            <button className="playlist-detail-play-btn" onClick={() => playCurrentPlaylist(playlist)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 4v16l13 -8z" /></svg>
                            </button>
                        </div>
                        <p>{songs.length} songs</p>
                        
                    </div>
                </div>
            </div>

            <div className="playlist-songs">
                {songs.length === 0 ? (
                    <div className="no-songs">
                        <p>No songs in this playlist yet.</p>
                    </div>
                ) : (
                    <div className="songs-container" onClick={() => setOpenMenuSongId(null)}>
                        {songs.map((song) => (
                            <article
                                key={song.id}
                                className={`song-item${currentSong?.id === song.id ? " selected-song" : ""}`}
                            >
                                <div className="song-main">
                                    <img
                                        src={`../../src-backend/${song.cover_path}`}
                                        alt={song.title}
                                        className="cover-image"
                                    />
                                    <div className="song-details">
                                        <p className="title">{song.title}</p>
                                        <p className="artist">{song.artist}</p>
                                    </div>
                                </div>

                                <div className="song-actions">
                                    <p className="duration">{formatSongDuration(song.duration)}</p>

                                    <button
                                        type="button"
                                        className="play-button"
                                        onClick={() => togglePlayPause(song.id)}
                                    >
                                        {currentSong?.id === song.id && isPlaying ? "Pause" : "Play"}
                                    </button>

                                    <div className="song-menu-wrap" onClick={(e) => e.stopPropagation()}>
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
                                                <button
                                                    className="song-menu-item danger"
                                                    onClick={() => removeSongFromPlaylist(song.id)}
                                                >
                                                    Remove from Playlist
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
