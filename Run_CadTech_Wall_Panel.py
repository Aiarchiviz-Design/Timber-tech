#!/usr/bin/env python3
"""One-click local launcher for CadTech Wall Panel Studio.

Requires Python 3.9+ and Node.js 22.12+ with npm included. Python uses only the standard library.
On Windows, npm's JavaScript CLI is invoked through node.exe directly to avoid npm.cmd quoting errors.
On first launch, npm ci installs the locked JavaScript dependencies into this project folder.
"""
from __future__ import annotations

import os
import re
import shutil
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request
import webbrowser
from pathlib import Path

MIN_NODE = (22, 12, 0)
START_PORT = 3000
PORT_SCAN = 100
STARTUP_TIMEOUT_SECONDS = 75
ROOT = Path(__file__).resolve().parent
LOG_DIR = ROOT / "logs"
LOG_PATH = LOG_DIR / "wall-panel-launcher.log"


def say(message: str) -> None:
    print(message, flush=True)


def wait_for_enter() -> None:
    try:
        input("\nPress Enter to close this window...")
    except (EOFError, KeyboardInterrupt):
        pass


def command_version(command: list[str]) -> str | None:
    try:
        result = subprocess.run(
            command, cwd=str(ROOT), stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
            text=True, timeout=15, check=False, shell=(os.name == "nt" and command[0].lower().endswith((".cmd", ".bat")))
        )
        return result.stdout.strip() if result.returncode == 0 else None
    except (OSError, subprocess.SubprocessError):
        return None


def parse_version(raw: str | None) -> tuple[int, int, int] | None:
    if not raw:
        return None
    match = re.search(r"v?(\d+)\.(\d+)(?:\.(\d+))?", raw)
    if not match:
        return None
    return int(match.group(1)), int(match.group(2)), int(match.group(3) or 0)


def at_least(actual: tuple[int, int, int], required: tuple[int, int, int]) -> bool:
    return actual >= required


def find_npm(node_path: str, platform: str | None = None) -> list[str] | None:
    r"""Return an npm command that avoids Windows npm.cmd quote re-parsing.

    On Windows, invoke npm's JavaScript CLI through node.exe directly. This is
    robust when Node is installed in a path containing spaces (for example,
    C:\Program Files\nodejs). On POSIX, invoke the npm executable normally.
    The optional platform parameter keeps Windows path selection testable on
    non-Windows CI hosts.
    """
    current_platform = platform or os.name
    npm_path = shutil.which("npm.cmd") or shutil.which("npm")

    if current_platform == "nt":
        roots: list[Path] = []
        for raw_path in (node_path, npm_path):
            if raw_path:
                try:
                    parent = Path(raw_path).resolve().parent
                except OSError:
                    parent = Path(raw_path).parent
                if parent not in roots:
                    roots.append(parent)

        for root in roots:
            cli = root / "node_modules" / "npm" / "bin" / "npm-cli.js"
            if cli.is_file():
                return [node_path, str(cli)]

        # Do not fall back to invoking npm.cmd through cmd.exe: that was the
        # source of the nested-quote failure reported on Windows. A standard
        # Node.js installer includes this CLI; if it is absent, give a clear
        # repair message from main() instead of issuing a broken command.
        return None

    return [npm_path] if npm_path else None


def run_npm(npm_command: list[str], args: list[str]) -> int:
    """Run npm as a normal executable command (no shell and no cmd quoting)."""
    completed = subprocess.run([*npm_command, *args], cwd=str(ROOT), check=False)
    return completed.returncode


def ensure_dependencies(npm_command: list[str]) -> bool:
    required = [ROOT / "node_modules" / "vite" / "package.json", ROOT / "node_modules" / "express" / "package.json"]
    if all(item.is_file() for item in required):
        say("JavaScript dependencies: already installed.")
        return True

    say("First launch: installing the locked JavaScript dependencies with npm ci.")
    say("This step requires an internet connection. The app itself runs locally afterward.\n")
    code = run_npm(npm_command, ["ci", "--no-audit", "--no-fund"])
    if code != 0:
        say("\nDependency installation failed. Check your internet connection and npm output, then run this launcher again.")
        return False
    return all(item.is_file() for item in required)


def reserve_port() -> int | None:
    for port in range(START_PORT, START_PORT + PORT_SCAN):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            try:
                sock.bind(("127.0.0.1", port))
                return port
            except OSError:
                continue
    return None


def health_check(url: str) -> bool:
    try:
        with urllib.request.urlopen(url, timeout=2) as response:
            return response.status == 200
    except (urllib.error.URLError, TimeoutError, OSError):
        return False


def terminate_process(process: subprocess.Popen, log_file) -> None:
    if process.poll() is not None:
        return
    say("Stopping the local server...")
    process.terminate()
    try:
        process.wait(timeout=8)
    except subprocess.TimeoutExpired:
        process.kill()
        process.wait(timeout=5)
    try:
        log_file.flush()
    except Exception:
        pass


