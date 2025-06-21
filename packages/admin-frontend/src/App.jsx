import Layout from "./components/layout/Layout";
import DashboardPage from "./pages/Dashboard";
import TenantsPage from "./pages/TenantsPage";
import PermissionsPage from "./pages/PermissionsPage"; // Assume this exists
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <Layout>
      <Routes>
        {/* Define each page's route */}
        <Route path="/" element={<DashboardPage />} />
        <Route path="/tenants" element={<TenantsPage />} />
        <Route path="/permissions" element={<PermissionsPage />} />
        {/* Add other routes for Settings, Modules etc. here */}
      </Routes>
    </Layout>
  );
}

export default App;
