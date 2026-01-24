import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import SettingsPanel from "./page/SettingsPanel.jsx";
import LibraryView from "./page/LibraryView.jsx";
import AddGames from "./page/AddGames.jsx";
import Welcome from "./page/Welcome.jsx";
import "./styles/index.css";
// Import Firebase to initialize it when app loads
import "./config/firebase.js";

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


import HamburgerMenu from "./components/hamburger.jsx";

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

  // Show overlay and always show hamburger on mobile
  return (
    <BrowserRouter>
      <div className="app">
        {/* Hamburger always visible on mobile */}
        <div className="hamburger-fixed">
          <HamburgerMenu isOpen={isSidebarOpen} onToggle={toggleSidebar} />
        </div>
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
          onNavigate={handleSidebarNavigate}
          hideWelcomeLink={termsAccepted}
        />
        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && typeof window !== "undefined" && window.innerWidth < 768 && (
          <div className="sidebar-overlay" onClick={toggleSidebar} />
        )}
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