import os
import sys
from gunicorn.app.wsgiapp import run


def main():
    port = os.environ.get("PORT", "8000")
    workers = os.environ.get("WEB_CONCURRENCY", "1")
    timeout = os.environ.get("GUNICORN_TIMEOUT", "600")
    sys.argv = [
        "gunicorn",
        "app:app",
        "--preload",
        "--bind",
        f"0.0.0.0:{port}",
        "--workers",
        workers,
        "--worker-class",
        "gthread",
        "--threads",
        "4",
        "--timeout",
        timeout,
        "--limit-request-line",
        "0",
        "--limit-request-field_size",
        "0",
    ]
    run()


if __name__ == "__main__":
    main()
