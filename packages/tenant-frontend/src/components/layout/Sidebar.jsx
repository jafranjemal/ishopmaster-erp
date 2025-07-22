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
  Edit,
  FileCheck,
  FileMinus,
  FilePlus2,
  FileSliders,
  FileText,
  Gift,
  Globe,
  Hammer,
  History,
  KeyRound,
  Landmark,
  LayoutDashboard,
  Library,
  ListTodo,
  ListTree,
  Network,
  Package,
  Percent,
  PiggyBank,
  Plane,
  Plug,
  Printer,
  User as ProfileIcon,
  Receipt,
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
  Undo2,
  UserCog,
  UserPlus,
  Users,
  Wallet,
  Warehouse,
  Wrench,
} from 'lucide-react';
import useAuth from '../../context/useAuth';

const Sidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, tenant } = useAuth();

  // State is now an object to track multiple open menus
  const [openMenus, setOpenMenus] = useState({});

  // --- MASTER NAVIGATION CONFIGURATION (with corrected permissions and translations) ---
  const navItems = [
    {
      name: t('sidebar.dashboard'),
      href: '/',
      icon: LayoutDashboard,
      permission: null,
    },

    {
      name: t('sidebar.pos_parent'), // e.g., "Point of Sale"
      href: '/pos/shifts',
      icon: ShoppingCart,
      permission: 'sales:pos:access',
      children: [
        {
          name: t('sidebar.sub_menu.pos_terminal'),
          href: '/pos/shifts',
          icon: ShoppingCart,
          permission: 'sales:pos:access',
        },
        { name: 'Process Return', href: '/sales/returns', icon: Undo2, permission: 'sales:return:manage' },

        // Future links like Sales History will go here
      ],
    },
    {
      name: t('sidebar.inventory'),
      href: '/inventory',
      icon: Warehouse,
      permission: 'inventory:product:view',
      children: [
        {
          name: t('sidebar.sub_menu.products'),
          href: '/inventory/products',
          icon: Package,
          permission: 'inventory:product:view',
        },
        {
          name: 'Kitting & Assembly',
          href: '/inventory/assembly',
          icon: Combine,
          permission: 'inventory:assembly:create',
        },

        {
          name: t('sidebar.sub_menu.stock_levels'),
          href: '/inventory/stock-levels',
          icon: SlidersHorizontal,
          permission: 'inventory:product:view',
        }, // <-- NEW

        {
          name: t('sidebar.sub_menu.adjustments'),
          href: '/inventory/adjustments',
          icon: FileSliders,
          permission: 'inventory:stock:adjust',
        },
        {
          name: t('sidebar.sub_menu.transfers'),
          href: '/inventory/transfers',
          icon: ArrowRightLeft,
          permission: 'inventory:stock:transfer',
        },
        {
          name: 'Print Hub',
          href: '/inventory/print-hub',
          icon: Printer, // Assuming Printer icon from lucide-react
          permission: 'inventory:product:view',
        },
        { name: 'Inventory Ledger', href: '/inventory/ledger', icon: History, permission: 'inventory:stock:view' },
      ],
    },
    {
      name: t('sidebar.procurement'),
      href: '/procurement',
      icon: Truck,
      permission: 'procurement:po:create',
      children: [
        {
          name: t('sidebar.sub_menu.purchase_orders'),
          href: '/procurement/po',
          icon: ClipboardList,
          permission: 'procurement:po:create',
        },
        {
          name: 'Goods Receipts',
          href: '/procurement/receipts',
          icon: ClipboardCheck,
          permission: 'procurement:po:view',
        },

        {
          name: t('sidebar.sub_menu.suppliers'),
          href: '/procurement/suppliers',
          icon: Contact,
          permission: 'procurement:supplier:manage',
        },
        {
          name: t('sidebar.sub_menu.invoices'),
          href: '/procurement/invoices',
          icon: FileText,
          permission: 'accounting:payables:view',
        }, // <-- NEW LINK
      ],
    },
    {
      name: t('sidebar.service_parent'), // e.g., "Service & Repairs"
      //  href: '/service/dashboard',
      icon: Hammer,
      permission: 'service:ticket:view', // A general permission for the module
      children: [
        {
          name: t('sidebar.sub_menu.service_dashboard'),
          icon: LayoutDashboard,
          href: '/service/dashboard',
          permission: 'service:ticket:view',
        },
        {
          name: t('sidebar.sub_menu.new_repair_ticket'),
          icon: FilePlus2,
          href: '/service/tickets/new',
          permission: 'service:ticket:create',
        },
        {
          name: 'My Job Queue',
          icon: ListTodo,
          href: '/service/my-dashboard',
          permission: 'service:ticket:view_own', // A more specific permission
        },
      ],
    },
    {
      name: t('sidebar.crm'),
      href: '/crm',
      icon: Users,
      permission: 'crm:customer:manage',
      children: [
        {
          name: 'Leads',
          href: '/crm/leads',
          icon: UserPlus, // 👤➕ Represents adding/finding potential customers
          permission: 'crm:lead:view',
        },
        {
          name: 'Opportunities',
          href: '/crm/opportunities',
          icon: TrendingUp, // 📈 Represents potential deals/sales growth
          permission: 'crm:opportunity:view',
        },

        {
          name: t('sidebar.sub_menu.customers'),
          href: '/crm/customers',
          icon: Contact,
          permission: 'crm:customer:manage',
        },
        { name: 'Customer Groups', href: '/crm/groups', icon: Contact2, permission: 'crm:customer_group:manage' },
      ],
    },

    {
      name: t('sidebar.hr_parent'), // e.g., "Human Resources"
      href: '/hr/employees',
      icon: Users, // 👤 Suitable for HR/People
      permission: 'hr:employee:view',
      children: [
        {
          name: t('sidebar.sub_menu.employees'),
          href: '/hr/employees',
          icon: BadgeCheck, // ✅ Best for employee list/identity verification
          permission: 'hr:employee:view',
        },
        // Future features
        {
          name: 'Attendance',
          icon: CalendarCheck,
          permission: 'hr:attendance:view',
          children: [{ name: 'Timesheets', href: '/hr/attendance', icon: Clock11, permission: 'hr:attendance:view' }],
        },
        { name: 'Leave Management', href: '/hr/leave-management', icon: CalendarCheck, permission: 'hr:leave:manage' },

        {
          name: 'Leave Management',
          href: '/hr/leave-management',
          icon: Plane, // ✈️ For vacation/leave modules
          permission: 'hr:leave:view',
        },
        { name: 'Organization Setup', href: '/hr/organization', icon: Building2, permission: 'hr:employee:view' },

        {
          name: 'Payroll',
          href: '/hr/payroll',
          icon: Wallet, // 💼 For salaries and compensation
          permission: 'hr:payroll:view',
        },
      ],
    },
    {
      name: t('sidebar.accounting'),
      href: '/accounting',
      icon: Landmark,
      permission: 'accounting:ledger:view',
      children: [
        {
          name: t('sidebar.sub_menu.general_ledger'),
          href: '/accounting/ledger',
          icon: BookOpen,
          permission: 'accounting:ledger:view',
        },
        {
          name: t('sidebar.sub_menu.chart_of_accounts'),
          href: '/accounting/chart',
          icon: Library,
          permission: 'accounting:chart:manage',
        },

        {
          name: t('sidebar.sub_menu.payables', 'Accounts Payable'),
          href: '/accounting/payables',
          icon: Receipt,
          permission: 'accounting:payables:view',
        },
        {
          name: t('sidebar.sub_menu.cheques'),
          href: '/accounting/cheques',
          icon: Edit,
          permission: 'accounting:cheque:view',
        },
        {
          name: t('sidebar.sub_menu.all_payments'),
          href: '/accounting/payments',
          icon: SwatchBook,
          permission: 'accounting:payment:view',
        },
        {
          name: t('sidebar.sub_menu.payroll'),
          href: '/accounting/payroll',
          icon: FileCheck,
          permission: 'hr:payroll:run',
        },
        {
          name: 'Bank Reconciliation',
          href: '/accounting/bank-reconciliation',
          icon: Landmark,
          permission: 'accounting:reconciliation:manage',
        },
        {
          name: 'Period Closing',
          href: '/accounting/period-closing',
          icon: CalendarOff,
          permission: 'accounting:closing:manage',
        },
        { name: 'Budgets', href: '/accounting/budgets', icon: PiggyBank, permission: 'accounting:budget:manage' },
      ],
    },
    {
      name: t('sidebar.reports'),
      href: '/reports',
      icon: BarChart3,
      permission: 'reports:access',
    },
    {
      name: 'Notifications',
      icon: BellRing,
      permission: 'settings:access',
      children: [
        // ... other settings
        {
          name: 'Notification Templates',
          icon: BellRing,
          href: '/settings/notification-templates',
          permission: 'settings:notifications:manage',
        },
      ],
    },
    {
      name: t('sidebar.settings'),
      href: '/settings',
      icon: Settings,
      permission: 'settings:access',
      children: [
        {
          name: 'Company Profile',
          href: '/settings/company-profile',
          icon: Building,
          permission: 'settings:company:manage',
        },
        {
          name: 'Product Hierarchy',
          href: '/settings/product-hierarchy',
          icon: Network,
          permission: 'inventory:product:manage',
        },
        {
          name: 'Warranty Policies',
          href: '/settings/warranties',
          icon: ShieldCheck,
          permission: 'inventory:product:manage',
        },
        { name: 'Discount Coupons', href: '/settings/coupons', icon: Ticket, permission: 'sales:pricing:manage' },

        {
          name: t('sidebar.sub_menu.profile'),
          href: '/settings/profile',
          icon: ProfileIcon,
          permission: 'settings:access',
        },

        {
          name: t('sidebar.sub_menu.currencies'),
          href: '/settings/currencies',
          icon: ChartCandlestick,
          permission: 'settings:access',
        }, // <-- ADD THIS NEW LINK

        {
          name: t('sidebar.sub_menu.locations'),
          href: '/settings/locations',
          icon: Building2,
          permission: 'settings:locations:manage',
        },
        {
          name: t('sidebar.sub_menu.localization'),
          href: '/settings/localization',
          icon: Globe,
          permission: 'settings:access',
        },
        { name: 'Cash Drawer', href: '/settings/cash-drawer', icon: Coins, permission: 'settings:pos:manage' },

        {
          name: t('sidebar.sub_menu.users'),
          href: '/settings/users',
          icon: UserCog,
          permission: 'setting:user:manage',
        },
        {
          name: 'Tax Categories',
          href: '/settings/tax-categories',
          icon: Bookmark,
          permission: 'accounting:tax:manage',
        },

        { name: 'Tax Rules', href: '/settings/taxes', icon: Percent, permission: 'accounting:tax:manage' },

        {
          name: t('sidebar.sub_menu.payment_methods'),
          href: '/settings/payment-methods',
          icon: Wallet,
          permission: 'settings:access',
        }, // <-- ADD THIS LINK

        {
          name: t('sidebar.sub_menu.roles_permissions'),
          href: '/settings/roles',
          icon: KeyRound,
          permission: 'hr:role:manage',
        }, // Corrected permission
        {
          name: 'Service Settings',
          icon: Wrench,
          permission: 'settings:service:manage', // Example permission
          children: [
            // ... other service settings
            { name: 'QC Templates', href: '/settings/qc-templates', icon: Wrench, permission: 'service:qc:manage' },
          ],
        },
        {
          name: t('sidebar.sub_menu.inventory_settings'),
          href: '/settings/inventory',
          icon: Warehouse,
          permission: 'inventory:product:manage',
          children: [
            {
              name: t('sidebar.sub_menu.brands'),
              href: '/settings/inventory/brands',
              icon: Tag,
              permission: 'inventory:product:manage',
            },
            {
              name: t('sidebar.sub_menu.categories'),
              href: '/settings/inventory/categories',
              icon: ListTree,
              permission: 'inventory:product:manage',
            },
            {
              name: t('sidebar.sub_menu.attributes'),
              href: '/settings/inventory/attributes',
              icon: Beaker,
              permission: 'inventory:product:manage',
            },
            {
              name: t('sidebar.sub_menu.label_templates'),

              href: '/settings/printing',
              icon: Printer,
              permission: 'settings:printing:manage',
            },
          ],
        },
        {
          name: 'Financial Periods',
          href: '/settings/financial-periods',
          icon: CalendarDays,
          permission: 'accounting:closing:manage',
        },

        { name: 'Benefits Setup', href: '/settings/benefits', icon: Gift, permission: 'hr:benefits:manage' },
        { name: 'Pricing & Promotions', href: '/settings/pricing', icon: Tags, permission: 'sales:pricing:manage' },

        {
          name: t('sidebar.sub_menu.integrations'),
          href: '/settings/integrations',
          icon: Plug,
          permission: 'settings:access',
        },
        { name: 'Deduction Rules', href: '/settings/payroll-rules', icon: FileMinus, permission: 'hr:payroll:manage' },
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
