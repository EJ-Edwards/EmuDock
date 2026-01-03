import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/index.css";

const TERMS = [
  "Only load ROMs and BIOS files you legally own or have permission to use.",
  "Keep personal save data and credentials on your machine—do not upload them.",
  "You are responsible for complying with all emulator and platform licenses.",
  "EmuDock is provided as-is without warranty; use it at your own risk.",
];

const TERMS_STORAGE_KEY = "emudock_terms_accepted";

export default function Welcome({ onAccept }) {
  const [consentChecked, setConsentChecked] = useState(false);
  const navigate = useNavigate();

  const handleContinue = () => {
    localStorage.setItem(TERMS_STORAGE_KEY, "true");
    if (typeof onAccept === "function") {
      onAccept();
    }
    navigate("/library", { replace: true });
  };

  return (
    <main className="welcome-view">
      <section className="hero">
        <p>Dock your favorite emulators and launch titles from a single command center.</p>
        <p>
          Before diving in, review and accept the terms that keep EmuDock compliant with
          platform creators and content owners.
        </p>
      </section>

      <section className="terms-card" aria-labelledby="terms-heading">
        <header>
          <p className="eyebrow">Terms of Service</p>
          <h2 id="terms-heading">Respect the hardware and the creators</h2>
          <p>
            Please confirm the following statements so we can safely enable the rest of the
            dashboard.
          </p>
        </header>

        <ol className="terms-list">
          {TERMS.map((term, index) => (
            <li key={term}>
              <span className="term-index">{index + 1}</span>
              <p>{term}</p>
            </li>
          ))}
        </ol>

        <label className="terms-consent">
          <input
            type="checkbox"
            checked={consentChecked}
            onChange={(event) => setConsentChecked(event.target.checked)}
          />
          <span>I understand and agree to the EmuDock Terms of Service.</span>
        </label>

        <button
          type="button"
          className="primary-button"
          onClick={handleContinue}
          disabled={!consentChecked}
        >
          Enter Library
        </button>
      </section>
    </main>
  );
}
