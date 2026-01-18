import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

 function Form() {
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
  });
  const [coverFile, setCoverFile] = useState(null);
  const [songFile, setSongFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setCoverFile(file);
    } else {
      setMessage("Please select a valid image file");
    }
  };

  const handleSongChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type.startsWith("audio/") || file.name.endsWith(".mp3") || file.name.endsWith(".wav"))) {
      setSongFile(file);
    } else {
      setMessage("Please select a valid audio file");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.artist || !songFile) {
      setMessage("Please fill all required fields and select a song file");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      // Read files as base64
      const songBuffer = await fileToBase64(songFile);
      const coverBuffer = coverFile ? await fileToBase64(coverFile) : null;

      // Call Tauri backend command
      const result = await invoke("save_song", {
        title: formData.title,
        artist: formData.artist,
        songData: songBuffer,
        songFileName: songFile.name,
        coverData: coverBuffer,
        coverFileName: coverFile ? coverFile.name : null,
      });

      setMessage(`Success! ${result}`);
      // Reset form
      setFormData({ title: "", artist: "" });
      setCoverFile(null);
      setSongFile(null);
      e.target.reset();
    } catch (error) {
      setMessage(`Error: ${error}`);
    } finally {
      setUploading(false);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="add-song-form" style={{ paddingLeft: 250, maxWidth: "500px", margin: "auto" }}>
      <h2>Add New Song</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="artist">Artist *</label>
          <input
            type="text"
            id="artist"
            name="artist"
            value={formData.artist}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="cover">Cover Image (optional)</label>
          <input
            type="file"
            id="cover"
            accept="image/*"
            onChange={handleCoverChange}
          />
          {coverFile && <p className="file-name">Selected: {coverFile.name}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="song">Song File *</label>
          <input
            type="file"
            id="song"
            accept="audio/*,.mp3,.wav,.flac,.ogg"
            onChange={handleSongChange}
            required
          />
          {songFile && <p className="file-name">Selected: {songFile.name}</p>}
        </div>

        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Add Song"}
        </button>

        {message && <p className={message.startsWith("Success") ? "success" : "error"}>{message}</p>}
      </form>
    </div>
  );
}
export default Form;
