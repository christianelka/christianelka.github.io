# Blur Guard

Real-time camera privacy guard. Blurs the camera feed when **2+ hands** are detected making the **peace sign** (index + middle extended, others folded). Back-of-hand counts the same as front-of-hand (front/back-agnostic).

## Stack
- Python 3.10+
- OpenCV (camera I/O, frame blur)
- MediaPipe Tasks (HandLandmarker)
- pytest (unit + integration tests)

## Run
```bash
# from project root
.venv\Scripts\python.exe -m blur_guard.main
# press Q or ESC to quit
```

## Test
```bash
.venv\Scripts\python.exe -m pytest -v
```

## How it works
1. Capture frame from webcam (default `device 0`).
2. HandLandmarker detects up to 2 hands.
3. For each detected hand, classify `peace` if index + middle tips are extended relative to wrist/PIP joints (orientation-agnostic).
4. PrivacyTrigger state machine:
   - `OFF` — no hands, no blur.
   - `BLURRING` — 2+ peace hands seen for ≥ `HOLD_FRAMES` → fade-in blur over `FADE_IN_FRAMES`.
   - `ON` — full blur, indicator visible.
   - `RECOVERING` — hands gone for ≥ `RELEASE_FRAMES` → fade-out blur over `FADE_OUT_FRAMES`.
5. Apply weighted-blend blur to frame. Overlay indicator on the active states.

## Project layout
```
blur_guard/
  __init__.py
  config.py     # all tunables
  detector.py   # HandDetector + peace classification
  blur.py       # apply_blur, fade factor
  trigger.py    # PrivacyTrigger state machine
  ui.py         # draw_indicator
  main.py       # CLI entry, webcam loop
tests/
  test_detector.py
  test_trigger.py
  test_blur.py
  fixtures/     # synthetic hand landmarks
```
