import http.server
import socketserver

PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler

print(f"Server running on http://0.0.0.0:{PORT}")

with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
    httpd.serve_forever()
