from flask import Flask, jsonify , request, send_from_directory, Response, stream_with_context
import os
import json
from datetime import datetime
from werkzeug.utils import secure_filename
import subprocess
from mutagen import File 



# Pravim Flask aplikaciq
app = Flask(__name__)

# Definiram headers za da se dobavqt kum vsqka otgovor
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, DELETE, OPTIONS'
    return response

# Configuraciq na prilojenieto
app.config['DEBUG'] = True
UPLOAD_FOLDER_COVERS = 'uploads/covers'
UPLOAD_FOLDER_SONGS = 'uploads/songs'
UPLOAD_FOLDER_PLAYLIST_COVERS = 'uploads/playlist_covers'
DATABASE_FILE = 'uploads/songs_database.json'
PLAYLIST_FILE = 'uploads/playlist.json'
ALLOWED_AUDIO_EXTENSIONS = {'mp3', 'wav'}
ALLOWED_COVER_EXTENSIONS = {'png', 'jpg', 'jpeg'}

#Pravim papkite za zapazvane na failovete ako ne sushtestvivat
os.makedirs(UPLOAD_FOLDER_COVERS, exist_ok=True)
os.makedirs(UPLOAD_FOLDER_SONGS, exist_ok=True)
os.makedirs(UPLOAD_FOLDER_PLAYLIST_COVERS, exist_ok=True)

# Proverqvame dali razshirenieto na faila e pozvoleno
def allowed_file(filename, allowed_extensions):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions
# Zarejdame bazata danni ot JSON fail
def load_database():
    if os.path.exists(DATABASE_FILE): # ako faila sushtestvuva
        with open(DATABASE_FILE, 'r') as f: # da go otvorem za chetene
            return json.load(f) # da go vurnem kato json obekt
    return {"songs": []} # ako ne sushtestvuva, vurni prazna baza danni
# zapisvane na bazata danni v JSON fail
def save_database(database):
    with open(DATABASE_FILE, 'w') as f:# otvarqme faila za zapisvane
        json.dump(database, f, indent=4) # zapisvame bazata danni kato json v faila s otdelenie ot 4 space-a

# Zarejdame playlist bazata danni ot JSON fail
def load_playlist_database():
    if os.path.exists(PLAYLIST_FILE): # ako faila sushtestvuva
        with open(PLAYLIST_FILE, 'r') as f: # da go otvorem za chetene
            return json.load(f) # da go vurnem kato json obekt
    return {"playlists": []} # ako ne sushtestvuva, vurni prazna baza danni

# zapisvane na playlist bazata danni v JSON fail
def save_playlist_database(database):
    with open(PLAYLIST_FILE, 'w') as f:# otvarqme faila za zapisvane
        json.dump(database, f, indent=4) # zapisvame bazata danni kato json v faila s otdelenie ot 4 space-a


# Pravim route za dobavqne na nova pesen
# Izpolzvame metoda POST
@app.route('/add-song', methods=['POST'])
def addSong():
    try:
        

        # Vzemame dannite ot form
        title = request.form.get('title')
        artist = request.form.get('artist')
        cover = request.files.get('cover')
        song_file = request.files.get('song_file')

       

        # Proverqvame dali vsichki danni sa dadeni
        if not title or not artist: #za inputite title i artist
            return jsonify({"error": "Title and artist are required."}), 400
        
        if not cover or not song_file: # za file-ovete cover i song_file
            return jsonify({"error": "Cover image and song file are required."}), 400
        
        # Proverqvame dali razshireniyata na file-ovete sa pozvoleni
        if not allowed_file(cover.filename, ALLOWED_COVER_EXTENSIONS): # za cover
            return jsonify({"error": "Invalid cover image format."}), 400
        
        if not allowed_file(song_file.filename, ALLOWED_AUDIO_EXTENSIONS): # za audio file
            return jsonify({"error": "Invalid song file format."}), 400 
        

        # Zapazvame file-ovete s sigurni imena
        timestamp = datetime.now().timestamp() # dobavqme timestamp za unikalnost

        coverName = secure_filename(f"{timestamp}_{cover.filename}")
        songName = secure_filename(f"{timestamp}_{song_file.filename}")

        # Zapazvame file-ovete v papkite
        coverPath = os.path.join(UPLOAD_FOLDER_COVERS, coverName)
        songPath = os.path.join(UPLOAD_FOLDER_SONGS, songName)

        cover.save(coverPath)
        song_file.save(songPath)

        # Vzemame duraciqta na pesenta v sekundite
        def get_duration(file_path):
            try:
                audio = File(file_path)
                if audio and audio.info:
                    return int(audio.info.length) # vurni duraciqta v sekundite
            except Exception as e:
                print(f"Error getting duration for {file_path}: {str(e)}")
            return 0
        
        

        # Pravim Obekt za novata pesen
        new_song = {
            "id": timestamp,
            "title": title,
            "artist": artist,
            "cover_path": coverPath,
            "song_path": songPath,
            "cover_name": coverName,
            "song_name": songName,
            "duration":  get_duration(songPath),
            "date_added": datetime.now().isoformat()
        }
        

        # Zarejdame bazata danni
        db = load_database()
        
        db['songs'].append(new_song)# Dobavqme novata pesen kum bazata danni
        save_database(db)# Zapazvame bazata danni
        return jsonify({ # Vurni uspeshen otgovor
            "success": True,
            "message": "Song added successfully.",
            "song": new_song
        }),201
    except Exception as e: # Obrabotvame greshkite
        return jsonify({"error": str(e)}), 500

