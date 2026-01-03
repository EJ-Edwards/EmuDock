export default function HamburgerMenu({ isOpen, onToggle }) {
    return (
        <button
            className="hamburger"
            aria-label="Toggle navigation"
            aria-expanded={isOpen}
            onClick={onToggle}
            type="button"
        >
            {isOpen ? "✕" : "☰"}
        </button>
    );
}















