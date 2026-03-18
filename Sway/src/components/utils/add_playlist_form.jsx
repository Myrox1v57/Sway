import {useState } from "react";

export const AddPlaylistForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        playlist_name: "",
        playlist_cover: null,
        songs: []
    });

    const [loading, setLoading] = useState(false);

    const HandleInput = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        const file = files[0];

        if(!file) return;

    // Update na formData s izbranite failove
        setFormData((prevData) => ({
        ...prevData,
        [name]: file
        }));
    };
    
    const HandleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            //proverqvame dali vsichki poleta sa popylneni
            if(!formData.playlist_name || !formData.playlist_cover) {
                alert("Please fill all fields.");
                setLoading(false);
                return;
            }
            // pravim formData obekt za izprashtane
            const data = new FormData();
            data.append("playlist_name", formData.playlist_name);
            data.append("playlist_cover", formData.playlist_cover);
            
            const response = await fetch("http://localhost:8000/create-playlist", {
                method: "POST",
                body: data
            });
            const result = await response.json();
            if (response.ok) {
                alert("Playlist added successfully!");
                setFormData({
                    playlist_name: "",
                    playlist_cover: null,
                    songs: []
                });
                e.target.reset(); // Resetvame formata v UI
                if (onSuccess) onSuccess(); // Izvikame callback ako e daden
            } else {
                alert("Failed to add playlist: " + result.error);
            }
            setLoading(false);
        }
        catch (error) {
            console.error("Error adding playlist:", error);
            setLoading(false);
        }
    };

    return (
        <form onSubmit={HandleSubmit} className="add-playlist-form">
            <div className="form-group">
                <label htmlFor="playlist_name">Playlist Name:</label>
                <input 
                    type="text" 
                    id="playlist_name" 
                    name="playlist_name" 
                    value={formData.playlist_name} 
                    onChange={HandleInput} 
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="playlist_cover">Playlist Cover:</label>
                <input 
                    type="file" 
                    id="playlist_cover" 
                    name="playlist_cover" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    required
                />
            </div>
            <button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Playlist"}
            </button>
        </form>
    );
}
