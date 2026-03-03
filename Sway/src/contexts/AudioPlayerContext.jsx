import React, { createContext, useState, useRef, useContext, useEffect } from 'react';
import { initializeNotifications, notifySongChange, notifySongEnded } from '../components/utils/Notification';
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
    const [songs, setSongs] = useState([]);// Sazdavame state za spisuka s pesnite
    const [currentPlayingId, setCurrentPlayingId] = useState(null); // State za ID-to na tekushtata pesen, koqto se igra
    const [currentSong, setCurrentSong] = useState(null); // State za tekushtata pesen, koqto se igra (obekt s informaciq za pesenta)
    const [isPlaying, setIsPlaying] = useState(false); // State za statusa na igrane (true - igra, false - ne igra)
    const [currentTime, setCurrentTime] = useState(0); // State za tekushtoto vreme na pesenta, koeto se aktualizira dokato se igra
    const [volume, setVolume] = useState(1); // State za tekushtiq volume (mezhdu 0 i 1)
    const [isMuted, setIsMuted] = useState(false); // State za statusa na mute (true - muted, false - ne e muted)
    const [previousVolume, setPreviousVolume] = useState(1); // State za zapazvane na predishniq volume, kogato se mutva, za da go vrashtame, kogato se otmutva
    const audioRef = useRef(null); // Ref za audio elementa, koeto ni pozvolqva da kontrolirame igraneto i da slushame za sobitiq
    const [isAppVisible, setIsAppVisible] = useState(true); // State za vidimostta na prilojenieto, koeto ni pozvolqva da reshavame dali da izprashtame notifikacii
    const [shuffle, setShuffle] = useState(false); // State za random igrane na pesnite
    const [originalSongs, setOriginalSongs] = useState([]); // State za originalniq red na pesnite


    // Request notification permission on mount
    useEffect(() => {
        const requestPerm = async () => {
            let permissionGranted = await isPermissionGranted();
            if (!permissionGranted) {
                await requestPermission();
            }
        };
        requestPerm();
    }, []);

    // Zarejdame pesnite pri start
    useEffect(() => {
        fetch("http://localhost:8000/get-songs")
            .then((response) => response.json())
            .then((data) => {
                setSongs(data.songs);
                setOriginalSongs(data.songs); // Zapazvame originalniq red
            })
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

    // Dobavqme da postavq volume i mute status na audio elementa, kogato se promenqt
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume; // Ako e muted, postavqme volume na 0, inache na tekushtata stoynost
        }
    }, [volume, isMuted]);

    // Aktualizirame currentSong kogato currentPlayingId se promeni
    useEffect(() => {
        if (currentPlayingId && songs.length > 0) {
            const song = songs.find(s => s.id === currentPlayingId); // Namirame tekushtata pesen
            setCurrentSong(song); // Aktualizirame currentSong
        }
    }, [currentPlayingId, songs]);

    useEffect(() => {

        initializeNotifications();
    
    }, []);

    useEffect(() => {
    const handleVisibilityChange = () => {
        setIsAppVisible(!document.hidden);
    };
    
    const handleFocus = () => setIsAppVisible(true);
    const handleBlur = () => setIsAppVisible(false);
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('blur', handleBlur);
    };
}, []);

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
        newAudio.addEventListener('ended', async () => {
            setIsPlaying(false);
            
            // Izprashtame notifikaciq, ako dokumenta e skrit (use document.hidden for real-time check)
            await notifySongEnded(song, !document.hidden);
            
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

        if (shuffle) {
            // Ako shuffle e vkluchen, izbirame sluchayna pesen (razlichna ot tekushtata)
            const availableSongs = songs.filter(song => song.id !== currentPlayingId);
            if (availableSongs.length === 0) return;
            const randomIndex = Math.floor(Math.random() * availableSongs.length);
            playSong(availableSongs[randomIndex].id);
        } else {
            const currentIndex = songs.findIndex(song => song.id === currentPlayingId);
            let nextIndex;
            if (currentIndex >= 0 && currentIndex < songs.length - 1) {
                nextIndex = currentIndex + 1;
            } else {
                nextIndex = 0;
            }
            playSong(songs[nextIndex].id);
        }
    };

    // Avtomatichno puskane na sledvashta pesen kogato tekushtata svurshi
    const autoNext = async (endedSongId) => {
        if (songs.length === 0) return;

        if (shuffle) {
            // Ako shuffle e vkluchen, izbirame sluchayna pesen (razlichna ot tekushtata)
            const availableSongs = songs.filter(song => song.id !== endedSongId);
            if (availableSongs.length === 0) {
                stop();
                return;
            }
            const randomIndex = Math.floor(Math.random() * availableSongs.length);
            const nextSong = availableSongs[randomIndex];
            playSong(nextSong.id);
            await notifySongChange(nextSong, !document.hidden);
            return;
        }

        const currentIndex = songs.findIndex(song => song.id === endedSongId);
        if (currentIndex === -1) return;

        if (currentIndex < songs.length - 1) {
            const nextSong = songs[currentIndex + 1];
            playSong(nextSong.id);
            // Send notification for next song if app is not visible
            await notifySongChange(nextSong, !document.hidden);
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
    // Funkciq za random igrane na pesnite
    const toggleShuffle = () => {
        setShuffle(prev => !prev);
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
    const changeVolume = (newVolume) => {
        const clampedVolume = Math.max(0, Math.min(1, newVolume)); // Ogranichavame volume mezhdu 0 i 1
        setVolume(clampedVolume);
        if (clampedVolume > 0) {
            setIsMuted(false); // Ako volume e poveche ot 0, ne sme muted
        }else {
            setPreviousVolume(volume)
            setIsMuted(true); // Ako volume e 0, sme muted
        }
    };

    const toggleMute = () => {
        if (isMuted) {
            setIsMuted(false);
            setVolume(previousVolume); // Vrashtame predishniq volume, kogato otmutvame
        } else {
            setPreviousVolume(volume); // Zapazvame tekushtiq volume, predi da mutvame
            setIsMuted(true);
            setVolume(0); // Postavqme volume na 0, kogato mutvame
        }
    };

    const value = {
        songs,
        currentPlayingId,
        currentSong,
        isPlaying,
        currentTime,
        volume,
        isMuted,
        shuffle,
        changeVolume,
        toggleMute,
        playSong,
        togglePlayPause,
        playNext,
        playPrevious,
        stop,
        refreshSongs,
        seekToTime,
        setSongs,
        toggleShuffle
    };

    return (
        <AudioPlayerContext.Provider value={value}>
            {children}
        </AudioPlayerContext.Provider>
    );
};
