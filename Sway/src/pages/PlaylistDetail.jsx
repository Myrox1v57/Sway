import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAudioPlayer } from "../contexts/AudioPlayerContext";
import "../component_styles/playlist_detail.css";

export const PlaylistDetail = () => {
    const { id } = useParams();
    const [playlist, setPlaylist] = useState(null);
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { togglePlayPause, currentSong, isPlaying } = useAudioPlayer();

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
            }
        } catch (error) {
            console.error(error);
        }
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
                <Link to="/playlists" className="back-button">
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
                            <div className="default-cover-large">🎵</div>
                        )}
                    </div>
                    <div className="playlist-detail-text">
                        <h1>{playlist.name}</h1>
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
                    <div className="song-list">
                        {songs.map((song, index) => (
                            <div 
                                key={song.id} 
                                className={`song-item ${currentSong?.id === song.id ? 'playing' : ''}`}
                            >
                                <span className="song-index">{index + 1}</span>
                                <img 
                                    src={`../../src-backend/${song.cover_path}`} 
                                    alt={song.title}
                                    className="song-cover"
                                />
                                <div className="song-info">
                                    <h4>{song.title}</h4>
                                    <p>{song.artist}</p>
                                </div>
                                <span className="song-duration">
                                    {Math.floor(song.duration / 60)}:{("0" + Math.floor(song.duration % 60)).slice(-2)}
                                </span>
                                <button 
                                    className="play-btn"
                                    onClick={() => togglePlayPause(song.id)}
                                >
                                    {currentSong?.id === song.id && isPlaying ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                                            <path d="M320-320h320v-320H320v320ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                                            <path d="M380-300 620-480 380-660v360ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/>
                                        </svg>
                                    )}
                                </button>
                                <button 
                                    className="remove-btn"
                                    onClick={() => removeSongFromPlaylist(song.id)}
                                    title="Remove from playlist"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                                        <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
