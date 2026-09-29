import {
  BrowserRouter,
  Navigate,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";

import Dashboard from "./pages/Dashboard";
import HistoricalRecords from "./pages/HistoricalRecords";
import Alerts from "./pages/Alerts";
import FishRecommendation from "./pages/FishRecommendation";
import Settings from "./pages/Settings";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/historical-records" element={<HistoricalRecords />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/fish-recommendation" element={<FishRecommendation />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;