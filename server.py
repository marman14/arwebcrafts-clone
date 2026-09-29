import http.server
import socketserver
import os
import sys
from pathlib import Path

PORT = 3000
DIRECTORY = Path(__file__).resolve().parent

class CleanHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)

    def do_GET(self):
        # Handle trailing slash or clean urls
        url_path = self.path.split("?")[0].split("#")[0]
        local_file = DIRECTORY / url_path.lstrip("/")
        
        if local_file.is_dir():
            index_file = local_file / "index.html"
            if index_file.exists():
                self.path = url_path.rstrip("/") + "/index.html"
        elif not local_file.exists():
            # Check if url_path + /index.html exists
            clean_dir = DIRECTORY / url_path.strip("/") / "index.html"
            if clean_dir.exists():
                self.path = "/" + url_path.strip("/") + "/index.html"

        return super().do_GET()

    def end_headers(self):
        # Enable CORS and caching headers
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    with socketserver.TCPServer(("", port), CleanHandler) as httpd:
        print(f"Serving AR Webcrafts Clone at http://localhost:{port}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
