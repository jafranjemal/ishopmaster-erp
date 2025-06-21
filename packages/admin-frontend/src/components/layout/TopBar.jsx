import React from "react";
import { Search, Bell, User } from "lucide-react";

const TopBar = () => {
  return (
    <header className="flex items-center justify-between h-20 px-6 bg-slate-800 border-b border-slate-700">
      {/* Placeholder for Global Search */}
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

      {/* Placeholder for User Actions */}
      <div className="flex items-center space-x-6">
        <button className="text-slate-400 hover:text-slate-100">
          <Bell className="h-6 w-6" />
        </button>
        <div className="relative">
          <button className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
              <User className="h-6 w-6 text-slate-400" />
            </div>
            <span className="hidden md:block text-sm font-medium">
              Super Admin
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
