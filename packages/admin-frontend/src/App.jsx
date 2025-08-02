import { Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import BackupsPage from "./pages/admin/BackupsPage";
import DashboardPage from "./pages/Dashboard";
import PermissionsPage from "./pages/PermissionsPage"; // Assume this exists
import TenantDetailPage from "./pages/TenantDetailPage";
import TenantsPage from "./pages/TenantsPage";

function App() {
  return (
    <Layout>
      <Routes>
        {/* Define each page's route */}
        <Route path="/" element={<DashboardPage />} />
        <Route path="/tenants" element={<TenantsPage />} />
        <Route path="/tenants/:id" element={<TenantDetailPage />} />
        <Route path="/permissions" element={<PermissionsPage />} />
        <Route path="/backups" element={<BackupsPage />} />

        {/* Add other routes for Settings, Modules etc. here */}
      </Routes>
    </Layout>
  );
}

export default App;