def main() -> int:
    if sys.version_info < (3, 9):
        say("Python 3.9 or newer is required. Install a current Python 3 release and run this launcher again.")
        return 2

    node_path = shutil.which("node")
    if not node_path:
        say("Node.js was not found. Install Node.js 22.12 or newer from https://nodejs.org/en/download and restart this launcher.")
        return 2
    node_raw = command_version([node_path, "--version"])
    node_ver = parse_version(node_raw)
    if not node_ver or not at_least(node_ver, MIN_NODE):
        say(f"Node.js 22.12 or newer is required. Detected: {node_raw or 'unknown version'}. Update Node.js and try again.")
        return 2

    npm_command = find_npm(node_path)
    if not npm_command:
        say(
            "npm's JavaScript CLI was not found beside Node.js. Repair or reinstall Node.js 22.12+ "
            "from https://nodejs.org/en/download and ensure the npm package is included. "
            "The launcher now calls npm through node.exe directly to avoid Windows npm.cmd quoting errors."
        )
        return 2
    npm_label = " ".join(npm_command)
    say(f"CadTech Wall Panel Studio\nProject folder: {ROOT}\nDetected Node.js: {node_raw}\nNPM command: {npm_label}")

    if not (ROOT / "package.json").is_file() or not (ROOT / "package-lock.json").is_file():
        say("Project files are incomplete: package.json or package-lock.json is missing. Extract the complete project ZIP first.")
        return 2

    # A no-network diagnostic mode lets a laptop owner check prerequisites before
    # first launch, without triggering npm install or opening a browser.
    if any(arg in ("--check", "--diagnostics") for arg in sys.argv[1:]):
        installed = all((ROOT / "node_modules" / name / "package.json").is_file() for name in ("vite", "express"))
        if installed:
            say("Diagnostics passed: Python, Node.js, npm, project metadata and local dependencies are ready.")
        else:
            say("Diagnostics passed: Python, Node.js, npm and project metadata are ready. First normal launch will install dependencies with npm ci; an internet connection is required for that first install.")
        return 0

    if not ensure_dependencies(npm_command):
        return 3

    port = reserve_port()
    if port is None:
        say(f"No free local port found in {START_PORT}-{START_PORT + PORT_SCAN - 1}. Close other local development servers and try again.")
        return 4

    LOG_DIR.mkdir(exist_ok=True)
    env = os.environ.copy()
    env["HOST"] = "127.0.0.1"
    env["PORT"] = str(port)
    env.setdefault("BROWSER", "none")
    url = f"http://127.0.0.1:{port}/"
    health_url = f"http://127.0.0.1:{port}/api/health"

    say(f"Starting the local application at {url}")
    say(f"Startup log: {LOG_PATH}")
    try:
        with LOG_PATH.open("a", encoding="utf-8", errors="replace") as log_file:
            log_file.write(f"\n--- Launcher start: {time.strftime('%Y-%m-%d %H:%M:%S')} | {url} ---\n")
            # Use the same direct Node/npm-cli invocation for the dev server.
            # Passing a list to CreateProcess correctly quotes each path with
            # spaces; no cmd.exe or shell=True re-parsing is involved.
            dev_args = [*npm_command, "run", "dev", "--", "--host", "127.0.0.1", "--port", str(port)]
            process = subprocess.Popen(
                dev_args, cwd=str(ROOT), env=env, stdout=log_file, stderr=subprocess.STDOUT,
                shell=False
            )
            try:
                deadline = time.time() + STARTUP_TIMEOUT_SECONDS
                healthy = False
                while time.time() < deadline:
                    if process.poll() is not None:
                        log_file.flush()
                        say(f"The app server exited with code {process.returncode}. Review {LOG_PATH} for the error details.")
                        return 5
                    if health_check(health_url):
                        healthy = True
                        break
                    time.sleep(0.5)

                if not healthy:
                    log_file.flush()
                    say(f"The app did not become ready within {STARTUP_TIMEOUT_SECONDS} seconds. Review {LOG_PATH}.")
                    return 6

                say("Application health check passed. Opening your default browser.")
                webbrowser.open(url, new=2)
                say("Leave this window open while using the app. Press Ctrl+C here to stop the local server.")
                while process.poll() is None:
                    time.sleep(1)
                say(f"Local server stopped with exit code {process.returncode}.")
                return int(process.returncode or 0)
            except KeyboardInterrupt:
                terminate_process(process, log_file)
                return 0
            finally:
                if process.poll() is None:
                    terminate_process(process, log_file)
    except OSError as exc:
        say(f"Could not launch the local server: {exc}")
        say(f"Check that the project folder is writable and review {LOG_PATH} if it exists.")
        return 7


if __name__ == "__main__":
    try:
        code = main()
    except Exception as exc:  # Friendly error for double-click users.
        say(f"Launcher error: {exc}")
        code = 99
    if code != 0:
        wait_for_enter()
    sys.exit(code)
