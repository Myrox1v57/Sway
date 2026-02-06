import React from "react";
import { useAudioPlayer } from "../contexts/AudioPlayerContext";
import "../component_styles/mini-player.css";

const MiniPlayer = () => {
    const { currentSong, isPlaying, togglePlayPause, playNext, playPrevious } = useAudioPlayer();

    if (!currentSong) {
        return null; // Don't show mini player if no song is playing
    }

    return (
        <div className="mini-player">
            <img 
                src={`../../src-backend/${currentSong.cover_path}`} 
                alt={`${currentSong.title} cover`} 
                className="mini-cover"
            />
            <div className="mini-info">
                <h4>{currentSong.title}</h4>
                <p>{currentSong.artist}</p>
            </div>
            <div className="mini-controls">
                <button onClick={playPrevious} className="mini-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#000000ff"><path d="M220-240v-480h80v480h-80Zm520 0L380-480l360-240v480Zm-80-240Zm0 90v-180l-136 90 136 90Z"/></svg>
                </button>
                <button onClick={() => togglePlayPause(currentSong.id)} className="mini-btn mini-play-pause">
                    {isPlaying ? (
                        <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#000000ff"><path d="M320-240v-480h80v480h-80Zm240 0v-480h80v480h-80Z"/></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#000000ff"><path d="M320-240v-480l360 240-360 240Zm80-240Zm0 90 136-90-136-90v180Z"/></svg>
                    )}
                </button>
                <button onClick={playNext} className="mini-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#000000ff"><path d="M660-240v-480h80v480h-80Zm-440 0v-480l360 240-360 240Zm80-240Zm0 90 136-90-136-90v180Z"/></svg>
                </button>
            </div>
        </div>
    );
};

export default MiniPlayer;
