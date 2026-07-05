# ============================================================
# HG (Взлом) — Hugging Face Space Entry Point
# Main application for Hugging Face Spaces
# ============================================================

import os
import sys
import threading
import logging
from pathlib import Path

# Setup logging first
log_dir = Path('/app/logs')
log_dir.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/app/logs/app.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Import after setting up logging
from server import start_server, check_server_health
from keep_alive import keep_alive_loop


def main():
    """Main entry point for Hugging Face Spaces"""
    logger.info("🚀 HG (Взлوم) starting on Hugging Face Spaces...")
    logger.info(f"📍 Port: {os.environ.get('PORT', '7860 (default)')}")
    logger.info(f"🐍 Python: {sys.version}")
    
    # Create required directories
    Path('/app/data').mkdir(parents=True, exist_ok=True)
    Path('/app/logs').mkdir(parents=True, exist_ok=True)
    
    # Start the server in a separate thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    
    # Start keep-alive in another thread
    keep_alive_thread = threading.Thread(target=keep_alive_loop, daemon=True)
    keep_alive_thread.start()
    
    logger.info("✅ All services started successfully")
    logger.info("🔄 Server is now running permanently")
    
    # Keep the main thread alive
    try:
        server_thread.join()
    except KeyboardInterrupt:
        logger.info("⚠️ Received interrupt signal. Shutting down...")
    
    logger.info("👋 Goodbye!")


if __name__ == '__main__':
    main()
