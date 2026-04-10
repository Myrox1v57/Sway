import { useState } from "react";
import "../../component_styles/add-playlist-form.css";

export const AddPlaylistForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        playlist_name: "",
        playlist_cover: null,
        songs: []
    });

    const [loading, setLoading] = useState(false);
    const [cover, setCover] = useState(null);

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

        if (name === "playlist_cover" && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCover(reader.result);
            };
            reader.readAsDataURL(file);
        }
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
                setCover(null);
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
            <div className="form-header">
                <h2>Add New Playlist</h2>
            </div>

            <div className="form-content">
                <div className="form-section">
                    <h3 className="section-title">Playlist Details</h3>
                    <div className="inputs-container">
                        <div className="SongInput">
                            <input 
                                type="text" 
                                id="playlist_name" 
                                name="playlist_name" 
                                value={formData.playlist_name} 
                                onChange={HandleInput}
                                placeholder="Enter playlist name"
                                required
                            />
                            <span>Name</span>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="section-title">Upload</h3>
                    <div className="upload-container single-upload-container">
                        <div className="upload-item">
                            <label className="upload-label">Cover Art</label>
                            <label className="custum-file-upload playlist-upload" htmlFor="playlist_cover">
                                {cover && <img src={cover} alt="Cover Preview" className="cover-preview" />}
                                <div className="icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="" viewBox="0 0 24 24"><g strokeWidth="0" id="SVGRepo_bgCarrier"></g><g strokeLinejoin="round" strokeLinecap="round" id="SVGRepo_tracerCarrier"></g><g id="SVGRepo_iconCarrier"> <path fill="" d="M10 1C9.73478 1 9.48043 1.10536 9.29289 1.29289L3.29289 7.29289C3.10536 7.48043 3 7.73478 3 8V20C3 21.6569 4.34315 23 6 23H7C7.55228 23 8 22.5523 8 22C8 21.4477 7.55228 21 7 21H6C5.44772 21 5 20.5523 5 20V9H10C10.5523 9 11 8.55228 11 8V3H18C18.5523 3 19 3.44772 19 4V9C19 9.55228 19.4477 10 20 10C20.5523 10 21 9.55228 21 9V4C21 2.34315 19.6569 1 18 1H10ZM9 7H6.41421L9 4.41421V7ZM14 15.5C14 14.1193 15.1193 13 16.5 13C17.8807 13 19 14.1193 19 15.5V16V17H20C21.1046 17 22 17.8954 22 19C22 20.1046 21.1046 21 20 21H13C11.8954 21 11 20.1046 11 19C11 17.8954 11.8954 17 13 17H14V16V15.5ZM16.5 11C14.142 11 12.2076 12.8136 12.0156 15.122C10.2825 15.5606 9 17.1305 9 19C9 21.2091 10.7909 23 13 23H20C22.2091 23 24 21.2091 24 19C24 17.1305 22.7175 15.5606 20.9844 15.122C20.7924 12.8136 18.858 11 16.5 11Z" clipRule="evenodd" fillRule="evenodd"></path> </g></svg>
                                </div>
                                <div className="text">
                                    <span>Click to upload image</span>
                                </div>
                                <input
                                    type="file"
                                    id="playlist_cover"
                                    name="playlist_cover"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-actions">
                <button type="submit" disabled={loading} className="submit-button">
                    {loading ? (
                        <>
                            <span className="spinner"></span>
                            Adding...
                        </>
                    ) : (
                        "Add Playlist"
                    )}
                </button>
            </div>
        </form>
    );
}