# Vzemame vsichki pesni
@app.route('/get-songs', methods=['GET'])
def getSongs():
    try:
        db = load_database()# Zarejdame bazata danni
        return jsonify(db), 200 # Vurni bazata danni kato otgovor
    except Exception as e: # Obrabotvame greshkite
        return jsonify({"error": str(e)}), 500
# Iztrivame pesen po ID
# Izpolzvame metoda DELETE
# ID-to na pesenta se predava kato chast ot URL-a
@app.route('/delete-song/<float:song_id>', methods=['DELETE'])
def deleteSong(song_id):
    try:
        db = load_database() # Zarejdame bazata danni
        song = next((s for s in db['songs'] if s['id'] == song_id), None) # Namirame pesenta s dadenoto ID
        if not song: # Ako pesenta ne e namerena
            return jsonify({"error": "Song not found."}), 404
        # Iztrivame file-ovete ot papkite
        if os.path.exists(song['cover_path']):# ako cover-a sushtestvuva
            os.remove(song['cover_path'])# iztrivame go
        if os.path.exists(song['song_path']):# ako audio file-a sushtestvuva
            os.remove(song['song_path'])# iztrivame go
        # Iztrivame pesenta ot bazata danni
        db["songs"]= [s for s in db["songs"] if s["id"] != song_id] # filtrirame bazata danni bez pesenta s dadenoto ID
        save_database(db) # Zapazvame bazata danni
        return jsonify({ # Vurni uspeshen otgovor
            "success": True,
            "message": "Song deleted successfully."
        }), 200
    except Exception as e: # Obrabotvame greshkite
        return jsonify({"error": str(e)}), 500

# Streamvame pesen po ID
# Izpolzvame metoda GET
@app.route('/stream-song/<float:song_id>', methods=['GET'])
def streamSong(song_id):
    try:
        db = load_database()  # Zarejdame bazata danni
        song = next((s for s in db['songs'] if s['id'] == song_id), None)  # Namirame pesenta s dadenoto ID
        if not song:  # Ako pesenta ne e namerena
            return jsonify({"error": "Song not found."}), 404
        
       # Vzemame putq do pesenta
        song_path = song['song_path']
        
        # Uverqvame se che putqt e tuk
        if not os.path.isabs(song_path):
            song_path = os.path.abspath(song_path)
        
        if not os.path.exists(song_path):
            return jsonify({"error": f"Song file not found at: {song_path}"}), 404
        
        # Opredelqme razshirenieto na faila
        file_ext = song_path.split('.')[-1].lower()
        
        # Opredelqme pravilniq MIME tip
        mime_types = {
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'ogg': 'audio/ogg',
            'flac': 'audio/flac',
            'm4a': 'audio/mp4'
        }
        mime_type = mime_types.get(file_ext, 'audio/mpeg') # po default e audio/mpeg
        
        # Vzemame direktorijata i imeto na faila
        directory = os.path.dirname(song_path)
        filename = os.path.basename(song_path)
        
        # Izprashtame faila s pravilnite headers za streamvane
        response = send_from_directory(
            directory,
            filename,
            mimetype=mime_type, # opredelqme MIME tipa
            as_attachment=False, # ne go izprashtame kato prilojenie za svalqvane
            conditional=True # poddurjame byte range zahtevi
        )
        
        # Dobavqme nujnite headers
        response.headers['Access-Control-Allow-Origin'] = '*' # CORS header
        response.headers['Accept-Ranges'] = 'bytes' # poddurjame byte range zahtevi
        
        return response
        
    except Exception as e:
        print(f"Error streaming song: {str(e)}")  # Log error
        return jsonify({"error": str(e)}), 500

