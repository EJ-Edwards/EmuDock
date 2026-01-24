import { useRef, useState } from "react";
import "../styles/index.css";

const ACCEPTED_EXTENSIONS = ".gb,.gba,.gbc,.zip";

export default function AddGames() {
	const [pickedFiles, setPickedFiles] = useState([]);
	const [pickedFolder, setPickedFolder] = useState(null);
	const [notes, setNotes] = useState("");
	const fileInputRef = useRef(null);
	const directoryInputRef = useRef(null);

	const normalizeFiles = (fileList) => Array.from(fileList || []);

	const handleFileSelect = (event) => {
		const files = normalizeFiles(event.target.files);
		setPickedFiles(files.map((file) => file.name));
		setPickedFolder(null);
		setNotes(files.length ? `${files.length} file(s) queued.` : "");
	};

	const handleDirectorySelect = (event) => {
		const files = normalizeFiles(event.target.files);
		if (!files.length) {
			setPickedFolder(null);
			setPickedFiles([]);
			setNotes("");
			return;
		}

		const folderName = files[0].webkitRelativePath?.split("/")[0] || "Selected folder";
		setPickedFolder({ name: folderName, count: files.length });
		setPickedFiles(files.map((file) => file.webkitRelativePath || file.name));
		setNotes(`Scanned ${files.length} file(s) inside ${folderName}.`);
	};

	const triggerPicker = (ref) => {
		if (ref.current) {
			ref.current.click();
		}
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		
		if (!pickedFiles.length) {
			return;
		}

		setNotes("Importing games...");

		try {
			// Load existing games
			const existingGames = await window.electronAPI.loadGameData();
			const gamesList = Array.isArray(existingGames) ? existingGames : [];

			// Get file input element to access file paths
			const fileInput = pickedFolder ? directoryInputRef.current : fileInputRef.current;
			const files = fileInput?.files || [];

			// Create game entries from selected files
			const newGames = Array.from(files)
				.filter((file) => {
					const ext = file.name.toLowerCase().split(".").pop();
					return ["gb", "gba", "gbc", "zip"].includes(ext);
				})
				.map((file) => {
					const title = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
					const ext = file.name.toLowerCase().split(".").pop();
					const platform = ext === "gba" ? "GBA" : ext === "gb" ? "GB" : ext === "gbc" ? "GBC" : "Unknown";
					
					return {
						id: Date.now() + Math.random(), // Simple unique ID
						title,
						platform,
						filePath: file.path || file.webkitRelativePath || file.name,
						note: "",
						addedDate: new Date().toISOString(),
					};
				});

			if (newGames.length === 0) {
				setNotes("No valid ROM files found in selection.");
				return;
			}

			// Merge and save
			const updatedGames = [...gamesList, ...newGames];
			const success = await window.electronAPI.saveGameData(updatedGames);

			if (success) {
				setNotes(`Successfully imported ${newGames.length} game(s)! Check your library.`);
				setPickedFiles([]);
				setPickedFolder(null);
				// Reset file inputs
				if (fileInputRef.current) fileInputRef.current.value = "";
				if (directoryInputRef.current) directoryInputRef.current.value = "";
			} else {
				setNotes("Failed to save games to library. Please try again.");
			}
		} catch (err) {
			console.error("Import error:", err);
			setNotes(`Import failed: ${err.message}`);
		}
	};

	return (
		<main className="add-games-view">
			<header className="hero">
				<h1>Add Games</h1>
				<p>Pick specific ROMs or scan folders to populate your EmuDock library.</p>
			</header>

			<section className="panel">
				<h3>Import Sources</h3>
				<p>Use either picker; the folder workflow enables recursive scans once the backend is hooked up.</p>

				<form className="add-games-form" onSubmit={handleSubmit}>
					<div className="input-group">
						<label>Pick specific ROM files</label>
						<div className="settings-actions">
							<button type="button" className="primary-button" onClick={() => triggerPicker(fileInputRef)}>
								Choose files
							</button>
							<input
								ref={fileInputRef}
								type="file"
								multiple
								accept={ACCEPTED_EXTENSIONS}
								style={{ display: "none" }}
								onChange={handleFileSelect}
							/>
							<span className="save-hint">Accepted: {ACCEPTED_EXTENSIONS}</span>
						</div>
					</div>

					<div className="input-group">
						<label>Scan an entire folder</label>
						<div className="settings-actions">
							<button type="button" className="primary-button" onClick={() => triggerPicker(directoryInputRef)}>
								Choose folder
							</button>
							<input
								ref={directoryInputRef}
								type="file"
								webkitdirectory=""
								directory=""
								style={{ display: "none" }}
								onChange={handleDirectorySelect}
							/>
							<span className="save-hint">Chromium-only feature for now.</span>
						</div>
					</div>

					<div className="import-summary">
						<h4>Ready to import</h4>
						{pickedFolder && (
							<p>
								Folder: <strong>{pickedFolder.name}</strong> ({pickedFolder.count} files)
							</p>
						)}
						<ul>
							{pickedFiles.map((file) => (
								<li key={file}>{file}</li>
							))}
						</ul>
						{notes && <p className="save-hint">{notes}</p>}
					</div>

					<div className="settings-actions">
						<button type="submit" className="primary-button" disabled={!pickedFiles.length}>
							Queue import
						</button>
						{!pickedFiles.length && <span className="save-hint">Pick at least one file to continue.</span>}
					</div>
				</form>
			</section>
		</main>
	);
}
