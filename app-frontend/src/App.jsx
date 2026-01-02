import Sidebar from "./components/Sidebar.jsx";
import SettingsPanel from "./components/SettingsPanel.jsx";
import LibraryView from "./components/LibraryView.jsx";
import CSS from "./styles/index.css";

export default function App() {
  return (
    <div className="app">
      <Sidebar />
      <LibraryView />
      <SettingsPanel />
    </div>
  );
}