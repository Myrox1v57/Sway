import React, { createContext, useState, useRef, useContext, useEffect } from 'react';

const AudioPlayerContext = createContext(); // Sazdavame kontekst za audio pleara

// Hook za izpolzvane na audio pleara v komponenti
export const useAudioPlayer = () => { 
    const context = useContext(AudioPlayerContext); // Vzimame konteksta
    if (!context) {
        throw new Error('useAudioPlayer must be used within AudioPlayerProvider'); // Proverqvame dali konteksta e dostupen
    }
    return context;
};
// Provider komponenta za audio pleara
export const AudioPlayerProvider = ({ children }) => {
    const [songs, setSongs] = useState([]);
    const [currentPlayingId, setCurrentPlayingId] = useState(null);
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    // Zarejdame pesnite pri start
    useEffect(() => {
        fetch("http://localhost:8000/get-songs")
            .then((response) => response.json())
            .then((data) => setSongs(data.songs))
            .catch((error) => console.error("Error fetching songs:", error));
    }, []);

    // Aktualizirame currentSong kogato currentPlayingId se promeni
    useEffect(() => {
        if (currentPlayingId && songs.length > 0) {
            const song = songs.find(s => s.id === currentPlayingId); // Namirame tekushtata pesen
            setCurrentSong(song); // Aktualizirame currentSong
        }
    }, [currentPlayingId, songs]);

    // funkciq za puskane na pesen
    const playSong = (songId) => {
        // Spirame tekushtata pesen, ako ima takava
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        const song = songs.find(s => s.id === songId); // Namirame pesenta po ID
        if (!song) {
            console.error("Song not found:", songId);
            return;
        }

        const streamUrl = `http://localhost:8000/stream-song/${songId}`; // URL za streamvane na pesenta
        const newAudio = new Audio(); // Sazdavame nov Audio obekt

        // Error handling
        newAudio.addEventListener('error', (e) => {
            console.error("Audio error:", e);
            setIsPlaying(false);
            alert(`Failed to play audio: ${newAudio.error?.message || 'Unknown error'}`);
        });

        // Kogato pesenta svurshi da pusne sledvashta
        newAudio.addEventListener('ended', () => {
            setIsPlaying(false);
            playNext();
        });

        newAudio.src = streamUrl; // Zadavame src na noviq Audio obekt
        audioRef.current = newAudio; // Zapazvame go v ref
        setCurrentPlayingId(songId); // Aktualizirame currentPlayingId
        setCurrentSong(song); //  Aktualizirame currentSong

        // Puskame pesenta
        newAudio.play().then(() => { // Obrabotvame uspeshnoto puskane
            setIsPlaying(true); // Aktualizirame statusa na igrane
            console.log("Playing:", song.title); // Logvame puskane
        }).catch(error => { // Obrabotvame greshki pri puskane
            console.error("Error playing audio:", error); // Logvame greshkata
            setIsPlaying(false); // Aktualizirame statusa na igrane
        });
    };

    // preklyuchvane mezhdu pauza i puskane
    const togglePlayPause = (songId) => {
        if (currentPlayingId === songId && isPlaying) {
            // Pauzirame tekushtata pesen
            if (audioRef.current) {
                audioRef.current.pause();
                setIsPlaying(false);
            }
        } else if (currentPlayingId === songId && !isPlaying) {
            // produlzhavame igraneto na tekushtata pesen
            if (audioRef.current) {
                audioRef.current.play().then(() => {
                    setIsPlaying(true);
                }).catch(error => { 
                    console.error("Error resuming audio:", error);
                    setIsPlaying(false);
                });
            }
        } else {
            // Puskame nova pesen
            playSong(songId);
        }
    };

    // Puskane na sledvashta pesen
    const playNext = () => {
        if (songs.length === 0) return;

        const currentIndex = songs.findIndex(song => song.id === currentPlayingId);
        
        if (currentIndex !== -1 && currentIndex < songs.length - 1) {
            const nextSong = songs[currentIndex + 1];
            setTimeout(() => {
                playSong(nextSong.id);
            }, 500);
        } else {
            // Vrashtame se kum purvata pesen
            setTimeout(() => {
                playSong(songs[0].id);
            }, 500);
        }
    };

    // Puskane na predishnata pesen
    const playPrevious = () => {
        if (songs.length === 0) return;

        const currentIndex = songs.findIndex(song => song.id === currentPlayingId);
        
        if (currentIndex > 0) {
            playSong(songs[currentIndex - 1].id);
        } else {
            // Otidi na poslendata pesen
            playSong(songs[songs.length - 1].id);
        }
    };

    // Spirane na igraneto
    const stop = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setIsPlaying(false);
        setCurrentPlayingId(null);
        setCurrentSong(null);
    };

    // funkciq za obnovyavane na spisuka s pesnite
    const refreshSongs = () => {
        fetch("http://localhost:8000/get-songs")
            .then((response) => response.json())
            .then((data) => setSongs(data.songs))
            .catch((error) => console.error("Error fetching songs:", error));
    };

    const value = {
        songs,
        currentPlayingId,
        currentSong,
        isPlaying,
        playSong,
        togglePlayPause,
        playNext,
        playPrevious,
        stop,
        refreshSongs,
        setSongs
    };

    return (
        <AudioPlayerContext.Provider value={value}>
            {children}
        </AudioPlayerContext.Provider>
    );
};
