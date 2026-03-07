import React, { useState } from "react";
import "../component_styles/song-form.css";

//TODO: 1. Syle the form
const Form = () => {
  // Pravene na state obekt za form data
  const[formData, setFormData] = useState({
    title:"",
    artist:"",
    coverFile:null,
    audioFile:null
  });
  // Pravene na state za cover preview i loading status
  const [cover , setCover] = useState(null);
  const [loading, setLoading] = useState(false);

  // Funkciq za obrabotka na promenite v input poletata
  const HandleInput = (e) => {
    const {name, value} = e.target; // Destrukturirane na imeto i stoinostta na inputa
    setFormData((prevData) => ({
      ...prevData, // Zapazvane na predishnite danni
      [name]: value // Aktualizirane na promenenoto pole
    }));
  };
  // Funkciq za obrabotka na izbranite failove
  const HandleFile = (e) => {
    const {name, files} = e.target; // Destrukturirane na imeto i failovete ot inputa
    const file = files[0]; // Vzimane na purviq fail ot spisaka
    
    // spriame ako faila e null
    if(!file) return;

    // Update na formData s izbranite failove
    setFormData((prevData) => ({
      ...prevData,
      [name]: file
    }));

    // Ako e cover file, suzdavame preview za da vidim izbranata snimka
    if(name === "coverFile" && file.type.startsWith("image/")) {
      const reader = new FileReader(); // Sazdavane na FileReader obekt
      reader.onloadend = () => {
        setCover(reader.result); // Setvame cover state s rezultata ot FileReader
      };
      reader.readAsDataURL(file); // Chetene na faila kato Data URL
    }
  };

  // Funkciq za obrabotka na submit na formata
  const HandleSumbit = async (e) => {
    e.preventDefault();
    setLoading(true); // Setvame loading na true po vreme na izprashtaneto
    
    try {
      //proverqvame dali vsichki poleta sa popylneni
      if(!formData.title || !formData.artist || !formData.coverFile || !formData.audioFile) {
      alert("Please fill all fields.");
      setLoading(false);
      return;
      }
      // pravim formData obekt za izprashtane
      const data = new FormData();
      data.append("title", formData.title);
      data.append("artist", formData.artist);
      data.append("cover", formData.coverFile);
      data.append("song_file", formData.audioFile);

      // Izprashtame dannite kum backenda 
      const response = await fetch("http://localhost:8000/add-song", {
        method: "POST",
        body: data // izprashtame formData kato tqlo na zayavkata
      });
      // Proverqvame otgovora ot severa
      if(!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      // Obrabotvame uspeshniq otgovor
      const result = await response.json();
      console.log("Success:", result);
      alert("Song added successfully!");

      // Resetvame formata sled uspeshno dobavqne
      setFormData({
        title:"",
        artist:"",
        coverFile:null,
        audioFile:null
      });
      setCover(null);
      e.target.reset(); // Resetvame formata v UI
  
    } catch (error) { // Obrabotvame greshkite
      console.error("Error:", error);
      alert("Failed to add song. Please try again.");
    }finally {
      setLoading(false); // Setvame loading na false sled zavurshvane na izprashtaneto
    }
  } 
  // Vryshatme formata s vsichkite inputi i preview na cover snimkata
  return (
    <form onSubmit={HandleSumbit} className="add-song-form">
      <div className="form-header">
        <h2>Add New Song</h2>
      </div>

      <div className="form-content">
        <div className="form-section">
          <h3 className="section-title">Song Details</h3>
          <div className="inputs-container">
            <div className="SongInput">
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={HandleInput}
                placeholder="Enter song title"
                required
              />
              <span>Title</span>
            </div>

            <div className="SongInput">
              <input
                type="text"
                id="artist"
                name="artist"
                value={formData.artist}
                onChange={HandleInput}
                placeholder="Enter artist name"
                required
              />
              <span>Artist</span>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Upload</h3>
          <div className="upload-container">
            <div className="upload-item">
              <label className="upload-label">Cover Art</label>
              <label className="custum-file-upload" htmlFor="file">
                {cover && <img src={cover} alt="Cover Preview" className="cover-preview" />}
                <div className="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="" viewBox="0 0 24 24"><g strokeWidth="0" id="SVGRepo_bgCarrier"></g><g strokeLinejoin="round" strokeLinecap="round" id="SVGRepo_tracerCarrier"></g><g id="SVGRepo_iconCarrier"> <path fill="" d="M10 1C9.73478 1 9.48043 1.10536 9.29289 1.29289L3.29289 7.29289C3.10536 7.48043 3 7.73478 3 8V20C3 21.6569 4.34315 23 6 23H7C7.55228 23 8 22.5523 8 22C8 21.4477 7.55228 21 7 21H6C5.44772 21 5 20.5523 5 20V9H10C10.5523 9 11 8.55228 11 8V3H18C18.5523 3 19 3.44772 19 4V9C19 9.55228 19.4477 10 20 10C20.5523 10 21 9.55228 21 9V4C21 2.34315 19.6569 1 18 1H10ZM9 7H6.41421L9 4.41421V7ZM14 15.5C14 14.1193 15.1193 13 16.5 13C17.8807 13 19 14.1193 19 15.5V16V17H20C21.1046 17 22 17.8954 22 19C22 20.1046 21.1046 21 20 21H13C11.8954 21 11 20.1046 11 19C11 17.8954 11.8954 17 13 17H14V16V15.5ZM16.5 11C14.142 11 12.2076 12.8136 12.0156 15.122C10.2825 15.5606 9 17.1305 9 19C9 21.2091 10.7909 23 13 23H20C22.2091 23 24 21.2091 24 19C24 17.1305 22.7175 15.5606 20.9844 15.122C20.7924 12.8136 18.858 11 16.5 11Z" clipRule="evenodd" fillRule="evenodd"></path> </g></svg>
                </div>
                <div className="text">
                  <span>Click to upload image</span>
                </div>
                <input type="file" id="file" onChange={HandleFile} name="coverFile" accept="image/*" />
              </label>
            </div>

            <div className="upload-item">
              <label className="upload-label">Audio File</label>
              <label className="custum-file-upload audio-upload" htmlFor="audioFile">
                <div className="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                    <path d="M9 19C9 20.1046 7.65685 21 6 21C4.34315 21 3 20.1046 3 19C3 17.8954 4.34315 17 6 17C7.65685 17 9 17.8954 9 19ZM9 19V5L21 3V17M21 17C21 18.1046 19.6569 19 18 19C16.3431 19 15 18.1046 15 17C15 15.8954 16.3431 15 18 15C19.6569 15 21 15.8954 21 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="text">
                  <span>{formData.audioFile ? formData.audioFile.name : "Click to upload audio"}</span>
                </div>
                <input type="file" id="audioFile" name="audioFile" accept="audio/*" onChange={HandleFile} />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={loading} className="submit-button">
          {loading ? (
            <>
              <span className="spinner"></span>
              Adding...
            </>
          ) : (
            "Add Song"
          )}
        </button>
      </div>
    </form>
  );
};
    
export default Form;
