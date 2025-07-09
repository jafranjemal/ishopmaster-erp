import React from "react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "ui-library/lib/utils";

const ListItem = React.forwardRef(({ className, children, title, ...props }, ref) => (
  <li>
    <NavigationMenu.Link asChild>
      <Link
        ref={ref}
        className={cn(
          "block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-700 focus:bg-slate-700",
          className
        )}
        {...props}
      >
        <div className="text-sm font-medium leading-none text-white">{title}</div>
        <p className="line-clamp-2 text-sm leading-snug text-slate-400">{children}</p>
      </Link>
    </NavigationMenu.Link>
  </li>
));
ListItem.displayName = "ListItem";

const ApplicationMenuBar = () => {
  return (
    <NavigationMenu.Root className="relative z-30 flex w-full justify-start bg-slate-900 border-b border-slate-700">
      <NavigationMenu.List className="flex list-none p-1">
        <NavigationMenu.Item>
          <Link to="/dashboard" className="text-sm font-bold text-white px-3 py-2">
            iShop
          </Link>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <NavigationMenu.Trigger className="text-slate-200 hover:bg-slate-700/50 focus:bg-slate-700/50 group flex select-none items-center justify-center gap-1 rounded-md px-3 py-2 text-sm font-medium outline-none">
            Repairs{" "}
            <ChevronDown className="relative top-[1px] h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180" aria-hidden="true" />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="absolute top-0 left-0 w-full sm:w-auto">
            <ul className="grid w-[200px] gap-3 p-4 bg-slate-800 border border-slate-700 rounded-lg shadow-lg">
              <ListItem to="/service/dashboard" title="Service Dashboard" />
              <ListItem to="/service/tickets/new" title="New Repair Ticket" />
            </ul>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <NavigationMenu.Trigger className="text-slate-200 hover:bg-slate-700/50 focus:bg-slate-700/50 group flex select-none items-center justify-center gap-1 rounded-md px-3 py-2 text-sm font-medium outline-none">
            Inventory <ChevronDown className="relative top-[1px] h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180" />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="absolute top-0 left-0 w-full sm:w-auto">
            <ul className="grid w-[200px] gap-3 p-4 bg-slate-800 border border-slate-700 rounded-lg shadow-lg">
              <ListItem to="/inventory/products" title="Products" />
              <ListItem to="/inventory/stock-levels" title="Stock Levels" />
              <ListItem to="/inventory/assembly" title="Kitting & Assembly" />
            </ul>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        {/* Add other menus for Customer, Point of Sale, Reports etc. here */}
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
};

export default ApplicationMenuBar;
