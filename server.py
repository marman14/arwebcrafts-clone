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

    def handle_api(self, method):
        import subprocess, json
        url_path = self.path.split("?")[0].split("#")[0].strip("/")
        api_name = url_path.split("/")[-1]
        js_file = DIRECTORY / "api" / f"{api_name}.js"
        
        body_data = b""
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length > 0:
            body_data = self.rfile.read(content_length)

        if js_file.exists():
            runner_script = f"""
            const handler = require('./api/{api_name}.js');
            let body = {{}};
            try {{ body = JSON.parse(process.argv[1]); }} catch(e) {{}}
            const req = {{
                method: '{method}',
                headers: {{ host: '{self.headers.get("Host", "localhost:3000")}' }},
                body: body
            }};
            const res = {{
                setHeader: () => {{}},
                status: (code) => ({{
                    json: (data) => console.log(JSON.stringify({{ status: code, data }})),
                    send: (data) => console.log(JSON.stringify({{ status: code, data }}))
                }}),
                json: (data) => console.log(JSON.stringify({{ status: 200, data }}))
            }};
            handler(req, res).catch(err => console.log(JSON.stringify({{ status: 500, data: {{ error: err.message }} }})));
            """
            try:
                proc = subprocess.run(
                    ["node", "-e", runner_script, body_data.decode('utf-8', 'ignore') or "{}"],
                    cwd=str(DIRECTORY),
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                output = proc.stdout.strip()
                if output:
                    res_obj = json.loads(output)
                    self.send_response(res_obj.get("status", 200))
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps(res_obj.get("data", {})).encode('utf-8'))
                    return
            except Exception as e:
                pass
        
        self.send_response(404)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(b'{"error":"API handler not found"}')

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_POST(self):
        if self.path.startswith('/api/'):
            return self.handle_api('POST')
        self.send_response(405)
        self.end_headers()

    def translate_path(self, path):
        clean_path = path.split("?")[0].split("#")[0].strip("/")
        target = DIRECTORY / clean_path
        if target.exists():
            if target.is_dir():
                idx = target / "index.html"
                if idx.exists():
                    return str(idx)
            return str(target)
        
        # Check if blog/clean_path exists
        blog_target = DIRECTORY / "blog" / clean_path
        if blog_target.exists():
            if blog_target.is_dir():
                idx = blog_target / "index.html"
                if idx.exists():
                    return str(idx)
            return str(blog_target)

        return super().translate_path(path)

    def do_GET(self):
        if self.path.startswith('/api/'):
            return self.handle_api('GET')
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