# Streamvame pesen po ID izpolzvaiki ffmpeg za konvertirane v realno vreme
# Izpolzvame metoda GET
@app.route('/stream-song-ffmpeg/<float:song_id>', methods=['GET'])
def streamSongFfmpeg(song_id):
    try:
        db = load_database()  # Zarejdame bazata danni
        song = next((s for s in db['songs'] if s['id'] == song_id), None)  # Namirame pesenta s dadenoto ID
        if not song:  # Ako pesenta ne e namerena
            return jsonify({"error": "Song not found."}), 404
        
        song_path = song['song_path']
        
        if not os.path.exists(song_path):
            return jsonify({"error": "Song file not found."}), 404
        
        # Proverqvame dali ffmpeg e dostupen
        try:
            subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            #  ffmpeg ne e dostupen, izprashtame originalniq fail
            return send_from_directory(
                os.path.dirname(song_path), # direktorijata
                os.path.basename(song_path), # imeto na faila
                mimetype='audio/mpeg'
            )
        
        # Generator za streamvane na audio chasti
        def generate():
            # Komanda za ffmpeg za konvertirane na audio v mp3 format v realno vreme
            command = [
                'ffmpeg',
                '-i', song_path,
                '-f', 'mp3',
                '-acodec', 'libmp3lame',
                '-ab', '192k',
                '-ar', '44100',
                '-ac', '2',
                '-'
            ]
            
            process = subprocess.Popen(
                command,
                stdout=subprocess.PIPE, # izpolzvame stdout za da vzimame izhodnite danni
                stderr=subprocess.DEVNULL, # ignorirame stderr
                bufsize=8192 # buferen razmer
            )
            
            try:
                while True:
                    chunk = process.stdout.read(8192) # chetem po 8192 bajta
                    if not chunk:
                        break
                    yield chunk
            finally:
                process.terminate() # zavarshvame procesa
                process.wait() # izchakvame procesa da se zavarshi
        
        return Response(
            stream_with_context(generate()), # streamvame ot generatora
            mimetype='audio/mpeg', # opredelqme MIME tip
            headers={
                'Content-Disposition': f'inline; filename="{song["song_name"]}"', # ime na faila
                'Accept-Ranges': 'bytes', # poddurjame byte range zahtevi
                'Cache-Control': 'no-cache', # bez keshirane
                'Access-Control-Allow-Origin': '*' # CORS header
            }
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#==================
# Playlist Management
#===================

@app.route('/create-playlist', methods=['POST'])
def CreatePlaylist():
    try:
        timestamp = datetime.now().timestamp() # dobavqme timestamp za unikalnost
        playlist_name = request.form.get('playlist_name') # Vzemame imeto na playlist-a ot formata
        playlist_cover = request.files.get('playlist_cover') # Vzemame cover-a na playlist-a ot formata

        # Proverqvame dali imeto e dadeno
        if not playlist_name:
            return jsonify({"error": "Playlist name is required."}), 400

        # Zapazvame cover-a ako e daden
        cover_path = None
        cover_name = None
        if playlist_cover and allowed_file(playlist_cover.filename, ALLOWED_COVER_EXTENSIONS):
            cover_name = secure_filename(f"{timestamp}_{playlist_cover.filename}")
            cover_path = os.path.join(UPLOAD_FOLDER_PLAYLIST_COVERS, cover_name)
            playlist_cover.save(cover_path)

        # Sazdavame nov playlist obekt
        new_playlist = {
            "id": timestamp,
            "name": playlist_name,
            "cover_path": cover_path,
            "cover_name": cover_name,
            "songs": [],
            "date_created": datetime.now().isoformat()
        }

        # Zarejdame i updejtvame bazata danni
        db = load_playlist_database()
        db['playlists'].append(new_playlist) # Dobavqme noviq playlist
        save_playlist_database(db) # Zapazvame bazata danni

        return jsonify({ # Vurni uspeshen otgovor
            "success": True,
            "message": "Playlist created successfully.",
            "playlist": new_playlist
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/get-playlists', methods=['GET'])
def getPlaylists():
    try:
        db = load_playlist_database() # Zarejdame playlist bazata danni
        return jsonify(db), 200 # Vurni vsichki playlisti kato otgovor
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/get-playlist/<float:playlist_id>', methods=['GET'])
def getPlaylist(playlist_id):
    try:
        db = load_playlist_database() # Zarejdame bazata danni
        playlist = next((p for p in db['playlists'] if p['id'] == playlist_id), None) # Namirame playlist-a s dadenoto ID
        if not playlist:
            return jsonify({"error": "Playlist not found."}), 404
        return jsonify(playlist), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/delete-playlist/<float:playlist_id>', methods=['DELETE'])
def deletePlaylist(playlist_id):
    try:
        db = load_playlist_database() # Zarejdame bazata danni
        playlist = next((p for p in db['playlists'] if p['id'] == playlist_id), None) # Namirame playlist-a
        if not playlist:
            return jsonify({"error": "Playlist not found."}), 404
        # Iztrivame cover-a ako sushtestvuva
        if playlist.get('cover_path') and os.path.exists(playlist['cover_path']):
            os.remove(playlist['cover_path'])
        # Iztrivame playlist-a ot bazata danni
        db['playlists'] = [p for p in db['playlists'] if p['id'] != playlist_id]
        save_playlist_database(db)
        return jsonify({
            "success": True,
            "message": "Playlist deleted successfully."
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/add-song-to-playlist/<float:playlist_id>', methods=['POST'])
def addSongToPlaylist(playlist_id):
    try:
        song_id = request.json.get('song_id') # Vzemame ID-to na pesenta
        if not song_id:
            return jsonify({"error": "Song ID is required."}), 400
        
        db = load_playlist_database()
        playlist = next((p for p in db['playlists'] if p['id'] == playlist_id), None)
        if not playlist:
            return jsonify({"error": "Playlist not found."}), 404
        
        # Proverqvame dali pesenta veche e v playlist-a
        if song_id in playlist['songs']:
            return jsonify({"error": "Song already in playlist."}), 400
        
        playlist['songs'].append(song_id)
        save_playlist_database(db)
        return jsonify({
            "success": True,
            "message": "Song added to playlist successfully."
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Pravim route za dobavqne na pesen kum playlist-a
@app.route('/add-to-playlist/<float:song_id>', methods=['POST'])
def addToPlaylist(song_id):
    try:
        
        db = load_database() # Zarejdame bazata danni
        song = next((s for s in db['songs'] if s['id'] == song_id), None) # Namirame pesenta s dadenoto ID
        if not song: # Ako pesenta ne e namerena
            return jsonify({"error": "Song not found."}), 404
        
        playlist = load_playlist_database() # Zarejdame playlist-a
        if any(s['id'] == song_id for s in playlist['playlist']): # Proverqvame dali pesenta veche e v playlist-a
            return jsonify({"error": "Song already in playlist."}), 400


       
        
        playlist['songs'].append(song) # Dobavqme pesenta kum playlist-a
        save_playlist_database(playlist) # Zapazvame playlist-a
        
        return jsonify({ # Vurni uspeshen otgovor
            "success": True,
            "message": "Song added to playlist successfully.",
            "song": song
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    


# Servirame playlist cover po ime
@app.route('/playlist-cover/<filename>', methods=['GET'])
def getPlaylistCover(filename):
    try:
        return send_from_directory(UPLOAD_FOLDER_PLAYLIST_COVERS, filename)
    except Exception as e:
        return jsonify({"error": str(e)}), 404


# Startirame Flask servera
if __name__ == '__main__':
    app.run(port=8000, debug=True)
    
    

        

        

