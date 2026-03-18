import { useState, useEffect } from "react";
import { AddPlaylistForm } from "../components/utils/add_playlist_form";


export const Playlists = () => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);

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
                    <p>No playlists yet. Create your first playlist!</p>
                </div>
            ) : (
                <div className="playlists-grid">
                    <a href="">{playlists.map((playlist) => (
                        <div key={playlist.id} className="playlist-card">
                            <div className="playlist-cover">
                                {playlist.cover_path ? (
                                    <img 
                                        src={`http://localhost:8000/playlist-cover/${playlist.cover_name}`} 
                                        alt={playlist.name}
                                    />
                                ) : (
                                    <div className="default-cover">🎵</div>
                                )}
                            </div>
                            <div className="playlist-info">
                                <h3>{playlist.name}</h3>
                                <p>{playlist.songs?.length || 0} songs</p>
                            </div>
                            <button 
                                className="delete-btn"
                                onClick={() => handleDelete(playlist.id)}>
                                Delete
                            </button>
                        </div>
                    ))}
                    </a>
                </div>
            )}
        </div>
    );
}