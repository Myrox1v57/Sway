# Sway - Desktop Music Player

A modern, cross-platform desktop music player built with Tauri, React, and Flask. Manage your local music library with an elegant interface, automatic queue playback, and seamless song management.

![Version](https://img.shields.io/badge/version-0.1.0-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Music Library Management** - Add, view, and organize your songs
- **Album Cover Support** - Display beautiful cover art for each track
- **Auto Queue System** - Automatically plays the next song when current ends
- **Modern UI** - Clean, responsive interface with smooth animations
- **Audio Controls** - Play, pause, skip, previous, and volume control
- **Local Storage** - All music files stored securely on your machine
- **Cross-Platform** - Works on Linux, Windows, and macOS
- **Easy Management** - Delete songs directly from the interface

## Technologies Used

### Frontend
- **React 19.1.0** - Modern UI framework
- **Vite 7.0.4** - Lightning-fast build tool and dev server
- **React Router DOM 7.12.0** - Client-side routing
- **CSS3** - Custom styling with gradients and animations

### Backend
- **Python 3.x** - Backend runtime
- **Flask** - Lightweight web framework for REST API
- **Werkzeug** - Secure file handling utilities

### Desktop Framework
- **Tauri 2.x** - Rust-based lightweight desktop framework
- **Rust** - Systems programming language
- **Cargo** - Rust package manager

### Additional Tools
- **JSON** - Database for song metadata
- **FormData API** - File uploads

## Prerequisites

Before running this project, ensure you have:

### 1. Node.js (v18 or higher)
Download from [nodejs.org](https://nodejs.org/)

### 2. Python (v3.8 or higher)
Download from [python.org](https://www.python.org/)

### 3. Rust (for Tauri)
```bash
# Linux/macOS
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Windows
# Download and run from: https://rustup.rs/
```

### 4. System Dependencies (Linux only)
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev

# Arch Linux
sudo pacman -S webkit2gtk base-devel curl wget file openssl \
  appmenu-gtk-module gtk3 libappindicator-gtk3 librsvg libvips
```

## Installation & Setup

### Step 1: Clone the Repository
```bash
git clone <your-repository-url>
cd Sway/Sway
```

### Step 2: Setup Backend (Python/Flask)

```bash
# Navigate to backend directory
cd src-backend

# Create a virtual environment
python3 -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# Install Flask and dependencies
pip install flask werkzeug

# The uploads directories will be created automatically
# But you can create them manually if needed:
mkdir -p uploads/covers uploads/songs
```

### Step 3: Setup Frontend (React/Tauri)

```bash
# Navigate back to project root
cd ..

# Install Node.js dependencies
npm install
```

## Running the Application

You need to run **both** the backend and frontend. Use two terminal windows:

### Terminal 1: Start the Backend Server

```bash
cd src-backend

# Activate virtual environment
source venv/bin/activate  # Linux/macOS
# OR
venv\Scripts\activate     # Windows

# Start Flask server
python main.py
```

Backend will run on: `http://localhost:8000`

### Terminal 2: Start the Frontend

```bash
# From project root (Sway/Sway)

# Option 1: Run as desktop app with Tauri
npm run tauri dev

# Option 2: Run in browser only (without Tauri)
npm run dev
```

Frontend will open automatically or visit: `http://localhost:1420`

## 📁 Project Structure

```
Sway/
├── src/                          # React frontend source
│   ├── components/               # Reusable React components
│   │   ├── add_song_form.jsx    # Form to add new songs
│   │   ├── song_list.jsx        # Display and manage song list
│   │   └── sidenav.jsx          # Navigation sidebar
│   ├── component_styles/         # Component-specific CSS
│   │   ├── home.css
│   │   ├── sidenav.css
│   │   ├── song-form.css
│   │   └── song-list.css
│   ├── pages/                    # Page components
│   │   └── home.jsx             # Home page
│   ├── assets/                   # Static assets
│   ├── App.jsx                   # Main application component
│   ├── App.css                   # Global styles
│   └── main.jsx                  # React entry point
│
├── src-backend/                  # Python Flask backend
│   ├── main.py                   # Flask REST API server
│   ├── uploads/                  # Uploaded files storage
│   │   ├── songs_database.json  # Song metadata database (auto-generated)
│   │   ├── covers/              # Album cover images
│   │   └── songs/               # Audio files (MP3, WAV)
│   └── venv/                     # Python virtual environment
│
├── src-tauri/                    # Tauri desktop configuration
│   ├── src/
│   │   ├── lib.rs               # Rust library code
│   │   └── main.rs              # Rust entry point
│   ├── Cargo.toml               # Rust dependencies
│   ├── tauri.conf.json          # Tauri app configuration
│   ├── build.rs                 # Build script
│   └── icons/                    # Application icons
│
├── public/                       # Static public assets
├── package.json                  # Node.js dependencies
├── vite.config.js               # Vite configuration
├── index.html                    # HTML entry point
└── README.md                     # This file
```

## API Endpoints

The Flask backend provides a REST API on `http://localhost:8000`:

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `GET` | `/get-songs` | Retrieve all songs | None |
| `POST` | `/add-song` | Add a new song | FormData with: `title`, `artist`, `cover` (file), `song_file` (file) |
| `DELETE` | `/delete-song/<id>` | Delete a song by ID | None |

### Example: Add a Song

```javascript
const formData = new FormData();
formData.append('title', 'Song Title');
formData.append('artist', 'Artist Name');
formData.append('cover', coverImageFile);     // PNG, JPG, JPEG
formData.append('song_file', audioFile);      // MP3, WAV

fetch('http://localhost:8000/add-song', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log('Success:', data));
```

## 🎨 How It Works

### Adding Songs
1. Click "Add Song" in the sidebar
2. Fill in title and artist name
3. Upload an album cover image (PNG/JPG)
4. Upload an audio file (MP3/WAV)
5. Click "Add Song" - files are stored with unique timestamps

### Playing Songs
1. Navigate to "Songs" page
2. Click "Play" on any song to start playback
3. Use the mini player at the top for controls:
   - ⏮ Previous song
   - ▶/⏸ Play/Pause
   - ⏭ Next song
4. When a song ends, the next one plays automatically!

### Queue System
- All songs form an automatic queue
- Songs play sequentially from top to bottom
- Currently playing song is highlighted
- Skip forward/backward through the queue

### Supported Formats
- **Audio:** MP3, WAV
- **Images:** PNG, JPG, JPEG

## Building for Production

### Build Desktop Application
```bash
# Build for your current platform
npm run tauri build

# Output locations:
# - Linux: src-tauri/target/release/bundle/
# - Windows: src-tauri/target/release/bundle/
# - macOS: src-tauri/target/release/bundle/
```

### Build Web Version (without Tauri)
```bash
npm run build

# Output: dist/ directory
# Serve with: npm run preview
```

## Troubleshooting

### Backend Issues

**Flask won't start:**
```bash
# Make sure Flask is installed
pip install flask werkzeug

# Check if port 8000 is already in use
# Linux/macOS:
lsof -i :8000
# Windows:
netstat -ano | findstr :8000

# Verify you're in the correct directory
cd src-backend
```

**Import errors:**
```bash
# Ensure virtual environment is activated
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows
```

### Frontend Issues

**Cannot connect to backend:**
- Verify Flask server is running on `http://localhost:8000`
- Check browser console for CORS errors
- Ensure CORS headers are set in `main.py`

**Tauri build fails:**
```bash
# Update Rust
rustup update

# Verify Rust installation
rustc --version

# On Linux, install system dependencies (see Prerequisites)
```

**Module not found errors:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Audio Playback Issues

**Songs won't play:**
- Verify file format is MP3 or WAV
- Check file paths in `uploads/songs_database.json`
- Open browser console for JavaScript errors
- Ensure files were uploaded correctly to `uploads/songs/`

**Images not displaying:**
- Verify image format is PNG, JPG, or JPEG
- Check file paths in database
- Ensure files exist in `uploads/covers/`

## Configuration

### Change Backend Port
Edit `src-backend/main.py` line 145:
```python
app.run(port=8000, debug=True)  # Change 8000 to your desired port
```

### Change Frontend Port
Edit `vite.config.js` line 15:
```javascript
server: {
  port: 1420,  // Change to your desired port
  strictPort: true,
}
```

### Enable/Disable Debug Mode
Edit `src-backend/main.py` line 21:
```python
app.config['DEBUG'] = True  # Set to False for production
```

## Security Notes

**This is a development version.** For production use:

- Disable Flask debug mode
- Implement proper authentication
- Validate all file uploads
- Sanitize user inputs
- Use HTTPS for production
- Restrict CORS to specific origins
- Add rate limiting
- Implement proper error handling

## Future Features

- [ ] Playlists and favorites
- [ ] Search and filter songs
- [ ] Audio visualization
- [ ] Shuffle and repeat modes
- [ ] Keyboard shortcuts
- [ ] Dark/Light theme toggle
- [ ] Lyrics display
- [ ] Equalizer controls
- [ ] ID3 tag editing
- [ ] Import from folders
- [ ] Export playlists

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## Support

If you encounter any issues:
1. Check the Troubleshooting section
2. Search existing issues on GitHub
3. Open a new issue with details about the problem

## 👨‍💻 Author

Builded from StamoV

---

**Happy Listening! 🎵**
