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
import ProductTemplatesPage from "./pages/inventory/ProductTemplatesPage";
import ProductTemplateDetailPage from "./pages/inventory/ProductTemplateDetailPage";
import PurchaseOrdersPage from "./pages/procurement/PurchaseOrdersPage";
import PurchaseOrderDetailPage from "./pages/procurement/PurchaseOrderDetailPage";
import CurrenciesPage from "./pages/settings/CurrenciesPage";
import PayablesPage from "./pages/accounting/PayablesPage";
import ReconciliationPage from "./pages/accounting/ReconciliationPage";
import IndividualLedgerPage from "./pages/IndividualLedgerPage";
import PaymentMethodsPage from "./pages/settings/payments/PaymentMethodsPage";
import ChequeManagementPage from "./pages/accounting/ChequeManagementPage";
import SupplierInvoiceDetailPage from "./pages/procurement/SupplierInvoiceDetailPage";
import InvoicesListPage from "./pages/procurement/InvoicesListPage";
import PaymentsListPage from "./pages/accounting/PaymentsListPage";
import PaymentDetailPage from "./pages/accounting/PaymentDetailPage";
import StockLevelsPage from "./pages/inventory/StockLevelsPage";
import StockDetailPage from "./pages/inventory/StockDetailPage";
import StockAdjustmentsPage from "./pages/inventory/StockAdjustmentsPage";
import AdjustmentHistoryPage from "./pages/inventory/AdjustmentHistoryPage";
import StockTransfersPage from "./pages/inventory/StockTransfersPage";
import StockTransferDetailPage from "./pages/inventory/StockTransferDetailPage";
import GoodsReceiptsPage from "./pages/procurement/GoodsReceiptsPage";
import GRNDetailPage from "./pages/procurement/GRNDetailPage";
import InstallmentPlanDetailPage from "./pages/accounting/InstallmentPlanDetailPage";
import PrintingPage from "./pages/settings/PrintingPage";
import LabelDesignerPage from "./pages/settings/LabelDesignerPage";
import PrintHubPage from "./pages/inventory/PrintHubPage";
import MyProfilePage from "./pages/settings/MyProfilePage";
import ShiftManagementPage from "./pages/pos/ShiftManagementPage";
import PosPage from "./pages/pos/PosPage";
import AssemblyPage from "./pages/inventory/AssemblyPage";
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
                  {/* --- INVENTORY ROUTES --- */}
                  <Route path="/inventory/products" element={<ProductTemplatesPage />} />
                  <Route path="/inventory/products/templates/:id" element={<ProductTemplateDetailPage />} />
                  <Route path="/inventory/assembly" element={<AssemblyPage />} />
                  <Route path="/inventory/products/templates/:id" element={<ProductTemplateDetailPage />} />
                  {/* Settings Module Routes */}
                  <Route path="/settings/locations" element={<LocationsPage />} />
                  <Route path="/settings/users" element={<UsersPage />} />
                  <Route path="/settings/inventory/brands" element={<BrandsPage />} />
                  <Route path="/settings/company-profile" element={<CompanyProfilePage />} />
                  <Route path="/settings/inventory/categories" element={<CategoriesPage />} />
                  <Route path="/settings/inventory/attributes" element={<AttributesPage />} />
                  <Route path="/settings/roles" element={<RolesPage />} />
                  <Route path="/settings/profile" element={<MyProfilePage />} />
                  <Route path="/settings/localization" element={<LocalizationPage />} />
                  <Route path="/settings/printing" element={<PrintingPage />} />{" "}
                  <Route path="/settings/printing/new" element={<LabelDesignerPage />} />{" "}
                  <Route path="/settings/printing/:id" element={<LabelDesignerPage />} />
                  {/* --- accounting routes --- */}
                  <Route path="/accounting/chart" element={<ChartOfAccountsPage />} />
                  <Route path="/accounting/ledger" element={<GeneralLedgerPage />} />
                  {/* CRM Routes */}
                  <Route path="/crm/customers" element={<CustomersPage />} />
                  <Route path="/crm/customers/:id" element={<CustomerProfilePage />} /> {/* Procurement Routes */}
                  <Route path="/procurement/suppliers/:id" element={<SupplierProfilePage />} />
                  <Route path="/procurement/suppliers" element={<SuppliersPage />} />
                  <Route path="/procurement/po" element={<PurchaseOrdersPage />} />
                  <Route path="/procurement/po/:id" element={<PurchaseOrderDetailPage />} />
                  <Route path="/settings/currencies" element={<CurrenciesPage />} />
                  <Route path="/accounting/payables" element={<PayablesPage />} />
                  <Route path="/accounting/ledger/:accountId" element={<IndividualLedgerPage />} />
                  <Route path="/accounting/payables/reconcile" element={<ReconciliationPage />} />
                  <Route path="/settings/payment-methods" element={<PaymentMethodsPage />} />
                  <Route path="/accounting/cheques" element={<ChequeManagementPage />} />{" "}
                  <Route path="/procurement/invoices" element={<InvoicesListPage />} />
                  <Route path="/accounting/payments" element={<PaymentsListPage />} />
                  <Route path="/procurement/invoices/:id" element={<SupplierInvoiceDetailPage />} />
                  <Route path="/accounting/payments/:id" element={<PaymentDetailPage />} />
                  <Route path="/inventory/stock-levels" element={<StockLevelsPage />} />
                  <Route path="/inventory/stock-details/:variantId" element={<StockDetailPage />} />
                  <Route path="/inventory/adjustments" element={<StockAdjustmentsPage />} />{" "}
                  <Route path="/inventory/adjustments-history" element={<AdjustmentHistoryPage />} />{" "}
                  <Route path="/inventory/transfers" element={<StockTransfersPage />} /> {/* <-- 2. ADD NEW ROUTE */}
                  <Route path="/inventory/transfers/:id" element={<StockTransferDetailPage />} />{" "}
                  <Route path="/procurement/receipts" element={<GoodsReceiptsPage />} />
                  <Route path="/procurement/receipts/:id" element={<GRNDetailPage />} />
                  <Route path="/accounting/installments/:id" element={<InstallmentPlanDetailPage />} />{" "}
                  <Route path="/inventory/print-hub" element={<PrintHubPage />} />
                  {/* POS */}
                  <Route path="/pos" element={<PosPage />} />
                  <Route path="/shifts" element={<ShiftManagementPage />} /> {/* <-- 2. ADD THE NEW ROUTE */}
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
