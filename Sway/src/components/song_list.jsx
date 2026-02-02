import React from "react";
import {useState , useEffect , useRef} from "react";
import "../component_styles/song-list.css";
const SongList = () => {
    const [songs, setSongs] = useState([]);
    const [currentPlayingId, setCurrentPlayingId] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        // Vzemame na spisuka s pesnite ot backend
        fetch("http://localhost:8000/get-songs")
        .then((response) => response.json())
        .then((data) => setSongs(data.songs))
        .catch((error) => console.error("Error fetching songs:", error));
    }, []);

    // funkciq za direktno pustane na pesen (bez toggle)
    const playSong = (songId) => {
        // Stop current song if playing
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        
        const streamUrl = `http://localhost:8000/stream-song/${songId}`;
        const newAudio = new Audio();
        
        // Set up error handling
        newAudio.addEventListener('error', (e) => {
            console.error("Audio error:", e);
            console.error("Audio error details:", newAudio.error);
            setIsPlaying(false);
            alert(`Failed to play audio. Error: ${newAudio.error?.message || 'Unknown error'}`);
        });
        
        // Handle when song ends - auto-play next song
        newAudio.addEventListener('ended', () => {
            console.log("Song ended, playing next...");
            setIsPlaying(false);
            
            // Namirame indeksa na tekushtata pesen
            const currentIndex = songs.findIndex(song => song.id === songId);
            
            // Proverqvame dali ima sledvashta pesen
            if (currentIndex !== -1 && currentIndex < songs.length - 1) {
                const nextSong = songs[currentIndex + 1];
                console.log("Auto-playing next song:", nextSong.title);
                // Pusni sledvashtata pesen sled malko zakushenie
                setTimeout(() => {
                    playSong(nextSong.id);
                }, 500);
            } else {
                console.log("No more songs to play");
            }
        });
        
        // Handle successful loading
        newAudio.addEventListener('canplay', () => {
            console.log("Audio is ready to play");
        });
        
        newAudio.src = streamUrl;
        audioRef.current = newAudio;
        setCurrentPlayingId(songId);
        
        // Attempt to play
        newAudio.play().then(() => {
            setIsPlaying(true);
            console.log("Playing audio from:", streamUrl);
        }).catch(error => {
            console.error("Error playing audio:", error);
            setIsPlaying(false);
        });
    };

    // funkciq za play/pause streaming audio
    const togglePlayPause = (songId) => {
        if (currentPlayingId === songId && isPlaying) {
            // Pause current song
            if (audioRef.current) {
                audioRef.current.pause();
                setIsPlaying(false);
            }
        } else if (currentPlayingId === songId && !isPlaying) {
            // Resume current song
            if (audioRef.current) {
                audioRef.current.play().then(() => {
                    setIsPlaying(true);
                }).catch(error => {
                    console.error("Error resuming audio:", error);
                    setIsPlaying(false);
                });
            }
        } else {
            // Play new song
            playSong(songId);
        }
    };
    // funckiq koqto poddyrja avtomatichnoto smenqne na pesen kogato svyrshi 
    useEffect(() => {
        const handleEnded = () => {
            setIsPlaying(false);
        };
        if (audioRef.current) {
            audioRef.current.addEventListener('ended', handleEnded);
        }
        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener('ended', handleEnded);
            }
        };
    }, [currentPlayingId]);


    // funkciq za iztrivane na pesen

    const deleteSong = async (songId) => {
        try {
            const response = await fetch(`http://localhost:8000/delete-song/${songId}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }
            const result = await response.json();
            console.log("Success:", result);
            // Update the song list after deletion
            setSongs(songs.filter((song) => song.id !== songId));
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to delete song. Please try again.");
        }
    };

  return (
    <div className="song-list">
      <h2>Songs</h2>
        <ul>
        {songs.map((song) => (
            <li key={song.id} className="song-item">
                <img src={`../../src-backend/${song.cover_path}`} alt={`${song.title} cover`} className="cover-image"/>
                <div className="song-details">
                    <h3>{song.title}</h3>
                    <p>{song.artist}</p>
                    <button 
                        onClick={() => togglePlayPause(song.id)}
                        className="play-button"
                    >
                        {currentPlayingId === song.id && isPlaying ? 'Pause' : 'Play'}
                    </button>
                    <button 
                        onClick={() => deleteSong(song.id)}
                        className="delete-button"
                    >
                        Delete
                    </button>
                </div>
            </li>
        ))}
        </ul>
        
    </div>
    
    
  );
};

export default SongList;
