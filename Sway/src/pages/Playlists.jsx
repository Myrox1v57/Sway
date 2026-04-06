import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../component_styles/playlists.css";
import { useAudioPlayer } from "../contexts/AudioPlayerContext";
import Modal_Remove_Playlist from "../components/utils/Modal_Remove_Playlist";

export const Playlists = () => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const {playCurrentPlaylist } = useAudioPlayer();
    const [showModal, SetShowModal] = useState(false);

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
                fetchPlaylists(); 
            } else {
                console.error(data.error);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (playlistId) => {
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
    const handleDeletePlaylistModal = (playlistId) => {
        SetShowModal(true);
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
                            <button className="delete-btn" onClick={() => handleDeletePlaylistModal()}>Delete</button>
                            {showModal && (
                                <Modal_Remove_Playlist isOpen={showModal} onClose={()=> SetShowModal(false)}>
                                    <div className="modal-content-delete">
                                        <h3>Are you sure you want to delete?</h3>
                                        <div className="modal-buttons">
                                            <button className="confirm-btn" onClick={() => { handleDelete(playlist.id); SetShowModal(false); }}>Yes</button>
                                            <button className="cancel-btn" onClick={() => SetShowModal(false)}>Cancel</button>
                                        </div>
                                    </div>

                                </Modal_Remove_Playlist>

                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}