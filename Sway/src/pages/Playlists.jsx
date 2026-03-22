import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../component_styles/playlists.css";
import { useAudioPlayer } from "../contexts/AudioPlayerContext";

export const Playlists = () => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const {playCurrentPlaylist } = useAudioPlayer();
    // Fetch playlists from backend
    const fetchPlaylists = async () => {
        try {
            const response = await fetch("http://localhost:8000/get-playlists");
            const data = await response.json();
            if (response.ok) {
                setPlaylists(data.playlists || []);
            } else {
                console.error(data.error);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    const addSongToPlaylist = async (playlistId, songId) => {
        try {
            const response = await fetch(`http://localhost:8000/add-song-to-playlist`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ playlistId, songId })
            });
            const data = await response.json();
            if (response.ok) {
                fetchPlaylists(); // Refresh playlists to show updated song count
            } else {
                console.error(data.error);
            }
        } catch (error) {
            console.error(error);
        }
    };
    // Delete playlist
    const handleDelete = async (playlistId) => {
        if (!confirm("Are you sure you want to delete this playlist?")) return;
        
        try {
            const response = await fetch(`http://localhost:8000/delete-playlist/${playlistId}`, {
                method: "DELETE"
            });
            if (response.ok) {
                setPlaylists(playlists.filter(p => p.id !== playlistId));
            } else {
                const data = await response.json();
                console.error(data.error);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchPlaylists();
    }, []);

    if (loading) {
        return <div className="playlists-loading">Loading playlists...</div>;
    }

    return (
        <div className="playlists-page">
            <div className="playlists-header">
                <h1>My Playlists</h1>
        
            </div>

            {playlists.length === 0 ? (
                <div className="no-playlists">
                    <p>No playlists yet.</p>
                </div>) : (
                <div className="playlists-grid">
                    {playlists.map((playlist) => (
                        <div key={playlist.id} className="playlist-card">
                            <button className="playlist-play-btn" onClick={() => playCurrentPlaylist(playlist)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-play"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 4v16l13 -8z" /></svg>
                            </button>
                            <Link to={`/playlist/${playlist.id}`} className="playlist-link">
                            
                                <div className="playlist-cover">
                                    
                                    {playlist.cover_path ? (
                                        <img src={`http://localhost:8000/playlist-cover/${playlist.cover_name}`} alt={playlist.name}/>
                                    ) : (
                                        <div className="default-cover"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-playlist"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11 17a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M17 17v-13h4" /><path d="M13 5h-10" /><path d="M3 9l10 0" /><path d="M9 13h-6" /></svg></div>
                                    )}
                                </div>
                                <div className="playlist-info">
                                    <h3>{playlist.name}</h3>
                                    <p>{playlist.songs?.length || 0} songs</p>
                                </div>
                            </Link>
                            <button className="delete-btn" onClick={(e) => { e.preventDefault(); handleDelete(playlist.id); }}>Delete</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}