import "./App.css";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import RolesPage from "./pages/RolesPage";
import { Navigate, Route, Routes } from "react-router-dom";
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
import RepairTicketIntakePage from "./pages/service/RepairTicketIntakePage";
import ServiceKanbanPage from "./pages/service/ServiceKanbanPage";
import RepairTicketDetailPage from "./pages/service/RepairTicketDetailPage";
import HierarchyManagementPage from "./pages/settings/hierarchy/HierarchyManagementPage";
import EmployeesPage from "./pages/hr/EmployeesPage";
import PayrollPage from "./pages/accounting/PayrollPage";
import EmployeeDetailPage from "./pages/hr/EmployeeDetailPage";
import PayrollRunDetailsPage from "./pages/hr/PayrollRunDetailsPage";
import PayslipDetailPage from "./pages/hr/PayslipDetailPage";
import AttendancePage from "./pages/hr/AttendancePage";
import LeaveManagementPage from "./pages/hr/LeaveManagementPage";
import OrganizationPage from "./pages/hr/OrganizationPage";
import DeductionRulesPage from "./pages/settings/payroll/DeductionRulesPage";
import CustomerGroupsPage from "./pages/crm/CustomerGroupsPage";
import PricingManagementPage from "./pages/settings/PricingManagementPage";
import LeadManagementPage from "./pages/crm/LeadManagementPage";
import OpportunityKanbanPage from "./pages/crm/OpportunityKanbanPage";
import OpportunityDetailPage from "./pages/crm/OpportunityDetailPage";
import PosLayout from "./components/layout/PosLayout";
import BenefitsPage from "./pages/settings/BenefitsPage";
import { useState } from "react";

function App() {
  const [posLayout, setPosLayout] = useState("default");
  const togglePosLayout = () => setPosLayout((prev) => (prev === "default" ? "cartFocus" : "default"));

  return (
    <>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* All POS-related routes are now grouped and use the dedicated PosLayout */}
        <Route
          path="/pos/*"
          element={
            <ProtectedRoute>
              <PosLayout onLayoutToggle={togglePosLayout}>
                <Routes>
                  {/* The main entry point is now the shifts page (the gatekeeper) */}
                  <Route path="shifts" element={<ShiftManagementPage />} />
                  {/* The actual sales terminal is on a nested route */}
                  <Route path="terminal" element={<PosPage layout={posLayout} />} />
                  {/* Add other POS-related routes like sales history here in the future */}
                  {/* <Route path="sales-history" element={<SalesHistoryPage />} /> */}

                  {/* A fallback to redirect any old /pos links to the correct gatekeeper */}
                  <Route path="*" element={<Navigate to="/pos/shifts" replace />} />
                </Routes>
              </PosLayout>
            </ProtectedRoute>
          }
        />

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
                  <Route path="/settings/pricing" element={<PricingManagementPage />} />
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
                  <Route path="/settings/payroll-rules" element={<DeductionRulesPage />} />
                  {/* --- accounting routes --- */}
                  <Route path="/accounting/chart" element={<ChartOfAccountsPage />} />
                  <Route path="/accounting/ledger" element={<GeneralLedgerPage />} />
                  {/* CRM Routes */}
                  <Route path="/crm/leads" element={<LeadManagementPage />} />
                  <Route path="/crm/opportunities" element={<OpportunityKanbanPage />} />
                  <Route path="/crm/opportunities/:id" element={<OpportunityDetailPage />} />
                  <Route path="/crm/groups" element={<CustomerGroupsPage />} />
                  <Route path="/crm/customers" element={<CustomersPage />} />
                  <Route path="/crm/customers/:id" element={<CustomerProfilePage />} /> {/* Procurement Routes */}
                  {/* procurement */}
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
                  {/* SERVICE */}
                  <Route path="/service/dashboard" element={<ServiceKanbanPage />} />
                  <Route path="/service/tickets/new" element={<RepairTicketIntakePage />} />
                  <Route path="/service/tickets/:id" element={<RepairTicketDetailPage />} />
                  <Route path="/settings/product-hierarchy" element={<HierarchyManagementPage />} />
                  {/* HR */}
                  <Route path="/hr/employees" element={<EmployeesPage />} />
                  <Route path="/hr/employees/:id" element={<EmployeeDetailPage />} />
                  <Route path="/accounting/payroll" element={<PayrollPage />} />
                  <Route path="/accounting/payroll/:id" element={<PayrollRunDetailsPage />} />
                  <Route path="/accounting/payslips/:id" element={<PayslipDetailPage />} />
                  <Route path="/hr/attendance" element={<AttendancePage />} />
                  <Route path="/hr/leave-management" element={<LeaveManagementPage />} />
                  <Route path="/hr/organization" element={<OrganizationPage />} />
                  <Route path="/settings/benefits" element={<BenefitsPage />} />
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
