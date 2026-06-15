#!/usr/bin/env python3
"""
Simple HTTP server for testing SPA routing locally.
Mimics nginx behavior: serves dist files, falls back to index.html for routes.
"""
import http.server
import socketserver
import os
from pathlib import Path
from urllib.parse import unquote, urlparse

PORT = 8080
DIST_DIR = Path(__file__).parent / "dist"

class SPARequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST_DIR), **kwargs)

    def do_GET(self):
        # Parse the request path
        parsed_path = urlparse(self.path)
        safe_path = parsed_path.path or '/'

        try:
            safe_path = unquote(safe_path)
        except Exception:
            safe_path = '/'

        file_path = DIST_DIR / safe_path.lstrip('/')
        
        # If it's a request for a file that exists, serve it
        if file_path.is_file():
            return super().do_GET()
        
        # If it's a directory request, try index.html
        if file_path.is_dir() and (file_path / 'index.html').is_file():
            self.path = f"{parsed_path.path}/index.html"
            return super().do_GET()
        
        # Otherwise, serve index.html (SPA route)
        self.path = '/index.html'
        return super().do_GET()

if __name__ == '__main__':
    if not DIST_DIR.exists():
        print(f"Error: {DIST_DIR} does not exist. Run 'npm run build' first.")
        exit(1)
    
    handler = SPARequestHandler
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"🚀 SPA server running at http://localhost:{PORT}")
        print(f"📁 Serving files from: {DIST_DIR}")
        print(f"✅ Navigate to http://localhost:{PORT}/staff to test the route")
        print(f"   Press Ctrl+C to stop\n")
        httpd.serve_forever()
