"""PrivacyTrigger state machine.

Decides when to fade the blur in/out based on the per-frame count of
peace-sign hands. Four states:

  OFF          → no hands → blur_amount = 0
  BLURRING     → hold counter saturated → fade in 0→1 over fade_in_frames
  ON           → blur_amount = 1
  RECOVERING   → release counter saturated → fade out 1→0 over fade_out_frames

The trigger is the only place in the codebase that owns "how much blur
right now". Other modules just call `trigger.update(peace_count)` and
read `trigger.blur_amount`.
"""
from __future__ import annotations

import enum
from dataclasses import dataclass, field

from . import config


class TriggerState(enum.Enum):
    OFF = "off"
    BLURRING = "blurring"
    ON = "on"
    RECOVERING = "recovering"


@dataclass
class PrivacyTrigger:
    hold_frames: int = config.HOLD_FRAMES
    release_frames: int = config.RELEASE_FRAMES
    fade_in_frames: int = config.FADE_IN_FRAMES
    fade_out_frames: int = config.FADE_OUT_FRAMES

    state: TriggerState = TriggerState.OFF
    blur_amount: float = 0.0
    _hold_counter: int = 0
    _release_counter: int = 0
    _fade_counter: int = 0

    def __post_init__(self):
        if self.hold_frames < 1:
            raise ValueError("hold_frames must be >= 1")
        if self.release_frames < 1:
            raise ValueError("release_frames must be >= 1")
        if self.fade_in_frames < 1:
            raise ValueError("fade_in_frames must be >= 1")
        if self.fade_out_frames < 1:
            raise ValueError("fade_out_frames must be >= 1")

    def update(self, peace_count: int) -> None:
        peace_count = max(0, int(peace_count))
        signal = peace_count >= 2

        if self.state is TriggerState.OFF:
            if signal:
                self._hold_counter += 1
                if self._hold_counter >= self.hold_frames:
                    self.state = TriggerState.BLURRING
                    self._hold_counter = 0
                    self._fade_counter = 0
                    self.blur_amount = 0.0
            else:
                self._hold_counter = 0

        elif self.state is TriggerState.BLURRING:
            if signal:
                self._fade_counter += 1
                if self._fade_counter >= self.fade_in_frames:
                    self.state = TriggerState.ON
                    self.blur_amount = 1.0
                else:
                    self.blur_amount = self._fade_counter / self.fade_in_frames
            else:
                # Signal lost mid-fade: drop back to OFF cleanly.
                self.state = TriggerState.OFF
                self.blur_amount = 0.0
                self._fade_counter = 0

        elif self.state is TriggerState.ON:
            if signal:
                self._release_counter = 0
            else:
                self._release_counter += 1
                if self._release_counter >= self.release_frames:
                    self.state = TriggerState.RECOVERING
                    self._release_counter = 0
                    self._fade_counter = 0

        elif self.state is TriggerState.RECOVERING:
            if signal:
                # Interrupted: jump back to full ON.
                self.state = TriggerState.ON
                self.blur_amount = 1.0
                self._fade_counter = 0
            else:
                self._fade_counter += 1
                if self._fade_counter >= self.fade_out_frames:
                    self.state = TriggerState.OFF
                    self.blur_amount = 0.0
                else:
                    self.blur_amount = 1.0 - (self._fade_counter / self.fade_out_frames)

    def reset(self) -> None:
        self.state = TriggerState.OFF
        self.blur_amount = 0.0
        self._hold_counter = 0
        self._release_counter = 0
        self._fade_counter = 0
