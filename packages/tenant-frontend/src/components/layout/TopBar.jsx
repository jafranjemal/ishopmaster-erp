// This component can be identical to the admin-frontend version for now.
// In the future, the user profile section will display tenant user info.
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  User as UserIcon,
  Settings,
  LifeBuoy,
  LogOut,
  ChevronDown,
  Languages,
  Check,
} from "lucide-react";
import useAuth from "../../context/useAuth";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useTranslation } from "react-i18next";
import { Button } from "ui-library";

const TopBar = () => {
  // Get user data and logout function from our global auth context
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  // --- UPDATED LANGUAGE LIST ---
  // The list of languages has been updated to your specifications.
  // The 'code' property must match the language code used in your i18next setup.
  const supportedLangs = [
    { code: "en", name: "English" },
    { code: "ta", name: "தமிழ் (Tamil)" },
    { code: "si", name: "සිංහල (Sinhala)" },
    { code: "ar", name: "العربية (Arabic)" },
  ];

  const handleLogout = () => {
    logout();
    // Navigate to login page after logout to ensure clean state
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between h-20 px-6 bg-slate-800 border-b border-slate-700">
      <div className="flex items-center">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search... (Ctrl+K)"
            className="w-96 pl-10 pr-4 py-2 bg-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Right Section: Actions & User Menu */}
      <div className="flex items-center space-x-4 md:space-x-6">
        {/* Language Switcher Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="ghost" size="icon">
              <Languages className="h-5 w-5 text-slate-400" />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              sideOffset={5}
              align="end"
              className="z-50 w-48 rounded-md border border-slate-700 bg-slate-800 p-1 shadow-lg animate-in fade-in-90"
            >
              <DropdownMenu.Label className="px-2 py-1.5 text-xs font-semibold text-slate-400">
                Change Language
              </DropdownMenu.Label>
              <DropdownMenu.Separator className="h-px bg-slate-700 m-1" />
              {supportedLangs.map((lang) => (
                <DropdownMenu.Item
                  key={lang.code}
                  onSelect={() => i18n.changeLanguage(lang.code)}
                  className="flex items-center justify-between w-full p-2 rounded text-sm text-slate-300 hover:bg-slate-700 hover:text-white cursor-pointer focus:outline-none focus:bg-slate-700"
                >
                  <span>{lang.name}</span>
                  {i18n.language.startsWith(lang.code) && (
                    <Check className="h-4 w-4" />
                  )}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        <button className="text-slate-400 hover:text-slate-100 transition-colors">
          <Bell className="h-6 w-6" />
        </button>

        {/* --- DYNAMIC USER DROPDOWN MENU --- */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-slate-400" />
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-semibold text-slate-100">
                  {user?.name || "User"}
                </span>
                <span className="text-xs text-slate-400 capitalize">
                  {user?.role || "Role"}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400 hidden md:block" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              sideOffset={5}
              align="end"
              className="z-50 w-56 rounded-md border border-slate-700 bg-slate-800 p-1 shadow-lg animate-in fade-in-90"
            >
              <DropdownMenu.Label className="px-2 py-1.5 text-sm font-semibold text-slate-100">
                My Account
              </DropdownMenu.Label>
              <DropdownMenu.Separator className="h-px bg-slate-700 m-1" />

              <DropdownMenu.Item asChild>
                <Link
                  to="/profile"
                  className="flex items-center w-full p-2 rounded text-sm text-slate-300 hover:bg-slate-700 hover:text-white cursor-pointer focus:outline-none focus:bg-slate-700"
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link
                  to="/settings"
                  className="flex items-center w-full p-2 rounded text-sm text-slate-300 hover:bg-slate-700 hover:text-white cursor-pointer focus:outline-none focus:bg-slate-700"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <a
                  href="#"
                  className="flex items-center w-full p-2 rounded text-sm text-slate-300 hover:bg-slate-700 hover:text-white cursor-pointer focus:outline-none focus:bg-slate-700"
                >
                  <LifeBuoy className="mr-2 h-4 w-4" />
                  <span>Support</span>
                </a>
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="h-px bg-slate-700 m-1" />

              <DropdownMenu.Item
                onSelect={handleLogout}
                className="flex items-center w-full p-2 rounded text-sm text-red-400 hover:bg-red-600/20 hover:text-red-300 cursor-pointer focus:outline-none focus:bg-red-600/20"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log Out</span>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
};

export default TopBar;
