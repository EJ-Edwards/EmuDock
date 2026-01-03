import { NavLink } from "react-router-dom";
import HamburgerMenu from "./hamburger.jsx";
import "../styles/index.css";

const NAV_LINKS = [
  { to: "/welcome", label: "Welcome" },
  { to: "/library", label: "Library" },
  { to: "/add", label: "Add Games" },
  { to: "/settings", label: "Settings" },
];

export default function Sidebar({ isOpen = true, onToggle, onNavigate, hideWelcomeLink = false }) {
  const links = hideWelcomeLink
    ? NAV_LINKS.filter((link) => link.to !== "/welcome")
    : NAV_LINKS;

  return (
    <aside className={`sidebar ${isOpen ? "is-open" : "is-collapsed"}`}>
      <div className="sidebar-header">
        <h1 className="sidebar-title">EmuDock</h1>
        {onToggle && (
          <HamburgerMenu isOpen={isOpen} onToggle={onToggle} />
        )}
      </div>
      {isOpen && (
        <nav
          aria-label="Primary"
          className="sidebar-nav"
        >
          <ul>
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    isActive ? "nav-link is-active" : "nav-link"
                  }
                  onClick={onNavigate}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </aside>
  );
}