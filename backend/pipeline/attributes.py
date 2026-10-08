"""
Upper-body clothing colour from real person crops (HSV pixel classification).
Used to answer attribute queries like "blue shirt" from actual pixels.
"""
from collections import Counter
from typing import List, Optional, Tuple

import cv2
import numpy as np

COLOR_NAMES = ["black", "white", "gray", "red", "orange", "yellow", "green", "blue", "purple", "pink", "brown"]


def _classify_pixels(hsv: np.ndarray) -> np.ndarray:
    """Return an array of colour indices (into COLOR_NAMES) for each pixel."""
    h = hsv[..., 0].astype(np.int32) * 2   # OpenCV hue 0-179 -> degrees 0-358
    s = hsv[..., 1].astype(np.int32)
    v = hsv[..., 2].astype(np.int32)
    out = np.full(h.shape, COLOR_NAMES.index("gray"), dtype=np.int32)

    black = v < 50
    white = (s < 40) & (v > 190)
    gray = (s < 40) & ~black & ~white
    chroma = ~black & ~white & ~gray

    def hue(lo, hi):
        return chroma & (h >= lo) & (h < hi)

    out[hue(0, 15) | hue(345, 361)] = COLOR_NAMES.index("red")
    out[hue(15, 40)] = COLOR_NAMES.index("orange")
    out[hue(40, 70)] = COLOR_NAMES.index("yellow")
    out[hue(70, 165)] = COLOR_NAMES.index("green")
    out[hue(165, 255)] = COLOR_NAMES.index("blue")
    out[hue(255, 290)] = COLOR_NAMES.index("purple")
    out[hue(290, 345)] = COLOR_NAMES.index("pink")
    # dark, low-saturation oranges/reds read as brown
    brown = chroma & (h >= 10) & (h < 40) & (v < 140)
    out[brown] = COLOR_NAMES.index("brown")
    out[black] = COLOR_NAMES.index("black")
    out[white] = COLOR_NAMES.index("white")
    out[gray] = COLOR_NAMES.index("gray")
    return out


def upper_body_region(crop_bgr: np.ndarray) -> Optional[np.ndarray]:
    h, w = crop_bgr.shape[:2]
    if h < 24 or w < 8:
        return None
    y1, y2 = int(h * 0.18), int(h * 0.50)
    x1, x2 = int(w * 0.20), int(w * 0.80)
    region = crop_bgr[y1:y2, x1:x2]
    return region if region.size else None


def dominant_upper_color(crops: List[np.ndarray]) -> Tuple[Optional[str], float]:
    """Majority colour over upper-body pixels of all crops. Returns (colour, fraction)."""
    counts: Counter = Counter()
    total = 0
    for crop in crops:
        region = upper_body_region(crop)
        if region is None:
            continue
        hsv = cv2.cvtColor(region, cv2.COLOR_BGR2HSV)
        idx = _classify_pixels(hsv).ravel()
        counts.update(np.bincount(idx, minlength=len(COLOR_NAMES)).tolist() and
                      dict(enumerate(np.bincount(idx, minlength=len(COLOR_NAMES)).tolist())))
        total += idx.size
    if not total:
        return None, 0.0
    best_idx, best_n = counts.most_common(1)[0]
    return COLOR_NAMES[best_idx], round(best_n / total, 3)
