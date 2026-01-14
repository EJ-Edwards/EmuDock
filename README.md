# EmuDock

Skeleton workspace for an Electron + React + Python desktop launcher. Files exist as placeholders only — fill in the logic when ready.

## Structure

- [package.json](package.json): Root scripts for Electron + frontend dev loops.
- [src](src): Electron main & preload entry points.
- [shared](shared): IPC conventions shared between processes.
- [backend/src](backend/src): Node helpers (bridge glue to the Python launcher).
- [backend/python](backend/python): Python package for emulator/database logic.
- [app-frontend](app-frontend): React app (Vite) with Sidebar/Library/Settings placeholders.

## Next steps

1. Run `npm install` at the repo root and `npm install` inside app-frontend.
2. Implement the TODOs across JS + Python files.
3. Start the dev environment with `npm run dev` (renders Vite + Electron once code exists).

# MVP IN PROGRESS
