import React from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import useAuth from "../../context/useAuth";
import LicenseWarningBanner from "./LicenseWarningBanner";

/**
 * The main layout shell for the tenant application.
 * Identical structure to the admin app for consistency.
 */
const Layout = ({ children }) => {
  const { isLicenseExpired } = useAuth(); // Get the license status from context

  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        {isLicenseExpired && <LicenseWarningBanner />}

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-900">
          <div className="container mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
