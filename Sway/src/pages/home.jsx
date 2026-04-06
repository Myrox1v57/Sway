import React from "react";
import { useAudioPlayer } from "../contexts/AudioPlayerContext";
import "../component_styles/home.css";

export default function Home() {
    const {
        currentSong,
        isPlaying,
        togglePlayPause,
        playNext,
        playPrevious,
        shuffle,
        toggleShuffle,
    } = useAudioPlayer();

    return (
        <div className="home-page">
            <section className="resume-hero">
                <div className="resume-copy">
                    <p className="resume-eyebrow">Now Playing</p>
                    <h1>Resume Listening</h1>

                    {currentSong ? (
                        <div className="resume-song-meta">
                            <p className="resume-song-title">{currentSong.title}</p>
                            <p className="resume-song-artist">{currentSong.artist}</p>
                        </div>
                    ) : (
                        <p className="resume-empty">Pick a song from Songs or a playlist to start listening.</p>
                    )}

                    <div className="resume-controls">
                        <button type="button" className="resume-btn secondary" onClick={playPrevious} disabled={!currentSong}>
                            Previous
                        </button>
                        <button type="button" className="resume-btn primary" onClick={() => currentSong && togglePlayPause(currentSong.id)} disabled={!currentSong}>
                            {isPlaying ? "Pause" : "Play"}
                        </button>
                        <button type="button" className="resume-btn secondary" onClick={playNext} disabled={!currentSong}>
                            Next
                        </button>
                        <button className={`resume-btn shuffle ${shuffle ? "active" : ""}`} onClick={toggleShuffle} title="Toggle shuffle">
                            Shuffle
                        </button>
                    </div>
                </div>

                <div className="resume-art">
                    {currentSong?.cover_path ? (
                        <img src={`../../src-backend/${currentSong.cover_path}`} alt={`${currentSong.title} cover`} className="resume-cover" />
                    ) : (
                        <div></div>
                    )}
                </div>
            </section>
        </div>
    );
}