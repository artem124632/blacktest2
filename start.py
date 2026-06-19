import os
import sys
from gunicorn.app.wsgiapp import run


def main():
    port = os.environ.get("PORT", "8000")
    workers = os.environ.get("WEB_CONCURRENCY", "1")
    sys.argv = [
        "gunicorn",
        "app:app",
        "--preload",
        "--bind",
        f"0.0.0.0:{port}",
        "--workers",
        workers,
        "--threads",
        "2",
        "--timeout",
        "120",
    ]
    run()


if __name__ == "__main__":
    main()
