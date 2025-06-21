import React, { useState, useEffect, useMemo, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { tenantProfileService } from "../services/api";
import axiosInstance from "../services/api";
import { AuthContext } from "./AuthContext"; // ✅ Import the separated context

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() =>
    localStorage.getItem("tenant_token")
  );
  const [user, setUser] = useState(null);
  const [tenantProfile, setTenantProfile] = useState(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

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

        const response = await tenantProfileService.getMyProfile();
        setTenantProfile(response.data.data);
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

  const value = useMemo(
    () => ({
      token,
      user,
      tenantProfile,
      login,
      logout,
      isLoadingSession,
      isAuthenticated: !!token && !!tenantProfile,
    }),
    [token, user, tenantProfile, isLoadingSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
