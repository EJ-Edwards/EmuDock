export default function HamburgerMenu({ isOpen, onToggle }) {
    return (
        <button
            className={`hamburger-btn glass-border${isOpen ? " is-open" : ""}`}
            aria-label="Toggle navigation"
            aria-expanded={isOpen}
            onClick={onToggle}
            type="button"
        >
            <span className="hamburger-box">
                <span className="hamburger-bar"></span>
            </span>
        </button>
    );
}















