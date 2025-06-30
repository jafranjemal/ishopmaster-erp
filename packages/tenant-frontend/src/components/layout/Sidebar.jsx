import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
// Correct import from context
import { cn } from "ui-library"; // Correct import from local utils
import { useTranslation } from "react-i18next";

// Import all necessary icons
import {
  LayoutDashboard,
  ShoppingCart,
  Warehouse,
  Truck,
  Wrench,
  Users,
  Landmark,
  UserCog,
  BarChart3,
  Settings,
  ShieldCheck,
  ChevronDown,
  Package,
  FileSliders,
  ArrowRightLeft,
  ClipboardList,
  Contact,
  Ticket,
  User as ProfileIcon,
  Building2,
  KeyRound,
  Printer,
  Plug,
  BookOpen,
  Library,
  Tag,
  ListTree,
  Beaker,
  Globe,
  Receipt,
  Wallet,
  Edit,
  ChartCandlestick,
  FileText,
  SwatchBook,
  SlidersHorizontal,
  ClipboardCheck,
  Building,
} from "lucide-react";
import useAuth from "../../context/useAuth";

const Sidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, tenant } = useAuth();

  // State is now an object to track multiple open menus
  const [openMenus, setOpenMenus] = useState({});

  // --- MASTER NAVIGATION CONFIGURATION (with corrected permissions and translations) ---
  const navItems = [
    {
      name: t("sidebar.dashboard"),
      href: "/",
      icon: LayoutDashboard,
      permission: null,
    },
    {
      name: t("sidebar.pos"),
      href: "/pos",
      icon: ShoppingCart,
      permission: "sales:pos:access",
    },
    {
      name: t("sidebar.inventory"),
      href: "/inventory",
      icon: Warehouse,
      permission: "inventory:product:view",
      children: [
        {
          name: t("sidebar.sub_menu.products"),
          href: "/inventory/products",
          icon: Package,
          permission: "inventory:product:view",
        },
        {
          name: t("sidebar.sub_menu.stock_levels"),
          href: "/inventory/stock-levels",
          icon: SlidersHorizontal,
          permission: "inventory:product:view",
        }, // <-- NEW

        {
          name: t("sidebar.sub_menu.adjustments"),
          href: "/inventory/adjustments",
          icon: FileSliders,
          permission: "inventory:stock:adjust",
        },
        {
          name: t("sidebar.sub_menu.transfers"),
          href: "/inventory/transfers",
          icon: ArrowRightLeft,
          permission: "inventory:stock:transfer",
        },
        {
          name: "Print Hub",
          href: "/inventory/print-hub",
          icon: Printer, // Assuming Printer icon from lucide-react
          permission: "inventory:product:view",
        },
      ],
    },
    {
      name: t("sidebar.procurement"),
      href: "/procurement",
      icon: Truck,
      permission: "procurement:po:create",
      children: [
        {
          name: t("sidebar.sub_menu.purchase_orders"),
          href: "/procurement/po",
          icon: ClipboardList,
          permission: "procurement:po:create",
        },
        {
          name: "Goods Receipts",
          href: "/procurement/receipts",
          icon: ClipboardCheck,
          permission: "procurement:po:view",
        },

        {
          name: t("sidebar.sub_menu.suppliers"),
          href: "/procurement/suppliers",
          icon: Contact,
          permission: "procurement:supplier:manage",
        },
        {
          name: t("sidebar.sub_menu.invoices"),
          href: "/procurement/invoices",
          icon: FileText,
          permission: "accounting:payables:view",
        }, // <-- NEW LINK
      ],
    },
    {
      name: t("sidebar.service"),
      href: "/service",
      icon: Wrench,
      permission: "service:ticket:view",
      children: [
        {
          name: t("sidebar.sub_menu.tickets"),
          href: "/service/tickets",
          icon: Ticket,
          permission: "service:ticket:create",
        },
      ],
    },
    {
      name: t("sidebar.crm"),
      href: "/crm",
      icon: Users,
      permission: "crm:customer:manage",
      children: [
        {
          name: t("sidebar.sub_menu.customers"),
          href: "/crm/customers",
          icon: Contact,
          permission: "crm:customer:manage",
        },
      ],
    },
    {
      name: t("sidebar.accounting"),
      href: "/accounting",
      icon: Landmark,
      permission: "accounting:ledger:view",
      children: [
        {
          name: t("sidebar.sub_menu.general_ledger"),
          href: "/accounting/ledger",
          icon: BookOpen,
          permission: "accounting:ledger:view",
        },
        {
          name: t("sidebar.sub_menu.chart_of_accounts"),
          href: "/accounting/chart",
          icon: Library,
          permission: "accounting:chart:manage",
        },

        {
          name: t("sidebar.sub_menu.payables", "Accounts Payable"),
          href: "/accounting/payables",
          icon: Receipt,
          permission: "accounting:payables:view",
        },
        {
          name: t("sidebar.sub_menu.cheques"),
          href: "/accounting/cheques",
          icon: Edit,
          permission: "accounting:cheque:view",
        },
        {
          name: t("sidebar.sub_menu.all_payments"),
          href: "/accounting/payments",
          icon: SwatchBook,
          permission: "accounting:payment:view",
        },
      ],
    },
    {
      name: t("sidebar.reports"),
      href: "/reports",
      icon: BarChart3,
      permission: "reports:access",
    },
    {
      name: t("sidebar.settings"),
      href: "/settings",
      icon: Settings,
      permission: "settings:access",
      children: [
        { name: "Company Profile", href: "/settings/company-profile", icon: Building, permission: "settings:company:manage" },

        {
          name: t("sidebar.sub_menu.profile"),
          href: "/settings/profile",
          icon: ProfileIcon,
          permission: "settings:access",
        },

        {
          name: t("sidebar.sub_menu.currencies"),
          href: "/settings/currencies",
          icon: ChartCandlestick,
          permission: "settings:access",
        }, // <-- ADD THIS NEW LINK

        {
          name: t("sidebar.sub_menu.locations"),
          href: "/settings/locations",
          icon: Building2,
          permission: "settings:locations:manage",
        },
        {
          name: t("sidebar.sub_menu.localization"),
          href: "/settings/localization",
          icon: Globe,
          permission: "settings:access",
        },
        {
          name: t("sidebar.sub_menu.users"),
          href: "/settings/users",
          icon: UserCog,
          permission: "setting:user:manage",
        },
        {
          name: t("sidebar.sub_menu.payment_methods"),
          href: "/settings/payment-methods",
          icon: Wallet,
          permission: "settings:access",
        }, // <-- ADD THIS LINK

        {
          name: t("sidebar.sub_menu.roles_permissions"),
          href: "/settings/roles",
          icon: KeyRound,
          permission: "hr:role:manage",
        }, // Corrected permission
        {
          name: t("sidebar.sub_menu.inventory_settings"),
          href: "/settings/inventory",
          icon: Warehouse,
          permission: "inventory:product:manage",
          children: [
            {
              name: t("sidebar.sub_menu.brands"),
              href: "/settings/inventory/brands",
              icon: Tag,
              permission: "inventory:product:manage",
            },
            {
              name: t("sidebar.sub_menu.categories"),
              href: "/settings/inventory/categories",
              icon: ListTree,
              permission: "inventory:product:manage",
            },
            {
              name: t("sidebar.sub_menu.attributes"),
              href: "/settings/inventory/attributes",
              icon: Beaker,
              permission: "inventory:product:manage",
            },
            {
              name: t("sidebar.sub_menu.label_templates"),
              href: "/settings/printing",
              icon: Printer,
              permission: "settings:printing:manage",
            },
          ],
        },
        {
          name: t("sidebar.sub_menu.integrations"),
          href: "/settings/integrations",
          icon: Plug,
          permission: "settings:access",
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
    <div className="w-64 bg-slate-800 text-slate-100 flex-shrink-0 flex flex-col">
      <div className="flex items-center justify-center h-20 border-b border-slate-700 flex-shrink-0 px-4">
        <ShieldCheck className="h-8 w-8 text-indigo-400 flex-shrink-0" />
        <span className="ml-3 text-lg font-bold truncate" title={tenant?.companyName || "iShopMaster"}>
          {tenant?.companyName || "iShopMaster"}
        </span>
      </div>
      <nav className="flex-1 mt-6 px-4 space-y-1 overflow-y-auto">{renderNavItems(navItems, user, location, openMenus, handleMenuToggle)}</nav>
      <div className="p-4 text-center text-xs text-slate-400 border-t border-slate-700 flex-shrink-0">
        <div>{t("sidebar.footer_title")}</div>
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
const renderNavItems = (items, user, location, openMenus, handleMenuToggle, parentKey = "") => {
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
            "w-full flex items-center justify-between p-3 rounded-lg text-sm transition-colors",
            isParentActive ? "bg-slate-700/50 text-white" : "text-slate-300 hover:bg-slate-700"
          )}
        >
          <div className="flex items-center">
            {item.icon && <item.icon className="h-5 w-5 mr-3 flex-shrink-0" strokeWidth={1.5} />}
            <span className="truncate">{item.name}</span>
          </div>
          <ChevronDown className={cn("h-4 w-4 transition-transform", isMenuOpen && "rotate-180")} />
        </button>
        {isMenuOpen && (
          <div className="mt-1 pl-6 space-y-1 border-l-2 border-slate-700 ml-[0.6875rem]">
            {renderNavItems(
              item.children,
              user,
              location,
              openMenus,
              handleMenuToggle,
              itemKey // pass down the key chain
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
      "flex items-center p-3 rounded-lg text-sm transition-colors",
      isActive ? "bg-indigo-600/20 text-indigo-300 font-semibold" : "text-slate-300 hover:bg-slate-700"
    )}
  >
    <item.icon className="h-5 w-5 mr-3 flex-shrink-0" strokeWidth={1.5} />
    <span className="truncate">{item.name}</span>
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
