"""
app/core/logging.py
────────────────────
Configures the root logger once at application startup.

Call ``setup_logging()`` from ``app/main.py`` before anything else.

Format
------
  2024-01-15 10:23:45,123 | INFO     | app.services.mentor_service | Message here
"""

from __future__ import annotations

import logging
import sys

from app.core.config import settings


def setup_logging() -> None:
    """
    Configure the root logger with a consistent structured format.

    Level is driven by ``settings.log_level`` (defaults to INFO).
    Output goes to stdout so it plays nicely with container log drivers
    and Uvicorn's log capture.
    """
    log_level = getattr(logging, settings.log_level.upper(), logging.INFO)

    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Avoid duplicate handlers on hot-reload
    if not root_logger.handlers:
        root_logger.addHandler(handler)
    else:
        root_logger.handlers.clear()
        root_logger.addHandler(handler)

    # Quieten noisy third-party loggers
    logging.getLogger("sentence_transformers").setLevel(logging.WARNING)
    logging.getLogger("faiss").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
