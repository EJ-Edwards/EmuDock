"""Lightweight coordination layer for the database + emulator launcher modules."""

from __future__ import annotations

from typing import Any, Dict, Optional

from . import database as _database_module
from . import emulator_launcher as _launcher_module


class BackendService:
	"""Facade that hides the underlying database and launcher details."""

	def __init__(
		self,
		db_module: Any | None = None,
		launcher_module: Any | None = None,
	) -> None:
		self._db = db_module or _database_module
		self._launcher = launcher_module or _launcher_module
		self._fallback_store: Dict[str, Any] = {}

	def configure_emulator(self, executable_path: str) -> None:
		if not executable_path:
			raise ValueError("executable_path must be provided")
		if self._call_db("save_setting", "emulator_path", executable_path):
			return
		self._fallback_store["emulator_path"] = executable_path

	def get_emulator_path(self) -> Optional[str]:
		stored = self._call_db("load_setting", "emulator_path")
		if stored is not None:
			return stored
		return self._fallback_store.get("emulator_path")

	def launch(self, rom_path: str, *, emulator_path: Optional[str] = None) -> None:
		if not rom_path:
			raise ValueError("rom_path must be provided")
		launcher_fn = getattr(self._launcher, "launch", None)
		if launcher_fn is None:
			raise NotImplementedError("emulator_launcher.launch() is not defined yet")
		target_path = emulator_path or self.get_emulator_path()
		if not target_path:
			raise RuntimeError("Configure an emulator path before launching a ROM")
		launcher_fn(rom_path, target_path)

	def _call_db(self, func_name: str, *args: Any, **kwargs: Any) -> Any:
		candidate = getattr(self._db, func_name, None)
		if callable(candidate):
			return candidate(*args, **kwargs)
		return None


def build_service(
	db_module: Any | None = None,
	launcher_module: Any | None = None,
) -> BackendService:
	"""Convenience factory that wires default modules for callers."""

	return BackendService(db_module=db_module, launcher_module=launcher_module)


__all__ = ["BackendService", "build_service"]