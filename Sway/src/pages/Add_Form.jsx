import React, { useState } from "react";
import Form from "../components/add_song_form.jsx";
import "../component_styles/add-form-page.css";

const AddForm = () => {
    const [activeView, setActiveView] = useState(null);

    const handleBack = () => {
        setActiveView(null);
    };

    if (activeView === "song") {
        return (
            <div className="add-form-page">
                <button className="back-button" onClick={handleBack}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Back
                </button>
                <Form />
            </div>
        );
    }

    if (activeView === "playlist") {
        return (
            <div className="add-form-page">
                <button className="back-button" onClick={handleBack}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Back
                </button>
                <div className="playlist-form-placeholder">
                    <h2>Add Playlist</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="add-form-page">
            <div className="add-options-container">
                <h1 className="add-options-title">What you want to add?</h1>
                <div className="add-options-buttons">
                    <button 
                        className="add-option-btn add-song-btn"
                        onClick={() => setActiveView("song")}
                    >
                        <div className="btn-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 18V5l12-2v13"/>
                                <circle cx="6" cy="18" r="3"/>
                                <circle cx="18" cy="16" r="3"/>
                            </svg>
                        </div>
                        <span>Add Song</span>
                    </button>
                    <button 
                        className="add-option-btn add-playlist-btn"
                        onClick={() => setActiveView("playlist")}
                    >
                        <div className="btn-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="8" y1="6" x2="21" y2="6"/>
                                <line x1="8" y1="12" x2="21" y2="12"/>
                                <line x1="8" y1="18" x2="21" y2="18"/>
                                <line x1="3" y1="6" x2="3.01" y2="6"/>
                                <line x1="3" y1="12" x2="3.01" y2="12"/>
                                <line x1="3" y1="18" x2="3.01" y2="18"/>
                            </svg>
                        </div>
                        <span>Add Playlist</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddForm;