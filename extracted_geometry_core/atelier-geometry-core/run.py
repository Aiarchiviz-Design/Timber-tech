#!/usr/bin/env python3
"""Start the Atelier BIM app locally with Python only (standard library, Python 3.9+).

Usage (from this folder):
    python run.py            (Windows)
    python3 run.py           (macOS / Linux)

Serves the app's static files on http://127.0.0.1:4180/ (override with ATELIER_PORT).
The app is served from ./dist when that folder exists, otherwise from this folder itself
if it contains index.html. Press Ctrl+C to stop.
"""
import http.server
import mimetypes
import os
import socketserver
import sys
import threading
import webbrowser
from pathlib import Path
from urllib.parse import unquote

HERE = Path(__file__).resolve().parent
HOST = "127.0.0.1"
DEFAULT_PORT = 4180

MIME = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".wasm": "application/wasm",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".txt": "text/plain; charset=utf-8",
    ".md": "text/plain; charset=utf-8",
}


def find_root():
    """Return the folder that holds the app's index.html, or None."""
    for candidate in (HERE / "dist", HERE):
        if (candidate / "index.html").is_file():
            return candidate
    return None


def get_port():
    raw = os.environ.get("ATELIER_PORT", "").strip()
    if not raw:
        return DEFAULT_PORT
    try:
        port = int(raw)
    except ValueError:
        sys.exit(f"ATELIER_PORT must be a number, got {raw!r}.")
    if not 1 <= port <= 65535:
        sys.exit(f"ATELIER_PORT must be between 1 and 65535, got {port}.")
    return port


class Handler(http.server.SimpleHTTPRequestHandler):
    root = None  # set in main()

    def translate_path(self, path):
        # Map the URL onto the app root and refuse anything that escapes it.
        rel = unquote(path.split("?", 1)[0].split("#", 1)[0]).lstrip("/")
        target = (Handler.root / rel).resolve()
        if target != Handler.root and Handler.root not in target.parents:
            return str(Handler.root / "__forbidden__")
        if target.is_dir():
            target = target / "index.html"
        return str(target)

    def end_headers(self):
        # The app's scripts change often; never let the browser show a stale copy.
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        super().end_headers()

    def guess_type(self, path):
        ext = os.path.splitext(path)[1].lower()
        return MIME.get(ext) or mimetypes.guess_type(path)[0] or "application/octet-stream"

    def log_message(self, fmt, *args):
        # Quieter console: only show errors, not every asset request.
        if args and str(args[1]).startswith(("4", "5")):
            sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))


class ReusableServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    allow_reuse_address = True
    daemon_threads = True


def main():
    if sys.version_info < (3, 9):
        sys.exit(f"Python 3.9 or newer is required; this is Python {sys.version.split()[0]}.")

    root = find_root()
    if root is None:
        sys.exit(
            "Could not find the app files.\n"
            f"Looked for index.html in: {HERE / 'dist'} and {HERE}\n"
            "Re-extract the full ZIP (it must contain dist/index.html or index.html next to run.py)."
        )

    port = get_port()
    Handler.root = root.resolve()
    try:
        server = ReusableServer((HOST, port), Handler)
    except OSError as err:
        sys.exit(
            f"Could not listen on {HOST}:{port} ({err.strerror or err}).\n"
            "Another program may be using this port. Close it, or start with a different port, e.g.\n"
            "    set ATELIER_PORT=4181   (Windows)    ATELIER_PORT=4181 python3 run.py   (macOS/Linux)"
        )

    url = f"http://{HOST}:{port}/"
    print(f"Atelier BIM app serving {root}")
    print(f"Open {url}   (press Ctrl+C to stop)")
    threading.Timer(0.8, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
