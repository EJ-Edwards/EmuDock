import "../styles/index.css";

const NAV_LINKS = [
  { href: "#library", label: "Library" },
  { href: "#settings", label: "Settings" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <nav aria-label="Primary">
        <h1 className="sidebar-title">EmuDock</h1>
        <ul>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}