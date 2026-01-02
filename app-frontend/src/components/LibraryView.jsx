import "../styles/index.css";

const SAMPLE_LIBRARY = [
    { id: 1, title: "Metroid Fusion", platform: "GBA", note: "72% · Sector 5" },
    { id: 2, title: "Advance Wars", platform: "GBA", note: "Campaign 2/4" },
    { id: 3, title: "Golden Sun", platform: "GBA", note: "Completed" },
    { id: 4, title: "Castlevania: Aria of Sorrow", platform: "GBA", note: "NG+ ready" },
];

export default function LibraryView() {
    return (
        <main id="library" className="library-view">
            <section className="hero">
                <h1>Library</h1>
                <p>Here you can view all your games</p>
            </section>

            <section className="library-grid" aria-label="Saved games">
                {SAMPLE_LIBRARY.map((game) => (
                    <article key={game.id} className="game-card">
                        <header>
                            <h2>{game.title}</h2>
                            <span>{game.platform}</span>
                        </header>
                        <p className="game-note">{game.note}</p>
                        <button type="button" className="ghost-button">
                            Launch
                        </button>
                    </article>
                ))}
            </section>
        </main>
    );
}