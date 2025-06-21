import React from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

/**
 * The main layout shell for the application.
 * It assembles the Sidebar, TopBar, and the main content area.
 * The `children` prop will be the actual page component being rendered.
 */
const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-900">
          <div className="container mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
