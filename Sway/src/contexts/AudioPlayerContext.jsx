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
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef(null);

    // Zarejdame pesnite pri start
    useEffect(() => {
        fetch("http://localhost:8000/get-songs")
            .then((response) => response.json())
            .then((data) => setSongs(data.songs))
            .catch((error) => console.error("Error fetching songs:", error));
    }, []);

    // Aktualizirame tekushtoto vreme na pesenta, dokato se igra
    useEffect(() => {
        const updateTime = () => {
            if (audioRef.current && isPlaying) {
                setCurrentTime(audioRef.current.currentTime);
            }
        };

        const interval = setInterval(updateTime, 100); // Update every 100ms
        return () => clearInterval(interval);
    }, [isPlaying]);

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
            autoNext(songId);
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
        let nextIndex;
        if (currentIndex >= 0 && currentIndex < songs.length - 1) {
            nextIndex = currentIndex + 1;
        } else {
            nextIndex = 0;
        }

        playSong(songs[nextIndex].id);
    };

    // Avtomatichno puskane na sledvashta pesen kogato tekushtata svurshi
    const autoNext = (endedSongId) => {
        if (songs.length === 0) return;

        const currentIndex = songs.findIndex(song => song.id === endedSongId);
        if (currentIndex === -1) return;

        if (currentIndex < songs.length - 1) {
            playSong(songs[currentIndex + 1].id);
            return;
        }

        // Spirame igraneto kogato stigne do poslednata pesen
        stop();
    };

    // Puskane na predishnata pesen
    const playPrevious = () => {
        if (songs.length === 0) return;

        const currentIndex = songs.findIndex(song => song.id === currentPlayingId);
        let prevIndex;
        if (currentIndex > 0) {
            prevIndex = currentIndex - 1;
        } else {
            prevIndex = songs.length - 1;
        }

        playSong(songs[prevIndex].id);
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

    // funkciq za tursene na vreme v pesenta
    const seekToTime = (time) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const value = {
        songs,
        currentPlayingId,
        currentSong,
        isPlaying,
        currentTime,
        playSong,
        togglePlayPause,
        playNext,
        playPrevious,
        stop,
        refreshSongs,
        seekToTime,
        setSongs
    };

    return (
        <AudioPlayerContext.Provider value={value}>
            {children}
        </AudioPlayerContext.Provider>
    );
};
