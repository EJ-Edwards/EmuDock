from __future__ import annotations

from pathlib import Path
from typing import Iterable, Mapping, Optional, Sequence

try:
    from pyboy import PyBoy, WindowEvent
except ModuleNotFoundError as exc:  
    PyBoy = None
    WindowEvent = None
    _PYBOY_IMPORT_ERROR = exc
else:
    _PYBOY_IMPORT_ERROR = None

DEFAULT_FRAME_BUDGET = 300
_DEFAULT_CONTROL_BINDINGS = {
    "W": "forward",
    "A": "left",
    "S": "backward",
    "D": "right",
    "J": "a",
    "K": "b",
    "U": "start",
    "I": "select",
}
_ACTION_TO_EVENT = {
    "forward": "PRESS_ARROW_UP",
    "backward": "PRESS_ARROW_DOWN",
    "left": "PRESS_ARROW_LEFT",
    "right": "PRESS_ARROW_RIGHT",
    "a": "PRESS_BUTTON_A",
    "b": "PRESS_BUTTON_B",
    "start": "PRESS_BUTTON_START",
    "select": "PRESS_BUTTON_SELECT",
}


def launch(
    rom_path: str,
    emulator_path: Optional[str] = None,
    *,
    frames: Optional[int] = DEFAULT_FRAME_BUDGET,
    screenshot_path: Optional[str] = None,
    hold_keys: Optional[Iterable[str]] = None,
) -> None:
    """Load the provided ROM into PyBoy and advance the emulator.

    Args:
        rom_path: Filesystem path to a `.gb/.gbc/.gba` ROM supplied by the user.
        emulator_path: Reserved for compatibility with other launchers; ignored by PyBoy.
        frames: Number of frames to advance before stopping. `None` runs until PyBoy stops.
        screenshot_path: Optional path to persist the final screen buffer as a PNG.
    """

    _ensure_pyboy_available()
    rom_file = _validate_rom_path(rom_path)
    session = PyBoy(str(rom_file))  
    session.set_emulation_speed(0)  
    active_events = _resolve_key_events(hold_keys) if hold_keys else None
    try:
        _run_frames(session, frames, active_events)
        if screenshot_path:
            _write_screenshot(session, screenshot_path)
    finally:
        session.stop()

    if emulator_path:
        
        return


def _ensure_pyboy_available() -> None:
    if _PYBOY_IMPORT_ERROR is not None:
        raise ModuleNotFoundError(
            "PyBoy is not installed. Install it with 'pip install pyboy' to launch ROMs."
        ) from _PYBOY_IMPORT_ERROR


def _validate_rom_path(rom_path: str) -> Path:
    rom_file = Path(rom_path).expanduser()
    if not rom_file.is_file():
        raise FileNotFoundError(f"ROM not found at {rom_file}")
    return rom_file


def _run_frames(
    session: PyBoy,
    frames: Optional[int],
    active_events: Optional[Sequence[WindowEvent]],
) -> None:
    if frames is None:
        while session.tick():
            if active_events:
                session.send_input(active_events)
        return

    budget = max(0, frames)
    for _ in range(budget):
        if not session.tick():
            break
        if active_events:
            session.send_input(active_events)


def controls(game_controls: Optional[Mapping[str, str]] = None) -> Mapping[str, str]:
    """Return the active key-to-action bindings, applying user overrides."""

    bindings = {key.upper(): action for key, action in _DEFAULT_CONTROL_BINDINGS.items()}
    if not game_controls:
        return bindings

    for key, action in game_controls.items():
        normalized_action = action.lower()
        if normalized_action not in _ACTION_TO_EVENT:
            raise ValueError(f"Unsupported control action: {action}")
        bindings[key.upper()] = normalized_action
    return bindings


def _write_screenshot(session: PyBoy, screenshot_path: str) -> None:
    image = session.screen.image
    target = Path(screenshot_path).expanduser()
    image.save(target)


def _resolve_key_events(keys: Iterable[str]) -> Sequence[WindowEvent]:
    _ensure_pyboy_available()
    bindings = controls()
    events = []
    for key in keys:
        action = bindings.get(key.upper())
        if not action:
            continue
        event_name = _ACTION_TO_EVENT[action]
        event = getattr(WindowEvent, event_name, None)
        if event is None:
            raise AttributeError(f"PyBoy WindowEvent missing {event_name}")
        events.append(event)
    return tuple(events)


__all__ = ["launch", "controls"]