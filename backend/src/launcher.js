const { spawn } = require("node:child_process");
const path = require("node:path");

const PYTHON_ENTRY = path.join(__dirname, "../python", "emulator_launcher.py");

const runPythonLauncher = ({ emulatorPath, romPath, pythonExecutable = "python" }) => {
	return new Promise((resolve, reject) => {
		const args = [PYTHON_ENTRY, "--emulator", emulatorPath, "--rom", romPath];
		const child = spawn(pythonExecutable, args, {
			cwd: path.join(__dirname, "../python"),
			stdio: "inherit",
			windowsHide: true
		});

		child.once("error", reject);
		child.once("close", (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`Python launcher exited with code ${code}`));
			}
		});
	});
};

module.exports = {
	runPythonLauncher
};