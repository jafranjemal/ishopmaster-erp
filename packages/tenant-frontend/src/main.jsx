import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthProvider.jsx";
import "./i18n";
import "react-contexify/dist/ReactContexify.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-white">
          Loading translations...
        </div>
      }
    >
      <BrowserRouter>
        <AuthProvider>
          {" "}
          {/* <-- Wrap with AuthProvider */}
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1e293b", // slate-800
                color: "#f1f5f9", // slate-100
                border: "1px solid #334155", // slate-700
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </Suspense>
  </React.StrictMode>
);
