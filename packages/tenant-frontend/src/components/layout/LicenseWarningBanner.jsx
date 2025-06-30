import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "ui-library";

const LicenseWarningBanner = () => {
  return (
    <div className="bg-amber-500 text-amber-900 font-bold px-4 py-3 text-sm flex items-center justify-center gap-4">
      <AlertTriangle className="h-5 w-5 flex-shrink-0" />
      <div>
        Your license has Near to expired. You have limited access to the system.
        <Link to="/settings/billing" className="ml-2 underline hover:text-white">
          Please renew your subscription to restore full functionality.
        </Link>
      </div>
    </div>
  );
};

export default LicenseWarningBanner;
