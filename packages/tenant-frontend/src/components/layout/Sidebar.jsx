import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
// Correct import from context
import { useTranslation } from 'react-i18next';
import { cn } from 'ui-library'; // Correct import from local utils

// Import all necessary icons
import {
  ArrowRightLeft,
  BadgeCheck,
  BarChart3,
  Beaker,
  BellRing,
  Bookmark,
  BookOpen,
  Building,
  Building2,
  CalendarCheck,
  CalendarDays,
  CalendarOff,
  ChartCandlestick,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  Clock11,
  Coins,
  Combine,
  Contact,
  Contact2,
  CreditCard,
  Edit,
  FileCheck,
  FileMinus,
  FilePlus2,
  FileSliders,
  FileText,
  Gift,
  Globe,
  Hammer,
  HardDrive,
  History,
  KeyRound,
  Landmark,
  LayoutDashboard,
  Library,
  ListTodo,
  ListTree,
  MonitorSmartphone,
  Network,
  Package,
  Percent,
  PiggyBank,
  Plane,
  Plug,
  Printer,
  User as ProfileIcon,
  Receipt,
  RotateCcw,
  Settings,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  SwatchBook,
  Tag,
  Tags,
  Ticket,
  TrendingUp,
  Truck,
  UserCog,
  UserPlus,
  Users,
  Wallet,
  Warehouse,
  Wrench,
} from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import useAuth from '../../context/useAuth';
const Sidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, tenant } = useAuth();
  const { tenantUrl } = useTenant();
  // State is now an object to track multiple open menus
  const [openMenus, setOpenMenus] = useState({});

  // --- MASTER NAVIGATION CONFIGURATION (with corrected permissions and translations) ---

  const navItemsOl = [
    {
      name: t('sidebar.dashboard'),
      href: tenantUrl('/'),
      icon: LayoutDashboard,
      permission: null,
    },

    {
      name: t('sidebar.pos_parent'),
      href: tenantUrl('/pos/shifts'),
      icon: ShoppingCart,
      permission: 'sales:pos:access',
      children: [
        {
          name: t('sidebar.sub_menu.pos_terminal'),
          href: tenantUrl('/pos/shifts'),
          icon: MonitorSmartphone,
          permission: 'sales:pos:access',
        },
        {
          name: 'All Invoices',
          href: tenantUrl('/sales/invoices'),
          icon: FileText,
          permission: 'sales:invoice:view_all',
        },
        {
          name: 'Process Return',
          href: tenantUrl('/sales/returns'),
          icon: RotateCcw,
          permission: 'sales:return:manage',
        },
      ],
    },
    {
      name: t('sidebar.inventory'),
      href: tenantUrl('/inventory'),
      icon: Warehouse,
      permission: 'inventory:product:view',
      children: [
        {
          name: t('sidebar.sub_menu.products'),
          href: tenantUrl('/inventory/products'),
          icon: Package,
          permission: 'inventory:product:view',
        },
        {
          name: 'Kitting & Assembly',
          href: tenantUrl('/inventory/assembly'),
          icon: Combine,
          permission: 'inventory:assembly:create',
        },
        {
          name: t('sidebar.sub_menu.stock_levels'),
          href: tenantUrl('/inventory/stock-levels'),
          icon: SlidersHorizontal,
          permission: 'inventory:product:view',
        },
        {
          name: t('sidebar.sub_menu.adjustments'),
          href: tenantUrl('/inventory/adjustments'),
          icon: FileSliders,
          permission: 'inventory:stock:adjust',
        },
        {
          name: t('sidebar.sub_menu.transfers'),
          href: tenantUrl('/inventory/transfers'),
          icon: ArrowRightLeft,
          permission: 'inventory:stock:transfer',
        },
        {
          name: 'Print Hub',
          href: tenantUrl('/inventory/print-hub'),
          icon: Printer,
          permission: 'inventory:product:view',
        },
        {
          name: 'Inventory Ledger',
          href: tenantUrl('/inventory/ledger'),
          icon: History,
          permission: 'inventory:stock:view',
        },
      ],
    },
    {
      name: t('sidebar.procurement'),
      href: tenantUrl('/procurement'),
      icon: Truck,
      permission: 'procurement:po:create',
      children: [
        {
          name: t('sidebar.sub_menu.purchase_orders'),
          href: tenantUrl('/procurement/po'),
          icon: ClipboardList,
          permission: 'procurement:po:create',
        },
        {
          name: 'Goods Receipts',
          href: tenantUrl('/procurement/receipts'),
          icon: ClipboardCheck,
          permission: 'procurement:po:view',
        },
        {
          name: t('sidebar.sub_menu.suppliers'),
          href: tenantUrl('/procurement/suppliers'),
          icon: Contact,
          permission: 'procurement:supplier:manage',
        },
        {
          name: t('sidebar.sub_menu.invoices'),
          href: tenantUrl('/procurement/invoices'),
          icon: FileText,
          permission: 'accounting:payables:view',
        },
      ],
    },
    {
      name: t('sidebar.service_parent'),
      icon: Hammer,
      permission: 'service:ticket:view',
      children: [
        {
          name: t('sidebar.sub_menu.service_dashboard'),
          href: tenantUrl('/service/dashboard'),
          icon: LayoutDashboard,
          permission: 'service:ticket:view',
        },
        {
          name: t('sidebar.sub_menu.new_repair_ticket'),
          href: tenantUrl('/service/tickets/new'),
          icon: FilePlus2,
          permission: 'service:ticket:create',
        },
        {
          name: 'My Job Queue',
          href: tenantUrl('/service/my-dashboard'),
          icon: ListTodo,
          permission: 'service:ticket:view_own',
        },
      ],
    },
    {
      name: t('sidebar.crm'),
      href: tenantUrl('/crm'),
      icon: Users,
      permission: 'crm:customer:manage',
      children: [
        {
          name: 'Leads',
          href: tenantUrl('/crm/leads'),
          icon: UserPlus,
          permission: 'crm:lead:view',
        },
        {
          name: 'Opportunities',
          href: tenantUrl('/crm/opportunities'),
          icon: TrendingUp,
          permission: 'crm:opportunity:view',
        },
        {
          name: t('sidebar.sub_menu.customers'),
          href: tenantUrl('/crm/customers'),
          icon: Contact,
          permission: 'crm:customer:manage',
        },
        {
          name: 'Customer Groups',
          href: tenantUrl('/crm/groups'),
          icon: Contact2,
          permission: 'crm:customer_group:manage',
        },
      ],
    },
    {
      name: t('sidebar.hr_parent'),
      href: tenantUrl('/hr/employees'),
      icon: Users,
      permission: 'hr:employee:view',
      children: [
        {
          name: t('sidebar.sub_menu.employees'),
          href: tenantUrl('/hr/employees'),
          icon: BadgeCheck,
          permission: 'hr:employee:view',
        },
        {
          name: 'Attendance',
          icon: CalendarCheck,
          permission: 'hr:attendance:view',
          children: [
            {
              name: 'Timesheets',
              href: tenantUrl('/hr/attendance'),
              icon: Clock11,
              permission: 'hr:attendance:view',
            },
          ],
        },
        {
          name: 'Leave Management',
          href: tenantUrl('/hr/leave-management'),
          icon: CalendarCheck,
          permission: 'hr:leave:manage',
        },
        {
          name: 'Leave Management',
          href: tenantUrl('/hr/leave-management'),
          icon: Plane,
          permission: 'hr:leave:view',
        },
        {
          name: 'Organization Setup',
          href: tenantUrl('/hr/organization'),
          icon: Building2,
          permission: 'hr:employee:view',
        },
        {
          name: 'Payroll',
          href: tenantUrl('/hr/payroll'),
          icon: Wallet,
          permission: 'hr:payroll:view',
        },
      ],
    },
    {
      name: t('sidebar.accounting'),
      href: tenantUrl('/accounting'),
      icon: Landmark,
      permission: 'accounting:ledger:view',
      children: [
        {
          name: t('sidebar.sub_menu.general_ledger'),
          href: tenantUrl('/accounting/ledger'),
          icon: BookOpen,
          permission: 'accounting:ledger:view',
        },
        {
          name: t('sidebar.sub_menu.chart_of_accounts'),
          href: tenantUrl('/accounting/chart'),
          icon: Library,
          permission: 'accounting:chart:manage',
        },
        {
          name: t('sidebar.sub_menu.payables', 'Accounts Payable'),
          href: tenantUrl('/accounting/payables'),
          icon: Receipt,
          permission: 'accounting:payables:view',
        },
        {
          name: t('sidebar.sub_menu.cheques'),
          href: tenantUrl('/accounting/cheques'),
          icon: Edit,
          permission: 'accounting:cheque:view',
        },
        {
          name: t('sidebar.sub_menu.all_payments'),
          href: tenantUrl('/accounting/payments'),
          icon: SwatchBook,
          permission: 'accounting:payment:view',
        },
        {
          name: t('sidebar.sub_menu.payroll'),
          href: tenantUrl('/accounting/payroll'),
          icon: FileCheck,
          permission: 'hr:payroll:run',
        },
        {
          name: 'Bank Reconciliation',
          href: tenantUrl('/accounting/bank-reconciliation'),
          icon: Landmark,
          permission: 'accounting:reconciliation:manage',
        },
        {
          name: 'Period Closing',
          href: tenantUrl('/accounting/period-closing'),
          icon: CalendarOff,
          permission: 'accounting:closing:manage',
        },
        {
          name: 'Budgets',
          href: tenantUrl('/accounting/budgets'),
          icon: PiggyBank,
          permission: 'accounting:budget:manage',
        },
      ],
    },
    {
      name: t('sidebar.reports'),
      href: tenantUrl('/reports'),
      icon: BarChart3,
      permission: 'reports:access',
    },
    {
      name: 'Notifications',
      icon: BellRing,
      permission: 'settings:access',
      children: [
        {
          name: 'Notification Templates',
          icon: BellRing,
          href: tenantUrl('/settings/notification-templates'),
          permission: 'settings:notifications:manage',
        },
      ],
    },
    {
      name: t('sidebar.settings'),
      href: tenantUrl('/settings'),
      icon: Settings,
      permission: 'settings:access',
      children: [
        {
          name: 'Company Profile',
          href: tenantUrl('/settings/company-profile'),
          icon: Building,
          permission: 'settings:company:manage',
        },
        {
          name: 'Product Hierarchy',
          href: tenantUrl('/settings/product-hierarchy'),
          icon: Network,
          permission: 'inventory:product:manage',
        },
        {
          name: 'Warranty Policies',
          href: tenantUrl('/settings/warranties'),
          icon: ShieldCheck,
          permission: 'inventory:product:manage',
        },
        {
          name: 'Discount Coupons',
          href: tenantUrl('/settings/coupons'),
          icon: Ticket,
          permission: 'sales:pricing:manage',
        },
        {
          name: t('sidebar.sub_menu.profile'),
          href: tenantUrl('/settings/profile'),
          icon: ProfileIcon,
          permission: 'settings:access',
        },
        {
          name: t('sidebar.sub_menu.currencies'),
          href: tenantUrl('/settings/currencies'),
          icon: ChartCandlestick,
          permission: 'settings:access',
        },
        {
          name: t('sidebar.sub_menu.locations'),
          href: tenantUrl('/settings/locations'),
          icon: Building2,
          permission: 'settings:locations:manage',
        },
        {
          name: t('sidebar.sub_menu.localization'),
          href: tenantUrl('/settings/localization'),
          icon: Globe,
          permission: 'settings:access',
        },
        {
          name: 'Cash Drawer',
          href: tenantUrl('/settings/cash-drawer'),
          icon: Coins,
          permission: 'settings:pos:manage',
        },
        {
          name: t('sidebar.sub_menu.users'),
          href: tenantUrl('/settings/users'),
          icon: UserCog,
          permission: 'setting:user:manage',
        },
        {
          name: 'Tax Categories',
          href: tenantUrl('/settings/tax-categories'),
          icon: Bookmark,
          permission: 'accounting:tax:manage',
        },
        {
          name: 'Tax Rules',
          href: tenantUrl('/settings/taxes'),
          icon: Percent,
          permission: 'accounting:tax:manage',
        },
        {
          name: t('sidebar.sub_menu.payment_methods'),
          href: tenantUrl('/settings/payment-methods'),
          icon: Wallet,
          permission: 'settings:access',
        },
        {
          name: t('sidebar.sub_menu.roles_permissions'),
          href: tenantUrl('/settings/roles'),
          icon: KeyRound,
          permission: 'hr:role:manage',
        },
        {
          name: 'Service Settings',
          icon: Wrench,
          permission: 'settings:service:manage',
          children: [
            {
              name: 'QC Templates',
              href: tenantUrl('/settings/qc-templates'),
              icon: Wrench,
              permission: 'service:qc:manage',
            },
          ],
        },
        {
          name: 'Hardware & Devices',
          href: tenantUrl('/settings/hardware'),
          icon: HardDrive,
          permission: 'settings:access',
        },
        {
          name: t('sidebar.sub_menu.inventory_settings'),
          href: tenantUrl('/settings/inventory'),
          icon: Warehouse,
          permission: 'inventory:product:manage',
          children: [
            {
              name: 'Backups & Restore',
              href: tenantUrl('/settings/backups'),
              icon: ShieldCheck,
              permission: 'tenant:admin',
            },
            {
              name: 'Printing & Documents',
              href: tenantUrl('/settings/printing'),
              icon: Printer,
              permission: 'settings:access',
              children: [
                {
                  name: 'Document Templates',
                  href: tenantUrl('/settings/document-templates'),
                  icon: Printer,
                  permission: 'settings:access',
                },
              ],
            },
            {
              name: t('sidebar.sub_menu.brands'),
              href: tenantUrl('/settings/inventory/brands'),
              icon: Tag,
              permission: 'inventory:product:manage',
            },
            {
              name: t('sidebar.sub_menu.categories'),
              href: tenantUrl('/settings/inventory/categories'),
              icon: ListTree,
              permission: 'inventory:product:manage',
            },
            {
              name: t('sidebar.sub_menu.attributes'),
              href: tenantUrl('/settings/inventory/attributes'),
              icon: Beaker,
              permission: 'inventory:product:manage',
            },
            {
              name: t('sidebar.sub_menu.label_templates'),
              href: tenantUrl('/settings/printing'),
              icon: Printer,
              permission: 'settings:printing:manage',
            },
          ],
        },
        {
          name: 'Financial Periods',
          href: tenantUrl('/settings/financial-periods'),
          icon: CalendarDays,
          permission: 'accounting:closing:manage',
        },
        {
          name: 'Benefits Setup',
          href: tenantUrl('/settings/benefits'),
          icon: Gift,
          permission: 'hr:benefits:manage',
        },
        {
          name: 'Pricing & Promotions',
          href: tenantUrl('/settings/pricing'),
          icon: Tags,
          permission: 'sales:pricing:manage',
        },
        {
          name: t('sidebar.sub_menu.integrations'),
          href: tenantUrl('/settings/integrations'),
          icon: Plug,
          permission: 'settings:access',
        },
        {
          name: 'Deduction Rules',
          href: tenantUrl('/settings/payroll-rules'),
          icon: FileMinus,
          permission: 'hr:payroll:manage',
        },
      ],
    },
  ];

  const navItems = [
    // Dashboard
    {
      name: t('sidebar.dashboard'),
      href: tenantUrl('/'),
      icon: LayoutDashboard,
      permission: null,
    },

    // SALES
    {
      name: t('sidebar.pos_parent'),
      icon: ShoppingCart,
      permission: 'sales:pos:access',
      children: [
        {
          name: t('sidebar.sub_menu.pos_terminal'),
          href: tenantUrl('/pos/shifts'),
          icon: CreditCard,
          permission: 'sales:pos:access',
        },
        {
          name: 'All Invoices',
          href: tenantUrl('/sales/invoices'),
          icon: FileText,
          permission: 'sales:invoice:view_all',
        },
        {
          name: 'Process Return',
          href: tenantUrl('/sales/returns'),
          icon: RotateCcw,
          permission: 'sales:return:manage',
        },
      ],
    },

    // CRM
    {
      name: t('sidebar.crm'),
      icon: Users,
      permission: 'crm:customer:manage',
      children: [
        {
          name: 'Leads',
          href: tenantUrl('/crm/leads'),
          icon: UserPlus,
          permission: 'crm:lead:view',
        },
        {
          name: 'Opportunities',
          href: tenantUrl('/crm/opportunities'),
          icon: TrendingUp,
          permission: 'crm:opportunity:view',
        },
        {
          name: t('sidebar.sub_menu.customers'),
          href: tenantUrl('/crm/customers'),
          icon: Contact,
          permission: 'crm:customer:manage',
        },
        {
          name: 'Customer Groups',
          href: tenantUrl('/crm/groups'),
          icon: Contact2,
          permission: 'crm:customer_group:manage',
        },
      ],
    },

    // SERVICE & REPAIRS
    {
      name: t('sidebar.service_parent'),
      icon: Hammer,
      permission: 'service:ticket:view',
      children: [
        {
          name: t('sidebar.sub_menu.service_dashboard'),
          href: tenantUrl('/service/dashboard'),
          icon: LayoutDashboard,
          permission: 'service:ticket:view',
        },
        {
          name: t('sidebar.sub_menu.new_repair_ticket'),
          href: tenantUrl('/service/tickets/new'),
          icon: FilePlus2,
          permission: 'service:ticket:create',
        },
        {
          name: 'My Job Queue',
          href: tenantUrl('/service/my-dashboard'),
          icon: ListTodo,
          permission: 'service:ticket:view_own',
        },
      ],
    },

    // INVENTORY
    {
      name: t('sidebar.inventory'),
      icon: Warehouse,
      permission: 'inventory:product:view',
      children: [
        {
          name: t('sidebar.sub_menu.products'),
          href: tenantUrl('/inventory/products'),
          icon: Package,
          permission: 'inventory:product:view',
        },
        {
          name: t('sidebar.sub_menu.stock_levels'),
          href: tenantUrl('/inventory/stock-levels'),
          icon: SlidersHorizontal,
          permission: 'inventory:product:view',
        },
        {
          name: t('sidebar.sub_menu.adjustments'),
          href: tenantUrl('/inventory/adjustments'),
          icon: FileSliders,
          permission: 'inventory:stock:adjust',
        },
        {
          name: t('sidebar.sub_menu.transfers'),
          href: tenantUrl('/inventory/transfers'),
          icon: ArrowRightLeft,
          permission: 'inventory:stock:transfer',
        },
        {
          name: 'Kitting & Assembly',
          href: tenantUrl('/inventory/assembly'),
          icon: Combine,
          permission: 'inventory:assembly:create',
        },
        {
          name: 'Print Hub',
          href: tenantUrl('/inventory/print-hub'),
          icon: Printer,
          permission: 'inventory:product:view',
        },
        {
          name: 'Inventory Ledger',
          href: tenantUrl('/inventory/ledger'),
          icon: History,
          permission: 'inventory:stock:view',
        },
      ],
    },

    // PROCUREMENT
    {
      name: t('sidebar.procurement'),
      icon: Truck,
      permission: 'procurement:po:create',
      children: [
        {
          name: t('sidebar.sub_menu.purchase_orders'),
          href: tenantUrl('/procurement/po'),
          icon: ClipboardList,
          permission: 'procurement:po:create',
        },
        {
          name: 'Goods Receipts',
          href: tenantUrl('/procurement/receipts'),
          icon: ClipboardCheck,
          permission: 'procurement:po:view',
        },
        {
          name: t('sidebar.sub_menu.suppliers'),
          href: tenantUrl('/procurement/suppliers'),
          icon: Contact,
          permission: 'procurement:supplier:manage',
        },
        {
          name: t('sidebar.sub_menu.invoices'),
          href: tenantUrl('/procurement/invoices'),
          icon: FileText,
          permission: 'accounting:payables:view',
        },
      ],
    },

    // ACCOUNTING
    {
      name: t('sidebar.accounting'),
      icon: Landmark,
      permission: 'accounting:ledger:view',
      children: [
        {
          name: t('sidebar.sub_menu.general_ledger'),
          href: tenantUrl('/accounting/ledger'),
          icon: BookOpen,
          permission: 'accounting:ledger:view',
        },
        {
          name: t('sidebar.sub_menu.chart_of_accounts'),
          href: tenantUrl('/accounting/chart'),
          icon: Library,
          permission: 'accounting:chart:manage',
        },
        {
          name: t('sidebar.sub_menu.payables', 'Accounts Payable'),
          href: tenantUrl('/accounting/payables'),
          icon: Receipt,
          permission: 'accounting:payables:view',
        },
        {
          name: t('sidebar.sub_menu.all_payments'),
          href: tenantUrl('/accounting/payments'),
          icon: SwatchBook,
          permission: 'accounting:payment:view',
        },
        {
          name: t('sidebar.sub_menu.cheques'),
          href: tenantUrl('/accounting/cheques'),
          icon: Edit,
          permission: 'accounting:cheque:view',
        },
        {
          name: t('sidebar.sub_menu.payroll'),
          href: tenantUrl('/accounting/payroll'),
          icon: FileCheck,
          permission: 'hr:payroll:run',
        },
        {
          name: 'Bank Reconciliation',
          href: tenantUrl('/accounting/bank-reconciliation'),
          icon: Landmark,
          permission: 'accounting:reconciliation:manage',
        },
        {
          name: 'Period Closing',
          href: tenantUrl('/accounting/period-closing'),
          icon: CalendarOff,
          permission: 'accounting:closing:manage',
        },
        {
          name: 'Budgets',
          href: tenantUrl('/accounting/budgets'),
          icon: PiggyBank,
          permission: 'accounting:budget:manage',
        },
      ],
    },

    // HR
    {
      name: t('sidebar.hr_parent'),
      icon: Users,
      permission: 'hr:employee:view',
      children: [
        {
          name: t('sidebar.sub_menu.employees'),
          href: tenantUrl('/hr/employees'),
          icon: BadgeCheck,
          permission: 'hr:employee:view',
        },
        {
          name: 'Attendance',
          href: tenantUrl('/hr/attendance'),
          icon: CalendarCheck,
          permission: 'hr:attendance:view',
        },
        {
          name: 'Leave Management',
          href: tenantUrl('/hr/leave-management'),
          icon: Plane,
          permission: 'hr:leave:manage',
        },
        {
          name: 'Organization Setup',
          href: tenantUrl('/hr/organization'),
          icon: Building2,
          permission: 'hr:employee:view',
        },
        {
          name: 'Payroll',
          href: tenantUrl('/hr/payroll'),
          icon: Wallet,
          permission: 'hr:payroll:view',
        },
      ],
    },

    // REPORTS
    {
      name: t('sidebar.reports'),
      href: tenantUrl('/reports'),
      icon: BarChart3,
      permission: 'reports:access',
    },

    // NOTIFICATIONS
    {
      name: 'Notifications',
      icon: BellRing,
      permission: 'settings:access',
      children: [
        {
          name: 'Notification Templates',
          href: tenantUrl('/settings/notification-templates'),
          icon: BellRing,
          permission: 'settings:notifications:manage',
        },
      ],
    },

    // SETTINGS
    {
      name: t('sidebar.settings'),
      href: tenantUrl('/settings'),
      icon: Settings,
      permission: 'settings:access',
      children: [
        {
          name: 'Company Profile',
          href: tenantUrl('/settings/company-profile'),
          icon: Building,
          permission: 'settings:company:manage',
        },
        {
          name: 'Product Hierarchy',
          href: tenantUrl('/settings/product-hierarchy'),
          icon: Network,
          permission: 'inventory:product:manage',
        },
        {
          name: 'Warranty Policies',
          href: tenantUrl('/settings/warranties'),
          icon: ShieldCheck,
          permission: 'inventory:product:manage',
        },
        {
          name: 'Discount Coupons',
          href: tenantUrl('/settings/coupons'),
          icon: Ticket,
          permission: 'sales:pricing:manage',
        },
        {
          name: t('sidebar.sub_menu.profile'),
          href: tenantUrl('/settings/profile'),
          icon: ProfileIcon,
          permission: 'settings:access',
        },
        {
          name: 'Currencies',
          href: tenantUrl('/settings/currencies'),
          icon: ChartCandlestick,
          permission: 'settings:access',
        },
        {
          name: 'Locations',
          href: tenantUrl('/settings/locations'),
          icon: Building2,
          permission: 'settings:locations:manage',
        },
        {
          name: 'Localization',
          href: tenantUrl('/settings/localization'),
          icon: Globe,
          permission: 'settings:access',
        },
        {
          name: 'Cash Drawer',
          href: tenantUrl('/settings/cash-drawer'),
          icon: Coins,
          permission: 'settings:pos:manage',
        },
        {
          name: 'Users',
          href: tenantUrl('/settings/users'),
          icon: UserCog,
          permission: 'setting:user:manage',
        },
        {
          name: 'Tax Categories',
          href: tenantUrl('/settings/tax-categories'),
          icon: Bookmark,
          permission: 'accounting:tax:manage',
        },
        {
          name: 'Tax Rules',
          href: tenantUrl('/settings/taxes'),
          icon: Percent,
          permission: 'accounting:tax:manage',
        },
        {
          name: t('sidebar.sub_menu.payment_methods'),
          href: tenantUrl('/settings/payment-methods'),
          icon: Wallet,
          permission: 'settings:access',
        },
        {
          name: t('sidebar.sub_menu.roles_permissions'),
          href: tenantUrl('/settings/roles'),
          icon: KeyRound,
          permission: 'hr:role:manage',
        },
        {
          name: 'Service Settings',
          icon: Wrench,
          permission: 'settings:service:manage',
          children: [
            {
              name: 'QC Templates',
              href: tenantUrl('/settings/qc-templates'),
              icon: Wrench,
              permission: 'service:qc:manage',
            },
          ],
        },
        {
          name: 'Hardware & Devices',
          href: tenantUrl('/settings/hardware'),
          icon: HardDrive,
          permission: 'settings:access',
        },
        {
          name: 'Inventory Settings',
          href: tenantUrl('/settings/inventory'),
          icon: Warehouse,
          permission: 'inventory:product:manage',
          children: [
            {
              name: 'Backups & Restore',
              href: tenantUrl('/settings/backups'),
              icon: ShieldCheck,
              permission: 'tenant:admin',
            },
            {
              name: 'Document Templates',
              href: tenantUrl('/settings/document-templates'),
              icon: Printer,
              permission: 'settings:access',
            },
            {
              name: 'Brands',
              href: tenantUrl('/settings/inventory/brands'),
              icon: Tag,
              permission: 'inventory:product:manage',
            },
            {
              name: 'Categories',
              href: tenantUrl('/settings/inventory/categories'),
              icon: ListTree,
              permission: 'inventory:product:manage',
            },
            {
              name: 'Attributes',
              href: tenantUrl('/settings/inventory/attributes'),
              icon: Beaker,
              permission: 'inventory:product:manage',
            },
            {
              name: 'Label Templates',
              href: tenantUrl('/settings/printing'),
              icon: Printer,
              permission: 'settings:printing:manage',
            },
          ],
        },
        {
          name: 'Financial Periods',
          href: tenantUrl('/settings/financial-periods'),
          icon: CalendarDays,
          permission: 'accounting:closing:manage',
        },
        {
          name: 'Benefits Setup',
          href: tenantUrl('/settings/benefits'),
          icon: Gift,
          permission: 'hr:benefits:manage',
        },
        {
          name: 'Pricing & Promotions',
          href: tenantUrl('/settings/pricing'),
          icon: Tags,
          permission: 'sales:pricing:manage',
        },
        {
          name: t('sidebar.sub_menu.integrations'),
          href: tenantUrl('/settings/integrations'),
          icon: Plug,
          permission: 'settings:access',
        },
        {
          name: 'Deduction Rules',
          href: tenantUrl('/settings/payroll-rules'),
          icon: FileMinus,
          permission: 'hr:payroll:manage',
        },
      ],
    },
  ];

  // Effect to automatically open the active menu trail on page load
  useEffect(() => {
    const activeTrail = findActiveTrail(navItems, location.pathname);
    const initialOpenMenus = {};
    activeTrail.forEach((item) => {
      if (item.children) {
        initialOpenMenus[item.name] = true;
      }
    });
    setOpenMenus(initialOpenMenus);
  }, [location.pathname]);

  const handleMenuToggle = (menuName) => {
    setOpenMenus((prev) => ({ ...prev, [menuName]: !prev[menuName] }));
  };

  return (
    <div className='w-64 bg-slate-800 text-slate-100 flex-shrink-0 flex flex-col'>
      <div className='flex items-center justify-center h-20 border-b border-slate-700 flex-shrink-0 px-4'>
        <ShieldCheck className='h-8 w-8 text-indigo-400 flex-shrink-0' />
        <span className='ml-3 text-lg font-bold truncate' title={tenant?.companyName || 'iShopMaster'}>
          {tenant?.companyName || 'iShopMaster'}
        </span>
      </div>
      <nav className='flex-1 mt-6 px-4 space-y-1 overflow-y-auto'>
        {renderNavItems(navItems, user, location, openMenus, handleMenuToggle)}
      </nav>
      <div className='p-4 text-center text-xs text-slate-400 border-t border-slate-700 flex-shrink-0'>
        <div>{t('sidebar.footer_title')}</div>
        <div>v1.0.0</div>
      </div>
    </div>
  );
};

