import { KeyRound, LayoutDashboard, Settings, Shield, ShieldCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "ui-library";

const Sidebar = () => {
  // Placeholder for navigation items. In a real app, this would be generated dynamically.
  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/" },
    { name: "Tenants", icon: Users, href: "/tenants" },
    { name: "Permissions", icon: KeyRound, href: "/permissions" },
    { name: "System Settings", icon: Settings, href: "/settings" },
    {
      name: "Backups & Restore",
      href: "/backups",
      icon: ShieldCheck,
      permission: "tenant:admin", // Only tenant admins should see this
    },
  ];
  return (
    <div className="w-64 bg-slate-800 text-slate-100 flex-shrink-0">
      <div className="flex items-center justify-center h-20 border-b border-slate-700">
        <Shield className="h-8 w-8 text-indigo-400" />
        <span className="ml-3 text-xl font-bold">iShopMaster</span>
      </div>
      <nav className="flex-1 mt-6 px-4 space-y-1">
        {navItems.map((item) => (
          // 3. Replace the <a> tag with the <Link> component
          //    and the 'href' prop with the 'to' prop.
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              "flex items-center p-3 rounded-lg hover:bg-slate-700 hover:text-slate-100 transition-colors duration-200",
              location.pathname === item.href
                ? "bg-slate-900 text-white" // Active link style
                : "text-slate-300"
            )}
          >
            <item.icon className="h-5 w-5 mr-3" strokeWidth={1.5} />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="absolute bottom-0 w-64 p-4 text-center text-xs text-slate-400">
        <div>iShopMaster Admin</div>
        <div>v1.0.0 &copy; 2025</div>
      </div>
    </div>
  );
};

export default Sidebar;
