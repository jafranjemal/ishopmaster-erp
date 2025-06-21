import "./App.css";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import RolesPage from "./pages/RolesPage";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LocationsPage from "./pages/LocationsPage";
import CompanyProfilePage from "./pages/CompanyProfilePage";
import UsersPage from "./pages/UsersPage";
import ChartOfAccountsPage from "./pages/ChartOfAccountsPage";
import GeneralLedgerPage from "./pages/GeneralLedgerPage";
import CustomersPage from "./pages/crm/CustomersPage";
import SuppliersPage from "./pages/procurement/SuppliersPage";
import LocalizationPage from "./pages/settings/LocalizationPage";
import CustomerProfilePage from "./pages/crm/CustomerProfilePage";
import SupplierProfilePage from "./pages/procurement/SupplierProfilePage";
import BrandsPage from "./pages/settings/inventory/BrandsPage";
import CategoriesPage from "./pages/settings/inventory/CategoriesPage";
import AttributesPage from "./pages/settings/inventory/AttributesPage";
function App() {
  return (
    <>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route
          path="/*" // Match all other routes
          element={
            <ProtectedRoute>
              <Layout>
                {" "}
                {/* The main layout with Sidebar and TopBar */}
                <Routes>
                  {/* Nested routes that appear inside the Layout */}
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  {/* Settings Module Routes */}
                  <Route
                    path="/settings/locations"
                    element={<LocationsPage />}
                  />
                  <Route
                    path="/settings/localization"
                    element={<LocalizationPage />}
                  />
                  <Route path="/settings/users" element={<UsersPage />} />{" "}
                  <Route
                    path="/settings/inventory/brands"
                    element={<BrandsPage />}
                  />
                  <Route
                    path="/settings/inventory/categories"
                    element={<CategoriesPage />}
                  />
                  <Route
                    path="/settings/inventory/attributes"
                    element={<AttributesPage />}
                  />
                  {/* <-- CORRECTED ROUTE */}
                  <Route path="/settings/roles" element={<RolesPage />} />
                  <Route
                    path="/settings/profile"
                    element={<CompanyProfilePage />}
                  />
                  {/* --- accounting routes --- */}
                  <Route
                    path="/accounting/chart"
                    element={<ChartOfAccountsPage />}
                  />
                  <Route
                    path="/accounting/ledger"
                    element={<GeneralLedgerPage />}
                  />
                  {/* CRM Routes */}
                  <Route path="/crm/customers" element={<CustomersPage />} />
                  <Route
                    path="/crm/customers/:id"
                    element={<CustomerProfilePage />}
                  />{" "}
                  {/* Procurement Routes */}
                  <Route
                    path="/procurement/suppliers/:id"
                    element={<SupplierProfilePage />}
                  />
                  <Route
                    path="/procurement/suppliers"
                    element={<SuppliersPage />}
                  />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