// --- HELPER FUNCTIONS (can be moved to a separate file) ---

/**
 * A recursive function to render navigation items.
 * Handles nested children and permission checks.
 */
const renderNavItems = (items, user, location, openMenus, handleMenuToggle, parentKey = '') => {
  return items.map((item) => {
    const hasPermission = !item.permission || user?.permissions?.includes(item.permission);
    if (!hasPermission) return null;

    const itemKey = parentKey ? `${parentKey}.${item.name}` : item.name;

    if (!item.children) {
      const isActive = location.pathname === item.href;
      return <NavItemLink key={itemKey} item={item} isActive={isActive} />;
    }

    const isParentActive = location.pathname.startsWith(item.href);
    const isMenuOpen = openMenus[itemKey];

    return (
      <div key={itemKey}>
        <button
          onClick={() => handleMenuToggle(itemKey)}
          aria-expanded={isMenuOpen}
          className={cn(
            'w-full flex items-center justify-between p-3 rounded-lg text-sm transition-colors',
            isParentActive ? 'bg-slate-700/50 text-white' : 'text-slate-300 hover:bg-slate-700',
          )}
        >
          <div className='flex items-center'>
            {item.icon && <item.icon className='h-5 w-5 mr-3 flex-shrink-0' strokeWidth={1.5} />}
            <span className='truncate'>{item.name}</span>
          </div>
          <ChevronDown className={cn('h-4 w-4 transition-transform', isMenuOpen && 'rotate-180')} />
        </button>
        {isMenuOpen && (
          <div className='mt-1 pl-6 space-y-1 border-l-2 border-slate-700 ml-[0.6875rem]'>
            {renderNavItems(
              item.children,
              user,
              location,
              openMenus,
              handleMenuToggle,
              itemKey, // pass down the key chain
            )}
          </div>
        )}
      </div>
    );
  });
};

/**
 * A simple component for a non-collapsible navigation link.
 */
const NavItemLink = ({ item, isActive }) => (
  <Link
    to={item.href}
    className={cn(
      'flex items-center p-3 rounded-lg text-sm transition-colors',
      isActive ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'text-slate-300 hover:bg-slate-700',
    )}
  >
    <item.icon className='h-5 w-5 mr-3 flex-shrink-0' strokeWidth={1.5} />
    <span className='truncate'>{item.name}</span>
  </Link>
);

/**
 * Finds the active navigation trail for a given pathname.
 */
const findActiveTrail = (items, pathname) => {
  for (const item of items) {
    if (item.href === pathname) return [item];
    if (item.children) {
      const childTrail = findActiveTrail(item.children, pathname);
      if (childTrail.length > 0) {
        return [item, ...childTrail];
      }
    }
  }
  return [];
};

export default Sidebar;
