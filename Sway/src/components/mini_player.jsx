import React from "react";
import { useState } from "react";
import { useAudioPlayer } from "../contexts/AudioPlayerContext";
import "../component_styles/mini-player.css";

const MiniPlayer = () => {
    const { currentSong, isPlaying, togglePlayPause, playNext, playPrevious, currentTime, seekToTime, volume, isMuted, changeVolume, toggleMute } = useAudioPlayer();

    if (!currentSong) {
        return null; // Ne pokazvame mini player, ako nqma tekushta pesen
    }

    const handleProgressClick = (e) => {
        const bar = e.currentTarget;
        const clickX = e.clientX - bar.getBoundingClientRect().left;
        const barWidth = bar.clientWidth;
        const newTime = (clickX / barWidth) * currentSong.duration;
        seekToTime(newTime);
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        changeVolume(newVolume);
    };


    const progressPercent = (currentTime / currentSong.duration) * 100; // Izchislyavame procenta na progress bar
    const convertedTime = `${Math.floor(currentTime / 60)}:${("0" + Math.floor(currentTime % 60)).slice(-2)}`; // Konvertirane na tekushtoto vreme v format MM:SS
    const convertedDuration = `${Math.floor(currentSong.duration / 60)}:${("0" + Math.floor(currentSong.duration % 60)).slice(-2)}`; // Konvertirane na obshtata duljina v format MM:SS

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
             <div className="progress-bar-container" onClick={handleProgressClick}>
                <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
             <div className="time-display">
                <span>{convertedTime}</span>
                <span>{convertedDuration}</span>
            </div>
                <div className="volume-control">
                    <button onClick={toggleMute} className="volume-btn">
                        {isMuted || volume === 0 ? (
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                            <path d="M792-56 671-177q-25 16-53 27.5T560-131v-82q14-5 27.5-10t25.5-12L480-368v208L280-360H120v-240h128L56-792l56-56 736 736-56 56Zm-8-232-58-58q17-31 25.5-65t8.5-70q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 53-14.5 102T784-288ZM650-422l-90-90v-130q47 22 73.5 66t26.5 96q0 15-2.5 29.5T650-422ZM480-592 376-696l104-104v208Zm-80 238v-94l-72-72H200v80h114l86 86Zm-36-130Z"/>
                            </svg>
                        ) : volume > 0.5 ? (
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                            <path d="M560-131v-82q90-26 145-100t55-168q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 127-78 224.5T560-131ZM120-360v-240h160l200-200v640L280-360H120Zm440 40v-322q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320ZM400-606l-86 86H200v80h114l86 86v-252ZM300-480Z"/>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                            <path d="M200-360v-240h160l200-200v640L360-360H200Zm440 40v-322q45 21 72.5 65t27.5 97q0 53-27.5 96.5T640-320ZM480-606l-86 86H280v80h114l86 86v-252ZM380-480Z"/>
                            </svg>
                        )}
                    </button>
                    <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01" 
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="volume-slider"
                    />
                    <span className="volume-percent">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
                </div>
        </div>
    );
};

export default MiniPlayer;
