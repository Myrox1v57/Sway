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
      <h2>Add New Song</h2>

      <div className="form-group">
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={HandleInput}
          placeholder="Enter song title"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="artist">Artist:</label>
        <input
          type="text"
          id="artist"
          name="artist"
          value={formData.artist}
          onChange={HandleInput}
          placeholder="Enter artist name"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="coverFile">Cover Image:</label>
        <input
          type="file"
          id="coverFile"
          name="coverFile"
          accept="image/*"
          onChange={HandleFile}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="audioFile">Audio File:</label>
        <input
          type="file"
          id="audioFile"
          name="audioFile"
          accept="audio/*"
          onChange={HandleFile}
          required
        />
      </div>
      
      <button type="submit" disabled={loading} className="sumbit-button">
        {loading ? "Adding..." : "Add Song"}
      </button>
      {cover && <img src={cover} alt="Cover Preview" className="cover-preview" />}
    </form>
  );
};
    
export default Form;
