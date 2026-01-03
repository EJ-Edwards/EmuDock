import { useEffect, useState } from "react";
import "../styles/index.css";

const SETTINGS_STORAGE_KEY = "emudock_user_settings";
const DEFAULT_SETTINGS = {
	emulatorPath: "",
	romDirectory: "",
	autoSyncSaves: true,
};

export default function SettingsPanel() {
	const [settings, setSettings] = useState(DEFAULT_SETTINGS);
	const [statusMessage, setStatusMessage] = useState("");

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}
		const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				setSettings((prev) => ({ ...prev, ...parsed }));
			} catch (error) {
				console.warn("Failed to parse stored EmuDock settings", error);
			}
		}
	}, []);

	const handleChange = (event) => {
		const { name, type, value, checked } = event.target;
		setSettings((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
		setStatusMessage("Preferences saved locally.");
		setTimeout(() => setStatusMessage(""), 2500);
	};

	return (
		<section id="settings" className="settings-panel">
			<header>
				<h2>Settings</h2>
				<p>Point EmuDock to your preferred emulator binary and ROM directory.</p>
			</header>

			<form onSubmit={handleSubmit}>
				<div className="input-group">
					<label htmlFor="emulatorPath">Emulator executable</label>
					<input
						id="emulatorPath"
						name="emulatorPath"
						type="text"
						placeholder={"C:\\Emulators\\pyboy.exe"}
						value={settings.emulatorPath}
						onChange={handleChange}
					/>
				</div>

				<div className="input-group">
					<label htmlFor="romDirectory">ROM directory</label>
					<input
						id="romDirectory"
						name="romDirectory"
						type="text"
						placeholder={"D:\\Games\\gba"}
						value={settings.romDirectory}
						onChange={handleChange}
					/>
				</div>

				<label className="toggle-row">
					<input
						type="checkbox"
						name="autoSyncSaves"
						checked={settings.autoSyncSaves}
						onChange={handleChange}
					/>
					Enable cloudless auto-sync for save files
				</label>

				<div className="settings-actions">
					<button type="submit" className="primary-button">
						Save preferences
					</button>
					{statusMessage && <span className="save-hint">{statusMessage}</span>}
				</div>
			</form>
		</section>
	);
}
