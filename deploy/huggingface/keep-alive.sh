#!/bin/bash
# ============================================================
# HG (Взлом) — Keep Alive Script
# Ensures the main server process is always running
# ============================================================

LOG_FILE="/app/logs/keep-alive.log"
PID_FILE="/app/server.pid"

# Create logs directory if it doesn't exist
mkdir -p /app/logs

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Check if server is running
check_server() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            return 0  # Server is running
        fi
    fi
    return 1  # Server is not running
}

# Start the server
start_server() {
    log_message "🚀 Starting HG (Взлом) server..."
    
    # Start the main application (replace with your actual start command)
    # Example: node server.js, python app.py, etc.
    # For demonstration, we'll use a simple HTTP server
    python3 -m http.server 8000 &
    echo $! > "$PID_FILE"
    
    log_message "✅ Server started with PID: $(cat "$PID_FILE")"
}

# Main logic
if check_server; then
    log_message "✅ Server is running normally (PID: $(cat "$PID_FILE"))"
else
    log_message "⚠️ Server is not running. Restarting..."
    start_server
fi
