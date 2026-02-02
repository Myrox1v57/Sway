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
                    ⏮
                </button>
                <button 
                    onClick={() => togglePlayPause(currentSong.id)} 
                    className="mini-btn mini-play-pause"
                >
                    {isPlaying ? '⏸' : '▶'}
                </button>
                <button onClick={playNext} className="mini-btn">
                    ⏭
                </button>
            </div>
        </div>
    );
};

export default MiniPlayer;
