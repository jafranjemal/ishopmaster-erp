import React, { useState, useEffect, useMemo, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { tenantProfileService } from "../services/api";
import axiosInstance from "../services/api";
import { AuthContext } from "./AuthContext"; // ✅ Import the separated context
import {
  formatCurrency as formatCurrencyUtil,
  formatDate,
  formatNumber,
  formatCurrencyCompact as formatCurrencyCompactUtil,
} from "../lib/formatters";
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() =>
    localStorage.getItem("tenant_token")
  );
  const [user, setUser] = useState(null);
  const [tenantProfile, setTenantProfile] = useState(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // --- NEW, DEDICATED REFRESH FUNCTION ---
  const refreshTenantProfile = useCallback(async () => {
    try {
      console.log("Refreshing tenant profile...");
      const response = await tenantProfileService.getMyProfile();
      if (response.data.success) {
        setTenantProfile(response.data.data);
      }
    } catch (error) {
      console.error("Could not refresh tenant profile.", error);
      // Optional: handle logout if profile fetch fails
    }
  }, []);

  const loadSession = useCallback(async (currentToken) => {
    if (currentToken) {
      try {
        const decodedUser = jwtDecode(currentToken);
        console.log("Decoded User:", decodedUser);
        setUser({
          id: decodedUser.id.id,
          name: decodedUser.id.name,
          role: decodedUser.id.role,
          permissions: decodedUser.id.permissions || [],
        });

        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${currentToken}`;
        axiosInstance.defaults.headers.common["X-Tenant-ID"] =
          decodedUser.id.subdomain;

        localStorage.setItem("tenant_token", currentToken);
        localStorage.setItem("tenant_subdomain", decodedUser.id.subdomain);

        await refreshTenantProfile();

        // const response = await tenantProfileService.getMyProfile();
        // setTenantProfile(response.data.data);
      } catch (error) {
        console.error("Session load failed:", error);
        localStorage.removeItem("tenant_token");
        localStorage.removeItem("tenant_subdomain");
        setToken(null);
        setUser(null);
        setTenantProfile(null);
        delete axiosInstance.defaults.headers.common["Authorization"];
        delete axiosInstance.defaults.headers.common["X-Tenant-ID"];
      }
    }
    setIsLoadingSession(false);
  }, []);

  useEffect(() => {
    setIsLoadingSession(true);
    loadSession(token);
  }, [token, loadSession]);

  const login = (newToken) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
  };

  const value = useMemo(() => {
    // --- 2. CREATE THE CONTEXT-AWARE FORMATTING FUNCTION ---
    console.log(
      "tenantProfile?.settings?.localization?.baseCurrency",
      tenantProfile?.settings?.localization?.baseCurrency
    );
    const formatCurrencyForTenant = (amount) => {
      const currencyCode =
        tenantProfile?.settings?.localization?.baseCurrency || "USD";
      return formatCurrencyUtil(amount, currencyCode);
    };

    const formatCurrencyCompactForTenant = (amount, digits = 1) => {
      const currencyCode =
        tenantProfile?.settings?.localization?.baseCurrency || "USD";
      return formatCurrencyCompactUtil(amount, currencyCode, digits);
    };

    return {
      token,
      user,
      tenantProfile,
      login,
      logout,
      isLoadingSession,
      isAuthenticated: !!token && !!tenantProfile,
      formatCurrency: formatCurrencyForTenant, // <-- 3. EXPOSE THE FUNCTION
      formatCurrencyCompact: formatCurrencyCompactForTenant, // <-- 3. EXPOSE THE FUNCTION
      refreshTenantProfile,
      formatDate,
      formatNumber,
    };
  }, [token, user, tenantProfile, isLoadingSession, refreshTenantProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
