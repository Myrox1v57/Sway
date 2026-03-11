import {useState } from "react";

const AddPlaylistForm = ({ onSubmit }) => {
    const [playlistName, setPlaylistName] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (playlistName.trim() === "") return;
        onSubmit(playlistName);
        setPlaylistName("");
    };

    return (
        <form onSubmit={handleSubmit} className="add-playlist-form">
            <input
                type="text"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                placeholder="New Playlist Name"
                className="playlist-input"
            />
            <button type="submit" className="add-playlist-button">Add Playlist</button>
        </form>
    );
}