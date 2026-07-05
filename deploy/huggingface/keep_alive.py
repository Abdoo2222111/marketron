# ============================================================
# HG (Взлом) — Keep Alive Script
# Ensures the server is always running on Hugging Face
# ============================================================

import os
import sys
import time
import logging
import subprocess
from datetime import datetime
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/app/logs/keep_alive.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Configuration
CHECK_INTERVAL = 60  # seconds
PORT = int(os.environ.get('PORT', 7860))
PID_FILE = '/app/server.pid'


def check_server_running():
    """Check if the server is running by attempting to connect to it"""
    import socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('0.0.0.0', PORT))
    sock.close()
    
    if result == 0:
        logger.info(f"✅ Server is running on port {PORT}")
        return True
    else:
        logger.warning(f"⚠️ Server is NOT running on port {PORT}")
        return False


def start_server():
    """Start the main server"""
    logger.info("🚀 Starting server...")
    
    try:
        # Start the server process
        process = subprocess.Popen(
            [sys.executable, 'server.py'],
            stdout=open('/app/logs/server.log', 'a'),
            stderr=subprocess.STDOUT,
            start_new_session=True
        )
        
        # Save PID
        with open(PID_FILE, 'w') as f:
            f.write(str(process.pid))
        
        logger.info(f"✅ Server started with PID: {process.pid}")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to start server: {e}")
        return False


def keep_alive_loop():
    """Main keep-alive loop that runs forever"""
    logger.info("🔄 Keep-alive service started")
    logger.info(f"📍 Monitoring port: {PORT}")
    logger.info(f"⏱️ Check interval: {CHECK_INTERVAL} seconds")
    
    # Create logs directory
    Path('/app/logs').mkdir(parents=True, exist_ok=True)
    
    while True:
        try:
            if not check_server_running():
                logger.warning("⚠️ Server down! Attempting restart...")
                start_server()
        except Exception as e:
            logger.error(f"❌ Error in keep-alive loop: {e}")
        
        time.sleep(CHECK_INTERVAL)


if __name__ == '__main__':
    keep_alive_loop()
