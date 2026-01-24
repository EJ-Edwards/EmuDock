import { useEffect, useState } from "react";
import "../styles/index.css";

export default function LibraryView() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadGames();
    }, []);

    const loadGames = async () => {
        setLoading(true);
        setError(null);
        try {
            const gameData = await window.electronAPI.loadGameData();
            setGames(Array.isArray(gameData) ? gameData : []);
        } catch (err) {
            console.error("Failed to load games:", err);
            setError("Failed to load game library");
        } finally {
            setLoading(false);
        }
    };

    const handleLaunch = async (game) => {
        // TODO: Implement game launch via Python emulator
        alert(`Launch ${game.title} - Backend integration pending`);
    };

    if (loading) {
        return (
            <main id="library" className="library-view">
                <section className="hero">
                    <h1>Library</h1>
                    <p>Loading your games...</p>
                </section>
            </main>
        );
    }

    if (error) {
        return (
            <main id="library" className="library-view">
                <section className="hero">
                    <h1>Library</h1>
                    <p className="error">{error}</p>
                    <button onClick={loadGames} className="primary-button">
                        Retry
                    </button>
                </section>
            </main>
        );
    }

    return (
        <main id="library" className="library-view">
            <section className="hero">
                <h1>Library</h1>
                <p>
                    {games.length === 0
                        ? "Your library is empty. Add games to get started."
                        : `${games.length} game${games.length === 1 ? "" : "s"} in your library`}
                </p>
            </section>

            {games.length > 0 && (
                <section className="library-grid" aria-label="Saved games">
                    {games.map((game) => (
                        <article key={game.id} className="game-card">
                            <header>
                                <h2>{game.title}</h2>
                                <span>{game.platform || "Unknown"}</span>
                            </header>
                            {game.note && <p className="game-note">{game.note}</p>}
                            <button
                                type="button"
                                className="ghost-button"
                                onClick={() => handleLaunch(game)}
                            >
                                Launch
                            </button>
                        </article>
                    ))}
                </section>
            )}
        </main>
    );
}