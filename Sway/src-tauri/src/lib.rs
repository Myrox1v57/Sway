use std::fs;
use std::env;
use base64::{Engine as _, engine::general_purpose};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Manager};

#[derive(Serialize, Deserialize, Debug)]
struct SongMetadata {
    id: String,
    title: String,
    artist: String,
    song_file: String,
    cover_file: Option<String>,
    uploaded_at: u64,
}

#[derive(Serialize, Deserialize, Debug)]
struct SongsDatabase {
    songs: Vec<SongMetadata>,
}

#[tauri::command]
fn save_song(
    app: AppHandle,
    title: String,
    artist: String,
    song_data: String,
    song_file_name: String,
    cover_data: Option<String>,
    cover_file_name: Option<String>,
) -> Result<String, String> {
    // Use project directory instead of app data directory
    let project_dir = env::current_dir().map_err(|e| e.to_string())?;
    let uploads_dir = project_dir.join("uploads");
    let songs_dir = uploads_dir.join("songs");
    let covers_dir = uploads_dir.join("covers");
    
    fs::create_dir_all(&songs_dir).map_err(|e| e.to_string())?;
    fs::create_dir_all(&covers_dir).map_err(|e| e.to_string())?;
    
    // Generate unique ID
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis();
    let song_id = format!("{}_{}", timestamp, sanitize_filename(&title));
    
    // Decode and save song file
    let song_bytes = general_purpose::STANDARD
        .decode(&song_data)
        .map_err(|e| format!("Failed to decode song: {}", e))?;
    
    let song_path = songs_dir.join(&song_file_name);
    fs::write(&song_path, song_bytes).map_err(|e| e.to_string())?;
    
    // Save cover if provided
    let cover_file_path = if let (Some(cover_data), Some(cover_name)) = (cover_data, cover_file_name) {
        let cover_bytes = general_purpose::STANDARD
            .decode(&cover_data)
            .map_err(|e| format!("Failed to decode cover: {}", e))?;
        
        let cover_path = covers_dir.join(&cover_name);
        fs::write(&cover_path, cover_bytes).map_err(|e| e.to_string())?;
        Some(cover_name)
    } else {
        None
    };
    
    // Create metadata
    let metadata = SongMetadata {
        id: song_id,
        title: title.clone(),
        artist: artist.clone(),
        song_file: song_file_name.clone(),
        cover_file: cover_file_path,
        uploaded_at: timestamp as u64,
    };
    
    // Load existing database or create new one
    let db_path = uploads_dir.join("songs_database.json");
    let mut database = if db_path.exists() {
        let db_content = fs::read_to_string(&db_path).map_err(|e| e.to_string())?;
        serde_json::from_str::<SongsDatabase>(&db_content)
            .unwrap_or(SongsDatabase { songs: Vec::new() })
    } else {
        SongsDatabase { songs: Vec::new() }
    };
    
    // Add new song to database
    database.songs.push(metadata);
    
    // Save updated database
    let json_data = serde_json::to_string_pretty(&database).map_err(|e| e.to_string())?;
    fs::write(&db_path, json_data).map_err(|e| e.to_string())?;
    
    Ok(format!(
        "Song '{}' by {} saved successfully! Database updated.",
        title, artist
    ))
}

fn sanitize_filename(name: &str) -> String {
    name.chars()
        .map(|c| if c.is_alphanumeric() || c == '_' || c == '-' { c } else { '_' })
        .collect()
}

#[tauri::command]
fn get_all_songs(app: AppHandle) -> Result<String, String> {
    let project_dir = env::current_dir().map_err(|e| e.to_string())?;
    let db_path = project_dir.join("uploads").join("songs_database.json");
    
    if db_path.exists() {
        fs::read_to_string(&db_path).map_err(|e| e.to_string())
    } else {
        Ok(String::from("{\"songs\":[]}"))
    }
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, save_song, get_all_songs])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}