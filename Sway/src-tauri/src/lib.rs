use std::process::{Command, Child};
use std::sync::Mutex;
use tauri::Manager;

// Store the backend process globally
static BACKEND_PROCESS: Mutex<Option<Child>> = Mutex::new(None);

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn start_python_backend() -> Result<Child, std::io::Error> {
    // Get the current executable's directory and go up to find src-backend
    let current_dir = std::env::current_dir()?;
    println!("Current directory: {:?}", current_dir);
    
    #[cfg(target_os = "windows")]
    let python_cmd = "python";
    
    #[cfg(not(target_os = "windows"))]
    let python_cmd = "python3";
    
    // Try to find the src-backend directory
    let backend_dir = current_dir.join("../src-backend");
    let script_path = backend_dir.join("main.py");
    let venv_python = backend_dir.join("venv/bin/python3");
    
    println!("Backend directory: {:?}", backend_dir);
    println!("Script path: {:?}", script_path);
    println!("Venv python: {:?}", venv_python);
    
    // Use venv python if it exists, otherwise fall back to system python
    let python_path = if venv_python.exists() {
        println!("Using venv Python");
        venv_python
    } else {
        println!("Venv not found, using system Python: {}", python_cmd);
        std::path::PathBuf::from(python_cmd)
    };
    
    Command::new(python_path)
        .arg(script_path)
        .current_dir(&backend_dir)
        .spawn()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Start the Python backend
            match start_python_backend() {
                Ok(child) => {
                    println!("Python backend started successfully with PID: {}", child.id());
                    *BACKEND_PROCESS.lock().unwrap() = Some(child);
                }
                Err(e) => {
                    eprintln!("Failed to start Python backend: {}", e);
                }
            }
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::Destroyed = event {
                // Stop the backend when the app closes
                if let Some(mut child) = BACKEND_PROCESS.lock().unwrap().take() {
                    let _ = child.kill();
                    println!("Python backend stopped");
                }
            }
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}