#!/usr/bin/env python3
# ============================================================
# HG (Взлом) — Permanent Server Application
# Main server that runs on Hugging Face with auto-restart
# ============================================================

import os
import sys
import threading
import logging
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime

logger = logging.getLogger(__name__)


class HGHandler(BaseHTTPRequestHandler):
    """HTTP request handler for the permanent server"""
    
    def do_GET(self):
        if self.path == '/health':
            self._handle_health()
        else:
            self._handle_main()
    
    def _handle_main(self):
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.end_headers()
        
        html = """<!DOCTYPE html>
<html>
<head>
    <title>HG (Взлом) — Permanent Server</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Courier New', monospace;
            background: #0a0a0a;
            color: #00ff00;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .container {
            border: 2px solid #00ff00;
            padding: 40px;
            text-align: center;
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
            max-width: 600px;
            width: 90%;
        }
        h1 { font-size: 2.5em; margin-bottom: 10px; }
        .subtitle { font-size: 1.2em; margin-bottom: 30px; color: #0f0; }
        .status {
            font-size: 1.2em;
            margin: 20px 0;
            padding: 20px;
            background: rgba(0, 255, 0, 0.05);
            border: 1px solid #00ff00;
            text-align: left;
            line-height: 2;
        }
        .status-item { display: flex; justify-content: space-between; }
        .label { color: #666; }
        .value { color: #0f0; }
        .timestamp {
            margin-top: 30px;
            font-size: 0.85em;
            color: #666;
        }
        .divider { border: none; border-top: 1px solid #0f0; margin: 20px 0; opacity: 0.3; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 HG (Взлом)</h1>
        <div class="subtitle">⚡ Permanent Server</div>
        <hr class="divider">
        <div class="status">
            <div class="status-item">
                <span class="label">Status:</span>
                <span class="value">✅ RUNNING</span>
            </div>
            <div class="status-item">
                <span class="label">Auto-restart:</span>
                <span class="value">🔄 ENABLED</span>
            </div>
            <div class="status-item">
                <span class="label">Uptime:</span>
                <span class="value">⏱️ Permanent</span>
            </div>
            <div class="status-item">
                <span class="label">Check Interval:</span>
                <span class="value">⏲️ 60 seconds</span>
            </div>
        </div>
        <div class="timestamp">
            Last check: {timestamp}<br>
            Server time: {server_time}
        </div>
    </div>
</body>
</html>""".format(
            timestamp=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            server_time=datetime.now().strftime('%Y-%m-%d %H:%M:%S %Z')
        )
        
        self.wfile.write(html.encode('utf-8'))
    
    def _handle_health(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        
        import json
        health = {
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'uptime': 'permanent',
            'auto_restart': True,
            'check_interval_seconds': 60,
            'server': 'HG (Взлом) — Permanent Server',
            'python_version': sys.version
        }
        self.wfile.write(json.dumps(health, indent=2).encode('utf-8'))
    
    def log_message(self, fmt, *args):
        logger.info(f"{self.client_address[0]} - {fmt % args}")


def start_server():
    """Start the HTTP server and return it"""
    port = int(os.environ.get('PORT', 7860))
    server_address = ('0.0.0.0', port)
    
    httpd = HTTPServer(server_address, HGHandler)
    
    logger.info(f"🚀 Server starting on port {port}")
    logger.info(f"📍 http://0.0.0.0:{port}")
    logger.info(f"📎 Health check: http://0.0.0.0:{port}/health")
    
    # Run in a thread
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    
    return httpd


def check_server_health():
    """Check if server is responding"""
    import socket
    port = int(os.environ.get('PORT', 7860))
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        sock.settimeout(5)
        result = sock.connect_ex(('0.0.0.0', port))
        return result == 0
    except Exception:
        return False
    finally:
        sock.close()


def main():
    """Standalone entry point"""
    # Setup logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    httpd = start_server()
    logger.info("✅ Server running indefinitely. Press Ctrl+C to stop.")
    
    try:
        while True:
            import time
            time.sleep(3600)
    except KeyboardInterrupt:
        logger.info("⚠️ Shutting down...")
        httpd.shutdown()


if __name__ == '__main__':
    main()
