import './App.css';

import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import ChequeManagementPage from './pages/accounting/ChequeManagementPage';
import InstallmentPlanDetailPage from './pages/accounting/InstallmentPlanDetailPage';
import PayablesPage from './pages/accounting/PayablesPage';
import PaymentDetailPage from './pages/accounting/PaymentDetailPage';
import PaymentsListPage from './pages/accounting/PaymentsListPage';
import SupplierInvoiceReconciliationPage from './pages/accounting/SupplierInvoiceReconciliationPage';
import ChartOfAccountsPage from './pages/ChartOfAccountsPage';
import CompanyProfilePage from './pages/CompanyProfilePage';
import CustomerProfilePage from './pages/crm/CustomerProfilePage';
import CustomersPage from './pages/crm/CustomersPage';
import DashboardPage from './pages/DashboardPage';
import GeneralLedgerPage from './pages/GeneralLedgerPage';
import IndividualLedgerPage from './pages/IndividualLedgerPage';
import AdjustmentHistoryPage from './pages/inventory/AdjustmentHistoryPage';
import AssemblyPage from './pages/inventory/AssemblyPage';
import PrintHubPage from './pages/inventory/PrintHubPage';
import ProductTemplateDetailPage from './pages/inventory/ProductTemplateDetailPage';
import ProductTemplatesPage from './pages/inventory/ProductTemplatesPage';
import StockAdjustmentsPage from './pages/inventory/StockAdjustmentsPage';
import StockDetailPage from './pages/inventory/StockDetailPage';
import StockLevelsPage from './pages/inventory/StockLevelsPage';
import StockTransferDetailPage from './pages/inventory/StockTransferDetailPage';
import StockTransfersPage from './pages/inventory/StockTransfersPage';
import LocationsPage from './pages/LocationsPage';
import LoginPage from './pages/LoginPage';
import PosPage from './pages/pos/PosPage';
import ShiftManagementPage from './pages/pos/ShiftManagementPage';
import GoodsReceiptsPage from './pages/procurement/GoodsReceiptsPage';
import GRNDetailPage from './pages/procurement/GRNDetailPage';
import InvoicesListPage from './pages/procurement/InvoicesListPage';
import PurchaseOrderDetailPage from './pages/procurement/PurchaseOrderDetailPage';
import PurchaseOrdersPage from './pages/procurement/PurchaseOrdersPage';
import SupplierInvoiceDetailPage from './pages/procurement/SupplierInvoiceDetailPage';
import SupplierProfilePage from './pages/procurement/SupplierProfilePage';
import SuppliersPage from './pages/procurement/SuppliersPage';
import RolesPage from './pages/RolesPage';
import CurrenciesPage from './pages/settings/CurrenciesPage';
import AttributesPage from './pages/settings/inventory/AttributesPage';
import BrandsPage from './pages/settings/inventory/BrandsPage';
import CategoriesPage from './pages/settings/inventory/CategoriesPage';
import LabelDesignerPage from './pages/settings/LabelDesignerPage';
import LocalizationPage from './pages/settings/LocalizationPage';
import MyProfilePage from './pages/settings/MyProfilePage';
import PaymentMethodsPage from './pages/settings/payments/PaymentMethodsPage';
import PrintingPage from './pages/settings/PrintingPage';
import UsersPage from './pages/UsersPage';
//import RepairTicketIntakePage from './pages/service/RepairTicketIntakePage';
//import ServiceKanbanPage from './pages/service/ServiceKanbanPage';
//import RepairTicketDetailPage from './pages/service/Old_RepairTicketDetailPage';
import { useState } from 'react';
import PortalLayout from './components/layout/PortalLayout';
import PosLayout from './components/layout/PosLayout';
import { CustomerAuthProvider } from './context/CustomerAuthProvider';
import { PosSessionProvider } from './context/PosSessionContext';
import BankReconciliationPage from './pages/accounting/BankReconciliationPage';
import BudgetingPage from './pages/accounting/BudgetingPage';
import PayrollPage from './pages/accounting/PayrollPage';
import PeriodClosingPage from './pages/accounting/PeriodClosingPage';
import CustomerGroupsPage from './pages/crm/CustomerGroupsPage';
import LeadManagementPage from './pages/crm/LeadManagementPage';
import OpportunityDetailPage from './pages/crm/OpportunityDetailPage';
import OpportunityKanbanPage from './pages/crm/OpportunityKanbanPage';
import AttendancePage from './pages/hr/AttendancePage';
import EmployeeDetailPage from './pages/hr/EmployeeDetailPage';
import EmployeesPage from './pages/hr/EmployeesPage';
import LeaveManagementPage from './pages/hr/LeaveManagementPage';
import OrganizationPage from './pages/hr/OrganizationPage';
import PayrollRunDetailsPage from './pages/hr/PayrollRunDetailsPage';
import PayslipDetailPage from './pages/hr/PayslipDetailPage';
import InventoryLedgerPage from './pages/inventory/InventoryLedgerPage';
import CustomerDashboardPage from './pages/portal/CustomerDashboardPage';
import PortalLoginPage from './pages/portal/PortalLoginPage';
import RequestPortalLinkPage from './pages/portal/RequestPortalLinkPage';
import TrackRepairPage from './pages/portal/TrackRepairPage';
import ReturnsPage from './pages/sales/ReturnsPage';
import RepairTicketsPage from './pages/service/RepairTicketsPage';
import BenefitsPage from './pages/settings/BenefitsPage';
import CouponBatchDetailPage from './pages/settings/CouponBatchDetailPage';
import CouponManagementPage from './pages/settings/CouponManagementPage';
import DrawerConfigurationPage from './pages/settings/DrawerConfigurationPage';
import FinancialPeriodsPage from './pages/settings/FinancialPeriodsPage';
import HierarchyManagementPage from './pages/settings/hierarchy/HierarchyManagementPage';
import DeductionRulesPage from './pages/settings/payroll/DeductionRulesPage';
import PricingManagementPage from './pages/settings/PricingManagementPage';
import TaxCategoryPage from './pages/settings/TaxCategoryPage';
import TaxRulePage from './pages/settings/TaxRulePage';
import WarrantyPoliciesPage from './pages/settings/WarrantyPoliciesPage';

