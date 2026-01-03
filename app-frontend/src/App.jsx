import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import SettingsPanel from "./page/SettingsPanel.jsx";
import LibraryView from "./page/LibraryView.jsx";
import AddGames from "./page/AddGames.jsx";
import Welcome from "./page/Welcome.jsx";
import "./styles/index.css";

const TERMS_STORAGE_KEY = "emudock_terms_accepted";

const getInitialSidebarState = () => {
  if (typeof window === "undefined") {
    return true;
  }
  return window.innerWidth >= 768;
};

const hasAcceptedTerms = () =>
  typeof window !== "undefined" && localStorage.getItem(TERMS_STORAGE_KEY) === "true";

function ProtectedRoute({ children, termsAccepted }) {
  if (!termsAccepted) {
    return <Navigate to="/welcome" replace />;
  }
  return children;
}


export default function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(getInitialSidebarState);
  const [termsAccepted, setTermsAccepted] = useState(() => hasAcceptedTerms());

  const toggleSidebar = () => {
    setSidebarOpen((open) => !open);
  };

  const handleSidebarNavigate = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleTermsAccepted = () => {
    setTermsAccepted(true);
  };

  return (
    <BrowserRouter>
      <div className="app">
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
          onNavigate={handleSidebarNavigate}
          hideWelcomeLink={termsAccepted}
        />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Navigate to="/welcome" replace />} />
            <Route
              path="/library"
              element={
                <ProtectedRoute termsAccepted={termsAccepted}>
                  <LibraryView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute termsAccepted={termsAccepted}>
                  <SettingsPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add"
              element={
                <ProtectedRoute termsAccepted={termsAccepted}>
                  <AddGames />
                </ProtectedRoute>
              }
            />
            <Route
              path="/welcome"
              element={
                termsAccepted ? (
                  <Navigate to="/library" replace />
                ) : (
                  <Welcome onAccept={handleTermsAccepted} />
                )
              }
            />
            <Route path="*" element={<Navigate to="/library" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}