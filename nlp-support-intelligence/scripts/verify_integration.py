"""Run the actual frontend client against a temporary live backend."""

import os
import shutil
import socket
import subprocess
import sys
import tempfile
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main():
    with tempfile.TemporaryDirectory(prefix="ticket-integration-") as directory:
        with socket.socket() as sock:
            sock.bind(("127.0.0.1", 0))
            port = sock.getsockname()[1]
        env = {
            **os.environ,
            "DATABASE_PATH": str(Path(directory) / "test.sqlite3"),
            "NEXT_PUBLIC_API_URL": f"http://127.0.0.1:{port}",
        }
        log_path = Path(directory) / "backend.log"
        with log_path.open("w+", encoding="utf-8") as log:
            process = subprocess.Popen(
                [
                    sys.executable,
                    "-m",
                    "uvicorn",
                    "backend.app.main:app",
                    "--host",
                    "127.0.0.1",
                    "--port",
                    str(port),
                ],
                cwd=ROOT,
                env=env,
                stdout=log,
                stderr=log,
            )
            try:
                for _ in range(100):
                    if process.poll() is not None:
                        raise RuntimeError("Backend exited before becoming ready")
                    try:
                        with urllib.request.urlopen(f"http://127.0.0.1:{port}/health", timeout=1):
                            break
                    except OSError:
                        time.sleep(0.1)
                else:
                    raise RuntimeError("Backend readiness timed out")
                npm = shutil.which("npm.cmd" if os.name == "nt" else "npm")
                subprocess.run(
                    [npm, "run", "test:integration"], cwd=ROOT / "frontend", env=env, check=True
                )
                assert (Path(directory) / "test.sqlite3").is_file()
                print("Live backend startup, SQLite initialization, frontend/API integration: PASS")
            except Exception:
                log.flush()
                print(log_path.read_text(encoding="utf-8"))
                raise
            finally:
                if os.name == "nt":
                    # The Windows venv launcher can create a child Python process.
                    subprocess.run(
                        ["taskkill", "/PID", str(process.pid), "/T", "/F"],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL,
                        check=False,
                    )
                else:
                    process.terminate()
                process.wait(timeout=10)


if __name__ == "__main__":
    main()