import RepairQuotePage from './pages/portal/RepairQuotePage';
import SalesInvoiceDetailPage from './pages/sales/SalesInvoiceDetailPage';
import SalesInvoiceListPage from './pages/sales/SalesInvoiceListPage';
import RepairTicketDetailPage from './pages/service/RepairTicketDetailPage';
import RepairTicketIntakePage from './pages/service/RepairTicketIntakePage';
import TechnicianDashboardPage from './pages/service/TechnicianDashboardPage';
import NotificationTemplatesPage from './pages/settings/NotificationTemplatesPage';
import QcTemplatesPage from './pages/settings/QcTemplatesPage';
function App() {
  const [posLayout, setPosLayout] = useState('default');
  const togglePosLayout = () => setPosLayout((prev) => (prev === 'default' ? 'cartFocus' : 'default'));

  return (
    <>
      <Routes>
        {/* Public Route */}

        {/* --- PUBLIC-FACING ROUTES (NO LOGIN REQUIRED INITIALLY) --- */}
        <Route path='/login' element={<LoginPage />} />

        {/* --- THE DEFINITIVE FIX: DEDICATED PORTAL ROUTE GROUP --- */}
        <Route
          path='/portal/*'
          element={
            <CustomerAuthProvider>
              <PortalLayout>
                <Routes>
                  <Route path='track' element={<TrackRepairPage />} />
                  <Route path='login' element={<PortalLoginPage />} />
                  <Route path='request-link' element={<RequestPortalLinkPage />} />
                  <Route path='quotes/:id' element={<RepairQuotePage />} />
                  {/* The dashboard would have its own internal session check */}
                  <Route path='dashboard' element={<CustomerDashboardPage />} />

                  {/* Fallback for any other /portal URL */}
                  <Route path='*' element={<Navigate to='/portal/request-link' replace />} />
                </Routes>
              </PortalLayout>
            </CustomerAuthProvider>
          }
        />

        {/* All POS-related routes are now grouped and use the dedicated PosLayout */}
        <Route
          path='/pos/*'
          element={
            <ProtectedRoute>
              <PosSessionProvider>
                <PosLayout onLayoutToggle={togglePosLayout}>
                  <Routes>
                    {/* The main entry point is now the shifts page (the gatekeeper) */}
                    <Route path='shifts' element={<ShiftManagementPage />} />
                    {/* The actual sales terminal is on a nested route */}
                    <Route path='terminal' element={<PosPage layout={posLayout} />} />
                    {/* Add other POS-related routes like sales history here in the future */}
                    {/* <Route path="sales-history" element={<SalesHistoryPage />} /> */}

                    {/* A fallback to redirect any old /pos links to the correct gatekeeper */}
                    <Route path='*' element={<Navigate to='/pos/shifts' replace />} />
                  </Routes>
                </PosLayout>
              </PosSessionProvider>
            </ProtectedRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path='/*' // Match all other routes
          element={
            <ProtectedRoute>
              <Layout>
                {' '}
                {/* The main layout with Sidebar and TopBar */}
                <Routes>
                  {/* Nested routes that appear inside the Layout */}
                  <Route path='/' element={<DashboardPage />} />
                  <Route path='/login' element={<LoginPage />} />
                  {/* --- INVENTORY ROUTES --- */}
                  <Route path='/inventory/products' element={<ProductTemplatesPage />} />
                  <Route path='/inventory/products/templates/:id' element={<ProductTemplateDetailPage />} />
                  <Route path='/inventory/assembly' element={<AssemblyPage />} />
                  <Route path='/inventory/products/templates/:id' element={<ProductTemplateDetailPage />} />
                  {/* Settings Module Routes */}
                  <Route path='/settings/cash-drawer' element={<DrawerConfigurationPage />} />
                  <Route path='/settings/financial-periods' element={<FinancialPeriodsPage />} />
                  <Route path='/settings/coupons' element={<CouponManagementPage />} />
                  <Route path='/settings/coupons/:batchId' element={<CouponBatchDetailPage />} />
                  <Route path='/settings/warranties' element={<WarrantyPoliciesPage />} />
                  <Route path='/settings/pricing' element={<PricingManagementPage />} />
                  <Route path='/settings/locations' element={<LocationsPage />} />
                  <Route path='/settings/users' element={<UsersPage />} />
                  <Route path='/settings/inventory/brands' element={<BrandsPage />} />
                  <Route path='/settings/company-profile' element={<CompanyProfilePage />} />
                  <Route path='/settings/inventory/categories' element={<CategoriesPage />} />
                  <Route path='/settings/inventory/attributes' element={<AttributesPage />} />
                  <Route path='/settings/roles' element={<RolesPage />} />
                  <Route path='/settings/profile' element={<MyProfilePage />} />
                  <Route path='/settings/localization' element={<LocalizationPage />} />
                  <Route path='/settings/printing' element={<PrintingPage />} />{' '}
                  <Route path='/settings/printing/new' element={<LabelDesignerPage />} />{' '}
                  <Route path='/settings/printing/:id' element={<LabelDesignerPage />} />
                  <Route path='/settings/payroll-rules' element={<DeductionRulesPage />} />
                  <Route path='/settings/taxes' element={<TaxRulePage />} />
                  <Route path='/settings/tax-categories' element={<TaxCategoryPage />} />
                  <Route path='/settings/qc-templates' element={<QcTemplatesPage />} />
                  {/* --- accounting routes --- */}
                  <Route path='/accounting/budgets' element={<BudgetingPage />} />
                  <Route path='/accounting/period-closing' element={<PeriodClosingPage />} />
                  <Route path='/accounting/chart' element={<ChartOfAccountsPage />} />
                  <Route path='/accounting/ledger' element={<GeneralLedgerPage />} />
                  <Route path='/accounting/bank-reconciliation' element={<BankReconciliationPage />} />
                  <Route path='/accounting/payables/reconcile' element={<SupplierInvoiceReconciliationPage />} />
                  {/* CRM Routes */}
                  <Route path='/crm/leads' element={<LeadManagementPage />} />
                  <Route path='/crm/opportunities' element={<OpportunityKanbanPage />} />
                  <Route path='/crm/opportunities/:id' element={<OpportunityDetailPage />} />
                  <Route path='/crm/groups' element={<CustomerGroupsPage />} />
                  <Route path='/crm/customers' element={<CustomersPage />} />
                  <Route path='/crm/customers/:id' element={<CustomerProfilePage />} /> {/* Procurement Routes */}
                  {/* procurement */}
                  <Route path='/procurement/suppliers/:id' element={<SupplierProfilePage />} />
                  <Route path='/procurement/suppliers' element={<SuppliersPage />} />
                  <Route path='/procurement/po' element={<PurchaseOrdersPage />} />
                  <Route path='/procurement/po/:id' element={<PurchaseOrderDetailPage />} />
                  <Route path='/settings/currencies' element={<CurrenciesPage />} />
                  <Route path='/accounting/payables' element={<PayablesPage />} />
                  <Route path='/accounting/ledger/:accountId' element={<IndividualLedgerPage />} />
                  <Route path='/settings/payment-methods' element={<PaymentMethodsPage />} />
                  <Route path='/accounting/cheques' element={<ChequeManagementPage />} />{' '}
                  <Route path='/procurement/invoices' element={<InvoicesListPage />} />
                  <Route path='/accounting/payments' element={<PaymentsListPage />} />
                  <Route path='/procurement/invoices/:id' element={<SupplierInvoiceDetailPage />} />
                  <Route path='/accounting/payments/:id' element={<PaymentDetailPage />} />
                  {/* inventory */}
                  <Route path='/inventory/ledger' element={<InventoryLedgerPage />} />
                  <Route path='/inventory/stock-levels' element={<StockLevelsPage />} />
                  <Route path='/inventory/stock-details/:variantId' element={<StockDetailPage />} />
                  <Route path='/inventory/adjustments' element={<StockAdjustmentsPage />} />{' '}
                  <Route path='/inventory/adjustments-history' element={<AdjustmentHistoryPage />} />{' '}
                  <Route path='/inventory/transfers' element={<StockTransfersPage />} /> {/* <-- 2. ADD NEW ROUTE */}
                  <Route path='/inventory/transfers/:id' element={<StockTransferDetailPage />} />{' '}
                  <Route path='/inventory/print-hub' element={<PrintHubPage />} />
                  {/* procurement */}
                  <Route path='/procurement/receipts' element={<GoodsReceiptsPage />} />
                  <Route path='/procurement/receipts/:id' element={<GRNDetailPage />} />
                  <Route path='/accounting/installments/:id' element={<InstallmentPlanDetailPage />} /> {/* POS */}
                  <Route path='/pos' element={<PosPage />} />
                  <Route path='/shifts' element={<ShiftManagementPage />} /> {/* <-- 2. ADD THE NEW ROUTE */}
                  {/* Notification */}
                  <Route path='/settings/notification-templates' element={<NotificationTemplatesPage />} />
                  {/* SERVICE */}
                  {/* <Route path='/service/dashboard' element={<ServiceKanbanPage />} />
                  <Route path='/service/tickets/new' element={<RepairTicketIntakePage />} />
                  <Route path='/service/tickets/:id' element={<RepairTicketDetailPage />} /> */}
                  <Route path='/service/dashboard' element={<RepairTicketsPage />} />
                  <Route path='/service/tickets/new' element={<RepairTicketIntakePage />} />
                  <Route path='/service/tickets/:id/edit' element={<RepairTicketIntakePage />} />
                  <Route path='/service/tickets/:id' element={<RepairTicketDetailPage />} />
                  <Route path='/settings/product-hierarchy' element={<HierarchyManagementPage />} />
                  <Route path='/service/my-dashboard' element={<TechnicianDashboardPage />} />
                  {/* HR */}
                  <Route path='/hr/employees' element={<EmployeesPage />} />
                  <Route path='/hr/employees/:id' element={<EmployeeDetailPage />} />
                  <Route path='/accounting/payroll' element={<PayrollPage />} />
                  <Route path='/accounting/payroll/:id' element={<PayrollRunDetailsPage />} />
                  <Route path='/accounting/payslips/:id' element={<PayslipDetailPage />} />
                  <Route path='/hr/attendance' element={<AttendancePage />} />
                  <Route path='/hr/leave-management' element={<LeaveManagementPage />} />
                  <Route path='/hr/organization' element={<OrganizationPage />} />
                  <Route path='/settings/benefits' element={<BenefitsPage />} />
                  {/* SALES */}
                  <Route path='/sales/returns' element={<ReturnsPage />} />
                  <Route path='/sales/invoices' element={<SalesInvoiceListPage />} />
                  <Route path='/sales/invoices/:id' element={<SalesInvoiceDetailPage />} />
                  {/* PORTAL */}
                  <Route path='/portal/track' element={<TrackRepairPage />} />
                  <Route path='/portal/dashboard' element={<CustomerDashboardPage />} />
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
