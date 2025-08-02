import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function useGoBack(fallback) {
  const navigate = useNavigate();
  const { key } = useLocation();

  // location.key === "default" means user landed here directly
  const goBack = useCallback(() => {
    // Only go back if we landed here via navigation stack
    if (key !== "default") {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  }, [navigate, key, fallback]);

  return goBack;
}
