import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAudioPlayer } from "../contexts/AudioPlayerContext";
import "../component_styles/home.css";
import "../component_styles/playlists.css";

export default function Home() {
    const [songs, setSongs] = useState([]);
    const [playlists, setPlaylists] = useState([]);

    const {
        currentSong,
        isPlaying,
        togglePlayPause,
        playNext,
        playPrevious,
        shuffle,
        toggleShuffle,
        playCurrentPlaylist,
    } = useAudioPlayer();

    useEffect(() => {
        const fetchLibraryData = async () => {
            try {
                const [songsResponse, playlistsResponse] = await Promise.all([
                    fetch("http://localhost:8000/get-songs"),
                    fetch("http://localhost:8000/get-playlists"),
                ]);

                if (songsResponse.ok) {
                    const songsData = await songsResponse.json();
                    setSongs(Array.isArray(songsData.songs) ? songsData.songs : []);
                }

                if (playlistsResponse.ok) {
                    const playlistsData = await playlistsResponse.json();
                    setPlaylists(Array.isArray(playlistsData.playlists) ? playlistsData.playlists : []);
                }
            } catch (error) {
                console.error("Error fetching library stats:", error);
            }
        };

        fetchLibraryData();
    }, []);

    const totalDuration = useMemo(() => {
        return songs.reduce((acc, song) => acc + (Number(song.duration) || 0), 0);
    }, [songs]);

    const formattedLibraryDuration = useMemo(() => {
        const hours = Math.floor(totalDuration / 3600);
        const minutes = Math.floor((totalDuration % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }

        return `${minutes}m`;
    }, [totalDuration]);

    const recentSongs = useMemo(() => {
        return [...songs]
            .sort((a, b) => new Date(b.date_added || 0).getTime() - new Date(a.date_added || 0).getTime())
            .slice(0, 6);
    }, [songs]);

    const recentPlaylists = useMemo(() => {
        return [...playlists]
            .sort((a, b) => new Date(b.date_created || 0).getTime() - new Date(a.date_created || 0).getTime())
            .slice(0, 6);
    }, [playlists]);

    const formatSongDuration = (durationInSeconds) => {
        const safeDuration = Math.max(0, Number(durationInSeconds) || 0);
        const minutes = Math.floor(safeDuration / 60);
        const seconds = Math.floor(safeDuration % 60);
        return `${minutes}:${String(seconds).padStart(2, "0")}`;
    };

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

            <section className="library-stats-section">
                <div className="library-stats-header">
                    <p className="library-stats-eyebrow">Library overview</p>
                    <h2>Your Collection</h2>
                </div>

                <div className="library-stats-grid">
                    <article className="library-stat-card">
                        <p className="library-stat-label">Total Songs</p>
                        <p className="library-stat-value">{songs.length}</p>
                    </article>

                    <article className="library-stat-card">
                        <p className="library-stat-label">Total Playlists</p>
                        <p className="library-stat-value">{playlists.length}</p>
                    </article>

                    <article className="library-stat-card">
                        <p className="library-stat-label">Library Duration</p>
                        <p className="library-stat-value">{formattedLibraryDuration}</p>
                    </article>
                </div>
            </section>

            <section className="recent-songs-section">
                <div className="recent-songs-header">
                    <p className="recent-songs-eyebrow">Recently added</p>
                    <h2>Latest Songs</h2>
                </div>

                <div className="recent-songs-list">
                    {recentSongs.length === 0 ? (
                        <p className="recent-songs-empty">No songs added yet.</p>
                    ) : (
                        recentSongs.map((song) => (
                            <div
                                key={song.id}
                                className="recent-song-row"
                                role="button"
                                tabIndex={0}
                                onClick={() => togglePlayPause(song.id)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        togglePlayPause(song.id);
                                    }
                                }}
                            >
                                <div className="recent-song-main">
                                    <img
                                        src={`../../src-backend/${song.cover_path}`}
                                        alt={`${song.title} cover`}
                                        className="recent-song-cover"
                                    />
                                    <div className="recent-song-meta">
                                        <p className="recent-song-title">{song.title}</p>
                                        <p className="recent-song-artist">{song.artist}</p>
                                    </div>
                                </div>

                                <div className="recent-song-actions">
                                    <p className="recent-song-duration">{formatSongDuration(song.duration)}</p>
                                    <button
                                        type="button"
                                        className="recent-song-play-btn"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            togglePlayPause(song.id);
                                        }}
                                    >
                                        Play
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
            <section className="recent-playlist-section">
                <div className="recent-songs-header">
                    <h2>Latest Playlists</h2>
                </div>

                {recentPlaylists.length === 0 ? (
                    <p className="recent-playlist-empty">No playlists created yet.</p>
                ) : (
                    <div className="playlists-grid">
                        {recentPlaylists.map((playlist) => (
                            <div key={playlist.id} className="playlist-card">
                                <button className="playlist-play-btn" onClick={() => playCurrentPlaylist(playlist)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 4v16l13 -8z" /></svg>
                                </button>
                                <Link to={`/playlist/${playlist.id}`} className="playlist-link">
                                    <div className="playlist-cover">
                                        {playlist.cover_path ? (
                                            <img src={`http://localhost:8000/playlist-cover/${playlist.cover_name}`} alt={playlist.name} />
                                        ) : (
                                            <div className="default-cover">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11 17a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M17 17v-13h4" /><path d="M13 5h-10" /><path d="M3 9l10 0" /><path d="M9 13h-6" /></svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="playlist-info">
                                        <h3>{playlist.name}</h3>
                                        <p>{playlist.songs?.length || 0} songs</p>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}