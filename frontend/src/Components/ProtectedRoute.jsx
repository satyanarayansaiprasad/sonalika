import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
//import LoadingScreen from "./LoadingScreen"; // Optional - see below

/**
 * Enhanced ProtectedRoute component with:
 * - Zero content flashing
 * - Better role handling
 * - Immediate redirects
 * - Cleaner code structure
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const navigate = useNavigate();
  const [accessGranted, setAccessGranted] = useState(false);

  useEffect(() => {
    const checkAccess = () => {
      // Get and normalize session data
      const isAuthenticated = sessionStorage.getItem("isAuthenticated") === "true";
      const role = sessionStorage.getItem("role")?.trim()?.toLowerCase();
      
      // Validate access
      const isAllowed = isAuthenticated && 
                       role && 
                       allowedRoles.map(r => r.toLowerCase()).includes(role);

      if (!isAllowed) {
        console.warn(`⛔ Access denied for ${role || "unauthenticated"} user`);
        navigate("/", { replace: true, state: { from: window.location.pathname } });
        return;
      }

      console.log(`✅ Access granted for ${role}`);
      setAccessGranted(true);
    };

    // Small delay to ensure sessionStorage is synchronized
    const timer = setTimeout(checkAccess, 10);
    return () => clearTimeout(timer);
  }, [navigate, allowedRoles]);

  // Option 1: Return nothing during check (most effective against flashing)
  if (!accessGranted) return null;

  // Option 2: Use loading screen (uncomment if preferred)
  // if (!accessGranted) return <LoadingScreen />;

  return children;
};

export default ProtectedRoute;