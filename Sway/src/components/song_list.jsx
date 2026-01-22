import React from "react";
import {useState , useEffect , useRef} from "react";
import "../component_styles/song-list.css";
const SongList = () => {
    const [songs, setSongs] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        // Vzemame na spisuka s pesnite ot backend
        fetch("http://localhost:8000/get-songs")
        .then((response) => response.json())
        .then((data) => setSongs(data.songs))
        .catch((error) => console.error("Error fetching songs:", error));
    }, []);
    // Funkciq koqto dyrji auto-play kogato pesenta svyrshi
    const handleEnded = () => {
        if (currentIndex < songs.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsPlaying(true);
        } else {
            setIsPlaying(false);
        }
    };
    // funckciq za sledvashta pesen
    const playNext = () => {
        if (currentIndex < songs.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsPlaying(true);
        }
    };

    // funkciq za predishna pesen
    const playPrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setIsPlaying(true);
        }
    };

    // funkciq za secifichna pesen
    const playSong=(index) => {
        setCurrentIndex(index);
        setIsPlaying(true);
    };

    // funckiq za pauza
    const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  // tekushta pesen
  const currentSong = songs[currentIndex];

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
                    <p>ID: {song.id}</p>
                    <p>Date Added: {song.date_added}</p>
                    <h3>{song.title}</h3>
                    <p>{song.artist}</p>
                    <audio controls>
                        <source src={`../../src-backend/${song.song_path}`} type="audio/mpeg"/>
                        Your browser does not support the audio element.
                    </audio>
                    
                </div>
            </li>
        ))}
        </ul>
        
    </div>
    
    
  );
};

export default SongList;
