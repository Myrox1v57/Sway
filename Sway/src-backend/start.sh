#!/bin/bash
cd "$(dirname "$0")"

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "Virtual environment not found. Please create it first:"
    echo "python3 -m venv venv"
    echo "source venv/bin/activate"
    echo "pip install flask werkzeug mutagen"
    exit 1
fi

# Activate virtual environment and run main.py
source venv/bin/activate
python3 main.py
