"""CLI entry point: webcam loop, gesture detection, blur pipeline.

Run from project root:
    .venv\\Scripts\\python.exe -m blur_guard.main [--style y2k|soft|doomer|webcore|none]

Press Q or ESC to quit.

The base loop is intentionally plain — no on-frame indicator. Pass
`--style <vibe>` to wrap the camera in a Gen-Z aesthetic frame
(permanent border + escalation while blur is engaged).
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

import cv2

from . import config
from .blur import apply_blur
from .detector import HandDetector, count_peace_hands
from .trigger import PrivacyTrigger
from . import genz_y2k, genz_soft, genz_doomer, genz_webcore


WINDOW_NAME = "Blur Guard"

GENZ_STYLES = {
    "y2k": genz_y2k.render,
    "soft": genz_soft.render,
    "doomer": genz_doomer.render,
    "webcore": genz_webcore.render,
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        prog="blur_guard",
        description="Privacy guard that blurs the camera when 2+ peace signs are detected.",
    )
    parser.add_argument(
        "--style",
        choices=("none", "y2k", "soft", "doomer", "webcore"),
        default="none",
        help="Aesthetic frame overlay. Default: none (plain webcam).",
    )
    return parser.parse_args()


def open_camera() -> cv2.VideoCapture:
    cap = cv2.VideoCapture(config.CAMERA_INDEX)
    if not cap.isOpened():
        raise RuntimeError(
            f"Cannot open camera index {config.CAMERA_INDEX}. "
            "Check that a webcam is connected and not in use by another app."
        )
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, config.FRAME_WIDTH)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, config.FRAME_HEIGHT)
    cap.set(cv2.CAP_PROP_FPS, config.TARGET_FPS)
    return cap


def main() -> int:
    args = parse_args()

    if not config.MODEL_PATH.exists():
        print(
            f"[blur_guard] HandLandmarker model missing: {config.MODEL_PATH}\n"
            f"Download from: {config.MODEL_URL}\n"
            f"and place it at: {config.MODEL_PATH}",
            file=sys.stderr,
        )
        return 1

    try:
        detector = HandDetector()
    except Exception as e:
        print(f"[blur_guard] Failed to initialize HandDetector: {e}", file=sys.stderr)
        return 1

    try:
        cap = open_camera()
    except RuntimeError as e:
        print(f"[blur_guard] {e}", file=sys.stderr)
        detector.close()
        return 1

    trigger = PrivacyTrigger(
        hold_frames=config.HOLD_FRAMES,
        release_frames=config.RELEASE_FRAMES,
        fade_in_frames=config.FADE_IN_FRAMES,
        fade_out_frames=config.FADE_OUT_FRAMES,
    )

    style_render = GENZ_STYLES.get(args.style)

    print(
        f"[blur_guard] Running. style={args.style}. "
        f"Show 2 peace signs to engage privacy mode. Press Q/ESC to quit."
    )
    try:
        while True:
            ok, frame = cap.read()
            if not ok:
                print("[blur_guard] Camera read failed; exiting.", file=sys.stderr)
                break

            hands = detector.detect(frame)
            peace_count = count_peace_hands(hands)
            trigger.update(peace_count)

            out = apply_blur(frame, trigger.blur_amount)
            if style_render is not None:
                out = style_render(out, trigger.state, trigger.blur_amount)
            cv2.imshow(WINDOW_NAME, out)

            key = cv2.waitKey(1) & 0xFF
            if key in (ord("q"), ord("Q"), 27):  # 27 = ESC
                break
    finally:
        cap.release()
        cv2.destroyAllWindows()
        detector.close()

    return 0


if __name__ == "__main__":
    sys.exit(main())
