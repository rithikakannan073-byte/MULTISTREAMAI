import logging
import sys

_configured = False


def get_logger(name: str = "pipeline") -> logging.Logger:
    global _configured
    if not _configured:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(logging.Formatter("%(asctime)s %(message)s", "%H:%M:%S"))
        root = logging.getLogger("multistream")
        root.setLevel(logging.INFO)
        root.addHandler(handler)
        root.propagate = False
        _configured = True
    return logging.getLogger(f"multistream.{name}")


def tag(logger: logging.Logger, tag_name: str, msg: str) -> None:
    """Emit a tagged log line, e.g. [YOLO11] Detections: 4"""
    logger.info(f"[{tag_name}] {msg}")
