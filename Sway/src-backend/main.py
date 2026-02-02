from flask import Flask, jsonify , request, send_from_directory, Response, stream_with_context
import os
import json
from datetime import datetime
from werkzeug.utils import secure_filename
import subprocess


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
DATABASE_FILE = 'uploads/songs_database.json'
ALLOWED_AUDIO_EXTENSIONS = {'mp3', 'wav'}
ALLOWED_COVER_EXTENSIONS = {'png', 'jpg', 'jpeg'}

#Pravim papkite za zapazvane na failovete ako ne sushtestvivat
os.makedirs(UPLOAD_FOLDER_COVERS, exist_ok=True)
os.makedirs(UPLOAD_FOLDER_SONGS, exist_ok=True)

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

        # Pravim Obekt za novata pesen
        new_song = {
            "id": timestamp,
            "title": title,
            "artist": artist,
            "cover_path": coverPath,
            "song_path": songPath,
            "cover_name": coverName,
            "song_name": songName,
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


# Startirame Flask servera
if __name__ == '__main__':
    app.run(port=8000, debug=True)
    
    

        

        

